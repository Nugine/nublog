<template>
    <slot />
</template>

<style>
@import "~/assets/markdown.css";
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
