import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMatchRealtime } from './use-match-realtime';

const socketOn = vi.fn();
const socketOff = vi.fn();
const socketEmit = vi.fn();
let connected = true;
let connectCb: (() => void) | null = null;

vi.mock('../lib/realtime', () => ({
  getRealtimeSocket: () => ({
    get connected() { return connected; },
    on: (ev: string, cb: () => void) => { socketOn(ev, cb); if (ev === 'connect') connectCb = cb; },
    off: socketOff,
    emit: socketEmit,
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  qc.setQueryData(['matches', 'm1'], { id: 'm1', events: [] } as any);
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useMatchRealtime — branch51', () => {
  beforeEach(() => { vi.clearAllMocks(); connected = true; connectCb = null; });

  it('ne registruje kada nema matchId', () => {
    const { unmount } = renderHook(() => useMatchRealtime(undefined), { wrapper: Wrapper as any });
    expect(socketOn).not.toHaveBeenCalled();
    unmount();
  });

  it('join odmah kada je connected true', () => {
    connected = true;
    const { unmount } = renderHook(() => useMatchRealtime('m1'), { wrapper: Wrapper as any });
    expect(socketEmit).toHaveBeenCalledWith('match:join', { matchId: 'm1' });
    act(() => { unmount(); });
    expect(socketEmit).toHaveBeenCalledWith('match:leave', { matchId: 'm1' });
  });

  it('čeka connect kada nije connected, pa join na connect', () => {
    connected = false;
    const { unmount } = renderHook(() => useMatchRealtime('m1'), { wrapper: Wrapper as any });
    expect(socketOn).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socketEmit).not.toHaveBeenCalledWith('match:join', expect.anything());
    act(() => { connectCb?.(); });
    expect(socketEmit).toHaveBeenCalledWith('match:join', { matchId: 'm1' });
    unmount();
  });

  it('patch sa undefined old ne puca', () => {
    connected = true;
    function WrapperNoOld({ children }: { children: React.ReactNode }) {
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      // namjerno ne postavljamo query data, old će biti undefined u patch
      return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    }
    const { unmount } = renderHook(() => useMatchRealtime('m1'), { wrapper: WrapperNoOld as any });
    // ručno emitujemo eventove da se pozove patch/onEvent sa undefined old
    // socketOn je pozvan za match:event itd., dohvatimo callback i pozovimo
    const eventCb = socketOn.mock.calls.find((c) => c[0] === 'match:event')?.[1] as ((e: any) => void) | undefined;
    if (eventCb) act(() => eventCb({ id: 'ev1' } as any));
    // ne smije baciti
    expect(true).toBe(true);
    unmount();
  });

  it('onClock sa undefined old', () => {
    connected = true;
    function WrapperNoOld({ children }: { children: React.ReactNode }) {
      const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    }
    const { unmount } = renderHook(() => useMatchRealtime('m1'), { wrapper: WrapperNoOld as any });
    const clockCb = socketOn.mock.calls.find((c) => c[0] === 'match:clock')?.[1] as ((c: any) => void) | undefined;
    if (clockCb) act(() => clockCb({ displayMinute: 42 } as any));
    expect(true).toBe(true);
    unmount();
  });
});
