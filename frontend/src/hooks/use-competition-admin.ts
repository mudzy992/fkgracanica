import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useStandings(seasonId?: string) {
  return useQuery({
    queryKey: ['standings', seasonId],
    queryFn: async () =>
      (await api.get('/statistics/standings', { params: seasonId ? { seasonId } : undefined })).data,
    enabled: !!seasonId,
  });
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/players', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useCreateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/clubs', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['clubs'] }),
  });
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/matches', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useApproveMatchReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => (await api.post(`/live/matches/${matchId}/approve`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}
