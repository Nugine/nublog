pub mod entities {
    use crate::prelude::*;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct User {
        pub id: i32,
        pub role_code: i32,
        pub name: String,
        pub email: String,
        pub avatar_url: String,
        pub profile_url: String,
        pub github_token: Option<String>,
        pub last_login: DateTime,
    }

    #[allow(unused)]
    pub struct Session {
        id: Uuid,
        user_id: i32,
        created_at: DateTime,
    }

    pub const ADMIN_ROLE_CODE: i32 = 0;
    pub const READER_ROLE_CODE: i32 = 1;
}

pub mod dto {
    use crate::prelude::*;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct LoginRes {
        pub session_id: Uuid,
    }

    #[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
    pub struct QueryUserRes {
        pub id: i32,
        pub role_code: i32,
        pub name: String,
        pub email: String,
        pub avatar_url: String,
        pub profile_url: String,
    }

    #[derive(Debug, Deserialize)]
    pub struct UpdateUserReq {
        pub id: i32,
        pub role_code: i32,
    }

    #[derive(Debug, Serialize)]
    pub struct UpdateUserRes {
        pub is_updated: bool,
    }

    #[derive(Debug, Deserialize)]
    pub struct DeleteUserReq {
        pub id: i32,
    }

    #[derive(Debug, Serialize)]
    pub struct DeleteUserRes {
        pub is_deleted: bool,
    }
}

pub mod endpoints {
    use super::dto::*;
    use super::entities::*;
    use super::ext::SessionExt;
    use crate::prelude::*;

    use nuclear::web::reply::Redirect;

    pub async fn login(req: Request) -> Result<Redirect> {
        #[derive(Debug, Deserialize)]
        struct Query {
            redirect_uri: String,
        }

        let query: Query = req.query()?;
        let config: &Config = req.try_inject_ref()?;

        const GITHUB_OAUTH: &str = "https://github.com/login/oauth/authorize";

        let location = format!(
            "{}?client_id={}&scope=read:user,user:email&redirect_uri={}",
            GITHUB_OAUTH, config.github.client_id, query.redirect_uri
        );

        Ok(reply::redirect_temporary(location)?)
    }

    pub async fn github_oauth(req: Request) -> Result<Json<LoginRes>> {
        #[derive(Debug, Deserialize)]
        struct Query<'a> {
            code: &'a str,
        }

        let config: &Config = req.try_inject_ref()?;

        let code = req.query::<Query>()?.code;

        let client: reqwest::Client = {
            let mut headers = http::HeaderMap::new();
            headers.insert(
                http::header::USER_AGENT,
                http::HeaderValue::from_static("rust/reqwest"),
            );
            reqwest::Client::builder()
                .default_headers(headers)
                .build()?
        };

        let access_token: String = {
            let res: reqwest::Response = client
                .post("https://github.com/login/oauth/access_token")
                .query(&[
                    ("client_id", config.github.client_id.as_str()),
                    ("client_secret", config.github.client_secret.as_str()),
                    ("code", code),
                ])
                .header(http::header::ACCEPT, "application/json")
                .send()
                .await?;

            #[derive(Deserialize)]
            struct AccessToken {
                access_token: String,
            }

            res.json::<AccessToken>().await?.access_token
        };

        #[derive(Deserialize)]
        struct Profile {
            login: String,
            avatar_url: String,
            email: String,
            html_url: String,
        }

        async fn get_profile(
            client: &reqwest::Client,
            access_token: &str,
            retry: usize,
        ) -> Result<Profile> {
            let mut err: Option<reqwest::Error> = None;
            for i in 1..=retry {
                let ret = client
                    .get("https://api.github.com/user")
                    .header(
                        http::header::AUTHORIZATION,
                        format!("token {}", access_token),
                    )
                    .header(http::header::ACCEPT, "application/json")
                    .send()
                    .await;

                match ret {
                    Ok(res) => return Ok(res.json::<Profile>().await?),
                    Err(e) => {
                        log::debug!("get_profile: error = {}, retry_cnt = {}", e, i);
                        if e.is_status() {
                            return Err(e.into());
                        } else {
                            err = Some(e)
                        }
                    }
                }
            }
            Err(err.unwrap().into())
        }

        let profile: Profile = get_profile(&client, &access_token, 5).await?;

        let session_id: Uuid = {
            let conn: Conn = req.get_conn().await?;
            let mut tx = conn.begin().await?;

            let user_id: Option<i32> =
                sqlx::query!("SELECT id FROM users WHERE name = $1", profile.login)
                    .fetch_optional(&mut tx)
                    .await?
                    .map(|r| r.id);

            let user_id: i32 = match user_id {
                Some(user_id) => {
                    sqlx::query!(
                        r#"
                        UPDATE users SET
                            email = $1,
                            avatar_url = $2,
                            profile_url = $3,
                            github_token = $4,
                            last_login = CURRENT_TIMESTAMP
                        WHERE id = $5
                        "#,
                        profile.email,
                        profile.avatar_url,
                        profile.html_url,
                        access_token,
                        user_id
                    )
                    .execute(&mut tx)
                    .await?;
                    user_id
                }
                None => {
                    let ans = sqlx::query!(r#"
                        INSERT INTO users(role_code, name, email, avatar_url, profile_url, github_token) 
                        VALUES($1, $2, $3, $4, $5, $6)
                        RETURNING id
                        "#,
                        READER_ROLE_CODE,
                        profile.login,
                        profile.email,
                        profile.avatar_url,
                        profile.html_url,
                        access_token
                    ).fetch_one(&mut tx).await?;
                    ans.id
                }
            };

            let session_id = Uuid::new_v4();
            sqlx::query!(
                "INSERT INTO sessions(id, user_id) VALUES($1, $2)",
                session_id,
                user_id,
            )
            .execute(&mut tx)
            .await?;

            tx.commit().await?;

            session_id
        };

