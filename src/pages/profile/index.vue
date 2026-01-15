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
                        <span class="text-sm text-muted-foreground">{{
                            $t('pages.profile.index.memberSince')
                        }}</span>
                        <span class="text-sm font-medium">
                            {{ formatDate(user.created_at) }}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground">{{
                            $t('pages.profile.index.lastSignIn')
                        }}</span>
                        <span class="text-sm font-medium">
                            {{ formatDate(user.last_sign_in_at) }}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground">{{
                            $t('pages.profile.index.provider')
                        }}</span>

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

            <Button @click="navigateToMyPayment" class="w-full mb-4">
                <CreditCard class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.managePaymentMethods') }}
            </Button>

            <Button @click="openLanguageModal" class="w-full mb-4">
                <Languages class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.changeLanguage') }}
            </Button>

            <Separator />

            <Button @click="openSettingsModal" class="w-full mb-4">
                <User class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.changeUsername') }}
            </Button>

            <Button v-if="provider === 'email'" @click="openUpdateEmailModal" class="w-full mb-4">
                <Mail class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.changeEmail') }}
            </Button>

            <Button v-if="provider === 'email'" @click="openUpdatePasswordModal" class="w-full mb-4">
                <Lock class="mr-2 h-4 w-4" />
                {{ $t('pages.profile.index.changePassword') }}
            </Button>

            <Separator />

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

        <UpdateEmailModal
            :open="isUpdateEmailModalOpen"
            @update:open="isUpdateEmailModalOpen = $event"
        />

        <UpdatePasswordModal
            :open="isUpdatePasswordModalOpen"
            @update:open="isUpdatePasswordModalOpen = $event"
        />
    </div>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { ref, inject, computed, onMounted, watch } from 'vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import LanguageModal from '@/components/modals/LanguageModal.vue';
import UpdateEmailModal from '@/components/modals/UpdateEmailModal.vue';
import UpdatePasswordModal from '@/components/modals/UpdatePasswordModal.vue';
import { signOut } from '@/lib/auth';
import { updateUser } from '@/lib/auth';

// Import icons from lucide-vue-next
import { User, CreditCard, Languages, LogOut, Loader2, Lock, Mail } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { t } = useI18n();
const user = inject('user');
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const isSettingsModalOpen = ref(false);
const isLanguageModalOpen = ref(false);
const isUpdateEmailModalOpen = ref(false);
const isUpdatePasswordModalOpen = ref(false);

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

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const navigateToMyPayment = () => {
    router.push('/profile/mypayment');
};

const openUpdatePasswordModal = () => {
    isUpdatePasswordModalOpen.value = true;
};

const openUpdateEmailModal = () => {
    isUpdateEmailModalOpen.value = true;
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
        const error = await signOut();

        if (error) {
            toast.error(error.message);
        } else {
            router.push('/login');
        }
    } finally {
        loading.value = false;
    }
};

const checkHash = () => {
    const hash = route.hash;
    if (hash === '#update-password') {
        isUpdatePasswordModalOpen.value = true;
    } else if (hash === '#update-email') {
        isUpdateEmailModalOpen.value = true;
    }
};

onMounted(() => {
    checkHash();
});

watch(() => route.hash, checkHash);
</script>
