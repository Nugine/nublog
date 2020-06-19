import React, { useMemo, useState } from "react";

import { GetServerSideProps } from "next";
import { Space, Collapse, Input, Row, Col, message, Spin } from "antd";
import { css } from "emotion";

import * as vo from "../../vo";
import * as ssr from "../../api/ssr";
import * as csr from "../../api/csr";
import ArticleMeta from "../../components/ArticleMeta";

export interface ArticleIndexProps {
    articles: vo.ArticleMeta[];
}

function groupByMonth(articles: vo.ArticleMeta[]): Array<[string, vo.ArticleMeta[]]> {
    const map = new Map<string, vo.ArticleMeta[]>();
    for (const meta of articles) {
        const time = new Date(meta.create_at);
        const year = time.getFullYear();
        const month = (time.getMonth() + 1).toString().padStart(2, "0");
        const key = `${year}-${month}`;
        const value = map.get(key);
        if (value) {
            value.push(meta);
        } else {
            map.set(key, [meta]);
        }
    }
    const ans = Array.from(map.entries());
    return ans;
}

function displayMonth(time: string): string {
    const parts = time.split("-");
    return `${parts[0]} 年 ${parseInt(parts[1])} 月`;
}

const ArticlesIndex: React.FC<ArticleIndexProps> = ({ articles }: ArticleIndexProps) => {
    const overrideStyleName = css`
        div {
            border-bottom: none !important;
        }
    `;

    const [searchArticles, setSearchArticles] = useState<vo.ArticleMeta[] | null>(null);
    const [loadingState, setLoadingState] = useState<vo.LoadingState>("initial");

    const groups = useMemo(() => {
        if (searchArticles !== null) {
            return groupByMonth(searchArticles);
        } else {
            return groupByMonth(articles);
        }
    }, [articles, searchArticles]);


    const handleSearch = async (search: string): Promise<void> => {
        setLoadingState("loading");
        try {
            const ans = await csr.getAllArticlesMeta(search);
            setSearchArticles(ans);
            setLoadingState("success");
        } catch (err) {
            console.error(err);
            message.error("加载失败");
            setLoadingState("error");
        }
    };

    return (
        <Space direction="vertical" style={{ padding: "0 1em", marginTop: "1em", width: "100%" }}>
            <Row justify="center">
                <Col span={24} lg={12}>
                    <Input.Search onSearch={handleSearch} placeholder="搜索一下" />
                </Col>
            </Row>
            <Spin spinning={loadingState === "loading"} delay={1000} >
                <Collapse className={overrideStyleName} style={{ width: "100%" }} bordered={false} defaultActiveKey={groups.map(group => group[0])}>
                    {groups.map(group => (
                        <Collapse.Panel key={group[0]}
                            header={
                                <h1 style={{ fontSize: "1.5em" }}>{displayMonth(group[0])}</h1>
                            }
                            style={{ width: "100%" }}
                        >
                            <Space direction="vertical" style={{ width: "100%" }} >
                                {group[1].map(meta => (
                                    <ArticleMeta key={meta.id} meta={meta} timeStyle="complex" />
                                ))}
                            </Space>
                        </Collapse.Panel>
                    ))}
                </Collapse>
            </Spin>
        </Space >
    );
};

export const getServerSideProps: GetServerSideProps<ArticleIndexProps> = async () => {
    const articles = await ssr.getAllArticlesMeta();
    return { props: { articles } };
};

export default ArticlesIndex;