        let res = LoginRes { session_id };

        Ok(reply::json(res))
    }

    pub async fn logout(mut req: Request) -> Result<Response> {
        let sess = req.get_session().await?;
        {
            let mut conn: Conn = req.get_conn().await?;
            sqlx::query!("DELETE FROM sessions WHERE id = $1", sess.id)
                .execute(&mut conn)
                .await?;
        }
        Ok(Response::empty())
    }

    pub async fn query_self(mut req: Request) -> Result<Json<QueryUserRes>> {
        let sess = req.get_session().await?;

        let mut conn: Conn = req.get_conn().await?;
        let res = {
            sqlx::query_as!(
                QueryUserRes,
                r#"
                    SELECT 
                        id, role_code, name, email, 
                        avatar_url, profile_url 
                    FROM users WHERE id = $1
                "#,
                sess.user_id
            )
            .fetch_one(&mut conn)
            .await?
        };

        Ok(reply::json(res))
    }

    pub async fn query_all_users(mut req: Request) -> Result<Json<Vec<User>>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE]).await?;

        let mut conn: Conn = req.get_conn().await?;

        let res: Vec<User> = {
            sqlx::query_as!(
                User,
                r#"
                    SELECT 
                        id, role_code, name, email, 
                        avatar_url, profile_url,
                        NULL AS github_token,
                        last_login 
                    FROM users
                "#
            )
            .fetch_all(&mut conn)
            .await?
        };

        Ok(reply::json(res))
    }

    pub async fn update_user(mut req: Request) -> Result<Json<UpdateUserRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE]).await?;

        jsonrpc(req, |mut conn, dto: UpdateUserReq| async move {
            let ans = sqlx::query!(
                "UPDATE users SET role_code = $1 WHERE id = $2",
                dto.role_code,
                dto.id
            )
            .execute(&mut conn)
            .await?;
            Ok(UpdateUserRes {
                is_updated: ans == 1,
            })
        })
        .await
    }

    pub async fn delete_user(mut req: Request) -> Result<Json<DeleteUserRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE]).await?;
        let user_id = req.get_session().await?.user_id;

        jsonrpc(req, |mut conn, dto: DeleteUserReq| async move {
            let ans = sqlx::query!(
                "DELETE FROM users WHERE id = $1 AND id != $2",
                dto.id,
                user_id
            )
            .execute(&mut conn)
            .await?;
            Ok(DeleteUserRes {
                is_deleted: ans == 1,
            })
        })
        .await
    }
}

pub mod ext {
    use crate::prelude::*;

    #[derive(Debug, sqlx::FromRow)]
    pub struct JoinedSession {
        pub id: Uuid,
        pub user_id: i32,
        pub created_at: DateTime,
        pub user_role_code: i32,
    }

    #[async_trait]
    pub trait SessionExt {
        async fn get_session(&mut self) -> Result<Arc<JoinedSession>>;

        async fn ensure_roles(&mut self, roles: &[i32]) -> Result<i32> {
            let sess = self.get_session().await?;
            for &role in roles {
                if role == sess.user_role_code {
                    return Ok(role);
                }
            }
            Err(ApiError::NoPermission.into())
        }
    }

    #[async_trait]
    impl SessionExt for Request {
        async fn get_session(&mut self) -> Result<Arc<JoinedSession>> {
            fn get_session_id(req: &Request) -> Option<Uuid> {
                req.headers()
                    .get(http::header::HeaderName::from_static("x-session-id"))?
                    .to_str()
                    .ok()?
                    .parse()
                    .ok()
            }

            if let Some(s) = self.local().get::<Arc<JoinedSession>>() {
                return Ok(Arc::clone(s));
            }

            let session_id = match get_session_id(self) {
                None => return Err(ApiError::NoSession.into()),
                Some(id) => id,
            };

            let mut conn: Conn = self.get_conn().await?;
            let sess: Option<JoinedSession> = sqlx::query_as!(
                JoinedSession,
                r#"
                    SELECT sessions.*, users.role_code AS user_role_code
                    FROM sessions JOIN users ON users.id = sessions.user_id
                    WHERE sessions.id = $1
                "#,
                session_id
            )
            .fetch_optional(&mut conn)
            .await?;

            match sess {
                None => Err(ApiError::NoSession.into()),
                Some(sess) => {
                    self.local_mut().insert(Arc::new(sess));
                    Ok(Arc::clone(
                        self.local().get::<Arc<JoinedSession>>().unwrap(),
                    ))
                }
            }
        }
    }
}

use crate::prelude::*;

pub fn register(router: &mut SimpleRouter) {
    use self::endpoints::*;

    router.at("/users/login").get(login);
    router.at("/users/oauth/github").post(github_oauth);
    router.at("/users/logout").post(logout);
    router.at("/users/query_self").get(query_self);
    router.at("/users/query_all").get(query_all_users);
    router.at("/users/update").post(update_user);
    router.at("/users/delete").post(delete_user);
}
