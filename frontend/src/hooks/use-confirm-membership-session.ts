import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useConfirmMembershipSession() {
  return useMutation({
    mutationFn: async (sessionId: string) =>
      (await api.post<{ membershipId: string; status: string }>('/payments/membership/confirm-session', {
        sessionId,
      })).data,
  });
}
