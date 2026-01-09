<template>
    <Card class="">
        <CardHeader class="p-4 pb-1">
            <div class="flex justify-between items-start">
                <Skeleton class="h-6 w-1/3" />
                <Skeleton class="h-5 w-16 rounded-full" />
            </div>
        </CardHeader>

        <CardContent class="p-4 pt-0 space-y-4">
            <div class="space-y-2">
                <div class="flex justify-between">
                    <Skeleton class="h-4 w-16" />
                    <Skeleton class="h-4 w-24" />
                </div>
                <div class="flex justify-between">
                    <Skeleton class="h-4 w-20" />
                    <Skeleton class="h-4 w-32" />
                </div>
                <div class="flex justify-between">
                    <Skeleton class="h-4 w-24" />
                </div>
            </div>

            <Separator class="my-2" />

            <div class="space-y-3">
                <div v-for="i in 2" :key="i" class="space-y-1">
                    <div class="flex justify-between">
                        <Skeleton class="h-4 w-3/4" />
                        <Skeleton class="h-4 w-12" />
                    </div>
                    <Skeleton class="h-3 w-1/2" />
                </div>
            </div>

            <div class="flex justify-between pt-2">
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-7 w-24" />
            </div>

            <div class="pt-2">
                <Skeleton class="h-10 w-full" />
            </div>
        </CardContent>
    </Card>
</template>

<script setup>
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
</script>
