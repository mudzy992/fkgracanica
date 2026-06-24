import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });
loadEnv();

import { createPrisma } from './seed/prisma-client';
import { seedRbac } from './seed/rbac';
import { seedSettingsAndAdmin } from './seed/settings-admin';
import { seedDemoContent } from './seed/demo';

const prisma = createPrisma();

async function main() {
  await seedRbac(prisma);
  const adminUserId = await seedSettingsAndAdmin(prisma);
  await seedDemoContent(prisma, adminUserId);
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
