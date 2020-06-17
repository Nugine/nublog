import axios from "axios";

import * as dto from "./dto";

export const PREFIX = "/api";

export async function getTagArticles(tagId: number): Promise<dto.ArticleMeta[]> {
    const url = `${PREFIX}/tags/${tagId}/articles`;
    const res = await axios.get(url);
    const ans = res.data as unknown as { articles: dto.ArticleMeta[] };
    return ans.articles;
}