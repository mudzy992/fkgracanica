import { render, screen } from '@testing-library/react';
import type { ClubSquadSlot } from '../../types/club-hub';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PlayerCinematicHero } from './PlayerCinematicHero';
import { TeamFormationSection } from './TeamFormationSection';
import { TeamRosterSections } from './TeamRosterSections';
import { TeamSpotlight } from './TeamSpotlight';
import { statsByPlayerId } from './team-stats-utils';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

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

describe('PlayerCinematicHero', () => {
  it('renderuje igrača bez statistike', () => {
    wrap(<PlayerCinematicHero player={player() as never} />);
    expect(screen.getByRole('heading', { name: /Amar Hodžić|Amar/ })).toBeInTheDocument();
  });

  it('renderuje igrača sa fotografijom i brojem', () => {
    const { container } = wrap(
      <PlayerCinematicHero player={player({ photoPath: 'p/1.jpg' }) as never} />,
    );
    expect(container.querySelector('img')).not.toBeNull();
  });
});

describe('TeamFormationSection', () => {
  it('prikazuje teren sa startnim slotovima', () => {
    const { container } = wrap(
      <TeamFormationSection
        squad={{
          formation: { def: 4, mid: 4, fwd: 2 },
          slots: [
            slot({ playerId: 'p1', player: player() }),
            slot({ id: 's2', isBench: true, playerId: 'p2', player: player({ id: 'p2', firstName: 'Emir' }) }),
          ],
        } as never}
      />,
    );
    expect(container.textContent).toContain('4-4-2');
    expect(container.textContent).toContain('Startna postava');
    expect(screen.getAllByText('A. Hodžić').length).toBeGreaterThan(0);
    expect(screen.queryByText('E. Hodžić')).toBeNull();
  });
});

describe('TeamRosterSections', () => {
  const stats = statsByPlayerId(undefined);

  it('bez igrača i klupe ne renderuje grupe', () => {
    const { container } = wrap(
      <TeamRosterSections bench={[]} squadPlayers={[]} statsMap={stats} />,
    );
    expect(container.textContent).not.toContain('Golmani');
    expect(container.textContent).not.toContain('Klupa');
  });

  it('grupiše igrače po poziciji', () => {
    wrap(
      <TeamRosterSections
        bench={[]}
        squadPlayers={[
          player({ id: 'p1', position: 'GK' }),
          player({ id: 'p2', position: 'MID' }),
        ] as never}
        statsMap={stats}
      />,
    );
    expect(screen.getByText('Golmani')).toBeInTheDocument();
    expect(screen.getByText('Vezni red')).toBeInTheDocument();
  });

  it('prikazuje klupu kad ima igrača', () => {
    wrap(
      <TeamRosterSections
        bench={[slot({ playerId: 'p1', player: player() })] as never}
        squadPlayers={[]}
        statsMap={stats}
      />,
    );
    expect(screen.getByText('Klupa')).toBeInTheDocument();
  });
});

describe('TeamSpotlight', () => {
  it('bez igrača ne renderuje ništa', () => {
    const { container } = wrap(<TeamSpotlight players={[]} statsMap={statsByPlayerId(undefined)} />);
    expect(container.textContent).toBe('');
  });

  it('prikazuje istaknute igrače sa statistikom', () => {
    const map = statsByPlayerId({
      players: [
        { id: 'p1', stats: { goals: 5 } },
        { id: 'p2', stats: { goals: 2 } },
      ],
    } as never);
    wrap(
      <TeamSpotlight
        players={[player({ id: 'p1' }), player({ id: 'p2', firstName: 'Emir', lastName: 'Softić' })] as never}
        statsMap={map}
      />,
    );
    expect(screen.getByText('Strijelci sezone')).toBeInTheDocument();
    expect(screen.getAllByText('5 gola').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2 gola').length).toBeGreaterThan(0);
  });
});
