import { type ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Link, useFetcher } from "@remix-run/react";
import Groq from "groq-sdk";
import { CornerDownLeftIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { match } from "ts-pattern";
import { Spinner } from "~/components/spinner";

import Anthropic from "@anthropic-ai/sdk";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const url = formData.get("url");
  if (url == null || url === "" || typeof url !== "string") {
    return json({ error: "URLが入力されていません" });
  }
  const res = await fetch(`${url}`);
  let content = "";
  await new HTMLRewriter()
    .on("p, h1, h2, h3, h4, h5, h6", {
      text(text) {
        content = `${content}${text.text}`;
      },
    })
    .transform(res)
    .text();
  const contentText = content
    .replaceAll(/\n/g, "")
    .replaceAll(/(\s+|&nbsp;)/g, " ");
  const groq = new Groq({ apiKey: context.cloudflare.env.GROQ_API_KEY });
  const anthropic = new Anthropic({
    apiKey: context.cloudflare.env.ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
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
      { role: "system", content: "You are a helpful assistant" },
      {
        role: "user",
        content: `Generate a concise 50 words summary as Markdown format relevant the following text: ${contentText}`,
      },
    ],
    model: "mixtral-8x7b-32768",
  });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert translator with fluency in English and Japanese. Translate the given text from English to Japanese.",
      },
      {
        role: "user",
        content: summary.choices[0].message.content ?? "",
      },
    ],
    model: "mixtral-8x7b-32768",
  });

  return json({
    error: null,
    summary: chatCompletion.choices[0].message.content ?? "",
    // summary: reponse.content[0].text,
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
    const submitIfPressEnter = (e: KeyboardEvent) => {
      if (e.code === "Enter" && e.shiftKey === false) {
        e.preventDefault();
        if (ref.current == null || formRef.current == null) {
          return;
        }
        fetcher.submit(formRef.current);
      }
    };
    ref.current.addEventListener("keydown", submitIfPressEnter);
    return () => {
      ref.current?.removeEventListener("keydown", submitIfPressEnter);
    };
  }, [fetcher]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      {fetcher.data == null ? (
        <fetcher.Form method="POST" ref={formRef}>
          <div className="border-l pl-4 py-2 border-gray-500 w-[400px]">
            <p className="text-blue-500">
              要約したい記事のURLを入力してください
            </p>
            <div className="flex gap-2 text-gray-300 items-start">
              <span>&gt;</span>
              <textarea
                name="url"
                className="bg-transparent outline-none w-full resize-none"
                ref={ref}
                rows={4}
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
                  <p>要約中...</p>
                </div>
              ))
              .otherwise(() => null)}
          </div>
        </fetcher.Form>
      ) : (
        <div className="text-gray-300 border-l pl-4 py-2 border-gray-500 w-[400px]">
          <p className="text-blue-500">要約結果:</p>
          {fetcher.data["error"] != null}
          <Markdown className="mb-4 max-h-[300px] overflow-scroll">
            {fetcher.data.error != null
              ? fetcher.data.error
              : fetcher.data.summary}
          </Markdown>
          <div className="flex items-center gap-2">
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
      )}
    </div>
  );
}
