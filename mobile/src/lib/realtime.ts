import { io, type Socket } from 'socket.io-client';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://api.fkgracanica.ba101.top/api/v1';

const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

function resolveRealtimeUrl(): string {
  return (
    process.env.EXPO_PUBLIC_REALTIME_URL ??
    `${API_ORIGIN}/realtime`
  );
}

function resolveSocketPath(): string {
  return (
    process.env.EXPO_PUBLIC_SOCKET_IO_PATH ??
    '/socket.io'
  );
}

let socket: Socket | null = null;

/** Public live connections — no JWT required (see RealtimeGateway). */
export function getRealtimeSocket(): Socket {
  if (!socket) {
    socket = io(resolveRealtimeUrl(), {
      path: resolveSocketPath(),
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
  }

  return socket;
}

export function disconnectRealtimeSocket() {
  socket?.disconnect();
  socket = null;
}

let authSocket: Socket | null = null;
let authToken: string | null = null;

const reconnectOpts = {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
} as const;

/** Authenticated socket for user:{id} rooms (notifications). */
export function getAuthRealtimeSocket(token: string): Socket {
  if (authSocket && authToken === token) {
    return authSocket;
  }

  disconnectAuthRealtimeSocket();

  authToken = token;

  authSocket = io(resolveRealtimeUrl(), {
    path: resolveSocketPath(),
    transports: ['websocket', 'polling'],
    auth: { token },
    ...reconnectOpts,
  });

  return authSocket;
}

export function disconnectAuthRealtimeSocket() {
  authSocket?.disconnect();
  authSocket = null;
  authToken = null;
}