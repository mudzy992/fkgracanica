import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaymentProviderId } from '../types/payment-provider';

export function useConfirmMembershipSession() {
  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      provider?: PaymentProviderId;
      returnUrl?: string;
    }) =>
      (
        await api.post<{ membershipId: string; status: string }>(
          '/payments/membership/confirm-session',
          payload,
        )
      ).data,
  });
}
