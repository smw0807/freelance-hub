<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">클라이언트</h1>
        <UButton to="/clients/new" icon="i-heroicons-plus"
          >새 클라이언트</UButton
        >
      </div>

      <div class="flex gap-3">
        <UInput
          v-model="search"
          placeholder="이름, 이메일 검색..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          @input="debouncedFetch"
        />
        <USelect
          v-model="blacklistFilter"
          :items="[
            { label: '전체', value: 'all' },
            { label: '블랙리스트 제외', value: 'false' },
            { label: '블랙리스트만', value: 'true' },
          ]"
          @update:model-value="fetchClients"
        />
      </div>

      <UCard :ui="{ body: 'p-0' }">
        <UTable :data="clients" :columns="columns" :loading="loading">
          <template #name-cell="{ row }">
            <NuxtLink
              :to="`/clients/${row.original.id}`"
              class="font-medium hover:text-primary-500"
            >
              {{ row.original.name }}
            </NuxtLink>
          </template>
          <template #isBlacklisted-cell="{ row }">
            <UBadge
              v-if="row.original.isBlacklisted"
              color="error"
              variant="soft"
              size="sm"
              >블랙리스트</UBadge
            >
          </template>
          <template #platform-cell="{ row }">
            <UBadge v-if="row.original.platform" variant="outline" size="sm">
              {{
                platformLabel[row.original.platform] ?? row.original.platform
              }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-trash"
              color="error"
              @click="deleteClient(row.original.id)"
            />
          </template>
        </UTable>
      </UCard>

      <div class="flex justify-center">
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="20"
          @update:page="fetchClients"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';

definePageMeta({ middleware: 'auth' });

const { $api } = useNuxtApp();

const clients = ref<Client[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const search = ref('');
const blacklistFilter = ref('all');

const columns = [
  { accessorKey: 'name', header: '이름' },
  { accessorKey: 'contactName', header: '담당자' },
  { accessorKey: 'phone', header: '연락처' },
  { accessorKey: 'platform', header: '플랫폼' },
  { accessorKey: 'isBlacklisted', header: '상태' },
  { id: 'actions', header: '' },
];

async function fetchClients() {
  loading.value = true;
  try {
    const params: any = { page: page.value };
    if (search.value) params.search = search.value;
    if (blacklistFilter.value !== 'all')
      params.isBlacklisted = blacklistFilter.value;
    const res = await ($api as any)(
      '/clients?' + new URLSearchParams(params).toString(),
    );
    clients.value = res.data;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

const debouncedFetch = useDebounceFn(fetchClients, 300);

async function deleteClient(id: string) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  await ($api as any)(`/clients/${id}`, { method: 'DELETE' });
  fetchClients();
}

onMounted(fetchClients);
</script>
