import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsSortableSections } from './CmsSortableSections';

const state = vi.hoisted(() => ({
  drag: null as null | ((event: unknown) => void),
  selected: [] as string[],
  deleted: [] as string[],
  reordered: [] as string[][],
  toggled: [] as Array<[string, boolean]>,
}));

vi.mock('@dnd-kit/core', async () => {
  const React = await import('react');
  return {
    DndContext: ({ children, onDragEnd }: {
      children: React.ReactNode; onDragEnd: (event: unknown) => void;
    }) => {
      state.drag = onDragEnd;
      return React.createElement('div', null, children);
    },
    closestCenter: () => undefined,
    KeyboardSensor: class {},
    PointerSensor: class {},
    useSensor: (sensor: unknown) => sensor,
    useSensors: (...sensors: unknown[]) => sensors,
  };
});
vi.mock('@dnd-kit/sortable', async () => {
  const React = await import('react');
  return {
    SortableContext: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    sortableKeyboardCoordinates: () => undefined,
    verticalListSortingStrategy: () => undefined,
    useSortable: ({ id }: { id: string }) => ({
      attributes: { 'data-drag': id },
      listeners: { onPointerDown: () => undefined },
      setNodeRef: () => undefined,
      transform: null,
      transition: undefined,
      isDragging: id === 's2',
    }),
  };
});
vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));
vi.mock('../../../cms/widgets/schemas', () => ({
  widgetMeta: { known: { label: 'Poznati widget' } },
}));

const section = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  widgetType: 'known',
  enabled: true,
  ...over,
});

const renderSections = (over: Record<string, unknown> = {}) =>
  render(
    <CmsSortableSections
      sections={[section('s1'), section('s2'), section('s3', { widgetType: 'custom' })] as never}
      selectedId={null}
      onSelect={(s: { id: string }) => state.selected.push(s.id)}
      onReorder={(ids: string[]) => state.reordered.push(ids)}
      onDelete={(id: string) => state.deleted.push(id)}
      {...(over as object)}
    />,
  );

const drag = (event: unknown) => act(() => state.drag?.(event));

beforeEach(() => {
  state.drag = null;
  state.selected = [];
  state.deleted = [];
  state.reordered = [];
  state.toggled = [];
});

describe('CmsSortableSections — prikaz', () => {
  it('prikazuje redne brojeve, oznake tipa i dugmad za brisanje', () => {
    renderSections();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getAllByText('Poznati widget')).toHaveLength(2);
    expect(screen.getByText('custom')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Obriši' })).toHaveLength(3);
  });

  it('izabire sekciju klikom na red i brise klikom na dugme', async () => {
    const user = userEvent.setup();
    renderSections();
    await user.click(screen.getByText('#2'));
    await user.click(screen.getAllByRole('button', { name: 'Obriši' })[0]);
    expect(state.selected).toEqual(['s2']);
    expect(state.deleted).toEqual(['s1']);
  });

  it('bez onToggleEnabled nema prekidača', () => {
    renderSections();
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
  });

  it('prekidač prikazuje stanje i mijenja ga', async () => {
    const user = userEvent.setup();
    renderSections({ onToggleEnabled: (id: string, enabled: boolean) => state.toggled.push([id, enabled]) });
    const switches = screen.getAllByRole('switch');
    expect(switches.map((s) => s.getAttribute('aria-checked'))).toEqual(['true', 'true', 'true']);
    await user.click(switches[1]);
    expect(state.toggled).toEqual([['s2', false]]);
  });
});

describe('CmsSortableSections — promjena reda', () => {
  it('pomjera sekciju na novo mjesto', () => {
    renderSections();
    drag({ active: { id: 's1' }, over: { id: 's3' } });
    expect(state.reordered).toEqual([['s2', 's3', 's1']]);
  });

  it('ignoriše spuštanje bez cilja ili na isto mjesto', () => {
    renderSections();
    drag({ active: { id: 's1' }, over: null });
    drag({ active: { id: 's2' }, over: { id: 's2' } });
    expect(state.reordered).toEqual([]);
  });

  it('ignoriše nepoznate id-eve', () => {
    renderSections();
    drag({ active: { id: 'x' }, over: { id: 's3' } });
    drag({ active: { id: 's1' }, over: { id: 'y' } });
    expect(state.reordered).toEqual([]);
  });

  it('prazna lista nema redova', () => {
    renderSections({ sections: [] });
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
