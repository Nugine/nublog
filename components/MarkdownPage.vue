<template>
    <div class="markdown-area">
        <slot />
    </div>
</template>

<style>
.markdown-area {
    width: 100%;
    max-width: 680px;
}

.markdown-area h1 {
    text-align: center;
}
</style>

<script setup lang="ts">
import { MarkdownData } from "~~/modules/content/markdown";
import { useAppConfig, useHead } from "#imports";

const props = defineProps<{
    meta: MarkdownData["meta"];
}>();

const config = useAppConfig();

const pageTitle = `${props.meta.title} | ${config.siteTitle}`;
useHead({ title: pageTitle });
</script>
