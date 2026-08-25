-- CreateTable
CREATE TABLE `SeasonPass` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `qrCode` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentProvider` VARCHAR(191) NOT NULL DEFAULT 'box_office',
    `externalId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SeasonPass_qrCode_key`(`qrCode`),
    INDEX `SeasonPass_seasonId_status_idx`(`seasonId`, `status`),
    INDEX `SeasonPass_externalId_idx`(`externalId`),
    UNIQUE INDEX `SeasonPass_userId_seasonId_key`(`userId`, `seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SeasonPassAdmission` (
    `id` VARCHAR(191) NOT NULL,
    `passId` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `scannedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SeasonPassAdmission_passId_matchId_key`(`passId`, `matchId`),
    INDEX `SeasonPassAdmission_matchId_idx`(`matchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `SeasonPass` ADD CONSTRAINT `SeasonPass_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SeasonPass` ADD CONSTRAINT `SeasonPass_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SeasonPassAdmission` ADD CONSTRAINT `SeasonPassAdmission_passId_fkey` FOREIGN KEY (`passId`) REFERENCES `SeasonPass`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SeasonPassAdmission` ADD CONSTRAINT `SeasonPassAdmission_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
