import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { PaginatedResponse, Notification } from '../types/api';

export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await api.get<PaginatedResponse<Notification>>('/notifications', {
          params: { unreadOnly: 'true', limit: 1 },
        });
        if (active) setCount(data.meta.total);
      } catch {
        if (active) setCount(0);
      }
    };
    void load();
    const id = setInterval(() => void load(), 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return count;
}
