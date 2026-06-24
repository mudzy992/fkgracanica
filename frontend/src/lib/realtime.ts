import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

/** Traefik: engine na /backend/socket.io, namespace /realtime na host rootu. */
function resolveRealtimeUrl(): string {
  if (import.meta.env.VITE_REALTIME_URL) return import.meta.env.VITE_REALTIME_URL;
  if (API_ORIGIN.endsWith('/backend')) {
    return `${API_ORIGIN.replace(/\/backend\/?$/, '')}/realtime`;
  }
  return `${API_ORIGIN}/realtime`;
}

function resolveSocketPath(): string {
  if (import.meta.env.VITE_SOCKET_IO_PATH) return import.meta.env.VITE_SOCKET_IO_PATH;
  return API_ORIGIN.endsWith('/backend') ? '/backend/socket.io' : '/socket.io';
}

let socket: Socket | null = null;

export function getRealtimeSocket(): Socket {
  if (!socket) {
    const token = getAccessToken();
    socket = io(resolveRealtimeUrl(), {
      path: resolveSocketPath(),
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

// re-export for tests
export { resolveRealtimeUrl, resolveSocketPath };
