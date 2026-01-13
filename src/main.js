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
import ja from "@/assets/ja.js"
import ko from "@/assets/ko.js"
import ar from "@/assets/ar.js"
import jv from "@/assets/jv.js"
import min from "@/assets/min.js"
import su from "@/assets/su.js"
import id from "@/assets/id.js"
import ms from "@/assets/ms.js"
import zh from "@/assets/zh.js"
import mad from "@/assets/mad.js"

const i18n = createI18n({
    // something vue-i18n options here ...
    legacy: false,
    globalInjection: true,
    locale: localStorage.getItem('user-locale') || 'id',
    fallbackLocale: 'en',
    messages: {
        en,
        ja,
        ko,
        ar,
        jv,
        min,
        su,
        id,
        ms,
        zh,
        mad
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
