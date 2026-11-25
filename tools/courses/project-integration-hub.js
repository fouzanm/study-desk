// Project: Integration Hub. A FastAPI service that receives shop order webhooks and creates sales orders in Odoo.
// Examples run offline: SQLite stands in for PostgreSQL, FlakyOdoo stands in for Odoo's execute_kw API.
const HUB = String.raw`
"""hub.py - the integration hub in one file (the real repo splits it into api.py, db.py, worker.py, odoo.py)."""
import hmac, hashlib, json, sqlite3, time, random
from fastapi import FastAPI, Request, HTTPException

SECRET = b"whsec_demo_only"                # real: os.environ["SHOP_WEBHOOK_SECRET"]

def connect(path="hub.db"):
    db = sqlite3.connect(path, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.executescript("""
    CREATE TABLE IF NOT EXISTS inbox (
        event_id TEXT PRIMARY KEY,                 -- idempotency: each webhook stored once
        topic TEXT NOT NULL, payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',    -- pending | done | failed | dead
        attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at REAL NOT NULL DEFAULT 0,
        last_error TEXT, odoo_id INTEGER, received_at REAL NOT NULL);
    """)
    return db

def sign(body: bytes) -> str:
    return hmac.new(SECRET, body, hashlib.sha256).hexdigest()

app = FastAPI(title="Integration Hub")
app.state.db = connect(":memory:")

@app.post("/webhooks/shop")
async def shop_webhook(request: Request):
    body = await request.body()
    if not hmac.compare_digest(sign(body), request.headers.get("X-Shop-Signature", "")):
        raise HTTPException(401, "bad signature")
    event = json.loads(body)
    cur = app.state.db.execute(
        "INSERT OR IGNORE INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, ?)",
        (event["id"], event["topic"], json.dumps(event["data"]), time.time()))
    app.state.db.commit()
    return {"accepted": True, "duplicate": cur.rowcount == 0}

@app.get("/health")
def health():
    counts = dict(app.state.db.execute("SELECT status, COUNT(*) FROM inbox GROUP BY status").fetchall())
    return {"ok": True, "inbox": counts}

class FlakyOdoo:
    """Stand-in for Odoo's execute_kw. fail_plan: list of exceptions to raise on successive create calls."""
    def __init__(self, fail_plan=()):
        self.fail_plan, self.orders, self.calls = list(fail_plan), {}, 0
    def execute_kw(self, model, method, args, kwargs=None):
        self.calls += 1
        if method == "search_read":                                 # find existing order by client reference
            ref = args[0][0][2]
            return [{"id": oid} for oid, o in self.orders.items() if o["client_order_ref"] == ref]
        if method == "create":
            if self.fail_plan:
                raise self.fail_plan.pop(0)
            oid = 100 + len(self.orders) + 1
            self.orders[oid] = args[0]
            return oid
        raise ValueError(method)

class Retryable(Exception): pass
class Permanent(Exception): pass

def to_sale_order(order: dict) -> dict:
    if not order.get("lines"):
        raise Permanent("order has no lines")
    return {"partner_id": order["customer"]["odoo_partner_id"], "client_order_ref": f"SHOP-{order['number']}",
            "order_line": [(0, 0, {"product_id": l["odoo_product_id"], "product_uom_qty": l["qty"], "price_unit": l["price"]})
                           for l in order["lines"]]}

def push_order(odoo, order: dict) -> int:
    vals = to_sale_order(order)
    existing = odoo.execute_kw("sale.order", "search_read", [[["client_order_ref", "=", vals["client_order_ref"]]]], {"fields": ["id"]})
    if existing:                                               # idempotent on the Odoo side too
        return existing[0]["id"]
    return odoo.execute_kw("sale.order", "create", [vals])

def backoff(attempt, base=2.0, cap=300.0):
    return min(cap, base * 2 ** (attempt - 1)) * random.uniform(0.5, 1.0)

def work_once(db, odoo, now=None, max_attempts=5):
    now = now if now is not None else time.time()
    rows = db.execute("SELECT * FROM inbox WHERE status IN ('pending', 'failed') AND next_attempt_at <= ? "
                      "ORDER BY received_at LIMIT 10", (now,)).fetchall()
    done = 0
    for row in rows:
        attempt = row["attempts"] + 1
        try:
            oid = push_order(odoo, json.loads(row["payload"]))
            db.execute("UPDATE inbox SET status='done', attempts=?, odoo_id=?, last_error=NULL WHERE event_id=?",
                       (attempt, oid, row["event_id"]))
            done += 1
        except Permanent as e:
            db.execute("UPDATE inbox SET status='dead', attempts=?, last_error=? WHERE event_id=?", (attempt, str(e), row["event_id"]))
        except Exception as e:                                    # timeouts, 5xx, Odoo busy: retry later
            status = "dead" if attempt >= max_attempts else "failed"
            db.execute("UPDATE inbox SET status=?, attempts=?, last_error=?, next_attempt_at=? WHERE event_id=?",
                       (status, attempt, f"{type(e).__name__}: {e}", now + backoff(attempt), row["event_id"]))
        db.commit()
    return done
`;

const ORDER = String.raw`
def shop_event(event_id, number, lines=None):
    lines = [{"sku": "TSHIRT-M", "odoo_product_id": 41, "qty": 2, "price": 799.0}] if lines is None else lines
    return {"id": event_id, "topic": "orders/create",
            "data": {"number": number, "customer": {"email": "asha@example.com", "odoo_partner_id": 7}, "lines": lines}}
`;

