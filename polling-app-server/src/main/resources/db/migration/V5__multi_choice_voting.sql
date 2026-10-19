-- Adds multiple-choice voting. All existing polls are single-choice
-- (allow_multiple_choices = 0), so no backfill is needed. choice_id on votes
-- becomes nullable because a multi-choice vote has no single choice - its
-- selections live in the new vote_selections table instead.

ALTER TABLE `polls`
  ADD COLUMN `allow_multiple_choices` tinyint(1) NOT NULL DEFAULT 0 AFTER `category`;

ALTER TABLE `votes`
  MODIFY COLUMN `choice_id` bigint NULL;

CREATE TABLE `vote_selections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vote_id` bigint NOT NULL,
  `choice_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_vote_selections_vote_id_choice_id` (`vote_id`, `choice_id`),
  KEY `fk_vote_selections_choice_id` (`choice_id`),
  CONSTRAINT `fk_vote_selections_vote_id` FOREIGN KEY (`vote_id`) REFERENCES `votes` (`id`),
  CONSTRAINT `fk_vote_selections_choice_id` FOREIGN KEY (`choice_id`) REFERENCES `choices` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
