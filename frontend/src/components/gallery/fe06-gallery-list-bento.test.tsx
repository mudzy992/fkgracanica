import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GalleryListBento, GalleryListBentoSkeleton } from './GalleryListBento';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const gallery = (over: Record<string, unknown> = {}) => ({
  id: 'g1',
  title: 'Derbi u Gračanici',
  slug: 'derbi-u-gracanici',
  photos: [],
  ...over,
});

describe('GalleryListBento', () => {
  it('kartica bez fotografija prikazuje naslov u praznom polju', () => {
    const { container } = wrap(<GalleryListBento items={[gallery() as never]} />);
    expect(screen.getAllByText('Derbi u Gračanici')).toHaveLength(2);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('kartica sa fotografijama prikazuje sliku, broj i link', () => {
    const { container } = wrap(
      <GalleryListBento
        items={[gallery({ photos: [{ path: 'gal/1.jpg' }, { path: 'gal/2.jpg' }] }) as never]}
      />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toContain('gal');
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/galerija/derbi-u-gracanici');
  });

  it('više galerija dobija različite spanove', () => {
    const { container } = wrap(
      <GalleryListBento
        items={[
          gallery({ id: 'a', title: 'A', slug: 'a' }) as never,
          gallery({ id: 'b', title: 'B', slug: 'b' }) as never,
        ]}
      />,
    );
    const spans = [...container.querySelectorAll('div.grid > div')].map((d) => d.className);
    expect(spans[0]).toContain('col-span-2');
    expect(spans[1]).toContain('col-span-1');
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('prazna lista daje praznu mrežu', () => {
    const { container } = wrap(<GalleryListBento items={[]} />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.querySelector('div.grid')).not.toBeNull();
  });
});

describe('GalleryListBentoSkeleton', () => {
  it('podrazumijevano prikazuje šest kostura', () => {
    const { container } = render(<GalleryListBentoSkeleton />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6);
  });

  it('broj kostura se može zadati', () => {
    const { container } = render(<GalleryListBentoSkeleton count={2} />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2);
  });
});
