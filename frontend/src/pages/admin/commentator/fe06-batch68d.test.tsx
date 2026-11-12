import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-match-live-stream', () => ({
  useUpdateMatchLiveStream: () => ({ mutateAsync: vi.fn(async () => {}) }),
}));
vi.mock('../../../lib/match-event-labels', () => ({ matchEventLabel: () => 'Gol' }));
vi.mock('../../../lib/live-event-text', () => ({ formatEventPlayers: () => '' }));

import { CommentatorEventLog } from './CommentatorEventLog';
import { CommentatorStreamDialog } from './CommentatorStreamDialog';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{c}</MemoryRouter></QueryClientProvider>;
}

describe('fe06-batch68d commentator', () => {
  it('CommentatorEventLog pokriva events ?? [] oba', () => {
    const match1 = { id: 'm1', events: undefined } as unknown as never;
    const { container: c1 } = render(wrap(<CommentatorEventLog match={match1} />));
    expect(c1.textContent).toContain('admin.eventLog.empty');
    const match2 = { id: 'm1', events: [{ id: 'e1', type: 'GOAL', minute: 10 }] } as unknown as never;
    const { container: c2 } = render(wrap(<CommentatorEventLog match={match2} />));
    expect(c2.textContent).toContain('10');
  });

  it('CommentatorStreamDialog pokriva url.trim() || null', async () => {
    const match = { id: 'm1', liveStreamUrl: 'https://youtube.com/watch?v=abc' } as unknown as never;
    const { container } = render(wrap(<CommentatorStreamDialog match={match} />));
    expect(container.textContent).toContain('Stream');
    const match2 = { id: 'm1', liveStreamUrl: null } as unknown as never;
    const { container: c2 } = render(wrap(<CommentatorStreamDialog match={match2} />));
    expect(c2.textContent).toContain('Stream');
  });
});
