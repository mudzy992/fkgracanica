import type { SeedPrisma } from '../prisma-client';

const TROPHIES = [
  {
    name: 'Prvenstvo',
    year: 2019,
    competition: 'Regionalna liga',
    featured: true,
    description:
      '<p>Historijska titula koja je potvrdila status kluba na regionalnoj sceni. Sezona obilježena stabilnošću i timskim duhom.</p>',
  },
  { name: 'Kup', year: 2021, competition: 'Kup BiH — zona' },
  { name: 'Superkup', year: 2022, competition: 'Lokalni superkup' },
] as const;

export async function seedTrophies(prisma: SeedPrisma) {
  for (const trophy of TROPHIES) {
    const existing = await prisma.trophy.findFirst({
      where: { name: trophy.name, year: trophy.year },
    });
    if (existing) continue;
    if ('featured' in trophy && trophy.featured) {
      await prisma.trophy.updateMany({ data: { featured: false } });
    }
    await prisma.trophy.create({ data: trophy });
  }
}
