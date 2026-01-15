<template>
    <div
        class="min-h-screen flex items-center justify-center bg-background p-4 relative"
    >
        <button
            @click="showLanguageModal = true"
            class="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-muted transition-colors text-secondary-foreground"
        >
            <Languages class="w-5 h-5" />
        </button>

        <div class="w-full max-w-md space-y-8">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-foreground">
                    {{
                        isLogin
                            ? $t('components.auth.AuthForm.signInTitle')
                            : $t('components.auth.AuthForm.createAccountTitle')
                    }}
                </h2>
                <p class="mt-2 text-sm text-muted-foreground">
                    {{
                        isLogin
                            ? $t('components.auth.AuthForm.noAccount')
                            : $t('components.auth.AuthForm.haveAccount')
                    }}
                    <button
                        @click="toggleAuthMode"
                        class="font-medium text-primary hover:underline"
                    >
                        {{
                            isLogin
                                ? $t('components.auth.AuthForm.signUp')
                                : $t('components.auth.AuthForm.signIn')
                        }}
                    </button>
                </p>
            </div>

            <!-- OAuth Providers Section -->
            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-border"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-background text-muted-foreground">{{
                        $t('components.auth.AuthForm.orContinueWith')
                    }}</span>
                </div>
            </div>

            <!-- OAuth Buttons Grid -->
            <div class="grid grid-cols-2 gap-3">
                <button
                    @click="handleDiscordLogin"
                    :disabled="loading"
                    class="py-2 px-4 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                    <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
                        />
                    </svg>
                    <span>Discord</span>
                </button>

                <button
                    @click="handleLinkedInLogin"
                    :disabled="loading"
                    class="py-2 px-4 bg-[#0077B5] text-white rounded-md hover:bg-[#005885] focus:outline-none focus:ring-2 focus:ring-[#0077B5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                    <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        />
                    </svg>
                    <span>LinkedIn</span>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <div class="space-y-4">
                    <div>
                        <label
                            for="email"
                            class="block text-sm font-medium text-foreground mb-1"
                        >
                            {{ $t('components.auth.AuthForm.emailLabel') }}
                        </label>
                        <input
                            id="email"
                            v-model="formData.email"
                            type="email"
                            required
                            class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                            :placeholder="
                                $t('components.auth.AuthForm.emailPlaceholder')
                            "
                        />
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label
                                for="password"
                                class="text-sm font-medium text-foreground"
                            >
                                {{
                                    $t('components.auth.AuthForm.passwordLabel')
                                }}
                            </label>
                            <button
                                v-if="isLogin"
                                type="button"
                                @click="handlePasswordReset"
                                class="text-sm font-medium text-primary hover:underline focus:outline-none"
                            >
                                {{
                                    $t(
                                        'components.auth.AuthForm.forgotPassword'
                                    )
                                }}
                            </button>
                        </div>
                        <input
                            id="password"
                            v-model="formData.password"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                            :placeholder="
                                $t(
                                    'components.auth.AuthForm.passwordPlaceholder'
                                )
                            "
                        />
                        <button
                            type="button"
                            @click="showPassword = !showPassword"
                            class="mt-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                            {{
                                showPassword
                                    ? $t(
                                          'components.auth.AuthForm.hidePassword'
                                      )
                                    : $t(
                                          'components.auth.AuthForm.showPassword'
                                      )
                            }}
                        </button>
                    </div>

                    <div v-if="!isLogin">
                        <label
                            for="name"
                            class="block text-sm font-medium text-foreground mb-1"
                        >
                            {{ $t('components.auth.AuthForm.fullNameLabel') }}
                        </label>
                        <input
                            id="name"
                            v-model="formData.name"
                            type="text"
                            required
                            class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                            :placeholder="
                                $t(
                                    'components.auth.AuthForm.fullNamePlaceholder'
                                )
                            "
                        />
                    </div>
                </div>

                <div
                    v-if="error"
                    class="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
                >
                    {{ error }}
                </div>

                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {{
                        loading
                            ? $t('components.auth.AuthForm.loading')
                            : isLogin
                              ? $t('components.auth.AuthForm.signInButton')
                              : $t('components.auth.AuthForm.signUpButton')
                    }}
                </button>
            </form>
        </div>

        <LanguageModal v-model:open="showLanguageModal" />
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { supabase } from '../../lib/supabaseClient';
import { resetPassword } from '../../lib/auth';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import LanguageModal from '../modals/LanguageModal.vue';
import { Languages } from 'lucide-vue-next';

const { t } = useI18n();

const isLogin = ref(true);
const showLanguageModal = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const error = ref('');

const formData = reactive({
    email: '',
    password: '',
    name: '',
});

const toggleAuthMode = () => {
    isLogin.value = !isLogin.value;
    error.value = '';
    formData.email = '';
    formData.password = '';
    formData.name = '';
};

const handleSubmit = async () => {
    loading.value = true;
    error.value = '';

    try {
        if (isLogin.value) {
            const { data, error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

            if (signInError) throw signInError;
            console.log('Sign in successful:', data);
        } else {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                    },
                },
            });

            if (signUpError) throw signUpError;
            console.log('Sign up successful:', data);
            toast.success(t('components.auth.AuthForm.signUpSuccess'));
        }
    } catch (err) {
        error.value = err.message || t('components.auth.AuthForm.genericError');
    } finally {
        loading.value = false;
    }
};

const handlePasswordReset = async () => {
    if (!formData.email) {
        error.value = t('components.auth.AuthForm.enterEmailForPasswordReset');
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        await resetPassword(formData.email);
        toast.success(t('components.auth.AuthForm.passwordResetEmailSent'));
    } catch (err) {
        error.value =
            err.message ||
            t('components.auth.AuthForm.passwordResetError');
    } finally {
        loading.value = false;
    }
};

const handleDiscordLogin = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth(
            {
                provider: 'discord',
                options: {
                    redirectTo: window.location.origin,
                },
            }
        );

        if (oauthError) throw oauthError;
        console.log('Discord login initiated:', data);
    } catch (err) {
        error.value =
            err.message || t('components.auth.AuthForm.discordLoginError');
    } finally {
        loading.value = false;
    }
};

const handleLinkedInLogin = async () => {
    loading.value = true;
    error.value = '';

    try {
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth(
            {
                provider: 'linkedin_oidc',
                options: {
                    redirectTo: window.location.origin,
                },
            }
        );

        if (oauthError) throw oauthError;
        console.log('LinkedIn login initiated:', data);
    } catch (err) {
        error.value =
            err.message || t('components.auth.AuthForm.linkedInLoginError');
    } finally {
        loading.value = false;
    }
};
</script>
