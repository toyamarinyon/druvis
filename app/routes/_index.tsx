import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useFetcher } from "@remix-run/react";
import Groq from "groq-sdk";
import { CornerDownLeftIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { P, match } from "ts-pattern";
import { Spinner } from "~/components/spinner";

import Anthropic from "@anthropic-ai/sdk";
import { extractKeywords } from "~/agents";

export const action = async (args: ActionFunctionArgs) => {
  const formData = await args.request.formData();
  const url = formData.get("url");
  if (url == null || url === "" || typeof url !== "string") {
    return json({ error: "URLが入力されていません" });
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
  const anthropic = new Anthropic({
    apiKey: args.context.cloudflare.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
  });
  // const reponse = await anthropic.messages.create({
  //   model: "claude-3-opus-20240229",
  //   max_tokens: 1000,
  //   temperature: 0,
  //   system: "**YOU MUST WRITE ONLY JAPANESE**",
  //   messages: [
  //     {
  //       role: "user",
  //       content: `以下の文章を要点を簡潔に400文字以内でまとめてください: ${contentText} REMIND: YOU MUST WRITE ONLY JAPANESE`,
  //     },
  //   ],
  // });
  const summary = await groq.chat.completions.create({
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
  console.log(summary.choices[0].message.content ?? "");
  // const chatCompletion = await groq.chat.completions.create({
  //   messages: [
  //     {
  //       role: "system",
  //       content:
  //         "You are an expert translator with fluency in English and Japanese. Translate the given text from English to Japanese.",
  //     },
  //     {
  //       role: "user",
  //       content: summary.choices[0].message.content ?? "",
  //     },
  //   ],
  //   model: "mixtral-8x7b-32768",
  // });
  const reponse = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1000,
    temperature: 0,
    system:
      "You are an expert translator with fluency in English and Japanese. Translate the given text from English to Japanese.",
    messages: [
      {
        role: "user",
        content: summary.choices[0].message.content ?? "",
      },
    ],
  });

  const keywords = await extractKeywords(args, contentText);
  return json({
    error: null,
    content,
    // summary: chatCompletion.choices[0].message.content ?? "",
    keywords,
    summary: reponse.content[0].text,
  });
};

export default function Index() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<typeof action>();
  useEffect(() => {
    if (ref.current == null) {
      return;
    }
    ref.current.focus();
  }, [fetcher]);

  if (fetcher.data == null) {
    return (
      <fetcher.Form method="POST" ref={formRef}>
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
                  fetcher.submit(formRef.current);
                }
              }}
            />
          </div>
          {match(fetcher.state)
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
      </fetcher.Form>
    );
  }
  return (
    <div className="text-gray-300 border-l pl-4 py-2 border-gray-500 w-[800px] max-h-[77%] flex flex-col">
      {fetcher.data.error == null && (
        <div className="flex gap-2 flex-1 h-auto overflow-hidden">
          <div className="w-[67%]">
            <p className="text-blue-500">要約結果:</p>
            <Markdown className="overflow-y-scroll h-full pb-8">
              {fetcher.data.summary}
            </Markdown>
          </div>
          <div className="flex-1">
            <p className="text-blue-500">重要キーワード（英語）:</p>
            <ul className="text-sm list-inside list-disc overflow-y-scroll h-full gap-2 pb-8">
              {fetcher.data.keywords.map(({ title, description }) => (
                <li key={title}>
                  <span className="text-gray-200">{title}</span>
                  <p className="ml-5 text-gray-500 ">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 shrink-0">
        {/* <button className="text-gray-500 hover:text-gray-400 transition-all flex items-center gap-1" onClick={() => {
              copyText.select();
               document.execCommand("copy");
            }}>
              <CopyIcon strokeWidth={1} className="w-4 h-4" />
              要約をコピー
            </button> */}
        <Link to="/" reloadDocument>
          <button className="text-gray-500 hover:text-gray-400 transition-all flex items-center gap-1">
            <CornerDownLeftIcon strokeWidth={1} className="w-4 h-4" />
            戻る
          </button>
        </Link>
      </div>
    </div>
  );
}
