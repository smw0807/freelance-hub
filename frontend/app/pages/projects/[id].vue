<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6" v-if="project">
      <div class="flex items-center gap-3">
        <UButton to="/projects" variant="ghost" icon="i-heroicons-arrow-left" />
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold">{{ project.title }}</h1>
            <PageGuide
              title="프로젝트 상세"
              description="개별 프로젝트의 모든 정보를 확인하고 관리하는 화면입니다.

• 계약금액, 선금/잔금 수령 현황, 마감일, 작업 상태를 확인하고 수정할 수 있습니다.
• 체크리스트 항목을 추가해 작업 진행 단계를 관리할 수 있습니다.
• 작업 로그에 날짜별 작업 내용과 소요 시간을 기록할 수 있습니다.
• 선금/잔금 수령 완료 처리를 통해 수입이 정산 화면에 자동 반영됩니다."
            />
          </div>
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
            @update:model-value="onUpdateStatus"
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

      <ModalProjectEdit
        v-model:open="showEdit"
        :platform-items="platformItems"
        :initial-form="editForm"
        @save="onSaveEdit"
      />
      <ModalProjectPaidConfirm
        v-model:open="showPaidConfirm"
        :type="paidConfirmType"
        @confirm="onMarkPaid"
      />

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
                  @keyup.enter="onAddCheckItem"
                  class="w-40"
                />
                <UButton
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="onAddCheckItem"
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
                @update:model-value="onToggleCheckItem(item)"
              />
              <span :class="{ 'line-through text-gray-400': item.isDone }">{{
                item.title
              }}</span>
              <UButton
                class="ml-auto"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                @click="onRemoveCheckItem(item.id)"
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
import type { ChecklistItem, TimeLog } from '~/types/models';
import { PLATFORM_ITEMS as platformItems } from '~/constants/platform';
import { STATUS_ITEMS as statusItems } from '~/constants/project';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const projectStore = useProjectStore();
const { project } = storeToRefs(projectStore);

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

const totalMinutes = computed(
  () =>
    project.value?.timeLogs?.reduce(
      (s: number, l: TimeLog) => s + (l.durationMinutes || 0),
      0,
    ) || 0,
);

onMounted(async () => {
  await projectStore.fetchProject(route.params.id as string);
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

async function onSaveEdit(form: typeof editForm) {
  const body: Record<string, unknown> = {
    contractAmount: form.contractAmount,
    depositAmount: form.depositAmount,
    balanceAmount: form.balanceAmount,
    platform: form.platform || null,
    memo: form.memo || null,
    startedAt: form.startedAt ? new Date(form.startedAt).toISOString() : null,
    deadlineAt: form.deadlineAt ? new Date(form.deadlineAt).toISOString() : null,
  };
  await projectStore.updateProject(project.value!.id, body);
  showEdit.value = false;
}

function confirmPaid(type: 'deposit' | 'balance') {
  paidConfirmType.value = type;
  showPaidConfirm.value = true;
}

async function onMarkPaid() {
  await projectStore.markPaid(project.value!.id, paidConfirmType.value);
  showPaidConfirm.value = false;
}

async function onUpdateStatus(status: string) {
  await projectStore.updateStatus(project.value!.id, status);
}

async function onAddCheckItem() {
  if (!newCheckItem.value.trim()) return;
  await projectStore.addCheckItem(project.value!.id, newCheckItem.value);
  newCheckItem.value = '';
}

async function onToggleCheckItem(item: ChecklistItem) {
  await projectStore.toggleCheckItem(project.value!.id, item);
}

async function onRemoveCheckItem(itemId: string) {
  await projectStore.removeCheckItem(project.value!.id, itemId);
}

async function toggleTimer() {
  const id = project.value!.id;
  if (!isTracking.value) {
    const log = await projectStore.startTimer(id);
    activeLogId.value = log.id;
    timerStart.value = new Date();
    isTracking.value = true;
    timerInterval = setInterval(() => {
      const diff = Math.floor((Date.now() - timerStart.value!.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      elapsedTime.value = `${h}:${m}:${s}`;
    }, 1000);
  } else {
    clearInterval(timerInterval!);
    timerInterval = null;
    await projectStore.stopTimer(id, activeLogId.value!);
    isTracking.value = false;
    activeLogId.value = null;
    timerStart.value = null;
    elapsedTime.value = '00:00:00';
  }
}
</script>
