import { defineStore } from 'pinia';
import type { User } from '~/types/models';

const ACCESS_TOKEN_KEY = 'freelancehub_access_token';
const REFRESH_TOKEN_KEY = 'freelancehub_refresh_token';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  function setTokens(access: string, refresh: string) {
    accessToken.value = access;
    refreshToken.value = refresh;
    if (import.meta.client) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  }

  function loadFromStorage() {
    if (import.meta.client) {
      accessToken.value = localStorage.getItem(ACCESS_TOKEN_KEY);
      refreshToken.value = localStorage.getItem(REFRESH_TOKEN_KEY);
    }
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    if (import.meta.client) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  async function fetchMe() {
    try {
      const { $api } = useNuxtApp();
      user.value = await ($api as any)<User>('/auth/me');
    } catch {
      clearAuth();
    }
  }

  async function logout() {
    try {
      const { $api } = useNuxtApp();
      await ($api as any)('/auth/logout', { method: 'POST' });
    } catch {}
    clearAuth();
    await navigateTo('/auth/login');
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setTokens,
    loadFromStorage,
    clearAuth,
    fetchMe,
    logout,
  };
});
