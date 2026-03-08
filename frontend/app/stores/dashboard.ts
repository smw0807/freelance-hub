import type { DashboardData } from '~/types/models';

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboard = ref<DashboardData | null>(null);

  const state = {
    dashboard,
  };

  const getters = {};

  const fetchDashboard = async () => {
    try {
      const { $api } = useNuxtApp();
      dashboard.value = await ($api as any)<DashboardData>('/dashboard');
    } catch {}
  };

  const actions = {
    fetchDashboard,
  };

  return {
    ...state,
    ...getters,
    ...actions,
  };
});
