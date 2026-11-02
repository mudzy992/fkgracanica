import { Injectable, NotFoundException } from '@nestjs/common';
import {
  MatchEventType,
  MatchReportStatus,
  MatchStatus,
  type TeamStatistics,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { matchWithinRoundLimit } from '../rounds/round.util';
import {
  computePlayerMatchStats,
  computeTeamStatsFromEvents,
  teamStatsToPersistence,
} from './match-stats.util';
import { computeStandings } from './standings.util';
import { getSeasonLeaders } from './leaders.util';
import { getSeasonParticipantClubs } from '../competitions/season-participants.util';
import { rebuildSeasonPlayerStatistics } from './season-stats-rebuild.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  rebuildSeasonPlayerStatistics(seasonId: string) {
    return rebuildSeasonPlayerStatistics(this.prisma, seasonId);
  }

  async recalculateForMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { events: true, edition: true, lineup: true, teamStats: true },
    });
    if (!match || match.reportStatus !== MatchReportStatus.APPROVED) {
      return { skipped: true, reason: 'Match not approved' };
    }

    const playerIds = [
      ...new Set([
        ...match.events.filter((e) => e.playerId).map((e) => e.playerId!),
        ...match.events
          .filter((e) => e.relatedPlayerId)
          .map((e) => e.relatedPlayerId!),
      ]),
    ];

    for (const playerId of playerIds) {
      const events = match.events.filter((e) => e.playerId === playerId);
      const goals = events.filter((e) =>
        (['GOAL', 'PENALTY_SCORED'] as const).includes(
          e.type as 'GOAL' | 'PENALTY_SCORED',
        ),
      ).length;
      const ownGoals = events.filter(
        (e) => e.type === MatchEventType.OWN_GOAL,
      ).length;
      const assists = match.events.filter(
        (e) =>
          e.relatedPlayerId === playerId &&
          (e.type === MatchEventType.GOAL ||
            e.type === MatchEventType.PENALTY_SCORED),
      ).length;
      const yellowCards = events.filter(
        (e) => e.type === MatchEventType.YELLOW_CARD,
      ).length;
      const redCards = events.filter((e) =>
        (['RED_CARD', 'SECOND_YELLOW'] as const).includes(
          e.type as 'RED_CARD' | 'SECOND_YELLOW',
        ),
      ).length;

      await this.prisma.playerStatistics.upsert({
        where: {
          playerId_seasonCompetitionId: {
            playerId,
            seasonCompetitionId: match.seasonCompetitionId,
          },
        },
        create: {
          playerId,
          seasonCompetitionId: match.seasonCompetitionId,
          appearances: 1,
          goals,
          ownGoals,
          assists,
          yellowCards,
          redCards,
          minutes: 90,
        },
        update: {
          appearances: { increment: 1 },
          goals: { increment: goals },
          ownGoals: { increment: ownGoals },
          assists: { increment: assists },
          yellowCards: { increment: yellowCards },
          redCards: { increment: redCards },
          minutes: { increment: 90 },
        },
      });
    }

    await this.syncTeamStatistics(matchId, match);

    return { success: true, playersUpdated: playerIds.length };
  }

  private async syncTeamStatistics(
    matchId: string,
    match: {
      homeClubId: string;
      awayClubId: string;
      homeScore: number;
      awayScore: number;
      events: {
        type: MatchEventType;
        teamSide: string | null;
        playerId: string | null;
        relatedPlayerId: string | null;
      }[];
      lineup?: { playerId: string; clubId: string }[];
      teamStats?: TeamStatistics[];
    },
  ) {
    const playerClubById = new Map(
      (match.lineup ?? []).map((l) => [l.playerId, l.clubId] as const),
    );
    const { home, away } = computeTeamStatsFromEvents(
      match.events,
      match.homeClubId,
      match.awayClubId,
      { home: match.homeScore, away: match.awayScore },
      playerClubById,
      match.teamStats,
    );

    for (const stats of [home, away]) {
      const data = teamStatsToPersistence(stats);
      const existing = await this.prisma.teamStatistics.findFirst({
        where: { matchId, clubId: stats.clubId },
      });
      if (existing) {
        await this.prisma.teamStatistics.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await this.prisma.teamStatistics.create({
          data: { matchId, clubId: stats.clubId, ...data },
        });
      }
    }
  }

  async getMatchStatistics(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        events: { include: { player: { select: { id: true, clubId: true } } } },
        lineup: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                clubId: true,
              },
            },
          },
        },
        teamStats: true,
      },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');

    const playerClubById = new Map<string, string>();
    for (const row of match.lineup)
      playerClubById.set(row.playerId, row.clubId);
    for (const event of match.events) {
      if (event.playerId && event.player?.clubId) {
        playerClubById.set(event.playerId, event.player.clubId);
      }
    }

    const team = computeTeamStatsFromEvents(
      match.events,
      match.homeClubId,
      match.awayClubId,
      { home: match.homeScore, away: match.awayScore },
      playerClubById,
      match.teamStats,
    );
    const players = computePlayerMatchStats(
      match.events,
      match.lineup,
      match.homeClubId,
      match.awayClubId,
    );

    return { team, players };
  }

  getPlayerStats(playerId: string, seasonId?: string) {
    return this.prisma.playerStatistics.findMany({
      where: {
        playerId,
        ...(seasonId ? { seasonCompetitionId: seasonId } : {}),
      },
    });
  }

  getTeamStats(matchId: string) {
    return this.prisma.teamStatistics.findMany({ where: { matchId } });
  }

  async getStandings(seasonId: string, upToRound?: number) {
    const [matches, participants] = await Promise.all([
      this.prisma.match.findMany({
        where: { seasonCompetitionId: seasonId, status: MatchStatus.FINISHED },
        include: {
          homeClub: { select: { name: true, slug: true, crestPath: true } },
          awayClub: { select: { name: true, slug: true, crestPath: true } },
          roundRel: { select: { number: true } },
        },
      }),
      getSeasonParticipantClubs(this.prisma, seasonId),
    ]);
    const filtered =
      upToRound == null
        ? matches
        : matches.filter((m) => matchWithinRoundLimit(m, upToRound));
    return computeStandings(filtered, participants);
  }

  getTopScorers(seasonId: string) {
    return getSeasonLeaders(this.prisma, seasonId, 'goals');
  }

  getTopAssists(seasonId: string) {
    return getSeasonLeaders(this.prisma, seasonId, 'assists');
  }

  getCardsLeaders(seasonId: string) {
    return Promise.all([
      getSeasonLeaders(this.prisma, seasonId, 'yellowCards', 5),
      getSeasonLeaders(this.prisma, seasonId, 'redCards', 5),
    ]).then(([yellow, red]) => ({ yellow, red }));
  }
}
