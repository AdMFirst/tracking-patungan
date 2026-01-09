<template>
    <LoadingScreen v-if="isLoading" />

    <div v-else>
        <template v-if="user">
            <router-view />
            <BottomNav />
        </template>

        <template v-else>
            <AuthForm />
        </template>
    </div>
</template>

<script setup>
import { inject, computed } from 'vue';
import { authReady } from '@/lib/auth'; // Import readiness state
import BottomNav from './components/BottomNav.vue';
import AuthForm from './components/AuthForm.vue';
import LoadingScreen from './components/LoadingScreen.vue';

const user = inject('user');

// Optional: Hide everything until the Router Guard finishes the first check
const isLoading = computed(() => !authReady.value);
</script>

