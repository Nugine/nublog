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