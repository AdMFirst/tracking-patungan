import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from '@/lib/router';
import { user } from '@/lib/auth';

const app = createApp(App);

// The one-liner you like!
app.provide('user', user);

app.use(router);
app.mount('#app');
