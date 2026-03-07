export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  authStore.loadFromStorage();
  if (authStore.accessToken) {
    await authStore.fetchMe();
  }
});
