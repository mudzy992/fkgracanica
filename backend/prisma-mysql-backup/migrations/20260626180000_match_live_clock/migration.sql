-- AlterTable
ALTER TABLE `Match` ADD COLUMN `clockStartedAt` DATETIME(3) NULL,
    ADD COLUMN `matchPeriod` ENUM('FIRST_HALF', 'SECOND_HALF') NULL,
    ADD COLUMN `stoppageFirstHalf` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `stoppageSecondHalf` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `liveStreamUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MatchEvent` ADD COLUMN `relatedPlayerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `MatchEvent` ADD CONSTRAINT `MatchEvent_relatedPlayerId_fkey` FOREIGN KEY (`relatedPlayerId`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
