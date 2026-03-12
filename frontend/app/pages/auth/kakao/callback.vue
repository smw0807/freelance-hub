<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-10 h-10 animate-spin text-primary-500 mx-auto"
      />
      <p class="mt-3 text-gray-600">카카오 로그인 처리 중...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
useSeoMeta({ title: '로그인 중' });

const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code as string;
  if (!code) {
    navigateTo('/auth/login');
    return;
  }

  const { $api } = useNuxtApp();
  const redirectUri = `${window.location.origin}/auth/kakao/callback`;

  const data = await $api('/auth/kakao/code', {
    method: 'POST',
    body: { code, redirectUri },
  });

  authStore.setTokens(data.accessToken, data.refreshToken);
  await authStore.fetchMe();
  navigateTo('/');
});
</script>
