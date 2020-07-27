import * as dto from "./dto";
import * as config from "../config";

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

export async function updateUser(sessionId: string,data: dto.UpdateUserReq): Promise<dto.UpdateUserRes>{
    const config = { headers: { "x-session-id": sessionId } };
    return await csrPost("/users/update",data,config) as dto.UpdateUserRes;
}

export async function updateArticle(sessionId: string,data: dto.UpdateArticleReq): Promise<dto.UpdateArticleRes>{
    const config = { headers: { "x-session-id": sessionId } };
    return await csrPost("/articles/update",data,config) as dto.UpdateArticleRes;
}

export async function deleteUser(sessionId: string,userId: number): Promise<dto.DeleteUserRes>{
    const config = { headers: { "x-session-id": sessionId } };
    return await csrPost("/users/delete",{id:userId} as dto.DeleteUserReq,config) as dto.DeleteUserRes;
}

export async function deleteArticle(sessionId: string,articleId: number): Promise<dto.DeleteArticleRes>{
    const config = { headers: { "x-session-id": sessionId } };
    return await csrPost("/articles/delete",{id:articleId} as dto.DeleteArticleReq,config) as dto.DeleteArticleRes;
}

export async function createArticle(sessionId: string,data: dto.CreateArticleReq): Promise<dto.CreateArticleRes>{
    const config = { headers: { "x-session-id": sessionId } };
    return await csrPost("/articles/create",data,config) as dto.CreateArticleRes;
}