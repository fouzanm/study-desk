// LLM Fundamentals. Real model calls can't run in the build, so SDK examples are shown with labelled example output.
// The logic around the model (validation, tool loops, budgets) runs against FAKE_LLM, a small stand-in.
const FAKE_LLM = String.raw`
import json as _json
class FakeLLM:
    """A stand-in model so the example runs offline. It returns canned replies."""
    def __init__(self, replies):
        self.replies, self.calls = list(replies), []
    def complete(self, messages, **kw):
        self.calls.append(messages)
        return self.replies.pop(0)
`;

module.exports = [
{
 id: "ai-engineer-role",
 title: "What AI engineers actually build",
 level: "Beginner",
 one: "Most AI engineering isn't training models. It's <b>building products on top of existing models</b> (Claude, GPT, Gemini, open models) via their APIs: prompts, structured outputs, tools, retrieval, evaluation and safe deployment.",
 why: "Knowing what the job really is helps you study the right things. AI engineer and forward-deployed job posts ask for API integration, RAG, agents, evals and shipping, much more than maths.",
 steps: [
  { h: "The three layers",
    p: ["<b>Model builders</b> (research labs) train foundation models. Needs deep ML research. <b>ML engineers</b> train or fine-tune models on company data. <b>AI engineers / applied AI</b> use models through APIs to build features and products. That's most new jobs, and this course.",
        "Forward-deployed engineers do AI engineering <i>inside a customer's business</i>: understand their workflow, connect their systems, ship something that works for them."] },
  { h: "What you'll build",
    p: ["<b>Extraction</b>: invoices, emails or PDFs → clean JSON. <b>Classification and routing</b>: tag support tickets, detect intent. <b>Q&amp;A over documents (RAG)</b>: answer from a company's own docs with citations. <b>Agents</b>: the model uses tools (search, database, APIs) to finish multi-step tasks. <b>Copilots</b> inside existing apps (CRM, ERP, helpdesk)."] },
  { h: "The skills in demand",
    p: ["<b>Core</b>: Python, APIs, SQL, JSON, Git. <b>LLM-specific</b>: prompting, structured output, tool calling, context management, RAG, agents and MCP, evaluation, guardrails, cost and latency. <b>Shipping</b>: FastAPI, Docker, cloud, logging and tracing, CI. <b>People</b>: understanding a business problem, explaining trade-offs, demos.",
        "This path teaches them in that order. You've done Python, SQL and APIs; now the LLM layer."] },
  { h: "How a typical feature works",
    p: ["Every LLM feature is the same loop: <b>gather context</b> (user input, documents, data) → <b>build a prompt</b> → <b>call the model</b> → <b>validate the output</b> → <b>act</b> (save, reply, call a tool) → <b>log and evaluate</b>. The model is one step; the engineering is everything around it."],
    code: `user input ─► gather context ─► prompt ─► MODEL ─► validate ─► act ─► log + evaluate
                (docs, DB, APIs)                    (schema)   (save, reply,   (traces, evals,
                                                                call tools)      cost)`, lang: "text" }
 ],
 mistakes: [
  "Thinking you need to train models to work in AI. Most roles integrate existing models.",
  "Treating the model as the whole product. Reliability comes from validation, evals and good data.",
  "Skipping the fundamentals (Python, APIs, SQL). Every AI job post still asks for them."
 ],
 practice: [
  { q: "A logistics company gets 500 emailed delivery requests a day and types them into their system by hand. Describe an LLM feature for them in the six-step loop.", a: "Gather: read each email (and attachments). Prompt: “extract pickup, drop-off, date, weight, contact as JSON”. Model: call it. Validate: check the JSON against a schema (dates real, weight positive, address present). Act: create the booking via their system's API, or send to a human if validation fails. Log/evaluate: store input, output and corrections; measure accuracy weekly." },
  { q: "Name three things an AI engineer does that aren't “writing prompts”.", a: "For example: validating and parsing model output, building retrieval over company documents, writing evals, connecting tools/APIs for agents, tracking cost and latency, deploying and monitoring the service." }
 ],
 check: [
  ["What do most AI engineering jobs involve?", ["Training new foundation models", "Building products on models via APIs", "Designing GPUs", "Writing research papers"], 1, "Applied work on top of existing models."],
  ["What's unique about forward-deployed engineers?", ["They only do research", "They build and ship solutions inside a customer's business", "They only write docs", "They sell licences"], 1, "Deep customer context plus engineering."],
  ["In the LLM feature loop, what comes right after calling the model?", ["Show the raw answer", "Validate the output", "Delete the input", "Retrain"], 1, "Never trust raw output; check it."]
 ],
 remember: [
  "AI engineer = builds products on models via APIs (not training them).",
  "Common builds: extraction, classification, RAG Q&A, agents, copilots.",
  "Loop: context → prompt → model → validate → act → log/evaluate.",
  "The model is one step; reliability comes from the engineering around it."
 ]
},
{
 id: "how-llms-work",
 title: "How LLMs work (just enough to use them well)",
 level: "Beginner",
 one: "An LLM reads text as <b>tokens</b> and predicts the next token, again and again. It knows only what was in its <b>training data</b> plus what you put in its <b>context window</b>.",
 why: "Understanding tokens, context limits, temperature and hallucination explains almost every LLM behaviour you'll see, and how to design around it.",
 steps: [
  { h: "Tokens",
    p: ["Models don't see letters or words; they see <b>tokens</b>, pieces of text of about 3–4 English characters on average (“unbelievable” might be 3 tokens). Prices, speed and limits are all counted in tokens.",
        "A quick estimate when you don't have the model's tokenizer:"],
    code: `def estimate_tokens(text: str) -> int:
    return max(1, round(len(text) / 4))     # rough rule for English

for t in ["Hello!", "Please extract the invoice number and total from this email.", "x" * 4000]:
    print(estimate_tokens(t), "tokens ≈", repr(t[:40]))`,
    note: "Each provider has an exact token counter (for example a count-tokens API endpoint). Use it when precision matters, such as billing or hard limits." },
  { h: "Next-token prediction",
    p: ["Given the text so far, the model scores every possible next token and picks one, adds it, and repeats. That's all generation is. It explains why the model sounds fluent even when it's wrong: it produces <i>likely</i> text, not <i>checked</i> facts."] },
  { h: "Temperature: how adventurous",
    p: ["<b>Temperature</b> controls how often the model picks less likely tokens. Low (0–0.3): focused and repeatable, good for extraction and classification. Higher (0.7–1): more varied, good for brainstorming and writing. Here's the effect on made-up next-token scores:"],
    code: `import math

def probabilities(scores: dict[str, float], temperature: float) -> dict[str, float]:
    scaled = {t: s / temperature for t, s in scores.items()}
    total = sum(math.exp(v) for v in scaled.values())
    return {t: round(math.exp(v) / total, 3) for t, v in scaled.items()}

next_word_scores = {"paid": 3.0, "pending": 2.0, "cancelled": 1.0}
for temp in [0.2, 1.0, 2.0]:
    print(temp, probabilities(next_word_scores, temp))` },
  { h: "The context window",
    p: ["The <b>context window</b> is how many tokens the model can see at once: your instructions + conversation + documents + its answer. Modern models handle from tens of thousands to around a million tokens.",
        "The model has <b>no memory</b> between API calls. Every call, you send everything it needs. Chat apps “remember” only because they resend the whole conversation each time."] },
  { h: "Knowledge cutoff and hallucination",
    p: ["The model learned from data up to a <b>cutoff date</b>; it doesn't know newer facts or your company's private data unless you put them in the context.",
        "<b>Hallucination</b> = confident, wrong output. It happens most when the answer isn't in the context. Defences: give the facts in the prompt (RAG), ask it to say “I don't know”, require citations, validate outputs, and evaluate."] },
  { h: "Choosing a model",
    p: ["Providers offer families: large models (smartest, slower, pricier) and small ones (fast, cheap). Start with a strong model to prove the feature works, then try a smaller one and compare with your evals.",
        "Compare on: quality on <b>your</b> task, cost per 1M input/output tokens, speed, context size, and features (tools, images, structured output)."] }
 ],
 mistakes: [
  "Assuming the model remembers previous calls. Send the needed context every time.",
  "High temperature for extraction or classification. Use 0–0.2 for repeatable output.",
  "Trusting facts the model wasn't given. Supply the data, or verify.",
  "Ignoring token costs. Long prompts × many calls = real money."
 ],
 practice: [
  { q: "Estimate the cost of 10,000 calls with 1,500 input and 300 output tokens each, at $3 per 1M input and $15 per 1M output tokens.", code: `calls, inp, out = 10_000, 1_500, 300
cost = calls * (inp * 3 + out * 15) / 1_000_000
print(f"\${cost:,.2f}")` },
  { q: "Why does a chatbot built on an API “forget” earlier messages if you don't resend them?", a: "The model is stateless: each API call only sees what's in that request. To continue a conversation you send the earlier messages again (or a summary of them)." }
 ],
 check: [
  ["Roughly how many characters is one English token?", ["1", "About 4", "About 20", "One word always"], 1, "A rough rule of thumb: ~4 characters."],
  ["Best temperature for extracting invoice fields?", ["0–0.2", "1.0", "2.0", "Doesn't matter"], 0, "Low temperature = consistent output."],
  ["Does the model remember your last API call?", ["Yes", "No; each call only sees what you send", "Only for 1 hour", "Only on paid plans"], 1, "Models are stateless between calls."]
 ],
 remember: [
  "Tokens ≈ 4 characters. Cost, speed and limits are in tokens.",
  "Generation = predict next token, repeat. Fluent ≠ correct.",
  "Temperature low for extraction/classification, higher for creative work.",
  "Context window = everything the model sees in one call. No memory between calls.",
  "Hallucination defence: give facts, allow “I don't know”, cite, validate, evaluate."
 ]
},
{
 id: "prompting",
 title: "Prompting: clear instructions that work",
 level: "Beginner+",
 one: "A good prompt reads like a brief to a smart new colleague: <b>role and goal</b>, <b>context</b>, <b>clear instructions</b>, <b>examples</b>, and the <b>exact output format</b>.",
 why: "Prompt quality is the cheapest way to improve an LLM feature. Most “the model is bad” problems are really unclear prompts.",
 steps: [
  { h: "Messages: system and user",
    p: ["Chat APIs take a list of messages. The <b>system</b> prompt sets the role and rules for the whole conversation; <b>user</b> messages carry the task and data; <b>assistant</b> messages are the model's replies.",
        "Calling Claude with the Anthropic Python SDK (<code>pip install anthropic</code>, key in <code>ANTHROPIC_API_KEY</code>). Use the current model name from the provider's docs:"],
    code: `import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY
MODEL = "claude-sonnet-5-5"             # check the docs for current model names

msg = client.messages.create(
    model=MODEL,
    max_tokens=300,
    temperature=0,
    system="You are a support assistant for an online shop. Be brief and polite.",
    messages=[{"role": "user", "content": "Where is my order #6? It was due yesterday."}],
)
print(msg.content[0].text)
print(msg.usage.input_tokens, msg.usage.output_tokens)`, run: false,
    out: { text: "I'm sorry your order #6 is late. Let me check its status for you. Could you confirm the email address used for the order?\n38 31", hand: true },
    note: "OpenAI, Gemini and others work the same way: a list of messages in, text out. Only the SDK names differ." },
  { h: "Be specific",
    p: ["Vague: <i>“Summarise this ticket.”</i> Specific: <i>“Summarise this support ticket in 2 sentences for a manager. Include the customer's problem and what they want. Don't include personal details.”</i>",
        "Say who the output is for, how long it should be, what to include, and what to leave out."] },
  { h: "Separate instructions from data",
    p: ["Wrap documents and user input in clear tags so the model doesn't confuse your instructions with the content (this also helps against prompt injection). Building prompts in code:"],
    code: `def build_prompt(ticket: str) -> str:
    return f"""Classify the support ticket below.

Categories: billing, delivery, product_issue, account, other

<ticket>
{ticket.strip()}
</ticket>

Reply with only the category name."""

print(build_prompt("  My card was charged twice for order 6!  "))` },
  { h: "Few-shot: show examples",
    p: ["Two or three examples of input → output teach format and judgement better than paragraphs of rules. Pick examples that cover tricky cases."],
    code: `EXAMPLES = [
    ("I was charged twice", "billing"),
    ("Parcel says delivered but nothing came", "delivery"),
    ("Can't log in after changing my email", "account"),
]

def few_shot_prompt(ticket: str) -> str:
    shots = "\\n".join(f"<ticket>{t}</ticket>\\ncategory: {c}" for t, c in EXAMPLES)
    return f"Classify support tickets.\\n\\n{shots}\\n\\n<ticket>{ticket}</ticket>\\ncategory:"

print(few_shot_prompt("The blender arrived cracked"))` },
  { h: "Let it think, then answer",
    p: ["For multi-step reasoning (calculations, comparing policies, deciding eligibility), ask the model to reason step by step first, inside tags, then give the final answer in a separate tag that your code reads. Many current models also have a built-in “extended thinking” option that does this for you."],
    code: `Decide if this customer qualifies for a refund under the policy.
Think it through inside <thinking> tags, then give only "yes" or "no" inside <answer> tags.

<policy>Refunds within 30 days of delivery for unused items.</policy>
<case>Delivered 12 days ago. Customer opened the box but didn't use it.</case>`, lang: "text" },
  { h: "Iterate like an engineer",
    p: ["Collect 10–20 real inputs (including messy ones), run the prompt on all of them, look at the failures, change one thing, and rerun. That's a tiny <b>eval</b>; the Evals course goes deeper. Keep prompts in files under version control, not scattered in code."] }
 ],
 mistakes: [
  "One-line vague prompts, then blaming the model.",
  "Mixing instructions and data so the model can't tell them apart. Use tags.",
  "Changing many things at once. You won't know what helped.",
  "Testing on one happy example. Test on real, messy inputs."
 ],
 practice: [
  { q: "Rewrite this prompt to be specific: <i>“Write a reply to this customer.”</i>", a: "For example: “You are a support agent for Acme Shop. Write a reply to the customer email below. Apologise once, explain the next step, and give a realistic date. Max 80 words, friendly but professional, no promises about refunds. &lt;email&gt;…&lt;/email&gt;”" },
  { q: "Write a function that builds a prompt to extract the order number from an email, with the email in tags and a strict output rule.", code: `def order_number_prompt(email: str) -> str:
    return (
        "Find the order number in the email below.\\n"
        "Order numbers look like #1234 or 'order 1234'.\\n"
        "<email>\\n" + email.strip() + "\\n</email>\\n"
        "Reply with only the digits, or NONE if there is no order number."
    )

print(order_number_prompt("Hi, my order 4417 hasn't arrived. Thanks, Asha"))` }
 ],
 check: [
  ["Where do lasting rules like 'always reply in English' go?", ["In every user message", "In the system prompt", "In the model name", "Nowhere"], 1, "The system prompt sets behaviour for the whole conversation."],
  ["Why wrap documents in tags like <doc>…</doc>?", ["It's required", "So the model can tell instructions from data", "To save tokens", "For colour"], 1, "Clear boundaries reduce confusion and injection."],
  ["Best way to improve a prompt?", ["Change everything at once", "Run it on many real inputs, fix one thing, rerun", "Use a bigger font", "Increase temperature"], 1, "That's a small eval loop."]
 ],
 remember: [
  "System = role and rules; user = task and data; assistant = model replies.",
  "Be specific: audience, length, include, exclude, format.",
  "Put data in tags; few-shot examples for format and judgement.",
  "Reason in <thinking>, answer in <answer> for multi-step tasks.",
  "Iterate on 10–20 real inputs; keep prompts in version control."
 ]
},
{
 id: "structured-outputs",
 title: "Structured outputs: getting reliable JSON",
 level: "Intermediate",
 one: "Your code needs data, not prose. Ask the model for <b>JSON that matches a schema</b>, then <b>validate</b> it with Pydantic and <b>retry</b> (with the error) when it doesn't fit.",
 why: "Extraction and classification are the most common LLM features in business. They only work in production if the output is machine-readable every time.",
 steps: [
  { h: "Define the shape first",
    p: ["Write a Pydantic model of exactly what you need. Its JSON Schema can go into the prompt or the provider's structured-output option."],
    code: `from pydantic import BaseModel, Field
from typing import Literal
import json

class Invoice(BaseModel):
    invoice_number: str
    vendor: str
    total: float = Field(ge=0)
    currency: Literal["INR", "USD", "EUR", "AED"]
    due_date: str | None = Field(default=None, description="YYYY-MM-DD")

print(json.dumps(Invoice.model_json_schema()["properties"], indent=1)[:400])` },
  { h: "Validate what comes back",
    p: ["Models sometimes add text around the JSON, miss a field or use a wrong value. Validation catches it before it reaches your database. Here, three kinds of reply:"],
    code: `from pydantic import BaseModel, Field, ValidationError
from typing import Literal
import json, re

class Invoice(BaseModel):
    invoice_number: str
    vendor: str
    total: float = Field(ge=0)
    currency: Literal["INR", "USD", "EUR", "AED"]

def parse_reply(text: str) -> Invoice:
    match = re.search(r"\\{.*\\}", text, re.DOTALL)     # tolerate text around the JSON
    if not match:
        raise ValueError("no JSON found")
    return Invoice.model_validate(json.loads(match.group()))

replies = [
    '{"invoice_number": "INV-204", "vendor": "Bright Foods", "total": 18450.5, "currency": "INR"}',
    'Sure! Here it is: {"invoice_number": "INV-9", "vendor": "Delta", "total": "3200", "currency": "INR"}',
    '{"invoice_number": "INV-7", "vendor": "Acme", "total": -50, "currency": "rupees"}',
]
for r in replies:
    try:
        print("OK ", parse_reply(r))
    except ValidationError as e:
        print("BAD", [(x["loc"][0], x["msg"]) for x in e.errors()])
    except ValueError as e:
        print("BAD", e)` },
  { h: "Retry with the error message",
    p: ["When validation fails, send the model its own output plus the error and ask it to fix it. One or two retries fix most problems. Here a stand-in model gets it wrong first, then right:"],
    pre: FAKE_LLM,
    code: `from pydantic import BaseModel, Field, ValidationError
from typing import Literal
import json

class Invoice(BaseModel):
    invoice_number: str
    total: float = Field(ge=0)
    currency: Literal["INR", "USD"]

def extract(llm, text: str, max_tries: int = 3) -> Invoice:
    messages = [{"role": "user", "content": f"Extract the invoice as JSON.\\n<doc>{text}</doc>"}]
    for attempt in range(1, max_tries + 1):
        reply = llm.complete(messages)
        try:
            return Invoice.model_validate_json(reply)
        except ValidationError as e:
            print(f"attempt {attempt} failed: {e.errors()[0]['loc']} {e.errors()[0]['msg']}")
            messages += [{"role": "assistant", "content": reply},
                         {"role": "user", "content": f"That JSON is invalid: {e}. Return corrected JSON only."}]
    raise RuntimeError("could not get valid JSON")

llm = FakeLLM(['{"invoice_number": "INV-204", "total": 18450, "currency": "rupees"}',
               '{"invoice_number": "INV-204", "total": 18450, "currency": "INR"}'])
print(extract(llm, "Invoice INV-204 ... Total ₹18,450"))
print("model calls:", len(llm.calls))` },
  { h: "Use the provider's structured output features",
    p: ["Most providers can force JSON matching your schema (often called “structured outputs” or “JSON mode”), or you can define a <b>tool</b> whose input schema is your model and make the model call it. This removes most format errors, but still validate: the <i>values</i> can be wrong even when the format is right.",
        "With Claude, a common pattern is a single tool used as the output schema:"],
    code: `import anthropic
from pydantic import BaseModel

class Invoice(BaseModel):
    invoice_number: str
    vendor: str
    total: float
    currency: str

client = anthropic.Anthropic()
resp = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=500,
    tools=[{"name": "save_invoice", "description": "Save the extracted invoice",
            "input_schema": Invoice.model_json_schema()}],
    tool_choice={"type": "tool", "name": "save_invoice"},
    messages=[{"role": "user", "content": "Extract this invoice: <doc>…</doc>"}],
)
data = next(b.input for b in resp.content if b.type == "tool_use")
invoice = Invoice.model_validate(data)`, run: false },
  { h: "Design schemas that help the model",
    p: ["Clear field names and descriptions, <code>Literal</code> lists for categories, <code>null</code> allowed for “not found” (so it doesn't invent values), and a <code>confidence</code> or <code>needs_review</code> field to route doubtful cases to a human. Keep the schema as small as the task needs."] }
 ],
 mistakes: [
  "Parsing the reply with string slicing. Use json + Pydantic.",
  "Not allowing null: the model invents an answer instead of saying “not found”.",
  "Trusting values because the format is valid. A valid JSON total can still be the wrong number. Check against the source where you can (totals = sum of lines).",
  "Infinite retries. Cap them and send failures to a review queue."
 ],
 practice: [
  { q: "Write a Pydantic model for classifying a support ticket: category (billing/delivery/product/account/other), urgency (low/medium/high), and a one-line summary up to 120 characters. Validate a sample.", code: `from typing import Literal
from pydantic import BaseModel, Field

class TicketTriage(BaseModel):
    category: Literal["billing", "delivery", "product", "account", "other"]
    urgency: Literal["low", "medium", "high"]
    summary: str = Field(max_length=120)

print(TicketTriage.model_validate_json('{"category": "billing", "urgency": "high", "summary": "Charged twice for order 6"}'))` },
  { q: "An extracted invoice says total 18,450 but its line items add up to 18,540. What should your system do?", a: "Don't save it silently. Flag it for human review (or retry the extraction asking it to recheck the total), and log it. A cross-check like “total = sum of lines” is a cheap, strong validator." }
 ],
 check: [
  ["Why validate JSON from a model?", ["It's always perfect", "Format and values can be wrong; validation stops bad data reaching your systems", "To make it faster", "Pydantic is required"], 1, "Validate every time."],
  ["Best first fix when validation fails?", ["Give up", "Retry, showing the model its output and the error", "Change models", "Raise temperature"], 1, "Models fix their own output well when told what's wrong."],
  ["Why allow null for fields that may be missing?", ["Smaller JSON", "So the model doesn't invent a value", "It's required by JSON", "Faster parsing"], 1, "Give it an honest way to say 'not found'."]
 ],
 remember: [
  "Schema first (Pydantic) → ask for JSON → validate → retry with the error (max 2–3) → human review.",
  "Use provider structured outputs / a tool as the schema to cut format errors.",
  "Literal for categories, null for not found, needs_review for doubt.",
  "Valid format ≠ correct values: cross-check (totals, dates) where possible."
 ]
},
{
 id: "tool-calling",
 title: "Tool calling: letting the model use functions",
 level: "Intermediate",
 one: "With <b>tool calling</b>, you describe functions (name, purpose, input schema). The model replies “call <code>get_order</code> with <code>{\"order_id\": 6}</code>”, <b>your code runs it</b>, and you send the result back so the model can finish the answer.",
 why: "Tools connect the model to real data and actions: databases, APIs, calculators, your client's ERP. Every agent and copilot is built on this.",
 steps: [
  { h: "Describe a tool",
    p: ["A tool definition is a name, a clear description (when to use it) and a JSON Schema for its input. The description matters as much as a prompt."],
    code: `get_order_tool = {
    "name": "get_order",
    "description": "Look up an order by its number. Use when the customer mentions an order.",
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "integer", "description": "The order number, e.g. 6"}},
        "required": ["order_id"],
    },
}
print(get_order_tool["name"], "->", list(get_order_tool["input_schema"]["properties"]))` },
  { h: "The loop",
    p: ["<b>1.</b> Send the conversation + tool definitions. <b>2.</b> If the model asks for a tool, run it and append the result. <b>3.</b> Call the model again. <b>4.</b> Stop when it answers with plain text. The model never runs code itself; your program does, so you stay in control.",
        "Here's the loop with a stand-in model that asks for one tool, then answers:"],
    pre: FAKE_LLM,
    code: `import json

ORDERS = {6: {"status": "shipped", "carrier": "BlueDart", "eta": "2025-07-21"}}

def get_order(order_id: int) -> dict:
    return ORDERS.get(order_id, {"error": f"order {order_id} not found"})

TOOLS = {"get_order": get_order}

def run(llm, question: str, max_steps: int = 5) -> str:
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        reply = llm.complete(messages)
        if reply["type"] == "text":
            return reply["text"]
        name, args = reply["tool"], reply["input"]
        result = TOOLS[name](**args)
        print(f"model asked for {name}({args}) -> {result}")
        messages += [{"role": "assistant", "content": reply},
                     {"role": "user", "content": {"tool_result": result}}]
    return "Sorry, I couldn't finish that."

llm = FakeLLM([
    {"type": "tool_use", "tool": "get_order", "input": {"order_id": 6}},
    {"type": "text", "text": "Your order #6 has shipped with BlueDart and should arrive on 21 July."},
])
print(run(llm, "Where is my order 6?"))` },
  { h: "The real API shape (Claude)",
    p: ["The same loop with the Anthropic SDK. The model returns <code>stop_reason == \"tool_use\"</code> and <code>tool_use</code> blocks; you answer with <code>tool_result</code> blocks."],
    code: `import anthropic, json
client = anthropic.Anthropic()
messages = [{"role": "user", "content": "Where is my order 6?"}]

while True:
    resp = client.messages.create(model="claude-sonnet-5-5", max_tokens=500,
                                  tools=[get_order_tool], messages=messages)
    if resp.stop_reason != "tool_use":
        print(resp.content[0].text)
        break
    messages.append({"role": "assistant", "content": resp.content})
    results = []
    for block in resp.content:
        if block.type == "tool_use":
            output = TOOLS[block.name](**block.input)
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": json.dumps(output)})
    messages.append({"role": "user", "content": results})`, run: false },
  { h: "Validate tool inputs, handle tool errors",
    p: ["The model can send wrong arguments. Validate them (Pydantic again) and return errors <i>as results</i>, so the model can correct itself instead of your program crashing."],
    code: `from pydantic import BaseModel, ValidationError

class GetOrderInput(BaseModel):
    order_id: int

def safe_call(args: dict) -> dict:
    try:
        parsed = GetOrderInput.model_validate(args)
    except ValidationError as e:
        return {"error": f"invalid input: {e.errors()[0]['msg']}"}
    return {"order_id": parsed.order_id, "status": "shipped"}

print(safe_call({"order_id": "6"}))
print(safe_call({"order_id": "six"}))` },
  { h: "Safe tool design",
    p: ["Give the model the <b>smallest set of tools</b> it needs. Read-only tools (lookups) are low risk. Tools that change things (refund, delete, send email) need limits: amount caps, allow-lists, and often a <b>human approval</b> step. Always cap the loop (max steps) so it can't run forever, and log every tool call."] }
 ],
 mistakes: [
  "Vague tool descriptions. The model calls the wrong tool or none.",
  "Crashing on bad tool input instead of returning an error result.",
  "Giving write tools (refunds, deletes) with no limits or approval.",
  "No max-steps cap on the loop."
 ],
 practice: [
  { q: "Write a tool definition for <code>search_products</code> that takes a text query and an optional max price.", code: `search_products = {
    "name": "search_products",
    "description": "Search the product catalogue by keyword. Use when the customer asks what's available.",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Words to search for"},
            "max_price": {"type": "number", "description": "Optional price limit in INR"},
        },
        "required": ["query"],
    },
}
print(search_products["input_schema"]["required"])` },
  { q: "A support bot has a <code>refund(order_id, amount)</code> tool. What safeguards would you add?", a: "Cap the amount (e.g. ≤ order total and ≤ a fixed limit), check the order belongs to the customer, allow only one refund per order, require human approval above a threshold, and log every call with who/why." }
 ],
 check: [
  ["Who runs the tool's code?", ["The model", "Your program", "The provider", "Nobody"], 1, "The model only asks; your code executes."],
  ["The model sends invalid tool arguments. Best response?", ["Crash", "Return an error as the tool result so it can retry", "Ignore it", "Restart"], 1, "Let the model correct itself."],
  ["Why cap the number of loop steps?", ["To save typing", "So a confused model can't loop forever (and burn money)", "The API requires it", "No reason"], 1, "Always bound agent loops."]
 ],
 remember: [
  "Tool = name + description + input schema. Descriptions matter.",
  "Loop: model → tool_use → your code runs it → tool_result → model … → text.",
  "Validate tool inputs; return errors as results.",
  "Fewest tools needed; limits and approval for actions; max steps; log calls."
 ]
},
{
 id: "context",
 title: "Managing context: memory, long documents and cost",
 level: "Intermediate",
 one: "Everything the model knows in a call is its <b>context</b>. Managing it well means sending the <b>right</b> information, not all of it: trim conversations, summarise, chunk documents, and cache repeated parts.",
 why: "Context decides quality, cost and speed. Real apps have long chats and huge documents, and stuffing everything in is slow, expensive and often <i>less</i> accurate.",
 steps: [
  { h: "What fills the context",
    p: ["System prompt + tool definitions + conversation history + retrieved documents + the answer. All of it costs tokens on <b>every</b> call. A quick budget check:"],
    code: `def tokens(text: str) -> int:
    return round(len(text) / 4)

parts = {
    "system prompt": "You are a support assistant..." * 20,
    "tools": "{...tool schema...}" * 60,
    "history": "user/assistant turns..." * 300,
    "documents": "policy text..." * 1500,
}
budget = 16_000
used = {k: tokens(v) for k, v in parts.items()}
for k, v in used.items():
    print(f"{k:14} {v:6,} tokens")
print(f"{'total':14} {sum(used.values()):6,} of {budget:,}")` },
  { h: "Keep conversations short",
    p: ["Long chats grow forever. Keep the last few turns word-for-word and replace older ones with a short summary (written by the model itself), added to the system prompt."],
    code: `def trim_history(system: str, messages: list[dict], summary: str, keep_last: int = 4):
    if len(messages) <= keep_last:
        return system, messages
    system += f"\\n\\nSummary of the earlier conversation: {summary}"
    return system, messages[-keep_last:]

chat = [{"role": "user" if i % 2 == 0 else "assistant", "content": f"message {i}"} for i in range(10)]
system, recent = trim_history("You are a support assistant.", chat,
                              summary="customer wants a refund for order 6; email already verified")
print(system)
for m in recent:
    print(m["role"], "-", m["content"])` },
  { h: "Long documents: chunk and pick",
    p: ["Don't paste a 200-page manual into every call. Split it into chunks, find the few chunks relevant to the question, and send only those. That's the idea behind <b>RAG</b> (next course). A simple keyword version:"],
    code: `manual = """Returns: items can be returned within 30 days of delivery.
Refunds: refunds go to the original payment method within 5-7 working days.
Shipping: standard delivery takes 3-5 days; express takes 1-2 days.
Warranty: electronics have a 1-year manufacturer warranty.
Cancellations: orders can be cancelled before they are shipped."""

chunks = manual.splitlines()

def top_chunks(question: str, k: int = 2) -> list[str]:
    words = {w.strip("?.,").lower() for w in question.split() if len(w) > 3}
    scored = sorted(chunks, key=lambda c: -sum(w in c.lower() for w in words))
    return scored[:k]

for c in top_chunks("How long do refunds take after a return?"):
    print("-", c)` },
  { h: "Order matters",
    p: ["Put long documents <b>first</b> and the question and instructions <b>after</b> them. Models tend to follow instructions near the end better, and repeating the key instruction at the end of a long prompt helps.",
        "Put stable parts (system prompt, tool definitions, reference docs) at the start and keep them identical between calls: that lets <b>prompt caching</b> work."] },
  { h: "Prompt caching and cost",
    p: ["Providers can cache the unchanged start of a prompt, so repeated calls with the same long system prompt or document are much cheaper and faster (cached input tokens often cost a fraction of normal ones). Rough savings for a support bot:"],
    code: `calls = 20_000
stable_tokens, new_tokens = 6_000, 500          # same docs + system prompt every call, plus the question
price_in = 3 / 1_000_000
cached_price = price_in * 0.1                  # cached reads often cost ~10% (check your provider)

without = calls * (stable_tokens + new_tokens) * price_in
with_cache = calls * (stable_tokens * cached_price + new_tokens * price_in)
print(f"without caching: \${without:,.0f}")
print(f"with caching:    \${with_cache:,.0f}")` }
 ],
 mistakes: [
  "Sending the whole conversation forever. Trim and summarise.",
  "Dumping entire documents into every call. Retrieve the relevant parts.",
  "Changing the start of the prompt on every call (timestamps, random ids), which breaks caching.",
  "Assuming more context = better answers. Irrelevant text distracts the model."
 ],
 practice: [
  { q: "Write <code>fits(parts, limit)</code> that returns True if the estimated tokens of all parts fit under the limit with 1,000 tokens left for the answer.", code: `def fits(parts: list[str], limit: int) -> bool:
    used = sum(round(len(p) / 4) for p in parts)
    return used + 1_000 <= limit

print(fits(["a" * 20_000, "b" * 8_000], 7_500))
print(fits(["a" * 20_000, "b" * 8_000], 12_000))` },
  { q: "A chatbot gets slower and pricier the longer a chat goes on. Why, and what are two fixes?", a: "Every call resends the whole growing history. Fix by keeping only recent turns plus a summary of older ones, and by caching the stable start of the prompt." }
 ],
 check: [
  ["Why not paste the whole manual into every call?", ["It's not allowed", "Costly, slow, and irrelevant text can lower accuracy", "Models can't read manuals", "No reason"], 1, "Retrieve only what's relevant."],
  ["Where should a long document go relative to the question?", ["After the question", "Before the question", "In the model name", "Doesn't matter"], 1, "Documents first, question and instructions last."],
  ["What breaks prompt caching?", ["A long system prompt", "Changing the start of the prompt every call", "Using tools", "Low temperature"], 1, "Keep the stable prefix identical."]
 ],
 remember: [
  "Context = system + tools + history + documents + answer, paid on every call.",
  "Trim history: last few turns + summary of older ones.",
  "Long docs: chunk and send only relevant parts (RAG).",
  "Docs first, question last. Stable prefix first → prompt caching.",
  "More context isn't always better."
 ]
},
{
 id: "build-extractor",
 title: "Project: an invoice extractor with validation and review",
 level: "Project",
 one: "Build a small service that turns invoice text into validated JSON, checks the numbers, retries on bad output, and sends doubtful cases to a human review list.",
 why: "Document extraction is the #1 business use of LLMs, and a perfect portfolio project: easy to explain, measurable, and full of real engineering (validation, retries, review, evals).",
 steps: [
  { h: "The plan",
    p: ["<b>Input</b>: invoice text (from email or PDF-to-text). <b>Output</b>: <code>Invoice</code> JSON, or a review item. <b>Checks</b>: schema, total = sum of lines (±1), date format. <b>Retries</b>: up to 2 with the error. <b>Measure</b>: accuracy on 20 labelled invoices."] },
  { h: "The schema and the checks",
    code: `from datetime import date
from pydantic import BaseModel, Field, ValidationError, model_validator

class Line(BaseModel):
    description: str
    qty: float = Field(gt=0)
    unit_price: float = Field(ge=0)

class Invoice(BaseModel):
    invoice_number: str
    vendor: str
    invoice_date: date
    currency: str = Field(pattern="^[A-Z]{3}$")
    lines: list[Line] = Field(min_length=1)
    total: float = Field(ge=0)

    @model_validator(mode="after")
    def total_matches_lines(self):
        lines_sum = round(sum(l.qty * l.unit_price for l in self.lines), 2)
        if abs(lines_sum - self.total) > 1:
            raise ValueError(f"total {self.total} != sum of lines {lines_sum}")
        return self

good = {"invoice_number": "INV-204", "vendor": "Bright Foods", "invoice_date": "2025-07-03", "currency": "INR",
        "lines": [{"description": "Coffee 1kg", "qty": 10, "unit_price": 900}, {"description": "Tea", "qty": 20, "unit_price": 400}],
        "total": 17000}
print(Invoice.model_validate(good).total)

bad = {**good, "total": 18000}
try:
    Invoice.model_validate(bad)
except ValidationError as e:
    print("rejected:", e.errors()[0]["msg"])` },
  { h: "The pipeline",
    p: ["Extract → validate → retry with the error → if still bad, send to review. The model is a parameter, so tests can use a stand-in."],
    pre: FAKE_LLM + String.raw`
from datetime import date
from pydantic import BaseModel, Field, model_validator
class Line(BaseModel):
    description: str
    qty: float = Field(gt=0)
    unit_price: float = Field(ge=0)
class Invoice(BaseModel):
    invoice_number: str
    vendor: str
    invoice_date: date
    currency: str = Field(pattern="^[A-Z]{3}$")
    lines: list[Line] = Field(min_length=1)
    total: float = Field(ge=0)
    @model_validator(mode="after")
    def total_matches_lines(self):
        s = round(sum(l.qty * l.unit_price for l in self.lines), 2)
        if abs(s - self.total) > 1:
            raise ValueError(f"total {self.total} != sum of lines {s}")
        return self
`,
    code: `from pydantic import ValidationError

PROMPT = """Extract the invoice below as JSON with fields:
invoice_number, vendor, invoice_date (YYYY-MM-DD), currency (3 letters), lines[description, qty, unit_price], total.
Use null if a field is missing. Return JSON only.
<invoice>
{text}
</invoice>"""

review_queue = []

def process(llm, text: str, max_tries: int = 3) -> Invoice | None:
    messages = [{"role": "user", "content": PROMPT.format(text=text)}]
    error = None
    for _ in range(max_tries):
        reply = llm.complete(messages)
        try:
            return Invoice.model_validate_json(reply)
        except ValidationError as e:
            error = e.errors()[0]["msg"]
            messages += [{"role": "assistant", "content": reply},
                         {"role": "user", "content": f"Invalid: {error}. Fix it and return JSON only."}]
    review_queue.append({"text": text[:40], "reason": error})
    return None

ok_json = '{"invoice_number":"INV-9","vendor":"Delta","invoice_date":"2025-07-03","currency":"INR","lines":[{"description":"Chair","qty":1,"unit_price":8000}],"total":8000}'
wrong_total = ok_json.replace('"total":8000', '"total":9000')

print(process(FakeLLM([wrong_total, ok_json]), "Invoice INV-9 from Delta ...").invoice_number)
print(process(FakeLLM([wrong_total] * 3), "Invoice INV-10 from Acme ..."))
print("review:", review_queue)` },
  { h: "Measure accuracy",
    p: ["Label 20 real invoices by hand (the correct JSON), run the extractor on all of them, and count field-level matches. Re-run after every prompt or model change. This number is what you show the client."],
    code: `expected = [
    {"invoice_number": "INV-9",  "total": 8000,  "currency": "INR"},
    {"invoice_number": "INV-10", "total": 3200,  "currency": "INR"},
    {"invoice_number": "INV-11", "total": 450.0, "currency": "USD"},
]
predicted = [
    {"invoice_number": "INV-9",  "total": 8000,  "currency": "INR"},
    {"invoice_number": "INV-10", "total": 2300,  "currency": "INR"},
    {"invoice_number": "INV-11", "total": 450.0, "currency": "USD"},
]
fields = ["invoice_number", "total", "currency"]
hits = sum(p[f] == e[f] for p, e in zip(predicted, expected) for f in fields)
print(f"field accuracy: {hits}/{len(expected) * len(fields)} = {hits / (len(expected) * len(fields)):.0%}")
for f in fields:
    print(f, sum(p[f] == e[f] for p, e in zip(predicted, expected)), "/", len(expected))` },
  { h: "Ship it",
    p: ["Wrap <code>process</code> in a FastAPI endpoint (<code>POST /extract</code>), store results and the review queue in a database, log every model call (input size, output, tokens, time), and show the accuracy table in your README. The Evals and AI in Production courses take this further."] }
 ],
 mistakes: [
  "Shipping without a labelled test set. You can't say how accurate it is.",
  "Saving extracted data without cross-checks (totals, dates, known vendors).",
  "No human review path: the 5% of hard invoices end up as silent errors.",
  "Hard-wiring the model call inside the logic, so you can't test it."
 ],
 practice: [
  { q: "Add a check that invoice_date isn't in the future.", code: `from datetime import date
from pydantic import BaseModel, field_validator

class Dated(BaseModel):
    invoice_date: date

    @field_validator("invoice_date")
    @classmethod
    def not_future(cls, v: date) -> date:
        if v > date(2025, 9, 1):   # in real code: date.today()
            raise ValueError("invoice date is in the future")
        return v

print(Dated(invoice_date="2025-07-03"))
try:
    Dated(invoice_date="2030-01-01")
except Exception as e:
    print("rejected")` },
  { q: "The client asks “how accurate is it?”. What do you show them?", a: "Field-level accuracy on a labelled set of their real invoices (e.g. 20–50), broken down by field, plus how many went to human review and why. Re-run and share it after each change." }
 ],
 check: [
  ["What's a strong cheap check on extracted invoices?", ["Word count", "Total equals the sum of line items", "Font size", "Vendor name length"], 1, "Cross-checks catch wrong values in valid JSON."],
  ["What happens to invoices that still fail after retries?", ["Delete them", "Send them to a human review queue", "Save them anyway", "Retry forever"], 1, "Humans handle the hard cases."],
  ["How do you know your extractor is good?", ["It worked once", "Measure field accuracy on a labelled set", "The model is famous", "It's fast"], 1, "Evals on real data."]
 ],
 remember: [
  "Schema + cross-checks (total = sum of lines) + retries + review queue.",
  "Pass the model in as a parameter so you can test with a stand-in.",
  "Measure field-level accuracy on 20–50 labelled real documents.",
  "Log every call: input size, output, tokens, time."
 ]
}
];
