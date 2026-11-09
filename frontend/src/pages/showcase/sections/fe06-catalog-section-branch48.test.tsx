import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogSection } from './CatalogSection';

vi.mock('../../../lib/motion/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: unknown }) => <div>{children as never}</div>,
}));

vi.mock('../StatusBadge', () => ({
  StatusBadge: ({ badge }: { badge: string }) => <span data-testid="badge">{badge}</span>,
}));

vi.mock('./SectionVisual', () => ({
  SectionVisual: ({ id }: { id: string }) => {
    if (id === 'unknown') return null;
    if (id === 'empty') return null;
    return <div data-testid="visual">{id}</div>;
  },
}));

vi.mock('./SectionIntro', () => ({
  SectionIntro: ({ title }: { title: string }) => <div data-testid="intro">{title}</div>,
}));

describe('CatalogSection — branch48 (2 grane visual)', () => {
  const sectionBase = (over: Record<string, unknown> = {}) =>
    ({
      id: 'identity',
      title: 'Test Section',
      body: 'Body text',
      bullets: ['a', 'b'],
      moduleIds: ['m1'],
      ...over,
    }) as never;

  const modules = [
    { id: 'm1', title: 'Mod A', badge: 'new', percent: 40 },
    { id: 'm2', title: 'Mod B', badge: 'beta', percent: 20 },
  ] as never;

  it('sa poznatim id ima visual i lg:col-span false (bid1 else)', () => {
    const { container } = render(<CatalogSection section={sectionBase({ id: 'identity' })} modules={modules} index={1} />);
    expect(screen.getByTestId('visual')).toBeInTheDocument();
    expect(screen.getByTestId('intro')).toBeInTheDocument();
    expect(screen.getAllByText('Mod A')).toHaveLength(1);
    expect(container.querySelector('.lg\\:col-span-2')).toBeNull();
    // bullets
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('sa nepoznatim id visual je i dalje JSX element (dead guarda) — nema lg:col-span-2', () => {
    const { container } = render(<CatalogSection section={sectionBase({ id: 'unknown', moduleIds: [] })} modules={[]} index={2} />);
    // SectionVisual vraća null ali <SectionVisual/> JSX je uvijek truthy, pa visual nikad nije falsy
    expect(container.querySelector('.lg\\:col-span-2')).toBeNull();
    // related empty -> ne prikazuje flex-wrap
    expect(container.querySelector('.flex-wrap')).toBeNull();
  });

  it('bez bullets i related', () => {
    const sect = sectionBase({ id: 'empty', bullets: undefined, moduleIds: undefined }) as never;
    const { container } = render(<CatalogSection section={sect} modules={[]} index={3} />);
    expect(container.querySelector('ul')).toBeNull();
    expect(screen.queryByTestId('visual')).toBeNull();
  });

  it('sa bullets ali bez related', () => {
    const sect = sectionBase({ id: 'identity', bullets: ['x'], moduleIds: ['nonexistent'] }) as never;
    render(<CatalogSection section={sect} modules={modules} index={4} />);
    expect(screen.getByText('x')).toBeInTheDocument();
    expect(screen.queryByTestId('badge')).toBeNull();
  });
});
