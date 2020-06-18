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
    const config = { data: { "article_id": articleId, "user_id": userId, content, "reply_to": replyTo }, headers: { "x-session-id": sessionId } };
    const res = await axios.post(url, config);
    const ans = res.data as unknown as { id: number };
    return ans.id;
}