import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { MatchAvailability, TicketOrderRow, TicketPaymentIntent } from '../types/ticketing';

export function useMyTicketOrders() {
  return useQuery({
    queryKey: ['ticketing', 'orders'],
    queryFn: async () => asArray<TicketOrderRow>((await api.get('/ticketing/orders')).data),
  });
}

export function useMatchAvailability(matchId?: string) {
  return useQuery({
    queryKey: ['ticketing', 'availability', matchId],
    queryFn: async () =>
      (await api.get<MatchAvailability>(`/ticketing/matches/${matchId}/availability`)).data,
    enabled: !!matchId,
  });
}

export function useTicketingPublicConfig() {
  return useQuery({
    queryKey: ['ticketing', 'config'],
    queryFn: async () =>
      (await api.get<import('../types/ticketing-config').TicketingPublicConfig>('/ticketing/config')).data,
  });
}

export function useTicketableMatches() {
  return useQuery({
    queryKey: ['ticketing', 'ticketable'],
    queryFn: async () => asArray<import('../types').Match>((await api.get('/ticketing/matches/ticketable')).data),
  });
}

export function useNextHomeMatch() {
  return useQuery({
    queryKey: ['public', 'next-home-match'],
    queryFn: async () =>
      (await api.get<import('../types').Match | null>('/public/next-home-match')).data,
  });
}

export function useReserveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      matchId?: string;
      category: string;
      price: number;
      quantity?: number;
      categoryId?: string;
      paymentIntent?: TicketPaymentIntent;
    }) =>
      (await api.post('/ticketing/reserve', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ticketing', 'orders'] }),
  });
}

export function useRequestTicketRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) =>
      (await api.post(`/ticketing/orders/${orderId}/refund`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ticketing', 'orders'] }),
  });
}

export function useCancelMyTicketOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) =>
      (await api.post(`/ticketing/orders/${orderId}/cancel`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ticketing', 'orders'] }),
  });
}

export function useMySeasonPass() {
  return useQuery({
    queryKey: ['ticketing', 'season-pass', 'me'],
    queryFn: async () =>
      (await api.get<{
        offer: {
          season: { id: string; name: string } | null;
          price: number;
          label: string;
          available: boolean;
          salesModes: { boxOffice: boolean; online: boolean };
        };
        pass: {
          id: string;
          status: string;
          label: string;
          price: string;
          qrCode: string;
          season?: { name: string };
        } | null;
      }>('/ticketing/season-pass/me')).data,
  });
}

export function useOpenSeasonPass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await api.post<{ id: string; status: string }>('/ticketing/season-pass/open')).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ticketing', 'season-pass'] }),
  });
}
