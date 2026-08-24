<template>
    <div class="relative">
        <!-- Pull to refresh indicator -->
        <div 
            class="fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-200 ease-out pointer-events-none"
            :style="{ transform: `translateY(${pullDistance}px)` }"
            v-if="isPulling || isRefreshing"
        >
            <div class="bg-background shadow-md rounded-b-lg px-6 py-3 flex items-center gap-3">
                <Loader2 
                    v-if="isRefreshing" 
                    class="animate-spin h-5 w-5 text-foreground" 
                />
                <ArrowDown 
                    v-else 
                    class="h-5 w-5 transition-transform duration-200 ease-out text-foreground"
                    :class="{ 'rotate-180': pullDistance > threshold }"
                />
                <span class="text-sm">
                    {{ 
                        isRefreshing 
                            ? (t('components.common.PullToRefresh.refreshing') || 'Refreshing...') 
                            : (pullDistance > threshold 
                                ? (t('components.common.PullToRefresh.releaseToRefresh') || 'Release to refresh') 
                                : (t('components.common.PullToRefresh.pullToRefresh') || 'Pull to refresh')) 
                    }}
                </span>
            </div>
        </div>

        <!-- Wrapped Content -->
        <div 
            :class="isPulling ? 'transition-none' : 'transition-transform duration-300 ease-out'"
            :style="{ transform: `translateY(${contentOffset}px)` }"
        >
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { Loader2, ArrowDown } from 'lucide-vue-next';

const props = defineProps({
    onRefresh: {
        type: Function,
        required: true,
    },
    threshold: {
        type: Number,
        default: 80,
    },
    maxPullDistance: {
        type: Number,
        default: 150,
    },
    resistance: {
        type: Number,
        default: 0.5,
    },
});

const { t } = useI18n();

const isRefreshing = ref(false);
const isPulling = ref(false);
const pullDistance = ref(0);
const contentOffset = ref(0);

// --- Internal Refresh Handler ---
const triggerRefresh = async () => {
    if (isRefreshing.value) return;

    isRefreshing.value = true;
    isPulling.value = false;

    try {
        await props.onRefresh();
    } catch (error) {
        console.error('Error refreshing data:', error);
    } finally {
        contentOffset.value = 0;
        pullDistance.value = 0;

        setTimeout(() => {
            isRefreshing.value = false;
        }, 300);
    }
};

// --- Touch Handlers ---
let touchStartY = 0;
let isTouchDragging = false;

const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        isTouchDragging = true;
    }
};

const handleTouchMove = (e) => {
    if (!isTouchDragging || isRefreshing.value) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;

    if (diff > 0 && window.scrollY === 0) {
        e.preventDefault();
        const newPullDistance = Math.min(diff * props.resistance, props.maxPullDistance);

        pullDistance.value = newPullDistance;
        contentOffset.value = newPullDistance;
        isPulling.value = true;
    }
};

const handleTouchEnd = (e) => {
    if (!isTouchDragging) return;
    isTouchDragging = false;

    const currentY = e.changedTouches[0].clientY;
    const diff = currentY - touchStartY;
    const pullDistanceValue = Math.min(diff * props.resistance, props.maxPullDistance);

    if (pullDistanceValue > props.threshold) {
        triggerRefresh();
    } else {
        isPulling.value = false;
        pullDistance.value = 0;
        contentOffset.value = 0;
    }

    touchStartY = 0;
};

// --- Mouse Handlers ---
let mouseStartY = 0;
let isMouseDragging = false;

const handleMouseDown = (e) => {
    if (window.scrollY === 0 && !isRefreshing.value) {
        mouseStartY = e.clientY;
        isMouseDragging = true;
    }
};

const handleMouseMove = (e) => {
    if (!isMouseDragging || isRefreshing.value) return;

    const diff = e.clientY - mouseStartY;

    if (diff > 0 && window.scrollY === 0) {
        const newPullDistance = Math.min(diff * props.resistance, props.maxPullDistance);

        pullDistance.value = newPullDistance;
        contentOffset.value = newPullDistance;
        isPulling.value = true;
    }
};

const handleMouseUp = (e) => {
    if (!isMouseDragging) return;
    isMouseDragging = false;

    const diff = e.clientY - mouseStartY;
    const pullDistanceValue = Math.min(diff * props.resistance, props.maxPullDistance);

    if (pullDistanceValue > props.threshold) {
        triggerRefresh();
    } else {
        isPulling.value = false;
        pullDistance.value = 0;
        contentOffset.value = 0;
    }

    mouseStartY = 0;
};

const handleSelectStart = (e) => {
    if (isMouseDragging || isTouchDragging) {
        e.preventDefault();
    }
};

// Lifecycle hooks
onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    document.addEventListener('selectstart', handleSelectStart);
});

onBeforeUnmount(() => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    document.removeEventListener('selectstart', handleSelectStart);
});
</script>
