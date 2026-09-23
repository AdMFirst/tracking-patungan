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
                            <div
                                v-for="j in 2"
                                :key="j"
                                class="flex justify-between items-start"
                            >
                                <div class="flex-1">
                                    <div
                                        class="flex justify-between items-center mb-1"
                                    >
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
        <div
            v-else-if="error"
            class="text-center p-6 bg-red-50 rounded-lg border border-red-200"
        >
            <h2 class="text-xl font-semibold text-red-600 mb-2">
                {{ t('pages.activeRoom.errorTitle') }}
            </h2>
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
        <div
            v-else-if="!room && !error"
            class="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200"
        >
            <h2 class="text-xl font-semibold text-yellow-600 mb-2">
                {{ t('pages.activeRoom.roomNotAvailableTitle') }}
            </h2>
            <p class="text-gray-600 mb-4">
                {{
                    t('pages.activeRoom.roomNotAvailableDescription', {
                        roomId: roomID,
                    })
                }}
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
                        v-if="isRunner"
                        variant="outline"
                        size="icon"
                        @click="handleAddParticipantClick"
                        class="mr-2"
                    >
                        <UserPlus class="h-4 w-4 " />
                    </Button>
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
                    {{
                        t('pages.activeRoom.restaurantInfo', {
                            restaurant: room.restaurant,
                            platform: room.platform,
                        })
                    }}
                </p>
            </div>
            <Separator class="my-6" />
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-4">
                    {{ t('pages.activeRoom.cartTitle') }}
                </h2>
                <div
                    v-if="participantViewModels.length > 0"
                    class="space-y-6"
                >
                    <div
                        v-for="participant in participantViewModels"
                        :key="participant.id"
                        class="border rounded-lg p-4"
                    >
                        <div class="flex items-center justify-between space-x-3 mb-4">
                            <div class="flex items-center space-x-3">
                                <img
                                    v-if="participant.picture"
                                    :src="participant.picture"
                                    alt="User Avatar"
                                    class="w-10 h-10 rounded-full"
                                />
                                <h3 class="font-semibold">
                                    {{ participant.displayName }}
                                </h3>
                            </div>
                            <!-- button for runner to add items to all participants, disabled for self -->
                            <Button
                                v-if="isRunner"
                                :disabled="participant.isCurrentUser"
                                variant="secondary"
                                size="sm"
                                @click="handleAddOrderItemButton(participant)"
                            >
                                <Plus class="h-4 w-4" />
                            </Button>
                        </div>
                        <div class="text-sm">
                            <template
                                v-for="item in participant.items"
                                :key="item.id"
                            >
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <div
                                            class="flex justify-between items-center"
                                        >
                                            <span>
                                                {{ item.item_name }} x
                                                {{ item.quantity }}
                                                <span
                                                    class="text-muted-foreground"
                                                    >@
                                                    {{
                                                        formatCurrency(
                                                            item.unit_price
                                                        )
                                                    }}
                                                    {{
                                                        t(
                                                            'pages.activeRoom.each'
                                                        )
                                                    }}</span
                                                >
                                            </span>
                                            <span>{{
                                                formatCurrency(
                                                    item.unit_price *
                                                        item.quantity
                                                )
                                            }}</span>
                                        </div>
                                        <p
                                            v-if="item.notes"
                                            class="text-muted-foreground"
                                        >
                                            *{{ item.notes }}
                                        </p>
                                    </div>
                                    <div
                                        v-if="canEditItem(item)"
                                        class="flex space-x-2 ml-4"
                                    >
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
                                            @click="
                                                handleDeleteOrderItem(
                                                    item.id,
                                                    item.user_id
                                                )
                                            "
                                        >
                                            <Trash2 class="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </template>
                            <p
                                v-if="participant.items.length === 0"
                                class="text-muted-foreground"
                            >
                                {{ t('pages.activeRoom.noOrderItems') }}
                            </p>
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
        :isOpen="Boolean(showAddItemModal)"
        :participantName="showAddItemModal?.isCurrentUser ? null : showAddItemModal?.displayName"
        @update:open="showAddItemModal = $event"
        @itemAdded="handleAddOrderItem"
    />

    <!-- Edit Order Item Modal -->
    <EditOrderItemModal
        :isOpen="Boolean(showEditItemModal)"
        :participantName="
            // If the item belongs to a guest, show their name; if it belongs to a real user, show their display name; if it's the current user, show null
            (() => {
                const participant = participantViewModels.find(
                    (p) => p.items.some((i) => i.id === showEditItemModal?.id)
                );
                return participant?.isCurrentUser ? null : participant?.displayName;
            })()"
        :item="showEditItemModal"
        @update:open="showEditItemModal = $event"
        @itemUpdated="handleUpdateOrderItem"
    />

    <AddGuestParticipantModal
        :disabled="!isRunner"
        :isOpen="showAddParticipantModal"
        @update:open="showAddParticipantModal = $event"
        @participantAdded="handleAddParticipantDialog"
    />

    <!-- Floating Action Button -->
    <FloatingButton
        v-if="room && isParticipant"
        v-show="!loading"
        @click="handleAddOrderItemButton"
    />

    <!-- Share Modal -->
    <ShareModal
        v-model="showShareModal"
        :roomId="roomID"
        :room="room"
    />
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
    fetchUserProfiles,
    subscribeToRoomUpdates,
    supabase, // Kept for removeChannel if needed, though we could wrap that too
} from '@/lib/supabaseClient';
import Separator from '@/components/ui/separator/Separator.vue';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/button/Button.vue';
import { Share2, Edit2, Trash2, Plus, UserPlus } from 'lucide-vue-next';
import JoinRoomPrompt from '@/components/room/JoinRoomPrompt.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import FloatingButton from '@/components/common/FloatingButton.vue';
import AddOrderItemModal from '@/components/modals/AddOrderItemModal.vue';
import EditOrderItemModal from '@/components/modals/EditOrderItemModal.vue';
import ShareModal from '@/components/modals/ShareModal.vue';
import { toast } from 'vue-sonner';
import AddGuestParticipantModal from '@/components/modals/addGuestParticipantModal.vue';
import { useAddGuestParticipantMutation, useAddOrderItemMutation, useUpdateOrderItemMutation } from '@/lib/tanstackQueries';
import { useMutation } from '@tanstack/vue-query';

