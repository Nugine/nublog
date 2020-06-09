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

    pub type CommentRepo = Repo<Comment>;

    impl CommentRepo {
        pub async fn insert_comment(&self, dto: super::dto::CreateCommentReq) -> Result<i32> {
            let mut conn: Conn = self.get_conn().await?;
            let query = sqlx::query!(
                "INSERT INTO comments(article_id, user_id, content, reply_to) VALUES($1, $2, $3,$4) RETURNING id",
                dto.article_id,
                dto.user_id,
                dto.content,
                dto.reply_to
            );
            let ans = query.fetch_one(&mut conn).await?;
            Ok(ans.id)
        }

        pub async fn delete_comment_by_id(&self, id: i32) -> Result<bool> {
            let mut conn: Conn = self.get_conn().await?;
            let query = sqlx::query!("DELETE FROM comments WHERE id = $1", id);
            let ans = query.execute(&mut conn).await?;
            Ok(ans == 1)
        }
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
    // 查询单个评论
    pub struct QueryCommentRes {
        pub id: i32,
        pub article_id: i32,
        pub user_id: i32,
        pub content: String,
        pub reply_to: Option<i32>,
        pub create_at: String,
    }
}

pub mod endpoint {
    use crate::prelude::*;
    use super::dto::*;
    use super::entity::*;

    pub async fn create_comment(mut req: Request) -> Result<Json<CreateCommentRes>> {
        let dto = req.json::<CreateCommentReq>().await?;
        let repo = req.try_inject_ref::<CommentRepo>()?;
        let id = repo.insert_comment(dto).await?;
        Ok(reply::json(CreateCommentRes { id }))
    }

    pub async fn delete_comment(req: Request) -> Result<Json<bool>> {
        let id: i32 = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<CommentRepo>()?;
        let ans = repo.delete_comment_by_id(id).await?;
        Ok(reply::json(ans))
    }
}
