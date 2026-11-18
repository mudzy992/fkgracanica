import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModeratorHome } from './ModeratorHome';

const state = vi.hoisted(() => ({
  news: { data: [] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() },
  gallery: { data: [] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  live: { data: [] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  inbox: { data: undefined as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  visitors: { data: undefined as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  permissions: [] as string[],
  publishNews: vi.fn(),
  publishGallery: vi.fn(),
  approveLive: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../hooks', () => ({
  useNewsList: () => state.news,
  useGalleryList: () => state.gallery,
}));
vi.mock('../../../hooks/use-contact-admin', () => ({ useContactMessages: () => state.inbox }));
vi.mock('../../../hooks/use-live-admin', () => ({
  usePendingLiveReports: () => state.live,
  useApproveMatchReport: () => ({ mutateAsync: state.approveLive, isPending: false }),
}));
vi.mock('../../../hooks/use-content-admin', () => ({
  useUpdateGalleryStatus: () => ({ mutateAsync: state.publishGallery, isPending: false }),
}));
vi.mock('../../../hooks/use-news-admin', () => ({
  useUpdateNewsStatus: () => ({ mutateAsync: state.publishNews, isPending: false }),
}));
vi.mock('../../../hooks/use-analytics', () => ({ useVisitorTotals: () => state.visitors }));
vi.mock('./commentator-desk', () => ({
  matchTitle: (m: { homeName: string; awayName: string }) => `${m.homeName} - ${m.awayName}`,
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <ModeratorHome />
    </MemoryRouter>,
  );

const allPerms = [
  'news.manage',
  'news.approve',
  'gallery.manage',
  'gallery.approve',
  'live.approve',
  'contact.read',
  'analytics.read',
];

beforeEach(() => {
  state.news = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
  state.gallery = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
  state.live = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
  state.inbox = { data: { meta: { total: 5 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
  state.visitors = { data: { web: 10, mobile: 20, total: 30 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
  state.permissions = [...allPerms];
});

describe('ModeratorHome — varijante posjeta (3 grane ?? 0)', () => {
  it('kad visitors.data je undefined koristi 0', () => {
    state.news = { data: [{ id: 'n1', title: 'Vijest' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '' } as unknown as typeof state.news;
    state.gallery = { data: [{ id: 'g1', title: 'Galerija' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [{ id: 'l1', homeName: 'A', awayName: 'B' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 9 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });

  it('kad visitors.data je null koristi 0', () => {
    state.news = { data: [{ id: 'n1', title: 'Vijest' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '' } as unknown as typeof state.news;
    state.gallery = { data: [{ id: 'g1', title: 'Galerija' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [{ id: 'l1', homeName: 'A', awayName: 'B' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 9 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });

  it('kad visitors.data nema web koristi 0', () => {
    state.news = { data: [{ id: 'n1', title: 'Vijest' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '' } as unknown as typeof state.news;
    state.gallery = { data: [{ id: 'g1', title: 'Galerija' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [{ id: 'l1', homeName: 'A', awayName: 'B' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 9 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: {}, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    // visitors web/mobile/total treba biti 0, ostali 1/1/1/9
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(3); // news, gallery, live
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3); // samo visitors 0,0,0
  });

  it('kad web postoji ali mobile/total nedostaju koristi 0 za njih', () => {
    state.news = { data: [{ id: 'n1', title: 'Vijest' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '' } as unknown as typeof state.news;
    state.gallery = { data: [{ id: 'g1', title: 'Galerija' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [{ id: 'l1', homeName: 'A', awayName: 'B' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 9 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: { web: 7 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    expect(screen.getByText('7')).toBeInTheDocument();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(2); // mobile i total 0
  });

  it('kad visitors.data ima null vrijednosti koristi 0', () => {
    state.news = { data: [{ id: 'n1', title: 'Vijest' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '' } as unknown as typeof state.news;
    state.gallery = { data: [{ id: 'g1', title: 'Galerija' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [{ id: 'l1', homeName: 'A', awayName: 'B' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 9 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: { web: null, mobile: null, total: null }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });

  it('kad visitors.data ima 0 vrijednosti prikazuje 0 bez fallbacka', () => {
    state.news = { data: [{ id: 'n1', title: 'Vijest' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '' } as unknown as typeof state.news;
    state.gallery = { data: [{ id: 'g1', title: 'Galerija' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [{ id: 'l1', homeName: 'A', awayName: 'B' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 9 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: { web: 0, mobile: 0, total: 0 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });
});

describe('ModeratorHome — varijante reda čekanja (3 grane ??0)', () => {
  it('kad news/gallery/live nemaju data koristi 0', () => {
    state.news = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    state.gallery = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 1 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: { web: 1, mobile: 2, total: 3 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });

  it('kad data ima null koristi 0', () => {
    state.news = { data: null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    state.gallery = { data: null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: null, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 1 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: { web: 1, mobile: 2, total: 3 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });

  it('kad loading true prikazuje skeleton umjesto broja', () => {
    state.news = { data: [], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    state.gallery = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: { meta: { total: 1 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: { web: 1, mobile: 2, total: 3 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.queryAllByText('…').length).toBe(0);
  });
});
