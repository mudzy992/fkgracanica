import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsH2hPanel } from './AnalyticsH2hPanel';
import { AnalyticsPlayerPanel } from './AnalyticsPlayerPanel';

const state = vi.hoisted(() => ({
  clubs: [] as unknown[],
  players: [] as unknown[],
  seasons: [] as unknown[],
  h2hCalls: [] as (string | undefined)[][],
  playerCalls: [] as (string | undefined)[],
  h2h: { data: undefined as unknown, isFetching: false },
  player: { data: undefined as unknown, isFetching: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({
  useClubs: () => ({ data: state.clubs }),
  usePlayers: () => ({ data: state.players }),
  useSeasons: () => ({ data: state.seasons }),
}));
vi.mock('../../../hooks/use-analytics', () => ({
  useH2H: (a?: string, b?: string) => {
    state.h2hCalls.push([a, b]);
    return state.h2h;
  },
  usePlayerAnalytics: (id?: string) => {
    state.playerCalls.push(id);
    return state.player;
  },
}));

const clubs = [
  { id: 'c1', name: 'FK Gračanica' },
  { id: 'c2', name: 'FK Slavija' },
];

const h2h = {
  played: 4,
  clubA: { wins: 2, draws: 1, losses: 1 },
  clubB: { wins: 1, draws: 1, losses: 2 },
  matches: [
    { id: 'm1', home: 'FK Gračanica', away: 'FK Slavija', homeScore: 2, awayScore: 1, scheduledAt: '2026-05-10T17:00:00.000Z' },
    { id: 'm2', home: 'FK Slavija', away: 'FK Gračanica', homeScore: 0, awayScore: 3, scheduledAt: '2025-10-04T17:00:00.000Z' },
  ],
};

describe('AnalyticsH2hPanel', () => {
  beforeEach(() => {
    state.clubs = clubs;
    state.h2hCalls = [];
    state.h2h = { data: undefined, isFetching: false };
  });

  it('prikazuje oba izbornika sa svim klubovima', () => {
    render(<AnalyticsH2hPanel />);
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(within(selects[0]).getAllByRole('option')).toHaveLength(3);
    expect(screen.getAllByText('FK Gračanica').length).toBeGreaterThan(0);
  });

  it('bez odabira upit ide bez ID-eva i nema rezultata', () => {
    render(<AnalyticsH2hPanel />);
    expect(state.h2hCalls[0]).toEqual([undefined, undefined]);
    expect(screen.queryByText('W')).toBeNull();
  });

  it('učitavanje prikazuje poruku', () => {
    state.h2h = { data: undefined, isFetching: true };
    render(<AnalyticsH2hPanel />);
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
  });

  it('sa rezultatom prikazuje bilans, broj utakmica i listu', () => {
    state.h2h = { data: h2h, isFetching: false };
    render(<AnalyticsH2hPanel />);
    expect(screen.getByText('Klub A')).toBeTruthy();
    expect(screen.getByText('Klub B')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getAllByText('W')).toHaveLength(2);
    expect(screen.getByText('2:1')).toBeTruthy();
    expect(screen.getByText('0:3')).toBeTruthy();
    expect(screen.getAllByText('FK Gračanica').length).toBeGreaterThan(0);
  });

  it('odabir klubova prikazuje nazive i prosljeđuje ID-eve upitu', async () => {
    state.h2h = { data: h2h, isFetching: false };
    render(<AnalyticsH2hPanel />);
    const [a, b] = screen.getAllByRole('combobox');
    await userEvent.selectOptions(a, 'c1');
    await userEvent.selectOptions(b, 'c2');
    expect(state.h2hCalls.at(-1)).toEqual(['c1', 'c2']);
    expect(screen.getAllByText('FK Gračanica').length).toBeGreaterThanOrEqual(2);
  });

  it('odabrani klub koji nedostaje u listi prikazuje upitnik', async () => {
    state.h2h = { data: h2h, isFetching: false };
    const { rerender } = render(<AnalyticsH2hPanel />);
    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'c1');
    state.clubs = [];
    rerender(<AnalyticsH2hPanel />);
    expect(screen.getByText('?')).toBeTruthy();
    expect(screen.getByText('Klub B')).toBeTruthy();
  });
});

describe('AnalyticsPlayerPanel', () => {
  const players = [
    { id: 'p1', firstName: 'Amar', lastName: 'Hodžić' },
    { id: 'p2', firstName: 'Emir', lastName: 'Karić' },
  ];
  const seasons = [
    { id: 's1', name: '2025/2026' },
    { id: 's2', name: '2024/2025' },
  ];
  const player = {
    totals: { appearances: 12, goals: 9, assists: 4, minutes: 1020, yellowCards: 3, redCards: 1 },
    seasons: [
      { seasonId: 's1', appearances: 8, goals: 7, assists: 3, minutes: 700, yellowCards: 2, redCards: 0 },
      { seasonId: 's2', appearances: 4, goals: 2, assists: 1, minutes: 320, yellowCards: 1, redCards: 1 },
    ],
  };

  beforeEach(() => {
    state.players = players;
    state.seasons = seasons;
    state.playerCalls = [];
    state.player = { data: undefined, isFetching: false };
  });

  it('prikazuje izbornik igrača sa imenima', () => {
    render(<AnalyticsPlayerPanel />);
    const select = screen.getByRole('combobox');
    expect(within(select).getByRole('option', { name: 'Amar Hodžić' })).toBeTruthy();
    expect(state.playerCalls[0]).toBeUndefined();
  });

  it('bez rezultata nema tabela', () => {
    render(<AnalyticsPlayerPanel />);
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('sa rezultatom prikazuje zbrojne kartice i tabelu po sezonama', () => {
    state.player = { data: player, isFetching: false };
    render(<AnalyticsPlayerPanel />);
    expect(screen.getByText('Nastupi')).toBeTruthy();
    expect(screen.getByText('1020')).toBeTruthy();
    expect(screen.getByText('Asistencije')).toBeTruthy();
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1].textContent).toContain('2025/2026');
    expect(rows[2].textContent).toContain('2024/2025');
  });

  it('nepoznata sezona prikazuje ID', () => {
    state.player = {
      data: { ...player, seasons: [{ ...player.seasons[0], seasonId: 'nepoznata' }] },
      isFetching: false,
    };
    render(<AnalyticsPlayerPanel />);
    expect(screen.getByText('nepoznata')).toBeTruthy();
  });

  it('odabir igrača prosljeđuje ID upitu', async () => {
    render(<AnalyticsPlayerPanel />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'p2');
    expect(state.playerCalls.at(-1)).toBe('p2');
  });

  it('učitavanje prikazuje poruku iznad rezultata', () => {
    state.player = { data: player, isFetching: true };
    render(<AnalyticsPlayerPanel />);
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
    expect(screen.getByRole('table')).toBeTruthy();
  });

  it('prazne liste igrača i sezona ne padaju', () => {
    state.players = [];
    state.seasons = [];
    render(<AnalyticsPlayerPanel />);
    expect(within(screen.getByRole('combobox')).getAllByRole('option')).toHaveLength(1);
  });
});
