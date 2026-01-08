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
        <div v-else-if="!room && !error" class="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
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
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <div class="flex justify-between items-center">
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
                                    </div>
                                    <div v-if="canEditItem(item)" class="flex space-x-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            class="h-8 w-8"
                                            @click="handleEditOrderItem(item)"
                                        >
                                            <Edit2 class="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            class="h-8 w-8"
                                            @click="handleDeleteOrderItem(item.id, item.user_id)"
                                        >
                                            <Trash2 class="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
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
    
    <!-- Edit Order Item Modal -->
    <EditOrderItemModal
        :isOpen="showEditItemModal"
        :item="editingItem"
        @update:open="showEditItemModal = $event"
        @itemUpdated="handleUpdateOrderItem"
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
    updateOrderItem,
    deleteOrderItem,
} from '@/lib/supabaseClient';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/button/Button.vue';
import { ArrowLeft, Share2, Edit2, Trash2 } from 'lucide-vue-next';
import JoinRoomPrompt from '@/components/JoinRoomPrompt.vue';
import FloatingButton from '@/components/FloatingButton.vue';
import AddOrderItemModal from '@/components/AddOrderItemModal.vue';
import EditOrderItemModal from '@/components/EditOrderItemModal.vue';
import QRCode from 'qrcode';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'vue-sonner';

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
const isRunner = ref(false);
const showJoinPrompt = ref(false);
const realtimeChannel = ref(null);
const showAddItemModal = ref(false);
const showShareModal = ref(false);
const showEditItemModal = ref(false);
const editingItem = ref(null);
const qrCodeUrl = ref('');
const participantIds = ref([]);

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
        console.log('this is the room id',roomID)
        
        // First, get the participant ID for this user in this room
        const { data: participantData, error: participantError } = await supabase
            .from('room_participants')
            .select('id')
            .eq('room_id', roomID)
            .eq('user_id', currentUser.value.id)
            .maybeSingle();
        
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

// Check if current user can edit an item (either owner or runner)
const canEditItem = (item) => {
    if (!currentUser.value) return false;
    
    // Check if user is the owner of this item
    const isOwner = item.user_id === currentUser.value.id;
    
    // Check if user is the runner
    const isRunnerUser = isRunner.value;
    
    return isOwner || isRunnerUser;
};

// Edit order item handler
const handleEditOrderItem = (item) => {
    if (!canEditItem(item)) {
        error.value = 'You can only edit your own items';
        return;
    }
    editingItem.value = { ...item };
    showEditItemModal.value = true;
};

// Update order item handler
const handleUpdateOrderItem = async (updatedData) => {
    try {
        if (!currentUser.value) {
            error.value = 'You need to be logged in to update order items';
            return;
        }
        
        loading.value = true;
        error.value = null;
        
        const updates = {
            item_name: updatedData.itemName,
            quantity: updatedData.quantity,
            unit_price: updatedData.unitPrice,
            notes: updatedData.notes || null
        };
        
        await updateOrderItem(editingItem.value.id, updates, currentUser.value.id);
        
        // Refresh the order items list
        await loadOrderItems();
        
        // Close the modal
        showEditItemModal.value = false;
        editingItem.value = null;
        
    } catch (err) {
        console.error('Error updating order item:', err);
        error.value = err.message || 'Failed to update order item.';
    } finally {
        loading.value = false;
    }
};

// Delete order item handler
const handleDeleteOrderItem = async (itemId, itemUserId) => {
    try {
        if (!currentUser.value) {
            error.value = 'You need to be logged in to delete order items';
            return;
        }
        
        // Check if user can delete this item
        const isOwner = itemUserId === currentUser.value.id;
        const isRunnerUser = isRunner.value;
        
        if (!isOwner && !isRunnerUser) {
            error.value = 'You can only delete your own items';
            return;
        }
        
        const confirmed = await new Promise((resolve) => {
            toast.warning('Delete this order item?', {
                action: {
                    label: 'Delete',
                    onClick: () => resolve(true),
                },
                cancel: {
                    label: 'Cancel',
                    onClick: () => resolve(false),
                },
                onDismiss: () => resolve(false),
            })
        })

        if (!confirmed) return

        
        loading.value = true;
        error.value = null;
        
        await deleteOrderItem(itemId, currentUser.value.id);
        
        // Refresh the order items list
        await loadOrderItems();
        
    } catch (err) {
        console.error('Error deleting order item:', err);
        error.value = err.message || 'Failed to delete order item.';
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
        // Validate UUID format
        if (!uuidRegex.test(roomID)) {
            console.error('Invalid room ID format:', roomID);
            error.value = 'Invalid room ID format. Please use a valid UUID.';
            room.value = null;
            return false;
        }

        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomID)
            .maybeSingle();

        console.log('this is the room id', roomID, data)

        if (error) {
            console.error('Error fetching room details:', error);
            error.value = 'Failed to load room details.';
            room.value = null;
            return false;
        }

        // Check if the room exists
        if (!data) {
            console.error('Room not found:', roomID);
            error.value = 'Room not found. Please check the room ID.';
            room.value = null;
            return false;
        }

        // Check if the room is active (no order_time or final_total yet)
        if (data.order_time || data.final_total) {
            console.error('Room is not active:', roomID);
            error.value = 'This room is not active. Only active rooms can be accessed.';
            room.value = null;
            return false;
        }

        room.value = data;
        return true;
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
        
        // Get participant IDs and update reactive state
        participantIds.value = participants.map(p => p.id);
        
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
            .in('participant_id', participantIds.value);
        
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

const checkRunnerStatus = async () => {
    if (!currentUser.value || !room.value) {
        isRunner.value = false;
        return false;
    }
    
    try {
        // Check if current user is the runner of this room
        const runner = room.value.runner_id === currentUser.value.id;
        isRunner.value = runner;
        return runner;
    } catch (err) {
        console.error('Error checking runner status:', err);
        isRunner.value = false;
        return false;
    }
};

const setupRealtimeSubscription = () => {
    if (!currentUser.value) return null;

    const channel = supabase
        .channel(`room-${roomID}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'room_participants',
                filter: `room_id=eq.${roomID}`,
            },
            async (payload) => {
                console.log('[Realtime] room_participants', payload);
                await loadOrderItems();
            }
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'order_items',
            },
            async (payload) => {
                // Optional: cek apakah item ini milik room ini
                if (participantIds.value.includes(payload.new.participant_id)) {
                    await loadOrderItems();
                }
            }
            )
        .on('channel_error', (err) => {
            console.error('Realtime channel error:', err);
            window.location.reload();
        })
        .on('presence', { event: 'sync' }, () => {
            console.log('Realtime presence sync');
        })
        .on('broadcast', { event: 'custom_event' }, (payload) => {
            console.log('Realtime broadcast:', payload);
        })
        .subscribe((status) => {
            console.log('[Realtime status]', status);
            if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to realtime updates');
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                console.error('Realtime subscription failed or disconnected:', status);
                window.location.reload();
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
        
        // Check if current user is the runner
        await checkRunnerStatus();
        
        // Load order data
        await loadOrderItems();
        
        // Load user profiles for all participants
        const userIds = Object.keys(userCache.value);
        if (userIds.length > 0) {
            await loadUserProfiles(userIds);
        }
        
        if (!realtimeChannel.value) {
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
