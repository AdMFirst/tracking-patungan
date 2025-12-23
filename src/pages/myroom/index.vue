<template>
    <div class="min-h-screen p-4 pb-20">
        <div class="max-w-md mx-auto">

            <div class="text-center py-0 mb-6">
                <h1 class="text-2xl font-bold">My Rooms</h1>
            </div>

            <div class="mb-6">
                <Button
                    @click="showFilters = true"
                    variant="outline"
                    class="w-full h-auto py-3 justify-center"
                >
                    <Filter class="w-5 h-5 mr-2" />
                    <span>Open Filters</span>
                </Button>
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
                <h3 class="text-lg font-semibold mb-2">No rooms found</h3>
                <p class="text-sm text-muted-foreground">
                    {{ hasActiveFilters ? 'No rooms match your current filters.' : 'You haven\'t created any rooms yet.' }}
                </p>
            </div>

            <div v-else class="space-y-4">
                <Card
                    v-for="room in rooms"
                    :key="room.id"
                    class="transition-shadow"
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
                        <div v-if="room.final_total" class="flex flex-col gap-2 pt-2">
                            <div class="flex justify-between flex-row">
                                <span class="text-muted-foreground">Final Total:</span>
                                <span class="text-lg font-semibold text-green-600 dark:text-green-400">
                                    {{ formatCurrency(room.final_total) }}
                                </span>
                            </div>
                            
                            <Button @click="openRoom(room)">
                                Manage Room
                            </Button>
                            
                        </div>
                        <div v-else class="flex flex-col pt-2">
                            <span class="text-muted-foreground font-semibold">The room is still hopping! Jump in and add your order</span>
                            <div class="w-full flex flex-row gap-2 mt-2">
                                <Button
                                    @click="openCloseRoomModal(room)"
                                    variant="destructive"
                                    class="flex-1"
                                >
                                    Close Room
                                </Button>
                                <Button
                                    @click="openRoom(room)"
                                    variant="default"
                                    class="flex-1"
                                >
                                    Open Room
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <FilterModal
            v-model:open="showFilters"
            :filters="filters"
            @apply="handleApplyFilters"
            @clear="handleClearFilters"
            @update:form="handleLiveFilterUpdate"
        />

        <CloseRoomModal
            v-model:open="showCloseRoomModal"
            :roomId="currentRoomId"
            @submit="handleCloseRoomSubmit"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Filter, Home } from 'lucide-vue-next'
import { supabase } from '../../lib/supabaseClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import CloseRoomModal from '@/components/CloseRoomModal.vue'
import FilterModal from '@/components/FilterModal.vue'

const debounce = (fn, delay) => {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

const user = inject('user')
const router = useRouter()

const rooms = ref([])
const loading = ref(false)
const showFilters = ref(false)
const showCloseRoomModal = ref(false)
const currentRoomId = ref(null)

const filters = ref({
    search: '',
    platform: '',
    restaurant: '',
    dateFrom: '',
    dateTo: ''
})

const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(val => val !== '')
})

const getEndOfDayISO = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    date.setHours(23, 59, 59, 999)
    return date.toISOString()
}

const fetchRooms = async () => {
    if (!user.value) return
    loading.value = true
    
    let query = supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })

    if (filters.value.platform) {
        query = query.eq('platform', filters.value.platform)
    }

    let searchClauses = []
    const searchLower = filters.value.search.trim().toLowerCase()
    const restaurantLower = filters.value.restaurant.trim().toLowerCase()

    if (searchLower) {
        searchClauses.push(`title.ilike.%${searchLower}%`)
        searchClauses.push(`restaurant.ilike.%${searchLower}%`)
    } else if (restaurantLower) {
        searchClauses.push(`restaurant.ilike.%${restaurantLower}%`)
    }
    
    if (searchClauses.length > 0) {
        query = query.or(searchClauses.join(','))
    }
    
    if (filters.value.dateFrom) {
        query = query.gte('order_time', filters.value.dateFrom + 'T00:00:00Z')
    }

    if (filters.value.dateTo) {
        query = query.lte('order_time', getEndOfDayISO(filters.value.dateTo))
    }

    try {
        const { data, error } = await query
        if (error) throw error
        rooms.value = data || []
    } catch (error) {
        console.error('Error fetching rooms:', error)
    } finally {
        loading.value = false
    }
}

const debouncedFetchRooms = debounce(fetchRooms, 300)

// This keeps your original live search logic intact
const handleLiveFilterUpdate = (newFormState) => {
    filters.value.search = newFormState.search
    filters.value.restaurant = newFormState.restaurant
    debouncedFetchRooms()
}

const handleApplyFilters = (newFilters) => {
    filters.value = { ...newFilters }
    showFilters.value = false
    fetchRooms()
}

const handleClearFilters = (clearedState) => {
    filters.value = { ...clearedState }
    showFilters.value = false
    fetchRooms()
}

watch(() => user.value, (newUser) => {
    if (newUser) fetchRooms()
}, { immediate: true })

onMounted(() => {
    if (user.value) fetchRooms()
})

function openRoom({id, final_total}) {
    const next = final_total? `/myroom/${id}` : `/active-room/${id}`
    router.push(next)
}

const openCloseRoomModal = ({id}) => {
    currentRoomId.value = id
    showCloseRoomModal.value = true
}

const handleCloseRoomSubmit = async ({ roomId, finalTotal }) => {
    if (!roomId || !finalTotal) return
    try {
        const { error } = await supabase
            .from('rooms')
            .update({
                final_total: finalTotal,
                order_time: new Date().toISOString()
            })
            .eq('id', roomId)

        if (error) throw error
        showCloseRoomModal.value = false
        await fetchRooms()
        router.push(`/myroom/${roomId}`)
    } catch (error) {
        console.error('Error closing room:', error)
    }
}
</script>