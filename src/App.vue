<script setup>
import ProtectedRoute from './ProtectedRoute.vue';

</script>

<template>
  <div class="min-h-screen bg-background">
    <protected-route>
      <router-view />
    </protected-route>
  </div>
</template>
