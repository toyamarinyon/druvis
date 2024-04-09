import {
	type ActionFunctionArgs,
	json,
	redirect,
	redirectDocument,
} from "@remix-run/cloudflare";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import Groq from "groq-sdk";
import { useEffect, useRef } from "react";
import { match } from "ts-pattern";
import { Spinner } from "~/components/spinner";

import { extractKeywords } from "~/agents";
import { translateEnToJp } from "~/agents/en-to-jp-translater";
import { drizzle } from "~/db/drizzle";
import { webpageKeywords, webpageSummaries, webpages } from "~/db/schema";

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
	const res = await fetch(`${url}`);

	let content = "";
	await new HTMLRewriter()
		.on("p, h1, h2, h3, h4, h5, h6", {
			text(text) {
				content = `${content} ${text.text}`;
			},
		})
		.transform(res)
		.text();
	const contentText = content
		.replaceAll(/\n/g, "")
		.replaceAll(/(\s+|&nbsp;)/g, " ");
	const groq = new Groq({ apiKey: args.context.cloudflare.env.GROQ_API_KEY });
	const summaryEn = await groq.chat.completions.create({
		messages: [
			{ role: "system", content: "You are a helpful assistant." },
			{
				role: "user",
				content: `Write a concirse 150 words text that describe the following text: ${contentText} \n This content is`,
				// content: `Generate a concise 100 words summary as Markdown format relevant the following text: ${contentText}`,
			},
		],
		model: "mixtral-8x7b-32768",
	});
	const summaryJp = await translateEnToJp(
		args,
		summaryEn.choices[0].message.content ?? "",
	);

	const keywords = await extractKeywords(args, contentText);
	/** @todo transaction */
	const webpageCreatedResults = await db
		.insert(webpages)
		.values({
			url: url,
			content: contentText,
		})
		.returning({ createdId: webpages.id });
	const webpageCreatedId = webpageCreatedResults[0].createdId;
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
