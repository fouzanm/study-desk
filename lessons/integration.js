// Lessons for course "integration". Built by tools/course-builder from tools/courses/integration.js.
// Python examples were run and their real output stored.
(function (L) {
L["integration:patterns"] = {
 "title": "Integration patterns: how systems talk",
 "level": "Intermediate",
 "one": "Systems connect in a few standard ways: <b>request/response APIs</b>, <b>webhooks</b>, <b>polling</b>, <b>file drops</b> (CSV/SFTP), <b>message queues</b> and <b>change data capture</b>. Picking the right one is half the job.",
 "why": "Integration engineers spend their days connecting a client's ERP, CRM, shop, payment provider and warehouse. Choosing the right pattern decides whether it runs quietly for years or breaks every week.",
 "steps": [
  {
   "h": "The main patterns",
   "p": [
    "<b>API call (sync)</b>: ask and wait for the answer. Simple; both systems must be up. <b>Webhook</b>: the other system pushes events to you. Fast; you must handle duplicates and downtime. <b>Polling</b>: you ask “anything new since X?” on a schedule. Simple and robust; slower. <b>File exchange</b>: CSV/XML files over SFTP or cloud storage, typical for banks, logistics and old ERPs. <b>Message queue</b>: put work on a queue and let workers process it. Decouples systems and absorbs spikes. <b>CDC</b>: stream every database change (covered in the Kafka course)."
   ]
  },
  {
   "h": "Sync vs async",
   "p": [
    "<b>Synchronous</b>: the caller waits (checkout asks the payment API). Use when the user needs the answer now. <b>Asynchronous</b>: the caller hands off work and moves on (send the order to the warehouse system). Use whenever the user doesn't need to wait; it's more reliable because a slow or down system doesn't block yours."
   ]
  },
  {
   "h": "Polling with a watermark",
   "p": [
    "Remember the last thing you processed (a timestamp or id: the <b>watermark</b>) and ask only for newer items. Save the watermark only after processing succeeds."
   ],
   "code": "ORDERS = [\n    {\"id\": 101, \"updated_at\": \"2025-07-01T09:00\"},\n    {\"id\": 102, \"updated_at\": \"2025-07-01T09:05\"},\n    {\"id\": 103, \"updated_at\": \"2025-07-01T09:12\"},\n]\nstate = {\"watermark\": \"2025-07-01T09:01\"}\n\ndef fetch_changed_since(ts):                 # stand-in for GET /orders?updated_after=ts\n    return [o for o in ORDERS if o[\"updated_at\"] > ts]\n\ndef poll_once():\n    new = sorted(fetch_changed_since(state[\"watermark\"]), key=lambda o: o[\"updated_at\"])\n    for order in new:\n        print(\"processing order\", order[\"id\"])\n        state[\"watermark\"] = order[\"updated_at\"]      # move forward after each success\n    print(\"watermark now\", state[\"watermark\"])\n\npoll_once()\npoll_once()",
   "note": "Use “greater than or equal” plus de-duplication if two records can share a timestamp, so nothing is skipped.",
   "out": {
    "text": "processing order 102\nprocessing order 103\nwatermark now 2025-07-01T09:12\nwatermark now 2025-07-01T09:12"
   }
  },
  {
   "h": "Choosing a pattern",
   "p": [
    "Ask: How fast must data arrive (seconds, minutes, nightly)? What does the other system support? What happens when either side is down? How much data? Who owns failures?",
    "Common answer for “sync shop orders into the ERP”: <b>webhook → queue → worker</b>, with a nightly reconciliation poll to catch anything missed. The next lessons build exactly that."
   ],
   "code": "shop ──webhook──► intake API ──► queue ──► worker ──► ERP API\n                     (verify, save,          (retry,\n                      return 200 fast)        idempotent)\nnightly: reconcile job compares shop vs ERP and fixes gaps",
   "lang": "text"
  },
  {
   "h": "Mapping data between systems",
   "p": [
    "Every system names things differently. Write the mapping explicitly in one place, convert units and codes, and fail loudly on values you don't know."
   ],
   "code": "STATUS_MAP = {\"paid\": \"sale\", \"pending_payment\": \"draft\", \"refunded\": \"cancel\"}   # shop -> ERP\n\ndef to_erp(order: dict) -> dict:\n    if order[\"status\"] not in STATUS_MAP:\n        raise ValueError(f\"unknown shop status {order['status']!r}\")\n    return {\n        \"client_order_ref\": f\"SHOP-{order['id']}\",\n        \"partner_email\": order[\"customer\"][\"email\"].lower(),\n        \"state\": STATUS_MAP[order[\"status\"]],\n        \"amount_total\": round(order[\"total_paise\"] / 100, 2),\n        \"lines\": [{\"product_code\": l[\"sku\"], \"qty\": l[\"quantity\"]} for l in order[\"items\"]],\n    }\n\nshop_order = {\"id\": 6, \"status\": \"paid\", \"total_paise\": 690000,\n              \"customer\": {\"email\": \"Asha@Example.com\"}, \"items\": [{\"sku\": \"HP-200\", \"quantity\": 2}]}\nprint(to_erp(shop_order))",
   "out": {
    "text": "{'client_order_ref': 'SHOP-6', 'partner_email': 'asha@example.com', 'state': 'sale', 'amount_total': 6900.0, 'lines': [{'product_code': 'HP-200', 'qty': 2}]}"
   }
  }
 ],
 "mistakes": [
  "Making everything synchronous: one slow system freezes the whole chain.",
  "No reconciliation: missed webhooks become silent data gaps.",
  "Mapping logic scattered across the code instead of one tested place.",
  "Silently mapping unknown values to a default."
 ],
 "practice": [
  {
   "q": "A bank sends a CSV of yesterday's payments to an SFTP folder every morning at 6. Which pattern, and what must your job handle?",
   "a": "File exchange on a schedule. Handle: the file arriving late or twice (track processed file names/hashes), partial files (wait for a “done” marker or check row counts), bad rows (report them), and re-running safely (idempotent inserts)."
  },
  {
   "q": "Extend <code>to_erp</code> to raise a clear error when an item has quantity 0.",
   "code": "def check_lines(items):\n    for i, l in enumerate(items):\n        if l[\"quantity\"] <= 0:\n            raise ValueError(f\"line {i}: quantity must be positive, got {l['quantity']}\")\n\ntry:\n    check_lines([{\"sku\": \"HP-200\", \"quantity\": 2}, {\"sku\": \"TEA\", \"quantity\": 0}])\nexcept ValueError as e:\n    print(e)",
   "out": {
    "text": "line 1: quantity must be positive, got 0"
   }
  }
 ],
 "check": [
  [
   "When is a synchronous API call the right choice?",
   [
    "Always",
    "When the user needs the answer right now",
    "For nightly jobs",
    "Never"
   ],
   1,
   "Otherwise prefer async."
  ],
  [
   "What is a watermark in polling?",
   [
    "A logo",
    "The last processed timestamp/id, so you only fetch newer items",
    "An error code",
    "A queue"
   ],
   1,
   "Move it forward only after success."
  ],
  [
   "Why add a nightly reconciliation?",
   [
    "Fun",
    "To catch anything webhooks or workers missed",
    "It's faster",
    "Required by REST"
   ],
   1,
   "Webhooks can be lost."
  ]
 ],
 "remember": [
  "Patterns: API call, webhook, polling, file exchange, queue, CDC.",
  "Sync when the user must wait; async otherwise.",
  "Polling: watermark, advance only after success.",
  "Common design: webhook → queue → worker + nightly reconciliation.",
  "One explicit, tested mapping; fail loudly on unknown values."
 ]
};
L["integration:queue-worker"] = {
 "title": "Queues and workers",
 "level": "Intermediate",
 "one": "A <b>queue</b> holds jobs; <b>workers</b> take jobs one by one and process them. The producer doesn't wait, spikes are absorbed, and failed jobs can be retried.",
 "why": "Queues are how reliable integrations handle thousands of events without dropping any. Interviewers love asking “what happens when the downstream system is down?”, and a queue is the answer.",
 "steps": [
  {
   "h": "Producer, queue, worker",
   "p": [
    "The web request (producer) only adds a job and returns. Workers process jobs in the background, at their own pace."
   ],
   "code": "from collections import deque\n\nqueue = deque()\n\ndef on_order_created(order_id):             # producer: fast, just enqueue\n    queue.append({\"type\": \"sync_order\", \"order_id\": order_id})\n    return \"accepted\"\n\ndef worker():                                # consumer: does the slow work\n    while queue:\n        job = queue.popleft()\n        print(\"syncing order\", job[\"order_id\"], \"to ERP\")\n\nfor oid in [6, 7, 8]:\n    print(on_order_created(oid))\nworker()",
   "out": {
    "text": "accepted\naccepted\naccepted\nsyncing order 6 to ERP\nsyncing order 7 to ERP\nsyncing order 8 to ERP"
   }
  },
  {
   "h": "A durable queue",
   "p": [
    "An in-memory list is lost if the process restarts. Real queues are <b>durable</b>: Redis-based (RQ, Celery, BullMQ), cloud (AWS SQS, Google Pub/Sub), RabbitMQ, or simply a <b>database table</b>, which is a perfectly good queue for modest volumes:"
   ],
   "code": "import sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"\"\"CREATE TABLE jobs (\n    id INTEGER PRIMARY KEY, kind TEXT, payload TEXT,\n    status TEXT DEFAULT 'queued', attempts INTEGER DEFAULT 0, last_error TEXT)\"\"\")\n\ndef enqueue(kind, payload):\n    db.execute(\"INSERT INTO jobs (kind, payload) VALUES (?, ?)\", (kind, payload))\n\ndef claim_next():\n    row = db.execute(\"SELECT id, kind, payload FROM jobs WHERE status='queued' ORDER BY id LIMIT 1\").fetchone()\n    if row:\n        db.execute(\"UPDATE jobs SET status='running', attempts=attempts+1 WHERE id=?\", (row[0],))\n    return row\n\nfor oid in [6, 7]:\n    enqueue(\"sync_order\", f'{{\"order_id\": {oid}}}')\njob = claim_next()\nprint(\"claimed:\", job)\ndb.execute(\"UPDATE jobs SET status='done' WHERE id=?\", (job[0],))\nprint(db.execute(\"SELECT id, status, attempts FROM jobs\").fetchall())",
   "note": "In PostgreSQL, claim jobs with <code>SELECT … FOR UPDATE SKIP LOCKED</code> so several workers never grab the same job.",
   "out": {
    "text": "claimed: (1, 'sync_order', '{\"order_id\": 6}')\n[(1, 'done', 1), (2, 'queued', 0)]"
   }
  },
  {
   "h": "At-least-once delivery",
   "p": [
    "Most queues guarantee each job is delivered <b>at least once</b>: if a worker crashes after doing the work but before marking it done, the job runs again. So workers must be <b>idempotent</b>: running a job twice must have the same effect as once."
   ],
   "code": "synced = {}\n\ndef sync_order(order_id: int, payload: dict):\n    ref = f\"SHOP-{order_id}\"\n    if ref in synced:                      # in real life: look up the ERP by external reference\n        print(f\"{ref} already in ERP, updating instead of creating\")\n    synced[ref] = payload\n    return ref\n\nsync_order(6, {\"total\": 6900})\nsync_order(6, {\"total\": 6900})            # delivered twice\nprint(synced)",
   "out": {
    "text": "SHOP-6 already in ERP, updating instead of creating\n{'SHOP-6': {'total': 6900}}"
   }
  },
  {
   "h": "Scaling and ordering",
   "p": [
    "More workers = more throughput, but jobs can finish out of order. If order matters (all updates to one order must apply in sequence), route jobs for the same key to the same worker/partition, or include a version number and ignore older updates."
   ],
   "code": "current = {}\n\ndef apply_update(order_id: int, version: int, status: str):\n    if version <= current.get(order_id, (0, None))[0]:\n        print(f\"ignore stale v{version} for order {order_id}\")\n        return\n    current[order_id] = (version, status)\n\napply_update(6, 2, \"shipped\")\napply_update(6, 1, \"paid\")        # arrived late\nprint(current)",
   "out": {
    "text": "ignore stale v1 for order 6\n{6: (2, 'shipped')}"
   }
  }
 ],
 "mistakes": [
  "Doing slow work inside the web request instead of enqueueing it.",
  "In-memory queues for anything that matters: a restart loses jobs.",
  "Workers that aren't idempotent, so duplicate deliveries create duplicate records.",
  "Assuming jobs finish in the order they were added."
 ],
 "practice": [
  {
   "q": "Using the SQLite queue, enqueue 3 jobs, claim and complete them all, and show the final table.",
   "code": "import sqlite3\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE jobs (id INTEGER PRIMARY KEY, payload TEXT, status TEXT DEFAULT 'queued')\")\nfor p in [\"a\", \"b\", \"c\"]:\n    db.execute(\"INSERT INTO jobs (payload) VALUES (?)\", (p,))\nwhile (row := db.execute(\"SELECT id FROM jobs WHERE status='queued' ORDER BY id LIMIT 1\").fetchone()):\n    db.execute(\"UPDATE jobs SET status='done' WHERE id=?\", row)\nprint(db.execute(\"SELECT * FROM jobs\").fetchall())",
   "out": {
    "text": "[(1, 'a', 'done'), (2, 'b', 'done'), (3, 'c', 'done')]"
   }
  },
  {
   "q": "The ERP is down for 2 hours. What happens to orders in a queue-based design vs a synchronous one?",
   "a": "Queue: orders keep arriving and wait in the queue; workers retry and catch up when the ERP is back, with no lost orders and no slow checkout. Synchronous: every checkout waits or fails while the ERP is down."
  }
 ],
 "check": [
  [
   "Main benefit of a queue?",
   [
    "Faster CPUs",
    "Producers don't wait; spikes and downtime are absorbed",
    "No code needed",
    "Exactly-once delivery always"
   ],
   1,
   "Decoupling."
  ],
  [
   "At-least-once delivery means workers must be…",
   [
    "Fast",
    "Idempotent",
    "Single-threaded",
    "Synchronous"
   ],
   1,
   "Duplicates will happen."
  ],
  [
   "Jobs for the same order finish out of order. A fix?",
   [
    "Ignore it",
    "Version numbers (ignore older) or route same key to one worker",
    "Add more workers",
    "Use polling"
   ],
   1,
   "Guard ordering explicitly."
  ]
 ],
 "remember": [
  "Producer enqueues fast; workers do slow work in the background.",
  "Durable queues: Redis/RQ/Celery, SQS, RabbitMQ, or a DB table (FOR UPDATE SKIP LOCKED).",
  "At-least-once → idempotent workers (look up by external reference).",
  "Out-of-order: version numbers or same-key routing."
 ]
};
L["integration:webhook-intake"] = {
 "title": "A reliable webhook intake",
 "level": "Intermediate",
 "one": "A good intake endpoint does four things fast: <b>verify</b> the signature, <b>store</b> the raw event (deduplicated by event id), <b>enqueue</b> a job, and <b>return 200</b>. Everything else happens in workers.",
 "why": "This small piece is where most integrations lose data. Done right, you never lose an event and can replay any of them later.",
 "steps": [
  {
   "h": "Store every raw event",
   "p": [
    "Save the raw body and headers before doing anything else. If processing has a bug, you fix it and <b>replay</b> stored events. A UNIQUE event id makes duplicates harmless."
   ],
   "code": "import sqlite3, json\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"\"\"CREATE TABLE inbound_events (\n    event_id TEXT PRIMARY KEY, source TEXT, type TEXT, body TEXT,\n    received_at TEXT DEFAULT CURRENT_TIMESTAMP, processed INTEGER DEFAULT 0)\"\"\")\n\ndef save_event(source, event) -> bool:\n    try:\n        db.execute(\"INSERT INTO inbound_events (event_id, source, type, body) VALUES (?, ?, ?, ?)\",\n                   (event[\"id\"], source, event[\"type\"], json.dumps(event)))\n        return True\n    except sqlite3.IntegrityError:\n        return False                    # duplicate: already stored\n\ne = {\"id\": \"evt_1\", \"type\": \"order.paid\", \"order_id\": 6}\nprint(save_event(\"shop\", e), save_event(\"shop\", e))\nprint(db.execute(\"SELECT event_id, type, processed FROM inbound_events\").fetchall())",
   "out": {
    "text": "True False\n[('evt_1', 'order.paid', 0)]"
   }
  },
  {
   "h": "The endpoint",
   "code": "import hmac, hashlib, json, sqlite3\nfrom fastapi import FastAPI, Request, HTTPException\nfrom fastapi.testclient import TestClient\n\nSECRET = b\"whsec_test\"\ndb = sqlite3.connect(\":memory:\", check_same_thread=False)\ndb.execute(\"CREATE TABLE inbound_events (event_id TEXT PRIMARY KEY, type TEXT, body TEXT, processed INTEGER DEFAULT 0)\")\ndb.execute(\"CREATE TABLE jobs (id INTEGER PRIMARY KEY, event_id TEXT, status TEXT DEFAULT 'queued')\")\napp = FastAPI()\n\n@app.post(\"/webhooks/shop\")\nasync def shop_webhook(request: Request):\n    raw = await request.body()\n    sig = hmac.new(SECRET, raw, hashlib.sha256).hexdigest()\n    if not hmac.compare_digest(sig, request.headers.get(\"X-Shop-Signature\", \"\")):\n        raise HTTPException(401, \"bad signature\")\n    event = json.loads(raw)\n    try:\n        with db:\n            db.execute(\"INSERT INTO inbound_events (event_id, type, body) VALUES (?, ?, ?)\",\n                       (event[\"id\"], event[\"type\"], raw.decode()))\n            db.execute(\"INSERT INTO jobs (event_id) VALUES (?)\", (event[\"id\"],))\n    except sqlite3.IntegrityError:\n        return {\"status\": \"duplicate\"}\n    return {\"status\": \"accepted\"}\n\nc = TestClient(app)\nbody = json.dumps({\"id\": \"evt_42\", \"type\": \"order.paid\", \"order_id\": 6}).encode()\nsig = hmac.new(SECRET, body, hashlib.sha256).hexdigest()\nfor _ in range(2):\n    print(c.post(\"/webhooks/shop\", content=body, headers={\"X-Shop-Signature\": sig}).json())\nprint(db.execute(\"SELECT * FROM jobs\").fetchall())",
   "note": "The event row and the job row are saved in <b>one transaction</b> (<code>with db:</code>), so you never have an event without a job or a job without its event.",
   "out": {
    "text": "{'status': 'accepted'}\n{'status': 'duplicate'}\n[(1, 'evt_42', 'queued')]"
   }
  },
  {
   "h": "The worker processes stored events",
   "code": "import sqlite3, json\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE inbound_events (event_id TEXT PRIMARY KEY, type TEXT, body TEXT, processed INTEGER DEFAULT 0)\")\nfor i, t in [(1, \"order.paid\"), (2, \"order.refunded\"), (3, \"customer.updated\")]:\n    db.execute(\"INSERT INTO inbound_events VALUES (?, ?, ?, 0)\", (f\"evt_{i}\", t, json.dumps({\"order_id\": 5 + i})))\n\nHANDLERS = {\n    \"order.paid\": lambda e: f\"confirm order {e['order_id']} in ERP\",\n    \"order.refunded\": lambda e: f\"cancel order {e['order_id']} in ERP\",\n}\n\nfor event_id, etype, body in db.execute(\"SELECT event_id, type, body FROM inbound_events WHERE processed = 0\").fetchall():\n    handler = HANDLERS.get(etype)\n    print(event_id, \"->\", handler(json.loads(body)) if handler else f\"no handler for {etype}, skipped\")\n    db.execute(\"UPDATE inbound_events SET processed = 1 WHERE event_id = ?\", (event_id,))\nprint(db.execute(\"SELECT count(*) FROM inbound_events WHERE processed = 0\").fetchone()[0], \"left\")",
   "out": {
    "text": "evt_1 -> confirm order 6 in ERP\nevt_2 -> cancel order 7 in ERP\nevt_3 -> no handler for customer.updated, skipped\n0 left"
   }
  },
  {
   "h": "Replay",
   "p": [
    "Because raw events are stored, fixing a bug is: deploy the fix, mark the affected events <code>processed = 0</code>, let the worker run again. Idempotent handlers make replay safe. This one capability saves countless late nights."
   ]
  }
 ],
 "mistakes": [
  "Processing inside the request: slow responses cause provider retries and duplicates.",
  "Not storing raw events, so a bug means lost data.",
  "Saving the event and the job in separate transactions.",
  "Crashing on unknown event types instead of logging and skipping them."
 ],
 "practice": [
  {
   "q": "Write the SQL to replay all <code>order.paid</code> events received on 2025-07-03.",
   "code": "UPDATE inbound_events\nSET processed = 0\nWHERE type = 'order.paid'\n  AND received_at >= '2025-07-03' AND received_at < '2025-07-04';",
   "lang": "sql"
  },
  {
   "q": "Why return 200 for a duplicate event instead of an error?",
   "a": "The provider only needs to know you have it. An error makes it retry again and again. Returning 200 (“already have it”) stops the retries."
  }
 ],
 "check": [
  [
   "What should the intake endpoint do before returning 200?",
   [
    "All processing",
    "Verify, store raw event, enqueue job",
    "Nothing",
    "Email the team"
   ],
   1,
   "Fast and safe."
  ],
  [
   "Why store raw events?",
   [
    "Disk is cheap",
    "So you can replay them after fixing a bug",
    "Required by HTTP",
    "For style"
   ],
   1,
   "Replay is a superpower."
  ],
  [
   "A duplicate event arrives. Respond with…",
   [
    "500",
    "200 'duplicate'",
    "401",
    "Nothing"
   ],
   1,
   "Stops pointless retries."
  ]
 ],
 "remember": [
  "Intake: verify → store raw (UNIQUE event id) → enqueue → 200, in one transaction.",
  "Workers process stored events; unknown types are logged and skipped.",
  "Replay = mark events unprocessed and re-run (handlers must be idempotent).",
  "Duplicates get 200."
 ]
};
L["integration:retries-dlq"] = {
 "title": "Retries, dead-letter queues and idempotency keys",
 "level": "Intermediate",
 "one": "Workers retry temporary failures with backoff. Jobs that keep failing go to a <b>dead-letter queue (DLQ)</b> for a human, instead of blocking or disappearing. <b>Idempotency keys</b> make retried writes safe.",
 "why": "This is the difference between “the integration broke over the weekend and we lost 300 orders” and “3 orders are waiting in the DLQ with clear errors”.",
 "steps": [
  {
   "h": "Temporary vs permanent errors",
   "p": [
    "<b>Temporary</b>: timeouts, 429, 5xx, connection errors. Retry with backoff. <b>Permanent</b>: 400/422 validation errors, unknown product, missing customer. Retrying won't help; send to the DLQ right away with the reason."
   ],
   "code": "class Temporary(Exception): pass\nclass Permanent(Exception): pass\n\ndef classify_http_error(status: int) -> type[Exception]:\n    return Temporary if status in (408, 429) or status >= 500 else Permanent\n\nfor s in [503, 429, 422, 404, 500]:\n    print(s, classify_http_error(s).__name__)",
   "out": {
    "text": "503 Temporary\n429 Temporary\n422 Permanent\n404 Permanent\n500 Temporary"
   }
  },
  {
   "h": "Worker with retries and a DLQ",
   "code": "import random\n\nclass Temporary(Exception): pass\nclass Permanent(Exception): pass\n\nMAX_ATTEMPTS = 4\ndlq = []\n\ndef call_erp(job):                                   # stand-in for the real API call\n    if job[\"sku\"] == \"UNKNOWN\":\n        raise Permanent(\"ERP 422: product UNKNOWN does not exist\")\n    if job[\"fail_times\"] > 0:\n        job[\"fail_times\"] -= 1\n        raise Temporary(\"ERP 503: service unavailable\")\n    return f\"ERP order created for {job['ref']}\"\n\ndef process(job):\n    for attempt in range(1, MAX_ATTEMPTS + 1):\n        try:\n            print(\" \", call_erp(job))\n            return\n        except Permanent as e:\n            dlq.append({**job, \"error\": str(e), \"attempts\": attempt})\n            print(f\"  permanent error, sent to DLQ: {e}\")\n            return\n        except Temporary as e:\n            if attempt == MAX_ATTEMPTS:\n                break\n            wait = min(60, 2 ** attempt) + random.uniform(0, 1)\n            print(f\"  attempt {attempt} failed ({e}), retry in {wait:.1f}s\")\n    dlq.append({**job, \"error\": \"gave up after retries\", \"attempts\": MAX_ATTEMPTS})\n    print(\"  gave up, sent to DLQ\")\n\nrandom.seed(3)\nfor job in [{\"ref\": \"SHOP-6\", \"sku\": \"HP-200\", \"fail_times\": 2},\n            {\"ref\": \"SHOP-7\", \"sku\": \"UNKNOWN\", \"fail_times\": 0},\n            {\"ref\": \"SHOP-8\", \"sku\": \"TEA\", \"fail_times\": 9}]:\n    print(job[\"ref\"])\n    process(job)\nprint(\"DLQ:\", [(j[\"ref\"], j[\"error\"]) for j in dlq])",
   "note": "Real queues schedule the retry for later (with a delay) instead of sleeping inside the worker, so other jobs keep flowing.",
   "out": {
    "text": "SHOP-6\n  attempt 1 failed (ERP 503: service unavailable), retry in 2.2s\n  attempt 2 failed (ERP 503: service unavailable), retry in 4.5s\n  ERP order created for SHOP-6\nSHOP-7\n  permanent error, sent to DLQ: ERP 422: product UNKNOWN does not exist\nSHOP-8\n  attempt 1 failed (ERP 503: service unavailable), retry in 2.4s\n  attempt 2 failed (ERP 503: service unavailable), retry in 4.6s\n  attempt 3 failed (ERP 503: service unavailable), retry in 8.6s\n  gave up, sent to DLQ\nDLQ: [('SHOP-7', 'ERP 422: product UNKNOWN does not exist'), ('SHOP-8', 'gave up after retries')]"
   }
  },
  {
   "h": "Idempotency keys for writes",
   "p": [
    "If a POST times out, you don't know whether it worked. Send an <b>Idempotency-Key</b> header (a stable id for this operation, e.g. the shop order id). A well-built API returns the original result for a repeated key instead of creating a second record. Many payment APIs support this; build it into your own APIs too:"
   ],
   "code": "seen_keys = {}\ncreated = []\n\ndef create_payment(amount: int, idempotency_key: str) -> dict:\n    if idempotency_key in seen_keys:\n        return seen_keys[idempotency_key]           # same result, nothing new created\n    payment = {\"id\": f\"pay_{len(created) + 1}\", \"amount\": amount}\n    created.append(payment)\n    seen_keys[idempotency_key] = payment\n    return payment\n\nprint(create_payment(6900, \"order-6-payment\"))\nprint(create_payment(6900, \"order-6-payment\"))      # retry after a timeout\nprint(\"payments created:\", len(created))",
   "out": {
    "text": "{'id': 'pay_1', 'amount': 6900}\n{'id': 'pay_1', 'amount': 6900}\npayments created: 1"
   }
  },
  {
   "h": "Working the DLQ",
   "p": [
    "A DLQ is useless if nobody looks at it. Alert when it's not empty, show each job's error and payload, and give a <b>retry</b> button for after the cause is fixed (e.g. the missing product was created). Track DLQ counts per day; a sudden jump means something changed upstream."
   ]
  }
 ],
 "mistakes": [
  "Retrying permanent errors forever.",
  "Dropping failed jobs silently. Always DLQ with the reason.",
  "Retrying non-idempotent writes without an idempotency key → duplicates.",
  "A DLQ nobody monitors."
 ],
 "practice": [
  {
   "q": "Print the backoff schedule <code>min(60, 2**attempt)</code> for attempts 1–8.",
   "code": "print([min(60, 2 ** a) for a in range(1, 9)])",
   "out": {
    "text": "[2, 4, 8, 16, 32, 60, 60, 60]"
   }
  },
  {
   "q": "An ERP returns 409 “order SHOP-6 already exists” when your worker retries. Is that an error?",
   "a": "Not really: it means an earlier attempt succeeded. Treat it as success (look up the existing record and continue). Better still, check by external reference before creating, or use idempotency keys."
  }
 ],
 "check": [
  [
   "Which errors should be retried?",
   [
    "422 validation",
    "503 and timeouts",
    "404 unknown product",
    "400 bad request"
   ],
   1,
   "Temporary ones only."
  ],
  [
   "What is a dead-letter queue for?",
   [
    "Deleting jobs",
    "Holding jobs that keep failing, for a human to fix and retry",
    "Speeding up jobs",
    "Storing logs"
   ],
   1,
   "Nothing lost, nothing blocking."
  ],
  [
   "Why send an Idempotency-Key with a payment request?",
   [
    "Faster payment",
    "So a retry doesn't create a second payment",
    "Encryption",
    "Required by HTTP"
   ],
   1,
   "Same key → same result."
  ]
 ],
 "remember": [
  "Temporary (timeout, 429, 5xx) → retry with backoff + jitter, capped.",
  "Permanent (400/404/422) → DLQ immediately with the reason.",
  "DLQ: alert, show error + payload, retry button, daily counts.",
  "Writes: Idempotency-Key or check by external reference first."
 ]
};
L["integration:failing-api-tests"] = {
 "title": "Testing integrations against failing APIs",
 "level": "Intermediate",
 "one": "Test your integration against <b>fake APIs that misbehave on purpose</b>: timeouts, 500s, 429s, bad JSON, missing fields. That's how you know it survives the real world.",
 "why": "Happy-path tests prove little for integrations. Clients care what happens when the other side breaks, and tests that simulate failures are the proof.",
 "steps": [
  {
   "h": "Code that can be tested",
   "p": [
    "Pass the HTTP client in (dependency injection) instead of creating it inside the function. Then tests can give it a fake transport."
   ],
   "code": "import httpx\n\ndef fetch_order(client: httpx.Client, order_id: int) -> dict:\n    r = client.get(f\"/orders/{order_id}\", timeout=5)\n    if r.status_code == 404:\n        return {\"found\": False}\n    r.raise_for_status()\n    data = r.json()\n    return {\"found\": True, \"id\": data[\"id\"], \"status\": data[\"status\"]}\n\ndef handler(request):\n    return httpx.Response(200, json={\"id\": 6, \"status\": \"paid\", \"extra\": \"ignored\"})\n\nclient = httpx.Client(base_url=\"https://erp.example.com\", transport=httpx.MockTransport(handler))\nprint(fetch_order(client, 6))",
   "out": {
    "text": "{'found': True, 'id': 6, 'status': 'paid'}"
   }
  },
  {
   "h": "Simulating failures",
   "p": [
    "A fake transport can return any status, delay, or broken body. Write one test per failure you care about."
   ],
   "code": "import httpx, pytest\n\ndef fetch_order(client, order_id):\n    r = client.get(f\"/orders/{order_id}\", timeout=5)\n    if r.status_code == 404:\n        return {\"found\": False}\n    r.raise_for_status()\n    data = r.json()\n    return {\"found\": True, \"id\": data[\"id\"], \"status\": data[\"status\"]}\n\ndef client_returning(handler):\n    return httpx.Client(base_url=\"https://erp.example.com\", transport=httpx.MockTransport(handler))\n\ndef test_not_found_is_handled():\n    c = client_returning(lambda req: httpx.Response(404))\n    assert fetch_order(c, 9) == {\"found\": False}\n\ndef test_server_error_raises():\n    c = client_returning(lambda req: httpx.Response(503))\n    with pytest.raises(httpx.HTTPStatusError):\n        fetch_order(c, 6)\n\ndef test_timeout_raises():\n    def slow(req):\n        raise httpx.ReadTimeout(\"timed out\", request=req)\n    with pytest.raises(httpx.TimeoutException):\n        fetch_order(client_returning(slow), 6)\n\ndef test_missing_field_is_noticed():\n    c = client_returning(lambda req: httpx.Response(200, json={\"id\": 6}))\n    with pytest.raises(KeyError):\n        fetch_order(c, 6)\n\ndef test_html_error_page_instead_of_json():\n    c = client_returning(lambda req: httpx.Response(200, text=\"<html>Gateway error</html>\"))\n    with pytest.raises(ValueError):\n        fetch_order(c, 6)",
   "test": true,
   "out": {
    "text": ".....  [100%]\n5 passed in 0.05s"
   }
  },
  {
   "h": "Testing retry logic",
   "p": [
    "A fake that fails N times then succeeds lets you check that retries happen, stop at the limit, and don't run for non-retryable errors."
   ],
   "code": "import httpx\n\ndef get_with_retry(client, url, tries=3, sleep=lambda s: None):\n    for attempt in range(1, tries + 1):\n        r = client.get(url)\n        if r.status_code < 500 and r.status_code != 429:\n            return r\n        if attempt < tries:\n            sleep(2 ** attempt)\n    r.raise_for_status()\n\ndef flaky(fail_times):\n    calls = {\"n\": 0}\n    def handler(req):\n        calls[\"n\"] += 1\n        return httpx.Response(503) if calls[\"n\"] <= fail_times else httpx.Response(200, json={\"ok\": True})\n    return handler, calls\n\ndef make(handler):\n    return httpx.Client(base_url=\"https://x.test\", transport=httpx.MockTransport(handler))\n\ndef test_recovers_after_two_failures():\n    h, calls = flaky(2)\n    assert get_with_retry(make(h), \"/a\").json() == {\"ok\": True}\n    assert calls[\"n\"] == 3\n\ndef test_gives_up_after_limit():\n    h, calls = flaky(10)\n    try:\n        get_with_retry(make(h), \"/a\")\n        assert False, \"should have raised\"\n    except httpx.HTTPStatusError:\n        assert calls[\"n\"] == 3\n\ndef test_does_not_retry_422():\n    calls = {\"n\": 0}\n    def h(req):\n        calls[\"n\"] += 1\n        return httpx.Response(422)\n    assert get_with_retry(make(h), \"/a\").status_code == 422\n    assert calls[\"n\"] == 1",
   "test": true,
   "out": {
    "text": "...  [100%]\n3 passed in 0.05s"
   }
  },
  {
   "h": "Contract tests and sandboxes",
   "p": [
    "Fakes can drift from the real API. Add a few <b>contract tests</b> that run against the provider's <b>sandbox</b> (most payment and shipping APIs have one) on a schedule, checking the response still has the fields you rely on. Keep saved example responses from the real API as test fixtures."
   ]
  }
 ],
 "mistakes": [
  "Only testing the happy path.",
  "Tests that call the real production API: slow, flaky and sometimes costly.",
  "Fakes that are so different from the real API that tests pass and production fails. Base them on real saved responses.",
  "Real sleeps in retry tests. Inject a fake sleep."
 ],
 "practice": [
  {
   "q": "Write a test that a 429 response with <code>Retry-After: 7</code> makes your code wait 7 seconds (use a fake sleep that records the value).",
   "code": "import httpx\n\ndef get(client, url, sleep):\n    r = client.get(url)\n    if r.status_code == 429:\n        sleep(float(r.headers.get(\"Retry-After\", 1)))\n        r = client.get(url)\n    return r\n\ndef test_respects_retry_after():\n    responses = iter([httpx.Response(429, headers={\"Retry-After\": \"7\"}), httpx.Response(200)])\n    client = httpx.Client(base_url=\"https://x.test\", transport=httpx.MockTransport(lambda req: next(responses)))\n    waited = []\n    assert get(client, \"/a\", sleep=waited.append).status_code == 200\n    assert waited == [7.0]",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.05s"
   }
  },
  {
   "q": "List five failure cases every integration should be tested against.",
   "a": "Timeout, 5xx server error, 429 rate limit (with Retry-After), 401 expired credentials, 404 missing record, 422 validation error, malformed/HTML body, missing or renamed field, duplicate event, out-of-order events."
  }
 ],
 "check": [
  [
   "How do you make API-calling code testable?",
   [
    "Call the real API in tests",
    "Pass the HTTP client/transport in, so tests can use a fake",
    "Use print",
    "Make it async"
   ],
   1,
   "Dependency injection."
  ],
  [
   "Why inject a fake sleep in retry tests?",
   [
    "Style",
    "So tests run instantly and you can check wait times",
    "Required by pytest",
    "To slow tests"
   ],
   1,
   "Fast, checkable tests."
  ],
  [
   "What are contract tests for?",
   [
    "UI",
    "Checking the real API (sandbox) still matches what your code expects",
    "Load testing",
    "Pricing"
   ],
   1,
   "Catch drift between fakes and reality."
  ]
 ],
 "remember": [
  "Inject the HTTP client; use httpx.MockTransport in tests.",
  "Test: timeout, 5xx, 429, 401, 404, 422, bad body, missing fields.",
  "Retry tests: fake that fails N times; fake sleep; check call counts.",
  "Contract tests against sandboxes; fixtures from real responses."
 ]
};
L["integration:logging-health"] = {
 "title": "Logging, monitoring and health checks",
 "level": "Intermediate",
 "one": "You can't fix what you can't see. Use <b>structured logs</b> with a <b>correlation id</b>, track a few <b>metrics</b> (processed, failed, lag, DLQ size), expose a <b>health check</b>, and <b>alert</b> on what matters.",
 "why": "Integrations fail at 3 a.m. Good logging and alerts turn “the client noticed missing orders a week later” into “we got an alert and fixed it in 10 minutes”.",
 "steps": [
  {
   "h": "Structured logs",
   "p": [
    "Log JSON with fixed fields instead of free text, so you can search “all errors for order 6” or count failures per hour."
   ],
   "code": "import json, logging, sys\n\nclass JsonFormatter(logging.Formatter):\n    def format(self, record):\n        base = {\"level\": record.levelname, \"msg\": record.getMessage(), \"logger\": record.name}\n        return json.dumps({**base, **getattr(record, \"ctx\", {})})\n\nhandler = logging.StreamHandler(sys.stdout)\nhandler.setFormatter(JsonFormatter())\nlog = logging.getLogger(\"erp_sync\")\nlog.addHandler(handler)\nlog.setLevel(logging.INFO)\n\nlog.info(\"order synced\", extra={\"ctx\": {\"order_ref\": \"SHOP-6\", \"erp_id\": 4417, \"ms\": 230}})\nlog.warning(\"retrying\", extra={\"ctx\": {\"order_ref\": \"SHOP-8\", \"attempt\": 2, \"status\": 503}})\nlog.error(\"sent to DLQ\", extra={\"ctx\": {\"order_ref\": \"SHOP-7\", \"error\": \"unknown product UNKNOWN\"}})",
   "out": {
    "text": "{\"level\": \"INFO\", \"msg\": \"order synced\", \"logger\": \"erp_sync\", \"order_ref\": \"SHOP-6\", \"erp_id\": 4417, \"ms\": 230}\n{\"level\": \"WARNING\", \"msg\": \"retrying\", \"logger\": \"erp_sync\", \"order_ref\": \"SHOP-8\", \"attempt\": 2, \"status\": 503}\n{\"level\": \"ERROR\", \"msg\": \"sent to DLQ\", \"logger\": \"erp_sync\", \"order_ref\": \"SHOP-7\", \"error\": \"unknown product UNKNOWN\"}"
   }
  },
  {
   "h": "Correlation ids: follow one event everywhere",
   "p": [
    "Give each incoming event an id and put it in every log line, queue job and outgoing request header (<code>X-Request-Id</code>). Then one search shows the event's whole journey across services."
   ],
   "code": "import uuid, contextvars\n\nrequest_id = contextvars.ContextVar(\"request_id\", default=\"-\")\n\ndef log(msg, **fields):\n    print({\"request_id\": request_id.get(), \"msg\": msg, **fields})\n\ndef handle_webhook(event):\n    request_id.set(event.get(\"id\") or str(uuid.uuid4()))\n    log(\"webhook received\", type=event[\"type\"])\n    enqueue(event)\n\ndef enqueue(event):\n    log(\"job queued\", queue=\"erp_sync\")\n\nhandle_webhook({\"id\": \"evt_42\", \"type\": \"order.paid\"})",
   "out": {
    "text": "{'request_id': 'evt_42', 'msg': 'webhook received', 'type': 'order.paid'}\n{'request_id': 'evt_42', 'msg': 'job queued', 'queue': 'erp_sync'}"
   }
  },
  {
   "h": "Metrics that matter",
   "p": [
    "For an integration, track: events received, processed, failed, retries, <b>DLQ size</b>, <b>queue lag</b> (age of the oldest waiting job) and <b>end-to-end delay</b>. Lag and DLQ size are the two numbers that tell you something is wrong."
   ],
   "code": "from datetime import datetime, timedelta\n\nnow = datetime(2025, 7, 3, 10, 0)\nqueued_at = [now - timedelta(minutes=m) for m in (1, 2, 45)]\ndlq_size = 3\n\nlag_minutes = (now - min(queued_at)).total_seconds() / 60\nalerts = []\nif lag_minutes > 15:\n    alerts.append(f\"queue lag {lag_minutes:.0f} min (limit 15)\")\nif dlq_size > 0:\n    alerts.append(f\"{dlq_size} jobs in DLQ\")\nprint(alerts or \"all good\")",
   "out": {
    "text": "['queue lag 45 min (limit 15)', '3 jobs in DLQ']"
   }
  },
  {
   "h": "Health checks",
   "p": [
    "A <code>/health</code> endpoint lets load balancers and uptime monitors check the service. A <b>liveness</b> check says “the process is running”; a <b>readiness</b> check also tests key dependencies (database, queue) and reports what's broken."
   ],
   "code": "from fastapi import FastAPI\nfrom fastapi.responses import JSONResponse\nfrom fastapi.testclient import TestClient\n\napp = FastAPI()\ndeps = {\"database\": lambda: True, \"queue\": lambda: True, \"erp_api\": lambda: False}\n\n@app.get(\"/health/live\")\ndef live():\n    return {\"status\": \"ok\"}\n\n@app.get(\"/health/ready\")\ndef ready():\n    results = {name: (\"ok\" if check() else \"down\") for name, check in deps.items()}\n    code = 200 if all(v == \"ok\" for v in results.values()) else 503\n    return JSONResponse(results, status_code=code)\n\nc = TestClient(app)\nprint(c.get(\"/health/live\").json())\nr = c.get(\"/health/ready\")\nprint(r.status_code, r.json())",
   "out": {
    "text": "{'status': 'ok'}\n503 {'database': 'ok', 'queue': 'ok', 'erp_api': 'down'}"
   }
  },
  {
   "h": "Alerts people act on",
   "p": [
    "Alert on <b>symptoms users feel</b> (lag too high, DLQ growing, error rate up, no events received for an hour during business hours), not on every single error. Each alert should say what's wrong and link to a short runbook: how to check, how to fix, who to call."
   ]
  }
 ],
 "mistakes": [
  "Free-text logs you can't search or count.",
  "Logging secrets, tokens or full card numbers.",
  "No correlation id: one event's story is scattered across services.",
  "Alerting on everything, so people ignore alerts.",
  "A health check that always says ok even when the database is down."
 ],
 "practice": [
  {
   "q": "Write an alert rule: alert if no events were received in the last 60 minutes between 9:00 and 21:00.",
   "code": "from datetime import datetime, timedelta\n\ndef silent_alert(last_event: datetime, now: datetime) -> str | None:\n    if 9 <= now.hour < 21 and now - last_event > timedelta(minutes=60):\n        return f\"No events for {int((now - last_event).total_seconds() // 60)} minutes\"\n    return None\n\nprint(silent_alert(datetime(2025, 7, 3, 11, 0), datetime(2025, 7, 3, 12, 30)))\nprint(silent_alert(datetime(2025, 7, 3, 1, 0), datetime(2025, 7, 3, 3, 0)))",
   "out": {
    "text": "No events for 90 minutes\nNone"
   }
  },
  {
   "q": "What should a runbook entry for “DLQ not empty” contain?",
   "a": "How to view DLQ jobs and their errors; the common causes (unknown product, missing customer, expired credentials) and the fix for each; how to retry jobs after fixing; when to escalate and to whom."
  }
 ],
 "check": [
  [
   "Why structured (JSON) logs?",
   [
    "Prettier",
    "Searchable and countable by field",
    "Smaller files",
    "Required by Python"
   ],
   1,
   "Query logs like data."
  ],
  [
   "What does a correlation id give you?",
   [
    "Encryption",
    "One id to follow an event across all logs and services",
    "Faster queues",
    "Fewer logs"
   ],
   1,
   "Trace the whole journey."
  ],
  [
   "Two numbers that best show an integration is in trouble?",
   [
    "CPU and RAM",
    "Queue lag and DLQ size",
    "Lines of code",
    "Number of workers"
   ],
   1,
   "Watch those first."
  ]
 ],
 "remember": [
  "JSON logs with fixed fields; never log secrets.",
  "Correlation id in every log, job and outgoing request.",
  "Metrics: received, processed, failed, retries, DLQ size, queue lag.",
  "/health/live and /health/ready (checks dependencies, 503 if down).",
  "Alert on symptoms, with a runbook link."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
