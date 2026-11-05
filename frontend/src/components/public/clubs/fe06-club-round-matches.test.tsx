import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubRoundMatches } from './ClubRoundMatches';

const state = vi.hoisted(() => ({
  rounds: { data: undefined as unknown, isLoading: false },
  matches: { data: undefined as unknown, isLoading: false },
  roundsSeason: '' as string | undefined,
  matchesSeason: '' as string | undefined,
  table: {} as Record<string, unknown>,
}));

vi.mock('../../../hooks', () => ({
  useMatches: (seasonId?: string) => {
    state.matchesSeason = seasonId;
    return state.matches;
  },
}));
vi.mock('../../../hooks/use-rounds', () => ({
  useRounds: (seasonId?: string) => {
    state.roundsSeason = seasonId;
    return state.rounds;
  },
}));
vi.mock('./ClubLastRoundMatchesTable', () => ({
  ClubLastRoundMatchesTable: (props: Record<string, unknown>) => {
    state.table = props;
    return <div>tabela:{(props.matches as unknown[]).length}:{String(props.loading)}</div>;
  },
}));

const round = (number: number, over: Record<string, unknown> = {}) => ({
  id: `r${number}`,
  number,
  name: null,
  ...over,
});
const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  roundId: 'r1',
  roundRel: { number: 1 },
  status: 'FINISHED',
  ...over,
});

const renderComponent = (props: Record<string, unknown> = {}) =>
  render(<ClubRoundMatches clubId="c1" {...props} />);

beforeEach(() => {
  state.rounds = { data: [round(2), round(1)], isLoading: false };
  state.matches = { data: [match()], isLoading: false };
  state.roundsSeason = undefined;
  state.matchesSeason = undefined;
  state.table = {};
});

describe('ClubRoundMatches — izbor kola', () => {
  it('prosljeđuje seasonId hookovima i bira zadnje odigrano kolo', () => {
    state.matches = { data: [match({ roundId: 'r2', roundRel: { number: 2 } })], isLoading: false };
    renderComponent({ seasonId: 's1' });
    expect(state.roundsSeason).toBe('s1');
    expect(state.matchesSeason).toBe('s1');
    expect(state.table).toMatchObject({ highlightClubId: 'c1', loading: false });
    expect(screen.getByRole('button', { name: '2. kolo' })).toBeInTheDocument();
    expect(screen.getAllByText('2. kolo')).toHaveLength(2);
    expect(state.table.matches).toHaveLength(1);
    expect((state.table.matches as Array<{ id: string }>)[0].id).toBe('m1');
  });

  it('digme kolo iz roundRel kad nema roundId', () => {
    state.matches = { data: [match({ roundId: null, roundRel: { number: 2 } })], isLoading: false };
    renderComponent();
    expect(screen.getAllByText('2. kolo').length).toBeGreaterThanOrEqual(2);
  });

  it('bez odigranih kola bira zadnje kolo po broju', () => {
    state.matches = { data: [match({ status: 'SCHEDULED' })], isLoading: false };
    renderComponent();
    expect(screen.getAllByText('2. kolo')).toHaveLength(2);
  });

  it('koristi naziv kola kad postoji', () => {
    state.rounds = { data: [round(1, { name: 'Derbi kolo' })], isLoading: false };
    renderComponent();
    expect(screen.getByText('Derbi kolo')).toBeInTheDocument();
  });

  it('sa više kola prikazuje dugmad i mijenja izbor', async () => {
    const user = userEvent.setup();
    state.matches = {
      data: [
        match({ id: 'm1', roundId: 'r1', status: 'FINISHED' }),
        match({ id: 'm2', roundId: 'r2', status: 'LIVE' }),
      ],
      isLoading: false,
    };
    renderComponent();
    const pills = screen.getAllByRole('button');
    expect(pills.map((p) => p.textContent)).toEqual(['1. kolo', '2. kolo']);
    expect((state.table.matches as Array<{ id: string }>).map((m) => m.id)).toEqual(['m2']);
    await user.click(screen.getByRole('button', { name: '1. kolo' }));
    expect((state.table.matches as Array<{ id: string }>).map((m) => m.id)).toEqual(['m1']);
  });

  it('sa jednim kolom nema dugmadi za izbor', () => {
    state.rounds = { data: [round(1)], isLoading: false };
    renderComponent();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText('1. kolo')).toBeInTheDocument();
  });
});

describe('ClubRoundMatches — prazna i učitana stanja', () => {
  it('bez kola i utakmica tabela je prazna i bez naslova', () => {
    state.rounds = { data: undefined, isLoading: true };
    state.matches = { data: undefined, isLoading: true };
    renderComponent();
    expect(screen.getByText('tabela:0:true')).toBeInTheDocument();
    expect(screen.queryByText(/kolo/)).toBeNull();
  });

  it('kolo bez utakmica daje praznu tabelu bez učitavanja', () => {
    state.matches = { data: [], isLoading: false };
    renderComponent();
    expect(screen.getByText('tabela:0:false')).toBeInTheDocument();
  });
});
