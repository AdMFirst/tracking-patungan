<template>
    <div class="min-h-screen p-4 pb-20 relative">
        <!-- Pull to refresh indicator -->
        <div 
            class="fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-200"
            :style="{ transform: `translateY(${pullDistance}px)` }"
            v-if="isPulling || isRefreshing"
        >
            <div class="bg-background shadow-md rounded-b-lg px-6 py-3 flex items-center gap-3">
                <svg 
                    v-if="isRefreshing" 
                    class="animate-spin h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg 
                    v-else 
                    class="h-5 w-5 transition-transform duration-200"
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span class="text-sm">
                    {{ isRefreshing ? (t('components.common.refreshing') || 'Refreshing...') : (pullDistance > 80 ? (t('components.common.releaseToRefresh') || 'Release to refresh') : (t('components.common.pullToRefresh') || 'Pull to refresh')) }}
                </span>
            </div>
        </div>

        <div 
            class="max-w-md mx-auto"
            ref="contentRef"
            :style="{ transform: `translateY(${contentOffset}px)`, transition: isPulling ? 'none' : 'transform 0.3s ease-out' }"
        >
            <div class="text-center py-0 mb-6">
                <h1 class="text-2xl font-bold">
                    {{ t('pages.histori.title') }}
                </h1>
            </div>

            <!-- Tab Navigation -->
            <div class="flex mb-4 bg-muted rounded-lg p-1">
                <button
                    @click="activeTab = 'active'"
                    :class="[
                        'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'active'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    ]"
                >
                    {{ t('pages.histori.tabs.active') }} ({{
                        activeRooms.length
                    }})
                </button>
                <button
                    @click="activeTab = 'closed'"
                    :class="[
                        'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'closed'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    ]"
                >
                    {{ t('pages.histori.tabs.closed') }} ({{
                        closedRooms.length
                    }})
                </button>
            </div>

            <div v-if="isRoomsLoading" class="text-center space-y-4">
                <OrderRoomSkeleton v-for="i in [1, 2, 3, 4, 5]" :key="i" />
            </div>

            <div
                v-else-if="filteredRooms.length === 0"
                class="text-center py-8"
            >
                <div
                    class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <Home class="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold mb-2">
                    {{
                        activeTab === 'active'
                            ? t('pages.histori.emptyState.activeTitle')
                            : t('pages.histori.emptyState.closedTitle')
                    }}
                </h3>
                <p class="text-sm text-muted-foreground">
                    {{
                        activeTab === 'active'
                            ? t('pages.histori.emptyState.activeDescription')
                            : t('pages.histori.emptyState.closedDescription')
                    }}
                </p>
            </div>

            <div v-else class="space-y-4">
                <OrderRooms :rooms="filteredRooms" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

// ICON IMPORTS (Reduced list)
import { Home } from 'lucide-vue-next';

// Assume this is imported from your project setup
import { useJoinedRoomsQuery } from '../../lib/tanstackQueries';
import { useQuery } from '@tanstack/vue-query';
import OrderRooms from '@/components/room/OrderRooms.vue';
import OrderRoomSkeleton from '@/components/room/OrderRoomSkeleton.vue';

const { t } = useI18n();
const user = inject('user');

// State
const loading = ref(false);
const activeTab = ref('active'); // 'active' or 'closed'
const isRefreshing = ref(false);
const isPulling = ref(false);
const pullDistance = ref(0);
const contentOffset = ref(0);
const contentRef = ref(null);

// --- Fetching Logic (Simplified) ---

// Use TanStack Query for fetching joined rooms
const { data: joinedRoomsData, isLoading: isRoomsLoading, refetch } = useQuery(
    useJoinedRoomsQuery(user.value?.id)
);

// Process the joined rooms data
const rooms = computed(() => {
    if (!joinedRoomsData.value) return [];

    // Group data by room_id
    const roomsMap = new Map();

    joinedRoomsData.value.forEach((item) => {
        if (!roomsMap.has(item.room_id)) {
            roomsMap.set(item.room_id, {
                room_id: item.room_id,
                title: item.room_title,
                room_created_at: item.room_created_at,
                platform: item.platform,
                runner_name: item.runner_name,
                runner_id: item.runner_id,
                restaurant: item.restaurant,
                status: item.room_status,
                paid_via: item.paid_via,
                paid_at: item.paid_at,
                user_items: [],
                total_room_price: 0,
                final_total: null,
            });
        }

        const room = roomsMap.get(item.room_id);
        room.user_items.push({
            id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes,
            raw_item_total: item.raw_item_total,
            proportional_item_total: item.proportional_item_total,
        });

        room.total_room_price += item.raw_item_total;

        // Set final_total if room is closed (use proportional_item_total)
        if (
            item.room_status === 'closed' &&
            item.proportional_item_total !== null
        ) {
            room.final_total += item.proportional_item_total;
        }
    });

    // Convert Map values to array
    return Array.from(roomsMap.values());
});

