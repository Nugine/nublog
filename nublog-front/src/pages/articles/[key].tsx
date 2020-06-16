import React from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/dist/client/router";
import BlogError from "../../components/Error";

import * as vo from "../../vo";
import * as ssr from "../../api/ssr";

export type ArticleProps = {
    type: "ok";
    article: vo.Article;
} | {
    type: "error";
    statusCode: number;
}

const Article: React.FC<ArticleProps> = (props: ArticleProps) => {
    const router = useRouter();
    const articleKey = router.query.key;

    if (props.type === "ok") {
        return (
            <div>文章 页面 key = { articleKey}</div>
        );
    } else {
        return (
            <BlogError statusCode={props.statusCode} title="找不到文章" description="找不到文章" />
        );
    }


};

export const getServerSideProps: GetServerSideProps<ArticleProps> = async (ctx) => {
    const articleKey = ctx.params?.key;
    if (typeof articleKey !== "string") {
        throw new Error("unexpected type");
    }
    try {
        const article = await ssr.getArticleByKey(articleKey);
        return { props: { type: "ok", article } };
    } catch (e) {
        return { props: { type: "error", statusCode: e.response.status } };
    }
};

export default Article;
