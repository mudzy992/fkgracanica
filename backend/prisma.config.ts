import { resolve } from 'path';
import { createRequire } from 'module';
import { defineConfig } from 'prisma/config';

// dotenv je opcionalan u produkciji (env već dolazi iz Coolifya / Docker env).
// Raniji `import { config } from 'dotenv'` je pucao sa CLI.CONFIG_UNREADABLE
// kad `npm prune` u runner fazi ukloni dotenv — fallback na try/catch.
try {
  const require = createRequire(import.meta.url);
  const { config: loadEnv } = require('dotenv');
  loadEnv({ path: resolve(__dirname, '../.env') });
  loadEnv();
} catch {}

/**
 * CI-04 / B-CI04-02 (2026-11-03): **nema više `env('DATABASE_URL')`**.
 *
 * Coolify (docker-compose pack) izvozi `build.args` u okruženje i za `up`, pa je
 * dummy build-arg `DATABASE_URL` završio kao RUNTIME env kontejnera — Prisma je
 * javljala `P1001: Can't reach database server at build-arg-dummy.invalid:5432`
 * iako je Coolify UI imao ispravan URL.
 *
 * Zato: build (npr. `prisma generate`) dobija bezopasni placeholder, a runtime
 * dobija isključivo `${DATABASE_URL}` iz compose `environment:` bloka (koji je
 * fail-fast `:?`). `prisma generate` ne otvara konekciju, pa mu placeholder ne
 * smeta; provjeru prave vrijednosti radi `docker-entrypoint.sh` prije migracija.
 */
const GENERATE_PLACEHOLDER = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

const databaseUrl = process.env.DATABASE_URL?.trim() || GENERATE_PLACEHOLDER;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
