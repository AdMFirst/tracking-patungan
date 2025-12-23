<template>
    <div class="min-h-screen p-4 pb-20">
        <div class="max-w-md mx-auto">
            <div class="text-center py-0 mb-6">
                <h1 class="text-2xl font-bold">Joined Room History</h1>
            </div>

            <div v-if="loading" class="text-center space-y-4">
                <OrderRoomSkeleton
                    v-for="i in [1,2,3,4,5]"
                    :key="i"
                />
            </div>

            <div v-else-if="rooms.length === 0" class="text-center py-8">
                <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home class="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold mb-2">No joined rooms found</h3>
                <p class="text-sm text-muted-foreground">
                    You haven't participated in any rooms yet.
                </p>
            </div>

            <div v-else class="space-y-4">
                <OrderRooms :rooms="rooms" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue'

// ICON IMPORTS (Reduced list)
import { Home } from 'lucide-vue-next'

// Assume this is imported from your project setup
import { fetchJoinedRooms } from '../../lib/supabaseClient'
import OrderRooms from '@/components/OrderRooms.vue'
import OrderRoomSkeleton from '@/components/OrderRoomSkeleton.vue'


const user = inject('user')

// State
const rooms = ref([])
const loading = ref(false)


// --- Fetching Logic (Simplified) ---

const fetchRooms = async () => {
    if (!user.value) {
        console.warn('User object is not available. Cannot fetch rooms.')
        loading.value = false
        return
    }
    
    loading.value = true
    
    try {
        const data = await fetchJoinedRooms(user.value.id);
        
        // The result will be an array of objects like:
        // Deduplicate rooms by room_id - keep only the first occurrence
        const uniqueRooms = []
        const seenRoomIds = new Set()
        
        if (data && Array.isArray(data)) {
            for (const room of data) {
                if (!seenRoomIds.has(room.room_id)) {
                    seenRoomIds.add(room.room_id)
                    uniqueRooms.push(room)
                }
            }
        }
        
        // Sort rooms: active rooms (with final_total) on top, then by date (newest first)
        const sortedRooms = uniqueRooms.sort((a, b) => {
            // Active rooms (final_total is not null) should come first
            const aIsActive = a.final_total !== null
            const bIsActive = b.final_total !== null
            
            if (aIsActive && !bIsActive) return 1
            if (!aIsActive && bIsActive) return -1
            
            // For rooms in the same group, sort by created_at (newest first)
            return new Date(b.created_at) - new Date(a.created_at)
        })
        
        rooms.value = sortedRooms
        console.log('raw result', data)
        await new Promise((resolve)=> setTimeout(resolve, 500))
        
    } catch (error) {
        console.error('Error fetching joined rooms:', error)
    } finally {
        loading.value = false
    }
}

// --- Watchers and Lifecycle Hooks (Simplified) ---

// Watch the user to trigger the initial fetch
watch(() => user.value, (newUser) => {
    if (newUser) {
        fetchRooms()
    }
}, { immediate: true })

onMounted(() => {
    if (user.value) {
        fetchRooms()
    }
})

</script>