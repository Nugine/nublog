<template>
    <MarkdownArea>
        <slot />
    </MarkdownArea>
    <div class="bottom-bar">
        <span>
            <EditDate v-if="meta.postDate" :post-date="meta.postDate" :edit-date="meta.editDate" />
        </span>
        <span>
            <span>链接: <XLink :href="githubUrl">GitHub</XLink></span>

            <template v-for="link in links" :key="link.name">
                <!-- prettier-ignore -->
                <span>, <XLink :href="link.url">{{ link.name }}</XLink></span>
            </template>
        </span>
    </div>
</template>

<style scoped>
.bottom-bar {
    margin-top: 2em;

    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    color: #606060;
    border-bottom: 1px solid #e4e4e4;
}

.date-switch {
    cursor: pointer;
}

.space-left {
    margin-left: 0.25em;
}
</style>

<script setup lang="ts">
import { useAppConfig, useHead } from "#imports";

import { MarkdownMeta } from "~/modules/content/markdown";

import MarkdownArea from "./markdown/MarkdownArea.vue";
import EditDate from "./markdown/EditDate.vue";

const props = defineProps<{
    meta: MarkdownMeta;
}>();

const config = useAppConfig();
const pageTitle = `${props.meta.title} | ${config.siteTitle}`;
useHead({ title: pageTitle });

const githubRoot = "https://github.com/Nugine/nublog/tree/main/content";
const githubUrl = githubRoot + props.meta.filePath;

const links: Array<{ name: string; url: string }> = [];
if (props.meta.links !== undefined) {
    for (const [k, v] of Object.entries(props.meta.links)) {
        links.push({ name: k, url: v });
    }
}
</script>
