import { defineStore } from 'pinia';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const { $api } = useNuxtApp();

  const notifications = ref<AppNotification[]>([]);
  const unreadCount = ref(0);
  let pollingTimer: ReturnType<typeof setInterval> | null = null;

  async function fetch() {
    try {
      const data = await $api<AppNotification[]>('/notifications');
      notifications.value = data;
    } catch {
      // silently fail
    }
  }

  async function fetchUnreadCount() {
    try {
      const data = await $api<{ count: number }>('/notifications/unread-count');
      unreadCount.value = data.count;
    } catch {
      // silently fail
    }
  }

  async function markRead(id: string) {
    try {
      await $api(`/notifications/${id}/read`, { method: 'PATCH' });
      const notif = notifications.value.find((n) => n.id === id);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch {
      // silently fail
    }
  }

  async function markAllRead() {
    try {
      await $api('/notifications/read-all', { method: 'PATCH' });
      notifications.value.forEach((n) => (n.isRead = true));
      unreadCount.value = 0;
    } catch {
      // silently fail
    }
  }

  function startPolling() {
    fetchUnreadCount();
    pollingTimer = setInterval(fetchUnreadCount, 30_000);
  }

  function stopPolling() {
    if (pollingTimer !== null) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  return {
    notifications,
    unreadCount,
    fetch,
    fetchUnreadCount,
    markRead,
    markAllRead,
    startPolling,
    stopPolling,
  };
});
