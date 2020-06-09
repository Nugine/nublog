pub mod entity {
    use crate::create;
    use crate::prelude::*;

    pub struct Tag {
        id: i32,
        name: String,
    }

    pub type TagRepo = Repo<Tag>;

    impl TagRepo {
        pub async fn select_all_tags(&self) -> Result<Vec<Tag>> {
            let mut conn: Conn = self.get_conn().await?;
            let query = sqlx::query!("SELECT * FROM tags");
            let anss = query.fetch_all(&mut conn).await?;
            let tags = anss
                .into_iter()
                .map(|ans| create!(Tag from ans by id, name))
                .collect();
            Ok(tags)
        }

        pub async fn select_tag_articles(&self, id: i32) -> Result<Vec<i32>> {
            let mut conn: Conn = self.get_conn().await?;
            let query = sqlx::query!(
                "SELECT article_id FROM articles_tags_relation WHERE tag_id = $1",
                id
            );
            let anss = query.fetch_all(&mut conn).await?;
            let article_ids = anss.into_iter().map(|ans| ans.article_id).collect();
            Ok(article_ids)
        }
    }
}

pub mod dto {
    use crate::prelude::*;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryTagRes {
        id: i32,
        name: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryAllTags {
        tags: Vec<QueryTagRes>,
    }

    use crate::scopes::articles::dto::QueryArticleRes;

    #[derive(Debug, Serialize, Deserialize)]
    pub struct QueryTagArticles {
        articles: Vec<QueryArticleRes>,
    }
}
