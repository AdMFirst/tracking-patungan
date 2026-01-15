<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{{ $t('components.modals.UpdatePasswordModal.title') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('components.modals.UpdatePasswordModal.description') }}
                </DialogDescription>
            </DialogHeader>

            <form @submit.prevent="handleUpdatePassword" class="space-y-4">
                <div class="space-y-2">
                    <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {{ $t('components.modals.UpdatePasswordModal.newPasswordLabel') }}
                    </label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        :placeholder="$t('components.modals.UpdatePasswordModal.newPasswordPlaceholder')"
                    />
                </div>

                <div class="space-y-2">
                    <label for="confirmPassword" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {{ $t('components.modals.UpdatePasswordModal.confirmPasswordLabel') }}
                    </label>
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        :placeholder="$t('components.modals.UpdatePasswordModal.confirmPasswordPlaceholder')"
                    />
                </div>

                <div v-if="error" class="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                    {{ error }}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" @click="$emit('update:open', false)">
                        {{ $t('pages.profile.index.cancel') }}
                    </Button>
                    <Button type="submit" :disabled="loading">
                        {{ loading ? $t('components.modals.UpdatePasswordModal.loading') : $t('components.modals.UpdatePasswordModal.updateButton') }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { updateUserPassword } from '@/lib/auth';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';

const props = defineProps(['open']);
const emit = defineEmits(['update:open']);
const { t } = useI18n();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const handleUpdatePassword = async () => {
    if (!password.value || !confirmPassword.value) return;

    if (password.value !== confirmPassword.value) {
        error.value = t('components.modals.UpdatePasswordModal.passwordsDoNotMatch');
        return;
    }

    loading.value = true;
    error.value = '';

    try {
        await updateUserPassword(password.value);
        toast.success(t('components.modals.UpdatePasswordModal.successMessage'));
        password.value = '';
        confirmPassword.value = '';
        emit('update:open', false);
    } catch (err) {
        error.value = err.message || t('components.modals.UpdatePasswordModal.errorMessage');
    } finally {
        loading.value = false;
    }
};
</script>