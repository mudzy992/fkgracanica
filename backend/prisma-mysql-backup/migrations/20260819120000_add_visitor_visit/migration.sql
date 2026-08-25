-- CreateTable
CREATE TABLE `VisitorVisit` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `visitorKeyHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VisitorVisit_date_platform_visitorKeyHash_key`(`date`, `platform`, `visitorKeyHash`),
    INDEX `VisitorVisit_date_platform_idx`(`date`, `platform`),
    INDEX `VisitorVisit_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
