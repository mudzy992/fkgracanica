import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LiveStatsPlayerListCard } from './LiveStatsPlayerListCard';

describe('LiveStatsPlayerListCard — branch48 (2 grane align)', () => {
  it('prazni nizovi: pokriva align right vs left za prazno (bid1 9: [0,3])', () => {
    const { container } = render(
      <LiveStatsPlayerListCard
        stat={
          {
            label: 'Strijelci',
            awayClub: 'FK Gračanica',
            homeClub: 'FK Sloga',
            awayPlayers: [],
            homePlayers: [],
          } as never
        }
      />,
    );
    // oba — sa različitim alignovima; jedan ima text-right
    const dashes = screen.getAllByText('—');
    expect(dashes).toHaveLength(2);
    // desni (home) treba imati text-right
    expect(dashes[1].className).toMatch(/text-right/);
    expect(dashes[0].className).not.toMatch(/text-right/);
    expect(container.querySelector('ul')).toBeNull();
  });

  it('ne-prazni nizovi: pokriva ul align left vs right (bid2 12: [3,0]) i isOwnGoal', () => {
    const { container } = render(
      <LiveStatsPlayerListCard
        stat={
          {
            label: 'Strijelci',
            awayClub: 'FK Gračanica',
            homeClub: 'FK Sloga',
            awayPlayers: [
              { name: 'Adis', minute: 12, isOwnGoal: false },
              { name: 'Marko', minute: 45, isOwnGoal: true },
            ],
            homePlayers: [{ name: 'Jasmin', minute: 33, isOwnGoal: false }],
          } as never
        }
      />,
    );
    // 2 ul-a: jedan bez text-right (away left), jedan sa text-right (home right)
    const uls = container.querySelectorAll('ul');
    expect(uls).toHaveLength(2);
    expect(uls[0].className).not.toMatch(/text-right/);
    expect(uls[1].className).toMatch(/text-right/);
    expect(screen.getByText('Adis')).toBeInTheDocument();
    expect(screen.getByText(/Autogol/)).toBeInTheDocument();
    expect(screen.getByText('Jasmin')).toBeInTheDocument();
  });

  it('miješano: away prazno, home puno', () => {
    render(
      <LiveStatsPlayerListCard
        stat={
          {
            label: 'Kartoni',
            awayClub: 'A',
            homeClub: 'H',
            awayPlayers: [],
            homePlayers: [{ name: 'Solo', minute: 90, isOwnGoal: false }],
          } as never
        }
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Solo')).toBeInTheDocument();
  });
});
