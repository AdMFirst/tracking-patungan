<template>
    <div
        class="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]"
    >
        <Vue3Lottie :animationData="LoadingApplication" height="60dvh"/>
        <p class="mt-2 text-xl fancy-text">{{ loadingMessage }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import LoadingApplication from '@/assets/LoadingApplication.json';
import { Vue3Lottie } from 'vue3-lottie';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const messages = Array.from({ length: 16 }, (_, i) => t(`components.common.LoadingScreen.${i}`));

const loadingMessage = ref(messages[0]);

// Select a random message when the component is initialized
onMounted(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    loadingMessage.value = messages[randomIndex];
});
</script>

<style scoped>
    .fancy-text {
        font-weight: 500;
        letter-spacing: 0.05em;
        /* Creates a gradient shimmer effect */
        background: linear-gradient(
            90deg, 
            #64748b 0%, 
            #233145 50%, 
            #64748b 100%
        );
        background-size: 200% auto;
        color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
        animation: shimmer 2s linear infinite;
    }

    @keyframes shimmer {
        to {
            background-position: 200% center;
        }
    }
</style>