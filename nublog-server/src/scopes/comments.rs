pub mod entity {
    use crate::prelude::*;

    #[derive(Debug, sqlx::FromRow)]
    pub struct Comment {
        pub id: i32,
        pub article_id: i32,
        pub user_id: i32,
        pub content: String,
        pub reply_to: Option<i32>,
        pub create_at: DateTime,
    }
}

pub mod dto {
    use crate::prelude::*;

    #[derive(Debug, Serialize, Deserialize)]
    // 创建评论
    pub struct CreateCommentReq {
        pub article_id: i32,
        pub user_id: i32,
        pub content: String,
        pub reply_to: Option<i32>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateCommentRes {
        pub id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct DeleteCommentRes {
        pub is_deleted: bool,
    }

    #[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
    // 查询单个评论
    pub struct QueryCommentRes {
        pub id: i32,
        pub article_id: i32,
        pub user_id: i32,
        pub content: String,
        pub reply_to: Option<i32>,
        pub create_at: DateTime,
        pub user_avatar_url: String,
        pub user_name: String,
    }
}

pub mod endpoint {
    use super::dto::*;
    use crate::prelude::*;

    pub async fn create_comment(mut req: Request) -> Result<Json<CreateCommentRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE, READER_ROLE_CODE])?;

        let dto: CreateCommentReq = req.json().await?;

        let mut conn: Conn = req.get_conn().await?;
        let id = {
            let query = sqlx::query!(
                "INSERT INTO comments(article_id, user_id, content, reply_to) VALUES($1, $2, $3,$4) RETURNING id",
                dto.article_id,
                dto.user_id,
                dto.content,
                dto.reply_to
            );
            let ans = query.fetch_one(&mut conn).await?;
            ans.id
        };

        Ok(reply::json(CreateCommentRes { id }))
    }

    pub async fn delete_comment(req: Request) -> Result<Json<DeleteCommentRes>> {
        let session = req.try_get_session_ref()?;

        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;

        let is_deleted = if session.role_code == ADMIN_ROLE_CODE {
            let ans = sqlx::query!("DELETE FROM comments WHERE id = $1", id)
                .execute(&mut conn)
                .await?;
            ans == 1
        } else {
            let ans = sqlx::query!(
                "DELETE FROM comments WHERE id = $1 AND user_id = $2",
                id,
                session.user_id
            )
            .execute(&mut conn)
            .await?;
            ans == 1
        };

        Ok(reply::json(DeleteCommentRes { is_deleted }))
    }
}

use crate::prelude::*;

pub fn register(router: &mut SimpleRouter) {
    use self::endpoint::*;

    router.at("/comments").post(create_comment);
    router.at("/comments/:id").delete(delete_comment);
}
