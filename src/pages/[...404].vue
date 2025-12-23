<script setup>
import { useRouter } from 'vue-router';

/**
 * Component logic for the 404 Page.
 * Uses Vue Router to navigate the user back to the homepage.
 */
const router = useRouter();

const goHome = () => {
    // Navigates to the root path (homepage)
    router.push('/');
    console.log('Action: Navigated user to the homepage using Vue Router.');
};
</script>

<template>
    <!-- Main container: Centers content vertically and horizontally, full viewport height -->
    <!-- Uses `bg-background` and `min-h-screen` (standard Tailwind utility) -->
    <div
        class="min-h-screen flex items-center justify-center bg-background p-4"
    >
        <!-- Content Card: Styled to look like a Shadcn Card (mobile-first scaling) -->
        <!-- Uses `bg-card` and `border-border` -->
        <div
            class="max-w-xs sm:max-w-sm w-full space-y-6 sm:space-y-8 text-center bg-card text-card-foreground shadow-2xl shadow-primary/10 rounded-xl p-6 sm:p-10 border border-border transition-all duration-300 hover:shadow-primary/20"
        >
            <!-- Large Error Code -->
            <!-- Uses `text-primary` for the accent color -->
            <div
                class="text-[5rem] sm:text-[6rem] font-extrabold leading-none text-primary"
            >
                404
            </div>

            <!-- Main Heading, using `text-foreground` -->
            <h1
                class="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
                Page Not Found
            </h1>

            <!-- Descriptive Message, using `text-muted-foreground` -->
            <p class="mt-4 text-sm text-muted-foreground sm:text-md">
                It looks like the address you typed doesn't lead anywhere. Don't
                worry, let's get you back on track.
            </p>

            <!-- Action Button (Shadcn Primary Button style) -->
            <!-- Uses `bg-primary`, `text-primary-foreground`, and `ring-ring` for focus -->
            <div class="mt-6 flex justify-center">
                <button
                    @click="goHome"
                    class="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-6 shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                    Go to Homepage
                </button>
            </div>
        </div>
    </div>
</template>
