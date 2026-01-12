import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from '@/lib/router';
import { user } from '@/lib/auth';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { queryClient } from './lib/supabaseClient';
import Vue3Lottie from 'vue3-lottie'
import { createI18n } from 'vue-i18n'

import en from "@/assets/en.js"

const i18n = createI18n({
    // something vue-i18n options here ...
    legacy: false,
    globalInjection: true,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en: en
    }
})

const app = createApp(App);

// The one-liner you like!
app.provide('user', user);
app.use(i18n)
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.use(Vue3Lottie);
app.mount('#app');
