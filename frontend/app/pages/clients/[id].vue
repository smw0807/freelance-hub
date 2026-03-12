<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6" v-if="client">
      <div class="flex items-center gap-3">
        <UButton to="/clients" variant="ghost" icon="i-heroicons-arrow-left" />
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold">{{ client.name }}</h1>
            <PageGuide
              title="클라이언트 상세"
              description="특정 클라이언트의 상세 정보를 확인하고 관리하는 화면입니다.

• 클라이언트의 연락처, 플랫폼, 메모 등 등록된 모든 정보를 확인할 수 있습니다.
• 총 프로젝트 수, 누적 계약금액, 미수금을 한눈에 볼 수 있습니다.
• 연결된 프로젝트 목록을 확인하고 각 프로젝트 상세 페이지로 이동할 수 있습니다.
• 우측 상단 '편집' 버튼으로 클라이언트 정보를 수정하거나 블랙리스트로 지정할 수 있습니다."
            />
          </div>
          <p class="text-gray-500 text-sm">{{ client.contactName }}</p>
        </div>
        <div class="ml-auto flex gap-2">
          <UBadge v-if="client.isBlacklisted" color="error">블랙리스트</UBadge>
          <UButton variant="outline" size="sm" @click="showEdit = true"
            >편집</UButton
          >
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4" v-if="clientStats">
        <UCard>
          <p class="text-sm text-gray-500">총 프로젝트</p>
          <p class="text-2xl font-bold">{{ clientStats.totalProjects }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">완료 프로젝트</p>
          <p class="text-2xl font-bold">{{ clientStats.completedProjects }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">총 수입</p>
          <p class="text-2xl font-bold">
            ₩{{ clientStats.totalRevenue.toLocaleString() }}
          </p>
        </UCard>
      </div>

      <!-- Info -->
      <UCard>
        <template #header><h2 class="font-semibold">기본 정보</h2></template>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">이메일</dt>
            <dd>{{ client.email || '-' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">전화</dt>
            <dd>{{ client.phone || '-' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">플랫폼</dt>
            <dd>{{ platformLabel[client.platform] }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">사업자번호</dt>
            <dd>{{ client.businessNo || '-' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">평점</dt>
            <dd>{{ client.rating ? '★'.repeat(client.rating) : '-' }}</dd>
          </div>
        </dl>
        <p v-if="client.memo" class="mt-3 text-sm text-gray-600 border-t pt-3">
          {{ client.memo }}
        </p>
      </UCard>

      <!-- Projects -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">프로젝트 히스토리</h2>
            <UButton
              :to="`/projects/new?clientId=${client.id}`"
              size="sm"
              variant="outline"
              icon="i-heroicons-plus"
              >새 프로젝트</UButton
            >
          </div>
        </template>
        <div v-if="!clientProjects.length" class="text-center text-gray-400 py-6">
          프로젝트가 없습니다.
        </div>
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="project in clientProjects"
            :key="project.id"
            :to="`/projects/${project.id}`"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div>
              <p class="font-medium">{{ project.title }}</p>
              <p class="text-xs text-gray-500">
                {{ formatDate(project.createdAt) }}
              </p>
            </div>
            <UBadge
              :color="projectStatusColor[project.status]"
              variant="soft"
              size="sm"
            >
              {{ projectStatusLabel[project.status] }}
            </UBadge>
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const clientStore = useClientStore();
const { client, clientProjects, clientStats } = storeToRefs(clientStore);
useSeoMeta({ title: () => client.value?.name ?? '클라이언트 상세' });

const showEdit = ref(false);

onMounted(async () => {
  const id = route.params.id as string;
  await Promise.all([
    clientStore.fetchClient(id),
    clientStore.fetchClientProjects(id),
    clientStore.fetchClientStats(id),
  ]);
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR');
}
</script>
