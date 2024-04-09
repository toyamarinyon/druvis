import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import Groq from "groq-sdk";

export const summrizeWebpage = async (
	args: ActionFunctionArgs,
	contentText: string,
) => {
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
	return summaryEn.choices[0].message.content;
};
