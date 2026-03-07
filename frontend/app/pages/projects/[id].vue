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
          <UButton
            size="sm"
            variant="outline"
            icon="i-heroicons-pencil"
            @click="openEdit"
            >편집</UButton
          >
          <USelect
            v-model="project.status"
            :items="statusItems"
            size="sm"
            @update:model-value="updateStatus"
          />
        </div>
      </div>

      <!-- Info -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard>
          <p class="text-xs text-gray-500">계약금액</p>
          <p class="text-xl font-bold">
            ₩{{ project.contractAmount.toLocaleString() }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500">선금</p>
          <p class="text-xl font-bold">
            ₩{{ project.depositAmount.toLocaleString() }}
          </p>
          <p
            class="text-xs"
            :class="project.depositPaidAt ? 'text-green-500' : 'text-red-400'"
          >
            {{ project.depositPaidAt ? '수령완료' : '미수령' }}
          </p>
          <UButton
            v-if="!project.depositPaidAt"
            size="xs"
            variant="soft"
            class="mt-2"
            @click="confirmPaid('deposit')"
          >
            수령 완료
          </UButton>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500">잔금</p>
          <p class="text-xl font-bold">
            ₩{{ project.balanceAmount.toLocaleString() }}
          </p>
          <p
            class="text-xs"
            :class="project.balancePaidAt ? 'text-green-500' : 'text-red-400'"
          >
            {{ project.balancePaidAt ? '수령완료' : '미수령' }}
          </p>
          <UButton
            v-if="!project.balancePaidAt"
            size="xs"
            variant="soft"
            class="mt-2"
            @click="confirmPaid('balance')"
          >
            수령 완료
          </UButton>
        </UCard>
        <UCard>
          <p class="text-xs text-gray-500">마감일</p>
          <p class="text-xl font-bold">
            {{
              project.deadlineAt
                ? new Date(project.deadlineAt).toLocaleDateString('ko-KR')
                : '-'
            }}
          </p>
        </UCard>
      </div>

      <!-- Edit Modal -->
      <UModal v-model:open="showEdit" title="프로젝트 편집">
        <template #body>
          <div class="space-y-4">
            <UFormField label="계약금액">
              <UInput v-model.number="editForm.contractAmount" type="number" />
            </UFormField>
            <UFormField label="선금">
              <UInput v-model.number="editForm.depositAmount" type="number" />
            </UFormField>
            <UFormField label="잔금">
              <UInput v-model.number="editForm.balanceAmount" type="number" />
            </UFormField>
            <UFormField label="플랫폼">
              <UInput v-model="editForm.platform" />
            </UFormField>
            <UFormField label="시작일">
              <UInput v-model="editForm.startedAt" type="date" />
            </UFormField>
            <UFormField label="마감일">
              <UInput v-model="editForm.deadlineAt" type="date" />
            </UFormField>
            <UFormField label="메모">
              <UTextarea v-model="editForm.memo" :rows="3" />
            </UFormField>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showEdit = false">취소</UButton>
            <UButton @click="saveEdit">저장</UButton>
          </div>
        </template>
      </UModal>

      <!-- 수령 확인 Modal -->
      <UModal
        v-model:open="showPaidConfirm"
        :title="
          paidConfirmType === 'deposit' ? '선금 수령 확인' : '잔금 수령 확인'
        "
      >
        <template #body>
          <p class="text-sm text-white">
            {{ paidConfirmType === 'deposit' ? '선금' : '잔금' }}을 수령 완료
            처리하시겠습니까?
          </p>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showPaidConfirm = false"
              >취소</UButton
            >
            <UButton color="primary" @click="markPaid">확인</UButton>
          </div>
        </template>
      </UModal>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Checklist -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">체크리스트</h2>
              <div class="flex gap-2">
                <UInput
                  v-model="newCheckItem"
                  size="sm"
                  placeholder="새 항목..."
                  @keyup.enter="addCheckItem"
                  class="w-40"
                />
                <UButton
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="addCheckItem"
                />
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
              <span :class="{ 'line-through text-gray-400': item.isDone }">{{
                item.title
              }}</span>
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
              <UButton
                size="sm"
                :icon="isTracking ? 'i-heroicons-stop' : 'i-heroicons-play'"
                @click="toggleTimer"
              >
                {{ isTracking ? '정지' : '시작' }}
              </UButton>
            </div>
          </template>
          <div v-if="isTracking" class="text-center py-4">
            <p class="text-3xl font-mono font-bold text-primary-500">
              {{ elapsedTime }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ timerStart?.toLocaleTimeString('ko-KR') }} 부터
            </p>
          </div>
          <div class="space-y-2 mt-2">
            <div
              v-for="log in project.timeLogs"
              :key="log.id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-600">{{ log.description || '작업' }}</span>
              <span class="font-medium">{{
                log.durationMinutes ? `${log.durationMinutes}분` : '진행중'
              }}</span>
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
import type { Project, ChecklistItem, TimeLog } from '~/types/models';

