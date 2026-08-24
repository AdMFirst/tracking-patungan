<template>
    <Dialog :open="showModal" @update:open="$emit('update:open', $event)">
        <DialogContent class="sm:max-w-[425px]">
            <template v-if="!showDeleteConfirm">
                <DialogHeader>
                    <DialogTitle>{{
                        $t('components.modals.CloseRoomModal.title')
                    }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('components.modals.CloseRoomModal.description') }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-2">
                    <div class="space-y-2">
                        <Label for="finalTotal">{{
                            $t(
                                'components.modals.CloseRoomModal.finalTotalLabel'
                            )
                        }}</Label>
                        <Input
                            id="finalTotal"
                            v-model="finalTotal"
                            type="number"
                            :placeholder="
                                $t(
                                    'components.modals.CloseRoomModal.finalTotalPlaceholder'
                                )
                            "
                        />
                        <p v-if="errorMessage" class="text-sm text-destructive font-medium">
                            {{ errorMessage }}
                        </p>
                    </div>
                </div>
                <DialogFooter class="flex sm:justify-between pt-4">
                    <Button
                        @click="$emit('update:open', false)"
                        variant="ghost"
                        class="w-full sm:w-auto"
                    >
                        {{
                            $t('components.modals.CloseRoomModal.cancelButton')
                        }}
                    </Button>
                    <Button
                        @click="handleDelete"
                        variant="destructive"
                        class="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        {{
                            $t(
                                'components.modals.CloseRoomModal.deleteRoomButton'
                            )
                        }}
                    </Button>
                    <Button
                        @click="handleSubmit"
                        class="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        {{
                            $t('components.modals.CloseRoomModal.submitButton')
                        }}
                    </Button>
                </DialogFooter>
            </template>

            <!-- Delete Confirmation -->
            <template v-else>
                <DialogHeader>
                    <DialogTitle>{{
                        $t(
                            'components.modals.CloseRoomModal.deleteConfirmTitle'
                        )
                    }}</DialogTitle>
                    <DialogDescription>
                        {{
                            $t(
                                'components.modals.CloseRoomModal.deleteConfirmDescription'
                            )
                        }}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter class="flex sm:justify-end gap-2 pt-4">
                    <Button
                        @click="showDeleteConfirm = false"
                        variant="outline"
                        class="w-full sm:w-auto"
                    >
                        {{
                            $t(
                                'components.modals.CloseRoomModal.deleteCancelButton'
                            )
                        }}
                    </Button>
                    <Button
                        @click="confirmDelete"
                        variant="destructive"
                        class="w-full sm:w-auto"
                    >
                        {{
                            $t(
                                'components.modals.CloseRoomModal.deleteConfirmButton'
                            )
                        }}
                    </Button>
                </DialogFooter>
            </template>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    showModal: Boolean,
    roomId: String,
});

const emit = defineEmits(['update:open', 'submit', 'delete']);

const finalTotal = ref('');
const errorMessage = ref('');
const showDeleteConfirm = ref(false);

const parsedTotal = computed(() => parseFloat(finalTotal.value));

const isValidTotal = computed(() => {
    return !isNaN(parsedTotal.value) && parsedTotal.value > 0;
});

const handleSubmit = () => {
    if (!isValidTotal.value) {
        errorMessage.value = t('components.modals.CloseRoomModal.errors.greaterThanZero');
        return;
    }

    errorMessage.value = '';
    emit('submit', {
        roomId: props.roomId,
        finalTotal: parsedTotal.value,
    });
    finalTotal.value = '';
};

const handleDelete = () => {
    showDeleteConfirm.value = true;
};

const confirmDelete = () => {
    emit('delete', {
        roomId: props.roomId,
    });
};

watch(
    () => props.showModal,
    (isShowing) => {
        if (!isShowing) {
            finalTotal.value = '';
            errorMessage.value = '';
            showDeleteConfirm.value = false;
        }
    }
);

watch(finalTotal, () => {
    if (errorMessage.value) {
        errorMessage.value = '';
    }
});
</script>