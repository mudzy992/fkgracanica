import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const homeState = vi.hoisted(() => ({
  players: undefined as unknown,
  playersLoading: false,
  matches: undefined as unknown,
  matchesLoading: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/media', () => ({ mediaUrl: () => null }));
vi.mock('../../hooks', () => ({
  usePlayers: () => ({ data: homeState.players, isLoading: homeState.playersLoading }),
  useMatches: () => ({ data: homeState.matches, isLoading: homeState.matchesLoading }),
}));

import { FeaturedPlayers } from './sections/FeaturedPlayers';
import { NextMatch } from './sections/NextMatch';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{c}</MemoryRouter></QueryClientProvider>;
}

describe('fe06-batch67b home sections', () => {
  beforeEach(() => {
    homeState.players = undefined;
    homeState.playersLoading = false;
    homeState.matches = undefined;
    homeState.matchesLoading = false;
  });

  it('FeaturedPlayers pokriva player.number ?? "?"', () => {
    homeState.players = [{ id: '1', isActive: true, firstName: 'A', lastName: 'B', position: 'FW', photoPath: null }] as unknown as never;
    const { container } = render(wrap(<FeaturedPlayers />));
    expect(container.textContent).toContain('?');
    homeState.players = [{ id: '1', isActive: true, firstName: 'A', lastName: 'B', position: 'FW', number: 9, photoPath: null }] as unknown as never;
    const { container: c2 } = render(wrap(<FeaturedPlayers />));
    expect(c2.textContent).toContain('9');
  });

  it('NextMatch pokriva isLoading true granu', () => {
    homeState.matchesLoading = true;
    const { container: c1 } = render(wrap(<NextMatch />));
    expect(c1.innerHTML).toContain('h-32');
    homeState.matchesLoading = false;
    homeState.matches = [] as unknown as never;
    const { container: c2 } = render(wrap(<NextMatch />));
    expect(c2.textContent).toContain('common.noResults');
  });

  it('NextMatch pokriva next ? branch', () => {
    homeState.matchesLoading = false;
    const future = new Date(Date.now() + 86400000).toISOString();
    homeState.matches = [{ id: 'm1', status: 'SCHEDULED', scheduledAt: future, homeClub: { name: 'A' }, awayClub: { name: 'B' } }] as unknown as never;
    const { container } = render(wrap(<NextMatch />));
    expect(container.textContent).toContain('A');
  });
});
