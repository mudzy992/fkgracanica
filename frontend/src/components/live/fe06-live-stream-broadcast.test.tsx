import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LiveStreamBroadcast } from './LiveStreamBroadcast';

vi.mock('../../hooks/use-live-clock', () => ({ useLiveClock: () => ({ periodLabel: 'Prvo poluvrijeme', displayMinute: 10, displaySecond: 0, showStoppage: false, stoppage: 0, needsStoppageInput: false }) }));
vi.mock('./use-live-event-toasts', () => ({
  useLiveEventToasts: () => ({ id: 'e1', minute: 42, type: 'GOAL' }),
  LiveEventToast: ({ event }: { event: { minute: number } }) => <div data-testid="toast">{event.minute}</div>,
}));
vi.mock('./LiveYouTubePlayer', () => ({
  LiveYouTubePlayer: ({ url, active, hidden }: { url: string; active: boolean; hidden: boolean }) => (
    <div data-testid="player">{url}|{String(active)}|{String(hidden)}</div>
  ),
}));
vi.mock('./LiveScoreboardOverlay', () => ({
  LiveScoreboardOverlay: ({ match }: { match: { id: string } }) => <div data-testid="overlay">{match.id}</div>,
}));
vi.mock('./LiveStatsCorner', () => ({ LiveStatsCorner: () => <div data-testid="stats" /> }));
vi.mock('./LiveHalftimePanel', () => ({ LiveHalftimePanel: () => <div data-testid="halftime" /> }));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'LIVE',
  liveStreamUrl: 'https://www.youtube.com/embed/abcdefghijk',
  youtubeUrl: 'https://youtu.be/zzzzzzzzzzz',
  homeScore: 0,
  awayScore: 0,
  minute: 10,
  seasonId: 's1',
  homeClubId: 'k1',
  awayClubId: 'k2',
  scheduledAt: '2026-05-01T17:00:00.000Z',
  ...over,
});

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('LiveStreamBroadcast', () => {
  it('prikazuje player, overlay, statistiku, toast i link', () => {
    wrap(<LiveStreamBroadcast match={match() as never} />);
    expect(screen.getByTestId('player').textContent).toBe(
      'https://www.youtube.com/embed/abcdefghijk|true|false',
    );
    expect(screen.getByTestId('overlay')).toHaveTextContent('m1');
    expect(screen.getByTestId('stats')).toBeInTheDocument();
    expect(screen.getByTestId('toast')).toHaveTextContent('42');
    expect(screen.getByRole('link', { name: 'Utakmica' }).getAttribute('href')).toBe('/utakmice/m1');
    expect(screen.queryByTestId('halftime')).toBeNull();
  });

  it('koristi youtubeUrl kad nema stream URL-a', () => {
    wrap(<LiveStreamBroadcast match={match({ liveStreamUrl: null }) as never} />);
    expect(screen.getByTestId('player').textContent).toContain('https://youtu.be/zzzzzzzzzzz');
  });

  it('bez ijednog URL-a nema playera', () => {
    wrap(<LiveStreamBroadcast match={match({ liveStreamUrl: null, youtubeUrl: null }) as never} />);
    expect(screen.queryByTestId('player')).toBeNull();
  });

  it('poluvrijeme skriva overlay/statistiku i prikazuje panel', () => {
    wrap(<LiveStreamBroadcast match={match({ status: 'HALFTIME' }) as never} />);
    expect(screen.getByTestId('halftime')).toBeInTheDocument();
    expect(screen.getByTestId('player').textContent).toBe(
      'https://www.youtube.com/embed/abcdefghijk|false|true',
    );
    expect(screen.queryByTestId('overlay')).toBeNull();
    expect(screen.queryByTestId('toast')).toBeNull();
  });
});
