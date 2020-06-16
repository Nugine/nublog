import React from "react";

import { Card, Row, Space, Typography } from "antd";
import Link from "next/link";
import { css } from "emotion";

import *  as vo from "../vo";

export interface ArticleMetaProps {
    meta: vo.ArticleMeta;
    style?: React.CSSProperties;
}


const ArticleMeta: React.FC<ArticleMetaProps> = ({ meta, style }: ArticleMetaProps) => {
    const lastTime = vo.cvtTime(new Date(meta.update_at));

    const aStyleName = css`
        font-size: 1.25em;

        color: black !important;
        :hover {
            text-decoration: underline !important;
        }
    `;

    return (
        <Card
            style={style}
        >
            <Row justify="center">
                <Link href="/articles/[key]" as={`/articles/${meta.article_key}`}>
                    <h1><a className={aStyleName} href={`/articles/${meta.article_key}`}>{meta.title}</a></h1>
                </Link>
            </Row>
            <Row justify="space-between" style={{ borderBottom: "1px solid #eaeaea", marginBottom: "1em" }}>
                <Space direction="horizontal"><span>作者：{meta.author}</span><span>时间：{lastTime}</span></Space>
                <span>标签：<Space direction="horizontal">{meta.tags.map(tag => (<span key={tag.id}>#{tag.name}</span>))}</Space></span>
            </Row>
            <Typography.Paragraph>
                {meta.summary}
            </Typography.Paragraph>
        </Card>
    );
};

export default ArticleMeta;
