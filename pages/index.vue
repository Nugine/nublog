<template>
    <div class="content-list">
        <div v-for="c in articles" :key="c.urlPath" class="article">
            <div class="article-date">{{ c.meta.postDate }}</div>
            <div class="article-title">
                <NuxtLink :to="c.urlPath">{{ c.meta.title }}</NuxtLink>
            </div>
        </div>
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

.article-date {
    width: 100%;
    margin-bottom: 0.25em;
}

.article-title {
    width: 100%;
    font-size: 1.25rem;
}
</style>

<script setup lang="ts">
import { queryContentAll } from "~~/composables/queryContent";
import { cmp, reverse } from "~~/utils/cmp";
import { useAppConfig, useHead } from "#imports";

const articles = await queryContentAll({ urlPrefix: "/articles" });
articles.sort((lhs, rhs) => reverse(cmp)(lhs.meta.postDate, rhs.meta.postDate));

const config = useAppConfig();
useHead({ title: config.siteTitle });
</script>
