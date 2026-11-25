// System Design. Concepts with diagrams; the numbers (estimates, caching, sharding) are computed by runnable code.
module.exports = [
{
 id: "approach",
 title: "How to approach a system design question",
 level: "Intermediate",
 one: "System design is turning a vague need (“build a URL shortener”) into a clear plan: <b>requirements → numbers → API and data → high-level design → deep dives → trade-offs</b>.",
 why: "Most mid-level and senior interviews include a design round, and forward-deployed work is design every day: understanding a client's need and proposing a system that fits it.",
 steps: [
  { h: "The six steps",
    p: ["<b>1. Requirements</b> (5 min): what must it do (functional) and how well (scale, speed, availability, cost). Ask questions; don't assume. <b>2. Estimates</b>: users, requests per second, storage. <b>3. API and data model</b>. <b>4. High-level design</b>: boxes and arrows. <b>5. Deep dives</b> on the hard parts. <b>6. Trade-offs and what you'd do next</b>."] },
  { h: "Clarify requirements first",
    p: ["For “design a URL shortener”, ask: How many new links a day? How many clicks? Custom aliases? Do links expire? Analytics needed? Who uses it?",
        "Write them down as two lists: <b>functional</b> (create short link, redirect, optional custom alias, expiry) and <b>non-functional</b> (100M redirects/day, redirect under 50 ms, 99.9% available, links never collide)."] },
  { h: "Back-of-the-envelope numbers",
    p: ["Rough maths decides the design: one server or fifty? cache or not? Use round numbers: a day ≈ 100,000 seconds (86,400)."],
    code: `new_links_per_day = 1_000_000
redirects_per_day = 100_000_000
seconds_per_day = 86_400

write_rps = new_links_per_day / seconds_per_day
read_rps = redirects_per_day / seconds_per_day
peak_read_rps = read_rps * 3                   # assume peaks ~3x average

bytes_per_link = 500                            # url + code + metadata
storage_5y_gb = new_links_per_day * 365 * 5 * bytes_per_link / 1e9

print(f"writes: {write_rps:,.0f}/s   reads: {read_rps:,.0f}/s   peak reads: {peak_read_rps:,.0f}/s")
print(f"read:write ratio {read_rps / write_rps:.0f}:1")
print(f"storage after 5 years: {storage_5y_gb:,.0f} GB")`,
    note: "Read-heavy (100:1) and under 1 TB: one database with a cache in front handles this. The numbers just saved you from over-engineering." },
  { h: "API and data model",
    code: `POST /links            {"url": "https://...", "alias": "summer-sale"?, "expires_at": "..."?}
                       -> 201 {"code": "aZ3k9Q", "short_url": "https://sho.rt/aZ3k9Q"}
GET  /{code}           -> 301/302 redirect to the long URL (404 if missing/expired)
GET  /links/{code}/stats -> {"clicks": 1234, "by_day": [...]}

links(code PK, long_url, owner_id, created_at, expires_at)
clicks(code, clicked_at, country, referrer)      -- append-only, can go to a separate store`, lang: "text" },
  { h: "High-level design, then deep dives",
    code: `client ─► load balancer ─► app servers (stateless) ─► cache (Redis: code → url)
                                        │                     │ miss
                                        ▼                     ▼
                                  click events queue ─►  database (links)
                                        │
                                        ▼
                                  analytics store`, lang: "text",
    p: ["Then go deep on what's hard: <b>generating unique short codes</b> (random base62 + uniqueness check, or a counter encoded in base62), <b>caching</b> hot links, and <b>recording clicks</b> without slowing redirects (send them to a queue)."] },
  { h: "Talk in trade-offs",
    p: ["There's no single right design. Say what you chose and what you gave up: “I'll use a 302 redirect so we can count every click, at the cost of more traffic to us than a cached 301.” Interviewers grade the reasoning, not the boxes."] }
 ],
 mistakes: [
  "Jumping to boxes before asking what the system must do.",
  "Designing for Google scale when the numbers say one database is enough.",
  "Naming technologies (Kafka! Kubernetes!) without saying why.",
  "Never mentioning trade-offs or failure cases."
 ],
 practice: [
  { q: "A chat app has 2M daily users, each sending 40 messages a day of ~200 bytes. Estimate messages per second and storage per year.", code: `users, msgs, size = 2_000_000, 40, 200
per_day = users * msgs
print(f"{per_day / 86_400:,.0f} messages/s on average")
print(f"{per_day * size * 365 / 1e12:.1f} TB per year")` },
  { q: "List 4 clarifying questions for “design a food-delivery order tracking system”.", a: "How many orders per day and peak? How often do riders send location updates? How fresh must the customer's map be (seconds)? Which regions? Do restaurants and riders use separate apps? What happens when a rider loses network?" }
 ],
 check: [
  ["First step in a design interview?", ["Draw boxes", "Clarify requirements and scale", "Pick a database", "Write code"], 1, "Understand the problem first."],
  ["Why do quick estimates?", ["To impress", "The numbers decide how much design you need", "Required by law", "To fill time"], 1, "Avoid over- and under-engineering."],
  ["What do interviewers grade most?", ["The number of boxes", "Clear reasoning and trade-offs", "Fancy tech names", "Speed of drawing"], 1, "Explain your choices."]
 ],
 remember: [
  "Requirements → estimates → API & data → high-level → deep dives → trade-offs.",
  "Functional vs non-functional (scale, latency, availability, cost).",
  "A day ≈ 86,400 s ≈ 100k s. Peak ≈ 2–3× average.",
  "State every choice with what it costs."
 ]
},
{
 id: "scaling",
 title: "Scaling: load balancers, caching and statelessness",
 level: "Intermediate",
 one: "Systems grow by adding more servers behind a <b>load balancer</b> (horizontal scaling), keeping servers <b>stateless</b>, and putting a <b>cache</b> in front of slow things.",
 why: "These three ideas solve most real scaling problems, and they come up in every system design discussion.",
 steps: [
  { h: "Vertical vs horizontal",
    p: ["<b>Vertical</b>: a bigger machine. Simple, but there's a ceiling and it's one point of failure. <b>Horizontal</b>: more machines behind a load balancer. Scales further and survives one machine dying, but needs <b>stateless</b> servers."] },
  { h: "Stateless servers",
    p: ["If a server keeps user sessions or files in its own memory/disk, the next request may hit a different server that doesn't have them. Keep state in shared places: sessions in Redis or signed tokens, files in object storage (S3), data in the database. Then any server can handle any request."] },
  { h: "Load balancing",
    p: ["The load balancer spreads requests across healthy servers and stops sending to ones failing their health check. Common strategies: round robin, least connections."],
    code: `import itertools

servers = ["app-1", "app-2", "app-3"]
healthy = {"app-1": True, "app-2": False, "app-3": True}
rr = itertools.cycle(servers)

def pick():
    for _ in servers:
        s = next(rr)
        if healthy[s]:
            return s
    raise RuntimeError("no healthy servers")

print([pick() for _ in range(6)])` },
  { h: "Caching",
    p: ["Keep frequent results in fast memory (Redis, or in-process) so most requests skip the slow database or API. The <b>hit rate</b> decides how much it helps. Real traffic is skewed: a few items get most requests, so even a small cache helps a lot:"],
    code: `import random
from collections import OrderedDict

class LRUCache:
    def __init__(self, size):
        self.size, self.data = size, OrderedDict()
    def get(self, k):
        if k in self.data:
            self.data.move_to_end(k)
            return self.data[k]
    def put(self, k, v):
        self.data[k] = v
        self.data.move_to_end(k)
        if len(self.data) > self.size:
            self.data.popitem(last=False)

random.seed(1)
items = list(range(10_000))
weights = [1 / (i + 1) for i in items]            # skewed: low ids are popular
requests = random.choices(items, weights, k=50_000)

for size in [100, 1_000]:
    cache, hits = LRUCache(size), 0
    for key in requests:
        if cache.get(key) is not None:
            hits += 1
        else:
            cache.put(key, f"value {key}")
    print(f"cache of {size:5} items ({size / len(items):.0%} of data): hit rate {hits / len(requests):.0%}")` },
  { h: "Cache invalidation",
    p: ["The hard part: when data changes, the cache must not keep serving the old value. Options: a <b>TTL</b> (expire after N seconds, accept slight staleness), <b>delete the key on update</b>, or <b>write-through</b> (update cache and database together). Choose per data type: product descriptions can be minutes stale; stock and prices usually can't."] },
  { h: "Other everyday tools",
    p: ["<b>CDN</b> for images, scripts and static pages near users. <b>Rate limiting</b> to protect from abuse. <b>Async processing</b> (queues) for slow work. <b>Autoscaling</b> to add servers under load. <b>Connection pooling</b> so many app servers don't exhaust the database."] }
 ],
 mistakes: [
  "Storing sessions or uploaded files on the app server's local disk.",
  "Caching without a plan for invalidation, then serving stale prices.",
  "Adding servers when the real bottleneck is the database.",
  "Forgetting the load balancer itself must be redundant."
 ],
 practice: [
  { q: "With a 90% cache hit rate, the cache answers in 1 ms and the database in 40 ms. What's the average response time?", code: `hit, cache_ms, db_ms = 0.90, 1, 40
print(f"{hit * cache_ms + (1 - hit) * (cache_ms + db_ms):.1f} ms average")` },
  { q: "Users get logged out randomly after you add a second app server. Why, and how do you fix it?", a: "Sessions are stored in each server's memory, and the load balancer sends requests to either server. Move sessions to a shared store (Redis) or use signed tokens, so servers are stateless." }
 ],
 check: [
  ["What makes horizontal scaling work?", ["Big servers", "Stateless app servers behind a load balancer", "More RAM", "One database per server"], 1, "Any server can handle any request."],
  ["Skewed traffic means a small cache…", ["Is useless", "Can still serve a large share of requests", "Must hold everything", "Slows things down"], 1, "Popular items dominate."],
  ["Which data needs the most careful cache invalidation?", ["Logos", "Stock levels and prices", "Blog posts", "Help pages"], 1, "Stale values cost money."]
 ],
 remember: [
  "Horizontal scaling + load balancer + stateless servers.",
  "State goes to shared stores: Redis/tokens, S3, database.",
  "Cache hot data (LRU, TTL); plan invalidation per data type.",
  "CDN, rate limits, queues, autoscaling, connection pools."
 ]
},
{
 id: "databases-scale",
 title: "Databases at scale: replicas, sharding, SQL vs NoSQL",
 level: "Intermediate",
 one: "The database is usually the first bottleneck. Scale it with <b>indexes and caching</b> first, then <b>read replicas</b>, then <b>partitioning/sharding</b>, and pick SQL or NoSQL by your data and access patterns.",
 why: "Every design discussion reaches “where does the data live and how does it scale?”. Clear answers here mark you out.",
 steps: [
  { h: "Scale in this order",
    p: ["<b>1.</b> Fix queries and add indexes (SQL course). <b>2.</b> Cache hot reads. <b>3.</b> Bigger machine. <b>4.</b> <b>Read replicas</b> for read-heavy loads. <b>5.</b> Partition big tables. <b>6.</b> <b>Shard</b> across databases only when one primary can't handle the writes. Each step adds complexity, so stop as early as you can."] },
  { h: "Read replicas",
    p: ["The primary takes writes and copies them to replicas, which serve reads. Catch: <b>replication lag</b>. A user who just saved something may read an old copy from a replica. Fix: read your own recent writes from the primary."],
    code: `import time

class DB:
    def __init__(self, lag_s):
        self.primary, self.replica, self.lag_s, self.pending = {}, {}, lag_s, []
    def write(self, k, v, now):
        self.primary[k] = v
        self.pending.append((now + self.lag_s, k, v))
    def read_replica(self, k, now):
        for t, key, v in [p for p in self.pending if p[0] <= now]:
            self.replica[key] = v
        self.pending = [p for p in self.pending if p[0] > now]
        return self.replica.get(k)

db = DB(lag_s=2)
db.write("profile:6", "new address", now=100)
print("replica right after write:", db.read_replica("profile:6", now=100.5))
print("replica 3 s later:        ", db.read_replica("profile:6", now=103))
print("primary right away:       ", db.primary["profile:6"])` },
  { h: "Sharding",
    p: ["Split data across several databases by a <b>shard key</b>, e.g. customer id. Each shard holds a slice. Pick a key that spreads load evenly and keeps related data together (all of one customer's orders on one shard). Cross-shard queries and transactions become hard, which is why it's a last resort."],
    code: `import hashlib
from collections import Counter

def shard_for(customer_id: int, shards: int = 4) -> int:
    h = int(hashlib.md5(str(customer_id).encode()).hexdigest(), 16)
    return h % shards

print(Counter(shard_for(c) for c in range(1, 10_001)))

def shard_by_region(region): return {"IN": 0, "AE": 1, "US": 2}.get(region, 3)
regions = ["IN"] * 8000 + ["AE"] * 1500 + ["US"] * 500
print("by region:", Counter(shard_by_region(r) for r in regions))`,
    note: "Hashing spreads customers evenly. Sharding by region creates a “hot” shard holding 80% of the data." },
  { h: "Consistent hashing",
    p: ["With <code>hash % N</code>, adding a shard moves almost every key. <b>Consistent hashing</b> places shards on a ring so only about 1/N of keys move. Caches and distributed databases use it."],
    code: `import bisect, hashlib

def h(x): return int(hashlib.md5(str(x).encode()).hexdigest(), 16)

def ring(nodes, vnodes=100):
    points = sorted((h(f"{n}#{i}"), n) for n in nodes for i in range(vnodes))
    return [p for p, _ in points], [n for _, n in points]

def owner(key, r):
    keys, names = r
    return names[bisect.bisect(keys, h(key)) % len(keys)]

keys = range(10_000)
before_ring = ring(["A", "B", "C", "D"])
after_ring = ring(["A", "B", "C", "D", "E"])
moved_ring = sum(owner(k, before_ring) != owner(k, after_ring) for k in keys)
moved_mod = sum(h(k) % 4 != h(k) % 5 for k in keys)
print(f"hash % N: {moved_mod / len(keys):.0%} of keys move when adding a 5th node")
print(f"consistent hashing: {moved_ring / len(keys):.0%} move")` },
  { h: "SQL or NoSQL?",
    p: ["<b>Relational (PostgreSQL, MySQL)</b>: structured data, relationships, transactions, flexible queries. The default for business systems (orders, invoices, users).",
        "<b>Key-value (Redis, DynamoDB)</b>: lookups by key at huge scale. <b>Document (MongoDB)</b>: nested JSON records with varying shapes. <b>Wide-column (Cassandra)</b>: massive write volumes like events and time series. <b>Search (Elasticsearch/OpenSearch)</b>: full-text search. <b>Vector stores</b>: similarity search.",
        "Many systems use Postgres as the main store plus one or two specialised stores. Choose by how you'll <b>read</b> the data."] }
 ],
 mistakes: [
  "Sharding before trying indexes, caching and replicas.",
  "A shard key that creates hot spots (by date, or one huge customer).",
  "Ignoring replication lag (“I saved it but it's gone!”).",
  "Choosing NoSQL “for scale” when the data is relational and the scale is modest."
 ],
 practice: [
  { q: "With 4 shards and hash-mod sharding, which shard does customer 42 go to? Use the same function.", code: `import hashlib
print(int(hashlib.md5(b"42").hexdigest(), 16) % 4)` },
  { q: "An invoicing system for 300 SMEs: SQL or NoSQL? Why?", a: "SQL (e.g. PostgreSQL). Invoices, customers, payments and products are relational, need transactions and flexible reporting, and 300 companies is modest scale for one Postgres database." }
 ],
 check: [
  ["What's usually the first database fix?", ["Sharding", "Better queries and indexes", "NoSQL", "More app servers"], 1, "Cheapest and most effective."],
  ["Replication lag can cause…", ["Faster writes", "Users reading stale data right after saving", "Data loss always", "Nothing"], 1, "Read-your-writes from the primary."],
  ["Why consistent hashing?", ["Encryption", "Adding a node moves only ~1/N of keys", "Faster hashing", "Smaller keys"], 1, "Less reshuffling."]
 ],
 remember: [
  "Order: queries/indexes → cache → bigger box → replicas → partitions → shards.",
  "Replicas: reads scale; watch lag; read your own writes from primary.",
  "Shard key: even spread + related data together.",
  "Consistent hashing: adding a node moves ~1/N keys.",
  "Postgres by default; specialised stores by access pattern."
 ]
},
{
 id: "messaging",
 title: "Messaging and event-driven design",
 level: "Intermediate",
 one: "Instead of services calling each other directly, they publish <b>events</b> (“OrderPlaced”) to a <b>broker</b>, and other services react. This decouples systems and absorbs spikes.",
 why: "Event-driven design is how e-commerce, payments and logistics systems scale and stay resilient. You'll meet Kafka, SQS, RabbitMQ and Pub/Sub in almost any modern company.",
 steps: [
  { h: "Commands, events, and the broker",
    p: ["A <b>command</b> asks one service to do something (“ChargeCard”). An <b>event</b> says something happened (“OrderPlaced”); any number of services may care. The <b>broker</b> stores messages and delivers them to consumers."] },
  { h: "Queue vs pub/sub",
    p: ["<b>Queue</b>: each message goes to <b>one</b> worker (work distribution). <b>Pub/sub (topic)</b>: each message goes to <b>every</b> subscriber group (fan-out). Kafka topics with consumer groups do both: within a group, partitions split the work; each group gets every message."],
    code: `subscribers = {
    "email-service":     lambda e: f"send confirmation for order {e['order_id']}",
    "inventory-service": lambda e: f"reserve stock for order {e['order_id']}",
    "analytics-service": lambda e: f"record sale of {e['total']}",
}

def publish(event):
    for name, handle in subscribers.items():
        print(f"{name:18} -> {handle(event)}")

publish({"type": "OrderPlaced", "order_id": 6, "total": 6900})`,
    note: "The order service doesn't know or care who listens. Adding a new consumer (say, fraud checks) needs no change to it." },
  { h: "The dual-write problem and the outbox",
    p: ["Saving the order to the database and publishing the event are two separate steps; if the second fails, they disagree. The <b>transactional outbox</b>: write the event to an <code>outbox</code> table in the <b>same transaction</b> as the order; a separate relay publishes outbox rows to the broker."],
    code: `import sqlite3, json

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE orders (id INTEGER PRIMARY KEY, total INTEGER);
CREATE TABLE outbox (id INTEGER PRIMARY KEY, event TEXT, published INTEGER DEFAULT 0);
""")

def place_order(order_id, total):
    with db:                                    # one transaction: both or neither
        db.execute("INSERT INTO orders VALUES (?, ?)", (order_id, total))
        db.execute("INSERT INTO outbox (event) VALUES (?)",
                   (json.dumps({"type": "OrderPlaced", "order_id": order_id, "total": total}),))

def relay(publish):
    for oid, event in db.execute("SELECT id, event FROM outbox WHERE published = 0").fetchall():
        publish(json.loads(event))
        db.execute("UPDATE outbox SET published = 1 WHERE id = ?", (oid,))

place_order(6, 6900)
place_order(7, 2600)
relay(lambda e: print("published", e))
print(db.execute("SELECT count(*) FROM outbox WHERE published = 0").fetchone()[0], "unpublished")` },
  { h: "Sagas: multi-step processes without one big transaction",
    p: ["“Place order → charge card → reserve stock → book courier” spans services, so there's no single database transaction. A <b>saga</b> runs the steps and, if one fails, runs <b>compensating</b> steps to undo the earlier ones (refund the card, release the stock)."],
    code: `def run_saga(steps):
    done = []
    for name, action, undo in steps:
        try:
            action()
            done.append((name, undo))
            print("ok  ", name)
        except Exception as e:
            print("FAIL", name, "-", e)
            for prev, compensate in reversed(done):
                compensate()
                print("undo", prev)
            return False
    return True

def fail(): raise RuntimeError("no courier available")
run_saga([
    ("charge card",   lambda: None, lambda: None),
    ("reserve stock", lambda: None, lambda: None),
    ("book courier",  fail,         lambda: None),
])` },
  { h: "Event design tips",
    p: ["Name events in past tense (<code>OrderPlaced</code>). Include an <b>event id</b>, <b>timestamp</b>, <b>version</b> and the key ids, plus enough data that consumers don't all need to call back. Never change a field's meaning; add new fields instead. Consumers must be idempotent (at-least-once delivery)."] }
 ],
 mistakes: [
  "Saving to the DB and publishing separately (dual write): they drift apart.",
  "Events with only an id, so every consumer hammers your API for details.",
  "Breaking event formats that other teams consume.",
  "Using events where a simple synchronous call is clearer (and the caller needs the answer now)."
 ],
 practice: [
  { q: "Which is a command and which is an event? (a) ShipmentDelivered (b) SendInvoice (c) PaymentFailed (d) ReserveStock", a: "Events (something happened): ShipmentDelivered, PaymentFailed. Commands (do something): SendInvoice, ReserveStock." },
  { q: "Design the compensation for each step of: create booking → charge deposit → send confirmation email.", a: "Create booking ↔ cancel booking; charge deposit ↔ refund deposit; send email ↔ send a correction/cancellation email (you can't unsend, so compensate with another message). Order steps so hard-to-undo ones (emails) come last." }
 ],
 check: [
  ["Queue vs pub/sub?", ["Same", "Queue: one worker per message; pub/sub: every subscriber group gets it", "Pub/sub is slower", "Queues fan out"], 1, "Distribution vs fan-out."],
  ["What does the outbox pattern solve?", ["Slow queries", "DB save and event publish getting out of sync", "Encryption", "Caching"], 1, "Write the event in the same transaction."],
  ["A saga step fails. What happens?", ["Everything stays half-done", "Earlier steps are compensated (undone)", "Retry forever", "Database rollback across services"], 1, "Compensating actions."]
 ],
 remember: [
  "Commands ask; events announce (past tense).",
  "Queue = one consumer per message; pub/sub = fan-out to every group.",
  "Outbox: event row in the same DB transaction; relay publishes it.",
  "Sagas: steps + compensations; irreversible steps last.",
  "Events carry id, time, version, key data; consumers idempotent."
 ]
},
{
 id: "microservices",
 title: "Monolith or microservices? Reliability basics",
 level: "Intermediate",
 one: "Start with a well-structured <b>monolith</b>; split into <b>microservices</b> only when teams or scaling needs demand it. Either way, design for failure: <b>timeouts, retries, circuit breakers, redundancy</b>.",
 why: "Many teams split too early and drown in complexity. Being able to argue this trade-off, and to design for failure, is a senior-level skill.",
 steps: [
  { h: "Monolith vs microservices",
    p: ["<b>Monolith</b>: one deployable app. Simple to build, test, deploy and debug; one database; fast calls in memory. Can get tangled if poorly structured.",
        "<b>Microservices</b>: many small services, each owning its data, deployed independently. Teams move independently and parts scale separately, but you pay with network calls, distributed failures, data consistency issues, and much more ops work.",
        "A good middle path: a <b>modular monolith</b> with clear internal boundaries, split later along those lines if needed."] },
  { h: "Availability numbers",
    p: ["99.9% sounds high but allows ~8.8 hours down a year. And when a request needs several services in a chain, their availabilities <b>multiply</b>:"],
    code: `def downtime_per_year(availability):
    return (1 - availability) * 365 * 24

for a in [0.99, 0.999, 0.9999]:
    print(f"{a:.2%} -> {downtime_per_year(a):6.1f} hours down per year")

chain = [0.999] * 5
total = 1
for a in chain:
    total *= a
print(f"5 services at 99.9% in a chain -> {total:.2%} ({downtime_per_year(total):.0f} h/year)")` },
  { h: "Circuit breaker",
    p: ["When a dependency keeps failing, stop calling it for a while (the circuit is “open”) and fail fast or use a fallback, instead of piling up slow requests. After a pause, let one test request through (“half-open”)."],
    code: `import time

class CircuitBreaker:
    def __init__(self, failures_to_open=3, cooldown=30, clock=time.monotonic):
        self.failures, self.limit, self.cooldown, self.clock = 0, failures_to_open, cooldown, clock
        self.opened_at = None

    def call(self, fn, fallback):
        if self.opened_at is not None:
            if self.clock() - self.opened_at < self.cooldown:
                return fallback("circuit open")
            self.opened_at = None                       # half-open: try once
        try:
            result = fn()
            self.failures = 0
            return result
        except Exception as e:
            self.failures += 1
            if self.failures >= self.limit:
                self.opened_at = self.clock()
            return fallback(str(e))

t = [0]
cb = CircuitBreaker(clock=lambda: t[0])
def broken(): raise TimeoutError("recommendations service timed out")
fallback = lambda why: f"show bestsellers instead ({why})"
for second in [0, 1, 2, 3, 4, 40]:
    t[0] = second
    print(second, cb.call(broken, fallback))` },
  { h: "Design for failure",
    p: ["<b>Timeouts</b> on every call. <b>Retries</b> with backoff, only for safe operations. <b>Circuit breakers</b> and <b>fallbacks</b> (cached data, defaults). <b>Bulkheads</b>: separate pools so one slow dependency can't use up all threads. <b>Redundancy</b>: at least two of everything important, in different zones. <b>Graceful degradation</b>: the shop still sells even if recommendations are down."] },
  { h: "Observability across services",
    p: ["With many services, a single request crosses several of them. Use <b>distributed tracing</b> (OpenTelemetry) so one trace shows every hop and where time went, plus correlation ids in logs and per-service metrics (rate, errors, duration)."] }
 ],
 mistakes: [
  "Starting with 15 microservices for a 3-person team.",
  "Services sharing one database table, so they're not independent at all.",
  "No timeouts: one slow service makes everything slow.",
  "Treating every dependency as critical instead of degrading gracefully."
 ],
 practice: [
  { q: "A checkout calls 3 services, each 99.95% available. What's checkout's availability, and roughly how many hours down per year?", code: `a = 0.9995 ** 3
print(f"{a:.3%}, about {(1 - a) * 8760:.0f} hours per year")` },
  { q: "A 4-developer startup asks whether to build their new product as microservices. What do you advise?", a: "A modular monolith: one deployable app with clear module boundaries and one database. It's faster to build and operate. Split out a service later only for a clear reason (a part with very different scaling needs, or a separate team)." }
 ],
 check: [
  ["Five services at 99.9% in a chain give overall…", ["99.9%", "About 99.5%", "100%", "50%"], 1, "Availabilities multiply."],
  ["What does a circuit breaker do?", ["Restarts servers", "Stops calling a failing dependency for a while and fails fast", "Encrypts calls", "Balances load"], 1, "Protects the caller."],
  ["Best starting architecture for a small team?", ["Many microservices", "A modular monolith", "Serverless only", "One file"], 1, "Split later if needed."]
 ],
 remember: [
  "Start with a modular monolith; split for team or scaling reasons.",
  "Chained availabilities multiply; 99.9% ≈ 8.8 h down/year.",
  "Timeouts, safe retries, circuit breakers, fallbacks, bulkheads, redundancy.",
  "Degrade gracefully; trace requests across services."
 ]
},
{
 id: "practice",
 title: "Practice: design a webhook-driven order sync",
 level: "Interview",
 one: "Work through a full design the way you would in an interview or with a client: requirements, numbers, API, diagram, deep dives and trade-offs, for syncing a shop's orders into an ERP.",
 why: "Practising one complete design end to end builds the habit for any question, and this one is exactly the kind of system forward-deployed and integration engineers build.",
 steps: [
  { h: "1. Requirements",
    p: ["<b>Functional</b>: every paid shop order appears in the ERP with customer, lines and totals; cancellations and refunds update it; staff can see failures and retry.",
        "<b>Non-functional</b>: no lost orders; orders in the ERP within 5 minutes; survive the ERP being down for hours; 20k orders/day, 10× on sale days; audit trail of every change."] },
  { h: "2. Numbers",
    code: `orders_per_day, sale_multiplier = 20_000, 10
events_per_order = 3                       # paid, updated, fulfilled...
peak_events_per_s = orders_per_day * sale_multiplier * events_per_order / 86_400 * 3   # peaks ~3x the daily average
erp_limit_per_s = 10                       # ERP API rate limit
backlog_if_erp_down_2h = orders_per_day * sale_multiplier * events_per_order / 24 * 2

print(f"peak events/s: {peak_events_per_s:.0f}")
print(f"ERP can take {erp_limit_per_s}/s -> queue absorbs bursts")
print(f"backlog after a 2-hour ERP outage on a sale day: {backlog_if_erp_down_2h:,.0f} events")
print(f"time to drain at the ERP limit: {backlog_if_erp_down_2h / erp_limit_per_s / 60:.0f} minutes")`,
    note: "Peaks exceed what the ERP accepts, so a queue with rate-limited workers is required, not optional." },
  { h: "3. Design",
    code: `shop ──webhook──► intake API (verify HMAC, store raw event, enqueue, 200)
                          │
                          ▼
                   events table + queue ──► sync workers (rate-limited to ERP limit)
                                               │  map → upsert by external ref (idempotent)
                                               ▼
                                              ERP API
                     failures after retries ──► DLQ + alert + retry UI
nightly reconciler: compare shop orders vs ERP orders for the day → enqueue missing ones
observability: JSON logs with event id, metrics (lag, DLQ size), /health`, lang: "text" },
  { h: "4. Deep dives",
    p: ["<b>Duplicates and ordering</b>: UNIQUE event ids; upsert by <code>SHOP-{id}</code>; ignore events older than the stored version.",
        "<b>ERP down</b>: workers retry with backoff; circuit breaker pauses calls; the queue holds the backlog; drain at the rate limit.",
        "<b>Bad data</b>: unknown SKU or customer → DLQ with a clear reason; ops fix and retry.",
        "<b>Missed webhooks</b>: nightly reconciliation; plus a 15-minute poll of recently updated orders as a safety net."] },
  { h: "5. Trade-offs to say out loud",
    p: ["Async gives resilience but up to minutes of delay (fine here). A database-table queue is simpler than Kafka and enough for this volume; switch if volume grows 50×. Reconciliation costs API calls but guarantees completeness. Storing raw events costs storage but enables replay and audits."] }
 ],
 mistakes: [
  "Skipping numbers: you'd miss that peaks exceed the ERP's rate limit.",
  "No answer for “what if the ERP is down for a day?”",
  "Forgetting the humans: who sees failures, and how do they fix them?"
 ],
 practice: [
  { q: "The ERP's rate limit drops to 2 requests/s. What changes in your design?", a: "Drain time grows 5×, so: batch several orders per request if the ERP supports it, prioritise paid orders over minor updates, merge multiple updates for the same order before sending, and set expectations (delay SLA) with the client. Alert if lag exceeds the agreed limit." },
  { q: "Practise the six steps on: “Design a system that sends customers an SMS when their parcel is out for delivery.” Write your answer in 6 short bullet points.", a: "Example: (1) Requirements: trigger on courier status, SMS within 2 min, no duplicates, opt-outs respected. (2) Numbers: 50k parcels/day → ~1/s, peaks 10/s. (3) API: courier webhook in; SMS provider out. (4) Design: webhook intake → queue → worker checks opt-out + dedupe by parcel+status → SMS API. (5) Deep dives: duplicate courier events, SMS provider failure (retry, fallback provider), quiet hours. (6) Trade-offs: async delay vs reliability; cost per SMS; what we'd add next (delivery-window predictions)." }
 ],
 check: [
  ["Why is a queue required in this design?", ["Fashion", "Peak events exceed the ERP's rate limit and the ERP can be down", "Kafka is free", "To slow orders"], 1, "Numbers drove the choice."],
  ["How do you guarantee no orders are missed?", ["Trust webhooks", "Reconciliation against the source + stored events + DLQ", "More servers", "Bigger ERP"], 1, "Defence in depth."],
  ["Why upsert by external reference?", ["Shorter code", "Retries and duplicate events don't create duplicate orders", "Faster ERP", "Required by SQL"], 1, "Idempotency."]
 ],
 remember: [
  "Always: requirements → numbers → API → diagram → deep dives → trade-offs.",
  "Let numbers justify components (queue because peaks > rate limit).",
  "Cover duplicates, ordering, downtime, bad data, missed events, humans.",
  "Say trade-offs and what you'd change at 10× or 50× scale."
 ]
}
];
