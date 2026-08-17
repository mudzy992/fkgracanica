import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

export async function validateSeasonPass(
  prisma: PrismaService,
  qrCode: string,
  matchId?: string,
) {
  const pass = await prisma.seasonPass.findUnique({
    where: { qrCode },
    include: { season: { select: { name: true } }, user: { select: { email: true } } },
  });
  if (!pass) throw new NotFoundException('Ulaznica nije pronađena');
  if (pass.status !== 'ACTIVE') throw new BadRequestException('Sezonska karta nije aktivna');
  if (!matchId) throw new BadRequestException('Za sezonsku kartu odaberite utakmicu');

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeClub: true, awayClub: true, edition: { select: { seasonId: true } } },
  });
  if (!match) throw new NotFoundException('Utakmica nije pronađena');
  if (match.edition.seasonId !== pass.seasonId) {
    throw new BadRequestException('Karta nije za ovu sezonu');
  }
  if (!match.homeClub?.isOwnClub) {
    throw new BadRequestException('Sezonska karta vrijedi samo na domaćim utakmicama');
  }

  try {
    await prisma.seasonPassAdmission.create({ data: { passId: pass.id, matchId } });
  } catch {
    throw new BadRequestException('Sezonska karta je već skenirana za ovu utakmicu');
  }

  return {
    kind: 'pass' as const,
    id: pass.id,
    status: 'ADMITTED',
    category: pass.label,
    match: { homeClub: match.homeClub, awayClub: match.awayClub },
  };
}
