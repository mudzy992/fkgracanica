ALTER TABLE `NewsletterSubscriber` ADD COLUMN `unsubscribeToken` VARCHAR(191) NULL;

UPDATE `NewsletterSubscriber` SET `unsubscribeToken` = `id` WHERE `unsubscribeToken` IS NULL;

ALTER TABLE `NewsletterSubscriber` MODIFY `unsubscribeToken` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `NewsletterSubscriber_unsubscribeToken_key` ON `NewsletterSubscriber`(`unsubscribeToken`);

CREATE TABLE `NewsletterCampaign` (
    `id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `htmlBody` TEXT NOT NULL,
    `textBody` TEXT NOT NULL,
    `status` ENUM('DRAFT', 'SENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'DRAFT',
    `sentAt` DATETIME(3) NULL,
    `sentCount` INTEGER NOT NULL DEFAULT 0,
    `failCount` INTEGER NOT NULL DEFAULT 0,
    `targetCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NULL,

    INDEX `NewsletterCampaign_status_idx`(`status`),
    INDEX `NewsletterCampaign_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `NewsletterCampaign` ADD CONSTRAINT `NewsletterCampaign_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
