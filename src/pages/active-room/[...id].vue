<template>
    <div class="container mx-auto p-4">
        <div v-if="loading" class="flex justify-center items-center h-screen">
            <Spinner />
        </div>
        <div v-else>
            <div v-if="room">
                <div class="flex items-center mb-4">
                    <Button variant="outline" size="icon" class="mr-2" @click="goBack">
                        <ArrowLeft class="h-4 w-4" />
                    </Button>
                    <h1 class="text-2xl font-bold">{{ room.title }}</h1>
                </div>
                <div class="mb-4">
                    <p class="text-muted-foreground">{{ room.restaurant }} via {{ room.platform }}</p>
                </div>
                <Separator class="my-6" />
                <div class="mb-6">
                    <h2 class="text-xl font-semibold mb-4">Cart</h2>
                    <div v-if="Object.keys(groupedOrderItems).length > 0" class="space-y-6">
                        <div v-for="(userGroup, userId) in groupedOrderItems" :key="userId"
                            class="border rounded-lg p-4">
                            <div class="flex items-center space-x-3 mb-4">
                                <img v-if="userCache[userId]?.picture" :src="userCache[userId]?.picture"
                                    alt="User Avatar" class="w-10 h-10 rounded-full" />
                                <h3 class="font-semibold">{{ userCache[userId]?.display_name || 'Unknown User' }}</h3>
                            </div>
                            <div class="text-sm">
                                <template v-for="item in userGroup" :key="item.id">
                                    <div class="flex justify-between">
                                        <span>
                                            {{ item.item_name }} x {{ item.quantity }}
                                            <span class="text-muted-foreground">@ {{ formatCurrency(item.unit_price) }}
                                                each</span>
                                        </span>
                                        <span>{{ formatCurrency(item.unit_price * item.quantity) }}</span>
                                    </div>
                                    <p v-if="item.notes" class="text-muted-foreground">*{{ item.notes }}</p>
                                </template>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-muted-foreground">
                        No order items yet.
                    </div>
                </div>
            </div>
            <div v-else>
                <h1 class="text-xl font-bold text-destructive">{{ roomID }} is invalid or not active</h1>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/button/Button.vue';
import { ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const roomID = route.params.id;
const room = ref(null);
const orderItems = ref([]);
const loading = ref(true);
const userCache = ref({});

const goBack = () => {
    router.go(-1);
};

// Computed property to group order items by user
const groupedOrderItems = computed(() => {
    const grouped = {};
    orderItems.value.forEach(item => {
        if (!grouped[item.user_id]) {
            grouped[item.user_id] = [];
        }
        grouped[item.user_id].push(item);
    });
    return grouped;
});

const fetchRoomDetails = async () => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomID)
            .single();

        if (error) throw error;

        // Check if the room is active (no order_time or final_total yet)
        if (data.order_time || data.final_total) {
            room.value = null;
        } else {
            room.value = data;
        }
    } catch (error) {
        console.error('Error fetching room details:', error);
        room.value = null;
    }
};

const fetchOrderItems = async () => {
    try {
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('room_id', roomID);

        if (error) throw error;
        orderItems.value = data;
    } catch (error) {
        console.error('Error fetching order items:', error);
    }
};

const fetchUserProfiles = async (userIds) => {
    const cachedUserIds = Object.keys(userCache.value);
    const needsFetch = userIds.some(id => !cachedUserIds.includes(id));

    if (!needsFetch) return;

    try {
        const { data, error } = await supabase
            .rpc('get_user_profiles', { user_ids: userIds });

        if (error) throw error;

        data.forEach(user => {
            if (!userCache.value[user.id] ||
                JSON.stringify(userCache.value[user.id]) !== JSON.stringify(user)) {
                userCache.value[user.id] = user;
            }
        });
    } catch (error) {
        console.error('Error fetching user profiles:', error);
    }
};

const subscribeToOrderItems = () => {
    const channel = supabase
        .channel('order_items_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'order_items',
                filter: `room_id=eq.${roomID}`
            },
            (payload) => {
                // Update the orderItems array directly based on the payload
                if (payload.eventType === 'INSERT') {
                    orderItems.value = [...orderItems.value, payload.new];
                } else if (payload.eventType === 'UPDATE') {
                    orderItems.value = orderItems.value.map(item =>
                        item.id === payload.new.id ? payload.new : item
                    );
                } else if (payload.eventType === 'DELETE') {
                    orderItems.value = orderItems.value.filter(item => item.id !== payload.old.id);
                }

                // Fetch user profiles for any new users
                const userIds = [...new Set(orderItems.value.map(item => item.user_id))];
                fetchUserProfiles(userIds);
            }
        )
        .subscribe();

    return channel;
};

onMounted(async () => {
    loading.value = true;
    await fetchRoomDetails();

    if (room.value) {
        await fetchOrderItems();
        const userIds = [...new Set(orderItems.value.map(item => item.user_id))];
        await fetchUserProfiles(userIds);

        const channel = subscribeToOrderItems();

        onUnmounted(() => {
            supabase.removeChannel(channel);
        });
    }

    loading.value = false;
});
</script>