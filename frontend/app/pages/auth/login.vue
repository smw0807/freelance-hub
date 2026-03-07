<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-semibold">로그인</h2>
    </template>

    <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-4">
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
          placeholder="••••••••"
          class="w-full"
        />
      </UFormField>

      <UAlert v-if="error" color="error" :description="error" />

      <UButton type="submit" class="w-full justify-center" :loading="loading">
        로그인
      </UButton>
    </UForm>

    <USeparator label="또는" class="my-4" />

    <UButton
      variant="outline"
      class="w-full justify-center"
      icon="i-simple-icons-kakao"
      @click="kakaoLogin"
    >
      카카오로 로그인
    </UButton>

    <template #footer>
      <p class="text-center text-sm text-gray-500">
        계정이 없으신가요?
        <NuxtLink to="/auth/register" class="text-primary-500 font-medium"
          >회원가입</NuxtLink
        >
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const { $api } = useNuxtApp();
const authStore = useAuthStore();
const config = useRuntimeConfig();

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');

const schema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

async function onSubmit() {
  loading.value = true;
  error.value = '';
  try {
    const tokens = await ($api as any)('/auth/login', {
      method: 'POST',
      body: form,
    });
    authStore.setTokens(tokens.accessToken, tokens.refreshToken);
    await authStore.fetchMe();
    await navigateTo('/');
  } catch (err: any) {
    error.value = err?.data?.message || '로그인에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}

function kakaoLogin() {
  window.location.href = `${config.public.apiBase}/auth/kakao`;
}
</script>
