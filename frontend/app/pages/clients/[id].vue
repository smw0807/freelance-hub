<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6" v-if="client">
      <div class="flex items-center gap-3">
        <UButton to="/clients" variant="ghost" icon="i-heroicons-arrow-left" />
        <div>
          <h1 class="text-2xl font-bold">{{ client.name }}</h1>
          <p class="text-gray-500 text-sm">{{ client.contactName }}</p>
        </div>
        <div class="ml-auto flex gap-2">
          <UBadge v-if="client.isBlacklisted" color="error">블랙리스트</UBadge>
          <UButton variant="outline" size="sm" @click="showEdit = true">편집</UButton>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4" v-if="stats">
        <UCard>
          <p class="text-sm text-gray-500">총 프로젝트</p>
          <p class="text-2xl font-bold">{{ stats.totalProjects }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">완료 프로젝트</p>
          <p class="text-2xl font-bold">{{ stats.completedProjects }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-gray-500">총 수입</p>
          <p class="text-2xl font-bold">₩{{ stats.totalRevenue.toLocaleString() }}</p>
        </UCard>
      </div>

      <!-- Info -->
      <UCard>
        <template #header><h2 class="font-semibold">기본 정보</h2></template>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div><dt class="text-gray-500">이메일</dt><dd>{{ client.email || '-' }}</dd></div>
          <div><dt class="text-gray-500">전화</dt><dd>{{ client.phone || '-' }}</dd></div>
          <div><dt class="text-gray-500">플랫폼</dt><dd>{{ client.platform }}</dd></div>
          <div><dt class="text-gray-500">사업자번호</dt><dd>{{ client.businessNo || '-' }}</dd></div>
          <div><dt class="text-gray-500">평점</dt><dd>{{ client.rating ? '★'.repeat(client.rating) : '-' }}</dd></div>
        </dl>
        <p v-if="client.memo" class="mt-3 text-sm text-gray-600 border-t pt-3">{{ client.memo }}</p>
      </UCard>

      <!-- Projects -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">프로젝트 히스토리</h2>
            <UButton :to="`/projects/new?clientId=${client.id}`" size="sm" variant="outline" icon="i-heroicons-plus">새 프로젝트</UButton>
          </div>
        </template>
        <div v-if="!projects.length" class="text-center text-gray-400 py-6">프로젝트가 없습니다.</div>
        <div v-else class="space-y-2">
          <NuxtLink
            v-for="project in projects"
            :key="project.id"
            :to="`/projects/${project.id}`"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div>
              <p class="font-medium">{{ project.title }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(project.createdAt) }}</p>
            </div>
            <UBadge :color="statusColor(project.status)" variant="soft" size="sm">
              {{ statusLabel(project.status) }}
            </UBadge>
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()
const route = useRoute()

const client = ref<any>(null)
const projects = ref<any[]>([])
const stats = ref<any>(null)
const showEdit = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  ;[client.value, projects.value, stats.value] = await Promise.all([
    ($api as any)(`/clients/${id}`),
    ($api as any)(`/clients/${id}/projects`),
    ($api as any)(`/clients/${id}/stats`),
  ])
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR')
}

function statusLabel(s: string) {
  const map: any = {
    INQUIRY: '문의', NEGOTIATING: '협의중', IN_PROGRESS: '진행중',
    DELIVERED: '납품', COMPLETED: '완료', CANCELLED: '취소',
  }
  return map[s] || s
}

function statusColor(s: string) {
  const map: any = {
    INQUIRY: 'gray', NEGOTIATING: 'warning', IN_PROGRESS: 'primary',
    DELIVERED: 'info', COMPLETED: 'success', CANCELLED: 'error',
  }
  return map[s] || 'gray'
}
</script>
