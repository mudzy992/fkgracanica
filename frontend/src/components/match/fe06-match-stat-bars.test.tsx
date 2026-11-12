import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MatchStatBar } from './MatchStatBar';
import { MatchPlayerStatsTable } from './MatchPlayerStatsTable';
import type { PlayerMatchStat } from '../../types/match-stats';

vi.mock('../../lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const playerStat = (over: Record<string, unknown> = {}): PlayerMatchStat =>
  ({
    playerId: 'p1',
    firstName: 'Amar',
    lastName: 'Hodžić',
    isStarter: true,
    goals: 0,
    ownGoals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    shots: 0,
    shotsOn: 0,
    ...over,
  }) as unknown as PlayerMatchStat;

describe('MatchStatBar', () => {
  it('računa procentualnu širinu trake', () => {
    const { container } = render(<MatchStatBar label="Udarci" home={3} away={1} suffix="%" />);
    expect(screen.getByText('Udarci')).toBeTruthy();
    expect(screen.getByText('3%')).toBeTruthy();
    expect(screen.getByText('1%')).toBeTruthy();
    const widths = Array.from(container.querySelectorAll('.transition-all')).map(
      (el) => (el as HTMLElement).style.width,
    );
    expect(widths).toEqual(['75%', '25%']);
  });

  it('bez podataka traka je na pola', () => {
    const { container } = render(<MatchStatBar label="Korneri" home={0} away={0} />);
    const widths = Array.from(container.querySelectorAll('.transition-all')).map(
      (el) => (el as HTMLElement).style.width,
    );
    expect(widths).toEqual(['50%', '50%']);
  });

  it('dark varijanta koristi staklenu podlogu trake', () => {
    const { container } = render(<MatchStatBar label="Golovi" home={1} away={2} dark />);
    expect(container.querySelector('.bg-white\\/10')).toBeTruthy();
    expect(container.querySelector('.transition-all')).toBeTruthy();
  });
});

describe('MatchPlayerStatsTable', () => {
  it('prazna lista igrača ne renderira tabelu', () => {
    const { container } = render(<MatchPlayerStatsTable title="Domaći" players={[]} />);
    expect(container.textContent).toBe('');
  });

  it('bez detalja prikazuje samo kolonu igrača', () => {
    render(
      <MemoryRouter>
        <MatchPlayerStatsTable title="Domaći" players={[playerStat()]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Domaći')).toBeTruthy();
    expect(screen.getByText('Igrač')).toBeTruthy();
    expect(screen.queryByText('G')).toBeNull();
    expect(screen.getByText('Amar Hodžić')).toBeTruthy();
  });

  it('sa detaljima prikazuje sve kolone i crtice za nule', () => {
    render(
      <MemoryRouter>
        <MatchPlayerStatsTable
          title="Gosti"
          players={[playerStat({ goals: 2, yellowCards: 1, isStarter: false })]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('G')).toBeTruthy();
    expect(screen.getByText('U+')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('1/0')).toBeTruthy();
    expect(screen.getByText('(rez)')).toBeTruthy();
    expect(screen.getAllByText('—').length).toBeGreaterThan(2);
  });

  it('red bez kartona prikazuje crticu u koloni kartona', () => {
    render(
      <MemoryRouter>
        <MatchPlayerStatsTable title="Gosti" players={[playerStat({ shots: 1 })]} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('—')).toHaveLength(5);
  });
});