definePageMeta({ middleware: 'auth' });

const { $api } = useNuxtApp();
const route = useRoute();

const project = ref<Project | null>(null);
const newCheckItem = ref('');
const isTracking = ref(false);
const showEdit = ref(false);
const showPaidConfirm = ref(false);
const paidConfirmType = ref<'deposit' | 'balance'>('deposit');
const editForm = reactive({
  contractAmount: 0,
  depositAmount: 0,
  balanceAmount: 0,
  platform: '',
  startedAt: '',
  deadlineAt: '',
  memo: '',
});
const activeLogId = ref<string | null>(null);
const timerStart = ref<Date | null>(null);
const elapsedTime = ref('00:00:00');
let timerInterval: ReturnType<typeof setInterval> | null = null;

const statusItems = [
  { label: '문의', value: 'INQUIRY' },
  { label: '협의중', value: 'NEGOTIATING' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '납품', value: 'DELIVERED' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소', value: 'CANCELLED' },
];

const totalMinutes = computed(
  () =>
    project.value?.timeLogs?.reduce(
      (s: number, l: TimeLog) => s + (l.durationMinutes || 0),
      0,
    ) || 0,
);

onMounted(async () => {
  project.value = await $api<Project>(`/projects/${route.params.id}`);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function openEdit() {
  const p = project.value;
  if (!p) return;
  editForm.contractAmount = p.contractAmount;
  editForm.depositAmount = p.depositAmount;
  editForm.balanceAmount = p.balanceAmount;
  editForm.platform = p.platform || '';
  editForm.startedAt = toDateInput(p.startedAt || null);
  editForm.deadlineAt = toDateInput(p.deadlineAt || null);
  editForm.memo = p.memo || '';
  showEdit.value = true;
}

async function saveEdit() {
  const body: Record<string, unknown> = {
    contractAmount: editForm.contractAmount,
    depositAmount: editForm.depositAmount,
    balanceAmount: editForm.balanceAmount,
    platform: editForm.platform || null,
    memo: editForm.memo || null,
    startedAt: editForm.startedAt
      ? new Date(editForm.startedAt).toISOString()
      : null,
    deadlineAt: editForm.deadlineAt
      ? new Date(editForm.deadlineAt).toISOString()
      : null,
  };
  const updated = await $api<Project>(`/projects/${project.value!.id}`, {
    method: 'PATCH',
    body,
  });
  Object.assign(project.value!, updated);
  showEdit.value = false;
}

function confirmPaid(type: 'deposit' | 'balance') {
  paidConfirmType.value = type;
  showPaidConfirm.value = true;
}

async function markPaid() {
  const type = paidConfirmType.value;
  const field = type === 'deposit' ? 'depositPaidAt' : 'balancePaidAt';
  const today = new Date().toISOString();
  await ($api as any)(`/projects/${project.value!.id}`, {
    method: 'PATCH',
    body: { [field]: today },
  });
  project.value![field] = today;
  showPaidConfirm.value = false;
}

async function updateStatus(status: string) {
  await ($api as any)(`/projects/${project.value!.id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

async function addCheckItem() {
  if (!newCheckItem.value.trim()) return;
  const item = await $api<ChecklistItem>(
    `/projects/${project.value!.id}/checklist`,
    {
      method: 'POST',
      body: { title: newCheckItem.value },
    },
  );
  project.value!.checklistItems.push(item);
  newCheckItem.value = '';
}

async function toggleCheckItem(item: ChecklistItem) {
  item.isDone = !item.isDone;
  await $api(`/projects/${project.value!.id}/checklist/${item.id}`, {
    method: 'PATCH',
    body: { isDone: item.isDone },
  });
}

async function removeCheckItem(itemId: string) {
  await $api(`/projects/${project.value!.id}/checklist/${itemId}`, {
    method: 'DELETE',
  });
  project.value!.checklistItems = project.value!.checklistItems.filter(
    (i) => i.id !== itemId,
  );
}

async function toggleTimer() {
  const id = project.value!.id;
  if (!isTracking.value) {
    // Start
    const log = await $api<TimeLog>(`/projects/${id}/timelogs`, {
      method: 'POST',
      body: { startedAt: new Date().toISOString() },
    });
    activeLogId.value = log.id;
    timerStart.value = new Date();
    isTracking.value = true;
    timerInterval = setInterval(() => {
      const diff = Math.floor(
        (Date.now() - timerStart.value!.getTime()) / 1000,
      );
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      elapsedTime.value = `${h}:${m}:${s}`;
    }, 1000);
  } else {
    // Stop
    clearInterval(timerInterval!);
    timerInterval = null;
    const log = await $api<TimeLog>(
      `/projects/${id}/timelogs/${activeLogId.value}/stop`,
      { method: 'PATCH' },
    );
    project.value!.timeLogs.unshift(log);
    isTracking.value = false;
    activeLogId.value = null;
    timerStart.value = null;
    elapsedTime.value = '00:00:00';
  }
}
</script>
