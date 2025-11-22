ALTER TABLE `initiatives` ADD `status` enum('pending','under-review','approved','rejected') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `initiatives` ADD `adminNotes` text;