import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryWidget } from './GalleryWidget';

const state = vi.hoisted(() => ({
  list: { data: undefined as unknown, isLoading: false },
  single: { data: undefined as unknown, isLoading: false },
  singleSlug: '' as string | undefined,
  grid: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useGalleryList: () => state.list,
  useGalleryItem: (slug: string) => {
    state.singleSlug = slug;
    return state.single;
  },
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));
vi.mock('../../components/public/PhotoGridWithLightbox', () => ({
  PhotoGridWithLightbox: (props: Record<string, unknown>) => {
    state.grid = props;
    return <div>mreza:{(props.photos as unknown[]).length}:{String(props.columns)}</div>;
  },
}));

const photo = (path: string) => ({ id: `p-${path}`, path });
const gallery = (over: Record<string, unknown> = {}) => ({
  id: 'g1',
  slug: 'derbi-2026',
  title: 'Derbi 2026',
  photos: [photo('mediji/a.jpg')],
  ...over,
});

const renderWidget = (config: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <GalleryWidget config={{ limit: 4, ...config } as never} />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.list = { data: [gallery(), gallery({ id: 'g2', slug: 'trening', title: 'Trening', photos: [] })], isLoading: false };
  state.single = { data: undefined, isLoading: false };
  state.singleSlug = '';
  state.grid = {};
});

describe('GalleryWidget — lista galerija', () => {
  it('prikazuje naslov, link i sve galerije', () => {
    renderWidget();
    expect(screen.getByRole('heading', { name: 'home.gallery' })).toBeInTheDocument();
    expect(screen.getByText('home.gallerySubtitle')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Derbi 2026/ })).toHaveAttribute('href', '/galerija/derbi-2026');
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/galerija');
  });

  it('galerija bez fotografija prikazuje naslov kao podlogu', () => {
    renderWidget();
    expect(screen.getAllByText('Trening').length).toBeGreaterThanOrEqual(1);
  });

  it('koristi config naslov i viewAllUrl', () => {
    renderWidget({ title: 'Foto arhiv', viewAllUrl: '/foto' });
    expect(screen.getByRole('heading', { name: 'Foto arhiv' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/foto');
  });

  it('ograničava broj galerija prema limitu', () => {
    state.list = {
      data: [gallery(), gallery({ id: 'g2', title: 'Druga' }), gallery({ id: 'g3', title: 'Treća' })],
      isLoading: false,
    };
    renderWidget({ limit: 2 });
    expect(screen.queryByText('Treća')).toBeNull();
  });

  it('dok se lista učitava prikazuje skeletone prema limitu', () => {
    state.list = { data: undefined, isLoading: true };
    renderWidget({ limit: 3 });
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
    expect(screen.queryByText('Derbi 2026')).toBeNull();
  });
});

describe('GalleryWidget — jedna galerija', () => {
  it('sa fotografijama prikazuje mrežu i link na galeriju', () => {
    state.single = {
      data: { id: 'g1', slug: 'derbi-2026', title: 'Derbi 2026', photos: [photo('a.jpg'), photo('b.jpg')] },
      isLoading: false,
    };
    renderWidget({ mode: 'single', galleryId: 'g1' });
    expect(state.singleSlug).toBe('derbi-2026');
    expect(screen.getByText('mreza:2:three')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.viewAll' })).toHaveAttribute('href', '/galerija/derbi-2026');
  });

  it('bez fotografija pada na prikaz liste', () => {
    state.single = { data: { id: 'g1', slug: 'derbi-2026', title: 'Derbi', photos: [] }, isLoading: false };
    renderWidget({ mode: 'single', galleryId: 'g1' });
    expect(screen.getByText('home.gallerySubtitle')).toBeInTheDocument();
    expect(screen.queryByText(/mreza:/)).toBeNull();
  });

  it('single mod bez galleryId ponaša se kao lista', () => {
    renderWidget({ mode: 'single' });
    expect(state.singleSlug).toBe('');
    expect(screen.getByRole('heading', { name: 'home.gallery' })).toBeInTheDocument();
  });

  it('nepoznat galleryId ne traži pojedinačnu galeriju', () => {
    renderWidget({ mode: 'single', galleryId: 'nepoznat' });
    expect(state.singleSlug).toBe('');
    expect(screen.queryByText(/mreza:/)).toBeNull();
  });

  it('učitavanje pojedinačne galerije drži skeleton', () => {
    state.single = { data: undefined, isLoading: true };
    renderWidget({ mode: 'single', galleryId: 'g1' });
    expect(screen.queryByText(/mreza:/)).toBeNull();
  });
});
