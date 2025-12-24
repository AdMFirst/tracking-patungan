import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch room details by ID
export async function fetchRoomDetails(roomID) {
    // This function will be replaced with the new database logic
    return {
        id: roomID,
        title: 'Sample Room',
        restaurant: 'Sample Restaurant',
        platform: 'Sample Platform',
        order_time: null,
        final_total: null,
        created_at: new Date().toISOString(),
    };
}

// Fetch order items for a room
export async function fetchOrderItems(roomID) {
    // This function will be replaced with the new database logic
    return [];
}

// Fetch user profiles
export async function fetchUserProfiles(userIds) {
    // This function will be replaced with the new database logic
    return [];
}

// Create a new room
export async function createRoom(roomData) {
    // This function will be replaced with the new database logic
    return {
        id: 'new-room-id',
        ...roomData,
    };
}

// Update a room
export async function updateRoom(roomID, updates) {
    // This function will be replaced with the new database logic
    return {
        id: roomID,
        ...updates,
    };
}

// Fetch rooms for a user
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

// Fetch joined rooms for a user
export async function fetchJoinedRooms(userID) {
    const { data, error } = await supabase.rpc('get_my_room_order_details');

    if (error) {
        console.error('Failed to fetch monthly spending:', error);
        throw error;
    }

    return data;
}

// Fetch participants for a room
export async function fetchRoomParticipants(roomID) {
    // This function will be replaced with the new database logic
    return [];
}

// Fetch monthly spending for a user
export async function fetchMonthlySpending() {
    const { data, error } = await supabase.rpc('get_my_monthly_spending');

    if (error) {
        console.error('Failed to fetch monthly spending:', error);
        throw error;
    }

    return data;
}

// Fetch room details with participants and user profiles
export async function fetchRoomWithParticipants(roomID) {
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

        // Return enhanced data structure
        return {
            ...roomData,
            room_participants: enhancedParticipants
        };
    } catch (error) {
        console.error('Error in fetchRoomWithParticipants:', error);
        return null;
    }
}
