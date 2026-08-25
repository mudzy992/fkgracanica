-- CreateTable
CREATE TABLE `Round` (
    `id` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Round_seasonId_idx`(`seasonId`),
    UNIQUE INDEX `Round_seasonId_number_key`(`seasonId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Match` ADD COLUMN `roundId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Match_roundId_idx` ON `Match`(`roundId`);

-- AddForeignKey
ALTER TABLE `Round` ADD CONSTRAINT `Round_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `Round`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
