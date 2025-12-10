<template>
  <div>
    <div class="min-h-screen bg-background p-4 pb-20">
      <div class="max-w-md mx-auto">
        <div class="text-center py-8">
          <h1 class="text-3xl font-bold text-foreground mb-4">Welcome!</h1>
          <p class="text-lg text-muted-foreground">This is your dashboard</p>
          <p class="text-sm text-muted-foreground mt-2">More features coming soon...</p>
        </div>
        
        <div class="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 class="text-xl font-semibold text-foreground mb-4">Dashboard Features</h2>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span class="text-sm text-muted-foreground">Track your expenses</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span class="text-sm text-muted-foreground">View analytics</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span class="text-sm text-muted-foreground">Manage budgets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, } from 'vue'

const user = inject('user')
</script>
