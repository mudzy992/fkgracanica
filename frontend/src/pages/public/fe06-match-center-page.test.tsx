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

  it('dok se utakmica učitava prikazuje tri skeletona', () => {
    state.match = { data: undefined, isLoading: true, isError: false };
    const { container } = renderPage();
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
    expect(screen.queryByTestId('score-hero')).toBeNull();
  });

  it('greška prikazuje poruku i link na ligu', () => {
    state.match = { data: undefined, isLoading: false, isError: true };
    renderPage();
    expect(screen.getByText('pages.matchCenter.notFound')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'pages.matchCenter.backToLeague' }).getAttribute('href'),
    ).toBe('/liga');
  });

  it('bez podataka također prikazuje poruku', () => {
    renderPage();
    expect(screen.getByText('pages.matchCenter.notFound')).toBeTruthy();
  });

  it('prikazuje sve sekcije sa podacima', () => {
    state.match = { data: match(), isLoading: false, isError: false };
    renderPage();
    expect(screen.getByTestId('score-hero')).toBeTruthy();
    expect(screen.getByTestId('highlights')).toBeTruthy();
    expect(screen.getByTestId('lineup')).toBeTruthy();
    expect(screen.getByTestId('statistics')).toBeTruthy();
    expect(screen.getByTestId('events')).toBeTruthy();
    expect(screen.getByTestId('related-news')).toBeTruthy();
    expect(state.roles).toContain('events:2');
  });

  it('SEO koristi podatke utakmice i putanju', () => {
    state.match = { data: match(), isLoading: false, isError: false };
    state.settings = { data: { 'club.crestUrl': 'originals/crest.png' } };
    renderPage();
    expect(state.seo[0].url).toBe('/utakmice/m1');
    expect(state.seo[0].type).toBe('article');
    expect(String(state.seo[0].image)).toContain('crest');
  });

  it('meta sadrži mjesto odigravanja', () => {
    state.match = { data: match(), isLoading: false, isError: false };
    renderPage();
    expect(screen.getByTestId('score-hero').getAttribute('data-meta')).toContain('Gradski stadion');
  });

  it('bez mjesta meta nema separator', () => {
    state.match = { data: match({ venue: null }), isLoading: false, isError: false };
    renderPage();
    expect(screen.getByTestId('score-hero').getAttribute('data-meta')).not.toContain('·');
  });

  it('loading stanja statistike i vijesti se prosljeđuju', () => {
    state.match = { data: match(), isLoading: false, isError: false };
    state.stats = { data: undefined, isLoading: true };
    state.news = { data: undefined, isLoading: true };
    renderPage();
    expect(screen.getByTestId('statistics').getAttribute('data-loading')).toBe('true');
    expect(screen.getByTestId('related-news').getAttribute('data-loading')).toBe('true');
  });
});
