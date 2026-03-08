export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

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
          const tokens = await $fetch<{
            accessToken: string;
            refreshToken: string;
          }>(`${apiBase}/auth/refresh`, {
            method: 'POST',
            body: { refreshToken: authStore.refreshToken },
          });
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
