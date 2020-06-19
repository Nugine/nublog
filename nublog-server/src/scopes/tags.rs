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

    use crate::scopes::articles::dto::QueryArticleMetaRes;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryTagArticlesRes {
        pub articles: Vec<QueryArticleMetaRes>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateTagReq {
        pub name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateTagRes {
        pub id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]

    pub struct DeleteTagRes {
        pub is_deleted: bool,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateTagReq {
        pub name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]

    pub struct UpdateTagRes {
        pub is_updated: bool,
    }
}

pub mod endpoint {
    use super::dto::*;
    use crate::prelude::*;
    use crate::scopes::articles::dto::QueryArticleMetaRes;

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
        let anss: Vec<QueryArticleMetaRes> = {
            // not verified
            // FIXME: sqlx bug: query_as!
            sqlx::query_as(
                r#"
                    SELECT view.* FROM article_meta_view view
                        JOIN articles_tags_relation relation
                        ON relation.article_id = view.id
                    WHERE relation.tag_id = $1
                "#,
            )
            .bind(id)
            .fetch_all(&mut conn)
            .await?
        };

        Ok(reply::json(QueryTagArticlesRes { articles: anss }))
    }

    pub async fn create_tag(mut req: Request) -> Result<Json<CreateTagRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let dto: CreateTagReq = req.json().await?;

        let mut conn = req.get_conn().await?;
        let res = {
            sqlx::query_as!(
                CreateTagRes,
                "INSERT INTO tags(name) VALUES($1) RETURNING id",
                dto.name
            )
            .fetch_one(&mut conn)
            .await?
        };

        Ok(reply::json(res))
    }

    pub async fn delete_tag(req: Request) -> Result<Json<DeleteTagRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let id: i32 = req.expect_param("id").parse()?;

        let mut conn: Conn = req.get_conn().await?;

        let is_deleted = {
            let ans = sqlx::query!("DELETE FROM tags WHERE id = $1", id)
                .execute(&mut conn)
                .await?;
            ans == 1
        };

        Ok(reply::json(DeleteTagRes { is_deleted }))
    }

    pub async fn update_tag(mut req: Request) -> Result<Json<UpdateTagRes>> {
        req.ensure_roles(&[ADMIN_ROLE_CODE])?;

        let id: i32 = req.expect_param("id").parse()?;
        let dto: UpdateTagReq = req.json().await?;

        let mut conn: Conn = req.get_conn().await?;
        let is_updated = {
            let ans = sqlx::query!("UPDATE tags SET name = $1 WHERE id = $2", dto.name, id)
                .execute(&mut conn)
                .await?;
            ans == 1
        };

        Ok(reply::json(UpdateTagRes { is_updated }))
    }
}

use crate::prelude::*;

pub fn register(router: &mut SimpleRouter) {
    use self::endpoint::*;
    router.at("/tags").get(query_all_tags).post(create_tag);
    router.at("/tags/:id/articles").get(query_tag_articles);
    router.at("/tags/:id").delete(delete_tag).post(update_tag);
}
