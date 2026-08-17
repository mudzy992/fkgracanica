import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });
loadEnv();

import { createPrisma } from './seed/prisma-client';
import { seedRbac } from './seed/rbac';

const prisma = createPrisma();

seedRbac(prisma)
  .then(() => console.log('RBAC seed completed.'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
