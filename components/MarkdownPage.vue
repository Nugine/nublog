<template>
    <MarkdownArea>
        <slot />
    </MarkdownArea>
    <div class="bottom-bar">
        <span>
            <span v-if="meta.postDate">发布于 {{ meta.postDate }}</span>
        </span>
        <span>
            <XLink :to="githubUrl" target="_blank">GitHub</XLink>
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
</style>

<script setup lang="ts">
import MarkdownArea from "./markdown/MarkdownArea.vue";
import { MarkdownMeta } from "~/modules/content/markdown";
import { useAppConfig, useHead } from "#imports";

const props = defineProps<{
    meta: MarkdownMeta;
}>();

const config = useAppConfig();
const pageTitle = `${props.meta.title} | ${config.siteTitle}`;
useHead({ title: pageTitle });

const githubRoot = "https://github.com/Nugine/nublog/tree/main/content";
const githubUrl = githubRoot + props.meta.filePath;
</script>
