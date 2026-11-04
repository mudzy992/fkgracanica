import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { isolatedDatabaseUrl } from './lineup-e2e-fixture';

describe('FE-06 migracija postave (stvarni PostgreSQL)', () => {
  it('backfill označi samo mečeve s redovima, bez izmjene i gubitka redova', async () => {
    const client = new Client({ connectionString: isolatedDatabaseUrl() });
    await client.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'CREATE TEMP TABLE "Match" ("id" TEXT PRIMARY KEY) ON COMMIT DROP',
      );
      await client.query(
        'CREATE TEMP TABLE "MatchLineup" ("matchId" TEXT, "playerId" TEXT) ON COMMIT DROP',
      );
      await client.query(
        `INSERT INTO "Match" VALUES ('saved'), ('empty'), ('never')`,
      );
      await client.query(
        `INSERT INTO "MatchLineup" VALUES ('saved', 'p1'), ('saved', 'p2')`,
      );
      const sql = readFileSync(
        resolve(
          __dirname,
          '../prisma/migrations/20261104150000_fe06_lineup_configured/migration.sql',
        ),
        'utf8',
      );
      await client.query(sql);
      const flags = await client.query<{
        id: string;
        lineupConfigured: boolean;
      }>('SELECT "id", "lineupConfigured" FROM "Match" ORDER BY "id"');
      expect(flags.rows).toEqual([
        { id: 'empty', lineupConfigured: false },
        { id: 'never', lineupConfigured: false },
        { id: 'saved', lineupConfigured: true },
      ]);
      const existing = await client.query<{
        matchId: string;
        playerId: string;
      }>('SELECT "matchId", "playerId" FROM "MatchLineup" ORDER BY "playerId"');
      expect(existing.rows).toEqual([
        { matchId: 'saved', playerId: 'p1' },
        { matchId: 'saved', playerId: 'p2' },
      ]);
      await client.query(`INSERT INTO "Match" ("id") VALUES ('new')`);
      const added = await client.query<{ lineupConfigured: boolean }>(
        `SELECT "lineupConfigured" FROM "Match" WHERE "id" = 'new'`,
      );
      expect(added.rows[0].lineupConfigured).toBe(false);
    } finally {
      await client.query('ROLLBACK');
      await client.end();
    }
  });
});
