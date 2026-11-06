import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveHalftimePanel } from './LiveHalftimePanel';
import type { Match } from '../../types';

const state = vi.hoisted(() => ({
  settings: { data: undefined as unknown },
  sponsors: { data: undefined as unknown, isLoading: false },
  stats: { data: undefined as unknown, isLoading: false },
  statMatchIds: [] as (string | undefined)[],
  marquees: [] as { count: number; reverse?: boolean }[],
  audio: [] as { url: string; active: boolean }[],
  halftimeStats: [] as { loading?: boolean }[],
}));

vi.mock('../../hooks', () => ({
  usePublicSettings: () => state.settings,
  useSponsors: () => state.sponsors,
  useMatchStatistics: (id?: string) => {
    state.statMatchIds.push(id);
    return state.stats;
  },
}));
vi.mock('../public/sponsors/SponsorsMarquee', () => ({
  SponsorsMarquee: ({ sponsors, reverse }: { sponsors: unknown[]; reverse?: boolean }) => {
    state.marquees.push({ count: sponsors.length, reverse });
    return <div data-testid={`marquee-${reverse ? 'rev' : 'fwd'}`} />;
  },
}));
vi.mock('./LiveHalftimeStats', () => ({
  LiveHalftimeStats: ({ loading }: { loading?: boolean }) => {
    state.halftimeStats.push({ loading });
    return <div data-testid="halftime-stats" />;
  },
}));
vi.mock('./LivePrematchAudio', () => ({
  LivePrematchAudio: ({ url, active }: { url: string; active: boolean }) => {
    state.audio.push({ url, active });
    return <div data-testid="prematch-audio" />;
  },
}));

const match = (over: Record<string, unknown> = {}) =>
  ({
    id: 'm1',
    homeScore: 2,
    awayScore: 1,
    homeClub: { name: 'FK Gračanica', crestPath: 'originals/c/g.png' },
    awayClub: { name: 'FK Slavija', crestPath: null },
    liveBreak: 'REGULAR_HT',
    ...over,
  }) as unknown as Match;

describe('LiveHalftimePanel', () => {
  beforeEach(() => {
    state.settings = { data: undefined };
    state.sponsors = { data: [], isLoading: false };
    state.stats = { data: [], isLoading: false };
    state.statMatchIds = [];
    state.marquees = [];
    state.audio = [];
    state.halftimeStats = [];
  });

  it('prikazuje rezultat, klubove i oznaku poluvremena', () => {
    const { container } = render(<LiveHalftimePanel match={match()} />);
    expect(screen.getByText('Poluvrijeme')).toBeTruthy();
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('FK Slavija')).toBeTruthy();
    const score = container.querySelector('.font-display.text-4xl') as HTMLElement;
    expect(score.textContent).toBe('2:1');
    expect(screen.getByText('Naši partneri')).toBeTruthy();
  });

  it.each([
    ['ET_HT', 'Pauza produžetaka'],
    ['POST_REGULATION', 'Neriješeno — čeka se odluka'],
    ['POST_EXTRA', 'Neriješeno — penali uskoro'],
    [undefined, 'Poluvrijeme'],
  ])('liveBreak %s daje naslov %s', (liveBreak, title) => {
    render(<LiveHalftimePanel match={match({ liveBreak })} />);
    expect(screen.getByText(title)).toBeTruthy();
  });

  it('compact režim skriva rezultat i zaglavlje', () => {
    render(<LiveHalftimePanel match={match()} compact />);
    expect(screen.queryByText('Poluvrijeme')).toBeNull();
    expect(screen.getByText('Naši partneri')).toBeTruthy();
  });

  it('audio koristi URL iz postavki', () => {
    state.settings = { data: { 'live.prematchAudioUrl': 'https://cdn/audio.mp3' } };
    render(<LiveHalftimePanel match={match()} />);
    expect(state.audio[0]).toEqual({ url: 'https://cdn/audio.mp3', active: true });
  });

  it('bez audio URL-a komponenta je neaktivna', () => {
    render(<LiveHalftimePanel match={match()} />);
    expect(state.audio[0]).toEqual({ url: '', active: false });
  });

  it('dok se sponzori učitavaju prikazuje skeleton', () => {
    state.sponsors = { data: undefined, isLoading: true };
    const { container } = render(<LiveHalftimePanel match={match()} />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(state.marquees).toHaveLength(0);
  });

  it('bez sponzora prikazuje poruku', () => {
    render(<LiveHalftimePanel match={match()} />);
    expect(screen.getByText('Nema sponzora.')).toBeTruthy();
  });

  it('sponzori se dijele u dvije trake', () => {
    state.sponsors = { data: [1, 2, 3, 4, 5], isLoading: false };
    render(<LiveHalftimePanel match={match()} />);
    expect(state.marquees).toEqual([
      { count: 3, reverse: undefined },
      { count: 2, reverse: true },
    ]);
  });

  it('jedan sponzor daje samo jednu traku', () => {
    state.sponsors = { data: [{ id: 's1' }], isLoading: false };
    render(<LiveHalftimePanel match={match()} />);
    expect(state.marquees).toEqual([{ count: 1, reverse: undefined }]);
  });

  it('statistika se traži za regularno poluvrijeme', () => {
    render(<LiveHalftimePanel match={match({ liveBreak: 'REGULAR_HT' })} />);
    expect(state.statMatchIds[0]).toBe('m1');
    expect(screen.getByText('Statistika — 1. poluvrijeme')).toBeTruthy();
    expect(screen.getByTestId('halftime-stats')).toBeTruthy();
  });

  it('produžeci mijenjaju naslov statistike', () => {
    render(<LiveHalftimePanel match={match({ liveBreak: 'ET_HT' })} />);
    expect(screen.getByText('Statistika — produžeci')).toBeTruthy();
  });

  it('bez liveBreak prikazuje statistiku i podrazumijevani naslov', () => {
    render(<LiveHalftimePanel match={match({ liveBreak: undefined })} />);
    expect(screen.getByText('Statistika — 1. poluvrijeme')).toBeTruthy();
  });

  it('faza penala skriva statistiku i ne traži je', () => {
    render(<LiveHalftimePanel match={match({ liveBreak: 'POST_EXTRA' })} />);
    expect(screen.queryByTestId('halftime-stats')).toBeNull();
    expect(state.statMatchIds[0]).toBeUndefined();
  });

  it('prosljeđuje loading stanje statistici', () => {
    state.stats = { data: undefined, isLoading: true };
    render(<LiveHalftimePanel match={match()} />);
    expect(state.halftimeStats[0]).toEqual({ loading: true });
  });
});
