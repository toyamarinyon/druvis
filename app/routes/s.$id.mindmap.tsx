import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { generateMindMap } from "~/agents/mind-map-generator";
import { Mermaid } from "~/components/mermaid";

import { drizzle } from "~/db/drizzle";
export const loader = async (args: LoaderFunctionArgs) => {
	const id = args.params.id;

	if (id == null) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const db = drizzle(args);
	const webpage = await db.query.webpages.findFirst({
		where: (webpages, { eq }) => eq(webpages.id, id),
		with: {
			summary: true,
		},
	});
	if (webpage == null) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const mindMap = await generateMindMap(
		args,
		webpage.summary?.summaryText ?? "",
	);
	return json({ mindMap });
};

export default function MindMap() {
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			<Mermaid id="ss" chart={data.mindMap} />
		</div>
	);
}
