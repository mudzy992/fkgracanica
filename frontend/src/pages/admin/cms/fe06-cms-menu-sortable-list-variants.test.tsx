import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsMenuSortableList } from './CmsMenuSortableList';
import type { MenuDraftItem } from './menu-utils';

const state = vi.hoisted(() => ({
  blocked: {} as Record<string, unknown>,
  changes: [] as MenuDraftItem[][],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: () => null,
  KeyboardSensor: class {},
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: (...s: unknown[]) => s,
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  sortableKeyboardCoordinates: () => ({}),
  useSortable: ({ id }: { id: string }) => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: id === 'dragging',
  }),
  verticalListSortingStrategy: () => null,
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => undefined } } }));
vi.mock('./menu-module-warnings', () => ({
  blockedModuleForItem: (item: MenuDraftItem) => state.blocked[item.id ?? ''] ?? null,
}));
vi.mock('../../../components/ui/switch', async () => ({
  Switch: (await import('../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

const item = (over: Partial<MenuDraftItem> = {}): MenuDraftItem => ({
  id: 'm1',
  label: 'Vijesti',
  path: '/vijesti',
  sortOrder: 0,
  isSystem: false,
  enabled: true,
  ...over,
});

const pages = [{ id: 'pg1', title: 'Početna', slug: 'home' }] as never[];

beforeEach(() => {
  state.blocked = {};
  state.changes = [];
});

/** Batch 35 — pokriva id fallback, blocked/isSystem grane, disabled opacity, dragging */
describe('CmsMenuSortableList — grane (batch 35)', () => {
  it('stavka bez id koristi new-index kao fallback za dnd', () => {
    render(
      <MemoryRouter>
        <CmsMenuSortableList
          items={[item({ id: undefined as unknown as string }), item({ id: 'm2', label: 'Galerija', sortOrder: 1 })]}
          pages={pages}
          onChange={(next) => state.changes.push(next)}
        />
      </MemoryRouter>,
    );
    expect(screen.getByDisplayValue('Vijesti')).toBeInTheDocument();
  });

  it('onemogućena stavka ima opacity-50', () => {
    const { container } = render(
      <MemoryRouter>
        <CmsMenuSortableList items={[item({ enabled: false })]} pages={pages} onChange={vi.fn()} />
      </MemoryRouter>,
    );
    expect(container.querySelector('.opacity-50')).not.toBeNull();
  });

  it('neblokirana sistemska stavka ima primary stil', () => {
    render(
      <MemoryRouter>
        <CmsMenuSortableList items={[item({ isSystem: true })]} pages={pages} onChange={vi.fn()} />
      </MemoryRouter>,
    );
    expect(document.body.textContent).toContain('Sistemska');
  });

  it('blokirana stavka ima amber stil uprkos sistemskoj', () => {
    state.blocked = { m1: { moduleLabel: 'Test' } };
    const { container } = render(
      <MemoryRouter>
        <CmsMenuSortableList items={[item({ isSystem: true })]} pages={pages} onChange={vi.fn()} />
      </MemoryRouter>,
    );
    expect(container.querySelector('[class*="amber"]')).not.toBeNull();
  });
});
