import React, { useMemo } from "react";

import { GetServerSideProps } from "next";
import { Space, Collapse } from "antd";

import * as vo from "../../vo";
import * as ssr from "../../api/ssr";
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
    const groups = useMemo(() => groupByMonth(articles), [articles]);

    return (
        <Space direction="vertical" style={{ padding: "0 1em", marginTop: "1em", width: "100%" }}>
            <Collapse style={{ width: "100%" }} bordered={false} defaultActiveKey={groups.length > 0 ? groups[0][0] : undefined}>
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
        </Space>
    );
};

export const getServerSideProps: GetServerSideProps<ArticleIndexProps> = async () => {
    const articles = await ssr.getAllArticlesMeta();
    return { props: { articles } };
};

export default ArticlesIndex;