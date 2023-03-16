<template>
    <!-- 头部链接，用在 header, h1 等位置 -->
    <NuxtLink class="hlink" v-bind="props"><slot /></NuxtLink>
</template>

<style scoped>
.hlink {
    color: inherit;
    text-decoration: none;
}

.hlink:hover {
    color: var(--nublog-light-blue);
}
</style>

<script setup lang="ts">
import type { NuxtLinkProps } from "nuxt/dist/app/components/nuxt-link";

interface HLinkProps extends NuxtLinkProps {}

const props = defineProps<HLinkProps>();
</script>
