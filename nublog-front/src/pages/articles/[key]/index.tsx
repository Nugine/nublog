import React from "react";

import { GetServerSideProps } from "next";
import { Row, Layout, Col } from "antd";

import Error404 from "../../404";
import * as vo from "../../../vo";
import * as ssr from "../../../api/ssr";
import Head from "next/head";

export type ArticleProps = {
    article?: vo.Article;
}

export const getServerSideProps: GetServerSideProps<ArticleProps> = async (ctx) => {
    const urlKey = ctx.params?.key;
    if (typeof urlKey !== "string") {
        throw new Error("unexpected type");
    }

    try {
        const article = await ssr.getArticleByKey(urlKey);
        return { props: { article } };
    } catch (e) {
        if (e.response.status === 404) {
            return { props: {} };
        }
        throw e;
    }
};

const Article: React.FC<ArticleProps> = ({ article }: ArticleProps) => {
    if (article) {
        return (
            <>
                <Head>
                    <title>{vo.generateTitle(article.title)}</title>
                </Head>
                <Layout style={{ padding: "0 1em", marginTop: "1em", backgroundColor: "white", flexGrow: 1 }}>
                    <Layout.Content style={{ flexGrow: 1 }}>
                        <Row justify="center">
                            <Col span={24} lg={16}>
                                <h1 style={{ width: "100%", textAlign: "center" }}>{article.title}</h1>
                                <Row
                                    justify="space-between"
                                    style={{ borderBottom: "1px solid #eaeaea", marginBottom: "1em" }}
                                >
                                    <span>作者：{article.author}</span>
                                    <span>时间：{vo.fmtTime(new Date(article.created_at), true)}</span>
                                </Row>
                                {article.content} {/*TODO: markdown*/}
                            </Col>
                        </Row>
                    </Layout.Content>
                </Layout>
            </>
        );
    } else {
        return <Error404 />;
    }
};

export default Article;
