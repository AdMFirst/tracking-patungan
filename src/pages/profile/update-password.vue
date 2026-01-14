<template>
    <div class="min-h-screen flex items-center justify-center bg-background p-4">
        <div class="w-full max-w-md space-y-8">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-foreground">
                    {{ $t('pages.profile.updatePassword.title') }}
                </h2>
                <p class="mt-2 text-sm text-muted-foreground">
                    {{ $t('pages.profile.updatePassword.description') }}
                </p>
            </div>

            <form @submit.prevent="handleUpdatePassword" class="space-y-6">
                <div>
                    <label for="password" class="block text-sm font-medium text-foreground mb-1">
                        {{ $t('pages.profile.updatePassword.newPasswordLabel') }}
                    </label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        required
                        class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        :placeholder="$t('pages.profile.updatePassword.newPasswordPlaceholder')"
                    />
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-foreground mb-1">
                        {{ $t('pages.profile.updatePassword.confirmPasswordLabel') }}
                    </label>
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        required
                        class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        :placeholder="$t('pages.profile.updatePassword.confirmPasswordPlaceholder')"
                    />
                </div>

                <div v-if="error" class="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {{ error }}
                </div>

                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {{ loading ? $t('pages.profile.updatePassword.loading') : $t('pages.profile.updatePassword.updateButton') }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { updateUserPassword } from '@/lib/auth';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';

const { t } = useI18n();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const handleUpdatePassword = async () => {
    if (!password.value || !confirmPassword.value) return;

    if (password.value !== confirmPassword.value) {
        error.value = t('pages.profile.updatePassword.passwordsDoNotMatch');
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        await updateUserPassword(password.value);
        toast.success(t('pages.profile.updatePassword.successMessage'));
        router.push('/profile');
    } catch (err) {
        error.value = err.message || t('pages.profile.updatePassword.errorMessage');
    } finally {
        loading.value = false;
    }
};
</script>