import type { SeedPrisma } from '../prisma-client';
import { seedClubsAndCompetition } from './clubs-competition';
import { seedCmsBlocks } from './cms';
import { seedMatches } from './matches';
import { seedNews } from './news';
import { seedSponsors } from './sponsors';

export async function seedDemoContent(prisma: SeedPrisma, adminUserId: string | null) {
  const ctx = await seedClubsAndCompetition(prisma);
  await seedNews(prisma, adminUserId);
  await seedCmsBlocks(prisma);
  await seedSponsors(prisma);
  await seedMatches(prisma, ctx);
}
