import axios from "axios";

import * as dto from "./dto";
import * as config from "../config";

const SSR_URL_PREFIX = config.api.ssrUrlPrefix;

async function ssrGet(url: string): Promise<unknown> {
    const fullUrl = SSR_URL_PREFIX + url;
    const res = await axios.get(fullUrl);
    return res.data;
}

export async function getAllArticles(): Promise<dto.QueryArticleRes[]> {
    return await ssrGet("/articles/query_all") as dto.QueryArticleRes[];
}