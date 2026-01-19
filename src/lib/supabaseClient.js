import { createClient } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a new room
 *
 * @param {Object} roomData - Room data including title, restaurant, platform, etc.
 * @returns {Promise<Object>} Created room object with generated ID
 *
 * @example
 * const newRoom = await createRoom({
 *     title: 'Lunch Order',
 *     restaurant: 'McDonalds',
 *     platform: 'Gojek'
 * });
 *
 * @usedIn
 * - src/pages/create-room.vue - Room creation form
 *
 * @cacheInvalidation ['userRooms'] - Clears user rooms cache after creation
 * @mutationBenefit Ensures new rooms appear immediately in lists
 */
export async function createRoom(roomData) {
    // Create a new room in the database using Supabase
    const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error creating room:', error);
        throw error;
    }

    return data;
}

/**
 * Update a room
 *
 * @param {string} roomID - The ID of the room to update
 * @param {Object} updates - Room data to update (title, restaurant, platform, etc.)
 * @returns {Promise<Object>} Updated room object
 *
 * @example
 * const updatedRoom = await updateRoom('room-123', {
 *     title: 'Updated Lunch Order',
 *     final_total: 150000
 * });
 *
 * @usedIn
 * - src/pages/myroom/[...roomID].vue - Room management/editing
 *
 * @cacheInvalidation ['roomDetails', 'userRooms'] - Clears relevant caches after update
 * @mutationBenefit Ensures updated data is reflected immediately across the app
 */
export async function updateRoom(roomID, updates) {
    // Update the room in the database using Supabase
    const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomID)
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error updating room:', error);
        throw error;
    }

    return data;
}

/**
 * Delete a room
 *
 * @param {string} roomID - The ID of the room to delete
 * @param {string} userID - The ID of the user requesting deletion (for security)
 * @returns {Promise<void>} Resolves when room is successfully deleted
 *
 * @example
 * await deleteRoom('room-123', 'user-123');
 *
 * @usedIn
 * - src/pages/myroom/index.vue - Room deletion from user's room list
 *
 * @cacheInvalidation ['roomDetails', 'userRooms', 'joinedRooms'] - Clears relevant caches after deletion
 * @mutationBenefit Ensures deleted rooms are removed immediately from all lists
 * @security Only allows deletion if user is the room owner
 */
export async function deleteRoom(roomID, userID) {
    // First verify the user is the owner of the room for security
    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('runner_id')
        .eq('id', roomID)
        .maybeSingle();

    if (roomError) {
        console.error('Error verifying room ownership:', roomError);
        throw roomError;
    }

    if (!roomData) {
        console.error('Room not found');
        throw new Error('Room not found');
    }

    // Only allow deletion if the user is the room owner
    if (roomData.runner_id !== userID) {
        console.error('Unauthorized: User is not the room owner');
        throw new Error('Unauthorized: You can only delete rooms you own');
    }

    // Delete the room from the database using Supabase
    const { error } = await supabase.from('rooms').delete().eq('id', roomID);

    if (error) {
        console.error('Error deleting room:', error);
        throw error;
    }
}

/**
 * Fetch rooms for a user (rooms where user is the runner)
 *
 * @param {string} userID - The ID of the user
 * @param {Object} filters - Optional filters (search, platform, restaurant, dateFrom, dateTo)
 * @returns {Promise<Array>} Array of room objects
 *
 * @example
 * // Basic usage
 * const rooms = await fetchUserRooms('user-123');
 *
 * // With filters
 * const filteredRooms = await fetchUserRooms('user-123', {
 *     platform: 'Gojek',
 *     search: 'lunch'
 * });
 *
 * @usedIn
 * - src/pages/myroom/index.vue - User's room list
 *
 * @cacheKey ['userRooms', userID, JSON.stringify(filters)]
 * @cacheBenefit Dramatically reduces API calls when navigating between room lists
 */
