import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ClubOwnTeamLink, ClubPlayersGrid } from './ClubPublicSections';

vi.mock('../../team/PlayerPortraitCard', () => ({
  PlayerPortraitCard: ({ player, stats }: { player: { id: string; firstName: string }; stats?: unknown }) => (
    <div data-testid={`player-${player.id}`}>{stats ? 'sa-statistikom' : 'bez-statistike'}</div>
  ),
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const player = (id: string, position: string, order: number) => ({
  id,
  firstName: `Ime${order}`,
  lastName: 'Prezime',
  position,
  order,
  number: order,
  photoPath: null,
});

describe('ClubPlayersGrid', () => {
  it('bez igrača ne renderira ništa', () => {
    const { container } = wrap(<ClubPlayersGrid players={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('grupiše igrače po poziciji', () => {
    wrap(
      <ClubPlayersGrid
        players={[
          player('p1', 'GK', 1),
          player('p2', 'DEF', 2),
          player('p3', 'DEF', 3),
        ] as never}
      />,
    );
    expect(screen.getByText('Golmani')).toBeInTheDocument();
    expect(screen.getByText('Odbrana')).toBeInTheDocument();
    expect(screen.getByTestId('player-p1')).toBeInTheDocument();
    expect(screen.getByTestId('player-p2')).toBeInTheDocument();
  });

  it('prosljeđuje statistiku igračima koji je imaju', () => {
    wrap(
      <ClubPlayersGrid
        players={[player('p1', 'DEF', 1), player('p2', 'DEF', 2)] as never}
        stats={{
          players: [{ id: 'p1', stats: { appearances: 5 } }],
        } as never}
      />,
    );
    expect(screen.getByTestId('player-p1')).toHaveTextContent('sa-statistikom');
    expect(screen.getByTestId('player-p2')).toHaveTextContent('bez-statistike');
  });
});

describe('ClubOwnTeamLink', () => {
  it('vodi na stranicu prvog tima', () => {
    wrap(<ClubOwnTeamLink />);
    expect(screen.getByText('Naš klub')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/tim');
  });
});
