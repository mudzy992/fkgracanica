import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WriterHome } from './WriterHome';
import { CommentatorDeskList } from './CommentatorDeskList';

const state = vi.hoisted(() => ({
  news: { DRAFT: [] as unknown[], PENDING: [] as unknown[], PUBLISHED: [] as unknown[] },
  loading: false,
  undefinedNews: false,
  undefinedAlbums: false,
  isError: false,
  isFetching: false,
  permissions: ['news.manage', 'gallery.manage', 'media.read', 'media.upload'] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../hooks', () => ({
  useNewsList: (status: 'DRAFT' | 'PENDING' | 'PUBLISHED', _cat: unknown, opts?: { enabled?: boolean }) => ({
    data: state.undefinedNews ? undefined : state.news[status],
    isLoading: state.loading,
    isError: state.isError,
    isFetching: state.isFetching,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
    ...(opts?.enabled === false ? { data: state.undefinedNews ? undefined : state.news[status] } : {}),
  }),
  usePublicSettings: () => ({ data: {} }),
}));
vi.mock('../../../hooks/use-content-admin', () => ({
  useGalleryAdminList: (opts?: { enabled?: boolean }) => ({
    data: state.undefinedAlbums ? undefined : [{ id: 'g1' }, { id: 'g2' }],
    isLoading: state.loading,
    isError: state.isError,
    isFetching: state.isFetching,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
    ...(opts?.enabled === false ? { data: state.undefinedAlbums ? undefined : [{ id: 'g1' }, { id: 'g2' }] } : {}),
  }),
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'SCHEDULED',
  scheduledAt: '2030-05-01T17:00:00.000Z',
  homeScore: 0,
  awayScore: 0,
  minute: 0,
  seasonId: 's1',
  homeClubId: 'k1',
  awayClubId: 'k2',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  ...over,
});

beforeEach(() => {
  state.news = { DRAFT: [], PENDING: [], PUBLISHED: [] };
  state.loading = false;
  state.undefinedNews = false;
  state.undefinedAlbums = false;
  state.isError = false;
  state.isFetching = false;
  state.permissions = ['news.manage', 'gallery.manage', 'media.read', 'media.upload'];
});

describe('WriterHome', () => {
  it('prikazuje KPI brojeve i brze akcije', () => {
    state.news = {
      DRAFT: [{ id: 'n1', title: 'Nacrt 1', status: 'DRAFT' }],
      PENDING: [{ id: 'n2', title: 'Na odobrenju', status: 'PENDING' }],
      PUBLISHED: [{ id: 'n3' }, { id: 'n4' }],
    };
    wrap(<WriterHome />);
    expect(screen.getByRole('heading', { name: 't:admin.home.writerTitle' })).toBeInTheDocument();
    expect(screen.getByText('t:admin.home.writerHint')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Nacrt 1/ }).getAttribute('href')).toBe(
      '/admin/news/n1/edit',
    );
    expect(screen.getByText('Na odobrenju')).toBeInTheDocument();
  });

  it('dok se učitava prikazuje skeleton a ne tri tačke', () => {
    state.loading = true;
    state.isFetching = true;
    const { container } = wrap(<WriterHome />);
    expect(container.querySelectorAll('[aria-busy=\"true\"]').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText('…').length).toBe(0);
  });

  it('prazni redovi prikazuju nule i poruku', () => {
    wrap(<WriterHome />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('t:admin.content.noDrafts')).toBeInTheDocument();
  });

  it('nedostajući podaci bez učitavanja prikazuju nule (batch 34)', () => {
    state.undefinedNews = true;
    state.undefinedAlbums = true;
    wrap(<WriterHome />);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
    expect(screen.queryByText('…')).toBeNull();
    expect(screen.getByText('t:admin.content.noDrafts')).toBeInTheDocument();
  });
});

describe('CommentatorDeskList', () => {
  it('dok se učitava prikazuje skeletone', () => {
    const { container } = render(<CommentatorDeskList matches={[]} isLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBe(3);
  });

  it('bez utakmica prikazuje poruku', () => {
    render(<CommentatorDeskList matches={[]} isLoading={false} />);
    expect(screen.getByText(/Nema utakmica za desk/)).toBeInTheDocument();
  });

  it('prikazuje utakmicu uživo sa CTA Desk', () => {
    wrap(
      <CommentatorDeskList matches={[match({ status: 'LIVE' }) as never]} isLoading={false} />,
    );
    expect(screen.getByText('FK Gračanica 0:0 FK Slavija')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/admin/live/m1');
  });

  it('završena utakmica vodi na izvještaj i prikazuje status izvještaja', () => {
    wrap(
      <CommentatorDeskList
        matches={[match({ status: 'FINISHED', reportStatus: 'DRAFT' }) as never]}
        isLoading={false}
      />,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/admin/matches/m1/report');
    expect(document.body.textContent).toContain('·');
  });
});
