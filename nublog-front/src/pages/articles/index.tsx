import React, { useMemo, useState, useRef, useEffect } from "react";

import { GetServerSideProps } from "next";

import { Space, Collapse, Input, Row, Col, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import * as vo from "../../vo";
import * as ssr from "../../api/ssr";
import * as csr from "../../api/csr";
import * as utils from "../../utils";
import ArticleCard from "../../components/ArticleCard";
import { useLoading } from "../../hooks";

export interface ArticleIndexProps {
    articles: vo.Article[];
}

export const getServerSideProps: GetServerSideProps<ArticleIndexProps> = async () => {
    const articles = await ssr.getAllArticles();
    return { props: { articles } };
};

function groupByMonth(articles: vo.Article[]): Array<[string, vo.Article[]]> {
    const map = new Map<string, vo.Article[]>();
    for (const meta of articles) {
        const time = new Date(meta.created_at);
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
    const [searchArticles, setSearchArticles] = useState<vo.Article[] | null>(null);

    const groups = useMemo(() => {
        if (searchArticles !== null) {
            return groupByMonth(searchArticles);
        } else {
            return groupByMonth(articles);
        }
    }, [articles, searchArticles]);

    const [loadingState, withLoading] = useLoading();

    const handleSearch = (search: string): Promise<void> => withLoading(async () => {
        const ans = await csr.getAllArticles(search);
        setSearchArticles(ans);
    }, "加载失败");

    const searchRef = useRef<Input>(null);

    const handleSearchFocus = (e: KeyboardEvent): void => {
        if (e.key === "s" || e.key === "S") {
            searchRef.current?.focus();
        }
    };

    useEffect(() => {
        document.addEventListener("keypress", handleSearchFocus);
        return (): void => document.removeEventListener("keypress", handleSearchFocus);
    }, []);

    return (
        <Space
            direction="vertical"
            style={{ padding: "0 1em", marginTop: "1em", width: "100%" }}
        >
            <Row justify="center" style={{ padding: "0 1em" }}>
                <Col span={24} md={12}>
                    <Input.Search
                        onSearch={handleSearch}
                        placeholder="搜索一下"
                        ref={searchRef}
                    />
                </Col>
            </Row>
            <Spin indicator={<LoadingOutlined />} spinning={loadingState === "loading"} delay={utils.COMMON_WAIT_TIME} >
                <Collapse
                    style={{ width: "100%", backgroundColor: "white", borderBottom: "none" }}
                    defaultActiveKey={groups.map(group => group[0])}
                    ghost
                >
                    {groups.map(group => (
                        <Collapse.Panel key={group[0]}
                            header={
                                <h1 style={{ fontSize: "1.5em" }}>{displayMonth(group[0])}</h1>
                            }
                            style={{ width: "100%" }}
                        >
                            <Space direction="vertical" style={{ width: "100%" }} >
                                {group[1].map(article => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </Space>
                        </Collapse.Panel>
                    ))}
                </Collapse>
            </Spin>
        </Space >
    );
};


export default ArticlesIndex;
