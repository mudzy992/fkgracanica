import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LivePreMatchShell } from './LivePreMatchShell';
import type { Match } from '../../types';

const state = vi.hoisted(() => ({
  sponsors: { data: [] as Array<{ id: string; name: string }>, isLoading: false },
  settings: {} as Record<string, string>,
  ticketing: {} as Record<string, unknown>,
  homeSquad: { data: null as unknown },
  awaySquad: { data: null as unknown },
  homeSlots: [] as Array<Record<string, unknown>>,
  awaySlots: [] as Array<Record<string, unknown>>,
  lineup: [] as Array<Record<string, unknown>>,
  audio: {} as { url?: string; active?: boolean },
  pitch: {} as Record<string, unknown>,
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
  resolvePublicMatchLineup: () => state.lineup,
}));
vi.mock('../../lib/match-lineup-pitch', () => ({
  matchLineupToPitchSlots: (_lineup: unknown, clubId: string) =>
    clubId === 'home' ? state.homeSlots : state.awaySlots,
}));
vi.mock('./LivePrematchAudio', () => ({
  LivePrematchAudio: (props: { url?: string; active?: boolean }) => {
    state.audio = props;
    return <div>audio:{props.url || '-'}:{String(!!props.active)}</div>;
  },
}));
vi.mock('../public/sponsors/SponsorsMarquee', () => ({
  SponsorsMarquee: ({ sponsors, reverse }: { sponsors: Array<{ name: string }>; reverse?: boolean }) => (
    <div>{reverse ? 'marquee-rev' : 'marquee'}:{sponsors.map((s) => s.name).join('|') || '-'}</div>
  ),
}));
vi.mock('../public/clubs/ResponsiveFormationPitch', () => ({
  ResponsiveFormationPitch: (props: Record<string, unknown>) => {
    state.pitch = props;
    return <div>pitch:{(props.slots as unknown[]).length}</div>;
  },
}));
vi.mock('../public/clubs/ClubCrest', () => ({
  ClubCrest: ({ club }: { club?: { name?: string } }) => <div>grb:{club?.name ?? '-'}</div>,
}));

const match = (over: Partial<Match> = {}): Match => ({
  id: 'm1',
  status: 'SCHEDULED',
  scheduledAt: new Date(Date.now() + 90 * 60_000).toISOString(),
  homeClubId: 'home',
  awayClubId: 'away',
  homeClub: { id: 'home', name: 'FK Graca', isOwnClub: true },
  awayClub: { id: 'away', name: 'FK Rival' },
  lineups: [],
  ...over,
}) as unknown as Match;

const renderShell = (m: Match = match()) =>
  render(<MemoryRouter><LivePreMatchShell match={m} /></MemoryRouter>);

beforeEach(() => {
  Object.assign(state, {
    sponsors: { data: [], isLoading: false }, settings: {}, ticketing: {},
    homeSquad: { data: null }, awaySquad: { data: null },
    homeSlots: [], awaySlots: [], lineup: [], pitch: {},
  });
});

afterEach(() => { vi.useRealTimers(); });

describe('LivePreMatchShell — zaglavlje i odbrojavanje', () => {
  it('prikazuje oba kluba i odbrojavanje do početka', () => {
    renderShell();
    expect(screen.getByText('FK Graca')).toBeInTheDocument();
    expect(screen.getByText('FK Rival')).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:\d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.queryByText(/Utakmica uskoro počinje/)).toBeNull();
  });

  it('nakon proteka vremena prikazuje poruku da utakmica počinje', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));
    renderShell(match({ scheduledAt: '2026-05-01T12:00:05.000Z' }));
    expect(screen.getByText('00:00:05')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByText('Utakmica uskoro počinje…')).toBeInTheDocument();
  });

  it('audio se aktivira samo kad je podešen URL', () => {
    const { unmount } = renderShell();
    expect(screen.getByText('audio:-:false')).toBeInTheDocument();
    unmount();
    state.settings = { 'live.prematchAudioUrl': 'https://cdn/himna.mp3' };
    renderShell();
    expect(screen.getByText('audio:https://cdn/himna.mp3:true')).toBeInTheDocument();
  });
});

