<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-foreground">Welcome back!</h2>
        <p class="mt-2 text-sm text-muted-foreground">Your account information</p>
      </div>

      <div v-if="currentUser" class="bg-card p-6 rounded-lg border border-border shadow-sm">
        <!-- Discord User Display -->
        <div v-if="currentUser.user_metadata?.provider === 'discord'" class="flex items-center space-x-4 mb-6">
          <img
            :src="currentUser.user_metadata?.picture || currentUser.user_metadata?.avatar_url || `https://cdn.discordapp.com/embed/avatars/${parseInt(currentUser.user_metadata?.discriminator) % 5}.png`"
            :alt="currentUser.user_metadata?.full_name"
            class="w-16 h-16 rounded-full border-2 border-border"
          />
          <div>
            <h3 class="text-lg font-semibold text-foreground">
              {{ currentUser.user_metadata?.full_name || currentUser.user_metadata?.user_name }}
            </h3>
            <p class="text-sm text-muted-foreground">
              {{ currentUser.user_metadata?.user_name }}#{{ currentUser.user_metadata?.discriminator }}
            </p>
            <p class="text-xs text-muted-foreground">Connected via Discord</p>
          </div>
        </div>

        <!-- LinkedIn User Display -->
        <div v-else-if="currentUser.user_metadata?.provider === 'linkedin_oidc'" class="flex items-center space-x-4 mb-6">
          <img
            :src="currentUser.user_metadata?.picture || currentUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user_metadata?.full_name || 'User')}&size=128`"
            :alt="currentUser.user_metadata?.full_name"
            class="w-16 h-16 rounded-full border-2 border-border"
          />
          <div>
            <h3 class="text-lg font-semibold text-foreground">
              {{ currentUser.user_metadata?.full_name }}
            </h3>
            <p class="text-sm text-muted-foreground">
              {{ currentUser.user_metadata?.email }}
            </p>
            <p class="text-xs text-muted-foreground">Connected via LinkedIn</p>
          </div>
        </div>

        <!-- Email User Display -->
        <div v-else class="flex items-center space-x-4 mb-6">
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span class="text-2xl font-bold text-primary">
              {{ currentUser.user_metadata?.full_name?.charAt(0) || currentUser.email?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-foreground">
              {{ currentUser.user_metadata?.full_name || 'User' }}
            </h3>
            <p class="text-sm text-muted-foreground">{{ currentUser.email }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-border">
            <span class="text-sm text-muted-foreground">Member since</span>
            <span class="text-sm text-foreground">
              {{ new Date(currentUser.created_at).toLocaleDateString() }}
            </span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-border">
            <span class="text-sm text-muted-foreground">Last sign in</span>
            <span class="text-sm text-foreground">
              {{ new Date(currentUser.last_sign_in_at).toLocaleDateString() }}
            </span>
          </div>

          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-muted-foreground">Account status</span>
            <span class="text-sm text-green-600">Active</span>
          </div>

          <div v-if="currentUser.user_metadata?.provider === 'discord'" class="flex justify-between items-center py-2 border-t border-border">
            <span class="text-sm text-muted-foreground">Provider</span>
            <span class="text-sm text-blue-600">Discord</span>
          </div>

          <div v-else-if="currentUser.user_metadata?.provider === 'linkedin_oidc'" class="flex justify-between items-center py-2 border-t border-border">
            <span class="text-sm text-muted-foreground">Provider</span>
            <span class="text-sm text-blue-700">LinkedIn</span>
          </div>
        </div>
      </div>

      <div v-else class="bg-card p-6 rounded-lg border border-border shadow-sm text-center">
        <p class="text-muted-foreground">No user information available</p>
      </div>

      <button
        @click="handleSignOut"
        :disabled="loading"
        class="w-full py-2 px-4 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ loading ? 'Signing out...' : 'Sign Out' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch } from 'vue'

const user = inject('user')
const signOut = inject('signOut')

const currentUser = ref(user.value)
const loading = ref(false)

// Watch for user changes
watch(() => user.value, (newUser) => {
  console.debug('UserInfo received user update:', newUser)
  currentUser.value = newUser
}, { immediate: true })

const handleSignOut = async () => {
  loading.value = true
  try {
    await signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  } finally {
    loading.value = false
  }
}
</script>