<template>
    <div>
        <div class="min-h-screen bg-background p-4 pb-20">
            <div class="max-w-md mx-auto">
                <div class="text-center py-8">
                    <h1 class="text-3xl font-bold text-foreground mb-4">
                        {{ $t('pages.index.appName') }}
                    </h1>
                    <p class="text-lg text-muted-foreground">
                        {{ $t('pages.index.heroSubtitle') }}
                    </p>
                    <p class="text-sm text-muted-foreground mt-2">
                        {{ $t('pages.index.heroDescription') }}
                    </p>
                </div>

                <!-- Join Room Card -->
                <Card class="mb-6">
                    <CardHeader>
                        <CardTitle>{{ $t('pages.index.joinRoom') }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex gap-2">
                            <Input
                                v-model="roomCode"
                                :placeholder="$t('pages.index.enterRoomCode')"
                                class="flex-1"
                                @keyup.enter="joinRoom"
                            />
                            <Button
                                @click="joinRoom"
                                :disabled="!roomCode || isLoading"
                            >
                                <span v-if="!isLoading">{{
                                    $t('pages.index.go')
                                }}</span>
                                <Spinner v-else class="w-4 h-4" />
                            </Button>
                        </div>
                        <div class="mt-2">
                            <QRScanDialog />
                        </div>
                    </CardContent>
                </Card>

                <!-- Monthly Spending Tracker -->
                <Card class="mb-6">
                    <CardHeader>
                        <CardTitle>{{
                            $t('pages.index.monthlySpending')
                        }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-4 max-h-1/2 overflow-y-scroll">
                            <div
                                v-for="month in monthlySpendingData"
                                :key="month.month"
                                class="flex justify-between items-center p-3 bg-muted rounded-lg"
                            >
                                <span class="text-sm font-medium">{{
                                    formatMonthYear(month.month)
                                }}</span>
                                <span class="text-sm font-bold"
                                    >Rp
                                    {{
                                        formatCurrency(month.total_spent)
                                    }}</span
                                >
                            </div>
                            <div
                                v-if="
                                    !monthlySpendingData ||
                                    monthlySpendingData.length === 0
                                "
                                class="text-center py-4"
                            >
                                <p class="text-sm text-muted-foreground">
                                    {{ $t('pages.index.noSpendingData') }}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{{
                            $t('pages.index.dashboardFeatures')
                        }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground">{{
                                    $t('pages.index.trackExpenses')
                                }}</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground">{{
                                    $t('pages.index.viewAnalytics')
                                }}</span>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground">{{
                                    $t('pages.index.manageBudgets')
                                }}</span>
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
import { useI18n } from 'vue-i18n';
import { useMonthlySpendingQuery } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/vue-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input/Input.vue';
import Button from '@/components/ui/button/Button.vue';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import QRScanDialog from '@/components/room/QRScanDialog.vue';

const user = inject('user');
const router = useRouter();
const { t } = useI18n();

const roomCode = ref('');
const isLoading = ref(false);
const monthlySpending = ref([]);

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

// Format month and year
const formatMonthYear = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('id-ID', options);
};

// Use TanStack Query for fetching monthly spending
const { data: monthlySpendingData, isLoading: isSpendingLoading } = useQuery(
    useMonthlySpendingQuery()
);

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
</script>