export async function fetchUserRooms(userID, filters = {}) {
    try {
        // Start with base query for rooms where user is the runner
        let query = supabase
            .from('rooms')
            .select('*')
            .eq('runner_id', userID)
            .order('created_at', { ascending: false });

        // Apply filters if provided
        if (filters.search) {
            const searchTerm = `%${filters.search.toLowerCase()}%`;
            query = query.or(
                `title.ilike.${searchTerm},restaurant.ilike.${searchTerm},platform.ilike.${searchTerm}`
            );
        }

        if (filters.platform) {
            query = query.eq('platform', filters.platform);
        }

        if (filters.restaurant) {
            query = query.eq('restaurant', filters.restaurant);
        }

        if (filters.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
        }

        if (filters.dateTo) {
            // Add 23:59:59 to include entire end date
            const endOfDay = new Date(filters.dateTo);
            endOfDay.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endOfDay.toISOString());
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching user rooms:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchUserRooms:', error);
        return [];
    }
}

/**
 * Fetch rooms where the user is a participant (joined rooms)
 *
 * @param {string} userID - The ID of the user
 * @returns {Promise<Array>} Array of room objects where user is a participant
 *
 * @example
 * const joinedRooms = await fetchJoinedRooms('user-123');
 *
 * @usedIn
 * - src/pages/histori/index.vue - User's order history
 *
 * @cacheKey ['joinedRooms', userID]
 * @cacheBenefit Avoids refetching user's joined rooms on history page navigation
 */
export async function fetchJoinedRooms(userID) {
    const { data, error } = await supabase.rpc('get_my_room_order_details');

    if (error) {
        console.error('Failed to fetch joined rooms:', error);
        throw error;
    }

    return data;
}

/**
 * Fetch monthly spending summary for the current user
 *
 * @returns {Promise<Object>} Monthly spending data object
 *
 * @example
 * const spending = await fetchMonthlySpending();
 *
 * @usedIn
 * - src/pages/index.vue - Dashboard spending summary
 *
 * @cacheKey ['monthlySpending']
 * @cacheBenefit Avoids refetching spending data on dashboard navigation
 */
export async function fetchMonthlySpending() {
    const { data, error } = await supabase.rpc('get_my_monthly_spending');

    if (error) {
        console.error('Failed to fetch monthly spending:', error);
        throw error;
    }

    return data;
}

/**
 * Check if a user is a participant in a room
 *
 * @param {string} roomID - The ID of the room to check
 * @param {string} userID - The ID of the user to check
 * @returns {Promise<boolean>} True if user is a participant, false otherwise
 *
 * @example
 * const isParticipant = await checkUserParticipation('room-123', 'user-123');
 *
 * @usedIn
 * - src/pages/active-room/[...id].vue - Check user participation before showing room details
 */
export async function checkUserParticipation(roomID, userID) {
    try {
        const { data, error } = await supabase
            .from('room_participants')
            .select('id')
            .eq('room_id', roomID)
            .eq('user_id', userID)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found
            console.error('Error checking user participation:', error);
            throw error;
        }

        return !!data; // Return true if data exists, false otherwise
    } catch (error) {
        console.error('Error in checkUserParticipation:', error);
        return false;
    }
}

/**
 * Join a room as a participant
 *
 * @param {string} roomID - The ID of the room to join
 * @param {string} userID - The ID of the user joining
 * @returns {Promise<Object>} The created participant record
 *
 * @example
 * const participant = await joinRoom('room-123', 'user-123');
 *
 * @usedIn
 * - src/pages/active-room/[...id].vue - Allow users to join rooms they're not yet participating in
 */
