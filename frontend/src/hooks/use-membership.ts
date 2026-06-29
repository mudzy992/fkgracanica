import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { MembershipRow, MembershipStatus } from '../types/membership';

export function useMyMembership() {
  return useQuery({
    queryKey: ['membership', 'me'],
    queryFn: async () => asArray<MembershipRow>((await api.get('/membership/me')).data),
  });
}

export function useMemberships(status?: MembershipStatus) {
  return useQuery({
    queryKey: ['membership', status],
    queryFn: async () =>
      asArray<MembershipRow>(
        (await api.get('/membership', { params: status ? { status } : undefined })).data,
      ),
  });
}

export function useMembershipDetail(id?: string) {
  return useQuery({
    queryKey: ['membership', id],
    queryFn: async () => (await api.get<MembershipRow>(`/membership/${id}`)).data,
    enabled: !!id,
  });
}

export function useRegisterMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post('/membership/register')).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['membership', 'me'] }),
  });
}

function useMembershipMutation(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch(`/membership/${id}/${path}`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['membership'] });
      void qc.invalidateQueries({ queryKey: ['membership', 'me'] });
    },
  });
}

export const useActivateMembership = () => useMembershipMutation('activate');
export const useRenewMembership = () => useMembershipMutation('renew');
export const useSuspendMembership = () => useMembershipMutation('suspend');
export const useCancelMembership = () => useMembershipMutation('cancel');

export function useCreateMembershipAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; activate?: boolean }) =>
      (await api.post('/membership/admin', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['membership'] }),
  });
}
