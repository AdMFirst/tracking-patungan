import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from '@/lib/router';
import { user } from '@/lib/auth';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { queryClient } from './lib/supabaseClient';

const app = createApp(App);


// The one-liner you like!
app.provide('user', user);

app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount('#app');
