-- Calendar Season becomes parent; existing Season rows become SeasonCompetition (same ids).

CREATE TABLE `SeasonCalendar` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `yearStart` INTEGER NOT NULL,
    `yearEnd` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `SeasonCalendar` (`id`, `name`, `yearStart`, `yearEnd`, `isActive`, `createdAt`, `updatedAt`)
SELECT
    CONCAT('s', `yearStart`, 'e', `yearEnd`),
    CONCAT(`yearStart`, '/', `yearEnd`),
    `yearStart`,
    `yearEnd`,
    MAX(`isActive`),
    MIN(`createdAt`),
    MAX(`updatedAt`)
FROM `Season`
GROUP BY `yearStart`, `yearEnd`;

CREATE TABLE `SeasonCompetition` (
    `id` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `competitionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `SeasonCompetition_seasonId_competitionId_key` (`seasonId`, `competitionId`),
    INDEX `SeasonCompetition_seasonId_idx` (`seasonId`),
    INDEX `SeasonCompetition_competitionId_idx` (`competitionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `SeasonCompetition` (`id`, `seasonId`, `competitionId`, `createdAt`, `updatedAt`)
SELECT
    s.`id`,
    c.`id`,
    s.`competitionId`,
    s.`createdAt`,
    s.`updatedAt`
FROM `Season` s
INNER JOIN `SeasonCalendar` c
    ON c.`yearStart` = s.`yearStart` AND c.`yearEnd` = s.`yearEnd`;

ALTER TABLE `Round` DROP FOREIGN KEY `Round_seasonId_fkey`;
ALTER TABLE `Match` DROP FOREIGN KEY `Match_seasonId_fkey`;
ALTER TABLE `SeasonClub` DROP FOREIGN KEY `SeasonClub_seasonId_fkey`;
ALTER TABLE `Season` DROP FOREIGN KEY `Season_competitionId_fkey`;

DROP TABLE `Season`;
RENAME TABLE `SeasonCalendar` TO `Season`;

ALTER TABLE `SeasonCompetition`
    ADD CONSTRAINT `SeasonCompetition_seasonId_fkey`
    FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SeasonCompetition`
    ADD CONSTRAINT `SeasonCompetition_competitionId_fkey`
    FOREIGN KEY (`competitionId`) REFERENCES `Competition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Round`
    ADD CONSTRAINT `Round_seasonId_fkey`
    FOREIGN KEY (`seasonId`) REFERENCES `SeasonCompetition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Match`
    ADD CONSTRAINT `Match_seasonId_fkey`
    FOREIGN KEY (`seasonId`) REFERENCES `SeasonCompetition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SeasonClub`
    ADD CONSTRAINT `SeasonClub_seasonId_fkey`
    FOREIGN KEY (`seasonId`) REFERENCES `SeasonCompetition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

DELETE FROM `PlayerStatistics`
WHERE `seasonId` NOT IN (SELECT `id` FROM `SeasonCompetition`);

ALTER TABLE `PlayerStatistics`
    ADD CONSTRAINT `PlayerStatistics_seasonId_fkey`
    FOREIGN KEY (`seasonId`) REFERENCES `SeasonCompetition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX `PlayerStatistics_seasonId_idx` ON `PlayerStatistics`(`seasonId`);
