<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <UButton to="/contracts" variant="ghost" icon="i-heroicons-arrow-left" />
        <h1 class="text-2xl font-bold">새 계약서</h1>
      </div>

      <UCard>
        <div class="space-y-6">
          <!-- Step 1: Project -->
          <div>
            <h2 class="font-semibold mb-3">1. 프로젝트 선택</h2>
            <USelect
              v-model="form.projectId"
              :items="projectItems"
              class="w-full"
              @update:model-value="onProjectChange"
            />
          </div>

          <!-- Step 2: Contract type -->
          <div>
            <h2 class="font-semibold mb-3">2. 계약 유형</h2>
            <USelect
              v-model="form.type"
              :items="CONTRACT_TYPE_ITEMS"
              value-key="value"
              label-key="label"
              class="w-full"
              @update:model-value="onTypeChange"
            />
          </div>

          <!-- Step 3: Title & amounts -->
          <div>
            <h2 class="font-semibold mb-3">3. 기본 정보</h2>
            <div class="space-y-3">
              <UFormField label="계약 제목">
                <UInput v-model="form.title" placeholder="예: 쇼핑몰 개발 계약" class="w-full" />
              </UFormField>
              <div class="grid grid-cols-3 gap-3">
                <UFormField label="계약 금액 (원)">
                  <UInput
                    v-model.number="form.totalAmount"
                    type="number"
                    min="0"
                    class="w-full"
                    @keydown="(e: KeyboardEvent) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()"
                  />
                </UFormField>
                <UFormField label="시작일">
                  <UInput v-model="form.startDate" type="date" class="w-full" />
                </UFormField>
                <UFormField label="종료일">
                  <UInput v-model="form.endDate" type="date" class="w-full" />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Step 4: Contract content -->
          <div>
            <h2 class="font-semibold mb-3">4. 계약 조항</h2>
            <UTextarea
              v-model="form.content"
              placeholder="계약 조항을 입력하세요. 유형 선택 시 기본 템플릿이 자동으로 채워집니다."
              :rows="15"
              class="w-full font-mono text-sm"
            />
          </div>

          <!-- Step 5: Memo -->
          <div>
            <h2 class="font-semibold mb-3">5. 메모</h2>
            <UTextarea v-model="form.memo" placeholder="특이사항 등" class="w-full" />
          </div>

          <UAlert v-if="error" color="error" :description="error" />

          <div class="flex justify-end gap-3">
            <UButton to="/contracts" variant="outline">취소</UButton>
            <UButton :loading="submitting" @click="onSubmit">저장</UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project, PaginatedResponse } from '~/types/models';
import { CONTRACT_TYPE_ITEMS } from '~/constants/contract';
import {
  DEVELOPMENT_TEMPLATE,
  DESIGN_TEMPLATE,
  MAINTENANCE_TEMPLATE,
  applyTemplate,
} from '~/constants/contract-templates';

definePageMeta({ middleware: 'auth' });
useSeoMeta({ title: '계약서 작성' });

const { $api } = useNuxtApp();
const contractStore = useContractStore();

const projects = ref<Project[]>([]);
const submitting = ref(false);
const error = ref('');

const form = reactive({
  projectId: 'none',
  type: 'DEVELOPMENT',
  title: '',
  content: '',
  totalAmount: 0,
  startDate: '',
  endDate: '',
  memo: '',
});

const projectItems = computed(() => [
  { label: '선택...', value: 'none' },
  ...projects.value.map((p) => ({ label: p.title, value: p.id })),
]);

onMounted(async () => {
  const res = await $api<PaginatedResponse<Project>>('/projects?limit=100');
  projects.value = res.data;
});

function getTemplateVars() {
  const project = projects.value.find((p) => p.id === form.projectId);
  return {
    clientName: (project as any)?.client?.name,
    projectTitle: project?.title,
    totalAmount: form.totalAmount,
    startDate: form.startDate,
    endDate: form.endDate,
  };
}

function onProjectChange() {
  if (form.projectId === 'none') return;
  const project = projects.value.find((p) => p.id === form.projectId);
  if (!project) return;
  if (!form.title) form.title = `${project.title} 계약`;
  if (!form.totalAmount) form.totalAmount = project.contractAmount;
  if (!form.startDate && project.startedAt)
    form.startDate = project.startedAt.slice(0, 10);
  if (!form.endDate && project.deadlineAt)
    form.endDate = project.deadlineAt.slice(0, 10);
  fillTemplate();
}

function onTypeChange() {
  fillTemplate();
}

function fillTemplate() {
  const templates: Record<string, string> = {
    DEVELOPMENT: DEVELOPMENT_TEMPLATE,
    DESIGN: DESIGN_TEMPLATE,
    MAINTENANCE: MAINTENANCE_TEMPLATE,
  };
  const tpl = templates[form.type];
  if (tpl) form.content = applyTemplate(tpl, getTemplateVars());
}

async function onSubmit() {
  if (!form.projectId || form.projectId === 'none') {
    error.value = '프로젝트를 선택해주세요.';
    return;
  }
  if (!form.title.trim()) {
    error.value = '계약 제목을 입력해주세요.';
    return;
  }
  if (!form.content.trim()) {
    error.value = '계약 조항을 입력해주세요.';
    return;
  }
  submitting.value = true;
  error.value = '';
  try {
    const contract = await contractStore.createContract({
      ...form,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      memo: form.memo || undefined,
    });
    await navigateTo(`/contracts/${contract.id}`);
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '저장에 실패했습니다.';
  } finally {
    submitting.value = false;
  }
}
</script>
