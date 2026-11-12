import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MatchStatisticsSection } from './MatchStatisticsSection';
import type { Match } from '../../types';
import type { MatchStatisticsOverview } from '../../types/match-stats';

vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const teamSide = (over: Record<string, unknown> = {}) => ({
  goals: 0, shots: 0, shotsOn: 0, corners: 0, fouls: 0, offsides: 0,
  yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0,
  possession: null, ...over,
});
const overview = (over: Record<string, unknown> = {}): MatchStatisticsOverview =>
  ({ team: { home: teamSide(), away: teamSide() }, players: { home: [], away: [] }, ...over }) as unknown as MatchStatisticsOverview;
const match = (over: Record<string, unknown> = {}) =>
  ({ id: 'm1', status: 'FINISHED', homeClub: { name: 'FK Gračanica' }, awayClub: { name: 'FK Slavija' }, ...over }) as unknown as Match;

describe('MatchStatisticsSection — branch47 (2 grane ?? 50 fallback)', () => {
  it('oba posjeda null ne prikazuju traku posjeda (pokriva dead 50 fallback koji je nedostižan)', () => {
    const stats = overview({
      team: {
        home: teamSide({ goals: 1, possession: null }),
        away: teamSide({ possession: null }),
      },
    });
    render(<MemoryRouter><MatchStatisticsSection match={match()} stats={stats} loading={false} /></MemoryRouter>);
    // traka posjeda se ne prikazuje kada su oba null (hasTeamStats true zbog goals, ali posjed uslov false)
    expect(screen.queryByText('Posjed')).toBeNull();
  });

  it('home null, away 30 => home 70% (pokriva home ?? fallback sa 100-away)', () => {
    const stats = overview({
      team: { home: teamSide({ goals: 1, possession: null }), away: teamSide({ possession: 30 }) },
    });
    render(<MemoryRouter><MatchStatisticsSection match={match()} stats={stats} loading={false} /></MemoryRouter>);
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('away null, home 40 => away 60% (pokriva away ?? fallback)', () => {
    const stats = overview({
      team: { home: teamSide({ possession: 40 }), away: teamSide({ goals: 1, possession: null }) },
    });
    render(<MemoryRouter><MatchStatisticsSection match={match()} stats={stats} loading={false} /></MemoryRouter>);
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});
