import { createClient } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/vue-query';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

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
        .single();

    if (error) {
        console.error('Error creating room:', error);
        throw error;
    }

    // Invalidate relevant caches after creating a room
    queryClient.invalidateQueries({ queryKey: ['userRooms'] });

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
        .single();

    if (error) {
        console.error('Error updating room:', error);
        throw error;
    }

    // Invalidate relevant caches after updating a room
    queryClient.invalidateQueries({ queryKey: ['roomDetails', roomID] });
    queryClient.invalidateQueries({ queryKey: ['userRooms'] });

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
        .single();

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
    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomID);

    if (error) {
        console.error('Error deleting room:', error);
        throw error;
    }

    // Invalidate relevant caches after deleting a room
    // Use exact cache key pattern that matches fetchUserRooms
    queryClient.invalidateQueries({ queryKey: ['roomDetails', roomID] });
    
    // Invalidate all userRooms queries regardless of filters
    queryClient.invalidateQueries({
        predicate: (query) =>
            query.queryKey[0] === 'userRooms'
    });
    
    queryClient.invalidateQueries({ queryKey: ['joinedRooms'] });
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
        // Create a unique cache key for this query
        const cacheKey = ['userRooms', userID, JSON.stringify(filters)];
        

        // Check if we have cached data
        const cachedData = queryClient.getQueryData(cacheKey);
        if (cachedData) {
            console.log('Returning cached data for user rooms');
            return cachedData;
        }

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

        // Cache the result using Vue Query's caching mechanism
        queryClient.setQueryData(cacheKey, data || []);

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
    const cacheKey = ['joinedRooms', userID];
    

    // Check cache first
    const cachedData = queryClient.getQueryData(cacheKey);
    if (cachedData) {
        console.log('Returning cached joined rooms for user:', userID);
        return cachedData;
    }

    const { data, error } = await supabase.rpc('get_my_room_order_details');

    if (error) {
        console.error('Failed to fetch joined rooms:', error);
        throw error;
    }

    // Cache the result
    queryClient.setQueryData(cacheKey, data);

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
    const cacheKey = ['monthlySpending'];
    

    // Check cache first
    const cachedData = queryClient.getQueryData(cacheKey);
    if (cachedData) {
        console.log('Returning cached monthly spending data');
        return cachedData;
    }

    const { data, error } = await supabase.rpc('get_my_monthly_spending');

    if (error) {
        console.error('Failed to fetch monthly spending:', error);
        throw error;
    }

    // Cache the result
    queryClient.setQueryData(cacheKey, data);

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
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
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
            .insert([{
                room_id: roomID,
                user_id: userID
            }])
            .select()
            .single();

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
        .select(`
        id,
        room_participants (
            room_id,
            user_id
        )
        `)
        .eq('id', itemID)
        .single();

    if (itemError || !itemData) {
        throw new Error('Order item not found');
    }

    const { room_id, user_id: ownerID } = itemData.room_participants;

    // Fetch runner
    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('runner_id')
        .eq('id', room_id)
        .single();

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
        .single();

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
        .select(`
        id,
        room_participants (
            room_id,
            user_id
        )
        `)
        .eq('id', itemID)
        .single();

    if (itemError || !itemData) {
        throw new Error('Order item not found');
    }

    const { room_id, user_id: ownerID } = itemData.room_participants;

    // Fetch runner
    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('runner_id')
        .eq('id', room_id)
        .single();

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
    const cacheKey = ['roomWithParticipants', roomID];
    

    // Check cache first
    const cachedData = queryClient.getQueryData(cacheKey);
    if (cachedData) {
        console.log('Returning cached room with participants for:', roomID);
        return cachedData;
    }

    try {
        // Step 1: Fetch room and participants data using joins
        const { data: roomData, error: roomError } = await supabase
            .rpc('get_room_with_participants', { p_room_id: roomID });

        if (roomError) {
            console.error('Error fetching room with participants:', roomError);
            throw roomError;
        }

        if (!roomData) {
            return null;
        }

        // Step 2: Get user IDs from participants
        const userIds = roomData.room_participants.map(p => p.user_id);

        // Step 3: Fetch user profiles using RPC
        const { data: userProfiles, error: profilesError } = await supabase
            .rpc('get_user_profiles', {
                user_ids: userIds
            });

        if (profilesError) {
            console.error('Error fetching user profiles:', profilesError);
            throw profilesError;
        }

        // Step 4: Create a lookup for user profiles
        const userProfileLookup = {};
        userProfiles.forEach(profile => {
            userProfileLookup[profile.id] = profile;
        });

        // Step 5: Enhance participants with user profile data
        const enhancedParticipants = roomData.room_participants.map(participant => ({
            ...participant,
            user_profile: userProfileLookup[participant.user_id] || {
                display_name: null,
                picture: null
            }
        }));

        // Cache the result
        const result = {
            ...roomData,
            room_participants: enhancedParticipants
        };
        queryClient.setQueryData(cacheKey, result);

        // Return enhanced data structure
        return result;
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
            .single();

        if (participantError) {
            console.error('Error finding participant:', participantError);
            throw new Error('Participant not found in this room');
        }

        // Update the participant record with payment information
        const { data: updatedParticipant, error: updateError } = await supabase
            .from('room_participants')
            .update({
                paid_at: new Date().toISOString(),
                paid_via: paymentMethodID
            })
            .eq('id', participant.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating payment status:', updateError);
            throw updateError;
        }

        // Invalidate relevant caches after payment confirmation
        queryClient.invalidateQueries({ queryKey: ['joinedRooms'] });
        queryClient.invalidateQueries({ queryKey: ['roomDetails', roomID] });

        return updatedParticipant;
    } catch (error) {
        console.error('Error in handlePaymentConfirmed:', error);
        throw error;
    }
}
