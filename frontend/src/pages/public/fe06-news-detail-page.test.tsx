import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsDetailPage } from './NewsDetailPage';

const state = vi.hoisted(() => ({
  news: { data: undefined as unknown, isLoading: false, isError: false },
  seo: [] as Record<string, unknown>[],
  hero: [] as Record<string, unknown>[],
  rich: [] as string[],
  related: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ useNewsItem: () => state.news }));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/public/RichContent', () => ({
  RichContent: ({ html }: { html: string }) => {
    state.rich.push(html);
    return <div data-testid="rich" />;
  },
}));
vi.mock('../../components/news/NewsArticleHero', () => ({
  NewsArticleHero: (props: Record<string, unknown>) => {
    state.hero.push(props);
    return <div data-testid="article-hero" />;
  },
}));
vi.mock('../../components/public/VideoEmbed', () => ({
  VideoEmbed: ({ url }: { url: string }) => {
    state.related.push(`video:${url}`);
    return <div data-testid="video-embed" />;
  },
}));
vi.mock('../../components/news/NewsGalleryPhotos', () => ({
  NewsGalleryPhotos: ({ galleryId }: { galleryId?: string }) => {
    state.related.push(`gallery:${String(galleryId)}`);
    return <div data-testid="news-gallery" />;
  },
}));
vi.mock('../../components/news/NewsDetailSections', () => ({
  NewsRelatedMatches: ({ matches }: { matches: unknown[] }) => {
    state.related.push(`matches:${matches.length}`);
    return <div data-testid="related-matches" />;
  },
  NewsRelatedPlayers: ({ players }: { players: unknown[] }) => {
    state.related.push(`players:${players.length}`);
    return <div data-testid="related-players" />;
  },
}));
vi.mock('../../components/news/NewsCommentsSection', () => ({
  NewsCommentsSection: ({ newsId }: { newsId: string }) => (
    <div data-testid="comments" data-news={newsId} />
  ),
}));

const renderPage = (ui: React.ReactElement = <NewsDetailPage />) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

const item = (over: Record<string, unknown> = {}) => ({
  id: 'n1',
  slug: 'vijest-1',
  title: 'Naslov',
  content: '<p>Tekst</p>',
  excerpt: 'Kratko',
  seoTitle: null,
  seoDesc: null,
  coverPath: 'originals/cover.jpg',
  coverAlt: null,
  videoUrl: null,
  gallery: [],
  galleryId: null,
  relatedMatches: [],
  relatedPlayers: [],
  category: { name: 'Klub' },
  publishedAt: '2026-05-01T10:00:00.000Z',
  ...over,
});

describe('NewsDetailPage', () => {
  beforeEach(() => {
    state.news = { data: undefined, isLoading: false, isError: false };
    state.seo = [];
    state.hero = [];
    state.rich = [];
    state.related = [];
  });

  it('dok se vijest učitava prikazuje skeletone', () => {
    state.news = { data: undefined, isLoading: true, isError: false };
    const { container } = renderPage();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2);
  });

  it('greška ili prazna vijest prikazuju poruku', () => {
    state.news = { data: undefined, isLoading: false, isError: true };
    renderPage();
    expect(screen.getByText('pages.news.notFound')).toBeTruthy();
  });

  it('prikazuje hero, sadržaj i sekcije', () => {
    state.news = { data: item(), isLoading: false, isError: false };
    renderPage();
    expect(screen.getByTestId('article-hero')).toBeTruthy();
    expect(state.rich[0]).toBe('<p>Tekst</p>');
    expect(screen.getByTestId('comments').getAttribute('data-news')).toBe('n1');
    expect(state.seo[0]).toMatchObject({
      title: 'Naslov',
      description: 'Kratko',
      url: '/vijesti/vijest-1',
    });
  });

  it('seoTitle i seoDesc imaju prioritet', () => {
    state.news = {
      data: item({ seoTitle: 'SEO naslov', seoDesc: 'SEO opis' }),
      isLoading: false,
      isError: false,
    };
    renderPage();
    expect(state.seo[0]).toMatchObject({ title: 'SEO naslov', description: 'SEO opis' });
  });

  it('video se prikazuje samo kada postoji', () => {
    state.news = { data: item(), isLoading: false, isError: false };
    const { rerender } = renderPage();
    expect(screen.queryByTestId('video-embed')).toBeNull();
    state.news = { data: item({ videoUrl: 'https://yt/1' }), isLoading: false, isError: false };
    rerender(
      <MemoryRouter>
        <NewsDetailPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('video-embed')).toBeTruthy();
    expect(state.related).toContain('video:https://yt/1');
  });

  it('povezani sadržaji se prosljeđuju sekcijama', () => {
    state.news = {
      data: item({ relatedMatches: [{ id: 'm1' }], relatedPlayers: [{ id: 'p1' }, { id: 'p2' }] }),
      isLoading: false,
      isError: false,
    };
    renderPage();
    expect(state.related).toContain('matches:1');
    expect(state.related).toContain('players:2');
  });
});
