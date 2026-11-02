import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Match, MatchEvent, LiveComment } from '../types';

function patchMatch(qc: ReturnType<typeof useQueryClient>, data: Match) {
  void qc.invalidateQueries({ queryKey: ['matches'] });
  qc.setQueryData(['matches', data.id], (old: Match | undefined) => (old ? { ...old, ...data } : data));
}

export function usePendingLiveReports() {
  return useQuery({
    queryKey: ['live', 'pending'],
    queryFn: async () => (await api.get<Match[]>('/live/pending')).data,
  });
}

export function useStartMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/start`)).data,
    onSuccess: (data) => patchMatch(qc, data),
  });
}

export function useHalftimeMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/halftime`)).data,
    onSuccess: (data) => patchMatch(qc, data),
  });
}

export function useResumeMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/resume`)).data,
    onSuccess: (data) => patchMatch(qc, data),
  });
}

export function useSetStoppage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      half,
      minutes,
    }: {
      matchId: string;
      half: 1 | 2 | 3 | 4;
      minutes: number;
    }) => (await api.post<Match>(`/live/matches/${matchId}/stoppage`, { half, minutes })).data,
    onSuccess: (data) => patchMatch(qc, data),
  });
}

export function useSetLiveStream() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, url }: { matchId: string; url: string | null }) =>
      (await api.patch<Match>(`/live/matches/${matchId}/stream`, { url })).data,
    onSuccess: (data) => patchMatch(qc, data),
  });
}

export function useEndMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/end`)).data,
    onSuccess: (data) => {
      patchMatch(qc, data);
      void qc.invalidateQueries({ queryKey: ['live', 'pending'] });
    },
  });
}

function usePhaseMutation(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) => (await api.post<Match>(`/live/matches/${matchId}/${path}`)).data,
    onSuccess: (data) => patchMatch(qc, data),
  });
}

export const useFinishRegularTime = () => usePhaseMutation('regular-time/end');
export const useStartExtraTime = () => usePhaseMutation('extra-time/start');
export const useExtraTimeHalftime = () => usePhaseMutation('extra-time/halftime');
export const useResumeExtraSecond = () => usePhaseMutation('extra-time/resume');
export const useFinishExtraTime = () => usePhaseMutation('extra-time/end');
export const useStartPenalties = () => usePhaseMutation('penalties/start');
export const useEndAfterPenalties = () => usePhaseMutation('penalties/end');

export function useApproveMatchReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (matchId: string) =>
      (await api.post<Match>(`/live/matches/${matchId}/approve`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['matches'] });
      void qc.invalidateQueries({ queryKey: ['live', 'pending'] });
    },
  });
}

export function useAddMatchEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      matchId: string;
      type: string;
      minute?: number;
      teamSide?: 'home' | 'away';
      playerId?: string;
      relatedPlayerId?: string;
      description?: string;
    }) => {
      const { matchId, ...payload } = body;
      return (await api.post<MatchEvent>(`/live/matches/${matchId}/events`, payload)).data;
    },
    onSuccess: (_, vars) => void qc.invalidateQueries({ queryKey: ['matches', vars.matchId] }),
  });
}

export function useAddMatchComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { matchId: string; message: string; minute?: number }) => {
      const { matchId, ...payload } = body;
      return (await api.post<LiveComment>(`/live/matches/${matchId}/comments`, payload)).data;
    },
    onSuccess: (_, vars) => void qc.invalidateQueries({ queryKey: ['matches', vars.matchId] }),
  });
}
