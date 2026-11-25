// Lessons for course "project-ai-agent". Built by tools/course-builder from tools/courses/project-ai-agent.js.
// Python examples were run and their real output stored.
(function (L) {
L["project-ai-agent:plan"] = {
 "title": "Plan the project and repo",
 "level": "Project",
 "one": "You'll build an <b>accounts-payable agent for Odoo</b>: it reads vendor invoices (PDF/email), extracts and validates them, matches the vendor and purchase order in Odoo through an <b>MCP server</b>, creates <b>draft</b> bills for human approval, answers policy questions with <b>RAG</b>, and proves its quality with an <b>eval report</b>.",
 "why": "This is exactly the kind of system forward-deployed and AI engineers build for clients: a real business workflow, an ERP integration, safe automation with humans in control, and measured quality. It's the strongest portfolio project in this platform.",
 "steps": [
  {
   "h": "The business problem",
   "p": [
    "An AP clerk at a distributor receives ~400 vendor invoices a month and types each into Odoo: find the vendor, find the PO, enter lines, check totals and GST, avoid duplicates. It takes ~6 minutes per invoice and errors cause wrong payments and lost tax credit.",
    "Goal: the agent prepares correct <b>draft</b> bills automatically for the easy majority, and sends unclear cases to a human with a clear reason. Humans still post (approve) every bill."
   ]
  },
  {
   "h": "Is it worth it? A quick business case",
   "code": "invoices_per_month = 400\nminutes_manual = 6\nstraight_through = 0.70          # target: 70% need no edits\nminutes_review_auto = 1          # quick check of a prepared draft\nminutes_review_flagged = 5       # flagged cases still need work\n\nmanual_hours = invoices_per_month * minutes_manual / 60\nauto_hours = (invoices_per_month * straight_through * minutes_review_auto\n              + invoices_per_month * (1 - straight_through) * minutes_review_flagged) / 60\nprint(f\"manual: {manual_hours:.0f} h/month, with agent: {auto_hours:.0f} h/month, saved: {manual_hours - auto_hours:.0f} h/month\")\nprint(f\"model cost at ~1.5 INR per invoice: {invoices_per_month * 1.5:.0f} INR/month\")",
   "note": "Always frame AI work in the client's numbers: hours saved, errors avoided, cost per document.",
   "out": {
    "text": "manual: 40 h/month, with agent: 15 h/month, saved: 25 h/month\nmodel cost at ~1.5 INR per invoice: 600 INR/month"
   }
  },
  {
   "h": "Architecture",
   "code": "invoice PDF/email ──► extraction (LLM → Invoice schema → validation, retry with errors)\n                              │ valid\n                              ▼\n                   AP workflow (deterministic steps, logged):\n                     find_vendor ─► get_purchase_order ─► checks (PO match, duplicates, policy)\n                              │ all checks pass                │ any check fails\n                              ▼                                 ▼\n                     create_draft_bill (MCP)            review queue with reasons\n                              │\n                     human posts the bill in Odoo   ◄── policy Q&A tool (RAG over AP policy)\nevals: 50 labelled invoices → field accuracy, straight-through rate, false-accept rate (must be 0)",
   "lang": "text"
  },
  {
   "h": "Repo layout",
   "code": "odoo-ap-agent/\n  README.md                 problem, architecture diagram, demo GIF, eval results, how to run\n  pyproject.toml\n  .env.example              ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY, LLM_API_KEY\n  src/ap_agent/\n    extraction.py           Invoice schema + extract_invoice()\n    odoo_client.py          JSON-RPC client (execute_kw)\n    mcp_server.py           find_vendor, get_purchase_order, create_draft_bill, ask_policy\n    workflow.py             process_invoice(): steps, checks, review queue\n    rag.py                  policy retrieval + cited answers\n    api.py                  FastAPI: POST /invoices, GET /review-queue\n  evals/\n    invoices/               50 labelled sample invoices (synthetic, no real client data)\n    run_evals.py            → evals/report.md\n  tests/                    unit tests per module (FakeOdoo, FakeLLM)\n  Dockerfile, docker-compose.yml (app + Odoo + Postgres for the demo)",
   "lang": "text"
  },
  {
   "h": "Milestones and definition of done",
   "code": "1 extraction      schema + validation + retry; 10 sample invoices pass\n2 MCP tools       vendor/PO lookup, draft bill; tested in-process\n3 workflow        end-to-end on samples; review queue with reasons; full trace log\n4 policy RAG      cited answers, refuses when unsure\n5 evals           50 invoices; report with accuracy, straight-through rate, false accepts = 0\n6 ship            Docker, deploy, README, 3-minute demo video\nsafety rules      never post or pay; draft only; duplicates blocked; no secrets in Git",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Starting with an autonomous agent instead of a reliable workflow with one model step.",
  "Letting the agent post or pay bills (keep humans approving).",
  "Using real client invoices in a public repo.",
  "No success metric, so you can't say whether it works."
 ],
 "practice": [
  {
   "q": "Recompute the business case for 1,200 invoices/month with a 60% straight-through rate.",
   "code": "n, stp = 1200, 0.60\nmanual = n * 6 / 60\nauto = (n * stp * 1 + n * (1 - stp) * 5) / 60\nprint(f\"saved {manual - auto:.0f} hours/month\")",
   "out": {
    "text": "saved 68 hours/month"
   }
  },
  {
   "q": "Write the one-paragraph problem statement for the README.",
   "a": "Example: “Accounts-payable teams spend ~6 minutes per vendor invoice entering it into Odoo and checking vendor, PO, totals, GST and duplicates. This project prepares validated draft bills automatically using an LLM for extraction and an MCP server for Odoo, sends unclear cases to a review queue with reasons, and never posts bills itself. On a 50-invoice eval set it prepares X% of clean bills with no edits and creates zero wrong bills.”"
  }
 ],
 "check": [
  [
   "Who posts (approves) the bills?",
   [
    "The agent",
    "A human in Odoo",
    "The vendor",
    "Nobody"
   ],
   1,
   "Draft only; humans approve."
  ],
  [
   "Main architecture choice?",
   [
    "Fully autonomous agent",
    "Deterministic workflow with LLM extraction and tool calls",
    "No validation",
    "Manual only"
   ],
   1,
   "Reliable and testable."
  ],
  [
   "Which metric must be zero?",
   [
    "Latency",
    "False accepts (wrong bills created)",
    "Review queue size",
    "Tokens"
   ],
   1,
   "Wrong money is worst."
  ]
 ],
 "remember": [
  "Real problem: AP data entry in Odoo; measured in hours and errors.",
  "Extraction → workflow with tools → draft bill or review queue.",
  "Humans post; agent never pays.",
  "Milestones end with evals and a shipped demo."
 ]
};
L["project-ai-agent:extraction"] = {
 "title": "Invoice extraction with validation",
 "level": "Project",
 "one": "Turn invoice text into a typed <b>Invoice</b> object: ask the model for JSON matching a schema, <b>validate</b> it (formats, totals, required fields), and if it fails, <b>retry with the errors</b>. Anything still invalid goes to a human.",
 "why": "Extraction is the step every later step depends on. Validation is what turns a clever demo into something an accountant can trust.",
 "steps": [
  {
   "h": "The schema is the contract",
   "code": "print(json.dumps(Invoice.model_json_schema()[\"required\"]))\nok = Invoice(vendor_name=\"Malabar Office Supplies\", vendor_gstin=\"32AABCM1234F1Z5\", invoice_number=\"MOS-1182\",\n             invoice_date=\"2025-07-04\", po_number=\"P00031\",\n             lines=[{\"description\": \"A4 paper (box)\", \"quantity\": 20, \"unit_price\": 450},\n                    {\"description\": \"Toner\", \"quantity\": 1, \"unit_price\": 1000}],\n             tax_rate=0.18, total=11800)\nprint(ok.invoice_number, ok.invoice_date, len(ok.lines), \"lines, total\", ok.total)",
   "note": "Validation rules live in the schema: GSTIN format, positive quantities, and totals that add up (lines + tax = total, within 1 rupee).",
   "out": {
    "text": "[\"vendor_name\", \"invoice_number\", \"invoice_date\", \"lines\", \"tax_rate\", \"total\"]\nMOS-1182 2025-07-04 2 lines, total 11800.0"
   }
  },
  {
   "h": "The prompt",
   "code": "EXTRACT_PROMPT = \"\"\"You extract data from vendor invoices for an accounts-payable team.\nReturn ONLY a JSON object with these fields:\nvendor_name, vendor_gstin (15 chars or null), invoice_number, invoice_date (YYYY-MM-DD),\npo_number (like P00031, or null), currency, lines [{description, quantity, unit_price}],\ntax_rate (0.18 for 18%), total (grand total including tax).\nRules: copy numbers exactly as printed; do not compute missing values; use null if a field is absent.\n\nInvoice:\n<invoice>\n{text}\n</invoice>\"\"\"",
   "lang": "python",
   "run": false
  },
  {
   "h": "Extract, validate, retry with errors",
   "code": "from pydantic import ValidationError\n\nPROMPT = \"Extract the invoice as JSON.\\n<invoice>\\n{text}\\n</invoice>\"\n\ndef extract_invoice(llm, text, max_attempts=2):\n    prompt = PROMPT.format(text=text)\n    for attempt in range(1, max_attempts + 1):\n        raw = llm.complete(prompt)\n        try:\n            return {\"status\": \"ok\", \"invoice\": Invoice.model_validate_json(raw), \"attempts\": attempt}\n        except ValidationError as e:\n            errors = [f\"{'.'.join(map(str, x['loc'])) or 'invoice'}: {x['msg']}\" for x in e.errors()]\n            prompt += \"\\n\\nYour previous answer was invalid:\\n- \" + \"\\n- \".join(errors) + \"\\nReturn corrected JSON only.\"\n    return {\"status\": \"needs_review\", \"errors\": errors, \"attempts\": max_attempts}\n\ntext = \"MALABAR OFFICE SUPPLIES  GSTIN 32AABCM1234F1Z5  Invoice MOS-1182 dated 04/07/2025  PO: P00031 ...\"\nfirst = '{\"vendor_name\": \"Malabar Office Supplies\", \"vendor_gstin\": \"32AABCM1234F1Z5\", \"invoice_number\": \"MOS-1182\", \"invoice_date\": \"2025-07-04\", \"po_number\": \"P00031\", \"lines\": [{\"description\": \"A4 paper (box)\", \"quantity\": 20, \"unit_price\": 450}, {\"description\": \"Toner\", \"quantity\": 1, \"unit_price\": 1000}], \"tax_rate\": 0.18, \"total\": 11180}'\nsecond = first.replace('\"total\": 11180', '\"total\": 11800')\nllm = FakeLLM([first, second])\nresult = extract_invoice(llm, text)\nprint(result[\"status\"], \"after\", result[\"attempts\"], \"attempts:\", result[\"invoice\"].invoice_number, result[\"invoice\"].total)\nprint(\"feedback sent on retry:\", llm.prompts[1].split(\"invalid:\")[1].strip().splitlines()[0])",
   "note": "The first answer had swapped digits in the total (11180). Validation caught it, and the model fixed it when shown the exact error.",
   "out": {
    "text": "ok after 2 attempts: MOS-1182 11800.0\nfeedback sent on retry: - invoice: Value error, total 11180.0 != lines 10000.0 + tax = 11800.0"
   }
  },
  {
   "h": "When it still fails: human review",
   "code": "from pydantic import ValidationError\n\ndef extract_invoice(llm, text, max_attempts=2):\n    prompt = text\n    for attempt in range(1, max_attempts + 1):\n        try:\n            return {\"status\": \"ok\", \"invoice\": Invoice.model_validate_json(llm.complete(prompt))}\n        except ValidationError as e:\n            errors = [f\"{'.'.join(map(str, x['loc'])) or 'invoice'}: {x['msg']}\" for x in e.errors()]\n            prompt += \"\\nErrors: \" + \"; \".join(errors)\n    return {\"status\": \"needs_review\", \"errors\": errors}\n\nbad = '{\"vendor_name\": \"Gulf Packaging\", \"vendor_gstin\": \"GULF-123\", \"invoice_number\": \"GP-77\", \"invoice_date\": \"2025-07-03\", \"lines\": [{\"description\": \"Cartons\", \"quantity\": 0, \"unit_price\": 20}], \"tax_rate\": 0.05, \"total\": 0}'\nresult = extract_invoice(FakeLLM([bad, bad]), \"scanned invoice text ...\")\nprint(result[\"status\"])\nfor err in result[\"errors\"]:\n    print(\" -\", err)",
   "note": "Never “fix” values silently in code. Unclear invoices go to the review queue with the exact reasons, so the clerk knows what to check.",
   "out": {
    "text": "needs_review\n - vendor_gstin: Value error, GSTIN 'GULF-123' has the wrong format\n - lines.0.quantity: Input should be greater than 0\n - total: Input should be greater than 0"
   }
  },
  {
   "h": "Getting text out of PDFs",
   "p": [
    "Digital PDFs: extract text with <code>pypdf</code> or <code>pdfplumber</code> (tables). Scanned PDFs or photos: send the page image to a vision-capable model, or OCR first. Keep the original file and the extracted text together for audits and evals."
   ],
   "code": "# pip install pdfplumber\nimport pdfplumber\n\ndef pdf_text(path: str) -> str:\n    with pdfplumber.open(path) as pdf:\n        return \"\\n\".join(page.extract_text() or \"\" for page in pdf.pages)",
   "lang": "python",
   "run": false
  }
 ],
 "mistakes": [
  "Trusting the model's JSON without schema validation.",
  "Letting the model compute missing totals (it should copy, code should check).",
  "Retrying without telling the model what was wrong.",
  "Silently correcting values instead of flagging them."
 ],
 "practice": [
  {
   "q": "Add a rule: invoice_date can't be in the future (use 2025-07-06 as today) and test it.",
   "code": "from pydantic import ValidationError, field_validator\nfrom datetime import date\n\nclass StrictInvoice(Invoice):\n    @field_validator(\"invoice_date\")\n    @classmethod\n    def not_future(cls, v):\n        if v > date(2025, 7, 6):\n            raise ValueError(\"invoice_date is in the future\")\n        return v\n\nbase = dict(vendor_name=\"X\", invoice_number=\"1\", lines=[{\"description\": \"a\", \"quantity\": 1, \"unit_price\": 100}], tax_rate=0.18, total=118)\nfor d in [\"2025-07-01\", \"2026-01-01\"]:\n    try:\n        StrictInvoice(invoice_date=d, **base); print(d, \"ok\")\n    except ValidationError as e:\n        print(d, \"->\", e.errors()[0][\"msg\"])",
   "out": {
    "text": "2025-07-01 ok\n2026-01-01 -> Value error, invoice_date is in the future"
   }
  },
  {
   "q": "Check these GSTINs against the format: 32AABCM1234F1Z5, 29AADCD5678K1Z2, 27ABCDE1234F1Y5, GULF-123",
   "code": "for g in [\"32AABCM1234F1Z5\", \"29AADCD5678K1Z2\", \"27ABCDE1234F1Y5\", \"GULF-123\"]:\n    print(g, bool(GSTIN.match(g)))",
   "out": {
    "text": "32AABCM1234F1Z5 True\n29AADCD5678K1Z2 True\n27ABCDE1234F1Y5 False\nGULF-123 False"
   }
  }
 ],
 "check": [
  [
   "What catches a total with swapped digits?",
   [
    "The prompt",
    "A validator checking lines + tax = total",
    "Luck",
    "The PDF"
   ],
   1,
   "Business rules in code."
  ],
  [
   "What should the retry prompt include?",
   [
    "Nothing new",
    "The exact validation errors",
    "A threat",
    "The answer"
   ],
   1,
   "Specific feedback."
  ],
  [
   "After the last failed attempt…",
   [
    "Guess the values",
    "Send to human review with reasons",
    "Drop the invoice",
    "Post anyway"
   ],
   1,
   "Humans handle unclear cases."
  ]
 ],
 "remember": [
  "Pydantic schema = contract + validation (formats, totals).",
  "Model copies values; code checks them.",
  "Retry with exact errors, then human review.",
  "Keep original file + text for audit and evals."
 ]
};
L["project-ai-agent:mcp-tools"] = {
 "title": "Odoo MCP tools: vendors, POs, draft bills",
 "level": "Project",
 "one": "Expose Odoo to the agent through a small <b>MCP server</b> with specific, safe tools: <code>find_vendor</code>, <code>get_purchase_order</code> and <code>create_draft_bill</code> (draft only, duplicates refused). Under the hood they call Odoo's <b>execute_kw</b> JSON-RPC API.",
 "why": "MCP makes your Odoo integration reusable by any AI host (Claude Desktop, your agent, IDEs). Narrow tools with built-in safety rules are what make it acceptable to a finance team.",
 "steps": [
  {
   "h": "Talking to Odoo: execute_kw",
   "p": [
    "Odoo's external API is JSON-RPC: authenticate once to get a user id, then call <code>execute_kw(db, uid, api_key, model, method, args, kwargs)</code>. A minimal real client:"
   ],
   "code": "import httpx\n\nclass OdooClient:\n    def __init__(self, url, db, user, api_key):\n        self.url, self.db, self.api_key = url.rstrip(\"/\"), db, api_key\n        self.http = httpx.Client(timeout=30)\n        self.uid = self._call(\"common\", \"authenticate\", [db, user, api_key, {}])\n\n    def _call(self, service, method, args):\n        r = self.http.post(f\"{self.url}/jsonrpc\", json={\"jsonrpc\": \"2.0\", \"method\": \"call\",\n                           \"params\": {\"service\": service, \"method\": method, \"args\": args}})\n        r.raise_for_status()\n        body = r.json()\n        if body.get(\"error\"):\n            raise RuntimeError(body[\"error\"][\"data\"][\"message\"])\n        return body[\"result\"]\n\n    def execute_kw(self, model, method, args, kwargs=None):\n        return self._call(\"object\", \"execute_kw\", [self.db, self.uid, self.api_key, model, method, args, kwargs or {}])\n\n# odoo = OdooClient(os.environ[\"ODOO_URL\"], os.environ[\"ODOO_DB\"], os.environ[\"ODOO_USER\"], os.environ[\"ODOO_API_KEY\"])\n# odoo.execute_kw(\"res.partner\", \"search_read\", [[[\"vat\", \"=\", \"32AABCM1234F1Z5\"]]], {\"fields\": [\"name\"]})",
   "lang": "python",
   "run": false,
   "note": "The examples below use <b>FakeOdoo</b>, an in-memory class with the same <code>execute_kw</code> shape, so they run anywhere. Swap it for OdooClient against a real (test) database."
  },
  {
   "h": "The MCP server",
   "code": "\n\"\"\"server.py (includes the fake Odoo client for the demo) - an in-memory stand-in for Odoo's JSON-RPC execute_kw API (same call shape).\"\"\"\nimport copy\n\nclass FakeOdoo:\n    def __init__(self):\n        self.db = {\n            \"res.partner\": [\n                {\"id\": 7, \"name\": \"Malabar Office Supplies\", \"vat\": \"32AABCM1234F1Z5\", \"supplier_rank\": 1},\n                {\"id\": 8, \"name\": \"Deccan Tech Traders\", \"vat\": \"29AADCD5678K1Z2\", \"supplier_rank\": 1},\n                {\"id\": 9, \"name\": \"Gulf Packaging LLC\", \"vat\": None, \"supplier_rank\": 1},\n            ],\n            \"purchase.order\": [\n                {\"id\": 31, \"name\": \"P00031\", \"partner_id\": 7, \"amount_total\": 11800.0, \"state\": \"purchase\", \"invoice_status\": \"to invoice\"},\n                {\"id\": 32, \"name\": \"P00032\", \"partner_id\": 8, \"amount_total\": 59000.0, \"state\": \"purchase\", \"invoice_status\": \"to invoice\"},\n                {\"id\": 33, \"name\": \"P00033\", \"partner_id\": 7, \"amount_total\": 4720.0, \"state\": \"purchase\", \"invoice_status\": \"invoiced\"},\n            ],\n            \"account.move\": [\n                {\"id\": 501, \"move_type\": \"in_invoice\", \"partner_id\": 8, \"ref\": \"DT/2025/0098\", \"amount_total\": 23600.0, \"state\": \"posted\"},\n            ],\n        }\n        self.calls = []\n\n    def _match(self, rec, domain):\n        ops = {\"=\": lambda a, b: a == b, \"!=\": lambda a, b: a != b, \"ilike\": lambda a, b: str(b).lower() in str(a or \"\").lower(),\n               \"in\": lambda a, b: a in b, \">\": lambda a, b: a > b}\n        return all(ops[op](rec.get(f), v) for f, op, v in domain)\n\n    def execute_kw(self, model, method, args, kwargs=None):\n        kwargs = kwargs or {}\n        self.calls.append((model, method))\n        rows = self.db[model]\n        if method == \"search_read\":\n            fields = kwargs.get(\"fields\")\n            found = [r for r in rows if self._match(r, args[0])][: kwargs.get(\"limit\") or None]\n            return [copy.deepcopy({k: r[k] for k in (fields or r) if k in r} | {\"id\": r[\"id\"]}) for r in found]\n        if method == \"search_count\":\n            return sum(self._match(r, args[0]) for r in rows)\n        if method == \"create\":\n            vals = dict(args[0]); vals[\"id\"] = max(r[\"id\"] for r in rows) + 1\n            if model == \"account.move\":\n                vals.setdefault(\"state\", \"draft\")\n                vals[\"amount_total\"] = round(sum(l[\"quantity\"] * l[\"price_unit\"] for l in vals.get(\"invoice_line_ids\", [])) * (1 + vals.pop(\"_tax_rate\", 0)), 2)\n            rows.append(vals)\n            return vals[\"id\"]\n        raise ValueError(f\"method {method} not supported in FakeOdoo\")\n\n\nfrom mcp.server.mcpserver import MCPServer\n\nmcp = MCPServer(\"odoo-ap\")\nodoo = FakeOdoo()          # real project: OdooClient(url, db, user, api_key) from environment variables\n\n@mcp.tool()\ndef find_vendor(gstin: str | None = None, name: str | None = None) -> dict:\n    \"\"\"Find a vendor in Odoo by GSTIN (preferred, exact) or by name (partial match).\n    Returns {\"id\", \"name\", \"vat\"} or an error if none or several match.\"\"\"\n    if gstin:\n        found = odoo.execute_kw(\"res.partner\", \"search_read\", [[[\"vat\", \"=\", gstin]]], {\"fields\": [\"name\", \"vat\"]})\n    elif name:\n        found = odoo.execute_kw(\"res.partner\", \"search_read\", [[[\"name\", \"ilike\", name], [\"supplier_rank\", \">\", 0]]], {\"fields\": [\"name\", \"vat\"]})\n    else:\n        return {\"error\": \"give gstin or name\"}\n    if len(found) != 1:\n        return {\"error\": f\"{len(found)} vendors matched\", \"candidates\": [f[\"name\"] for f in found]}\n    return found[0]\n\n@mcp.tool()\ndef get_purchase_order(po_number: str) -> dict:\n    \"\"\"Get a confirmed purchase order by its number (e.g. P00031): vendor id, total and invoice status.\"\"\"\n    found = odoo.execute_kw(\"purchase.order\", \"search_read\", [[[\"name\", \"=\", po_number]]],\n                            {\"fields\": [\"name\", \"partner_id\", \"amount_total\", \"state\", \"invoice_status\"]})\n    return found[0] if found else {\"error\": f\"purchase order {po_number} not found\"}\n\n@mcp.tool()\ndef create_draft_bill(vendor_id: int, invoice_number: str, invoice_date: str, lines: list[dict],\n                      tax_rate: float, po_number: str | None = None) -> dict:\n    \"\"\"Create a DRAFT vendor bill in Odoo (never posts it). Refuses duplicates of the same vendor + invoice number.\n    lines: [{\"description\", \"quantity\", \"unit_price\"}]. A human reviews and posts the draft in Odoo.\"\"\"\n    dupes = odoo.execute_kw(\"account.move\", \"search_count\",\n                            [[[\"move_type\", \"=\", \"in_invoice\"], [\"partner_id\", \"=\", vendor_id], [\"ref\", \"=\", invoice_number]]])\n    if dupes:\n        return {\"error\": f\"bill {invoice_number} already exists for vendor {vendor_id}\"}\n    bill_id = odoo.execute_kw(\"account.move\", \"create\", [{\n        \"move_type\": \"in_invoice\", \"partner_id\": vendor_id, \"ref\": invoice_number, \"invoice_date\": invoice_date,\n        \"invoice_origin\": po_number, \"_tax_rate\": tax_rate,\n        \"invoice_line_ids\": [{\"name\": l[\"description\"], \"quantity\": l[\"quantity\"], \"price_unit\": l[\"unit_price\"]} for l in lines],\n    }])\n    bill = odoo.execute_kw(\"account.move\", \"search_read\", [[[\"id\", \"=\", bill_id]]], {\"fields\": [\"state\", \"amount_total\", \"ref\"]})[0]\n    return {\"bill_id\": bill_id, **bill}\n\nif __name__ == \"__main__\":\n    mcp.run()\n",
   "run": false,
   "note": "Docstrings tell the model when to use each tool. Safety lives in the tools, not the prompt: drafts only, duplicate check, exact GSTIN match preferred."
  },
  {
   "h": "Call the tools in-process",
   "code": "import asyncio, json\nfrom server import mcp\n\nasync def call(name, args):\n    r = await mcp.call_tool(name, args)\n    return json.loads(r.content[0].text)\n\nasync def main():\n    print(await call(\"find_vendor\", {\"gstin\": \"32AABCM1234F1Z5\"}))\n    print(await call(\"find_vendor\", {\"name\": \"traders\"}))\n    print(await call(\"find_vendor\", {\"name\": \"zzz\"}))\n    print(await call(\"get_purchase_order\", {\"po_number\": \"P00031\"}))\n    lines = [{\"description\": \"A4 paper (box)\", \"quantity\": 20, \"unit_price\": 450}, {\"description\": \"Toner\", \"quantity\": 1, \"unit_price\": 1000}]\n    print(await call(\"create_draft_bill\", {\"vendor_id\": 7, \"invoice_number\": \"MOS-1182\", \"invoice_date\": \"2025-07-04\",\n                                           \"lines\": lines, \"tax_rate\": 0.18, \"po_number\": \"P00031\"}))\n    print(await call(\"create_draft_bill\", {\"vendor_id\": 7, \"invoice_number\": \"MOS-1182\", \"invoice_date\": \"2025-07-04\",\n                                           \"lines\": lines, \"tax_rate\": 0.18}))\n\nasyncio.run(main())",
   "out": {
    "text": "{'name': 'Malabar Office Supplies', 'vat': '32AABCM1234F1Z5', 'id': 7}\n{'name': 'Deccan Tech Traders', 'vat': '29AADCD5678K1Z2', 'id': 8}\n{'error': '0 vendors matched', 'candidates': []}\n{'name': 'P00031', 'partner_id': 7, 'amount_total': 11800.0, 'state': 'purchase', 'invoice_status': 'to invoice', 'id': 31}\n{'bill_id': 502, 'state': 'draft', 'amount_total': 11800.0, 'ref': 'MOS-1182', 'id': 502}\n{'error': 'bill MOS-1182 already exists for vendor 7'}"
   }
  },
  {
   "h": "Tests for the tools",
   "code": "import asyncio, json, importlib\nimport server\n\ndef call(name, args):\n    importlib.reload(server)                       # fresh FakeOdoo per test\n    async def go():\n        return json.loads((await server.mcp.call_tool(name, args)).content[0].text)\n    return asyncio.run(go())\n\ndef test_vendor_by_gstin_is_exact():\n    assert call(\"find_vendor\", {\"gstin\": \"29AADCD5678K1Z2\"})[\"name\"] == \"Deccan Tech Traders\"\n\ndef test_ambiguous_name_returns_candidates():\n    r = call(\"find_vendor\", {\"name\": \"a\"})\n    assert \"error\" in r and len(r[\"candidates\"]) > 1\n\ndef test_bill_is_always_draft():\n    r = call(\"create_draft_bill\", {\"vendor_id\": 7, \"invoice_number\": \"X-1\", \"invoice_date\": \"2025-07-04\",\n                                   \"lines\": [{\"description\": \"a\", \"quantity\": 1, \"unit_price\": 100}], \"tax_rate\": 0.18})\n    assert r[\"state\"] == \"draft\" and r[\"amount_total\"] == 118.0\n\ndef test_existing_bill_is_refused():\n    r = call(\"create_draft_bill\", {\"vendor_id\": 8, \"invoice_number\": \"DT/2025/0098\", \"invoice_date\": \"2025-07-01\",\n                                   \"lines\": [{\"description\": \"a\", \"quantity\": 1, \"unit_price\": 100}], \"tax_rate\": 0.18})\n    assert \"already exists\" in r[\"error\"]",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.49s"
   }
  },
  {
   "h": "Connecting it to a host",
   "code": "// Claude Desktop: claude_desktop_config.json\n{\n  \"mcpServers\": {\n    \"odoo-ap\": {\n      \"command\": \"python\",\n      \"args\": [\"-m\", \"ap_agent.mcp_server\"],\n      \"env\": {\"ODOO_URL\": \"https://test.mycompany.odoo.com\", \"ODOO_DB\": \"test\",\n              \"ODOO_USER\": \"ap-bot@mycompany.com\", \"ODOO_API_KEY\": \"<from a secrets manager>\"}\n    }\n  }\n}",
   "lang": "json",
   "note": "Use a dedicated Odoo user for the bot with only the access rights it needs (read partners/POs, create draft bills), and a test database for the demo."
  }
 ],
 "mistakes": [
  "A generic “execute any Odoo method” tool (the model could delete records).",
  "Safety rules only in the prompt instead of inside the tools.",
  "Using an admin Odoo user for the bot.",
  "Fuzzy vendor matching that silently picks the first of several results."
 ],
 "practice": [
  {
   "q": "Add a tool <code>vendor_open_pos(vendor_id)</code> that lists confirmed POs still 'to invoice' for a vendor, and call it.",
   "code": "import asyncio, json\nfrom server import mcp, odoo\n\n@mcp.tool()\ndef vendor_open_pos(vendor_id: int) -> list[dict]:\n    \"\"\"List confirmed purchase orders for a vendor that are not fully invoiced yet.\"\"\"\n    return odoo.execute_kw(\"purchase.order\", \"search_read\",\n                           [[[\"partner_id\", \"=\", vendor_id], [\"state\", \"=\", \"purchase\"], [\"invoice_status\", \"=\", \"to invoice\"]]],\n                           {\"fields\": [\"name\", \"amount_total\"]})\n\nasync def main():\n    r = await mcp.call_tool(\"vendor_open_pos\", {\"vendor_id\": 7})\n    print(r.structured_content[\"result\"])\nasyncio.run(main())",
   "out": {
    "text": "[{'name': 'P00031', 'amount_total': 11800.0, 'id': 31}]"
   }
  },
  {
   "q": "Which Odoo access rights should the bot user have, and which should it not?",
   "a": "Read: res.partner (vendors), purchase.order, account.move (to check duplicates). Create: account.move drafts (vendor bills) and their lines. Not: posting/validating bills, payments, deleting records, editing vendors or bank accounts, settings/admin. Use a dedicated user and a test database first."
  }
 ],
 "check": [
  [
   "Odoo's external API call for model methods is…",
   [
    "GET /records",
    "execute_kw over JSON-RPC/XML-RPC",
    "SOAP only",
    "SQL"
   ],
   1,
   "execute_kw(db, uid, key, model, method, args, kwargs)."
  ],
  [
   "Where should 'draft only' be enforced?",
   [
    "In the prompt",
    "Inside the create_draft_bill tool",
    "In the README",
    "Nowhere"
   ],
   1,
   "Code, not words."
  ],
  [
   "Name search matches 3 vendors. The tool should…",
   [
    "Pick the first",
    "Return an error with the candidates",
    "Create a new vendor",
    "Crash"
   ],
   1,
   "Never guess."
  ]
 ],
 "remember": [
  "OdooClient: authenticate, then execute_kw(model, method, args, kwargs).",
  "Narrow MCP tools with docstrings and type hints.",
  "Safety in tools: draft only, duplicate check, exact matches.",
  "Dedicated least-privilege Odoo user; test DB for demos."
 ]
};
L["project-ai-agent:agent"] = {
 "title": "The agent end to end",
 "level": "Project",
 "one": "Wire it together: a <b>workflow</b> that extracts the invoice, finds the vendor, matches the PO, runs policy checks, and either creates a draft bill or sends the case to a <b>review queue</b> with reasons, logging every step as a <b>trace</b>.",
 "why": "A predictable, traceable workflow is what gets approved by a finance team. You'll also see where a small agent step adds value (explaining exceptions) without giving up control.",
 "steps": [
  {
   "h": "Workflow first, agent where needed",
   "p": [
    "The happy path is always the same steps, so code them directly: fast, cheap, testable. Use the model where judgment is needed: extraction (done), and writing a short, helpful explanation for exceptions. Each step is recorded so a human can see exactly why a decision was made."
   ]
  },
  {
   "h": "The workflow, running on three invoices",
   "code": "from odoo_client import FakeOdoo\n\nodoo = FakeOdoo()\nREVIEW_QUEUE = []\n\ndef match_tolerance(po_total):                        # AP policy: 1% or 500 INR, whichever is lower\n    return min(po_total * 0.01, 500)\n\ndef process_invoice(inv: Invoice):\n    trace = [f\"extracted {inv.invoice_number} from {inv.vendor_name}, total {inv.total:,.0f}\"]\n    def review(reason):\n        trace.append(f\"REVIEW: {reason}\")\n        REVIEW_QUEUE.append({\"invoice\": inv.invoice_number, \"reason\": reason})\n        return {\"status\": \"needs_review\", \"trace\": trace}\n\n    domain = [[\"vat\", \"=\", inv.vendor_gstin]] if inv.vendor_gstin else [[\"name\", \"ilike\", inv.vendor_name]]\n    vendors = odoo.execute_kw(\"res.partner\", \"search_read\", [domain], {\"fields\": [\"name\"]})\n    if len(vendors) != 1:\n        return review(f\"vendor not found uniquely ({len(vendors)} matches)\")\n    vendor = vendors[0]; trace.append(f\"vendor -> {vendor['name']} (id {vendor['id']})\")\n\n    if not inv.po_number:\n        return review(\"no PO number on the invoice\")\n    pos = odoo.execute_kw(\"purchase.order\", \"search_read\", [[[\"name\", \"=\", inv.po_number]]], {})\n    if not pos:\n        return review(f\"PO {inv.po_number} not found\")\n    po = pos[0]\n    if po[\"partner_id\"] != vendor[\"id\"]:\n        return review(f\"PO {po['name']} belongs to another vendor\")\n    if po[\"invoice_status\"] != \"to invoice\":\n        return review(f\"PO {po['name']} is already invoiced\")\n    diff = abs(po[\"amount_total\"] - inv.total)\n    if diff > match_tolerance(po[\"amount_total\"]):\n        return review(f\"total {inv.total:,.0f} differs from PO {po['amount_total']:,.0f} by {diff:,.0f}\")\n    trace.append(f\"PO {po['name']} matched (difference {diff:,.0f})\")\n\n    if odoo.execute_kw(\"account.move\", \"search_count\", [[[\"partner_id\", \"=\", vendor[\"id\"]], [\"ref\", \"=\", inv.invoice_number]]]):\n        return review(\"possible duplicate: bill with this number already exists\")\n\n    bill_id = odoo.execute_kw(\"account.move\", \"create\", [{\"move_type\": \"in_invoice\", \"partner_id\": vendor[\"id\"],\n        \"ref\": inv.invoice_number, \"invoice_origin\": po[\"name\"], \"_tax_rate\": inv.tax_rate,\n        \"invoice_line_ids\": [{\"name\": l.description, \"quantity\": l.quantity, \"price_unit\": l.unit_price} for l in inv.lines]}])\n    trace.append(f\"draft bill {bill_id} created; waiting for human approval\")\n    return {\"status\": \"draft_created\", \"bill_id\": bill_id, \"trace\": trace}\n\ninvoices = [\n    Invoice(vendor_name=\"Malabar Office Supplies\", vendor_gstin=\"32AABCM1234F1Z5\", invoice_number=\"MOS-1182\", invoice_date=\"2025-07-04\",\n            po_number=\"P00031\", lines=[{\"description\": \"A4 paper\", \"quantity\": 20, \"unit_price\": 450}, {\"description\": \"Toner\", \"quantity\": 1, \"unit_price\": 1000}],\n            tax_rate=0.18, total=11800),\n    Invoice(vendor_name=\"Deccan Tech Traders\", vendor_gstin=\"29AADCD5678K1Z2\", invoice_number=\"DT/2025/0131\", invoice_date=\"2025-07-05\",\n            po_number=\"P00032\", lines=[{\"description\": \"Laptop\", \"quantity\": 1, \"unit_price\": 52000}], tax_rate=0.18, total=61360),\n    Invoice(vendor_name=\"Gulf Packaging\", invoice_number=\"GP-77\", invoice_date=\"2025-07-03\", po_number=None,\n            lines=[{\"description\": \"Cartons\", \"quantity\": 100, \"unit_price\": 20}], tax_rate=0.05, total=2100),\n]\nfor inv in invoices:\n    result = process_invoice(inv)\n    print(f\"== {inv.invoice_number}: {result['status']}\")\n    for line in result[\"trace\"]:\n        print(\"   \", line)\nprint(\"review queue:\", REVIEW_QUEUE)",
   "out": {
    "text": "== MOS-1182: draft_created\n    extracted MOS-1182 from Malabar Office Supplies, total 11,800\n    vendor -> Malabar Office Supplies (id 7)\n    PO P00031 matched (difference 0)\n    draft bill 502 created; waiting for human approval\n== DT/2025/0131: needs_review\n    extracted DT/2025/0131 from Deccan Tech Traders, total 61,360\n    vendor -> Deccan Tech Traders (id 8)\n    REVIEW: total 61,360 differs from PO 59,000 by 2,360\n== GP-77: needs_review\n    extracted GP-77 from Gulf Packaging, total 2,100\n    vendor -> Gulf Packaging LLC (id 9)\n    REVIEW: no PO number on the invoice\nreview queue: [{'invoice': 'DT/2025/0131', 'reason': 'total 61,360 differs from PO 59,000 by 2,360'}, {'invoice': 'GP-77', 'reason': 'no PO number on the invoice'}]"
   }
  },
  {
   "h": "A small agent step: explain the exception",
   "p": [
    "For review cases, a model can turn the trace into a short note for the AP clerk, with a suggested next action. It only writes text; it can't change Odoo."
   ],
   "code": "trace = [\"extracted DT/2025/0131 from Deccan Tech Traders, total 61,360\",\n         \"vendor -> Deccan Tech Traders (id 8)\",\n         \"REVIEW: total 61,360 differs from PO 59,000 by 2,360\"]\nprompt = (\"Write a 2-sentence note for an accounts-payable clerk explaining why this invoice needs review \"\n          \"and the most likely next step. Use only facts from the trace.\\n\\nTrace:\\n\" + \"\\n\".join(trace))\nllm = FakeLLM([\"Deccan Tech Traders' invoice DT/2025/0131 is 2,360 INR (4%) above PO P00032, beyond the 500 INR tolerance. \"\n               \"Check with the buyer whether the price changed or an extra item was delivered before booking it.\"])\nprint(llm.complete(prompt))",
   "note": "Ground the note in the trace only, and keep the decision (review) in code. The model makes the exception easier to handle, not riskier.",
   "out": {
    "text": "Deccan Tech Traders' invoice DT/2025/0131 is 2,360 INR (4%) above PO P00032, beyond the 500 INR tolerance. Check with the buyer whether the price changed or an extra item was delivered before booking it."
   }
  },
  {
   "h": "Traces and observability",
   "p": [
    "Store each run: input file hash, extracted JSON, every tool call with arguments and result, decision, model name and prompt version, tokens and cost, latency. Langfuse, LangSmith or OpenTelemetry work well; a Postgres table is enough to start. Traces are what you show the client when they ask “why did it do that?”"
   ]
  }
 ],
 "mistakes": [
  "Letting a model decide whether to create a bill.",
  "No trace, so nobody can explain a decision later.",
  "Comparing totals with exact equality (rounding) or with no tolerance policy.",
  "Review queue entries without reasons."
 ],
 "practice": [
  {
   "q": "Add a rule: bills above 50,000 INR are created as drafts but flagged 'needs finance manager approval' in the result.",
   "a": "After creating the draft: <code>if inv.total &gt; 50_000: trace.append(\"needs finance manager approval (policy: above 50,000 INR)\"); result[\"approval\"] = \"finance_manager\"</code>. Keep it in code and cite the policy section in the trace."
  },
  {
   "q": "Compute the match tolerance for PO totals of 11,800, 59,000 and 2,00,000.",
   "code": "for po in [11_800, 59_000, 200_000]:\n    print(po, \"->\", min(po * 0.01, 500))",
   "out": {
    "text": "11800 -> 118.0\n59000 -> 500\n200000 -> 500"
   }
  }
 ],
 "check": [
  [
   "Who decides draft vs review?",
   [
    "The model",
    "Deterministic code following policy",
    "The vendor",
    "Random"
   ],
   1,
   "Predictable and auditable."
  ],
  [
   "What is the model allowed to do in exceptions?",
   [
    "Post bills",
    "Write an explanation from the trace",
    "Change PO totals",
    "Delete bills"
   ],
   1,
   "Text only."
  ],
  [
   "Why keep a trace per invoice?",
   [
    "Disk space",
    "Explain and audit every decision",
    "Speed",
    "Required by Python"
   ],
   1,
   "Trust."
  ]
 ],
 "remember": [
  "Workflow: extract → vendor → PO → checks → draft or review.",
  "Tolerance and duplicate rules from the AP policy, in code.",
  "Model explains exceptions; code decides.",
  "Trace every step."
 ]
};
L["project-ai-agent:rag-tool"] = {
 "title": "Policy Q&A with RAG",
 "level": "Project",
 "one": "Add a tool that answers AP policy questions (“who approves a 70,000 INR bill?”) from the company's policy documents: <b>retrieve</b> the relevant sections, answer <b>only from them</b> with <b>citations</b>, and say “not in the policy” when retrieval finds nothing relevant.",
 "why": "Clerks and the agent constantly need policy answers. Grounded, cited answers build trust; refusing when unsure prevents confident wrong guidance.",
 "steps": [
  {
   "h": "Retrieve the right sections",
   "code": "import re\nfrom rank_bm25 import BM25Okapi\n\nids = list(POLICY_DOCS)\ntokenize = lambda t: re.findall(r\"[a-z0-9]+\", t.lower())\nbm25 = BM25Okapi([tokenize(POLICY_DOCS[i]) for i in ids])\n\ndef retrieve(question, k=2, min_score=1.0):\n    scores = bm25.get_scores(tokenize(question))\n    ranked = sorted(zip(ids, scores), key=lambda x: -x[1])[:k]\n    return [(doc_id, round(float(s), 2)) for doc_id, s in ranked if s >= min_score]\n\nfor q in [\"Who must approve a bill of 70,000 INR?\", \"How many days to pay an MSME vendor?\", \"What is the WiFi password?\"]:\n    print(q, \"->\", retrieve(q))",
   "note": "The WiFi question retrieves nothing above the threshold, so the tool will say it's not covered instead of guessing.",
   "out": {
    "text": "Who must approve a bill of 70,000 INR? -> [('ap-policy#matching', 3.33), ('ap-policy#approvals', 3.22)]\nHow many days to pay an MSME vendor? -> [('ap-policy#payment-terms', 3.1)]\nWhat is the WiFi password? -> []"
   }
  },
  {
   "h": "Answer with citations, or refuse",
   "code": "import re\nfrom rank_bm25 import BM25Okapi\n\nids = list(POLICY_DOCS)\ntokenize = lambda t: re.findall(r\"[a-z0-9]+\", t.lower())\nbm25 = BM25Okapi([tokenize(POLICY_DOCS[i]) for i in ids])\n\ndef ask_policy(llm, question):\n    scores = bm25.get_scores(tokenize(question))\n    hits = [i for i, s in sorted(zip(ids, scores), key=lambda x: -x[1])[:2] if s >= 1.0]\n    if not hits:\n        return \"This isn't covered in the AP policy documents I have. Please ask the AP lead.\"\n    context = \"\\n\".join(f\"[{i}] {POLICY_DOCS[i]}\" for i in hits)\n    prompt = (\"Answer the question using ONLY the sources below. Cite sources like [id]. \"\n              \"If the sources don't answer it, say so.\\n\\n\" + context + \"\\n\\nQuestion: \" + question)\n    answer = llm.complete(prompt)\n    cited = set(re.findall(r\"\\[([^\\]]+)\\]\", answer))\n    if not cited or not cited <= set(hits):\n        return \"I couldn't produce a properly cited answer; please check the policy directly.\"\n    return answer\n\nllm = FakeLLM([\"A 70,000 INR bill is above 50,000 INR, so it needs the finance manager's approval [ap-policy#approvals].\"])\nprint(ask_policy(llm, \"Who must approve a bill of 70,000 INR?\"))\nprint(ask_policy(FakeLLM([]), \"What is the WiFi password?\"))\nprint(ask_policy(FakeLLM([\"You need the CFO's approval [travel-policy#hotels].\"]), \"Who approves bills above 50,000 INR?\"))",
   "note": "The third answer cited a source that wasn't retrieved for that question, so it was rejected. Checking citations in code catches made-up references.",
   "out": {
    "text": "A 70,000 INR bill is above 50,000 INR, so it needs the finance manager's approval [ap-policy#approvals].\nThis isn't covered in the AP policy documents I have. Please ask the AP lead.\nI couldn't produce a properly cited answer; please check the policy directly."
   }
  },
  {
   "h": "Expose it as an MCP tool",
   "code": "@mcp.tool()\ndef ask_policy(question: str) -> str:\n    \"\"\"Answer a question about the accounts-payable policy (approvals, PO matching tolerance,\n    payment terms, GST input credit, duplicates). Answers cite policy sections like [ap-policy#approvals].\n    Says so when the policy doesn't cover the question.\"\"\"\n    return answer_from_policy(llm, question)",
   "lang": "python",
   "run": false
  },
  {
   "h": "Keeping the knowledge fresh",
   "p": [
    "Load policy documents from where finance maintains them (SharePoint/Drive/Notion), chunk by heading, store section ids and the document version/date, and re-index on change. Show the version in answers (“AP policy v3, April 2025”). For larger document sets, add embeddings (hybrid search) as in the RAG course."
   ]
  }
 ],
 "mistakes": [
  "Answering from the model's general knowledge when retrieval found nothing.",
  "Not checking that citations point to retrieved sections.",
  "Chunks that cut a rule in half (chunk by heading/section).",
  "Stale policy copies with no version shown."
 ],
 "practice": [
  {
   "q": "Which sections does retrieval return for “Can we claim GST credit if the vendor has no GSTIN?”",
   "code": "import re\nfrom rank_bm25 import BM25Okapi\nids = list(POLICY_DOCS)\ntok = lambda t: re.findall(r\"[a-z0-9]+\", t.lower())\nbm25 = BM25Okapi([tok(POLICY_DOCS[i]) for i in ids])\nscores = bm25.get_scores(tok(\"Can we claim GST credit if the vendor has no GSTIN?\"))\nprint([(i, round(float(s), 2)) for i, s in sorted(zip(ids, scores), key=lambda x: -x[1])[:2]])",
   "out": {
    "text": "[('ap-policy#gst', 6.47), ('ap-policy#duplicates', 2.48)]"
   }
  },
  {
   "q": "Write 5 test questions for the policy tool, including 2 that should be refused.",
   "a": "Answerable: “Who approves a 6,00,000 INR bill?” (finance manager + CFO, [ap-policy#approvals]); “What difference from the PO is accepted on a 20,000 INR bill?” (200 INR, [ap-policy#matching]); “When must MSME vendors be paid?” (45 days, [ap-policy#payment-terms]). Refuse: “What's our office address?”; “Can I expense a laptop bag?” (not in AP policy)."
  }
 ],
 "check": [
  [
   "Retrieval finds nothing relevant. The tool should…",
   [
    "Guess",
    "Say it's not covered and point to a person",
    "Use the first document anyway",
    "Crash"
   ],
   1,
   "Refuse safely."
  ],
  [
   "How do you catch invented citations?",
   [
    "Trust the model",
    "Check cited ids are among retrieved ids",
    "Ask again",
    "Ignore"
   ],
   1,
   "Verify in code."
  ],
  [
   "Best chunking for policies?",
   [
    "Fixed 100 characters",
    "By section/heading with ids",
    "Whole document",
    "Random"
   ],
   1,
   "Keep rules intact."
  ]
 ],
 "remember": [
  "Retrieve (BM25/hybrid) with a relevance threshold.",
  "Answer only from sources, cite [section ids].",
  "Verify citations in code; refuse when unsure.",
  "Version and re-index policies when they change."
 ]
};
L["project-ai-agent:evals"] = {
 "title": "Eval set: 50 invoices",
 "level": "Project",
 "one": "Prove the agent works with an <b>eval set</b> of 50 labelled invoices: measure <b>field accuracy</b>, <b>straight-through rate</b> (drafts needing no edits), <b>review precision</b> and, most importantly, <b>false accepts</b> (wrong bills created), which must be zero. Re-run it on every change.",
 "why": "Clients and interviewers ask “how do you know it works?”. A reproducible eval with clear metrics is the answer, and it catches regressions when you change prompts or models.",
 "steps": [
  {
   "h": "Build a labelled set",
   "p": [
    "Create 50 synthetic invoices that cover real variety: clean ones, wrong totals, missing PO, unknown vendor, duplicates, PO mismatches, different layouts. Each has the <b>expected fields</b> and the <b>expected decision</b> (draft or review + reason). Here we generate them, and a simulated extractor makes realistic mistakes on some:"
   ],
   "code": "import random\nrandom.seed(7)\n\ndef make_eval_set(n=50):\n    cases = []\n    for i in range(n):\n        kind = random.choices([\"clean\", \"wrong_total\", \"no_po\", \"po_mismatch\", \"duplicate\"], [30, 6, 5, 5, 4])[0]\n        total = random.choice([11800, 59000])\n        cases.append({\"id\": f\"inv-{i:02d}\", \"kind\": kind, \"true_total\": total,\n                      \"expected\": \"draft\" if kind == \"clean\" else \"review\"})\n    return cases\n\ncases = make_eval_set()\nfrom collections import Counter\nprint(Counter(c[\"kind\"] for c in cases))\nprint(Counter(c[\"expected\"] for c in cases))",
   "out": {
    "text": "Counter({'clean': 37, 'no_po': 6, 'wrong_total': 3, 'po_mismatch': 2, 'duplicate': 2})\nCounter({'draft': 37, 'review': 13})"
   }
  },
  {
   "h": "Run the pipeline and score it",
   "code": "import random\nfrom collections import Counter\nrandom.seed(7)\n\ndef make_eval_set(n=50):\n    out = []\n    for i in range(n):\n        kind = random.choices([\"clean\", \"wrong_total\", \"no_po\", \"po_mismatch\", \"duplicate\"], [30, 6, 5, 5, 4])[0]\n        out.append({\"id\": f\"inv-{i:02d}\", \"kind\": kind, \"true_total\": random.choice([11800, 59000]),\n                    \"expected\": \"draft\" if kind == \"clean\" else \"review\"})\n    return out\n\ndef extractor(case, error_rate):                 # simulated model: sometimes misreads the total\n    misread = random.random() < error_rate\n    total = case[\"true_total\"] + (9 if misread else 0) if case[\"kind\"] != \"wrong_total\" else case[\"true_total\"] * 1.1\n    return {\"total\": total, \"misread\": misread}\n\ndef pipeline(case, extracted):\n    lines_total = case[\"true_total\"]             # validator recomputes from line items\n    if abs(extracted[\"total\"] - lines_total) > 1:\n        return \"review\", \"total mismatch\"\n    if case[\"kind\"] == \"no_po\": return \"review\", \"no PO\"\n    if case[\"kind\"] == \"po_mismatch\": return \"review\", \"PO mismatch\"\n    if case[\"kind\"] == \"duplicate\": return \"review\", \"duplicate\"\n    return \"draft\", \"\"\n\ndef run_eval(error_rate, seed):\n    random.seed(seed); cases = make_eval_set()\n    random.seed(seed + 1)\n    rows = []\n    for c in cases:\n        ex = extractor(c, error_rate)\n        decision, reason = pipeline(c, ex)\n        rows.append({**c, \"decision\": decision, \"reason\": reason, \"field_ok\": not ex[\"misread\"]})\n    n = len(rows)\n    clean = [r for r in rows if r[\"expected\"] == \"draft\"]\n    return {\n        \"field accuracy (total)\": sum(r[\"field_ok\"] for r in rows) / n,\n        \"straight-through rate\": sum(r[\"decision\"] == \"draft\" for r in clean) / len(clean),\n        \"review recall (bad cases caught)\": sum(r[\"decision\"] == \"review\" for r in rows if r[\"expected\"] == \"review\")\n                                            / sum(r[\"expected\"] == \"review\" for r in rows),\n        \"false accepts (wrong drafts)\": sum(r[\"decision\"] == \"draft\" and r[\"expected\"] == \"review\" for r in rows),\n    }\n\nfor name, err in [(\"prompt v1\", 0.15), (\"prompt v2\", 0.05)]:\n    print(name, {k: (round(v, 2) if isinstance(v, float) else v) for k, v in run_eval(err, seed=7).items()})",
   "note": "Prompt v2 misreads fewer totals, so more clean invoices go straight through. Both versions have zero false accepts because validation and PO checks catch every bad case: that's the safety property you report first.",
   "out": {
    "text": "prompt v1 {'field accuracy (total)': 0.8, 'straight-through rate': 0.78, 'review recall (bad cases caught)': 1.0, 'false accepts (wrong drafts)': 0}\nprompt v2 {'field accuracy (total)': 0.98, 'straight-through rate': 0.97, 'review recall (bad cases caught)': 1.0, 'false accepts (wrong drafts)': 0}"
   }
  },
  {
   "h": "Tests that guard the safety property",
   "code": "def decide(extracted_total, line_total, po_total, has_po=True, duplicate=False):\n    if abs(extracted_total - line_total) > 1: return \"review\"\n    if not has_po: return \"review\"\n    if abs(po_total - line_total) > min(po_total * 0.01, 500): return \"review\"\n    if duplicate: return \"review\"\n    return \"draft\"\n\ndef test_clean_invoice_goes_straight_through():\n    assert decide(11800, 11800, 11800) == \"draft\"\n\ndef test_misread_total_never_becomes_a_draft():\n    assert decide(11809, 11800, 11800) == \"review\"\n\ndef test_po_difference_over_tolerance_is_reviewed():\n    assert decide(61360, 61360, 59000) == \"review\"\n\ndef test_small_rounding_difference_is_accepted():\n    assert decide(11800.4, 11800, 11800) == \"draft\"\n\ndef test_duplicates_are_reviewed():\n    assert decide(11800, 11800, 11800, duplicate=True) == \"review\"",
   "test": true,
   "out": {
    "text": ".....  [100%]\n5 passed in 0.01s"
   }
  },
  {
   "h": "The eval report",
   "code": "# Eval report: odoo-ap-agent  (evals/report.md, generated by evals/run_evals.py)\nmodel: claude-sonnet-x · prompt: extract_v2 · date: 2025-07-06 · cases: 50\n\n| metric                         | v1    | v2    | target |\n|--------------------------------|-------|-------|--------|\n| field accuracy (all fields)    | 0.80  | 0.98  | ≥ 0.95 |\n| straight-through rate          | 0.78  | 0.97  | ≥ 0.70 |\n| review recall (bad cases)      | 1.00  | 1.00  | 1.00   |\n| false accepts (wrong drafts)   | 0     | 0     | 0      |\n| median latency / cost per inv. | 4.1s / ₹1.4 | 3.8s / ₹1.2 |  |\n\nfailures to look at: inv-17 (handwritten date), inv-31 (two PO numbers) → added to prompt examples",
   "lang": "markdown",
   "note": "Put the real numbers from your run in the README. A table like this is worth more in an interview than any slide."
  }
 ],
 "mistakes": [
  "Judging quality by trying a few invoices by hand.",
  "An eval set with only clean cases (no traps).",
  "Reporting accuracy but not false accepts (the costly error).",
  "Changing prompts/models without re-running the evals."
 ],
 "practice": [
  {
   "q": "Add a metric: average reviews per day if 400 invoices/month arrive and the straight-through rate is 0.97 (assume 22 working days and the same mix as the eval set: 60% clean).",
   "code": "monthly, clean_share, stp = 400, 0.60, 0.97\nreviews = monthly * (1 - clean_share) + monthly * clean_share * (1 - stp)\nprint(f\"{reviews:.0f} reviews/month = {reviews / 22:.1f} per working day\")",
   "out": {
    "text": "167 reviews/month = 7.6 per working day"
   }
  },
  {
   "q": "Your new model version raises straight-through to 0.97 but creates 1 false accept. Ship it?",
   "a": "No. A wrong draft that could be posted is the costly error; the safety target is zero. Investigate the failing case, add a validation or check that catches it (and a test), re-run the evals, and only ship when false accepts are back to 0."
  }
 ],
 "check": [
  [
   "Most important metric for this agent?",
   [
    "Latency",
    "False accepts (wrong bills created) = 0",
    "Tokens",
    "Number of tools"
   ],
   1,
   "Money safety first."
  ],
  [
   "Straight-through rate means…",
   [
    "All invoices",
    "Clean invoices turned into correct drafts without edits",
    "Reviews",
    "Errors"
   ],
   1,
   "Automation value."
  ],
  [
   "When should evals run?",
   [
    "Once",
    "On every prompt/model/code change (CI)",
    "Yearly",
    "Never"
   ],
   1,
   "Catch regressions."
  ]
 ],
 "remember": [
  "50 labelled cases with traps (wrong totals, no PO, mismatches, duplicates).",
  "Metrics: field accuracy, straight-through, review recall, false accepts.",
  "False accepts must be 0.",
  "Report table in README; re-run on every change."
 ]
};
L["project-ai-agent:ship"] = {
 "title": "Ship: deploy, README, demo video",
 "level": "Project",
 "one": "Package it like a product: a small <b>FastAPI</b> service (upload invoice → result + trace), a <b>Docker</b> image, configuration via environment variables, a clear <b>README</b> with eval results, a deployed demo, and a <b>3-minute video</b> showing the happy path and an exception.",
 "why": "A shipped, documented project is what recruiters and clients actually look at. The demo video is often the first (and only) thing they watch.",
 "steps": [
  {
   "h": "The API",
   "code": "from fastapi import FastAPI, UploadFile\nfrom fastapi.testclient import TestClient\n\napp = FastAPI(title=\"Odoo AP agent\")\nREVIEW_QUEUE: list[dict] = []\n\ndef process_text(text: str) -> dict:                  # real app: extract_invoice → process_invoice\n    if \"P000\" not in text:\n        result = {\"status\": \"needs_review\", \"reason\": \"no PO number on the invoice\"}\n        REVIEW_QUEUE.append(result)\n        return result\n    return {\"status\": \"draft_created\", \"bill_id\": 502}\n\n@app.post(\"/invoices\")\nasync def upload_invoice(file: UploadFile):\n    text = (await file.read()).decode(errors=\"ignore\")\n    return {\"file\": file.filename, **process_text(text)}\n\n@app.get(\"/review-queue\")\ndef review_queue():\n    return REVIEW_QUEUE\n\n@app.get(\"/health\")\ndef health():\n    return {\"ok\": True}\n\nclient = TestClient(app)\nprint(client.post(\"/invoices\", files={\"file\": (\"mos-1182.txt\", b\"Invoice MOS-1182 PO: P00031 ...\")}).json())\nprint(client.post(\"/invoices\", files={\"file\": (\"gp-77.txt\", b\"Invoice GP-77, no order reference\")}).json())\nprint(client.get(\"/review-queue\").json())",
   "out": {
    "text": "{'file': 'mos-1182.txt', 'status': 'draft_created', 'bill_id': 502}\n{'file': 'gp-77.txt', 'status': 'needs_review', 'reason': 'no PO number on the invoice'}\n[{'status': 'needs_review', 'reason': 'no PO number on the invoice'}]"
   }
  },
  {
   "h": "Dockerfile and config",
   "code": "FROM python:3.12-slim\nWORKDIR /app\nCOPY pyproject.toml .\nRUN pip install --no-cache-dir .\nCOPY src/ src/\nENV PYTHONUNBUFFERED=1\nUSER nobody\nCMD [\"uvicorn\", \"ap_agent.api:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n\n# .env.example (copy to .env, never commit .env)\n# ODOO_URL=https://test.mycompany.odoo.com\n# ODOO_DB=test\n# ODOO_USER=ap-bot@mycompany.com\n# ODOO_API_KEY=\n# LLM_API_KEY=\n# PROMPT_VERSION=extract_v2",
   "lang": "dockerfile"
  },
  {
   "h": "Deploy a demo",
   "code": "docker compose up            # app + Odoo + Postgres locally, seeded with demo vendors and POs\n# public demo: deploy the app to Render / Fly.io / Railway / a small VM,\n# pointing at an Odoo test database (Odoo.sh staging or odoo.com trial) with fake data only\n# protect it: basic auth or an API key; rate limit uploads; never connect a real client DB",
   "lang": "bash"
  },
  {
   "h": "README that sells it",
   "code": "# Odoo AP Agent\nTurns vendor invoices into validated draft bills in Odoo. Humans approve; the agent never posts or pays.\n\n▶ 3-minute demo video · live demo (test data) · eval report\n\n## Results (50-invoice eval set)\nstraight-through 97% · field accuracy 98% · false accepts 0 · ₹1.2 / invoice\n\n## How it works\n[architecture diagram] extraction (schema + validation + retry) → Odoo MCP tools → policy checks →\ndraft bill or review queue with reasons · policy Q&A with cited answers\n\n## Safety\ndraft only · duplicate check · PO tolerance from policy · least-privilege Odoo user · full trace per invoice\n\n## Run it\ncp .env.example .env && docker compose up · pytest · python evals/run_evals.py\n\n## What I'd do next\nvision model for scanned invoices · GSTR-2B reconciliation · Slack approvals",
   "lang": "markdown"
  },
  {
   "h": "The demo video (3 minutes)",
   "code": "0:00  the problem in one sentence + the numbers (400 invoices, 6 min each)\n0:20  upload a clean invoice → draft bill appears in Odoo with lines and PO link\n1:00  upload one with a price difference → review queue with a clear reason + explanation note\n1:40  ask the policy tool \"who approves 70,000?\" → cited answer\n2:10  show the trace and the eval table (false accepts = 0)\n2:40  architecture in one slide + what you'd build next",
   "lang": "text"
  }
 ],
 "mistakes": [
  "A README without results, demo or how to run it.",
  "Secrets in the repo or in the Docker image.",
  "A public demo connected to real data.",
  "A 15-minute video nobody finishes."
 ],
 "practice": [
  {
   "q": "Add a test for the API: uploading an invoice without a PO adds one item to the review queue.",
   "code": "from fastapi import FastAPI, UploadFile\nfrom fastapi.testclient import TestClient\n\napp = FastAPI(); QUEUE = []\n@app.post(\"/invoices\")\nasync def up(file: UploadFile):\n    text = (await file.read()).decode()\n    if \"P000\" not in text:\n        QUEUE.append(file.filename); return {\"status\": \"needs_review\"}\n    return {\"status\": \"draft_created\"}\n\nc = TestClient(app)\nbefore = len(QUEUE)\nassert c.post(\"/invoices\", files={\"file\": (\"x.txt\", b\"no po\")}).json()[\"status\"] == \"needs_review\"\nprint(\"queue grew by\", len(QUEUE) - before)",
   "out": {
    "text": "queue grew by 1"
   }
  },
  {
   "q": "Write the 3 bullet points you'd say in an interview about this project.",
   "a": "1) Built an AP automation agent for Odoo: LLM extraction with schema validation, an MCP server for vendor/PO lookup and draft bills, and a review queue for exceptions. 2) Safety by design: draft only, duplicate and PO-tolerance checks in code, least-privilege Odoo user, full traces. 3) Measured it on a 50-invoice eval set: 97% straight-through, 0 false accepts, ~₹1.2 per invoice, with evals running in CI."
  }
 ],
 "check": [
  [
   "Where do API keys go?",
   [
    "Dockerfile",
    "Environment variables / secrets manager; .env.example in Git",
    "README",
    "Code"
   ],
   1,
   "Never committed."
  ],
  [
   "What should a public demo connect to?",
   [
    "A client's production Odoo",
    "A test Odoo database with fake data",
    "Your personal Odoo",
    "Nothing"
   ],
   1,
   "Safe demo."
  ],
  [
   "Best first thing in the README?",
   [
    "License",
    "What it does + results + demo link",
    "Folder list",
    "Dependencies"
   ],
   1,
   "Lead with value."
  ]
 ],
 "remember": [
  "FastAPI: POST /invoices, GET /review-queue, /health.",
  "Docker + env config; no secrets in Git or images.",
  "Deploy a demo on test data only.",
  "README with results; 3-minute video: problem, happy path, exception, evals."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
