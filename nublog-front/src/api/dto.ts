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

export interface UpdateUserReq{
    id: number;
    role_code: number;
}

export interface UpdateUserRes  {
    is_updated: boolean;
}

export interface DeleteUserReq{
    id: number;
}

export interface DeleteUserRes{
    is_deleted: boolean;
}

export interface UpdateArticleReq{
    id: number;
    url_key: string;
    title: string;
    author: string;
    summary: string;
    content: string;
}

export interface UpdateArticleRes  {
    is_updated: boolean;
}

export interface DeleteArticleReq{
    id: number;
}

export interface DeleteArticleRes{
    is_deleted: boolean;
}

export interface CreateArticleReq{
    url_key: string;
    title: string;
    author: string;
    summary: string;
    content: string;
}

export interface CreateArticleRes{
    id: number;
}