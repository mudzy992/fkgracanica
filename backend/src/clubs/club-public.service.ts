import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClubSquadService } from './club-squad.service';
import { ClubStatsService } from './club-stats.service';
import { ClubStadiumService } from './club-stadium.service';

@Injectable()
export class ClubPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly squad: ClubSquadService,
    private readonly stats: ClubStatsService,
    private readonly stadium: ClubStadiumService,
  ) {}

  async getBySlug(slug: string) {
    const club = await this.prisma.club.findUnique({
      where: { slug },
      include: { stadiumRel: true },
    });
    if (!club) throw new NotFoundException('Klub nije pronađen.');

    const [squad, seasonStats, stadium, lastMatch] = await Promise.all([
      this.squad.getSquad(club.id),
      this.stats.getClubSeasonStats(club.id),
      this.stadium.getByClubId(club.id),
      this.getLastMatchLineup(club.id),
    ]);

    const players = await this.prisma.player.findMany({
      where: { clubId: club.id, isActive: true },
      orderBy: [{ number: 'asc' }, { lastName: 'asc' }],
    });

    return { club, stadium, squad, seasonStats, players, lastMatch };
  }

  private async getLastMatchLineup(clubId: string) {
    const match = await this.prisma.match.findFirst({
      where: {
        OR: [{ homeClubId: clubId }, { awayClubId: clubId }],
        status: { in: [MatchStatus.FINISHED, MatchStatus.LIVE] },
      },
      orderBy: { scheduledAt: 'desc' },
      include: {
        homeClub: { select: { id: true, name: true, slug: true } },
        awayClub: { select: { id: true, name: true, slug: true } },
        lineup: { include: { player: true } },
      },
    });
    if (!match) return null;

    const isHome = match.homeClubId === clubId;
    const opponent = isHome ? match.awayClub : match.homeClub;
    const clubLineup = match.lineup.filter(
      (l) => l.clubId === clubId || l.player?.clubId === clubId,
    );

    return {
      matchId: match.id,
      scheduledAt: match.scheduledAt,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      isHome,
      opponent,
      lineup: clubLineup.map((l) => ({
        id: l.id,
        playerId: l.playerId,
        positionX: l.positionX,
        positionY: l.positionY,
        isStarter: l.isStarter,
        player: l.player,
      })),
    };
  }
}
