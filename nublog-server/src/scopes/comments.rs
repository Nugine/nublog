pub mod entity {
    use crate::prelude::*;

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
    use crate::prelude::*;
    
    #[derive(Debug, Serialize, Deserialize)]
    // 创建评论
    pub struct CreateCommentReq {
        article_id: u32,
        user_id: u32,
        content: String,
        reply_to: Option<u32>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct CreateCommentRes {
        id: i32,
    }

    #[derive(Debug, Serialize, Deserialize)]
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
