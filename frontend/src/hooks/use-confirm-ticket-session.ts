import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useConfirmTicketSession() {
  return useMutation({
    mutationFn: async (sessionId: string) =>
      (await api.post<{ orderId: string; status: string }>('/payments/tickets/confirm-session', {
        sessionId,
      })).data,
  });
}
