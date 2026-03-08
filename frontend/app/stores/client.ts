import type { Client, Project, ClientStats, PaginatedResponse } from '~/types/models';

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([]);
  const total = ref(0);
  const client = ref<Client | null>(null);
  const clientProjects = ref<Project[]>([]);
  const clientStats = ref<ClientStats | null>(null);
  const loading = ref(false);

  const state = {
    clients,
    total,
    client,
    clientProjects,
    clientStats,
    loading,
  };

  const getters = {};

  const fetchClients = async (params: { page?: number; search?: string; isBlacklisted?: string } = {}) => {
    loading.value = true;
    try {
      const { $api } = useNuxtApp();
      const res = await ($api as any)('/clients?' + new URLSearchParams(params as any).toString());
      clients.value = res.data;
      total.value = res.total;
    } finally {
      loading.value = false;
    }
  };

  const fetchClient = async (id: string) => {
    const { $api } = useNuxtApp();
    client.value = await ($api as any)(`/clients/${id}`);
  };

  const createClient = async (form: Record<string, unknown>) => {
    const { $api } = useNuxtApp();
    await ($api as any)('/clients', { method: 'POST', body: form });
  };

  const deleteClient = async (id: string) => {
    const { $api } = useNuxtApp();
    await ($api as any)(`/clients/${id}`, { method: 'DELETE' });
  };

  const fetchClientProjects = async (id: string) => {
    const { $api } = useNuxtApp();
    clientProjects.value = await ($api as any)(`/clients/${id}/projects`);
  };

  const fetchClientStats = async (id: string) => {
    const { $api } = useNuxtApp();
    clientStats.value = await ($api as any)(`/clients/${id}/stats`);
  };

  const actions = {
    fetchClients,
    fetchClient,
    createClient,
    deleteClient,
    fetchClientProjects,
    fetchClientStats,
  };

  return {
    ...state,
    ...getters,
    ...actions,
  };
});
