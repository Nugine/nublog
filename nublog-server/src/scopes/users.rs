pub mod entity {
    use crate::create;
    use crate::prelude::*;
    use crate::scopes::comments::entity::Comment;

    pub struct User {
        id: i32,
        role_code: i32,
        name: String,
        email: String,
        avatar_url: String,
        profile_url: String,
        github_token: Option<String>,
    }

    pub const ADMIN_ROLE_CODE: i32 = 0;
    pub const READER_ROLE_CODE: i32 = 1;

    pub type UserRepo = Repo<User>;

    impl UserRepo {
        pub async fn select_all_users(&self) -> Result<Vec<i32>> {
            let mut conn: Conn = self.get_conn().await?;
            let query = sqlx::query!("SELECT id FROM users");
            let anss = query.fetch_all(&mut conn).await?;
            Ok(anss.into_iter().map(|ans| ans.id).collect())
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
        id: i32,
        role_code: i32,
        name: String,
        email: String,
        avatar_url: String,
        profile_url: String,
    }

    // 查询所有用户
    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryAllUsersRes {
        users: Vec<QueryUserRes>,
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    // 查询用户所有评论
    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryUserCommentsRes {
        comments: Vec<QueryCommentRes>,
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
