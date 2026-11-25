module.exports = {
 title: "Agents & MCP",
 description: "Agents vs workflows, tool design, failure modes, prompt injection, human approval, and building MCP servers, ending with a safe order-support agent.",
 lessons: [
  ["agent-loop", "What an agent is: the loop"],
  ["tool-design", "Designing good tools"],
  ["failure-modes", "When agents fail, and how to stop it"],
  ["injection", "Prompt injection and agent security"],
  ["human-in-loop", "Humans in the loop: approvals"],
  ["mcp-intro", "MCP: a standard way to connect tools"],
  ["mcp-server", "Build an MCP server in Python"],
  ["build-agent", "Project: order-support agent with approvals"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Agent vs workflow?", ["Same thing", "In an agent the model decides the next step; in a workflow you fixed the steps", "Workflows can't use LLMs", "Agents can't use tools"], 1, "Who decides the path."],
  ["You know the exact steps. Build…", ["An agent", "A workflow", "Nothing", "Both"], 1, "Simpler, cheaper, testable."],
  ["A router pattern means…", ["Retrying calls", "Classify first, then send to the right handler", "Running steps in parallel", "Fine-tuning"], 1, "Classification + handlers."],
  ["What must every agent loop have?", ["Many tools", "Step, time and cost limits", "High temperature", "A big model"], 1, "Bound every loop."],
  ["Best tool description?", ["One word", "What it does, when to use it, what it returns", "Empty", "A legal disclaimer"], 1, "Brief a colleague."],
  ["A tool gets bad input. It should…", ["Crash", "Return a clear error saying what to fix", "Return nothing", "Retry forever"], 1, "The model can recover."],
  ["Why trim tool results?", ["Style", "Big results flood the context and raise cost", "APIs require it", "No reason"], 1, "Return only what matters."],
  ["Same tool + same input called 5 times means…", ["Thoroughness", "A loop; stop or redirect", "Success", "Caching"], 1, "Use a loop guard."],
  ["Why store traces?", ["Fun", "To see exactly which step went wrong", "Training", "Billing"], 1, "Agents must be debuggable."],
  ["Indirect prompt injection comes from…", ["The developer", "Content the agent reads (emails, pages, files)", "The provider", "Hardware"], 1, "Any untrusted text."],
  ["The dangerous combination is…", ["Fast model + cheap tokens", "Private data + untrusted content + a way to send data out", "Long prompts", "Many users"], 1, "Remove any one leg."],
  ["Most effective defence against injection damage?", ["A longer system prompt", "Least privilege and approvals", "Higher temperature", "A bigger model"], 1, "What it can't do, it can't be tricked into."],
  ["Which action needs human approval?", ["Look up an order", "Issue a refund", "Search docs", "Draft a reply"], 1, "Irreversible money movement."],
  ["Where should the customer's identity come from?", ["Model arguments", "The authenticated session", "Message text", "A guess"], 1, "Never trust the model for identity."],
  ["What does MCP standardise?", ["Model training", "How AI apps connect to tool and data servers", "GPU drivers", "Prompt wording"], 1, "Build a server once, use it everywhere."],
  ["An MCP server can offer…", ["Only tools", "Tools, resources and prompts", "Only files", "Only models"], 1, "Three capabilities."],
  ["Transport for a local server started by the app?", ["stdio", "Streamable HTTP", "FTP", "Email"], 0, "HTTP is for remote servers."],
  ["In the Python SDK, a tool's description comes from…", ["The file name", "The function docstring", "A YAML file", "The model"], 1, "Docstring + type hints = schema."],
  ["Why not print() in a stdio MCP server?", ["Slow", "stdout carries protocol messages", "Forbidden", "No reason"], 1, "Log to stderr."],
  ["Why test agents with scripted models?", ["Deterministic tests of your own guards", "Models can't be tested", "MCP needs it", "Cheaper hosting"], 0, "Guards must hold whatever the model does."]
 ]
};
