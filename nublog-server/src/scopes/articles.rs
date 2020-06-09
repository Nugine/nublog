pub mod entity {
    use crate::prelude::*;

    #[derive(Debug, sqlx::FromRow)]
    pub struct Article {
        id: i32,
        article_key: String,
        title: String,
        author: String,
        content: String,
        create_at: DateTime,
        update_at: DateTime,
    }

    pub type ArticleRepo = Repo<Article>;

    use crate::scopes::comments::entity::Comment;

    impl ArticleRepo {
        pub async fn insert_article(&self, dto: super::dto::CreateArticleReq) -> Result<i32> {
            let mut conn = self.get_conn().await?;
            let query = sqlx::query!(
                "INSERT INTO articles(article_key, title, author, content) VALUES($1, $2, $3, $4) RETURNING id",
                dto.article_key,
                dto.title,
                dto.author,
                dto.content
            );
            let ans = query.fetch_one(&mut conn).await?;
            Ok(ans.id)
        }

        pub async fn delete_article_by_id(&self, id: i32) -> Result<bool> {
            let mut conn = self.get_conn().await?;
            let query = sqlx::query!("DELETE FROM articles WHERE id = $1", id);
            let ans = query.execute(&mut conn).await?;
            Ok(ans == 1)
        }

        pub async fn update_article(&self, dto: super::dto::UpdateArticleReq) -> Result<bool> {
            let mut conn = self.get_conn().await?;
            let query = sqlx::query!(
                "UPDATE articles SET article_key = $1, title = $2, author = $3, content = $4 WHERE id = $5",
                dto.article_key,
                dto.title,
                dto.author,
                dto.content,
                dto.id
            );
            let ans = query.execute(&mut conn).await?;
            Ok(ans == 1)
        }

        pub async fn select_article_by_id(&self, id: i32) -> Result<Article> {
            let mut conn: Conn = self.get_conn().await?;
            let ans = sqlx::query_as!(Article, "SELECT * FROM articles WHERE id = $1", id)
                .fetch_one(&mut conn)
                .await?;
            Ok(ans)
        }

        pub async fn select_all_articles(&self) -> Result<Vec<Article>> {
            let mut conn: Conn = self.get_conn().await?;
            let anss = sqlx::query_as!(Article, "SELECT * FROM articles")
                .fetch_all(&mut conn)
                .await?;
            Ok(anss)
        }

        pub async fn select_article_meta_by_id(
            &self,
            id: i32,
        ) -> Result<super::dto::QueryArticleMetaRes> {
            let mut conn = self.get_conn().await?;
            let query = sqlx::query!("SELECT id, article_key, title, author, create_at,update_at FROM articles WHERE id = $1",id);
            let ans = query.fetch_one(&mut conn).await?;
            Ok(super::dto::QueryArticleMetaRes {
                id: ans.id,
                article_key: ans.article_key,
                title: ans.title,
                author: ans.author,
                create_at: ans.create_at.to_rfc3339(),
                update_at: ans.update_at.to_rfc3339(),
            })
        }

        pub async fn select_article_comments(&self, id: i32) -> Result<Vec<Comment>> {
            let mut conn: Conn = self.get_conn().await?;
            let anss = sqlx::query_as!(Comment, "SELECT * FROM comments WHERE article_id = $1", id)
                .fetch_all(&mut conn)
                .await?;
            Ok(anss)
        }
    }
}

pub mod dto {
    use crate::prelude::*;

    // 创建文章
    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateArticleReq {
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub content: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateArticleRes {
        id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 更新文章
    pub struct UpdateArticleReq {
        pub id: i32,
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub content: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询单个文章
    pub struct QueryArticleRes {
        pub id: i32,
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub content: String,
        pub create_at: String,
        pub update_at: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询所有文章
    pub struct QueryAllArticlesRes {
        pub articles: Vec<QueryArticleRes>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询文章元信息
    pub struct QueryArticleMetaRes {
        pub id: i32,
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub create_at: String,
        pub update_at: String,
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    #[derive(Debug, Serialize, Deserialize)]
    // 查询文章所有评论
    pub struct QueryArticleCommentsRes {
        pub comments: Vec<QueryCommentRes>,
    }
}
