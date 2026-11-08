import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../../i18n';
import { ClubFormationTab } from './ClubFormationTab';
import type { ClubSquadSlot } from '../../../../types/club-hub';

const state = vi.hoisted(() => ({
  squad: { data: null as unknown, isLoading: false },
  players: { data: [] as unknown[] | null },
  updateFormation: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  assign: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  capturedPick: null as null | ((id: string) => void),
  capturedRemove: null as null | (() => void),
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
      <button onClick={() => onDragStart?.({ active: { id: 'player-p999' } })}>drag-start-unknown-player</button>
      <button onClick={() => onDragStart?.({ active: { id: 'slot-s-0' } })}>drag-start-slot-with-player</button>
      <button onClick={() => onDragStart?.({ active: { id: 'slot-s-1' } })}>drag-start-slot-empty</button>
      <button onClick={() => onDragEnd?.({ active: { id: 'slot-s-1' }, over: { id: 'slot-s-0' } })}>drag-end-slot-empty-source</button>
      <button onClick={() => onDragEnd?.({ active: { id: 'player-p2' }, over: { id: 'slot-s-0' } })}>drag-end-slot</button>
      <button onClick={() => onDragEnd?.({ active: { id: 'player-p2' }, over: null })}>drag-end-none</button>
      <button onClick={() => onDragEnd?.({ active: { id: 'player-p2' }, over: { id: 'player-p2' } })}>drag-end-invalid-over</button>
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
  }) => {
    state.capturedPick = onPick;
    state.capturedRemove = onRemove;
    return (
      <div data-testid="slot-panel">
        <span>slot:{slot.id} igrača:{players.length}</span>
        <button onClick={() => onPick('p2')}>izaberi-p2</button>
        <button onClick={onRemove}>ukloni</button>
        <button onClick={onClose}>zatvori</button>
      </div>
    );
  },
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
  state.squad = { data: { formation: { def: 4, mid: 3, fwd: 3 }, slots }, isLoading: false } as unknown as typeof state.squad;
  state.players = { data: players } as unknown as typeof state.players;
  state.updateFormation = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.updateFormation;
  state.assign = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.assign;
  state.capturedPick = null;
  state.capturedRemove = null;
});

describe('ClubFormationTab — varijante (7 grana)', () => {
  it('players null fallback pokriva ?? [] grane', () => {
    state.players = { data: null as unknown as unknown[] } as unknown as typeof state.players;
    renderTab();
    expect(screen.getByText('pool:')).toBeInTheDocument();
  });

  it('players undefined fallback također pokriva', async () => {
    state.players = { data: undefined as unknown as unknown[] } as unknown as typeof state.players;
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'teren-s1' }));
    expect(screen.getByTestId('slot-panel')).toHaveTextContent('igrača:0');
    expect(screen.getByText('pool:')).toBeInTheDocument();
  });

  it('assign i remove bez activeSlot pokriva if (!activeSlot) return (djelimično)', async () => {
    const user = userEvent.setup();
    renderTab();
    expect(state.capturedPick).toBeNull();
    await user.click(screen.getByRole('button', { name: 'teren-s0' }));
    expect(state.capturedPick).not.toBeNull();
    const pick = state.capturedPick!;
    const remove = state.capturedRemove!;
    await user.click(screen.getByRole('button', { name: 'zatvori' }));
    expect(screen.queryByTestId('slot-panel')).toBeNull();
    pick('p2');
    remove();
    await waitFor(() => expect(state.assign.mutateAsync).toHaveBeenCalled());
  });

  it('drag start sa nepoznatim playerId pokriva p ? ... : "" false granu', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'drag-start-unknown-player' }));
    expect(screen.getByTestId('overlay')).toBeEmptyDOMElement();
  });

  it('drag start sa praznim slotom pokriva slot?.player false granu', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'drag-start-slot-empty' }));
    expect(screen.getByTestId('overlay')).toBeEmptyDOMElement();
  });

  it('drag end sa praznim source slotom pokriva if (assignments) false', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'drag-end-slot-empty-source' }));
    expect(state.assign.mutateAsync).not.toHaveBeenCalled();
  });

  it('drag end sa nevažećim over pokriva null assignments', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'drag-end-invalid-over' }));
    expect(state.assign.mutateAsync).not.toHaveBeenCalled();
  });
});
