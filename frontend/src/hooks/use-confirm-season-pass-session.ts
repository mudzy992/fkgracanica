import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaymentProviderId } from '../types/payment-provider';

export function useConfirmSeasonPassSession() {
  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      provider?: PaymentProviderId;
      returnUrl?: string;
    }) =>
      (
        await api.post<{ passId: string; status: string }>(
          '/payments/season-pass/confirm-session',
          payload,
        )
      ).data,
  });
}
