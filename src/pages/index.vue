<template>
  <div>
    <div class="min-h-screen bg-background p-4 pb-20">
      <div class="max-w-md mx-auto">
        <div class="text-center py-8">
          <h1 class="text-3xl font-bold text-foreground mb-4">Welcome!</h1>
          <p class="text-lg text-muted-foreground">This is your dashboard</p>
          <p class="text-sm text-muted-foreground mt-2">Track your expenses and join rooms</p>
        </div>
        
        <!-- Monthly Spending Tracker -->
        <div class="bg-card p-6 rounded-lg border border-border shadow-sm mb-6">
          <h2 class="text-xl font-semibold text-foreground mb-4">Monthly Spending</h2>
          <div class="space-y-4">
            <div v-for="month in monthlySpending" :key="month.month" class="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span class="text-sm font-medium">{{ month.month }}</span>
              <span class="text-sm font-bold">Rp {{ formatCurrency(month.total) }}</span>
            </div>
            <div v-if="monthlySpending.length === 0" class="text-center py-4">
              <p class="text-sm text-muted-foreground">No spending data available</p>
            </div>
          </div>
        </div>
        
        <!-- Join Room Card -->
        <div class="bg-card p-6 rounded-lg border border-border shadow-sm mb-6">
          <h2 class="text-xl font-semibold text-foreground mb-4">Join Room</h2>
          <div class="flex gap-2">
            <Input
              v-model="roomCode"
              placeholder="Enter room code"
              class="flex-1"
              @keyup.enter="joinRoom"
            />
            <Button @click="joinRoom" :disabled="!roomCode || isLoading">
              <span v-if="!isLoading">Go</span>
              <Spinner v-else class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div class="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 class="text-xl font-semibold text-foreground mb-4">Dashboard Features</h2>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span class="text-sm text-muted-foreground">Track your expenses</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span class="text-sm text-muted-foreground">View analytics</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span class="text-sm text-muted-foreground">Manage budgets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'

const user = inject('user')
const router = useRouter()

const roomCode = ref('')
const isLoading = ref(false)
const monthlySpending = ref([])

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

// Fetch monthly spending data
const fetchMonthlySpending = async () => {
  if (!user?.value?.id) return
  
  try {
    // Get all order items for the user
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, unit_price, quantity, room_id, created_at')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
    
    if (itemsError) throw itemsError
    
    // Get room information for each order to calculate actual amounts paid
    const roomIds = [...new Set(orderItems.map(item => item.room_id))]
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, final_total')
      .in('id', roomIds)
    
    if (roomsError) throw roomsError
    
    // Create a map of room_id to final_total
    const roomFinalTotals = {}
    rooms.forEach(room => {
      roomFinalTotals[room.id] = room.final_total
    })
    
    // Group by month and calculate actual amounts paid
    const spendingByMonth = {}
    
    orderItems.forEach(item => {
      const date = new Date(item.created_at)
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      
      if (!spendingByMonth[monthYear]) {
        spendingByMonth[monthYear] = {}
      }
      
      // Store by room for later calculation
      if (!spendingByMonth[monthYear][item.room_id]) {
        spendingByMonth[monthYear][item.room_id] = []
      }
      spendingByMonth[monthYear][item.room_id].push(item)
    })
    
    // Calculate actual amounts paid per month considering discounts
    const result = []
    
    for (const [monthYear, roomsData] of Object.entries(spendingByMonth)) {
      let monthTotal = 0
      
      for (const [roomId, items] of Object.entries(roomsData)) {
        const finalTotal = roomFinalTotals[roomId]
        
        // Only track completed rooms (those with final_total)
        if (finalTotal === null || finalTotal === undefined) {
          // Skip active rooms - don't track them in monthly spending
          continue
        }
        
        // Calculate the user's proportion of the final total
        const userSubtotal = items.reduce((sum, item) =>
          sum + (item.unit_price * item.quantity), 0
        )
        
        // Get all items in this room to calculate total subtotal (total_room_price)
        const { data: allRoomItems, error: roomItemsError } = await supabase
          .from('order_items')
          .select('unit_price, quantity')
          .eq('room_id', roomId)
        
        if (roomItemsError) {
          console.error('Error fetching room items:', roomItemsError)
          continue
        }
        
        const roomSubtotal = allRoomItems.reduce((sum, item) =>
          sum + (item.unit_price * item.quantity), 0
        )
        
        if (roomSubtotal > 0) {
          // Apply the same discount formula as OrderRooms.vue:
          // (final_total / total_room_price) * user_subtotal
          const userActualPayment = (finalTotal / roomSubtotal) * userSubtotal
          monthTotal += userActualPayment
        }
      }
      
      result.push({
        month: monthYear,
        total: monthTotal
      })
    }
    
    // Sort by date (newest first)
    monthlySpending.value = result.sort((a, b) => {
      const dateA = new Date(a.month + ' 1')
      const dateB = new Date(b.month + ' 1')
      return dateB - dateA
    })
    
  } catch (error) {
    console.error('Error fetching monthly spending:', error)
  }
}

// Join room functionality
const joinRoom = async () => {
  if (!roomCode.value || isLoading.value) return
  
  isLoading.value = true
  try {
    // Navigate to the room page
    router.push(`/active-room/${roomCode.value}`)
  } catch (error) {
    console.error('Error joining room:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMonthlySpending()
})
</script>
