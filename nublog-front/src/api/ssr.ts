import axios from "axios";

import * as dto from "./dto";

export const LOCAL_URL = "http://localhost/api";

export async function getAllArticlesMeta(): Promise<dto.ArticleMeta[]> {
    const url = `${LOCAL_URL}/articles`;
    const res = await axios.get(url);
    const ans = res.data as unknown as { articles: dto.ArticleMeta[] };
    return ans.articles;
}