// State management
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const roomID = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;

// Raw state (single source of truth)
const room = ref(null);
const participants = ref([]);       // participant rows: { id, user_id, guest_name, guest_email, ... }
const userProfiles = ref({});       // keyed by user_id -> profile object
const orderItems = ref([]);         // order item rows

// UI / auth state
const loading = ref(true);
const error = ref(null);
const isParticipant = ref(false);       // check if user is already a participant in this room
const showJoinPrompt = ref(false);
const realtimeChannel = ref(null);
const showAddItemModal = ref(null);    // also used to store participantId for adding items to specific participant
const showEditItemModal = ref(null);   // also used to store item data for editing
const showShareModal = ref(false);
const showAddParticipantModal = ref(false);
let isFetchingData = false; // flag to prevent edge case race condition in loading subscription

// UUID validation regex
const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Runner is derived from room + currentUser, no need to store it separately
const isRunner = computed(() =>
    Boolean(
        currentUser.value &&
            room.value &&
            room.value.runner_id === currentUser.value.id
    )
);

// A set of participant ids for the realtime order-items filter
const participantIds = computed(
    () => new Set(participants.value.map((p) => p.id))
);

// Group order items by participant_id once
const orderItemsByParticipant = computed(() => {
    const map = Object.create(null);
    for (const item of orderItems.value) {
        if (!map[item.participant_id]) map[item.participant_id] = [];
        map[item.participant_id].push(item);
    }
    return map;
});

// Single derived view-model that joins participant + user profile + items
const participantViewModels = computed(() => {
    const itemsByParticipant = orderItemsByParticipant.value;

    return participants.value.map((participant) => {
        const profile = participant.user_id
            ? userProfiles.value[participant.user_id]
            : null;

        const displayName =
            profile?.display_name ||
            profile?.name ||
            profile?.full_name ||
            profile?.email ||
            participant.guest_name ||
            participant.guest_email ||
            t('pages.activeRoom.guest');

        const picture =
            profile?.picture ||
            profile?.avatar_url ||
            profile?.picture_url ||
            profile?.avatar ||
            null;

        const isGuest = !participant.user_id;

        return {
            id: participant.id,
            user_id: participant.user_id,
            guest_name: participant.guest_name,
            guest_email: participant.guest_email,
            displayName: (isGuest ? "["+t('pages.activeRoom.guest')+"] " : "") + displayName,
            picture,
            isCurrentUser: participant.user_id === currentUser.value?.id,
            items: itemsByParticipant[participant.id] || [],
        };
    });
});

const goBack = () => {
    router.push('/');
};

// Share functionality
const handleShareClick = () => {
    showShareModal.value = true;
};

