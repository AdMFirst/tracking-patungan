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
        
        <Dialog :open="showFilters" @update:open="showFilters = $event">
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                    <DialogDescription>
                        Adjust your room search criteria.
                    </DialogDescription>
                </DialogHeader>

                <div class="space-y-4 py-2">
                    <div class="space-y-1">
                        <Label for="search">Search by title/name</Label>
                        <Input
                            id="search"
                            v-model="filterForm.search"
                            type="text"
                            placeholder="Search rooms..."
                        />
                    </div>

                    <div class="space-y-1">
                        <Label for="platform">Platform</Label>
                        <Select v-model="filterForm.platform">
                            <SelectTrigger id="platform">
                                <SelectValue placeholder="All Platforms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="">All Platforms</SelectItem>
                                    <SelectItem value="GrabFood">GrabFood</SelectItem>
                                    <SelectItem value="GoFood">GoFood</SelectItem>
                                    <SelectItem value="ShopeeFood">ShopeeFood</SelectItem>
                                    <SelectItem value="FoodPanda">FoodPanda</SelectItem>
                                    <SelectItem value="Lalafood">Lalafood</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-1">
                        <Label for="restaurant">Restaurant (Specific)</Label>
                        <Input
                            id="restaurant"
                            v-model="filterForm.restaurant"
                            type="text"
                            placeholder="Filter by specific restaurant..."
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <Label for="dateFrom">From Date</Label>
                            <Input
                                id="dateFrom"
                                v-model="filterForm.dateFrom"
                                type="date"
                            />
                        </div>
                        <div class="space-y-1">
                            <Label for="dateTo">To Date</Label>
                            <Input
                                id="dateTo"
                                v-model="filterForm.dateTo"
                                type="date"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter class="flex sm:justify-between pt-4">
                    <Button
                        @click="clearFilters"
                        variant="ghost"
                        class="w-full sm:w-auto"
                    >
                        Clear Filters
                    </Button>
                    <Button
                        @click="applyFilters"
                        class="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRouter } from 'vue-router'

// SHADCN/UI COMPONENTS IMPORTS
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ICON IMPORTS (Requires 'lucide-vue-next' or similar icon library)
import { Filter, Home } from 'lucide-vue-next'

// Assume this is imported from your project setup
import { supabase } from '../../lib/supabaseClient'
import { Skeleton } from '@/components/ui/skeleton'

// Import debounce utility (you might need to install 'lodash-es' or write a simple debounce function)
// For this example, we assume you have a utility function called 'debounce'
const debounce = (fn, delay) => {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

const user = inject('user')

// State
const rooms = ref([])
const loading = ref(false)
const showFilters = ref(false)

// Main Filters state (controls the data fetched)
const filters = ref({
    search: '',
    platform: '',
    restaurant: '',
    dateFrom: '',
    dateTo: ''
})

// Temporary form state for the Dialog (allows user to edit without immediate list changes)
const filterForm = ref({ ...filters.value })

// Computed check for empty state
const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(val => val !== '')
})

// --- Helper Functions ---

// Formats date string to ISO date string for Supabase comparison (end of day)
const getEndOfDayISO = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    // Set time to 23:59:59.999 to include the whole day
    date.setHours(23, 59, 59, 999)
    return date.toISOString()
}

// Format date and time for display
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

// Format currency
const formatCurrency = (amount) => {
    if (amount == null) return 'N/A' // Use loose comparison for 0 or null
    // Note: Using 'id-ID' locale for Rupiah, adjust as needed
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount)
}

// --- Filtering and Fetching Logic ---

// Fetch rooms from Supabase (now includes all filtering logic)
const fetchRooms = async () => {
    if (!user.value) return

    loading.value = true
    
    let query = supabase
        .from('rooms')
        .select('*')
        .order('order_time', { ascending: false }) // Sort on server

    // 1. Platform Filter
    if (filters.value.platform) {
        query = query.eq('platform', filters.value.platform)
    }

    // 2. Search & Restaurant Filters (Combined using Supabase OR operator and ILIKE)
    let searchClauses = []
    const searchLower = filters.value.search.trim().toLowerCase()
    const restaurantLower = filters.value.restaurant.trim().toLowerCase()

    if (searchLower) {
        searchClauses.push(`title.ilike.%${searchLower}%`)
        searchClauses.push(`restaurant.ilike.%${searchLower}%`)
    } else if (restaurantLower) {
        // Only apply specific restaurant filter if general search is empty
        searchClauses.push(`restaurant.ilike.%${restaurantLower}%`)
    }
    
    if (searchClauses.length > 0) {
        // Supabase OR requires the clauses to be joined by a comma
        query = query.or(searchClauses.join(','))
    }
    
    // 3. Date Range Filter
    if (filters.value.dateFrom) {
        // We append T00:00:00Z to ensure comparison starts at the beginning of the day (UTC/ISO)
        query = query.gte('order_time', filters.value.dateFrom + 'T00:00:00Z')
    }

    if (filters.value.dateTo) {
        // Use the helper to include the entire end day
        query = query.lte('order_time', getEndOfDayISO(filters.value.dateTo))
    }

    try {
        const { data, error } = await query

        if (error) {
            console.error('Error fetching rooms:', error)
            rooms.value = []
            return
        }

        rooms.value = data || []
    } catch (error) {
        console.error('Error fetching rooms:', error)
    } finally {
        loading.value = false
    }
}

// Debounced version of fetchRooms for instant feedback on text inputs
const debouncedFetchRooms = debounce(fetchRooms, 300)

// Handles the filter dialog closing and triggering a fetch
const applyFilters = () => {
    // Commit the temporary form values to the main filters state
    filters.value = { ...filterForm.value }
    showFilters.value = false
    // Fetch is triggered by the watch on `filters`
}

// Clear all filters
const clearFilters = () => {
    const clearedState = {
        search: '',
        platform: '',
        restaurant: '',
        dateFrom: '',
        dateTo: ''
    }
    filterForm.value = { ...clearedState }
    filters.value = { ...clearedState } // Clear and trigger fetch
}

// --- Watchers and Lifecycle Hooks ---

// 1. Watch the user to trigger the initial fetch
watch(() => user.value, (newUser) => {
    if (newUser) {
        fetchRooms()
    }
}, { immediate: true })

// 2. Watch text filters for immediate feedback via debounce
// We only watch 'search' and 'restaurant' on the filterForm (while dialog is open)
watch(() => filterForm.value.search, (newVal) => {
    // Only fetch if the dialog is open and the filterForm is actively being changed
    if(showFilters.value) {
        // Optimistically update main filters for debounce, but don't close dialog
        filters.value.search = newVal
        debouncedFetchRooms()
    }
})
watch(() => filterForm.value.restaurant, (newVal) => {
    if(showFilters.value) {
        filters.value.restaurant = newVal
        debouncedFetchRooms()
    }
})

// 3. Watch platform/date filters (applied only when dialog is closed or via Apply button)
watch(filters, () => {
    // This watch catches changes from clearFilters or applyFilters
    if(!showFilters.value) {
        fetchRooms()
    }
}, { deep: true })


// Initial setup when opening the dialog
watch(showFilters, (isShowing) => {
    if (isShowing) {
        // When opening, sync the form state with the active filters state
        filterForm.value = { ...filters.value }
    }
})

// Final fetch on mount (if user is already loaded)
onMounted(() => {
    if (user.value) {
        fetchRooms()
    }
})

const router = useRouter()


function setRoom(id) {
    router.push(`/myroom/${id}`)
}
</script>