// src/lib/authState.js
import { ref } from 'vue'
import { supabase } from './supabaseClient'

export const user = ref(null)
export const authReady = ref(false)

export const initAuth = async () => {
    if (authReady.value) return // Already ran? Skip.

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    authReady.value = true

    // Listen for changes
    supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
    })
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  return error
}

export async function updateUser(userData) {
  const { data, error } = await supabase.auth.updateUser({
    data: userData
  })
  if (error) {
    throw error
  }
  return data
}