// Computed properties for filtering
const activeRooms = computed(() => {
    return rooms.value.filter((room) => !room.final_total);
});

const closedRooms = computed(() => {
    return rooms.value.filter((room) => room.final_total);
});

const filteredRooms = computed(() => {
    if (activeTab.value === 'active') {
        return activeRooms.value;
    } else {
        return closedRooms.value;
    }
});

// --- Refresh Logic ---

// Function to refresh data and invalidate cache
const refreshData = async () => {
    if (isRefreshing.value) return;
    
    isRefreshing.value = true;
    isPulling.value = false;
    
    try {
        
        // Manually refetch
        await refetch();
        
    } catch (error) {
        console.error('Error refreshing data:', error);
    } finally {
        // Animate the content back up
        contentOffset.value = 0;
        pullDistance.value = 0;
        
        // Small delay to show the "Refreshing..." state
        setTimeout(() => {
            isRefreshing.value = false;
        }, 300);
    }
};

// --- Pull to Refresh Handler ---

let touchStartY = 0;
let touchStartScrollY = 0;
let isTouchDragging = false;

const handleTouchStart = (e) => {
    // Only trigger if at the top of the page
    if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        touchStartScrollY = window.scrollY;
        isTouchDragging = true;
    }
};

const handleTouchMove = (e) => {
    if (!isTouchDragging || isRefreshing.value) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    
    // Only allow pull down
    if (diff > 0 && window.scrollY === 0) {
        e.preventDefault();
        
        // Apply resistance - the further you pull, the more resistance
        const resistance = 0.5;
        const newPullDistance = Math.min(diff * resistance, 150);
        
        pullDistance.value = newPullDistance;
        contentOffset.value = newPullDistance;
        isPulling.value = true;
    }
};

const handleTouchEnd = (e) => {
    if (!isTouchDragging) return;
    isTouchDragging = false;
    
    const currentY = e.changedTouches[0].clientY;
    const diff = currentY - touchStartY;
    const pullDistanceValue = Math.min(diff * 0.5, 150);
    
    if (pullDistanceValue > 80) {
        // Trigger refresh
        refreshData();
    } else {
        // Snap back
        isPulling.value = false;
        pullDistance.value = 0;
        contentOffset.value = 0;
    }
    
    touchStartY = 0;
};

// --- Mouse Pull to Refresh (for PC) ---

let mouseStartY = 0;
let isMouseDragging = false;
let mouseStartScrollY = 0;

const handleMouseDown = (e) => {
    if (window.scrollY === 0 && !isRefreshing.value) {
        mouseStartY = e.clientY;
        mouseStartScrollY = window.scrollY;
        isMouseDragging = true;
    }
};

const handleMouseMove = (e) => {
    if (!isMouseDragging || isRefreshing.value) return;
    
    const diff = e.clientY - mouseStartY;
    
    if (diff > 0 && window.scrollY === 0) {
        const resistance = 0.5;
        const newPullDistance = Math.min(diff * resistance, 150);
        
        pullDistance.value = newPullDistance;
        contentOffset.value = newPullDistance;
        isPulling.value = true;
    }
};

const handleMouseUp = (e) => {
    if (!isMouseDragging) return;
    isMouseDragging = false;
    
    const diff = e.clientY - mouseStartY;
    const pullDistanceValue = Math.min(diff * 0.5, 150);
    
    if (pullDistanceValue > 80) {
        refreshData();
    } else {
        isPulling.value = false;
        pullDistance.value = 0;
        contentOffset.value = 0;
    }
    
    mouseStartY = 0;
};

// Prevent text selection during drag
const handleSelectStart = (e) => {
    if (isMouseDragging || isTouchDragging) {
        e.preventDefault();
    }
};

// Lifecycle hooks
onMounted(() => {
    // Touch events for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Mouse events for PC
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection during drag
    document.addEventListener('selectstart', handleSelectStart);
});

onBeforeUnmount(() => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    document.removeEventListener('selectstart', handleSelectStart);
});

</script>

<style scoped>
/* Smooth animations */
.transition-transform {
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Optional: Add a subtle shadow when pulling */
.fixed {
    pointer-events: none;
}
</style>