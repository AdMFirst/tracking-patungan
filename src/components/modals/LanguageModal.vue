<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent class="sm:max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{{ $t('pages.profile.index.changeLanguage') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('pages.profile.index.selectPreferredLanguage') }}
                </DialogDescription>
            </DialogHeader>

            <div class="flex-1 flex flex-col min-h-0">
                <div class="text-sm font-medium mb-2">
                    {{ $t('pages.profile.index.language') }}
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto pr-2">
                    <div
                        v-for="lang in languages"
                        :key="lang.value"
                        class="flex items-center space-x-3 mb-2 p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                        <input
                            type="radio"
                            :id="lang.value"
                            :value="lang.value"
                            v-model="selectedLanguage"
                            class="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        >
                        <label :for="lang.value" class="flex-1 cursor-pointer">
                            <div class="font-medium">{{ lang.label }}</div>
                        </label>
                    </div>
                </div>
            </div>

            <DialogFooter class="sm:flex-col sm:space-x-0 gap-2">
                <Button
                    variant="outline"
                    @click="$emit('update:open', false)"
                    class="w-full"
                >
                    {{ $t('pages.profile.index.cancel') }}
                </Button>
                <Button
                    :disabled="!selectedLanguage"
                    @click="handleSaveLanguage"
                    class="w-full"
                >
                    {{ $t('pages.profile.index.save') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const props = defineProps({
    open: Boolean,
});

const emit = defineEmits(['update:open', 'save']);

const { locale } = useI18n();
const selectedLanguage = ref(locale.value);

// Static list of supported languages
const languages = [
    { value: 'id',  label: 'Bahasa Indonesia' },
    { value: 'jv',  label: 'Basa Jawa' },
    { value: 'su',  label: 'Basa Sunda' },
    { value: 'en',  label: 'English' },
    { value: 'mad', label: 'Basa Madura' },
    { value: 'min', label: 'Baso Minang' },
    { value: 'ms',  label: 'Bahasa Melayu' },
    { value: 'ar',  label: 'العربية' },
    { value: 'zh',  label: '中文' },
    { value: 'ja',  label: '日本語' },
    { value: 'ko',  label: '한국어' },
];


watch(() => props.open, (isOpen) => {
    if (isOpen) {
        selectedLanguage.value = locale.value;
    }
});

const handleSaveLanguage = () => {
    locale.value = selectedLanguage.value;
    localStorage.setItem('user-locale', selectedLanguage.value);
    emit('update:open', false);
    emit('save', selectedLanguage.value);
};
</script>