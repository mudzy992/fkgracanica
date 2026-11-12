import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../../i18n';
import { ClubFormationTab } from './ClubFormationTab';
import type { ClubSquadSlot } from '../../../../types/club-hub';

const state = vi.hoisted(() => ({
  squad: { data: null as unknown, isLoading: false },
  players: { data: [] as unknown[] },
  updateFormation: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  assign: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('../../../../hooks/use-club-hub', () => ({
  useClubSquad: () => state.squad,
  useUpdateClubFormation: () => state.updateFormation,
  useAssignClubSquad: () => state.assign,
}));
vi.mock('../../../../hooks', () => ({ usePlayers: () => state.players }));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }: {
    children: ReactNode;
    onDragStart?: (e: { active: { id: string } }) => void;
    onDragEnd?: (e: { active: { id: string }; over: { id: string } | null }) => void;
  }) => (
    <div>
      <button onClick={() => onDragStart?.({ active: { id: 'player-p1' } })}>drag-start-player</button>
      <button onClick={() => onDragStart?.({ active: { id: 'slot-s-0' } })}>drag-start-slot</button>
      <button onClick={() => onDragStart?.({ active: { id: 'nepoznat' } })}>drag-start-unknown</button>
      <button onClick={() => onDragEnd?.({ active: { id: 'player-p2' }, over: { id: 'slot-s-0' } })}>drag-end-slot</button>
      <button onClick={() => onDragEnd?.({ active: { id: 'player-p2' }, over: null })}>drag-end-none</button>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: ReactNode }) => <div data-testid="overlay">{children}</div>,
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
}));

vi.mock('../../../../components/admin/formation/FormationInputs', () => ({
  FormationInputs: ({ def, mid, fwd, onDef, onMid, onFwd, onApply, applying }: {
    def: string; mid: string; fwd: string;
    onDef: (v: string) => void; onMid: (v: string) => void; onFwd: (v: string) => void;
    onApply: () => void; applying?: boolean;
  }) => (
    <div>
      <span>formacija:{def}-{mid}-{fwd}</span>
      <input aria-label="def" value={def} onChange={(e) => onDef(e.target.value)} />
      <input aria-label="mid" value={mid} onChange={(e) => onMid(e.target.value)} />
      <input aria-label="fwd" value={fwd} onChange={(e) => onFwd(e.target.value)} />
      <button onClick={onApply} disabled={applying}>primijeni</button>
    </div>
  ),
}));

vi.mock('../../../../components/admin/formation/FormationEditablePitch', () => ({
  ResponsiveFormationEditablePitch: ({ slots, activeSlot, onSlotClick }: {
    slots: ClubSquadSlot[]; activeSlot: ClubSquadSlot | null; onSlotClick: (s: ClubSquadSlot) => void; pending?: boolean;
  }) => (
    <div>
      <span>aktivno:{activeSlot?.id ?? '-'}</span>
      {slots.filter((s) => !s.isBench).map((slot) => (
        <button key={slot.id} onClick={() => onSlotClick(slot)}>{`teren-${slot.id}`}</button>
      ))}
    </div>
  ),
}));

vi.mock('../../../../components/admin/formation/FormationSlotPanel', () => ({
  FormationSlotPanel: ({ slot, players, onPick, onRemove, onClose }: {
    slot: ClubSquadSlot; players: unknown[]; onPick: (id: string) => void; onRemove: () => void; onClose: () => void;
  }) => (
    <div data-testid="slot-panel">
      <span>slot:{slot.id} igrača:{players.length}</span>
      <button onClick={() => onPick('p2')}>izaberi-p2</button>
      <button onClick={onRemove}>ukloni</button>
      <button onClick={onClose}>zatvori</button>
    </div>
  ),
}));

vi.mock('../../../../components/admin/formation/FormationPlayerPool', () => ({
  FormationPlayerPool: ({ players }: { players: Array<{ id: string }> }) => (
    <span>pool:{players.map((p) => p.id).join(',')}</span>
  ),
}));

vi.mock('../../../../components/admin/formation/BenchDropRow', () => ({
  BenchDropRow: ({ slot, active, onSelect }: { slot: ClubSquadSlot; active: boolean; onSelect: () => void }) => (
    <button onClick={onSelect}>{`klupa-${slot.id}-${active ? 'aktivna' : 'neaktivna'}`}</button>
  ),
}));

const slot = (over: Partial<ClubSquadSlot>): ClubSquadSlot => ({ id: 's0', clubId: 'c1', slotIndex: 0, lineRole: 'GK', positionX: 0, positionY: 0, isBench: false, playerId: null, ...over,
});

