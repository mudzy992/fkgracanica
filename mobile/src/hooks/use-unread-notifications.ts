import { useCallback, useEffect, useState } from 'react';
import { api, getAccessToken } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  disconnectAuthRealtimeSocket,
  getAuthRealtimeSocket,
} from '../lib/realtime';
import type { Notification, PaginatedResponse } from '../types/api';

type Listener = (count: number) => void;

let sharedCount = 0;
const listeners = new Set<Listener>();
let started = false;
let pollId: ReturnType<typeof setInterval> | null = null;
let socketOff: (() => void) | null = null;

function emit(count: number) {
  sharedCount = count;
  listeners.forEach((l) => l(count));
}

async function fetchUnread(): Promise<void> {
  try {
    const { data } = await api.get<PaginatedResponse<Notification>>('/notifications', {
      params: { unreadOnly: 'true', limit: 1 },
    });
    emit(data.meta.total);
  } catch {
    emit(0);
  }
}

async function startAuthRealtime() {
  const token = await getAccessToken();
  if (!token) return;
  const socket = getAuthRealtimeSocket(token);
  const onNew = () => emit(sharedCount + 1);
  socket.on('notification:new', onNew);
  socketOff = () => {
    socket.off('notification:new', onNew);
  };
}

function ensureStarted() {
  if (started) return;
  started = true;
  void fetchUnread();
  void startAuthRealtime();
  pollId = setInterval(() => void fetchUnread(), 60_000);
}

function stopAll() {
  if (pollId) clearInterval(pollId);
  pollId = null;
  socketOff?.();
  socketOff = null;
  disconnectAuthRealtimeSocket();
  started = false;
  emit(0);
}

export function useUnreadNotifications() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(sharedCount);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      emit(0);
      return;
    }
    await fetchUnread();
  }, [isAuthenticated]);

  useEffect(() => {
    const listener: Listener = (c) => setCount(c);
    listeners.add(listener);
    setCount(sharedCount);

    if (isAuthenticated) {
      ensureStarted();
    } else {
      stopAll();
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) stopAll();
    };
  }, [isAuthenticated]);

  return { count, refresh };
}
