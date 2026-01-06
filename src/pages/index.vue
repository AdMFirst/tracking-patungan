<template>
    <div>
        <div class="min-h-screen bg-background p-4 pb-20">
            <div class="max-w-md mx-auto">
                <div class="text-center py-8">
                    <h1 class="text-3xl font-bold text-foreground mb-4">
                        Welcome!
                    </h1>
                    <p class="text-lg text-muted-foreground">
                        This is your dashboard
                    </p>
                    <p class="text-sm text-muted-foreground mt-2">
                        Track your expenses and join rooms
                    </p>
                </div>

                <!-- Monthly Spending Tracker -->
                <Card class="mb-6">
                    <CardHeader>
                        <CardTitle>Monthly Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-4 max-h-1/2 overflow-y-scroll">
                            <div
                                v-for="month in monthlySpending"
                                :key="month.month"
                                class="flex justify-between items-center p-3 bg-muted rounded-lg"
                            >
                                <span class="text-sm font-medium">{{
                                    formatMonthYear(month.month)
                                }}</span>
                                <span class="text-sm font-bold"
                                    >Rp
                                    {{
                                        formatCurrency(month.total_spent)
                                    }}</span
                                >
                            </div>
                            <div
                                v-if="monthlySpending.length === 0"
                                class="text-center py-4"
                            >
                                <p class="text-sm text-muted-foreground">
                                    No spending data available
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Join Room Card -->
                <Card class="mb-6">
                    <CardHeader>
                        <CardTitle>Join Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex gap-2">
                            <Input
                                v-model="roomCode"
                                placeholder="Enter room code"
                                class="flex-1"
                                @keyup.enter="joinRoom"
                            />
                            <Button
                                @click="joinRoom"
                                :disabled="!roomCode || isLoading"
                            >
                                <span v-if="!isLoading">Go</span>
                                <Spinner v-else class="w-4 h-4" />
                            </Button>
                            <Button
                                @click="scanQRCode"
                                variant="outline"
                            >
                                <span>Scan QR</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground"
                                    >Track your expenses</span
                                >
                            </div>
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground"
                                    >View analytics</span
                                >
                            </div>
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-2 h-2 bg-primary rounded-full"
                                ></div>
                                <span class="text-sm text-muted-foreground"
                                    >Manage budgets</span
                                >
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { inject, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMonthlySpending } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input/Input.vue';
import Button from '@/components/ui/button/Button.vue';
import Spinner from '@/components/ui/spinner/Spinner.vue';

const user = inject('user');
const router = useRouter();

const roomCode = ref('');
const isLoading = ref(false);
const monthlySpending = ref([]);

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
};

// Format month and year
const formatMonthYear = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('id-ID', options);
};

// Fetch monthly spending data
const loadData = async () => {
    if (!user?.value?.id) return;

    try {
        const data = await fetchMonthlySpending(user.value.id);
        monthlySpending.value = data;
    } catch (error) {
        console.error('Error fetching monthly spending:', error);
    }
};

// Join room functionality
const joinRoom = async () => {
    if (!roomCode.value || isLoading.value) return;

    isLoading.value = true;
    try {
        // Navigate to the room page
        router.push(`/active-room/${roomCode.value}`);
    } catch (error) {
        console.error('Error joining room:', error);
    } finally {
        isLoading.value = false;
    }
};

// Scan QR code functionality
const scanQRCode = async () => {
    try {
        // Check if the browser supports the BarcodeDetector API
        if ('BarcodeDetector' in window) {
            const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
            
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            // Create a canvas to capture frames
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Set up a loop to scan frames
            const scanFrame = async () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const barcodes = await barcodeDetector.detect(canvas);
                if (barcodes.length > 0) {
                    const qrCodeValue = barcodes[0].rawValue;
                    stream.getTracks().forEach(track => track.stop());
                    router.push(`/active-room/${qrCodeValue}`);
                } else {
                    requestAnimationFrame(scanFrame);
                }
            };

            scanFrame();
        } else {
            alert('QR code scanning is not supported in your browser.');
        }
    } catch (error) {
        console.error('Error scanning QR code:', error);
        alert('Failed to scan QR code. Please try again.');
    }
};

onMounted(() => {
    loadData();
});
</script>
