import { QueryClient } from '@tanstack/vue-query';
import {
    createRoom,
    updateRoom,
    deleteRoom,
    fetchUserRooms,
    fetchJoinedRooms,
    fetchMonthlySpending,
    fetchRoomDetails,
    fetchRoomWithParticipants,
    joinRoom,
    setParticipantAsPaid,
    addOrderItem,
    updateOrderItem,
    deleteOrderItem,
    fetchRoomOrderItems,
    fetchUserProfiles,
    fetchPaymentMethods,
    fetchPaymentMethodsByRoomID,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
} from './supabaseClient';

// Create and export QueryClient instance
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 1 * 60 * 1000, // 1 minutes
            retry: 2,
        },
        mutations: {
            retry: 2,
        },
    },
});

// ============================================
// ROOM QUERIES
// ============================================

/**
 * Query for fetching user rooms
 */
export function useUserRoomsQuery(userID, filters = {}) {
    return {
        queryKey: ['userRooms', userID, JSON.stringify(filters)],
        queryFn: () => fetchUserRooms(userID, filters),
    };
}

/**
 * Query for fetching joined rooms
 */
export function useJoinedRoomsQuery(userID) {
    return {
        queryKey: ['joinedRooms', userID],
        queryFn: () => fetchJoinedRooms(userID),
    };
}

/**
 * Query for fetching monthly spending
 */
export function useMonthlySpendingQuery() {
    return {
        queryKey: ['monthlySpending'],
        queryFn: fetchMonthlySpending,
    };
}

/**
 * Query for fetching room details
 */
export function useRoomDetailsQuery(roomID) {
    return {
        queryKey: ['roomDetails', roomID],
        queryFn: () => fetchRoomDetails(roomID),
    };
}

/**
 * Query for fetching room with participants
 */
export function useRoomWithParticipantsQuery(roomID) {
    return {
        queryKey: ['roomWithParticipants', roomID],
        queryFn: () => fetchRoomWithParticipants(roomID),
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

// ============================================
// PAYMENT METHOD QUERIES
// ============================================

/**
 * Query for fetching payment methods
 */
export function usePaymentMethodsQuery() {
    return {
        queryKey: ['myPaymentMethods'],
        queryFn: () => fetchPaymentMethods(),
    };
}

/**
 * Query for fetching payment methods by room ID
 */
export function usePaymentMethodsByRoomIDQuery(roomID) {
    return {
        queryKey: ['myPaymentMethods', roomID],
        queryFn: () => fetchPaymentMethodsByRoomID(roomID),
        enabled: !!roomID,
    };
}

// ============================================
// ROOM MUTATIONS
// ============================================

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
 * 
 * ps no need to update order time, will be updated server side by "trg_finalize_room" that
 * will run finalize room function to verify data is correct and auto update order time if null
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

// ============================================
// ORDER ITEM MUTATIONS
// ============================================

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
        mutationFn: ({ itemID, updates }) => updateOrderItem(itemID, updates),
        onSuccess: () => {
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

// ============================================
// PAYMENT METHOD MUTATIONS
// ============================================

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
        mutationFn: ({ methodID, updates }) =>
            updatePaymentMethod(methodID, updates),
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