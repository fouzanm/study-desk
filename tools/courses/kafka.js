// Kafka & Streaming. Concepts run on a tiny in-memory Kafka model (MiniKafka) so every example executes;
// real client code (confluent-kafka) is shown with example output.
const MINI = String.raw`
import zlib, json, collections

class MiniKafka:
    """A tiny in-memory model of Kafka: topics -> partitions -> append-only logs with offsets."""
    def __init__(self):
        self.topics, self.committed = {}, {}           # committed[(group, topic, partition)] = next offset
    def create_topic(self, name, partitions):
        self.topics[name] = [[] for _ in range(partitions)]
    def partition_for(self, topic, key):
        return zlib.crc32(key.encode()) % len(self.topics[topic])   # same key -> same partition
    def produce(self, topic, key, value):
        p = self.partition_for(topic, key) if key is not None else sum(map(len, self.topics[topic])) % len(self.topics[topic])
        log = self.topics[topic][p]
        log.append({"offset": len(log), "key": key, "value": value})
        return p, len(log) - 1
    def poll(self, group, topic, partition, max_records=100):
        start = self.committed.get((group, topic, partition), 0)
        return self.topics[topic][partition][start:start + max_records]
    def commit(self, group, topic, partition, next_offset):
        self.committed[(group, topic, partition)] = next_offset
    def lag(self, group, topic):
        return {p: len(log) - self.committed.get((group, topic, p), 0) for p, log in enumerate(self.topics[topic])}

def assign(partitions, consumers):                     # range-style assignment within a consumer group
    out = {c: [] for c in consumers}
    for i, p in enumerate(range(partitions)):
        out[consumers[i % len(consumers)]].append(p)
    return out
`;

