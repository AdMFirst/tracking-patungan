<template>
    <Card
        v-for="room in props.rooms"
        :key="room.room_id"
        class="cursor-pointer transition-shadow"
    >
        <CardHeader class="p-4 pb-1">
            <div class="flex justify-between items-start">
                <CardTitle class="font-semibold text-lg">
                    {{ room.title || $t('components.room.OrderRooms.untitledRoom') }}
                </CardTitle>
                <Badge variant="secondary">
                    {{ room.platform || $t('components.room.OrderRooms.unknown') }}
                </Badge>
            </div>
        </CardHeader>

        <CardContent class="p-4 pt-0 text-sm space-y-2">
            <div class="flex justify-between">
                <span class="text-muted-foreground">{{ $t('components.room.OrderRooms.runnerLabel') }}</span>
                <span>{{
                    room.runner_name || room.runner_full_name || $t('components.room.OrderRooms.notSpecified')
                }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">{{ $t('components.room.OrderRooms.restaurantLabel') }}</span>
                <span>{{ room.restaurant || $t('components.room.OrderRooms.notSpecified') }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">{{ $t('components.room.OrderRooms.createdAtLabel') }}</span>
                <span>{{
                    formatDate(room.room_created_at) ||
                    room.room_created_at ||
                    $t('components.room.OrderRooms.notSpecified')
                }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">{{ $t('components.room.OrderRooms.itemsOrderedLabel') }}</span>
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
                    >{{ $t('components.room.OrderRooms.yourTotal') }}</span
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
                        {{ $t('components.room.OrderRooms.roomStillOpen') }}
                    </span>
                </div>
                <Button
                    variant="outline"
                    class="w-full"
                    @click.stop="handleOpenRoom(room)"
                >
                    {{ $t('components.room.OrderRooms.openRoomButton') }}
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
                    {{ $t('components.room.OrderRooms.payNowButton') }}
                </Button>
            </div>
            <div
                v-else-if="room.user_items.length > 0 && room.paid_at"
                class="pt-4"
            >
                <Button variant="outline" class="w-full h-auto whitespace-normal" disabled>
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
import { supabase, setParticipantAsPaid } from '@/lib/supabaseClient';

// SHADCN/UI COMPONENTS IMPORTS (Reduced list)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Button from '@/components/ui/button/Button.vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import PaymentModal from '@/components/modals/PaymentModal.vue';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t, d } = useI18n();

const props = defineProps({
    rooms: Object, // <- this is rooms.value exactly as fetched
});

// State for payment modal
const showPaymentModal = ref(false);
const selectedRoom = ref(null);

const formatDate = (dateString) => {
    return d(new Date(dateString), {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

function totalOriginalPay(items) {
    return items.reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
    );
}

function paymentStatus(room) {
    const date = formatDate(room.paid_at);
    if (room.paid_via) {
        return t('components.room.OrderRooms.paidAtVia', { date, method: room.paid_via });
    }
    return t('components.room.OrderRooms.paidAt', { date });
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

async function handlePaymentConfirmed(paymentData) {
    try {
        // Get the current user's ID
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            throw new Error('User not authenticated');
        }

        // Call the handlePaymentConfirmed function from supabaseClient
        await setParticipantAsPaid(
            paymentData.roomId,
            paymentData.paymentMethodId,
            user.id
        );

        console.log('Payment confirmed:', paymentData);
        toast.success(t('components.room.OrderRooms.paymentConfirmed', { amount: formatCurrency(paymentData.amount) }));
        
        // Close the payment modal
        showPaymentModal.value = false;
        selectedRoom.value = null;
        
    } catch (error) {
        console.error('Error confirming payment:', error);
        toast.error(t('components.room.OrderRooms.paymentFailed', { error: error.message }));
    }
}
</script>
