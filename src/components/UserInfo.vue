<template>
    <div
        class="min-h-screen flex items-center justify-center bg-background p-4"
    >
        <div class="w-full max-w-md space-y-6">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-foreground">
                    {{ $t('components.UserInfo.welcomeBack') }}
                </h2>
                <p class="mt-2 text-sm text-muted-foreground">
                    {{ $t('components.UserInfo.accountInfo') }}
                </p>
            </div>

            <div
                v-if="currentUser"
                class="bg-card p-6 rounded-lg border border-border shadow-sm"
            >
                <!-- Discord User Display -->
                <div
                    v-if="currentUser.user_metadata?.provider === 'discord'"
                    class="flex items-center space-x-4 mb-6"
                >
                    <img
                        :src="
                            currentUser.user_metadata?.picture ||
                            currentUser.user_metadata?.avatar_url ||
                            `https://cdn.discordapp.com/embed/avatars/${parseInt(currentUser.user_metadata?.discriminator) % 5}.png`
                        "
                        :alt="currentUser.user_metadata?.full_name"
                        class="w-16 h-16 rounded-full border-2 border-border"
                    />
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">
                            {{
                                currentUser.user_metadata?.full_name ||
                                currentUser.user_metadata?.user_name
                            }}
                        </h3>
                        <p class="text-sm text-muted-foreground">
                            {{ currentUser.user_metadata?.user_name }}#{{
                                currentUser.user_metadata?.discriminator
                            }}
                        </p>
                        <p class="text-xs text-muted-foreground">
                            {{ $t('components.UserInfo.connectedViaDiscord') }}
                        </p>
                    </div>
                </div>

                <!-- LinkedIn User Display -->
                <div
                    v-else-if="
                        currentUser.user_metadata?.provider === 'linkedin_oidc'
                    "
                    class="flex items-center space-x-4 mb-6"
                >
                    <img
                        :src="
                            currentUser.user_metadata?.picture ||
                            currentUser.user_metadata?.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user_metadata?.full_name || $t('components.UserInfo.defaultUser'))}&size=128`
                        "
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
                        <p class="text-xs text-muted-foreground">
                            {{ $t('components.UserInfo.connectedViaLinkedIn') }}
                        </p>
                    </div>
                </div>

                <!-- Email User Display -->
                <div v-else class="flex items-center space-x-4 mb-6">
                    <div
                        class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                    >
                        <span class="text-2xl font-bold text-primary">
                            {{
                                currentUser.user_metadata?.full_name?.charAt(
                                    0
                                ) || currentUser.email?.charAt(0).toUpperCase()
                            }}
                        </span>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">
                            {{ currentUser.user_metadata?.full_name || $t('components.UserInfo.defaultUser') }}
                        </h3>
                        <p class="text-sm text-muted-foreground">
                            {{ currentUser.email }}
                        </p>
                    </div>
                </div>

                <div class="space-y-3">
                    <div
                        class="flex justify-between items-center py-2 border-b border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >{{ $t('components.UserInfo.memberSince') }}</span
                        >
                        <span class="text-sm text-foreground">
                            {{
                                d(new Date(currentUser.created_at), { dateStyle: 'medium' })
                            }}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center py-2 border-b border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >{{ $t('components.UserInfo.lastSignIn') }}</span
                        >
                        <span class="text-sm text-foreground">
                            {{
                                d(new Date(currentUser.last_sign_in_at), { dateStyle: 'medium' })
                            }}
                        </span>
                    </div>

                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-muted-foreground"
                            >{{ $t('components.UserInfo.accountStatus') }}</span
                        >
                        <span class="text-sm text-green-600">{{ $t('components.UserInfo.activeStatus') }}</span>
                    </div>

                    <div
                        v-if="currentUser.user_metadata?.provider === 'discord'"
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >{{ $t('components.UserInfo.provider') }}</span
                        >
                        <span class="text-sm text-blue-600">{{ $t('components.UserInfo.discord') }}</span>
                    </div>

                    <div
                        v-else-if="
                            currentUser.user_metadata?.provider ===
                            'linkedin_oidc'
                        "
                        class="flex justify-between items-center py-2 border-t border-border"
                    >
                        <span class="text-sm text-muted-foreground"
                            >{{ $t('components.UserInfo.provider') }}</span
                        >
                        <span class="text-sm text-blue-700">{{ $t('components.UserInfo.linkedIn') }}</span>
                    </div>
                </div>
            </div>

            <div
                v-else
                class="bg-card p-6 rounded-lg border border-border shadow-sm text-center"
            >
                <p class="text-muted-foreground">
                    {{ $t('components.UserInfo.noUserInfo') }}
                </p>
            </div>

            <button
                @click="handleSignOut"
                :disabled="loading"
                class="w-full py-2 px-4 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {{ loading ? $t('components.UserInfo.signingOut') : $t('components.UserInfo.signOut') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, d } = useI18n();
const user = inject('user');
const signOut = inject('signOut');

const currentUser = ref(user.value);
const loading = ref(false);

// Watch for user changes
watch(
    () => user.value,
    (newUser) => {
        console.debug('UserInfo received user update:', newUser);
        currentUser.value = newUser;
    },
    { immediate: true }
);

const handleSignOut = async () => {
    loading.value = true;
    try {
        await signOut();
    } catch (error) {
        console.error('Error signing out:', error);
    } finally {
        loading.value = false;
    }
};
</script>
