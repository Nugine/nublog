import React from "react";

import { GetServerSideProps } from "next";
import ReactMarkdown from "react-markdown";
import { Row, Space, Layout, Col, Divider } from "antd";
import { css } from "emotion";

import BlogError from "../../components/Error";
import * as vo from "../../vo";
import * as ssr from "../../api/ssr";
import CommentArea from "../../components/CommentArea";

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

        const time = (
            <>
                <span>创建于：{vo.cvtTime(new Date(article.create_at))}</span>
                <span>更新于：{vo.cvtTime(new Date(article.update_at))}</span>
            </>
        );

        let tags = null;
        if (article.tags.length > 0) {
            tags = (
                <span>标签：<Space direction="horizontal">{article.tags.map(tag => (
                    <span key={tag.id}>#{tag.name}</span>)
                )}</Space></span>
            );
        }

        const styleName = css`h1{ font-size: 2em }`;

        return (
            <Layout style={{ padding: "0 1em", marginTop: "1em", backgroundColor: "white", flexGrow: 1 }}>

                <Layout.Content style={{ flexGrow: 1 }}>
                    <Row justify="center">
                        <Col span={24} lg={16} className={styleName}>
                            <h1 style={{ width: "100%", textAlign: "center" }}>{article.title}</h1>
                            <Row justify="space-between" style={{ marginBottom: "1em" }}>
                                <Space direction="horizontal"><span>作者：{article.author}</span>{time}</Space>
                                {tags}
                            </Row>
                            <Divider />
                            <ReactMarkdown source={article.content} />
                        </Col>
                    </Row>
                </Layout.Content>

                <Layout.Footer style={{ backgroundColor: "white", padding: "0" }}>
                    <CommentArea articleId={article.id} />
                </Layout.Footer>
            </Layout>
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
