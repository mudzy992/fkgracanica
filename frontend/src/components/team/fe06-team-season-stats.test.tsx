import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { ClubSeasonStats } from '../../types/club-hub';
import { TeamSeasonStats } from './TeamSeasonStats';

const stat = (goals: number, assists = 0, appearances = 0, yellow = 0, red = 0) => ({
  goals,
  assists,
  appearances,
  yellowCards: yellow,
  redCards: red,
  minutes: 90,
});

const stats: ClubSeasonStats = {
  season: { id: 's1', name: '2025/2026' },
  standing: {
    clubId: 'c1',
    clubName: 'FK Gračanica',
    played: 12,
    won: 7,
    drawn: 3,
    lost: 2,
    goalsFor: 22,
    goalsAgainst: 11,
    goalDifference: 11,
    points: 24,
    form: 'WWDWL',
    formMatches: [],
  },
  totals: stat(22, 15, 132, 18, 1),
  players: [
    { id: 'p1', firstName: 'Amar', lastName: 'Hodžić', number: 9, stats: stat(9, 2, 12, 3, 0) },
    { id: 'p2', firstName: 'Emir', lastName: 'Karić', number: 10, stats: stat(4, 8, 12, 1, 1) },
    { id: 'p3', firstName: 'Bez', lastName: 'Statistike', number: 3, stats: null },
  ],
};

const renderStats = (value?: ClubSeasonStats | null) =>
  render(
    <MemoryRouter>
      <TeamSeasonStats stats={value} />
    </MemoryRouter>,
  );

describe('TeamSeasonStats', () => {
  it('bez sezone prikazuje poruku umjesto tabela', () => {
    renderStats(null);
    expect(screen.getByText('Statistike sezone')).toBeTruthy();
    expect(screen.getByText('Statistike za aktivnu sezonu nisu dostupne.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('sa sezonom i plasmanom prikazuje KPI kartice, zbir i formu', () => {
    renderStats(stats);
    expect(screen.getByText('2025/2026')).toBeTruthy();
    expect(screen.getByText('Bodovi')).toBeTruthy();
    expect(screen.getByText('24')).toBeTruthy();
    expect(screen.getByText('22:11')).toBeTruthy();
    expect(screen.getByText('Forma')).toBeTruthy();
    expect(screen.getByText('Zadnjih 5 ligaških utakmica u sezoni')).toBeTruthy();
    expect(screen.getByText('Odigrano')).toBeTruthy();
    expect(screen.getByText('Pobjede')).toBeTruthy();
    expect(screen.getAllByText('Golovi').length).toBeGreaterThan(0);
    expect(screen.getByText('Crveni')).toBeTruthy();
    expect(screen.getByText('132')).toBeTruthy();
  });

  it('tabela prikazuje samo igrače sa statistikom, sortirane po golovima', () => {
    renderStats(stats);
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    const cells = within(rows[1]).getAllByRole('cell');
    expect(cells[0].textContent).toBe('Amar Hodžić');
    expect(cells[1].textContent).toBe('12');
    expect(cells[2].textContent).toBe('9');
    expect(cells[3].textContent).toBe('2');
    expect(cells[4].textContent).toBe('3/0');
    expect(within(rows[1]).getByRole('link').getAttribute('href')).toContain('/igrac/p1');
    expect(screen.queryByText('Bez Statistike')).toBeNull();
  });

  it('bez plasmana nema KPI sekcije ni reda o formi, ali tabela ostaje', () => {
    renderStats({ ...stats, standing: null });
    expect(screen.queryByText('Bodovi')).toBeNull();
    expect(screen.queryByText('Forma')).toBeNull();
    expect(screen.queryByText('Odigrano')).toBeNull();
    expect(screen.getAllByText('Golovi').length).toBeGreaterThan(0);
    expect(screen.getByRole('table')).toBeTruthy();
  });

  it('sezona bez igrača sa statistikom nema tabelu', () => {
    renderStats({ ...stats, players: [stats.players[2]] });
    expect(screen.getByText('2025/2026')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('prikazuje nule za igrača bez pojedinih polja statistike', () => {
    renderStats({
      ...stats,
      players: [
        {
          id: 'p9',
          firstName: 'Nula',
          lastName: 'Nulić',
          stats: { ...stat(0), assists: 0, appearances: 0, yellowCards: 0, redCards: 0 },
        },
      ],
    });
    const row = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(row.textContent).toContain('0/0');
  });

  it('isti broj golova sortira po asistencijama, pa po nastupima', () => {
    const player = (id: string, assists: number, appearances: number) => ({
      id,
      firstName: id.toUpperCase(),
      lastName: 'Test',
      stats: stat(2, assists, appearances),
    });
    renderStats({
      ...stats,
      players: [player('p3', 1, 30), player('p1', 5, 10), player('p2', 3, 20), player('p4', 3, 25)],
    });
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getAllByRole('cell')[0].textContent))
      .toEqual(['P1 Test', 'P4 Test', 'P2 Test', 'P3 Test']);
  });
});
