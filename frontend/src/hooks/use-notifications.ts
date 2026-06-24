import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getRealtimeSocket } from '../lib/realtime';
import type { NotificationItem, PaginatedResponse } from '../types/pagination';

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () =>
      (
        await api.get<PaginatedResponse<NotificationItem>>('/notifications', {
          params: unreadOnly ? { unreadOnly: 'true' } : undefined,
        })
      ).data,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.patch(`/notifications/${id}/read`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.patch('/notifications/read-all')).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useNotificationRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = getRealtimeSocket();
    const handler = () => void qc.invalidateQueries({ queryKey: ['notifications'] });
    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [qc]);
}

export function useSettingsRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = getRealtimeSocket();
    const handler = () => {
      void qc.invalidateQueries({ queryKey: ['settings'] });
    };
    socket.on('settings:changed', handler);
    return () => {
      socket.off('settings:changed', handler);
    };
  }, [qc]);
}
