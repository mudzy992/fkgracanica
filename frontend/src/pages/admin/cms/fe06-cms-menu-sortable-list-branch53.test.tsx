import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CmsMenuSortableList } from './CmsMenuSortableList';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('./menu-module-warnings', () => ({ blockedModuleForItem: vi.fn(() => null) }));
vi.mock('@dnd-kit/core', () => ({ DndContext: ({ children }: any) => <div>{children}</div>, closestCenter: vi.fn(), KeyboardSensor: vi.fn(), PointerSensor: vi.fn(), useSensor: vi.fn(), useSensors: vi.fn(() => []) }));
vi.mock('@dnd-kit/sortable', () => ({ SortableContext: ({ children }: any) => <div>{children}</div>, sortableKeyboardCoordinates: vi.fn(), useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: false }), verticalListSortingStrategy: {} }));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }));

function wrap(ui: React.ReactNode) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}

describe('fe06 CmsMenuSortableList branch53', () => {
  it('item.id ?? new-index fallback', () => {
    const items = [{ id: undefined, label: 'Test', enabled: true, isSystem: false } as never];
    render(wrap(<CmsMenuSortableList items={items} pages={[]} onChange={vi.fn()} />));
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });
  it('blocked true → warning branch', async () => {
    const { blockedModuleForItem } = await import('./menu-module-warnings');
    (blockedModuleForItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ moduleLabel: 'CMS' });
    const items = [{ id: '1', label: 'Test', enabled: true, isSystem: true } as never];
    render(wrap(<CmsMenuSortableList items={items} pages={[]} onChange={vi.fn()} moduleFlags={{}} />));
    expect(screen.getByText(/Modul off/)).toBeInTheDocument();
  });
  it('item.enabled false → opacity branch', () => {
    const items = [{ id: '1', label: 'Test', enabled: false, isSystem: false } as never];
    render(wrap(<CmsMenuSortableList items={items} pages={[]} onChange={vi.fn()} />));
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });
});
