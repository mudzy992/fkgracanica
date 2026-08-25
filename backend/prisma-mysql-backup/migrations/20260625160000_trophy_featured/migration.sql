ALTER TABLE `Trophy` ADD COLUMN `featured` BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX `Trophy_featured_idx` ON `Trophy`(`featured`);
