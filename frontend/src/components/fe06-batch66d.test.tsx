import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { squadCounts } from './team/team-stats-utils';
import { TeamCinematicHero } from './team/TeamCinematicHero';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('batch66d team', () => {
  it('squadCounts pokriva s.player falsy', () => {
    const withPlayer = squadCounts([{ isBench: false, player: { id: '1' } }, { isBench: true, player: { id: '2' } }] as never[]);
    expect(withPlayer.total).toBe(2);
    const withoutPlayer = squadCounts([{ isBench: false, player: null }, { isBench: true, player: undefined }] as never[]);
    expect(withoutPlayer.total).toBe(0);
    const mixed = squadCounts([
      { isBench: false, player: { id: '1' } },
      { isBench: false, player: null },
      { isBench: true, player: { id: '2' } },
      { isBench: true, player: null },
    ] as never[]);
    expect(mixed.starters).toBe(1);
    expect(mixed.bench).toBe(1);
  });

  it('TeamCinematicHero pokriva counts.total >0', () => {
    const squadWithPlayers = {
      formation: { def: 4, mid: 3, fwd: 3 },
      slots: [
        { isBench: false, player: { id: '1' } },
        { isBench: true, player: { id: '2' } },
      ],
    } as never;
    const { container } = render(
      <MemoryRouter>
        <TeamCinematicHero
          club={{ name: 'FK Gračanica', slug: 'fk-gracanica', crestPath: null } as never}
          squad={squadWithPlayers}
          stats={{ season: { name: '2024/25' }, standing: { points: 42 } } as never}
          stadiumName="Stadion"
          city="Gračanica"
        />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('FK Gračanica');
    expect(container.textContent).toContain('Bodovi');
    expect(container.textContent).toContain('u startnoj postavi');
    const squadEmpty = {
      formation: { def: 4, mid: 3, fwd: 3 },
      slots: [
        { isBench: false, player: null },
        { isBench: true, player: null },
      ],
    } as never;
    const { container: c3 } = render(
      <MemoryRouter>
        <TeamCinematicHero club={{ name: 'FK', slug: 'fk' } as never} squad={squadEmpty} stats={null} />
      </MemoryRouter>,
    );
    expect(c3.textContent).not.toContain('u startnoj postavi');
    const { container: c2 } = render(
      <MemoryRouter>
        <TeamCinematicHero club={null} squad={null} stats={null} />
      </MemoryRouter>,
    );
    expect(c2.textContent).toContain('Prvi tim');
  });
});
