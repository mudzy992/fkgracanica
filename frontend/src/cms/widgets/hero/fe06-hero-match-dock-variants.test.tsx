import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HeroMatchDock } from './HeroMatchDock';

const nextMatch = {
  id: 'n1',
  status: 'SCHEDULED',
  scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  homeClub: { name: 'FK Gračanica', shortName: null },
  awayClub: { name: 'FK Test', shortName: null },
  venue: 'Stadion',
} as never;

const lastMatch = {
  id: 'l1',
  status: 'FINISHED',
  scheduledAt: new Date(Date.now() - 86400000).toISOString(),
  homeClub: { name: 'FK Gračanica', shortName: 'GRA' },
  awayClub: { name: 'FK Rival', shortName: null },
  homeScore: 2,
  awayScore: 1,
} as never;

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});
vi.mock('../../../hooks', () => ({
  useMatches: () => ({ data: [nextMatch, lastMatch] }),
}));
vi.mock('../../../lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/utils')>('../../../lib/utils');
  return { ...actual, formatDateTime: (s: string) => `dt:${s.slice(0, 10)}` };
});

describe('HeroMatchDock — varijante (3 grane)', () => {
  it('reduce true prikazuje next i last sa fallback shortName', () => {
    render(
      <MemoryRouter>
        <HeroMatchDock showLast />
      </MemoryRouter>,
    );
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('FK Test')).toBeInTheDocument();
    // last uses shortName fallback: GRA for home, and name for away (shortName null)
    expect(screen.getByText('GRA — FK Rival')).toBeInTheDocument();
    expect(screen.getByText('2:1')).toBeInTheDocument();
  });

  it('bez showLast ne prikazuje last', () => {
    render(
      <MemoryRouter>
        <HeroMatchDock showLast={false} />
      </MemoryRouter>,
    );
    expect(screen.queryByText('GRA — FK Rival')).toBeNull();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
  });
});
