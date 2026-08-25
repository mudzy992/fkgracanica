-- AlterTable
ALTER TABLE `VisitorVisit` ADD COLUMN `countryCode` VARCHAR(191) NULL,
    ADD COLUMN `region` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `VisitorVisit_countryCode_idx` ON `VisitorVisit`(`countryCode`);
