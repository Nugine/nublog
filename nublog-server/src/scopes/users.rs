pub mod entity {
    pub enum UserRole {
        Admin,
        Reader,
    }

    pub struct User {
        id: i32,
        role: UserRole,
        name: String,
        email: String,
        avatar_url: String,
        profile_url: String,
        github_token: Option<String>,
    }
}

pub mod dto {
    // 查询单个用户
    pub struct QueryUserRes {
        id: i32,
        role: String,
        name: String,
        email: String,
        avatar_url: String,
        profile_url: String,
    }

    // 查询所有用户
    pub struct QueryAllUsersRes {
        users: Vec<QueryUserRes>,
    }

    use crate::scopes::comments::dto::QueryCommentRes;

    // 查询用户所有评论
    pub struct QueryUserCommentsRes {
        comments: Vec<QueryCommentRes>,
    }
}
