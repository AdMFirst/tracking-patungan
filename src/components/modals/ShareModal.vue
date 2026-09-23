<template>
    <Dialog v-model:open="dialogOpen">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{{ t('pages.activeRoom.shareRoomTitle') }}</DialogTitle>
                <DialogDescription>
                    {{ t('pages.activeRoom.shareRoomDescription') }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex items-center flex-col py-4">
                <img
                    v-if="qrCodeUrl"
                    :src="qrCodeUrl"
                    alt="QR Code"
                    class="w-64 h-64"
                />
                <span class="text-sm text-muted-foreground">
                    Code: {{ roomId }}
                </span>
            </div>
            <DialogFooter class="flex-col sm:flex">
                <Button variant="outline" @click="shareNow">
                    {{ t('pages.activeRoom.shareNowButton') }}
                </Button>
                <Button variant="outline" @click="closeModal">
                    {{ t('pages.activeRoom.close') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import QRCode from 'qrcode';
import { toast } from 'vue-sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
    room: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();
const qrCodeUrl = ref('');
const dialogOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});

const generateQRCode = async () => {
    try {
        const currentUrl = window.location.href;
        qrCodeUrl.value = await QRCode.toDataURL(currentUrl);
    } catch (err) {
        console.error('Error generating QR code:', err);
        toast.error(t('pages.activeRoom.errors.generateQrFailed'));
    }
};

const shareNow = async () => {
    try {
        const currentUrl = window.location.href;

        const shareText = t('pages.activeRoom.shareNowContent', {
            platform: props.room?.platform || '',
            restaurant: props.room?.restaurant || '',
            url: currentUrl,
        });

        let qrCodeBlob = null;
        if (qrCodeUrl.value) {
            const response = await fetch(qrCodeUrl.value);
            qrCodeBlob = await response.blob();
        }

        const shareData = {
            title: props.room?.title || t('pages.activeRoom.thisRoom'),
            text: shareText,
        };

        if (qrCodeBlob && navigator.canShare) {
            const canShareWithFile = navigator.canShare({
                ...shareData,
                files: [
                    new File([qrCodeBlob], 'qrcode.png', {
                        type: 'image/png',
                    }),
                ],
            });

            if (canShareWithFile) {
                shareData.files = [
                    new File([qrCodeBlob], 'qrcode.png', {
                        type: 'image/png',
                    }),
                ];
            }
        }

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareText);
            toast.success(t('pages.activeRoom.toast.copySuccess'));
        }

        emit('update:modelValue', false);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
            try {
                const currentUrl = window.location.href;
                await navigator.clipboard.writeText(currentUrl);
                toast.success(t('pages.activeRoom.toast.copySuccess'));
                emit('update:modelValue', false);
            } catch (clipboardErr) {
                console.error('Error copying to clipboard:', clipboardErr);
                toast.error(t('pages.activeRoom.errors.shareFailed'));
            }
        }
    }
};

const closeModal = () => {
    emit('update:modelValue', false);
};

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal) {
            generateQRCode();
        }
    },
    { immediate: false },
);
</script>
