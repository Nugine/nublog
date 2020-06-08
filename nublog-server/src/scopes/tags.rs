pub mod entity {
    pub struct Tag {
        id: i32,
        name: String,
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
