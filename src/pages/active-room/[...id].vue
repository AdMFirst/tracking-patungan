<template>
    <div class="container mx-auto p-4">
        <!-- Loading state -->
        <div v-if="loading" class="space-y-6">
            <!-- Skeleton Header -->
            <div class="flex justify-between items-center mb-4">
                <div class="flex flex-row gap-2">
                    <Skeleton class="h-8 w-8" />
                    <Skeleton class="h-8 w-48" />
                </div>
                <Skeleton class="h-8 w-8" />
            </div>
            
            <!-- Skeleton Restaurant Info -->
            <Skeleton class="h-4 w-1/4" />
            
            <!-- Skeleton Separator -->
            <Separator class="my-6" />
            
            <!-- Skeleton Cart Section -->
            <div class="mb-6">
                <Skeleton class="h-6 w-24 mb-4" />
                
                <!-- Skeleton Order Items -->
                <div class="space-y-6">
                    <div v-for="i in 2" :key="i" class="border rounded-lg p-4">
                        <div class="flex items-center space-x-3 mb-4">
                            <Skeleton class="w-10 h-10 rounded-full" />
                            <Skeleton class="h-4 w-32" />
                        </div>
                        <div class="text-sm space-y-3">
                            <div v-for="j in 2" :key="j" class="flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="flex justify-between items-center mb-1">
                                        <Skeleton class="h-4 w-48" />
                                        <Skeleton class="h-4 w-16" />
                                    </div>
                                    <Skeleton class="h-3 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
         
        <!-- Error state -->
        <div v-else-if="error" class="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 class="text-xl font-semibold text-red-600 mb-2">{{ t('pages.activeRoom.errorTitle') }}</h2>
            <p class="text-gray-600">{{ error }}</p>
            <Button variant="outline" class="mt-4" @click="goBack">
                {{ t('pages.activeRoom.goBack') }}
            </Button>
        </div>
        
        <!-- Join room prompt -->
        <div v-else-if="showJoinPrompt">
            <JoinRoomPrompt
                :roomId="roomID"
                :roomTitle="room?.title || t('pages.activeRoom.thisRoom')"
                @join="handleJoinRoom"
                @cancel="handleCancelJoin"
            />
        </div>
        
        <!-- Invalid room state -->
        <div v-else-if="!room && !error" class="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 class="text-xl font-semibold text-yellow-600 mb-2">{{ t('pages.activeRoom.roomNotAvailableTitle') }}</h2>
            <p class="text-gray-600 mb-4">
                {{ t('pages.activeRoom.roomNotAvailableDescription', { roomId: roomID }) }}
            </p>
            <Button variant="outline" @click="goBack">
                {{ t('pages.activeRoom.goBack') }}
            </Button>
        </div>
        
        <!-- Main room content for participants -->
        <div v-else>
            <PageHeader :title="room.title">
                <template #actions>
                    <Button
                        variant="outline"
                        size="icon"
                        @click="handleShareClick"
                    >
                        <Share2 class="h-4 w-4" />
                    </Button>
                </template>
            </PageHeader>
            <div class="mb-4">
                <p class="text-muted-foreground">
                    {{ t('pages.activeRoom.restaurantInfo', { restaurant: room.restaurant, platform: room.platform }) }}
                </p>
            </div>
            <Separator class="my-6" />
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4">{{ t('pages.activeRoom.cartTitle') }}</h2>
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
                                    t('pages.activeRoom.unknownUser')
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
                                                    {{ t('pages.activeRoom.each') }}</span
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
                    {{ t('pages.activeRoom.noOrderItems') }}
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
    <FloatingButton v-if="room && isParticipant" v-show="!loading" @click="showAddItemModal = true" />

    <!-- Share Modal -->
    <Dialog v-model:open="showShareModal">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{{ t('pages.activeRoom.shareRoomTitle') }}</DialogTitle>
                <DialogDescription>
                    {{ t('pages.activeRoom.shareRoomDescription') }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex justify-center py-4">
                <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="w-64 h-64" />
            </div>
            <DialogFooter>
                <Button variant="outline" @click="showShareModal = false">
                    {{ t('pages.activeRoom.close') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { user as currentUser } from '@/lib/auth';
import {
    checkUserParticipation,
    joinRoom,
    updateOrderItem,
    deleteOrderItem,
    fetchRoomDetails,
    fetchRoomOrderItems,
    addOrderItem,
    fetchUserProfiles,
    subscribeToRoomUpdates,
    supabase, // Kept for removeChannel if needed, though we could wrap that too
} from '@/lib/supabaseClient';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/button/Button.vue';
import { Share2, Edit2, Trash2 } from 'lucide-vue-next';
import JoinRoomPrompt from '@/components/room/JoinRoomPrompt.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import FloatingButton from '@/components/common/FloatingButton.vue';
import AddOrderItemModal from '@/components/modals/AddOrderItemModal.vue';
import EditOrderItemModal from '@/components/modals/EditOrderItemModal.vue';
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
const { t } = useI18n();
const roomID = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
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

const goBack = () => {
    router.push('/');
};

// Share functionality
const generateQRCode = async () => {
    try {
        const currentUrl = window.location.href;
        qrCodeUrl.value = await QRCode.toDataURL(currentUrl);
    } catch (err) {
        console.error('Error generating QR code:', err);
        error.value = t('pages.activeRoom.errors.generateQrFailed');
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
            error.value = t('pages.activeRoom.errors.loginToJoin');
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
        error.value = t('pages.activeRoom.errors.joinFailed');
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
            error.value = t('pages.activeRoom.errors.participantRequired');
            return;
        }
        
        loading.value = true;
        error.value = null;
        console.log('this is the room id',roomID)

        const data = await addOrderItem(roomID, currentUser.value.id, itemData);
        
        // Refresh the order items list
        await loadOrderItems();
        
        // Show success message or notification could be added here
        console.log('Order item added successfully:', data);
        
    } catch (err) {
        console.error('Error adding order item:', err);
        error.value = err.message || t('pages.activeRoom.errors.addFailed');
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
        error.value = t('pages.activeRoom.errors.editOwnItems');
        return;
    }
    editingItem.value = { ...item };
    showEditItemModal.value = true;
};

// Update order item handler
const handleUpdateOrderItem = async (updatedData) => {
    try {
        if (!currentUser.value) {
            error.value = t('pages.activeRoom.errors.loginToUpdate');
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
        error.value = err.message || t('pages.activeRoom.errors.updateFailed');
    } finally {
        loading.value = false;
    }
};

// Delete order item handler
const handleDeleteOrderItem = async (itemId, itemUserId) => {
    try {
        if (!currentUser.value) {
            error.value = t('pages.activeRoom.errors.loginToDelete');
            return;
        }
        
        // Check if user can delete this item
        const isOwner = itemUserId === currentUser.value.id;
        const isRunnerUser = isRunner.value;
        
        if (!isOwner && !isRunnerUser) {
            error.value = t('pages.activeRoom.errors.deleteOwnItems');
            return;
        }
        
        const confirmed = await new Promise((resolve) => {
            toast.warning(t('pages.activeRoom.toast.deleteConfirm'), {
                action: {
                    label: t('pages.activeRoom.toast.delete'),
                    onClick: () => resolve(true),
                },
                cancel: {
                    label: t('pages.activeRoom.toast.cancel'),
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
        error.value = err.message || t('pages.activeRoom.errors.deleteFailed');
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
        if (!roomID || !uuidRegex.test(roomID)) {
            console.error('Invalid room ID format:', roomID);
            error.value = t('pages.activeRoom.errors.invalidUuid');
            room.value = null;
            return false;
        }

        const data = await fetchRoomDetails(roomID);

        // Check if the room exists
        if (!data) {
            console.error('Room not found:', roomID);
            error.value = t('pages.activeRoom.errors.roomNotFound');
            room.value = null;
            return false;
        }

        // Check if the room is active (no final_total yet)
        if (data.final_total) {
            console.error('Room is not active:', roomID);
            error.value = t('pages.activeRoom.errors.roomClosed');
            room.value = null;
            return false;
        }

        room.value = data;
        return true;
    } catch (err) {
        console.error('Error fetching room details:', err);
        error.value = t('pages.activeRoom.errors.loadDetailsFailed');
        room.value = null;
        return false;
    }
};

const loadOrderItems = async () => {
    try {
        const { items, participants } = await fetchRoomOrderItems(roomID);
        
        // Get participant IDs and update reactive state
        participantIds.value = participants.map(p => p.id);
        
        // Build user cache from participants
        participants.forEach(p => {
            if (!userCache.value[p.user_id]) {
                userCache.value[p.user_id] = { id: p.user_id };
            }
        });
        
        orderItems.value = items;
    } catch (err) {
        console.error('Error fetching order items:', err);
        error.value = t('pages.activeRoom.errors.loadItemsFailed');
        orderItems.value = [];
    }
};

const loadUserProfiles = async (userIds) => {
    if (!userIds || userIds.length === 0) return;
    
    try {
        const data = await fetchUserProfiles(userIds);
        data.forEach((user) => {
            userCache.value[user.id] = user;
        });
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
        error.value = t('pages.activeRoom.errors.checkParticipationFailed');
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

    return subscribeToRoomUpdates(roomID, {
        onParticipantsChange: async (payload) => {
                console.log('[Realtime] room_participants', payload);
                // If a new user joined, fetch their profile
                if (payload.event === 'INSERT' && payload.new) {
                    const newUserId = payload.new.user_id;
                    if (newUserId && !userCache.value[newUserId]) {
                        console.log('New user joined, fetching profile:', newUserId);
                        await loadUserProfiles([newUserId]);
                    }
                }
                await loadOrderItems();
        },
        onOrderItemsChange: async (payload) => {
                // Optional: cek apakah item ini milik room ini
                if (participantIds.value.includes(payload.new.participant_id)) {
                    await loadOrderItems();
                }
        },
        onChannelError: (err) => {
            console.error('Realtime channel error:', err);
            // Don't force reload on channel errors, just log and let it reconnect
        },
        onStatusChange: (status) => {
            console.log('[Realtime status]', status);
            if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to realtime updates');
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                console.error('Realtime subscription failed or disconnected:', status);
                // Don't force reload on navigation/disconnection - let it reconnect naturally
                // Only force reload for critical errors that can't be recovered
                if (status === 'CHANNEL_ERROR') {
                    // For actual channel errors, we might want to reload, but not for normal disconnections
                    setTimeout(() => {
                        if (!realtimeChannel.value) {
                            console.log('Attempting to re-establish realtime connection...');
                            realtimeChannel.value = setupRealtimeSubscription();
                        }
                    }, 3000);
                }
            }
        }
    });
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
        error.value = err.message || t('pages.activeRoom.errors.loadDataFailed');
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
