<template>
    <button
        class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary hover:opacity-90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out border border-border"
        @click="$emit('click')"
    >
        <slot>
            <Plus class="w-6 h-6" />
        </slot>
    </button>
</template>

<script setup>
import { Plus } from 'lucide-vue-next';

defineEmits(['click']);
</script>

<style scoped>
/* 4-space indent and minimal styling maintained */
</style>