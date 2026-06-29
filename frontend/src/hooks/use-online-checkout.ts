import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useOnlineTicketCheckout() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const origin = window.location.origin;
      const res = await api.post<{ url: string }>('/payments/checkout/tickets', {
        orderId,
        successUrl: `${origin}/ulaznice?paid=1&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/ulaznice`,
      });
      return res.data;
    },
  });
}

export function useOnlineMembershipCheckout() {
  return useMutation({
    mutationFn: async (payload: { membershipId: string; amount: number }) => {
      const origin = window.location.origin;
      const res = await api.post<{ url: string }>('/payments/checkout/membership', {
        ...payload,
        successUrl: `${origin}/clanstvo?paid=1&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/clanstvo?cancelled=1`,
      });
      return res.data;
    },
  });
}
