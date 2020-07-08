export interface QueryArticleRes {
    id: number;
    url_key: string;
    title: string;
    author: string;
    summary: string;
    content: string | null;
    created_at: string;
    updated_at: string;
}

export interface QueryUserRes {
    id: number;
    role_code: number;
    name: string;
    email: string;
    avatar_url: string;
    profile_url: string;
}

export interface LoginRes{
    session_id: string;
}