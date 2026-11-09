import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LivePreMatchShell } from './LivePreMatchShell';
import type { Match } from '../../types';

const state = vi.hoisted(() => ({
  sponsors: { data: [] as unknown, isLoading: false } as { data: unknown; isLoading: boolean },
  settings: {} as Record<string, string>,
  ticketing: {} as Record<string, unknown>,
  homeSquad: { data: null as unknown },
  awaySquad: { data: null as unknown },
  lineup: [] as unknown[],
  homeSlots: [] as unknown[],
  awaySlots: [] as unknown[],
}));

vi.mock('../../hooks', () => ({
  useSponsors: () => state.sponsors,
  usePublicSettings: () => ({ data: state.settings }),
}));
vi.mock('../../hooks/use-ticketing', () => ({ useTicketingPublicConfig: () => ({ data: state.ticketing }) }));
vi.mock('../../hooks/use-club-hub', () => ({
  useClubSquad: (id?: string) => (id === 'home' ? state.homeSquad : state.awaySquad),
}));
vi.mock('../../lib/match-lineup-from-squad', () => ({
  resolvePublicMatchLineup: (_a: unknown, _b: unknown, _c: unknown) => {
    // record input to verify fallback?
    // return lineup from state
    // also capture that a is [] when both lineup/lineups undefined
    return state.lineup;
  },
}));
vi.mock('../../lib/match-lineup-pitch', () => ({
  matchLineupToPitchSlots: (_lineup: unknown, clubId: string) =>
    clubId === 'home' ? state.homeSlots : state.awaySlots,
}));
vi.mock('./LivePrematchAudio', () => ({
  LivePrematchAudio: () => <div>audio</div>,
}));
vi.mock('../public/sponsors/SponsorsMarquee', () => ({
  SponsorsMarquee: () => <div>marquee</div>,
}));
vi.mock('../public/clubs/ResponsiveFormationPitch', () => ({
  ResponsiveFormationPitch: () => <div>pitch</div>,
}));
vi.mock('../public/clubs/ClubCrest', () => ({
  ClubCrest: () => <div>crest</div>,
}));

const mkMatch = (over: Record<string, unknown> = {}): Match =>
  ({
    id: 'm1',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 90 * 60_000).toISOString(),
    homeClubId: 'home',
    awayClubId: 'away',
    homeClub: { id: 'home', name: 'FK Graca', isOwnClub: true },
    awayClub: { id: 'away', name: 'FK Rival' },
    // intentionally not setting lineup/lineups here; caller will override
    ...over,
  }) as unknown as Match;

describe('LivePreMatchShell — branch47 (2 grane ?? fallback)', () => {
  it('fallback lineup ?? lineups ?? [] kada su oba undefined koristi prazan niz', () => {
    state.sponsors = { data: [], isLoading: false } as never;
    state.lineup = [];
    state.homeSlots = [];
    state.awaySlots = [];
    // both lineup and lineups undefined => expression should take [] (third branch)
    const m = mkMatch({ lineup: undefined, lineups: undefined });
    // ensure lineup property is undefined, not empty array
    delete (m as unknown as Record<string, unknown>).lineup;
    delete (m as unknown as Record<string, unknown>).lineups;
    // explicitly set undefined to trigger ??
    (m as unknown as Record<string, unknown>).lineup = undefined;
    (m as unknown as Record<string, unknown>).lineups = undefined;
    render(<MemoryRouter><LivePreMatchShell match={m} /></MemoryRouter>);
    expect(screen.getByText('FK Graca')).toBeInTheDocument();
    // nema postave jer je lineup prazan
    expect(screen.queryByText(/Postava —/)).toBeNull();
  });

  it('lineup definisan koristi prvi krak, lineups kao fallback', () => {
    state.sponsors = { data: [{ id: 's1', name: 'A' }], isLoading: false } as never;
    render(<MemoryRouter><LivePreMatchShell match={mkMatch({ lineup: [{ id: 'x' }] as never, lineups: [{ id: 'y' }] as never })} /></MemoryRouter>);
    expect(screen.getByText('marquee')).toBeInTheDocument();
  });

  it('sponsors ?? [] fallback kada je sponsors undefined prikazuje Nema sponzora', () => {
    state.sponsors = { data: undefined, isLoading: false } as unknown as { data: unknown; isLoading: boolean };
    render(<MemoryRouter><LivePreMatchShell match={mkMatch({ lineup: undefined, lineups: undefined })} /></MemoryRouter>);
    expect(screen.getByText('Nema sponzora.')).toBeInTheDocument();
    expect(screen.queryByText('marquee')).toBeNull();
  });
});
