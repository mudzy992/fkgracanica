import type { PrismaService } from '../prisma/prisma.service';

type ClubVenueSource = {
  stadium?: string | null;
  stadiumRel?: { name: string } | null;
};

export function resolveClubVenue(club?: ClubVenueSource | null): string | null {
  if (!club) return null;
  const name = club.stadiumRel?.name?.trim() || club.stadium?.trim();
  return name || null;
}

export async function resolveMatchVenue(
  prisma: PrismaService,
  homeClubId: string,
  venue?: string | null,
): Promise<string | null> {
  const trimmed = venue?.trim();
  if (trimmed) return trimmed;
  const homeClub = await prisma.club.findUnique({
    where: { id: homeClubId },
    include: { stadiumRel: true },
  });
  return resolveClubVenue(homeClub);
}
