import type { Quote } from '~/types/models';

export const useQuoteStore = defineStore('quote', () => {
  const quotes = ref<Quote[]>([]);
  const quote = ref<Quote | null>(null);
  const loading = ref(false);
  const shareLoading = ref(false);

  const state = {
    quotes,
    quote,
    loading,
    shareLoading,
  };

  const getters = {};

  const fetchQuotes = async () => {
    loading.value = true;
    try {
      const { $api } = useNuxtApp();
      quotes.value = await ($api as any)<Quote[]>('/quotes');
    } finally {
      loading.value = false;
    }
  };

  const fetchQuote = async (id: string) => {
    const { $api } = useNuxtApp();
    quote.value = await ($api as any)<Quote>(`/quotes/${id}`);
  };

  const createQuote = async (body: Record<string, unknown>) => {
    const { $api } = useNuxtApp();
    return await ($api as any)<Quote>('/quotes', { method: 'POST', body });
  };

  const createShareLink = async (id: string, expiresAt: string) => {
    shareLoading.value = true;
    try {
      const { $api } = useNuxtApp();
      const body: Record<string, string> = {};
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();
      const updated = await ($api as any)<Partial<Quote>>(`/quotes/${id}/share`, {
        method: 'POST',
        body,
      });
      if (quote.value?.id === id) quote.value = { ...quote.value, ...updated };
    } finally {
      shareLoading.value = false;
    }
  };

  const downloadPdf = async (id: string, quoteNo: string) => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const url = `${config.public.apiBase}/quotes/${id}/pdf`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `quote-${quoteNo}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const actions = {
    fetchQuotes,
    fetchQuote,
    createQuote,
    createShareLink,
    downloadPdf,
  };

  return {
    ...state,
    ...getters,
    ...actions,
  };
});
