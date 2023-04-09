<template>
    <span :class="className" @click="handleClick">{{ message }}</span>
</template>

<style scoped>
.date-switch {
    cursor: pointer;
}
</style>

<script setup lang="ts">
import { computed, ref } from "#imports";

const props = defineProps<{
    postDate: string;
    editDate?: string;
}>();

const className = computed(() => ({
    "date-switch": props.editDate !== undefined,
}));

const showEditDate = ref(props.editDate !== undefined);

const handleClick = () => {
    if (props.editDate === undefined) {
        return;
    }
    showEditDate.value = !showEditDate.value;
};

const message = computed(() => {
    if (showEditDate.value) {
        return `编辑于 ${props.editDate}`;
    }
    return `发布于 ${props.postDate}`;
});
</script>
