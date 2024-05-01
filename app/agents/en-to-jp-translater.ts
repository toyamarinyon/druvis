import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { OpenAI } from "openai";

export const translateEnToJp = async (
	{ context }: ActionFunctionArgs,
	enText: string,
) => {
	if (context.cloudflare.env.USE_TRANSLATION !== "TRUE") {
		return enText;
	}
	const openai = new OpenAI({
		apiKey: context.cloudflare.env.OPENAI_API_KEY,
	});

	const reponse = await openai.chat.completions.create({
		model: "gpt-3.5-turbo-0125",
		temperature: 0,
		messages: [
			{
				role: "system",
				content:
					"You are an expert translator with fluency in English and Japanese. Translate the given text from English to Japanese.",
			},
			{
				role: "user",
				content: enText,
			},
		],
	});
	return reponse.choices[0].message.content;
};
