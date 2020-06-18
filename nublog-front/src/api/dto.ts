export type DateTimeString = string;

export interface ArticleMeta {
    id: number;
    article_key: string;
    title: string;
    author: string;
    summary: string;
    create_at: DateTimeString;
    update_at: DateTimeString;
    tags: Tag[];
}

export interface Tag {
    id: number;
    name: string;
}

export interface Article {
    id: number;
    article_key: string;
    title: string;
    author: string;
    summary: string;
    content: string;
    create_at: DateTimeString;
    update_at: DateTimeString;
    tags: Tag[];
}

export interface User {
    id: number;
    role_code: number;
    name: string;
    email: string;
    avatar_url: string;
    profile_url: string;
}

export interface InitSession {
    session_id: string;
}

export type CommentId = number;
