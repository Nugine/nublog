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
}

pub mod endpoint {
    use super::dto::*;
    use super::entity::*;
    use crate::prelude::*;

    pub async fn query_all_users(req: Request) -> Result<Json<QueryAllUsersRes>> {
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
