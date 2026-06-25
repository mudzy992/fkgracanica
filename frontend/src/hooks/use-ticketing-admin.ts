import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { asArray } from '../lib/as-array';

export interface TicketingAdminOrder {
  id: string;
  status: string;
  total: string | number;
  createdAt?: string;
  user?: { email: string };
  payment?: { status: string; method?: string };
  tickets?: { id: string; category?: string; price?: number; status?: string }[];
}

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
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['ticketing', 'admin', 'orders'] }),
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

export function useCancelTicketingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) =>
      (await api.post(`/ticketing/orders/${orderId}/cancel`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['ticketing', 'admin', 'orders'] });
      void qc.invalidateQueries({ queryKey: ['ticketing', 'orders'] });
    },
  });
}
