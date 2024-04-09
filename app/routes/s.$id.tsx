import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { CornerDownLeftIcon } from "lucide-react";
import Markdown from "react-markdown";
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
			keywords: true,
		},
	});
	if (webpage == null) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	return json({ webpage });
};

export default function SummaryPage() {
	const { webpage } = useLoaderData<typeof loader>();
	return (
		<div className="text-gray-300 border-l pl-4 py-2 border-gray-500 w-[800px] max-h-[77%] flex flex-col">
			<div className="flex gap-2 flex-1 h-auto overflow-hidden">
				<div className="w-[67%]">
					<p className="text-blue-500">要約結果:</p>
					<Markdown className="overflow-y-scroll h-full pb-8">
						{webpage.summary?.summaryText}
					</Markdown>
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
			<div className="flex items-center gap-2 shrink-0">
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
