<template>
    <div class="min-h-screen flex items-center justify-center bg-background p-4">
        <div class="w-full max-w-md space-y-8">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-foreground">
                    {{ $t('pages.profile.updateEmail.title') }}
                </h2>
                <p class="mt-2 text-sm text-muted-foreground">
                    {{ $t('pages.profile.updateEmail.description') }}
                </p>
            </div>

            <form @submit.prevent="handleUpdateEmail" class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-foreground mb-1">
                        {{ $t('pages.profile.updateEmail.newEmailLabel') }}
                    </label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        required
                        class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        :placeholder="$t('pages.profile.updateEmail.newEmailPlaceholder')"
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
                    {{ loading ? $t('pages.profile.updateEmail.loading') : $t('pages.profile.updateEmail.updateButton') }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { updateUserEmail } from '@/lib/auth';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';

const { t } = useI18n();

const email = ref('');
const loading = ref(false);
const error = ref('');

const handleUpdateEmail = async () => {
    if (!email.value) return;

    loading.value = true;
    error.value = '';

    try {
        await updateUserEmail(email.value);
        toast.success(t('pages.profile.updateEmail.successMessage'));
        email.value = ''; // Clear input on success
    } catch (err) {
        error.value = err.message || t('pages.profile.updateEmail.errorMessage');
    } finally {
        loading.value = false;
    }
};
</script>