export async function joinRoom(roomID, userID) {
    try {
        const { data, error } = await supabase
            .from('room_participants')
            .insert([
                {
                    room_id: roomID,
                    user_id: userID,
                },
            ])
            .select()
            .maybeSingle();

        if (error) {
            console.error('Error joining room:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in joinRoom:', error);
        throw error;
    }
}

/**
 * Update an order item
 *
 * @param {string} itemID - The ID of the order item to update
 * @param {Object} updates - Order item data to update
 * @param {string} userID - The ID of the user requesting the update (for security)
 * @returns {Promise<Object>} Updated order item object
 *
 * @example
 * const updatedItem = await updateOrderItem('item-123', {
 *     item_name: 'Updated Item',
 *     quantity: 2,
 *     unit_price: 15000
 * }, 'user-123');
 *
 * @usedIn
 * - src/pages/active-room/[...id].vue - Runner editing order items
 *
 * @security Only allows update if user is the room runner
 */
export async function updateOrderItem(itemID, updates) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Not authenticated');
    }

    const userID = user.id;

    // Fetch item + participant + room
    const { data: itemData, error: itemError } = await supabase
        .from('order_items')
        .select(
            `
        id,
        room_participants (
            room_id,
            user_id
        )
        `
        )
        .eq('id', itemID)
        .maybeSingle();

    if (itemError || !itemData) {
        throw new Error('Order item not found');
    }

    const { room_id, user_id: ownerID } = itemData.room_participants;

    // Fetch runner
    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('runner_id')
        .eq('id', room_id)
        .maybeSingle();

    if (roomError || !roomData) {
        throw new Error('Room not found');
    }

    if (ownerID !== userID && roomData.runner_id !== userID) {
        throw new Error('Unauthorized');
    }

    // Update (RLS enforces final authority)
    const { data, error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', itemID)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Delete an order item
 *
 * @param {string} itemID - The ID of the order item to delete
 * @param {string} userID - The ID of the user requesting deletion (for security)
 * @returns {Promise<void>} Resolves when order item is successfully deleted
 *
 * @example
 * await deleteOrderItem('item-123', 'user-123');
 *
 * @usedIn
 * - src/pages/active-room/[...id].vue - Runner deleting order items
 *
 * @security Only allows deletion if user is the room runner
 */
export async function deleteOrderItem(itemID) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Not authenticated');
    }

    const userID = user.id;

    // Fetch item + participant + room
    const { data: itemData, error: itemError } = await supabase
        .from('order_items')
        .select(
            `
        id,
        room_participants (
            room_id,
            user_id
        )
        `
        )
        .eq('id', itemID)
        .maybeSingle();

    if (itemError || !itemData) {
        throw new Error('Order item not found');
    }

    const { room_id, user_id: ownerID } = itemData.room_participants;

    // Fetch runner
    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('runner_id')
        .eq('id', room_id)
        .maybeSingle();

    if (roomError || !roomData) {
        throw new Error('Room not found');
    }

    if (ownerID !== userID && roomData.runner_id !== userID) {
        throw new Error('Unauthorized');
    }

    // Delete (RLS enforces final authority)
    const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemID);

    if (error) {
        throw error;
    }
}

/**
 * Fetch complete room details including participants and user profiles
 *
 * @param {string} roomID - The ID of the room to fetch complete details for
 * @returns {Promise<Object|null>} Complete room object with participants and profiles, or null if not found
 *
 * @example
 * const roomWithParticipants = await fetchRoomWithParticipants('room-123');
 *
 * @usedIn
 * - src/pages/myroom/[...roomID].vue - Room management with full participant info
 *
 * @cacheKey ['roomWithParticipants', roomID]
 * @cacheBenefit Avoids expensive multi-query operations when viewing the same room multiple times
 * @complexity High - Makes multiple RPC calls and data transformations
 */
