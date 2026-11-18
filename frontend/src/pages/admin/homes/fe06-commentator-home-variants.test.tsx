import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorHome } from './CommentatorHome';

const state = vi.hoisted(() => ({
  matches: {
    data: [] as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  detail: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  },
  realtimeIds: [] as Array<string | undefined>,
  picks: {} as Record<string, unknown>,
  counts: { live: 1, today: 2, drafts: 3, pending: 4 },
  permissions: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../hooks', () => ({
  useMatches: () => ({ ...state.matches }),
  useMatch: (id: string) => ({ id, ...state.detail, data: id ? state.detail.data : undefined }),
}));
vi.mock('../../../hooks/use-match-realtime', () => ({
  useMatchRealtime: (id: string | undefined) => state.realtimeIds.push(id),
}));
vi.mock('./commentator-desk', () => ({
  deskCounts: () => state.counts,
  deskHref: (match: { id: string }) => `/admin/live/${match.id}`,
  pickLive: () => state.picks.live ?? [],
  pickNeedsReport: () => state.picks.needsReport ?? [],
  pickToday: () => state.picks.today ?? [],
  pickAwaitingApproval: () => state.picks.pending ?? [],
  primaryDeskMatch: () => state.picks.primary,
}));
vi.mock('./CommentatorLiveHero', () => ({
  CommentatorLiveHero: (props: Record<string, unknown>) => (
    <div>hero-live:{String((props.match as { id?: string }).id)}</div>
  ),
}));
vi.mock('./CommentatorDeskList', () => ({
  CommentatorDeskList: (props: Record<string, unknown>) => (
    <div>lista:{(props.matches as unknown[]).length}:{String(props.isLoading)}</div>
  ),
}));

const match = (id: string) => ({ id });

const renderHome = () =>
  render(
    <MemoryRouter>
      <CommentatorHome />
    </MemoryRouter>,
  );

const allPerms = ['live.manage', 'matches.manage'];

beforeEach(() => {
  state.matches = {
    data: [match('m1')] as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
  } as unknown as typeof state.matches;
  state.detail = {
    data: { id: 'm1', status: 'LIVE' } as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
  } as unknown as typeof state.detail;
  state.picks = {
    live: [match('m1')],
    needsReport: [match('m2')],
    today: [match('m2')],
    pending: [match('m1')],
    primary: match('m1'),
  };
  state.counts = { live: 1, today: 2, drafts: 3, pending: 4 };
  state.permissions = [...allPerms];
  state.realtimeIds = [];
});

describe('CommentatorHome — varijante KPI (4 grane counts)', () => {
  it('kad live count je 0 prikazuje 0', () => {
    state.counts = { live: 0, today: 2, drafts: 3, pending: 4 };
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad today count je 0 prikazuje 0', () => {
    state.counts = { live: 1, today: 0, drafts: 3, pending: 4 };
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad drafts count je 0 prikazuje 0', () => {
    state.counts = { live: 1, today: 2, drafts: 0, pending: 4 };
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad pending count je 0 prikazuje 0', () => {
    state.counts = { live: 1, today: 2, drafts: 3, pending: 0 };
    renderHome();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('kad svi count 0 prikazuje 0 x4', () => {
    state.counts = { live: 0, today: 0, drafts: 0, pending: 0 };
    renderHome();
    expect(screen.getAllByText('0').length).toBe(4);
  });
});

describe('CommentatorHome — varijante permisija i lastUpdated', () => {
  it('bez permisija nema href i nema akcija', () => {
    state.permissions = [];
    renderHome();
    expect(screen.queryByRole('link', { name: 'admin.commentator.openDesk' })).toBeNull();
  });

  it('kad dataUpdatedAt 0 nema lastUpdated', () => {
    state.matches = { data: [match('m1')] as unknown, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.matches;
    renderHome();
    expect(screen.queryByText('admin.home.lastUpdated')).toBeNull();
  });

  it('kad matches prazan nema hero', () => {
    state.picks = {};
    state.detail = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    expect(screen.queryByText(/hero-live:/)).toBeNull();
  });

  it('kad liveDetail loading prikazuje skeleton', () => {
    state.detail = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});
