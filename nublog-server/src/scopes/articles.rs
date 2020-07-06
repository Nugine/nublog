mod entities {
    use crate::prelude::*;

    pub struct Article {
        pub id: i32,
        pub url_key: String,
        pub title: String,
        pub author: String,
        pub summary: String,
        pub content: String,
        pub created_at: DateTime,
        pub updated_at: DateTime,
    }
}

pub mod dto {
    use crate::prelude::*;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateArticleReq {
        pub url_key: String,
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
    pub struct DeleteArticleReq {
        pub id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct DeleteArticleRes {
        pub is_deleted: bool,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateArticleReq {
        pub id: i32,
        pub url_key: String,
        pub title: String,
        pub author: String,
        pub summary: String,
        pub content: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateArticleRes {
        pub is_updated: bool,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryArticleByKey {
        pub url_key: String,
    }

    #[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
    pub struct QueryArticleRes {
        pub id: i32,
        pub url_key: String,
        pub title: String,
        pub author: String,
        pub summary: String,
        pub content: Option<String>,
        pub created_at: DateTime,
        pub updated_at: DateTime,
    }

    pub type QueryAllArticleRes = Vec<QueryArticleRes>;
}

pub mod endpoints {
    use super::dto::*;
    use crate::prelude::*;

    pub async fn create_article(mut req: Request) -> Result<Json<CreateArticleRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE]).await?;

        jsonrpc(req, |mut conn, dto: CreateArticleReq| async move {
            let ans = sqlx::query!(
                r#"
                INSERT INTO articles(url_key, title, author, summary, content)
                    VALUES($1, $2, $3, $4, $5)
                    RETURNING id
                "#,
                dto.url_key,
                dto.title,
                dto.author,
                dto.summary,
                dto.content
            )
            .fetch_one(&mut conn)
            .await?;
            Ok(CreateArticleRes { id: ans.id })
        })
        .await
    }

    pub async fn delete_article(mut req: Request) -> Result<Json<DeleteArticleRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE]).await?;

        jsonrpc(req, |mut conn, dto: DeleteArticleReq| async move {
            let ans = sqlx::query!("DELETE FROM articles WHERE id = $1", dto.id)
                .execute(&mut conn)
                .await?;

            Ok(DeleteArticleRes {
                is_deleted: ans == 1,
            })
        })
        .await
    }

    pub async fn update_article(mut req: Request) -> Result<Json<UpdateArticleRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE]).await?;

        jsonrpc(req, |mut conn, dto: UpdateArticleReq| async move {
            let ans = sqlx::query!(
                r#"
                UPDATE articles SET 
                    url_key = $1,
                    title = $2,
                    author = $3,
                    summary = $4,
                    content = $5 
                WHERE id = $6
                "#,
                dto.url_key,
                dto.title,
                dto.author,
                dto.summary,
                dto.content,
                dto.id
            )
            .execute(&mut conn)
            .await?;

            Ok(UpdateArticleRes {
                is_updated: ans == 1,
            })
        })
        .await
    }

    pub async fn query_article_by_key(req: Request) -> Result<Json<QueryArticleRes>> {
        jsonrpc_query(req, |mut conn, dto: QueryArticleByKey| async move {
            let ans = sqlx::query_as!(
                QueryArticleRes,
                r#"
                SELECT * FROM articles WHERE url_key = $1 LIMIT 1
                "#,
                dto.url_key
            )
            .fetch_optional(&mut conn)
            .await?;

            match ans {
                None => Err(ApiError::NotFound.into()),
                Some(res) => Ok(res),
            }
        })
        .await
    }

    pub async fn query_all_articles(req: Request) -> Result<Json<QueryAllArticleRes>> {
        let mut conn = req.get_conn().await?;
        let ans = sqlx::query_as!(
            QueryArticleRes,
            r#"
                SELECT 
                    id, url_key, title, author, summary, 
                    created_at, updated_at, 
                    NULL AS content
                FROM articles
            "#
        )
        .fetch_all(&mut conn)
        .await?;
        Ok(reply::json(ans))
    }
}

use crate::prelude::*;

pub fn register(router: &mut SimpleRouter) {
    use self::endpoints::*;

    router.at("/articles/create").post(create_article);

    router.at("/articles/update").post(update_article);

    router.at("/articles/delete").post(delete_article);

    router
        .at("/articles/query_by_key")
        .get(query_article_by_key);

    router.at("/articles/query_all").get(query_all_articles);
}
