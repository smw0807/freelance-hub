import type { Project, ChecklistItem, TimeLog, PaginatedResponse } from '~/types/models';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);
  const project = ref<Project | null>(null);
  const loading = ref(false);

  const state = {
    projects,
    project,
    loading,
  };

  const getters = {};

  const fetchProjects = async (params: { status?: string } = {}) => {
    loading.value = true;
    try {
      const { $api } = useNuxtApp();
      const res = await ($api as any)('/projects?' + new URLSearchParams(params as any).toString());
      projects.value = res.data;
    } finally {
      loading.value = false;
    }
  };

  const fetchProject = async (id: string) => {
    const { $api } = useNuxtApp();
    project.value = await ($api as any)(`/projects/${id}`);
  };

  const createProject = async (body: Record<string, unknown>) => {
    const { $api } = useNuxtApp();
    return await ($api as any)<Project>('/projects', { method: 'POST', body });
  };

  const updateProject = async (id: string, body: Record<string, unknown>) => {
    const { $api } = useNuxtApp();
    const updated = await ($api as any)<Project>(`/projects/${id}`, { method: 'PATCH', body });
    if (project.value?.id === id) Object.assign(project.value, updated);
    return updated;
  };

  const updateStatus = async (id: string, status: string) => {
    const { $api } = useNuxtApp();
    await ($api as any)(`/projects/${id}/status`, { method: 'PATCH', body: { status } });
  };

  const markPaid = async (id: string, type: 'deposit' | 'balance') => {
    const { $api } = useNuxtApp();
    const field = type === 'deposit' ? 'depositPaidAt' : 'balancePaidAt';
    const today = new Date().toISOString();
    await ($api as any)(`/projects/${id}`, { method: 'PATCH', body: { [field]: today } });
    if (project.value?.id === id) (project.value as any)[field] = today;
  };

  const addCheckItem = async (projectId: string, title: string) => {
    const { $api } = useNuxtApp();
    const item = await ($api as any)<ChecklistItem>(`/projects/${projectId}/checklist`, {
      method: 'POST',
      body: { title },
    });
    if (project.value?.id === projectId) project.value.checklistItems.push(item);
    return item;
  };

  const toggleCheckItem = async (projectId: string, item: ChecklistItem) => {
    const { $api } = useNuxtApp();
    item.isDone = !item.isDone;
    await ($api as any)(`/projects/${projectId}/checklist/${item.id}`, {
      method: 'PATCH',
      body: { isDone: item.isDone },
    });
  };

  const removeCheckItem = async (projectId: string, itemId: string) => {
    const { $api } = useNuxtApp();
    await ($api as any)(`/projects/${projectId}/checklist/${itemId}`, { method: 'DELETE' });
    if (project.value?.id === projectId) {
      project.value.checklistItems = project.value.checklistItems.filter((i) => i.id !== itemId);
    }
  };

  const startTimer = async (projectId: string) => {
    const { $api } = useNuxtApp();
    return await ($api as any)<TimeLog>(`/projects/${projectId}/timelogs`, {
      method: 'POST',
      body: { startedAt: new Date().toISOString() },
    });
  };

  const stopTimer = async (projectId: string, logId: string, description?: string) => {
    const { $api } = useNuxtApp();
    const log = await ($api as any)<TimeLog>(`/projects/${projectId}/timelogs/${logId}/stop`, {
      method: 'PATCH',
      body: description ? { description } : undefined,
    });
    if (project.value?.id === projectId) project.value.timeLogs.unshift(log);
    return log;
  };

  const actions = {
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    updateStatus,
    markPaid,
    addCheckItem,
    toggleCheckItem,
    removeCheckItem,
    startTimer,
    stopTimer,
  };

  return {
    ...state,
    ...getters,
    ...actions,
  };
});
