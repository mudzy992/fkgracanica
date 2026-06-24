import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Match, MatchEvent } from '../types';

export function useStartMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/start`)).data,
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['matches'] });
      qc.setQueryData(['matches', data.id], (old: Match | undefined) =>
        old ? { ...old, ...data } : data,
      );
    },
  });
}

export function useEndMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/end`)).data,
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['matches'] });
      qc.setQueryData(['matches', data.id], (old: Match | undefined) =>
        old ? { ...old, ...data } : data,
      );
    },
  });
}

export function useAddMatchEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      matchId: string;
      type: string;
      minute: number;
      teamSide?: 'home' | 'away';
      description?: string;
    }) => {
      const { matchId, ...payload } = body;
      return (await api.post<MatchEvent>(`/live/matches/${matchId}/events`, payload)).data;
    },
    onSuccess: (_, vars) => void qc.invalidateQueries({ queryKey: ['matches', vars.matchId] }),
  });
}
