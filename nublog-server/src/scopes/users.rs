pub mod entity {
    use crate::prelude::*;
    use crate::scopes::comments::entity::Comment;

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
    pub const READER_ROLE_CODE: i32 = 1;

    pub type UserRepo = Repo<User>;

    impl UserRepo {
        pub async fn select_all_users(&self) -> Result<Vec<super::dto::QueryUserRes>> {
            let mut conn: Conn = self.get_conn().await?;
            let anss = sqlx::query_as!(User, "SELECT * FROM users")
                .fetch_all(&mut conn)
                .await?;
            Ok(anss
                .into_iter()
                .map(|ans| super::dto::QueryUserRes {
                    id: ans.id,
                    role_code: ans.role_code,
                    name: ans.name,
                    email: ans.email,
                    avatar_url: ans.avatar_url,
                    profile_url: ans.profile_url,
                })
                .collect())
        }

        pub async fn delete_user_by_id(&self, id: i32) -> Result<bool> {
            let mut conn: Conn = self.get_conn().await?;
            let query = sqlx::query!("DELETE FROM users WHERE id = $1", id);
            let ans = query.execute(&mut conn).await?;
            Ok(ans == 1)
        }

        pub async fn insert_user(&self, dto: super::dto::CreateUserReq) -> Result<i32> {
            let mut conn: Conn = self.get_conn().await?;
            let query = sqlx::query!(
                "INSERT INTO users(role_code, name, email, avatar_url, profile_url, github_token) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
                dto.role_code,
                dto.name,
                dto.email,
                dto.avatar_url,
                dto.profile_url,
                dto.github_token
            );
            let ans = query.fetch_one(&mut conn).await?;
            Ok(ans.id)
        }

        pub async fn select_user_comments(&self, id: i32) -> Result<Vec<Comment>> {
            let mut conn: Conn = self.get_conn().await?;
            let anss = sqlx::query_as!(Comment, "SELECT * FROM comments WHERE user_id = $1", id)
                .fetch_all(&mut conn)
                .await?;
            Ok(anss)
        }

        pub async fn select_user_by_id(&self, id: i32) -> Result<User> {
            let mut conn = self.get_conn().await?;
            let ans = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
                .fetch_one(&mut conn)
                .await?;
            Ok(ans)
        }
    }
}

pub mod dto {
    use crate::prelude::*;

    // 查询单个用户
    #[derive(Debug, Serialize, Deserialize)]
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
}

pub mod endpoint {
    use super::dto::*;
    use super::entity::*;
    use crate::prelude::*;

    pub async fn query_all_users(req: Request) -> Result<Json<QueryAllUsersRes>> {
        let repo = req.try_inject_ref::<UserRepo>()?;
        let users = repo.select_all_users().await?;
        let res = QueryAllUsersRes { users };
        Ok(reply::json(res))
    }

    pub async fn delete_user(req: Request) -> Result<Json<bool>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<UserRepo>()?;
        let ans = repo.delete_user_by_id(id).await?;
        Ok(reply::json(ans))
    }

    pub async fn query_user(req: Request) -> Result<Json<QueryUserRes>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<UserRepo>()?;
        let user = repo.select_user_by_id(id).await?;
        let res = QueryUserRes {
            id: user.id,
            role_code: user.role_code,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            profile_url: user.profile_url,
        };
        Ok(reply::json(res))
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    pub async fn query_user_comments(req: Request) -> Result<Json<QueryUserCommentsRes>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<UserRepo>()?;
        let anss = repo.select_user_comments(id).await?;
        let res = QueryUserCommentsRes {
            comments: anss
                .into_iter()
                .map(|ans| QueryCommentRes {
                    id: ans.id,
                    article_id: ans.article_id,
                    user_id: ans.user_id,
                    reply_to: ans.reply_to,
                    content: ans.content,
                    create_at: ans.create_at.to_rfc3339(),
                })
                .collect(),
        };
        Ok(reply::json(res))
    }
}
