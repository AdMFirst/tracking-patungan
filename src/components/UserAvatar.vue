<script setup>
import { computed } from 'vue';
import Avatar from './ui/avatar/Avatar.vue';
import AvatarFallback from './ui/avatar/AvatarFallback.vue';
import AvatarImage from './ui/avatar/AvatarImage.vue';
import Badge from './ui/badge/Badge.vue';
import CardDescription from './ui/card/CardDescription.vue';
import CardHeader from './ui/card/CardHeader.vue';
import CardTitle from './ui/card/CardTitle.vue';


const props = defineProps({
    userMetadata: Object,
    provider: String,
})

const fallbackInitial = computed(() => {
  const name =
    props.userMetadata?.full_name ||
    props.userMetadata?.user_name ||
    'U'
  return name.charAt(0).toUpperCase()
})
</script>

<template>
<CardHeader class="flex flex-col items-center text-center pt-8">
    <!-- DISCORD -->
    <div v-if="props.provider === 'discord'" class="flex flex-col items-center space-y-3">
    <Avatar class="w-20 h-20 border-2 border-border">
        <AvatarImage
        :src="props.userMetadata.avatar_url"
        :alt="props.userMetadata.full_name"
        />
        <AvatarFallback class="text-xl">
        {{ fallbackInitial }}
        </AvatarFallback>
    </Avatar>

    <div>
        <CardTitle class="text-xl font-bold text-foreground">
        {{ props.userMetadata.full_name || props.userMetadata.nname }}
        </CardTitle>
        <CardDescription class="text-sm text-muted-foreground">
        {{ props.userMetadata.email }}
        </CardDescription>
        <Badge variant="secondary" class="mt-1">Connected via Discord</Badge>
    </div>
    </div>

    <!-- LINKEDIN -->
    <div v-else-if="props.provider === 'linkedin_oidc'" class="flex flex-col items-center space-y-3">
    <Avatar class="w-20 h-20 border-2 border-border">
        <AvatarImage
        :src="props.userMetadata.picture"
        :alt="props.userMetadata.name"
        />
    </Avatar>

    <div>
        <CardTitle class="text-xl font-bold text-foreground">
        {{ props.userMetadata.name }}
        </CardTitle>
        <CardDescription class="text-sm text-muted-foreground">
        {{ props.userMetadata.email }}
        </CardDescription>
        <Badge variant="secondary" class="mt-1">Connected via LinkedIn</Badge>
    </div>
    </div>

    <!-- EMAIL LOGIN -->
    <div v-else class="flex flex-col items-center space-y-3">
    <Avatar class="w-20 h-20 border-2 border-border">
        <AvatarFallback class="text-xl bg-primary/10 text-primary font-bold">
        {{ fallbackInitial }}
        </AvatarFallback>
    </Avatar>

    <div>
        <CardTitle class="text-xl font-bold text-foreground">
        {{ props.userMetadata.full_name }}
        </CardTitle>
        <CardDescription class="text-sm text-muted-foreground">
        {{ props.userMetadata.email }}
        </CardDescription>
        <Badge variant="secondary" class="mt-1">Email/Password</Badge>
    </div>
    </div>
</CardHeader>
</template>
