import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCreateMatchHighlight(matchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; youtubeUrl: string; startSeconds?: number }) =>
      (await api.post(`/matches/${matchId}/highlights`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['matches', matchId] }),
  });
}

export function useDeleteMatchHighlight(matchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/matches/${matchId}/highlights/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['matches', matchId] }),
  });
}
