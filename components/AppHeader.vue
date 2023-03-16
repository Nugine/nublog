<template>
    <header>
        <HLink href="/" class="site-title">{{ siteTitle }}</HLink>

        <span style="flex-grow: 1"></span>

        <HLink href="/about">关于</HLink>
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
</style>

<script setup lang="ts">
import { useAppConfig } from "#app";
const siteTitle = useAppConfig().siteTitle;
</script>
