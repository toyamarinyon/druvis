import mermaid from "mermaid";
import { useEffect } from "react";

mermaid.initialize({});

export const Mermaid = ({ chart, id }: { chart: string; id: string }) => {
	useEffect(() => {
		document.getElementById(id)?.removeAttribute("data-processed");
		mermaid.contentLoaded();
	}, [id]);

	return (
		<div className="mermaid" id={id}>
			{chart}
		</div>
	);
};
