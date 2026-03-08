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
          @update:model-value="loadClients"
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
            <span v-else class="text-gray-400 text-sm">-</span>
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
              @click="confirmDelete(row.original.id)"
            />
          </template>
        </UTable>
      </UCard>

      <div class="flex justify-center">
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="20"
          @update:page="loadClients"
        />
      </div>
    </div>

    <ModalClientsDeleteConfirm
      v-model:open="showDeleteConfirm"
      @confirm="deleteClient"
    />
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';

definePageMeta({ middleware: 'auth' });

const clientStore = useClientStore();
const { clients, total, loading } = storeToRefs(clientStore);

const page = ref(1);
const search = ref('');
const blacklistFilter = ref('all');

const columns = [
  { accessorKey: 'name', header: '이름' },
  { accessorKey: 'contactName', header: '담당자' },
  { accessorKey: 'phone', header: '연락처' },
  { accessorKey: 'platform', header: '플랫폼' },
  { accessorKey: 'isBlacklisted', header: '블랙리스트' },
  { id: 'actions', header: '' },
];

async function loadClients() {
  const params: Record<string, any> = { page: page.value };
  if (search.value) params.search = search.value;
  if (blacklistFilter.value !== 'all')
    params.isBlacklisted = blacklistFilter.value;
  await clientStore.fetchClients(params);
}

const debouncedFetch = useDebounceFn(loadClients, 300);

const showDeleteConfirm = ref(false);
const deleteTargetId = ref<string | null>(null);

function confirmDelete(id: string) {
  deleteTargetId.value = id;
  showDeleteConfirm.value = true;
}

async function deleteClient() {
  if (!deleteTargetId.value) return;
  await clientStore.deleteClient(deleteTargetId.value);
  showDeleteConfirm.value = false;
  await loadClients();
}

onMounted(loadClients);
</script>
