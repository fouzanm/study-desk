// Project: Odoo AI Agent (accounts-payable automation). Everything runs offline:
// FakeOdoo mimics Odoo's execute_kw API, FakeLLM replays model replies, MCP uses the official SDK.
const ODOO = String.raw`
"""odoo_client.py - an in-memory stand-in for Odoo's JSON-RPC execute_kw API (same call shape)."""
import copy

class FakeOdoo:
    def __init__(self):
        self.db = {
            "res.partner": [
                {"id": 7, "name": "Malabar Office Supplies", "vat": "32AABCM1234F1Z5", "supplier_rank": 1},
                {"id": 8, "name": "Deccan Tech Traders", "vat": "29AADCD5678K1Z2", "supplier_rank": 1},
                {"id": 9, "name": "Gulf Packaging LLC", "vat": None, "supplier_rank": 1},
            ],
            "purchase.order": [
                {"id": 31, "name": "P00031", "partner_id": 7, "amount_total": 11800.0, "state": "purchase", "invoice_status": "to invoice"},
                {"id": 32, "name": "P00032", "partner_id": 8, "amount_total": 59000.0, "state": "purchase", "invoice_status": "to invoice"},
                {"id": 33, "name": "P00033", "partner_id": 7, "amount_total": 4720.0, "state": "purchase", "invoice_status": "invoiced"},
            ],
            "account.move": [
                {"id": 501, "move_type": "in_invoice", "partner_id": 8, "ref": "DT/2025/0098", "amount_total": 23600.0, "state": "posted"},
            ],
        }
        self.calls = []

    def _match(self, rec, domain):
        ops = {"=": lambda a, b: a == b, "!=": lambda a, b: a != b, "ilike": lambda a, b: str(b).lower() in str(a or "").lower(),
               "in": lambda a, b: a in b, ">": lambda a, b: a > b}
        return all(ops[op](rec.get(f), v) for f, op, v in domain)

    def execute_kw(self, model, method, args, kwargs=None):
        kwargs = kwargs or {}
        self.calls.append((model, method))
        rows = self.db[model]
        if method == "search_read":
            fields = kwargs.get("fields")
            found = [r for r in rows if self._match(r, args[0])][: kwargs.get("limit") or None]
            return [copy.deepcopy({k: r[k] for k in (fields or r) if k in r} | {"id": r["id"]}) for r in found]
        if method == "search_count":
            return sum(self._match(r, args[0]) for r in rows)
        if method == "create":
            vals = dict(args[0]); vals["id"] = max(r["id"] for r in rows) + 1
            if model == "account.move":
                vals.setdefault("state", "draft")
                vals["amount_total"] = round(sum(l["quantity"] * l["price_unit"] for l in vals.get("invoice_line_ids", [])) * (1 + vals.pop("_tax_rate", 0)), 2)
            rows.append(vals)
            return vals["id"]
        raise ValueError(f"method {method} not supported in FakeOdoo")
`;

const FAKE_LLM = String.raw`
class FakeLLM:
    """Stand-in model so examples run offline: returns canned replies in order and records prompts."""
    def __init__(self, replies):
        self.replies, self.prompts = list(replies), []
    def complete(self, prompt):
        self.prompts.append(prompt)
        return self.replies.pop(0)
`;

const INVOICE_MODEL = String.raw`
import re, json
from datetime import date
from pydantic import BaseModel, Field, field_validator, model_validator

GSTIN = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$")

class Line(BaseModel):
    description: str
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)

class Invoice(BaseModel):
    vendor_name: str
    vendor_gstin: str | None = None
    invoice_number: str
    invoice_date: date
    po_number: str | None = None
    currency: str = "INR"
    lines: list[Line] = Field(min_length=1)
    tax_rate: float = Field(ge=0, le=0.28)
    total: float = Field(gt=0)

    @field_validator("vendor_gstin")
    @classmethod
    def gstin_format(cls, v):
        if v is not None and not GSTIN.match(v):
            raise ValueError(f"GSTIN {v!r} has the wrong format")
        return v

    @model_validator(mode="after")
    def totals_add_up(self):
        subtotal = sum(l.quantity * l.unit_price for l in self.lines)
        expected = round(subtotal * (1 + self.tax_rate), 2)
        if abs(expected - self.total) > 1:
            raise ValueError(f"total {self.total} != lines {subtotal} + tax = {expected}")
        return self
`;

const SERVER = ODOO.replace('"""odoo_client.py', '"""server.py (includes the fake Odoo client for the demo)') + String.raw`

from mcp.server.mcpserver import MCPServer

mcp = MCPServer("odoo-ap")
odoo = FakeOdoo()          # real project: OdooClient(url, db, user, api_key) from environment variables

@mcp.tool()
def find_vendor(gstin: str | None = None, name: str | None = None) -> dict:
    """Find a vendor in Odoo by GSTIN (preferred, exact) or by name (partial match).
    Returns {"id", "name", "vat"} or an error if none or several match."""
    if gstin:
        found = odoo.execute_kw("res.partner", "search_read", [[["vat", "=", gstin]]], {"fields": ["name", "vat"]})
    elif name:
        found = odoo.execute_kw("res.partner", "search_read", [[["name", "ilike", name], ["supplier_rank", ">", 0]]], {"fields": ["name", "vat"]})
    else:
        return {"error": "give gstin or name"}
    if len(found) != 1:
        return {"error": f"{len(found)} vendors matched", "candidates": [f["name"] for f in found]}
    return found[0]

@mcp.tool()
def get_purchase_order(po_number: str) -> dict:
    """Get a confirmed purchase order by its number (e.g. P00031): vendor id, total and invoice status."""
    found = odoo.execute_kw("purchase.order", "search_read", [[["name", "=", po_number]]],
                            {"fields": ["name", "partner_id", "amount_total", "state", "invoice_status"]})
    return found[0] if found else {"error": f"purchase order {po_number} not found"}

@mcp.tool()
def create_draft_bill(vendor_id: int, invoice_number: str, invoice_date: str, lines: list[dict],
                      tax_rate: float, po_number: str | None = None) -> dict:
    """Create a DRAFT vendor bill in Odoo (never posts it). Refuses duplicates of the same vendor + invoice number.
    lines: [{"description", "quantity", "unit_price"}]. A human reviews and posts the draft in Odoo."""
    dupes = odoo.execute_kw("account.move", "search_count",
                            [[["move_type", "=", "in_invoice"], ["partner_id", "=", vendor_id], ["ref", "=", invoice_number]]])
    if dupes:
        return {"error": f"bill {invoice_number} already exists for vendor {vendor_id}"}
    bill_id = odoo.execute_kw("account.move", "create", [{
        "move_type": "in_invoice", "partner_id": vendor_id, "ref": invoice_number, "invoice_date": invoice_date,
        "invoice_origin": po_number, "_tax_rate": tax_rate,
        "invoice_line_ids": [{"name": l["description"], "quantity": l["quantity"], "price_unit": l["unit_price"]} for l in lines],
    }])
    bill = odoo.execute_kw("account.move", "search_read", [[["id", "=", bill_id]]], {"fields": ["state", "amount_total", "ref"]})[0]
    return {"bill_id": bill_id, **bill}

if __name__ == "__main__":
    mcp.run()
`;

