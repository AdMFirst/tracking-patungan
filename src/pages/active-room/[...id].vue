<template>
    <div class="container mx-auto p-4">
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center h-screen">
            <Spinner />
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 class="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p class="text-gray-600">{{ error }}</p>
            <Button variant="outline" class="mt-4" @click="goBack">
                Go Back
            </Button>
        </div>
        
        <!-- Join room prompt -->
        <div v-else-if="showJoinPrompt">
            <JoinRoomPrompt
                :roomId="roomID"
                :roomTitle="room?.title || 'This Room'"
                @join="handleJoinRoom"
                @cancel="handleCancelJoin"
            />
        </div>
        
        <!-- Invalid room state -->
        <div v-else-if="!room" class="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 class="text-xl font-semibold text-yellow-600 mb-2">Room Not Available</h2>
            <p class="text-gray-600 mb-4">
                {{ roomID }} is invalid or not active
            </p>
            <Button variant="outline" @click="goBack">
                Go Back
            </Button>
        </div>
        
        <!-- Main room content for participants -->
        <div v-else>
            <div class="flex items-center mb-4">
                <Button
                    variant="outline"
                    size="icon"
                    class="mr-2"
                    @click="goBack"
                >
                    <ArrowLeft class="h-4 w-4" />
                </Button>
                <h1 class="text-2xl font-bold">{{ room.title }}</h1>
            </div>
            <div class="mb-4">
                <p class="text-muted-foreground">
                    {{ room.restaurant }} via {{ room.platform }}
                </p>
            </div>
            <Separator class="my-6" />
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4">Cart</h2>
                <div v-if="Object.keys(groupedOrderItems).length > 0" class="space-y-6">
                    <div
                        v-for="(userGroup, userId) in groupedOrderItems"
                        :key="userId"
                        class="border rounded-lg p-4"
                    >
                        <div class="flex items-center space-x-3 mb-4">
                            <img
                                v-if="userCache[userId]?.picture"
                                :src="userCache[userId]?.picture"
                                alt="User Avatar"
                                class="w-10 h-10 rounded-full"
                            />
                            <h3 class="font-semibold">
                                {{
                                    userCache[userId]?.display_name ||
                                    'Unknown User'
                                }}
                            </h3>
                        </div>
                        <div class="text-sm">
                            <template v-for="item in userGroup" :key="item.id">
                                <div class="flex justify-between">
                                    <span>
                                        {{ item.item_name }} x
                                        {{ item.quantity }}
                                        <span class="text-muted-foreground"
                                            >@
                                            {{
                                                formatCurrency(
                                                    item.unit_price
                                                )
                                            }}
                                            each</span
                                        >
                                    </span>
                                    <span>{{
                                        formatCurrency(
                                            item.unit_price * item.quantity
                                        )
                                    }}</span>
                                </div>
                                <p v-if="item.notes" class="text-muted-foreground">
                                    *{{ item.notes }}
                                </p>
                            </template>
                        </div>
                    </div>
                </div>
                <div v-else class="text-muted-foreground">
                    No order items yet.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { user as currentUser } from '@/lib/auth';
import {
    supabase,
    checkUserParticipation,
    joinRoom,
} from '@/lib/supabaseClient';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/button/Button.vue';
import { ArrowLeft } from 'lucide-vue-next';
import JoinRoomPrompt from '@/components/JoinRoomPrompt.vue';

// State management
const route = useRoute();
const router = useRouter();
const roomID = route.params.id; 
const room = ref(null);
const orderItems = ref([]);
const loading = ref(true);
const error = ref(null);
const userCache = ref({});
const isParticipant = ref(false);
const showJoinPrompt = ref(false);
const realtimeChannel = ref(null);

// Navigation
const goBack = () => {
    router.go(-1);
};

// Join room handlers
const handleJoinRoom = async () => {
    try {
        if (!currentUser.value) {
            error.value = 'You need to be logged in to join this room';
            return;
        }

        loading.value = true;
        error.value = null;
        
        await joinRoom(roomID, currentUser.value.id);
        isParticipant.value = true;
        showJoinPrompt.value = false;
        
        // Refresh data after joining
        await loadRoomData();
        
    } catch (err) {
        console.error('Error joining room:', err);
        error.value = 'Failed to join room. Please try again.';
    } finally {
        loading.value = false;
    }
};

