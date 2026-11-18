import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModeratorHome } from './ModeratorHome';

const state = vi.hoisted(() => ({
  news: { data: [] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() },
  gallery: { data: [] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  live: { data: [] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  inbox: { data: undefined as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn(), meta: undefined },
  visitors: { data: undefined as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  permissions: [] as string[],
  publishNews: vi.fn(),
  publishGallery: vi.fn(),
  approveLive: vi.fn(),
  newsPending: false,
  galleryPending: false,
  livePending: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../hooks', () => ({
  useNewsList: (status: string, _cat: unknown, opts?: { enabled?: boolean }) => {
    state.news = { ...state.news, status } as unknown as typeof state.news;
    if (opts && opts.enabled === false) {
      // still return state for test
    }
    return state.news;
  },
  useGalleryList: (_status: string, _opts?: { enabled?: boolean }) => state.gallery,
}));
vi.mock('../../../hooks/use-contact-admin', () => ({ useContactMessages: () => state.inbox }));
vi.mock('../../../hooks/use-live-admin', () => ({
  usePendingLiveReports: () => state.live,
  useApproveMatchReport: () => ({ mutateAsync: state.approveLive, isPending: state.livePending }),
}));
vi.mock('../../../hooks/use-content-admin', () => ({
  useUpdateGalleryStatus: () => ({ mutateAsync: state.publishGallery, isPending: state.galleryPending }),
}));
vi.mock('../../../hooks/use-news-admin', () => ({
  useUpdateNewsStatus: () => ({ mutateAsync: state.publishNews, isPending: state.newsPending }),
}));
vi.mock('../../../hooks/use-analytics', () => ({ useVisitorTotals: () => state.visitors }));
vi.mock('./commentator-desk', () => ({
  matchTitle: (m: { homeName: string; awayName: string }) => `${m.homeName} - ${m.awayName}`,
}));

const news = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `n${i + 1}`, title: `Vijest ${i + 1}` }));
const gallery = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `g${i + 1}`, title: `Galerija ${i + 1}` }));
const live = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `l${i + 1}`,
    homeName: `Domaći ${i + 1}`,
    awayName: 'Gosti',
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
  'dashboard.read',
];

