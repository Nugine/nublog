<template>
    <AppHeader />
    <main>
        <slot />
    </main>
    <AppFooter />
</template>

<style scoped>
main {
    width: 100%;
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    align-items: center;

    margin-bottom: 1em;
}
</style>

<script setup lang="ts">
import "~/assets/global.css";
</script>
