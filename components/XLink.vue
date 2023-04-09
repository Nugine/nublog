<template>
    <a :href="href" :alt="alt" :target="target" :rel="rel"><slot /></a>
</template>

<script setup lang="ts">
import type { NuxtLinkProps } from "#app";
import { computed } from "vue";

interface XLinkProps extends NuxtLinkProps {
    href: string;
    alt?: string;
    target?: string;
    rel?: string;
}

const props = defineProps<XLinkProps>();

const schemes = ["http", "https", "mailto"];
const isExternal = computed(() => schemes.some((scheme) => props.href.startsWith(scheme)));

const target = computed(() => {
    if (props.target !== undefined) {
        return props.target;
    }
    if (isExternal.value) {
        return "_blank";
    }
    return undefined;
});

const trustedPrefixes = ["https://github.com/Nugine", "https://nugine.xyz"];

const isUntrustedExternal = computed(() => {
    if (trustedPrefixes.some((prefix) => props.href.startsWith(prefix))) {
        return false;
    }
    return isExternal.value;
});

const rel = computed(() => {
    if (props.rel !== undefined) {
        return props.rel;
    }
    if (isUntrustedExternal.value) {
        return "noopener noreferrer";
    }
    return undefined;
});
</script>
