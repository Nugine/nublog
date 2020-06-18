import React, { useState } from "react";

import { css } from "emotion";
import { GetServerSideProps } from "next";
import { Spin, Alert } from "antd";

import * as vo from "../vo";
import * as ssr from "../api/ssr";
import * as csr from "../api/csr";
import ArticleMeta from "../components/ArticleMeta";

interface TagsProps {
    allTags: vo.Tag[];
}

function mergeArticles(lhs: vo.ArticleMeta[], rhs: vo.ArticleMeta[]): vo.ArticleMeta[] {
    const idSet = new Set<number>();
    const ans = [];
    for (const meta of lhs) {
        if (idSet.has(meta.id)) {
            continue;
        } else {
            idSet.add(meta.id);
            ans.push(meta);
        }
    }
    for (const meta of rhs) {
        if (idSet.has(meta.id)) {
            continue;
        } else {
            idSet.add(meta.id);
            ans.push(meta);
        }
    }
    return ans;
}

const TagsIndex: React.FC<TagsProps> = ({ allTags }: TagsProps) => {
    const [selectedTagsId, setSelectedTagsId] = useState<number[]>([]);

    const [articles, setArticles] = useState<vo.ArticleMeta[]>([]);

    const [loadingState, setLoadingState] = useState<vo.LoadingState>("initial");

    const handleSelect = async (checked: boolean, id: number): Promise<void> => {
        console.debug(checked, id);
        if (checked) {
            setSelectedTagsId(prev => {
                return [id, ...prev];
            });
            setLoadingState("loading");
            try {
                const ans = await csr.getTagArticles(id);
                setArticles(prev => mergeArticles(prev, ans));
                setLoadingState("success");
            } catch (err) {
                console.error(err);
                setLoadingState("error");
            }
        } else {
            setSelectedTagsId(prev => {
                return prev.filter((x) => x !== id);
            });
            setArticles(prev => {
                return prev.filter(x => !(x.tags.find(t => t.id === id)));
            });
        }
    };

    const tagsDivStyleName = css`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;
        width: "100%";

        span {
            cursor: pointer;
            margin: 0 0.5em;
            border: 1px solid gray;
            padding: 0 0.25em;
        }

        font-size: 1.25em;
    `;

    const renderTag = (tag: vo.Tag): JSX.Element => {
        const isSelected = selectedTagsId.includes(tag.id);
        const style = isSelected ? { color: "white", backgroundColor: "black" } : undefined;

        return (
            <span key={tag.id} style={style}
                onClick={(): Promise<void> => handleSelect(!isSelected, tag.id)}
            >
                {tag.name}
            </span>
        );
    };

    return (
        <div style={{ padding: "0 1em", marginTop: "1em" }}>
            <div className={tagsDivStyleName}>
                标签：
                {allTags.map(renderTag)}
            </div>
            {loadingState === "error" ?
                <Alert type="error" message="查询失败" banner />
                : null
            }
            <Spin spinning={loadingState === "loading"} delay={1000}>
                {articles.map(meta => (
                    <ArticleMeta key={meta.id} meta={meta} timeStyle="complex" />
                ))}
            </Spin>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<TagsProps> = async () => {
    const allTags = await ssr.getAllTags();
    return { props: { allTags } };
};

export default TagsIndex;