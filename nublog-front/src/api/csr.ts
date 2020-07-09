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

async function csrPost(url: string, data: unknown | undefined, config?: AxiosRequestConfig): Promise<unknown> {
    const fullUrl = CSR_URL_PREFIX + url;
    const res = await axios.post(fullUrl, data, config);
    return res.data;
}

export async function getAllArticles(search?: string): Promise<dto.QueryArticleRes[]> {
    const config = { params: { search } };
    return await csrGet("/articles/query_all", config) as dto.QueryArticleRes[];
}

export async function getSelf(sessionId: string): Promise<dto.QueryUserRes> {
    const config = { headers: { "x-session-id": sessionId } };
    return await csrGet("/users/query_self", config) as dto.QueryUserRes;
}

export async function logout(sessionId: string): Promise<void> {
    const config = { headers: { "x-session-id": sessionId } };
    await csrPost("/users/logout", undefined, config);
}

export async function initSession(code: string): Promise<dto.LoginRes> {
    const config = { params: { code } };
    return await csrPost("/users/oauth/github", undefined, config) as dto.LoginRes;
}

export async function getArticleByKey(key: string): Promise<dto.QueryArticleRes> {
    const config = { params: { "url_key": key } };
    return await csrGet("/articles/query_by_key", config) as dto.QueryArticleRes;
}

export async function getAllUsers(sessionId: string): Promise<dto.QueryUserRes[]> {
    const config = { headers: { "x-session-id": sessionId } };
    return await csrGet("/users/query_all", config) as dto.QueryUserRes[];
}