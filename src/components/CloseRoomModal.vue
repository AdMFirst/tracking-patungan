<template>
    <Dialog :open="showModal" @update:open="$emit('update:open', $event)">
        <DialogContent class="sm:max-w-[425px]">
            <template v-if="!showDeleteConfirm">
                <DialogHeader>
                    <DialogTitle>Close Room</DialogTitle>
                    <DialogDescription>
                        Enter the final total for this room.
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-2">
                    <div class="space-y-2">
                        <Label for="finalTotal">Final Total</Label>
                        <Input
                            id="finalTotal"
                            v-model="finalTotal"
                            type="number"
                            placeholder="Enter final total..."
                        />
                    </div>
                </div>
                <DialogFooter class="flex sm:justify-between pt-4">
                    <Button
                        @click="$emit('update:open', false)"
                        variant="ghost"
                        class="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        @click="handleDelete"
                        variant="destructive"
                        class="w-full  sm:w-auto mt-2 sm:mt-0"
                    >
                        Delete Room
                    </Button>
                    <Button
                        @click="handleSubmit"
                        class="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </template>
            
            <!-- Delete Confirmation -->
            <template v-else>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. All room data will be permanently deleted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter class="flex sm:justify-end gap-2 pt-4">
                    <Button
                        @click="showDeleteConfirm = false"
                        variant="outline"
                        class="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        @click="confirmDelete"
                        variant="destructive"
                        class="w-full sm:w-auto"
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </template>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
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
import { Separator } from '@/components/ui/separator';

const props = defineProps({
    showModal: Boolean,
    roomId: String,
});

const emit = defineEmits(['update:open', 'submit', 'delete']);

const finalTotal = ref('');
const showDeleteConfirm = ref(false);

const handleSubmit = () => {
    emit('submit', {
        roomId: props.roomId,
        finalTotal: finalTotal.value,
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
        }
    }
);
</script>
