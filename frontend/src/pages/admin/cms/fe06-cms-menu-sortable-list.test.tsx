import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsMenuSortableList } from './CmsMenuSortableList';
import type { MenuDraftItem } from './menu-utils';

const state = vi.hoisted(() => ({
  dragEnd: null as null | ((e: { active: { id: string }; over: { id: string } | null }) => void),
  blocked: {} as Record<string, { moduleLabel: string } | undefined>,
  changes: [] as MenuDraftItem[][],
}));

type DragEvent = { active: { id: string }; over: { id: string } | null };

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (e: DragEvent) => void }) => {
    state.dragEnd = onDragEnd ?? null;
    return <div>{children}</div>;
  },
  closestCenter: () => null,
  KeyboardSensor: class {},
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: (...sensors: unknown[]) => sensors,
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  sortableKeyboardCoordinates: () => ({}),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
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

const pages = [
  { id: 'pg1', title: 'Početna', slug: 'home' },
  { id: 'pg2', title: 'O nama', slug: 'o-nama' },
] as never[];

const renderList = (items: MenuDraftItem[], moduleFlags?: Record<string, string>) =>
  render(
    <MemoryRouter>
      <CmsMenuSortableList
        items={items}
        pages={pages}
        moduleFlags={moduleFlags}
        onChange={(next) => state.changes.push(next)}
      />
    </MemoryRouter>,
  );

const lastChange = () => state.changes[state.changes.length - 1];

beforeEach(() => {
  state.dragEnd = null;
  state.blocked = {};
  state.changes = [];
});

describe('CmsMenuSortableList — redovi', () => {
  it('sistemska stavka prikazuje oznaku, putanju i nema brisanje', () => {
    renderList([item({ isSystem: true })]);
    expect(screen.getByText('Sistemska')).toBeInTheDocument();
    expect(screen.getByText('/vijesti')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Obriši stavku' })).toBeNull();
    expect(screen.queryByPlaceholderText('admin.cmsMenu.label')).toBeNull();
  });

  it('obična stavka ima polja i brisanje bez ostalih', async () => {
    const user = userEvent.setup();
    renderList([item(), item({ id: 'm2', label: 'Galerija', path: '/galerija', sortOrder: 1 })]);
    expect(screen.getByDisplayValue('Vijesti')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Obriši stavku' })[0]);
    expect(lastChange().map((i) => i.id)).toEqual(['m2']);
  });

  it('prekidač mijenja samo enabled izabrane stavke', async () => {
    const user = userEvent.setup();
    renderList([item(), item({ id: 'm2', label: 'Galerija', path: '/galerija', sortOrder: 1 })]);
    await user.click(screen.getAllByRole('switch')[1]);
    expect(lastChange()).toMatchObject([
      { id: 'm1', enabled: true },
      { id: 'm2', enabled: false },
    ]);
  });

  it('izmjena naziva i putanje šalje patch za taj red', () => {
    renderList([item()]);
    fireEvent.change(screen.getByDisplayValue('Vijesti'), { target: { value: 'Novosti' } });
    expect(lastChange()[0].label).toBe('Novosti');
    fireEvent.change(screen.getByDisplayValue('/vijesti'), { target: { value: '/novosti' } });
    expect(lastChange()[0]).toMatchObject({ id: 'm1', path: '/novosti' });
  });

  it('izbor stranice usklađuje putanju sa slugom', () => {
    renderList([item()]);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pg1' } });
    expect(lastChange()[0]).toMatchObject({ pageId: 'pg1', path: '/' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pg2' } });
    expect(lastChange()[0]).toMatchObject({ pageId: 'pg2', path: '/p/o-nama' });
  });

  it('prazan izbor stranice zadržava postojeću putanju', () => {
    renderList([item({ pageId: 'pg2', path: '/p/o-nama' })]);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    expect(lastChange()[0]).toMatchObject({ pageId: undefined, path: '/p/o-nama' });
  });
});

describe('CmsMenuSortableList — upozorenje na isključen modul', () => {
  it('prikazuje upozorenje i link na postavke', () => {
    state.blocked = { m1: { moduleLabel: 'Vijesti' } };
    renderList([item()]);
    expect(screen.getByText('Modul off')).toBeInTheDocument();
    expect(screen.getByText(/modul „Vijesti”/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Otvori postavke' })).toHaveAttribute(
      'href',
      '/admin/settings',
    );
  });

  it('bez blokade nema upozorenja', () => {
    renderList([item()]);
    expect(screen.queryByText('Modul off')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Otvori postavke' })).toBeNull();
  });
});

describe('CmsMenuSortableList — promjena redoslijeda', () => {
  it('prevlačenje mijenja redoslijed i prenumeriše sortOrder', () => {
    renderList([item(), item({ id: 'm2', label: 'Galerija', sortOrder: 1 }), item({ id: 'm3', label: 'Kontakt', sortOrder: 2 })]);
    state.dragEnd?.({ active: { id: 'm3' }, over: { id: 'm1' } });
    expect(lastChange().map((i) => [i.id, i.sortOrder])).toEqual([
      ['m3', 0],
      ['m1', 1],
      ['m2', 2],
    ]);
  });

  it('spuštanje preko sebe, bez cilja ili na nepoznat id ne mijenja ništa', () => {
    renderList([item(), item({ id: 'm2', sortOrder: 1 })]);
    state.dragEnd?.({ active: { id: 'm1' }, over: { id: 'm1' } });
    state.dragEnd?.({ active: { id: 'm1' }, over: null });
    state.dragEnd?.({ active: { id: 'nepoznat' }, over: { id: 'm2' } });
    expect(state.changes).toHaveLength(0);
  });
});
