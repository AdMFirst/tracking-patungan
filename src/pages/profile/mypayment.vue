<template>
    <div class="container mx-auto p-4">
        <PageHeader :title="$t('pages.profile.mypayment.title')">
            <template #actions>
                <Button class="w-full sm:w-auto" @click="openAddDialog">
                    <Plus class="w-4 h-4 mr-2" />
                    {{ $t('pages.profile.mypayment.addPaymentMethod') }}
                </Button>
            </template>
        </PageHeader>

        <!-- Loading State -->
        <div v-if="isPaymentMethodsLoading" class="space-y-4">
            <!-- Payment Method Card Skeletons -->
            <Card class="p-4">
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center justify-between w-full">
                            <Skeleton class="h-5 w-[80px]" />
                            <Skeleton class="h-4 w-[120px]" />
                        </div>
                    </div>
                    <Skeleton class="h-6 w-[200px] mx-auto" />
                    <div class="flex gap-2 pt-2">
                        <Skeleton class="h-8 flex-1" />
                        <Skeleton class="h-8 flex-1" />
                    </div>
                </div>
            </Card>

            <Card class="p-4">
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center justify-between w-full">
                            <Skeleton class="h-5 w-[80px]" />
                            <Skeleton class="h-4 w-[120px]" />
                        </div>
                    </div>
                    <Skeleton class="h-6 w-[200px] mx-auto" />
                    <div class="flex gap-2 pt-2">
                        <Skeleton class="h-8 flex-1" />
                        <Skeleton class="h-8 flex-1" />
                    </div>
                </div>
            </Card>
        </div>

        <!-- Empty State -->
        <div v-else-if="!paymentMethodsData || paymentMethodsData.length === 0" class="text-center py-12">
            <div
                class="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4"
            >
                <CreditCard class="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 class="text-base sm:text-lg font-medium mb-2">
                {{ $t('pages.profile.mypayment.noPaymentMethodsYet') }}
            </h3>
            <p class="text-gray-500 mb-4 text-sm sm:text-base">
                {{ $t('pages.profile.mypayment.addPaymentMethodDescription') }}
            </p>
            <Button class="w-full sm:w-auto" @click="openAddDialog">
                <Plus class="w-4 h-4 mr-2" />
                {{ $t('pages.profile.mypayment.addPaymentMethod') }}
            </Button>
        </div>

        <!-- Payment Methods List -->
        <div v-else-if="paymentMethodsData && paymentMethodsData.length > 0" class="space-y-4">
            <Card v-for="method in paymentMethodsData" :key="method.id" class="p-4">
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
                                {{ $t('pages.profile.mypayment.addedOn') }}
                                {{
                                    new Date(
                                        method.created_at
                                    ).toLocaleDateString()
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
                            {{ $t('pages.profile.mypayment.edit') }}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            class="flex-1"
                            @click="openDeleteDialog(method)"
                        >
                            <Trash2 class="w-4 h-4 mr-2" />
                            {{ $t('pages.profile.mypayment.delete') }}
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
                        >{{
                            editingMethod
                                ? $t('pages.profile.mypayment.edit')
                                : $t('pages.profile.mypayment.add')
                        }}
                        {{
                            $t('pages.profile.mypayment.paymentMethod')
                        }}</DialogTitle
                    >
                </DialogHeader>
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="grid gap-2">
                        <Label for="paymentType">{{
                            $t('pages.profile.mypayment.paymentType')
                        }}</Label>
                        <Select v-model="formData.tipe" required>
                            <SelectTrigger id="paymentType">
                                <SelectValue
                                    :placeholder="
                                        $t(
                                            'pages.profile.mypayment.selectPaymentType'
                                        )
                                    "
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Bank Transfer">{{
                                        $t(
                                            'pages.profile.mypayment.bankTransfer'
                                        )
                                    }}</SelectItem>
                                    <SelectItem value="GoPay">{{
                                        $t('pages.profile.mypayment.goPay')
                                    }}</SelectItem>
                                    <SelectItem value="OVO">{{
                                        $t('pages.profile.mypayment.ovo')
                                    }}</SelectItem>
                                    <SelectItem value="Dana">{{
                                        $t('pages.profile.mypayment.dana')
                                    }}</SelectItem>
                                    <SelectItem value="ShopeePay">{{
                                        $t('pages.profile.mypayment.shopeePay')
                                    }}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div
                        v-if="formData.tipe === 'Bank Transfer'"
                        class="grid gap-2"
                    >
                        <Label for="bankName">{{
                            $t('pages.profile.mypayment.bankName')
                        }}</Label>
                        <Input
                            id="bankName"
                            v-model="formData.bank_name"
                            :placeholder="
                                $t(
                                    'pages.profile.mypayment.bankNamePlaceholder'
                                )
                            "
                            required
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="accountNumber">{{
                            $t('pages.profile.mypayment.accountNumber')
                        }}</Label>
                        <Input
                            id="accountNumber"
                            v-model="formData.norek"
                            :placeholder="
                                $t(
                                    'pages.profile.mypayment.accountNumberPlaceholder'
                                )
                            "
                            
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            @click="isDialogOpen = false"
                        >
                            {{ $t('pages.profile.mypayment.cancel') }}
                        </Button>
                        <Button type="submit">
                            {{
                                editingMethod
                                    ? $t('pages.profile.mypayment.update')
                                    : $t('pages.profile.mypayment.save')
                            }}
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
                    <DialogTitle>{{
                        $t('pages.profile.mypayment.deletePaymentMethod')
                    }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('pages.profile.mypayment.deleteConfirm') }}
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
                        {{ $t('pages.profile.mypayment.cancel') }}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        @click="deletePaymentMethod"
                    >
                        {{ $t('pages.profile.mypayment.delete') }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAllPaymentMethodsQuery, useAddPaymentMethodMutation, useUpdatePaymentMethodMutation, useDeletePaymentMethodMutation } from '@/lib/supabaseClient';
