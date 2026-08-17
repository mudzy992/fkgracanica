import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaymentProviderId } from '../types/payment-provider';

export function useOnlineTicketCheckout() {
  return useMutation({
    mutationFn: async (payload: { orderId: string; provider: PaymentProviderId }) => {
      const origin = window.location.origin;
      const res = await api.post<{ url: string }>('/payments/checkout/tickets', {
        orderId: payload.orderId,
        provider: payload.provider,
        successUrl: `${origin}/ulaznice?paid=1&provider=${payload.provider}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/ulaznice?cancelled=1`,
      });
      return res.data;
    },
  });
}

export function useOnlineMembershipCheckout() {
  return useMutation({
    mutationFn: async (payload: {
      membershipId: string;
      amount: number;
      provider: PaymentProviderId;
    }) => {
      const origin = window.location.origin;
      const res = await api.post<{ url: string }>('/payments/checkout/membership', {
        membershipId: payload.membershipId,
        amount: payload.amount,
        provider: payload.provider,
        successUrl: `${origin}/clanstvo?paid=1&provider=${payload.provider}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/clanstvo?cancelled=1`,
      });
      return res.data;
    },
  });
}

export function useOnlineSeasonPassCheckout() {
  return useMutation({
    mutationFn: async (payload: { passId: string; provider: PaymentProviderId }) => {
      const origin = window.location.origin;
      const res = await api.post<{ url: string }>('/payments/checkout/season-pass', {
        passId: payload.passId,
        provider: payload.provider,
        successUrl: `${origin}/ulaznice?kind=season&paid=1&provider=${payload.provider}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/ulaznice?kind=season&cancelled=1`,
      });
      return res.data;
    },
  });
}
