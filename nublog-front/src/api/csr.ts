import * as dto from "./dto";
import * as config from "../config";
import * as utils from "../utils";

import axios, { AxiosRequestConfig } from "axios";

const CSR_URL_PREFIX = config.api.csrUrlPrefix;

async function csrGet(url: string, config?: AxiosRequestConfig): Promise<unknown> {
    const fullUrl = CSR_URL_PREFIX + url;
    const res = await axios.get(fullUrl, config);
    return res.data;
}

export async function getAllArticles(search?: string): Promise<dto.QueryArticleRes[]> {
    await utils.delay(3000); // FIXME: remove delay
    const config = { params: { search } };
    return await csrGet("/articles/query_all", config) as dto.QueryArticleRes[];
}