import { useQuery, useMutation } from '@tanstack/vue-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import PageHeader from '@/components/common/PageHeader.vue';

const { t } = useI18n();
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const editingMethod = ref(null);
const methodToDelete = ref(null);

const formData = ref({
    tipe: '',
    norek: '',
    bank_name: '',
});

const user = inject('user');
const currentUserId = user.value?.id;

// Use TanStack Query for fetching payment methods
const { data: paymentMethodsData, isLoading: isPaymentMethodsLoading } = useQuery(
    useAllPaymentMethodsQuery(currentUserId)
);

// Set up mutations
const addPaymentMethodMutation = useMutation(useAddPaymentMethodMutation());
const updatePaymentMethodMutation = useMutation(useUpdatePaymentMethodMutation());
const deletePaymentMethodMutation = useMutation(useDeletePaymentMethodMutation());

// Open add dialog
function openAddDialog() {
    editingMethod.value = null;
    formData.value = {
        tipe: '',
        norek: '',
        bank_name: '',
    };
    isDialogOpen.value = true;
}

function badgeClassByType(tipe) {
    const badgeMap = {
        gopay: 'bg-green-100 text-green-700 border border-green-200',
        ovo: 'bg-purple-100 text-purple-700 border border-purple-200',
        dana: 'bg-sky-100 text-sky-700 border border-sky-200',
        shopeepay: 'bg-orange-100 text-orange-700 border border-orange-200',
    };

    if (!tipe) return 'bg-gray-100 text-gray-700 border border-gray-200';

    const key = tipe.trim().toLowerCase();
    return badgeMap[key] || 'bg-gray-100 text-gray-700 border border-gray-200';
}

// Open edit dialog
function openEditDialog(method) {
    editingMethod.value = method;

    // Determine if this is a bank transfer (any value not in our predefined list)
    const predefinedTypes = ['GoPay', 'OVO', 'Dana', 'ShopeePay'];
    const isBankTransfer = !predefinedTypes.includes(method.tipe);

    formData.value = {
        tipe: isBankTransfer ? 'Bank Transfer' : method.tipe,
        norek: method.norek,
        bank_name: isBankTransfer ? method.tipe : '',
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
    if (!user.value) return;

    const payload = {
        tipe:
            formData.value.tipe === 'Bank Transfer'
                ? formData.value.bank_name
                : formData.value.tipe,
        norek: formData.value.norek,
        user_id: user.value.id,
    };

    try {
        if (editingMethod.value) {
            // Update existing method
            await updatePaymentMethodMutation.mutateAsync({
                methodID: editingMethod.value.id,
                updates: payload
            });
        } else {
            // Add new method
            await addPaymentMethodMutation.mutateAsync(payload);
        }

        // Mutations will automatically invalidate queries and refresh the list
        isDialogOpen.value = false;
    } catch (error) {
        console.error('Error saving payment method:', error);
        toast.error(
            t('pages.profile.mypayment.errors.saveFailed', {
                error: error.message,
            })
        );
    }
}

// Delete payment method
async function deletePaymentMethod() {
    if (!methodToDelete.value) return;

    try {
        await deletePaymentMethodMutation.mutateAsync(methodToDelete.value.id);

        // Mutation will automatically invalidate queries and refresh the list
        isDeleteDialogOpen.value = false;
    } catch (error) {
        console.error('Error deleting payment method:', error);
        toast.error(
            t('pages.profile.mypayment.errors.deleteFailed', {
                error: error.message,
            })
        );
    }
}

</script>
