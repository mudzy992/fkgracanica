import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Match } from '../../../types';
import { CommentatorPenaltiesBoard } from './CommentatorPenaltiesBoard';

const state = vi.hoisted(() => ({
  addEvent: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  addLive: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  addReport: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-live-admin', () => ({
  useAddMatchEvent: () => state.addEvent,
  useAddMatchComment: () => state.addLive,
}));
vi.mock('../../../hooks/use-live-report', () => ({
  useAddReportComment: () => state.addReport,
}));

const lineup = (clubId: string, id: string, first: string, last: string) => ({
  id: `l-${id}`,
  clubId,
  playerId: id,
  isStarter: true,
  player: { id, firstName: first, lastName: last },
});

const match = (over: Record<string, unknown> = {}): Match =>
  ({
    id: 'm1',
    status: 'LIVE',
    homeScore: 1,
    awayScore: 1,
    homeClubId: 'c1',
    awayClubId: 'c2',
    homeClub: { id: 'c1', name: 'FK Gračanica' },
    awayClub: { id: 'c2', name: 'FK Slavija' },
    lineup: [
      lineup('c1', 'p1', 'Amar', 'Hodžić'),
      lineup('c2', 'p2', 'Emir', 'Karić'),
      { id: 'l-x', clubId: 'c1', playerId: 'p9', isStarter: false, player: null },
    ],
    liveComments: [],
    ...over,
  }) as unknown as Match;

describe('CommentatorPenaltiesBoard', () => {
  beforeEach(() => {
    state.addEvent = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  });

  it('prikazuje rezultat penala, regularni rezultat i oba kluba', () => {
    render(<CommentatorPenaltiesBoard match={match({ penaltyHomeScore: 4, penaltyAwayScore: 3 })} />);
    expect(screen.getByText('admin.penalties.title')).toBeTruthy();
    expect(screen.getByText('4 : 3')).toBeTruthy();
    expect(screen.getByText('Regularni rezultat 1:1')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'FK Gračanica' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'FK Slavija' })).toBeTruthy();
  });

  it('bez rezultata penala prikazuje nule i zamjenske nazive', () => {
    render(
      <CommentatorPenaltiesBoard
        match={match({ homeClub: null, awayClub: null, lineups: undefined, lineup: undefined })}
      />,
    );
    expect(screen.getByText('0 : 0')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Domaći' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Gosti' })).toBeTruthy();
  });

  it('u izborniku su samo igrači tog kluba sa sastavom', () => {
    render(<CommentatorPenaltiesBoard match={match()} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(within(selects[0]).getByRole('option', { name: 'Amar Hodžić' })).toBeTruthy();
    expect(within(selects[0]).queryByRole('option', { name: 'Emir Karić' })).toBeNull();
    expect(within(selects[1]).getByRole('option', { name: 'Emir Karić' })).toBeTruthy();
  });

  it('dugmad su onemogućena bez odabranog igrača', () => {
    render(<CommentatorPenaltiesBoard match={match()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.filter((b) => b.textContent === 'Gol')).toHaveLength(2);
    buttons.forEach((b) => expect(b).toHaveProperty('disabled', true));
  });

  it('gol šalje događaj PENALTY_SCORED i prazni izbor', async () => {
    render(<CommentatorPenaltiesBoard match={match()} />);
    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'p1');
    const [homeGol] = screen.getAllByRole('button', { name: 'Gol' });
    await userEvent.click(homeGol);
    expect(state.addEvent.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'PENALTY_SCORED',
      teamSide: 'home',
      playerId: 'p1',
    });
    expect((screen.getAllByRole('combobox')[0] as HTMLSelectElement).value).toBe('');
  });

  it('promašaj gostiju šalje PENALTY_MISSED za away stranu', async () => {
    render(<CommentatorPenaltiesBoard match={match()} />);
    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'p2');
    const buttons = screen.getAllByRole('button', { name: 'Promašaj' });
    await userEvent.click(buttons[1]);
    expect(state.addEvent.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'PENALTY_MISSED',
      teamSide: 'away',
      playerId: 'p2',
    });
  });

  it('dok je zahtjev u toku dugmad su onemogućena', async () => {
    state.addEvent = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<CommentatorPenaltiesBoard match={match()} />);
    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'p1');
    screen.getAllByRole('button', { name: 'Gol' }).forEach((b) => expect(b).toHaveProperty('disabled', true));
  });
});
