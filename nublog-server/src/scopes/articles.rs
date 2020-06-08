pub mod entity {
    use crate::prelude::*;

    pub struct Article {
        id: i32,
        article_key: String,
        title: String,
        author: String,
        content: String,
        create_at: DateTime,
        update_at: DateTime,
    }
}

pub mod dto {
    use crate::prelude::*;

    // 创建文章
    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateArticleReq {
        article_key: String,
        title: String,
        author: String,
        content: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateArticleRes {
        id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 更新文章
    pub struct UpdateArticleReq {
        id: i32,
        article_key: String,
        title: String,
        author: String,
        content: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询单个文章
    pub struct QueryArticleRes {
        id: i32,
        article_key: String,
        title: String,
        author: String,
        content: String,
        create_at: String,
        update_at: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询所有文章
    pub struct QueryAllArticlesRes {
        articles: Vec<QueryArticleRes>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    // 查询文章元信息
    pub struct QueryArticleMetaRes {
        id: i32,
        article_key: String,
        title: String,
        author: String,
        create_at: String,
        update_at: String,
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    #[derive(Debug, Serialize, Deserialize)]
    // 查询文章所有评论
    pub struct QueryArticleCommentsRes {
        comments: Vec<QueryCommentRes>,
    }
}
