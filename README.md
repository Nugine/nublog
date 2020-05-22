# nublog

> 博客管理系统

## 自拟题目

博客管理系统

用户分为两种角色：管理员，读者

文章模块：文章增删改查，文章渲染呈现

读者模块：登录注册，订阅文章，评论通知

后台模块：统计数据，读者管理，评论管理

特殊功能：文章分类视图，文章时间线视图，关键词查询。

## 设计

### 持久对象

#### 用户

```rust
enum UserRole{
    Admin = 0
    Reader = 1
}

struct User{
    user_id: u64,
    
    role: UserRole,

    name: String,
    email: String,
    avatar_url: String,
    profile_url: String,

    github_token: String
}
```

#### 文章

```rust
struct Article{
    article_id: u64,

    key: String,

    title: String,
    author: String,
    
    content: String,

    create_time: i64,
    update_time: i64,
}
```

#### 标签

```rust
struct Tag{
    tag_id: u64,
    name: String,
}
```

文章-标签：多对多

```rust
struct ArticleTagRelation{
    article_id: u64,
    tag_id: u64
}
```

#### 评论

评论-文章：多对一
评论-用户：多对一

```rust
struct Comment{
    comment_id: u64,

    article_id: u64,
    user_id: u64,

    create_time: i64,

    content: String,

    reply_to: Option<u64> // comment_id
}
```

#### 订阅

```rust
struct Subscription{
    user_id: u64,    // foreign key primary key
    subscription_email: String
    last_send_time: String,
}
```

### 会话对象

```rust
struct Session{
    user_id: u64,  // session key
    expire_time: i64,
    role: UserRole
}
```

### API

#### 文章

| 描述             | 方法   | 路径                       |
| ---------------- | ------ | -------------------------- |
| 新建             | POST   | /api/articles              |
| 删除             | DELETE | /api/articles/:id          |
| 更改             | PUT    | /api/articles/:id          |
| 查询文章         | GET    | /api/articles/:id          |
| 查询所有文章     | GET    | /api/articles              |
| 查询文章元信息   | GET    | /api/articles/:id/meta     |
| 查询文章所有评论 | GET    | /api/articles/:id/comments |

#### 用户

| 描述             | 方法   | 路径                    |
| ---------------- | ------ | ----------------------- |
| 查询所有用户     | GET    | /api/users              |
| 删除             | DELETE | /api/users/:id          |
| 查询单个用户     | GET    | /api/users/:id          |
| 查询用户所有评论 | GET    | /api/users/:id/comments |

#### 标签

| 描述               | 方法 | 路径                   |
| ------------------ | ---- | ---------------------- |
| 查询所有标签       | GET  | /api/tags              |
| 查询标签下所有文章 | GET  | /api/tags/:id/articles |

#### 登录

| 描述 | 方法 | 路径                       |
| ---- | ---- | -------------------------- |
| 回调 | POST | /api/oauth/github/callback |

#### 订阅

| 描述     | 方法 | 路径               |
| -------- | ---- | ------------------ |
| 更新订阅 | POST | /api/subscriptions |

#### 评论

| 描述     | 方法   | 路径              |
| -------- | ------ | ----------------- |
| 新增评论 | POST   | /api/comments     |
| 删除评论 | DELETE | /api/comments/:id |

