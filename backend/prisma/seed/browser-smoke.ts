import { ContentStatus } from '@prisma/client';
import { createPrisma } from './prisma-client';
import { seedRbac } from './rbac';
import { seedSettingsAndAdmin } from './settings-admin';

// Ne dopustiti slučajno seedovanje drugih baza ili korisničkih naloga.
const db = new URL(process.env.DATABASE_URL ?? '');
if (process.env.NODE_ENV !== 'test' || db.protocol !== 'postgresql:' || db.hash || db.hostname !== '127.0.0.1' || db.port !== '5432' ||
    db.pathname !== '/fk_browser_test' || db.search !== '?schema=public' || db.username !== 'postgres' || db.password || !process.env.ADMIN_EMAIL?.endsWith('@example.test')) {
  throw new Error('Browser seed je dozvoljen samo za izolovanu testnu bazu i sintetički nalog');
}
const prisma = createPrisma();

async function main() {
  await seedRbac(prisma);
  await seedSettingsAndAdmin(prisma);
  await prisma.cmsPage.create({
    data: {
      slug: 'home', title: 'Testna naslovna', status: ContentStatus.PUBLISHED,
      sections: { create: [{ widgetType: 'hero', sortOrder: 0, config: { title: 'FK Gračanica', buttons: [] } }] },
    },
  });
  await prisma.cmsPage.create({ data: { slug: 'site', title: 'Testni site', status: ContentStatus.PUBLISHED } });
  await prisma.cmsMenu.create({ data: { key: 'main' } });
  console.log('Sintetički browser seed učitan.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