export async function fetchRoomWithParticipants(roomID) {
    try {
        // Step 1: Fetch room and participants data using joins
        const { data: roomData, error: roomError } = await supabase.rpc(
            'get_room_with_participants',
            { p_room_id: roomID }
        );

        if (roomError) {
            console.error('Error fetching room with participants:', roomError);
            throw roomError;
        }

        if (!roomData) {
            return null;
        }

        // Step 2: Get user IDs from participants
        const userIds = roomData.room_participants.map((p) => p.user_id);

        // Step 3: Fetch user profiles using RPC
        const { data: userProfiles, error: profilesError } = await supabase.rpc(
            'get_user_profiles',
            {
                user_ids: userIds,
            }
        );

        if (profilesError) {
            console.error('Error fetching user profiles:', profilesError);
            throw profilesError;
        }

        // Step 4: Create a lookup for user profiles
        const userProfileLookup = {};
        userProfiles.forEach((profile) => {
            userProfileLookup[profile.id] = profile;
        });

        // Step 5: Enhance participants with user profile data
        const enhancedParticipants = roomData.room_participants.map(
            (participant) => ({
                ...participant,
                user_profile: userProfileLookup[participant.user_id] || {
                    display_name: null,
                    picture: null,
                },
            })
        );

        // Return enhanced data structure
        return {
            ...roomData,
            room_participants: enhancedParticipants,
        };
    } catch (error) {
        console.error('Error in fetchRoomWithParticipants:', error);
        return null;
    }
}

/**
 * Handle payment confirmation for a room participant
 *
 * @param {string} roomID - The ID of the room
 * @param {string} paymentMethodID - The ID of the payment method used
 * @param {string} userID - The ID of the user confirming payment
 * @returns {Promise<Object>} Updated participant record with payment information
 *
 * @example
 * const updatedParticipant = await handlePaymentConfirmed('room-123', 'payment-method-456', 'user-789');
 *
 * @usedIn
 * - src/components/room/OrderRooms.vue - Payment confirmation handling
 *
 * @cacheInvalidation ['joinedRooms', 'roomDetails'] - Clears relevant caches after payment confirmation
 * @mutationBenefit Ensures paid status is reflected immediately across the app
 */
export async function setParticipantAsPaid(roomID, paymentMethodID, userID) {
    try {
        // First, verify the user is a participant in this room
        const { data: participant, error: participantError } = await supabase
            .from('room_participants')
            .select('id')
            .eq('room_id', roomID)
            .eq('user_id', userID)
            .maybeSingle();

        if (participantError) {
            console.error('Error finding participant:', participantError);
            throw new Error('Participant not found in this room');
        }

        // Update the participant record with payment information
        const { data: updatedParticipant, error: updateError } = await supabase
            .from('room_participants')
            .update({
                paid_at: new Date().toISOString(),
                paid_via: paymentMethodID,
            })
            .eq('id', participant.id)
            .select()
            .maybeSingle();

        if (updateError) {
            console.error('Error updating payment status:', updateError);
            throw updateError;
        }

        return updatedParticipant;
    } catch (error) {
        console.error('Error in handlePaymentConfirmed:', error);
        throw error;
    }
}

/**
 * Fetch basic room details
 *
 * @param {string} roomID - The ID of the room
 * @returns {Promise<Object|null>} Room details or null if not found
 */
export async function fetchRoomDetails(roomID) {
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomID)
        .maybeSingle();

    if (error) throw error;
    return data;
}

/**
 * Fetch order items and participants for a room
 *
 * @param {string} roomID - The ID of the room
 * @returns {Promise<Object>} Object containing items and participants
 */
export async function fetchRoomOrderItems(roomID) {
    // Get all participants in this room first
    const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select('id, user_id')
        .eq('room_id', roomID);

    if (participantsError) throw participantsError;

    const participantIds = participants.map((p) => p.id);

    if (participantIds.length === 0) {
        return { items: [], participants };
    }

    // Now get all order items for these participants
    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, room_participants(user_id)')
        .in('participant_id', participantIds);

    if (itemsError) throw itemsError;

    // Map the data to include user_id from the participant relationship
    const mappedItems = items.map((item) => ({
        ...item,
        user_id: item.room_participants?.user_id || item.user_id,
    }));

    return { items: mappedItems, participants };
}

/**
 * Add a new order item
 *
 * @param {string} roomID - The ID of the room
 * @param {string} userID - The ID of the user adding the item
 * @param {Object} itemData - The item data (itemName, quantity, unitPrice, notes)
 * @returns {Promise<Object>} The created order item
 */