const handleCancelJoin = () => {
    showJoinPrompt.value = false;
    goBack();
};

// Data processing
const groupedOrderItems = computed(() => {
    const grouped = {};
    orderItems.value.forEach((item) => {
        if (!grouped[item.user_id]) {
            grouped[item.user_id] = [];
        }
        grouped[item.user_id].push(item);
    });
    return grouped;
});

// Data loading functions
const loadRoomDetails = async () => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomID)
            .single();
        
        if (error) {
            console.error('Error fetching room details:', error);
            error.value = 'Failed to load room details.';
            room.value = null;
            return false;
        }
        
        // Check if the room is active (no order_time or final_total yet)
        if (data.order_time || data.final_total) {
            room.value = null;
        } else {
            room.value = data;
        }
        return !!room.value;
    } catch (err) {
        console.error('Error fetching room details:', err);
        error.value = 'Failed to load room details.';
        room.value = null;
        return false;
    }
};

const loadOrderItems = async () => {
    try {
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('participant_id', currentUser.value?.id);
        
        if (error) {
            console.error('Error fetching order items:', error);
            error.value = 'Failed to load order items.';
            orderItems.value = [];
        } else {
            orderItems.value = data || [];
        }
    } catch (err) {
        console.error('Error fetching order items:', err);
        error.value = 'Failed to load order items.';
        orderItems.value = [];
    }
};

const loadUserProfiles = async (userIds) => {
    if (!userIds || userIds.length === 0) return;
    
    try {
        const { data, error } = await supabase
            .rpc('get_user_profiles', {
                user_ids: userIds
            });
        
        if (error) {
            console.error('Error fetching user profiles:', error);
        } else {
            data.forEach((user) => {
                userCache.value[user.id] = user;
            });
        }
    } catch (err) {
        console.error('Error fetching user profiles:', err);
    }
};

const checkParticipation = async () => {
    if (!currentUser.value) {
        showJoinPrompt.value = true;
        return false;
    }
    
    try {
        const participant = await checkUserParticipation(roomID, currentUser.value.id);
        isParticipant.value = participant;
        showJoinPrompt.value = !participant;
        return participant;
    } catch (err) {
        console.error('Error checking participation:', err);
        error.value = 'Failed to check your participation status.';
        return false;
    }
};

// Real-time subscription
const setupRealtimeSubscription = () => {
    if (!currentUser.value || !isParticipant.value) return null;
    
    const channel = supabase
        .channel(`room_${roomID}_order_items`, {
            config: {
                broadcast: {
                    self: true
                }
            }
        })
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'order_items',
            filter: `participant_id=eq.${currentUser.value.id}`
        }, async (payload) => {
            console.log('Order item change detected:', payload);
            await loadRoomData();
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Realtime subscription active for room:', roomID);
            }
        });
    
    return channel;
};

// Optimized data loading function
const loadRoomData = async () => {
    try {
        loading.value = true;
        error.value = null;
        
        // Batch room details and participation check in parallel
        const [roomData, participationStatus] = await Promise.all([
            loadRoomDetails(),
            checkParticipation()
        ]);
        
        if (!roomData || !participationStatus) {
            return;
        }
        
        // Load order data
        await loadOrderItems();
        
        // Only load user profiles if we have order items
        const userIds = [...new Set(orderItems.value.map((item) => item.user_id))];
        if (userIds.length > 0) {
            await loadUserProfiles(userIds);
        }
        
        // Setup real-time subscription only if we have data
        if (orderItems.value.length > 0) {
            realtimeChannel.value = setupRealtimeSubscription();
        }
        
    } catch (err) {
        console.error('Error loading room data:', err);
        error.value = err.message || 'Failed to load room data.';
    } finally {
        loading.value = false;
    }
};

// Lifecycle hooks
onMounted(() => {
    loadRoomData();
});

onUnmounted(() => {
    if (realtimeChannel.value) {
        supabase.removeChannel(realtimeChannel.value);
        console.log('Realtime subscription cleaned up');
    }
});
</script>
