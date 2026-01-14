<template>
    <div class="min-h-screen p-4 pb-20">
        <div class="max-w-md mx-auto">
            <div class="text-center py-0 mb-6">
                <h1 class="text-2xl font-bold">
                    {{ $t('pages.myroom.index.title') }}
                </h1>
            </div>

            <div class="mb-6">
                <Button
                    @click="showFilters = true"
                    variant="outline"
                    class="w-full h-auto py-3 justify-center"
                >
                    <Filter class="w-5 h-5 mr-2" />
                    <span>{{ $t('pages.myroom.index.openFilters') }}</span>
                </Button>
            </div>

            <div v-if="isLoading" class="text-center space-y-4">
                <Card v-for="i in [1, 2, 3, 4, 5]" :key="i">
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

            <div
                v-else-if="!roomsData || roomsData.length === 0"
                class="text-center py-8"
            >
                <div
                    class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <Home class="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold mb-2">
                    {{ $t('pages.myroom.index.noRoomsFound') }}
                </h3>
                <p class="text-sm text-muted-foreground">
                    {{
                        hasActiveFilters
                            ? $t('pages.myroom.index.noRoomsMatchFilters')
                            : $t('pages.myroom.index.noRoomsCreated')
                    }}
                </p>
            </div>

            <div v-else class="space-y-4">
                <Card
                    v-for="room in roomsData"
                    :key="room.id"
                    class="transition-shadow"
                >
                    <CardHeader class="p-4 pb-3">
                        <div class="flex justify-between items-start">
                            <CardTitle class="text-lg font-semibold">{{
                                room.title ||
                                $t('pages.myroom.index.untitledRoom')
                            }}</CardTitle>
                            <Badge variant="secondary">{{
                                room.platform ||
                                $t('pages.myroom.index.unknown')
                            }}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent class="p-4 pt-0 text-sm space-y-2">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">{{
                                $t('pages.myroom.index.restaurantLabel')
                            }}</span>
                            <span>{{
                                room.restaurant ||
                                $t('pages.myroom.index.notSpecified')
                            }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-muted-foreground">{{
                                $t('pages.myroom.index.orderTimeLabel')
                            }}</span>
                            <span>{{ formatDateTime(room.order_time) }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-muted-foreground">{{
                                $t('pages.myroom.index.createdLabel')
                            }}</span>
                            <span>{{ formatDateTime(room.created_at) }}</span>
                        </div>

                        <Separator class="my-2" />
                        <div
                            v-if="room.final_total"
                            class="flex flex-col gap-2 pt-2"
                        >
                            <div class="flex justify-between flex-row">
                                <span class="text-muted-foreground">{{
                                    $t('pages.myroom.index.finalTotalLabel')
                                }}</span>
                                <span
                                    class="text-lg font-semibold text-green-600 dark:text-green-400"
                                >
                                    {{ formatCurrency(room.final_total) }}
                                </span>
                            </div>

                            <Button @click="openRoom(room)">
                                {{ $t('pages.myroom.index.manageRoom') }}
                            </Button>
                        </div>
                        <div v-else class="flex flex-col pt-2">
                            <span class="text-muted-foreground font-semibold">{{
                                $t('pages.myroom.index.roomStillOpen')
                            }}</span>
                            <div class="w-full flex flex-row gap-2 mt-2">
                                <Button
                                    @click="openCloseRoomModal(room)"
                                    variant="destructive"
                                    class="flex-1"
                                >
                                    {{ $t('pages.myroom.index.closeRoom') }}
                                </Button>
                                <Button
                                    @click="openRoom(room)"
                                    variant="default"
                                    class="flex-1"
                                >
                                    {{ $t('pages.myroom.index.openRoom') }}
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
            @delete="handleDeleteRoomConfirm"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Home } from 'lucide-vue-next';
import {
    useUserRoomsQuery,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
} from '../../lib/supabaseClient';
import { useQuery, useMutation } from '@tanstack/vue-query';
import { queryClient } from '../../lib/supabaseClient';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import CloseRoomModal from '@/components/modals/CloseRoomModal.vue';
import FilterModal from '@/components/modals/FilterModal.vue';

const { t } = useI18n();

const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const user = inject('user');
const router = useRouter();

const rooms = ref([]);
const showFilters = ref(false);
const showCloseRoomModal = ref(false);
const currentRoomId = ref(null);

const filters = ref({
    search: '',
    platform: '',
    restaurant: '',
    dateFrom: '',
    dateTo: '',
});

const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some((val) => val !== '');
});

// Use TanStack Query for fetching rooms
const {
    data: roomsData,
    isLoading,
    isError,
    error,
} = useQuery(useUserRoomsQuery(user.value?.id, filters.value));

// Watch for changes in user and filters to refetch data
watch(
    [user, filters],
    ([newUser, newFilters]) => {
        if (newUser?.id) {
            queryClient.invalidateQueries({
                queryKey: ['userRooms', newUser.id, JSON.stringify(newFilters)],
            });
        }
    },
    { deep: true }
);

// This keeps your original live search logic intact
const handleLiveFilterUpdate = (newFormState) => {
    filters.value.search = newFormState.search;
    filters.value.restaurant = newFormState.restaurant;
};

const handleApplyFilters = (newFilters) => {
    filters.value = { ...newFilters };
    showFilters.value = false;
};

const handleClearFilters = (clearedState) => {
    filters.value = { ...clearedState };
    showFilters.value = false;
};

function openRoom({ id, final_total }) {
    const next = final_total ? `/myroom/${id}` : `/active-room/${id}`;
    router.push(next);
}

const openCloseRoomModal = ({ id }) => {
    currentRoomId.value = id;
    showCloseRoomModal.value = true;
};

// Set up mutations
const updateRoomMutation = useMutation(useUpdateRoomMutation());
const deleteRoomMutation = useMutation(useDeleteRoomMutation());

const handleCloseRoomSubmit = async ({ roomId, finalTotal }) => {
    if (!roomId) return;
    try {
        await updateRoomMutation.mutateAsync({
            roomID: roomId,
            updates: {
                final_total: finalTotal,
            },
        });

        showCloseRoomModal.value = false;
        router.push(`/myroom/${roomId}`);
    } catch (error) {
        console.error('Error closing room:', error);
    }
};

const handleDeleteRoomConfirm = async ({ roomId }, userID = user.value?.id) => {
    if (!roomId) return;

    try {
        await deleteRoomMutation.mutateAsync({
            roomID: roomId,
            userID: userID,
        });
        showCloseRoomModal.value = false;
        // The mutation will automatically invalidate queries and refetch data
    } catch (error) {
        console.error('Error deleting room:', error);
    }
};
</script>
