import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('framer-motion', () => ({ motion: { div: (p: any) => <div {...p}>{p.children}</div> }, useReducedMotion: () => false }));

const state = vi.hoisted(() => ({
  data: undefined as any,
}));

vi.mock('../../../hooks', () => ({ useMatches: () => ({ data: state.data }) }));
vi.mock('../../../lib/round-utils', () => ({ matchRoundLabel: () => null }));
vi.mock('../../../lib/utils', () => ({ formatDateTime: () => '01.01.2026' }));
vi.mock('./hero-match-utils', async () => {
  const actual = await vi.importActual('./hero-match-utils') as any;
  return { ...actual, isHeroMatchDockVisible: () => true, pickNextAndLast: (data: any) => actual.pickNextAndLast(data) };
});

describe('HeroMatchDock branch59 shortName ?? name', () => {
  beforeEach(() => {
    state.data = [
      { id: 'n1', scheduledAt: '2026-06-01T10:00:00Z', homeClub: { name: 'H1' }, awayClub: { name: 'A1' }, status: 'SCHEDULED' },
      { id: 'l1', homeClub: { shortName: undefined, name: 'HomeLong' }, awayClub: { shortName: null, name: 'AwayLong' }, homeScore: 2, awayScore: 1, status: 'FINISHED', scheduledAt: '2026-05-01T10:00:00Z' },
    ];
  });

  it('last shortName undefined → fallback to name', async () => {
    const { HeroMatchDock } = await import('./HeroMatchDock');
    render(<MemoryRouter><HeroMatchDock showLast /></MemoryRouter>);
    expect(screen.getByText(/HomeLong/)).toBeInTheDocument();
    expect(screen.getByText(/AwayLong/)).toBeInTheDocument();
  });

  it('last shortName defined → uses shortName', async () => {
    state.data = [
      { id: 'n1', scheduledAt: '2026-06-01T10:00:00Z', homeClub: { name: 'H1' }, awayClub: { name: 'A1' }, status: 'SCHEDULED' },
      { id: 'l1', homeClub: { shortName: 'HL', name: 'HomeLong' }, awayClub: { shortName: 'AL', name: 'AwayLong' }, homeScore: 2, awayScore: 1, status: 'FINISHED', scheduledAt: '2026-05-01T10:00:00Z' },
    ];
    const { HeroMatchDock } = await import('./HeroMatchDock');
    render(<MemoryRouter><HeroMatchDock showLast /></MemoryRouter>);
    expect(screen.getByText(/HL/)).toBeInTheDocument();
    expect(screen.getByText(/AL/)).toBeInTheDocument();
  });
});
