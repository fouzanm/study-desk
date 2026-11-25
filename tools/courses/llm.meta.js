module.exports = {
 title: "LLM Fundamentals",
 description: "What AI engineers build, how LLMs work, prompting, structured JSON output, tool calling and context management, ending with a validated invoice extractor.",
 lessons: [
  ["ai-engineer-role", "What AI engineers actually build"],
  ["how-llms-work", "How LLMs work: tokens, context, temperature"],
  ["prompting", "Prompting: clear instructions that work"],
  ["structured-outputs", "Structured outputs: reliable JSON"],
  ["tool-calling", "Tool calling"],
  ["context", "Managing context, memory and cost"],
  ["build-extractor", "Project: invoice extractor with review"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Most AI engineering jobs mainly involve…", ["Training foundation models", "Building products on models via APIs", "Designing chips", "Labelling data"], 1, "Applied work on top of existing models."],
  ["Roughly how many characters is a token in English?", ["1", "About 4", "About 20", "Exactly one word"], 1, "A rough rule: ~4 characters."],
  ["Does a model remember your previous API call?", ["Yes", "No, every call only sees what you send", "For one hour", "Only with tools"], 1, "Models are stateless; resend what's needed."],
  ["Best temperature for extraction or classification?", ["0–0.2", "1", "2", "It doesn't matter"], 0, "Low = consistent."],
  ["What is hallucination?", ["A crash", "Confident but wrong output", "A slow reply", "A token limit"], 1, "Defend with given facts, citations, validation and evals."],
  ["Where do lasting rules go?", ["The system prompt", "Every user message", "The model name", "Nowhere"], 0, "System prompt = role and rules."],
  ["Why put documents in tags like <doc>…</doc>?", ["Required", "To separate data from instructions", "To save tokens", "For speed"], 1, "Clear boundaries, less confusion and injection."],
  ["Few-shot prompting means…", ["Short prompts", "Including a few input → output examples", "Calling the model few times", "Low temperature"], 1, "Examples teach format and judgement."],
  ["Model JSON fails your Pydantic schema. First step?", ["Give up", "Retry with the error message", "Raise temperature", "Change provider"], 1, "Models fix their output well when told what's wrong."],
  ["Valid JSON can still be wrong because…", ["JSON is unreliable", "Values can be wrong even when the format is right", "Pydantic misses things", "It can't"], 1, "Cross-check values (e.g. total = sum of lines)."],
  ["Why allow null for optional fields?", ["Smaller output", "So the model doesn't invent values", "JSON needs it", "Speed"], 1, "Give it an honest 'not found'."],
  ["In tool calling, who runs the tool?", ["The model", "Your code", "The provider", "The user"], 1, "The model only asks; you execute."],
  ["The model sends bad tool arguments. You should…", ["Crash", "Return the error as the tool result", "Ignore it", "Restart"], 1, "It can then correct itself."],
  ["Why cap an agent loop's steps?", ["Style", "So it can't loop forever and burn money", "API rule", "Speed"], 1, "Always bound loops."],
  ["A refund tool needs…", ["Nothing special", "Limits, ownership checks, approval above a threshold, logging", "A long description only", "High temperature"], 1, "Actions need safeguards."],
  ["Where should a long document go relative to the question?", ["After", "Before", "In the system name", "Separate call"], 1, "Docs first, question last."],
  ["What breaks prompt caching?", ["Long prompts", "Changing the start of the prompt every call", "Tools", "Low temperature"], 1, "Keep the stable prefix identical."],
  ["Long chats get slow and expensive because…", ["The model tires", "The whole growing history is resent each call", "Tokens get bigger", "Caching"], 1, "Trim and summarise older turns."],
  ["How do you prove an extractor is good?", ["It worked once", "Field accuracy on a labelled set of real documents", "Famous model", "Fast replies"], 1, "Evals on real data."],
  ["Extractions that still fail after retries should…", ["Be saved anyway", "Go to a human review queue", "Be deleted", "Retry forever"], 1, "Humans handle hard cases."]
 ]
};
