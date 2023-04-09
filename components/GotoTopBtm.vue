<template>
    <Teleport to="body">
        <div class="gtb wide-only" v-show="show">
            <div class="btn icon-btn" title="前往顶部" @click="gotoTop">
                <GotoTop theme="filled" size="28" fill="#555" :stroke-width="3" />
            </div>
            <div class="btn icon-btn" title="前往底部" @click="gotoBtm">
                <GotoBtm theme="filled" size="28" fill="#555" :stroke-width="3" />
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.gtb {
    position: fixed;
    right: 2em;
    bottom: 2em;

    display: flex;
    flex-direction: column;
}

@media screen and (max-width: 800px) {
    .wide-only {
        display: none;
    }
}

.icon-btn {
    margin: 0.25em 0;
    padding: 0;

    width: 32px;
    height: 32px;

    display: flex;
    justify-content: center;
    align-items: center;
}
</style>

<script setup lang="ts">
import GotoTop from "@icon-park/vue-next/es/icons/ToTopOne";
import GotoBtm from "@icon-park/vue-next/es/icons/ToBottomOne";
import "@icon-park/vue-next/styles/index.css";

import { ref, onMounted, onUnmounted } from "vue";

const gotoTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

const gotoBtm = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
    });
};

const needsShow = () => document.body.scrollHeight > window.innerHeight * 1.5;
const show = ref(needsShow());

const resize = new ResizeObserver(() => (show.value = needsShow()));
onMounted(() => resize.observe(document.body));
onUnmounted(() => resize.disconnect());
</script>