beforeEach(() => {
  state.news = { data: news(2), isLoading: false, isError: false, isFetching: false, dataUpdatedAt: Date.now(), status: '', refetch: vi.fn() } as unknown as typeof state.news;
  state.gallery = { data: gallery(1), isLoading: false, isError: false, isFetching: false, dataUpdatedAt: Date.now(), refetch: vi.fn() } as unknown as typeof state.gallery;
  state.live = { data: live(1), isLoading: false, isError: false, isFetching: false, dataUpdatedAt: Date.now(), refetch: vi.fn() } as unknown as typeof state.live;
  state.inbox = { data: { meta: { total: 3 } }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: Date.now(), refetch: vi.fn() } as unknown as typeof state.inbox;
  state.visitors = { data: { web: 120, mobile: 80, total: 200 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: Date.now(), refetch: vi.fn() } as unknown as typeof state.visitors;
  state.permissions = [...allPerms];
  state.publishNews.mockReset().mockResolvedValue(undefined);
  state.publishGallery.mockReset().mockResolvedValue(undefined);
  state.approveLive.mockReset().mockResolvedValue(undefined);
  state.newsPending = false;
  state.galleryPending = false;
  state.livePending = false;
});

describe('ModeratorHome — KPI i posjete', () => {
  it('prikazuje SEO i kažiprste redova čekanja', () => {
    renderHome();
    expect(screen.getByText('seo:Moderator')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.home.moderatorTitle' })).toBeInTheDocument();
    expect(screen.getByText('admin.home.moderatorHint')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('traži vijesti i galeriju na čekanju', () => {
    renderHome();
    expect(state.news.status).toBe('PENDING');
  });

  it('dok se sadržaj učitava prikazuje skeleton a ne tri tačke', () => {
    state.news = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, status: '' } as unknown as typeof state.news;
    state.gallery = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    state.inbox = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    state.visitors = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    expect(document.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryAllByText('…').length).toBe(0);
  });

  it('prikazuje posjete web, mobile i ukupno', () => {
    renderHome();
    expect(screen.getByText('admin.visitors.title')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('bez podataka posjete su nula', () => {
    state.visitors = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    state.inbox = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.inbox;
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);
  });

  it('KPI error prikazuje alert i retry', async () => {
    state.news = { data: undefined, isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    renderHome();
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('admin.home.kpiError').length).toBeGreaterThanOrEqual(1);
    await userEvent.click(screen.getAllByRole('button', { name: 'actions.retry' })[0]);
    expect(state.news.refetch).toHaveBeenCalled();
  });

  it('visitors error prikazuje alert', () => {
    state.visitors = { data: undefined, isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    // two alerts possible (kpi + visitors) — visitors alert is second
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
  });

  it('KPI bez permisije nema link', () => {
    state.permissions = ['news.manage', 'news.approve']; // no analytics, no contact
    state.visitors = { data: { web: 10, mobile: 20, total: 30 }, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.visitors;
    renderHome();
    // HomeKpiGrid renders div not link when no href — check that inbox value not inside link
    const inboxLinks = screen.getAllByRole('link').map((l) => l.getAttribute('href'));
    expect(inboxLinks).not.toContain('/admin/comms');
    expect(inboxLinks).not.toContain('/admin/analytics');
  });

  it('lastUpdated i osvježi dugme su prikazani', async () => {
    renderHome();
    expect(screen.getByText('admin.home.lastUpdated')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'admin.home.refresh' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.news.refetch).toHaveBeenCalled();
  });
});

describe('ModeratorHome — red čekanja', () => {
  it('ograničava red na osam stavki i prikazuje linkove po vrsti', () => {
    state.news = { data: news(5), isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    state.gallery = { data: gallery(3), isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: live(3), isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    renderHome();
    const queueLinks = screen
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
      .filter((href) => /\/edit$|^\/admin\/live\/l\d/.test(href ?? ''));
    expect(queueLinks).toHaveLength(8);
    expect(queueLinks).toContain('/admin/news/n1/edit');
    expect(queueLinks).toContain('/admin/gallery/g1/edit');
    expect(queueLinks).toContain('/admin/live/l1');
    expect(queueLinks).not.toContain('/admin/news/n5/edit');
  });

  it('odobravanje vijesti mijenja status na PUBLISHED', async () => {
    const user = userEvent.setup();
    renderHome();
    const row = screen.getByText('Vijest 1').closest('li') as HTMLElement;
    await user.click(row.querySelector('button') as HTMLElement);
    expect(state.publishNews).toHaveBeenCalledWith({ id: 'n1', status: 'PUBLISHED' });
    expect(state.publishGallery).not.toHaveBeenCalled();
    expect(state.approveLive).not.toHaveBeenCalled();
  });

  it('odobravanje galerije mijenja status galerije', async () => {
    const user = userEvent.setup();
    renderHome();
    const row = screen.getByText('Galerija 1').closest('li') as HTMLElement;
    await user.click(row.querySelector('button') as HTMLElement);
    expect(state.publishGallery).toHaveBeenCalledWith({ id: 'g1', status: 'PUBLISHED' });
    expect(state.publishNews).not.toHaveBeenCalled();
  });

  it('odobravanje live izvještaja koristi approveLive', async () => {
    const user = userEvent.setup();
    renderHome();
    const row = screen.getByText('Domaći 1 - Gosti').closest('li') as HTMLElement;
    await user.click(row.querySelector('button') as HTMLElement);
    expect(state.approveLive).toHaveBeenCalledWith('l1');
  });

  it('odobri dugme je disabled bez approve permisije', () => {
    state.permissions = ['news.manage', 'gallery.manage', 'contact.read', 'analytics.read', 'live.approve']; // no news.approve
    state.news = { data: news(1), isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    state.gallery = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    renderHome();
    const row = screen.getByText('Vijest 1').closest('li') as HTMLElement;
    const btn = row.querySelector('button') as HTMLElement;
    expect(btn).toBeDisabled();
    expect(btn.getAttribute('aria-label')).toBe('admin.content.approveLabel');
  });

  it('prikazuje sve brze akcije uz dozvole', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.content.newsQueue' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.livePending' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.commsInbox' })).toBeInTheDocument();
  });

  it('skriva brze akcije bez permisije', () => {
    state.permissions = ['news.manage', 'news.approve']; // only news
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.content.newsQueue' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'admin.livePending' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'admin.commsInbox' })).toBeNull();
  });

  it('queue loading prikazuje skeleton', () => {
    state.news = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    state.gallery = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.gallery;
    state.live = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.live;
    renderHome();
    expect(document.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThanOrEqual(1);
  });

  it('queue error prikazuje alert', () => {
    state.news = { data: undefined, isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, status: '', refetch: vi.fn() } as unknown as typeof state.news;
    renderHome();
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
  });

  it('queue ima aria-label', () => {
    renderHome();
    expect(screen.getByLabelText('admin.content.queueLabel')).toBeInTheDocument();
  });

  it('odobri dugme disabled dok se odobrava', () => {
    state.newsPending = true;
    renderHome();
    const row = screen.getByText('Vijest 1').closest('li') as HTMLElement;
    const btn = row.querySelector('button') as HTMLElement;
    expect(btn).toBeDisabled();
  });
});
