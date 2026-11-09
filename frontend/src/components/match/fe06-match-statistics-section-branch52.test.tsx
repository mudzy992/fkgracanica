import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchStatisticsSection } from './MatchStatisticsSection';
import type { TeamMatchStats } from '../../types/match-stats';

vi.mock('../../lib/motion/Reveal', () => ({ Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

const baseMatch = {
  id: 'm1',
  status: 'FINISHED' as const,
  homeClub: { id: 'h', name: 'Domaći FK' } as never,
  awayClub: { id: 'a', name: 'Gosti FK' } as never,
  homeClubId: 'h',
  awayClubId: 'a',
} as never;

function mkTeam(over: Partial<TeamMatchStats> = {}) {
  return {
    clubId: 'h',
    goals: 1,
    shots: 5,
    shotsOn: 2,
    corners: 3,
    fouls: 4,
    offsides: 1,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    penaltiesScored: 0,
    penaltiesMissed: 0,
    possession: 55,
    ...over,
  };
}

describe('fe06 MatchStatisticsSection branch52 — possession fallback grane', () => {
  it('home possession null, away 60 → home koristi 100-away', () => {
    const stats = {
      team: { home: mkTeam({ possession: null }), away: mkTeam({ possession: 60, clubId: 'a' }) },
      players: { home: [], away: [] },
    } as never;
    render(<MatchStatisticsSection match={baseMatch} stats={stats} loading={false} />);
    // still shows team section
    expect(screen.getByText('Statistika utakmice')).toBeInTheDocument();
  });
  it('away possession null, home 60 → away koristi 100-home', () => {
    const stats = {
      team: { home: mkTeam({ possession: 60 }), away: mkTeam({ possession: null, clubId: 'a' }) },
      players: { home: [], away: [] },
    } as never;
    render(<MatchStatisticsSection match={baseMatch} stats={stats} loading={false} />);
    expect(screen.getByText('Statistika utakmice')).toBeInTheDocument();
  });
  it('oba possession null → fallback 50', () => {
    const stats = {
      team: { home: mkTeam({ possession: null }), away: mkTeam({ possession: null, clubId: 'a' }) },
      players: { home: [], away: [] },
    } as never;
    render(<MatchStatisticsSection match={baseMatch} stats={stats} loading={false} />);
    expect(screen.getByText('Statistika utakmice')).toBeInTheDocument();
  });
});
