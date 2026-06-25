import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { NewsComment } from '../types';

export function useNewsComments(newsId: string) {
  return useQuery({
    queryKey: ['news', newsId, 'comments'],
    queryFn: async () => asArray<NewsComment>((await api.get(`/news/${newsId}/comments`)).data),
    enabled: !!newsId,
  });
}

export function useAddNewsComment(newsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) =>
      (await api.post<NewsComment>(`/news/${newsId}/comments`, { content })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news', newsId, 'comments'] }),
  });
}

export function useDeleteNewsComment(newsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) =>
      (await api.delete(`/news/comments/${commentId}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['news', newsId, 'comments'] }),
  });
}
