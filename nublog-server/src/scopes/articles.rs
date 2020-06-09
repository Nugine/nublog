pub mod entity {
    use crate::prelude::*;

    #[derive(Debug, sqlx::FromRow)]
    pub struct Article {
        pub id: i32,
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub content: String,
        pub create_at: DateTime,
        pub update_at: DateTime,
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

        pub async fn update_article(
            &self,
            id: i32,
            dto: super::dto::UpdateArticleReq,
        ) -> Result<bool> {
            let mut conn = self.get_conn().await?;
            let query = sqlx::query!(
                "UPDATE articles SET article_key = $1, title = $2, author = $3, content = $4 WHERE id = $5",
                dto.article_key,
                dto.title,
                dto.author,
                dto.content,
                id
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
        pub id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 更新文章
    pub struct UpdateArticleReq {
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

pub mod endpoint {
    use super::dto::*;
    use super::entity::*;
    use crate::prelude::*;

    pub async fn create_article(mut req: Request) -> Result<Json<CreateArticleRes>> {
        let dto = req.json::<CreateArticleReq>().await?;
        let repo = req.try_inject_ref::<ArticleRepo>()?;
        let id = repo.insert_article(dto).await?;
        Ok(reply::json(CreateArticleRes { id }))
    }

    pub async fn delete_article(req: Request) -> Result<Json<bool>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<ArticleRepo>()?;
        let ans = repo.delete_article_by_id(id).await?;
        Ok(reply::json(ans))
    }

    pub async fn update_article(mut req: Request) -> Result<Json<bool>> {
        let id = req.expect_param("id").parse()?;
        let dto = req.json::<UpdateArticleReq>().await?;
        let repo = req.try_inject_ref::<ArticleRepo>()?;
        let ans = repo.update_article(id, dto).await?;
        Ok(reply::json(ans))
    }

    pub async fn query_article(req: Request) -> Result<Json<QueryArticleRes>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<ArticleRepo>()?;
        let article = repo.select_article_by_id(id).await?;
        let res = QueryArticleRes {
            id: article.id,
            article_key: article.article_key,
            title: article.title,
            author: article.author,
            content: article.content,
            create_at: article.create_at.to_rfc3339(),
            update_at: article.update_at.to_rfc3339(),
        };
        Ok(reply::json(res))
    }

    pub async fn query_article_meta(req: Request) -> Result<Json<QueryArticleMetaRes>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<ArticleRepo>()?;
        let ans = repo.select_article_meta_by_id(id).await?;
        Ok(reply::json(ans))
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    pub async fn query_article_comments(req: Request) -> Result<Json<QueryArticleCommentsRes>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<ArticleRepo>()?;
        let anss = repo.select_article_comments(id).await?;
        let res = QueryArticleCommentsRes {
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
