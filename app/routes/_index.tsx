import {
	type ActionFunctionArgs,
	json,
	redirect,
	redirectDocument,
} from "@remix-run/cloudflare";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { match } from "ts-pattern";
import { Spinner } from "~/components/spinner";

import {
	extractKeywords,
	generateMindMap,
	summrizeWebpage,
	translateEnToJp,
} from "~/agents";
import { drizzle } from "~/db/drizzle";
import {
	webpageHeaders,
	webpageKeywords,
	webpageMindMaps,
	webpageSummaries,
	webpages,
} from "~/db/schema";
import { parseContent, parseMeta } from "~/parse-webpage";

export const action = async (args: ActionFunctionArgs) => {
	const formData = await args.request.formData();
	const url = formData.get("url");
	if (url == null || url === "" || typeof url !== "string") {
		return json({ error: "URLが入力されていません" });
	}
	const db = drizzle(args);
	const registeredWebpage = await db.query.webpages.findFirst({
		where: (webpages, { eq }) => eq(webpages.url, url),
	});
	if (registeredWebpage != null) {
		return redirectDocument(`/s/${registeredWebpage.id}`);
	}

	const content = await parseContent(url);
	const { title, description, favicon, host } = await parseMeta(url);
	const summaryEn = await summrizeWebpage(args, content);
	const summaryJp = await translateEnToJp(args, summaryEn);
	const keywords = await extractKeywords(args, content);
	const mindMap = await generateMindMap(args, content);
	/** @todo transaction */
	const webpageCreatedResults = await db
		.insert(webpages)
		.values({
			url,
			content,
		})
		.returning({ createdId: webpages.id });
	const webpageCreatedId = webpageCreatedResults[0].createdId;
	await db.insert(webpageHeaders).values({
		webpageId: webpageCreatedId,
		title,
		description,
		favicon,
		host,
	});
	await db.insert(webpageSummaries).values({
		webpageId: webpageCreatedId,
		summaryText: summaryJp,
	});
	await db.insert(webpageKeywords).values(
		keywords.map(({ title, description }) => ({
			webpageId: webpageCreatedId,
			content: title,
			description,
		})),
	);
	await db.insert(webpageMindMaps).values({
		webpageId: webpageCreatedId,
		mermaidText: mindMap,
	});
	return redirect(`/s/${webpageCreatedId}`);
};

export default function Index() {
	const ref = useRef<HTMLTextAreaElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const submit = useSubmit();
	const navigation = useNavigation();
	useEffect(() => {
		if (ref.current == null) {
			return;
		}
		ref.current.focus();
	}, []);

	return (
		<Form method="POST" ref={formRef}>
			<div className="border-l pl-4 py-2 border-gray-500 w-[400px]">
				<p className="text-blue-500">要約したい記事のURLを入力してください</p>
				<div className="flex gap-2 text-gray-300 items-start">
					<span>&gt;</span>
					<textarea
						name="url"
						className="bg-transparent outline-none w-full resize-none"
						ref={ref}
						rows={4}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								submit(formRef.current);
							}
						}}
					/>
				</div>
				{match(navigation.state)
					.with("idle", () => (
						<p className="text-gray-500">
							URL入力後にEnterキーを押すと送信されます
						</p>
					))
					.with("submitting", () => (
						<div className="flex items-center gap-1 text-gray-500">
							<Spinner />
							<p>要約中...（60秒ほどお待ちください）</p>
						</div>
					))
					.otherwise(() => null)}
			</div>
		</Form>
	);
}
