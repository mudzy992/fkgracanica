import type { Player } from '@prisma/client';
import {
  mergeClubLineupWithSquad,
  resolveEffectiveMatchLineup,
} from './match-squad-lineup.util';

const player = (id: string) =>
  ({ id, firstName: 'Test', lastName: id }) as Player;
const saved = {
  id: 'saved',
  matchId: 'match',
  clubId: 'home',
  playerId: 'former',
  positionX: 75,
  positionY: 28,
  isStarter: true,
  player: player('former'),
};
const squad = [
  {
    slotIndex: 0,
    isBench: false,
    playerId: null,
    positionX: 14,
    positionY: 50,
    player: null,
  },
  {
    slotIndex: 10,
    isBench: false,
    playerId: 'wing',
    positionX: 86,
    positionY: 88,
    player: player('wing'),
  },
];

describe('postava utakmice i klupski predložak', () => {
  it('sačuvane redove ne izostavlja niti prepisuje njihov položaj', () => {
    expect(mergeClubLineupWithSquad([saved], [], 'home', 'match')).toEqual([
      saved,
    ]);
    expect(mergeClubLineupWithSquad([saved], squad, 'home', 'match')).toEqual([
      saved,
    ]);
  });

  it('spremljena i namjerno prazna postava ne čitaju klupske predloške', async () => {
    const prisma = {
      clubSquadSlot: { findMany: jest.fn().mockResolvedValue(squad) },
    };
    expect(
      await resolveEffectiveMatchLineup(
        prisma,
        'match',
        'home',
        'away',
        [],
        true,
      ),
    ).toEqual([]);
    expect(
      await resolveEffectiveMatchLineup(
        prisma,
        'match',
        'home',
        'away',
        [saved],
        true,
      ),
    ).toEqual([saved]);
    expect(
      await resolveEffectiveMatchLineup(
        prisma,
        'match',
        'home',
        'away',
        [saved],
        false,
      ),
    ).toEqual([saved]);
    expect(prisma.clubSquadSlot.findMany).not.toHaveBeenCalled();
  });

  it('bez spremanja učita oba klupska predloška', async () => {
    const prisma = {
      clubSquadSlot: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce(squad)
          .mockResolvedValueOnce([]),
      },
    };
    const result = await resolveEffectiveMatchLineup(
      prisma,
      'match',
      'home',
      'away',
      [],
      false,
    );
    expect(result).toEqual([
      expect.objectContaining({
        playerId: 'wing',
        positionX: 75,
        positionY: 28,
      }),
    ]);
    expect(prisma.clubSquadSlot.findMany).toHaveBeenCalledTimes(2);
  });

  it('klupski predlošci ne mogu dodijeliti istog igrača oboma timovima', async () => {
    const prisma = {
      clubSquadSlot: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce(squad)
          .mockResolvedValueOnce(squad),
      },
    };
    const result = await resolveEffectiveMatchLineup(
      prisma,
      'match',
      'home',
      'away',
      [],
      false,
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ clubId: 'home', playerId: 'wing' });
  });

  it('predložak ignoriše klupu, neispravne indekse i duplicirane igrače', () => {
    const extra = [
      ...squad,
      { ...squad[1], slotIndex: 9 },
      { ...squad[1], slotIndex: 11 },
      { ...squad[1], slotIndex: -1 },
      { ...squad[1], slotIndex: 3, isBench: true },
    ];
    const result = mergeClubLineupWithSquad([], extra, 'home', 'match');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      playerId: 'wing',
      positionX: 50,
      positionY: 22,
    });
  });

  it('potpuni 4-4-2 pretvara u utakmične koordinate bez preslagivanja linija', () => {
    const full = Array.from({ length: 11 }, (_, index) => {
      const positionX = index === 0 ? 14 : index < 5 ? 38 : index < 9 ? 62 : 86;
      const positionY =
        index === 0
          ? 50
          : index < 5
            ? [12, 37, 63, 88][index - 1]
            : index < 9
              ? [12, 37, 63, 88][index - 5]
              : [37, 63][index - 9];
      const playerId =
        index === 8 ? 'midfielder' : index === 10 ? 'forward' : null;
      return {
        slotIndex: index,
        isBench: false,
        playerId,
        positionX,
        positionY,
        player: playerId ? player(playerId) : null,
      };
    });
    const result = mergeClubLineupWithSquad([], full, 'home', 'match');
    expect(result).toEqual([
      expect.objectContaining({
        playerId: 'midfielder',
        positionX: 88,
        positionY: 38,
      }),
      expect.objectContaining({
        playerId: 'forward',
        positionX: 63,
        positionY: 14,
      }),
    ]);
  });

  it('predložak čuva prazne pozicije i stvarni indeks klupskog slota', () => {
    expect(mergeClubLineupWithSquad([], squad, 'home', 'match')).toEqual([
      expect.objectContaining({
        id: 'squad-default-home-10',
        playerId: 'wing',
        positionX: 75,
        positionY: 28,
      }),
    ]);
  });
});
