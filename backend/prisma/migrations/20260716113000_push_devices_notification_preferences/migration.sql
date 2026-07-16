-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `notifyInApp` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `notifyEmail` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `notifyPush` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `PushDevice` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expoPushToken` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PushDevice_expoPushToken_key`(`expoPushToken`),
    INDEX `PushDevice_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PushDevice`
    ADD CONSTRAINT `PushDevice_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
