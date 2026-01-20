// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes'; // assuming unplugin-vue-router
import { user, authReady, initAuth } from './auth';
import { Home, User, Book, History, PlusCircle } from 'lucide-vue-next';

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    // 1. Wait for Supabase/Auth
    if (!authReady.value) {
        await initAuth();
    }

    // 2. Identify Public Routes
    // Add any routes that should be accessible without login
    const publicRouteNames = ['/login', '/[...404]'];

    // Check if the current route is marked as public in the file's <route> block
    const isPublic = publicRouteNames.includes(to.name) || to.meta.isPublic;

    // 3. Logic
    if (!isPublic && !user.value) {
        // Only redirect to login if the route is NOT public AND the user is NOT authenticated
        // This allows the 404 page ([...path]) to render normally
        next('/login');
    } else {
        next();
    }
});

// Ensure SPA route changes are tracked reliably
router.afterEach((to) => {
    if (localStorage.getItem('goatcounter_dont_count') === 'true') return;

    if (window.goatcounter && window.goatcounter.count) {
        let path = to.path;
        path = path.replace(/\/active-room\/[^/]+/, '/active-room/{uuid}');
        path = path.replace(/\/myroom\/[^/]+/, '/myroom/{uuid}');

        window.goatcounter.count({
            path,
            event: false
        });
    }
});

export default router;

export const navItems = [
    { icon: Home, label: 'Home', route: '/' },
    { icon: History, label: 'Histori', route: '/histori' },
    { icon: PlusCircle, label: 'Create', route: '/create-room' },
    { icon: Book, label: 'My Room', route: '/myroom' },
    { icon: User, label: 'Profile', route: '/profile' },
];
