import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ClubStatsSummary, PlayerStatsTable } from './ClubStatsPanels';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const stats = (over: Record<string, unknown> = {}) => ({
  season: { id: 's1', name: 'Sezona 2025/26' },
  standing: { points: 30, goalsFor: 22, goalsAgainst: 10, form: 'WWDLW' },
  totals: {
    goals: 22,
    assists: 15,
    appearances: 120,
    yellowCards: 18,
    redCards: 2,
  },
  players: [],
  ...over,
});

describe('ClubStatsSummary', () => {
  it('bez sezone prikazuje poruku', () => {
    render(<ClubStatsSummary />);
    expect(
      screen.getByText('Statistike za aktivnu sezonu nisu dostupne.'),
    ).toBeInTheDocument();
  });

  it('bez tabele prikazuje samo sezonu i ukupne brojke', () => {
    render(<ClubStatsSummary stats={stats({ standing: null }) as never} />);
    expect(screen.getByText('Sezona 2025/26')).toBeInTheDocument();
    expect(screen.queryByText('Bodovi')).toBeNull();
    expect(screen.getByText('Golovi')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('sa tabelom prikazuje bodove, gol razliku i formu', () => {
    render(<ClubStatsSummary stats={stats() as never} />);
    expect(screen.getByText('Bodovi')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('22:10')).toBeInTheDocument();
    expect(screen.getByText('WWDLW')).toBeInTheDocument();
  });

  it('prazna forma prikazuje crticu', () => {
    render(
      <ClubStatsSummary
        stats={stats({ standing: { points: 0, goalsFor: 0, goalsAgainst: 0, form: '' } }) as never}
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('PlayerStatsTable', () => {
  const player = (id: string, withStats: boolean) => ({
    id,
    firstName: `Ime${id}`,
    lastName: 'Prezime',
    stats: withStats
      ? { appearances: 10, goals: 4, assists: 2, yellowCards: 3, redCards: 1 }
      : null,
  });

  it('bez statistike igrača prikazuje poruku', () => {
    render(<PlayerStatsTable stats={stats({ players: [player('p1', false)] }) as never} />);
    expect(screen.getByText('Nema statistike igrača za sezonu.')).toBeInTheDocument();
  });

  it('prikazuje samo igrače sa statistikom', () => {
    wrap(
      <PlayerStatsTable
        stats={stats({ players: [player('p1', true), player('p2', false)] }) as never}
      />,
    );
    expect(screen.getByText('Ime' + 'p1 Prezime')).toBeInTheDocument();
    expect(screen.queryByText('Imep2 Prezime')).toBeNull();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3/1')).toBeInTheDocument();
  });

  it('nedostajuća polja statistike prikazuju nulu', () => {
    wrap(
      <PlayerStatsTable
        stats={
          stats({
            players: [{ id: 'p3', firstName: 'Bez', lastName: 'Broja', stats: {} }],
          }) as never
        }
      />,
    );
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });
});
