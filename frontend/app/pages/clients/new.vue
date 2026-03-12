<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <UButton to="/clients" variant="ghost" icon="i-heroicons-arrow-left" />
        <h1 class="text-2xl font-bold">새 클라이언트</h1>
      </div>

      <UCard>
        <UForm :state="form" @submit="onSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="업체명 *" name="name">
              <UInput v-model="form.name" placeholder="업체명" class="w-full" />
            </UFormField>
            <UFormField label="담당자" name="contactName">
              <UInput
                v-model="form.contactName"
                placeholder="담당자 이름"
                class="w-full"
              />
            </UFormField>
            <UFormField label="이메일" name="email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
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
            <UFormField label="플랫폼" name="platform">
              <USelect
                v-model="form.platform"
                :items="platformItems"
                class="w-full"
              />
            </UFormField>
            <UFormField label="사업자번호" name="businessNo">
              <UInput
                v-model="form.businessNo"
                placeholder="000-00-00000"
                class="w-full"
              />
            </UFormField>
            <UFormField label="평점" name="rating">
              <USelect
                v-model="form.rating"
                :items="
                  [1, 2, 3, 4, 5].map((n) => ({
                    label: '★'.repeat(n),
                    value: n,
                  }))
                "
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="메모" name="memo">
            <UTextarea v-model="form.memo" placeholder="메모" class="w-full" />
          </UFormField>

          <UAlert v-if="error" color="error" :description="error" />

          <div class="flex justify-end gap-3">
            <UButton to="/clients" variant="outline">취소</UButton>
            <UButton type="submit" :loading="loading">저장</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PLATFORM_ITEMS as platformItems } from '~/constants/platform';

definePageMeta({ middleware: 'auth' });
useSeoMeta({ title: '클라이언트 추가' });

const clientStore = useClientStore();

const form = reactive({
  name: '',
  contactName: '',
  email: '',
  phone: '',
  platform: 'DIRECT',
  businessNo: '',
  rating: undefined as number | undefined,
  memo: '',
});

const loading = ref(false);
const error = ref('');

async function onSubmit() {
  if (!form.name) {
    error.value = '업체명은 필수입니다.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    await clientStore.createClient(form);
    await navigateTo('/clients');
  } catch (err: any) {
    error.value = err?.data?.message || '저장에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>
