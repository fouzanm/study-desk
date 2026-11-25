module.exports = {
 title: "Evals & AI Safety",
 description: "Test AI like an engineer: eval sets, metrics, LLM judges, cost and latency, guardrails, when to fine-tune, and red-teaming your own system.",
 lessons: [
  ["why-evals", "Why evals: testing AI like an engineer"],
  ["metrics", "Metrics: how to score AI outputs"],
  ["llm-judge", "LLM-as-judge"],
  ["cost-latency", "Cost and latency"],
  ["guardrails", "Guardrails: checking inputs and outputs"],
  ["fine-tuning", "Fine-tuning: when it's worth it"],
  ["red-team", "Red-teaming your own AI"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["What is an eval?", ["One unit test", "A scored set of real inputs for an AI feature", "A model", "A dashboard"], 1, "Many examples, one score, run after every change."],
  ["Best source of eval cases?", ["Made-up perfect examples", "Real user inputs and logs", "The model", "Random text"], 1, "Real and messy."],
  ["A user reports a bad answer. First step?", ["Change models", "Add it as an eval case", "Ignore", "Raise temperature"], 1, "Bugs become tests."],
  ["Why change one thing at a time?", ["Style", "So you know what caused the score change", "APIs require it", "Cheaper"], 1, "Controlled experiments."],
  ["Recall measures…", ["Of flagged items, how many were right", "Of real positives, how many were caught", "Speed", "Cost"], 1, "Caught / all real ones."],
  ["High accuracy but the rare class is always missed. Why?", ["Impossible", "Unbalanced data hides it; check per-class precision/recall", "Perfect model", "Rounding"], 1, "Accuracy can mislead."],
  ["Best way to score free-text answers?", ["1–10 feeling", "Yes/no rubric checks", "Length", "Word count"], 1, "Specific checks are consistent."],
  ["Before trusting an LLM judge…", ["Nothing", "Measure agreement with human labels", "Make it longer", "Use temperature 1"], 1, "Validate the judge."],
  ["Why swap order in pairwise judging?", ["Speed", "Judges favour the first answer", "Cost", "Required"], 1, "Count only consistent wins."],
  ["Which usually costs more per token?", ["Input", "Output", "Equal", "Neither"], 1, "Output is pricier."],
  ["Why watch p95 latency?", ["It's the average", "It shows how slow the slow requests are", "Law", "It's lower"], 1, "Users feel outliers."],
  ["Cheapest safe way to cut cost?", ["Biggest model always", "Small models for easy steps, verified with evals", "Remove validation", "Longer prompts"], 1, "Route by difficulty, re-check quality."],
  ["Why mask PII before a model call?", ["Speed", "Don't send personal data the task doesn't need", "Style", "Required by Python"], 1, "Data minimisation."],
  ["A guardrail blocks an answer. Best behaviour?", ["Show it anyway", "Safe fallback + log the reason", "Crash", "Retry forever"], 1, "Fail safe, learn from logs."],
  ["Fine-tuning is best for…", ["Changing facts", "Consistent style/format or a narrow high-volume task", "Citations", "Live data"], 1, "Knowledge goes in RAG."],
  ["Try before fine-tuning:", ["Nothing", "Better prompts, then RAG/tools", "New GPU", "Higher temperature"], 1, "Cheaper fixes first."],
  ["Why a held-out test set?", ["Save time", "Measure fairly on unseen data", "APIs need it", "No reason"], 1, "Never test on training data."],
  ["Red-teaming means…", ["Load testing", "Deliberately attacking your own AI to find failures", "Code review", "Choosing colours"], 1, "Find it before attackers do."],
  ["Strongest fix for an agent tricked into refunds?", ["Prompt wording", "Approvals and limits on the refund tool", "Bigger model", "Hide logs"], 1, "Fix permissions first."],
  ["After a safety fix you should…", ["Ship immediately", "Re-run attack set and normal evals", "Delete the attack case", "Nothing"], 1, "Don't break helpfulness."]
 ]
};