module.exports = [
{
 id: "setup",
 title: "Repo, FastAPI, PostgreSQL, Docker Compose",
 level: "Project",
 one: "You'll build an <b>Integration Hub</b>: a FastAPI service that receives order <b>webhooks</b> from an online shop, stores them safely, and a <b>worker</b> creates matching <b>sales orders in Odoo</b>, with retries, dead-lettering, idempotency, tests, CI and a failure-scenarios README.",
 why: "Connecting systems reliably is the core of integration and forward-deployed work. Interviewers love this project because it shows you understand what goes wrong in production, not just the happy path.",
 steps: [
  { h: "The problem and the flow",
    code: `shop (Shopify/WooCommerce)                         Odoo
  order created ──webhook──► Integration Hub ──────► sale.order (client_order_ref = SHOP-1042)
                              1 verify HMAC signature
                              2 store in inbox (idempotent by event id), reply 200 fast
                              3 worker: map → find-or-create in Odoo → mark done
                              4 failures: retry with backoff → dead-letter after N attempts
                              5 /health, metrics, replay endpoint for dead letters`, lang: "text" },
  { h: "Repo layout",
    code: `integration-hub/
  README.md                  flow diagram, failure scenarios table, how to run, demo
  pyproject.toml             fastapi, uvicorn, psycopg, httpx, pydantic-settings, pytest
  .env.example               DATABASE_URL, SHOP_WEBHOOK_SECRET, ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY
  src/hub/
    settings.py              config from env (pydantic-settings)
    api.py                   POST /webhooks/shop, GET /health, POST /admin/replay/{event_id}
    db.py                    inbox table, queries (SELECT ... FOR UPDATE SKIP LOCKED)
    mapping.py               shop order → Odoo sale.order values
    odoo.py                  OdooClient (execute_kw) with timeouts
    worker.py                loop: claim → push → mark done/failed/dead
  migrations/001_inbox.sql
  tests/                     test_webhook.py, test_mapping.py, test_worker.py
  docker-compose.yml         api, worker, postgres (+ odoo for the demo)
  .github/workflows/ci.yml`, lang: "text" },
  { h: "Settings from the environment",
    code: `from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str
    shop_webhook_secret: str
    odoo_url: str
    odoo_db: str
    odoo_user: str
    odoo_api_key: str
    worker_max_attempts: int = 5

os.environ.update(DATABASE_URL="postgresql://hub:hub@localhost:5432/hub", SHOP_WEBHOOK_SECRET="whsec_x",
                  ODOO_URL="http://localhost:8069", ODOO_DB="demo", ODOO_USER="hub-bot", ODOO_API_KEY="k")
s = Settings()
print(s.odoo_url, s.worker_max_attempts, "| secret loaded:", bool(s.shop_webhook_secret))`,
    note: "Settings fail fast at startup if something is missing, instead of failing on the first webhook at 2am." },
  { h: "Docker Compose for local development",
    code: `services:
  postgres:
    image: postgres:16
    environment: {POSTGRES_USER: hub, POSTGRES_PASSWORD: hub, POSTGRES_DB: hub}
    healthcheck: {test: ["CMD", "pg_isready", "-U", "hub"], interval: 5s}
    volumes: [pgdata:/var/lib/postgresql/data]
  api:
    build: .
    command: uvicorn hub.api:app --host 0.0.0.0 --port 8000
    env_file: .env
    ports: ["8000:8000"]
    depends_on: {postgres: {condition: service_healthy}}
  worker:
    build: .
    command: python -m hub.worker
    env_file: .env
    depends_on: {postgres: {condition: service_healthy}}
  odoo:                                   # demo only: a local Odoo to sync into
    image: odoo:18
    depends_on: [postgres]
    ports: ["8069:8069"]
volumes: {pgdata: {}}`, lang: "yaml" },
  { h: "The inbox table",
    code: `-- migrations/001_inbox.sql
CREATE TABLE inbox (
    event_id        text PRIMARY KEY,               -- the shop's webhook id: duplicates rejected
    topic           text NOT NULL,                  -- orders/create, orders/cancelled ...
    payload         jsonb NOT NULL,
    status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','failed','dead')),
    attempts        int NOT NULL DEFAULT 0,
    next_attempt_at timestamptz NOT NULL DEFAULT now(),
    last_error      text,
    odoo_id         int,
    received_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inbox_due ON inbox (status, next_attempt_at);`, lang: "sql" }
 ],
 mistakes: [
  "Calling Odoo directly inside the webhook request (slow, and lost if Odoo is down).",
  "Config scattered in code instead of one Settings class.",
  "No primary key on the event id, so duplicates slip in.",
  "Only planning the happy path."
 ],
 practice: [
  { q: "Write the one-line purpose and the three failure scenarios you'll handle, for the README.", a: "Purpose: “Receives shop order webhooks and creates matching sales orders in Odoo, reliably.” Failure scenarios: (1) the shop sends the same webhook twice → stored once, one Odoo order; (2) Odoo is down or slow → events wait and retry with backoff, nothing lost; (3) a bad order (e.g. unknown product) → dead-lettered with the error, alert, replay after fixing." },
  { q: "Make Settings reject a webhook secret shorter than 8 characters.", code: `from pydantic import field_validator, ValidationError
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    shop_webhook_secret: str

    @field_validator("shop_webhook_secret")
    @classmethod
    def long_enough(cls, v):
        if len(v) < 8:
            raise ValueError("webhook secret too short")
        return v

for secret in ["whsec_123456", "abc"]:
    try:
        Settings(shop_webhook_secret=secret); print(secret, "ok")
    except ValidationError as e:
        print(secret, "->", e.errors()[0]["msg"])` }
 ],
 check: [
  ["Why store webhooks before calling Odoo?", ["Style", "Reply fast and never lose events if Odoo is down", "Required by FastAPI", "Cheaper"], 1, "Decouple intake from delivery."],
  ["Where does configuration come from?", ["Hardcoded", "Environment variables via a Settings class", "The README", "Git"], 1, "12-factor config."],
  ["What makes duplicate webhooks harmless at intake?", ["Sorting", "Primary key on the event id", "Retries", "Logging"], 1, "Idempotent insert."]
 ],
 remember: [
  "Webhook → inbox → worker → Odoo; reply fast.",
  "Settings from env; fail fast on missing config.",
  "Docker Compose: api, worker, postgres (+ odoo).",
  "Inbox table with status, attempts, next_attempt_at, last_error."
 ]
},
{
 id: "intake",
 title: "Webhook intake with HMAC",
 level: "Project",
 one: "The intake endpoint must be <b>fast</b>, <b>authentic</b> and <b>idempotent</b>: verify the <b>HMAC signature</b> on the raw body, store the event once (by event id), and answer 200 within milliseconds. All real work happens later in the worker.",
 why: "Webhook endpoints are public URLs. Without signature checks anyone can create orders in your ERP; without idempotency, retries create duplicates.",
 steps: [
  { h: "How webhook signatures work",
    p: ["The shop and your hub share a secret. The shop computes <code>HMAC-SHA256(secret, raw_body)</code> and sends it in a header. You recompute it on the <b>exact raw bytes</b> and compare with a constant-time comparison. Any change to the body, or a wrong secret, gives a different signature."],
    code: `import hmac, hashlib
secret = b"whsec_demo_only"
body = b'{"id": "evt_1", "topic": "orders/create"}'
sig = hmac.new(secret, body, hashlib.sha256).hexdigest()
print("signature:", sig[:16] + "...")
tampered = body.replace(b"evt_1", b"evt_9")
print("tampered body matches?", hmac.compare_digest(sig, hmac.new(secret, tampered, hashlib.sha256).hexdigest()))`,
    note: "Shopify sends base64 in <code>X-Shopify-Hmac-Sha256</code>, Stripe signs a timestamp + body in <code>Stripe-Signature</code>, Razorpay uses hex in <code>X-Razorpay-Signature</code>. Read the provider's docs; the idea is the same." },
  { h: "The endpoint, tested",
    files: { "hub.py": HUB },
    pre: "import sys; sys.path.insert(0, '.')\n" + ORDER,
    code: `import json
from fastapi.testclient import TestClient
from hub import app, sign

client = TestClient(app)
body = json.dumps(shop_event("evt_1042", 1042)).encode()

r = client.post("/webhooks/shop", content=body, headers={"X-Shop-Signature": sign(body)})
print("valid:     ", r.status_code, r.json())
r = client.post("/webhooks/shop", content=body, headers={"X-Shop-Signature": sign(body)})
print("redelivery:", r.status_code, r.json())
r = client.post("/webhooks/shop", content=body, headers={"X-Shop-Signature": "forged"})
print("forged:    ", r.status_code, r.json())
print("health:    ", client.get("/health").json())`,
    note: "The redelivered webhook got 200 (so the shop stops retrying) but wasn't stored twice." },
  { h: "Rules for webhook endpoints",
    code: `verify first          signature on the raw body, constant-time compare; 401 if wrong
then store            insert into the inbox keyed by the provider's event id (ON CONFLICT DO NOTHING)
reply fast            200 in < 1 s; providers retry on timeouts and 5xx (causing duplicates)
no business logic     no Odoo calls, no heavy parsing in the request
replay protection     for timestamped signatures, reject events older than ~5 minutes
log                   event id, topic, signature ok/failed (never log secrets or full card data)`, lang: "text" },
  { h: "Validating the payload shape",
    p: ["Verify the signature first, then validate the payload with a Pydantic model so a malformed event is rejected with 422 (or stored and dead-lettered, depending on the provider's retry behaviour). Keep the raw JSON too: it's your evidence when something looks wrong."],
    code: `from pydantic import BaseModel, Field, ValidationError

class Line(BaseModel):
    sku: str
    odoo_product_id: int
    qty: int = Field(gt=0)
    price: float = Field(ge=0)

class ShopOrder(BaseModel):
    number: int
    customer: dict
    lines: list[Line] = Field(min_length=1)

try:
    ShopOrder.model_validate({"number": 1043, "customer": {}, "lines": [{"sku": "MUG", "odoo_product_id": 9, "qty": 0, "price": 299}]})
except ValidationError as e:
    print([f"{'.'.join(map(str, x['loc']))}: {x['msg']}" for x in e.errors()])` }
 ],
 mistakes: [
  "Verifying the signature on re-serialised JSON instead of the raw bytes (signatures won't match).",
  "Using == instead of hmac.compare_digest (timing attacks).",
  "Doing the Odoo call inside the webhook request.",
  "Returning 500 for duplicates (the provider retries forever)."
 ],
 practice: [
  { q: "Implement Shopify-style verification: base64 of the HMAC-SHA256 digest.", code: `import hmac, hashlib, base64
def verify_shopify(secret: bytes, raw_body: bytes, header: str) -> bool:
    digest = hmac.new(secret, raw_body, hashlib.sha256).digest()
    return hmac.compare_digest(base64.b64encode(digest).decode(), header)

body = b'{"id": 1}'
good = base64.b64encode(hmac.new(b"s3cret", body, hashlib.sha256).digest()).decode()
print(verify_shopify(b"s3cret", body, good), verify_shopify(b"s3cret", body, "nope"))` },
  { q: "Add a timestamp check: reject signed events older than 300 seconds.", code: `import time
def fresh_enough(event_ts: float, now: float, max_age=300) -> bool:
    return 0 <= now - event_ts <= max_age

now = time.time()
print(fresh_enough(now - 20, now), fresh_enough(now - 900, now))` }
 ],
 check: [
  ["The HMAC is computed over…", ["The parsed JSON", "The exact raw request body", "The URL", "Headers"], 1, "Raw bytes."],
  ["Duplicate webhook arrives. Respond with…", ["500", "200 and don't store it again", "404", "Nothing"], 1, "Stop provider retries."],
  ["Why compare_digest?", ["Faster", "Constant-time comparison prevents timing attacks", "Required by FastAPI", "Shorter"], 1, "Security."]
 ],
 remember: [
  "Verify HMAC on raw body with compare_digest → 401 if wrong.",
  "Insert into inbox by event id (idempotent) → 200 fast.",
  "No business logic in the request.",
  "Validate payload; keep raw JSON; timestamp replay protection."
 ]
},
{
 id: "worker",
 title: "Queue + worker to the external API",
 level: "Project",
 one: "A <b>worker</b> process claims pending inbox rows, <b>maps</b> each shop order to Odoo values, does <b>find-or-create</b> in Odoo (by a client reference), and marks the row done. With PostgreSQL, several workers share the queue safely using <code>FOR UPDATE SKIP LOCKED</code>.",
 why: "Moving the slow, failure-prone part out of the request is the key architecture idea in integrations. A Postgres-backed queue is simple, durable and enough for most clients.",
 steps: [
  { h: "Mapping: shop order → Odoo sale.order",
    files: { "hub.py": HUB },
    pre: "import sys; sys.path.insert(0, '.')\n" + ORDER,
    code: `from pprint import pprint
from hub import to_sale_order

order = shop_event("evt_1042", 1042, lines=[
    {"sku": "TSHIRT-M", "odoo_product_id": 41, "qty": 2, "price": 799.0},
    {"sku": "MUG", "odoo_product_id": 9, "qty": 1, "price": 299.0}])["data"]
pprint(to_sale_order(order), sort_dicts=False)`,
    note: "<code>(0, 0, {...})</code> is Odoo's command for “create this order line”. <code>client_order_ref</code> stores the shop's order number, which makes the push idempotent." },
  { h: "Claiming work safely (PostgreSQL)",
    code: `-- each worker claims a batch; rows locked by another worker are skipped, not waited on
WITH due AS (
    SELECT event_id FROM inbox
    WHERE status IN ('pending', 'failed') AND next_attempt_at <= now()
    ORDER BY received_at
    LIMIT 10
    FOR UPDATE SKIP LOCKED
)
UPDATE inbox SET status = 'processing', attempts = attempts + 1
FROM due WHERE inbox.event_id = due.event_id
RETURNING inbox.event_id, inbox.payload, inbox.attempts;`, lang: "sql",
    note: "Run two or three worker containers and they never process the same event at the same time. Add a 'processing' timeout so rows from a crashed worker become due again." },
  { h: "The worker, running",
    files: { "hub.py": HUB },
    pre: "import sys; sys.path.insert(0, '.')\n" + ORDER,
    code: `import json, time
from hub import connect, work_once, FlakyOdoo

db = connect(":memory:")
for i, n in enumerate([1042, 1043, 1044]):
    ev = shop_event(f"evt_{n}", n)
    db.execute("INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, ?)",
               (ev["id"], ev["topic"], json.dumps(ev["data"]), time.time() + i))
db.commit()

odoo = FlakyOdoo()
print("processed:", work_once(db, odoo))
for row in db.execute("SELECT event_id, status, attempts, odoo_id FROM inbox ORDER BY event_id"):
    print(dict(row))
print("orders in Odoo:", {oid: o["client_order_ref"] for oid, o in odoo.orders.items()})` },
  { h: "Find-or-create makes the push idempotent",
    files: { "hub.py": HUB },
    pre: "import sys; sys.path.insert(0, '.')\n" + ORDER,
    code: `from hub import push_order, FlakyOdoo

odoo = FlakyOdoo()
order = shop_event("evt_1042", 1042)["data"]
first = push_order(odoo, order)
second = push_order(odoo, order)       # e.g. worker crashed after Odoo created the order, before marking done
print(first, second, "| orders in Odoo:", len(odoo.orders))`,
    note: "If the worker dies after Odoo created the order but before the inbox row was marked done, the retry finds the existing order by <code>client_order_ref</code> instead of creating a second one." },
  { h: "The worker loop",
    code: `import signal, time, logging
log = logging.getLogger("hub.worker")
running = True

def stop(*_):
    global running
    running = False                       # finish the current batch, then exit (graceful shutdown)

signal.signal(signal.SIGTERM, stop)

def main(db, odoo):
    while running:
        try:
            done = work_once(db, odoo)
        except Exception:
            log.exception("worker batch failed")   # never let one bad batch kill the worker
            done = 0
        if done == 0:
            time.sleep(2)                 # idle: poll every 2s (or LISTEN/NOTIFY in Postgres)`, lang: "python", run: false }
 ],
 mistakes: [
  "Two workers picking the same row (no locking).",
  "Plain create in Odoo, so retries duplicate sales orders.",
  "A worker that crashes on the first exception.",
  "No graceful shutdown: deploys kill workers mid-call."
 ],
 practice: [
  { q: "Map a cancelled-order event: find the Odoo order by client_order_ref and describe the call to cancel it.", a: "Search: <code>execute_kw(\"sale.order\", \"search_read\", [[[\"client_order_ref\", \"=\", \"SHOP-1042\"]]], {\"fields\": [\"id\", \"state\"]})</code>. If found and not already cancelled: <code>execute_kw(\"sale.order\", \"action_cancel\", [[order_id]])</code>. If not found yet (cancel arrived before create was processed), retry later or store the cancel so it applies after creation." },
  { q: "Add a line-level check to the mapping: reject orders whose line total (qty × price) doesn't match an order total field.", files: { "hub.py": HUB }, pre: "import sys; sys.path.insert(0, '.')\n" + ORDER, code: `from hub import to_sale_order, Permanent

def checked(order):
    lines_total = sum(l["qty"] * l["price"] for l in order["lines"])
    if abs(lines_total - order["total"]) > 0.01:
        raise Permanent(f"lines {lines_total} != total {order['total']}")
    return to_sale_order(order)

order = shop_event("e", 1)["data"] | {"total": 1598.0}
print(checked(order)["client_order_ref"])
try:
    checked(order | {"total": 1500.0})
except Permanent as e:
    print("dead-letter:", e)` }
 ],
 check: [
  ["FOR UPDATE SKIP LOCKED lets you…", ["Delete rows", "Run several workers without processing the same row twice", "Skip validation", "Speed up inserts"], 1, "Safe concurrent queue."],
  ["Why store client_order_ref in Odoo?", ["Decoration", "Find-or-create makes retries idempotent", "Required field", "Reporting only"], 1, "No duplicate orders."],
  ["(0, 0, {...}) in Odoo means…", ["Delete", "Create a new line record", "Update", "Link existing"], 1, "One2many command."]
 ],
 remember: [
  "Mapping is a pure function: shop order → Odoo values.",
  "Claim with SKIP LOCKED; several workers are safe.",
  "Find-or-create by client_order_ref.",
  "Worker loop survives errors; graceful shutdown."
 ]
},
{
 id: "reliability",
 title: "Retries, dead-letter, idempotency",
 level: "Project",
 one: "Decide per error: <b>retry</b> transient ones (timeouts, 5xx, Odoo busy) with <b>exponential backoff and jitter</b>; <b>dead-letter</b> permanent ones (bad data) immediately, and anything that still fails after N attempts. Provide <b>replay</b> after fixing, and alert on dead letters.",
 why: "This is the difference between an integration that silently loses orders and one the client can trust. Explaining it clearly wins integration interviews.",
 steps: [
  { h: "Classify errors",
    code: `retry (transient)        timeouts, connection errors, HTTP 429/502/503/504, Odoo "could not serialize"
                         (concurrent update), worker restarted mid-call
dead-letter (permanent)  invalid payload, unknown product/customer mapping, Odoo validation error
                         (e.g. missing required field), 400/401/403/404 from the API
after N retries          transient errors that never recover → dead-letter + alert`, lang: "text" },
  { h: "Backoff with jitter",
    code: `import random
random.seed(1)

def backoff(attempt, base=2.0, cap=300.0):
    return min(cap, base * 2 ** (attempt - 1)) * random.uniform(0.5, 1.0)

for attempt in range(1, 8):
    print(f"attempt {attempt}: wait {backoff(attempt):6.1f}s")`,
    note: "Doubling waits give a struggling system time to recover; jitter spreads retries so a thousand events don't hammer Odoo at the same second when it comes back." },
  { h: "Failure scenarios, simulated",
    files: { "hub.py": HUB },
    pre: "import sys; sys.path.insert(0, '.')\n" + ORDER,
    code: `import json, time
from hub import connect, work_once, FlakyOdoo

db = connect(":memory:")
events = [shop_event("evt_A", 2001), shop_event("evt_B", 2002, lines=[]), shop_event("evt_C", 2003)]
for i, ev in enumerate(events):
    db.execute("INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, ?)",
               (ev["id"], ev["topic"], json.dumps(ev["data"]), i))
db.commit()

# Odoo times out twice, then recovers; evt_B has no lines (permanent error)
odoo = FlakyOdoo(fail_plan=[TimeoutError("Odoo did not answer in 30s"), ConnectionError("502 Bad Gateway")])
clock = 1000.0
for rnd in range(1, 5):
    work_once(db, odoo, now=clock)
    rows = db.execute("SELECT event_id, status, attempts, last_error FROM inbox ORDER BY event_id").fetchall()
    print(f"round {rnd}:", [(r["event_id"], r["status"], r["attempts"]) for r in rows])
    clock += 600                                  # let backoff timers expire
for r in db.execute("SELECT event_id, last_error FROM inbox WHERE last_error IS NOT NULL"):
    print("error kept for", r["event_id"], "->", r["last_error"])`,
    note: "evt_A and evt_C hit Odoo outages, waited, and succeeded on retry. evt_B can never succeed, so it went straight to dead-letter with its reason instead of retrying for days." },
  { h: "Dead letters: alert, fix, replay",
    files: { "hub.py": HUB },
    pre: "import sys; sys.path.insert(0, '.')\n" + ORDER,
    code: `import json
from hub import connect, work_once, FlakyOdoo

db = connect(":memory:")
bad = shop_event("evt_B", 2002, lines=[])
db.execute("INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, 0)", (bad["id"], bad["topic"], json.dumps(bad["data"])))
odoo = FlakyOdoo()
work_once(db, odoo, now=1)
print("dead letters:", [dict(r) for r in db.execute("SELECT event_id, last_error FROM inbox WHERE status = 'dead'")])

def replay(db, event_id, fixed_payload=None):        # POST /admin/replay/{event_id} (admin-only)
    if fixed_payload is not None:
        db.execute("UPDATE inbox SET payload = ? WHERE event_id = ?", (json.dumps(fixed_payload), event_id))
    db.execute("UPDATE inbox SET status = 'pending', attempts = 0, next_attempt_at = 0, last_error = NULL WHERE event_id = ?", (event_id,))
    db.commit()

fixed = bad["data"] | {"lines": [{"sku": "MUG", "odoo_product_id": 9, "qty": 1, "price": 299.0}]}   # shop corrected the order
replay(db, "evt_B", fixed)
work_once(db, odoo, now=2)
print("after replay:", dict(db.execute("SELECT event_id, status, odoo_id FROM inbox").fetchone()))` },
  { h: "Idempotency at every hop",
    code: `hop                         duplicate cause                     protection
shop → hub                  provider retries on timeout          inbox PRIMARY KEY (event_id)
hub → Odoo                  worker crash after create            find-or-create by client_order_ref
replay of a dead letter     human replays twice                  same find-or-create
two workers                 concurrent claims                    FOR UPDATE SKIP LOCKED
outgoing calls to APIs      retries of POST requests             Idempotency-Key header when the API supports it`, lang: "text" }
 ],
 mistakes: [
  "Retrying permanent errors for days.",
  "Fixed retry intervals without jitter (thundering herd).",
  "Dead letters nobody is alerted about.",
  "Replay that creates duplicates because the push isn't idempotent."
 ],
 practice: [
  { q: "Write classify(error) that returns 'retry' or 'dead' for: TimeoutError, HTTP 503, HTTP 400, unknown product mapping.", code: `class HTTPError(Exception):
    def __init__(self, status): self.status = status
class MappingError(Exception): pass

def classify(err):
    if isinstance(err, (TimeoutError, ConnectionError)):
        return "retry"
    if isinstance(err, HTTPError):
        return "retry" if err.status in (429, 502, 503, 504) else "dead"
    return "dead"

for e in [TimeoutError(), HTTPError(503), HTTPError(400), MappingError("unknown SKU")]:
    print(type(e).__name__, getattr(e, "status", ""), "->", classify(e))` },
  { q: "Odoo was down for 3 hours and 2,000 events piled up. What happens when it comes back, and what protects Odoo?", a: "Workers pick due events in received order. Exponential backoff with jitter spreads their next attempts, the batch LIMIT and a fixed number of workers cap concurrency, and find-or-create prevents duplicates. Optionally add a rate limiter (e.g. 10 requests/s) and watch the inbox backlog metric drain." }
 ],
 check: [
  ["An order with an unknown SKU should…", ["Retry forever", "Dead-letter immediately with the reason", "Be dropped", "Create a fake product"], 1, "Permanent error."],
  ["Why add jitter to backoff?", ["Fun", "Spread retries so they don't all hit at once", "Faster", "Required"], 1, "Avoid thundering herd."],
  ["Replay must be safe because…", ["Humans never double-click", "The push is idempotent (find-or-create)", "Odoo dedupes everything", "It isn't"], 1, "Idempotency."]
 ],
 remember: [
  "Transient → retry with backoff + jitter; permanent → dead-letter.",
  "Max attempts, then dead-letter + alert.",
  "Replay after fixing; admin-only.",
  "Idempotency at every hop."
 ]
},
{
 id: "tests-ci",
 title: "Tests and CI",
 level: "Project",
 one: "Test the hub at three levels: <b>unit tests</b> for mapping and error classification, <b>API tests</b> for the webhook (signatures, duplicates), and <b>failure tests</b> for the worker (outages, bad data, crashes). Run them in <b>GitHub Actions</b> on every push, with a real Postgres service.",
 why: "Integrations break in the edge cases. Tests that simulate those edge cases are what let you change the code without fear, and they're great evidence in a portfolio.",
 steps: [
  { h: "The test suite",
    files: { "hub.py": HUB },
    pre: "import sys; sys.path.insert(0, '.')\n" + ORDER,
    code: `import json, pytest
from fastapi.testclient import TestClient
import hub

@pytest.fixture
def client():
    hub.app.state.db = hub.connect(":memory:")
    return TestClient(hub.app)

def post(client, event, signature=None):
    body = json.dumps(event).encode()
    return client.post("/webhooks/shop", content=body, headers={"X-Shop-Signature": signature or hub.sign(body)})

def test_valid_webhook_is_stored(client):
    assert post(client, shop_event("e1", 1)).json() == {"accepted": True, "duplicate": False}

def test_bad_signature_rejected(client):
    assert post(client, shop_event("e1", 1), signature="forged").status_code == 401

def test_duplicate_webhook_stored_once(client):
    post(client, shop_event("e1", 1)); r = post(client, shop_event("e1", 1))
    assert r.json()["duplicate"] is True
    assert client.get("/health").json()["inbox"] == {"pending": 1}

def test_mapping_uses_client_ref():
    assert hub.to_sale_order(shop_event("e", 1042)["data"])["client_order_ref"] == "SHOP-1042"

def load(db, *events):
    for i, ev in enumerate(events):
        db.execute("INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, ?)",
                   (ev["id"], ev["topic"], json.dumps(ev["data"]), i))
    db.commit()

def test_outage_then_recovery_creates_one_order():
    db = hub.connect(":memory:"); load(db, shop_event("e1", 1))
    odoo = hub.FlakyOdoo(fail_plan=[TimeoutError("slow")])
    hub.work_once(db, odoo, now=0); hub.work_once(db, odoo, now=10_000)
    assert db.execute("SELECT status FROM inbox").fetchone()[0] == "done" and len(odoo.orders) == 1

def test_bad_order_is_dead_lettered_not_retried():
    db = hub.connect(":memory:"); load(db, shop_event("e1", 1, lines=[]))
    hub.work_once(db, hub.FlakyOdoo(), now=0)
    assert tuple(db.execute("SELECT status, attempts FROM inbox").fetchone()) == ("dead", 1)

def test_gives_up_after_max_attempts():
    db = hub.connect(":memory:"); load(db, shop_event("e1", 1))
    odoo = hub.FlakyOdoo(fail_plan=[TimeoutError()] * 10)
    for t in range(5):
        hub.work_once(db, odoo, now=t * 10_000, max_attempts=3)
    assert tuple(db.execute("SELECT status, attempts FROM inbox").fetchone()) == ("dead", 3)

def test_crash_after_create_does_not_duplicate():
    odoo = hub.FlakyOdoo(); order = shop_event("e1", 7)["data"]
    hub.push_order(odoo, order); hub.push_order(odoo, order)
    assert len(odoo.orders) == 1`, test: true },
  { h: "GitHub Actions with Postgres",
    code: `name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: {POSTGRES_USER: hub, POSTGRES_PASSWORD: hub, POSTGRES_DB: hub}
        ports: ["5432:5432"]
        options: --health-cmd "pg_isready -U hub" --health-interval 5s --health-retries 10
    env:
      DATABASE_URL: postgresql://hub:hub@localhost:5432/hub
      SHOP_WEBHOOK_SECRET: test-secret-123
      ODOO_URL: http://fake-odoo
      ODOO_DB: test
      ODOO_USER: bot
      ODOO_API_KEY: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12", cache: pip}
      - run: pip install -e ".[dev]"
      - run: ruff check . && ruff format --check .
      - run: psql "$DATABASE_URL" -f migrations/001_inbox.sql
      - run: pytest -q --cov=hub --cov-report=term-missing`, lang: "yaml" },
  { h: "Testing against Odoo itself",
    p: ["Unit and failure tests use a fake Odoo (fast, deterministic). Add a small, separate <b>integration test</b> job that starts the official Odoo image with a demo database, runs the mapping against it, and checks the sale order appears. Run it nightly or before releases, since it's slow."] }
 ],
 mistakes: [
  "Only happy-path tests.",
  "Tests that call the real shop or production Odoo.",
  "Tests sharing a database and depending on order.",
  "CI that doesn't run migrations, so SQL bugs reach production."
 ],
 practice: [
  { q: "Write a test that a webhook with a valid signature but an empty body returns 4xx, not 500.", a: "In the endpoint, wrap <code>json.loads(body)</code> and key access in try/except and raise <code>HTTPException(400, \"invalid payload\")</code>. Test: <code>body = b\"\"</code>, post with <code>sign(body)</code>, assert <code>r.status_code == 400</code>." },
  { q: "List the failure tests you'd show in an interview, one line each.", a: "1) Duplicate webhook → stored once. 2) Forged signature → 401. 3) Odoo timeout then recovery → exactly one order. 4) Permanent bad data → dead-letter after 1 attempt. 5) Persistent outage → dead after max attempts. 6) Worker crash after create → retry finds existing order, no duplicate." }
 ],
 check: [
  ["Why a fake Odoo in unit tests?", ["Odoo is bad", "Fast, deterministic, can simulate outages", "Required", "Cheaper licenses"], 1, "Control failures."],
  ["How does CI get a database?", ["Production", "A Postgres service container in the workflow", "SQLite only", "None"], 1, "Real Postgres in CI."],
  ["Which test proves no duplicate sales orders after a crash?", ["Signature test", "Push twice → one order (find-or-create)", "Health test", "Lint"], 1, "Idempotency test."]
 ],
 remember: [
  "Unit (mapping), API (signature, duplicates), failure (outages, bad data, crashes).",
  "Fake Odoo for speed; nightly real-Odoo integration test.",
  "CI: lint, migrations, pytest with Postgres service, coverage."
 ]
},
{
 id: "ship",
 title: "Ship: deploy + failure-scenarios README",
 level: "Project",
 one: "Deploy the hub (API + worker + Postgres), add <b>observability</b> (structured logs, metrics, alerts on dead letters and backlog), and write a README whose centrepiece is a <b>failure-scenarios table</b>: what can go wrong and exactly how the hub handles it.",
 why: "Clients and interviewers care most about “what happens when it breaks?”. A README that answers that clearly, plus a live demo, sets this project apart.",
 steps: [
  { h: "Deploy",
    code: `# Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml . && RUN pip install --no-cache-dir .
COPY src/ src/ && COPY migrations/ migrations/
USER nobody
CMD ["uvicorn", "hub.api:app", "--host", "0.0.0.0", "--port", "8000"]

# hosting options
Render / Railway / Fly.io   web service (api) + background worker + managed Postgres
AWS                         ECS Fargate (api + worker services) + RDS + ALB, secrets in Secrets Manager
a single VM                 docker compose with restart: unless-stopped, Caddy for HTTPS
webhook URL                 https://hub.example.com/webhooks/shop  (HTTPS only)`, lang: "dockerfile" },
  { h: "Observability",
    code: `import json, logging, time, sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({"ts": round(time.time()), "level": record.levelname, "msg": record.getMessage(),
                           **getattr(record, "ctx", {})})

handler = logging.StreamHandler(sys.stdout); handler.setFormatter(JsonFormatter())
log = logging.getLogger("hub"); log.addHandler(handler); log.setLevel(logging.INFO)

log.info("webhook accepted", extra={"ctx": {"event_id": "evt_1042", "topic": "orders/create", "duplicate": False}})
log.warning("odoo call failed, will retry", extra={"ctx": {"event_id": "evt_1043", "attempt": 2, "wait_s": 7.4, "error": "TimeoutError"}})
log.error("dead-lettered", extra={"ctx": {"event_id": "evt_1044", "reason": "order has no lines"}})`,
    note: "One JSON line per event with the event id makes it easy to trace any order end to end in your log tool." },
  { h: "Metrics and alerts",
    code: `metric                               alert when
hub_inbox_backlog (pending+failed)   > 500 for 15 min       → Odoo slow/down or workers stuck
hub_dead_letters_total               any new dead letter     → Slack with event id + reason
hub_oldest_pending_age_seconds       > 30 min                → orders delayed for customers
hub_webhook_signature_failures       spike                   → misconfigured secret or attack
hub_odoo_request_seconds (p95)       > 5 s                   → Odoo performance problem`, lang: "text" },
  { h: "The failure-scenarios README",
    code: `## Failure scenarios
| scenario                                  | what the hub does                                        | tested by |
|-------------------------------------------|----------------------------------------------------------|-----------|
| shop sends the same webhook twice         | stored once (PK on event id), 200 both times             | test_duplicate_webhook_stored_once |
| forged / misconfigured signature          | 401, nothing stored, alert on spikes                     | test_bad_signature_rejected |
| Odoo down or timing out                   | retries with exponential backoff + jitter; no loss       | test_outage_then_recovery_creates_one_order |
| Odoo down for hours                       | dead after 5 attempts → alert → replay when back         | test_gives_up_after_max_attempts |
| order with bad data (no lines, bad SKU)   | dead-lettered at once with reason; fix + replay          | test_bad_order_is_dead_lettered_not_retried |
| worker crashes after Odoo created order   | retry finds order by client_order_ref; no duplicate      | test_crash_after_create_does_not_duplicate |
| deploy during processing                  | SIGTERM → finish batch → exit; rows not done are retried | manual + logs |
| two workers                               | SKIP LOCKED: each row processed by one worker            | integration test (Postgres) |`, lang: "markdown" },
  { h: "Demo script (3 minutes)",
    code: `0:00  the problem: shop orders typed into Odoo by hand, duplicates and missed orders
0:20  create an order in the shop → sale order appears in Odoo with SHOP-#### reference
0:50  send the same webhook again → "duplicate": true, still one order
1:10  stop Odoo, create 3 orders → backlog grows, retries in logs; start Odoo → all 3 arrive once
2:00  send an order with an unknown SKU → dead letter + Slack alert → fix mapping → replay
2:40  the failure-scenarios table and CI badge`, lang: "text" }
 ],
 mistakes: [
  "No alert on dead letters (silent data loss).",
  "Webhook URL over plain HTTP.",
  "README with only setup steps and no failure behaviour.",
  "Logs without event ids, so you can't trace one order."
 ],
 practice: [
  { q: "Write a health check that returns 503 when the oldest pending event is older than 30 minutes.", code: `import time
def health(oldest_pending_ts, now, max_age=1800):
    if oldest_pending_ts is not None and now - oldest_pending_ts > max_age:
        return 503, {"ok": False, "reason": f"oldest pending event is {int((now - oldest_pending_ts) / 60)} min old"}
    return 200, {"ok": True}

now = time.time()
print(health(now - 120, now)); print(health(now - 3600, now))` },
  { q: "Write the three interview bullet points for this project.", a: "1) Built a FastAPI integration hub that syncs shop orders into Odoo via webhooks, with HMAC verification and a Postgres-backed inbox queue processed by workers (SKIP LOCKED). 2) Designed for failure: retries with exponential backoff and jitter, dead-letter with replay, idempotency at every hop (event-id PK, find-or-create by client_order_ref). 3) Proved it with failure tests in CI (outages, duplicates, crashes, bad data) and documented every scenario in the README; structured logs, metrics and alerts on backlog and dead letters." }
 ],
 check: [
  ["Most important alert for this hub?", ["CPU", "New dead letters and growing backlog", "Disk", "Logins"], 1, "Orders at risk."],
  ["Centrepiece of the README?", ["License", "Failure-scenarios table with tests", "Folder tree", "Credits"], 1, "Show you designed for failure."],
  ["Why log the event id on every line?", ["Size", "Trace any order end to end", "Required by JSON", "Speed"], 1, "Debuggability."]
 ],
 remember: [
  "API + worker + Postgres; HTTPS webhook URL; secrets in env.",
  "JSON logs with event ids; metrics for backlog, dead letters, age.",
  "Failure-scenarios table linked to tests.",
  "3-minute demo includes an outage and a replay."
 ]
}
];
