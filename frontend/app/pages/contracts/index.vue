<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">계약서</h1>
        <UButton to="/contracts/new" icon="i-heroicons-plus">계약서 작성</UButton>
      </div>

      <UCard :ui="{ body: 'p-0' }">
        <UTable :data="contracts" :columns="columns" :loading="loading">
          <template #contractNo-cell="{ row }">
            <NuxtLink
              :to="`/contracts/${row.original.id}`"
              class="font-medium hover:text-primary-500"
            >
              {{ row.original.contractNo }}
            </NuxtLink>
          </template>
          <template #project-cell="{ row }">
            {{ row.original.project?.title }}
          </template>
          <template #type-cell="{ row }">
            {{ contractTypeLabel[row.original.type] }}
          </template>
          <template #totalAmount-cell="{ row }">
            ₩{{ row.original.totalAmount.toLocaleString() }}
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :color="contractStatusColor[row.original.status]"
              variant="soft"
              size="sm"
            >
              {{ contractStatusLabel[row.original.status] }}
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
import { contractStatusLabel, contractStatusColor, contractTypeLabel } from '~/constants/contract';

definePageMeta({ middleware: 'auth' });
useSeoMeta({ title: '계약서' });

const contractStore = useContractStore();
const { contracts, loading } = storeToRefs(contractStore);

const columns = [
  { accessorKey: 'contractNo', header: '계약번호' },
  { accessorKey: 'project', header: '프로젝트' },
  { accessorKey: 'type', header: '유형' },
  { accessorKey: 'totalAmount', header: '금액' },
  { accessorKey: 'status', header: '상태' },
  { accessorKey: 'createdAt', header: '작성일' },
];

onMounted(() => contractStore.fetchContracts());
</script>
