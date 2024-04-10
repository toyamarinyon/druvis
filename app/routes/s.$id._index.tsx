import {
	type LoaderFunctionArgs,
	type MetaFunction,
	json,
	redirect,
} from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { CornerDownLeftIcon } from "lucide-react";
import Markdown from "react-markdown";
import { generateMindMap } from "~/agents/mind-map-generator";
import { Mermaid } from "~/components/mermaid";
import { drizzle } from "~/db/drizzle";
import { webpageMindMaps } from "~/db/schema";

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
			header: true,
			summary: true,
			keywords: true,
			mindMap: true,
		},
	});
	if (webpage == null) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	/** @todo remove if all data has mind_map */
	if (webpage.mindMap == null) {
		const mindMap = await generateMindMap(
			args,
			webpage.summary?.summaryText ?? "",
		);
		await db.insert(webpageMindMaps).values({
			webpageId: webpage.id,
			mermaidText: mindMap,
		});
		return redirect(`/s/${id}`);
	}
	return json({ webpage });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (data?.webpage == null) {
		return [];
	}
	return [
		{
			title: `要約: ${data.webpage.header?.title} | ${data.webpage.header?.host}`,
		},
		{
			property: "og:title",
			content: `要約: ${data.webpage.header?.title} | ${data.webpage.header?.host}`,
		},
		{
			name: "description",
			content: data.webpage.summary?.summaryText,
		},
	];
};

export default function SummaryPage() {
	const { webpage } = useLoaderData<typeof loader>();
	return (
		<div className="text-gray-300 border-l pl-4 py-2 border-gray-500 w-[800px] max-h-[77%] flex flex-col">
			<div className="border-b mb-2">
				<div className="p-2">
					<div className="flex gap-1 items-center">
						{webpage.header?.favicon != null && (
							<img
								src={webpage.header.favicon}
								alt="favicon"
								className="w-4 h-4"
							/>
						)}
						{webpage.header?.host && (
							<p className="text-sm">{webpage.header.host}</p>
						)}
					</div>
					<h1 className="text-xl font-bold">{webpage.header?.title}</h1>
					{webpage.header?.description && <p>{webpage.header.description}</p>}
				</div>
			</div>
			<div className="flex gap-2 flex-1 h-auto overflow-hidden">
				<div className="w-[67%] overflow-y-scroll">
					<div>
						<p className="text-blue-500">要約:</p>
						<Markdown className="pb-8">{webpage.summary?.summaryText}</Markdown>
					</div>
					<div>
						<p className="text-blue-500">マインドマップ:</p>
						<Mermaid chart={webpage.mindMap?.mermaidText ?? ""} id="mindmap" />
					</div>
				</div>
				<div className="flex-1">
					<p className="text-blue-500">重要キーワード（英語）:</p>
					<ul className="text-sm list-inside list-disc overflow-y-scroll h-full gap-2 pb-8">
						{webpage.keywords.map(({ id, content, description }) => (
							<li key={id}>
								<span className="text-gray-200">{content}</span>
								<p className="ml-5 text-gray-500 ">{description}</p>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="flex items-center gap-2 shrink-0 pt-2">
				<Link to="/">
					<button
						className="text-gray-500 hover:text-gray-400 transition-all flex items-center gap-1"
						type="button"
					>
						<CornerDownLeftIcon strokeWidth={1} className="w-4 h-4" />
						戻る
					</button>
				</Link>
			</div>
		</div>
	);
}
