import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FormationEditablePitch } from './FormationEditablePitch';

const dndState = vi.hoisted(() => ({ isOver: false as boolean }));

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: dndState.isOver }),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => '' } } }));

vi.mock('../../../lib/media', () => ({ mediaUrl: (p: string) => p }));

vi.mock('../../../lib/pitch-coords', () => ({
  mapPitchPosition: (x: number, y: number) => ({ left: x, top: y }),
}));

vi.mock('../../public/clubs/PitchMarkings', () => ({ PitchMarkings: () => <div data-testid="pitch" /> }));

describe('FormationEditablePitch — branch48 (isOver + fallback ?)', () => {
  beforeEach(() => {
    dndState.isOver = false;
  });

  it('bez ringa kada isOver false i active null (bid2 else)', () => {
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's1',
            slotIndex: 0,
            isBench: false,
            positionX: 50,
            positionY: 50,
            playerId: 'p1',
            player: { firstName: 'A', lastName: 'B', number: 9, photoPath: null } as never,
            lineRole: 'FWD',
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.className).not.toMatch(/ring-yellow-300/);
  });

  it('sa isOver true pokriva bid2 [0,14] ring-2', () => {
    dndState.isOver = true;
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's1',
            slotIndex: 0,
            isBench: false,
            positionX: 10,
            positionY: 20,
            playerId: 'p1',
            player: { firstName: 'A', lastName: 'B', number: 9, photoPath: null } as never,
            lineRole: 'FWD',
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toMatch(/ring-yellow-300/);
  });

  it('activeSlot true također daje ring (isOver false ali active true)', () => {
    dndState.isOver = false;
    const slot = {
      id: 's2',
      slotIndex: 2,
      isBench: false,
      positionX: 30,
      positionY: 40,
      playerId: 'p2',
      player: { firstName: 'C', lastName: 'D', number: 10, photoPath: 'photo.jpg' } as never,
      lineRole: 'MID',
    } as never;
    const { container } = render(
      <FormationEditablePitch slots={[slot]} activeSlot={{ slotIndex: 2, isBench: false } as never} onSlotClick={vi.fn()} />,
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toMatch(/ring-yellow-300/);
  });

  it('fallback "?" kada je number null i lineRole nepoznat (bid6 [14,0])', () => {
    dndState.isOver = false;
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's3',
            slotIndex: 3,
            isBench: false,
            positionX: undefined,
            positionY: undefined,
            playerId: 'p3',
            player: { firstName: 'X', lastName: 'Y', number: null, photoPath: null } as never,
            lineRole: 'UNKNOWN',
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    // fallback "?" se prikazuje unutar drugog div-a
    expect(container.textContent).toMatch(/\?/);
    // pozicije su mapirane na 50,50 (fallback ??50 u mapPitchPosition)
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.style.left).toBe('50%');
    expect(btn.style.top).toBe('50%');
  });

  it('sa photoPath prikazuje img', () => {
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's4',
            slotIndex: 4,
            isBench: false,
            positionX: 60,
            positionY: 70,
            playerId: 'p4',
            player: { firstName: 'M', lastName: 'N', number: 5, photoPath: 'path.jpg' } as never,
            lineRole: 'DEF',
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    expect(container.querySelector('img')).not.toBeNull();
  });
});
