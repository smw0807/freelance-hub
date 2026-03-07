<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">견적서</h1>
        <UButton to="/quotes/new" icon="i-heroicons-plus">새 견적서</UButton>
      </div>

      <UCard :ui="{body: 'p-0'}">
        <UTable :data="quotes" :columns="columns" :loading="loading">
          <template #quoteNo-cell="{row}">
            <NuxtLink
              :to="`/quotes/${row.original.id}`"
              class="font-medium hover:text-primary-500">
              {{ row.original.quoteNo }}
            </NuxtLink>
          </template>
          <template #project-cell="{row}">
            {{ row.original.project?.title }}
          </template>
          <template #totalAmount-cell="{row}">
            ₩{{ row.original.totalAmount.toLocaleString() }}
          </template>
          <template #status-cell="{row}">
            <UBadge
              :color="quoteStatusColor(row.original.status)"
              variant="soft"
              size="sm">
              {{ quoteStatusLabel(row.original.status) }}
            </UBadge>
          </template>
          <template #createdAt-cell="{row}">
            {{ new Date(row.original.createdAt).toLocaleDateString('ko-KR') }}
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Quote, QuoteStatus} from '~/types/models';

definePageMeta({middleware: 'auth'});

const {$api} = useNuxtApp();

const quotes = ref<Quote[]>([]);
const loading = ref(false);

const columns = [
  {accessorKey: 'quoteNo', header: '견적번호'},
  {accessorKey: 'project', header: '프로젝트'},
  {accessorKey: 'totalAmount', header: '금액'},
  {accessorKey: 'status', header: '상태'},
  {accessorKey: 'createdAt', header: '발행일'},
];

const quoteStatusLabelMap: Record<QuoteStatus, string> = {
  DRAFT: '초안',
  SENT: '발송',
  ACCEPTED: '수락',
  REJECTED: '거절',
  EXPIRED: '만료',
};
const quoteStatusColorMap: Record<QuoteStatus, string> = {
  DRAFT: 'gray',
  SENT: 'primary',
  ACCEPTED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
};

function quoteStatusLabel(s: QuoteStatus) {
  return quoteStatusLabelMap[s] ?? s;
}
function quoteStatusColor(s: QuoteStatus) {
  return quoteStatusColorMap[s] ?? 'gray';
}

onMounted(async () => {
  loading.value = true;
  try {
    quotes.value = await $api<Quote[]>('/quotes');
  } finally {
    loading.value = false;
  }
});
</script>