export async function addOrderItem(roomID, userID, itemData) {
    // First, get the participant ID for this user in this room
    const { data: participantData, error: participantError } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', roomID)
        .eq('user_id', userID)
        .maybeSingle();

    if (participantError) throw participantError;

    if (!participantData) {
        throw new Error('Participant not found');
    }

    // Insert the new order item into the database
    const { data, error } = await supabase
        .from('order_items')
        .insert([
            {
                participant_id: participantData.id,
                item_name: itemData.itemName,
                quantity: itemData.quantity,
                unit_price: itemData.unitPrice,
                notes: itemData.notes || null,
            },
        ])
        .select()
        .maybeSingle();

    if (error) throw error;

    return data;
}

/**
 * Fetch user profiles
 *
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Array>} Array of user profiles
 */
export async function fetchUserProfiles(userIds) {
    if (!userIds || userIds.length === 0) return [];

    const { data, error } = await supabase.rpc('get_user_profiles', {
        user_ids: userIds,
    });

    if (error) throw error;

    return data;
}

/**
 * Subscribe to room updates
 *
 * @param {string} roomID - The ID of the room
 * @param {Object} callbacks - Callbacks for events
 * @returns {Object} The realtime channel
 */
export function subscribeToRoomUpdates(roomID, callbacks) {
    const channel = supabase.channel(`room-${roomID}`);

    channel
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'room_participants',
                filter: `room_id=eq.${roomID}`,
            },
            (payload) => {
                if (callbacks.onParticipantsChange)
                    callbacks.onParticipantsChange(payload);
            }
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'order_items',
            },
            (payload) => {
                if (callbacks.onOrderItemsChange)
                    callbacks.onOrderItemsChange(payload);
            }
        )
        .on('channel_error', (err) => {
            if (callbacks.onChannelError) callbacks.onChannelError(err);
        })
        .subscribe((status) => {
            if (callbacks.onStatusChange) callbacks.onStatusChange(status);
        });

    return channel;
}

// TanStack Query wrappers for Supabase operations

/**
 * Query for fetching user rooms with TanStack Query
 */
export function useUserRoomsQuery(userID, filters = {}) {
    return {
        queryKey: ['userRooms', userID, JSON.stringify(filters)],
        queryFn: () => fetchUserRooms(userID, filters),
    };
}

/**
 * Query for fetching joined rooms with TanStack Query
 */
export function useJoinedRoomsQuery(userID) {
    return {
        queryKey: ['joinedRooms', userID],
        queryFn: () => fetchJoinedRooms(userID),
    };
}

/**
 * Query for fetching monthly spending with TanStack Query
 */
export function useMonthlySpendingQuery() {
    return {
        queryKey: ['monthlySpending'],
        queryFn: fetchMonthlySpending,
    };
}

/**
 * Query for fetching room details with TanStack Query
 */
export function useRoomDetailsQuery(roomID) {
    return {
        queryKey: ['roomDetails', roomID],
        queryFn: () => fetchRoomDetails(roomID),
    };
}

/**
 * Query for fetching room with participants with TanStack Query
 */
export function useRoomWithParticipantsQuery(roomID) {
    return {
        queryKey: ['roomWithParticipants', roomID],
        queryFn: () => fetchRoomWithParticipants(roomID),
    };
}

/**
 * Mutation for creating a room
 */
export function useCreateRoomMutation() {
    return {
        mutationFn: createRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userRooms'] });
        },
    };
}

/**
 * Mutation for updating a room
 */
export function useUpdateRoomMutation() {
    return {
        mutationFn: ({ roomID, updates }) => updateRoom(roomID, updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['roomDetails', variables.roomID],
            });
            queryClient.invalidateQueries({ queryKey: ['userRooms'] });
        },
    };
}

/**
 * Mutation for deleting a room
 */
