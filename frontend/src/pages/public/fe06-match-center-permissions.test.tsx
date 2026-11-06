import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchCenterPage } from './MatchCenterPage';

const state = vi.hoisted(() => ({
  match: { data: undefined as unknown, isLoading: false, isError: false },
  stats: { data: undefined as unknown, isLoading: false },
  news: { data: undefined as unknown, isLoading: false },
  settings: { data: undefined as unknown },
  auth: { user: undefined as unknown },
  seo: [] as Record<string, unknown>[],
  roles: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../hooks', () => ({
  useMatch: () => state.match,
  useMatchStatistics: () => state.stats,
  useNewsForMatch: () => state.news,
  usePublicSettings: () => state.settings,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/match/MatchScoreHero', () => ({
  MatchScoreHero: (props: Record<string, unknown>) => {
    state.roles.push('hero');
    return <div data-testid="score-hero" data-meta={String(props.meta)} />;
  },
}));
vi.mock('../../components/match/MatchCenterToolbar', () => ({
  MatchCenterToolbar: (props: Record<string, unknown>) => {
    state.roles.push(`toolbar:${String(props.canCommentate)}`);
    return <div data-testid="toolbar" />;
  },
}));
vi.mock('../../components/match/MatchHighlights', () => ({
  MatchHighlights: () => <div data-testid="highlights" />,
}));
vi.mock('../../components/match/MatchEventsSection', () => ({
  MatchEventsSection: ({ events }: { events: unknown[] }) => {
    state.roles.push(`events:${events.length}`);
    return <div data-testid="events" />;
  },
}));
vi.mock('../../components/match/MatchStatisticsSection', () => ({
  MatchStatisticsSection: ({ loading }: { loading?: boolean }) => (
    <div data-testid="statistics" data-loading={String(!!loading)} />
  ),
}));
vi.mock('../../components/match/MatchCenterSections', () => ({
  MatchLineupSection: () => <div data-testid="lineup" />,
  MatchRelatedNewsSection: ({ loading }: { loading?: boolean }) => (
    <div data-testid="related-news" data-loading={String(!!loading)} />
  ),
}));
vi.mock('../../components/match/MatchReportApproval', () => ({
  MatchReportApproval: ({ reportStatus }: { reportStatus?: string }) => {
    state.roles.push(`approval:${reportStatus}`);
    return <div data-testid="approval" />;
  },
}));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'FINISHED',
  homeScore: 2,
  awayScore: 0,
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  scheduledAt: '2026-05-01T17:00:00.000Z',
  venue: 'Gradski stadion',
  events: [{ id: 'e1' }, { id: 'e2' }],
  reportStatus: null,
  youtubeUrl: null,
  highlights: [],
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/utakmice/m1']}>
      <Routes>
        <Route path="/utakmice/:id" element={<MatchCenterPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('MatchCenterPage', () => {
  beforeEach(() => {
    state.match = { data: undefined, isLoading: false, isError: false };
    state.stats = { data: undefined, isLoading: false };
    state.news = { data: undefined, isLoading: false };
    state.settings = { data: undefined };
    state.auth = { user: undefined };
    state.seo = [];
    state.roles = [];
  });

  it('korisnik sa live.approve vidi odobravanje izvještaja', () => {
    state.match = { data: match({ reportStatus: 'PENDING_APPROVAL' }), isLoading: false, isError: false };
    state.auth = { user: { permissions: ['live.approve'] } };
    renderPage();
    expect(screen.getByTestId('approval')).toBeTruthy();
    expect(state.roles).toContain('approval:PENDING_APPROVAL');
  });

  it('korisnik bez dozvola ne vidi odobravanje', () => {
    state.match = { data: match(), isLoading: false, isError: false };
    renderPage();
    expect(screen.queryByTestId('approval')).toBeNull();
    expect(state.roles).toContain('toolbar:false');
  });

  it('komentator na završenoj utakmici bez izvještaja dobija poziv za izradu', () => {
    state.match = { data: match({ reportStatus: null }), isLoading: false, isError: false };
    state.auth = { user: { permissions: ['live.manage'] } };
    renderPage();
    expect(screen.getByRole('link', { name: 'pages.matchCenter.createReport' })).toBeTruthy();
    expect(state.roles).toContain('toolbar:true');
  });

  it('komentator na izvještaju koji čeka odobrenje dobija uređivanje', () => {
    state.match = {
      data: match({ reportStatus: 'PENDING_APPROVAL' }),
      isLoading: false,
      isError: false,
    };
    state.auth = { user: { permissions: ['live.manage'] } };
    renderPage();
    const link = screen.getByRole('link', { name: 'pages.matchCenter.editReport' });
    expect(link.getAttribute('href')).toBe('/admin/matches/m1/report');
  });

  it('komentator ne vidi poziv kada je utakmica u toku', () => {
    state.match = { data: match({ status: 'LIVE' }), isLoading: false, isError: false };
    state.auth = { user: { permissions: ['live.manage'] } };
    renderPage();
    expect(screen.queryByRole('link', { name: 'pages.matchCenter.createReport' })).toBeNull();
  });

  it('komentator ne vidi poziv kada je izvještaj već odobren', () => {
    state.match = { data: match({ reportStatus: 'APPROVED' }), isLoading: false, isError: false };
    state.auth = { user: { permissions: ['live.manage'] } };
    renderPage();
    expect(screen.queryByRole('link', { name: 'pages.matchCenter.createReport' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'pages.matchCenter.editReport' })).toBeNull();
  });
});
