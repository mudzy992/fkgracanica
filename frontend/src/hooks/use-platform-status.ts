import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PlatformStatusPayload } from '../pages/admin/platform-status/types';

type PlatformStatusOptions = Omit<
  UseQueryOptions<PlatformStatusPayload>,
  'queryKey' | 'queryFn'
>;

export function usePlatformStatus(options?: PlatformStatusOptions | boolean) {
  const opts: PlatformStatusOptions | undefined =
    typeof options === 'boolean' ? { enabled: options } : options;
  return useQuery<PlatformStatusPayload>({
    queryKey: ['admin', 'platform-status'],
    queryFn: async () => (await api.get<PlatformStatusPayload>('/platform-status')).data,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...opts,
  });
}