export function useDeleteRoomMutation() {
    return {
        mutationFn: ({ roomID, userID }) => deleteRoom(roomID, userID),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['roomDetails', variables.roomID],
            });
            queryClient.invalidateQueries({ queryKey: ['userRooms'] });
            queryClient.invalidateQueries({ queryKey: ['joinedRooms'] });
        },
    };
}

/**
 * Mutation for joining a room
 */
export function useJoinRoomMutation() {
    return {
        mutationFn: ({ roomID, userID }) => joinRoom(roomID, userID),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['joinedRooms', variables.userID],
            });
            queryClient.invalidateQueries({
                queryKey: ['roomWithParticipants', variables.roomID],
            });
        },
    };
}

/**
 * Mutation for setting participant as paid
 */
export function useSetParticipantAsPaidMutation() {
    return {
        mutationFn: ({ roomID, paymentMethodID, userID }) =>
            setParticipantAsPaid(roomID, paymentMethodID, userID),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['joinedRooms', variables.userID],
            });
            queryClient.invalidateQueries({
                queryKey: ['roomWithParticipants', variables.roomID],
            });
        },
    };
}

/**
 * Mutation for adding an order item
 */
export function useAddOrderItemMutation() {
    return {
        mutationFn: ({ roomID, userID, itemData }) =>
            addOrderItem(roomID, userID, itemData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['roomOrderItems', variables.roomID],
            });
        },
    };
}

/**
 * Mutation for updating an order item
 */
export function useUpdateOrderItemMutation() {
    return {
        mutationFn: (itemID, updates) => updateOrderItem(itemID, updates),
        onSuccess: (_, itemID) => {
            queryClient.invalidateQueries({ queryKey: ['roomOrderItems'] });
        },
    };
}

/**
 * Mutation for deleting an order item
 */
export function useDeleteOrderItemMutation() {
    return {
        mutationFn: (itemID) => deleteOrderItem(itemID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roomOrderItems'] });
        },
    };
}

/**
 * Query for fetching room order items
 */
export function useRoomOrderItemsQuery(roomID) {
    return {
        queryKey: ['roomOrderItems', roomID],
        queryFn: () => fetchRoomOrderItems(roomID),
    };
}

/**
 * Query for fetching user profiles
 */
export function useUserProfilesQuery(userIds) {
    return {
        queryKey: ['userProfiles', JSON.stringify(userIds)],
        queryFn: () => fetchUserProfiles(userIds),
        enabled: !!userIds && userIds.length > 0,
    };
}

// Payment Method Functions

/**
 * Fetch payment methods for a user by login info
 *
 * @returns {Promise<Array>} Array of payment method objects
 */
export async function fetchPaymentMethods() {
    const { data, error } = await supabase.rpc('list_payment_methods');

    if (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
    }
    return data || [];
}

/**
 * Fetch payment methods for a user by room id
 *
 * @param {string} RoomID - The ID of the room to check the runner payment method
 * @returns {Promise<Array>} Array of payment method objects
 */
export async function fetchPaymentMethodsByRoomID(RoomID) {
    const { data, error } = await supabase.rpc('get_runner_payment_methods', {
        p_room_id: RoomID
    });

    if (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
    }
    return data || [];
}


/**
 * Add a new payment method
 *
 * @param {Object} paymentData - Payment method data
 * @returns {Promise<Object>} Created payment method object
 */
export async function addPaymentMethod(paymentData) {
    const { data, error } = await supabase.rpc('create_payment_method', {
        p_tipe: paymentData.tipe,
        p_norek: paymentData.norek
    });

    if (error) {
        console.error('Error adding payment method:', error);
        throw error;
    }
    return data;
}

/**
 * Update a payment method
 *
 * @param {string} methodID - The ID of the payment method to update
 * @param {Object} updates - Payment method data to update
 * @returns {Promise<Object>} Updated payment method object
 */
export async function updatePaymentMethod(methodID, updates) {
    const { data, error } = await supabase.rpc('update_payment_method', {
        p_id: methodID,
        p_tipe: updates.tipe,
        p_norek: updates.norek
    })

    if (error) {
        console.error('Error updating payment method:', error);
        throw error;
    }
    return data;
}