const handleAddParticipantClick = () => {
    if (isRunner.value) showAddParticipantModal.value = true;
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
const handleAddOrderItemButton = (selectedParticipantViewModel) => {
    
    if (selectedParticipantViewModel) {
        showAddItemModal.value = selectedParticipantViewModel; // store the whole data in show addItemModal
    } else {
        // get participants in view model
        showAddItemModal.value = participantViewModels.value.find(
            (p) => p.isCurrentUser
        );
    }
}

const addOrderItemMutation = useMutation(useAddOrderItemMutation());

const handleAddOrderItem = async (itemData) => {
    try {
        if (!currentUser.value || !isParticipant.value) {
            error.value = t('pages.activeRoom.errors.participantRequired');
            return;
        }

        loading.value = true;
        error.value = null;

        console.debug('adding items for ', showAddItemModal.value.displayName, ' with this item', itemData);

        // `itemData` is whatever your form produces.
        // `showAddItemModal.value` is the participant the item is being added for.
        const data = await addOrderItemMutation.mutateAsync({
            roomID: roomID,
            participantID: showAddItemModal.value.id,   // <-- participant id, not user id
            itemName: itemData.itemName,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            notes: itemData.notes,
        });

        // `data` is the new item's UUID
        console.debug('Order item added successfully:', data);

        // The mutation's onSuccess already invalidated ['roomOrderItems', roomID],
        // which triggers a refetch if that query is mounted. You usually don't
        // need a manual reload — but if you're not using that query here, keep this:
        // await loadOrderItems();
    } catch (err) {
        console.error('Error adding order item:', err);
        const errMsg = err.message || t('pages.activeRoom.errors.addFailed');
        toast.error(errMsg);
    } finally {
        loading.value = false;
    }
};

// Check if current user can edit an item (either owner or runner)
const canEditItem = (item) => {
    if (!currentUser.value) return false;
    const isOwner = item.user_id === currentUser.value.id;
    return isOwner || isRunner.value;
};

// Edit order item handler
const handleEditOrderItem = (item) => {
    if (!canEditItem(item)) {
        toast.error(t('pages.activeRoom.errors.editOwnItems'));
        return;
    }
    showEditItemModal.value = item;
};

const editOrderItemMutation = useMutation(useUpdateOrderItemMutation())

// Update order item handler
const handleUpdateOrderItem = async (updatedData) => {
    try {
        if (!currentUser.value) {
            error.value = t('pages.activeRoom.errors.loginToUpdate');
            return;
        }

        loading.value = true;
        error.value = null;

        await editOrderItemMutation.mutateAsync({
            itemID: showEditItemModal.value.id,
            roomID: roomID,                       // scopes the cache invalidation
            itemName: updatedData.itemName,
            quantity: updatedData.quantity,
            unitPrice: updatedData.unitPrice,
            notes: updatedData.notes ?? null,
        })

        // Close the modal
        showEditItemModal.value = null;
    } catch (err) {
        console.error('Error updating order item:', err);
        const errMsg = err.message || t('pages.activeRoom.errors.updateFailed');
        toast.error(errMsg);
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
            toast.error(t('pages.activeRoom.errors.deleteOwnItems'));
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
            });
        });

        if (!confirmed) return;

        loading.value = true;
        error.value = null;

        await deleteOrderItem(itemId, currentUser.value.id);

        // Refresh the order items list
        await loadOrderItems();
    } catch (err) {
        console.error('Error deleting order item:', err);
        const errMsg = err.message || t('pages.activeRoom.errors.deleteFailed');
        toast.error(errMsg);
    } finally {
        loading.value = false;
    }
};

const addGuestParticipantMutation = useMutation(useAddGuestParticipantMutation);

const handleAddParticipantDialog = async (guestNameEmail) => {
    try {
        // Input is either a plain name like "john doe" or an email like "john@example.com"
        const isEmail = guestNameEmail.includes('@');
        const guestName = isEmail ? '' : guestNameEmail;
        const guestEmail = isEmail ? guestNameEmail : '';

        await addGuestParticipantMutation.mutateAsync({
            roomID,
            guestName,
            guestEmail,
        });

        // Refresh data after adding participant
        await loadRoomData();
        showAddParticipantModal.value = false;
        toast.success(t('pages.activeRoom.toast.participantAdded'));
    } catch (err) {
        console.error('Error adding participant:', err);
        const errMessage =
            err.message || t('pages.activeRoom.errors.addParticipantFailed');
        toast.error(errMessage);
    }
};

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

        // Check if the room is active (status must be 'open')
        if (data.status !== 'open') {
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
        const { items, participants: parts } = await fetchRoomOrderItems(roomID);

        participants.value = parts;
        orderItems.value = items;

        // Only fetch profiles for real users (guests have user_id = null)
        const missingUserIds = parts
            .map((p) => p.user_id)
            .filter((id) => id && !userProfiles.value[id]);

        if (missingUserIds.length > 0) {
            await loadUserProfiles(missingUserIds);
        }
    } catch (err) {
        console.error('Error fetching order items:', err);
        error.value = t('pages.activeRoom.errors.loadItemsFailed');
        orderItems.value = [];
        participants.value = [];
    }
};

