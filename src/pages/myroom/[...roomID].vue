<template>
    <div class="min-h-screen p-4 pb-20">
        <div class="max-w-md mx-auto">
            <div class="flex items-center justify-between py-0 mb-6">
                <button
                    @click="router.back()"
                    class="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft class="w-5 h-5" />
                    <span>Back</span>
                </button>
                <h1 class="text-2xl font-bold">Room Details</h1>
            </div>

            <div v-if="loading" class="text-center space-y-4">
                <Skeleton class="h-6 w-[200px] mx-auto" />
                <Skeleton class="h-4 w-[150px] mx-auto" />
                <Skeleton class="h-4 w-[100px] mx-auto" />
            </div>

            <div v-else-if="!room" class="text-center py-8">
                <div
                    class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <Home class="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold mb-2">Room not found</h3>
                <p class="text-sm text-muted-foreground">
                    The room you are looking for does not exist.
                </p>
            </div>

            <div v-else class="space-y-6">
                <!-- Room Information -->
                <Card>
                    <CardHeader class="p-4 pb-3">
                        <div class="flex justify-between items-start">
                            <CardTitle class="text-lg font-semibold">{{
                                room.title || 'Untitled Room'
                            }}</CardTitle>
                            <Badge variant="secondary">{{
                                room.platform || 'Unknown'
                            }}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent class="p-4 pt-0 text-sm space-y-2">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground"
                                >Restaurant:</span
                            >
                            <span>{{
                                room.restaurant || 'Not specified'
                            }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-muted-foreground"
                                >Order Time:</span
                            >
                            <span>{{ formatDateTime(room.order_time) }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Created:</span>
                            <span>{{ formatDateTime(room.created_at) }}</span>
                        </div>

                        <Separator class="my-2" />
                        <div class="flex justify-between pt-2">
                            <span class="text-muted-foreground"
                                >Final Total:</span
                            >
                            <span
                                class="text-lg font-semibold text-green-600 dark:text-green-400"
                            >
                                {{ formatCurrency(room.final_total) }}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <!-- Participants List -->
                <Card>
                    <CardHeader class="p-4">
                        <CardTitle class="text-lg font-semibold"
                            >Participants</CardTitle
                        >
                    </CardHeader>
                    <CardContent class="p-4 pt-0 text-sm space-y-1">
                        <div
                            v-if="participants.length === 0"
                            class="text-center py-4"
                        >
                            <p class="text-muted-foreground">
                                No participants found.
                            </p>
                        </div>

                        <div v-else class="space-y-1">
                            <div
                                v-for="participant in participants"
                                :key="participant.id"
                                class="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div class="flex items-center space-x-3">
                                        <img
                                            :src="
                                                participant.user_profile?.picture ||
                                                'https://placehold.co/400'
                                            "
                                            alt="User avatar"
                                            class="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p class="font-medium">
                                                {{
                                                    participant.user_profile?.display_name ||
                                                    'Unknown User'
                                                }}
                                            </p>
                                        </div>
                                    </div>
                                <div class="text-right space-x-1">
                                    <Badge
                                        :variant="!participant.paid_at ? 'secondary' : 'default'"
                                        class="mt-1"
                                    >
                                        <template v-if="!participant.paid_at">
                                            Unpaid
                                        </template>
                                        <template v-else-if="participant.paid_at && !participant.paid_via">
                                            <span>You</span>
                                        </template>
                                        <template v-else>
                                            Paid via {{ participant.paid_via.tipe }}
                                        </template>
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// SHADCN/UI COMPONENTS IMPORTS
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ICON IMPORTS (Requires 'lucide-vue-next' or similar icon library)
import { Home, ArrowLeft } from 'lucide-vue-next';

// Import from supabaseClient
import {
    fetchRoomWithParticipants
} from '../../lib/supabaseClient';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const user = inject('user');
const route = useRoute();
const router = useRouter();

// State
const room = ref(null);
const participants = ref([]);
const loading = ref(false);

// Computed properties
const totalPaid = computed(() => {
    return participants.value.reduce((sum, participant) => {
        return participant.paid_at ? sum + participant.amount : sum;
    }, 0);
});

const totalUnpaid = computed(() => {
    return participants.value.reduce((sum, participant) => {
        return !participant.paid_at ? sum + participant.amount : sum;
    }, 0);
});

const remainingAmount = computed(() => {
    return room.value?.final_total
        ? room.value.final_total - totalPaid.value
        : 0;
});

// Fetch room details and participants
const fetchData = async () => {
    if (!user.value) return;

    loading.value = true;

    try {
        // Fetch room details with participants and user profiles in a single query
        const rawData = await fetchRoomWithParticipants(route.params.roomID);

        if (rawData) {
            // Use raw data directly
            room.value = rawData;
            participants.value = rawData.room_participants || [];
            console.log('Raw room data:', rawData);
        } else {
            room.value = null;
            participants.value = [];
        }

    } catch (error) {
        console.error('Error fetching room details:', error);
    } finally {
        loading.value = false;
    }
};

// Fetch data on mount
onMounted(() => {
    if (user.value) {
        fetchData();
    }
});

// Watch for user changes
watch(
    () => user.value,
    (newUser) => {
        if (newUser) {
            fetchData();
        }
    },
    { immediate: true }
);
</script>
