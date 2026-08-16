import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PlatformStatusPayload } from '../pages/admin/platform-status/types';

export function usePlatformStatus(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'platform-status'],
    queryFn: async () => (await api.get<PlatformStatusPayload>('/platform-status')).data,
    enabled,
  });
}
