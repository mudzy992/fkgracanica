import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveMatchPage } from './LiveMatchPage';

const state = vi.hoisted(() => ({
  match: { data: undefined as unknown, isLoading: false },
  settings: { data: undefined as unknown },
  realtimeIds: [] as (string | undefined)[],
  seo: [] as Record<string, unknown>[],
  shells: [] as { kind: string; id: string }[],
  clock: { minute: 67, phase: 'SECOND_HALF' },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useMatch: (id: string) => {
    state.realtimeIds.push(id);
    return state.match;
  },
  usePublicSettings: () => state.settings,
}));
vi.mock('../../hooks/use-match-realtime', () => ({
  useMatchRealtime: (id?: string) => {
    state.realtimeIds.push(id);
  },
}));
vi.mock('../../hooks/use-live-clock', () => ({ useLiveClock: () => state.clock }));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/live/LiveStreamBroadcast', () => ({
  LiveStreamBroadcast: ({ match }: { match: { id: string } }) => {
    state.shells.push({ kind: 'broadcast', id: match.id });
    return <div data-testid="live-broadcast" />;
  },
}));
vi.mock('../../components/live/LiveCenterShell', () => ({
  LiveCenterShell: ({ match, clock }: { match: { id: string }; clock: unknown }) => {
    state.shells.push({ kind: `center:${JSON.stringify(clock)}`, id: match.id });
    return <div data-testid="live-center" />;
  },
}));
vi.mock('../../components/live/LivePreMatchShell', () => ({
  LivePreMatchShell: ({ match }: { match: { id: string } }) => {
    state.shells.push({ kind: 'prematch', id: match.id });
    return <div data-testid="live-prematch" />;
  },
}));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'FINISHED',
  homeScore: 3,
  awayScore: 1,
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  liveStreamUrl: null,
  scheduledAt: '2026-05-01T17:00:00.000Z',
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/live/m1']}>
      <Routes>
        <Route path="/live/:id" element={<LiveMatchPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('LiveMatchPage', () => {
  beforeEach(() => {
    state.match = { data: undefined, isLoading: false };
    state.settings = { data: undefined };
    state.realtimeIds = [];
    state.seo = [];
    state.shells = [];
  });

  it('dok se utakmica učitava prikazuje skeleton', () => {
    state.match = { data: undefined, isLoading: true };
    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(state.shells).toHaveLength(0);
  });

  it('bez utakmice prikazuje poruku i link na ligu', () => {
    renderPage();
    expect(screen.getByText('pages.live.notFound')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'pages.live.backToLeague' }).getAttribute('href')).toBe(
      '/liga',
    );
  });

  it('zakazana utakmica ide u pre-match ljusku', () => {
    state.match = { data: match({ status: 'SCHEDULED' }), isLoading: false };
    renderPage();
    expect(screen.getByTestId('live-prematch')).toBeTruthy();
    expect(state.seo[0].title).toContain('Uskoro');
    expect(state.seo[0].url).toBe('/live/m1');
    expect(state.seo[0].type).toBe('article');
  });

  it('prenos uživo ima prioritet nad centrom', () => {
    state.match = {
      data: match({ status: 'LIVE', liveStreamUrl: 'https://stream/1' }),
      isLoading: false,
    };
    renderPage();
    expect(screen.getByTestId('live-broadcast')).toBeTruthy();
    expect(screen.queryByTestId('live-center')).toBeNull();
  });

  it('utakmica uživo bez prenosa ide u live centar sa satom', () => {
    state.match = { data: match({ status: 'LIVE' }), isLoading: false };
    renderPage();
    expect(screen.getByTestId('live-center')).toBeTruthy();
    expect(state.shells[0].kind).toBe(`center:${JSON.stringify(state.clock)}`);
  });

  it('poluvrijeme se tretira kao utakmica uživo', () => {
    state.match = { data: match({ status: 'HALFTIME', liveStreamUrl: '' }), isLoading: false };
    renderPage();
    expect(screen.getByTestId('live-center')).toBeTruthy();
  });

  it('završena utakmica prikazuje rezultat i status', () => {
    state.match = { data: match(), isLoading: false };
    const { container } = renderPage();
    expect(screen.getByText('FK Gračanica — FK Slavija')).toBeTruthy();
    expect(screen.getByText('3:1')).toBeTruthy();
    expect(screen.getByText('pages.live.notLive')).toBeTruthy();
    expect(container.textContent).toContain('Detalji utakmice');
    expect(screen.getByRole('link', { name: 'Liga' }).getAttribute('href')).toBe('/liga');
  });

  it('rezultat bez vrijednosti pada na nulu', () => {
    state.match = { data: match({ homeScore: null, awayScore: null }), isLoading: false };
    renderPage();
    expect(screen.getByText('0:0')).toBeTruthy();
  });

  it('SEO koristi grb iz postavki', () => {
    state.match = { data: match(), isLoading: false };
    state.settings = { data: { 'club.crestUrl': 'originals/crest.png' } };
    renderPage();
    expect(state.seo[0].image).toBeTruthy();
    expect(String(state.seo[0].image)).toContain('crest');
  });

  it('realtime pretplata dobiva id iz rute', () => {
    state.match = { data: match(), isLoading: false };
    renderPage();
    expect(state.realtimeIds).toContain('m1');
  });
});
