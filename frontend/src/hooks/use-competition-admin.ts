import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { StandingRow } from '../types';
import { useQuery } from '@tanstack/react-query';

export function useStandings(seasonId?: string, upToRound?: number | null) {
  return useQuery({
    queryKey: ['standings', seasonId, upToRound ?? 'all'],
    queryFn: async () =>
      (await api.get<StandingRow[]>('/statistics/standings', {
        params: {
          ...(seasonId ? { seasonId } : {}),
          ...(upToRound != null ? { upToRound } : {}),
        },
      })).data,
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

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/players/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/players/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useCreateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/clubs', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clubs'] });
      void qc.invalidateQueries({ queryKey: ['clubs', 'own'] });
    },
  });
}

export function useUpdateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/clubs/${id}`, body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clubs'] });
      void qc.invalidateQueries({ queryKey: ['clubs', 'own'] });
    },
  });
}

export function useDeleteClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/clubs/${id}`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clubs'] });
      void qc.invalidateQueries({ queryKey: ['clubs', 'own'] });
    },
  });
}

export function useCreateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string }) => (await api.post('/competitions', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['competitions'] }),
  });
}

export function useUpdateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string }) =>
      (await api.patch(`/competitions/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['competitions'] }),
  });
}

export function useDeleteCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/competitions/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['competitions'] }),
  });
}

export function useCreateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      yearStart: number;
      yearEnd: number;
      competitionId: string;
      isActive?: boolean;
      clubIds?: string[];
    }) => (await api.post('/competitions/seasons', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useUpdateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/competitions/seasons/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useDeleteSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/competitions/seasons/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await api.post('/matches', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/matches/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useDeleteMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/matches/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useSetMatchLineup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      slots,
    }: {
      matchId: string;
      slots: { playerId: string; clubId: string; positionX: number; positionY: number; isStarter?: boolean }[];
    }) => (await api.put(`/matches/${matchId}/lineup`, { slots })).data,
    onSuccess: (_data, { matchId }) => {
      void qc.invalidateQueries({ queryKey: ['matches'] });
      void qc.invalidateQueries({ queryKey: ['matches', matchId] });
    },
  });
}

export { useApproveMatchReport } from './use-live-admin';
