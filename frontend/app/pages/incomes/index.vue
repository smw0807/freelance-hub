<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">정산 / 세금</h1>
          <PageGuide
            title="정산 / 세금"
            description="수입 내역을 기록하고 세금 신고를 준비하는 화면입니다.

• 프로젝트별 선금·잔금 수령 현황을 확인하고 직접 수입을 추가할 수 있습니다.
• 연간 총 수입과 예상 종합소득세(3.3% 원천징수 기준)를 자동으로 계산합니다.
• 연간 리포트를 PDF로 다운로드해 세금 신고 자료로 활용할 수 있습니다.
• 세금 연도 필터로 원하는 연도의 수입 내역을 조회할 수 있습니다."
          />
        </div>
        <div class="flex gap-2">
          <UButton
            variant="outline"
            icon="i-heroicons-document-arrow-down"
            @click="onDownloadPdf"
            >연간 리포트</UButton
          >
          <UButton icon="i-heroicons-plus" @click="addModalOpen = true"
            >수입 추가</UButton
          >
        </div>
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

      <!-- Charts -->
      <div v-if="summary" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard>
          <template #header><h2 class="font-semibold">월별 수입</h2></template>
          <ClientOnly>
            <Bar
              :data="monthlyChartData"
              :options="barOptions"
              class="max-h-52"
            />
          </ClientOnly>
        </UCard>
        <UCard>
          <template #header
            ><h2 class="font-semibold">플랫폼별 수입</h2></template
          >
          <ClientOnly>
            <Doughnut
              v-if="summary.platformBreakdown?.length"
              :data="platformChartData"
              :options="doughnutOptions"
              class="max-h-52"
            />
            <div
              v-else
              class="flex items-center justify-center h-52 text-gray-400 text-sm"
            >
              데이터 없음
            </div>
          </ClientOnly>
        </UCard>
      </div>

      <!-- Filters -->
      <div class="flex gap-3">
        <USelect
          v-model="filterYear"
          :items="yearItems"
          @update:model-value="loadAll"
        />
        <USelect
          v-model="filterMonth"
          :items="monthItems"
          @update:model-value="loadIncomes"
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
              @click="confirmDelete(row.original.id)"
            />
          </template>
        </UTable>
      </UCard>
    </div>

    <ModalIncomesDeleteConfirm
      v-model:open="showDeleteConfirm"
      @confirm="onDeleteIncome"
    />
    <ModalIncomesAdd
      v-model:open="addModalOpen"
      :loading="addLoading"
      :error="addError"
      :project-items="projectItems"
      :income-type-items="incomeTypeItems"
      :initial-form="addForm"
      :project-amounts="projectAmounts"
      @submit="onAddIncome"
    />
  </div>
</template>

<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Project, PaginatedResponse } from '~/types/models';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

definePageMeta({ middleware: 'auth' });

const { $api } = useNuxtApp();
const incomeStore = useIncomeStore();
const { incomes, summary, taxReport, loading } = storeToRefs(incomeStore);

const projects = ref<Project[]>([]);
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

const projectAmounts = computed(() =>
  Object.fromEntries(
    projects.value.map((p) => [
      p.id,
      { depositAmount: p.depositAmount, balanceAmount: p.balanceAmount },
    ]),
  ),
);

async function loadIncomes() {
  await incomeStore.fetchIncomes({ year: filterYear.value, month: filterMonth.value });
}

async function loadAll() {
  filterMonth.value = 'all';
  await Promise.all([
    loadIncomes(),
    incomeStore.fetchSummary(),
    incomeStore.fetchTaxReport(filterYear.value),
  ]);
}

const showDeleteConfirm = ref(false);
const deleteTargetId = ref<string | null>(null);

function confirmDelete(id: string) {
  deleteTargetId.value = id;
  showDeleteConfirm.value = true;
}

async function onDeleteIncome() {
  if (!deleteTargetId.value) return;
  await incomeStore.deleteIncome(deleteTargetId.value);
  showDeleteConfirm.value = false;
  await loadIncomes();
}

async function onAddIncome(form: typeof addForm) {
  if (!form.projectId || form.projectId === 'none' || !form.amount) {
    addError.value = '필수 항목을 입력해주세요.';
    return;
  }
  addLoading.value = true;
  addError.value = '';
  try {
    await incomeStore.addIncome(form);
    addModalOpen.value = false;
    await loadAll();
  } catch (err: unknown) {
    addError.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '저장에 실패했습니다.';
  } finally {
    addLoading.value = false;
  }
}

async function onDownloadPdf() {
  await incomeStore.downloadPdf(filterYear.value);
}

onMounted(async () => {
  const res = await $api<PaginatedResponse<Project>>('/projects?limit=100');
  projects.value = res.data;
  await loadAll();
});

// ── Chart data ──────────────────────────────────────────────────────────────

const PALETTE = [
  'rgba(59,130,246,0.7)',
  'rgba(16,185,129,0.7)',
  'rgba(245,158,11,0.7)',
  'rgba(239,68,68,0.7)',
  'rgba(139,92,246,0.7)',
  'rgba(236,72,153,0.7)',
];

const monthlyChartData = computed(() => ({
  labels: summary.value?.monthlyBreakdown?.map((m) => `${m.month}월`) ?? [],
  datasets: [
    {
      label: '실수령액',
      data: summary.value?.monthlyBreakdown?.map((m) => m.total) ?? [],
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderRadius: 4,
    },
  ],
}));

const platformChartData = computed(() => ({
  labels: summary.value?.platformBreakdown?.map((p) => p.label) ?? [],
  datasets: [
    {
      data: summary.value?.platformBreakdown?.map((p) => p.total) ?? [],
      backgroundColor: PALETTE,
    },
  ],
}));

const barOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      ticks: { callback: (v: number) => `₩${(v / 10000).toFixed(0)}만` },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ` ₩${ctx.parsed.toLocaleString()}`,
      },
    },
  },
};
</script>
