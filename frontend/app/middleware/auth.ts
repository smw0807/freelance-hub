export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/kakao/callback',
  ];
  const isPublicQuote = to.path.startsWith('/q/');

  if (isPublicQuote || publicRoutes.includes(to.path)) {
    return;
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }
});
