<template>
    <Card
        v-for="room in props.rooms"
        :key="room.room_id"
        class="cursor-pointer transition-shadow"
    >
        <CardHeader class="p-4 pb-1">
            <div class="flex justify-between items-start">
                <CardTitle class="font-semibold text-lg">
                    {{ room.title || 'Untitled Room' }}
                </CardTitle>
                <Badge variant="secondary">
                    {{ room.platform || 'Unknown' }}
                </Badge>
            </div>
        </CardHeader>

        <CardContent class="p-4 pt-0 text-sm space-y-2">
            <div class="flex justify-between">
                <span class="text-muted-foreground">Runner:</span>
                <span>{{
                    room.runner_name || room.runner_full_name || 'Not specified'
                }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">Restaurant:</span>
                <span>{{ room.restaurant || 'Not specified' }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">Created at:</span>
                <span>{{
                    formatDate(room.room_created_at) ||
                    room.room_created_at ||
                    'Not specified'
                }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">Items Ordered:</span>
            </div>

            <Separator class="my-2" />

            <div
                v-for="item in room.user_items"
                :key="item.id"
                class="flex flex-col space-y-1"
            >
                <div class="flex justify-between">
                    <span class="text-muted-foreground">
                        {{ item.item_name }} x {{ item.quantity }} @
                        {{ formatCurrency(item.unit_price) }} each
                    </span>
                    <span>{{
                        formatCurrency(item.unit_price * item.quantity)
                    }}</span>
                </div>
                <span
                    class="text-xs text-muted-foreground italic"
                    v-if="item.notes"
                >
                    * {{ item.notes }}
                </span>
            </div>

            <div
                class="flex justify-between items-center pt-2"
                v-if="!!room.final_total"
            >
                <span class="text-muted-foreground font-medium"
                    >Your total:</span
                >

                <div class="text-right">
                    <span
                        v-if="
                            totalOriginalPay(room.user_items) !==
                            room.final_total
                        "
                        class="line-through text-gray-400 mr-2 text-xs"
                    >
                        {{ formatCurrency(totalOriginalPay(room.user_items)) }}
                    </span>
                    <span
                        class="text-lg font-bold text-green-600 dark:text-green-400"
                    >
                        {{
                            formatCurrency(
                                (room.final_total / room.total_room_price) *
                                    totalOriginalPay(room.user_items)
                            )
                        }}
                    </span>
                </div>
            </div>

            <div v-if="!room.final_total">
                <div class="w-full p-2 text-center">
                    <span
                        class="text-lg font-bold text-green-600 dark:text-green-400"
                    >
                        Room is still open!
                    </span>
                </div>
                <Button
                    variant="outline"
                    class="w-full"
                    @click.stop="handleOpenRoom(room)"
                >
                    Open Room
                </Button>
            </div>
            <div
                v-else-if="room.user_items.length > 0 && !room.paid_at"
                class="pt-4"
            >
                <Button
                    variant="default"
                    class="w-full"
                    @click.stop="handlePayment(room)"
                >
                    Pay Now
                </Button>
            </div>
            <div
                v-else-if="room.user_items.length > 0 && room.paid_at"
                class="pt-4"
            >
                <Button variant="outline" class="w-full" disabled>
                    {{ paymentStatus(room) }}
                </Button>
            </div>
        </CardContent>
    </Card>

    <!-- Payment Modal -->
    <PaymentModal 
        :room="selectedRoom" 
        :isOpen="showPaymentModal"
        @close="showPaymentModal = false"
        @payment-confirmed="handlePaymentConfirmed"
    />
</template>

<script setup>
import { formatCurrency } from '@/lib/utils';

// SHADCN/UI COMPONENTS IMPORTS (Reduced list)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Button from './ui/button/Button.vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import PaymentModal from './PaymentModal.vue';
import { toast } from 'vue-sonner';

const router = useRouter();

const props = defineProps({
    rooms: Object, // <- this is rooms.value exactly as fetched
});

// State for payment modal
const showPaymentModal = ref(false);
const selectedRoom = ref(null);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return date.toLocaleDateString('id-ID', options);
};

function totalOriginalPay(items) {
    return items.reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
    );
}

function paymentStatus(room) {
    const basic = `Paid at ${formatDate(room.paid_at)}`
    return room.paid_via 
        ? `${basic} via ${room.paid_via}` 
        : basic;
}

function handleOpenRoom(room) {
    router.push('/active-room/' + room.room_id || room.id);
}

function handlePayment(room) {
    // Ensure room has runner_id for payment methods lookup
    const roomWithRunnerId = {
        ...room,
        runner_id: room.runner_id || room.room_runner_id // Add fallback for different field names
    };
    selectedRoom.value = roomWithRunnerId;
    showPaymentModal.value = true;
}

function handlePaymentConfirmed(paymentData) {
    console.log('Payment confirmed:', paymentData);
    // Here you would typically update the database to mark the room as paid
    // For now, we'll just show a toast notification
    toast.success(`Payment confirmed for ${paymentData.amount} using selected payment method. Room will be marked as paid.`);
    
    // In a real implementation, you would:
    // 1. Update the room_participants table with paid_at and paid_via
    // 2. Update the room status if needed
    // 3. Refresh the data to show the paid status
}
</script>
