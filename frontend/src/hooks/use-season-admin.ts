import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCreateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name: string;
      yearStart: number;
      yearEnd: number;
      isActive?: boolean;
    }) => (await api.post('/seasons', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useUpdateSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      (await api.patch(`/seasons/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useDeleteSeason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/seasons/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useAddSeasonCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      seasonId,
      ...body
    }: {
      seasonId: string;
      competitionId?: string;
      name?: string;
      isLeague?: boolean;
      clubIds?: string[];
    }) => (await api.post(`/seasons/${seasonId}/competitions`, body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['seasons'] });
      void qc.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}

export function useUpdateSeasonCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      seasonId,
      editionId,
      clubIds,
    }: {
      seasonId: string;
      editionId: string;
      clubIds?: string[];
    }) => (await api.patch(`/seasons/${seasonId}/competitions/${editionId}`, { clubIds })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}

export function useDeleteSeasonCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ seasonId, editionId }: { seasonId: string; editionId: string }) =>
      (await api.delete(`/seasons/${seasonId}/competitions/${editionId}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['seasons'] }),
  });
}
