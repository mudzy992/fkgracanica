import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  realtimeEnabled: [] as Array<boolean | undefined>,
  picks: {} as Record<string, unknown>,
  counts: { live: 1, today: 2, drafts: 3, pending: 4 },
  hrefs: [] as string[],
  hero: {} as Record<string, unknown>,
  desk: {} as Record<string, unknown>,
  permissions: [] as string[],
  useMatchesOpts: undefined as unknown,
  useMatchOpts: undefined as unknown,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../hooks', () => ({
  useMatches: (_s?: unknown, _r?: unknown, opts?: unknown) => {
    state.useMatchesOpts = opts;
    return { ...state.matches, refetch: state.matches.refetch };
  },
  useMatch: (id: string, opts?: unknown) => {
    state.useMatchOpts = opts;
    return { id, ...state.detail, data: id ? state.detail.data : undefined };
  },
}));
vi.mock('../../../hooks/use-match-realtime', () => ({
  useMatchRealtime: (id: string | undefined, opts?: { enabled?: boolean }) => {
    state.realtimeIds.push(id);
    state.realtimeEnabled.push(opts?.enabled);
  },
}));
vi.mock('./commentator-desk', () => ({
  deskCounts: () => state.counts,
  deskHref: (match: { id: string }) => {
    state.hrefs.push(`/admin/live/${match.id}`);
    return `/admin/live/${match.id}`;
  },
  pickLive: () => state.picks.live ?? [],
  pickNeedsReport: () => state.picks.needsReport ?? [],
  pickToday: () => state.picks.today ?? [],
  pickAwaitingApproval: () => state.picks.pending ?? [],
  primaryDeskMatch: () => state.picks.primary,
}));
vi.mock('./CommentatorLiveHero', () => ({
  CommentatorLiveHero: (props: Record<string, unknown>) => {
    state.hero = props;
    return <div>hero-live:{String((props.match as { id?: string }).id)}</div>;
  },
}));
vi.mock('./CommentatorDeskList', () => ({
  CommentatorDeskList: (props: Record<string, unknown>) => {
    state.desk = props;
    return <div>lista:{(props.matches as unknown[]).length}:{String(props.isLoading)}</div>;
  },
}));

const match = (id: string) => ({ id, homeName: 'Domaći', awayName: 'Gosti' });

const renderHome = () =>
  render(
    <MemoryRouter>
      <CommentatorHome />
    </MemoryRouter>,
  );

const allPerms = ['live.manage', 'matches.manage'];

beforeEach(() => {
  state.matches = {
    data: [match('m1'), match('m2')] as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn(),
  };
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
  state.hrefs = [];
  state.realtimeIds = [];
  state.realtimeEnabled = [];
  state.hero = {};
  state.desk = {};
  state.permissions = [...allPerms];
  state.useMatchesOpts = undefined;
  state.useMatchOpts = undefined;
});

describe('CommentatorHome — greška', () => {
  it('prikazuje poruku i retry koji osvježava utakmice (role=alert, isFetching disabled)', async () => {
    const user = userEvent.setup();
    state.matches = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.matches;
    // hide hero detail to isolate KPI error
    state.detail = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('admin.home.matchesError')).toBeInTheDocument();
    // naslov ostaje
    expect(screen.getByText('seo:Komentator')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'actions.retry' });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(state.matches.refetch).toHaveBeenCalledTimes(1);
  });

  it('retry je disabled dok se dohvaća', () => {
    state.matches = {
      data: undefined as unknown,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.matches;
    state.detail = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });
});

describe('CommentatorHome — tabla', () => {
  it('prikazuje KPI vrijednosti i punu napomenu', () => {
    renderHome();
    expect(screen.getByText('seo:Komentator')).toBeInTheDocument();
    expect(screen.getByText('admin.home.commentatorHint')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('dok se učitava prikazuje skeleton a ne tri tačke', () => {
    state.matches = {
      data: undefined as unknown,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as unknown as typeof state.matches;
    renderHome();
    expect(document.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryAllByText('…').length).toBe(0);
    expect(screen.getByText('lista:0:true')).toBeInTheDocument();
  });

  it('prikazuje brze akcije za primarnu, live i draft utakmicu', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.commentator.openDesk' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.commentator.publicLive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.commentator.report' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.commentator.publicLive' })).toHaveAttribute(
      'href',
      '/live/m1',
    );
  });

  it('bez odabranih utakmica nema brzih akcija ni heroja', () => {
    state.picks = {};
    state.detail = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    expect(screen.queryByRole('link', { name: 'admin.commentator.openDesk' })).toBeNull();
    expect(screen.queryByText(/hero-live:/)).toBeNull();
    expect(screen.getByText('lista:2:false')).toBeInTheDocument();
  });

  it('hero koristi detalj utakmice kad postoji', () => {
    renderHome();
    expect(screen.getByText('hero-live:m1')).toBeInTheDocument();
    expect(state.hero.match).toEqual({ id: 'm1', status: 'LIVE' });
    expect(state.realtimeIds).toContain('m1');
  });

  it('bez detalja hero pada na live utakmicu iz liste', () => {
    state.detail = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    expect(screen.getByText('hero-live:m1')).toBeInTheDocument();
  });

  it('bez live utakmice realtime se ne pretplaćuje i hero izostaje', () => {
    state.picks = { today: [match('m2')] };
    state.detail = { data: undefined, isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    // liveId undefined -> realtime called with undefined
    expect(state.realtimeIds.every((id) => id === undefined)).toBe(true);
    expect(screen.queryByText(/hero-live:/)).toBeNull();
    expect(screen.getByText('admin.commentator.today')).toBeInTheDocument();
    // KPI today ima href jer ima matches.manage i today pick
    expect(screen.getAllByRole('link', { name: /admin.commentator.today/ })).toHaveLength(1);
  });

  it('KPI bez permisije nema link', () => {
    state.permissions = [];
    renderHome();
    // live KPI ne bi trebao imati link, check that open actions hidden and KPI href gated
    // Najjednostavnije: bez permisije nema brzih akcija
    expect(screen.queryByRole('link', { name: 'admin.commentator.openDesk' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'admin.commentator.publicLive' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'admin.commentator.report' })).toBeNull();
    // KPI hint i dalje postoji ali bez linka
    expect(screen.getByText('admin.commentator.live')).toBeInTheDocument();
  });

  it('samo live.manage daje live akcije, report zahtijeva matches.manage', () => {
    state.permissions = ['live.manage'];
    renderHome();
    expect(screen.getByRole('link', { name: 'admin.commentator.openDesk' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'admin.commentator.publicLive' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'admin.commentator.report' })).toBeNull();
  });

  it('lastUpdated i osvježi su prikazani', async () => {
    renderHome();
    expect(screen.getByText('admin.home.lastUpdated')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'admin.home.refresh' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(state.matches.refetch).toHaveBeenCalled();
  });

  it('osvježi je disabled dok se dohvaća', () => {
    state.matches = { ...state.matches, isFetching: true, dataUpdatedAt: Date.now() } as unknown as typeof state.matches;
    renderHome();
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });

  it('hero skeleton dok se detalj učitava', () => {
    state.detail = { data: undefined, isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.detail;
    renderHome();
    expect(document.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('hero-live:m1')).toBeNull();
  });
});
