<template>
    <div 
        v-if="isLoading" 
        class="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]"
    >
        <Spinner class="w-8 h-8 text-primary" />
        <p class="mt-2 text-sm text-muted-foreground">Loading application...</p>
    </div>

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
import { inject, computed } from 'vue'
import { authReady } from '@/lib/auth' // Import readiness state
import BottomNav from './components/BottomNav.vue'
import AuthForm from './components/AuthForm.vue'
import { Spinner } from './components/ui/spinner'

const user = inject('user')

// Optional: Hide everything until the Router Guard finishes the first check
const isLoading = computed(() => !authReady.value)
</script>