module.exports = {
 title: "Odoo AI Agent",
 description: "Portfolio project: an accounts-payable agent for Odoo with validated LLM extraction, an MCP server, a review queue, policy RAG and a 50-invoice eval report, shipped with Docker and a demo.",
 lessons: [
  ["plan", "Plan the project and repo"],
  ["extraction", "Invoice extraction with validation"],
  ["mcp-tools", "Odoo MCP tools: vendors, POs, draft bills"],
  ["agent", "The agent end to end"],
  ["rag-tool", "Policy Q&A with RAG"],
  ["evals", "Eval set: 50 invoices"],
  ["ship", "Ship: deploy, README, demo video"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["What does the agent do with a valid, matched invoice?", ["Posts and pays it", "Creates a draft bill for a human to approve", "Emails the vendor", "Nothing"], 1, "Humans approve."],
  ["Why a deterministic workflow instead of a fully autonomous agent?", ["Agents are illegal", "Predictable, testable, auditable decisions about money", "Cheaper GPUs", "No reason"], 1, "Control where it matters."],
  ["How should business value be framed?", ["Model name", "Hours saved, errors avoided, cost per invoice", "Lines of code", "Number of tools"], 1, "Client's numbers."],
  ["What validates extracted invoices?", ["The prompt", "A Pydantic schema with business rules (formats, totals)", "The PDF", "Odoo"], 1, "Code checks."],
  ["The model should compute missing totals?", ["Yes", "No: copy values; code checks and flags", "Sometimes", "Only taxes"], 1, "No silent fixes."],
  ["After validation fails, the retry prompt should include…", ["Nothing", "The exact validation errors", "A different model", "The answer"], 1, "Specific feedback."],
  ["Still invalid after retries?", ["Guess", "Review queue with reasons", "Delete", "Post anyway"], 1, "Humans decide."],
  ["Odoo's external API method for model calls?", ["execute_kw", "run_sql", "GET /model", "graphql"], 0, "Over JSON-RPC/XML-RPC."],
  ["Where is 'draft only' enforced?", ["In the prompt", "Inside the create_draft_bill tool", "In the README", "In the video"], 1, "Safety in code."],
  ["Vendor name search returns 3 matches. The tool…", ["Picks the first", "Returns an error with candidates", "Creates a vendor", "Retries"], 1, "Never guess."],
  ["The bot's Odoo user should have…", ["Admin rights", "Only read partners/POs and create draft bills", "Payment rights", "Delete rights"], 1, "Least privilege."],
  ["Invoice total differs from the PO by more than the tolerance. Result?", ["Draft anyway", "Review with the difference in the reason", "Change the PO", "Ignore"], 1, "Policy check."],
  ["What may the model do for exceptions?", ["Approve them", "Write an explanation grounded in the trace", "Edit Odoo", "Delete invoices"], 1, "Text only."],
  ["Why store a trace per invoice?", ["Storage is cheap", "Explain and audit every decision", "Required by MCP", "Speed"], 1, "Trust and debugging."],
  ["Policy retrieval finds nothing relevant. The tool…", ["Answers from general knowledge", "Says it's not covered and points to a person", "Picks any section", "Crashes"], 1, "Refuse safely."],
  ["How do you catch invented citations?", ["Trust", "Verify cited ids are in the retrieved set", "Longer prompts", "Ask twice"], 1, "Code check."],
  ["Eval set should include…", ["Only clean invoices", "Clean cases plus traps: wrong totals, no PO, mismatches, duplicates", "One invoice", "Real client data in Git"], 1, "Variety and traps."],
  ["Which eval metric must be zero?", ["Latency", "False accepts (wrong drafts)", "Reviews", "Tokens"], 1, "Costly error."],
  ["Straight-through rate measures…", ["Speed", "Clean invoices converted to correct drafts without edits", "API uptime", "Cost"], 1, "Automation value."],
  ["New model: higher straight-through but 1 false accept. Ship?", ["Yes", "No: fix the check, add a test, re-run evals", "Only on Fridays", "Ask the model"], 1, "Safety first."],
  ["A public demo should use…", ["A client's live Odoo", "A test Odoo database with fake data", "Production keys", "Nothing"], 1, "Safe demo."],
  ["Best opening for the README?", ["License", "What it does, results and demo link", "Folder tree", "Changelog"], 1, "Lead with value."]
 ]
};
