import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubStadiumService {
  constructor(private readonly prisma: PrismaService) {}

  async getByClubId(clubId: string) {
    return this.prisma.stadium.findUnique({ where: { clubId } });
  }

  async upsert(
    clubId: string,
    data: {
      name: string;
      address?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      imagePath?: string;
      capacity?: number;
      description?: string;
    },
  ) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Klub nije pronađen.');
    return this.prisma.stadium.upsert({
      where: { clubId },
      create: { clubId, ...data },
      update: data,
    });
  }
}
