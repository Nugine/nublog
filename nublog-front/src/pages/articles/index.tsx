import React, { useMemo, } from "react";

import { GetServerSideProps } from "next";

import { Space, Collapse, Row, Col } from "antd";

import * as vo from "../../vo";
import * as ssr from "../../api/ssr";
import ArticleCard from "../../components/ArticleCard";
import Head from "next/head";

export interface ArticleIndexProps {
    articles: vo.Article[];
}

export const getServerSideProps: GetServerSideProps<ArticleIndexProps> = async () => {
    const articles = await ssr.getAllArticles();
    return { props: { articles } };
};

interface ArticleGroup {
    month: string;
    articles: vo.Article[];
}

function groupByMonth(articles: vo.Article[]): ArticleGroup[] {
    const map = new Map<string, vo.Article[]>();
    for (const article of articles) {
        const time = new Date(article.created_at);
        const year = time.getFullYear();
        const month = (time.getMonth() + 1).toString().padStart(2, "0");
        const key = `${year}-${month}`;
        const value = map.get(key);
        if (value) {
            value.push(article);
        } else {
            map.set(key, [article]);
        }
    }
    const ans = Array.from(map.entries()).map(([month, articles]) => ({ month, articles }));
    ans.reverse();
    for (const group of ans) {
        group.articles.sort((lhs, rhs) => {
            if (lhs.created_at != rhs.created_at) {
                return lhs.created_at > rhs.created_at ? -1 : 1;
            }
            return 0;
        });
    }
    return ans;
}

function displayMonth(time: string): string {
    const parts = time.split("-");
    return `${parts[0]} 年 ${parseInt(parts[1])} 月`;
}

const ArticlesIndex: React.FC<ArticleIndexProps> = ({ articles }: ArticleIndexProps) => {

    const groups = useMemo(() => {
        return groupByMonth(articles);
    }, [articles]);

    return (
        <>
            <Head>
                <title>{vo.generateTitle("归档")}</title>
            </Head>
            <Row justify="center">
                <Col span={24} lg={16}>
                    <Space
                        direction="vertical"
                        style={{ padding: "0 1em", marginTop: "1em", width: "100%" }}
                    >
                        <Collapse
                            style={{ width: "100%", backgroundColor: "white", borderBottom: "none" }}
                            defaultActiveKey={groups.map(group => group.month)}
                            ghost
                        >
                            {groups.map(group => (
                                <Collapse.Panel key={group.month}
                                    header={
                                        <h1 style={{ fontSize: "1.5em" }}>{displayMonth(group.month)}</h1>
                                    }
                                    style={{ width: "100%" }}
                                >
                                    <Space direction="vertical" style={{ width: "100%" }} >
                                        {group.articles.map(article => (
                                            <ArticleCard key={article.id} article={article} />
                                        ))}
                                    </Space>
                                </Collapse.Panel>
                            ))}
                        </Collapse>
                    </Space >
                </Col>
            </Row>
        </>
    );
};

export default ArticlesIndex;
