import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';
import type { TicketOrderRow } from '../types/ticketing';

import type { TicketingAdminConfig } from '../types/ticketing-config';

export function useTicketingAdminConfig() {
  return useQuery({
    queryKey: ['ticketing', 'admin', 'config'],
    queryFn: async () =>
      (await api.get<TicketingAdminConfig>('/ticketing/admin/config')).data,
  });
}

export function useUpdateTicketingAdminConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, string>) =>
      (await api.patch<TicketingAdminConfig>('/ticketing/admin/config', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['ticketing', 'admin', 'config'] });
      void qc.invalidateQueries({ queryKey: ['ticketing', 'config'] });
    },
  });
}

export type TicketingAdminOrder = TicketOrderRow;

export function useTicketingAdminOrders() {
  return useQuery({
    queryKey: ['ticketing', 'admin', 'orders'],
    queryFn: async () =>
      asArray<TicketingAdminOrder>((await api.get('/ticketing/admin/orders')).data),
  });
}

export function useTicketingOrderDetail(orderId?: string) {
  return useQuery({
    queryKey: ['ticketing', 'orders', orderId],
    queryFn: async () => (await api.get<TicketingAdminOrder>(`/ticketing/orders/${orderId}`)).data,
    enabled: !!orderId,
  });
}

export function useConfirmTicketingPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) =>
      (await api.post(`/ticketing/orders/${orderId}/confirm-payment`)).data,
    onSuccess: (_d, orderId) => {
      void qc.invalidateQueries({ queryKey: ['ticketing', 'admin', 'orders'] });
      void qc.invalidateQueries({ queryKey: ['ticketing', 'orders', orderId] });
    },
  });
}

export function useConfirmTicketingRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) =>
      (await api.post(`/ticketing/orders/${orderId}/confirm-refund`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ticketing', 'admin', 'orders'] }),
  });
}

export function useAdminCancelTicketingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) =>
      (await api.post(`/ticketing/admin/orders/${orderId}/cancel`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['ticketing', 'admin', 'orders'] });
      void qc.invalidateQueries({ queryKey: ['ticketing', 'orders'] });
    },
  });
}

export function useValidateTicket() {
  return useMutation({
    mutationFn: async (qrCode: string) =>
      (await api.post('/ticketing/validate', { qrCode })).data as {
        id: string;
        status: string;
        category: string;
        match?: { homeClub?: { name: string }; awayClub?: { name: string } };
      },
  });
}
