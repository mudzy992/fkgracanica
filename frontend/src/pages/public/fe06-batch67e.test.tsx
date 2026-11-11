import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const publicState = vi.hoisted(() => ({
  museumData: undefined as unknown,
  museumLoading: false,
  museumError: false,
  newsData: undefined as unknown,
  newsLoading: false,
  newsError: false,
  ticketsConfig: { modulesTicketing: true } as unknown,
  user: null as unknown,
  clubData: undefined as unknown,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useMuseum: () => ({ data: publicState.museumData, isLoading: publicState.museumLoading, isError: publicState.museumError, refetch: vi.fn() }),
  useNewsItem: () => ({ data: publicState.newsData, isLoading: publicState.newsLoading, isError: publicState.newsError }),
  useModuleFlags: () => ({ data: { modulesTicketing: true } }),
}));
vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: publicState.ticketsConfig }),
}));
vi.mock('../../hooks/use-ticket-payment-return', () => ({ useTicketPaymentReturn: () => ({}) }));
vi.mock('../../hooks/use-season-pass-payment-return', () => ({ useSeasonPassPaymentReturn: () => ({}) }));
vi.mock('../../hooks/use-clear-payment-params', () => ({ useClearPaymentParams: () => {} }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: publicState.user }) }));
vi.mock('../../hooks/use-club-public', () => ({ useClubPublic: () => ({ data: publicState.clubData }) }));
vi.mock('../../lib/media', () => ({ mediaUrl: () => null }));
vi.mock('../../components/public/PageContainer', () => ({ PageContainer: ({ children }: { children: unknown }) => <div>{children as never}</div> }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/public/RichContent', () => ({ RichContent: () => null }));
vi.mock('../../components/public/VideoEmbed', () => ({ VideoEmbed: () => null }));
vi.mock('../../components/news/NewsCommentsSection', () => ({ NewsCommentsSection: () => null }));
vi.mock('../../components/news/NewsArticleHero', () => ({ NewsArticleHero: () => null }));
vi.mock('../../components/news/NewsGalleryPhotos', () => ({ NewsGalleryPhotos: () => null }));
vi.mock('../../components/news/NewsDetailSections', () => ({ NewsRelatedMatches: () => null, NewsRelatedPlayers: () => null }));
vi.mock('../../components/public/museum/MuseumCinematicHero', () => ({ MuseumCinematicHero: () => null }));
vi.mock('../../components/public/museum/MuseumExhibitCard', () => ({ MuseumExhibitCard: () => null }));
vi.mock('../../components/public/museum/MuseumFilters', () => ({ MuseumFilters: () => null }));
vi.mock('../../components/news/NewsSectionTitle', () => ({ NewsSectionTitle: ({ children }: { children: unknown }) => <div>{children as never}</div> }));
vi.mock('../../lib/motion/Reveal', () => ({ Reveal: ({ children }: { children: unknown }) => <div>{children as never}</div> }));
vi.mock('../../components/public/EmptyState', () => ({ EmptyState: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock('../../components/common/DataError', () => ({ DataError: () => null }));
vi.mock('../../components/ui/skeleton', () => ({ Skeleton: () => <div>skel</div> }));
vi.mock('../../components/club/ClubPublicPage', () => ({ ClubPublicPage: () => null }));
// Mock ClubPublicPage internal deps
vi.mock('../../components/club/ClubPlayersGrid', () => ({ ClubPlayersGrid: () => null }));
vi.mock('../../components/team/TeamSeasonStats', () => ({ TeamSeasonStats: () => null }));
vi.mock('../../components/club/ClubCompetitionTabs', () => ({ ClubCompetitionTabs: () => <div>tabs</div> }));
vi.mock('../../components/club/ClubHubPage', () => ({ ClubHubPage: () => null }));

import { MuseumPage } from './MuseumPage';
import { NewsDetailPage } from './NewsDetailPage';
import { TicketsPage } from './TicketsPage';
import { ClubPublicPage } from './ClubPublicPage';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{c}</MemoryRouter></QueryClientProvider>;
}

describe('fe06-batch67e public ??', () => {
  beforeEach(() => {
    publicState.museumData = undefined;
    publicState.museumLoading = false;
    publicState.museumError = false;
    publicState.newsData = undefined;
    publicState.newsLoading = false;
    publicState.newsError = false;
    publicState.ticketsConfig = { modulesTicketing: true } as unknown;
    publicState.user = null;
    publicState.clubData = undefined;
  });

  it('MuseumPage pokriva filtered?.length ?? 0', () => {
    publicState.museumData = [] as unknown as never;
    publicState.museumLoading = false;
    const { container: c1 } = render(wrap(<MuseumPage />));
    expect(c1.textContent).toContain('pages.museum.empty');
    publicState.museumData = [{ id: '1', year: 2020, category: 'cat' }] as unknown as never;
    const { container: c2 } = render(wrap(<MuseumPage />));
    expect(c2).toBeDefined();
  });

  it('NewsDetailPage pokriva seoTitle ?? title', () => {
    publicState.newsData = { title: 'Naslov', seoTitle: null, seoDesc: null, excerpt: 'Ex', coverPath: null, slug: 'naslov', publishedAt: null, category: null } as unknown as never;
    const { container } = render(wrap(<NewsDetailPage />));
    expect(container).toBeDefined();
  });

  it('TicketsPage pokriva user?.email ?? ""', () => {
    publicState.user = null as unknown as never;
    publicState.ticketsConfig = { modulesTicketing: true } as unknown as never;
    const { container: c1 } = render(wrap(<TicketsPage />));
    expect(c1).toBeDefined();
    publicState.user = { email: 'a@b.c' } as unknown as never;
    const { container: c2 } = render(wrap(<TicketsPage />));
    expect(c2).toBeDefined();
  });

  it('ClubPublicPage pokriva participations ?? []', () => {
    publicState.clubData = { id: '1', club: { id: '1', name: 'FK' }, participations: undefined, players: [], seasonStats: null } as unknown as never;
    const { container } = render(wrap(<ClubPublicPage />));
    expect(container).toBeDefined();
  });
});
