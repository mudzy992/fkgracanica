-- CreateTable
CREATE TABLE `SeasonClub` (
    `id` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `clubId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SeasonClub_seasonId_idx`(`seasonId`),
    INDEX `SeasonClub_clubId_idx`(`clubId`),
    UNIQUE INDEX `SeasonClub_seasonId_clubId_key`(`seasonId`, `clubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SeasonClub` ADD CONSTRAINT `SeasonClub_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeasonClub` ADD CONSTRAINT `SeasonClub_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: klubovi koji već imaju utakmice u sezoni
INSERT INTO `SeasonClub` (`id`, `seasonId`, `clubId`, `createdAt`, `updatedAt`)
SELECT
    CONCAT('sc_', SUBSTRING(MD5(CONCAT(`seasonId`, `clubId`)), 1, 24)),
    `seasonId`,
    `clubId`,
    CURRENT_TIMESTAMP(3),
    CURRENT_TIMESTAMP(3)
FROM (
    SELECT `seasonId`, `homeClubId` AS `clubId` FROM `Match`
    UNION
    SELECT `seasonId`, `awayClubId` AS `clubId` FROM `Match`
) AS `participants`;
