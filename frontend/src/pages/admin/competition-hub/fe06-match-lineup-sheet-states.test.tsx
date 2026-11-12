import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchLineupSheet } from './MatchLineupSheet';

const state = vi.hoisted(() => ({
  match: null as Record<string, unknown> | null,
  players: [] as Array<Record<string, unknown>>,
  save: vi.fn(),
  squad: { slots: [] as Array<Record<string, unknown>> },
  loading: false,
}));

vi.mock('../../../hooks', () => ({
  useMatch: () => ({ data: state.match, isLoading: state.loading }),
  usePlayers: ({ clubId }: { clubId: string }) => ({
    data: state.players.filter((p) => p.clubId === clubId),
    isLoading: state.loading,
  }),
}));
vi.mock('../../../hooks/use-club-hub', () => ({
  useClubSquad: () => ({ data: state.squad, isLoading: state.loading }),
}));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useSetMatchLineup: () => ({ mutateAsync: state.save, isPending: false }),
}));
vi.mock('../../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? <div><h2>{title}</h2>{children}</div> : null,
}));
vi.mock('../../../components/admin/FormationPitch', () => ({
  FormationPitch: ({
    slots,
    players,
    onSlotChange,
  }: {
    slots: Array<{ playerId?: string | null }>;
    players: Array<{ id: string }>;
    onSlotChange: (i: number, id: string | null) => void;
  }) => (
    <div data-testid="pitch">
      {slots.length} slotova / {players.length} igrača
      <button onClick={() => onSlotChange(0, 'p9')}>postavi</button>
    </div>
  ),
}));

const player = (id: string, clubId: string, position = 'MID') =>
  ({ id, firstName: id[0].toUpperCase(), lastName: id, position, clubId, isActive: true });

const squadSlot = (playerId: string, index: number) => ({
  id: `sq-${playerId}`, clubId: 'home', slotIndex: index, isBench: false,
  lineRole: positionAt(index), positionX: 20 + index, positionY: 30 + index,
  playerId, player: player(playerId, 'home'),
});

function positionAt(index: number) {
  if (index === 0) return 'GK';
  if (index < 5) return 'DEF';
  if (index < 9) return 'MID';
  return 'FWD';
}

const eleven = Array.from({ length: 11 }, (_, i) => `p${i + 1}`);

beforeEach(() => {
  state.loading = false;
  state.players = [];
  state.squad = { slots: [] };
  state.save = vi.fn().mockResolvedValue([]);
  state.match = {
    id: 'm1', status: 'SCHEDULED', homeClubId: 'home', awayClubId: 'away',
    homeClub: { id: 'home', name: 'FK Gračanica' }, awayClub: { id: 'away', name: 'FK Slavija' }, lineup: [],
  };
});

const open = (over: Record<string, unknown> = {}) =>
  render(<MatchLineupSheet matchId="m1" open onOpenChange={vi.fn()} {...over} />);

describe('MatchLineupSheet — učitavanje i zaglavlje', () => {
  it('tokom učitavanja prikazuje skeleton', () => {
    state.loading = true;
    const { container } = open();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('naslov koristi imena klubova, a prebacivanje strane mijenja prikaz', () => {
    state.players = [player('home1', 'home'), player('away1', 'away')];
    open();
    expect(screen.getByRole('heading', { name: 'Postava: FK Gračanica vs FK Slavija' })).toBeInTheDocument();
    expect(screen.getByTestId('pitch').textContent).toContain('1 igrača');
    fireEvent.click(screen.getByRole('button', { name: 'FK Slavija' }));
    expect(screen.getByTestId('pitch').textContent).toContain('1 igrača');
  });

  it('bez klubova naslov ima rezervne oznake', () => {
    state.match = { id: 'm1', lineup: [] };
    open();
    expect(screen.getByRole('heading', { name: 'Postava: ? vs ?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Domaći' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gosti' })).toBeInTheDocument();
  });
});

describe('MatchLineupSheet — učitavanje klupske postave', () => {
  it('pun raspored iz klupske postave ne prikazuje upozorenje o nepotpunoj mreži', () => {
    state.squad = { slots: eleven.map((id, i) => squadSlot(id, i)) };
    open();
    fireEvent.click(screen.getByRole('button', { name: /Učitaj klupsku postavu/ }));
    expect(screen.getByTestId('pitch').textContent).toContain('11 slotova');
    expect(screen.queryByText(/rezervna 4-3-3 mreža/)).toBeNull();
  });

  it('nepotpun raspored prikazuje upozorenje sa rezervnom mrežom', () => {
    state.squad = { slots: [squadSlot('p1', 0), squadSlot('p2', 1)] };
    open();
    expect(screen.getByText(/Klupski raspored nema 11 valjanih pozicija/)).toBeInTheDocument();
  });

  it('postava iz klupske postave prikazuje hint predloška', () => {
    state.match = { ...state.match, lineup: [{ id: 'squad-default-1', playerId: 'p1', clubId: 'home' }] };
    open();
    expect(screen.getByText(/Igrači su učitani iz klupske postave kao predložak/)).toBeInTheDocument();
  });
});

describe('MatchLineupSheet — konflikti i greške', () => {
  it('postava drugog kluba blokira spremanje', () => {
    state.match = {
      ...state.match,
      lineup: [{ id: 'row-1', playerId: 'x', clubId: 'other', isStarter: true }],
    };
    open();
    expect(screen.getByRole('alert')).toHaveTextContent('Spremljena postava sadrži igrače prethodnog kluba');
    expect(screen.getByRole('button', { name: 'Sačuvaj obje postave' })).toBeDisabled();
  });

  it('završena utakmica ima dodatno objašnjenje konflikta', () => {
    state.match = {
      ...state.match,
      status: 'FINISHED',
      lineup: [{ id: 'row-1', playerId: 'x', clubId: 'other', isStarter: true }],
    };
    open();
    expect(screen.getByRole('alert').textContent).toContain('Utakmica je završena i zaključana');
  });

  it('skriveni starteri prikazuju napomenu da ostaju sačuvani', () => {
    state.match = {
      ...state.match,
      lineup: Array.from({ length: 13 }, (_, i) => ({
        id: `row-${i}`, playerId: `p${i + 1}`, clubId: 'home', isStarter: true,
        positionX: 10 + i, positionY: 10 + i,
      })),
      lineupConfigured: true,
    };
    open();
    expect(document.body.textContent).toContain('Dodatni spremljeni starteri nisu prikazani');
  });

  it('greška spremanja se prikazuje u alertu', async () => {
    state.save = vi.fn().mockRejectedValue(new Error('400'));
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj obje postave' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert').textContent).toContain('400');
  });

  it('uspješno spremanje zatvara sheet', async () => {
    const onOpenChange = vi.fn();
    open({ onOpenChange });
    fireEvent.click(screen.getByRole('button', { name: /Učitaj klupsku postavu/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Sačuvaj obje postave' }));
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('MatchLineupSheet — promjena slota', () => {
  it('postavljanje igrača u slot označava izmjenu', () => {
    state.players = [player('home1', 'home')];
    const { container } = open();
    fireEvent.click(screen.getByText('postavi'));
    expect(container.querySelector('input[type="hidden"]')?.getAttribute('value')).toContain('p9');
  });

  it('zatvoren sheet ne prikazuje sadržaj', () => {
    render(<MatchLineupSheet matchId="m1" open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByTestId('pitch')).toBeNull();
  });
});
