import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ShowcasePayload } from '../pages/showcase/types';

export function useShowcase() {
  return useQuery({
    queryKey: ['public', 'showcase'],
    queryFn: async () => (await api.get<ShowcasePayload>('/public/showcase')).data,
  });
}
