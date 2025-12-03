import { createApp, ref } from 'vue'
import './style.css'
import App from './App.vue'
import { routes } from 'vue-router/auto-routes'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './lib/supabaseClient'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const user = ref(null)

const signOutFn = async () => {
  await supabase.auth.signOut()
}

// Single source of truth
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email || 'no user')
  user.value = session?.user ?? null
})

const app = createApp(App)
app.provide('user', user)
app.provide('signOut', signOutFn)
app.use(router).mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.error('Service worker registration failed:', error))
  })
}
