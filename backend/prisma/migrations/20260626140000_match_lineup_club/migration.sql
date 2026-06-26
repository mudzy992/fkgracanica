-- AlterTable
ALTER TABLE `MatchLineup` ADD COLUMN `clubId` VARCHAR(191) NULL;

-- Backfill from player club
UPDATE `MatchLineup` ml
INNER JOIN `Player` p ON ml.`playerId` = p.`id`
SET ml.`clubId` = p.`clubId`
WHERE p.`clubId` IS NOT NULL;

DELETE FROM `MatchLineup` WHERE `clubId` IS NULL;

-- Make required + FK
ALTER TABLE `MatchLineup` MODIFY `clubId` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `MatchLineup_matchId_playerId_key` ON `MatchLineup`(`matchId`, `playerId`);
CREATE INDEX `MatchLineup_matchId_clubId_idx` ON `MatchLineup`(`matchId`, `clubId`);

ALTER TABLE `MatchLineup` ADD CONSTRAINT `MatchLineup_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
