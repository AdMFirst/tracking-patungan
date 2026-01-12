<template>
    <div class="text-center p-6 bg-gray-50 rounded-lg border">
        <h2 class="text-xl font-semibold mb-4">{{ $t('components.room.JoinRoomPrompt.title') }}</h2>
        <p class="text-gray-600 mb-6">
            {{ $t('components.room.JoinRoomPrompt.description') }}
        </p>
        <div class="flex justify-center gap-4">
            <Button variant="outline" @click="cancel">
                {{ $t('components.room.JoinRoomPrompt.noButton') }}
            </Button>
            <Button @click="joinRoom" :disabled="loading">
                <span v-if="loading" class="flex items-center">
                    <Spinner class="mr-2 h-4 w-4" />
                    {{ $t('components.room.JoinRoomPrompt.joining') }}
                </span>
                <span v-else>{{ $t('components.room.JoinRoomPrompt.yesButton') }}</span>
            </Button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import Spinner from '@/components/ui/spinner/Spinner.vue';

const props = defineProps({
    roomId: {
        type: String,
        required: true
    },
    roomTitle: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['join', 'cancel']);

const loading = ref(false);

const joinRoom = async () => {
    loading.value = true;
    try {
        emit('join', props.roomId);
    } catch (error) {
        console.error('Error joining room:', error);
    } finally {
        loading.value = false;
    }
};

const cancel = () => {
    emit('cancel');
};
</script>