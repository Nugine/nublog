<template>
    <header>
        <NuxtLink href="/" class="hlink site-title">{{ siteTitle }}</NuxtLink>

        <span style="flex-grow: 1"></span>

        <NuxtLink href="/about" class="hlink">关于</NuxtLink>
    </header>
</template>

<style scoped>
header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5em;
    padding-bottom: 0.25em;
    border-bottom: 1px solid #e4e4e4;
}

.site-title {
    font-size: 1.25em;
}

.hlink {
    color: inherit;
    text-decoration: none;
}

.hlink:hover {
    color: var(--nublog-light-blue);
}
</style>

<script setup lang="ts">
import { useAppConfig } from "#app";
const siteTitle = useAppConfig().siteTitle;
</script>
