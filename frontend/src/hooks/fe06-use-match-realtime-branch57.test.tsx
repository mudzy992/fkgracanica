import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const socketState = vi.hoisted(() => ({
  handlers: new Map<string, Function>(),
  on: vi.fn((ev: string, fn: Function) => { socketState.handlers.set(ev, fn); }),
  off: vi.fn(),
  emit: vi.fn(),
  connected: true,
}));

vi.mock('../lib/realtime', () => ({
  getRealtimeSocket: () => socketState as any,
}));

import { useMatchRealtime } from './use-match-realtime';

function Harness({ matchId }: { matchId?: string }) {
  useMatchRealtime(matchId);
  return null;
}

function wrapper(qc: QueryClient, ui: React.ReactNode) {
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('fe06 use-match-realtime branch57 ?? fallback', () => {
  let qc: QueryClient;
  beforeEach(() => {
    qc = new QueryClient();
    socketState.handlers.clear();
    vi.clearAllMocks();
    socketState.connected = true;
  });

  it('old.events ?? [] fallback kada old nema events', () => {
    qc.setQueryData(['matches', 'm1'], { id: 'm1' } as any);
    render(wrapper(qc, <Harness matchId="m1" />));
    const onEvent = socketState.handlers.get('match:event') as (e: any) => void;
    expect(onEvent).toBeDefined();
    onEvent({ id: 'e1', type: 'GOAL' } as any);
    const data = qc.getQueryData(['matches', 'm1']) as any;
    expect(data.events).toEqual([{ id: 'e1', type: 'GOAL' }]);
  });

  it('old.liveComments ?? [] fallback kada old nema liveComments', () => {
    qc.setQueryData(['matches', 'm1'], { id: 'm1' } as any);
    render(wrapper(qc, <Harness matchId="m1" />));
    const onComment = socketState.handlers.get('match:comment') as (c: any) => void;
    expect(onComment).toBeDefined();
    onComment({ id: 'c1', text: 'Gol!' } as any);
    const data = qc.getQueryData(['matches', 'm1']) as any;
    expect(data.liveComments).toEqual([{ id: 'c1', text: 'Gol!' }]);
  });
});
