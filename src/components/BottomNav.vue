<script setup>
import { useRouter, useRoute } from 'vue-router'
import { Home, Search, User, Book } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()

const navItems = [
    { icon: Home, label: 'Home', route: '/' },
    { icon: Search, label: 'Search', route: '/search' },
    { icon: Book, label: 'My Room', route: '/myroom' },
    { icon: User, label: 'Profile', route: '/profile' },
]


function navigateTo(route) {
    router.push(route)
}

function isActive(baseRoute) {
    return route.path === baseRoute || route.path.startsWith(baseRoute + '/')
}
</script>


    <template>
        <div class="fixed bottom-0 left-0 w-full border-t bg-background z-50">
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