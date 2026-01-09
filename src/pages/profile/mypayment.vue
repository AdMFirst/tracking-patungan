<template>
    <div class="container mx-auto p-4">
        <PageHeader title="My Payment Methods">
            <template #actions>
                <Button class="w-full sm:w-auto" @click="openAddDialog">
                    <Plus class="w-4 h-4 mr-2" />
                    Add Payment Method
                </Button>
            </template>
        </PageHeader>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <Spinner class="h-8 w-8 mb-4" />
            <p class="text-gray-500">Loading payment methods...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="paymentMethods.length === 0" class="text-center py-12">
            <div
                class="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4"
            >
                <CreditCard class="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 class="text-base sm:text-lg font-medium mb-2">
                No payment methods yet
            </h3>
            <p class="text-gray-500 mb-4 text-sm sm:text-base">
                Add a payment method to receive payments from participants
            </p>
            <Button class="w-full sm:w-auto" @click="openAddDialog">
                <Plus class="w-4 h-4 mr-2" />
                Add Payment Method
            </Button>
        </div>

        <!-- Payment Methods List -->
        <div v-else-if="paymentMethods.length > 0" class="space-y-4">
            <Card v-for="method in paymentMethods" :key="method.id" class="p-4">
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center justify-between w-full">
                            <Badge
                                class="text-xs sm:text-sm"
                                :class="badgeClassByType(method.tipe)"
                            >
                                {{ method.tipe }}
                            </Badge>


                            <span class="text-xs text-gray-500">
                                Added on
                                {{
                                    new Date(method.created_at).toLocaleDateString()
                                }}
                            </span>
                        </div>

                    </div>
                    <div class="font-medium text-center text-xl sm:text-base">
                        {{ method.norek }}
                    </div>
                    <div class="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            class="flex-1"
                            @click="openEditDialog(method)"
                        >
                            <Pencil class="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            class="flex-1"
                            @click="openDeleteDialog(method)"
                        >
                            <Trash2 class="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </Card>
        </div>

        <!-- Add/Edit Payment Method Dialog -->
        <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle
                        >{{ editingMethod ? 'Edit' : 'Add' }} Payment
                        Method</DialogTitle
                    >
                </DialogHeader>
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="grid gap-2">
                        <Label for="paymentType">Payment Type</Label>
                        <Select v-model="formData.tipe" required>
                            <SelectTrigger id="paymentType">
                                <SelectValue
                                    placeholder="Select payment type"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Bank Transfer"
                                        >Bank Transfer</SelectItem
                                    >
                                    <SelectItem value="GoPay">GoPay</SelectItem>
                                    <SelectItem value="OVO">OVO</SelectItem>
                                    <SelectItem value="Dana">Dana</SelectItem>
                                    <SelectItem value="ShopeePay"
                                        >ShopeePay</SelectItem
                                    >
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div
                        v-if="formData.tipe === 'Bank Transfer'"
                        class="grid gap-2"
                    >
                        <Label for="bankName">Bank Name</Label>
                        <Input
                            id="bankName"
                            v-model="formData.bank_name"
                            placeholder="e.g., BCA, BNI, Mandiri"
                            required
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="accountNumber">Account Number</Label>
                        <Input
                            id="accountNumber"
                            v-model="formData.norek"
                            placeholder="Enter account number"
                            required
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="accountName"
                            >Account Holder Name (Optional)</Label
                        >
                        <Input
                            id="accountName"
                            v-model="formData.account_name"
                            placeholder="Enter account holder name"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            @click="isDialogOpen = false"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {{ editingMethod ? 'Update' : 'Save' }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <Dialog
            :open="isDeleteDialogOpen"
            @update:open="isDeleteDialogOpen = $event"
        >
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Payment Method</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this payment method?
                        <div class="mt-2 p-2 bg-gray-50 rounded">
                            <div class="font-medium">
                                {{ methodToDelete?.norek }}
                            </div>
                            <div class="text-sm text-gray-500">
                                {{ methodToDelete?.tipe }}
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        @click="isDeleteDialogOpen = false"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        @click="deletePaymentMethod"
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import PageHeader from '@/components/PageHeader.vue';

const router = useRouter();
const paymentMethods = ref([]);
const loading = ref(false);
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const editingMethod = ref(null);
const methodToDelete = ref(null);

const formData = ref({
    tipe: '',
    norek: '',
    bank_name: '',
    account_name: '',
});

// Fetch payment methods
async function fetchPaymentMethods() {
    loading.value = true;
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching payment methods:', error);
        } else {
            paymentMethods.value = data || [];
        }
    } catch (error) {
        console.error('Error fetching payment methods:', error);
    } finally {
        loading.value = false;
    }
}

// Open add dialog
function openAddDialog() {
    editingMethod.value = null;
    formData.value = {
        tipe: '',
        norek: '',
        bank_name: '',
        account_name: '',
    };
    isDialogOpen.value = true;
}

function badgeClassByType(tipe) {
    const badgeMap = {
        'bank transfer': 'bg-blue-100 text-blue-700 border border-blue-200',
        'gopay': 'bg-green-100 text-green-700 border border-green-200',
        'ovo': 'bg-purple-100 text-purple-700 border border-purple-200',
        'dana': 'bg-sky-100 text-sky-700 border border-sky-200',
        'shopeepay': 'bg-orange-100 text-orange-700 border border-orange-200',
    };

    if (!tipe) return 'bg-gray-100 text-gray-700 border border-gray-200';

    const key = tipe.trim().toLowerCase();
    return (
        badgeMap[key] ||
        'bg-gray-100 text-gray-700 border border-gray-200'
    );

}


// Open edit dialog
function openEditDialog(method) {
    editingMethod.value = method;
    formData.value = {
        tipe: method.tipe,
        norek: method.norek,
        bank_name: method.bank_name || '',
        account_name: method.account_name || '',
    };
    isDialogOpen.value = true;
}

// Open delete dialog
function openDeleteDialog(method) {
    methodToDelete.value = method;
    isDeleteDialogOpen.value = true;
}

// Handle form submission
async function handleSubmit() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
        tipe: formData.value.tipe,
        norek: formData.value.norek,
        user_id: user.id,
    };

    // Add bank_name if it's a bank transfer
    if (formData.value.tipe === 'Bank Transfer') {
        payload.bank_name = formData.value.bank_name;
    }

    // Add account_name if provided
    if (formData.value.account_name) {
        payload.account_name = formData.value.account_name;
    }

    try {
        if (editingMethod.value) {
            // Update existing method
            const { error } = await supabase
                .from('payment_methods')
                .update(payload)
                .eq('id', editingMethod.value.id);

            if (error) throw error;
        } else {
            // Add new method
            const { error } = await supabase
                .from('payment_methods')
                .insert([payload]);

            if (error) throw error;
        }

        // Refresh the list
        await fetchPaymentMethods();
        isDialogOpen.value = false;
    } catch (error) {
        console.error('Error saving payment method:', error);
        toast.error('Failed to save payment method: ' + error.message);
    }
}

// Delete payment method
async function deletePaymentMethod() {
    if (!methodToDelete.value) return;

    try {
        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', methodToDelete.value.id);

        if (error) throw error;

        // Refresh the list
        await fetchPaymentMethods();
        isDeleteDialogOpen.value = false;
    } catch (error) {
        console.error('Error deleting payment method:', error);
        toast.error('Failed to delete payment method: ' + error.message);
    }
}

// Fetch payment methods on mount
onMounted(fetchPaymentMethods);
</script>
