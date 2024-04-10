CREATE TABLE `webpage_mind_maps` (
	`id` text PRIMARY KEY NOT NULL,
	`webpage_id` text NOT NULL,
	`mermaid_text` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`webpage_id`) REFERENCES `webpages`(`id`) ON UPDATE no action ON DELETE no action
);
