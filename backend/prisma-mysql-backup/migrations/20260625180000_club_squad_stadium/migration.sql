-- AlterTable
ALTER TABLE `Club` ADD COLUMN `formationDef` INTEGER NOT NULL DEFAULT 4,
    ADD COLUMN `formationMid` INTEGER NOT NULL DEFAULT 3,
    ADD COLUMN `formationFwd` INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE `Stadium` (
    `id` VARCHAR(191) NOT NULL,
    `clubId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `imagePath` VARCHAR(191) NULL,
    `capacity` INTEGER NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Stadium_clubId_key`(`clubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClubSquadSlot` (
    `id` VARCHAR(191) NOT NULL,
    `clubId` VARCHAR(191) NOT NULL,
    `slotIndex` INTEGER NOT NULL,
    `lineRole` ENUM('GK', 'DEF', 'MID', 'FWD') NOT NULL,
    `positionX` DOUBLE NOT NULL DEFAULT 0,
    `positionY` DOUBLE NOT NULL DEFAULT 0,
    `isBench` BOOLEAN NOT NULL DEFAULT false,
    `benchOrder` INTEGER NULL,
    `playerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClubSquadSlot_clubId_idx`(`clubId`),
    INDEX `ClubSquadSlot_playerId_idx`(`playerId`),
    UNIQUE INDEX `ClubSquadSlot_clubId_slotIndex_isBench_key`(`clubId`, `slotIndex`, `isBench`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stadium` ADD CONSTRAINT `Stadium_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClubSquadSlot` ADD CONSTRAINT `ClubSquadSlot_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClubSquadSlot` ADD CONSTRAINT `ClubSquadSlot_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
