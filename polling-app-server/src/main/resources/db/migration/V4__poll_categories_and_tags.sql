-- Adds an optional category to polls, plus a normalized tags table.
-- Both are nullable/empty for every existing poll (no backfill needed).

ALTER TABLE `polls`
  ADD COLUMN `category` varchar(40) DEFAULT NULL AFTER `visibility`;

CREATE INDEX `idx_polls_category` ON `polls` (`category`);

CREATE TABLE `poll_tags` (
  `poll_id` bigint NOT NULL,
  `tag` varchar(30) NOT NULL,
  KEY `fk_poll_tags_poll_id` (`poll_id`),
  CONSTRAINT `fk_poll_tags_poll_id` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
