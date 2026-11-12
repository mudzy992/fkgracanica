import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorHome } from './CommentatorHome';

const state = vi.hoisted(() => ({
  matches: { data: [] as unknown, isLoading: false, isError: false },
  detail: undefined as unknown,
  refetch: vi.fn(),
  picks: {} as Record<string, unknown>,
  counts: { live: 1, today: 2, drafts: 3, pending: 4 },
  hrefs: [] as string[],
  realtimeIds: [] as Array<string | undefined>,
  hero: {} as Record<string, unknown>,
  desk: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../../hooks', () => ({
  useMatches: () => ({ ...state.matches, refetch: state.refetch }),
  useMatch: (id: string) => ({ id, data: id ? state.detail : undefined }),
}));
vi.mock('../../../hooks/use-match-realtime', () => ({
  useMatchRealtime: (id: string | undefined) => state.realtimeIds.push(id),
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

beforeEach(() => {
  state.matches = { data: [match('m1'), match('m2')], isLoading: false, isError: false };
  state.detail = { id: 'm1', status: 'LIVE' };
  state.refetch.mockReset();
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
  state.hero = {};
  state.desk = {};
});

describe('CommentatorHome — greška', () => {
  it('prikazuje poruku i retry koji osvježava utakmice', async () => {
    const user = userEvent.setup();
    state.matches = { data: undefined, isLoading: false, isError: true };
    renderHome();
    expect(screen.getByText('admin.home.matchesError')).toBeInTheDocument();
    expect(screen.getByText('admin.home.commentatorHintShort')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'actions.retry' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/lista:/)).toBeNull();
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

  it('dok se učitava vrijednosti su tri tačke', () => {
    state.matches = { data: undefined, isLoading: true, isError: false };
    renderHome();
    expect(screen.getAllByText('…')).toHaveLength(4);
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
    renderHome();
    expect(screen.queryByRole('button', { name: 'admin.commentator.openDesk' })).toBeNull();
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
    state.detail = undefined;
    renderHome();
    expect(screen.getByText('hero-live:m1')).toBeInTheDocument();
  });

  it('bez live utakmice realtime se ne pretplaćuje i hero izostaje', () => {
    state.picks = { today: [match('m2')] };
    renderHome();
    expect(state.realtimeIds.every((id) => id === undefined)).toBe(true);
    expect(screen.queryByText(/hero-live:/)).toBeNull();
    expect(screen.getByText('admin.commentator.today')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /admin.commentator.today/ })).toHaveLength(1);
  });
});
