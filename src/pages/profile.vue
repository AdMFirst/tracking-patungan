<template>
  <div class="min-h-screen bg-background p-4 flex justify-center">
    <div class="w-full max-w-sm space-y-6">

      <Card v-if="user">
        <UserAvatar :userMetadata="user.user_metadata" :provider="provider"/>

        <CardContent class="space-y-1 pt-4">
          <div class="flex justify-between items-center py-2 border-t border-border">
            <span class="text-sm text-muted-foreground">Member since</span>
            <span class="text-sm font-medium">
              {{ formatDate(user.created_at) }}
            </span>
          </div>

          <div class="flex justify-between items-center py-2 border-t border-border">
            <span class="text-sm text-muted-foreground">Last sign in</span>
            <span class="text-sm font-medium">
              {{ formatDate(user.last_sign_in_at) }}
            </span>
          </div>

          <div class="flex justify-between items-center py-2 border-t border-border">
            <span class="text-sm text-muted-foreground">Provider</span>

            <Badge
              :class="{
                'bg-[#5865F2] hover:bg-[#5865F2]/90': provider === 'discord',
                'bg-[#0077B5] hover:bg-[#0077B5]/90': provider === 'linkedin_oidc',
              }"
            >
              {{ providerLabel }}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card v-else>
        <CardContent class="p-6 text-center">
          <p class="text-muted-foreground">No user information available</p>
        </CardContent>
      </Card>

      <Button
        @click="handleSignOut"
        :disabled="loading"
        variant="destructive"
        class="w-full"
      >
        <template v-if="loading">Signing out...</template>
        <template v-else>Sign Out</template>
      </Button>
    </div>
  </div>
</template>

<script setup>
import {
  Card, CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { ref, inject, computed } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { signOut } from '@/lib/auth'

const user = inject('user')

const loading = ref(false)

// Provider from Supabase
const provider = computed(() => user.value?.app_metadata?.provider ?? null)

const providerLabel = computed(() => {
  if (provider.value === 'discord') return 'Discord'
  if (provider.value === 'linkedin_oidc') return 'LinkedIn'
  return 'Email'
})


console.log(user.value)
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString() : '—'

const handleSignOut = async () => {
  loading.value = true
  try {
    await signOut()
  } finally {
    loading.value = false
  }
}
</script>
