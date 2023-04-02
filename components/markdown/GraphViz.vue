<template>
    <div v-html="svg" style="text-align: center"></div>
</template>

<script setup lang="ts">
import { Graphviz, Engine } from "@hpcc-js/wasm/graphviz";
import { computed } from "vue";

const props = defineProps<{ dot: string; engine: Engine }>();

const graphviz = await Graphviz.load();

const svg = computed(() => graphviz.layout(props.dot, "svg", props.engine));
</script>
