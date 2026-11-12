import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleryDetailPage } from './GalleryDetailPage';
import { GalleryListPage } from './GalleryListPage';

const state = vi.hoisted(() => ({
  galleryItem: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  galleryList: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  seo: [] as Record<string, unknown>[],
  heroes: [] as Record<string, unknown>[],
  bento: [] as unknown[],
  rich: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useGalleryItem: () => state.galleryItem,
  useGalleryList: () => state.galleryList,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/gallery/GalleryAlbumHero', () => ({
  GalleryAlbumHero: (props: Record<string, unknown>) => {
    state.heroes.push({ kind: 'album', ...props });
    return <div data-testid="album-hero" />;
  },
}));
vi.mock('../../components/public/PremiumPhotoBento', () => ({
  PremiumPhotoBento: ({ photos }: { photos: unknown[] }) => {
    state.bento.push(photos);
    return <div data-testid="photo-bento" />;
  },
}));
vi.mock('../../components/gallery/GalleryListBento', () => ({
  GalleryListBento: ({ items }: { items: unknown[] }) => {
    state.bento.push(items);
    return <div data-testid="list-bento" />;
  },
  GalleryListBentoSkeleton: () => <div data-testid="list-skeleton" />,
}));
vi.mock('../../components/public/RichContent', () => ({
  RichContent: ({ html }: { html: string }) => {
    state.rich.push(html);
    return <div data-testid="rich" />;
  },
}));

const renderPage = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('GalleryDetailPage', () => {
  beforeEach(() => {
    state.galleryItem = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.seo = [];
    state.heroes = [];
    state.bento = [];
    state.rich = [];
  });

  it('dok se album učitava prikazuje skeletone', () => {
    state.galleryItem = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    const { container } = renderPage(<GalleryDetailPage />);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2);
  });

  it('greška nudi ponovni pokušaj', async () => {
    const refetch = vi.fn();
    state.galleryItem = { data: undefined, isLoading: false, isError: true, refetch };
    renderPage(<GalleryDetailPage />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('bez albuma prikazuje poruku', () => {
    renderPage(<GalleryDetailPage />);
    expect(screen.getByText('pages.gallery.notFound')).toBeTruthy();
  });

  it('album bez fotografija nema galerijsku sekciju', () => {
    state.galleryItem = {
      data: { title: 'Album', description: null, photos: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<GalleryDetailPage />);
    expect(state.heroes[0]).toEqual({
      kind: 'album',
      title: 'Album',
      coverPath: undefined,
      photoCount: 0,
    });
    expect(screen.queryByText('pages.gallery.photos')).toBeNull();
    expect(state.rich).toHaveLength(0);
  });

  it('album sa fotografijama prikazuje bento i naslov sekcije', () => {
    const photos = [
      { id: 'p1', path: 'originals/1.jpg' },
      { id: 'p2', path: 'originals/2.jpg' },
    ];
    state.galleryItem = {
      data: { title: 'Album', description: '<p>Opis</p>', photos },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<GalleryDetailPage />);
    expect(state.heroes[0]).toMatchObject({ coverPath: 'originals/1.jpg', photoCount: 2 });
    expect(screen.getByText('pages.gallery.photos')).toBeTruthy();
    expect(state.bento[0]).toBe(photos);
    expect(state.rich[0]).toBe('<p>Opis</p>');
    expect(state.seo[0]).toEqual({ title: 'Album', description: '<p>Opis</p>' });
  });
});

describe('GalleryListPage', () => {
  beforeEach(() => {
    state.galleryList = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.bento = [];
  });

  it('dok se lista učitava prikazuje skeleton', () => {
    state.galleryList = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    renderPage(<GalleryListPage />);
    expect(screen.getByTestId('list-skeleton')).toBeTruthy();
  });

  it('greška nudi ponovni pokušaj', async () => {
    const refetch = vi.fn();
    state.galleryList = { data: undefined, isLoading: false, isError: true, refetch };
    renderPage(<GalleryListPage />);
    await userEvent.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('prazna lista prikazuje prazno stanje', () => {
    renderPage(<GalleryListPage />);
    expect(screen.getByText('pages.gallery.empty')).toBeTruthy();
  });

  it('lista albuma ide u bento', () => {
    state.galleryList = {
      data: [{ id: 'g1' }, { id: 'g2' }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage(<GalleryListPage />);
    expect(state.bento[0]).toHaveLength(2);
  });
});
