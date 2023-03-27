<template>
    <div class="markdown-area">
        <slot />
    </div>
</template>

<style></style>

<script setup lang="ts">
import { MarkdownData } from "~~/modules/content/markdown";
import { useAppConfig, useHead } from "#imports";

import "~/assets/markdown.css";
import "katex/dist/katex.min.css";

const props = defineProps<{
    meta: MarkdownData["meta"];
}>();

const config = useAppConfig();

const pageTitle = `${props.meta.title} | ${config.siteTitle}`;
useHead({ title: pageTitle });
</script>
