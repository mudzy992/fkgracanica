import { ContentStatus } from '@prisma/client';
import type { SeedPrisma } from '../prisma-client';

const ALBUMS = [
  {
    slug: 'utakmica-protiv-rivala',
    title: 'Utakmica protiv rivala',
    description: '<p>Fotografije sa domaće utakmice posljednjeg kola.</p>',
  },
  {
    slug: 'trening-prvog-tima',
    title: 'Trening prvog tima',
    description: '<p>Pripreme pred novu sezonu na stadionu.</p>',
  },
] as const;

export async function seedGallery(prisma: SeedPrisma) {
  for (const album of ALBUMS) {
    const existing = await prisma.gallery.findUnique({ where: { slug: album.slug } });
    if (existing) continue;

    await prisma.gallery.create({
      data: {
        title: album.title,
        slug: album.slug,
        description: album.description,
        status: ContentStatus.PUBLISHED,
      },
    });
  }
}
