import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import Groq from "groq-sdk";

export const generateMindMap = async (
	{ context }: ActionFunctionArgs,
	text: string,
) => {
	const groq = new Groq({ apiKey: context.cloudflare.env.GROQ_API_KEY });

	const mindMapText = await groq.chat.completions.create({
		messages: [
			{
				role: "user",
				content: `Generate a mind map that provides insights into the given text. The mind map should:

1. Identify the main topics, themes, and key ideas present in the text.
2. Organize these topics and ideas in a hierarchical, branching structure that shows their relationships and connections.
3. Highlight any important concepts, entities, or events mentioned in the text.
4. Visually represent the overall structure and flow of the text.
5. Provide a clear, concise, and visually appealing representation of the text's content and meaning.

The output format for the mind map should be a mermaid's MindMap Syntax like following:
\`\`\`mermaid
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
\`\`\`

## EXAMPLE ###

The Art of Product Management in the Fog of AI
Product managers & designers working with AI face a unique challenge: designing a delightful product experience that cannot fully be predicted.

Traditionally, product development followed a linear path.

A PM defines the problem, a designer draws the solution, and the software teams code the product. The outcome was largely predictable, and the user experience was consistent.

However, with AI, the rules have changed. Non-deterministic ML models introduce uncertainty & chaotic behavior.

The same question asked four times produces different outputs. Asking the same question in different ways - even just an extra space in the question - elicits different results.

How does one design a product experience in the fog of AI?

The answer lies in embracing the unpredictable nature of AI and adapting your design approach. Here are a few strategies to consider:

Fast feedback loops : Great machine learning products elicit user feedback passively. Just click on the first result of a Google search and come back to the second one. That’s a great signal for Google to know that the first result is not optimal - without tying a word.
Evaluation : before products launch, it’s critical to run the machine learning systems through a battery of tests to understand in the most likely use cases, how the LLM will respond.
Over-measurement : It’s unclear what will matter in product experiences today, so measuring as much as possible in the user experience, whether it’s session times, conversation topic analysis, sentiment scores, or other numbers.
Couple with deterministic systems : Some startups are using large language models to suggest ideas that are evaluated with deterministic or classic machine learning systems. This design pattern can quash some of the chaotic and non-deterministic nature of LLMs.
Smaller models : smaller models that are tuned or optimized for use cases will produce narrower output, controlling the experience.
The goal is not to eliminate unpredictability altogether but to design a product that can adapt and learn alongside its users.

Just as much as the technology has changed products, our design processes must evolve as well.

output:
mindmap
  root((The Art of Product Management in the Fog of AI))
    Unique Challenge
      Designing a delightful product experience that cannot fully be predicted
    Traditional Product Development
      Linear Path
        PM defines problem
        Designer draws solution
        Software teams code product
        Outcome was "largely predictable"
        User experience was consistent
    Impact of AI
      Rules have changed
        Non-deterministic ML models introduce uncertainty & chaotic behavior
        Same question asked four times produces different outputs
        Asking the same question in different ways elicits different results
    Design Strategies for AI-Powered Products
      Embrace the Unpredictable
        Fast Feedback Loops
          Elicit user feedback passively
          Example: Google search results
        Evaluation
          Run ML systems through a battery of tests
          Understand likely use cases and responses
        Over-Measurement
          Measure as much as possible in the user experience
          Examples: session times, conversation topic analysis, sentiment scores
        Couple with Deterministic Systems
          Use LLMs to suggest ideas
          Evaluate with deterministic or classic ML systems
        Smaller Models
          Tuned or optimized for specific use cases
          Produce narrower output, controlling the experience
    Design Processes Must Evolve
      Adapt and learn alongside users
      Just as much as the technology has changed products

### EXAMPLE END ###
${text}

output:

`,
			},
		],
		model: "mixtral-8x7b-32768",
	});
	return mindMapText.choices[0].message.content.replaceAll("`", "");
};
