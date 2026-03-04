export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function $api<T = any>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    const headers: Record<string, string> = {}
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers as any) },
      })
    } catch (err: any) {
      if (err?.response?.status === 401 && authStore.refreshToken) {
        // Try refresh
        try {
          const tokens = await $fetch<{ accessToken: string; refreshToken: string }>(
            `${config.public.apiBase}/auth/refresh`,
            {
              method: 'POST',
              body: { refreshToken: authStore.refreshToken },
            },
          )
          authStore.setTokens(tokens.accessToken, tokens.refreshToken)
          headers['Authorization'] = `Bearer ${tokens.accessToken}`
          return await $fetch<T>(`${config.public.apiBase}${path}`, {
            ...options,
            headers: { ...headers, ...(options.headers as any) },
          })
        } catch {
          authStore.clearAuth()
          await navigateTo('/auth/login')
          throw err
        }
      }
      throw err
    }
  }

  return { $api }
}
