import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export function createPrisma() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
    max: 5,
  });
  return new PrismaClient({ adapter });
}

export type SeedPrisma = ReturnType<typeof createPrisma>;
