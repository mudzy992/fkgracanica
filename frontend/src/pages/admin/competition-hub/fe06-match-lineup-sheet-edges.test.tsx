import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchLineupSheet } from './MatchLineupSheet';

const state = vi.hoisted(() => ({
  match: null as Record<string, unknown> | null,
  players: [] as Array<Record<string, unknown>>,
  save: vi.fn(),
  squad: null as { slots: Array<Record<string, unknown>> } | null,
}));

vi.mock('../../../hooks', () => ({
  useMatch: () => ({ data: state.match, isLoading: false }),
  usePlayers: ({ clubId }: { clubId: string }) => ({
    data: state.players.filter((p) => p.clubId === clubId), isLoading: false,
  }),
}));
vi.mock('../../../hooks/use-club-hub', () => ({
  useClubSquad: () => ({ data: state.squad, isLoading: false }),
}));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useSetMatchLineup: () => ({ mutateAsync: state.save, isPending: false }),
}));
vi.mock('../../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? <div><h2>{title}</h2>{children}</div> : null,
}));
vi.mock('../../../components/admin/FormationPitch', () => ({
  FormationPitch: ({ slots, players }: { slots: unknown[]; players: Array<{ id: string }> }) => (
    <div data-testid="pitch">{slots.length} slotova / {players.length} igrača</div>
  ),
}));

const player = (id: string, clubId: string) => ({
  id, firstName: id, lastName: id, position: 'MID', clubId, isActive: true,
});
const squadSlot = (playerId: string, index: number) => ({
  id: `sq-${playerId}`, clubId: 'home', slotIndex: index, isBench: false, lineRole: 'MID',
  positionX: 20 + index, positionY: 30 + index, playerId, player: player(playerId, 'home'),
});

beforeEach(() => {
  state.players = [];
  state.squad = null;
  state.save = vi.fn().mockResolvedValue([]);
  state.match = {
    id: 'm1', status: 'SCHEDULED', homeClubId: 'home', awayClubId: 'away',
    homeClub: { id: 'home', name: 'FK Gračanica' }, awayClub: { id: 'away', name: 'FK Slavija' },
    lineup: [],
  };
});

const open = () =>
  render(<MatchLineupSheet matchId="m1" open onOpenChange={vi.fn()} />);

describe('MatchLineupSheet — rubovi učitavanja postave', () => {
  it('bez klupske postave dugme ne mijenja mrežu', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /Učitaj klupsku postavu/ }));
    expect(screen.getByTestId('pitch').textContent).toContain('11 slotova');
  });

  it('učitavanje za goste puni gostujuću stranu', () => {
    state.squad = { slots: Array.from({ length: 11 }, (_, i) => squadSlot(`g${i + 1}`, i)) };
    open();
    fireEvent.click(screen.getByRole('button', { name: 'FK Slavija' }));
    fireEvent.click(screen.getByRole('button', { name: /Učitaj klupsku postavu/ }));
    expect(screen.getByTestId('pitch').textContent).toContain('11 slotova');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('spremanje bez klubova ne zove API', () => {
    state.match = { id: 'm1', lineup: [] };
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj obje postave' }));
    expect(state.save).not.toHaveBeenCalled();
  });

  it('igrač iz postave drugog kluba se skriva iz izbora', () => {
    state.players = [player('same', 'home'), player('same', 'away'), player('mine', 'home')];
    state.match = {
      ...state.match,
      lineup: [{ id: 'row-1', playerId: 'same', clubId: 'away', isStarter: true }],
    };
    open();
    expect(screen.getByTestId('pitch').textContent).toContain('1 igrača');
  });
});

describe('MatchLineupSheet — stariji oblik odgovora (batch 34)', () => {
  it('koristi `lineups` kad nema `lineup` i radi bez izabrane utakmice', () => {
    state.match = {
      ...state.match,
      lineup: undefined,
      lineups: [{ id: 'row-1', playerId: 'p1', clubId: 'home', isStarter: true }],
    };
    state.players = [player('p1', 'home')];
    open();
    expect(screen.getByTestId('pitch').textContent).toContain('1 igrača');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('bez izabrane utakmice (matchId null) prikazuje praznu postavu bez pada', () => {
    state.match = null;
    render(<MatchLineupSheet matchId={null} open onOpenChange={vi.fn()} />);
    expect(screen.getByTestId('pitch').textContent).toContain('0 slotova');
  });

  it('utakmica bez `lineup`, `lineups` i klubova koristi prazan predložak bez sukoba', () => {
    state.match = { id: 'm1', status: 'SCHEDULED' };
    render(<MatchLineupSheet matchId="m1" open onOpenChange={vi.fn()} />);
    expect(screen.getByTestId('pitch').textContent).toContain('0 igrača');
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

