<template>
  <div>
    <AuthForm v-if="!user" />
    <UserInfo v-else />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import AuthForm from '../components/AuthForm.vue'
import UserInfo from '../components/UserInfo.vue'

const user = inject('user')
</script>
