<template>
    <AppLayout>
        <h1 style="text-align: center">{{ `${props.error.statusCode}  ${prompt}` }}</h1>
        <NuxtLink to="/">返回首页</NuxtLink>
    </AppLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ error: { statusCode: number } }>();
const prompt = computed(() => (props.error.statusCode === 404 ? "找不到页面" : "出现错误"));
</script>
