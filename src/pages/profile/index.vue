<template>
    <div class="min-h-screen bg-background p-4 pb-20 flex justify-center">
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
                            >{{ $t('pages.profile.index.memberSince') }}</span
                        >
                        <span class="text-sm font-medium">
                            {{ formatDate(user.created_at) }}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >{{ $t('pages.profile.index.lastSignIn') }}</span
                        >
                        <span class="text-sm font-medium">
                            {{ formatDate(user.last_sign_in_at) }}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >{{ $t('pages.profile.index.provider') }}</span
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
                        {{ $t('pages.profile.index.noUserInfo') }}
                    </p>
                </CardContent>
            </Card>

            <Button @click="openSettingsModal" class="w-full mb-4">
                <User class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.changeUsername') }}
            </Button>

            <Button @click="navigateToMyPayment" class="w-full mb-4">
                <CreditCard class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.managePaymentMethods') }}
            </Button>

            <Button @click="openLanguageModal" class="w-full mb-4">
                <Languages class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.changeLanguage') }}
            </Button>

            <Button
                @click="handleSignOut"
                :disabled="loading"
                variant="destructive"
                class="w-full"
            >
                <template v-if="loading">
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    {{ $t('pages.profile.index.signingOut') }}
                </template>
                <template v-else>
                    <LogOut class="mr-2 h-4 w-4" />
                    {{ $t('pages.profile.index.signOut') }}
                </template>
            </Button>
        </div>

        <SettingsModal
            :open="isSettingsModalOpen"
            @update:open="isSettingsModalOpen = $event"
            :user="userData"
            @save="handleSaveSettings"
        />

        <LanguageModal
            :open="isLanguageModalOpen"
            @update:open="isLanguageModalOpen = $event"
        />
    </div>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { ref, inject, computed } from 'vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import LanguageModal from '@/components/modals/LanguageModal.vue';
import { signOut } from '@/lib/auth';
import { updateUser } from '@/lib/auth';

// Import icons from lucide-vue-next
import { User, CreditCard, Languages, LogOut, Loader2 } from 'lucide-vue-next';

const { t } = useI18n();
const user = inject('user');
const router = useRouter();

const loading = ref(false);
const isSettingsModalOpen = ref(false);
const isLanguageModalOpen = ref(false);

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

const openLanguageModal = () => {
    isLanguageModalOpen.value = true;
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
