import { render, screen } from '@testing-library/react';
import type { ClubSquadSlot } from '../../types/club-hub';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TeamCinematicHero } from './TeamCinematicHero';
import { PlayerPortraitCard } from './PlayerPortraitCard';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const club = {
  id: 'c1',
  name: 'FK Gračanica',
  slug: 'fk-gracanica',
  crestPath: 'clubs/crest.png',
  city: 'Gračanica',
  stadium: 'Gradski stadion',
};
const slot = (over: Record<string, unknown> = {}) =>
  ({
    id: 's1',
    clubId: 'c1',
    slotIndex: 0,
    isBench: false,
    lineRole: 'DEF',
    positionX: 30,
    positionY: 40,
    playerId: null,
    player: null,
    ...over,
  }) as unknown as ClubSquadSlot;
const player = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  firstName: 'Amar',
  lastName: 'Hodžić',
  number: 9,
  position: 'FWD',
  photoPath: null,
  ...over,
});

describe('TeamCinematicHero', () => {
  it('bez podataka prikazuje naslov i opis', () => {
    wrap(<TeamCinematicHero />);
    expect(screen.getByRole('heading', { name: 'Prvi tim' })).toBeInTheDocument();
    expect(screen.getByText(/Profesionalni kadar/)).toBeInTheDocument();
    expect(screen.queryByText('Igrača')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('prikazuje grb, lokaciju i link na profil kluba', () => {
    const { container } = wrap(
      <TeamCinematicHero club={club as never} city="Gračanica" stadiumName="Gradski stadion" />,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/klub/fk-gracanica');
    expect(screen.getByText('Gračanica · Gradski stadion')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('prikazuje KPI pločice iz postave i statistike', () => {
    wrap(
      <TeamCinematicHero
        club={club as never}
        squad={{
          formation: { def: 4, mid: 4, fwd: 2 },
          slots: [slot({ playerId: 'p1', player: player() }), slot({ id: 's2', isBench: true })],
        }}
        stats={{ season: { id: 's1', name: '2025/26' }, standing: { points: 42 } } as never}
      />,
    );
    expect(screen.getByText('Igrača')).toBeInTheDocument();
    expect(screen.getByText('4-4-2')).toBeInTheDocument();
    expect(screen.getByText('2025/26')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(document.body.textContent).toContain('u startnoj postavi');
    expect(document.body.textContent).toContain('na klupi');
  });

  it('prazna klupa ne prikazuje red sa zbirom', () => {
    wrap(
      <TeamCinematicHero
        squad={{ formation: { def: 4, mid: 4, fwd: 2 }, slots: [slot({ playerId: 'p1' })] }}
      />,
    );
    expect(document.body.textContent).not.toContain('na klupi');
  });
});

describe('PlayerPortraitCard', () => {
  it('prikazuje ime, broj i poziciju bez fotografije', () => {
    const { container } = wrap(<PlayerPortraitCard player={player() as never} />);
    expect(container.textContent).toContain('Amar');
    expect(container.textContent).toContain('Hodžić');
    expect(screen.getByText('Napadač')).toBeInTheDocument();
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
    expect(screen.getByRole('link').getAttribute('href')).toContain('p1');
  });

  it('prikazuje sezonsku statistiku kad postoji', () => {
    wrap(
      <PlayerPortraitCard
        player={player() as never}
        stats={{ appearances: 12, goals: 1, assists: 3 } as never}
      />,
    );
    expect(screen.getByText('1 gol')).toBeInTheDocument();
    expect(screen.getByText('12 utakmica')).toBeInTheDocument();
    expect(screen.getByText('3 asist.')).toBeInTheDocument();
  });

  it('bez golova nema značke za golove, a više golova koristi množinu', () => {
    const zero = wrap(<PlayerPortraitCard player={player() as never} stats={{ appearances: 2 } as never} />);
    expect(zero.container.textContent).not.toContain(' gola');
    const many = wrap(
      <PlayerPortraitCard player={player() as never} stats={{ appearances: 2, goals: 5 } as never} />,
    );
    expect(many.getByText('5 gola')).toBeInTheDocument();
  });

  it('sa fotografijom prikazuje sliku', () => {
    const { container } = wrap(
      <PlayerPortraitCard player={player({ photoPath: 'p/1.jpg' }) as never} />,
    );
    expect(container.querySelector('img')).not.toBeNull();
  });
});
