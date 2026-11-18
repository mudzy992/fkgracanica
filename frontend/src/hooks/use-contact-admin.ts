import { useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { usePaginatedQuery } from './use-paginated-query';
import { api } from '../lib/api';
import type { ContactMessage } from '../types';
import type { PaginatedResponse } from '../types/pagination';

export function useContactMessages(
  params: {
    page?: number;
    search?: string;
    unreadOnly?: boolean;
  } = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<ContactMessage>>, 'queryKey' | 'queryFn'>,
) {
  return usePaginatedQuery<ContactMessage>(
    ['contact'],
    '/contact',
    {
      page: params.page,
      search: params.search,
      unreadOnly: params.unreadOnly ? 'true' : undefined,
    },
    {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
      ...options,
    },
  );
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
