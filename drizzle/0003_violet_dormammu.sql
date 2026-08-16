ALTER TABLE `garments` ADD `piece_code` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `garments` ADD `availability` text DEFAULT 'available' NOT NULL;--> statement-breakpoint
ALTER TABLE `garments` ADD `units` integer DEFAULT 1 NOT NULL;