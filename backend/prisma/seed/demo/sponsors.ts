import { SponsorTier } from '@prisma/client';
import type { SeedPrisma } from '../prisma-client';

const SPONSORS = [
  { name: 'Grad Gračanica', tier: SponsorTier.GENERAL, sortOrder: 1 },
  { name: 'Lokalni partner', tier: SponsorTier.GOLD, sortOrder: 2 },
  { name: 'Sportski centar', tier: SponsorTier.SILVER, sortOrder: 3 },
  { name: 'Medijski partner', tier: SponsorTier.PARTNER, sortOrder: 4 },
] as const;

export async function seedSponsors(prisma: SeedPrisma) {
  for (const sponsor of SPONSORS) {
    const existing = await prisma.sponsor.findFirst({ where: { name: sponsor.name } });
    if (existing) continue;
    await prisma.sponsor.create({ data: sponsor });
  }
}
