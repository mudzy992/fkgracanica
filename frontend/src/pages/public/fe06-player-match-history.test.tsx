import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerMatchHistory } from './team/PlayerMatchHistory';

const state = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: Record<string, unknown>) => (o ? `${k}:${JSON.stringify(o)}` : k),
  }),
}));
vi.mock('../../lib/api', () => ({ api: { get: (...a: unknown[]) => state.apiGet(...(a as [])) } }));

const renderHistory = (playerId = 'p1') => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PlayerMatchHistory playerId={playerId} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('PlayerMatchHistory', () => {
  beforeEach(() => {
    state.apiGet = vi.fn(async () => ({ data: [] }));
  });

  const history = (playerId = 'p1') => renderHistory(playerId);

  it('dok se utakmice učitavaju prikazuje poruku', () => {
    state.apiGet = vi.fn(() => new Promise(() => {}));
    history();
    expect(screen.getByText('pages.player.loadingMatches')).toBeTruthy();
  });

  it('prazna lista ne prikazuje sekciju', async () => {
    history();
    await waitFor(() => expect(state.apiGet).toHaveBeenCalled());
    expect(screen.queryByText('pages.player.matches')).toBeNull();
  });

  it('bez id-a igrača upit je isključen', () => {
    history('');
    expect(state.apiGet).not.toHaveBeenCalled();
    expect(screen.queryByText('pages.player.matches')).toBeNull();
  });

  it('završena utakmica prikazuje rezultat, startnu postavu i golove', async () => {
    state.apiGet = vi.fn(async () => ({
      data: [
        {
          matchId: 'm1',
          scheduledAt: '2026-05-01T17:00:00.000Z',
          status: 'FINISHED',
          home: 'FK Gračanica',
          away: 'FK Slavija',
          homeScore: 3,
          awayScore: 1,
          isStarter: true,
          events: [
            { type: 'GOAL', minute: 10 },
            { type: 'PENALTY_SCORED', minute: 60 },
            { type: 'YELLOW_CARD', minute: 70 },
          ],
        },
      ],
    }));
    const { container } = history();
    await waitFor(() => expect(screen.getByText('pages.player.matches')).toBeTruthy());
    expect(container.textContent).toContain('FK Gračanica');
    expect(container.textContent).toContain('3:1');
    expect(container.textContent).toContain('pages.player.starter');
    expect(container.textContent).toContain('pages.player.goalsCount:{"count":2}');
    expect(state.apiGet).toHaveBeenCalledWith('/players/p1/matches');
  });

  it('utakmica koja nije završena prikazuje crticu i klupu bez golova', async () => {
    state.apiGet = vi.fn(async () => ({
      data: [
        {
          matchId: 'm2',
          scheduledAt: '2026-06-01T17:00:00.000Z',
          status: 'SCHEDULED',
          home: 'FK Radnik',
          away: 'FK Gračanica',
          homeScore: 0,
          awayScore: 0,
          isStarter: false,
          events: [],
        },
      ],
    }));
    const { container } = history();
    await waitFor(() => expect(screen.getByText('pages.player.matches')).toBeTruthy());
    expect(container.textContent).toContain('–');
    expect(container.textContent).toContain('pages.player.bench');
    expect(container.textContent).not.toContain('pages.player.goalsCount');
  });
});

