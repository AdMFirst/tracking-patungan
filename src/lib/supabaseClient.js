import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// ROOM OPERATIONS
// ============================================

/**
 * Create a new room
 *
 * @param {Object} roomData - Room data including title, restaurant, platform, etc.
 * @returns {Promise<Object>} Created room object with generated ID
 */
export async function createRoom(roomData) {
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
 * @param {Object} updates - Room data to update
 * @returns {Promise<Object>} Updated room object
 */
export async function updateRoom(roomID, updates) {
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
 * @param {string} userID - The ID of the user requesting deletion
 * @returns {Promise<void>}
 */
export async function deleteRoom(roomID, userID) {
    // Verify ownership
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

    if (roomData.runner_id !== userID) {
        console.error('Unauthorized: User is not the room owner');
        throw new Error('Unauthorized: You can only delete rooms you own');
    }

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
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of room objects
 */
export async function fetchUserRooms(userID, filters = {}) {
    try {
        let query = supabase
            .from('rooms')
            .select('*')
            .eq('runner_id', userID)
            .order('created_at', { ascending: false });

        // Apply filters
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
 * Fetch rooms where the user is a participant
 *
 * @param {string} userID - The ID of the user
 * @returns {Promise<Array>} Array of room objects
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
 * Fetch monthly spending summary
 *
 * @returns {Promise<Object>} Monthly spending data
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
 * Fetch complete room details including participants and user profiles
 *
 * @param {string} roomID - The ID of the room
 * @returns {Promise<Object|null>} Complete room object or null
 */
export async function fetchRoomWithParticipants(roomID) {
    try {
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

        const userIds = roomData.room_participants.map((p) => p.user_id);

        const { data: userProfiles, error: profilesError } = await supabase.rpc(
            'get_user_profiles',
            { user_ids: userIds }
        );

        if (profilesError) {
            console.error('Error fetching user profiles:', profilesError);
            throw profilesError;
        }

        const userProfileLookup = {};
        userProfiles.forEach((profile) => {
            userProfileLookup[profile.id] = profile;
        });

        const enhancedParticipants = roomData.room_participants.map(
            (participant) => ({
                ...participant,
                user_profile: userProfileLookup[participant.user_id] || {
                    display_name: null,
                    picture: null,
                },
            })
        );

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
 * Fetch basic room details
 *
 * @param {string} roomID - The ID of the room
 * @returns {Promise<Object|null>} Room details or null
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

// ============================================
// PARTICIPANT OPERATIONS
// ============================================

/**
 * Check if a user is a participant in a room
 *
 * @param {string} roomID - The ID of the room
 * @param {string} userID - The ID of the user
 * @returns {Promise<boolean>} True if user is a participant
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
            console.error('Error checking user participation:', error);
            throw error;
        }

        return !!data;
    } catch (error) {
        console.error('Error in checkUserParticipation:', error);
        return false;
    }
}

/**
 * Join a room as a participant
 *
 * @param {string} roomID - The ID of the room
 * @param {string} userID - The ID of the user
 * @returns {Promise<Object>} The created participant record
 */
export async function joinRoom(roomID, userID) {
    try {
        const { data, error } = await supabase
            .from('room_participants')
            .insert([{ room_id: roomID, user_id: userID }])
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
 * Handle payment confirmation for a room participant
 *
 * @param {string} roomID - The ID of the room
 * @param {string} paymentMethodID - The ID of the payment method
 * @param {string} userID - The ID of the user
 * @returns {Promise<Object>} Updated participant record
 */
export async function setParticipantAsPaid(roomID, paymentMethodID, userID) {
    try {
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
        console.error('Error in setParticipantAsPaid:', error);
        throw error;
    }
}

// ============================================
// ORDER ITEM OPERATIONS
// ============================================

/**
 * Fetch order items and participants for a room
 *
 * @param {string} roomID - The ID of the room
 * @returns {Promise<Object>} Object containing items and participants
 */
export async function fetchRoomOrderItems(roomID) {
    const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select('id, user_id')
        .eq('room_id', roomID);

    if (participantsError) throw participantsError;

    const participantIds = participants.map((p) => p.id);

    if (participantIds.length === 0) {
        return { items: [], participants };
    }

    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, room_participants(user_id)')
        .in('participant_id', participantIds);

    if (itemsError) throw itemsError;

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
 * @param {string} userID - The ID of the user
 * @param {Object} itemData - The item data
 * @returns {Promise<Object>} The created order item
 */
export async function addOrderItem(roomID, userID, itemData) {
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
 * Update an order item (with authorization check)
 *
 * @param {string} itemID - The ID of the order item
 * @param {Object} updates - Order item data to update
 * @returns {Promise<Object>} Updated order item
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
 * Delete an order item (with authorization check)
 *
 * @param {string} itemID - The ID of the order item
 * @returns {Promise<void>}
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

    const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemID);

    if (error) {
        throw error;
    }
}

// ============================================
// PAYMENT METHOD OPERATIONS
// ============================================

/**
 * Fetch payment methods for a user
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
 * Fetch payment methods for a room's runner
 *
 * @param {string} roomID - The ID of the room
 * @returns {Promise<Array>} Array of payment method objects
 */
export async function fetchPaymentMethodsByRoomID(roomID) {
    const { data, error } = await supabase.rpc('get_runner_payment_methods', {
        p_room_id: roomID,
    });

    if (error) {
        console.error('Error fetching payment methods:', error);
        console.debug(roomID)
        throw error;
    }
    return data || [];
}

/**
 * Add a new payment method
 *
 * @param {Object} paymentData - Payment method data
 * @returns {Promise<Object>} Created payment method
 */
export async function addPaymentMethod(paymentData) {
    const { data, error } = await supabase.rpc('create_payment_method', {
        p_tipe: paymentData.tipe,
        p_norek: paymentData.norek,
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
 * @param {string} methodID - The ID of the payment method
 * @param {Object} updates - Payment method data to update
 * @returns {Promise<Object>} Updated payment method
 */
export async function updatePaymentMethod(methodID, updates) {
    const { data, error } = await supabase.rpc('update_payment_method', {
        p_id: methodID,
        p_tipe: updates.tipe,
        p_norek: updates.norek,
    });

    if (error) {
        console.error('Error updating payment method:', error);
        throw error;
    }
    return data;
}

/**
 * Delete a payment method
 *
 * @param {string} methodID - The ID of the payment method
 * @returns {Promise<void>}
 */
export async function deletePaymentMethod(methodID) {
    const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodID);

    if (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
}

// ============================================
// USER PROFILE OPERATIONS
// ============================================

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

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

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

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

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