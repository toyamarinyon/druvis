import { useReducer } from "react";
import { match } from "ts-pattern";

type State =
	| {
			step: "FILLING_URL";
	  }
	| { step: "ANALYZING"; url: string }
	| { step: "DONE"; url: string; result: string };
type Action =
	| { nextStep: "FILLING_URL" }
	| { nextStep: "ANALYZING"; url: string }
	| { nextStep: "DONE"; result: string; url: string };
const reducer = (_: State, action: Action): State =>
	match(action)
		.returnType<State>()
		.with({ nextStep: "ANALYZING" }, ({ url }) => ({
			step: "ANALYZING",
			url,
		}))
		.with({ nextStep: "DONE" }, ({ result, url }) => ({
			step: "DONE",
			result,
			url,
		}))
		.otherwise(() => ({
			step: "FILLING_URL",
		}));
export const useDruvis = () => {
	return useReducer(reducer, { step: "FILLING_URL" });
};
