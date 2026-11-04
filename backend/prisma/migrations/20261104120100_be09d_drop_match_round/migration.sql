-- BE-09d / P-B09d-4: uklanjanje legacy `Match.round`.
-- Korak 2/2: kolona je poslije backfilla (20261104120000) suvišna — `Round.number` je izvor istine.
-- NEPOVRATNO: prije deploya uraditi backup baze.
ALTER TABLE "Match" DROP COLUMN "round";