const loadUserProfiles = async (userIds) => {
    const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
    if (uniqueIds.length === 0) return;

    try {
        const data = await fetchUserProfiles(uniqueIds);
        for (const user of data) {
            userProfiles.value[user.id] = user;
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
        const participant = await checkUserParticipation(
            roomID,
            currentUser.value.id
        );
        isParticipant.value = participant;
        showJoinPrompt.value = !participant;
        return participant;
    } catch (err) {
        console.error('Error checking participation:', err);
        error.value = t('pages.activeRoom.errors.checkParticipationFailed');
        return false;
    }
};

const setupRealtimeSubscription = () => {
    if (!currentUser.value) return null;

    // Clean up existing channel if one already exists
    if (realtimeChannel.value) {
        supabase.removeChannel(realtimeChannel.value);
        realtimeChannel.value = null;
    }

    return subscribeToRoomUpdates(roomID, {
        onParticipantsChange: async (payload) => {
            console.debug('[Realtime] room_participants', payload);
            // loadOrderItems() also fetches missing profiles for new users,
            // so this covers both new user joins and guest participants.
            await loadOrderItems();
        },
        onOrderItemsChange: async (payload) => {
            // Optional: cek apakah item ini milik room ini
            if (
                payload.eventType === 'DELETE' ||
                (payload.new &&
                    participantIds.value.has(payload.new.participant_id))
            ) {
                await loadOrderItems();
            }
        },
        onChannelError: (err) => {
            console.error('Realtime channel error:', err);
            // Don't force reload on channel errors, just log and let it reconnect
        },
        onRoomChange: (payload) => {
            if (payload.eventType === 'UPDATE' && payload.new) {
                const newStatus = payload.new.status;
                if (newStatus === 'closed') {
                    console.debug(
                        '[Realtime] Room closed, redirecting:',
                        roomID
                    );
                    // Clean up realtime subscription
                    if (realtimeChannel.value) {
                        supabase.removeChannel(realtimeChannel.value);
                        realtimeChannel.value = null;
                    }
                    // Redirect based on whether user is the runner
                    if (
                        currentUser.value &&
                        room.value &&
                        room.value.runner_id === currentUser.value.id
                    ) {
                        router.push('/myroom');
                    } else {
                        router.push('/histori');
                    }
                }
            }
        },
        onStatusChange: (status) => {
            console.debug('[Realtime status]', status);
            if (status === 'SUBSCRIBED') {
                console.debug('Successfully subscribed to realtime updates');
            } else if (
                status === 'CHANNEL_ERROR' ||
                status === 'CLOSED' ||
                status === 'TIMED_OUT'
            ) {
                console.error(
                    'Realtime subscription failed or disconnected:',
                    status
                );
                // we dont subscribe again since supabase has its own way to handle network disconnections and will try to reconnect automatically, so we just log it
            }
        },
    });
};

// Optimized data loading function
const loadRoomData = async () => {
    // prevent race condition
    if (isFetchingData) return;
    isFetchingData = true;

    try {
        loading.value = true;
        error.value = null;

        // Batch room details and participation check in parallel
        const [roomData, participationStatus] = await Promise.all([
            loadRoomDetails(),
            checkParticipation(),
        ]);

        if (!roomData || !participationStatus) {
            return;
        }

        // Load order data (this also loads user profiles for real users)
        await loadOrderItems();

        realtimeChannel.value = setupRealtimeSubscription();
    } catch (err) {
        console.error('Error loading room data:', err);
        error.value =
            err.message || t('pages.activeRoom.errors.loadDataFailed');
    } finally {
        loading.value = false;
        isFetchingData = false; // release the lock
    }
};

// Lifecycle hooks
onMounted(() => {
    loadRoomData();
});

onUnmounted(() => {
    if (realtimeChannel.value) {
        supabase.removeChannel(realtimeChannel.value);
        console.debug('Realtime subscription cleaned up');
    }
});
</script>