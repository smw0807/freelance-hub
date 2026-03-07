<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">대시보드</h1>
        <span class="text-sm text-gray-500">{{ currentMonth }}</span>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard v-for="card in summaryCards" :key="card.label">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ card.label }}</p>
              <p class="text-2xl font-bold mt-1">{{ card.value }}</p>
              <p v-if="card.sub" class="text-xs mt-1" :class="card.subClass">
                {{ card.sub }}
              </p>
            </div>
            <div class="p-2 rounded-lg" :class="card.iconBg">
              <UIcon
                :name="card.icon"
                class="w-5 h-5"
                :class="card.iconColor" />
            </div>
          </div>
        </UCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Upcoming Deadlines -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">마감 예정 프로젝트</h2>
              <NuxtLink to="/projects" class="text-sm text-primary-500"
                >전체보기</NuxtLink
              >
            </div>
          </template>
          <div
            v-if="!dashboard?.upcomingDeadlines?.length"
            class="text-center text-gray-400 py-6">
            이번달 마감 예정 프로젝트가 없습니다.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="project in dashboard.upcomingDeadlines"
              :key="project.id"
              class="flex items-center justify-between">
              <div>
                <NuxtLink
                  :to="`/projects/${project.id}`"
                  class="font-medium hover:text-primary-500">
                  {{ project.title }}
                </NuxtLink>
                <p class="text-xs text-gray-500">{{ project.client?.name }}</p>
              </div>
              <UBadge
                :color="deadlineColor(project.deadlineAt)"
                variant="soft"
                size="sm">
                D-{{ daysLeft(project.deadlineAt) }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <!-- Unpaid Projects -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">미수금 현황</h2>
              <NuxtLink to="/incomes" class="text-sm text-primary-500"
                >전체보기</NuxtLink
              >
            </div>
          </template>
          <div
            v-if="!dashboard?.unpaidProjects?.length"
            class="text-center text-gray-400 py-6">
            미수금이 없습니다.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="project in dashboard.unpaidProjects"
              :key="project.id"
              class="flex items-center justify-between">
              <div>
                <NuxtLink
                  :to="`/projects/${project.id}`"
                  class="font-medium hover:text-primary-500">
                  {{ project.title }}
                </NuxtLink>
                <p class="text-xs text-gray-500">{{ project.client?.name }}</p>
              </div>
              <span class="font-semibold text-red-500">{{
                formatMoney(project.balanceAmount)
              }}</span>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {DashboardData} from '~/types/models';

definePageMeta({middleware: 'auth'});

const {$api} = useNuxtApp();

const dashboard = ref<DashboardData | null>(null);

onMounted(async () => {
  try {
    dashboard.value = await $api<DashboardData>('/dashboard');
  } catch {}
});

const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
});

const summaryCards = computed(() => {
  const s = dashboard.value?.summary;
  if (!s) return [];
  const diff = s.thisMonthRevenue - s.prevMonthRevenue;
  const diffPct = s.prevMonthRevenue
    ? ((diff / s.prevMonthRevenue) * 100).toFixed(0)
    : null;

  return [
    {
      label: '이번 달 수입',
      value: formatMoney(s.thisMonthRevenue),
      sub: diffPct ? `전월 대비 ${diff >= 0 ? '+' : ''}${diffPct}%` : undefined,
      subClass: diff >= 0 ? 'text-green-500' : 'text-red-500',
      icon: 'i-heroicons-banknotes',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      label: '연간 누적 수입',
      value: formatMoney(s.thisYearRevenue),
      icon: 'i-heroicons-chart-bar',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: '미수금 합계',
      value: formatMoney(s.unpaidTotal),
      icon: 'i-heroicons-exclamation-triangle',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      label: '전월 수입',
      value: formatMoney(s.prevMonthRevenue),
      icon: 'i-heroicons-clock',
      iconBg: 'bg-gray-50',
      iconColor: 'text-gray-400',
    },
  ];
});

function formatMoney(amount: number) {
  if (!amount) return '₩0';
  return `₩${amount.toLocaleString()}`;
}

function daysLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function deadlineColor(dateStr: string) {
  const days = daysLeft(dateStr);
  if (days <= 3) return 'error';
  if (days <= 7) return 'warning';
  return 'success';
}
</script>
