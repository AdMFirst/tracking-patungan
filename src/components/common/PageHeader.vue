<template>
    <div
        class="flex flex-wrap items-center justify-between mb-6 gap-y-4 gap-x-2"
    >
        <div class="flex items-center gap-2">
            <Button variant="outline" size="icon" @click="goBack">
                <ArrowLeft class="h-4 w-4" />
            </Button>
            <h1 class="text-xl sm:text-2xl font-bold">{{ title }}</h1>
        </div>

        <div class="flex-1 sm:flex-none flex justify-end min-w-fit">
            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
});

const goBack = () => {
    router.go(-1);
};
</script>
