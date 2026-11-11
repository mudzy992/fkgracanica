import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: () => {},
  KeyboardSensor: {},
  PointerSensor: {},
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {}, transform: null, transition: null, isDragging: false }),
  verticalListSortingStrategy: {},
  sortableKeyboardCoordinates: () => {},
}));
vi.mock('@dnd-kit/utilities', () => ({ CSS: { Transform: { toString: () => '' } } }));
vi.mock('../../../components/ui/badge', () => ({ Badge: ({ children }: { children: unknown }) => <span>{children as never}</span> }));
vi.mock('../../../components/ui/button', () => ({ Button: ({ children }: { children: unknown }) => <button>{children as never}</button> }));
vi.mock('../../../components/ui/input', () => ({ Input: () => <input /> }));
vi.mock('../../../components/ui/switch', () => ({ Switch: () => <button>sw</button> }));
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react') as Record<string, unknown>;
  return Object.assign({}, actual, { AlertTriangle: () => null, GripVertical: () => null, Lock: () => null });
});
vi.mock('../../../lib/utils', () => ({ cn: (...a: unknown[]) => a.filter(Boolean).join(' ') }));

import { CmsMenuSortableList } from './cms/CmsMenuSortableList';
import { HeroSectionForm } from './cms/forms/HeroSectionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
vi.mock('../../../lib/api', () => ({ api: { get: vi.fn(async () => ({ data: [] })) } }));

function makeItems(enabled: boolean) {
  return [{ id: '1', label: 'A', path: '/', enabled, isSystem: false } as unknown as never];
}

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{c}</QueryClientProvider>;
}

describe('fe06-batch68e-admin', () => {
  it('CmsMenuSortableList pokriva !item.enabled oba kraka', () => {
    const { container: c1 } = render(<CmsMenuSortableList items={makeItems(true)} pages={[]} onChange={() => {}} />);
    expect(c1.querySelector('div.opacity-50')).toBeNull();
    const { container: c2 } = render(<CmsMenuSortableList items={makeItems(false)} pages={[]} onChange={() => {}} />);
    expect(c2.querySelector('div.opacity-50')).not.toBeNull();
  });

  it('HeroSectionForm pokriva hero.buttons ?? [] oba kraka', () => {
    const { container: c1 } = render(wrap(<HeroSectionForm config={{}} onChange={() => {}} />));
    expect(c1.textContent).toContain('Dugme');
    const { container: c2 } = render(wrap(<HeroSectionForm config={{ buttons: [{ label: 'L', url: '/', variant: 'primary' }] }} onChange={() => {}} />));
    expect(c2.textContent).toContain('L');
  });
});
