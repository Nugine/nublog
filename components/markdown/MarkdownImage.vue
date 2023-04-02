<template>
    <div style="text-align: center">
        <img :src="props.src" :alt="props.alt" :title="props.title" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    src?: string;
    alt?: string;
    title?: string;
}>();
</script>
