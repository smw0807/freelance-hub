import type { Contract } from '~/types/models';

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>([]);
  const contract = ref<Contract | null>(null);
  const loading = ref(false);
  const shareLoading = ref(false);

  const state = { contracts, contract, loading, shareLoading };

  const fetchContracts = async () => {
    loading.value = true;
    try {
      const { $api } = useNuxtApp();
      contracts.value = await ($api as any)<Contract[]>('/contracts');
    } finally {
      loading.value = false;
    }
  };

  const fetchContract = async (id: string) => {
    const { $api } = useNuxtApp();
    contract.value = await ($api as any)<Contract>(`/contracts/${id}`);
  };

  const createContract = async (body: Record<string, unknown>) => {
    const { $api } = useNuxtApp();
    return await ($api as any)<Contract>('/contracts', { method: 'POST', body });
  };

  const updateContract = async (id: string, body: Record<string, unknown>) => {
    const { $api } = useNuxtApp();
    const updated = await ($api as any)<Contract>(`/contracts/${id}`, {
      method: 'PATCH',
      body,
    });
    if (contract.value?.id === id) contract.value = updated;
    return updated;
  };

  const createShareLink = async (id: string, expiresAt?: string) => {
    shareLoading.value = true;
    try {
      const { $api } = useNuxtApp();
      const body: Record<string, string> = {};
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
      const updated = await ($api as any)<Partial<Contract>>(
        `/contracts/${id}/share`,
        { method: 'POST', body },
      );
      if (contract.value?.id === id)
        contract.value = { ...contract.value, ...updated };
    } finally {
      shareLoading.value = false;
    }
  };

  const downloadPdf = async (id: string, filename: string) => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const url = `${config.public.apiBase}/contracts/${id}/pdf`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const actions = {
    fetchContracts,
    fetchContract,
    createContract,
    updateContract,
    createShareLink,
    downloadPdf,
  };

  return { ...state, ...actions };
});
