import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

let isDragging = false;
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, isDragging }),
}));

import { BenchDropRow } from './formation/BenchDropRow';

describe('batch63 bench', () => {
  it('isDragging false', async () => {
    isDragging = false;
    const slot: any = { id: 's1', playerId: 'p1', player: { id: 'p1', firstName: 'A', lastName: 'B' }, benchOrder: 0, slotIndex: 0 };
    const { container } = render(<BenchDropRow slot={slot} active={false} onSelect={vi.fn()} />);
    expect(container.textContent).toContain('A');
  });

  it('isDragging true covers && branch', async () => {
    isDragging = true;
    const slot: any = { id: 's1', playerId: 'p1', player: { id: 'p1', firstName: 'A', lastName: 'B' }, benchOrder: 0, slotIndex: 0 };
    const { container } = render(<BenchDropRow slot={slot} active={false} onSelect={vi.fn()} />);
    expect(container.firstChild).toBeDefined();
    // class should contain opacity-50
    expect((container.firstChild as HTMLElement).className).toContain('opacity-50');
  });
});