/**
 * Delete a payment method
 *
 * @param {string} methodID - The ID of the payment method to delete
 * @returns {Promise<void>} Resolves when payment method is successfully deleted
 */
export async function deletePaymentMethod(methodID) {
    // don't need to rpc since nothing is decrypted on delete
    const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodID);

    if (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
}

// TanStack Query wrappers for payment method operations

/**
 * Query for fetching payment methods with TanStack Query
 */
export function usePaymentMethodsQuery() {
    return {
        queryKey: ['myPaymentMethods'],
        queryFn: () => fetchPaymentMethods()
    };
}

/**
 * Query for fetching payment methods with TanStack Query
 */
export function usePaymentMethodsByRoomIDQuery(RoomID) {
    return {
        queryKey: ['myPaymentMethods'],
        queryFn: () => fetchPaymentMethodsByRoomID(RoomID),
        enabled: !!RoomID,
    };
}

/**
 * Mutation for adding a payment method
 */
export function useAddPaymentMethodMutation() {
    return {
        mutationFn: addPaymentMethod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myPaymentMethods'] });
        },
    };
}

/**
 * Mutation for updating a payment method
 */
export function useUpdatePaymentMethodMutation() {
    return {
        mutationFn: ({ methodID, updates }) => updatePaymentMethod(methodID, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myPaymentMethods'] });
        },
    };
}

/**
 * Mutation for deleting a payment method
 */
export function useDeletePaymentMethodMutation() {
    return {
        mutationFn: deletePaymentMethod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myPaymentMethods'] });
        },
    };
}

/**
 * Fetch system notifications
 *
 * @param {string} lastCheckDate - ISO date string
 * @returns {Promise<Array>} Array of notifications
 */
export async function fetchSystemNotifications(lastCheckDate) {
    const { data, error } = await supabase
        .from('notification')
        .select('*')
        .gt('created_at', lastCheckDate)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Check and display system notifications
 * This function handles the complete notification workflow:
 * 1. Gets the last check time from localStorage
 * 2. Only checks if more than 6 hours have passed since last check
 * 3. Fetches new notifications since that time
 * 4. Displays them using toast notifications
 * 5. Updates the last check time
 *
 * @returns {Promise<void>}
 */
export async function checkAndDisplaySystemNotifications() {
    const STORAGE_KEY = 'talangin_last_notif_check';
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = new Date();
    const nowISO = now.toISOString();

    // If first time (no stored value), just mark current time and exit
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, nowISO);
        return;
    }

    // Check if less than 6 hours have passed since last check
    const lastCheckDate = new Date(stored);
    const hoursSinceLastCheck = (now - lastCheckDate) / (1000 * 60 * 60);
    
    if (hoursSinceLastCheck < 6) {
        // Don't bother checking again if less than 6 hours have passed
        return;
    }

    try {
        // Fetch notifications created after the last check
        const notifications = await fetchSystemNotifications(stored);

        // Show notifications if any exist
        if (notifications && notifications.length > 0) {
            notifications.forEach((n) => {
                const type = n.type?.toLowerCase();
                const title = n.tittle || 'Notification';
                const description = n.message;
                const toastOptions = {
                    description,
                    duration: 5000,
                };

                // Show appropriate toast based on notification type
                switch (type) {
                    case 'success':
                        toast.success(title, toastOptions);
                        break;
                    case 'warning':
                        toast.warning(title, toastOptions);
                        break;
                    case 'error':
                        toast.error(title, toastOptions);
                        break;
                    case 'info':
                        toast.info(title, toastOptions);
                        break;
                    default:
                        toast(title, toastOptions);
                        break;
                }
            });
        }

        // Update the last check time to current time
        localStorage.setItem(STORAGE_KEY, nowISO);

    } catch (err) {
        console.error('Error fetching system notifications:', err);
    }
}

// Create and export QueryClient instance
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: 2,
        },
        mutations: {
            retry: 2,
        },
    },
});
