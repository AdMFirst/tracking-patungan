<template>
    <div class="min-h-screen p-4 pb-20 relative">
        <PullToRefresh :on-refresh="handleRefresh" :disabled="showPaymentModal">
            <div class="max-w-md mx-auto">
                <div class="text-center py-0 mb-6">
                    <h1 class="text-2xl font-bold">
                        {{ t('pages.histori.title') }}
                    </h1>
                </div>

                <!-- Tab Navigation (shadcn) -->
                <Tabs v-model="activeTab" class="mb-4">
                    <TabsList class="grid w-full h-full gap-2 grid-cols-2 p-2">
                        <TabsTrigger value="active" class="py-3 px-4">
                            {{ t('pages.histori.tabs.active') }} ({{ activeRooms.length }})
                        </TabsTrigger>
                        <TabsTrigger value="closed" class="py-3 px-4">
                            {{ t('pages.histori.tabs.closed') }} ({{ closedRooms.length }})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div v-if="isRoomsLoading" class="text-center space-y-4">
                    <OrderRoomSkeleton v-for="i in [1, 2, 3, 4, 5]" :key="i" />
                </div>

                <div
                    v-else-if="filteredRooms.length === 0"
                    class="text-center py-8"
                >
                    <div
                        class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <Home class="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 class="text-lg font-semibold mb-2">
                        {{
                            activeTab === 'active'
                                ? t('pages.histori.emptyState.activeTitle')
                                : t('pages.histori.emptyState.closedTitle')
                        }}
                    </h3>
                    <p class="text-sm text-muted-foreground">
                        {{
                            activeTab === 'active'
                                ? t('pages.histori.emptyState.activeDescription')
                                : t('pages.histori.emptyState.closedDescription')
                        }}
                    </p>
                </div>

                <div v-else class="space-y-4">
                    <OrderRooms :rooms="filteredRooms" @pay-room="openPaymentModal" />
                </div>
            </div>
        </PullToRefresh>

        <!-- Payment Modal -->
        <PaymentModal
            :room="selectedRoom"
            :isOpen="showPaymentModal"
            @close="closePaymentModal"
            @payment-confirmed="handlePaymentConfirmed"
        />
    </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import { formatCurrency } from '@/lib/utils';

// ICON IMPORTS
import { Home } from 'lucide-vue-next';

// shadcn UI
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Queries & Custom Components
import { useJoinedRoomsQuery, useSetParticipantAsPaidMutation } from '../../lib/tanstackQueries';
import { useQuery, useMutation } from '@tanstack/vue-query';
import OrderRooms from '@/components/room/OrderRooms.vue';
import OrderRoomSkeleton from '@/components/room/OrderRoomSkeleton.vue';
import PullToRefresh from '@/components/common/PullToRefresh.vue';
import PaymentModal from '@/components/modals/PaymentModal.vue';

const { t } = useI18n();
const user = inject('user');

// State
const activeTab = ref('active');
const showPaymentModal = ref(false);
const selectedRoom = ref(null);

// --- Fetching Logic ---
const { data: joinedRoomsData, isLoading: isRoomsLoading, refetch } = useQuery(
    useJoinedRoomsQuery(user.value?.id)
);

// Process the joined rooms data
const rooms = computed(() => {
    if (!joinedRoomsData.value) return [];

    console.debug('Processing joined rooms data:', joinedRoomsData.value);
    const roomsMap = new Map();

    joinedRoomsData.value.forEach((item) => {
        if (!roomsMap.has(item.room_id)) {
            roomsMap.set(item.room_id, {
                room_id: item.room_id,
                title: item.room_title,
                room_created_at: item.room_created_at,
                platform: item.platform,
                runner_name: item.runner_name,
                runner_id: item.runner_id,
                restaurant: item.restaurant,
                status: item.room_status,
                paid_via: item.paid_via,
                paid_at: item.paid_at,
                user_items: [],
                total_room_price: 0,
                final_total: null,
            });
        }

        const room = roomsMap.get(item.room_id);
        room.user_items.push({
            id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes,
            raw_item_total: item.raw_item_total,
            proportional_item_total: item.proportional_item_total,
        });

        room.total_room_price += item.raw_item_total;

        if (
            item.room_status === 'closed' &&
            item.proportional_item_total !== null
        ) {
            room.final_total += item.proportional_item_total;
        }
    });

    return Array.from(roomsMap.values());
});

// Computed properties for filtering
const activeRooms = computed(() => {
    return rooms.value.filter((room) => !room.final_total);
});

const closedRooms = computed(() => {
    return rooms.value.filter((room) => room.final_total);
});

const filteredRooms = computed(() => {
    return activeTab.value === 'active' ? activeRooms.value : closedRooms.value;
});

// Refresh Handler passed to PullToRefresh component
const handleRefresh = async () => {
    await refetch();
};

// --- Modal & Payment Logic ---
const setParticipantAsPaidMutation = useMutation(useSetParticipantAsPaidMutation());

function openPaymentModal(room) {
    selectedRoom.value = room;
    showPaymentModal.value = true;
}

function closePaymentModal() {
    showPaymentModal.value = false;
    selectedRoom.value = null;
}

async function handlePaymentConfirmed(paymentData) {
    try {
        var _user = user.value;
        if (!_user) {
            throw new Error('User not authenticated');
        }

        console.debug(paymentData, _user.id);

        await setParticipantAsPaidMutation.mutateAsync({
            roomID: paymentData.roomId,
            paymentMethodID: paymentData.paymentMethodId,
            userID: _user.id,
        });

        console.debug('Payment confirmed:', paymentData);
        toast.success(
            t('pages.histori.message.paymentConfirmed', {
                amount: formatCurrency(paymentData.amount),
            })
        );

        closePaymentModal();
        await refetch();
    } catch (error) {
        console.error('Error confirming payment:', error);
        toast.error(
            t('pages.histori.message.paymentFailed', {
                error: error.message,
            })
        );
    }
}
</script>