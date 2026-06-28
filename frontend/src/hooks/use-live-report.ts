import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Match, MatchEvent, LiveComment } from '../types';

function patchMatch(qc: ReturnType<typeof useQueryClient>, data: Match) {
  void qc.invalidateQueries({ queryKey: ['matches'] });
  qc.setQueryData(['matches', data.id], (old: Match | undefined) => (old ? { ...old, ...data } : data));
}

export function useAddReportEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      matchId: string;
      type: string;
      minute: number;
      teamSide?: 'home' | 'away';
      playerId?: string;
      relatedPlayerId?: string;
      description?: string;
    }) => {
      const { matchId, ...payload } = body;
      return (await api.post<MatchEvent>(`/live/matches/${matchId}/report/events`, payload)).data;
    },
    onSuccess: (_, vars) => void qc.invalidateQueries({ queryKey: ['matches', vars.matchId] }),
  });
}

export function useDeleteReportEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, eventId }: { matchId: string; eventId: string }) =>
      (await api.delete(`/live/matches/${matchId}/report/events/${eventId}`)).data,
    onSuccess: (_, vars) => void qc.invalidateQueries({ queryKey: ['matches', vars.matchId] }),
  });
}

export function useAddReportComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { matchId: string; message: string; minute: number }) => {
      const { matchId, ...payload } = body;
      return (await api.post<LiveComment>(`/live/matches/${matchId}/report/comments`, payload)).data;
    },
    onSuccess: (_, vars) => void qc.invalidateQueries({ queryKey: ['matches', vars.matchId] }),
  });
}

export function useSubmitMatchReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/report/submit`)).data,
    onSuccess: (data) => {
      patchMatch(qc, data);
      void qc.invalidateQueries({ queryKey: ['live', 'pending'] });
    },
  });
}
