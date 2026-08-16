CREATE TABLE `customer_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`garment_slug` text NOT NULL,
	`garment_name` text NOT NULL,
	`color` text NOT NULL,
	`size` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
