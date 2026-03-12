<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold">회원가입</h2>
    </template>

    <UForm :state="form" @submit="onSubmit" class="space-y-4">
      <UFormField label="이름" name="name">
        <UInput v-model="form.name" placeholder="홍길동" class="w-full" />
      </UFormField>
      <UFormField label="이메일" name="email">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          class="w-full"
        />
      </UFormField>
      <UFormField label="비밀번호" name="password">
        <UInput
          v-model="form.password"
          type="password"
          placeholder="8자 이상"
          class="w-full"
        />
      </UFormField>
      <UFormField label="전화번호" name="phone">
        <UInput
          v-model="form.phone"
          placeholder="010-0000-0000"
          class="w-full"
        />
      </UFormField>

      <UAlert v-if="error" color="error" :description="error" />

      <UButton type="submit" class="w-full justify-center" :loading="loading">
        가입하기
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?
        <NuxtLink to="/auth/login" class="text-primary-500 font-medium"
          >로그인</NuxtLink
        >
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' });
useSeoMeta({ title: '회원가입' });

const { $api } = useNuxtApp();
const authStore = useAuthStore();

const form = reactive({ name: '', email: '', password: '', phone: '' });
const loading = ref(false);
const error = ref('');

async function onSubmit() {
  loading.value = true;
  error.value = '';
  try {
    const tokens = await ($api as any)('/auth/register', {
      method: 'POST',
      body: form,
    });
    authStore.setTokens(tokens.accessToken, tokens.refreshToken);
    await authStore.fetchMe();
    await navigateTo('/');
  } catch (err: any) {
    error.value = err?.data?.message || '회원가입에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>
