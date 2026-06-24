import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
export const REALTIME_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

export const SOCKET_IO_PATH =
  import.meta.env.VITE_SOCKET_IO_PATH ??
  (REALTIME_BASE.includes('/backend') ? '/backend/socket.io' : '/socket.io');

let socket: Socket | null = null;

export function getRealtimeSocket(): Socket {
  if (!socket) {
    const token = getAccessToken();
    socket = io(`${REALTIME_BASE}/realtime`, {
      path: SOCKET_IO_PATH,
      auth: token ? { token } : {},
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectRealtimeSocket() {
  socket?.disconnect();
  socket = null;
}
