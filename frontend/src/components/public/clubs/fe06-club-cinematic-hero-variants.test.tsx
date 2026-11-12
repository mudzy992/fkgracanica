import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ClubCinematicHero } from './ClubCinematicHero';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

const club = {
  id: 'c1',
  name: 'FK Gračanica',
  slug: 'fk-gracanica',
  crestPath: 'clubs/crest.png',
  city: 'Gračanica',
  stadium: 'Gradski stadion',
  isOwnClub: true,
  description: 'Opis',
} as never;

const slot = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  clubId: 'c1',
  slotIndex: 0,
  isBench: false,
  lineRole: 'DEF',
  positionX: 30,
  positionY: 40,
  playerId: 'p1',
  player: { id: 'p1', name: 'Igrač' },
  ...(over as object),
});

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('ClubCinematicHero — varijante (3 grane reduce + counts)', () => {
  it('reduce true i counts.total>0 prikazuje starters/bench red', () => {
    wrap(
      <ClubCinematicHero
        club={club}
        stadium={{ name: 'Stadion', city: 'Gračanica' } as never}
        squad={{ formation: { def: 4, mid: 4, fwd: 2 }, slots: [slot(), slot({ id: 's2', isBench: true, playerId: 'p2', player: { id: 'p2' } })] } as never}
        stats={{ season: { id: 's1', name: '2025/26' }, standing: { points: 10 } } as never}
      />,
    );
    expect(screen.getByText(/u startnoj postavi/)).toBeInTheDocument();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
  });

  it('bez squad i bez stats nema KPI grida', () => {
    const { container } = wrap(<ClubCinematicHero club={{ ...(club as unknown as Record<string, unknown>), crestPath: null } as never} />);
    expect(container.querySelector('.grid')).toBeNull();
  });

  it('squad sa praznim slotovima ne prikazuje counts.total>0 red', () => {
    wrap(
      <ClubCinematicHero
        club={club}
        squad={{ formation: null, slots: [slot({ playerId: null, player: null })] } as never}
      />,
    );
    expect(screen.queryByText(/u startnoj postavi/)).toBeNull();
  });
});
