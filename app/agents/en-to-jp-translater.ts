import Anthropic from "@anthropic-ai/sdk";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export const translateEnToJp = async (
	{ context }: ActionFunctionArgs,
	enText: string,
) => {
	if (context.cloudflare.env.USE_TRANSLATION !== "TRUE") {
		return enText;
	}
	const anthropic = new Anthropic({
		apiKey: context.cloudflare.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
	});

	const reponse = await anthropic.messages.create({
		model: "claude-3-opus-20240229",
		max_tokens: 1000,
		temperature: 0,
		system:
			"You are an expert translator with fluency in English and Japanese. Translate the given text from English to Japanese.",
		messages: [
			{
				role: "user",
				content: enText,
			},
		],
	});
	return reponse.content[0].text;
};
