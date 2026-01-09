<template>
    <div class="min-h-screen p-4 pb-20">
        <div class="max-w-md mx-auto">
            <div class="text-center py-0 mb-6">
                <h1 class="text-2xl font-bold">Joined Room History</h1>
            </div>

            <!-- Tab Navigation -->
            <div class="flex mb-4 bg-muted rounded-lg p-1">
                <button
                    @click="activeTab = 'active'"
                    :class="[
                        'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'active'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    ]"
                >
                    Active ({{ activeRooms.length }})
                </button>
                <button
                    @click="activeTab = 'closed'"
                    :class="[
                        'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'closed'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                    ]"
                >
                    Closed ({{ closedRooms.length }})
                </button>
            </div>

            <div v-if="loading" class="text-center space-y-4">
                <OrderRoomSkeleton v-for="i in [1, 2, 3, 4, 5]" :key="i" />
            </div>

            <div v-else-if="filteredRooms.length === 0" class="text-center py-8">
                <div
                    class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <Home class="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold mb-2">
                    No {{ activeTab === 'active' ? 'active' : 'closed' }} rooms found
                </h3>
                <p class="text-sm text-muted-foreground">
                    You haven't participated in any {{ activeTab === 'active' ? 'active' : 'closed' }} rooms yet.
                </p>
            </div>

            <div v-else class="space-y-4">
                <OrderRooms :rooms="filteredRooms" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, inject, computed } from 'vue';

// ICON IMPORTS (Reduced list)
import { Home } from 'lucide-vue-next';

// Assume this is imported from your project setup
import { fetchJoinedRooms } from '../../lib/supabaseClient';
import OrderRooms from '@/components/room/OrderRooms.vue';
import OrderRoomSkeleton from '@/components/room/OrderRoomSkeleton.vue';

const user = inject('user');

// State
const rooms = ref([]);
const loading = ref(false);
const activeTab = ref('active'); // 'active' or 'closed'

// --- Fetching Logic (Simplified) ---

const fetchRooms = async () => {
    if (!user.value) {
        console.warn('User object is not available. Cannot fetch rooms.');
        loading.value = false;
        return;
    }

    loading.value = true;

    try {
        const data = await fetchJoinedRooms(user.value.id);

        // Group data by room_id
        const roomsMap = new Map();

        data.forEach((item) => {
            if (!roomsMap.has(item.room_id)) {
                roomsMap.set(item.room_id, {
                    room_id: item.room_id,
                    title: item.room_title,
                    room_created_at: item.room_created_at,
                    platform: item.platform,
                    runner_name: item.runner_name,
                    runner_id: item.runner_id, // Include runner_id for payment methods lookup
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
                proportional_item_total: item.proportional_item_total
            });

            room.total_room_price += item.raw_item_total;

            // Set final_total if room is closed (use proportional_item_total)
            if (
                item.room_status === 'closed' &&
                item.proportional_item_total !== null
            ) {
                room.final_total += item.proportional_item_total;
            }
        });

        // Convert Map values to array
        rooms.value = Array.from(roomsMap.values());
        console.log('processed rooms', rooms.value);
    } catch (error) {
        console.error('Error fetching joined rooms:', error);
    } finally {
        loading.value = false;
    }
};

// Computed properties for filtering
const activeRooms = computed(() => {
    return rooms.value.filter(room => !room.final_total);
});

const closedRooms = computed(() => {
    return rooms.value.filter(room => room.final_total);
});

const filteredRooms = computed(() => {
    if (activeTab.value === 'active') {
        return activeRooms.value;
    } else {
        return closedRooms.value;
    }
});

// Watch the user to trigger the initial fetch
watch(
    () => user.value,
    (newUser) => {
        if (newUser) {
            fetchRooms();
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (user.value) {
        fetchRooms();
    }
});
</script>
