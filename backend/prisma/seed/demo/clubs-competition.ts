import type { SeedPrisma } from '../prisma-client';

export interface DemoCompetitionContext {
  ownClubId: string;
  opponentClubId: string;
  seasonId: string;
}

async function upsertClub(
  prisma: SeedPrisma,
  data: {
    slug: string;
    name: string;
    isOwnClub: boolean;
    city?: string;
    stadium?: string;
    description?: string;
  },
) {
  const existing = await prisma.club.findUnique({ where: { slug: data.slug } });
  if (existing) return existing;
  return prisma.club.create({ data });
}

export async function seedClubsAndCompetition(prisma: SeedPrisma): Promise<DemoCompetitionContext> {
  const ownClub = await upsertClub(prisma, {
    slug: 'fk-gracanica',
    name: 'FK Gračanica',
    isOwnClub: true,
    city: 'Gračanica',
    stadium: 'Stadion FK Gračanica',
    description: 'Fudbalski klub iz Gračanice sa dugom tradicijom i jakom podrškom navijača.',
  });

  const opponent = await upsertClub(prisma, {
    slug: 'fk-slavija',
    name: 'FK Slavija',
    isOwnClub: false,
    city: 'Sarajevo',
    stadium: 'Stadion Slavija',
  });

  let competition = await prisma.competition.findUnique({ where: { slug: 'druga-liga-fbih' } });
  if (!competition) {
    competition = await prisma.competition.create({
      data: { name: 'Druga liga FBiH', slug: 'druga-liga-fbih', isLeague: true },
    });
  } else if (!competition.isLeague) {
    competition = await prisma.competition.update({
      where: { id: competition.id },
      data: { isLeague: true },
    });
  }

  let season = await prisma.season.findFirst({
    where: { competitionId: competition.id, name: '2025/2026' },
  });
  if (!season) {
    season = await prisma.season.create({
      data: {
        name: '2025/2026',
        yearStart: 2025,
        yearEnd: 2026,
        isActive: true,
        competitionId: competition.id,
      },
    });
  }

  await prisma.seasonClub.createMany({
    data: [
      { seasonId: season.id, clubId: ownClub.id },
      { seasonId: season.id, clubId: opponent.id },
    ],
    skipDuplicates: true,
  });

  return { ownClubId: ownClub.id, opponentClubId: opponent.id, seasonId: season.id };
}
