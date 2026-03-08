import type { Income, IncomeSummary, TaxReport } from '~/types/models';

export const useIncomeStore = defineStore('income', () => {
  const incomes = ref<Income[]>([]);
  const summary = ref<IncomeSummary | null>(null);
  const taxReport = ref<TaxReport | null>(null);
  const loading = ref(false);

  const state = {
    incomes,
    summary,
    taxReport,
    loading,
  };

  const getters = {};

  const fetchIncomes = async (params: { year?: string; month?: string } = {}) => {
    loading.value = true;
    try {
      const { $api } = useNuxtApp();
      const filteredParams: Record<string, string> = {};
      if (params.year) filteredParams.year = params.year;
      if (params.month && params.month !== 'all') filteredParams.month = params.month;
      incomes.value = await ($api as any)<Income[]>(
        '/incomes?' + new URLSearchParams(filteredParams).toString(),
      );
    } finally {
      loading.value = false;
    }
  };

  const fetchSummary = async () => {
    const { $api } = useNuxtApp();
    summary.value = await ($api as any)<IncomeSummary>('/incomes/summary');
  };

  const fetchTaxReport = async (year: string) => {
    const { $api } = useNuxtApp();
    taxReport.value = await ($api as any)<TaxReport>(`/incomes/tax-report?year=${year}`);
  };

  const addIncome = async (form: Record<string, unknown>) => {
    const { $api } = useNuxtApp();
    await ($api as any)('/incomes', { method: 'POST', body: form });
  };

  const deleteIncome = async (id: string) => {
    const { $api } = useNuxtApp();
    await ($api as any)(`/incomes/${id}`, { method: 'DELETE' });
  };

  const downloadPdf = async (year: string) => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const url = `${config.public.apiBase}/incomes/report/pdf?year=${year}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `income-report-${year}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const actions = {
    fetchIncomes,
    fetchSummary,
    fetchTaxReport,
    addIncome,
    deleteIncome,
    downloadPdf,
  };

  return {
    ...state,
    ...getters,
    ...actions,
  };
});
