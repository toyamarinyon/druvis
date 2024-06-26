import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const webpages = sqliteTable("webpages", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	url: text("url").notNull().unique(),
	content: text("content").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const webpagesRelations = relations(webpages, ({ one, many }) => ({
	header: one(webpageHeaders),
	summary: one(webpageSummaries),
	keywords: many(webpageKeywords),
	mindMap: one(webpageMindMaps),
}));

export const webpageHeaders = sqliteTable("webpage_headers", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	webpageId: text("webpage_id")
		.notNull()
		.references(() => webpages.id),
	title: text("title"),
	description: text("description"),
	host: text("host"),
	favicon: text("favicon"),
});

export const webpageHeadersRelations = relations(webpageHeaders, ({ one }) => ({
	webpage: one(webpages, {
		fields: [webpageHeaders.webpageId],
		references: [webpages.id],
	}),
}));

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

export const webpageSummariesRelations = relations(
	webpageSummaries,
	({ one }) => ({
		webpage: one(webpages, {
			fields: [webpageSummaries.webpageId],
			references: [webpages.id],
		}),
	}),
);

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

export const webpageKeywordRelations = relations(
	webpageKeywords,
	({ one }) => ({
		webpage: one(webpages, {
			fields: [webpageKeywords.webpageId],
			references: [webpages.id],
		}),
	}),
);

export const webpageMindMaps = sqliteTable("webpage_mind_maps", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	webpageId: text("webpage_id")
		.notNull()
		.references(() => webpages.id),
	mermaidText: text("mermaid_text").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const webpageMindMapsRelations = relations(
	webpageMindMaps,
	({ one }) => ({
		webpage: one(webpages, {
			fields: [webpageMindMaps.webpageId],
			references: [webpages.id],
		}),
	}),
);
