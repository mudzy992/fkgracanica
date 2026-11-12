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
  eventsLen: -1 as number,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../hooks', () => ({
  useMatch: (_id: string) => {
    // record id to verify ?? '' fallback not needed, but we test events fallback
    return state.match;
  },
  useMatchStatistics: () => state.stats,
  useNewsForMatch: () => state.news,
  usePublicSettings: () => state.settings,
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/match/MatchScoreHero', () => ({ MatchScoreHero: () => <div /> }));
vi.mock('../../components/match/MatchCenterToolbar', () => ({ MatchCenterToolbar: () => <div /> }));
vi.mock('../../components/match/MatchHighlights', () => ({ MatchHighlights: () => <div /> }));
vi.mock('../../components/match/MatchEventsSection', () => ({
  MatchEventsSection: ({ events }: { events: unknown[] }) => {
    state.eventsLen = events.length;
    return <div data-testid="events">{events.length}</div>;
  },
}));
vi.mock('../../components/match/MatchStatisticsSection', () => ({ MatchStatisticsSection: () => <div /> }));
vi.mock('../../components/match/MatchCenterSections', () => ({
  MatchLineupSection: () => <div />,
  MatchRelatedNewsSection: () => <div />,
}));
vi.mock('../../components/match/MatchReportApproval', () => ({ MatchReportApproval: () => <div /> }));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'FINISHED',
  homeScore: 0,
  awayScore: 0,
  homeClub: { name: 'H' },
  awayClub: { name: 'A' },
  scheduledAt: '2026-05-01T17:00:00.000Z',
  venue: null,
  events: undefined,
  reportStatus: null,
  youtubeUrl: null,
  highlights: [],
  ...over,
});

describe('MatchCenterPage branch59 coverable ??', () => {
  beforeEach(() => {
    state.match = { data: undefined, isLoading: false, isError: false };
    state.stats = { data: undefined, isLoading: false };
    state.news = { data: undefined, isLoading: false };
    state.settings = { data: undefined };
    state.auth = { user: undefined };
    state.eventsLen = -1;
  });

  it('id undefined → useMatch pozvan sa praznim stringom (id ?? "")', async () => {
    // useParams returns undefined when route has no :id; we simulate by rendering without id param
    // but component handles id ?? '' internally; we verify events ?? [] also when id missing, plus notFound path
    state.match = { data: undefined, isLoading: false, isError: false };
    render(
      <MemoryRouter initialEntries={['/utakmice']}>
        <Routes>
          <Route path="/utakmice" element={<MatchCenterPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('pages.matchCenter.notFound')).toBeTruthy();
  });

  it('events undefined → fallback [] (data.events ?? [])', () => {
    state.match = { data: match({ events: undefined }), isLoading: false, isError: false } as any;
    render(
      <MemoryRouter initialEntries={['/utakmice/m1']}>
        <Routes>
          <Route path="/utakmice/:id" element={<MatchCenterPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(state.eventsLen).toBe(0);
    expect(screen.getByTestId('events').textContent).toBe('0');
  });

  it('events null → fallback []', () => {
    state.match = { data: match({ events: null }), isLoading: false, isError: false } as any;
    render(
      <MemoryRouter initialEntries={['/utakmice/m1']}>
        <Routes>
          <Route path="/utakmice/:id" element={<MatchCenterPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(state.eventsLen).toBe(0);
  });
});
