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
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
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
                <div>
                    <Button
                        variant="outline"
                        size="icon"
                        @click="handleShareClick"
                    >
                        <Share2 class="h-4 w-4" />
                    </Button>
                </div>
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
                        v-for="(userGroup, participantId) in groupedOrderItems"
                        :key="participantId"
                        class="border rounded-lg p-4"
                    >
                        <div class="flex items-center space-x-3 mb-4">
                            <img
                                v-if="userCache[userGroup[0]?.user_id]?.picture"
                                :src="userCache[userGroup[0]?.user_id]?.picture"
                                alt="User Avatar"
                                class="w-10 h-10 rounded-full"
                            />
                            <h3 class="font-semibold">
                                {{
                                    userCache[userGroup[0]?.user_id]?.display_name ||
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
    
    <!-- Add Order Item Modal -->
    <AddOrderItemModal
        :isOpen="showAddItemModal"
        :roomId="roomID"
        @update:open="showAddItemModal = $event"
        @itemAdded="handleAddOrderItem"
    />
    
    <!-- Floating Action Button -->
    <FloatingButton v-if="room && isParticipant" @click="showAddItemModal = true" />

    <!-- Share Modal -->
    <Dialog v-model:open="showShareModal">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Share Room</DialogTitle>
                <DialogDescription>
                    Scan the QR code to share this room with others.
                </DialogDescription>
            </DialogHeader>
            <div class="flex justify-center py-4">
                <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="w-64 h-64" />
            </div>
            <DialogFooter>
                <Button variant="outline" @click="showShareModal = false">
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
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
import { ArrowLeft, Share2 } from 'lucide-vue-next';
import JoinRoomPrompt from '@/components/JoinRoomPrompt.vue';
import FloatingButton from '@/components/FloatingButton.vue';
import AddOrderItemModal from '@/components/AddOrderItemModal.vue';
import QRCode from 'qrcode';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

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
const showAddItemModal = ref(false);
const showShareModal = ref(false);
const qrCodeUrl = ref('');

// Navigation
const goBack = () => {
    router.go(-1);
};

// Share functionality
const generateQRCode = async () => {
    try {
        const currentUrl = window.location.href;
        qrCodeUrl.value = await QRCode.toDataURL(currentUrl);
    } catch (err) {
        console.error('Error generating QR code:', err);
        error.value = 'Failed to generate QR code.';
    }
};

const handleShareClick = async () => {
    await generateQRCode();
    showShareModal.value = true;
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

// Add order item handler
const handleAddOrderItem = async (itemData) => {
    try {
        if (!currentUser.value || !isParticipant.value) {
            error.value = 'You need to be a participant to add items';
            return;
        }

        loading.value = true;
        error.value = null;

        // First, get the participant ID for this user in this room
        const { data: participantData, error: participantError } = await supabase
            .from('room_participants')
            .select('id')
            .eq('room_id', roomID)
            .eq('user_id', currentUser.value.id)
            .single();

        if (participantError) {
            console.error('Error fetching participant ID:', participantError);
            error.value = 'Failed to add order item. Please try again.';
            return;
        }

        if (!participantData) {
            console.error('Participant record not found');
            error.value = 'You are not a participant in this room.';
            return;
        }

        // Insert the new order item into the database
        const { data, error: insertError } = await supabase
            .from('order_items')
            .insert([{
                participant_id: participantData.id,
                item_name: itemData.itemName,
                quantity: itemData.quantity,
                unit_price: itemData.unitPrice,
                notes: itemData.notes || null
            }])
            .select();

        if (insertError) {
            console.error('Error adding order item:', insertError);
            error.value = 'Failed to add order item. Please try again.';
            return;
        }

        // Refresh the order items list
        await loadOrderItems();

        // Show success message or notification could be added here
        console.log('Order item added successfully:', data);

    } catch (err) {
        console.error('Error adding order item:', err);
        error.value = err.message || 'Failed to add order item.';
    } finally {
        loading.value = false;
    }
};

// Data processing
const groupedOrderItems = computed(() => {
    const grouped = {};
    orderItems.value.forEach((item) => {
        if (!grouped[item.participant_id]) {
            grouped[item.participant_id] = [];
        }
        grouped[item.participant_id].push(item);
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
        // Get all participants in this room first
        const { data: participants, error: participantsError } = await supabase
            .from('room_participants')
            .select('id, user_id')
            .eq('room_id', roomID);
        
        if (participantsError) {
            console.error('Error fetching participants:', participantsError);
            error.value = 'Failed to load participants.';
            orderItems.value = [];
            return;
        }
        
        // Get participant IDs
        const participantIds = participants.map(p => p.id);
        
        // Build user cache from participants
        participants.forEach(p => {
            if (!userCache.value[p.user_id]) {
                userCache.value[p.user_id] = { id: p.user_id };
            }
        });
        
        // Now get all order items for these participants
        const { data, error } = await supabase
            .from('order_items')
            .select('*, room_participants(user_id)')
            .in('participant_id', participantIds);
        
        if (error) {
            console.error('Error fetching order items:', error);
            error.value = 'Failed to load order items.';
            orderItems.value = [];
        } else {
            // Map the data to include user_id from the participant relationship
            orderItems.value = data.map(item => ({
                ...item,
                user_id: item.room_participants?.user_id || item.user_id
            })) || [];
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
            filter: `room_id=eq.${roomID}`
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
        
        // Load user profiles for all participants
        const userIds = Object.keys(userCache.value);
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
