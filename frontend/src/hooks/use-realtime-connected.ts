import { useEffect, useState } from 'react';
import { getRealtimeSocket } from '../lib/realtime';

export function useRealtimeConnected(): boolean {
  const [connected, setConnected] = useState(() => getRealtimeSocket().connected);
  useEffect(() => {
    const socket = getRealtimeSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);
  return connected;
}
