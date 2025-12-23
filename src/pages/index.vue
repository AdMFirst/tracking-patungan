<template>
    <div>
        <div class="min-h-screen bg-background p-4 pb-20">
            <div class="max-w-md mx-auto">
                <div class="text-center py-8">
                    <h1 class="text-3xl font-bold text-foreground mb-4">
                        Welcome!
                    </h1>
                    <p class="text-lg text-muted-foreground">
                        This is your dashboard
                    </p>
                    <p class="text-sm text-muted-foreground mt-2">
                        Track your expenses and join rooms
                    </p>
                </div>

                <!-- Monthly Spending Tracker -->
                <Card class="mb-6">
                    <CardHeader>
                        <CardTitle>Monthly Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-4">
                            <div
                                v-for="month in monthlySpending"
                                :key="month.month"
                                class="flex justify-between items-center p-3 bg-muted rounded-lg"
                            >
                                <span class="text-sm font-medium">{{
                                    month.month
                                }}</span>
                                <span class="text-sm font-bold"
                                    >Rp {{ formatCurrency(month.total) }}</span
                                >
                            </div>
                            <div
                                v-if="monthlySpending.length === 0"
                                class="text-center py-4"
                            >
                                <p class="text-sm text-muted-foreground">
                                    No spending data available
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Join Room Card -->
                <Card class="mb-6">
                    <CardHeader>
                        <CardTitle>Join Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex gap-2">
                            <Input
                                v-model="roomCode"
                                placeholder="Enter room code"
                                class="flex-1"
                                @keyup.enter="joinRoom"
                            />
                            <Button
                                @click="joinRoom"
                                :disabled="!roomCode || isLoading"
                            >
                                <span v-if="!isLoading">Go</span>
                                <Spinner v-else class="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground"
                                    >Track your expenses</span
                                >
                            </div>
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground"
                                    >View analytics</span
                                >
                            </div>
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground"
                                    >Manage budgets</span
                                >
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { inject, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMonthlySpending } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input/Input.vue';
import Button from '@/components/ui/button/Button.vue';
import Spinner from '@/components/ui/spinner/Spinner.vue';

const user = inject('user');
const router = useRouter();

const roomCode = ref('');
const isLoading = ref(false);
const monthlySpending = ref([]);

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

// Fetch monthly spending data
const loadData = async () => {
    if (!user?.value?.id) return;

    try {
        const data = await fetchMonthlySpending(user.value.id);
        monthlySpending.value = data;
    } catch (error) {
        console.error('Error fetching monthly spending:', error);
    }
};

// Join room functionality
const joinRoom = async () => {
    if (!roomCode.value || isLoading.value) return;

    isLoading.value = true;
    try {
        // Navigate to the room page
        router.push(`/active-room/${roomCode.value}`);
    } catch (error) {
        console.error('Error joining room:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>
