import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaginatedResponse } from '../types/pagination';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}

export function usePaginatedQuery<T>(
  key: string[],
  path: string,
  params: PaginationParams = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: async () =>
      (await api.get<PaginatedResponse<T>>(path, { params })).data,
    ...options,
  });
}
