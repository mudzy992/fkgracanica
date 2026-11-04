-- BE-09d / P-B09d-1: uklanjanje legacy `Match.round`.
-- Korak 1/2: mapiraj skalarni broj kola na `Round` redove (idempotentno).
INSERT INTO "Round" ("id", "seasonId", "number", "name", "createdAt", "updatedAt")
SELECT
    md5(random()::text || clock_timestamp()::text),
    legacy."seasonId",
    legacy."round",
    legacy."round"::text || '. kolo',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "seasonId", "round"
    FROM "Match"
    WHERE "round" IS NOT NULL AND "roundId" IS NULL
) AS legacy
WHERE NOT EXISTS (
    SELECT 1 FROM "Round" r
    WHERE r."seasonId" = legacy."seasonId" AND r."number" = legacy."round"
);

UPDATE "Match" AS m
SET "roundId" = r."id"
FROM "Round" r
WHERE m."roundId" IS NULL
  AND m."round" IS NOT NULL
  AND r."seasonId" = m."seasonId"
  AND r."number" = m."round";

-- P-B09d-2: guard — nikad ne nastavljaj sa `round` kolonom ako je ostao siročić.
DO $$
DECLARE orphans integer;
BEGIN
    SELECT count(*) INTO orphans
    FROM "Match"
    WHERE "round" IS NOT NULL AND "roundId" IS NULL;

    IF orphans > 0 THEN
        RAISE EXCEPTION 'BE-09d: % utakmica jos nema roundId poslije backfilla; migracija se prekida.', orphans;
    END IF;
END $$;
