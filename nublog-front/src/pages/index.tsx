import React from "react";

import * as vo from "../vo";
import * as ssr from "../api/ssr";
import ArticleCard from "../components/ArticleCard";

import { GetServerSideProps } from "next";
import Head from "next/head";
import { Row, Col } from "antd";

export interface IndexProps {
    articles: vo.Article[];
}

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
    const articles = await ssr.getAllArticles();
    return { props: { articles } };
};

const Index: React.FC<IndexProps> = ({ articles }: IndexProps) => {
    return (
        <>
            <Head>
                <title>{vo.generateTitle()}</title>
            </Head>
            <Row justify="center">
                <Col span={24} lg={16}>
                    {articles.map(article => (
                        <ArticleCard article={article} key={article.id} style={{ width: "100%", marginTop: "1em" }} />
                    ))}
                </Col>
            </Row>
        </>
    );
};

export default Index;
