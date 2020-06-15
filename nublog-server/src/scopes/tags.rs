pub mod entity {
    #[derive(Debug, sqlx::FromRow)]
    pub struct Tag {
        pub id: i32,
        pub name: String,
    }
}

pub mod dto {
    use crate::prelude::*;

    #[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
    pub struct QueryTagRes {
        pub id: i32,
        pub name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryAllTagsRes {
        pub tags: Vec<QueryTagRes>,
    }

    use crate::scopes::articles::dto::QueryArticleRes;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryTagArticlesRes {
        pub articles: Vec<QueryArticleRes>,
    }
}

pub mod endpoint {
    use super::dto::*;
    use crate::prelude::*;
    use crate::scopes::articles::dto::QueryArticleRes;

    pub async fn query_all_tags(req: Request) -> Result<Json<QueryAllTagsRes>> {
        let mut conn: Conn = req.get_conn().await?;
        let anss = {
            sqlx::query_as!(QueryTagRes, "SELECT * FROM tags")
                .fetch_all(&mut conn)
                .await?
        };
        Ok(reply::json(QueryAllTagsRes { tags: anss }))
    }

    pub async fn query_tag_articles(req: Request) -> Result<Json<QueryTagArticlesRes>> {
        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;
        let anss = {
            sqlx::query_as!(
                QueryArticleRes,
                r#"
                    SELECT id, article_key, title, author, content, create_at, update_at
                    FROM articles_tags_relation tab1 JOIN articles ON tab1.article_id = articles.id
                    WHERE tag_id = $1
                "#,
                id
            )
            .fetch_all(&mut conn)
            .await?
        };

        Ok(reply::json(QueryTagArticlesRes { articles: anss }))
    }
}

use crate::prelude::*;

pub fn register(router: &mut SimpleRouter) {
    use self::endpoint::*;
    router.at("/tags").get(query_all_tags);
    router.at("/tags/:id/articles").get(query_tag_articles);
}