describe('LivePreMatchShell — postava', () => {
  it('bez postave nema sekcije terena', () => {
    renderShell();
    expect(screen.queryByText(/Postava —/)).toBeNull();
    expect(screen.queryByText(/^pitch:/)).toBeNull();
  });

  it('prikazuje domaću postavu i dodatne startere iz zapisa', () => {
    state.homeSlots = [{ playerId: 'p1' }];
    state.lineup = [
      { clubId: 'home', isStarter: true, playerId: 'p1', player: { firstName: 'Amar', lastName: 'Agić' } },
      { clubId: 'home', isStarter: true, playerId: 'p2', player: { firstName: 'Emir', lastName: 'Begić' } },
      { clubId: 'home', isStarter: false, playerId: 'p3', player: { firstName: 'Rez', lastName: 'Erva' } },
    ];
    renderShell();
    expect(screen.getByText('Postava — FK Graca')).toBeInTheDocument();
    expect(screen.getByText('pitch:1')).toBeInTheDocument();
    expect(screen.getByText(/Ostali spremljeni starteri: Emir Begić/)).toBeInTheDocument();
    expect(state.pitch).toMatchObject({ premium: true, enlarged: true, compact: true });
  });

  it('naizmjenično prikazuje gostujuću postavu', () => {
    vi.useFakeTimers();
    state.homeSlots = [{ playerId: 'p1' }];
    state.awaySlots = [{ playerId: 'p9' }];
    renderShell();
    expect(screen.getByText('Postava — FK Graca')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(12_000); });
    expect(screen.getByText('Postava — FK Rival')).toBeInTheDocument();
  });

  it('gostujuća postava se prikazuje odmah kad domaća nije dostupna', () => {
    state.awaySlots = [{ playerId: 'p9' }];
    renderShell();
    expect(screen.getByText('Postava — FK Rival')).toBeInTheDocument();
  });
});

describe('LivePreMatchShell — sponzori i pozivi', () => {
  it('dok se sponzori učitavaju prikazuje skeleton bez marquee-a', () => {
    state.sponsors = { data: [], isLoading: true };
    const { container } = renderShell();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    expect(screen.queryByText(/^marquee/)).toBeNull();
  });

  it('bez sponzora prikazuje poruku', () => {
    renderShell();
    expect(screen.getByText('Nema sponzora.')).toBeInTheDocument();
  });

  it('dijeli sponzore u dva marquee-a', () => {
    state.sponsors = { data: [{ id: 's1', name: 'A' }, { id: 's2', name: 'B' }, { id: 's3', name: 'C' }], isLoading: false };
    renderShell();
    expect(screen.getByText('marquee:A|B')).toBeInTheDocument();
    expect(screen.getByText('marquee-rev:C')).toBeInTheDocument();
  });

  it('jedan sponzor ide samo u prvi marquee', () => {
    state.sponsors = { data: [{ id: 's1', name: 'A' }], isLoading: false };
    renderShell();
    expect(screen.getByText('marquee:A')).toBeInTheDocument();
    expect(screen.queryByText(/^marquee-rev/)).toBeNull();
  });

  it('CTA za ulaznice traži sve uslove, a linkovi detalja uvijek postoje', () => {
    const { unmount } = renderShell(match({ homeClub: { id: 'home', name: 'FK Graca', isOwnClub: false } as never }));
    expect(screen.queryByRole('link', { name: 'Kupi ulaznice' })).toBeNull();
    unmount();
    renderShell();
    expect(screen.queryByRole('link', { name: 'Kupi ulaznice' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Detalji utakmice' })).toHaveAttribute('href', '/utakmice/m1');
    expect(screen.getByRole('link', { name: 'Liga' })).toHaveAttribute('href', '/liga');
  });

  it('ulaznice se nude kad su uključene obje prodaje i modul', () => {
    state.ticketing = { modulesTicketing: true, salesModes: { online: true, boxOffice: false } };
    renderShell();
    expect(screen.getByRole('link', { name: 'Kupi ulaznice' })).toHaveAttribute('href', '/ulaznice?matchId=m1');
  });

  it('isključen modul ulaznica gasi CTA', () => {
    state.settings = { 'modules.ticketing': 'false' };
    state.ticketing = { modulesTicketing: true, salesModes: { online: true, boxOffice: true } };
    renderShell();
    expect(screen.queryByRole('link', { name: 'Kupi ulaznice' })).toBeNull();
  });
});
