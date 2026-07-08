import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CompetitionRound } from '../types';

export type RoundDeleteImpact = {
  matchCount: number;
  approvedReportCount: number;
  ticketCount: number;
  eventCount: number;
  lineupCount: number;
  commentCount: number;
};

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

export function useRoundDeleteImpact(roundId: string | null) {
  return useQuery({
    queryKey: ['rounds', roundId, 'delete-impact'],
    queryFn: async () =>
      (await api.get<RoundDeleteImpact>(`/rounds/${roundId}/delete-impact`)).data,
    enabled: !!roundId,
  });
}

export function useDeleteRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, cascade }: { id: string; seasonId: string; cascade?: boolean }) =>
      (await api.delete(`/rounds/${id}`, { params: cascade ? { cascade: 'true' } : {} })).data,
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['rounds', vars.seasonId] });
      void qc.invalidateQueries({ queryKey: ['matches'] });
      void qc.invalidateQueries({ queryKey: ['standings'] });
      void qc.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}
