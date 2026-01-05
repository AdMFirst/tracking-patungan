<template>
  <Dialog :open="isOpen" @update:open="handleDialogUpdate">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Order Item</DialogTitle>
        <DialogDescription>
          Add a new item to your order for this room.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="itemName">Item Name</Label>
          <Input
            id="itemName"
            v-model="formData.itemName"
            placeholder="Enter item name"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="quantity">Quantity</Label>
          <Input
            id="quantity"
            v-model.number="formData.quantity"
            type="number"
            placeholder="1"
            min="1"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="unitPrice">Unit Price</Label>
          <Input
            id="unitPrice"
            v-model.number="formData.unitPrice"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="notes">Notes (optional)</Label>
          <Input
            id="notes"
            v-model="formData.notes"
            placeholder="Any special instructions"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">
            Cancel
          </Button>
          <Button type="submit">
            Add Item
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  roomId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:open', 'itemAdded']);

const formData = ref({
  itemName: '',
  quantity: 1,
  unitPrice: 0,
  notes: ''
});

const handleDialogUpdate = (open) => {
  emit('update:open', open);
  if (!open) {
    // Reset form when dialog closes
    formData.value = {
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      notes: ''
    };
  }
};

const handleCancel = () => {
  emit('update:open', false);
};

const handleSubmit = () => {
  emit('itemAdded', {
    ...formData.value,
    roomId: props.roomId
  });
  emit('update:open', false);
  
  // Reset form
  formData.value = {
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  };
};

// Watch for roomId changes and reset form
watch(() => props.roomId, () => {
  formData.value = {
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  };
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>