import React from "react";

import { Card, Row, Space, Typography } from "antd";
import Link from "next/link";
import { css } from "emotion";

import *  as vo from "../vo";

export interface ArticleMetaProps {
    meta: vo.ArticleMeta;
    timeStyle?: "simple" | "complex";
    style?: React.CSSProperties;
}


const ArticleMeta: React.FC<ArticleMetaProps> = ({ meta, timeStyle, style }: ArticleMetaProps) => {

    const aStyleName = css`
        font-size: 1.25em;

        color: black !important;
        :hover {
            text-decoration: underline !important;
        }
    `;

    let time;
    if (timeStyle === "complex") {
        time = (
            <>
                <span>创建于：{vo.cvtTime(new Date(meta.create_at))}</span>
                <span>更新于：{vo.cvtTime(new Date(meta.update_at))}</span>
            </>
        );
    } else {
        time = (<span>更新于：{vo.cvtTime(new Date(meta.update_at))}</span>);
    }

    let tags = null;
    if (meta.tags.length > 0) {
        tags = (
            <span>标签：<Space direction="horizontal">{meta.tags.map(tag => (
                <span key={tag.id}>#{tag.name}</span>)
            )}</Space></span>
        );
    }

    return (
        <Card
            style={{ cursor: "auto", ...style }}
            hoverable={true}
        >
            <Row justify="center">
                <Link href="/articles/[key]" as={`/articles/${meta.article_key}`}>
                    <h1><a className={aStyleName} href={`/articles/${meta.article_key}`}>{meta.title}</a></h1>
                </Link>
            </Row>
            <Row justify="space-between" style={{ borderBottom: "1px solid #eaeaea", marginBottom: "1em" }}>
                <Space direction="horizontal"><span>作者：{meta.author}</span>{time}</Space>
                {tags}
            </Row>
            <Typography.Paragraph>
                {meta.summary}
            </Typography.Paragraph>
        </Card>
    );
};

export default ArticleMeta;
