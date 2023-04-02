<template>
    <MarkdownArea>
        <slot />
    </MarkdownArea>
</template>

<script setup lang="ts">
import MarkdownArea from "./markdown/MarkdownArea.vue";
import { MarkdownData } from "~/modules/content/markdown";
import { useAppConfig, useHead } from "#imports";

const props = defineProps<{ meta: MarkdownData["meta"] }>();

const config = useAppConfig();
const pageTitle = `${props.meta.title} | ${config.siteTitle}`;
useHead({ title: pageTitle });
</script>
