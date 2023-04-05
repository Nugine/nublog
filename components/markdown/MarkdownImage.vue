<template>
    <img :src="src" :alt="alt" :title="title" />
</template>

<style scoped>
img {
    display: block;
    margin: auto;
}
</style>

<script setup lang="ts">
defineProps<{
    src?: string;
    alt?: string;
    title?: string;
}>();
</script>
