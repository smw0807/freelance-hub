<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">견적서</h1>
          <PageGuide
            title="견적서"
            description="클라이언트에게 보낼 견적서를 작성하고 관리하는 화면입니다.

• 항목별 단가와 수량을 입력해 견적서를 자동으로 생성합니다.
• 완성된 견적서는 PDF로 다운로드하거나 공유 링크를 생성해 클라이언트에게 전달할 수 있습니다.
• 공유 링크는 만료일을 설정할 수 있으며, 클라이언트는 로그인 없이 견적서를 열람할 수 있습니다.
• 견적서 번호를 클릭하면 상세 페이지로 이동합니다."
          />
        </div>
        <UButton to="/quotes/new" icon="i-heroicons-plus">새 견적서</UButton>
      </div>

      <UCard :ui="{ body: 'p-0' }">
        <UTable :data="quotes" :columns="columns" :loading="loading">
          <template #quoteNo-cell="{ row }">
            <NuxtLink
              :to="`/quotes/${row.original.id}`"
              class="font-medium hover:text-primary-500"
            >
              {{ row.original.quoteNo }}
            </NuxtLink>
          </template>
          <template #project-cell="{ row }">
            {{ row.original.project?.title }}
          </template>
          <template #totalAmount-cell="{ row }">
            ₩{{ row.original.totalAmount.toLocaleString() }}
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :color="quoteStatusColor[row.original.status]"
              variant="soft"
              size="sm"
            >
              {{ quoteStatusLabel[row.original.status] }}
            </UBadge>
          </template>
          <template #createdAt-cell="{ row }">
            {{ new Date(row.original.createdAt).toLocaleDateString('ko-KR') }}
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const quoteStore = useQuoteStore();
const { quotes, loading } = storeToRefs(quoteStore);

const columns = [
  { accessorKey: 'quoteNo', header: '견적번호' },
  { accessorKey: 'project', header: '프로젝트' },
  { accessorKey: 'totalAmount', header: '금액' },
  { accessorKey: 'status', header: '상태' },
  { accessorKey: 'createdAt', header: '발행일' },
];

onMounted(() => quoteStore.fetchQuotes());
</script>
