import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModeratorHome } from './ModeratorHome';

const state = vi.hoisted(() => ({
  news: { data: [] as unknown, isLoading: false, status: '' },
  gallery: { data: [] as unknown, isLoading: false },
  live: { data: [] as unknown, isLoading: false },
  inbox: { data: undefined as unknown, isLoading: false },
  visitors: { data: undefined as unknown, isLoading: false },
  publishNews: vi.fn(),
  publishGallery: vi.fn(),
  approveLive: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../hooks', () => ({
  useNewsList: (status: string) => {
    state.news = { ...state.news, status };
    return state.news;
  },
  useGalleryList: () => state.gallery,
}));
vi.mock('../../../hooks/use-contact-admin', () => ({ useContactMessages: () => state.inbox }));
vi.mock('../../../hooks/use-live-admin', () => ({
  usePendingLiveReports: () => state.live,
  useApproveMatchReport: () => ({ mutateAsync: state.approveLive }),
}));
vi.mock('../../../hooks/use-content-admin', () => ({
  useUpdateGalleryStatus: () => ({ mutateAsync: state.publishGallery }),
}));
vi.mock('../../../hooks/use-news-admin', () => ({
  useUpdateNewsStatus: () => ({ mutateAsync: state.publishNews }),
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

beforeEach(() => {
  state.news = { data: news(2), isLoading: false, status: '' };
  state.gallery = { data: gallery(1), isLoading: false };
  state.live = { data: live(1), isLoading: false };
  state.inbox = { data: { meta: { total: 3 } }, isLoading: false };
  state.visitors = { data: { web: 120, mobile: 80, total: 200 }, isLoading: false };
  state.publishNews.mockReset().mockResolvedValue(undefined);
  state.publishGallery.mockReset().mockResolvedValue(undefined);
  state.approveLive.mockReset().mockResolvedValue(undefined);
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

  it('dok se sadržaj učitava vrijednosti su tri tačke', () => {
    state.news = { data: undefined, isLoading: true, status: '' };
    state.gallery = { data: undefined, isLoading: true };
    state.live = { data: undefined, isLoading: true };
    state.inbox = { data: undefined, isLoading: true };
    state.visitors = { data: undefined, isLoading: true };
    renderHome();
    expect(screen.getAllByText('…')).toHaveLength(7);
    expect(screen.getByText('admin.content.emptyQueue')).toBeInTheDocument();
  });

  it('prikazuje posjete web, mobile i ukupno', () => {
    renderHome();
    expect(screen.getByText('admin.visitors.title')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('bez podataka posjete su nula', () => {
    state.visitors = { data: undefined, isLoading: false };
    state.inbox = { data: undefined, isLoading: false };
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);
  });
});

describe('ModeratorHome — red čekanja', () => {
  it('ograničava red na osam stavki i prikazuje linkove po vrsti', () => {
    state.news = { data: news(5), isLoading: false, status: '' };
    state.gallery = { data: gallery(3), isLoading: false };
    state.live = { data: live(3), isLoading: false };
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

  it('prikazuje sve brze akcije', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.content.newsQueue' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.livePending' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.commsInbox' })).toBeInTheDocument();
  });
});
