ALTER TABLE `CmsMenuItem` ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `CmsMenuItem` ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true;

UPDATE `CmsMenuItem` SET `isSystem` = true WHERE `path` IN ('/', '/o-klubu', '/vijesti', '/galerija', '/tim', '/liga', '/sponzori', '/trofeji', '/kontakt');
