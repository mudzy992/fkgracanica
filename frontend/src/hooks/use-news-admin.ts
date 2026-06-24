import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ContentStatus, NewsItem } from '../types';

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; content: string; excerpt?: string }) =>
      (await api.post<NewsItem>('/news', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news'] }),
  });
}

export function useUpdateNewsStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentStatus }) =>
      (await api.patch<NewsItem>(`/news/${id}/status`, { status })).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news'] });
      void qc.invalidateQueries({ queryKey: ['news', 'published'] });
    },
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/news/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news'] }),
  });
}
