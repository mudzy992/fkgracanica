import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WriterHome } from './WriterHome';

const state = vi.hoisted(() => ({
  drafts: {
    data: [] as unknown as { id: string; title: string; status: string }[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  pending: {
    data: [] as unknown as { id: string; title: string; status: string }[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  published: {
    data: [] as unknown as { id: string; title: string; status: string }[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  albums: {
    data: [] as unknown as { id: string }[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  permissions: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../hooks', () => ({
  useNewsList: (status: string, _cat: unknown, _opts?: { enabled?: boolean }) => {
    if (status === 'DRAFT') return state.drafts;
    if (status === 'PENDING') return state.pending;
    if (status === 'PUBLISHED') return state.published;
    return state.drafts;
  },
}));
vi.mock('../../../hooks/use-content-admin', () => ({
  useGalleryAdminList: (_opts?: { enabled?: boolean }) => state.albums,
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <WriterHome />
    </MemoryRouter>,
  );

const allPerms = ['news.manage', 'gallery.manage', 'media.read', 'media.upload'];

beforeEach(() => {
  state.drafts = {
    data: [{ id: 'n1', title: 'Nacrt 1', status: 'DRAFT' }],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
  } as unknown as typeof state.drafts;
  state.pending = {
    data: [{ id: 'n2', title: 'Na odobrenju', status: 'PENDING' }],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
  } as unknown as typeof state.pending;
  state.published = {
    data: [{ id: 'n3', title: 'Objavljena' } as unknown as { id: string; title: string; status: string }, { id: 'n4', title: 'Objavljena 2' } as unknown as { id: string; title: string; status: string }],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
  } as unknown as typeof state.published;
  state.albums = {
    data: [{ id: 'g1' }, { id: 'g2' }] as unknown as { id: string }[],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
  } as unknown as typeof state.albums;
  state.permissions = [...allPerms];
});

describe('WriterHome — KPI', () => {
  it('prikazuje SEO i naslov', () => {
    renderHome();
    expect(screen.getByText('seo:Writer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.home.writerTitle' })).toBeInTheDocument();
    expect(screen.getByText('admin.home.writerHint')).toBeInTheDocument();
  });

  it('prikazuje KPI brojeve', () => {
    renderHome();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2);
  });

  it('dok se učitava prikazuje skeleton a ne tri tačke', () => {
    state.drafts = { data: undefined as unknown as typeof state.drafts.data, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: undefined as unknown as typeof state.pending.data, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    state.published = { data: undefined as unknown as typeof state.published.data, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    state.albums = { data: undefined as unknown as typeof state.albums.data, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
    renderHome();
    expect(document.querySelectorAll('[aria-busy=\"true\"]').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText('…').length).toBe(0);
  });

  it('bez podataka prikazuje 0', () => {
    state.drafts = { data: undefined as unknown as typeof state.drafts.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: undefined as unknown as typeof state.pending.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    state.published = { data: undefined as unknown as typeof state.published.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    state.albums = { data: undefined as unknown as typeof state.albums.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
  });

  it('KPI error prikazuje alert i retry poziva sve refetch', async () => {
    // isolate KPI error from queue: make published trigger kpi error, drafts/pending stay success
    // so queue error not shown simultaneously
    state.published = { data: undefined as unknown as typeof state.published.data, isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    renderHome();
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('admin.home.kpiError').length).toBeGreaterThanOrEqual(1);
    await userEvent.click(screen.getAllByRole('button', { name: 'actions.retry' })[0]);
    expect(state.drafts.refetch).toHaveBeenCalled();
    expect(state.pending.refetch).toHaveBeenCalled();
    expect(state.published.refetch).toHaveBeenCalled();
    expect(state.albums.refetch).toHaveBeenCalled();
  });

  it('KPI bez gallery.manage nema link na galeriju', () => {
    state.permissions = ['news.manage', 'media.read'];
    renderHome();
    const galleryLinks = screen.getAllByRole('link').map((l) => l.getAttribute('href'));
    expect(galleryLinks).not.toContain('/admin/gallery');
  });

  it('KPI retry je disabled dok se dohvaća', () => {
    state.published = { data: undefined as unknown as typeof state.published.data, isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    // hide lastUpdated to avoid second loading button from Osvježi
    state.drafts = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    state.albums = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
    renderHome();
    const btn = screen.getByRole('button', { name: 'admin.common.loading' });
    expect(btn).toBeDisabled();
  });

  it('lastUpdated i osvježi su prikazani', async () => {
    renderHome();
    expect(screen.getByText('admin.home.lastUpdated')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'admin.home.refresh' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.drafts.refetch).toHaveBeenCalled();
    expect(state.albums.refetch).toHaveBeenCalled();
  });

  it('osvježi je disabled dok se dohvaća', () => {
    state.drafts = { ...state.drafts, isFetching: true } as unknown as typeof state.drafts;
    renderHome();
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });

  it('brze akcije se filtriraju po permisiji', () => {
    state.permissions = ['news.manage'];
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.content.newNews' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'admin.content.mediaFolders' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'admin.content.newAlbum' })).toBeNull();
  });

  it('bez media.read nema media akcije ali ima news', () => {
    state.permissions = ['news.manage', 'gallery.manage'];
    renderHome();
    expect(screen.queryByRole('link', { name: 'admin.content.mediaFolders' })).toBeNull();
    expect(screen.getByRole('link', { name: 'admin.content.newAlbum' })).toBeInTheDocument();
  });
});

describe('WriterHome — red čekanja', () => {
  it('prikazuje queue linkove i ograničava na 8', () => {
    state.drafts = {
      data: Array.from({ length: 5 }, (_, i) => ({ id: `d${i + 1}`, title: `Nacrt ${i + 1}`, status: 'DRAFT' })),
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.drafts;
    state.pending = {
      data: Array.from({ length: 5 }, (_, i) => ({ id: `p${i + 1}`, title: `Pending ${i + 1}`, status: 'PENDING' })),
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.pending;
    renderHome();
    const queueLinks = screen
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
      .filter((href) => href?.includes('/admin/news/') && href?.endsWith('/edit'));
    expect(queueLinks).toHaveLength(8);
    expect(queueLinks).toContain('/admin/news/d1/edit');
    expect(queueLinks).not.toContain('/admin/news/p5/edit');
  });

  it('queue loading prikazuje skeleton', () => {
    state.drafts = { data: undefined as unknown as typeof state.drafts.data, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: undefined as unknown as typeof state.pending.data, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    renderHome();
    expect(document.querySelectorAll('[aria-busy=\"true\"]').length).toBeGreaterThanOrEqual(1);
  });

  it('queue error prikazuje alert i retry', async () => {
    const draftsRefetch = vi.fn();
    const pendingRefetch = vi.fn();
    state.drafts = { data: undefined as unknown as typeof state.drafts.data, isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: draftsRefetch } as unknown as typeof state.drafts;
    state.pending = { data: undefined as unknown as typeof state.pending.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: pendingRefetch } as unknown as typeof state.pending;
    state.published = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    state.albums = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
    renderHome();
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    const retryBtns = screen.getAllByRole('button', { name: 'actions.retry' });
    await userEvent.click(retryBtns[retryBtns.length - 1]);
    expect(draftsRefetch).toHaveBeenCalled();
    expect(pendingRefetch).toHaveBeenCalled();
  });

  it('queue ima aria-label', () => {
    renderHome();
    expect(screen.getByLabelText('admin.content.queueLabel')).toBeInTheDocument();
  });

  it('prazan queue prikazuje noDrafts', () => {
    state.drafts = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    renderHome();
    expect(screen.getByText('admin.content.noDrafts')).toBeInTheDocument();
  });

  it('prikazuje status labelu', () => {
    renderHome();
    expect(screen.getByText('Nacrt')).toBeInTheDocument();
    expect(screen.getByText('Na pregledu')).toBeInTheDocument();
  });
});
