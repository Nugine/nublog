<template>
    <AppHeader />
    <main>
        <NuxtPage />
    </main>
    <AppFooter />
</template>

<style>
@import "~/assets/global.css";
@import "~/assets/markdown.css";
</style>

<style scoped>
main {
    width: 100%;
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
