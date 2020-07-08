import * as dto from "./dto";
import * as config from "../config";

import axios, { AxiosRequestConfig } from "axios";

const SSR_URL_PREFIX = config.api.ssrUrlPrefix;

async function ssrGet(url: string, config?: AxiosRequestConfig): Promise<unknown> {
    const fullUrl = SSR_URL_PREFIX + url;
    const res = await axios.get(fullUrl, config);
    return res.data;
}

export async function getAllArticles(): Promise<dto.QueryArticleRes[]> {
    return await ssrGet("/articles/query_all") as dto.QueryArticleRes[];
}

export async function getArticleByKey(key: string): Promise<dto.QueryArticleRes> {
    const config = { params: { "url_key": key } };
    return await ssrGet("/articles/query_by_key", config) as dto.QueryArticleRes;
}
