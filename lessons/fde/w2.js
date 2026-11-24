// FDE Prep — Week 2 lessons (SQL speed, Python, APIs).
(function (L) {
  const add = (key, v) => { L["fde:" + key] = v; };

  add("2-1", {
    title: "Indexes and EXPLAIN ANALYZE",
    one: "An <b>index</b> is like the index at the back of a book: the database jumps to the right rows instead of reading every row.",
    learn: [
      "Without an index, PostgreSQL does a <b>Seq Scan</b>: it reads the whole table. Fine for 1,000 rows, slow for 10 million.",
      "<code>EXPLAIN ANALYZE your query</code> runs the query and shows the plan and the real time. Look for 'Seq Scan' on a big table and 'Rows Removed by Filter' with a huge number. That means: add an index.",
      "For a filter like <code>WHERE partner_id = 42 AND date_order &gt;= '2026-01-01'</code>, create one index on <code>(partner_id, date_order)</code>: the '=' column first, the range column second.",
      "Indexes are not free: every insert and update must also update the index. Add them for real slow queries, not 'just in case'. In Odoo, <code>index=True</code> on a field creates one."
    ],
    ex: "EXPLAIN ANALYZE\nSELECT * FROM sale_order\nWHERE partner_id = 42 AND date_order >= '2026-01-01';\n\nCREATE INDEX idx_so_partner_date\n  ON sale_order (partner_id, date_order);",
    out: "Before: Seq Scan ... Execution Time: 31 ms\nAfter:  Index Scan ... Execution Time: 0.1 ms",
    try: "Find the slowest report query you know from Odoo work. Run EXPLAIN ANALYZE, add the right index on a copy of the database, and compare the time.",
    remember: [
      "Slow query? EXPLAIN ANALYZE first.",
      "Seq Scan on a big table + many rows removed = missing index.",
      "Index order: = column first, range column second. Indexes slow down writes."
    ]
  });

  add("2-2", {
    title: "Transactions and locking",
    one: "A <b>transaction</b> is a group of changes that all succeed or all fail. <b>Locks</b> stop two people changing the same thing at once.",
    learn: [
      "Moving stock from A to B is two updates. If the second fails, the first must be undone, or stock vanishes. <code>BEGIN; ...; COMMIT;</code> saves both. <code>ROLLBACK;</code> undoes both.",
      "<b>The last-item problem:</b> stock = 1, two users click Buy at the same second. Both read 1, both sell. That's a <b>race condition</b>.",
      "Fix 1: lock the row with <code>SELECT ... FOR UPDATE</code>; the second user waits. Fix 2: one statement that checks and changes: <code>UPDATE stock SET qty = qty - 1 WHERE id = 7 AND qty &gt; 0</code>, then check how many rows changed.",
      "Odoo runs transactions in <b>Repeatable Read</b> and retries on conflicts. That's the 'could not serialize access' error you may have seen in logs."
    ],
    ex: "BEGIN;\nSELECT qty FROM stock WHERE product_id = 7 FOR UPDATE;\n-- if qty > 0:\nUPDATE stock SET qty = qty - 1 WHERE product_id = 7;\nCOMMIT;",
    try: "In two psql windows, start a transaction in each and run the FOR UPDATE query on the same row. Watch the second window wait until the first commits.",
    remember: [
      "Transaction = all or nothing (BEGIN / COMMIT / ROLLBACK).",
      "Two users, last item = race condition. Fix with FOR UPDATE or a conditional UPDATE.",
      "Keep transactions short to avoid locks and deadlocks."
    ]
  });

  add("2-3", {
    title: "Python refresh: types, dataclasses, exceptions",
    one: "Outside Odoo, clean Python means: clear types, small data classes, and errors you handle on purpose.",
    learn: [
      "<b>Type hints</b> say what a function takes and returns: <code>def total(prices: list[float]) -&gt; float</code>. They don't change how code runs, but make it easier to read and let tools catch mistakes.",
      "<b>dataclasses</b> give you a simple class for data without boilerplate: you list the fields and Python writes <code>__init__</code> and printing for you.",
      "<b>Exceptions</b>: catch only what you expect (<code>except ValueError</code>), never a bare <code>except:</code> that hides bugs. Raise clear errors with a message."
    ],
    ex: "from dataclasses import dataclass\n\n@dataclass\nclass Invoice:\n    number: str\n    amount: float\n    paid: bool = False\n\ndef parse_amount(text: str) -> float:\n    try:\n        return float(text.replace(',', ''))\n    except ValueError:\n        raise ValueError(f'Not a valid amount: {text!r}')\n\ninv = Invoice('INV-1', parse_amount('1,250.50'))\nprint(inv)  # Invoice(number='INV-1', amount=1250.5, paid=False)",
    try: "Write a dataclass <code>OrderLine</code> (product, qty, price) and a function <code>order_total(lines) -&gt; float</code> with type hints. Make it raise a clear error if qty is negative.",
    remember: [
      "Type hints: say what goes in and comes out.",
      "@dataclass for simple data objects.",
      "Catch specific exceptions; never a bare except."
    ]
  });

  add("2-4", {
    title: "HTTP, REST, JSON and calling APIs",
    one: "An <b>API</b> is a door into another system. You send an HTTP request, it sends back JSON.",
    learn: [
      "<b>HTTP methods</b>: GET = read, POST = create, PUT/PATCH = update, DELETE = remove.",
      "<b>Status codes</b>: 2xx = success (200 OK, 201 Created). 4xx = your mistake (400 bad input, 401 not logged in, 403 not allowed, 404 not found, 429 too many requests). 5xx = server's problem.",
      "<b>JSON</b> is text that looks like Python dicts and lists. Python's <code>httpx</code> (or <code>requests</code>) sends requests and turns JSON into dicts.",
      "Always set a <b>timeout</b>, and check the status before using the data."
    ],
    ex: "import httpx\n\nresp = httpx.get('https://api.github.com/repos/odoo/odoo', timeout=10)\nresp.raise_for_status()          # error if 4xx/5xx\ndata = resp.json()\nprint(data['stargazers_count'])",
    try: "Call any free public API (for example GitHub's) with httpx, print 3 fields, and handle a 404 gracefully.",
    remember: [
      "GET read, POST create, PUT/PATCH update, DELETE remove.",
      "2xx ok, 4xx your fault, 5xx server's fault, 429 slow down.",
      "Always set a timeout and check the status."
    ]
  });

  add("2-5", {
    title: "Webhooks, HMAC, idempotency and retries",
    one: "A <b>webhook</b> is another system calling <i>you</i> when something happens. You must check it's real, and handle duplicates safely.",
    learn: [
      "Example: Xero calls your URL when an invoice is paid. Your endpoint receives JSON.",
      "<b>HMAC signature</b>: the sender signs the body with a shared secret and puts the signature in a header. You recompute it and compare. If it doesn't match, reject it — someone faked the request.",
      "<b>Idempotency</b>: senders retry, so the same event can arrive twice. Store the event id with a UNIQUE constraint and skip ones you've seen. Then processing twice has the same effect as once.",
      "<b>Retries with backoff</b>: when <i>you</i> call an API and it fails temporarily, wait 1s, 2s, 4s... before trying again, then give up and record it."
    ],
    ex: "import hmac, hashlib\n\ndef is_valid(body: bytes, signature: str, secret: str) -> bool:\n    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()\n    return hmac.compare_digest(expected, signature)\n\n-- SQL: skip duplicates\nINSERT INTO webhook_event (external_id, payload)\nVALUES ('evt_123', '{...}')\nON CONFLICT (external_id) DO NOTHING;",
    try: "Write <code>is_valid()</code> and test it: a correct signature returns True, a changed body returns False.",
    remember: [
      "Webhook = they call you. Verify the HMAC signature first.",
      "Same event can arrive twice: unique event id + ON CONFLICT DO NOTHING.",
      "Retry temporary failures with growing waits (backoff)."
    ]
  });

  add("2-6", {
    title: "Build: a small FastAPI app with Pydantic + PostgreSQL",
    one: "Today you build your first service outside Odoo: an API that saves and lists orders.",
    learn: [
      "<b>FastAPI</b> is a Python web framework. You write a function, add a decorator like <code>@app.post('/orders')</code>, and it becomes an API endpoint with automatic docs at <code>/docs</code>.",
      "<b>Pydantic</b> models describe the data. FastAPI checks every request against them and returns a clear 400 error if the input is wrong.",
      "Store data in PostgreSQL with <code>psycopg</code> (or SQLAlchemy). Keep the database URL in an environment variable, never in code."
    ],
    ex: "from fastapi import FastAPI\nfrom pydantic import BaseModel, Field\n\napp = FastAPI()\n\nclass OrderIn(BaseModel):\n    customer: str\n    amount: float = Field(gt=0)\n\nORDERS: list[dict] = []   # swap for PostgreSQL next\n\n@app.post('/orders', status_code=201)\ndef create_order(order: OrderIn):\n    ORDERS.append(order.model_dump())\n    return {'id': len(ORDERS)}\n\n@app.get('/orders')\ndef list_orders():\n    return ORDERS\n\n# run: uvicorn main:app --reload  → open http://127.0.0.1:8000/docs",
    try: "Run the example, open <code>/docs</code>, create two orders. Then replace the list with a PostgreSQL table.",
    remember: [
      "FastAPI: decorator + function = endpoint, docs at /docs.",
      "Pydantic validates input and returns errors automatically.",
      "Secrets and DB URLs live in environment variables."
    ]
  });
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
