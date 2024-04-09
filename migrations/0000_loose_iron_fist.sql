CREATE TABLE `webpage_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`webpage_id` text NOT NULL,
	`content` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`webpage_id`) REFERENCES `webpages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `webpage_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`webpage_id` text NOT NULL,
	`summary_text` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`webpage_id`) REFERENCES `webpages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `webpages` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webpages_url_unique` ON `webpages` (`url`);