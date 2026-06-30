import { Injectable, NotFoundException } from '@nestjs/common';
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

    const [squad, seasonStats, stadium] = await Promise.all([
      this.squad.getSquad(club.id),
      this.stats.getClubSeasonStats(club.id),
      this.stadium.getByClubId(club.id),
    ]);

    const players = await this.prisma.player.findMany({
      where: { clubId: club.id, isActive: true },
      orderBy: [{ number: 'asc' }, { lastName: 'asc' }],
    });

    return { club, stadium, squad, seasonStats, players };
  }
}
