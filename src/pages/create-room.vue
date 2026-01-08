<script setup>
import { ref, computed, inject } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { createRoom } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

// Daftar layanan pesan makanan online di Indonesia
const DeliveryTypes = [
    'GoFood',
    'GrabFood',
    'Shopee Food',
    'Traveloka Eats',
    'Maxim Food & Goods Delivery',
    'Tokopedia NOW!',
    'Custom', // Pilihan yang membuka field baru
];

const router = useRouter();

const title = ref('');
const restaurantName = ref('');
const deliveryType = ref('');
const customDeliveryType = ref('');
const isLoading = ref(false);

// Computed property untuk mengecek apakah 'Custom' dipilih
const isCustom = computed(() => deliveryType.value === 'Custom');

const user = inject('user');

// Handle change for the main dropdown
const handleDeliveryChange = (value) => {
    deliveryType.value = value;
    // Reset custom field if 'Custom' is no longer selected
    if (value !== 'Custom') {
        customDeliveryType.value = '';
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();

    // Tentukan nilai akhir tipe pengiriman
    const finalDeliveryType = isCustom.value
        ? customDeliveryType.value
        : deliveryType.value;

    const payload = {
        title: title.value,
        restaurant: restaurantName.value,
        platform: finalDeliveryType,
        runner_id: user.value.id,
    };

    console.log('payload is', payload);

    try {
        isLoading.value = true;
        const data = await createRoom(payload);

        // 4. Sukses
        console.log('Data berhasil dimasukkan:', data);
        router.push(`/active-room/${data.id}`);
    } catch (err) {
        console.error('General Submission Error:', err);
        toast.error('Terjadi kesalahan saat koneksi ke server.');
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div
        class="min-h-screen flex items-start justify-center p-4 sm:items-center"
    >
        <Card class="w-full max-w-sm">
            <CardHeader>
                <CardTitle class="text-2xl">Create New Room</CardTitle>
                <CardDescription>
                    Enter the details for your food delivery order page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form @submit="handleSubmit" class="grid gap-4">
                    <div class="grid gap-2">
                        <Label for="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Makan malam senin 12 des"
                            v-model="title"
                            required
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="restaurant">Restaurant Name</Label>
                        <Input
                            id="restaurant"
                            placeholder="Warteg Alwi"
                            v-model="restaurantName"
                            required
                        />
                    </div>

                    <div class="grid gap-2">
                        <Label for="type">Delivery Type</Label>
                        <Select
                            :model-value="deliveryType"
                            @update:model-value="handleDeliveryChange"
                            required
                        >
                            <SelectTrigger class="w-full" id="type">
                                <SelectValue placeholder="Pilih aplikasi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="type in DeliveryTypes"
                                    :key="type"
                                    :value="type"
                                >
                                    {{ type }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div v-if="isCustom" class="grid gap-2">
                        <Label for="custom-type">Custom Platform Name</Label>
                        <Input
                            id="custom-type"
                            placeholder="E.g., Local Delivery Service"
                            v-model="customDeliveryType"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        class="w-full mt-2"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? 'Loading...' : 'Create' }}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
</template>
