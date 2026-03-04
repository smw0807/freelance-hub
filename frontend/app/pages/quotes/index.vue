<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">견적서</h1>
        <NuxtLink to="/quotes/new">
          <UButton icon="i-heroicons-plus">새 견적서</UButton>
        </NuxtLink>
      </div>

      <UCard :ui="{ body: 'p-0' }">
        <UTable :data="quotes" :columns="columns" :loading="loading">
          <template #quoteNo-cell="{ row }">
            <NuxtLink :to="`/quotes/${row.original.id}`" class="font-medium hover:text-primary-500">
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
            <UBadge :color="quoteStatusColor(row.original.status)" variant="soft" size="sm">
              {{ quoteStatusLabel(row.original.status) }}
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
definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()

const quotes = ref([])
const loading = ref(false)

const columns = [
  { key: 'quoteNo', header: '견적번호' },
  { key: 'project', header: '프로젝트' },
  { key: 'totalAmount', header: '금액' },
  { key: 'status', header: '상태' },
  { key: 'createdAt', header: '발행일' },
]

function quoteStatusLabel(s: string) {
  const map: any = { DRAFT: '초안', SENT: '발송', ACCEPTED: '수락', REJECTED: '거절', EXPIRED: '만료' }
  return map[s] || s
}

function quoteStatusColor(s: string) {
  const map: any = { DRAFT: 'gray', SENT: 'primary', ACCEPTED: 'success', REJECTED: 'error', EXPIRED: 'warning' }
  return map[s] || 'gray'
}

onMounted(async () => {
  loading.value = true
  try {
    quotes.value = await ($api as any)('/quotes')
  } finally {
    loading.value = false
  }
})
</script>
