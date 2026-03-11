export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  // Singleton refresh promise — prevents concurrent refresh calls with stale tokens
  let refreshPromise: Promise<{
    accessToken: string;
    refreshToken: string;
  }> | null = null;

  const $api = async <T = any>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> => {
    const headers: Record<string, string> = {};
    const apiBase = config.public.apiBase ?? '/api';
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }

    try {
      return await $fetch<T>(`${apiBase}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers as any) },
      });
    } catch (err: any) {
      if (err?.response?.status === 401 && authStore.refreshToken) {
        try {
          // Reuse an in-flight refresh to avoid race conditions
          if (!refreshPromise) {
            refreshPromise = $fetch<{
              accessToken: string;
              refreshToken: string;
            }>(`${apiBase}/auth/refresh`, {
              method: 'POST',
              body: { refreshToken: authStore.refreshToken },
            }).finally(() => {
              refreshPromise = null;
            });
          }
          const tokens = await refreshPromise;
          authStore.setTokens(tokens.accessToken, tokens.refreshToken);
          headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          return await $fetch<T>(`${apiBase}${path}`, {
            ...options,
            headers: { ...headers, ...(options.headers as any) },
          });
        } catch {
          authStore.clearAuth();
          await navigateTo('/auth/login');
          throw err;
        }
      }
      throw err;
    }
  };

  return { provide: { api: $api } };
});
