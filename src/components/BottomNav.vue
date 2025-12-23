<script setup>
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { navItems } from '@/lib/router' // { icon: lucide icon, label: 'Page Name', route: '/route' },
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

function navigateTo(route) {
    router.push(route)
}

function isActive(baseRoute) {
    return route.path === baseRoute || route.path.startsWith(baseRoute + '/')
}

// 1. New computed property to check if the nav should be shown
const shouldShowNav = computed(() => {
    // Extract an array of all defined nav item routes
    const navRoutes = navItems.map(item => item.route)

    // Check if the current route path is exactly one of the defined nav routes
    // OR if it starts with a defined nav route path (for nested routes)
    return navRoutes.some(baseRoute => 
        route.path === baseRoute || route.path.startsWith(baseRoute + '/')
    )
})
</script>


    <template>
        <div v-if="shouldShowNav" class="fixed bottom-0 left-0 w-full border-t bg-background z-50">
            <div class="flex h-16 items-center justify-around">
                <Button
                    v-for="item in navItems"
                    :key="item.route"
                    variant="ghost"
                    class="flex flex-col h-full p-0 rounded-none text-muted-foreground"
                    :class="{ 'text-primary': isActive(item.route) }"
                    @click="navigateTo(item.route)"
                >
                    <component :is="item.icon" class="w-5 h-5 mb-0.5" />
                    <span class="text-xs">
                        {{ item.label }}
                    </span>
                </Button>
            </div>
        </div>
    </template>