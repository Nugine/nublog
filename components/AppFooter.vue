<template>
    <footer>
        <span>
            <XLink href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh">CC BY-NC-SA 4.0</XLink>
        </span>
        <span class="space-around">
            © 2019 - {{ new Date().getFullYear() }}
            <XLink class="space-around" href="https://github.com/Nugine/nublog">Nugine/nublog</XLink>
        </span>
        <span>
            <XLink class="space-around beian" :href="beian.icp.url">{{ beian.icp.text }}</XLink>
            <XLink class="space-around beian" :href="beian.gov.url">{{ beian.gov.text }}</XLink>
        </span>
    </footer>
</template>

<style scoped>
footer {
    margin-bottom: 1em;
    font-size: 0.8em;

    display: flex;
    justify-content: center;
    align-items: baseline;
    flex-wrap: wrap;
}

.space-around {
    margin: 0 0.25em;
}

.beian {
    color: rgba(0, 0, 0, 0.65) !important;
}
</style>

<script setup lang="ts">
import { useAppConfig } from "#app";
const beian = useAppConfig().beian;
</script>
