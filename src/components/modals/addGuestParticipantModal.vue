<template>
    <Dialog :open="isOpen" @update:open="handleDialogUpdate">
        <DialogContent class="sm:max-w-[425px] overflow-hidden">
            <DialogHeader class="min-w-0">
                <DialogTitle class="break-words">
                {{
                    $t('components.modals.AddGuestParticipantModal.title')
                }}</DialogTitle>
                <DialogDescription class="break-words">
                    {{ $t('components.modals.AddGuestParticipantModal.description') }}
                </DialogDescription>
            </DialogHeader>
            <form @submit.prevent="handleSubmit" class="min-w-0 space-y-4">
                <Field class="min-w-0 space-y-2">
                    <FieldLabel for="guestNameEmail" class="break-words">{{
                        $t('components.modals.AddGuestParticipantModal.guestNameEmailLabel')
                    }}</FieldLabel>
                    <Input
                        id="guestNameEmail"
                        v-model="formData"
                        class="min-w-0"
                        :placeholder="
                            $t(
                                'components.modals.AddGuestParticipantModal.guestNameEmailPlaceholder'
                            )
                        "
                        required
                    />
                </Field>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        @click="handleCancel"
                    >
                        {{
                            $t(
                                'components.modals.AddGuestParticipantModal.cancelButton'
                            )
                        }}
                    </Button>
                    <Button type="submit">
                        {{
                            $t(
                                'components.modals.AddGuestParticipantModal.addItemButton'
                            )
                        }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from 'vue-i18n';
import { Field, FieldDescription, FieldLabel } from '../ui/field';

const { t } = useI18n();

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    }
});

const emit = defineEmits(['update:open', 'participantAdded']);

const formData = ref("");

const handleDialogUpdate = (open) => {
    emit('update:open', open);
    if (!open) {
        // Reset form when dialog closes
        formData.value = "";
    }
};

const handleCancel = () => {
    emit('update:open', false);
};

const handleSubmit = () => {
    emit('participantAdded', formData.value);
    emit('update:open', false);

    // Reset form
    formData.value = "";
};
</script>