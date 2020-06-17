import axios from "axios";

import * as dto from "./dto";

export const LOCAL_URL = "http://localhost/api";

export async function getAllArticlesMeta(): Promise<dto.ArticleMeta[]> {
    const url = `${LOCAL_URL}/articles`;
    const res = await axios.get(url);
    const ans = res.data as unknown as { articles: dto.ArticleMeta[] };
    return ans.articles;
}

export async function getArticleByKey(key: string): Promise<dto.Article> {
    const url = `${LOCAL_URL}/articles/key/${key}`;
    const res = await axios.get(url);
    const ans = res.data as unknown as dto.Article;
    return ans;
}

export async function getAllTags(): Promise<dto.Tag[]> {
    const url = `${LOCAL_URL}/tags`;
    const res = await axios.get(url);
    const ans = res.data as unknown as {tags: dto.Tag[]};
    return ans.tags;
}