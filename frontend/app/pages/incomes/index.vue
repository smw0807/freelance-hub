<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">정산 / 세금</h1>
        <UButton icon="i-heroicons-plus" @click="addModalOpen = true"
          >수입 추가</UButton
        >
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" v-if="summary">
        <UCard>
          <p class="text-sm text-gray-500">이번달</p>
          <p class="text-2xl font-bold">
            ₩{{ summary.thisMonth.toLocaleString() }}
          </p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">올해 누계</p>
          <p class="text-2xl font-bold">
            ₩{{ summary.thisYear.toLocaleString() }}
          </p>
        </UCard>
        <UCard v-if="taxReport">
          <p class="text-sm text-gray-500">원천징수 납부액</p>
          <p class="text-2xl font-bold">
            ₩{{ taxReport.withholdingTaxTotal.toLocaleString() }}
          </p>
        </UCard>
        <UCard v-if="taxReport">
          <p class="text-sm text-gray-500">예상 소득세</p>
          <p class="text-2xl font-bold">
            ₩{{ taxReport.estimatedIncomeTax.toLocaleString() }}
          </p>
        </UCard>
      </div>

      <!-- Filters -->
      <div class="flex gap-3">
        <USelect
          v-model="filterYear"
          :items="yearItems"
          @update:model-value="fetchAll"
        />
        <USelect
          v-model="filterMonth"
          :items="monthItems"
          @update:model-value="fetchIncomes"
        />
      </div>

      <!-- Income list -->
      <UCard :ui="{ body: 'p-0' }">
        <UTable :data="incomes" :columns="columns" :loading="loading">
          <template #project-cell="{ row }">{{
            row.original.project?.title
          }}</template>
          <template #incomeType-cell="{ row }">
            <UBadge
              :color="incomeTypeColor[row.original.incomeType]"
              variant="soft"
              size="sm"
            >
              {{ incomeTypeLabel[row.original.incomeType] }}
            </UBadge>
          </template>
          <template #amount-cell="{ row }"
            >₩{{ row.original.amount.toLocaleString() }}</template
          >
          <template #netAmount-cell="{ row }">
            <span class="font-medium text-green-600"
              >₩{{ row.original.netAmount.toLocaleString() }}</span
            >
          </template>
          <template #isWithholdingTax-cell="{ row }">
            <UBadge
              v-if="row.original.isWithholdingTax"
              color="warning"
              variant="soft"
              size="sm"
              >원천징수</UBadge
            >
            <span v-else class="text-gray-400 text-sm">-</span>
          </template>
          <template #paidAt-cell="{ row }">{{
            new Date(row.original.paidAt).toLocaleDateString('ko-KR')
          }}</template>
          <template #actions-cell="{ row }">
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-trash"
              color="error"
              @click="deleteIncome(row.original.id)"
            />
          </template>
        </UTable>
      </UCard>
    </div>

    <!-- Add Modal -->
    <UModal v-model:open="addModalOpen" title="수입 추가">
      <template #body>
        <div class="p-4 space-y-4">
          <UFormField label="프로젝트 *">
            <USelect
              v-model="addForm.projectId"
              :items="projectItems"
              class="w-full"
            />
          </UFormField>
          <UFormField label="유형">
            <USelect
              v-model="addForm.incomeType"
              :items="incomeTypeItems"
              class="w-full"
            />
          </UFormField>
          <UFormField label="금액 *">
            <UInput
              v-model.number="addForm.amount"
              type="number"
              class="w-full"
            />
          </UFormField>
          <UFormField label="지급일 *">
            <UInput v-model="addForm.paidAt" type="date" class="w-full" />
          </UFormField>
          <UFormField label="원천징수">
            <UCheckbox
              v-model="addForm.isWithholdingTax"
              label="원천징수 적용 (3.3%)"
            />
          </UFormField>
          <UFormField label="메모">
            <UInput v-model="addForm.memo" class="w-full" />
          </UFormField>
          <UAlert v-if="addError" color="error" :description="addError" />
          <UButton
            class="w-full justify-center"
            :loading="addLoading"
            @click="addIncome"
            >저장</UButton
          >
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type {
  Income,
  Project,
  IncomeSummary,
  TaxReport,
  PaginatedResponse,
} from '~/types/models';

definePageMeta({ middleware: 'auth' });

const { $api } = useNuxtApp();

const incomes = ref<Income[]>([]);
const summary = ref<IncomeSummary | null>(null);
const taxReport = ref<TaxReport | null>(null);
const projects = ref<Project[]>([]);
const loading = ref(false);
const filterYear = ref(String(new Date().getFullYear()));
const filterMonth = ref('all');
const addModalOpen = ref(false);
const addLoading = ref(false);
const addError = ref('');

const addForm = reactive({
  projectId: 'none',
  incomeType: 'FULL',
  amount: 0,
  isWithholdingTax: false,
  paidAt: new Date().toISOString().split('T')[0],
  memo: '',
});

const columns = [
  { accessorKey: 'project', header: '프로젝트' },
  { accessorKey: 'incomeType', header: '유형' },
  { accessorKey: 'amount', header: '금액' },
  { accessorKey: 'netAmount', header: '실수령' },
  { accessorKey: 'isWithholdingTax', header: '원천징수' },
  { accessorKey: 'paidAt', header: '지급일' },
  { id: 'actions', header: '' },
];

const yearItems = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { label: `${y}년`, value: String(y) };
});

const monthItems = [
  { label: '전체', value: 'all' },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}월`,
    value: String(i + 1),
  })),
];

const incomeTypeItems = [
  { label: '전액', value: 'FULL' },
  { label: '선금', value: 'DEPOSIT' },
  { label: '잔금', value: 'BALANCE' },
  { label: '추가', value: 'EXTRA' },
];

const projectItems = computed(() => [
  { label: '선택...', value: 'none' },
  ...projects.value.map((p) => ({ label: p.title, value: p.id })),
]);

async function fetchIncomes() {
  loading.value = true;
  try {
    const params: Record<string, string> = {};
    if (filterYear.value) params.year = filterYear.value;
    if (filterMonth.value !== 'all') params.month = filterMonth.value;
    incomes.value = await $api<Income[]>(
      '/incomes?' + new URLSearchParams(params).toString(),
    );
  } finally {
    loading.value = false;
  }
}

async function fetchAll() {
  filterMonth.value = 'all';
  await Promise.all([
    fetchIncomes(),
    (async () => {
      summary.value = await $api<IncomeSummary>('/incomes/summary');
    })(),
    (async () => {
      taxReport.value = await $api<TaxReport>(
        `/incomes/tax-report?year=${filterYear.value}`,
      );
    })(),
  ]);
}

async function deleteIncome(id: string) {
  if (!confirm('삭제하시겠습니까?')) return;
  await ($api as any)(`/incomes/${id}`, { method: 'DELETE' });
  fetchIncomes();
}

async function addIncome() {
  if (!addForm.projectId || addForm.projectId === 'none' || !addForm.amount) {
    addError.value = '필수 항목을 입력해주세요.';
    return;
  }
  addLoading.value = true;
  addError.value = '';
  try {
    await ($api as any)('/incomes', { method: 'POST', body: addForm });
    addModalOpen.value = false;
    fetchAll();
  } catch (err: unknown) {
    addError.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '저장에 실패했습니다.';
  } finally {
    addLoading.value = false;
  }
}

onMounted(async () => {
  const res = await $api<PaginatedResponse<Project>>('/projects?limit=100');
  projects.value = res.data;
  await fetchAll();
});
</script>
