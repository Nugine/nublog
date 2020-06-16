pub mod entity {
    use crate::prelude::*;

    #[derive(Debug, sqlx::FromRow)]
    pub struct Article {
        pub id: i32,
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub summary: String,
        pub content: String,
        pub create_at: DateTime,
        pub update_at: DateTime,
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
        pub summary: String,
        pub content: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateArticleRes {
        pub id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct DeleteArticleRes {
        pub is_deleted: bool,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateArticleRes {
        pub is_updated: bool,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 更新文章
    pub struct UpdateArticleReq {
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub summary: String,
        pub content: String,
    }

    #[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
    // 查询单个文章
    pub struct QueryArticleRes {
        pub id: i32,
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub summary: String,
        pub content: String,
        pub create_at: DateTime,
        pub update_at: DateTime,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询所有文章
    pub struct QueryAllArticlesRes {
        pub articles: Vec<QueryArticleRes>,
    }

    use crate::scopes::tags::dto::QueryTagRes;

    #[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
    // 查询文章元信息
    pub struct QueryArticleMetaRes {
        pub id: i32,
        pub article_key: String,
        pub title: String,
        pub author: String,
        pub summary: String,
        pub create_at: DateTime,
        pub update_at: DateTime,
        pub tags: sqlx::types::Json<Vec<QueryTagRes>>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryAllArticleMetaRes {
        pub articles: Vec<QueryArticleMetaRes>,
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
    use crate::prelude::*;

    pub async fn create_article(mut req: Request) -> Result<Json<CreateArticleRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let dto: CreateArticleReq = req.json().await?;

        let mut conn: Conn = req.get_conn().await?;
        let id = {
            let query = sqlx::query!(
                "INSERT INTO articles(article_key, title, author, summary, content) VALUES($1, $2, $3, $4, $5) RETURNING id",
                dto.article_key,
                dto.title,
                dto.author,
                dto.summary,
                dto.content
            );
            let ans = query.fetch_one(&mut conn).await?;
            ans.id
        };

        Ok(reply::json(CreateArticleRes { id }))
    }

    pub async fn delete_article(req: Request) -> Result<Json<DeleteArticleRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;
        let is_deleted = {
            let query = sqlx::query!("DELETE FROM articles WHERE id = $1", id);
            let ans = query.execute(&mut conn).await?;
            ans == 1
        };

        Ok(reply::json(DeleteArticleRes { is_deleted }))
    }

    pub async fn update_article(mut req: Request) -> Result<Json<UpdateArticleRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let id: i32 = req.expect_param("id").parse()?;
        let dto: UpdateArticleReq = req.json().await?;

        let mut conn: Conn = req.get_conn().await?;
        let is_updated = {
            let query = sqlx::query!(
                "UPDATE articles SET article_key = $1, title = $2, author = $3, summary = $4, content = $5 WHERE id = $6",
                dto.article_key,
                dto.title,
                dto.author,
                dto.summary,
                dto.content,
                id
            );
            let ans = query.execute(&mut conn).await?;
            ans == 1
        };

        Ok(reply::json(UpdateArticleRes { is_updated }))
    }

    pub async fn query_article(req: Request) -> Result<Json<QueryArticleRes>> {
        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;
        let res = {
            sqlx::query_as!(QueryArticleRes, "SELECT * FROM articles WHERE id = $1", id)
                .fetch_one(&mut conn)
                .await?
        };

        Ok(reply::json(res))
    }

    pub async fn query_article_meta(req: Request) -> Result<Json<QueryArticleMetaRes>> {
        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;

        // not verified
        // FIXME: sqlx bug: query_as!
        let res: QueryArticleMetaRes = {
            sqlx::query_as("SELECT * FROM article_meta_view WHERE id = $1")
                .bind(id)
                .fetch_one(&mut conn)
                .await?
        };

        Ok(reply::json(res))
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    pub async fn query_article_comments(req: Request) -> Result<Json<QueryArticleCommentsRes>> {
        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;

        let anss = {
            sqlx::query_as!(
                QueryCommentRes,
                "SELECT * FROM comments WHERE article_id = $1",
                id
            )
            .fetch_all(&mut conn)
            .await?
        };

        Ok(reply::json(QueryArticleCommentsRes { comments: anss }))
    }

    pub async fn query_all_article_meta(req: Request) -> Result<Json<QueryAllArticleMetaRes>> {
        let mut conn: Conn = req.get_conn().await?;

        // not verified
        // FIXME: sqlx bug: query_as!
        let anss: Vec<QueryArticleMetaRes> = {
            sqlx::query_as("SELECT * FROM article_meta_view")
                .fetch_all(&mut conn)
                .await?
        };

        Ok(reply::json(QueryAllArticleMetaRes { articles: anss }))
    }
}

use crate::prelude::*;

pub fn register(router: &mut SimpleRouter) {
    use self::endpoint::*;

    router
        .at("/articles")
        .post(create_article)
        .get(query_all_article_meta);

    router
        .at("/articles/:id")
        .delete(delete_article)
        .post(update_article)
        .get(query_article);

    router.at("/articles/:id/meta").get(query_article_meta);

    router
        .at("/articles/:id/comments")
        .get(query_article_comments);
}
