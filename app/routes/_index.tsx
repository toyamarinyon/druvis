import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import Groq from "groq-sdk";
import { useEffect, useRef } from "react";
import { match } from "ts-pattern";
import { useDruvis } from "~/hooks/useDruvis";

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const url = formData.get("url");
	if (url == null || url === "" || typeof url !== "string") {
		return json({ error: "URLが入力されていません" });
	}
	const res = await fetch(`${url}`);
	let content = "";
	await new HTMLRewriter()
		.on("article", {
			text(text) {
				// <-- Everything callback-based
				content = `${content}${text.text}`;
			},
		})
		.transform(res)
		.text();
	const contentText = content
		.replaceAll(/\n/g, "")
		.replaceAll(/(\s+|&nbsp;)/g, " ");
	const groq = new Groq({ apiKey: context.cloudflare.env.GROQ_API_KEY });
	const chatCompletion = await groq.chat.completions.create({
		messages: [
			{ role: "system", content: "**YOU MUST WRITE ONLY JAPANESE**" },
			{
				role: "user",
				content: `以下の文章を要点を簡潔に400文字以内でまとめてください: ${contentText} REMIND: YOU MUST WRITE ONLY JAPANESE`,
			},
		],
		model: "gemma-7b-it",
	});
	return json({
		summary: chatCompletion.choices[0].message.content,
	});
};

export default function Index() {
	const ref = useRef<HTMLTextAreaElement>(null);
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const [state, dispatch] = useDruvis();
	useEffect(() => {
		if (ref.current == null) {
			return;
		}
		ref.current.focus();
		const submitIfPressEnter = (e: KeyboardEvent) => {
			if (e.code === "Enter" && e.shiftKey === false) {
				e.preventDefault();
				if (ref.current == null) {
					return;
				}
				ref.current.form?.submit();
			}
		};
		ref.current.addEventListener("keydown", submitIfPressEnter);
		return () => {
			ref.current?.removeEventListener("keydown", submitIfPressEnter);
		};
	}, []);
	return match(state)
		.with({ step: "FILLING_URL" }, () => (
			<Form
				method="POST"
				className="h-screen bg-black flex items-center justify-center"
			>
				<div className="border-l pl-4 py-2 border-gray-500">
					<p className="text-blue-500">要約したい記事のURLを入力してください</p>
					<div className="flex gap-2 text-gray-300 items-start">
						<span>&gt;</span>
						<textarea
							name="url"
							className="bg-transparent outline-none w-full resize-none"
							ref={ref}
							rows={4}
						/>
					</div>
					<p className="text-gray-500">
						URL入力後にEnterキーを押すと送信されます
					</p>
				</div>
			</Form>
		))
		.with({ step: "ANALYZING" }, () => (
			<div className="h-screen bg-black flex items-center justify-center">
				<p className="text-blue-500">要約中...</p>
			</div>
		))
		.otherwise(() => (
			<div> "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"</div>
		));
}
