<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <UButton to="/projects" variant="ghost" icon="i-heroicons-arrow-left" />
        <h1 class="text-2xl font-bold">새 프로젝트</h1>
      </div>

      <UCard>
        <UForm :state="form" @submit="onSubmit" class="space-y-4">
          <UFormField label="프로젝트명 *" name="title">
            <UInput
              v-model="form.title"
              placeholder="프로젝트 제목"
              class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="클라이언트" name="clientId">
              <USelect
                v-model="form.clientId"
                :items="clientItems"
                class="w-full" />
            </UFormField>
            <UFormField label="상태" name="status">
              <USelect
                v-model="form.status"
                :items="statusItems"
                class="w-full" />
            </UFormField>
            <UFormField label="계약금액" name="contractAmount">
              <UInput
                v-model.number="form.contractAmount"
                type="number"
                class="w-full" />
            </UFormField>
            <UFormField label="플랫폼" name="platform">
              <USelect
                v-model="form.platform"
                :items="platformItems"
                class="w-full" />
            </UFormField>
            <UFormField label="시작일" name="startedAt">
              <UInput v-model="form.startedAt" type="date" class="w-full" />
            </UFormField>
            <UFormField label="마감일" name="deadlineAt">
              <UInput v-model="form.deadlineAt" type="date" class="w-full" />
            </UFormField>
            <UFormField label="선금" name="depositAmount">
              <UInput
                v-model.number="form.depositAmount"
                type="number"
                class="w-full" />
            </UFormField>
            <UFormField label="잔금" name="balanceAmount">
              <UInput
                v-model.number="form.balanceAmount"
                type="number"
                class="w-full" />
            </UFormField>
          </div>
          <UFormField label="메모" name="memo">
            <UTextarea v-model="form.memo" placeholder="메모" class="w-full" />
          </UFormField>

          <UAlert v-if="error" color="error" :description="error" />

          <div class="flex justify-end gap-3">
            <UButton to="/projects" variant="outline">취소</UButton>
            <UButton type="submit" :loading="loading">저장</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Client, Project, PaginatedResponse} from '~/types/models';

definePageMeta({middleware: 'auth'});

const {$api} = useNuxtApp();
const route = useRoute();

const form = reactive({
  title: '',
  clientId: (route.query.clientId as string) || 'none',
  status: 'INQUIRY',
  contractAmount: 0,
  depositAmount: 0,
  balanceAmount: 0,
  platform: 'DIRECT',
  startedAt: '',
  deadlineAt: '',
  memo: '',
});

const loading = ref(false);
const error = ref('');
const clients = ref<Client[]>([]);

const clientItems = computed(() => [
  {label: '선택 안 함', value: 'none'},
  ...clients.value.map((c) => ({label: c.name, value: c.id})),
]);

const statusItems = [
  {label: '문의', value: 'INQUIRY'},
  {label: '협의중', value: 'NEGOTIATING'},
  {label: '진행중', value: 'IN_PROGRESS'},
];

const platformItems = [
  {label: '직접 계약', value: 'DIRECT'},
  {label: '크몽', value: 'KMONG'},
  {label: '숨고', value: 'SOOMGO'},
  {label: '프리랜서코리아', value: 'FREELANCERKOREA'},
  {label: '크리몬', value: 'CREMON'},
  {label: '기타', value: 'OTHER'},
];

onMounted(async () => {
  const res = await $api<PaginatedResponse<Client>>('/clients?limit=100');
  clients.value = res.data;
});

async function onSubmit() {
  if (!form.title) {
    error.value = '프로젝트명은 필수입니다.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const body: Record<string, unknown> = {...form};
    if (!body.clientId || body.clientId === 'none') delete body.clientId;
    if (!body.startedAt) delete body.startedAt;
    if (!body.deadlineAt) delete body.deadlineAt;
    const project = await $api<Project>('/projects', {
      method: 'POST',
      body,
    });
    await navigateTo(`/projects/${project.id}`);
  } catch (err: unknown) {
    error.value =
      (err as {data?: {message?: string}})?.data?.message ||
      '저장에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}
</script>
