import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormationEditablePitch } from './formation/FormationEditablePitch';
import type { ClubSquadSlot } from '../../types/club-hub';
import type { Player } from '../../types';

vi.mock('@dnd-kit/core', () => ({
  useDraggable: ({ id }: { id: string }) => ({
    setNodeRef: vi.fn(),
    listeners: { onPointerDown: vi.fn() },
    attributes: { role: 'button', 'data-drag': id },
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => '' }, Transform: { toString: () => '' } } }));
vi.mock('../../../lib/media', () => ({ mediaUrl: (p: string) => p }));
vi.mock('../../../lib/player-utils', () => ({ POSITION_LABELS: { DEF: 'Odbrana' } }));

const player = (over: Partial<Player> = {}): Player =>
  ({ id: 'p1', firstName: 'Amar', lastName: 'Hodžić', number: 10, position: 'DEF', photoPath: null, ...over }) as Player;

const slot = (over: Partial<ClubSquadSlot> = {}): ClubSquadSlot =>
  ({
    id: 's1',
    clubId: 'c1',
    slotIndex: 0,
    isBench: false,
    lineRole: 'DEF',
    positionX: 50,
    positionY: 50,
    playerId: null,
    player: null,
    ...over,
  }) as ClubSquadSlot;

/** Batch 35 — pokriva 4 grane: fallback pozicija, cursor-grab, prazan slot drag atributi */
describe('FormationEditablePitch — grane (batch 35)', () => {
  it('slot bez koordinata koristi 50 kao fallback', () => {
    render(
      <FormationEditablePitch
        slots={[slot({ positionX: null as unknown as number, positionY: undefined as unknown as number, playerId: 'p1', player: player() })]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    expect(screen.getByText('A. Hodžić')).toBeTruthy();
  });

  it('slot bez igrača nema cursor-grab', () => {
    render(<FormationEditablePitch slots={[slot()]} activeSlot={null} onSlotClick={vi.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn.className).not.toContain('cursor-grab');
  });

  it('slot sa igračem ima cursor-grab i drag atribute', () => {
    render(
      <FormationEditablePitch
        slots={[slot({ playerId: 'p1', player: player() })]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('cursor-grab');
    expect(btn.getAttribute('data-drag')).toBeTruthy();
  });
});
