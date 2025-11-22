CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiativeId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `initiatives` ADD `roadmapStatus` enum('under-review','research','development','pilot','deployed','on-hold','rejected') DEFAULT 'under-review';