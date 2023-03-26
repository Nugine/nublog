<template>
    <div>
        index
        <pre>{{ JSON.stringify(contents, null, 4) }}</pre>
    </div>
</template>

<script setup lang="ts">
import { queryContentAll } from "~~/composables/queryContent";

const contents = await queryContentAll();
</script>
