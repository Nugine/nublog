pub mod entity {
    use crate::types::DateTime;

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
    // 创建文章
    pub struct CreateArticleReq {
        article_key: String,
        title: String,
        author: String,
        content: String,
    }

    pub struct CreateArticleRes {
        id: i32,
    }

    // 更新文章
    pub struct UpdateArticleReq {
        id: i32,
        article_key: String,
        title: String,
        author: String,
        content: String,
    }

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

    // 查询所有文章
    pub struct QueryAllArticlesRes {
        articles: Vec<QueryArticleRes>,
    }

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

    // 查询文章所有评论
    pub struct QueryArticleCommentsRes {
        comments: Vec<QueryCommentRes>,
    }
}
