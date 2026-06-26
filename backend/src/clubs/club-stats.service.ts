import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeStandings } from '../statistics/standings.util';

@Injectable()
export class ClubStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClubSeasonStats(clubId: string, seasonId?: string) {
    const season = seasonId
      ? await this.prisma.season.findUnique({ where: { id: seasonId } })
      : await this.prisma.season.findFirst({ where: { isActive: true }, orderBy: { yearStart: 'desc' } });
    if (!season) return { season: null, standing: null, players: [] };

    const matches = await this.prisma.match.findMany({
      where: { seasonId: season.id, status: MatchStatus.FINISHED },
      include: { homeClub: { select: { id: true, name: true } }, awayClub: { select: { id: true, name: true } } },
    });
    const standing = computeStandings(matches).find((r) => r.clubId === clubId) ?? null;

    const players = await this.prisma.player.findMany({
      where: { clubId },
      include: {
        statistics: { where: { seasonId: season.id } },
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
      season: { id: season.id, name: season.name },
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
