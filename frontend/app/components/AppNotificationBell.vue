<template>
  <UPopover v-model:open="isOpen" :popper="{ placement: 'top-end' }">
    <UButton
      variant="ghost"
      size="xs"
      :icon="unreadCount > 0 ? 'i-heroicons-bell-alert' : 'i-heroicons-bell'"
      :class="unreadCount > 0 ? 'text-primary-500' : ''"
      @click="onOpen"
    >
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center leading-none"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </UButton>

    <template #panel>
      <div class="w-80 max-h-96 flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <span class="text-sm font-semibold">알림</span>
          <UButton
            v-if="store.notifications.some((n) => !n.isRead)"
            variant="ghost"
            size="xs"
            label="모두 읽음"
            @click="store.markAllRead()"
          />
        </div>

        <!-- List -->
        <div class="overflow-y-auto flex-1">
          <div v-if="store.notifications.length === 0" class="py-8 text-center text-sm text-gray-400">
            알림이 없습니다
          </div>

          <button
            v-for="notif in store.notifications.slice(0, 10)"
            :key="notif.id"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
            :class="notif.isRead ? 'opacity-60' : ''"
            @click="onClickNotif(notif)"
          >
            <div class="flex items-start gap-2">
              <span
                v-if="!notif.isRead"
                class="mt-1.5 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"
              />
              <span v-else class="mt-1.5 w-2 h-2 flex-shrink-0" />
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">{{ notif.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                <p class="text-[11px] text-gray-400 mt-1">{{ formatTime(notif.createdAt) }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const store = useNotificationStore();
const router = useRouter();
const isOpen = ref(false);

const unreadCount = computed(() => store.unreadCount);

async function onOpen() {
  await store.fetch();
}

async function onClickNotif(notif: { id: string; link: string | null; isRead: boolean }) {
  if (!notif.isRead) {
    await store.markRead(notif.id);
  }
  if (notif.link) {
    isOpen.value = false;
    router.push(notif.link);
  }
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}
</script>
