import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsTeamPanel } from './analytics/AnalyticsTeamPanel';
import { ClubStatsTab } from './club-hub/tabs/ClubStatsTab';

const state = vi.hoisted(() => ({
  clubStats: { data: null as unknown, isLoading: false },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => (k === 'admin.clubStats.title' ? 'Statistika' : `t:${k}`),
  }),
}));
vi.mock('../../hooks/use-club-hub', () => ({ useClubStats: () => state.clubStats }));
vi.mock('../../components/club/ClubStatsPanels', () => ({
  ClubStatsSummary: () => <div data-testid="summary" />,
  PlayerStatsTable: () => <div data-testid="player-table" />,
}));

beforeEach(() => {
  state.clubStats = { data: null, isLoading: false };
});

describe('ClubStatsTab', () => {
  it('dok se učitava prikazuje skeleton', () => {
    state.clubStats = { data: null, isLoading: true };
    const { container } = render(<ClubStatsTab clubId="c1" />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('bez podataka prikazuje poruku', () => {
    render(<ClubStatsTab clubId="c1" />);
    expect(screen.getByText('t:admin.clubStats.empty')).toBeInTheDocument();
  });

  it('sa podacima prikazuje sažetak i tabelu', () => {
    state.clubStats = { data: { season: { name: 'S' }, totals: {}, players: [] }, isLoading: false };
    render(<ClubStatsTab clubId="c1" />);
    expect(screen.getByTestId('summary')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Statistika' })).toBeInTheDocument();
    expect(screen.getByTestId('player-table')).toBeInTheDocument();
  });
});

describe('AnalyticsTeamPanel', () => {
  const data = {
    clubId: 'k1',
    clubName: 'FK Gračanica',
    played: 10,
    wins: 6,
    draws: 2,
    losses: 2,
    goalsFor: 20,
    goalsAgainst: 10,
    winPercent: 60,
    form: ['W', 'D', 'L'],
    recent: [
      {
        id: 'm1',
        scheduledAt: '2026-05-01T17:00:00.000Z',
        status: 'FINISHED',
        home: 'FK Gračanica',
        away: 'FK Slavija',
        homeScore: 3,
        awayScore: 1,
      },
      {
        id: 'm2',
        scheduledAt: '2026-06-01T17:00:00.000Z',
        status: 'SCHEDULED',
        home: 'FK Radnik',
        away: 'FK Gračanica',
        homeScore: 0,
        awayScore: 0,
      },
    ],
  };

  it('prikazuje statistiku, formu i rezultate', () => {
    render(<AnalyticsTeamPanel data={data as never} />);
    expect(screen.getByText('t:admin.teamPanel.played')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('6–2–2')).toBeInTheDocument();
    expect(screen.getByText('20:10')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('3:1')).toBeInTheDocument();
    expect(document.body.textContent).toMatch(/01\.\s*06\.\s*2026/);
  });

  it('prazna forma prikazuje crticu', () => {
    render(<AnalyticsTeamPanel data={{ ...data, form: [], recent: [] } as never} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
