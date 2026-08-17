import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaymentProviderId } from '../types/payment-provider';

export function useConfirmTicketSession() {
  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      provider?: PaymentProviderId;
      returnUrl?: string;
    }) =>
      (
        await api.post<{ orderId: string; status: string }>('/payments/tickets/confirm-session', payload)
      ).data,
  });
}
