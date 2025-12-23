<template>
    <Dialog :open="showModal" @update:open="$emit('update:open', $event)">
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Close Room</DialogTitle>
                <DialogDescription>
                    Enter the final total for this room.
                </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 py-2">
                <div class="space-y-1">
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
                    @click="handleSubmit"
                    class="w-full sm:w-auto mt-2 sm:mt-0"
                >
                    Submit
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps({
    showModal: Boolean,
    roomId: String
})

const emit = defineEmits(['update:open', 'submit'])

const finalTotal = ref('')

const handleSubmit = () => {
    if (finalTotal.value) {
        emit('submit', {
            roomId: props.roomId,
            finalTotal: finalTotal.value
        })
        finalTotal.value = ''
    }
}

watch(() => props.showModal, (isShowing) => {
    if (!isShowing) {
        finalTotal.value = ''
    }
})
</script>