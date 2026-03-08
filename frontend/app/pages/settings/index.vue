<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 max-w-lg space-y-6">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">설정</h1>
        <PageGuide
          title="설정"
          description="계정 정보와 앱 환경을 설정하는 화면입니다.

• 이름, 전화번호 등 프로필 정보를 수정할 수 있습니다.
• 비밀번호를 변경할 수 있습니다 (소셜 로그인 계정은 제외).
• 다크 모드 / 라이트 모드 테마를 전환할 수 있습니다."
        />
      </div>

      <UCard>
        <template #header>
          <h2 class="font-semibold">프로필 수정</h2>
        </template>
        <div class="space-y-4">
          <UFormField label="이름">
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="전화번호">
            <UInput v-model="form.phone" class="w-full" placeholder="010-0000-0000" />
          </UFormField>
          <UFormField label="시간당 단가 (원)">
            <UInput v-model.number="form.hourlyRate" type="number" min="0" class="w-full" @keydown="(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()" />
          </UFormField>
          <UAlert v-if="error" color="error" :description="error" />
          <UAlert v-if="success" color="success" description="저장되었습니다." />
          <UButton :loading="loading" class="w-full justify-center" @click="save">저장</UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { $api } = useNuxtApp();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  phone: '',
  hourlyRate: 0,
});
const loading = ref(false);
const error = ref('');
const success = ref(false);

onMounted(() => {
  const u = authStore.user;
  if (u) {
    form.name = u.name ?? '';
    form.phone = (u as any).phone ?? '';
    form.hourlyRate = (u as any).hourlyRate ?? 0;
  }
});

async function save() {
  loading.value = true;
  error.value = '';
  success.value = false;
  try {
    const updated = await ($api as any)('/auth/me', {
      method: 'PATCH',
      body: {
        name: form.name || undefined,
        phone: form.phone || undefined,
        hourlyRate: form.hourlyRate || undefined,
      },
    });
    // Update authStore user so sidebar name reflects immediately
    if (authStore.user) {
      authStore.user = { ...authStore.user, ...updated };
    }
    success.value = true;
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '저장에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>
