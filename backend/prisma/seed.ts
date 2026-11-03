import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });
loadEnv();

import { createPrisma } from './seed/prisma-client';
import { seedRbac } from './seed/rbac';
import { seedSettingsAndAdmin } from './seed/settings-admin';
import { seedDemoContent } from './seed/demo';

const prisma = createPrisma();

/**
 * BE-09c/P-B09c-8: demo sadržaj (vijesti, galerije, CMS, utakmice, igrači) se
 * puni SAMO uz `SEED_DEMO=1`. Bez flaga seed radi ono što produkcija traži:
 * RBAC dozvole + settings + admin nalog.
 */
async function main() {
  await seedRbac(prisma);
  const adminUserId = await seedSettingsAndAdmin(prisma);
  if (process.env.SEED_DEMO === '1') {
    await seedDemoContent(prisma, adminUserId);
    console.log('Demo sadržaj učitan (SEED_DEMO=1).');
  } else {
    console.log(
      'Demo sadržaj preskočen (postavi SEED_DEMO=1 za demo podatke).',
    );
  }
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
