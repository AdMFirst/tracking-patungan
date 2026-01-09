<template>
    <div class="min-h-screen bg-background p-4 flex justify-center">
        <div class="w-full max-w-sm space-y-6">
            <Card v-if="user">
                <UserAvatar
                    :userMetadata="user.user_metadata"
                    :provider="provider"
                />

                <CardContent class="space-y-1 pt-4">
                    <div
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >Member since</span
                        >
                        <span class="text-sm font-medium">
                            {{ formatDate(user.created_at) }}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >Last sign in</span
                        >
                        <span class="text-sm font-medium">
                            {{ formatDate(user.last_sign_in_at) }}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >Provider</span
                        >

                        <Badge
                            :class="{
                                'bg-[#5865F2] hover:bg-[#5865F2]/90':
                                    provider === 'discord',
                                'bg-[#0077B5] hover:bg-[#0077B5]/90':
                                    provider === 'linkedin_oidc',
                            }"
                        >
                            {{ providerLabel }}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card v-else>
                <CardContent class="p-6 text-center">
                    <p class="text-muted-foreground">
                        No user information available
                    </p>
                </CardContent>
            </Card>

            <Button @click="openSettingsModal" class="w-full mb-4">
                Change Username
            </Button>

            <Button @click="navigateToMyPayment" class="w-full mb-4">
                Manage Payment Methods
            </Button>

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

        <SettingsModal
            :open="isSettingsModalOpen"
            @update:open="isSettingsModalOpen = $event"
            :user="userData"
            @save="handleSaveSettings"
        />
    </div>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'vue-router';

import { ref, inject, computed } from 'vue';
import UserAvatar from '@/components/UserAvatar.vue';
import SettingsModal from '@/components/SettingsModal.vue';
import { signOut } from '@/lib/auth';
import { updateUser } from '@/lib/auth';

const user = inject('user');
const router = useRouter();

const loading = ref(false);
const isSettingsModalOpen = ref(false);

// User data for the settings modal
const userData = computed(() => ({
    username: user.value?.user_metadata?.full_name || '',
}));

// Provider from Supabase
const provider = computed(() => user.value?.app_metadata?.provider ?? null);

const providerLabel = computed(() => {
    if (provider.value === 'discord') return 'Discord';
    if (provider.value === 'linkedin_oidc') return 'LinkedIn';
    return 'Email';
});

console.log(user.value);
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const navigateToMyPayment = () => {
    router.push('/profile/mypayment');
};

const openSettingsModal = () => {
    isSettingsModalOpen.value = true;
};

const handleSaveSettings = async (updatedUser) => {
    try {
        await updateUser({ full_name: updatedUser.username });
        // Refresh user data or show success message
    } catch (error) {
        console.error('Failed to update user:', error);
    }
};

const handleSignOut = async () => {
    loading.value = true;
    try {
        await signOut();
    } finally {
        loading.value = false;
    }
};
</script>
