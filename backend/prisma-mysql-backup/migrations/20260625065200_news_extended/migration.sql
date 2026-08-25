-- AlterTable
ALTER TABLE `News` ADD COLUMN `videoUrl` VARCHAR(191) NULL,
    ADD COLUMN `galleryId` VARCHAR(191) NULL,
    ADD COLUMN `scheduledAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `News_scheduledAt_idx` ON `News`(`scheduledAt`);
CREATE INDEX `News_categoryId_idx` ON `News`(`categoryId`);

-- CreateTable
CREATE TABLE `NewsMatch` (
    `id` VARCHAR(191) NOT NULL,
    `newsId` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,

    INDEX `NewsMatch_newsId_idx`(`newsId`),
    INDEX `NewsMatch_matchId_idx`(`matchId`),
    UNIQUE INDEX `NewsMatch_newsId_matchId_key`(`newsId`, `matchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsPlayer` (
    `id` VARCHAR(191) NOT NULL,
    `newsId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,

    INDEX `NewsPlayer_newsId_idx`(`newsId`),
    INDEX `NewsPlayer_playerId_idx`(`playerId`),
    UNIQUE INDEX `NewsPlayer_newsId_playerId_key`(`newsId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_galleryId_fkey` FOREIGN KEY (`galleryId`) REFERENCES `Gallery`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsMatch` ADD CONSTRAINT `NewsMatch_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `News`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsMatch` ADD CONSTRAINT `NewsMatch_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsPlayer` ADD CONSTRAINT `NewsPlayer_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `News`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NewsPlayer` ADD CONSTRAINT `NewsPlayer_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Membership` MODIFY `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
