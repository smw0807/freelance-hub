import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string
  plan: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    if (import.meta.client) {
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
    }
  }

  function loadFromStorage() {
    if (import.meta.client) {
      accessToken.value = localStorage.getItem('accessToken')
      refreshToken.value = localStorage.getItem('refreshToken')
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    if (import.meta.client) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  async function fetchMe() {
    try {
      const { $api } = useNuxtApp()
      user.value = await ($api as any)('/auth/me')
    } catch {
      clearAuth()
    }
  }

  async function logout() {
    try {
      const { $api } = useNuxtApp()
      await ($api as any)('/auth/logout', { method: 'POST' })
    } catch {}
    clearAuth()
    await navigateTo('/auth/login')
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
  }
})
