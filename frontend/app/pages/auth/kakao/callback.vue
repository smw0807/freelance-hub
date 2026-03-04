<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary-500 mx-auto" />
      <p class="mt-3 text-gray-600">카카오 로그인 처리 중...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const accessToken = route.query.accessToken as string
  const refreshToken = route.query.refreshToken as string

  if (accessToken && refreshToken) {
    authStore.setTokens(accessToken, refreshToken)
    await authStore.fetchMe()
    await navigateTo('/')
  } else {
    await navigateTo('/auth/login')
  }
})
</script>
