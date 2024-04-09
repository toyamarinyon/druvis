import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { CornerDownLeftIcon } from "lucide-react";
import Markdown from "react-markdown";
import { drizzle } from "~/db/drizzle";

export const loader = async (args: LoaderFunctionArgs) => {
	const id = args.params.id;

	if (id == null) {
		return json({ error: "id is required" }, { status: 400 });
	}
	const db = drizzle(args);
	await db.query.webpages.findFirst({
		where: (webpages, { eq }) => eq(webpages.id, id),
		with: {
			summary: true,
			keywords: true,
		},
	});
	return json({
		summary: "This is a summary",
		keywords: [
			{
				title: "Keyword 1",
				description: "Description 1",
			},
			{
				title: "Keyword 2",
				description: "Description 2",
			},
		],
	});
};

export default function SummaryPage() {
	const data = useLoaderData<typeof loader>();
	return (
		<div className="text-gray-300 border-l pl-4 py-2 border-gray-500 w-[800px] max-h-[77%] flex flex-col">
			<div className="flex gap-2 flex-1 h-auto overflow-hidden">
				<div className="w-[67%]">
					<p className="text-blue-500">要約結果:</p>
					<Markdown className="overflow-y-scroll h-full pb-8">
						{data.summary}
					</Markdown>
				</div>
				<div className="flex-1">
					<p className="text-blue-500">重要キーワード（英語）:</p>
					<ul className="text-sm list-inside list-disc overflow-y-scroll h-full gap-2 pb-8">
						{data.keywords.map(({ title, description }) => (
							<li key={title}>
								<span className="text-gray-200">{title}</span>
								<p className="ml-5 text-gray-500 ">{description}</p>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				{/* <button className="text-gray-500 hover:text-gray-400 transition-all flex items-center gap-1" onClick={() => {
            copyText.select();
             document.execCommand("copy");
          }}>
            <CopyIcon strokeWidth={1} className="w-4 h-4" />
            要約をコピー
          </button> */}
				<Link to="/">
					<button className="text-gray-500 hover:text-gray-400 transition-all flex items-center gap-1">
						<CornerDownLeftIcon strokeWidth={1} className="w-4 h-4" />
						戻る
					</button>
				</Link>
			</div>
		</div>
	);
}
