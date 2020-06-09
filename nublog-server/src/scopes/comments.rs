pub mod entity {
    use crate::prelude::*;

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
        id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询单个评论
    pub struct QueryCommentRes {
        id: i32,
        article_id: i32,
        user_id: i32,
        content: String,
        reply_to: Option<i32>,
        create_at: String,
    }
}
