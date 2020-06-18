pub mod entity {
    #[derive(Debug, sqlx::FromRow)]
    pub struct User {
        pub id: i32,
        pub role_code: i32,
        pub name: String,
        pub email: String,
        pub avatar_url: String,
        pub profile_url: String,
        pub github_token: Option<String>,
    }

    pub const ADMIN_ROLE_CODE: i32 = 0;
    #[allow(unused)]
    pub const READER_ROLE_CODE: i32 = 1;
}

pub mod dto {
    use crate::prelude::*;

    // 查询单个用户
    #[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
    pub struct QueryUserRes {
        pub id: i32,
        pub role_code: i32,
        pub name: String,
        pub email: String,
        pub avatar_url: String,
        pub profile_url: String,
    }

    // 查询所有用户
    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryAllUsersRes {
        pub users: Vec<QueryUserRes>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct DeleteUserRes {
        pub is_deleted: bool,
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    // 查询用户所有评论
    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryUserCommentsRes {
        pub comments: Vec<QueryCommentRes>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateUserReq {
        pub role_code: i32,
        pub name: String,
        pub email: String,
        pub avatar_url: String,
        pub profile_url: String,
        pub github_token: Option<String>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct LoginRes {
        pub session_id: Uuid,
    }
}

pub mod endpoint {
    use super::dto::*;
    use super::entity::*;
    use crate::prelude::*;

    pub async fn query_all_users(req: Request) -> Result<Json<QueryAllUsersRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let mut conn: Conn = req.get_conn().await?;

        let anss = {
            sqlx::query_as!(
                QueryUserRes,
                "SELECT id, role_code, name, email, avatar_url, profile_url FROM users"
            )
            .fetch_all(&mut conn)
            .await?
        };

        Ok(reply::json(QueryAllUsersRes { users: anss }))
    }

    pub async fn delete_user(req: Request) -> Result<Json<DeleteUserRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;
        let is_deleted = {
            let query = sqlx::query!("DELETE FROM users WHERE id = $1", id);
            let ans = query.execute(&mut conn).await?;
            ans == 1
        };

        Ok(reply::json(DeleteUserRes { is_deleted }))
    }

    pub async fn query_user(req: Request) -> Result<Json<QueryUserRes>> {
        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;
        let res = {
            sqlx::query_as!(
                QueryUserRes,
                "SELECT id, role_code, name, email, avatar_url, profile_url FROM users WHERE id = $1",
                 id
                )
                .fetch_one(&mut conn)
                .await?
        };

        Ok(reply::json(res))
    }

    pub async fn query_self(req: Request) -> Result<Json<Option<QueryUserRes>>> {
        let session = req.try_get_session_ref();
        match session {
            Ok(session) => {
                let mut conn: Conn = req.get_conn().await?;
                let res = {
                    sqlx::query_as!(
                        QueryUserRes,
                        "SELECT id, role_code, name, email, avatar_url, profile_url FROM users WHERE id = $1",
                        session.user_id
                        )
                        .fetch_one(&mut conn)
                        .await?
                };
                Ok(reply::json(Some(res)))
            }
            Err(_) => Ok(reply::json(None)),
        }
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    pub async fn query_user_comments(req: Request) -> Result<Json<QueryUserCommentsRes>> {
        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;
        let anss = {
            sqlx::query_as!(
                QueryCommentRes,
                "SELECT * FROM comments WHERE user_id = $1",
                id
            )
            .fetch_all(&mut conn)
            .await?
        };

        Ok(reply::json(QueryUserCommentsRes { comments: anss }))
    }

    use nuclear::web::reply::{redirect_temporary, Redirect};

    pub async fn login(req: Request) -> Result<Redirect> {
        let config: &Config = req.try_inject_ref()?;

        let location = format!(
            "{}?client_id={}&scope=read:user,user:email&redirect_uri={}/home/login",
            "https://github.com/login/oauth/authorize", config.github_client_id, config.root_url
        );

        Ok(redirect_temporary(location)?)
    }

    pub async fn github_oauth_callback(req: Request) -> Result<Json<LoginRes>> {
        #[derive(Deserialize)]
        struct Query {
            code: String,
        }

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
            let code = code.as_str();
            let (client_id, client_secret) = {
                let config: &Config = req.try_inject_ref()?;
                (
                    config.github_client_id.as_str(),
                    config.github_client_secret.as_str(),
                )
            };

            let res: reqwest::Response = client
                .post("https://github.com/login/oauth/access_token")
                .query(&[
                    ("client_id", client_id),
                    ("client_secret", client_secret),
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

        let profile: Profile = {
            let access_token = access_token.as_str();

            let res = client
                .get("https://api.github.com/user")
                .header(
                    http::header::AUTHORIZATION,
                    format!("token {}", access_token),
                )
                .header(http::header::ACCEPT, "application/json")
                .send()
                .await?;

            res.json().await?
        };

        let sess_id: Uuid = {
            let conn: Conn = req.get_conn().await?;
            let mut tx = conn.begin().await?;

            let optional_ans: Option<_> =
                sqlx::query!("SELECT id FROM users WHERE name = $1", profile.login)
                    .fetch_optional(&mut tx)
                    .await?;

            let (user_id, role_code): (i32, i32) = match optional_ans {
                Some(ans) => {
                    let user_id = ans.id;
                    let ans = sqlx::query!(
                        "UPDATE users SET email = $1, avatar_url = $2, profile_url = $3, github_token = $4 WHERE id = $5 RETURNING role_code",
                        profile.email,
                        profile.avatar_url,
                        profile.html_url,
                        access_token,
                        user_id
                    ).fetch_one(&mut tx).await?;

                    (user_id, ans.role_code)
                }
                None => {
                    let ans = sqlx::query!(r#"
                        INSERT INTO users(role_code, name, email, avatar_url, profile_url, github_token) 
                        VALUES($1, $2, $3, $4, $5, $6)
                        RETURNING id, role_code
                        "#,
                        READER_ROLE_CODE,
                        profile.login,
                        profile.email,
                        profile.avatar_url,
                        profile.html_url,
                        access_token
                    ).fetch_one(&mut tx).await?;
                    (ans.id, ans.role_code)
                }
            };

            let sess_id = Uuid::new_v4();

            sqlx::query!(
                "INSERT INTO sessions(id, user_id, role_code) VALUES($1, $2, $3)",
                sess_id,
                user_id,
                role_code
            )
            .execute(&mut tx)
            .await?;

            tx.commit().await?;

            sess_id
        };

        Ok(reply::json(LoginRes {
            session_id: sess_id,
        }))
    }
}

pub mod ext {
    use crate::prelude::*;

    pub trait EnsureRolesExt {
        fn ensure_roles(&self, roles: &[i32]) -> Result<()>;
    }

    #[derive(Debug, thiserror::Error)]
    #[error("RoleError")]
    pub struct RoleError;

    impl EnsureRolesExt for Request {
        fn ensure_roles(&self, roles: &[i32]) -> Result<()> {
            let sess = self.try_get_session_ref()?;
            let is_allowed = roles.iter().any(|&r| r == sess.role_code);
            if is_allowed {
                Ok(())
            } else {
                Err(RoleError.into())
            }
        }
    }
}

use crate::prelude::*;

pub fn register(router: &mut SimpleRouter) {
    use self::endpoint::*;
    router.at("/users").get(query_all_users);
    router.at("/users/auth/login").get(login);
    router.at("/users/oauth/github").get(github_oauth_callback);
    router.at("/users/self").get(query_self);
    router.at("/users/:id").get(query_user).delete(delete_user);
    router.at("/users/:id/comments").get(query_user_comments);
}
