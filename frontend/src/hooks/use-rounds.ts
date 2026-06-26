import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CompetitionRound } from '../types';

export function useRounds(seasonId?: string) {
  return useQuery({
    queryKey: ['rounds', seasonId],
    queryFn: async () =>
      (await api.get<CompetitionRound[]>('/rounds', { params: { seasonId } })).data,
    enabled: !!seasonId,
  });
}

export function useCreateRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      seasonId: string;
      number: number;
      name?: string;
      startsAt?: string;
      endsAt?: string;
    }) => (await api.post<CompetitionRound>('/rounds', body)).data,
    onSuccess: (_d, vars) => void qc.invalidateQueries({ queryKey: ['rounds', vars.seasonId] }),
  });
}

export function useUpdateRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      seasonId: string;
      number?: number;
      name?: string;
      startsAt?: string | null;
      endsAt?: string | null;
    }) => (await api.patch<CompetitionRound>(`/rounds/${id}`, body)).data,
    onSuccess: (_d, vars) => void qc.invalidateQueries({ queryKey: ['rounds', vars.seasonId] }),
  });
}

export function useDeleteRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; seasonId: string }) =>
      (await api.delete(`/rounds/${id}`)).data,
    onSuccess: (_d, vars) => void qc.invalidateQueries({ queryKey: ['rounds', vars.seasonId] }),
  });
}
