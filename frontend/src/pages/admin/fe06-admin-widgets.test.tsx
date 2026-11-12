import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorLiveHero } from './homes/CommentatorLiveHero';
import { CommentatorDeskHeader } from './commentator/CommentatorDeskHeader';
import { MatchScoreInputs } from './competition-hub/MatchScoreInputs';
import { MatchLiveLockedNote } from './competition-hub/MatchLiveLockedNote';

const state = vi.hoisted(() => ({
  connected: true,
  permissions: [] as string[] | undefined,
  status: null as unknown,
  values: { home: 0, away: 0 },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../hooks/use-realtime-connected', () => ({
  useRealtimeConnected: () => state.connected,
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../hooks/use-platform-status', () => ({
  usePlatformStatus: () => ({ data: state.status }),
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'LIVE',
  homeScore: 2,
  awayScore: 1,
  homeClubId: 'k1',
  awayClubId: 'k2',
  scheduledAt: '2026-05-01T17:00:00.000Z',
  minute: 30,
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  season: { competition: { name: 'Premijer liga' } },
  roundRel: { name: '5. kolo' },
  venue: 'Gradski stadion',
  ...over,
});

beforeEach(() => {
  state.connected = true;
  state.permissions = [];
  state.status = null;
});

describe('CommentatorLiveHero', () => {
  it('prikazuje rezultat, ekipe i dvije akcije', () => {
    wrap(<CommentatorLiveHero match={match() as never} />);
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('t:admin.commentator.liveOnDesk')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('koristi rezervne nazive bez klubova', () => {
    wrap(<CommentatorLiveHero match={match({ homeClub: null, awayClub: null }) as never} />);
    expect(screen.getByText('t:admin.match.homeTeam')).toBeInTheDocument();
    expect(screen.getByText('t:admin.match.awayTeam')).toBeInTheDocument();
  });
});

describe('CommentatorDeskHeader', () => {
  it('socket online i meta podaci', () => {
    wrap(
      <CommentatorDeskHeader
        match={match() as never}
        title="Desk"
        publicHref="/live/m1"
        publicLabel="Javni prikaz"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Desk' })).toBeInTheDocument();
    expect(screen.getByText('Prepijer liga · 5. kolo · Gradski stadion'.replace('Prepijer', 'Premijer'))).toBeInTheDocument();
    expect(screen.getByText('Socket online')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/live/m1');
  });

  it('socket offline i rezervni nazivi', () => {
    state.connected = false;
    wrap(
      <CommentatorDeskHeader
        match={match({ homeClub: null, awayClub: null, season: null, roundRel: null, venue: null }) as never}
        title="Desk"
        publicHref="/live/m1"
        publicLabel="Prikaz"
      />,
    );
    expect(screen.getByText('Socket offline')).toBeInTheDocument();
    expect(screen.getByText('Domaćin')).toBeInTheDocument();
    expect(screen.getByText('Gost')).toBeInTheDocument();
  });
});

function ScoreHarness() {
  const [home, setHome] = useState(1);
  const [away, setAway] = useState(2);
  state.values = { home, away };
  return <MatchScoreInputs homeScore={home} awayScore={away} onHome={setHome} onAway={setAway} />;
}

describe('MatchScoreInputs', () => {
  it('mijenja domaći i gostujući rezultat', async () => {
    render(<ScoreHarness />);
    const [home, away] = screen.getAllByRole('spinbutton');
    expect(home).toHaveValue(1);
    await userEvent.clear(away);
    await userEvent.type(away, '3');
    expect(away).toHaveValue(3);
    await userEvent.clear(home);
    await userEvent.type(home, '0');
    expect(home).toHaveValue(0);
  });

  it('labeled prikazuje labele', () => {
    render(
      <MatchScoreInputs homeScore={0} awayScore={0} onHome={vi.fn()} onAway={vi.fn()} labeled />,
    );
    expect(screen.getByText('t:admin.scoreInputs.home')).toBeInTheDocument();
    expect(screen.getByText('t:admin.scoreInputs.away')).toBeInTheDocument();
  });
});

describe('MatchLiveLockedNote', () => {
  it('prikazuje status i poruku', () => {
    render(<MatchLiveLockedNote status="LIVE" />);
    expect(screen.getByText('t:admin.matchForm.liveLocked')).toBeInTheDocument();
    expect(document.body.textContent?.length).toBeGreaterThan(0);
  });

  it('bez statusa prikazuje samo poruku', () => {
    render(<MatchLiveLockedNote />);
    expect(screen.getByText('t:admin.matchForm.liveLocked')).toBeInTheDocument();
  });
});
