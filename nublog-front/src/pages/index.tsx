import React from "react";

import { GetServerSideProps } from "next";
import { Space } from "antd";

import ArticleMeta from "../components/ArticleMeta";

import * as vo from "../vo";
import * as ssr from "../api/ssr";

export interface IndexProps {
    articles: vo.ArticleMeta[];
}

const Index: React.FC<IndexProps> = ({ articles }: IndexProps) => {
    return (
        <Space style={{ padding: "0 1em", width: "100%" }} direction="vertical">
            {articles.map((meta => (
                <ArticleMeta key={meta.id} meta={meta} />
            )))}
        </Space>
    );
};

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
    const articles = await ssr.getAllArticlesMeta();
    return { props: { articles } };
};

export default Index;
