<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0"
    >
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/icon.svg" class="w-6 h-6" alt="FreelanceHub" />
          <span class="font-bold text-lg">FreelanceHub</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="[
            $route.path === item.to || $route.path.startsWith(item.to + '/')
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
          ]"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="p-3 border-t border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-3 px-3 py-2">
          <div
            class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
          >
            <span
              class="text-primary-600 dark:text-primary-400 text-sm font-medium"
            >
              {{ userInitial }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
          <div class="relative">
            <AppNotificationBell />
          </div>
          <UButton
            variant="ghost"
            size="xs"
            icon="i-heroicons-arrow-right-on-rectangle"
            @click="authStore.logout()"
          />
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

onMounted(() => {
  notificationStore.startPolling();
});

onUnmounted(() => {
  notificationStore.stopPolling();
});

const navItems = [
  { to: '/', label: '대시보드', icon: 'i-heroicons-home' },
  { to: '/clients', label: '클라이언트', icon: 'i-heroicons-users' },
  { to: '/projects', label: '프로젝트', icon: 'i-heroicons-folder' },
  { to: '/quotes', label: '견적서', icon: 'i-heroicons-document-text' },
  { to: '/contracts', label: '계약서', icon: 'i-heroicons-document-check' },
  { to: '/incomes', label: '정산/세금', icon: 'i-heroicons-banknotes' },
  { to: '/settings', label: '설정', icon: 'i-heroicons-cog-6-tooth' },
];

const userInitial = computed(
  () => authStore.user?.name?.[0]?.toUpperCase() ?? '?',
);
</script>
