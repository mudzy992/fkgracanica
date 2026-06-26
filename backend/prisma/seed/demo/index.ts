import type { SeedPrisma } from '../prisma-client';
import { seedClubsAndCompetition } from './clubs-competition';
import { seedClubTimeline } from './club-timeline';
import { seedCmsPages } from './cms';
import { seedGallery } from './gallery';
import { seedMatches } from './matches';
import { seedNews } from './news';
import { seedPlayers } from './players';
import { seedClubStadiumAndSquad } from './club-squad';
import { seedSponsors } from './sponsors';
import { seedTrophies } from './trophies';

export async function seedDemoContent(prisma: SeedPrisma, adminUserId: string | null) {
  const ctx = await seedClubsAndCompetition(prisma);
  await seedNews(prisma, adminUserId);
  await seedGallery(prisma);
  await seedCmsPages(prisma);
  await seedSponsors(prisma);
  await seedTrophies(prisma);
  await seedClubTimeline(prisma);
  await seedPlayers(prisma, ctx.ownClubId, ctx.opponentClubId);
  await seedClubStadiumAndSquad(prisma, ctx.ownClubId);
  await seedClubStadiumAndSquad(prisma, ctx.opponentClubId);
  await seedMatches(prisma, ctx);
}
