import type { Config } from "drizzle-kit";

export default {
	schema: "./app/db/schema/index.ts",
	out: "./migrations",
	driver: "d1",
} satisfies Config;
