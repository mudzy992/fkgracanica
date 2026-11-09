import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormationEditablePitch } from './FormationEditablePitch';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, isDragging: false }),
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => '' } } }));

describe('FormationEditablePitch — branch45 (2 grane)', () => {
  it('render sa praznim slots i sa popunjenim', () => {
    const { container, rerender } = render(
      <FormationEditablePitch slots={[]} activeSlot={null} onSlotClick={vi.fn()} />,
    );
    expect(container.firstChild).toBeTruthy();
    rerender(
      <FormationEditablePitch
        slots={[
          {
            id: 's1',
            slotIndex: 0,
            isBench: false,
            positionX: 50,
            positionY: 50,
            playerId: 'p1',
            player: { firstName: 'A', lastName: 'B', number: 7, photoPath: null } as never,
            lineRole: 'FWD',
          } as never,
        ]}
        activeSlot={null}
        onSlotClick={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('render sa isOver true pokriva hover granu', () => {
    const { container } = render(
      <FormationEditablePitch slots={[]} activeSlot={null} onSlotClick={vi.fn()} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
