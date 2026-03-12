<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">프로젝트</h1>
          <PageGuide
            title="프로젝트"
            description="수행 중이거나 완료된 프로젝트를 관리하는 화면입니다.

• 프로젝트 상태(진행 중 / 완료 / 보류)별로 탭을 전환해 볼 수 있습니다.
• 계약금액, 선금, 잔금, 마감일을 등록하고 수금 현황을 추적합니다.
• 체크리스트로 작업 단계를 관리하고, 작업 로그로 시간을 기록할 수 있습니다.
• 프로젝트 이름을 클릭하면 상세 페이지에서 모든 정보를 확인하고 편집할 수 있습니다."
          />
        </div>
        <UButton to="/projects/new" icon="i-heroicons-plus"
          >새 프로젝트</UButton
        >
      </div>

      <UTabs
        v-model="activeStatus"
        :items="tabs"
        @update:model-value="loadProjects"
      />

      <div class="mt-4">
        <UCard :ui="{ body: 'p-0' }">
          <UTable :data="projects" :columns="columns" :loading="loading">
            <template #title-cell="{ row }">
              <NuxtLink
                :to="`/projects/${row.original.id}`"
                class="font-medium hover:text-primary-500"
              >
                {{ row.original.title }}
              </NuxtLink>
            </template>
            <template #client-cell="{ row }">
              {{ row.original.client?.name || '-' }}
            </template>
            <template #contractAmount-cell="{ row }">
              ₩{{ row.original.contractAmount.toLocaleString() }}
            </template>
            <template #status-cell="{ row }">
              <UBadge
                :color="projectStatusColor[row.original.status]"
                variant="soft"
                size="sm"
              >
                {{ projectStatusLabel[row.original.status] }}
              </UBadge>
            </template>
            <template #deadlineAt-cell="{ row }">
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
definePageMeta({ middleware: 'auth' });
useSeoMeta({ title: '프로젝트' });

const projectStore = useProjectStore();
const { projects, loading } = storeToRefs(projectStore);

const activeStatus = ref('');

const tabs = [
  { label: '전체', value: '' },
  { label: '문의', value: 'INQUIRY' },
  { label: '협의중', value: 'NEGOTIATING' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '납품', value: 'DELIVERED' },
  { label: '완료', value: 'COMPLETED' },
];

const columns = [
  { accessorKey: 'title', header: '프로젝트명' },
  { accessorKey: 'client', header: '클라이언트' },
  { accessorKey: 'status', header: '상태' },
  { accessorKey: 'contractAmount', header: '계약금액' },
  { accessorKey: 'deadlineAt', header: '마감일' },
];

async function loadProjects() {
  const params: Record<string, string> = {};
  if (activeStatus.value) params.status = activeStatus.value;
  await projectStore.fetchProjects(params);
}

onMounted(loadProjects);
</script>
