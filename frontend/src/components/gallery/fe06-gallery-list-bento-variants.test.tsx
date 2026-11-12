import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { GalleryListBento } from './GalleryListBento';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});
import { useReducedMotion } from 'framer-motion';

const item = (over: Record<string, unknown> = {}) => ({
  id: 'g1',
  slug: 'prva',
  title: 'Prva',
  photos: [{ path: 'a.jpg' }],
  status: 'published',
  ...over,
}) as never;

describe('GalleryListBento — varijante (2 grane)', () => {
  it('count fallback 0 i reduce true', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(
      <MemoryRouter>
        <GalleryListBento items={[item({ photos: null as unknown as [] }), item({ id: 'g2', slug: 'druga', photos: [] })]} />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('Prva');
  });

  it('sa fotografijama prikazuje count i sliku, reduce false', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(
      <MemoryRouter>
        <GalleryListBento items={[item()]} />
      </MemoryRouter>,
    );
    expect(container.querySelector('img')).toBeTruthy();
    expect(container.textContent).toContain('1');
  });
});
