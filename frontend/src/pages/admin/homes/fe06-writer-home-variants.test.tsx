import { render, screen } from '@testing-library/react';
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
  useNewsList: (status: string) => {
    if (status === 'DRAFT') return state.drafts;
    if (status === 'PENDING') return state.pending;
    if (status === 'PUBLISHED') return state.published;
    return state.drafts;
  },
}));
vi.mock('../../../hooks/use-content-admin', () => ({
  useGalleryAdminList: () => state.albums,
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <WriterHome />
    </MemoryRouter>,
  );

const allPerms = ['news.manage', 'gallery.manage', 'media.read', 'media.upload'];

beforeEach(() => {
  state.drafts = { data: [{ id: 'n1', title: 'Nacrt', status: 'DRAFT' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
  state.pending = { data: [{ id: 'n2', title: 'Pending', status: 'PENDING' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
  state.published = { data: [{ id: 'n3', title: 'Pub', status: 'PUBLISHED' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
  state.albums = { data: [{ id: 'g1' }, { id: 'g2' }], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
  state.permissions = [...allPerms];
});

describe('WriterHome — varijante KPI (4 grane ??0)', () => {
  it('kad drafts.data je undefined koristi 0', () => {
    state.drafts = { data: undefined as unknown as typeof state.drafts.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    renderHome();
    // drafts 0, ostali 1,1,2 => ima 0
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad pending.data je null koristi 0', () => {
    state.pending = { data: null as unknown as typeof state.pending.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad published.data je undefined koristi 0', () => {
    state.published = { data: undefined as unknown as typeof state.published.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad albums.data je null koristi 0', () => {
    state.albums = { data: null as unknown as typeof state.albums.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad svi KPI nemaju data koristi 0 za sve', () => {
    state.drafts = { data: undefined as unknown as typeof state.drafts.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: undefined as unknown as typeof state.pending.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    state.published = { data: undefined as unknown as typeof state.published.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    state.albums = { data: undefined as unknown as typeof state.albums.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
    renderHome();
    expect(screen.getAllByText('0').length).toBe(4);
  });

  it('kad data ima 0 vrijednosti prikazuje 0 bez fallbacka', () => {
    state.drafts = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    state.published = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.published;
    state.albums = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.albums;
    renderHome();
    expect(screen.getAllByText('0').length).toBe(4);
  });
});

describe('WriterHome — varijante reda čekanja (3 grane ??0)', () => {
  it('kad drafts/pending nemaju data koristi prazan queue', () => {
    state.drafts = { data: undefined as unknown as typeof state.drafts.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: undefined as unknown as typeof state.pending.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    renderHome();
    expect(screen.getByText('admin.content.noDrafts')).toBeInTheDocument();
  });

  it('kad data ima null koristi prazan queue', () => {
    state.drafts = { data: null as unknown as typeof state.drafts.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: null as unknown as typeof state.pending.data, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    renderHome();
    expect(screen.getByText('admin.content.noDrafts')).toBeInTheDocument();
  });

  it('kad loading true prikazuje skeleton umjesto broja', () => {
    state.drafts = { data: [], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.drafts;
    state.pending = { data: [], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.pending;
    renderHome();
    expect(document.querySelector('[aria-busy=\"true\"]')).toBeTruthy();
    expect(screen.queryAllByText('…').length).toBe(0);
  });
});
