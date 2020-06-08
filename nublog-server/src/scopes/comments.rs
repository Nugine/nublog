pub mod entity {
    use crate::types::DateTime;

    pub struct Comment {
        id: i32,
        article_id: i32,
        user_id: i32,
        content: String,
        reply_to: Option<i32>,
        create_at: DateTime,
    }
}

pub mod dto {
    // 创建评论
    pub struct CreateCommentReq {
        article_id: u32,
        user_id: u32,
        content: String,
        reply_to: Option<u32>,
    }

    pub struct CreateCommentRes {
        id: i32,
    }

    // 查询单个评论
    pub struct QueryCommentRes {
        id: i32,
        article_id: i32,
        user_id: i32,
        content: String,
        reply_to: Option<i32>,
        create_at: String,
    }
}
