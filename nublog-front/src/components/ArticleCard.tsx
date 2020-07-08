import React from "react";

import { Card, Row } from "antd";
import Link from "next/link";

import *  as vo from "../vo";
import { LINK_STYLE_NAME } from "../styles/local";

export interface ArticleCardProps {
    article: vo.Article;
    style?: React.CSSProperties;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, style }: ArticleCardProps) => {
    return (
        <Card
            style={{ cursor: "auto", ...style }}
            hoverable={true}
        >
            <Row justify="center">
                <Link href="/articles/[key]" as={`/articles/${article.url_key}`}>
                    <h1 className={LINK_STYLE_NAME}>
                        <a href={`/articles/${article.url_key}`}>
                            {article.title}
                        </a>
                    </h1>
                </Link>
            </Row>
            <Row justify="space-between" style={{ borderBottom: "1px solid #eaeaea", marginBottom: "1em" }}>
                <span>作者：{article.author}</span>
                <span>时间：{vo.fmtTime(new Date(article.updated_at), true)}</span>
            </Row>
            <Row>
                {article.summary}
            </Row>
        </Card>
    );
};

export default ArticleCard;