module.exports = [
{
 id: "batch-stream",
 title: "Batch vs streaming",
 level: "Intermediate",
 one: "<b>Batch</b> processes bounded chunks of data on a schedule; <b>streaming</b> processes unbounded events continuously, within seconds. Streaming adds real complexity (ordering, late data, exactly-once), so use it when the business needs low latency.",
 why: "Interviewers ask “when would you use streaming?” and real-time roles (fintech, logistics, e-commerce) need Kafka skills. Knowing when NOT to stream is just as valuable.",
 steps: [
  { h: "Latency vs complexity",
    code: `                     batch (hourly/daily)          micro-batch (1-5 min)        streaming (ms-seconds)
examples             finance reports, BI           near-real-time dashboards    fraud checks, live tracking,
                                                                                inventory, alerts, personalisation
tools                Airflow + SQL/dbt/Spark       Spark Structured Streaming   Kafka + Flink / Kafka Streams /
                                                                                Spark Streaming, ksqlDB
complexity           low                           medium                       high: state, ordering, late
                                                                                events, exactly-once, ops
cost                 low                           medium                       always-on infrastructure`, lang: "text" },
  { h: "Events and the log",
    p: ["Streaming systems model data as <b>events</b> (“order 42 was paid at 10:03”) appended to a <b>log</b>. Consumers read the log in order and remember their position (<b>offset</b>). Many consumers can read the same log independently, and replay it from any point."],
    pre: MINI,
    code: `k = MiniKafka()
k.create_topic("orders", partitions=1)
for i, ev in enumerate(["created", "paid", "packed", "shipped"]):
    k.produce("orders", key="order-42", value={"event": ev, "ts": f"10:0{i}"})

for rec in k.poll("billing", "orders", 0):
    print(rec["offset"], rec["value"])
k.commit("billing", "orders", 0, 4)
print("billing has read up to offset 4; analytics (new group) starts from:", len(k.poll("analytics", "orders", 0)), "unread events")` },
  { h: "Event time vs processing time",
    p: ["<b>Event time</b> is when something happened; <b>processing time</b> is when your system sees it. Mobile apps go offline, networks delay messages, so events arrive late and out of order. Correct streaming aggregates group by event time and decide how long to wait for late events (<b>watermarks</b>)."],
    code: `events = [  # (event_time, arrival_time, amount)
    ("10:01", "10:01", 500), ("10:03", "10:04", 300), ("10:02", "10:09", 900),   # arrived 7 minutes late
    ("10:06", "10:06", 200),
]
def window(t):                     # 5-minute tumbling windows by event time
    h, m = map(int, t.split(":")); start = m - m % 5
    return f"{h}:{start:02d}-{h}:{start + 5:02d}"

by_event, by_arrival = {}, {}
for et, at, amt in events:
    by_event[window(et)] = by_event.get(window(et), 0) + amt
    by_arrival[window(at)] = by_arrival.get(window(at), 0) + amt
print("by event time:     ", by_event)
print("by processing time:", by_arrival)`,
    note: "The late 900 belongs to the 10:00–10:05 window. Grouping by arrival time puts it in the wrong window and the 10:00 revenue is under-reported." },
  { h: "When to choose streaming",
    p: ["Ask: what decision needs the data, and how fast? If someone looks at it once a day, batch. If a machine must react in seconds (block a payment, reroute a driver, update stock), stream. A common pattern is both: stream events into Kafka, use them in real time where needed, and land them in the lake for batch analytics."] }
 ],
 mistakes: [
  "Building streaming for a dashboard people check daily.",
  "Aggregating by arrival time instead of event time.",
  "Ignoring late and out-of-order events.",
  "Underestimating the operational cost of always-on systems."
 ],
 practice: [
  { q: "Batch or streaming? (a) nightly GST report (b) alert when a delivery van leaves its route (c) hourly marketing dashboard (d) block a card after 3 failed PINs in a minute", a: "(a) batch. (b) streaming. (c) batch or micro-batch. (d) streaming (stateful: count failures per card in a 1-minute window)." },
  { q: "Compute revenue per 5-minute window by event time, ignoring events more than 5 minutes late (watermark).", code: `events = [("10:01", "10:01", 500), ("10:03", "10:04", 300), ("10:02", "10:09", 900), ("10:06", "10:06", 200)]
to_min = lambda t: int(t[:2]) * 60 + int(t[3:])
totals, dropped = {}, []
for et, at, amt in events:
    if to_min(at) - to_min(et) > 5:
        dropped.append((et, amt)); continue
    w = to_min(et) // 5 * 5
    totals[w] = totals.get(w, 0) + amt
print({f"{w // 60}:{w % 60:02d}": v for w, v in totals.items()}, "dropped late:", dropped)` }
 ],
 check: [
  ["When is streaming justified?", ["Always", "When a system must react within seconds", "For monthly reports", "When data is small"], 1, "Latency need."],
  ["Event time is…", ["When the system processed it", "When it actually happened", "The offset", "The partition"], 1, "Use it for correctness."],
  ["Kafka consumers track their position with…", ["Timestamps only", "Offsets", "Row ids", "Cookies"], 1, "Per partition."]
 ],
 remember: [
  "Batch by default; stream when seconds matter.",
  "Streams are logs of events; consumers track offsets; replay is possible.",
  "Event time vs processing time; late events; watermarks.",
  "Common pattern: stream for real-time + land in lake for batch."
 ]
},
{
 id: "concepts",
 title: "Kafka concepts: topics, partitions, consumer groups",
 level: "Intermediate",
 one: "Kafka stores events in <b>topics</b>, split into <b>partitions</b> for parallelism. Producers choose a partition by <b>key</b> (same key → same partition → ordered). Consumers in a <b>consumer group</b> share partitions; each partition is read by one consumer in the group.",
 why: "Partitions, keys and consumer groups explain Kafka's scaling, ordering guarantees and most production issues. They're asked in nearly every Kafka interview.",
 steps: [
  { h: "Architecture",
    code: `producers ──► broker cluster (3+ brokers)  ──► consumer group "billing"   (2 consumers)
               topic "orders"                    consumer group "analytics" (1 consumer)
                 partition 0  [0][1][2][3]...     each group reads all events independently
                 partition 1  [0][1][2]...        within a group, each partition → one consumer
                 partition 2  [0][1][2][3][4]...
               each partition replicated to 3 brokers (1 leader + followers)
               retention: e.g. 7 days or forever (compacted topics keep latest per key)`, lang: "text" },
  { h: "Keys decide partitions (and ordering)",
    pre: MINI,
    code: `k = MiniKafka()
k.create_topic("orders", partitions=3)
for order_id, event in [("A", "created"), ("B", "created"), ("A", "paid"), ("C", "created"),
                        ("B", "paid"), ("A", "shipped"), ("C", "cancelled")]:
    p, off = k.produce("orders", key=order_id, value=event)
for p, log in enumerate(k.topics["orders"]):
    print(f"partition {p}:", [(r["key"], r["value"]) for r in log])`,
    note: "All events for order A land in one partition, in order: created → paid → shipped. Kafka only guarantees order <b>within a partition</b>, so pick the key that needs ordering (order id, customer id, account id). With only three keys, one partition happens to get none: hashing spreads load evenly only across many keys." },
  { h: "Consumer groups scale reading",
    pre: MINI,
    code: `for consumers in (["c1"], ["c1", "c2"], ["c1", "c2", "c3"], ["c1", "c2", "c3", "c4"]):
    print(f"{len(consumers)} consumer(s):", assign(3, consumers))`,
    note: "With 3 partitions, at most 3 consumers in a group do useful work; a 4th sits idle. Partition count caps parallelism, so choose it with growth in mind (it's hard to change later without reshuffling keys)." },
  { h: "Offsets, commits and lag",
    pre: MINI,
    code: `k = MiniKafka()
k.create_topic("payments", partitions=2)
for i in range(10):
    k.produce("payments", key=f"cust-{i % 4}", value={"amount": 100 * i})

for p in range(2):                              # consumer processes a few records, then commits
    batch = k.poll("ledger", "payments", p, max_records=2)
    for rec in batch:
        pass                                    # ... write to the ledger ...
    if batch:
        k.commit("ledger", "payments", p, batch[-1]["offset"] + 1)
print("lag per partition:", k.lag("ledger", "payments"))`,
    note: "<b>Consumer lag</b> (events produced but not yet processed) is the key health metric for streaming pipelines: growing lag means consumers can't keep up." },
  { h: "Retention, compaction, schemas",
    code: `retention        delete events older than N days (retention.ms) or beyond size
compaction       keep only the latest event per key (good for "current state" topics, CDC)
replication      replication.factor=3, min.insync.replicas=2 for durability
schemas          Avro/Protobuf/JSON Schema in a Schema Registry; compatibility rules
                 (BACKWARD: new consumers can read old events) prevent breaking producers
managed Kafka    Confluent Cloud, AWS MSK, Aiven, Redpanda (Kafka-compatible)
alternatives     Kinesis, Pub/Sub, Event Hubs (similar ideas, different limits)`, lang: "text" }
 ],
 mistakes: [
  "No key (round-robin), then expecting per-entity ordering.",
  "Too few partitions for future scale (can't add consumers beyond it).",
  "A hot key (one huge customer) overloading one partition.",
  "Not monitoring consumer lag."
 ],
 practice: [
  { q: "Produce 1,000 events for 50 customers into 6 partitions and show how evenly they spread.", pre: MINI, code: `k = MiniKafka(); k.create_topic("events", 6)
for i in range(1000):
    k.produce("events", key=f"cust-{i % 50}", value=i)
print([len(log) for log in k.topics["events"]])` },
  { q: "You need ordering per bank account, and 200 accounts produce 90% of traffic. What key and partition count would you consider, and what's the risk?", a: "Key by account_id (ordering per account). Use enough partitions for parallelism (e.g. 24–48) and monitor partition sizes: a very hot account still lands on one partition (hot partition). If one account exceeds a partition's throughput you need to split its work differently (e.g. per sub-account) and accept weaker ordering." }
 ],
 check: [
  ["Kafka guarantees ordering…", ["Across the topic", "Within a partition", "Never", "Per broker"], 1, "Use keys."],
  ["6 partitions, 8 consumers in one group?", ["All busy", "2 consumers idle", "Error", "Partitions split"], 1, "One consumer per partition."],
  ["Consumer lag means…", ["Network ping", "Events produced but not yet processed", "Broker CPU", "Retention"], 1, "Key health metric."]
 ],
 remember: [
  "Topic → partitions → ordered logs with offsets.",
  "Key → partition → per-key ordering.",
  "Consumer group: each partition to one consumer; partitions cap parallelism.",
  "Monitor lag; retention vs compaction; schemas in a registry."
 ]
},
{
 id: "guarantees",
 title: "Delivery guarantees and idempotent consumers",
 level: "Advanced",
 one: "Kafka delivery is <b>at-most-once</b>, <b>at-least-once</b> (the usual default) or <b>exactly-once</b> (with transactions, inside Kafka). In practice you design <b>idempotent consumers</b>: processing the same event twice has the same effect as once.",
 why: "Duplicates and lost events are the classic streaming bugs (double charges, missing orders). Explaining commit order and idempotency is a standard senior interview question.",
 steps: [
  { h: "Commit order decides the guarantee",
    code: `at-most-once    commit offset → process          crash after commit = event LOST
at-least-once   process → commit offset          crash before commit = event processed AGAIN
exactly-once    Kafka transactions: read-process-write to Kafka + offsets committed atomically
                (end-to-end exactly-once to a database still needs idempotent writes)`, lang: "text" },
  { h: "A crash shows the difference",
    pre: MINI,
    code: `def run(mode, crash_at):
    k = MiniKafka(); k.create_topic("payments", 1)
    for i in range(5):
        k.produce("payments", key="acct-1", value={"payment_id": f"p{i}", "amount": 100})
    ledger = []
    for attempt in range(2):                         # attempt 0 crashes, attempt 1 restarts
        for rec in k.poll("ledger", "payments", 0):
            if mode == "at-most-once":
                k.commit("ledger", "payments", 0, rec["offset"] + 1)
            if attempt == 0 and rec["offset"] == crash_at:
                break                                # simulated crash mid-processing
            ledger.append(rec["value"]["payment_id"])
            if mode == "at-least-once":
                k.commit("ledger", "payments", 0, rec["offset"] + 1)
    return ledger

print("at-most-once :", run("at-most-once", crash_at=2))
print("at-least-once:", run("at-least-once", crash_at=2))`,
    note: "At-most-once lost p2 (offset committed, then crash before writing). At-least-once lost nothing. In real systems the crash often happens after writing but before committing, which is where duplicates come from, next step." },
  { h: "Duplicates under at-least-once, and the fix",
    code: `import sqlite3

events = [{"payment_id": "p1", "amount": 500}, {"payment_id": "p2", "amount": 900},
          {"payment_id": "p2", "amount": 900}]   # p2 redelivered: processed, crash before commit

naive = sqlite3.connect(":memory:")
naive.execute("CREATE TABLE ledger (payment_id TEXT, amount INT)")
for e in events:
    naive.execute("INSERT INTO ledger VALUES (?, ?)", (e["payment_id"], e["amount"]))
print("naive total:     ", naive.execute("SELECT SUM(amount) FROM ledger").fetchone()[0])

safe = sqlite3.connect(":memory:")
safe.execute("CREATE TABLE ledger (payment_id TEXT PRIMARY KEY, amount INT)")
for e in events:
    safe.execute("INSERT INTO ledger VALUES (?, ?) ON CONFLICT (payment_id) DO NOTHING", (e["payment_id"], e["amount"]))
print("idempotent total:", safe.execute("SELECT SUM(amount) FROM ledger").fetchone()[0])`,
    note: "Every event needs a unique id; the consumer writes with an upsert/unique constraint (or keeps a processed-ids table). Then redelivery is harmless." },
  { h: "Producer settings",
    code: `from confluent_kafka import Producer

producer = Producer({
    "bootstrap.servers": "broker1:9092,broker2:9092",
    "acks": "all",                    # wait for all in-sync replicas: no loss if a broker dies
    "enable.idempotence": True,       # broker de-duplicates producer retries (no dupes from retries)
    "compression.type": "zstd",
    "linger.ms": 20,                  # small batching delay → higher throughput
})

def delivery(err, msg):
    if err:
        print("delivery failed:", err)            # send to retry/dead-letter handling
producer.produce("payments", key="acct-1", value=b'{"payment_id": "p1", "amount": 500}', callback=delivery)
producer.flush()`, lang: "python", run: false },
  { h: "Poison messages and dead-letter topics",
    p: ["One malformed event shouldn't block a partition forever. Catch processing errors, retry a few times for transient problems, then send the event (with the error) to a <b>dead-letter topic</b> and move on. Alert on DLQ volume and replay after fixing."],
    pre: MINI,
    code: `k = MiniKafka(); k.create_topic("orders", 1); k.create_topic("orders.dlq", 1)
for v in ['{"id": 1, "amount": 500}', '{"id": 2, "amount": "abc"}', 'not json', '{"id": 4, "amount": 700}']:
    k.produce("orders", key="k", value=v)

total = 0
for rec in k.poll("loader", "orders", 0):
    try:
        e = json.loads(rec["value"]); total += int(e["amount"])
    except (ValueError, KeyError) as err:
        k.produce("orders.dlq", key="k", value={"original": rec["value"], "error": type(err).__name__, "offset": rec["offset"]})
    k.commit("loader", "orders", 0, rec["offset"] + 1)
print("processed total:", total)
print("dead letters:", [r["value"] for r in k.topics["orders.dlq"][0]])` }
 ],
 mistakes: [
  "Auto-committing offsets before processing finishes (silent loss).",
  "Assuming 'exactly-once' covers writes to your database.",
  "Events without unique ids, so duplicates can't be detected.",
  "Retrying a poison message forever and blocking the partition."
 ],
 practice: [
  { q: "Make a consumer idempotent using a processed_ids set (no database).", code: `processed, balance = set(), 0
for e in [{"id": "t1", "amt": 100}, {"id": "t2", "amt": 50}, {"id": "t1", "amt": 100}]:
    if e["id"] in processed:
        continue
    balance += e["amt"]; processed.add(e["id"])
print(balance)` },
  { q: "Your consumer commits offsets every 5 seconds automatically, and writes to Postgres. After a crash, some orders are missing. Why, and how do you fix it?", a: "Auto-commit committed offsets for records that were polled but not yet written when it crashed (at-most-once behaviour). Fix: disable auto-commit, commit only after the database write succeeds (at-least-once), and make the write idempotent (upsert on the event id) so redeliveries are safe." }
 ],
 check: [
  ["Process then commit gives…", ["At-most-once", "At-least-once", "Exactly-once always", "No delivery"], 1, "Possible duplicates, no loss."],
  ["How do you make duplicates harmless?", ["Hope", "Idempotent writes keyed by a unique event id", "More partitions", "Shorter retention"], 1, "Upsert / unique constraint."],
  ["acks=all + enable.idempotence protect against…", ["Consumer bugs", "Loss on broker failure and duplicates from producer retries", "Schema changes", "Lag"], 1, "Producer-side safety."]
 ],
 remember: [
  "Commit after processing (at-least-once) + idempotent consumers.",
  "Unique event ids; upsert or processed-ids table.",
  "Producers: acks=all, enable.idempotence.",
  "Dead-letter topics for poison messages; alert on them."
 ]
},
{
 id: "hands-on",
 title: "Hands-on: producing, consuming and stream processing",
 level: "Intermediate",
 one: "Run Kafka locally with Docker, produce and consume with the Python client, and build stateful stream processing: windowed aggregates per key, joins with reference data, and output to another topic or a database.",
 why: "Being able to stand up Kafka and write a working producer/consumer pair is the practical baseline for streaming roles.",
 steps: [
  { h: "Kafka locally (KRaft, no ZooKeeper)",
    code: `docker run -d --name kafka -p 9092:9092 apache/kafka:latest
docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 \\
  --create --topic orders --partitions 3 --replication-factor 1
docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic orders`, lang: "bash",
    out: { text: "Created topic orders.\nTopic: orders  PartitionCount: 3  ReplicationFactor: 1\n  Topic: orders  Partition: 0  Leader: 1  Replicas: 1  Isr: 1\n  Topic: orders  Partition: 1  Leader: 1  Replicas: 1  Isr: 1\n  Topic: orders  Partition: 2  Leader: 1  Replicas: 1  Isr: 1", hand: true } },
  { h: "Producer and consumer in Python",
    code: `# pip install confluent-kafka
import json
from confluent_kafka import Producer, Consumer

p = Producer({"bootstrap.servers": "localhost:9092", "acks": "all", "enable.idempotence": True})
for order_id, amount in [("A", 500), ("B", 900), ("A", 300)]:
    p.produce("orders", key=order_id, value=json.dumps({"order_id": order_id, "amount": amount}))
p.flush()

c = Consumer({"bootstrap.servers": "localhost:9092", "group.id": "revenue",
              "auto.offset.reset": "earliest", "enable.auto.commit": False})
c.subscribe(["orders"])
seen = 0
while seen < 3:
    msg = c.poll(1.0)
    if msg is None or msg.error():
        continue
    event = json.loads(msg.value())
    print(f"partition={msg.partition()} offset={msg.offset()} key={msg.key().decode()} {event}")
    c.commit(message=msg)              # commit after processing
    seen += 1
c.close()`, lang: "python", run: false,
    out: { text: "partition=0 offset=0 key=A {'order_id': 'A', 'amount': 500}\npartition=0 offset=1 key=A {'order_id': 'A', 'amount': 300}\npartition=2 offset=0 key=B {'order_id': 'B', 'amount': 900}", hand: true } },
  { h: "Stateful processing: tumbling windows per key",
    p: ["Most stream processing is keyed state over time windows: “revenue per store per minute”, “failed logins per user in 5 minutes”. Here is the logic Flink/Kafka Streams/Spark run for you, including a watermark for late events:"],
    code: `from collections import defaultdict

events = [  # (event_time_sec, store, amount)
    (3, "kochi", 500), (12, "dubai", 300), (45, "kochi", 200), (61, "kochi", 900),
    (58, "dubai", 100),   # arrives after 61: late but within the allowed 10s
    (125, "dubai", 400),
    (30, "kochi", 999),   # very late: its window already closed
]
WINDOW, ALLOWED_LATENESS = 60, 10
state, closed, watermark = defaultdict(int), set(), 0

def emit_ready():
    for (start, store) in sorted(list(state)):
        if start + WINDOW + ALLOWED_LATENESS <= watermark:
            print(f"window {start:>3}-{start + WINDOW:<3} {store:6} revenue={state.pop((start, store))}")
            closed.add(start)

for t, store, amount in events:
    start = t // WINDOW * WINDOW
    if start in closed:
        print(f"drop late event t={t} {store} {amount} (window {start} already emitted)")
        continue
    state[(start, store)] += amount
    watermark = max(watermark, t)
    emit_ready()
watermark = float("inf"); emit_ready()` },
  { h: "Stream processing frameworks",
    code: `Kafka Streams     Java library inside your service; state stores; exactly-once in Kafka
Apache Flink      most powerful: event time, watermarks, large state, SQL; Confluent/AWS managed
Spark Structured  micro-batch streams with the DataFrame API; easy if you already use Spark
Streaming
ksqlDB / Flink SQL  streaming SQL: CREATE TABLE revenue_per_min AS SELECT ... WINDOW TUMBLING
Kafka Connect     no-code sources/sinks: Debezium CDC in, S3/Snowflake/Elasticsearch out`, lang: "text" },
  { h: "Spark Structured Streaming from Kafka",
    code: `from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.getOrCreate()
schema = "order_id STRING, store STRING, amount INT, event_time TIMESTAMP"
orders = (spark.readStream.format("kafka")
          .option("kafka.bootstrap.servers", "localhost:9092").option("subscribe", "orders").load()
          .select(F.from_json(F.col("value").cast("string"), schema).alias("e")).select("e.*"))

revenue = (orders.withWatermark("event_time", "10 minutes")
           .groupBy(F.window("event_time", "1 minute"), "store")
           .agg(F.sum("amount").alias("revenue")))

(revenue.writeStream.outputMode("update").format("delta")
        .option("checkpointLocation", "s3://lake/_checkpoints/revenue_per_min")
        .start("s3://lake/marts/revenue_per_min"))`, lang: "python", run: false }
 ],
 mistakes: [
  "enable.auto.commit=True with slow processing (loss on crash).",
  "Unbounded state (no windows/TTL) that grows until memory runs out.",
  "No checkpoint location in Spark streaming (can't recover).",
  "Processing time windows when event time is needed."
 ],
 practice: [
  { q: "Count failed logins per user in 60-second windows and flag users with 3 or more.", code: `from collections import Counter
fails = [(5, "u1"), (20, "u1"), (40, "u2"), (55, "u1"), (70, "u2"), (80, "u2"), (95, "u2")]
counts = Counter((t // 60 * 60, user) for t, user in fails)
print({f"{w}-{w + 60} {u}": n for (w, u), n in sorted(counts.items()) if n >= 3})` },
  { q: "Which tool would you pick? (a) team already runs Databricks, wants 1-minute dashboards (b) a Java service needs per-user rolling counts inside the app (c) copy Postgres changes to S3 without code", a: "(a) Spark Structured Streaming. (b) Kafka Streams. (c) Kafka Connect with Debezium (source) and an S3 sink connector." }
 ],
 check: [
  ["Where should the Spark streaming checkpoint live?", ["Nowhere", "Durable storage (S3/HDFS) for recovery", "Driver memory", "XCom"], 1, "Recover progress and state."],
  ["A watermark controls…", ["Encryption", "How long to wait for late events before finalising windows", "Partition count", "Retention"], 1, "Late data handling."],
  ["No-code CDC from Postgres into Kafka?", ["Kafka Streams", "Kafka Connect + Debezium", "ksqlDB only", "Airflow"], 1, "Connectors."]
 ],
 remember: [
  "Kafka locally via Docker (KRaft).",
  "confluent-kafka: produce with keys; consume with manual commits.",
  "Keyed windows + watermarks = core of stream processing.",
  "Flink / Kafka Streams / Spark Streaming / ksqlDB / Connect: pick by team and need."
 ]
},
{
 id: "cdc",
 title: "Change data capture (CDC)",
 level: "Advanced",
 one: "<b>Change data capture</b> streams every insert, update and delete from a database's transaction log (e.g. with <b>Debezium</b>) into Kafka. Downstream, you apply the changes to keep a copy (lake, warehouse, search index) in sync in near real time.",
 why: "CDC replaces slow full-table extracts, captures deletes that updated_at extracts miss, and is the standard way to feed lakes and warehouses from operational databases.",
 steps: [
  { h: "Why not just query updated_at?",
    code: `updated_at polling                       log-based CDC (Debezium)
misses hard deletes                     captures inserts, updates AND deletes
misses intermediate changes             every change, in commit order
load on the source (repeated queries)   reads the WAL/binlog, minimal load
needs an updated_at column everywhere   works for any table
minutes-hours latency                   seconds`, lang: "text" },
  { h: "What a Debezium change event looks like",
    code: `{
  "before": {"id": 42, "status": "paid",     "amount": 900},
  "after":  {"id": 42, "status": "refunded", "amount": 900},
  "op": "u",                                   // c = create, u = update, d = delete, r = snapshot read
  "ts_ms": 1751712183000,
  "source": {"connector": "postgresql", "db": "shop", "table": "orders", "lsn": 23974512}
}`, lang: "json" },
  { h: "Applying change events to a replica",
    code: `import sqlite3

changes = [
    {"op": "r", "after": {"id": 1, "status": "paid", "amount": 500}, "lsn": 100},      # initial snapshot
    {"op": "r", "after": {"id": 2, "status": "paid", "amount": 900}, "lsn": 101},
    {"op": "c", "after": {"id": 3, "status": "pending", "amount": 300}, "lsn": 110},
    {"op": "u", "before": {"id": 2, "status": "paid"}, "after": {"id": 2, "status": "refunded", "amount": 900}, "lsn": 120},
    {"op": "d", "before": {"id": 1, "status": "paid", "amount": 500}, "after": None, "lsn": 130},
    {"op": "u", "before": {"id": 2, "status": "paid"}, "after": {"id": 2, "status": "refunded", "amount": 900}, "lsn": 120},  # redelivered
]

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (id INT PRIMARY KEY, status TEXT, amount INT, _lsn INT, _deleted INT DEFAULT 0)")

def apply(ev):
    row = ev["after"] or ev["before"]
    if ev["op"] == "d":
        db.execute("UPDATE orders SET _deleted = 1, _lsn = ? WHERE id = ? AND _lsn < ?", (ev["lsn"], row["id"], ev["lsn"]))
    else:
        db.execute("""INSERT INTO orders (id, status, amount, _lsn) VALUES (:id, :status, :amount, :lsn)
                      ON CONFLICT (id) DO UPDATE SET status = excluded.status, amount = excluded.amount, _lsn = excluded._lsn
                      WHERE excluded._lsn > orders._lsn""", {**row, "lsn": ev["lsn"]})

for ev in changes:
    apply(ev)
print(db.execute("SELECT * FROM orders ORDER BY id").fetchall())
print("live orders:", db.execute("SELECT id, status FROM orders WHERE _deleted = 0 ORDER BY id").fetchall())`,
    note: "Upserts guarded by the log position (LSN) make replays and redeliveries safe; deletes become soft-delete flags so downstream jobs see them." },
  { h: "Setting up Debezium (Kafka Connect)",
    code: `{
  "name": "shop-postgres-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "shop-db.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "\${secrets:shop-db/password}",
    "database.dbname": "shop",
    "topic.prefix": "shop",
    "table.include.list": "public.orders,public.customers",
    "plugin.name": "pgoutput",
    "snapshot.mode": "initial"
  }
}`, lang: "json",
    note: "Postgres needs <code>wal_level=logical</code> and a replication user. Topics appear as <code>shop.public.orders</code>, keyed by primary key, so all changes for one row stay in order." },
  { h: "Landing CDC in the lake/warehouse",
    p: ["Common pattern: Kafka → raw change table (append every event, with op and LSN) → a <b>MERGE</b> job (dbt incremental, Spark, Snowflake streams/tasks) that applies the latest change per key into the current-state table. Keeping the raw change log also gives you full history (SCD Type 2 for free)."] }
 ],
 mistakes: [
  "Ignoring deletes (op = d) downstream.",
  "Applying changes out of order without an LSN/version guard.",
  "Forgetting the initial snapshot and only capturing new changes.",
  "Replication slots left unconsumed, filling the source database's disk."
 ],
 practice: [
  { q: "From a list of change events, compute the current state per id (latest by lsn, excluding deletes) without a database.", code: `events = [{"op": "c", "id": 1, "status": "new", "lsn": 1}, {"op": "u", "id": 1, "status": "paid", "lsn": 5},
          {"op": "c", "id": 2, "status": "new", "lsn": 2}, {"op": "d", "id": 2, "lsn": 7}, {"op": "u", "id": 1, "status": "new", "lsn": 3}]
state = {}
for e in sorted(events, key=lambda e: e["lsn"]):
    if e["op"] == "d":
        state.pop(e["id"], None)
    else:
        state[e["id"]] = e["status"]
print(state)` },
  { q: "Your Debezium connector was down for 2 days and the Postgres disk is filling up. Why, and what do you do?", a: "The logical replication slot holds WAL until the connector consumes it, so WAL accumulates on the source. Restore the connector quickly so it catches up; monitor slot lag and disk with alerts; if it can't recover in time, drop the slot (protecting production) and re-snapshot the tables afterwards." }
 ],
 check: [
  ["Advantage of log-based CDC over updated_at polling?", ["Simpler", "Captures deletes and every change with low source load", "No Kafka needed", "No ordering"], 1, "Reads the transaction log."],
  ["Debezium op 'd' means…", ["Duplicate", "Delete", "Default", "Data"], 1, "c/u/d/r."],
  ["How do you make CDC application safe for replays?", ["Plain INSERT", "Upsert guarded by LSN/version", "Truncate first", "Random order"], 1, "Newer wins."]
 ],
 remember: [
  "CDC reads the DB log: inserts, updates, deletes, in order.",
  "Debezium + Kafka Connect; topics keyed by primary key.",
  "Apply with LSN-guarded upserts; soft-delete flags.",
  "Initial snapshot + monitor replication slots."
 ]
},
{
 id: "build",
 title: "Project: a real-time order pipeline",
 level: "Project",
 one: "Build a streaming pipeline: order events flow through a topic keyed by order id, a consumer validates them (dead-lettering bad ones), keeps idempotent current state, computes per-minute revenue windows, and reports consumer lag.",
 why: "This combines every streaming concept (keys, groups, offsets, idempotency, DLQ, windows, monitoring) into one story you can demo and explain in interviews.",
 steps: [
  { h: "Design",
    code: `checkout service ──► topic orders (6 partitions, key = order_id, acks=all, idempotent producer)
                         │
            consumer group "order-state" (manual commits after processing)
              ├─ validate (schema) ──bad──► orders.dlq (+ alert)
              ├─ upsert current state by order_id (event_id dedupe)     → orders_current table
              └─ tumbling 1-minute revenue windows by event time        → revenue_per_minute
monitoring: consumer lag per partition, DLQ rate, end-to-end latency`, lang: "text" },
  { h: "The pipeline, running",
    pre: MINI,
    code: `import sqlite3
from collections import defaultdict

k = MiniKafka()
k.create_topic("orders", 3); k.create_topic("orders.dlq", 1)
events = [
    {"event_id": "e1", "order_id": "A", "type": "created", "amount": 500, "t": 5},
    {"event_id": "e2", "order_id": "B", "type": "created", "amount": 900, "t": 20},
    {"event_id": "e3", "order_id": "A", "type": "paid", "amount": 500, "t": 42},
    {"event_id": "e4", "order_id": "C", "type": "created", "amount": "oops", "t": 50},
    {"event_id": "e5", "order_id": "B", "type": "paid", "amount": 900, "t": 70},
    {"event_id": "e3", "order_id": "A", "type": "paid", "amount": 500, "t": 42},           # duplicate delivery
    {"event_id": "e6", "order_id": "D", "type": "paid", "amount": 1200, "t": 95},
]
for e in events:
    k.produce("orders", key=e["order_id"], value=e)

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders_current (order_id TEXT PRIMARY KEY, status TEXT, amount INT, last_t INT)")
db.execute("CREATE TABLE processed (event_id TEXT PRIMARY KEY)")
revenue = defaultdict(int)

def valid(e):
    return isinstance(e.get("amount"), int) and e.get("type") in {"created", "paid", "refunded"}

def process(e):
    if db.execute("SELECT 1 FROM processed WHERE event_id = ?", (e["event_id"],)).fetchone():
        return "duplicate"
    with db:
        db.execute("INSERT INTO processed VALUES (?)", (e["event_id"],))
        db.execute("""INSERT INTO orders_current VALUES (?, ?, ?, ?) ON CONFLICT (order_id) DO UPDATE
                      SET status = excluded.status, amount = excluded.amount, last_t = excluded.last_t
                      WHERE excluded.last_t >= orders_current.last_t""", (e["order_id"], e["type"], e["amount"], e["t"]))
    if e["type"] == "paid":
        revenue[e["t"] // 60 * 60] += e["amount"]
    return "ok"

results = defaultdict(int)
for p in range(3):
    for rec in k.poll("order-state", "orders", p):
        e = rec["value"]
        if not valid(e):
            k.produce("orders.dlq", key=e["order_id"], value=e); results["dlq"] += 1
        else:
            results[process(e)] += 1
        k.commit("order-state", "orders", p, rec["offset"] + 1)

print("results:", dict(results))
print("current state:", db.execute("SELECT order_id, status, amount FROM orders_current ORDER BY order_id").fetchall())
print("paid revenue per minute:", {f"{w}-{w + 60}s": v for w, v in sorted(revenue.items())})
print("consumer lag:", k.lag("order-state", "orders"), "| DLQ:", [r["value"]["event_id"] for r in k.topics["orders.dlq"][0]])`,
    note: "The duplicate e3 was ignored, the malformed e4 went to the DLQ without blocking its partition, and lag is zero after processing." },
  { h: "Tests",
    code: `def dedupe_apply(events):
    seen, state = set(), {}
    for e in events:
        if e["event_id"] in seen:
            continue
        seen.add(e["event_id"])
        cur = state.get(e["order_id"])
        if cur is None or e["t"] >= cur["t"]:
            state[e["order_id"]] = {"status": e["type"], "t": e["t"]}
    return state

def test_duplicate_events_ignored():
    ev = {"event_id": "e1", "order_id": "A", "type": "paid", "t": 1}
    assert dedupe_apply([ev, ev]) == {"A": {"status": "paid", "t": 1}}

def test_out_of_order_does_not_regress_state():
    events = [{"event_id": "e2", "order_id": "A", "type": "paid", "t": 10},
              {"event_id": "e1", "order_id": "A", "type": "created", "t": 5}]
    assert dedupe_apply(events)["A"]["status"] == "paid"`, test: true },
  { h: "Real deployment",
    p: ["Swap MiniKafka for a Kafka/Redpanda container and confluent-kafka, the dictionaries for Postgres tables, and the revenue dict for a windowed aggregate (Flink SQL or Spark Structured Streaming with a watermark). Expose lag and DLQ counts as Prometheus metrics with alerts. Docker Compose with the broker, producer, consumer and Postgres makes a great demo."] }
 ],
 mistakes: [
  "No dedupe (redeliveries double revenue).",
  "One bad message blocking a partition (no DLQ).",
  "Out-of-order events overwriting newer state.",
  "No lag monitoring."
 ],
 practice: [
  { q: "Add a refund event for order B and show the state and revenue impact (refunds subtract revenue in their window).", code: `revenue = {60: 900}
state = {"B": "paid"}
refund = {"order_id": "B", "type": "refunded", "amount": 900, "t": 130}
state[refund["order_id"]] = refund["type"]
w = refund["t"] // 60 * 60
revenue[w] = revenue.get(w, 0) - refund["amount"]
print(state, revenue)` },
  { q: "Lag on partition 4 keeps growing while others are near zero. What could be wrong?", a: "A hot key sending most traffic to partition 4, a poison message being retried forever on that partition, or the consumer assigned to it is slow/stuck (e.g. a slow external call). Check per-key volume, DLQ/error logs and that consumer's processing time; fix with a better key, DLQ handling, or more efficient processing." }
 ],
 check: [
  ["Why key by order_id?", ["Random spread", "All events for an order stay ordered in one partition", "Fewer topics", "Encryption"], 1, "Per-order ordering."],
  ["Why record processed event ids?", ["Audit only", "So redelivered events are ignored (idempotency)", "Speed", "Kafka requires it"], 1, "At-least-once safe."],
  ["What does the DLQ give you?", ["Faster processing", "Bad events set aside without blocking the stream, for later fixing/replay", "Encryption", "Compaction"], 1, "Resilience."]
 ],
 remember: [
  "Key by entity; manual commits after processing.",
  "Validate → DLQ; dedupe by event id; guard against out-of-order.",
  "Windows by event time for metrics.",
  "Monitor lag and DLQ rate."
 ]
}
];
