import React from "react";

import { GetServerSideProps } from "next";
import ReactMarkdown from "react-markdown";
import { Row, Space } from "antd";

import BlogError from "../../components/Error";

import * as vo from "../../vo";
import * as ssr from "../../api/ssr";

export type ArticleProps = {
    type: "ok";
    article: vo.Article;
} | {
    type: "error";
    statusCode: number;
}

const Article: React.FC<ArticleProps> = (props: ArticleProps) => {

    if (props.type === "ok") {
        const article = props.article;

        const lastTime = vo.cvtTime(new Date(article.update_at));

        return (
            <div style={{ padding: "0 1em", marginTop: "1em" }}>
                <h1 style={{ width: "100%", textAlign: "center" }}><span style={{ fontSize: "1.25em" }}>{article.title}</span></h1>
                <Row justify="space-between" style={{ marginBottom: "1em" }}>
                    <Space direction="horizontal"><span>作者：{article.author}</span><span>时间：{lastTime}</span></Space>
                    <span>标签：<Space direction="horizontal">{article.tags.map(tag => (<span key={tag.id}>#{tag.name}</span>))}</Space></span>
                </Row>
                <ReactMarkdown source={article.content} />
            </div>
        );
    } else {
        return (
            <BlogError statusCode={props.statusCode} title="找不到文章" description="找不到文章" />
        );
    }


};

export const getServerSideProps: GetServerSideProps<ArticleProps> = async (ctx) => {
    const articleKey = ctx.params?.key;
    if (typeof articleKey !== "string") {
        throw new Error("unexpected type");
    }
    try {
        const article = await ssr.getArticleByKey(articleKey);
        return { props: { type: "ok", article } };
    } catch (e) {
        return { props: { type: "error", statusCode: e.response.status } };
    }
};

export default Article;
