<template>
    <div class="content-list">
        <template v-for="[month, group] in groups.entries()" :key="month">
            <div style="width: 100%">
                <h2>{{ displayMonth(month) }}</h2>
            </div>
            <div v-for="c in group" :key="c.urlPath" class="article">
                <div class="article-date" v-if="c.postDate">
                    <span>{{ c.postDate }}</span>
                </div>
                <div class="article-title">
                    <NuxtLink :to="c.urlPath">{{ c.title }}</NuxtLink>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.content-list {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.article {
    width: 100%;
    max-width: 500px;

    margin: 1em 0;
}

@media screen and (max-width: 600px) {
    .article-date {
        display: block;
        width: 100%;
        margin-bottom: 0.25em;
    }

    .article-title {
        width: 100%;
        font-size: 1.25rem;
    }
}

@media screen and (min-width: 601px) {
    .article-date {
        display: inline-block;
        margin-right: 1em;
    }

    .article-title {
        display: inline-block;
        font-size: 1.25rem;
    }

    .article {
        display: flex;
        align-items: baseline;
    }
}
</style>

<script setup lang="ts">
import { queryContentAll } from "~~/composables/queryContent";
import { useAppConfig, useHead } from "#imports";
import type { MarkdownMeta } from "~~/modules/content/markdown";

const config = useAppConfig();
useHead({
    title: config.siteTitle,
    meta: [{ name: "baidu-site-verification", content: "codeva-6YbFV08Cdk" }], // 百度网站所有权验证
});

const articles = await queryContentAll({ urlPrefix: "/articles" });

const groups = new Map<string, MarkdownMeta[]>();
for (const article of articles) {
    const month = article.postDate!.slice(0, 7);
    if (!groups.has(month)) {
        groups.set(month, []);
    }
    groups.get(month)?.push(article);
}

function displayMonth(month: string): string {
    const [year, m] = month.split("-").map(Number);
    return `${year} 年 ${m} 月`;
}
</script>
