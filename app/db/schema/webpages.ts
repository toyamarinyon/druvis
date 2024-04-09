import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const webpages = sqliteTable("webpages", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	url: text("url").notNull().unique(),
	content: text("content").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const webpageSummaries = sqliteTable("webpage_summaries", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	webpageId: text("webpage_id")
		.notNull()
		.references(() => webpages.id),
	summaryText: text("summary_text").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const webpageKeywords = sqliteTable("webpage_keywords", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	webpageId: text("webpage_id")
		.notNull()
		.references(() => webpages.id),
	content: text("content").notNull(),
	description: text("description").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
