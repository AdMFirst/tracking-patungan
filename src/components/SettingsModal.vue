<template>
    <Dialog :open="open" @update:open="handleOpenChange">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                    Update your profile settings.
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-4 py-2">
                <div class="space-y-1">
                    <Label for="name">Username</Label>
                    <Input
                        id="name"
                        v-model="settingsForm.username"
                        type="text"
                        placeholder="Enter your username..."
                        autofill="false"
                    />
                </div>
            </div>

            <DialogFooter class="flex sm:justify-between pt-4">
                <Button
                    @click="handleOpenChange(false)"
                    variant="ghost"
                    class="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    @click="saveSettings"
                    class="w-full sm:w-auto mt-2 sm:mt-0"
                >
                    Save Changes
                </Button>
            </DialogFooter>
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

const props = defineProps({
    open: Boolean,
    user: {
        type: Object,
        default: () => ({
            username: '',
        }),
    },
});

const emit = defineEmits(['update:open', 'save']);

// Internal state initialized with a copy of props
const settingsForm = ref({ ...props.user });

// Sync internal state when modal opens or props change
watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            settingsForm.value = { ...props.user };
        }
    }
);

const handleOpenChange = (val) => {
    emit('update:open', val);
};

const saveSettings = () => {
    emit('save', settingsForm.value);
    handleOpenChange(false);
};
</script>
