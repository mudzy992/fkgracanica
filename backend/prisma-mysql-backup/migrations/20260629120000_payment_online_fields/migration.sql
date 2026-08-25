-- AlterTable Payment: online provider fields
ALTER TABLE `Payment` MODIFY `status` ENUM('PENDING_BOX_OFFICE', 'PENDING_ONLINE', 'CONFIRMED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_BOX_OFFICE';
ALTER TABLE `Payment` ADD COLUMN `provider` VARCHAR(191) NOT NULL DEFAULT 'box_office';
ALTER TABLE `Payment` ADD COLUMN `externalId` VARCHAR(191) NULL;
CREATE INDEX `Payment_externalId_idx` ON `Payment`(`externalId`);