const POLICY = String.raw`
POLICY_DOCS = {
    "ap-policy#approvals": "Who can approve bills: bills up to 50,000 INR can be approved by the AP lead. Bills above 50,000 INR need the finance manager's approval. Bills above 5,00,000 INR also need the CFO.",
    "ap-policy#matching": "Every bill must match a confirmed purchase order. A difference of up to 1% or 500 INR (whichever is lower) between bill and PO total is accepted; larger differences go to the buyer for review.",
    "ap-policy#payment-terms": "Standard payment terms are 30 days from invoice date. MSME vendors must be paid within 45 days by law. Early payment discounts are taken when the discount is at least 1%.",
    "ap-policy#gst": "Input tax credit can only be claimed if the vendor's GSTIN is valid and the invoice appears in GSTR-2B. Invoices without a GSTIN are booked without input tax credit.",
    "ap-policy#duplicates": "Before booking, check that no bill with the same vendor and invoice number exists. Suspected duplicates are blocked and sent to the AP lead.",
    "travel-policy#hotels": "Hotel stays are reimbursed up to 6,000 INR per night in metro cities and 4,000 INR elsewhere.",
}
`;

module.exports = [
{
 id: "plan",
 title: "Plan the project and repo",
 level: "Project",
 one: "You'll build an <b>accounts-payable agent for Odoo</b>: it reads vendor invoices (PDF/email), extracts and validates them, matches the vendor and purchase order in Odoo through an <b>MCP server</b>, creates <b>draft</b> bills for human approval, answers policy questions with <b>RAG</b>, and proves its quality with an <b>eval report</b>.",
 why: "This is exactly the kind of system forward-deployed and AI engineers build for clients: a real business workflow, an ERP integration, safe automation with humans in control, and measured quality. It's the strongest portfolio project in this platform.",
 steps: [
  { h: "The business problem",
    p: ["An AP clerk at a distributor receives ~400 vendor invoices a month and types each into Odoo: find the vendor, find the PO, enter lines, check totals and GST, avoid duplicates. It takes ~6 minutes per invoice and errors cause wrong payments and lost tax credit.",
        "Goal: the agent prepares correct <b>draft</b> bills automatically for the easy majority, and sends unclear cases to a human with a clear reason. Humans still post (approve) every bill."] },
  { h: "Is it worth it? A quick business case",
    code: `invoices_per_month = 400
minutes_manual = 6
straight_through = 0.70          # target: 70% need no edits
minutes_review_auto = 1          # quick check of a prepared draft
minutes_review_flagged = 5       # flagged cases still need work

manual_hours = invoices_per_month * minutes_manual / 60
auto_hours = (invoices_per_month * straight_through * minutes_review_auto
              + invoices_per_month * (1 - straight_through) * minutes_review_flagged) / 60
print(f"manual: {manual_hours:.0f} h/month, with agent: {auto_hours:.0f} h/month, saved: {manual_hours - auto_hours:.0f} h/month")
print(f"model cost at ~1.5 INR per invoice: {invoices_per_month * 1.5:.0f} INR/month")`,
    note: "Always frame AI work in the client's numbers: hours saved, errors avoided, cost per document." },
  { h: "Architecture",
    code: `invoice PDF/email ──► extraction (LLM → Invoice schema → validation, retry with errors)
                              │ valid
                              ▼
                   AP workflow (deterministic steps, logged):
                     find_vendor ─► get_purchase_order ─► checks (PO match, duplicates, policy)
                              │ all checks pass                │ any check fails
                              ▼                                 ▼
                     create_draft_bill (MCP)            review queue with reasons
                              │
                     human posts the bill in Odoo   ◄── policy Q&A tool (RAG over AP policy)
evals: 50 labelled invoices → field accuracy, straight-through rate, false-accept rate (must be 0)`, lang: "text" },
  { h: "Repo layout",
    code: `odoo-ap-agent/
  README.md                 problem, architecture diagram, demo GIF, eval results, how to run
  pyproject.toml
  .env.example              ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY, LLM_API_KEY
  src/ap_agent/
    extraction.py           Invoice schema + extract_invoice()
    odoo_client.py          JSON-RPC client (execute_kw)
    mcp_server.py           find_vendor, get_purchase_order, create_draft_bill, ask_policy
    workflow.py             process_invoice(): steps, checks, review queue
    rag.py                  policy retrieval + cited answers
    api.py                  FastAPI: POST /invoices, GET /review-queue
  evals/
    invoices/               50 labelled sample invoices (synthetic, no real client data)
    run_evals.py            → evals/report.md
  tests/                    unit tests per module (FakeOdoo, FakeLLM)
  Dockerfile, docker-compose.yml (app + Odoo + Postgres for the demo)`, lang: "text" },
  { h: "Milestones and definition of done",
    code: `1 extraction      schema + validation + retry; 10 sample invoices pass
2 MCP tools       vendor/PO lookup, draft bill; tested in-process
3 workflow        end-to-end on samples; review queue with reasons; full trace log
4 policy RAG      cited answers, refuses when unsure
5 evals           50 invoices; report with accuracy, straight-through rate, false accepts = 0
6 ship            Docker, deploy, README, 3-minute demo video
safety rules      never post or pay; draft only; duplicates blocked; no secrets in Git`, lang: "text" }
 ],
 mistakes: [
  "Starting with an autonomous agent instead of a reliable workflow with one model step.",
  "Letting the agent post or pay bills (keep humans approving).",
  "Using real client invoices in a public repo.",
  "No success metric, so you can't say whether it works."
 ],
 practice: [
  { q: "Recompute the business case for 1,200 invoices/month with a 60% straight-through rate.", code: `n, stp = 1200, 0.60
manual = n * 6 / 60
auto = (n * stp * 1 + n * (1 - stp) * 5) / 60
print(f"saved {manual - auto:.0f} hours/month")` },
  { q: "Write the one-paragraph problem statement for the README.", a: "Example: “Accounts-payable teams spend ~6 minutes per vendor invoice entering it into Odoo and checking vendor, PO, totals, GST and duplicates. This project prepares validated draft bills automatically using an LLM for extraction and an MCP server for Odoo, sends unclear cases to a review queue with reasons, and never posts bills itself. On a 50-invoice eval set it prepares X% of clean bills with no edits and creates zero wrong bills.”" }
 ],
 check: [
  ["Who posts (approves) the bills?", ["The agent", "A human in Odoo", "The vendor", "Nobody"], 1, "Draft only; humans approve."],
  ["Main architecture choice?", ["Fully autonomous agent", "Deterministic workflow with LLM extraction and tool calls", "No validation", "Manual only"], 1, "Reliable and testable."],
  ["Which metric must be zero?", ["Latency", "False accepts (wrong bills created)", "Review queue size", "Tokens"], 1, "Wrong money is worst."]
 ],
 remember: [
  "Real problem: AP data entry in Odoo; measured in hours and errors.",
  "Extraction → workflow with tools → draft bill or review queue.",
  "Humans post; agent never pays.",
  "Milestones end with evals and a shipped demo."
 ]
},
{
 id: "extraction",
 title: "Invoice extraction with validation",
 level: "Project",
 one: "Turn invoice text into a typed <b>Invoice</b> object: ask the model for JSON matching a schema, <b>validate</b> it (formats, totals, required fields), and if it fails, <b>retry with the errors</b>. Anything still invalid goes to a human.",
 why: "Extraction is the step every later step depends on. Validation is what turns a clever demo into something an accountant can trust.",
 steps: [
  { h: "The schema is the contract",
    pre: INVOICE_MODEL,
    code: `print(json.dumps(Invoice.model_json_schema()["required"]))
ok = Invoice(vendor_name="Malabar Office Supplies", vendor_gstin="32AABCM1234F1Z5", invoice_number="MOS-1182",
             invoice_date="2025-07-04", po_number="P00031",
             lines=[{"description": "A4 paper (box)", "quantity": 20, "unit_price": 450},
                    {"description": "Toner", "quantity": 1, "unit_price": 1000}],
             tax_rate=0.18, total=11800)
print(ok.invoice_number, ok.invoice_date, len(ok.lines), "lines, total", ok.total)`,
    note: "Validation rules live in the schema: GSTIN format, positive quantities, and totals that add up (lines + tax = total, within 1 rupee)." },
  { h: "The prompt",
    code: `EXTRACT_PROMPT = """You extract data from vendor invoices for an accounts-payable team.
Return ONLY a JSON object with these fields:
vendor_name, vendor_gstin (15 chars or null), invoice_number, invoice_date (YYYY-MM-DD),
po_number (like P00031, or null), currency, lines [{description, quantity, unit_price}],
tax_rate (0.18 for 18%), total (grand total including tax).
Rules: copy numbers exactly as printed; do not compute missing values; use null if a field is absent.

Invoice:
<invoice>
{text}
</invoice>"""`, lang: "python", run: false },
  { h: "Extract, validate, retry with errors",
    pre: INVOICE_MODEL + FAKE_LLM,
    code: `from pydantic import ValidationError

PROMPT = "Extract the invoice as JSON.\\n<invoice>\\n{text}\\n</invoice>"

def extract_invoice(llm, text, max_attempts=2):
    prompt = PROMPT.format(text=text)
    for attempt in range(1, max_attempts + 1):
        raw = llm.complete(prompt)
        try:
            return {"status": "ok", "invoice": Invoice.model_validate_json(raw), "attempts": attempt}
        except ValidationError as e:
            errors = [f"{'.'.join(map(str, x['loc'])) or 'invoice'}: {x['msg']}" for x in e.errors()]
            prompt += "\\n\\nYour previous answer was invalid:\\n- " + "\\n- ".join(errors) + "\\nReturn corrected JSON only."
    return {"status": "needs_review", "errors": errors, "attempts": max_attempts}

text = "MALABAR OFFICE SUPPLIES  GSTIN 32AABCM1234F1Z5  Invoice MOS-1182 dated 04/07/2025  PO: P00031 ..."
first = '{"vendor_name": "Malabar Office Supplies", "vendor_gstin": "32AABCM1234F1Z5", "invoice_number": "MOS-1182", "invoice_date": "2025-07-04", "po_number": "P00031", "lines": [{"description": "A4 paper (box)", "quantity": 20, "unit_price": 450}, {"description": "Toner", "quantity": 1, "unit_price": 1000}], "tax_rate": 0.18, "total": 11180}'
second = first.replace('"total": 11180', '"total": 11800')
llm = FakeLLM([first, second])
result = extract_invoice(llm, text)
print(result["status"], "after", result["attempts"], "attempts:", result["invoice"].invoice_number, result["invoice"].total)
print("feedback sent on retry:", llm.prompts[1].split("invalid:")[1].strip().splitlines()[0])`,
    note: "The first answer had swapped digits in the total (11180). Validation caught it, and the model fixed it when shown the exact error." },
  { h: "When it still fails: human review",
    pre: INVOICE_MODEL + FAKE_LLM,
    code: `from pydantic import ValidationError

def extract_invoice(llm, text, max_attempts=2):
    prompt = text
    for attempt in range(1, max_attempts + 1):
        try:
            return {"status": "ok", "invoice": Invoice.model_validate_json(llm.complete(prompt))}
        except ValidationError as e:
            errors = [f"{'.'.join(map(str, x['loc'])) or 'invoice'}: {x['msg']}" for x in e.errors()]
            prompt += "\\nErrors: " + "; ".join(errors)
    return {"status": "needs_review", "errors": errors}

bad = '{"vendor_name": "Gulf Packaging", "vendor_gstin": "GULF-123", "invoice_number": "GP-77", "invoice_date": "2025-07-03", "lines": [{"description": "Cartons", "quantity": 0, "unit_price": 20}], "tax_rate": 0.05, "total": 0}'
result = extract_invoice(FakeLLM([bad, bad]), "scanned invoice text ...")
print(result["status"])
for err in result["errors"]:
    print(" -", err)`,
    note: "Never “fix” values silently in code. Unclear invoices go to the review queue with the exact reasons, so the clerk knows what to check." },
  { h: "Getting text out of PDFs",
    p: ["Digital PDFs: extract text with <code>pypdf</code> or <code>pdfplumber</code> (tables). Scanned PDFs or photos: send the page image to a vision-capable model, or OCR first. Keep the original file and the extracted text together for audits and evals."],
    code: `# pip install pdfplumber
import pdfplumber

def pdf_text(path: str) -> str:
    with pdfplumber.open(path) as pdf:
        return "\\n".join(page.extract_text() or "" for page in pdf.pages)`, lang: "python", run: false }
 ],
 mistakes: [
  "Trusting the model's JSON without schema validation.",
  "Letting the model compute missing totals (it should copy, code should check).",
  "Retrying without telling the model what was wrong.",
  "Silently correcting values instead of flagging them."
 ],
 practice: [
  { q: "Add a rule: invoice_date can't be in the future (use 2025-07-06 as today) and test it.", pre: INVOICE_MODEL, code: `from pydantic import ValidationError, field_validator
from datetime import date

class StrictInvoice(Invoice):
    @field_validator("invoice_date")
    @classmethod
    def not_future(cls, v):
        if v > date(2025, 7, 6):
            raise ValueError("invoice_date is in the future")
        return v

base = dict(vendor_name="X", invoice_number="1", lines=[{"description": "a", "quantity": 1, "unit_price": 100}], tax_rate=0.18, total=118)
for d in ["2025-07-01", "2026-01-01"]:
    try:
        StrictInvoice(invoice_date=d, **base); print(d, "ok")
    except ValidationError as e:
        print(d, "->", e.errors()[0]["msg"])` },
  { q: "Check these GSTINs against the format: 32AABCM1234F1Z5, 29AADCD5678K1Z2, 27ABCDE1234F1Y5, GULF-123", pre: INVOICE_MODEL, code: `for g in ["32AABCM1234F1Z5", "29AADCD5678K1Z2", "27ABCDE1234F1Y5", "GULF-123"]:
    print(g, bool(GSTIN.match(g)))` }
 ],
 check: [
  ["What catches a total with swapped digits?", ["The prompt", "A validator checking lines + tax = total", "Luck", "The PDF"], 1, "Business rules in code."],
  ["What should the retry prompt include?", ["Nothing new", "The exact validation errors", "A threat", "The answer"], 1, "Specific feedback."],
  ["After the last failed attempt…", ["Guess the values", "Send to human review with reasons", "Drop the invoice", "Post anyway"], 1, "Humans handle unclear cases."]
 ],
 remember: [
  "Pydantic schema = contract + validation (formats, totals).",
  "Model copies values; code checks them.",
  "Retry with exact errors, then human review.",
  "Keep original file + text for audit and evals."
 ]
},
{
 id: "mcp-tools",
 title: "Odoo MCP tools: vendors, POs, draft bills",
 level: "Project",
 one: "Expose Odoo to the agent through a small <b>MCP server</b> with specific, safe tools: <code>find_vendor</code>, <code>get_purchase_order</code> and <code>create_draft_bill</code> (draft only, duplicates refused). Under the hood they call Odoo's <b>execute_kw</b> JSON-RPC API.",
 why: "MCP makes your Odoo integration reusable by any AI host (Claude Desktop, your agent, IDEs). Narrow tools with built-in safety rules are what make it acceptable to a finance team.",
 steps: [
  { h: "Talking to Odoo: execute_kw",
    p: ["Odoo's external API is JSON-RPC: authenticate once to get a user id, then call <code>execute_kw(db, uid, api_key, model, method, args, kwargs)</code>. A minimal real client:"],
    code: `import httpx

class OdooClient:
    def __init__(self, url, db, user, api_key):
        self.url, self.db, self.api_key = url.rstrip("/"), db, api_key
        self.http = httpx.Client(timeout=30)
        self.uid = self._call("common", "authenticate", [db, user, api_key, {}])

    def _call(self, service, method, args):
        r = self.http.post(f"{self.url}/jsonrpc", json={"jsonrpc": "2.0", "method": "call",
                           "params": {"service": service, "method": method, "args": args}})
        r.raise_for_status()
        body = r.json()
        if body.get("error"):
            raise RuntimeError(body["error"]["data"]["message"])
        return body["result"]

    def execute_kw(self, model, method, args, kwargs=None):
        return self._call("object", "execute_kw", [self.db, self.uid, self.api_key, model, method, args, kwargs or {}])

# odoo = OdooClient(os.environ["ODOO_URL"], os.environ["ODOO_DB"], os.environ["ODOO_USER"], os.environ["ODOO_API_KEY"])
# odoo.execute_kw("res.partner", "search_read", [[["vat", "=", "32AABCM1234F1Z5"]]], {"fields": ["name"]})`, lang: "python", run: false,
    note: "The examples below use <b>FakeOdoo</b>, an in-memory class with the same <code>execute_kw</code> shape, so they run anywhere. Swap it for OdooClient against a real (test) database." },
  { h: "The MCP server",
    code: SERVER, run: false,
    note: "Docstrings tell the model when to use each tool. Safety lives in the tools, not the prompt: drafts only, duplicate check, exact GSTIN match preferred." },
  { h: "Call the tools in-process",
    files: { "server.py": SERVER },
    pre: "import sys; sys.path.insert(0, '.')",
    code: `import asyncio, json
from server import mcp

async def call(name, args):
    r = await mcp.call_tool(name, args)
    return json.loads(r.content[0].text)

async def main():
    print(await call("find_vendor", {"gstin": "32AABCM1234F1Z5"}))
    print(await call("find_vendor", {"name": "traders"}))
    print(await call("find_vendor", {"name": "zzz"}))
    print(await call("get_purchase_order", {"po_number": "P00031"}))
    lines = [{"description": "A4 paper (box)", "quantity": 20, "unit_price": 450}, {"description": "Toner", "quantity": 1, "unit_price": 1000}]
    print(await call("create_draft_bill", {"vendor_id": 7, "invoice_number": "MOS-1182", "invoice_date": "2025-07-04",
                                           "lines": lines, "tax_rate": 0.18, "po_number": "P00031"}))
    print(await call("create_draft_bill", {"vendor_id": 7, "invoice_number": "MOS-1182", "invoice_date": "2025-07-04",
                                           "lines": lines, "tax_rate": 0.18}))

asyncio.run(main())` },
  { h: "Tests for the tools",
    files: { "server.py": SERVER },
    pre: "import sys; sys.path.insert(0, '.')",
    code: `import asyncio, json, importlib
import server

def call(name, args):
    importlib.reload(server)                       # fresh FakeOdoo per test
    async def go():
        return json.loads((await server.mcp.call_tool(name, args)).content[0].text)
    return asyncio.run(go())

def test_vendor_by_gstin_is_exact():
    assert call("find_vendor", {"gstin": "29AADCD5678K1Z2"})["name"] == "Deccan Tech Traders"

def test_ambiguous_name_returns_candidates():
    r = call("find_vendor", {"name": "a"})
    assert "error" in r and len(r["candidates"]) > 1

def test_bill_is_always_draft():
    r = call("create_draft_bill", {"vendor_id": 7, "invoice_number": "X-1", "invoice_date": "2025-07-04",
                                   "lines": [{"description": "a", "quantity": 1, "unit_price": 100}], "tax_rate": 0.18})
    assert r["state"] == "draft" and r["amount_total"] == 118.0

def test_existing_bill_is_refused():
    r = call("create_draft_bill", {"vendor_id": 8, "invoice_number": "DT/2025/0098", "invoice_date": "2025-07-01",
                                   "lines": [{"description": "a", "quantity": 1, "unit_price": 100}], "tax_rate": 0.18})
    assert "already exists" in r["error"]`, test: true },
  { h: "Connecting it to a host",
    code: `// Claude Desktop: claude_desktop_config.json
{
  "mcpServers": {
    "odoo-ap": {
      "command": "python",
      "args": ["-m", "ap_agent.mcp_server"],
      "env": {"ODOO_URL": "https://test.mycompany.odoo.com", "ODOO_DB": "test",
              "ODOO_USER": "ap-bot@mycompany.com", "ODOO_API_KEY": "<from a secrets manager>"}
    }
  }
}`, lang: "json",
    note: "Use a dedicated Odoo user for the bot with only the access rights it needs (read partners/POs, create draft bills), and a test database for the demo." }
 ],
 mistakes: [
  "A generic “execute any Odoo method” tool (the model could delete records).",
  "Safety rules only in the prompt instead of inside the tools.",
  "Using an admin Odoo user for the bot.",
  "Fuzzy vendor matching that silently picks the first of several results."
 ],
 practice: [
  { q: "Add a tool <code>vendor_open_pos(vendor_id)</code> that lists confirmed POs still 'to invoice' for a vendor, and call it.", files: { "server.py": SERVER }, pre: "import sys; sys.path.insert(0, '.')", code: `import asyncio, json
from server import mcp, odoo

@mcp.tool()
def vendor_open_pos(vendor_id: int) -> list[dict]:
    """List confirmed purchase orders for a vendor that are not fully invoiced yet."""
    return odoo.execute_kw("purchase.order", "search_read",
                           [[["partner_id", "=", vendor_id], ["state", "=", "purchase"], ["invoice_status", "=", "to invoice"]]],
                           {"fields": ["name", "amount_total"]})

async def main():
    r = await mcp.call_tool("vendor_open_pos", {"vendor_id": 7})
    print(r.structured_content["result"])
asyncio.run(main())` },
  { q: "Which Odoo access rights should the bot user have, and which should it not?", a: "Read: res.partner (vendors), purchase.order, account.move (to check duplicates). Create: account.move drafts (vendor bills) and their lines. Not: posting/validating bills, payments, deleting records, editing vendors or bank accounts, settings/admin. Use a dedicated user and a test database first." }
 ],
 check: [
  ["Odoo's external API call for model methods is…", ["GET /records", "execute_kw over JSON-RPC/XML-RPC", "SOAP only", "SQL"], 1, "execute_kw(db, uid, key, model, method, args, kwargs)."],
  ["Where should 'draft only' be enforced?", ["In the prompt", "Inside the create_draft_bill tool", "In the README", "Nowhere"], 1, "Code, not words."],
  ["Name search matches 3 vendors. The tool should…", ["Pick the first", "Return an error with the candidates", "Create a new vendor", "Crash"], 1, "Never guess."]
 ],
 remember: [
  "OdooClient: authenticate, then execute_kw(model, method, args, kwargs).",
  "Narrow MCP tools with docstrings and type hints.",
  "Safety in tools: draft only, duplicate check, exact matches.",
  "Dedicated least-privilege Odoo user; test DB for demos."
 ]
},
{
 id: "agent",
 title: "The agent end to end",
 level: "Project",
 one: "Wire it together: a <b>workflow</b> that extracts the invoice, finds the vendor, matches the PO, runs policy checks, and either creates a draft bill or sends the case to a <b>review queue</b> with reasons, logging every step as a <b>trace</b>.",
 why: "A predictable, traceable workflow is what gets approved by a finance team. You'll also see where a small agent step adds value (explaining exceptions) without giving up control.",
 steps: [
  { h: "Workflow first, agent where needed",
    p: ["The happy path is always the same steps, so code them directly: fast, cheap, testable. Use the model where judgment is needed: extraction (done), and writing a short, helpful explanation for exceptions. Each step is recorded so a human can see exactly why a decision was made."] },
  { h: "The workflow, running on three invoices",
    files: { "odoo_client.py": ODOO },
    pre: "import sys; sys.path.insert(0, '.')\n" + INVOICE_MODEL,
    code: `from odoo_client import FakeOdoo

odoo = FakeOdoo()
REVIEW_QUEUE = []

def match_tolerance(po_total):                        # AP policy: 1% or 500 INR, whichever is lower
    return min(po_total * 0.01, 500)

def process_invoice(inv: Invoice):
    trace = [f"extracted {inv.invoice_number} from {inv.vendor_name}, total {inv.total:,.0f}"]
    def review(reason):
        trace.append(f"REVIEW: {reason}")
        REVIEW_QUEUE.append({"invoice": inv.invoice_number, "reason": reason})
        return {"status": "needs_review", "trace": trace}

    domain = [["vat", "=", inv.vendor_gstin]] if inv.vendor_gstin else [["name", "ilike", inv.vendor_name]]
    vendors = odoo.execute_kw("res.partner", "search_read", [domain], {"fields": ["name"]})
    if len(vendors) != 1:
        return review(f"vendor not found uniquely ({len(vendors)} matches)")
    vendor = vendors[0]; trace.append(f"vendor -> {vendor['name']} (id {vendor['id']})")

    if not inv.po_number:
        return review("no PO number on the invoice")
    pos = odoo.execute_kw("purchase.order", "search_read", [[["name", "=", inv.po_number]]], {})
    if not pos:
        return review(f"PO {inv.po_number} not found")
    po = pos[0]
    if po["partner_id"] != vendor["id"]:
        return review(f"PO {po['name']} belongs to another vendor")
    if po["invoice_status"] != "to invoice":
        return review(f"PO {po['name']} is already invoiced")
    diff = abs(po["amount_total"] - inv.total)
    if diff > match_tolerance(po["amount_total"]):
        return review(f"total {inv.total:,.0f} differs from PO {po['amount_total']:,.0f} by {diff:,.0f}")
    trace.append(f"PO {po['name']} matched (difference {diff:,.0f})")

    if odoo.execute_kw("account.move", "search_count", [[["partner_id", "=", vendor["id"]], ["ref", "=", inv.invoice_number]]]):
        return review("possible duplicate: bill with this number already exists")

    bill_id = odoo.execute_kw("account.move", "create", [{"move_type": "in_invoice", "partner_id": vendor["id"],
        "ref": inv.invoice_number, "invoice_origin": po["name"], "_tax_rate": inv.tax_rate,
        "invoice_line_ids": [{"name": l.description, "quantity": l.quantity, "price_unit": l.unit_price} for l in inv.lines]}])
    trace.append(f"draft bill {bill_id} created; waiting for human approval")
    return {"status": "draft_created", "bill_id": bill_id, "trace": trace}

invoices = [
    Invoice(vendor_name="Malabar Office Supplies", vendor_gstin="32AABCM1234F1Z5", invoice_number="MOS-1182", invoice_date="2025-07-04",
            po_number="P00031", lines=[{"description": "A4 paper", "quantity": 20, "unit_price": 450}, {"description": "Toner", "quantity": 1, "unit_price": 1000}],
            tax_rate=0.18, total=11800),
    Invoice(vendor_name="Deccan Tech Traders", vendor_gstin="29AADCD5678K1Z2", invoice_number="DT/2025/0131", invoice_date="2025-07-05",
            po_number="P00032", lines=[{"description": "Laptop", "quantity": 1, "unit_price": 52000}], tax_rate=0.18, total=61360),
    Invoice(vendor_name="Gulf Packaging", invoice_number="GP-77", invoice_date="2025-07-03", po_number=None,
            lines=[{"description": "Cartons", "quantity": 100, "unit_price": 20}], tax_rate=0.05, total=2100),
]
for inv in invoices:
    result = process_invoice(inv)
    print(f"== {inv.invoice_number}: {result['status']}")
    for line in result["trace"]:
        print("   ", line)
print("review queue:", REVIEW_QUEUE)` },
  { h: "A small agent step: explain the exception",
    p: ["For review cases, a model can turn the trace into a short note for the AP clerk, with a suggested next action. It only writes text; it can't change Odoo."],
    pre: FAKE_LLM,
    code: `trace = ["extracted DT/2025/0131 from Deccan Tech Traders, total 61,360",
         "vendor -> Deccan Tech Traders (id 8)",
         "REVIEW: total 61,360 differs from PO 59,000 by 2,360"]
prompt = ("Write a 2-sentence note for an accounts-payable clerk explaining why this invoice needs review "
          "and the most likely next step. Use only facts from the trace.\\n\\nTrace:\\n" + "\\n".join(trace))
llm = FakeLLM(["Deccan Tech Traders' invoice DT/2025/0131 is 2,360 INR (4%) above PO P00032, beyond the 500 INR tolerance. "
               "Check with the buyer whether the price changed or an extra item was delivered before booking it."])
print(llm.complete(prompt))`,
    note: "Ground the note in the trace only, and keep the decision (review) in code. The model makes the exception easier to handle, not riskier." },
  { h: "Traces and observability",
    p: ["Store each run: input file hash, extracted JSON, every tool call with arguments and result, decision, model name and prompt version, tokens and cost, latency. Langfuse, LangSmith or OpenTelemetry work well; a Postgres table is enough to start. Traces are what you show the client when they ask “why did it do that?”"] }
 ],
 mistakes: [
  "Letting a model decide whether to create a bill.",
  "No trace, so nobody can explain a decision later.",
  "Comparing totals with exact equality (rounding) or with no tolerance policy.",
  "Review queue entries without reasons."
 ],
 practice: [
  { q: "Add a rule: bills above 50,000 INR are created as drafts but flagged 'needs finance manager approval' in the result.", a: "After creating the draft: <code>if inv.total &gt; 50_000: trace.append(\"needs finance manager approval (policy: above 50,000 INR)\"); result[\"approval\"] = \"finance_manager\"</code>. Keep it in code and cite the policy section in the trace." },
  { q: "Compute the match tolerance for PO totals of 11,800, 59,000 and 2,00,000.", code: `for po in [11_800, 59_000, 200_000]:
    print(po, "->", min(po * 0.01, 500))` }
 ],
 check: [
  ["Who decides draft vs review?", ["The model", "Deterministic code following policy", "The vendor", "Random"], 1, "Predictable and auditable."],
  ["What is the model allowed to do in exceptions?", ["Post bills", "Write an explanation from the trace", "Change PO totals", "Delete bills"], 1, "Text only."],
  ["Why keep a trace per invoice?", ["Disk space", "Explain and audit every decision", "Speed", "Required by Python"], 1, "Trust."]
 ],
 remember: [
  "Workflow: extract → vendor → PO → checks → draft or review.",
  "Tolerance and duplicate rules from the AP policy, in code.",
  "Model explains exceptions; code decides.",
  "Trace every step."
 ]
},
{
 id: "rag-tool",
 title: "Policy Q&A with RAG",
 level: "Project",
 one: "Add a tool that answers AP policy questions (“who approves a 70,000 INR bill?”) from the company's policy documents: <b>retrieve</b> the relevant sections, answer <b>only from them</b> with <b>citations</b>, and say “not in the policy” when retrieval finds nothing relevant.",
 why: "Clerks and the agent constantly need policy answers. Grounded, cited answers build trust; refusing when unsure prevents confident wrong guidance.",
 steps: [
  { h: "Retrieve the right sections",
    pre: POLICY,
    code: `import re
from rank_bm25 import BM25Okapi

ids = list(POLICY_DOCS)
tokenize = lambda t: re.findall(r"[a-z0-9]+", t.lower())
bm25 = BM25Okapi([tokenize(POLICY_DOCS[i]) for i in ids])

def retrieve(question, k=2, min_score=1.0):
    scores = bm25.get_scores(tokenize(question))
    ranked = sorted(zip(ids, scores), key=lambda x: -x[1])[:k]
    return [(doc_id, round(float(s), 2)) for doc_id, s in ranked if s >= min_score]

for q in ["Who must approve a bill of 70,000 INR?", "How many days to pay an MSME vendor?", "What is the WiFi password?"]:
    print(q, "->", retrieve(q))`,
    note: "The WiFi question retrieves nothing above the threshold, so the tool will say it's not covered instead of guessing." },
  { h: "Answer with citations, or refuse",
    pre: POLICY + FAKE_LLM,
    code: `import re
from rank_bm25 import BM25Okapi

ids = list(POLICY_DOCS)
tokenize = lambda t: re.findall(r"[a-z0-9]+", t.lower())
bm25 = BM25Okapi([tokenize(POLICY_DOCS[i]) for i in ids])

def ask_policy(llm, question):
    scores = bm25.get_scores(tokenize(question))
    hits = [i for i, s in sorted(zip(ids, scores), key=lambda x: -x[1])[:2] if s >= 1.0]
    if not hits:
        return "This isn't covered in the AP policy documents I have. Please ask the AP lead."
    context = "\\n".join(f"[{i}] {POLICY_DOCS[i]}" for i in hits)
    prompt = ("Answer the question using ONLY the sources below. Cite sources like [id]. "
              "If the sources don't answer it, say so.\\n\\n" + context + "\\n\\nQuestion: " + question)
    answer = llm.complete(prompt)
    cited = set(re.findall(r"\\[([^\\]]+)\\]", answer))
    if not cited or not cited <= set(hits):
        return "I couldn't produce a properly cited answer; please check the policy directly."
    return answer

llm = FakeLLM(["A 70,000 INR bill is above 50,000 INR, so it needs the finance manager's approval [ap-policy#approvals]."])
print(ask_policy(llm, "Who must approve a bill of 70,000 INR?"))
print(ask_policy(FakeLLM([]), "What is the WiFi password?"))
print(ask_policy(FakeLLM(["You need the CFO's approval [travel-policy#hotels]."]), "Who approves bills above 50,000 INR?"))`,
    note: "The third answer cited a source that wasn't retrieved for that question, so it was rejected. Checking citations in code catches made-up references." },
  { h: "Expose it as an MCP tool",
    code: `@mcp.tool()
def ask_policy(question: str) -> str:
    """Answer a question about the accounts-payable policy (approvals, PO matching tolerance,
    payment terms, GST input credit, duplicates). Answers cite policy sections like [ap-policy#approvals].
    Says so when the policy doesn't cover the question."""
    return answer_from_policy(llm, question)`, lang: "python", run: false },
  { h: "Keeping the knowledge fresh",
    p: ["Load policy documents from where finance maintains them (SharePoint/Drive/Notion), chunk by heading, store section ids and the document version/date, and re-index on change. Show the version in answers (“AP policy v3, April 2025”). For larger document sets, add embeddings (hybrid search) as in the RAG course."] }
 ],
 mistakes: [
  "Answering from the model's general knowledge when retrieval found nothing.",
  "Not checking that citations point to retrieved sections.",
  "Chunks that cut a rule in half (chunk by heading/section).",
  "Stale policy copies with no version shown."
 ],
 practice: [
  { q: "Which sections does retrieval return for “Can we claim GST credit if the vendor has no GSTIN?”", pre: POLICY, code: `import re
from rank_bm25 import BM25Okapi
ids = list(POLICY_DOCS)
tok = lambda t: re.findall(r"[a-z0-9]+", t.lower())
bm25 = BM25Okapi([tok(POLICY_DOCS[i]) for i in ids])
scores = bm25.get_scores(tok("Can we claim GST credit if the vendor has no GSTIN?"))
print([(i, round(float(s), 2)) for i, s in sorted(zip(ids, scores), key=lambda x: -x[1])[:2]])` },
  { q: "Write 5 test questions for the policy tool, including 2 that should be refused.", a: "Answerable: “Who approves a 6,00,000 INR bill?” (finance manager + CFO, [ap-policy#approvals]); “What difference from the PO is accepted on a 20,000 INR bill?” (200 INR, [ap-policy#matching]); “When must MSME vendors be paid?” (45 days, [ap-policy#payment-terms]). Refuse: “What's our office address?”; “Can I expense a laptop bag?” (not in AP policy)." }
 ],
 check: [
  ["Retrieval finds nothing relevant. The tool should…", ["Guess", "Say it's not covered and point to a person", "Use the first document anyway", "Crash"], 1, "Refuse safely."],
  ["How do you catch invented citations?", ["Trust the model", "Check cited ids are among retrieved ids", "Ask again", "Ignore"], 1, "Verify in code."],
  ["Best chunking for policies?", ["Fixed 100 characters", "By section/heading with ids", "Whole document", "Random"], 1, "Keep rules intact."]
 ],
 remember: [
  "Retrieve (BM25/hybrid) with a relevance threshold.",
  "Answer only from sources, cite [section ids].",
  "Verify citations in code; refuse when unsure.",
  "Version and re-index policies when they change."
 ]
},
{
 id: "evals",
 title: "Eval set: 50 invoices",
 level: "Project",
 one: "Prove the agent works with an <b>eval set</b> of 50 labelled invoices: measure <b>field accuracy</b>, <b>straight-through rate</b> (drafts needing no edits), <b>review precision</b> and, most importantly, <b>false accepts</b> (wrong bills created), which must be zero. Re-run it on every change.",
 why: "Clients and interviewers ask “how do you know it works?”. A reproducible eval with clear metrics is the answer, and it catches regressions when you change prompts or models.",
 steps: [
  { h: "Build a labelled set",
    p: ["Create 50 synthetic invoices that cover real variety: clean ones, wrong totals, missing PO, unknown vendor, duplicates, PO mismatches, different layouts. Each has the <b>expected fields</b> and the <b>expected decision</b> (draft or review + reason). Here we generate them, and a simulated extractor makes realistic mistakes on some:"],
    code: `import random
random.seed(7)

def make_eval_set(n=50):
    cases = []
    for i in range(n):
        kind = random.choices(["clean", "wrong_total", "no_po", "po_mismatch", "duplicate"], [30, 6, 5, 5, 4])[0]
        total = random.choice([11800, 59000])
        cases.append({"id": f"inv-{i:02d}", "kind": kind, "true_total": total,
                      "expected": "draft" if kind == "clean" else "review"})
    return cases

cases = make_eval_set()
from collections import Counter
print(Counter(c["kind"] for c in cases))
print(Counter(c["expected"] for c in cases))` },
  { h: "Run the pipeline and score it",
    code: `import random
from collections import Counter
random.seed(7)

def make_eval_set(n=50):
    out = []
    for i in range(n):
        kind = random.choices(["clean", "wrong_total", "no_po", "po_mismatch", "duplicate"], [30, 6, 5, 5, 4])[0]
        out.append({"id": f"inv-{i:02d}", "kind": kind, "true_total": random.choice([11800, 59000]),
                    "expected": "draft" if kind == "clean" else "review"})
    return out

def extractor(case, error_rate):                 # simulated model: sometimes misreads the total
    misread = random.random() < error_rate
    total = case["true_total"] + (9 if misread else 0) if case["kind"] != "wrong_total" else case["true_total"] * 1.1
    return {"total": total, "misread": misread}

def pipeline(case, extracted):
    lines_total = case["true_total"]             # validator recomputes from line items
    if abs(extracted["total"] - lines_total) > 1:
        return "review", "total mismatch"
    if case["kind"] == "no_po": return "review", "no PO"
    if case["kind"] == "po_mismatch": return "review", "PO mismatch"
    if case["kind"] == "duplicate": return "review", "duplicate"
    return "draft", ""

def run_eval(error_rate, seed):
    random.seed(seed); cases = make_eval_set()
    random.seed(seed + 1)
    rows = []
    for c in cases:
        ex = extractor(c, error_rate)
        decision, reason = pipeline(c, ex)
        rows.append({**c, "decision": decision, "reason": reason, "field_ok": not ex["misread"]})
    n = len(rows)
    clean = [r for r in rows if r["expected"] == "draft"]
    return {
        "field accuracy (total)": sum(r["field_ok"] for r in rows) / n,
        "straight-through rate": sum(r["decision"] == "draft" for r in clean) / len(clean),
        "review recall (bad cases caught)": sum(r["decision"] == "review" for r in rows if r["expected"] == "review")
                                            / sum(r["expected"] == "review" for r in rows),
        "false accepts (wrong drafts)": sum(r["decision"] == "draft" and r["expected"] == "review" for r in rows),
    }

for name, err in [("prompt v1", 0.15), ("prompt v2", 0.05)]:
    print(name, {k: (round(v, 2) if isinstance(v, float) else v) for k, v in run_eval(err, seed=7).items()})`,
    note: "Prompt v2 misreads fewer totals, so more clean invoices go straight through. Both versions have zero false accepts because validation and PO checks catch every bad case: that's the safety property you report first." },
  { h: "Tests that guard the safety property",
    code: `def decide(extracted_total, line_total, po_total, has_po=True, duplicate=False):
    if abs(extracted_total - line_total) > 1: return "review"
    if not has_po: return "review"
    if abs(po_total - line_total) > min(po_total * 0.01, 500): return "review"
    if duplicate: return "review"
    return "draft"

def test_clean_invoice_goes_straight_through():
    assert decide(11800, 11800, 11800) == "draft"

def test_misread_total_never_becomes_a_draft():
    assert decide(11809, 11800, 11800) == "review"

def test_po_difference_over_tolerance_is_reviewed():
    assert decide(61360, 61360, 59000) == "review"

def test_small_rounding_difference_is_accepted():
    assert decide(11800.4, 11800, 11800) == "draft"

def test_duplicates_are_reviewed():
    assert decide(11800, 11800, 11800, duplicate=True) == "review"`, test: true },
  { h: "The eval report",
    code: `# Eval report: odoo-ap-agent  (evals/report.md, generated by evals/run_evals.py)
model: claude-sonnet-x · prompt: extract_v2 · date: 2025-07-06 · cases: 50

| metric                         | v1    | v2    | target |
|--------------------------------|-------|-------|--------|
| field accuracy (all fields)    | 0.80  | 0.98  | ≥ 0.95 |
| straight-through rate          | 0.78  | 0.97  | ≥ 0.70 |
| review recall (bad cases)      | 1.00  | 1.00  | 1.00   |
| false accepts (wrong drafts)   | 0     | 0     | 0      |
| median latency / cost per inv. | 4.1s / ₹1.4 | 3.8s / ₹1.2 |  |

failures to look at: inv-17 (handwritten date), inv-31 (two PO numbers) → added to prompt examples`, lang: "markdown",
    note: "Put the real numbers from your run in the README. A table like this is worth more in an interview than any slide." }
 ],
 mistakes: [
  "Judging quality by trying a few invoices by hand.",
  "An eval set with only clean cases (no traps).",
  "Reporting accuracy but not false accepts (the costly error).",
  "Changing prompts/models without re-running the evals."
 ],
 practice: [
  { q: "Add a metric: average reviews per day if 400 invoices/month arrive and the straight-through rate is 0.97 (assume 22 working days and the same mix as the eval set: 60% clean).", code: `monthly, clean_share, stp = 400, 0.60, 0.97
reviews = monthly * (1 - clean_share) + monthly * clean_share * (1 - stp)
print(f"{reviews:.0f} reviews/month = {reviews / 22:.1f} per working day")` },
  { q: "Your new model version raises straight-through to 0.97 but creates 1 false accept. Ship it?", a: "No. A wrong draft that could be posted is the costly error; the safety target is zero. Investigate the failing case, add a validation or check that catches it (and a test), re-run the evals, and only ship when false accepts are back to 0." }
 ],
 check: [
  ["Most important metric for this agent?", ["Latency", "False accepts (wrong bills created) = 0", "Tokens", "Number of tools"], 1, "Money safety first."],
  ["Straight-through rate means…", ["All invoices", "Clean invoices turned into correct drafts without edits", "Reviews", "Errors"], 1, "Automation value."],
  ["When should evals run?", ["Once", "On every prompt/model/code change (CI)", "Yearly", "Never"], 1, "Catch regressions."]
 ],
 remember: [
  "50 labelled cases with traps (wrong totals, no PO, mismatches, duplicates).",
  "Metrics: field accuracy, straight-through, review recall, false accepts.",
  "False accepts must be 0.",
  "Report table in README; re-run on every change."
 ]
},
{
 id: "ship",
 title: "Ship: deploy, README, demo video",
 level: "Project",
 one: "Package it like a product: a small <b>FastAPI</b> service (upload invoice → result + trace), a <b>Docker</b> image, configuration via environment variables, a clear <b>README</b> with eval results, a deployed demo, and a <b>3-minute video</b> showing the happy path and an exception.",
 why: "A shipped, documented project is what recruiters and clients actually look at. The demo video is often the first (and only) thing they watch.",
 steps: [
  { h: "The API",
    code: `from fastapi import FastAPI, UploadFile
from fastapi.testclient import TestClient

app = FastAPI(title="Odoo AP agent")
REVIEW_QUEUE: list[dict] = []

def process_text(text: str) -> dict:                  # real app: extract_invoice → process_invoice
    if "P000" not in text:
        result = {"status": "needs_review", "reason": "no PO number on the invoice"}
        REVIEW_QUEUE.append(result)
        return result
    return {"status": "draft_created", "bill_id": 502}

@app.post("/invoices")
async def upload_invoice(file: UploadFile):
    text = (await file.read()).decode(errors="ignore")
    return {"file": file.filename, **process_text(text)}

@app.get("/review-queue")
def review_queue():
    return REVIEW_QUEUE

@app.get("/health")
def health():
    return {"ok": True}

client = TestClient(app)
print(client.post("/invoices", files={"file": ("mos-1182.txt", b"Invoice MOS-1182 PO: P00031 ...")}).json())
print(client.post("/invoices", files={"file": ("gp-77.txt", b"Invoice GP-77, no order reference")}).json())
print(client.get("/review-queue").json())` },
  { h: "Dockerfile and config",
    code: `FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .
COPY src/ src/
ENV PYTHONUNBUFFERED=1
USER nobody
CMD ["uvicorn", "ap_agent.api:app", "--host", "0.0.0.0", "--port", "8000"]

# .env.example (copy to .env, never commit .env)
# ODOO_URL=https://test.mycompany.odoo.com
# ODOO_DB=test
# ODOO_USER=ap-bot@mycompany.com
# ODOO_API_KEY=
# LLM_API_KEY=
# PROMPT_VERSION=extract_v2`, lang: "dockerfile" },
  { h: "Deploy a demo",
    code: `docker compose up            # app + Odoo + Postgres locally, seeded with demo vendors and POs
# public demo: deploy the app to Render / Fly.io / Railway / a small VM,
# pointing at an Odoo test database (Odoo.sh staging or odoo.com trial) with fake data only
# protect it: basic auth or an API key; rate limit uploads; never connect a real client DB`, lang: "bash" },
  { h: "README that sells it",
    code: `# Odoo AP Agent
Turns vendor invoices into validated draft bills in Odoo. Humans approve; the agent never posts or pays.

▶ 3-minute demo video · live demo (test data) · eval report

## Results (50-invoice eval set)
straight-through 97% · field accuracy 98% · false accepts 0 · ₹1.2 / invoice

## How it works
[architecture diagram] extraction (schema + validation + retry) → Odoo MCP tools → policy checks →
draft bill or review queue with reasons · policy Q&A with cited answers

## Safety
draft only · duplicate check · PO tolerance from policy · least-privilege Odoo user · full trace per invoice

## Run it
cp .env.example .env && docker compose up · pytest · python evals/run_evals.py

## What I'd do next
vision model for scanned invoices · GSTR-2B reconciliation · Slack approvals`, lang: "markdown" },
  { h: "The demo video (3 minutes)",
    code: `0:00  the problem in one sentence + the numbers (400 invoices, 6 min each)
0:20  upload a clean invoice → draft bill appears in Odoo with lines and PO link
1:00  upload one with a price difference → review queue with a clear reason + explanation note
1:40  ask the policy tool "who approves 70,000?" → cited answer
2:10  show the trace and the eval table (false accepts = 0)
2:40  architecture in one slide + what you'd build next`, lang: "text" }
 ],
 mistakes: [
  "A README without results, demo or how to run it.",
  "Secrets in the repo or in the Docker image.",
  "A public demo connected to real data.",
  "A 15-minute video nobody finishes."
 ],
 practice: [
  { q: "Add a test for the API: uploading an invoice without a PO adds one item to the review queue.", code: `from fastapi import FastAPI, UploadFile
from fastapi.testclient import TestClient

app = FastAPI(); QUEUE = []
@app.post("/invoices")
async def up(file: UploadFile):
    text = (await file.read()).decode()
    if "P000" not in text:
        QUEUE.append(file.filename); return {"status": "needs_review"}
    return {"status": "draft_created"}

c = TestClient(app)
before = len(QUEUE)
assert c.post("/invoices", files={"file": ("x.txt", b"no po")}).json()["status"] == "needs_review"
print("queue grew by", len(QUEUE) - before)` },
  { q: "Write the 3 bullet points you'd say in an interview about this project.", a: "1) Built an AP automation agent for Odoo: LLM extraction with schema validation, an MCP server for vendor/PO lookup and draft bills, and a review queue for exceptions. 2) Safety by design: draft only, duplicate and PO-tolerance checks in code, least-privilege Odoo user, full traces. 3) Measured it on a 50-invoice eval set: 97% straight-through, 0 false accepts, ~₹1.2 per invoice, with evals running in CI." }
 ],
 check: [
  ["Where do API keys go?", ["Dockerfile", "Environment variables / secrets manager; .env.example in Git", "README", "Code"], 1, "Never committed."],
  ["What should a public demo connect to?", ["A client's production Odoo", "A test Odoo database with fake data", "Your personal Odoo", "Nothing"], 1, "Safe demo."],
  ["Best first thing in the README?", ["License", "What it does + results + demo link", "Folder list", "Dependencies"], 1, "Lead with value."]
 ],
 remember: [
  "FastAPI: POST /invoices, GET /review-queue, /health.",
  "Docker + env config; no secrets in Git or images.",
  "Deploy a demo on test data only.",
  "README with results; 3-minute video: problem, happy path, exception, evals."
 ]
}
];
