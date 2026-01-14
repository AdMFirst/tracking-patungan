<template>
    <div
        class="relative w-full mx-auto overflow-hidden rounded-xl border bg-background shadow-sm max-w-[50dvh]"
    >
        <div class="relative aspect-square bg-muted">
            <div id="qr-reader" class="h-full w-full" />

            <div
                class="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
                <p
                    class="absolute bottom-1 text-sm font-medium text-white drop-shadow-md"
                >
                    {{ $t('components.qr.QRScanner.alignQRCode') }}
                </p>
            </div>
        </div>

        <div class="p-4 flex items-center justify-between border-t bg-card">
            <div class="flex flex-col">
                <span class="text-xs text-muted-foreground">{{
                    $t('components.qr.QRScanner.statusLabel')
                }}</span>
                <span class="text-sm font-semibold flex items-center gap-2">
                    <span
                        :class="[
                            'h-2 w-2 rounded-full',
                            isScanning
                                ? 'bg-green-500 animate-pulse'
                                : 'bg-red-500',
                        ]"
                    ></span>
                    {{
                        isScanning
                            ? $t('components.qr.QRScanner.activeStatus')
                            : $t('components.qr.QRScanner.pausedStatus')
                    }}
                </span>
            </div>

            <button
                @click="toggleCamera"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
                {{
                    isScanning
                        ? $t('components.qr.QRScanner.stopButton')
                        : $t('components.qr.QRScanner.startButton')
                }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { Html5Qrcode } from 'html5-qrcode';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isScanning = ref(false);
let html5QrCode = null;

const scannerConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
};

onMounted(() => {
    html5QrCode = new Html5Qrcode('qr-reader');
    startScanner();
});

const startScanner = async () => {
    try {
        await html5QrCode.start(
            { facingMode: 'environment' },
            scannerConfig,
            (qrCodeMessage) => {
                const uuid = extractUUID(qrCodeMessage);
                if (uuid) {
                    stopScanner();
                    router.push(`/active-room/${uuid}`);
                }
            },
            (errorMessage) => {
                // Ignore frequent noise/errors for a cleaner console
            }
        );
        isScanning.value = true;
    } catch (err) {
        console.error('Unable to start scanning.', err);
    }
};

const stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
        await html5QrCode.stop();
        isScanning.value = false;
    }
};

const toggleCamera = () => {
    if (isScanning.value) {
        stopScanner();
    } else {
        startScanner();
    }
};

const extractUUID = (qrCodeMessage) => {
    const match = qrCodeMessage.match(
        /(?:\/active-room\/|active-room\/)([a-f0-9\-]+)/i
    );
    return match ? match[1] : null;
};

onUnmounted(() => {
    stopScanner();
});
</script>

<style>
/* Clean up html5-qrcode's internal video styling */
#qr-reader video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
}

@keyframes scan {
    0% {
        top: 0;
    }
    100% {
        top: 100%;
    }
}

.animate-scan {
    animation: scan 2s linear infinite;
}
</style>
