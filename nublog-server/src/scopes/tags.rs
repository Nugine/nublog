pub mod entity {
    use crate::prelude::*;

    #[derive(Debug, sqlx::FromRow)]
    pub struct Tag {
        pub id: i32,
        pub name: String,
    }

    pub type TagRepo = Repo<Tag>;

    use crate::scopes::articles::entity::Article;

    impl TagRepo {
        pub async fn select_all_tags(&self) -> Result<Vec<Tag>> {
            let mut conn: Conn = self.get_conn().await?;
            let anss = sqlx::query_as!(Tag, "SELECT * FROM tags")
                .fetch_all(&mut conn)
                .await?;
            Ok(anss)
        }

        pub async fn select_tag_articles(&self, id: i32) -> Result<Vec<Article>> {
            let mut conn: Conn = self.get_conn().await?;
            let anss = sqlx::query_as!(
                Article,
                r#"
                SELECT id, article_key, title, author, content, create_at, update_at
                FROM articles_tags_relation tab1 JOIN articles ON tab1.article_id = articles.id
                WHERE tag_id = $1
                "#,
                id
            )
            .fetch_all(&mut conn)
            .await?;
            Ok(anss)
        }
    }
}

pub mod dto {
    use crate::prelude::*;

    #[derive(Debug, Serialize, Deserialize)]
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
    use super::entity::*;
    use crate::prelude::*;
    use crate::scopes::articles::dto::QueryArticleRes;

    pub async fn query_all_tags(req: Request) -> Result<Json<QueryAllTagsRes>> {
        let repo = req.try_inject_ref::<TagRepo>()?;
        let anss = repo.select_all_tags().await?;
        let res = QueryAllTagsRes {
            tags: anss
                .into_iter()
                .map(|Tag { id, name }| QueryTagRes { id, name })
                .collect(),
        };
        Ok(reply::json(res))
    }

    pub async fn query_tag_articles(req: Request) -> Result<Json<QueryTagArticlesRes>> {
        let id = req.expect_param("id").parse()?;
        let repo = req.try_inject_ref::<TagRepo>()?;
        let anss = repo.select_tag_articles(id).await?;
        let res = QueryTagArticlesRes {
            articles: anss
                .into_iter()
                .map(|ans| QueryArticleRes {
                    id: ans.id,
                    article_key: ans.article_key,
                    title: ans.title,
                    author: ans.author,
                    content: ans.content,
                    create_at: ans.create_at.to_rfc3339(),
                    update_at: ans.update_at.to_rfc3339(),
                })
                .collect(),
        };
        Ok(reply::json(res))
    }
}
