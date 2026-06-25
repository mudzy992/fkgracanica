import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePaginatedQuery } from './use-paginated-query';
import { api } from '../lib/api';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export function useNewsletterSubscribers(params: { page?: number; search?: string } = {}) {
  return usePaginatedQuery<Subscriber>(['newsletter'], '/newsletter', {
    page: params.page,
    search: params.search,
  });
}

export function useUnsubscribeNewsletter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => (await api.post('/newsletter/unsubscribe', { email })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['newsletter'] }),
  });
}
