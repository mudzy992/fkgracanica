import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FormationEditablePitch } from './FormationEditablePitch';

const dndState = vi.hoisted(() => ({
  isOver: false as boolean,
  transform: null as unknown as { x: number; y: number } | null,
  isDragging: false as boolean,
}));

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: dndState.isOver }),
  useDraggable: () => ({
    attributes: {},
    listeners: { onKeyDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: dndState.transform,
    isDragging: dndState.isDragging,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: (t: unknown) => (t ? 'translate(10px, 20px)' : '') } } }));

vi.mock('../../../lib/media', () => ({ mediaUrl: (p: string) => p }));

vi.mock('../../../lib/pitch-coords', () => ({
  mapPitchPosition: (x: number, y: number) => ({ left: x, top: y }),
}));

vi.mock('../../public/clubs/PitchMarkings', () => ({ PitchMarkings: () => <div data-testid="pitch" /> }));

describe('FormationEditablePitch — branch49 (preostale grane transform, isDragging, empty playerId, horizontal, pending)', () => {
  beforeEach(() => {
    dndState.isOver = false;
    dndState.transform = null;
    dndState.isDragging = false;
  });

  it('slot bez playerId pokriva ?? i cond grane', () => {
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's0',
            slotIndex: 0,
            isBench: false,
            positionX: 50,
            positionY: 50,
            playerId: null as unknown as string,
            player: null as never,
            lineRole: 'GK',
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    // bez playerId nema cursor-grab
    expect(btn.className).not.toMatch(/cursor-grab/);
    // bez player nema ring? isOver false i active false
    expect(btn.className).not.toMatch(/ring-yellow/);
    // fallback "?" za nepoznat lineRole? GK je poznat, ali testira drugi slot sa UNKNOWN
  });

  it('drag.transform truthy pokriva branch line34', () => {
    dndState.transform = { x: 10, y: 20 } as never;
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's1',
            slotIndex: 1,
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
    expect(btn.style.transform).toBe('translate(10px, 20px)');
  });

  it('drag.isDragging true pokriva opacity-50', () => {
    dndState.isDragging = true;
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's2',
            slotIndex: 2,
            isBench: false,
            positionX: 30,
            positionY: 40,
            playerId: 'p2',
            player: { firstName: 'C', lastName: 'D', number: 10, photoPath: 'a.jpg' } as never,
            lineRole: 'MID',
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.className).toMatch(/opacity-50/);
  });

  it('horizontal false i pending true pokrivaju aspect i opacity', () => {
    const { container } = render(
      <FormationEditablePitch
        slots={[
          {
            id: 's3',
            slotIndex: 3,
            isBench: false,
            positionX: undefined as unknown as number,
            positionY: undefined as unknown as number,
            playerId: 'p3',
            player: { firstName: 'E', lastName: 'F', number: null, photoPath: null } as never,
            lineRole: 'UNKNOWN' as never,
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
        horizontal={false}
        pending={true}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/aspect-\[3\/4\]/);
    expect(wrapper.className).toMatch(/opacity-70/);
    const btn = container.querySelector('button') as HTMLButtonElement;
    // positionX/Y undefined fallback 50
    expect(btn.style.left).toBe('50%');
    expect(btn.style.top).toBe('50%');
    // fallback "?" za UNKNOWN lineRole i number null
    expect(btn.textContent).toMatch(/\?/);
  });

  it('horizontal true default vs explicit false za pitch markings', () => {
    const { container: c1 } = render(
      <FormationEditablePitch
        slots={[]}
        activeSlot={null}
        onSlotClick={vi.fn()}
        horizontal={true}
      />,
    );
    expect(c1.firstChild).not.toBeNull();
    const { container: c2 } = render(
      <FormationEditablePitch slots={[]} activeSlot={null} onSlotClick={vi.fn()} horizontal={false} />,
    );
    expect(c2.firstChild).not.toBeNull();
  });
});
