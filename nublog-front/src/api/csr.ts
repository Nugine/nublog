import axios from "axios";

import * as dto from "./dto";

export const PREFIX = "/api";

export async function getTagArticles(tagId: number): Promise<dto.ArticleMeta[]> {
    const url = `${PREFIX}/tags/${tagId}/articles`;
    const res = await axios.get(url);
    const ans = res.data as unknown as { articles: dto.ArticleMeta[] };
    return ans.articles;
}

export async function getSelf(sessionId: string): Promise<dto.User | null> {
    const url = `${PREFIX}/users/self`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.get(url, config);
    const ans = res.data as unknown as dto.User | null;
    return ans;
}

export async function initSession(code: string): Promise<dto.InitSession> {
    const url = `${PREFIX}/users/oauth/github`;
    const config = { params: { code } };
    const res = await axios.get(url, config);
    const ans = res.data as unknown as dto.InitSession;
    return ans;
}

export async function createComment(sessionId: string, articleId: number, userId: number, content: string, replyTo: number | null): Promise<dto.CommentId> {
    const url = `${PREFIX}/comments`;
    const data = { "article_id": articleId, "user_id": userId, content, "reply_to": replyTo };
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.post(url, data, config);
    const ans = res.data as unknown as { id: number };
    return ans.id;
}

export async function getArticleComments(articleId: number): Promise<dto.Comment[]> {
    const url = `${PREFIX}/articles/${articleId}/comments`;
    const res = await axios.get(url);
    const ans = res.data as unknown as { comments: dto.Comment[] };
    return ans.comments;
}

export async function deleteComment(sessionId: string, commentId: number): Promise<boolean> {
    const url = `${PREFIX}/comments/${commentId}`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.delete(url, config);
    const ans = res.data as unknown as { is_deleted: boolean };
    return ans.is_deleted;
}

export async function createTag(sessionId: string, tagName: string): Promise<number> {
    const url = `${PREFIX}/tags`;
    const config = { headers: { "x-session-id": sessionId } };
    const data = { name: tagName };
    const res = await axios.post(url, data, config);
    const ans = res.data as unknown as { id: number };
    return ans.id;
}

export async function getAllTags(): Promise<dto.Tag[]> {
    const url = `${PREFIX}/tags`;
    const res = await axios.get(url);
    const ans = res.data as unknown as { tags: dto.Tag[] };
    return ans.tags;
}

export async function getAllArticlesMeta(): Promise<dto.ArticleMeta[]> {
    const url = `${PREFIX}/articles`;
    const res = await axios.get(url);
    const ans = res.data as unknown as { articles: dto.ArticleMeta[] };
    return ans.articles;
}

export async function getAllUsers(sessionId: string): Promise<dto.User[]> {
    const url = `${PREFIX}/users`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.get(url, config);
    const ans = res.data as unknown as { users: dto.User[] };
    return ans.users;
}

export async function createUser(sessionId: string, data: dto.CreateUser): Promise<number> {
    const url = `${PREFIX}/users`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.post(url, data, config);
    const ans = res.data as unknown as { id: number };
    return ans.id;
}

export async function createArticle(sessionId: string, data: dto.CreateArticle): Promise<number> {
    const url = `${PREFIX}/articles`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.post(url, data, config);
    const ans = res.data as unknown as { id: number };
    return ans.id;
}


export async function updateArticle(sessionId: string, articleId: number, data: dto.UpdateArticle): Promise<boolean> {
    const url = `${PREFIX}/articles/${articleId}`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.post(url, data, config);
    const ans = res.data as unknown as { is_updated: boolean };
    return ans.is_updated;
}


export async function deleteUser(sessionId: string, userId: number): Promise<boolean> {
    const url = `${PREFIX}/users/${userId}`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.delete(url, config);
    const ans = res.data as unknown as { is_deleted: boolean };
    return ans.is_deleted;
}

export async function deleteTag(sessionId: string, tagId: number): Promise<boolean> {
    const url = `${PREFIX}/tags/${tagId}`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.delete(url, config);
    const ans = res.data as unknown as { is_deleted: boolean };
    return ans.is_deleted;
}

export async function deleteArticle(sessionId: string, articleId: number): Promise<boolean> {
    const url = `${PREFIX}/articles/${articleId}`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.delete(url, config);
    const ans = res.data as unknown as { is_deleted: boolean };
    return ans.is_deleted;
}

export async function updateTag(sessionId: string, tagId: number, name: string): Promise<boolean> {
    const url = `${PREFIX}/tags/${tagId}`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.post(url, { name }, config);
    const ans = res.data as unknown as { is_updated: boolean };
    return ans.is_updated;
}

export async function updateUser(sessionId: string, userId: number, roleCode: number): Promise<boolean> {
    const url = `${PREFIX}/users/${userId}`;
    const config = { headers: { "x-session-id": sessionId } };
    const res = await axios.post(url, { "role_code": roleCode }, config);
    const ans = res.data as unknown as { is_updated: boolean };
    return ans.is_updated;
}

export async function getArticleByKey(key: string): Promise<dto.Article> {
    const url = `${PREFIX}/articles/key/${key}`;
    const res = await axios.get(url);
    const ans = res.data as unknown as dto.Article;
    return ans;
}