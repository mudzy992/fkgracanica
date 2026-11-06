import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LiveHalftimeStats } from './LiveHalftimeStats';
import { LiveStatsComparisonCard } from './LiveStatsComparisonCard';
import { LiveStatsPlayerListCard } from './LiveStatsPlayerListCard';
import { LiveStatsCorner } from './LiveStatsCorner';

const state = vi.hoisted(() => ({
  visible: false,
  active: null as unknown,
}));

vi.mock('../../hooks/use-live-stats-popup', () => ({
  useLiveStatsPopup: () => ({ visible: state.visible, active: state.active }),
}));

const teamStats = (over: Record<string, number> = {}) => ({
  goals: 1,
  shots: 5,
  shotsOn: 2,
  corners: 3,
  fouls: 4,
  yellowCards: 1,
  redCards: 0,
  ...over,
});

const match = {
  id: 'm1',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  events: [],
  homeClubId: 'k1',
  awayClubId: 'k2',
};

const overview = (home: Record<string, number>, away: Record<string, number>) =>
  ({ team: { home: teamStats(home), away: teamStats(away) } }) as never;

describe('LiveHalftimeStats', () => {
  it('dok se učitava prikazuje skeleton', () => {
    const { container } = render(<LiveHalftimeStats match={match as never} loading />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('bez statistike prikazuje poruku', () => {
    render(<LiveHalftimeStats match={match as never} />);
    expect(screen.getByText('Statistika 1. poluvremena nije dostupna.')).toBeInTheDocument();
  });

  it('sve nule tretira kao nedostupnu statistiku', () => {
    const zero = {
      goals: 0,
      shots: 0,
      shotsOn: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
    };
    render(<LiveHalftimeStats match={match as never} stats={overview(zero, zero)} />);
    expect(screen.getByText('Statistika 1. poluvremena nije dostupna.')).toBeInTheDocument();
  });

  it('prikazuje trake po kategorijama', () => {
    render(<LiveHalftimeStats match={match as never} stats={overview({ goals: 2 }, { goals: 1 })} />);
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('1. poluvrijeme')).toBeInTheDocument();
    expect(screen.getByText('Golovi')).toBeInTheDocument();
    expect(screen.getByText('Udarci')).toBeInTheDocument();
    expect(screen.queryByText('Crveni')).toBeNull();
  });

  it('crveni kartoni se prikazuju kad ih ima', () => {
    render(
      <LiveHalftimeStats
        match={match as never}
        stats={overview({ redCards: 1 }, { goals: 1 })}
      />,
    );
    expect(screen.getByText('Crveni')).toBeInTheDocument();
  });

  it('bez naziva klubova prikazuje zamjenske nazive', () => {
    render(<LiveHalftimeStats match={{ id: 'm2' } as never} stats={overview({ goals: 1 }, {})} />);
    expect(screen.getByText('Domaći')).toBeInTheDocument();
    expect(screen.getByText('Gosti')).toBeInTheDocument();
  });
});

describe('LiveStatsComparisonCard', () => {
  const stat = { id: 's1', kind: 'comparison', label: 'Udarci', away: 7, home: 4, awayClub: 'Slavija', homeClub: 'Gračanica' };

  it('prikazuje nazive, labelu i vrijednosti', () => {
    render(<LiveStatsComparisonCard stat={stat as never} />);
    expect(screen.getByText('Udarci')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Slavija')).toBeInTheDocument();
    expect(screen.getByText('Gračanica')).toBeInTheDocument();
  });
});

describe('LiveStatsPlayerListCard', () => {
  const stat = {
    id: 'pl1',
    kind: 'player-list',
    label: 'Strijelci',
    awayClub: 'Slavija',
    homeClub: 'Gračanica',
    awayPlayers: [],
    homePlayers: [
      { name: 'Amar Hodžić', minute: 23, isOwnGoal: false },
      { name: 'Emir Softić', minute: 67, isOwnGoal: true },
    ],
  };

  it('prikazuje listu strijelaca i autogol', () => {
    render(<LiveStatsPlayerListCard stat={stat as never} />);
    expect(screen.getByText('Strijelci')).toBeInTheDocument();
    expect(screen.getByText(/Amar Hodžić/)).toBeInTheDocument();
    expect(screen.getByText(/Autogol/)).toBeInTheDocument();
    expect(screen.getByText(/67/)).toBeInTheDocument();
  });

  it('prazna lista prikazuje crticu', () => {
    render(<LiveStatsPlayerListCard stat={stat as never} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('LiveStatsCorner', () => {
  it('ne prikazuje ništa dok popup nije aktivan', () => {
    state.visible = false;
    state.active = null;
    const { container } = render(<LiveStatsCorner match={match as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje karticu poređenja', () => {
    state.visible = true;
    state.active = {
      id: 's1',
      kind: 'comparison',
      label: 'Udarci',
      away: 3,
      home: 6,
      awayClub: 'Slavija',
      homeClub: 'Gračanica',
    };
    render(<LiveStatsCorner match={match as never} />);
    expect(screen.getByText('Udarci')).toBeInTheDocument();
  });

  it('prikazuje karticu liste igrača', () => {
    state.visible = true;
    state.active = {
      id: 'pl1',
      kind: 'player-list',
      label: 'Kartoni',
      awayClub: 'Slavija',
      homeClub: 'Gračanica',
      awayPlayers: [],
      homePlayers: [{ name: 'Amar Hodžić', minute: 12, isOwnGoal: false }],
    };
    render(<LiveStatsCorner match={match as never} />);
    expect(screen.getByText('Kartoni')).toBeInTheDocument();
    expect(screen.getByText(/Amar Hodžić/)).toBeInTheDocument();
  });
});
