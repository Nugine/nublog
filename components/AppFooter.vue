<template>
    <footer>
        <span>
            © 2019 - {{ new Date().getFullYear() }}
            <a class="space-around" href="https://github.com/Nugine/nublog" target="_blank"
                >Nugine/nublog</a
            >
        </span>
        <span>
            <a
                class="space-around beian"
                :href="beian.icp.url"
                target="_blank"
                rel="noopener noreferrer"
                >{{ beian.icp.text }}</a
            >
            <a
                class="space-around beian"
                :href="beian.gov.url"
                target="_blank"
                rel="noopener noreferrer"
                >{{ beian.gov.text }}</a
            >
        </span>
    </footer>
</template>

<style scoped>
footer {
    display: flex;
    justify-content: center;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: 0.5em;
    font-size: 0.8em;
}

.space-around {
    margin: 0 0.5em;
}

.beian {
    color: rgba(0, 0, 0, 0.65);
}
</style>

<script setup lang="ts">
import { useAppConfig } from "#app";
const beian = useAppConfig().beian;
</script>
