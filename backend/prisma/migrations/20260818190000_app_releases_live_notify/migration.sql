-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `notifyLiveMatch` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `AppRelease` (
    `id` VARCHAR(191) NOT NULL,
    `platform` ENUM('ANDROID') NOT NULL DEFAULT 'ANDROID',
    `version` VARCHAR(191) NOT NULL,
    `versionCode` INTEGER NOT NULL,
    `minSupportedVersionCode` INTEGER NOT NULL DEFAULT 1,
    `forceUpdate` BOOLEAN NOT NULL DEFAULT false,
    `apkPath` VARCHAR(191) NOT NULL,
    `apkSha256` VARCHAR(191) NOT NULL,
    `apkSizeBytes` INTEGER NOT NULL,
    `releaseNotes` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'RETIRED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppRelease_platform_versionCode_key`(`platform`, `versionCode`),
    INDEX `AppRelease_platform_status_versionCode_idx`(`platform`, `status`, `versionCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AppRelease`
    ADD CONSTRAINT `AppRelease_createdById_fkey`
    FOREIGN KEY (`createdById`) REFERENCES `User`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
