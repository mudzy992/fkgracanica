import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePaginatedQuery } from './use-paginated-query';
import { api } from '../lib/api';
import type { ContactMessage } from '../types';

export function useContactMessages(params: {
  page?: number;
  search?: string;
  unreadOnly?: boolean;
} = {}) {
  return usePaginatedQuery<ContactMessage>(['contact'], '/contact', {
    page: params.page,
    search: params.search,
    unreadOnly: params.unreadOnly ? 'true' : undefined,
  });
}

export function useMarkContactRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch(`/contact/${id}/read`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['contact'] }),
  });
}

export function useMarkAllContactRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.patch('/contact/read-all')).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['contact'] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/contact/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['contact'] }),
  });
}
