<template>
    <Dialog :open="open" @update:open="handleOpenChange">
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
                                <SelectItem value="ALL"
                                    >All Platforms</SelectItem
                                >
                                <SelectItem value="GrabFood"
                                    >GrabFood</SelectItem
                                >
                                <SelectItem value="GoFood">GoFood</SelectItem>
                                <SelectItem value="ShopeeFood"
                                    >ShopeeFood</SelectItem
                                >
                                <SelectItem value="FoodPanda"
                                    >FoodPanda</SelectItem
                                >
                                <SelectItem value="Lalafood"
                                    >Lalafood</SelectItem
                                >
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
</template>

<script setup>
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const props = defineProps({
    open: Boolean,
    filters: {
        type: Object,
        default: () => ({
            search: '',
            platform: 'ALL',
            restaurant: '',
            dateFrom: '',
            dateTo: '',
        }),
    },
});

const emit = defineEmits(['update:open', 'apply']);

// Internal state initialized with a copy of props
const filterForm = ref({ ...props.filters });

// Sync internal state when modal opens or props change
watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            filterForm.value = { ...props.filters };
        }
    }
);

const handleOpenChange = (val) => {
    emit('update:open', val);
};

const applyFilters = () => {
    // We create a shallow copy to manipulate the data before emitting
    const payload = { ...filterForm.value };

    // If the platform is 'ALL', we set it to an empty string so it isn't used as a filter
    if (payload.platform === 'ALL') {
        payload.platform = '';
    }

    emit('apply', payload);
    handleOpenChange(false);
};

const clearFilters = () => {
    const clearedState = {
        search: '',
        platform: 'ALL',
        restaurant: '',
        dateFrom: '',
        dateTo: '',
    };
    filterForm.value = { ...clearedState };
};
</script>
