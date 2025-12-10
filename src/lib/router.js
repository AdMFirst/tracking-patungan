// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes' // assuming unplugin-vue-router
import { user, authReady, initAuth } from './auth'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
    // 1. If we haven't checked Supabase yet, wait for it here
    if (!authReady.value) {
        await initAuth()
    }

    // 2. Standard Guard Logic
    if (to.meta.requiresAuth && !user.value) {
        next('/login') // or strictly return false if you use your Gatekeeper component
    } else {
        next()
    }
})

export default router