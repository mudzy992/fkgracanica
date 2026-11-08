import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TrophyFeaturedShowcase } from './TrophyFeaturedShowcase';

vi.mock('../RichContent', () => ({
  RichContent: ({ html }: { html: string }) => <div data-testid="rich">{html}</div>,
}));

const trophy = (over: Record<string, unknown> = {}) => ({
  id: 't1',
  year: 2024,
  name: 'Kup BiH',
  competition: 'Kup',
  imagePath: null as string | null,
  description: null as string | null,
  ...over,
});

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('TrophyFeaturedShowcase — varijante (3 grane compact)', () => {
  it('compact false sa slikom koristi original i max-h-72', () => {
    const { container } = wrap(
      <TrophyFeaturedShowcase trophy={trophy({ imagePath: 'tr/1.png' }) as never} />,
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('tr/1.png');
    expect(img.className).toContain('max-h-72');
  });

  it('compact true bez slike koristi mali krug h-36', () => {
    const { container } = wrap(
      <TrophyFeaturedShowcase trophy={trophy() as never} compact />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('2024');
    // compact true uses h-36 w-36
    expect(container.querySelector('.h-36')).not.toBeNull();
  });

  it('compact false bez slike koristi veliki krug h-52', () => {
    const { container } = wrap(
      <TrophyFeaturedShowcase trophy={trophy() as never} />,
    );
    expect(container.querySelector('.h-52')).not.toBeNull();
  });
});
