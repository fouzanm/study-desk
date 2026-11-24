// Lessons for course "apis". Keys are "course:lessonId" (see catalog/topics.js).
(function (L) {
L["apis:http-rest"] = {
 "title": "HTTP, REST, JSON and calling APIs",
 "one": "An <b>API</b> is a door into another system. You send an HTTP request, it sends back JSON.",
 "learn": [
  "<b>HTTP methods</b>: GET = read, POST = create, PUT/PATCH = update, DELETE = remove.",
  "<b>Status codes</b>: 2xx = success (200 OK, 201 Created). 4xx = your mistake (400 bad input, 401 not logged in, 403 not allowed, 404 not found, 429 too many requests). 5xx = server's problem.",
  "<b>JSON</b> is text that looks like Python dicts and lists. Python's <code>httpx</code> (or <code>requests</code>) sends requests and turns JSON into dicts.",
  "Always set a <b>timeout</b>, and check the status before using the data."
 ],
 "ex": "import httpx\n\nresp = httpx.get('https://api.github.com/repos/odoo/odoo', timeout=10)\nresp.raise_for_status()          # error if 4xx/5xx\ndata = resp.json()\nprint(data['stargazers_count'])",
 "try": "Call any free public API (for example GitHub's) with httpx, print 3 fields, and handle a 404 gracefully.",
 "remember": [
  "GET read, POST create, PUT/PATCH update, DELETE remove.",
  "2xx ok, 4xx your fault, 5xx server's fault, 429 slow down.",
  "Always set a timeout and check the status."
 ]
};

L["apis:fastapi"] = {
 "title": "FastAPI: your app's front door",
 "one": "<b>FastAPI</b> turns a Python function into a web API that other apps (or your UI) can call.",
 "learn": [
  "Add a decorator like <code>@app.post('/ask')</code> to a function and it becomes an endpoint. FastAPI reads your Pydantic models, validates input, and builds interactive docs at <code>/docs</code>.",
  "This is how your AI features reach users: UI → your FastAPI endpoint → the LLM → back to the UI.",
  "Run it with <code>uvicorn main:app --reload</code>."
 ],
 "ex": "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass AskIn(BaseModel):\n    question: str\n\nclass AskOut(BaseModel):\n    answer: str\n\n@app.post('/ask', response_model=AskOut)\nasync def ask(body: AskIn):\n    # later: call the LLM here\n    return AskOut(answer=f'You asked: {body.question}')",
 "try": "Run this app, open <code>http://127.0.0.1:8000/docs</code>, and send a question. Then send an empty body and see the automatic 422 error.",
 "remember": [
  "Decorator + function = endpoint.",
  "Pydantic models = automatic validation + docs.",
  "UI → FastAPI → LLM → UI."
 ]
};

L["apis:secrets"] = {
 "title": "Secrets and environment variables",
 "one": "Your API key is like a credit card. <b>Never put it in code</b>; read it from an environment variable.",
 "learn": [
  "Bots scan GitHub for leaked keys within minutes. A leaked LLM key can cost real money.",
  "Put keys in a <code>.env</code> file locally, add <code>.env</code> to <code>.gitignore</code>, and load them with <code>python-dotenv</code>. In production, use the host's secret settings.",
  "If a key ever leaks: <b>revoke it immediately</b> and create a new one. Deleting the commit is not enough."
 ],
 "ex": "# .env   (never committed)\nANTHROPIC_API_KEY=sk-...\n\n# .gitignore\n.env\n\n# app.py\nimport os\nfrom dotenv import load_dotenv\n\nload_dotenv()\nAPI_KEY = os.environ['ANTHROPIC_API_KEY']   # crash early if missing",
 "try": "Create a <code>.env</code> with a fake key, load it in Python, and confirm <code>git status</code> doesn't show the <code>.env</code> file.",
 "remember": [
  "Keys live in env vars / secret managers, never in code.",
  ".env goes in .gitignore.",
  "Leaked key = revoke and rotate immediately."
 ]
};

L["apis:webhooks"] = {
 "title": "Webhooks, HMAC, idempotency and retries",
 "one": "A <b>webhook</b> is another system calling <i>you</i> when something happens. You must check it's real, and handle duplicates safely.",
 "learn": [
  "Example: Xero calls your URL when an invoice is paid. Your endpoint receives JSON.",
  "<b>HMAC signature</b>: the sender signs the body with a shared secret and puts the signature in a header. You recompute it and compare. If it doesn't match, reject it — someone faked the request.",
  "<b>Idempotency</b>: senders retry, so the same event can arrive twice. Store the event id with a UNIQUE constraint and skip ones you've seen. Then processing twice has the same effect as once.",
  "<b>Retries with backoff</b>: when <i>you</i> call an API and it fails temporarily, wait 1s, 2s, 4s... before trying again, then give up and record it."
 ],
 "ex": "import hmac, hashlib\n\ndef is_valid(body: bytes, signature: str, secret: str) -> bool:\n    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()\n    return hmac.compare_digest(expected, signature)\n\n-- SQL: skip duplicates\nINSERT INTO webhook_event (external_id, payload)\nVALUES ('evt_123', '{...}')\nON CONFLICT (external_id) DO NOTHING;",
 "try": "Write <code>is_valid()</code> and test it: a correct signature returns True, a changed body returns False.",
 "remember": [
  "Webhook = they call you. Verify the HMAC signature first.",
  "Same event can arrive twice: unique event id + ON CONFLICT DO NOTHING.",
  "Retry temporary failures with growing waits (backoff)."
 ]
};

L["apis:build-api"] = {
 "title": "Build: a small FastAPI app with Pydantic + PostgreSQL",
 "one": "Today you build your first service outside Odoo: an API that saves and lists orders.",
 "learn": [
  "<b>FastAPI</b> is a Python web framework. You write a function, add a decorator like <code>@app.post('/orders')</code>, and it becomes an API endpoint with automatic docs at <code>/docs</code>.",
  "<b>Pydantic</b> models describe the data. FastAPI checks every request against them and returns a clear 400 error if the input is wrong.",
  "Store data in PostgreSQL with <code>psycopg</code> (or SQLAlchemy). Keep the database URL in an environment variable, never in code."
 ],
 "ex": "from fastapi import FastAPI\nfrom pydantic import BaseModel, Field\n\napp = FastAPI()\n\nclass OrderIn(BaseModel):\n    customer: str\n    amount: float = Field(gt=0)\n\nORDERS: list[dict] = []   # swap for PostgreSQL next\n\n@app.post('/orders', status_code=201)\ndef create_order(order: OrderIn):\n    ORDERS.append(order.model_dump())\n    return {'id': len(ORDERS)}\n\n@app.get('/orders')\ndef list_orders():\n    return ORDERS\n\n# run: uvicorn main:app --reload  → open http://127.0.0.1:8000/docs",
 "try": "Run the example, open <code>/docs</code>, create two orders. Then replace the list with a PostgreSQL table.",
 "remember": [
  "FastAPI: decorator + function = endpoint, docs at /docs.",
  "Pydantic validates input and returns errors automatically.",
  "Secrets and DB URLs live in environment variables."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
