import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Match, MatchLineup, Player } from '../../../types';
import { MatchLineupSheet } from './MatchLineupSheet';

const state = vi.hoisted(() => ({
  match: null as Match | null,
  players: [] as Player[],
  save: vi.fn().mockResolvedValue([]),
  squad: { slots: [] },
}));
vi.mock('../../../hooks', () => ({
  useMatch: () => ({ data: state.match, isLoading: false }),
  usePlayers: ({ clubId }: { clubId: string }) => ({ data: state.players.filter((p) => p.clubId === clubId), isLoading: false }),
}));
vi.mock('../../../hooks/use-club-hub', () => ({
  useClubSquad: () => ({ data: state.squad, isLoading: false }),
}));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useSetMatchLineup: () => ({ mutateAsync: state.save, isPending: false }),
}));
vi.mock('../../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, children }: { open: boolean; children: ReactNode }) => open ? <div>{children}</div> : null,
}));

const keeper = { id: 'keeper', firstName: 'K', lastName: 'Keeper', position: 'GK', clubId: 'home', isActive: true } as Player;
const wing = { id: 'wing', firstName: 'W', lastName: 'Wing', position: 'FWD', clubId: 'home', isActive: true } as Player;
const reserve = { id: 'reserve', firstName: 'R', lastName: 'Reserve', position: 'MID', clubId: 'home', isActive: true } as Player;
const initialRows: MatchLineup[] = [
  { id: 'saved-wing', playerId: 'wing', clubId: 'home', positionX: 75, positionY: 28, isStarter: true, player: wing },
  { id: 'saved-reserve', playerId: 'reserve', clubId: 'home', isStarter: false, player: reserve },
];

beforeEach(() => {
  state.players = [keeper, wing, reserve];
  state.save.mockReset().mockResolvedValue([]);
  state.match = {
    id: 'match', homeClubId: 'home', awayClubId: 'away', homeClub: { id: 'home', name: 'Home' },
    awayClub: { id: 'away', name: 'Away' }, lineupConfigured: true, lineup: initialRows,
  } as Match;
});

describe('uređivanje postave tokom osvježavanja podataka', () => {
  it('ne gubi korisničku izmjenu i koristi originalnu osnovu za spremanje', async () => {
    const close = vi.fn();
    const view = render(<MatchLineupSheet matchId="match" open onOpenChange={close} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[10]).toHaveValue('wing');
    fireEvent.change(selects[10], { target: { value: '' } });
    fireEvent.change(selects[0], { target: { value: 'keeper' } });

    state.match = { ...state.match!, lineup: [{ ...initialRows[0], positionX: 50, positionY: 22 }] };
    view.rerender(<MatchLineupSheet matchId="match" open onOpenChange={close} />);
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('keeper');
    expect(screen.getAllByRole('combobox')[10]).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj obje postave' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledOnce());
    expect(state.save).toHaveBeenCalledWith({ matchId: 'match', slots: [
      { playerId: 'keeper', clubId: 'home', positionX: 50, positionY: 90, isStarter: true },
      { playerId: 'reserve', clubId: 'home', isStarter: false },
    ] });
    await waitFor(() => expect(close).toHaveBeenCalledWith(false));
  });

  it('dok nema korisničkih izmjena prihvata osvježeni odgovor', async () => {
    const view = render(<MatchLineupSheet matchId="match" open onOpenChange={() => undefined} />);
    state.match = { ...state.match!, lineup: [{ ...initialRows[0], positionX: 50, positionY: 22 }] };
    view.rerender(<MatchLineupSheet matchId="match" open onOpenChange={() => undefined} />);
    await waitFor(() => expect(screen.getAllByRole('combobox')[9]).toHaveValue('wing'));
    expect(screen.getAllByRole('combobox')[10]).toHaveValue('');
  });
});


describe('zaštita sukobljenih postava', () => {
  it('upozorava i onemogućava spremanje ako spremljeni red pripada starom klubu', () => {
    state.match = { ...state.match!, lineup: [{ ...initialRows[0], clubId: 'old-club' }] };
    render(<MatchLineupSheet matchId="match" open onOpenChange={() => undefined} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/prethodn.*klub/i);
    expect(screen.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeDisabled();
    expect(state.save).not.toHaveBeenCalled();
  });

  it('za završenu utakmicu upućuje na ručni pregled umjesto nedostupnog vraćanja klubova', () => {
    state.match = { ...state.match!, status: 'FINISHED', lineup: [{ ...initialRows[0], clubId: 'old-club' }] };
    render(<MatchLineupSheet matchId="match" open onOpenChange={() => undefined} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/završena i zaključana/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/ručni pregled/i);
    expect(screen.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeDisabled();
  });

  it('blokira i ako osvježeni odgovor otkrije sukob poslije korisničke izmjene', () => {
    const view = render(<MatchLineupSheet matchId="match" open onOpenChange={() => undefined} />);
    fireEvent.change(screen.getAllByRole('combobox')[10], { target: { value: '' } });
    state.match = { ...state.match!, lineup: [{ ...initialRows[0], clubId: 'old-club' }] };
    view.rerender(<MatchLineupSheet matchId="match" open onOpenChange={() => undefined} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/prethodn.*klub/i);
    expect(screen.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeDisabled();
  });

  it('ne tretira predložak kao spremljeni konfliktni red', () => {
    state.match = { ...state.match!, lineupConfigured: false, lineup: [{ ...initialRows[0], id: 'squad-default-old-10', clubId: 'old-club' }] };
    render(<MatchLineupSheet matchId="match" open onOpenChange={() => undefined} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeEnabled();
  });

  it('grešku API-ja prikaže i zadrži editor otvorenim', async () => {
    state.save.mockRejectedValueOnce(new Error('Postava je u sukobu s klubovima.'));
    const close = vi.fn();
    render(<MatchLineupSheet matchId="match" open onOpenChange={close} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj obje postave' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Postava je u sukobu s klubovima.');
    expect(close).not.toHaveBeenCalled();
  });
});
