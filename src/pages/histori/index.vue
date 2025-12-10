<template>
    <div class="min-h-screen p-4 pb-20">
        <div class="max-w-md mx-auto">

            <div class="text-center py-0 mb-6">
                <h1 class="text-2xl font-bold">Histori Joined Room</h1>
            </div>

            <div v-if="loading" class="text-center space-y-4">
                <Card
                    v-for="i in [1,2,3,4,5]"
                    :key="i"
                >
                    <CardHeader class="p-4 pb-3">
                        <div class="flex justify-between items-start">
                            <Skeleton class="h-4 w-[150px]" />
                            <Skeleton class="h-4 w-[50px]" />
                        </div>
                    </CardHeader>
                    <CardContent class="p-4 pt-0 text-sm space-y-2">
                        <div class="flex justify-between">
                            <Skeleton class="h-4 w-[50px]" />
                            <Skeleton class="h-4 w-[180px]" />
                        </div>

                        <div class="flex justify-between">
                            <Skeleton class="h-4 w-[50px]" />
                            <Skeleton class="h-4 w-[180px]" />
                        </div>

                        <div class="flex justify-between">
                            <Skeleton class="h-4 w-[50px]" />
                            <Skeleton class="h-4 w-[180px]" />
                        </div>

                        <Separator class="my-2" />
                        <div class="flex justify-between pt-2">
                            <Skeleton class="h-4 w-[50px]" />
                            <Skeleton class="h-7 w-[140px]" />
                        </div>
                    </CardContent>
                </Card>
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
                <Card
                    v-for="room in rooms"
                    :key="room.id"
                    class="hover:shadow-lg cursor-pointer transition-shadow"
                    @click="setRoom(room.id)"
                >
                    <CardHeader class="p-4 pb-3">
                        <div class="flex justify-between items-start">
                            <CardTitle class="text-lg font-semibold">{{ room.title || 'Untitled Room' }}</CardTitle>
                            <Badge variant="secondary">{{ room.platform || 'Unknown' }}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent class="p-4 pt-0 text-sm space-y-2">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Restaurant:</span>
                            <span>{{ room.restaurant || 'Not specified' }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Order Time:</span>
                            <span>{{ formatDateTime(room.order_time) }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Created:</span>
                            <span>{{ formatDateTime(room.created_at) }}</span>
                        </div>

                        <Separator class="my-2" />
                        <div class="flex justify-between pt-2">
                            <span class="text-muted-foreground">Final Total:</span>
                            <span class="text-lg font-semibold text-green-600 dark:text-green-400">
                                {{ formatCurrency(room.final_total) }}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue'
import { useRouter } from 'vue-router'

// SHADCN/UI COMPONENTS IMPORTS (Reduced list)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ICON IMPORTS (Reduced list)
import { Home } from 'lucide-vue-next'

// Assume this is imported from your project setup
import { supabase } from '../../lib/supabaseClient'
import { Skeleton } from '@/components/ui/skeleton'

// Removed debounce utility as it's no longer needed without text inputs

const user = inject('user')

// State
const rooms = ref([])
const loading = ref(false)
// Removed showFilters, filters, filterForm state variables

// --- Helper Functions ---

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatCurrency = (amount) => {
    if (amount == null) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount)
}

// --- Fetching Logic (Simplified) ---

const fetchRooms = async () => {
    if (!user.value) {
        console.warn('User object is not available. Cannot fetch rooms.')
        loading.value = false
        return
    }
    
    loading.value = true

    // MOST SIMPLIFIED QUERY: Fetch all rooms where the user is a participant.
    // Order and complex filtering are temporarily removed to isolate the join issue.
    let query = supabase
        .from('room_participants')
        // Select all room details via the relationship
        .select(`
            rooms!inner (
                *
            )
        `)
        // Filter: Find all rows where the user is listed as a participant
        .eq('user_id', user.value.id) 
        // NOTE: The .neq('rooms.runner_id', user.value.id) filter is REMOVED for testing.

    try {
        const { data, error } = await query

        if (error) {
            console.error('Error fetching joined rooms:', error)
            rooms.value = []
            return
        }
        
        // This log helps debug the raw result structure
        console.log('Raw fetched data:', data)

        // The result will be an array of objects like: 
        // [{ rooms: { id: ..., title: ... } }, ...]
        rooms.value = data.map(item => item.rooms) || []
        
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

const router = useRouter()


function setRoom(id) {
    router.push(`/room/${id}`)
}
</script>