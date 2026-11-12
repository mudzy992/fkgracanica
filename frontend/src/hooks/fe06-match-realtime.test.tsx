import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMatchRealtime } from './use-match-realtime';

type Handler = (...args: unknown[]) => void;
const socket = vi.hoisted(() => {
  const handlers = new Map<string, Set<Handler>>();
  return {
    connected: true,
    handlers,
    emit: vi.fn(),
    on: vi.fn((name: string, handler: Handler) => { (handlers.get(name) ?? handlers.set(name, new Set()).get(name)!).add(handler); }),
    off: vi.fn((name: string, handler: Handler) => { handlers.get(name)?.delete(handler); }),
    fire: (name: string, payload: unknown) => handlers.get(name)?.forEach((handler) => handler(payload)),
    reset: () => { handlers.clear(); },
  };
});
vi.mock('../lib/realtime', () => ({ getRealtimeSocket: () => socket }));

function setup(data: unknown) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  qc.setQueryData(['matches', 'm1'], data);
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return { qc, wrapper };
}

beforeEach(() => { socket.reset(); socket.emit.mockClear(); socket.on.mockClear(); socket.off.mockClear(); socket.connected = true; });

describe('useMatchRealtime', () => {
  it('bez matchId ne otvara socket niti registruje listenere', () => {
    const { wrapper } = setup({ id: 'm1' });
    renderHook(() => useMatchRealtime(undefined), { wrapper });
    expect(socket.on).not.toHaveBeenCalled();
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it('prijavljuje se odmah kada je socket povezan i odjavljuje pri unmountu', () => {
    const { wrapper } = setup({ id: 'm1', events: [], liveComments: [] });
    const { unmount } = renderHook(() => useMatchRealtime('m1'), { wrapper });
    expect(socket.emit).toHaveBeenCalledWith('match:join', { matchId: 'm1' });
    expect(socket.on).not.toHaveBeenCalledWith('connect', expect.anything());
    unmount();
    expect(socket.emit).toHaveBeenCalledWith('match:leave', { matchId: 'm1' });
    expect(socket.off).toHaveBeenCalledWith('match:event', expect.any(Function));
  });

  it('kada socket nije povezan, prijava čeka događaj connect', () => {
    socket.connected = false;
    const { wrapper } = setup({ id: 'm1' });
    const { unmount } = renderHook(() => useMatchRealtime('m1'), { wrapper });
    expect(socket.emit).not.toHaveBeenCalledWith('match:join', expect.anything());
    act(() => socket.fire('connect', undefined));
    expect(socket.emit).toHaveBeenCalledWith('match:join', { matchId: 'm1' });
    unmount();
    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('spaja događaje, komentare, sat, rezultat i status u keš utakmice', () => {
    const { qc, wrapper } = setup({ id: 'm1', events: [{ id: 'e1' }], liveComments: [{ id: 'c1' }], minute: 1 });
    renderHook(() => useMatchRealtime('m1'), { wrapper });
    act(() => {
      socket.fire('match:event', { id: 'e2' });
      socket.fire('match:comment', { id: 'c2' });
      socket.fire('match:clock', { displayMinute: 42 });
      socket.fire('match:score', { homeScore: 2, awayScore: 1, minute: 43 });
      socket.fire('match:status', { status: 'HALFTIME' });
    });
    const data = qc.getQueryData<Record<string, unknown>>(['matches', 'm1']);
    expect(data).toMatchObject({
      events: [{ id: 'e1' }, { id: 'e2' }],
      liveComments: [{ id: 'c1' }, { id: 'c2' }],
      minute: 43, homeScore: 2, awayScore: 1, status: 'HALFTIME',
    });
  });

  it('nema podataka u kešu — događaji ne kreiraju novi zapis', () => {
    const { qc, wrapper } = setup(undefined);
    renderHook(() => useMatchRealtime('m1'), { wrapper });
    act(() => {
      socket.fire('match:event', { id: 'e2' });
      socket.fire('match:comment', { id: 'c2' });
      socket.fire('match:clock', { displayMinute: 12 });
      socket.fire('match:score', { minute: 13 });
    });
    expect(qc.getQueryData(['matches', 'm1'])).toBeUndefined();
  });
});
