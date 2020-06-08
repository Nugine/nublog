pub mod entity {
    pub struct Tag {
        id: i32,
        name: String,
    }
}

pub mod dto {
    pub struct QueryTagRes {
        id: i32,
        name: String,
    }

    pub struct QueryAllTags {
        tags: Vec<QueryTagRes>,
    }

    use crate::scopes::articles::dto::QueryArticleRes;

    pub struct QueryTagArticles {
        articles: Vec<QueryArticleRes>,
    }
}
