<template>
    <div class="relative inline-flex items-center">
        <Button
            variant="none"
            class="pointer-events-none"
        >
            <SortDescIcon class="w-5 h-5" />
            <span class="text-md">Sort by:</span>
            <span class="text-md capitalize">{{ sortOptions.find(opt => opt.value === sortBy)?.label }}</span>
        </Button>
        <select
            v-model="sortBy"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
            <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
            >
                {{ option.label }}
            </option>
        </select>
    </div>
    <Card
        v-for="room in sortedRooms"
        :key="room.room_id"
        class="cursor-pointer transition-shadow"
    >
        <CardHeader class="p-4 pb-1">
            <div class="flex justify-between items-start">
                <CardTitle class="font-semibold text-lg">
                    {{
                        room.title ||
                        room.room_title ||
                        $t('components.room.OrderRooms.untitledRoom')
                    }}
                </CardTitle>
                <Badge variant="secondary">
                    {{
                        room.platform ||
                        $t('components.room.OrderRooms.unknown')
                    }}
                </Badge>
            </div>
        </CardHeader>

        <CardContent class="p-4 pt-0 text-sm space-y-2">
            <div class="flex justify-between">
                <span class="text-muted-foreground">{{
                    $t('components.room.OrderRooms.runnerLabel')
                }}</span>
                <span>{{
                    room.runner_name ||
                    room.runner_full_name ||
                    $t('components.room.OrderRooms.notSpecified')
                }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">{{
                    $t('components.room.OrderRooms.restaurantLabel')
                }}</span>
                <span>{{
                    room.restaurant ||
                    $t('components.room.OrderRooms.notSpecified')
                }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">{{
                    $t('components.room.OrderRooms.createdAtLabel')
                }}</span>
                <span>{{
                    formatDate(room.room_created_at) ||
                    room.room_created_at ||
                    $t('components.room.OrderRooms.notSpecified')
                }}</span>
            </div>

            <div class="flex justify-between">
                <span class="text-muted-foreground">{{
                    $t('components.room.OrderRooms.itemsOrderedLabel')
                }}</span>
            </div>

            <Separator class="my-2" />

            <div
                v-for="item in room.user_items"
                :key="item.id"
                class="flex flex-col space-y-1"
            >
                <div class="flex justify-between">
                    <span class="text-muted-foreground">
                        {{ item.item_name }} x {{ item.quantity }} @
                        {{ formatCurrency(item.unit_price) }}
                        {{ $t('components.room.OrderRooms.each') }}
                    </span>
                    <span>{{
                        formatCurrency(item.unit_price * item.quantity)
                    }}</span>
                </div>
                <span
                    class="text-xs text-muted-foreground italic"
                    v-if="item.notes"
                >
                    * {{ item.notes }}
                </span>
            </div>

            <div
                class="flex justify-between items-center pt-2"
                v-if="!!room.final_total"
            >
                <span class="text-muted-foreground font-medium">{{
                    $t('components.room.OrderRooms.yourTotal')
                }}</span>

                <div class="text-right">
                    <span
                        v-if="
                            totalOriginalPay(room.user_items) !==
                            room.final_total
                        "
                        class="line-through text-gray-400 mr-2 text-xs"
                    >
                        {{ formatCurrency(totalOriginalPay(room.user_items)) }}
                    </span>
                    <span
                        class="text-lg font-bold text-green-600 dark:text-green-400"
                    >
                        {{
                            formatCurrency(
                                (room.final_total / room.total_room_price) *
                                    totalOriginalPay(room.user_items)
                            )
                        }}
                    </span>
                </div>
            </div>

            <div v-if="!room.final_total">
                <div class="w-full p-2 text-center">
                    <span
                        class="text-lg font-bold text-green-600 dark:text-green-400"
                    >
                        {{ $t('components.room.OrderRooms.roomStillOpen') }}
                    </span>
                </div>
                <Button
                    variant="outline"
                    class="w-full"
                    @click.stop="handleOpenRoom(room)"
                >
                    {{ $t('components.room.OrderRooms.openRoomButton') }}
                </Button>
            </div>
            <div
                v-else-if="room.user_items.length > 0 && !room.paid_at"
                class="pt-4"
            >
                <Button
                    variant="default"
                    class="w-full"
                    @click.stop="handlePayment(room)"
                >
                    {{ $t('components.room.OrderRooms.payNowButton') }}
                </Button>
            </div>
            <div
                v-else-if="room.user_items.length > 0 && room.paid_at"
                class="pt-4"
            >
                <Button
                    variant="outline"
                    class="w-full h-auto whitespace-normal"
                    disabled
                >
                    {{ paymentStatus(room) }}
                </Button>
            </div>
        </CardContent>
    </Card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatCurrency } from '@/lib/utils';

