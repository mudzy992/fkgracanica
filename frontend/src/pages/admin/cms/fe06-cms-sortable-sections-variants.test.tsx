import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CmsSortableSections } from './CmsSortableSections';

vi.mock('@dnd-kit/core', async () => {
  const React = await import('react');
  return {
    DndContext: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    closestCenter: () => undefined,
    KeyboardSensor: class {},
    PointerSensor: class {},
    useSensor: (s: unknown) => s,
    useSensors: (...s: unknown[]) => s,
  };
});
vi.mock('@dnd-kit/sortable', async () => {
  const React = await import('react');
  return {
    SortableContext: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    sortableKeyboardCoordinates: () => undefined,
    verticalListSortingStrategy: () => undefined,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: () => undefined,
      transform: null,
      transition: undefined,
      isDragging: false,
    }),
  };
});
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => undefined } } }));
vi.mock('../../../cms/widgets/schemas', () => ({ widgetMeta: { known: { label: 'Poznati' } } }));

const section = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  widgetType: 'known',
  enabled: true,
  ...over,
});

describe('CmsSortableSections — varijante (3 grane)', () => {
  it('selected true koristi primary border/background', () => {
    render(
      <CmsSortableSections
        sections={[section('s1'), section('s2')] as never}
        selectedId="s1"
        onSelect={vi.fn()}
        onReorder={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    // selected s1 should have border-primary
    const rows = document.querySelectorAll('.border-primary');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('enabled false koristi muted pozadinu i translate-x-0.5', () => {
    render(
      <CmsSortableSections
        sections={[section('s1', { enabled: false }), section('s2', { enabled: true })] as never}
        selectedId={null}
        onSelect={vi.fn()}
        onReorder={vi.fn()}
        onDelete={vi.fn()}
        onToggleEnabled={vi.fn()}
      />,
    );
    const switches = screen.getAllByRole('switch');
    expect(switches[0].getAttribute('aria-checked')).toBe('false');
    expect(switches[1].getAttribute('aria-checked')).toBe('true');
    expect(switches[0].className).toContain('bg-[var(--border-subtle)]');
    expect(switches[1].className).toContain('bg-primary');
  });

  it('bez selectedId nema border-primary', () => {
    render(
      <CmsSortableSections
        sections={[section('s1')] as never}
        selectedId={null}
        onSelect={vi.fn()}
        onReorder={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(document.querySelectorAll('.border-primary').length).toBe(0);
  });
});
