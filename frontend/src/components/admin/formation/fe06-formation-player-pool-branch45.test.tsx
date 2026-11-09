import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormationPlayerPool } from './FormationPlayerPool';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const mockUseDraggable = vi.fn();

vi.mock('@dnd-kit/core', () => ({
  useDraggable: (...args: unknown[]) => mockUseDraggable(...args),
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Translate: { toString: () => 'translate(10px, 20px)' } } }));

describe('FormationPlayerPool — branch45 (transform i isDragging)', () => {
  it('transform truthy i isDragging true pokriva style i ring', () => {
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: { x: 10, y: 20 },
      isDragging: true,
    });
    render(
      <FormationPlayerPool
        players={[{ id: 'p1', firstName: 'A', lastName: 'B', number: 7 } as never]}
      />,
    );
    const btn = screen.getByRole('button', { name: /7 A B/ });
    expect(btn.style.transform).toBe('translate(10px, 20px)');
    expect(btn.className).toContain('ring-2');
  });

  it('prazan niz i igrač bez broja pokriva fallbackove', () => {
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    });
    const { rerender } = render(<FormationPlayerPool players={[]} />);
    expect(screen.getByText('admin.formation.allAssigned')).toBeInTheDocument();
    rerender(
      <FormationPlayerPool players={[{ id: 'p2', firstName: 'C', lastName: 'D' } as never]} />,
    );
    expect(screen.getByText('C D')).toBeInTheDocument();
  });
});
