<template>
    <LoadingScreen v-if="isLoading" />

    <div v-else>
        <router-view />
        <BottomNav v-if="user" />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { user, authReady } from '@/lib/auth'; // Import user and readiness state directly
import BottomNav from '@/components/common/BottomNav.vue';
import LoadingScreen from '@/components/common/LoadingScreen.vue';

// Optional: Hide everything until the Router Guard finishes the first check
const isLoading = computed(() => !authReady.value);
</script>