const slots: ClubSquadSlot[] = [
  slot({ id: 's0', slotIndex: 0, playerId: 'p1', player: { id: 'p1', firstName: 'Amar', lastName: 'Agić' } as never }),
  slot({ id: 's1', slotIndex: 1, positionX: 50 }),
  slot({ id: 'b0', slotIndex: 0, isBench: true }),
];
const players = [
  { id: 'p1', firstName: 'Amar', lastName: 'Agić' },
  { id: 'p2', firstName: 'Boris', lastName: 'Borić' },
  { id: 'p3', firstName: 'Cvijet', lastName: 'Cvić' },
];

const renderTab = () => render(<ClubFormationTab clubId="c1" />);

beforeEach(() => {
  state.squad = { data: { formation: { def: 4, mid: 3, fwd: 3 }, slots }, isLoading: false };
  state.players = { data: players };
  state.updateFormation = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.assign = { mutateAsync: vi.fn(async () => ({})), isPending: false };
});

describe('ClubFormationTab', () => {
  it('dok se postava učitava prikazuje skeleton', () => {
    state.squad = { data: null, isLoading: true };
    renderTab();
    expect(screen.queryByText(/formacija:/)).toBeNull();
  });

  it('preuzima formaciju iz postave i primjenjuje izmjenu', async () => {
    const user = userEvent.setup();
    renderTab();
    expect(screen.getByText('formacija:4-3-3')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('def'));
    await user.type(screen.getByLabelText('def'), '3');
    await user.clear(screen.getByLabelText('mid'));
    await user.type(screen.getByLabelText('mid'), '5');
    await user.click(screen.getByRole('button', { name: 'primijeni' }));
    await waitFor(() => expect(state.updateFormation.mutateAsync).toHaveBeenCalledWith({ def: 3, mid: 5, fwd: 3 }));
  });

  it('klik na mjesto otvara panel i dodjela igrača šalje zamjenu', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'teren-s1' }));
    expect(screen.getByTestId('slot-panel')).toHaveTextContent('slot:s1');
    await user.click(screen.getByRole('button', { name: 'izaberi-p2' }));
    await waitFor(() => expect(state.assign.mutateAsync).toHaveBeenCalledWith([
      { slotIndex: 1, isBench: false, playerId: 'p2' },
    ]));
    await waitFor(() => expect(screen.queryByTestId('slot-panel')).toBeNull());
  });

  it('uklanjanje igrača šalje prazno mjesto, a zatvaranje samo skriva panel', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'teren-s0' }));
    await user.click(screen.getByRole('button', { name: 'ukloni' }));
    await waitFor(() => expect(state.assign.mutateAsync).toHaveBeenCalledWith([
      { slotIndex: 0, isBench: false, playerId: null },
    ]));
    await user.click(screen.getByRole('button', { name: 'teren-s1' }));
    await user.click(screen.getByRole('button', { name: 'zatvori' }));
    expect(screen.queryByTestId('slot-panel')).toBeNull();
  });

  it('pool prikazuje samo slobodne igrače, klupa aktivira svoj red', async () => {
    const user = userEvent.setup();
    renderTab();
    expect(screen.getByText('pool:p2,p3')).toBeInTheDocument();
    const bench = screen.getByRole('button', { name: 'klupa-b0-neaktivna' });
    await user.click(bench);
    expect(screen.getByTestId('slot-panel')).toHaveTextContent('slot:b0');
    expect(screen.getByRole('button', { name: 'klupa-b0-aktivna' })).toBeInTheDocument();
  });

  it('drag start prikazuje ime u overlay-u, a drag end dodjeljuje igrača', async () => {
    const user = userEvent.setup();
    renderTab();
    expect(screen.getByTestId('overlay')).toBeEmptyDOMElement();
    await user.click(screen.getByRole('button', { name: 'drag-start-player' }));
    expect(screen.getByTestId('overlay')).toHaveTextContent('Amar Agić');
    await user.click(screen.getByRole('button', { name: 'drag-end-slot' }));
    expect(screen.getByTestId('overlay')).toBeEmptyDOMElement();
    await waitFor(() => expect(state.assign.mutateAsync).toHaveBeenCalledWith([
      { slotIndex: 0, isBench: false, playerId: 'p2' },
    ]));
  });

  it('drag start sa mjesta koristi ime igrača, a spuštanje van mete ne šalje ništa', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'drag-start-slot' }));
    expect(screen.getByTestId('overlay')).toHaveTextContent('Amar Agić');
    await user.click(screen.getByRole('button', { name: 'drag-start-unknown' }));
    expect(screen.getByTestId('overlay')).toHaveTextContent('Amar Agić');
    await user.click(screen.getByRole('button', { name: 'drag-end-none' }));
    expect(screen.getByTestId('overlay')).toBeEmptyDOMElement();
    expect(state.assign.mutateAsync).not.toHaveBeenCalled();
  });
});
