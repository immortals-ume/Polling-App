-- Adds explicit poll lifecycle state (DRAFT -> PUBLISHED -> CLOSED -> ARCHIVED) and
-- visibility (PUBLIC/PRIVATE). Existing polls were implicitly "published and public"
-- the moment they were created (the only behavior the app has ever had), so they are
-- backfilled to PUBLISHED/PUBLIC to keep current functionality unchanged.

ALTER TABLE `polls`
  ADD COLUMN `status` enum('DRAFT','PUBLISHED','CLOSED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED' AFTER `expiration_date_time`,
  ADD COLUMN `visibility` enum('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PUBLIC' AFTER `status`;

UPDATE `polls` SET `status` = 'PUBLISHED', `visibility` = 'PUBLIC';

CREATE INDEX `idx_polls_status` ON `polls` (`status`);
