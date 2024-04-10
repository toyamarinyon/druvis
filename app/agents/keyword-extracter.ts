import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import Groq from "groq-sdk";

type ExtractKeyword = {
	title: string;
	description: string;
};
export const extractKeywords = async (
	{ context }: ActionFunctionArgs,
	text: string,
) => {
	const groq = new Groq({ apiKey: context.cloudflare.env.GROQ_API_KEY });

	const keywordsText = await groq.chat.completions.create({
		messages: [
			{
				role: "user",
				content: `Please provide up to five important keywords that appear repeatedly in the following context. Please emphasize keywords that have the potential to bring about novel elements or non-linear pchanges.

""CONTEXT"":
${text}`,
			},
		],
		model: "mixtral-8x7b-32768",
	});
	const keywords = await groq.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `
You are text to JSON converter.

Transform user input to the following schema:

{
  "keywords": [
    { "title": "title", "description": "description"}
  ]
}
`,
			},
			{
				role: "user",
				content: keywordsText.choices[0].message.content,
			},
		],
		model: "mixtral-8x7b-32768",
	});
	return JSON.parse(keywords.choices[0].message.content)
		.keywords as ExtractKeyword[];
};
