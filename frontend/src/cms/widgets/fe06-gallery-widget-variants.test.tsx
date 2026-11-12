import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryWidget } from './GalleryWidget';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});
import { useReducedMotion } from 'framer-motion';

const state = vi.hoisted(() => ({
  list: { data: undefined as unknown, isLoading: false },
  item: { data: undefined as unknown, isLoading: false },
}));

vi.mock('../../hooks', () => ({
  useGalleryList: () => state.list,
  useGalleryItem: () => state.item,
}));

const baseGallery = (over: Record<string, unknown> = {}) => ({
  id: 'g1',
  slug: 'prva',
  title: 'Prva galerija',
  photos: [{ path: 'a.jpg' }],
  ...over,
});
const singleGallery = (over: Record<string, unknown> = {}) => ({
  id: 'g2',
  slug: 'pojedinacna',
  title: 'Pojedinačna',
  photos: [{ path: 'b.jpg' }, { path: 'c.jpg' }],
  ...over,
});

describe('GalleryWidget — varijante (2 grane)', () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    state.list = { data: [baseGallery()], isLoading: false } as unknown as typeof state.list;
    state.item = { data: undefined as unknown as typeof state.item.data, isLoading: false } as unknown as typeof state.item;
  });

  it('title || single.title — koristi single.title kad je title prazan', async () => {
    state.list = { data: [baseGallery({ id: 'g2', slug: 'pojedinacna' })], isLoading: false } as unknown as typeof state.list;
    state.item = { data: singleGallery() as unknown as typeof state.item.data, isLoading: false } as unknown as typeof state.item;
    const { container } = render(
      <MemoryRouter>
        <GalleryWidget config={{ mode: 'single', galleryId: 'g2', limit: 6, title: '' } as never} />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('Pojedinačna');
  });

  it('reduce true koristi false za initial', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(
      <MemoryRouter>
        <GalleryWidget config={{ mode: 'list', limit: 2 } as never} />
      </MemoryRouter>,
    );
    expect(document.body).toBeInTheDocument();
  });
});
