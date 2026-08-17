import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeStandings } from '../statistics/standings.util';
import { getSeasonParticipantClubs } from '../competitions/season-participants.util';
import { findDefaultLeagueEdition } from '../competitions/league-season.util';

@Injectable()
export class ClubStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async listClubParticipations(clubId: string) {
    const rows = await this.prisma.seasonClub.findMany({
      where: { clubId },
      include: { edition: { include: { competition: true, season: true } } },
      orderBy: [{ edition: { season: { yearStart: 'desc' } } }],
    });
    return rows.map((r) => ({
      seasonId: r.seasonCompetitionId,
      calendarSeasonId: r.edition.seasonId,
      seasonName: r.edition.season.name,
      yearStart: r.edition.season.yearStart,
      yearEnd: r.edition.season.yearEnd,
      isActive: r.edition.season.isActive,
      competitionId: r.edition.competition.id,
      competitionName: r.edition.competition.name,
      isLeague: r.edition.competition.isLeague,
    }));
  }

  async getClubSeasonStats(clubId: string, seasonId?: string) {
    const edition = seasonId
      ? await this.prisma.seasonCompetition.findUnique({
          where: { id: seasonId },
          include: { season: true },
        })
      : await findDefaultLeagueEdition(this.prisma);
    if (!edition) return { season: null, standing: null, players: [] };

    const [matches, participants] = await Promise.all([
      this.prisma.match.findMany({
        where: { seasonCompetitionId: edition.id, status: MatchStatus.FINISHED },
        include: {
          homeClub: { select: { id: true, name: true, slug: true } },
          awayClub: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      getSeasonParticipantClubs(this.prisma, edition.id),
    ]);
    const standing = computeStandings(matches, participants).find((r) => r.clubId === clubId) ?? null;

    const players = await this.prisma.player.findMany({
      where: { clubId },
      include: {
        statistics: { where: { seasonCompetitionId: edition.id } },
      },
      orderBy: [{ number: 'asc' }, { lastName: 'asc' }],
    });

    const totals = players.reduce(
      (acc, p) => {
        const s = p.statistics[0];
        if (!s) return acc;
        acc.appearances += s.appearances;
        acc.goals += s.goals;
        acc.assists += s.assists;
        acc.yellowCards += s.yellowCards;
        acc.redCards += s.redCards;
        return acc;
      },
      { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
    );

    return {
      season: { id: edition.id, name: edition.season.name },
      standing,
      totals,
      players: players.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        number: p.number,
        position: p.position,
        stats: p.statistics[0] ?? null,
      })),
    };
  }
}
