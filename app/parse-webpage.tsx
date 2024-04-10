export const parseContent = async (url: string) => {
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
	return content.replaceAll(/\n/g, "").replaceAll(/(\s+|&nbsp;)/g, " ");
};

export const parseMeta = async (fetchUrl: string) => {
	const url = new URL(fetchUrl);
	const res = await fetch(url);

	let title: string | null;
	let description: string | null;
	const host = url.host;
	await new HTMLRewriter()
		.on("head title", {
			text: ({ text, lastInTextNode }) => {
				if (lastInTextNode) {
					return;
				}
				title = text;
			},
		})
		.on("meta", {
			element(el) {
				if (el.getAttribute("name") === "description") {
					description = el.getAttribute("content");
				}
			},
		})
		.transform(res)
		.text();
	const favicon = `${url.origin}/favicon.ico`;
	return {
		title,
		description,
		host,
		favicon,
	};
};
