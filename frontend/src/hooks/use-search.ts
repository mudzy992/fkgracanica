import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { SearchFacet, SearchResponse } from '../types/search';

export function useSearch(params: { q: string; type?: SearchFacet; page?: number }) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () =>
      (
        await api.get<SearchResponse>('/search', {
          params: {
            q: params.q,
            type: params.type,
            page: params.page,
          },
        })
      ).data,
    enabled: params.q.trim().length >= 2,
  });
}
