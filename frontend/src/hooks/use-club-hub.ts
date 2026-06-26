import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { Club } from '../types';
import type { ClubSeasonStats, ClubSquadResponse, Stadium } from '../types/club-hub';

export function useClub(id: string) {
  return useQuery({
    queryKey: ['clubs', id],
    queryFn: async () => (await api.get<Club>(`/clubs/${id}`)).data,
    enabled: !!id,
  });
}

export function useClubSquad(clubId: string) {
  return useQuery({
    queryKey: ['clubs', clubId, 'squad'],
    queryFn: async () => (await api.get<ClubSquadResponse>(`/clubs/${clubId}/squad`)).data,
    enabled: !!clubId,
  });
}

export function useClubStadium(clubId: string) {
  return useQuery({
    queryKey: ['clubs', clubId, 'stadium'],
    queryFn: async () => (await api.get<Stadium | null>(`/clubs/${clubId}/stadium`)).data,
    enabled: !!clubId,
  });
}

export function useClubStats(clubId: string, seasonId?: string) {
  return useQuery({
    queryKey: ['clubs', clubId, 'stats', seasonId],
    queryFn: async () =>
      (await api.get<ClubSeasonStats>(`/clubs/${clubId}/stats`, { params: { seasonId } })).data,
    enabled: !!clubId,
  });
}

export function useUpdateClubFormation(clubId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { def: number; mid: number; fwd: number }) =>
      (await api.put(`/clubs/${clubId}/formation`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['clubs', clubId, 'squad'] }),
  });
}

export function useAssignClubSquad(clubId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignments: { slotIndex: number; isBench: boolean; playerId?: string | null }[]) =>
      (await api.put(`/clubs/${clubId}/squad`, { assignments })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['clubs', clubId, 'squad'] }),
  });
}

export function useUpsertClubStadium(clubId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      (await api.put(`/clubs/${clubId}/stadium`, body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clubs', clubId, 'stadium'] });
      void qc.invalidateQueries({ queryKey: ['clubs', clubId] });
    },
  });
}

export function useClubsWithCounts() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () =>
      asArray<Club & { _count?: { players: number } }>((await api.get('/clubs')).data),
  });
}
