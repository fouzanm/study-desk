// Reliable Integrations. Every example runs (SQLite stands in for the database, an in-memory queue for the broker).
module.exports = [
{
 id: "patterns",
 title: "Integration patterns: how systems talk",
 level: "Intermediate",
 one: "Systems connect in a few standard ways: <b>request/response APIs</b>, <b>webhooks</b>, <b>polling</b>, <b>file drops</b> (CSV/SFTP), <b>message queues</b> and <b>change data capture</b>. Picking the right one is half the job.",
 why: "Integration engineers spend their days connecting a client's ERP, CRM, shop, payment provider and warehouse. Choosing the right pattern decides whether it runs quietly for years or breaks every week.",
 steps: [
  { h: "The main patterns",
    p: ["<b>API call (sync)</b>: ask and wait for the answer. Simple; both systems must be up. <b>Webhook</b>: the other system pushes events to you. Fast; you must handle duplicates and downtime. <b>Polling</b>: you ask “anything new since X?” on a schedule. Simple and robust; slower. <b>File exchange</b>: CSV/XML files over SFTP or cloud storage, typical for banks, logistics and old ERPs. <b>Message queue</b>: put work on a queue and let workers process it. Decouples systems and absorbs spikes. <b>CDC</b>: stream every database change (covered in the Kafka course)."] },
  { h: "Sync vs async",
    p: ["<b>Synchronous</b>: the caller waits (checkout asks the payment API). Use when the user needs the answer now. <b>Asynchronous</b>: the caller hands off work and moves on (send the order to the warehouse system). Use whenever the user doesn't need to wait; it's more reliable because a slow or down system doesn't block yours."] },
  { h: "Polling with a watermark",
    p: ["Remember the last thing you processed (a timestamp or id: the <b>watermark</b>) and ask only for newer items. Save the watermark only after processing succeeds."],
    code: `ORDERS = [
    {"id": 101, "updated_at": "2025-07-01T09:00"},
    {"id": 102, "updated_at": "2025-07-01T09:05"},
    {"id": 103, "updated_at": "2025-07-01T09:12"},
]
state = {"watermark": "2025-07-01T09:01"}

def fetch_changed_since(ts):                 # stand-in for GET /orders?updated_after=ts
    return [o for o in ORDERS if o["updated_at"] > ts]

def poll_once():
    new = sorted(fetch_changed_since(state["watermark"]), key=lambda o: o["updated_at"])
    for order in new:
        print("processing order", order["id"])
        state["watermark"] = order["updated_at"]      # move forward after each success
    print("watermark now", state["watermark"])

poll_once()
poll_once()`,
    note: "Use “greater than or equal” plus de-duplication if two records can share a timestamp, so nothing is skipped." },
  { h: "Choosing a pattern",
    p: ["Ask: How fast must data arrive (seconds, minutes, nightly)? What does the other system support? What happens when either side is down? How much data? Who owns failures?",
        "Common answer for “sync shop orders into the ERP”: <b>webhook → queue → worker</b>, with a nightly reconciliation poll to catch anything missed. The next lessons build exactly that."],
    code: `shop ──webhook──► intake API ──► queue ──► worker ──► ERP API
                     (verify, save,          (retry,
                      return 200 fast)        idempotent)
nightly: reconcile job compares shop vs ERP and fixes gaps`, lang: "text" },
  { h: "Mapping data between systems",
    p: ["Every system names things differently. Write the mapping explicitly in one place, convert units and codes, and fail loudly on values you don't know."],
    code: `STATUS_MAP = {"paid": "sale", "pending_payment": "draft", "refunded": "cancel"}   # shop -> ERP

def to_erp(order: dict) -> dict:
    if order["status"] not in STATUS_MAP:
        raise ValueError(f"unknown shop status {order['status']!r}")
    return {
        "client_order_ref": f"SHOP-{order['id']}",
        "partner_email": order["customer"]["email"].lower(),
        "state": STATUS_MAP[order["status"]],
        "amount_total": round(order["total_paise"] / 100, 2),
        "lines": [{"product_code": l["sku"], "qty": l["quantity"]} for l in order["items"]],
    }

shop_order = {"id": 6, "status": "paid", "total_paise": 690000,
              "customer": {"email": "Asha@Example.com"}, "items": [{"sku": "HP-200", "quantity": 2}]}
print(to_erp(shop_order))` }
 ],
 mistakes: [
  "Making everything synchronous: one slow system freezes the whole chain.",
  "No reconciliation: missed webhooks become silent data gaps.",
  "Mapping logic scattered across the code instead of one tested place.",
  "Silently mapping unknown values to a default."
 ],
 practice: [
  { q: "A bank sends a CSV of yesterday's payments to an SFTP folder every morning at 6. Which pattern, and what must your job handle?", a: "File exchange on a schedule. Handle: the file arriving late or twice (track processed file names/hashes), partial files (wait for a “done” marker or check row counts), bad rows (report them), and re-running safely (idempotent inserts)." },
  { q: "Extend <code>to_erp</code> to raise a clear error when an item has quantity 0.", code: `def check_lines(items):
    for i, l in enumerate(items):
        if l["quantity"] <= 0:
            raise ValueError(f"line {i}: quantity must be positive, got {l['quantity']}")

try:
    check_lines([{"sku": "HP-200", "quantity": 2}, {"sku": "TEA", "quantity": 0}])
except ValueError as e:
    print(e)` }
 ],
 check: [
  ["When is a synchronous API call the right choice?", ["Always", "When the user needs the answer right now", "For nightly jobs", "Never"], 1, "Otherwise prefer async."],
  ["What is a watermark in polling?", ["A logo", "The last processed timestamp/id, so you only fetch newer items", "An error code", "A queue"], 1, "Move it forward only after success."],
  ["Why add a nightly reconciliation?", ["Fun", "To catch anything webhooks or workers missed", "It's faster", "Required by REST"], 1, "Webhooks can be lost."]
 ],
 remember: [
  "Patterns: API call, webhook, polling, file exchange, queue, CDC.",
  "Sync when the user must wait; async otherwise.",
  "Polling: watermark, advance only after success.",
  "Common design: webhook → queue → worker + nightly reconciliation.",
  "One explicit, tested mapping; fail loudly on unknown values."
 ]
},
{
 id: "queue-worker",
 title: "Queues and workers",
 level: "Intermediate",
 one: "A <b>queue</b> holds jobs; <b>workers</b> take jobs one by one and process them. The producer doesn't wait, spikes are absorbed, and failed jobs can be retried.",
 why: "Queues are how reliable integrations handle thousands of events without dropping any. Interviewers love asking “what happens when the downstream system is down?”, and a queue is the answer.",
 steps: [
  { h: "Producer, queue, worker",
    p: ["The web request (producer) only adds a job and returns. Workers process jobs in the background, at their own pace."],
    code: `from collections import deque

queue = deque()

def on_order_created(order_id):             # producer: fast, just enqueue
    queue.append({"type": "sync_order", "order_id": order_id})
    return "accepted"

def worker():                                # consumer: does the slow work
    while queue:
        job = queue.popleft()
        print("syncing order", job["order_id"], "to ERP")

for oid in [6, 7, 8]:
    print(on_order_created(oid))
worker()` },
  { h: "A durable queue",
    p: ["An in-memory list is lost if the process restarts. Real queues are <b>durable</b>: Redis-based (RQ, Celery, BullMQ), cloud (AWS SQS, Google Pub/Sub), RabbitMQ, or simply a <b>database table</b>, which is a perfectly good queue for modest volumes:"],
    code: `import sqlite3

db = sqlite3.connect(":memory:")
db.execute("""CREATE TABLE jobs (
    id INTEGER PRIMARY KEY, kind TEXT, payload TEXT,
    status TEXT DEFAULT 'queued', attempts INTEGER DEFAULT 0, last_error TEXT)""")

def enqueue(kind, payload):
    db.execute("INSERT INTO jobs (kind, payload) VALUES (?, ?)", (kind, payload))

def claim_next():
    row = db.execute("SELECT id, kind, payload FROM jobs WHERE status='queued' ORDER BY id LIMIT 1").fetchone()
    if row:
        db.execute("UPDATE jobs SET status='running', attempts=attempts+1 WHERE id=?", (row[0],))
    return row

for oid in [6, 7]:
    enqueue("sync_order", f'{{"order_id": {oid}}}')
job = claim_next()
print("claimed:", job)
db.execute("UPDATE jobs SET status='done' WHERE id=?", (job[0],))
print(db.execute("SELECT id, status, attempts FROM jobs").fetchall())`,
    note: "In PostgreSQL, claim jobs with <code>SELECT … FOR UPDATE SKIP LOCKED</code> so several workers never grab the same job." },
  { h: "At-least-once delivery",
    p: ["Most queues guarantee each job is delivered <b>at least once</b>: if a worker crashes after doing the work but before marking it done, the job runs again. So workers must be <b>idempotent</b>: running a job twice must have the same effect as once."],
    code: `synced = {}

def sync_order(order_id: int, payload: dict):
    ref = f"SHOP-{order_id}"
    if ref in synced:                      # in real life: look up the ERP by external reference
        print(f"{ref} already in ERP, updating instead of creating")
    synced[ref] = payload
    return ref

sync_order(6, {"total": 6900})
sync_order(6, {"total": 6900})            # delivered twice
print(synced)` },
  { h: "Scaling and ordering",
    p: ["More workers = more throughput, but jobs can finish out of order. If order matters (all updates to one order must apply in sequence), route jobs for the same key to the same worker/partition, or include a version number and ignore older updates."],
    code: `current = {}

def apply_update(order_id: int, version: int, status: str):
    if version <= current.get(order_id, (0, None))[0]:
        print(f"ignore stale v{version} for order {order_id}")
        return
    current[order_id] = (version, status)

apply_update(6, 2, "shipped")
apply_update(6, 1, "paid")        # arrived late
print(current)` }
 ],
 mistakes: [
  "Doing slow work inside the web request instead of enqueueing it.",
  "In-memory queues for anything that matters: a restart loses jobs.",
  "Workers that aren't idempotent, so duplicate deliveries create duplicate records.",
  "Assuming jobs finish in the order they were added."
 ],
 practice: [
  { q: "Using the SQLite queue, enqueue 3 jobs, claim and complete them all, and show the final table.", code: `import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE jobs (id INTEGER PRIMARY KEY, payload TEXT, status TEXT DEFAULT 'queued')")
for p in ["a", "b", "c"]:
    db.execute("INSERT INTO jobs (payload) VALUES (?)", (p,))
while (row := db.execute("SELECT id FROM jobs WHERE status='queued' ORDER BY id LIMIT 1").fetchone()):
    db.execute("UPDATE jobs SET status='done' WHERE id=?", row)
print(db.execute("SELECT * FROM jobs").fetchall())` },
  { q: "The ERP is down for 2 hours. What happens to orders in a queue-based design vs a synchronous one?", a: "Queue: orders keep arriving and wait in the queue; workers retry and catch up when the ERP is back, with no lost orders and no slow checkout. Synchronous: every checkout waits or fails while the ERP is down." }
 ],
 check: [
  ["Main benefit of a queue?", ["Faster CPUs", "Producers don't wait; spikes and downtime are absorbed", "No code needed", "Exactly-once delivery always"], 1, "Decoupling."],
  ["At-least-once delivery means workers must be…", ["Fast", "Idempotent", "Single-threaded", "Synchronous"], 1, "Duplicates will happen."],
  ["Jobs for the same order finish out of order. A fix?", ["Ignore it", "Version numbers (ignore older) or route same key to one worker", "Add more workers", "Use polling"], 1, "Guard ordering explicitly."]
 ],
 remember: [
  "Producer enqueues fast; workers do slow work in the background.",
  "Durable queues: Redis/RQ/Celery, SQS, RabbitMQ, or a DB table (FOR UPDATE SKIP LOCKED).",
  "At-least-once → idempotent workers (look up by external reference).",
  "Out-of-order: version numbers or same-key routing."
 ]
},
{
 id: "webhook-intake",
 title: "A reliable webhook intake",
 level: "Intermediate",
 one: "A good intake endpoint does four things fast: <b>verify</b> the signature, <b>store</b> the raw event (deduplicated by event id), <b>enqueue</b> a job, and <b>return 200</b>. Everything else happens in workers.",
 why: "This small piece is where most integrations lose data. Done right, you never lose an event and can replay any of them later.",
 steps: [
  { h: "Store every raw event",
    p: ["Save the raw body and headers before doing anything else. If processing has a bug, you fix it and <b>replay</b> stored events. A UNIQUE event id makes duplicates harmless."],
    code: `import sqlite3, json

db = sqlite3.connect(":memory:")
db.execute("""CREATE TABLE inbound_events (
    event_id TEXT PRIMARY KEY, source TEXT, type TEXT, body TEXT,
    received_at TEXT DEFAULT CURRENT_TIMESTAMP, processed INTEGER DEFAULT 0)""")

def save_event(source, event) -> bool:
    try:
        db.execute("INSERT INTO inbound_events (event_id, source, type, body) VALUES (?, ?, ?, ?)",
                   (event["id"], source, event["type"], json.dumps(event)))
        return True
    except sqlite3.IntegrityError:
        return False                    # duplicate: already stored

e = {"id": "evt_1", "type": "order.paid", "order_id": 6}
print(save_event("shop", e), save_event("shop", e))
print(db.execute("SELECT event_id, type, processed FROM inbound_events").fetchall())` },
  { h: "The endpoint",
    code: `import hmac, hashlib, json, sqlite3
from fastapi import FastAPI, Request, HTTPException
from fastapi.testclient import TestClient

SECRET = b"whsec_test"
db = sqlite3.connect(":memory:", check_same_thread=False)
db.execute("CREATE TABLE inbound_events (event_id TEXT PRIMARY KEY, type TEXT, body TEXT, processed INTEGER DEFAULT 0)")
db.execute("CREATE TABLE jobs (id INTEGER PRIMARY KEY, event_id TEXT, status TEXT DEFAULT 'queued')")
app = FastAPI()

@app.post("/webhooks/shop")
async def shop_webhook(request: Request):
    raw = await request.body()
    sig = hmac.new(SECRET, raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, request.headers.get("X-Shop-Signature", "")):
        raise HTTPException(401, "bad signature")
    event = json.loads(raw)
    try:
        with db:
            db.execute("INSERT INTO inbound_events (event_id, type, body) VALUES (?, ?, ?)",
                       (event["id"], event["type"], raw.decode()))
            db.execute("INSERT INTO jobs (event_id) VALUES (?)", (event["id"],))
    except sqlite3.IntegrityError:
        return {"status": "duplicate"}
    return {"status": "accepted"}

c = TestClient(app)
body = json.dumps({"id": "evt_42", "type": "order.paid", "order_id": 6}).encode()
sig = hmac.new(SECRET, body, hashlib.sha256).hexdigest()
for _ in range(2):
    print(c.post("/webhooks/shop", content=body, headers={"X-Shop-Signature": sig}).json())
print(db.execute("SELECT * FROM jobs").fetchall())`,
    note: "The event row and the job row are saved in <b>one transaction</b> (<code>with db:</code>), so you never have an event without a job or a job without its event." },
  { h: "The worker processes stored events",
    code: `import sqlite3, json

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE inbound_events (event_id TEXT PRIMARY KEY, type TEXT, body TEXT, processed INTEGER DEFAULT 0)")
for i, t in [(1, "order.paid"), (2, "order.refunded"), (3, "customer.updated")]:
    db.execute("INSERT INTO inbound_events VALUES (?, ?, ?, 0)", (f"evt_{i}", t, json.dumps({"order_id": 5 + i})))

HANDLERS = {
    "order.paid": lambda e: f"confirm order {e['order_id']} in ERP",
    "order.refunded": lambda e: f"cancel order {e['order_id']} in ERP",
}

for event_id, etype, body in db.execute("SELECT event_id, type, body FROM inbound_events WHERE processed = 0").fetchall():
    handler = HANDLERS.get(etype)
    print(event_id, "->", handler(json.loads(body)) if handler else f"no handler for {etype}, skipped")
    db.execute("UPDATE inbound_events SET processed = 1 WHERE event_id = ?", (event_id,))
print(db.execute("SELECT count(*) FROM inbound_events WHERE processed = 0").fetchone()[0], "left")` },
  { h: "Replay",
    p: ["Because raw events are stored, fixing a bug is: deploy the fix, mark the affected events <code>processed = 0</code>, let the worker run again. Idempotent handlers make replay safe. This one capability saves countless late nights."] }
 ],
 mistakes: [
  "Processing inside the request: slow responses cause provider retries and duplicates.",
  "Not storing raw events, so a bug means lost data.",
  "Saving the event and the job in separate transactions.",
  "Crashing on unknown event types instead of logging and skipping them."
 ],
 practice: [
  { q: "Write the SQL to replay all <code>order.paid</code> events received on 2025-07-03.", code: `UPDATE inbound_events
SET processed = 0
WHERE type = 'order.paid'
  AND received_at >= '2025-07-03' AND received_at < '2025-07-04';`, lang: "sql" },
  { q: "Why return 200 for a duplicate event instead of an error?", a: "The provider only needs to know you have it. An error makes it retry again and again. Returning 200 (“already have it”) stops the retries." }
 ],
 check: [
  ["What should the intake endpoint do before returning 200?", ["All processing", "Verify, store raw event, enqueue job", "Nothing", "Email the team"], 1, "Fast and safe."],
  ["Why store raw events?", ["Disk is cheap", "So you can replay them after fixing a bug", "Required by HTTP", "For style"], 1, "Replay is a superpower."],
  ["A duplicate event arrives. Respond with…", ["500", "200 'duplicate'", "401", "Nothing"], 1, "Stops pointless retries."]
 ],
 remember: [
  "Intake: verify → store raw (UNIQUE event id) → enqueue → 200, in one transaction.",
  "Workers process stored events; unknown types are logged and skipped.",
  "Replay = mark events unprocessed and re-run (handlers must be idempotent).",
  "Duplicates get 200."
 ]
},
{
 id: "retries-dlq",
 title: "Retries, dead-letter queues and idempotency keys",
 level: "Intermediate",
 one: "Workers retry temporary failures with backoff. Jobs that keep failing go to a <b>dead-letter queue (DLQ)</b> for a human, instead of blocking or disappearing. <b>Idempotency keys</b> make retried writes safe.",
 why: "This is the difference between “the integration broke over the weekend and we lost 300 orders” and “3 orders are waiting in the DLQ with clear errors”.",
 steps: [
  { h: "Temporary vs permanent errors",
    p: ["<b>Temporary</b>: timeouts, 429, 5xx, connection errors. Retry with backoff. <b>Permanent</b>: 400/422 validation errors, unknown product, missing customer. Retrying won't help; send to the DLQ right away with the reason."],
    code: `class Temporary(Exception): pass
class Permanent(Exception): pass

def classify_http_error(status: int) -> type[Exception]:
    return Temporary if status in (408, 429) or status >= 500 else Permanent

for s in [503, 429, 422, 404, 500]:
    print(s, classify_http_error(s).__name__)` },
  { h: "Worker with retries and a DLQ",
    code: `import random

class Temporary(Exception): pass
class Permanent(Exception): pass

MAX_ATTEMPTS = 4
dlq = []

def call_erp(job):                                   # stand-in for the real API call
    if job["sku"] == "UNKNOWN":
        raise Permanent("ERP 422: product UNKNOWN does not exist")
    if job["fail_times"] > 0:
        job["fail_times"] -= 1
        raise Temporary("ERP 503: service unavailable")
    return f"ERP order created for {job['ref']}"

def process(job):
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            print(" ", call_erp(job))
            return
        except Permanent as e:
            dlq.append({**job, "error": str(e), "attempts": attempt})
            print(f"  permanent error, sent to DLQ: {e}")
            return
        except Temporary as e:
            if attempt == MAX_ATTEMPTS:
                break
            wait = min(60, 2 ** attempt) + random.uniform(0, 1)
            print(f"  attempt {attempt} failed ({e}), retry in {wait:.1f}s")
    dlq.append({**job, "error": "gave up after retries", "attempts": MAX_ATTEMPTS})
    print("  gave up, sent to DLQ")

random.seed(3)
for job in [{"ref": "SHOP-6", "sku": "HP-200", "fail_times": 2},
            {"ref": "SHOP-7", "sku": "UNKNOWN", "fail_times": 0},
            {"ref": "SHOP-8", "sku": "TEA", "fail_times": 9}]:
    print(job["ref"])
    process(job)
print("DLQ:", [(j["ref"], j["error"]) for j in dlq])`,
    note: "Real queues schedule the retry for later (with a delay) instead of sleeping inside the worker, so other jobs keep flowing." },
  { h: "Idempotency keys for writes",
    p: ["If a POST times out, you don't know whether it worked. Send an <b>Idempotency-Key</b> header (a stable id for this operation, e.g. the shop order id). A well-built API returns the original result for a repeated key instead of creating a second record. Many payment APIs support this; build it into your own APIs too:"],
    code: `seen_keys = {}
created = []

def create_payment(amount: int, idempotency_key: str) -> dict:
    if idempotency_key in seen_keys:
        return seen_keys[idempotency_key]           # same result, nothing new created
    payment = {"id": f"pay_{len(created) + 1}", "amount": amount}
    created.append(payment)
    seen_keys[idempotency_key] = payment
    return payment

print(create_payment(6900, "order-6-payment"))
print(create_payment(6900, "order-6-payment"))      # retry after a timeout
print("payments created:", len(created))` },
  { h: "Working the DLQ",
    p: ["A DLQ is useless if nobody looks at it. Alert when it's not empty, show each job's error and payload, and give a <b>retry</b> button for after the cause is fixed (e.g. the missing product was created). Track DLQ counts per day; a sudden jump means something changed upstream."] }
 ],
 mistakes: [
  "Retrying permanent errors forever.",
  "Dropping failed jobs silently. Always DLQ with the reason.",
  "Retrying non-idempotent writes without an idempotency key → duplicates.",
  "A DLQ nobody monitors."
 ],
 practice: [
  { q: "Print the backoff schedule <code>min(60, 2**attempt)</code> for attempts 1–8.", code: `print([min(60, 2 ** a) for a in range(1, 9)])` },
  { q: "An ERP returns 409 “order SHOP-6 already exists” when your worker retries. Is that an error?", a: "Not really: it means an earlier attempt succeeded. Treat it as success (look up the existing record and continue). Better still, check by external reference before creating, or use idempotency keys." }
 ],
 check: [
  ["Which errors should be retried?", ["422 validation", "503 and timeouts", "404 unknown product", "400 bad request"], 1, "Temporary ones only."],
  ["What is a dead-letter queue for?", ["Deleting jobs", "Holding jobs that keep failing, for a human to fix and retry", "Speeding up jobs", "Storing logs"], 1, "Nothing lost, nothing blocking."],
  ["Why send an Idempotency-Key with a payment request?", ["Faster payment", "So a retry doesn't create a second payment", "Encryption", "Required by HTTP"], 1, "Same key → same result."]
 ],
 remember: [
  "Temporary (timeout, 429, 5xx) → retry with backoff + jitter, capped.",
  "Permanent (400/404/422) → DLQ immediately with the reason.",
  "DLQ: alert, show error + payload, retry button, daily counts.",
  "Writes: Idempotency-Key or check by external reference first."
 ]
},
{
 id: "failing-api-tests",
 title: "Testing integrations against failing APIs",
 level: "Intermediate",
 one: "Test your integration against <b>fake APIs that misbehave on purpose</b>: timeouts, 500s, 429s, bad JSON, missing fields. That's how you know it survives the real world.",
 why: "Happy-path tests prove little for integrations. Clients care what happens when the other side breaks, and tests that simulate failures are the proof.",
 steps: [
  { h: "Code that can be tested",
    p: ["Pass the HTTP client in (dependency injection) instead of creating it inside the function. Then tests can give it a fake transport."],
    code: `import httpx

def fetch_order(client: httpx.Client, order_id: int) -> dict:
    r = client.get(f"/orders/{order_id}", timeout=5)
    if r.status_code == 404:
        return {"found": False}
    r.raise_for_status()
    data = r.json()
    return {"found": True, "id": data["id"], "status": data["status"]}

def handler(request):
    return httpx.Response(200, json={"id": 6, "status": "paid", "extra": "ignored"})

client = httpx.Client(base_url="https://erp.example.com", transport=httpx.MockTransport(handler))
print(fetch_order(client, 6))` },
  { h: "Simulating failures",
    p: ["A fake transport can return any status, delay, or broken body. Write one test per failure you care about."],
    code: `import httpx, pytest

def fetch_order(client, order_id):
    r = client.get(f"/orders/{order_id}", timeout=5)
    if r.status_code == 404:
        return {"found": False}
    r.raise_for_status()
    data = r.json()
    return {"found": True, "id": data["id"], "status": data["status"]}

def client_returning(handler):
    return httpx.Client(base_url="https://erp.example.com", transport=httpx.MockTransport(handler))

def test_not_found_is_handled():
    c = client_returning(lambda req: httpx.Response(404))
    assert fetch_order(c, 9) == {"found": False}

def test_server_error_raises():
    c = client_returning(lambda req: httpx.Response(503))
    with pytest.raises(httpx.HTTPStatusError):
        fetch_order(c, 6)

def test_timeout_raises():
    def slow(req):
        raise httpx.ReadTimeout("timed out", request=req)
    with pytest.raises(httpx.TimeoutException):
        fetch_order(client_returning(slow), 6)

def test_missing_field_is_noticed():
    c = client_returning(lambda req: httpx.Response(200, json={"id": 6}))
    with pytest.raises(KeyError):
        fetch_order(c, 6)

def test_html_error_page_instead_of_json():
    c = client_returning(lambda req: httpx.Response(200, text="<html>Gateway error</html>"))
    with pytest.raises(ValueError):
        fetch_order(c, 6)`, test: true },
  { h: "Testing retry logic",
    p: ["A fake that fails N times then succeeds lets you check that retries happen, stop at the limit, and don't run for non-retryable errors."],
    code: `import httpx

def get_with_retry(client, url, tries=3, sleep=lambda s: None):
    for attempt in range(1, tries + 1):
        r = client.get(url)
        if r.status_code < 500 and r.status_code != 429:
            return r
        if attempt < tries:
            sleep(2 ** attempt)
    r.raise_for_status()

def flaky(fail_times):
    calls = {"n": 0}
    def handler(req):
        calls["n"] += 1
        return httpx.Response(503) if calls["n"] <= fail_times else httpx.Response(200, json={"ok": True})
    return handler, calls

def make(handler):
    return httpx.Client(base_url="https://x.test", transport=httpx.MockTransport(handler))

def test_recovers_after_two_failures():
    h, calls = flaky(2)
    assert get_with_retry(make(h), "/a").json() == {"ok": True}
    assert calls["n"] == 3

def test_gives_up_after_limit():
    h, calls = flaky(10)
    try:
        get_with_retry(make(h), "/a")
        assert False, "should have raised"
    except httpx.HTTPStatusError:
        assert calls["n"] == 3

def test_does_not_retry_422():
    calls = {"n": 0}
    def h(req):
        calls["n"] += 1
        return httpx.Response(422)
    assert get_with_retry(make(h), "/a").status_code == 422
    assert calls["n"] == 1`, test: true },
  { h: "Contract tests and sandboxes",
    p: ["Fakes can drift from the real API. Add a few <b>contract tests</b> that run against the provider's <b>sandbox</b> (most payment and shipping APIs have one) on a schedule, checking the response still has the fields you rely on. Keep saved example responses from the real API as test fixtures."] }
 ],
 mistakes: [
  "Only testing the happy path.",
  "Tests that call the real production API: slow, flaky and sometimes costly.",
  "Fakes that are so different from the real API that tests pass and production fails. Base them on real saved responses.",
  "Real sleeps in retry tests. Inject a fake sleep."
 ],
 practice: [
  { q: "Write a test that a 429 response with <code>Retry-After: 7</code> makes your code wait 7 seconds (use a fake sleep that records the value).", code: `import httpx

def get(client, url, sleep):
    r = client.get(url)
    if r.status_code == 429:
        sleep(float(r.headers.get("Retry-After", 1)))
        r = client.get(url)
    return r

def test_respects_retry_after():
    responses = iter([httpx.Response(429, headers={"Retry-After": "7"}), httpx.Response(200)])
    client = httpx.Client(base_url="https://x.test", transport=httpx.MockTransport(lambda req: next(responses)))
    waited = []
    assert get(client, "/a", sleep=waited.append).status_code == 200
    assert waited == [7.0]`, test: true },
  { q: "List five failure cases every integration should be tested against.", a: "Timeout, 5xx server error, 429 rate limit (with Retry-After), 401 expired credentials, 404 missing record, 422 validation error, malformed/HTML body, missing or renamed field, duplicate event, out-of-order events." }
 ],
 check: [
  ["How do you make API-calling code testable?", ["Call the real API in tests", "Pass the HTTP client/transport in, so tests can use a fake", "Use print", "Make it async"], 1, "Dependency injection."],
  ["Why inject a fake sleep in retry tests?", ["Style", "So tests run instantly and you can check wait times", "Required by pytest", "To slow tests"], 1, "Fast, checkable tests."],
  ["What are contract tests for?", ["UI", "Checking the real API (sandbox) still matches what your code expects", "Load testing", "Pricing"], 1, "Catch drift between fakes and reality."]
 ],
 remember: [
  "Inject the HTTP client; use httpx.MockTransport in tests.",
  "Test: timeout, 5xx, 429, 401, 404, 422, bad body, missing fields.",
  "Retry tests: fake that fails N times; fake sleep; check call counts.",
  "Contract tests against sandboxes; fixtures from real responses."
 ]
},
{
 id: "logging-health",
 title: "Logging, monitoring and health checks",
 level: "Intermediate",
 one: "You can't fix what you can't see. Use <b>structured logs</b> with a <b>correlation id</b>, track a few <b>metrics</b> (processed, failed, lag, DLQ size), expose a <b>health check</b>, and <b>alert</b> on what matters.",
 why: "Integrations fail at 3 a.m. Good logging and alerts turn “the client noticed missing orders a week later” into “we got an alert and fixed it in 10 minutes”.",
 steps: [
  { h: "Structured logs",
    p: ["Log JSON with fixed fields instead of free text, so you can search “all errors for order 6” or count failures per hour."],
    code: `import json, logging, sys

class JsonFormatter(logging.Formatter):
    def format(self, record):
        base = {"level": record.levelname, "msg": record.getMessage(), "logger": record.name}
        return json.dumps({**base, **getattr(record, "ctx", {})})

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("erp_sync")
log.addHandler(handler)
log.setLevel(logging.INFO)

log.info("order synced", extra={"ctx": {"order_ref": "SHOP-6", "erp_id": 4417, "ms": 230}})
log.warning("retrying", extra={"ctx": {"order_ref": "SHOP-8", "attempt": 2, "status": 503}})
log.error("sent to DLQ", extra={"ctx": {"order_ref": "SHOP-7", "error": "unknown product UNKNOWN"}})` },
  { h: "Correlation ids: follow one event everywhere",
    p: ["Give each incoming event an id and put it in every log line, queue job and outgoing request header (<code>X-Request-Id</code>). Then one search shows the event's whole journey across services."],
    code: `import uuid, contextvars

request_id = contextvars.ContextVar("request_id", default="-")

def log(msg, **fields):
    print({"request_id": request_id.get(), "msg": msg, **fields})

def handle_webhook(event):
    request_id.set(event.get("id") or str(uuid.uuid4()))
    log("webhook received", type=event["type"])
    enqueue(event)

def enqueue(event):
    log("job queued", queue="erp_sync")

handle_webhook({"id": "evt_42", "type": "order.paid"})` },
  { h: "Metrics that matter",
    p: ["For an integration, track: events received, processed, failed, retries, <b>DLQ size</b>, <b>queue lag</b> (age of the oldest waiting job) and <b>end-to-end delay</b>. Lag and DLQ size are the two numbers that tell you something is wrong."],
    code: `from datetime import datetime, timedelta

now = datetime(2025, 7, 3, 10, 0)
queued_at = [now - timedelta(minutes=m) for m in (1, 2, 45)]
dlq_size = 3

lag_minutes = (now - min(queued_at)).total_seconds() / 60
alerts = []
if lag_minutes > 15:
    alerts.append(f"queue lag {lag_minutes:.0f} min (limit 15)")
if dlq_size > 0:
    alerts.append(f"{dlq_size} jobs in DLQ")
print(alerts or "all good")` },
  { h: "Health checks",
    p: ["A <code>/health</code> endpoint lets load balancers and uptime monitors check the service. A <b>liveness</b> check says “the process is running”; a <b>readiness</b> check also tests key dependencies (database, queue) and reports what's broken."],
    code: `from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

app = FastAPI()
deps = {"database": lambda: True, "queue": lambda: True, "erp_api": lambda: False}

@app.get("/health/live")
def live():
    return {"status": "ok"}

@app.get("/health/ready")
def ready():
    results = {name: ("ok" if check() else "down") for name, check in deps.items()}
    code = 200 if all(v == "ok" for v in results.values()) else 503
    return JSONResponse(results, status_code=code)

c = TestClient(app)
print(c.get("/health/live").json())
r = c.get("/health/ready")
print(r.status_code, r.json())` },
  { h: "Alerts people act on",
    p: ["Alert on <b>symptoms users feel</b> (lag too high, DLQ growing, error rate up, no events received for an hour during business hours), not on every single error. Each alert should say what's wrong and link to a short runbook: how to check, how to fix, who to call."] }
 ],
 mistakes: [
  "Free-text logs you can't search or count.",
  "Logging secrets, tokens or full card numbers.",
  "No correlation id: one event's story is scattered across services.",
  "Alerting on everything, so people ignore alerts.",
  "A health check that always says ok even when the database is down."
 ],
 practice: [
  { q: "Write an alert rule: alert if no events were received in the last 60 minutes between 9:00 and 21:00.", code: `from datetime import datetime, timedelta

def silent_alert(last_event: datetime, now: datetime) -> str | None:
    if 9 <= now.hour < 21 and now - last_event > timedelta(minutes=60):
        return f"No events for {int((now - last_event).total_seconds() // 60)} minutes"
    return None

print(silent_alert(datetime(2025, 7, 3, 11, 0), datetime(2025, 7, 3, 12, 30)))
print(silent_alert(datetime(2025, 7, 3, 1, 0), datetime(2025, 7, 3, 3, 0)))` },
  { q: "What should a runbook entry for “DLQ not empty” contain?", a: "How to view DLQ jobs and their errors; the common causes (unknown product, missing customer, expired credentials) and the fix for each; how to retry jobs after fixing; when to escalate and to whom." }
 ],
 check: [
  ["Why structured (JSON) logs?", ["Prettier", "Searchable and countable by field", "Smaller files", "Required by Python"], 1, "Query logs like data."],
  ["What does a correlation id give you?", ["Encryption", "One id to follow an event across all logs and services", "Faster queues", "Fewer logs"], 1, "Trace the whole journey."],
  ["Two numbers that best show an integration is in trouble?", ["CPU and RAM", "Queue lag and DLQ size", "Lines of code", "Number of workers"], 1, "Watch those first."]
 ],
 remember: [
  "JSON logs with fixed fields; never log secrets.",
  "Correlation id in every log, job and outgoing request.",
  "Metrics: received, processed, failed, retries, DLQ size, queue lag.",
  "/health/live and /health/ready (checks dependencies, 503 if down).",
  "Alert on symptoms, with a runbook link."
 ]
}
];
