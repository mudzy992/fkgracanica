import {
  computePlayerMatchStats,
  computeTeamStatsFromEvents,
  resolveEventSide,
} from './match-stats.util';

describe('match-stats.util', () => {
  const homeClubId = 'home-club';
  const awayClubId = 'away-club';
  const playerClubById = new Map([
    ['p1', homeClubId],
    ['p2', awayClubId],
  ]);

  it('resolves side from teamSide or player club', () => {
    expect(
      resolveEventSide(
        {
          type: 'GOAL',
          teamSide: 'away',
          playerId: null,
          relatedPlayerId: null,
        },
        homeClubId,
        awayClubId,
        playerClubById,
      ),
    ).toBe('away');
    expect(
      resolveEventSide(
        { type: 'FOUL', teamSide: null, playerId: 'p1', relatedPlayerId: null },
        homeClubId,
        awayClubId,
        playerClubById,
      ),
    ).toBe('home');
  });

  it('aggregates team stats from events', () => {
    const events = [
      {
        type: 'CORNER' as const,
        teamSide: 'home',
        playerId: null,
        relatedPlayerId: null,
      },
      {
        type: 'SHOT_ON_TARGET' as const,
        teamSide: 'away',
        playerId: null,
        relatedPlayerId: null,
      },
      {
        type: 'YELLOW_CARD' as const,
        teamSide: null,
        playerId: 'p2',
        relatedPlayerId: null,
      },
    ];
    const { home, away } = computeTeamStatsFromEvents(
      events,
      homeClubId,
      awayClubId,
      { home: 2, away: 1 },
      playerClubById,
    );
    expect(home.goals).toBe(2);
    expect(home.corners).toBe(1);
    expect(away.goals).toBe(1);
    expect(away.shots).toBe(1);
    expect(away.shotsOn).toBe(1);
    expect(away.yellowCards).toBe(1);
  });

  it('builds player stats from lineup and events', () => {
    const lineup = [
      {
        id: 'lineup-1',
        matchId: 'match-1',
        clubId: homeClubId,
        playerId: 'p1',
        positionX: null,
        positionY: null,
        isStarter: true,
        player: { id: 'p1', firstName: 'A', lastName: 'B', clubId: homeClubId },
      },
    ];
    const events = [
      {
        type: 'GOAL' as const,
        teamSide: 'home',
        playerId: 'p1',
        relatedPlayerId: null,
      },
    ];
    const { home } = computePlayerMatchStats(
      events,
      lineup,
      homeClubId,
      awayClubId,
    );
    expect(home[0]?.goals).toBe(1);
  });

  it('counts own goals separately from goals', () => {
    const lineup = [
      {
        id: 'lineup-2',
        matchId: 'match-1',
        clubId: homeClubId,
        playerId: 'p1',
        positionX: null,
        positionY: null,
        isStarter: true,
        player: { id: 'p1', firstName: 'A', lastName: 'B', clubId: homeClubId },
      },
    ];
    const events = [
      {
        type: 'OWN_GOAL' as const,
        teamSide: 'home',
        playerId: 'p1',
        relatedPlayerId: null,
      },
    ];
    const { home } = computePlayerMatchStats(
      events,
      lineup,
      homeClubId,
      awayClubId,
    );
    expect(home[0]?.goals).toBe(0);
    expect(home[0]?.ownGoals).toBe(1);
  });
});
