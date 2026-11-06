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
  goals: 0,
  shots: 0,
  shotsOn: 0,
  corners: 0,
  fouls: 0,
  offsides: 0,
  yellowCards: 0,
  redCards: 0,
  saves: 0,
  penaltiesScored: 0,
  penaltiesMissed: 0,
  possession: null,
  ...over,
});

const overview = (over: Record<string, unknown> = {}): MatchStatisticsOverview =>
  ({
    team: { home: teamSide(), away: teamSide() },
    players: { home: [], away: [] },
    ...over,
  }) as unknown as MatchStatisticsOverview;

const match = (over: Record<string, unknown> = {}) =>
  ({
    id: 'm1',
    status: 'FINISHED',
    homeClub: { name: 'FK Gračanica', slug: 'fk-gracanica' },
    awayClub: { name: 'FK Slavija', slug: 'fk-slavija' },
    ...over,
  }) as unknown as Match;

const playerStat = (over: Record<string, unknown> = {}) => ({
  playerId: 'p1',
  firstName: 'Amar',
  lastName: 'Hodžić',
  isStarter: true,
  goals: 0,
  ownGoals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  shots: 0,
  shotsOn: 0,
  ...over,
});

describe('MatchStatisticsSection', () => {
  it('ne prikazuje ništa za zakazanu utakmicu', () => {
    const { container } = render(
      <MatchStatisticsSection
        match={match({ status: 'SCHEDULED' })}
        stats={overview()}
        loading={false}
      />,
    );
    expect(container.textContent).toBe('');
  });

  it('ne prikazuje ništa dok se učita', () => {
    const { container } = render(
      <MatchStatisticsSection match={match()} stats={overview()} loading />,
    );
    expect(container.textContent).toBe('');
  });

  it('ne prikazuje ništa bez statistike', () => {
    const { container } = render(<MatchStatisticsSection match={match()} loading={false} />);
    expect(container.textContent).toBe('');
  });

  it('ne prikazuje ništa kada su sve vrijednosti nula', () => {
    const { container } = render(
      <MatchStatisticsSection match={match()} stats={overview()} loading={false} />,
    );
    expect(container.textContent).toBe('');
  });

  it('prikazuje timske trake i igrače', () => {
    const stats = overview({
      team: {
        home: teamSide({ goals: 2, shots: 10, shotsOn: 5, possession: 60 }),
        away: teamSide({ goals: 1, shots: 8, shotsOn: 3 }),
      },
      players: {
        home: [playerStat({ goals: 2 })],
        away: [playerStat({ playerId: 'p2', firstName: 'Emir', lastName: 'Karić' })],
      },
    });
    render(
      <MemoryRouter>
        <MatchStatisticsSection match={match()} stats={stats} loading={false} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Statistika utakmice')).toBeTruthy();
    expect(screen.getAllByText('FK Gračanica').length).toBeGreaterThan(0);
    expect(screen.getAllByText('FK Slavija').length).toBeGreaterThan(0);
    expect(screen.getByText('Posjed')).toBeTruthy();
    expect(screen.getByText('60%')).toBeTruthy();
    expect(screen.getByText('40%')).toBeTruthy();
    expect(screen.getByText('Emir Karić')).toBeTruthy();
  });

  it('posjed se izvodi iz protivnika kada nedostaje', () => {
    const stats = overview({
      team: {
        home: teamSide({ goals: 1, possession: null }),
        away: teamSide({ possession: 35 }),
      },
    });
    render(<MatchStatisticsSection match={match()} stats={stats} loading={false} />);
    expect(screen.getByText('65%')).toBeTruthy();
    expect(screen.getByText('35%')).toBeTruthy();
  });

  it('odbrane i penali se prikazuju samo kada postoje', () => {
    const stats = overview({
      team: {
        home: teamSide({ saves: 4, penaltiesScored: 1, penaltiesMissed: 1 }),
        away: teamSide({ saves: 2 }),
      },
    });
    render(<MatchStatisticsSection match={match()} stats={stats} loading={false} />);
    expect(screen.getByText('Odbrane')).toBeTruthy();
    expect(screen.getByText('Penali (gol)')).toBeTruthy();
    expect(screen.getByText('Penali (promašaj)')).toBeTruthy();
  });

  it('bez klubova koristi rezervne nazive strana', () => {
    const stats = overview({ team: { home: teamSide({ goals: 1 }), away: teamSide() } });
    render(
      <MatchStatisticsSection
        match={match({ homeClub: null, awayClub: null })}
        stats={stats}
        loading={false}
      />,
    );
    expect(screen.getAllByText('Domaći').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Gosti').length).toBeGreaterThan(0);
  });
});
