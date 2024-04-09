import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { drizzle as drizzleClient } from "drizzle-orm/d1";
import * as schema from "./schema";

export const drizzle = ({ context }: ActionFunctionArgs) =>
	drizzleClient(context.cloudflare.env.DRUVIS_DB, { schema });
