CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_user_id_unique` ON `admins` (`user_id`);--> statement-breakpoint
CREATE TABLE `garments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`material` text NOT NULL,
	`color` text NOT NULL,
	`image_url` text NOT NULL,
	`image_key` text,
	`image_focus` text DEFAULT 'center' NOT NULL,
	`overlay_color` text NOT NULL,
	`overlay_accent` text NOT NULL,
	`featured` integer DEFAULT true NOT NULL,
	`sizes` text NOT NULL,
	`size_chart` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `garments_slug_unique` ON `garments` (`slug`);