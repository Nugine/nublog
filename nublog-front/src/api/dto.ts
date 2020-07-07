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

