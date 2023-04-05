<template>
    <MarkdownArea>
        <slot />
    </MarkdownArea>
    <div class="bottom-bar">
        <span v-if="meta.postDate">发布于 {{ meta.postDate }}</span>
    </div>
</template>

<style scoped>
.bottom-bar {
    margin-top: 2em;

    width: 100%;
    display: flex;
    justify-content: flex-start;

    color: #606060;
    border-bottom: 1px solid #e4e4e4;
}
</style>

<script setup lang="ts">
import MarkdownArea from "./markdown/MarkdownArea.vue";
import { MarkdownData } from "~/modules/content/markdown";
import { useAppConfig, useHead } from "#imports";

const props = defineProps<{
    meta: MarkdownData["meta"];
}>();

const config = useAppConfig();
const pageTitle = `${props.meta.title} | ${config.siteTitle}`;
useHead({ title: pageTitle });
</script>
