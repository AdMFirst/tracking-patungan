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
    // This function will be replaced with the new database logic
    return [];
}

// Fetch joined rooms for a user
export async function fetchJoinedRooms(userID) {
    // This function will be replaced with the new database logic
    return [];
}

// Fetch participants for a room
export async function fetchRoomParticipants(roomID) {
    // This function will be replaced with the new database logic
    return [];
}

// Fetch monthly spending for a user
export async function fetchMonthlySpending() {
    const { data, error } = await supabase
        .rpc("get_my_monthly_spending");

    if (error) {
        console.error("Failed to fetch monthly spending:", error);
        throw error;
    }

    return data;
}