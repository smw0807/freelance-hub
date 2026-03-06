<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6" v-if="project">
      <div class="flex items-center gap-3">
        <UButton to="/projects" variant="ghost" icon="i-heroicons-arrow-left" />
        <div>
          <h1 class="text-2xl font-bold">{{ project.title }}</h1>
          <p class="text-gray-500 text-sm">{{ project.client?.name }}</p>
        </div>
        <div class="ml-auto flex gap-2">
          <USelect v-model="project.status" :items="statusItems" size="sm" @update:model-value="updateStatus" />
        </div>
      </div>

      <!-- Info -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard>
          <p class="text-xs text-gray-500">계약금액</p>
          <p class="text-xl font-bold">₩{{ project.contractAmount.toLocaleString() }}</p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500">선금</p>
          <p class="text-xl font-bold">₩{{ project.depositAmount.toLocaleString() }}</p>
          <p class="text-xs" :class="project.depositPaidAt ? 'text-green-500' : 'text-red-400'">
            {{ project.depositPaidAt ? '수령완료' : '미수령' }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500">잔금</p>
          <p class="text-xl font-bold">₩{{ project.balanceAmount.toLocaleString() }}</p>
          <p class="text-xs" :class="project.balancePaidAt ? 'text-green-500' : 'text-red-400'">
            {{ project.balancePaidAt ? '수령완료' : '미수령' }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500">마감일</p>
          <p class="text-xl font-bold">{{ project.deadlineAt ? new Date(project.deadlineAt).toLocaleDateString('ko-KR') : '-' }}</p>
        </UCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Checklist -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">체크리스트</h2>
              <div class="flex gap-2">
                <UInput v-model="newCheckItem" size="sm" placeholder="새 항목..." @keyup.enter="addCheckItem" class="w-40" />
                <UButton size="sm" icon="i-heroicons-plus" @click="addCheckItem" />
              </div>
            </div>
          </template>
          <div class="space-y-2">
            <div
              v-for="item in project.checklistItems"
              :key="item.id"
              class="flex items-center gap-3"
            >
              <UCheckbox
                :model-value="item.isDone"
                @update:model-value="toggleCheckItem(item)"
              />
              <span :class="{ 'line-through text-gray-400': item.isDone }">{{ item.title }}</span>
              <UButton
                class="ml-auto"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                @click="removeCheckItem(item.id)"
              />
            </div>
          </div>
        </UCard>

        <!-- Time Tracking -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">타임트래킹</h2>
              <UButton size="sm" :icon="isTracking ? 'i-heroicons-stop' : 'i-heroicons-play'" @click="toggleTimer">
                {{ isTracking ? '정지' : '시작' }}
              </UButton>
            </div>
          </template>
          <div v-if="isTracking" class="text-center py-4">
            <p class="text-3xl font-mono font-bold text-primary-500">{{ elapsedTime }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ timerStart?.toLocaleTimeString('ko-KR') }} 부터</p>
          </div>
          <div class="space-y-2 mt-2">
            <div v-for="log in project.timeLogs" :key="log.id" class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ log.description || '작업' }}</span>
              <span class="font-medium">{{ log.durationMinutes ? `${log.durationMinutes}분` : '진행중' }}</span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t text-sm font-medium">
            총 작업시간: {{ totalMinutes }}분
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()
const route = useRoute()

const project = ref<any>(null)
const newCheckItem = ref('')
const isTracking = ref(false)
const activeLogId = ref<string | null>(null)
const timerStart = ref<Date | null>(null)
const elapsedTime = ref('00:00:00')
let timerInterval: ReturnType<typeof setInterval> | null = null

const statusItems = [
  { label: '문의', value: 'INQUIRY' },
  { label: '협의중', value: 'NEGOTIATING' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '납품', value: 'DELIVERED' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소', value: 'CANCELLED' },
]

const totalMinutes = computed(() =>
  project.value?.timeLogs?.reduce((s: number, l: any) => s + (l.durationMinutes || 0), 0) || 0,
)

onMounted(async () => {
  project.value = await ($api as any)(`/projects/${route.params.id}`)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

async function updateStatus(status: string) {
  await ($api as any)(`/projects/${project.value.id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

async function addCheckItem() {
  if (!newCheckItem.value.trim()) return
  const item = await ($api as any)(`/projects/${project.value.id}/checklist`, {
    method: 'POST',
    body: { title: newCheckItem.value },
  })
  project.value.checklistItems.push(item)
  newCheckItem.value = ''
}

async function toggleCheckItem(item: any) {
  item.isDone = !item.isDone
  await ($api as any)(`/projects/${project.value.id}/checklist/${item.id}`, {
    method: 'PATCH',
    body: { isDone: item.isDone },
  })
}

async function removeCheckItem(itemId: string) {
  await ($api as any)(`/projects/${project.value.id}/checklist/${itemId}`, { method: 'DELETE' })
  project.value.checklistItems = project.value.checklistItems.filter((i: any) => i.id !== itemId)
}

async function toggleTimer() {
  const id = project.value.id
  if (!isTracking.value) {
    // Start
    const log = await ($api as any)(`/projects/${id}/timelogs`, {
      method: 'POST',
      body: { startedAt: new Date().toISOString() },
    })
    activeLogId.value = log.id
    timerStart.value = new Date()
    isTracking.value = true
    timerInterval = setInterval(() => {
      const diff = Math.floor((Date.now() - timerStart.value!.getTime()) / 1000)
      const h = String(Math.floor(diff / 3600)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
      const s = String(diff % 60).padStart(2, '0')
      elapsedTime.value = `${h}:${m}:${s}`
    }, 1000)
  } else {
    // Stop
    clearInterval(timerInterval!)
    timerInterval = null
    const log = await ($api as any)(`/projects/${id}/timelogs/${activeLogId.value}/stop`, { method: 'PATCH' })
    project.value.timeLogs.unshift(log)
    isTracking.value = false
    activeLogId.value = null
    timerStart.value = null
    elapsedTime.value = '00:00:00'
  }
}
</script>
