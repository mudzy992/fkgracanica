-- FE-06 / P-FE06-17: dodaj stanje bez izmjene postojećih redova postave.
ALTER TABLE "Match" ADD COLUMN "lineupConfigured" BOOLEAN NOT NULL DEFAULT false;

-- Redovi potvrđuju da je postava već spremljena. Historijske prazne postave
-- bez redova nije moguće razlikovati od nikad spremljenih.
UPDATE "Match" AS match
SET "lineupConfigured" = true
WHERE EXISTS (
  SELECT 1 FROM "MatchLineup" AS lineup WHERE lineup."matchId" = match."id"
);