// SHADCN/UI COMPONENTS IMPORTS (Reduced list)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { SortDescIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const router = useRouter();
const { t, d } = useI18n();

const props = defineProps({
    rooms: Object,
});

const emit = defineEmits(['pay-room']);

// Sorting implementation
const sortBy = ref('date-desc');

const sortOptions = [
    { label: 'Date (Newest)', value: 'date-desc' },
    { label: 'Date (Oldest)', value: 'date-asc' },
    { label: 'Title (A-Z)', value: 'title-asc' },
    { label: 'Title (Z-A)', value: 'title-desc' },
    { label: 'Restaurant (A-Z)', value: 'restaurant-asc' },
    { label: 'Restaurant (Z-A)', value: 'restaurant-desc' },
    { label: 'Platform (A-Z)', value: 'platform-asc' },
    { label: 'Platform (Z-A)', value: 'platform-desc' },
    { label: 'Total Amount (High-Low)', value: 'total-desc' },
    { label: 'Total Amount (Low-High)', value: 'total-asc' }
];

const calculateCalculatedTotal = (room) => {
    if (room.proportional_item_total) return Number(room.proportional_item_total);
    if (room.final_total && room.total_room_price && room.user_items) {
        return (room.final_total / room.total_room_price) * totalOriginalPay(room.user_items);
    }
    if (room.user_items) return totalOriginalPay(room.user_items);
    return 0;
};

const sortedRooms = computed(() => {
    if (!props.rooms || !Array.isArray(props.rooms)) return props.rooms || [];
    
    const roomsArray = [...props.rooms];

    return roomsArray.sort((a, b) => {
        const titleA = a.title || a.room_title || '';
        const titleB = b.title || b.room_title || '';
        const restA = a.restaurant || '';
        const restB = b.restaurant || '';
        const platformA = a.platform || '';
        const platformB = b.platform || '';

        switch (sortBy.value) {
            case 'date-desc':
                return new Date(b.room_created_at || 0) - new Date(a.room_created_at || 0);
            case 'date-asc':
                return new Date(a.room_created_at || 0) - new Date(b.room_created_at || 0);
            case 'title-asc':
                return titleA.localeCompare(titleB);
            case 'title-desc':
                return titleB.localeCompare(titleA);
            case 'restaurant-asc':
                return restA.localeCompare(restB);
            case 'restaurant-desc':
                return restB.localeCompare(restA);
            case 'platform-asc':
                return platformA.localeCompare(platformB);
            case 'platform-desc':
                return platformB.localeCompare(platformA);
            case 'total-desc':
                return calculateCalculatedTotal(b) - calculateCalculatedTotal(a);
            case 'total-asc':
                return calculateCalculatedTotal(a) - calculateCalculatedTotal(b);
            default:
                return 0;
        }
    });
});

const formatDate = (dateString) => {
    return d(new Date(dateString), {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

function totalOriginalPay(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
    );
}

function paymentStatus(room) {
    const date = formatDate(room.paid_at);
    if (room.paid_via) {
        return t('components.room.OrderRooms.paidAtVia', {
            date,
            method: room.paid_via,
        });
    }
    return t('components.room.OrderRooms.paidAt', { date });
}

function handleOpenRoom(room) {
    router.push('/active-room/' + (room.room_id || room.id));
}

function handlePayment(room) {
    const roomWithRunnerId = {
        ...room,
        runner_id: room.runner_id || room.room_runner_id,
    };
    emit('pay-room', roomWithRunnerId);
}
</script>