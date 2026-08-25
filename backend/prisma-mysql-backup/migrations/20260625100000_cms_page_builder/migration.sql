-- CreateTable
CREATE TABLE `CmsPage` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `seoTitle` VARCHAR(191) NULL,
    `seoDesc` TEXT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CmsPage_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CmsPageSection` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `widgetType` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `config` JSON NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CmsPageSection_pageId_sortOrder_idx`(`pageId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CmsMenu` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CmsMenu_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CmsMenuItem` (
    `id` VARCHAR(191) NOT NULL,
    `menuId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `pageId` VARCHAR(191) NULL,
    `path` VARCHAR(191) NULL,
    `externalUrl` VARCHAR(191) NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CmsMenuItem_menuId_sortOrder_idx`(`menuId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CmsPageSection` ADD CONSTRAINT `CmsPageSection_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `CmsPage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CmsMenuItem` ADD CONSTRAINT `CmsMenuItem_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `CmsMenu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CmsMenuItem` ADD CONSTRAINT `CmsMenuItem_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `CmsPage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CmsMenuItem` ADD CONSTRAINT `CmsMenuItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CmsMenuItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
