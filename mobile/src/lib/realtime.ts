import { io, type Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

function resolveRealtimeUrl(): string {
  if (process.env.EXPO_PUBLIC_REALTIME_URL) return process.env.EXPO_PUBLIC_REALTIME_URL;
  if (API_ORIGIN.endsWith('/backend')) {
    return `${API_ORIGIN.replace(/\/backend\/?$/, '')}/realtime`;
  }
  return `${API_ORIGIN}/realtime`;
}

function resolveSocketPath(): string {
  if (process.env.EXPO_PUBLIC_SOCKET_IO_PATH) {
    return process.env.EXPO_PUBLIC_SOCKET_IO_PATH;
  }
  return API_ORIGIN.endsWith('/backend') ? '/backend/socket.io' : '/socket.io';
}

let socket: Socket | null = null;

/** Public live connections — no JWT required (see RealtimeGateway). */
export function getRealtimeSocket(): Socket {
  if (!socket) {
    socket = io(resolveRealtimeUrl(), {
      path: resolveSocketPath(),
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectRealtimeSocket() {
  socket?.disconnect();
  socket = null;
}
