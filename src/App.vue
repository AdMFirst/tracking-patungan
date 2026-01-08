<script setup>
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './ProtectedRoute.vue';
import 'vue-sonner/style.css'
</script>

<template>
    <div class="min-h-screen bg-background">
        <protected-route>
            <router-view />
        </protected-route>
        <Toaster position="top-center"/>
    </div>
</template>
