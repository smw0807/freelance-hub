export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/kakao/callback',
  ];
  const isPublicRoute =
    to.path.startsWith('/q/') || to.path.startsWith('/c/');

  if (isPublicRoute || publicRoutes.includes(to.path)) {
    return;
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }
});
