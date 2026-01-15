<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{{ $t('components.modals.UpdateEmailModal.title') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('components.modals.UpdateEmailModal.description') }}
                </DialogDescription>
            </DialogHeader>

            <form @submit.prevent="handleUpdateEmail" class="space-y-4">
                <div class="space-y-2">
                    <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {{ $t('components.modals.UpdateEmailModal.newEmailLabel') }}
                    </label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        required
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        :placeholder="$t('components.modals.UpdateEmailModal.newEmailPlaceholder')"
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
                        {{ loading ? $t('components.modals.UpdateEmailModal.loading') : $t('components.modals.UpdateEmailModal.updateButton') }}
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
import { updateUserEmail } from '@/lib/auth';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';

const props = defineProps(['open']);
const emit = defineEmits(['update:open']);
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
        toast.success(t('components.modals.UpdateEmailModal.successMessage'));
        email.value = '';
        emit('update:open', false);
    } catch (err) {
        error.value = err.message || t('components.modals.UpdateEmailModal.errorMessage');
    } finally {
        loading.value = false;
    }
};
</script>