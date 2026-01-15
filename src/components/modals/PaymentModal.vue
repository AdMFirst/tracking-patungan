<template>
    <Dialog :open="isOpen" @update:open="handleClose">
        <!-- 🔧 REMOVED overflow-hidden -->
        <DialogContent class="sm:max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{{
                    $t('components.modals.PaymentModal.title')
                }}</DialogTitle>
                <DialogDescription>
                    {{ $t('components.modals.PaymentModal.description') }}
                </DialogDescription>
            </DialogHeader>

            <!-- 🔧 min-h-0 added -->
            <div class="flex-1 flex flex-col min-h-0 transition-all duration-200" :class="{ 'blur-sm select-none opacity-50': !isWindowFocused }">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div class="flex items-center">
                        <AlertTriangle class="h-4 w-4 text-yellow-400 mr-2" />
                        <p class="text-sm text-yellow-700">{{ $t('components.modals.PaymentModal.warning') }}</p>
                    </div>
                </div>

                <div class="text-sm font-medium mb-2">
                    {{
                        $t(
                            'components.modals.PaymentModal.availablePaymentMethods'
                        )
                    }}
                </div>

                <!-- 🔧 ONLY this section scrolls -->
                <div class="flex-1 min-h-0 overflow-y-auto pr-2">
                    <div
                        v-for="method in paymentMethods"
                        :key="method.id"
                        class="flex items-center space-x-3 mb-2 p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                        <input
                            type="radio"
                            :id="method.id"
                            :value="method.id"
                            @change="handleMethodSelect(method)"
                            v-model="selectedMethod"
                            class="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label :for="method.id" class="flex-1 cursor-pointer">
                            <div class="font-medium">{{ method.tipe }}</div>
                            <div class="text-sm text-muted-foreground">
                                {{ method.norek }}
                            </div>
                        </label>
                    </div>

                    <div
                        v-if="isPaymentMethodsLoading"
                        class="text-center py-4 text-sm text-muted-foreground"
                    >
                        {{
                            $t(
                                'components.modals.PaymentModal.loadingPaymentMethods'
                            )
                        }}
                    </div>

                    <div
                        v-if="!loadingMethods && paymentMethods.length === 0"
                        class="text-center py-4 text-sm text-muted-foreground"
                    >
                        {{
                            $t(
                                'components.modals.PaymentModal.noPaymentMethods'
                            )
                        }}
                    </div>
                </div>

                <!-- ❌ never scrolls -->
                <div class="border-t pt-4 mt-4">
                    <label class="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="confirmed"
                            class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span class="text-sm text-muted-foreground">
                            {{
                                $t(
                                    'components.modals.PaymentModal.confirmPaymentCheckbox'
                                )
                            }}
                        </span>
                    </label>
                </div>
            </div>

            <DialogFooter class="sm:flex-col sm:space-x-0 gap-2">
                <Button variant="outline" @click="handleClose" class="w-full">
                    {{ $t('components.modals.PaymentModal.cancelButton') }} ({{ countdown }})
                </Button>
                <Button
                    :disabled="!canPay"
                    @click="handleConfirmPayment"
                    class="w-full"
                >
                    {{
                        $t(
                            'components.modals.PaymentModal.confirmPaymentButton'
                        )
                    }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next';
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button.vue';
import { usePaymentMethodsQuery } from '../../lib/supabaseClient';
import { useQuery } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    room: Object,
    isOpen: Boolean,
});

const emit = defineEmits(['close', 'payment-confirmed']);

const paymentMethods = ref([]);
const loadingMethods = ref(false);
const selectedMethod = ref(null);
const confirmed = ref(false);
const isWindowFocused = ref(true);
const countdown = ref(30);
let timer = null;

const canPay = computed(() => {
    return selectedMethod.value && confirmed.value;
});

// Use TanStack Query for fetching payment methods
const { data: paymentMethodsData, isLoading: isPaymentMethodsLoading } = useQuery(
    computed(() => usePaymentMethodsByRoomIDQuery(props.room?.id))
);

watch(paymentMethodsData, (newData) => {
    paymentMethods.value = newData || [];
}, { immediate: true });

const handleFocus = () => { isWindowFocused.value = true; };
const handleBlur = () => { isWindowFocused.value = false; };

const stopTimer = () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
};

const startTimer = () => {
    stopTimer();
    countdown.value = 30;
    timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            stopTimer();
            handleClose();
        }
    }, 1000);
};

watch(() => props.isOpen, (val) => {
    if (val) {
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        isWindowFocused.value = document.hasFocus();
        startTimer();
    } else {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        stopTimer();
    }
}, { immediate: true });

onBeforeUnmount(() => {
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
    stopTimer();
});

const handleMethodSelect = (method) => {
    selectedMethod.value = method.id;

    if (method.norek) {
        navigator.clipboard
            .writeText(method.norek)
            .then(() => toast('Copied!'))
            .catch(() => toast.error('Failed to copy'));
    }
};

const handleConfirmPayment = () => {
    if (!canPay.value) return;

    emit('payment-confirmed', {
        roomId: props.room.room_id,
        paymentMethodId: selectedMethod.value,
        amount: props.room.final_total,
    });
};

const handleClose = () => {
    emit('close');
    selectedMethod.value = null;
    confirmed.value = false;
};

</script>
