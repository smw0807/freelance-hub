<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">프로젝트</h1>
        <UButton to="/projects/new" icon="i-heroicons-plus"
          >새 프로젝트</UButton
        >
      </div>

      <UTabs
        v-model="activeStatus"
        :items="tabs"
        @update:model-value="fetchProjects" />

      <div class="mt-4">
        <UCard :ui="{body: 'p-0'}">
          <UTable :data="projects" :columns="columns" :loading="loading">
            <template #title-cell="{row}">
              <NuxtLink
                :to="`/projects/${row.original.id}`"
                class="font-medium hover:text-primary-500">
                {{ row.original.title }}
              </NuxtLink>
            </template>
            <template #client-cell="{row}">
              {{ row.original.client?.name || '-' }}
            </template>
            <template #contractAmount-cell="{row}">
              ₩{{ row.original.contractAmount.toLocaleString() }}
            </template>
            <template #status-cell="{row}">
              <UBadge
                :color="statusColor(row.original.status)"
                variant="soft"
                size="sm">
                {{ statusLabel(row.original.status) }}
              </UBadge>
            </template>
            <template #deadlineAt-cell="{row}">
              {{
                row.original.deadlineAt
                  ? new Date(row.original.deadlineAt).toLocaleDateString(
                      'ko-KR',
                    )
                  : '-'
              }}
            </template>
          </UTable>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Project, ProjectStatus, PaginatedResponse} from '~/types/models';

definePageMeta({middleware: 'auth'});

const {$api} = useNuxtApp();

const projects = ref<Project[]>([]);
const loading = ref(false);
const activeStatus = ref('');

const tabs = [
  {label: '전체', value: ''},
  {label: '문의', value: 'INQUIRY'},
  {label: '협의중', value: 'NEGOTIATING'},
  {label: '진행중', value: 'IN_PROGRESS'},
  {label: '납품', value: 'DELIVERED'},
  {label: '완료', value: 'COMPLETED'},
];

const columns = [
  {accessorKey: 'title', header: '프로젝트명'},
  {accessorKey: 'client', header: '클라이언트'},
  {accessorKey: 'status', header: '상태'},
  {accessorKey: 'contractAmount', header: '계약금액'},
  {accessorKey: 'deadlineAt', header: '마감일'},
];

async function fetchProjects() {
  loading.value = true;
  try {
    const params: Record<string, string> = {};
    if (activeStatus.value) params.status = activeStatus.value;
    const res = await $api<PaginatedResponse<Project>>(
      '/projects?' + new URLSearchParams(params).toString(),
    );
    projects.value = res.data;
  } finally {
    loading.value = false;
  }
}

const statusLabelMap: Record<ProjectStatus, string> = {
  INQUIRY: '문의',
  NEGOTIATING: '협의중',
  IN_PROGRESS: '진행중',
  DELIVERED: '납품',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

const statusColorMap: Record<ProjectStatus, string> = {
  INQUIRY: 'gray',
  NEGOTIATING: 'warning',
  IN_PROGRESS: 'primary',
  DELIVERED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

function statusLabel(s: ProjectStatus) {
  return statusLabelMap[s] ?? s;
}
function statusColor(s: ProjectStatus) {
  return statusColorMap[s] ?? 'gray';
}

onMounted(fetchProjects);
</script>
