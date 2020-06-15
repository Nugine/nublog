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
    }
}

pub mod endpoint {
    use super::dto::*;
    use crate::prelude::*;

    pub async fn create_comment(mut req: Request) -> Result<Json<CreateCommentRes>> {
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
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;
        let is_deleted = {
            let query = sqlx::query!("DELETE FROM comments WHERE id = $1", id);
            let ans = query.execute(&mut conn).await?;
            ans == 1
        };

        Ok(reply::json(DeleteCommentRes { is_deleted }))
    }
}
