import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

function invalidate(qc: ReturnType<typeof useQueryClient>, key: string) {
  void qc.invalidateQueries({ queryKey: [key] });
}

export function useCreateHallOfFame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/hall-of-fame', body)).data,
    onSuccess: () => invalidate(qc, 'hall-of-fame'),
  });
}

export function useUpdateHallOfFame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/hall-of-fame/${id}`, body)).data,
    onSuccess: () => invalidate(qc, 'hall-of-fame'),
  });
}

export function useDeleteHallOfFame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/hall-of-fame/${id}`)).data,
    onSuccess: () => invalidate(qc, 'hall-of-fame'),
  });
}

export function useCreateMuseumItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/museum', body)).data,
    onSuccess: () => invalidate(qc, 'museum'),
  });
}

export function useUpdateMuseumItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/museum/${id}`, body)).data,
    onSuccess: () => invalidate(qc, 'museum'),
  });
}

export function useDeleteMuseumItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/museum/${id}`)).data,
    onSuccess: () => invalidate(qc, 'museum'),
  });
}

export function useCreateTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/club-timeline', body)).data,
    onSuccess: () => invalidate(qc, 'club-timeline'),
  });
}

export function useUpdateTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/club-timeline/${id}`, body)).data,
    onSuccess: () => invalidate(qc, 'club-timeline'),
  });
}

export function useDeleteTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/club-timeline/${id}`)).data,
    onSuccess: () => invalidate(qc, 'club-timeline'),
  });
}

export function useReorderTimelineEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => (await api.post('/club-timeline/reorder', { ids })).data,
    onSuccess: () => invalidate(qc, 'club-timeline'),
  });
}
