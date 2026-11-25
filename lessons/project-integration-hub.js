// Lessons for course "project-integration-hub". Built by tools/course-builder from tools/courses/project-integration-hub.js.
// Python examples were run and their real output stored.
(function (L) {
L["project-integration-hub:setup"] = {
 "title": "Repo, FastAPI, PostgreSQL, Docker Compose",
 "level": "Project",
 "one": "You'll build an <b>Integration Hub</b>: a FastAPI service that receives order <b>webhooks</b> from an online shop, stores them safely, and a <b>worker</b> creates matching <b>sales orders in Odoo</b>, with retries, dead-lettering, idempotency, tests, CI and a failure-scenarios README.",
 "why": "Connecting systems reliably is the core of integration and forward-deployed work. Interviewers love this project because it shows you understand what goes wrong in production, not just the happy path.",
 "steps": [
  {
   "h": "The problem and the flow",
   "code": "shop (Shopify/WooCommerce)                         Odoo\n  order created ──webhook──► Integration Hub ──────► sale.order (client_order_ref = SHOP-1042)\n                              1 verify HMAC signature\n                              2 store in inbox (idempotent by event id), reply 200 fast\n                              3 worker: map → find-or-create in Odoo → mark done\n                              4 failures: retry with backoff → dead-letter after N attempts\n                              5 /health, metrics, replay endpoint for dead letters",
   "lang": "text"
  },
  {
   "h": "Repo layout",
   "code": "integration-hub/\n  README.md                  flow diagram, failure scenarios table, how to run, demo\n  pyproject.toml             fastapi, uvicorn, psycopg, httpx, pydantic-settings, pytest\n  .env.example               DATABASE_URL, SHOP_WEBHOOK_SECRET, ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY\n  src/hub/\n    settings.py              config from env (pydantic-settings)\n    api.py                   POST /webhooks/shop, GET /health, POST /admin/replay/{event_id}\n    db.py                    inbox table, queries (SELECT ... FOR UPDATE SKIP LOCKED)\n    mapping.py               shop order → Odoo sale.order values\n    odoo.py                  OdooClient (execute_kw) with timeouts\n    worker.py                loop: claim → push → mark done/failed/dead\n  migrations/001_inbox.sql\n  tests/                     test_webhook.py, test_mapping.py, test_worker.py\n  docker-compose.yml         api, worker, postgres (+ odoo for the demo)\n  .github/workflows/ci.yml",
   "lang": "text"
  },
  {
   "h": "Settings from the environment",
   "code": "from pydantic_settings import BaseSettings, SettingsConfigDict\nimport os\n\nclass Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_file=\".env\", extra=\"ignore\")\n    database_url: str\n    shop_webhook_secret: str\n    odoo_url: str\n    odoo_db: str\n    odoo_user: str\n    odoo_api_key: str\n    worker_max_attempts: int = 5\n\nos.environ.update(DATABASE_URL=\"postgresql://hub:hub@localhost:5432/hub\", SHOP_WEBHOOK_SECRET=\"whsec_x\",\n                  ODOO_URL=\"http://localhost:8069\", ODOO_DB=\"demo\", ODOO_USER=\"hub-bot\", ODOO_API_KEY=\"k\")\ns = Settings()\nprint(s.odoo_url, s.worker_max_attempts, \"| secret loaded:\", bool(s.shop_webhook_secret))",
   "note": "Settings fail fast at startup if something is missing, instead of failing on the first webhook at 2am.",
   "out": {
    "text": "http://localhost:8069 5 | secret loaded: True"
   }
  },
  {
   "h": "Docker Compose for local development",
   "code": "services:\n  postgres:\n    image: postgres:16\n    environment: {POSTGRES_USER: hub, POSTGRES_PASSWORD: hub, POSTGRES_DB: hub}\n    healthcheck: {test: [\"CMD\", \"pg_isready\", \"-U\", \"hub\"], interval: 5s}\n    volumes: [pgdata:/var/lib/postgresql/data]\n  api:\n    build: .\n    command: uvicorn hub.api:app --host 0.0.0.0 --port 8000\n    env_file: .env\n    ports: [\"8000:8000\"]\n    depends_on: {postgres: {condition: service_healthy}}\n  worker:\n    build: .\n    command: python -m hub.worker\n    env_file: .env\n    depends_on: {postgres: {condition: service_healthy}}\n  odoo:                                   # demo only: a local Odoo to sync into\n    image: odoo:18\n    depends_on: [postgres]\n    ports: [\"8069:8069\"]\nvolumes: {pgdata: {}}",
   "lang": "yaml"
  },
  {
   "h": "The inbox table",
   "code": "-- migrations/001_inbox.sql\nCREATE TABLE inbox (\n    event_id        text PRIMARY KEY,               -- the shop's webhook id: duplicates rejected\n    topic           text NOT NULL,                  -- orders/create, orders/cancelled ...\n    payload         jsonb NOT NULL,\n    status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','failed','dead')),\n    attempts        int NOT NULL DEFAULT 0,\n    next_attempt_at timestamptz NOT NULL DEFAULT now(),\n    last_error      text,\n    odoo_id         int,\n    received_at     timestamptz NOT NULL DEFAULT now()\n);\nCREATE INDEX inbox_due ON inbox (status, next_attempt_at);",
   "lang": "sql"
  }
 ],
 "mistakes": [
  "Calling Odoo directly inside the webhook request (slow, and lost if Odoo is down).",
  "Config scattered in code instead of one Settings class.",
  "No primary key on the event id, so duplicates slip in.",
  "Only planning the happy path."
 ],
 "practice": [
  {
   "q": "Write the one-line purpose and the three failure scenarios you'll handle, for the README.",
   "a": "Purpose: “Receives shop order webhooks and creates matching sales orders in Odoo, reliably.” Failure scenarios: (1) the shop sends the same webhook twice → stored once, one Odoo order; (2) Odoo is down or slow → events wait and retry with backoff, nothing lost; (3) a bad order (e.g. unknown product) → dead-lettered with the error, alert, replay after fixing."
  },
  {
   "q": "Make Settings reject a webhook secret shorter than 8 characters.",
   "code": "from pydantic import field_validator, ValidationError\nfrom pydantic_settings import BaseSettings\n\nclass Settings(BaseSettings):\n    shop_webhook_secret: str\n\n    @field_validator(\"shop_webhook_secret\")\n    @classmethod\n    def long_enough(cls, v):\n        if len(v) < 8:\n            raise ValueError(\"webhook secret too short\")\n        return v\n\nfor secret in [\"whsec_123456\", \"abc\"]:\n    try:\n        Settings(shop_webhook_secret=secret); print(secret, \"ok\")\n    except ValidationError as e:\n        print(secret, \"->\", e.errors()[0][\"msg\"])",
   "out": {
    "text": "whsec_123456 ok\nabc -> Value error, webhook secret too short"
   }
  }
 ],
 "check": [
  [
   "Why store webhooks before calling Odoo?",
   [
    "Style",
    "Reply fast and never lose events if Odoo is down",
    "Required by FastAPI",
    "Cheaper"
   ],
   1,
   "Decouple intake from delivery."
  ],
  [
   "Where does configuration come from?",
   [
    "Hardcoded",
    "Environment variables via a Settings class",
    "The README",
    "Git"
   ],
   1,
   "12-factor config."
  ],
  [
   "What makes duplicate webhooks harmless at intake?",
   [
    "Sorting",
    "Primary key on the event id",
    "Retries",
    "Logging"
   ],
   1,
   "Idempotent insert."
  ]
 ],
 "remember": [
  "Webhook → inbox → worker → Odoo; reply fast.",
  "Settings from env; fail fast on missing config.",
  "Docker Compose: api, worker, postgres (+ odoo).",
  "Inbox table with status, attempts, next_attempt_at, last_error."
 ]
};
L["project-integration-hub:intake"] = {
 "title": "Webhook intake with HMAC",
 "level": "Project",
 "one": "The intake endpoint must be <b>fast</b>, <b>authentic</b> and <b>idempotent</b>: verify the <b>HMAC signature</b> on the raw body, store the event once (by event id), and answer 200 within milliseconds. All real work happens later in the worker.",
 "why": "Webhook endpoints are public URLs. Without signature checks anyone can create orders in your ERP; without idempotency, retries create duplicates.",
 "steps": [
  {
   "h": "How webhook signatures work",
   "p": [
    "The shop and your hub share a secret. The shop computes <code>HMAC-SHA256(secret, raw_body)</code> and sends it in a header. You recompute it on the <b>exact raw bytes</b> and compare with a constant-time comparison. Any change to the body, or a wrong secret, gives a different signature."
   ],
   "code": "import hmac, hashlib\nsecret = b\"whsec_demo_only\"\nbody = b'{\"id\": \"evt_1\", \"topic\": \"orders/create\"}'\nsig = hmac.new(secret, body, hashlib.sha256).hexdigest()\nprint(\"signature:\", sig[:16] + \"...\")\ntampered = body.replace(b\"evt_1\", b\"evt_9\")\nprint(\"tampered body matches?\", hmac.compare_digest(sig, hmac.new(secret, tampered, hashlib.sha256).hexdigest()))",
   "note": "Shopify sends base64 in <code>X-Shopify-Hmac-Sha256</code>, Stripe signs a timestamp + body in <code>Stripe-Signature</code>, Razorpay uses hex in <code>X-Razorpay-Signature</code>. Read the provider's docs; the idea is the same.",
   "out": {
    "text": "signature: 33cd0eea7b9619fa...\ntampered body matches? False"
   }
  },
  {
   "h": "The endpoint, tested",
   "code": "import json\nfrom fastapi.testclient import TestClient\nfrom hub import app, sign\n\nclient = TestClient(app)\nbody = json.dumps(shop_event(\"evt_1042\", 1042)).encode()\n\nr = client.post(\"/webhooks/shop\", content=body, headers={\"X-Shop-Signature\": sign(body)})\nprint(\"valid:     \", r.status_code, r.json())\nr = client.post(\"/webhooks/shop\", content=body, headers={\"X-Shop-Signature\": sign(body)})\nprint(\"redelivery:\", r.status_code, r.json())\nr = client.post(\"/webhooks/shop\", content=body, headers={\"X-Shop-Signature\": \"forged\"})\nprint(\"forged:    \", r.status_code, r.json())\nprint(\"health:    \", client.get(\"/health\").json())",
   "note": "The redelivered webhook got 200 (so the shop stops retrying) but wasn't stored twice.",
   "out": {
    "text": "valid:      200 {'accepted': True, 'duplicate': False}\nredelivery: 200 {'accepted': True, 'duplicate': True}\nforged:     401 {'detail': 'bad signature'}\nhealth:     {'ok': True, 'inbox': {'pending': 1}}"
   }
  },
  {
   "h": "Rules for webhook endpoints",
   "code": "verify first          signature on the raw body, constant-time compare; 401 if wrong\nthen store            insert into the inbox keyed by the provider's event id (ON CONFLICT DO NOTHING)\nreply fast            200 in < 1 s; providers retry on timeouts and 5xx (causing duplicates)\nno business logic     no Odoo calls, no heavy parsing in the request\nreplay protection     for timestamped signatures, reject events older than ~5 minutes\nlog                   event id, topic, signature ok/failed (never log secrets or full card data)",
   "lang": "text"
  },
  {
   "h": "Validating the payload shape",
   "p": [
    "Verify the signature first, then validate the payload with a Pydantic model so a malformed event is rejected with 422 (or stored and dead-lettered, depending on the provider's retry behaviour). Keep the raw JSON too: it's your evidence when something looks wrong."
   ],
   "code": "from pydantic import BaseModel, Field, ValidationError\n\nclass Line(BaseModel):\n    sku: str\n    odoo_product_id: int\n    qty: int = Field(gt=0)\n    price: float = Field(ge=0)\n\nclass ShopOrder(BaseModel):\n    number: int\n    customer: dict\n    lines: list[Line] = Field(min_length=1)\n\ntry:\n    ShopOrder.model_validate({\"number\": 1043, \"customer\": {}, \"lines\": [{\"sku\": \"MUG\", \"odoo_product_id\": 9, \"qty\": 0, \"price\": 299}]})\nexcept ValidationError as e:\n    print([f\"{'.'.join(map(str, x['loc']))}: {x['msg']}\" for x in e.errors()])",
   "out": {
    "text": "['lines.0.qty: Input should be greater than 0']"
   }
  }
 ],
 "mistakes": [
  "Verifying the signature on re-serialised JSON instead of the raw bytes (signatures won't match).",
  "Using == instead of hmac.compare_digest (timing attacks).",
  "Doing the Odoo call inside the webhook request.",
  "Returning 500 for duplicates (the provider retries forever)."
 ],
 "practice": [
  {
   "q": "Implement Shopify-style verification: base64 of the HMAC-SHA256 digest.",
   "code": "import hmac, hashlib, base64\ndef verify_shopify(secret: bytes, raw_body: bytes, header: str) -> bool:\n    digest = hmac.new(secret, raw_body, hashlib.sha256).digest()\n    return hmac.compare_digest(base64.b64encode(digest).decode(), header)\n\nbody = b'{\"id\": 1}'\ngood = base64.b64encode(hmac.new(b\"s3cret\", body, hashlib.sha256).digest()).decode()\nprint(verify_shopify(b\"s3cret\", body, good), verify_shopify(b\"s3cret\", body, \"nope\"))",
   "out": {
    "text": "True False"
   }
  },
  {
   "q": "Add a timestamp check: reject signed events older than 300 seconds.",
   "code": "import time\ndef fresh_enough(event_ts: float, now: float, max_age=300) -> bool:\n    return 0 <= now - event_ts <= max_age\n\nnow = time.time()\nprint(fresh_enough(now - 20, now), fresh_enough(now - 900, now))",
   "out": {
    "text": "True False"
   }
  }
 ],
 "check": [
  [
   "The HMAC is computed over…",
   [
    "The parsed JSON",
    "The exact raw request body",
    "The URL",
    "Headers"
   ],
   1,
   "Raw bytes."
  ],
  [
   "Duplicate webhook arrives. Respond with…",
   [
    "500",
    "200 and don't store it again",
    "404",
    "Nothing"
   ],
   1,
   "Stop provider retries."
  ],
  [
   "Why compare_digest?",
   [
    "Faster",
    "Constant-time comparison prevents timing attacks",
    "Required by FastAPI",
    "Shorter"
   ],
   1,
   "Security."
  ]
 ],
 "remember": [
  "Verify HMAC on raw body with compare_digest → 401 if wrong.",
  "Insert into inbox by event id (idempotent) → 200 fast.",
  "No business logic in the request.",
  "Validate payload; keep raw JSON; timestamp replay protection."
 ]
};
L["project-integration-hub:worker"] = {
 "title": "Queue + worker to the external API",
 "level": "Project",
 "one": "A <b>worker</b> process claims pending inbox rows, <b>maps</b> each shop order to Odoo values, does <b>find-or-create</b> in Odoo (by a client reference), and marks the row done. With PostgreSQL, several workers share the queue safely using <code>FOR UPDATE SKIP LOCKED</code>.",
 "why": "Moving the slow, failure-prone part out of the request is the key architecture idea in integrations. A Postgres-backed queue is simple, durable and enough for most clients.",
 "steps": [
  {
   "h": "Mapping: shop order → Odoo sale.order",
   "code": "from pprint import pprint\nfrom hub import to_sale_order\n\norder = shop_event(\"evt_1042\", 1042, lines=[\n    {\"sku\": \"TSHIRT-M\", \"odoo_product_id\": 41, \"qty\": 2, \"price\": 799.0},\n    {\"sku\": \"MUG\", \"odoo_product_id\": 9, \"qty\": 1, \"price\": 299.0}])[\"data\"]\npprint(to_sale_order(order), sort_dicts=False)",
   "note": "<code>(0, 0, {...})</code> is Odoo's command for “create this order line”. <code>client_order_ref</code> stores the shop's order number, which makes the push idempotent.",
   "out": {
    "text": "{'partner_id': 7,\n 'client_order_ref': 'SHOP-1042',\n 'order_line': [(0,\n                 0,\n                 {'product_id': 41, 'product_uom_qty': 2, 'price_unit': 799.0}),\n                (0,\n                 0,\n                 {'product_id': 9, 'product_uom_qty': 1, 'price_unit': 299.0})]}"
   }
  },
  {
   "h": "Claiming work safely (PostgreSQL)",
   "code": "-- each worker claims a batch; rows locked by another worker are skipped, not waited on\nWITH due AS (\n    SELECT event_id FROM inbox\n    WHERE status IN ('pending', 'failed') AND next_attempt_at <= now()\n    ORDER BY received_at\n    LIMIT 10\n    FOR UPDATE SKIP LOCKED\n)\nUPDATE inbox SET status = 'processing', attempts = attempts + 1\nFROM due WHERE inbox.event_id = due.event_id\nRETURNING inbox.event_id, inbox.payload, inbox.attempts;",
   "lang": "sql",
   "note": "Run two or three worker containers and they never process the same event at the same time. Add a 'processing' timeout so rows from a crashed worker become due again."
  },
  {
   "h": "The worker, running",
   "code": "import json, time\nfrom hub import connect, work_once, FlakyOdoo\n\ndb = connect(\":memory:\")\nfor i, n in enumerate([1042, 1043, 1044]):\n    ev = shop_event(f\"evt_{n}\", n)\n    db.execute(\"INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, ?)\",\n               (ev[\"id\"], ev[\"topic\"], json.dumps(ev[\"data\"]), time.time() + i))\ndb.commit()\n\nodoo = FlakyOdoo()\nprint(\"processed:\", work_once(db, odoo))\nfor row in db.execute(\"SELECT event_id, status, attempts, odoo_id FROM inbox ORDER BY event_id\"):\n    print(dict(row))\nprint(\"orders in Odoo:\", {oid: o[\"client_order_ref\"] for oid, o in odoo.orders.items()})",
   "out": {
    "text": "processed: 3\n{'event_id': 'evt_1042', 'status': 'done', 'attempts': 1, 'odoo_id': 101}\n{'event_id': 'evt_1043', 'status': 'done', 'attempts': 1, 'odoo_id': 102}\n{'event_id': 'evt_1044', 'status': 'done', 'attempts': 1, 'odoo_id': 103}\norders in Odoo: {101: 'SHOP-1042', 102: 'SHOP-1043', 103: 'SHOP-1044'}"
   }
  },
  {
   "h": "Find-or-create makes the push idempotent",
   "code": "from hub import push_order, FlakyOdoo\n\nodoo = FlakyOdoo()\norder = shop_event(\"evt_1042\", 1042)[\"data\"]\nfirst = push_order(odoo, order)\nsecond = push_order(odoo, order)       # e.g. worker crashed after Odoo created the order, before marking done\nprint(first, second, \"| orders in Odoo:\", len(odoo.orders))",
   "note": "If the worker dies after Odoo created the order but before the inbox row was marked done, the retry finds the existing order by <code>client_order_ref</code> instead of creating a second one.",
   "out": {
    "text": "101 101 | orders in Odoo: 1"
   }
  },
  {
   "h": "The worker loop",
   "code": "import signal, time, logging\nlog = logging.getLogger(\"hub.worker\")\nrunning = True\n\ndef stop(*_):\n    global running\n    running = False                       # finish the current batch, then exit (graceful shutdown)\n\nsignal.signal(signal.SIGTERM, stop)\n\ndef main(db, odoo):\n    while running:\n        try:\n            done = work_once(db, odoo)\n        except Exception:\n            log.exception(\"worker batch failed\")   # never let one bad batch kill the worker\n            done = 0\n        if done == 0:\n            time.sleep(2)                 # idle: poll every 2s (or LISTEN/NOTIFY in Postgres)",
   "lang": "python",
   "run": false
  }
 ],
 "mistakes": [
  "Two workers picking the same row (no locking).",
  "Plain create in Odoo, so retries duplicate sales orders.",
  "A worker that crashes on the first exception.",
  "No graceful shutdown: deploys kill workers mid-call."
 ],
 "practice": [
  {
   "q": "Map a cancelled-order event: find the Odoo order by client_order_ref and describe the call to cancel it.",
   "a": "Search: <code>execute_kw(\"sale.order\", \"search_read\", [[[\"client_order_ref\", \"=\", \"SHOP-1042\"]]], {\"fields\": [\"id\", \"state\"]})</code>. If found and not already cancelled: <code>execute_kw(\"sale.order\", \"action_cancel\", [[order_id]])</code>. If not found yet (cancel arrived before create was processed), retry later or store the cancel so it applies after creation."
  },
  {
   "q": "Add a line-level check to the mapping: reject orders whose line total (qty × price) doesn't match an order total field.",
   "code": "from hub import to_sale_order, Permanent\n\ndef checked(order):\n    lines_total = sum(l[\"qty\"] * l[\"price\"] for l in order[\"lines\"])\n    if abs(lines_total - order[\"total\"]) > 0.01:\n        raise Permanent(f\"lines {lines_total} != total {order['total']}\")\n    return to_sale_order(order)\n\norder = shop_event(\"e\", 1)[\"data\"] | {\"total\": 1598.0}\nprint(checked(order)[\"client_order_ref\"])\ntry:\n    checked(order | {\"total\": 1500.0})\nexcept Permanent as e:\n    print(\"dead-letter:\", e)",
   "out": {
    "text": "SHOP-1\ndead-letter: lines 1598.0 != total 1500.0"
   }
  }
 ],
 "check": [
  [
   "FOR UPDATE SKIP LOCKED lets you…",
   [
    "Delete rows",
    "Run several workers without processing the same row twice",
    "Skip validation",
    "Speed up inserts"
   ],
   1,
   "Safe concurrent queue."
  ],
  [
   "Why store client_order_ref in Odoo?",
   [
    "Decoration",
    "Find-or-create makes retries idempotent",
    "Required field",
    "Reporting only"
   ],
   1,
   "No duplicate orders."
  ],
  [
   "(0, 0, {...}) in Odoo means…",
   [
    "Delete",
    "Create a new line record",
    "Update",
    "Link existing"
   ],
   1,
   "One2many command."
  ]
 ],
 "remember": [
  "Mapping is a pure function: shop order → Odoo values.",
  "Claim with SKIP LOCKED; several workers are safe.",
  "Find-or-create by client_order_ref.",
  "Worker loop survives errors; graceful shutdown."
 ]
};
L["project-integration-hub:reliability"] = {
 "title": "Retries, dead-letter, idempotency",
 "level": "Project",
 "one": "Decide per error: <b>retry</b> transient ones (timeouts, 5xx, Odoo busy) with <b>exponential backoff and jitter</b>; <b>dead-letter</b> permanent ones (bad data) immediately, and anything that still fails after N attempts. Provide <b>replay</b> after fixing, and alert on dead letters.",
 "why": "This is the difference between an integration that silently loses orders and one the client can trust. Explaining it clearly wins integration interviews.",
 "steps": [
  {
   "h": "Classify errors",
   "code": "retry (transient)        timeouts, connection errors, HTTP 429/502/503/504, Odoo \"could not serialize\"\n                         (concurrent update), worker restarted mid-call\ndead-letter (permanent)  invalid payload, unknown product/customer mapping, Odoo validation error\n                         (e.g. missing required field), 400/401/403/404 from the API\nafter N retries          transient errors that never recover → dead-letter + alert",
   "lang": "text"
  },
  {
   "h": "Backoff with jitter",
   "code": "import random\nrandom.seed(1)\n\ndef backoff(attempt, base=2.0, cap=300.0):\n    return min(cap, base * 2 ** (attempt - 1)) * random.uniform(0.5, 1.0)\n\nfor attempt in range(1, 8):\n    print(f\"attempt {attempt}: wait {backoff(attempt):6.1f}s\")",
   "note": "Doubling waits give a struggling system time to recover; jitter spreads retries so a thousand events don't hammer Odoo at the same second when it comes back.",
   "out": {
    "text": "attempt 1: wait    1.1s\nattempt 2: wait    3.7s\nattempt 3: wait    7.1s\nattempt 4: wait   10.0s\nattempt 5: wait   23.9s\nattempt 6: wait   46.4s\nattempt 7: wait  105.7s"
   }
  },
  {
   "h": "Failure scenarios, simulated",
   "code": "import json, time\nfrom hub import connect, work_once, FlakyOdoo\n\ndb = connect(\":memory:\")\nevents = [shop_event(\"evt_A\", 2001), shop_event(\"evt_B\", 2002, lines=[]), shop_event(\"evt_C\", 2003)]\nfor i, ev in enumerate(events):\n    db.execute(\"INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, ?)\",\n               (ev[\"id\"], ev[\"topic\"], json.dumps(ev[\"data\"]), i))\ndb.commit()\n\n# Odoo times out twice, then recovers; evt_B has no lines (permanent error)\nodoo = FlakyOdoo(fail_plan=[TimeoutError(\"Odoo did not answer in 30s\"), ConnectionError(\"502 Bad Gateway\")])\nclock = 1000.0\nfor rnd in range(1, 5):\n    work_once(db, odoo, now=clock)\n    rows = db.execute(\"SELECT event_id, status, attempts, last_error FROM inbox ORDER BY event_id\").fetchall()\n    print(f\"round {rnd}:\", [(r[\"event_id\"], r[\"status\"], r[\"attempts\"]) for r in rows])\n    clock += 600                                  # let backoff timers expire\nfor r in db.execute(\"SELECT event_id, last_error FROM inbox WHERE last_error IS NOT NULL\"):\n    print(\"error kept for\", r[\"event_id\"], \"->\", r[\"last_error\"])",
   "note": "evt_A and evt_C hit Odoo outages, waited, and succeeded on retry. evt_B can never succeed, so it went straight to dead-letter with its reason instead of retrying for days.",
   "out": {
    "text": "round 1: [('evt_A', 'failed', 1), ('evt_B', 'dead', 1), ('evt_C', 'failed', 1)]\nround 2: [('evt_A', 'done', 2), ('evt_B', 'dead', 1), ('evt_C', 'done', 2)]\nround 3: [('evt_A', 'done', 2), ('evt_B', 'dead', 1), ('evt_C', 'done', 2)]\nround 4: [('evt_A', 'done', 2), ('evt_B', 'dead', 1), ('evt_C', 'done', 2)]\nerror kept for evt_B -> order has no lines"
   }
  },
  {
   "h": "Dead letters: alert, fix, replay",
   "code": "import json\nfrom hub import connect, work_once, FlakyOdoo\n\ndb = connect(\":memory:\")\nbad = shop_event(\"evt_B\", 2002, lines=[])\ndb.execute(\"INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, 0)\", (bad[\"id\"], bad[\"topic\"], json.dumps(bad[\"data\"])))\nodoo = FlakyOdoo()\nwork_once(db, odoo, now=1)\nprint(\"dead letters:\", [dict(r) for r in db.execute(\"SELECT event_id, last_error FROM inbox WHERE status = 'dead'\")])\n\ndef replay(db, event_id, fixed_payload=None):        # POST /admin/replay/{event_id} (admin-only)\n    if fixed_payload is not None:\n        db.execute(\"UPDATE inbox SET payload = ? WHERE event_id = ?\", (json.dumps(fixed_payload), event_id))\n    db.execute(\"UPDATE inbox SET status = 'pending', attempts = 0, next_attempt_at = 0, last_error = NULL WHERE event_id = ?\", (event_id,))\n    db.commit()\n\nfixed = bad[\"data\"] | {\"lines\": [{\"sku\": \"MUG\", \"odoo_product_id\": 9, \"qty\": 1, \"price\": 299.0}]}   # shop corrected the order\nreplay(db, \"evt_B\", fixed)\nwork_once(db, odoo, now=2)\nprint(\"after replay:\", dict(db.execute(\"SELECT event_id, status, odoo_id FROM inbox\").fetchone()))",
   "out": {
    "text": "dead letters: [{'event_id': 'evt_B', 'last_error': 'order has no lines'}]\nafter replay: {'event_id': 'evt_B', 'status': 'done', 'odoo_id': 101}"
   }
  },
  {
   "h": "Idempotency at every hop",
   "code": "hop                         duplicate cause                     protection\nshop → hub                  provider retries on timeout          inbox PRIMARY KEY (event_id)\nhub → Odoo                  worker crash after create            find-or-create by client_order_ref\nreplay of a dead letter     human replays twice                  same find-or-create\ntwo workers                 concurrent claims                    FOR UPDATE SKIP LOCKED\noutgoing calls to APIs      retries of POST requests             Idempotency-Key header when the API supports it",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Retrying permanent errors for days.",
  "Fixed retry intervals without jitter (thundering herd).",
  "Dead letters nobody is alerted about.",
  "Replay that creates duplicates because the push isn't idempotent."
 ],
 "practice": [
  {
   "q": "Write classify(error) that returns 'retry' or 'dead' for: TimeoutError, HTTP 503, HTTP 400, unknown product mapping.",
   "code": "class HTTPError(Exception):\n    def __init__(self, status): self.status = status\nclass MappingError(Exception): pass\n\ndef classify(err):\n    if isinstance(err, (TimeoutError, ConnectionError)):\n        return \"retry\"\n    if isinstance(err, HTTPError):\n        return \"retry\" if err.status in (429, 502, 503, 504) else \"dead\"\n    return \"dead\"\n\nfor e in [TimeoutError(), HTTPError(503), HTTPError(400), MappingError(\"unknown SKU\")]:\n    print(type(e).__name__, getattr(e, \"status\", \"\"), \"->\", classify(e))",
   "out": {
    "text": "TimeoutError  -> retry\nHTTPError 503 -> retry\nHTTPError 400 -> dead\nMappingError  -> dead"
   }
  },
  {
   "q": "Odoo was down for 3 hours and 2,000 events piled up. What happens when it comes back, and what protects Odoo?",
   "a": "Workers pick due events in received order. Exponential backoff with jitter spreads their next attempts, the batch LIMIT and a fixed number of workers cap concurrency, and find-or-create prevents duplicates. Optionally add a rate limiter (e.g. 10 requests/s) and watch the inbox backlog metric drain."
  }
 ],
 "check": [
  [
   "An order with an unknown SKU should…",
   [
    "Retry forever",
    "Dead-letter immediately with the reason",
    "Be dropped",
    "Create a fake product"
   ],
   1,
   "Permanent error."
  ],
  [
   "Why add jitter to backoff?",
   [
    "Fun",
    "Spread retries so they don't all hit at once",
    "Faster",
    "Required"
   ],
   1,
   "Avoid thundering herd."
  ],
  [
   "Replay must be safe because…",
   [
    "Humans never double-click",
    "The push is idempotent (find-or-create)",
    "Odoo dedupes everything",
    "It isn't"
   ],
   1,
   "Idempotency."
  ]
 ],
 "remember": [
  "Transient → retry with backoff + jitter; permanent → dead-letter.",
  "Max attempts, then dead-letter + alert.",
  "Replay after fixing; admin-only.",
  "Idempotency at every hop."
 ]
};
L["project-integration-hub:tests-ci"] = {
 "title": "Tests and CI",
 "level": "Project",
 "one": "Test the hub at three levels: <b>unit tests</b> for mapping and error classification, <b>API tests</b> for the webhook (signatures, duplicates), and <b>failure tests</b> for the worker (outages, bad data, crashes). Run them in <b>GitHub Actions</b> on every push, with a real Postgres service.",
 "why": "Integrations break in the edge cases. Tests that simulate those edge cases are what let you change the code without fear, and they're great evidence in a portfolio.",
 "steps": [
  {
   "h": "The test suite",
   "code": "import json, pytest\nfrom fastapi.testclient import TestClient\nimport hub\n\n@pytest.fixture\ndef client():\n    hub.app.state.db = hub.connect(\":memory:\")\n    return TestClient(hub.app)\n\ndef post(client, event, signature=None):\n    body = json.dumps(event).encode()\n    return client.post(\"/webhooks/shop\", content=body, headers={\"X-Shop-Signature\": signature or hub.sign(body)})\n\ndef test_valid_webhook_is_stored(client):\n    assert post(client, shop_event(\"e1\", 1)).json() == {\"accepted\": True, \"duplicate\": False}\n\ndef test_bad_signature_rejected(client):\n    assert post(client, shop_event(\"e1\", 1), signature=\"forged\").status_code == 401\n\ndef test_duplicate_webhook_stored_once(client):\n    post(client, shop_event(\"e1\", 1)); r = post(client, shop_event(\"e1\", 1))\n    assert r.json()[\"duplicate\"] is True\n    assert client.get(\"/health\").json()[\"inbox\"] == {\"pending\": 1}\n\ndef test_mapping_uses_client_ref():\n    assert hub.to_sale_order(shop_event(\"e\", 1042)[\"data\"])[\"client_order_ref\"] == \"SHOP-1042\"\n\ndef load(db, *events):\n    for i, ev in enumerate(events):\n        db.execute(\"INSERT INTO inbox (event_id, topic, payload, received_at) VALUES (?, ?, ?, ?)\",\n                   (ev[\"id\"], ev[\"topic\"], json.dumps(ev[\"data\"]), i))\n    db.commit()\n\ndef test_outage_then_recovery_creates_one_order():\n    db = hub.connect(\":memory:\"); load(db, shop_event(\"e1\", 1))\n    odoo = hub.FlakyOdoo(fail_plan=[TimeoutError(\"slow\")])\n    hub.work_once(db, odoo, now=0); hub.work_once(db, odoo, now=10_000)\n    assert db.execute(\"SELECT status FROM inbox\").fetchone()[0] == \"done\" and len(odoo.orders) == 1\n\ndef test_bad_order_is_dead_lettered_not_retried():\n    db = hub.connect(\":memory:\"); load(db, shop_event(\"e1\", 1, lines=[]))\n    hub.work_once(db, hub.FlakyOdoo(), now=0)\n    assert tuple(db.execute(\"SELECT status, attempts FROM inbox\").fetchone()) == (\"dead\", 1)\n\ndef test_gives_up_after_max_attempts():\n    db = hub.connect(\":memory:\"); load(db, shop_event(\"e1\", 1))\n    odoo = hub.FlakyOdoo(fail_plan=[TimeoutError()] * 10)\n    for t in range(5):\n        hub.work_once(db, odoo, now=t * 10_000, max_attempts=3)\n    assert tuple(db.execute(\"SELECT status, attempts FROM inbox\").fetchone()) == (\"dead\", 3)\n\ndef test_crash_after_create_does_not_duplicate():\n    odoo = hub.FlakyOdoo(); order = shop_event(\"e1\", 7)[\"data\"]\n    hub.push_order(odoo, order); hub.push_order(odoo, order)\n    assert len(odoo.orders) == 1",
   "test": true,
   "out": {
    "text": "........  [100%]\n8 passed in 0.20s"
   }
  },
  {
   "h": "GitHub Actions with Postgres",
   "code": "name: ci\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16\n        env: {POSTGRES_USER: hub, POSTGRES_PASSWORD: hub, POSTGRES_DB: hub}\n        ports: [\"5432:5432\"]\n        options: --health-cmd \"pg_isready -U hub\" --health-interval 5s --health-retries 10\n    env:\n      DATABASE_URL: postgresql://hub:hub@localhost:5432/hub\n      SHOP_WEBHOOK_SECRET: test-secret-123\n      ODOO_URL: http://fake-odoo\n      ODOO_DB: test\n      ODOO_USER: bot\n      ODOO_API_KEY: test\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: {python-version: \"3.12\", cache: pip}\n      - run: pip install -e \".[dev]\"\n      - run: ruff check . && ruff format --check .\n      - run: psql \"$DATABASE_URL\" -f migrations/001_inbox.sql\n      - run: pytest -q --cov=hub --cov-report=term-missing",
   "lang": "yaml"
  },
  {
   "h": "Testing against Odoo itself",
   "p": [
    "Unit and failure tests use a fake Odoo (fast, deterministic). Add a small, separate <b>integration test</b> job that starts the official Odoo image with a demo database, runs the mapping against it, and checks the sale order appears. Run it nightly or before releases, since it's slow."
   ]
  }
 ],
 "mistakes": [
  "Only happy-path tests.",
  "Tests that call the real shop or production Odoo.",
  "Tests sharing a database and depending on order.",
  "CI that doesn't run migrations, so SQL bugs reach production."
 ],
 "practice": [
  {
   "q": "Write a test that a webhook with a valid signature but an empty body returns 4xx, not 500.",
   "a": "In the endpoint, wrap <code>json.loads(body)</code> and key access in try/except and raise <code>HTTPException(400, \"invalid payload\")</code>. Test: <code>body = b\"\"</code>, post with <code>sign(body)</code>, assert <code>r.status_code == 400</code>."
  },
  {
   "q": "List the failure tests you'd show in an interview, one line each.",
   "a": "1) Duplicate webhook → stored once. 2) Forged signature → 401. 3) Odoo timeout then recovery → exactly one order. 4) Permanent bad data → dead-letter after 1 attempt. 5) Persistent outage → dead after max attempts. 6) Worker crash after create → retry finds existing order, no duplicate."
  }
 ],
 "check": [
  [
   "Why a fake Odoo in unit tests?",
   [
    "Odoo is bad",
    "Fast, deterministic, can simulate outages",
    "Required",
    "Cheaper licenses"
   ],
   1,
   "Control failures."
  ],
  [
   "How does CI get a database?",
   [
    "Production",
    "A Postgres service container in the workflow",
    "SQLite only",
    "None"
   ],
   1,
   "Real Postgres in CI."
  ],
  [
   "Which test proves no duplicate sales orders after a crash?",
   [
    "Signature test",
    "Push twice → one order (find-or-create)",
    "Health test",
    "Lint"
   ],
   1,
   "Idempotency test."
  ]
 ],
 "remember": [
  "Unit (mapping), API (signature, duplicates), failure (outages, bad data, crashes).",
  "Fake Odoo for speed; nightly real-Odoo integration test.",
  "CI: lint, migrations, pytest with Postgres service, coverage."
 ]
};
L["project-integration-hub:ship"] = {
 "title": "Ship: deploy + failure-scenarios README",
 "level": "Project",
 "one": "Deploy the hub (API + worker + Postgres), add <b>observability</b> (structured logs, metrics, alerts on dead letters and backlog), and write a README whose centrepiece is a <b>failure-scenarios table</b>: what can go wrong and exactly how the hub handles it.",
 "why": "Clients and interviewers care most about “what happens when it breaks?”. A README that answers that clearly, plus a live demo, sets this project apart.",
 "steps": [
  {
   "h": "Deploy",
   "code": "# Dockerfile\nFROM python:3.12-slim\nWORKDIR /app\nCOPY pyproject.toml . && RUN pip install --no-cache-dir .\nCOPY src/ src/ && COPY migrations/ migrations/\nUSER nobody\nCMD [\"uvicorn\", \"hub.api:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n\n# hosting options\nRender / Railway / Fly.io   web service (api) + background worker + managed Postgres\nAWS                         ECS Fargate (api + worker services) + RDS + ALB, secrets in Secrets Manager\na single VM                 docker compose with restart: unless-stopped, Caddy for HTTPS\nwebhook URL                 https://hub.example.com/webhooks/shop  (HTTPS only)",
   "lang": "dockerfile"
  },
  {
   "h": "Observability",
   "code": "import json, logging, time, sys\n\nclass JsonFormatter(logging.Formatter):\n    def format(self, record):\n        return json.dumps({\"ts\": round(time.time()), \"level\": record.levelname, \"msg\": record.getMessage(),\n                           **getattr(record, \"ctx\", {})})\n\nhandler = logging.StreamHandler(sys.stdout); handler.setFormatter(JsonFormatter())\nlog = logging.getLogger(\"hub\"); log.addHandler(handler); log.setLevel(logging.INFO)\n\nlog.info(\"webhook accepted\", extra={\"ctx\": {\"event_id\": \"evt_1042\", \"topic\": \"orders/create\", \"duplicate\": False}})\nlog.warning(\"odoo call failed, will retry\", extra={\"ctx\": {\"event_id\": \"evt_1043\", \"attempt\": 2, \"wait_s\": 7.4, \"error\": \"TimeoutError\"}})\nlog.error(\"dead-lettered\", extra={\"ctx\": {\"event_id\": \"evt_1044\", \"reason\": \"order has no lines\"}})",
   "note": "One JSON line per event with the event id makes it easy to trace any order end to end in your log tool.",
   "out": {
    "text": "{\"ts\": 1795635009, \"level\": \"INFO\", \"msg\": \"webhook accepted\", \"event_id\": \"evt_1042\", \"topic\": \"orders/create\", \"duplicate\": false}\n{\"ts\": 1795635009, \"level\": \"WARNING\", \"msg\": \"odoo call failed, will retry\", \"event_id\": \"evt_1043\", \"attempt\": 2, \"wait_s\": 7.4, \"error\": \"TimeoutError\"}\n{\"ts\": 1795635009, \"level\": \"ERROR\", \"msg\": \"dead-lettered\", \"event_id\": \"evt_1044\", \"reason\": \"order has no lines\"}"
   }
  },
  {
   "h": "Metrics and alerts",
   "code": "metric                               alert when\nhub_inbox_backlog (pending+failed)   > 500 for 15 min       → Odoo slow/down or workers stuck\nhub_dead_letters_total               any new dead letter     → Slack with event id + reason\nhub_oldest_pending_age_seconds       > 30 min                → orders delayed for customers\nhub_webhook_signature_failures       spike                   → misconfigured secret or attack\nhub_odoo_request_seconds (p95)       > 5 s                   → Odoo performance problem",
   "lang": "text"
  },
  {
   "h": "The failure-scenarios README",
   "code": "## Failure scenarios\n| scenario                                  | what the hub does                                        | tested by |\n|-------------------------------------------|----------------------------------------------------------|-----------|\n| shop sends the same webhook twice         | stored once (PK on event id), 200 both times             | test_duplicate_webhook_stored_once |\n| forged / misconfigured signature          | 401, nothing stored, alert on spikes                     | test_bad_signature_rejected |\n| Odoo down or timing out                   | retries with exponential backoff + jitter; no loss       | test_outage_then_recovery_creates_one_order |\n| Odoo down for hours                       | dead after 5 attempts → alert → replay when back         | test_gives_up_after_max_attempts |\n| order with bad data (no lines, bad SKU)   | dead-lettered at once with reason; fix + replay          | test_bad_order_is_dead_lettered_not_retried |\n| worker crashes after Odoo created order   | retry finds order by client_order_ref; no duplicate      | test_crash_after_create_does_not_duplicate |\n| deploy during processing                  | SIGTERM → finish batch → exit; rows not done are retried | manual + logs |\n| two workers                               | SKIP LOCKED: each row processed by one worker            | integration test (Postgres) |",
   "lang": "markdown"
  },
  {
   "h": "Demo script (3 minutes)",
   "code": "0:00  the problem: shop orders typed into Odoo by hand, duplicates and missed orders\n0:20  create an order in the shop → sale order appears in Odoo with SHOP-#### reference\n0:50  send the same webhook again → \"duplicate\": true, still one order\n1:10  stop Odoo, create 3 orders → backlog grows, retries in logs; start Odoo → all 3 arrive once\n2:00  send an order with an unknown SKU → dead letter + Slack alert → fix mapping → replay\n2:40  the failure-scenarios table and CI badge",
   "lang": "text"
  }
 ],
 "mistakes": [
  "No alert on dead letters (silent data loss).",
  "Webhook URL over plain HTTP.",
  "README with only setup steps and no failure behaviour.",
  "Logs without event ids, so you can't trace one order."
 ],
 "practice": [
  {
   "q": "Write a health check that returns 503 when the oldest pending event is older than 30 minutes.",
   "code": "import time\ndef health(oldest_pending_ts, now, max_age=1800):\n    if oldest_pending_ts is not None and now - oldest_pending_ts > max_age:\n        return 503, {\"ok\": False, \"reason\": f\"oldest pending event is {int((now - oldest_pending_ts) / 60)} min old\"}\n    return 200, {\"ok\": True}\n\nnow = time.time()\nprint(health(now - 120, now)); print(health(now - 3600, now))",
   "out": {
    "text": "(200, {'ok': True})\n(503, {'ok': False, 'reason': 'oldest pending event is 60 min old'})"
   }
  },
  {
   "q": "Write the three interview bullet points for this project.",
   "a": "1) Built a FastAPI integration hub that syncs shop orders into Odoo via webhooks, with HMAC verification and a Postgres-backed inbox queue processed by workers (SKIP LOCKED). 2) Designed for failure: retries with exponential backoff and jitter, dead-letter with replay, idempotency at every hop (event-id PK, find-or-create by client_order_ref). 3) Proved it with failure tests in CI (outages, duplicates, crashes, bad data) and documented every scenario in the README; structured logs, metrics and alerts on backlog and dead letters."
  }
 ],
 "check": [
  [
   "Most important alert for this hub?",
   [
    "CPU",
    "New dead letters and growing backlog",
    "Disk",
    "Logins"
   ],
   1,
   "Orders at risk."
  ],
  [
   "Centrepiece of the README?",
   [
    "License",
    "Failure-scenarios table with tests",
    "Folder tree",
    "Credits"
   ],
   1,
   "Show you designed for failure."
  ],
  [
   "Why log the event id on every line?",
   [
    "Size",
    "Trace any order end to end",
    "Required by JSON",
    "Speed"
   ],
   1,
   "Debuggability."
  ]
 ],
 "remember": [
  "API + worker + Postgres; HTTPS webhook URL; secrets in env.",
  "JSON logs with event ids; metrics for backlog, dead letters, age.",
  "Failure-scenarios table linked to tests.",
  "3-minute demo includes an outage and a replay."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
