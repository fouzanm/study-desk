// Lessons for course "kafka". Built by tools/course-builder from tools/courses/kafka.js.
// Python examples were run and their real output stored.
(function (L) {
L["kafka:batch-stream"] = {
 "title": "Batch vs streaming",
 "level": "Intermediate",
 "one": "<b>Batch</b> processes bounded chunks of data on a schedule; <b>streaming</b> processes unbounded events continuously, within seconds. Streaming adds real complexity (ordering, late data, exactly-once), so use it when the business needs low latency.",
 "why": "Interviewers ask “when would you use streaming?” and real-time roles (fintech, logistics, e-commerce) need Kafka skills. Knowing when NOT to stream is just as valuable.",
 "steps": [
  {
   "h": "Latency vs complexity",
   "code": "                     batch (hourly/daily)          micro-batch (1-5 min)        streaming (ms-seconds)\nexamples             finance reports, BI           near-real-time dashboards    fraud checks, live tracking,\n                                                                                inventory, alerts, personalisation\ntools                Airflow + SQL/dbt/Spark       Spark Structured Streaming   Kafka + Flink / Kafka Streams /\n                                                                                Spark Streaming, ksqlDB\ncomplexity           low                           medium                       high: state, ordering, late\n                                                                                events, exactly-once, ops\ncost                 low                           medium                       always-on infrastructure",
   "lang": "text"
  },
  {
   "h": "Events and the log",
   "p": [
    "Streaming systems model data as <b>events</b> (“order 42 was paid at 10:03”) appended to a <b>log</b>. Consumers read the log in order and remember their position (<b>offset</b>). Many consumers can read the same log independently, and replay it from any point."
   ],
   "code": "k = MiniKafka()\nk.create_topic(\"orders\", partitions=1)\nfor i, ev in enumerate([\"created\", \"paid\", \"packed\", \"shipped\"]):\n    k.produce(\"orders\", key=\"order-42\", value={\"event\": ev, \"ts\": f\"10:0{i}\"})\n\nfor rec in k.poll(\"billing\", \"orders\", 0):\n    print(rec[\"offset\"], rec[\"value\"])\nk.commit(\"billing\", \"orders\", 0, 4)\nprint(\"billing has read up to offset 4; analytics (new group) starts from:\", len(k.poll(\"analytics\", \"orders\", 0)), \"unread events\")",
   "out": {
    "text": "0 {'event': 'created', 'ts': '10:00'}\n1 {'event': 'paid', 'ts': '10:01'}\n2 {'event': 'packed', 'ts': '10:02'}\n3 {'event': 'shipped', 'ts': '10:03'}\nbilling has read up to offset 4; analytics (new group) starts from: 4 unread events"
   }
  },
  {
   "h": "Event time vs processing time",
   "p": [
    "<b>Event time</b> is when something happened; <b>processing time</b> is when your system sees it. Mobile apps go offline, networks delay messages, so events arrive late and out of order. Correct streaming aggregates group by event time and decide how long to wait for late events (<b>watermarks</b>)."
   ],
   "code": "events = [  # (event_time, arrival_time, amount)\n    (\"10:01\", \"10:01\", 500), (\"10:03\", \"10:04\", 300), (\"10:02\", \"10:09\", 900),   # arrived 7 minutes late\n    (\"10:06\", \"10:06\", 200),\n]\ndef window(t):                     # 5-minute tumbling windows by event time\n    h, m = map(int, t.split(\":\")); start = m - m % 5\n    return f\"{h}:{start:02d}-{h}:{start + 5:02d}\"\n\nby_event, by_arrival = {}, {}\nfor et, at, amt in events:\n    by_event[window(et)] = by_event.get(window(et), 0) + amt\n    by_arrival[window(at)] = by_arrival.get(window(at), 0) + amt\nprint(\"by event time:     \", by_event)\nprint(\"by processing time:\", by_arrival)",
   "note": "The late 900 belongs to the 10:00–10:05 window. Grouping by arrival time puts it in the wrong window and the 10:00 revenue is under-reported.",
   "out": {
    "text": "by event time:      {'10:00-10:05': 1700, '10:05-10:10': 200}\nby processing time: {'10:00-10:05': 800, '10:05-10:10': 1100}"
   }
  },
  {
   "h": "When to choose streaming",
   "p": [
    "Ask: what decision needs the data, and how fast? If someone looks at it once a day, batch. If a machine must react in seconds (block a payment, reroute a driver, update stock), stream. A common pattern is both: stream events into Kafka, use them in real time where needed, and land them in the lake for batch analytics."
   ]
  }
 ],
 "mistakes": [
  "Building streaming for a dashboard people check daily.",
  "Aggregating by arrival time instead of event time.",
  "Ignoring late and out-of-order events.",
  "Underestimating the operational cost of always-on systems."
 ],
 "practice": [
  {
   "q": "Batch or streaming? (a) nightly GST report (b) alert when a delivery van leaves its route (c) hourly marketing dashboard (d) block a card after 3 failed PINs in a minute",
   "a": "(a) batch. (b) streaming. (c) batch or micro-batch. (d) streaming (stateful: count failures per card in a 1-minute window)."
  },
  {
   "q": "Compute revenue per 5-minute window by event time, ignoring events more than 5 minutes late (watermark).",
   "code": "events = [(\"10:01\", \"10:01\", 500), (\"10:03\", \"10:04\", 300), (\"10:02\", \"10:09\", 900), (\"10:06\", \"10:06\", 200)]\nto_min = lambda t: int(t[:2]) * 60 + int(t[3:])\ntotals, dropped = {}, []\nfor et, at, amt in events:\n    if to_min(at) - to_min(et) > 5:\n        dropped.append((et, amt)); continue\n    w = to_min(et) // 5 * 5\n    totals[w] = totals.get(w, 0) + amt\nprint({f\"{w // 60}:{w % 60:02d}\": v for w, v in totals.items()}, \"dropped late:\", dropped)",
   "out": {
    "text": "{'10:00': 800, '10:05': 200} dropped late: [('10:02', 900)]"
   }
  }
 ],
 "check": [
  [
   "When is streaming justified?",
   [
    "Always",
    "When a system must react within seconds",
    "For monthly reports",
    "When data is small"
   ],
   1,
   "Latency need."
  ],
  [
   "Event time is…",
   [
    "When the system processed it",
    "When it actually happened",
    "The offset",
    "The partition"
   ],
   1,
   "Use it for correctness."
  ],
  [
   "Kafka consumers track their position with…",
   [
    "Timestamps only",
    "Offsets",
    "Row ids",
    "Cookies"
   ],
   1,
   "Per partition."
  ]
 ],
 "remember": [
  "Batch by default; stream when seconds matter.",
  "Streams are logs of events; consumers track offsets; replay is possible.",
  "Event time vs processing time; late events; watermarks.",
  "Common pattern: stream for real-time + land in lake for batch."
 ]
};
L["kafka:concepts"] = {
 "title": "Kafka concepts: topics, partitions, consumer groups",
 "level": "Intermediate",
 "one": "Kafka stores events in <b>topics</b>, split into <b>partitions</b> for parallelism. Producers choose a partition by <b>key</b> (same key → same partition → ordered). Consumers in a <b>consumer group</b> share partitions; each partition is read by one consumer in the group.",
 "why": "Partitions, keys and consumer groups explain Kafka's scaling, ordering guarantees and most production issues. They're asked in nearly every Kafka interview.",
 "steps": [
  {
   "h": "Architecture",
   "code": "producers ──► broker cluster (3+ brokers)  ──► consumer group \"billing\"   (2 consumers)\n               topic \"orders\"                    consumer group \"analytics\" (1 consumer)\n                 partition 0  [0][1][2][3]...     each group reads all events independently\n                 partition 1  [0][1][2]...        within a group, each partition → one consumer\n                 partition 2  [0][1][2][3][4]...\n               each partition replicated to 3 brokers (1 leader + followers)\n               retention: e.g. 7 days or forever (compacted topics keep latest per key)",
   "lang": "text"
  },
  {
   "h": "Keys decide partitions (and ordering)",
   "code": "k = MiniKafka()\nk.create_topic(\"orders\", partitions=3)\nfor order_id, event in [(\"A\", \"created\"), (\"B\", \"created\"), (\"A\", \"paid\"), (\"C\", \"created\"),\n                        (\"B\", \"paid\"), (\"A\", \"shipped\"), (\"C\", \"cancelled\")]:\n    p, off = k.produce(\"orders\", key=order_id, value=event)\nfor p, log in enumerate(k.topics[\"orders\"]):\n    print(f\"partition {p}:\", [(r[\"key\"], r[\"value\"]) for r in log])",
   "note": "All events for order A land in one partition, in order: created → paid → shipped. Kafka only guarantees order <b>within a partition</b>, so pick the key that needs ordering (order id, customer id, account id). With only three keys, one partition happens to get none: hashing spreads load evenly only across many keys.",
   "out": {
    "text": "partition 0: []\npartition 1: [('B', 'created'), ('B', 'paid')]\npartition 2: [('A', 'created'), ('A', 'paid'), ('C', 'created'), ('A', 'shipped'), ('C', 'cancelled')]"
   }
  },
  {
   "h": "Consumer groups scale reading",
   "code": "for consumers in ([\"c1\"], [\"c1\", \"c2\"], [\"c1\", \"c2\", \"c3\"], [\"c1\", \"c2\", \"c3\", \"c4\"]):\n    print(f\"{len(consumers)} consumer(s):\", assign(3, consumers))",
   "note": "With 3 partitions, at most 3 consumers in a group do useful work; a 4th sits idle. Partition count caps parallelism, so choose it with growth in mind (it's hard to change later without reshuffling keys).",
   "out": {
    "text": "1 consumer(s): {'c1': [0, 1, 2]}\n2 consumer(s): {'c1': [0, 2], 'c2': [1]}\n3 consumer(s): {'c1': [0], 'c2': [1], 'c3': [2]}\n4 consumer(s): {'c1': [0], 'c2': [1], 'c3': [2], 'c4': []}"
   }
  },
  {
   "h": "Offsets, commits and lag",
   "code": "k = MiniKafka()\nk.create_topic(\"payments\", partitions=2)\nfor i in range(10):\n    k.produce(\"payments\", key=f\"cust-{i % 4}\", value={\"amount\": 100 * i})\n\nfor p in range(2):                              # consumer processes a few records, then commits\n    batch = k.poll(\"ledger\", \"payments\", p, max_records=2)\n    for rec in batch:\n        pass                                    # ... write to the ledger ...\n    if batch:\n        k.commit(\"ledger\", \"payments\", p, batch[-1][\"offset\"] + 1)\nprint(\"lag per partition:\", k.lag(\"ledger\", \"payments\"))",
   "note": "<b>Consumer lag</b> (events produced but not yet processed) is the key health metric for streaming pipelines: growing lag means consumers can't keep up.",
   "out": {
    "text": "lag per partition: {0: 0, 1: 8}"
   }
  },
  {
   "h": "Retention, compaction, schemas",
   "code": "retention        delete events older than N days (retention.ms) or beyond size\ncompaction       keep only the latest event per key (good for \"current state\" topics, CDC)\nreplication      replication.factor=3, min.insync.replicas=2 for durability\nschemas          Avro/Protobuf/JSON Schema in a Schema Registry; compatibility rules\n                 (BACKWARD: new consumers can read old events) prevent breaking producers\nmanaged Kafka    Confluent Cloud, AWS MSK, Aiven, Redpanda (Kafka-compatible)\nalternatives     Kinesis, Pub/Sub, Event Hubs (similar ideas, different limits)",
   "lang": "text"
  }
 ],
 "mistakes": [
  "No key (round-robin), then expecting per-entity ordering.",
  "Too few partitions for future scale (can't add consumers beyond it).",
  "A hot key (one huge customer) overloading one partition.",
  "Not monitoring consumer lag."
 ],
 "practice": [
  {
   "q": "Produce 1,000 events for 50 customers into 6 partitions and show how evenly they spread.",
   "code": "k = MiniKafka(); k.create_topic(\"events\", 6)\nfor i in range(1000):\n    k.produce(\"events\", key=f\"cust-{i % 50}\", value=i)\nprint([len(log) for log in k.topics[\"events\"]])",
   "out": {
    "text": "[200, 140, 140, 220, 140, 160]"
   }
  },
  {
   "q": "You need ordering per bank account, and 200 accounts produce 90% of traffic. What key and partition count would you consider, and what's the risk?",
   "a": "Key by account_id (ordering per account). Use enough partitions for parallelism (e.g. 24–48) and monitor partition sizes: a very hot account still lands on one partition (hot partition). If one account exceeds a partition's throughput you need to split its work differently (e.g. per sub-account) and accept weaker ordering."
  }
 ],
 "check": [
  [
   "Kafka guarantees ordering…",
   [
    "Across the topic",
    "Within a partition",
    "Never",
    "Per broker"
   ],
   1,
   "Use keys."
  ],
  [
   "6 partitions, 8 consumers in one group?",
   [
    "All busy",
    "2 consumers idle",
    "Error",
    "Partitions split"
   ],
   1,
   "One consumer per partition."
  ],
  [
   "Consumer lag means…",
   [
    "Network ping",
    "Events produced but not yet processed",
    "Broker CPU",
    "Retention"
   ],
   1,
   "Key health metric."
  ]
 ],
 "remember": [
  "Topic → partitions → ordered logs with offsets.",
  "Key → partition → per-key ordering.",
  "Consumer group: each partition to one consumer; partitions cap parallelism.",
  "Monitor lag; retention vs compaction; schemas in a registry."
 ]
};
L["kafka:guarantees"] = {
 "title": "Delivery guarantees and idempotent consumers",
 "level": "Advanced",
 "one": "Kafka delivery is <b>at-most-once</b>, <b>at-least-once</b> (the usual default) or <b>exactly-once</b> (with transactions, inside Kafka). In practice you design <b>idempotent consumers</b>: processing the same event twice has the same effect as once.",
 "why": "Duplicates and lost events are the classic streaming bugs (double charges, missing orders). Explaining commit order and idempotency is a standard senior interview question.",
 "steps": [
  {
   "h": "Commit order decides the guarantee",
   "code": "at-most-once    commit offset → process          crash after commit = event LOST\nat-least-once   process → commit offset          crash before commit = event processed AGAIN\nexactly-once    Kafka transactions: read-process-write to Kafka + offsets committed atomically\n                (end-to-end exactly-once to a database still needs idempotent writes)",
   "lang": "text"
  },
  {
   "h": "A crash shows the difference",
   "code": "def run(mode, crash_at):\n    k = MiniKafka(); k.create_topic(\"payments\", 1)\n    for i in range(5):\n        k.produce(\"payments\", key=\"acct-1\", value={\"payment_id\": f\"p{i}\", \"amount\": 100})\n    ledger = []\n    for attempt in range(2):                         # attempt 0 crashes, attempt 1 restarts\n        for rec in k.poll(\"ledger\", \"payments\", 0):\n            if mode == \"at-most-once\":\n                k.commit(\"ledger\", \"payments\", 0, rec[\"offset\"] + 1)\n            if attempt == 0 and rec[\"offset\"] == crash_at:\n                break                                # simulated crash mid-processing\n            ledger.append(rec[\"value\"][\"payment_id\"])\n            if mode == \"at-least-once\":\n                k.commit(\"ledger\", \"payments\", 0, rec[\"offset\"] + 1)\n    return ledger\n\nprint(\"at-most-once :\", run(\"at-most-once\", crash_at=2))\nprint(\"at-least-once:\", run(\"at-least-once\", crash_at=2))",
   "note": "At-most-once lost p2 (offset committed, then crash before writing). At-least-once lost nothing. In real systems the crash often happens after writing but before committing, which is where duplicates come from, next step.",
   "out": {
    "text": "at-most-once : ['p0', 'p1', 'p3', 'p4']\nat-least-once: ['p0', 'p1', 'p2', 'p3', 'p4']"
   }
  },
  {
   "h": "Duplicates under at-least-once, and the fix",
   "code": "import sqlite3\n\nevents = [{\"payment_id\": \"p1\", \"amount\": 500}, {\"payment_id\": \"p2\", \"amount\": 900},\n          {\"payment_id\": \"p2\", \"amount\": 900}]   # p2 redelivered: processed, crash before commit\n\nnaive = sqlite3.connect(\":memory:\")\nnaive.execute(\"CREATE TABLE ledger (payment_id TEXT, amount INT)\")\nfor e in events:\n    naive.execute(\"INSERT INTO ledger VALUES (?, ?)\", (e[\"payment_id\"], e[\"amount\"]))\nprint(\"naive total:     \", naive.execute(\"SELECT SUM(amount) FROM ledger\").fetchone()[0])\n\nsafe = sqlite3.connect(\":memory:\")\nsafe.execute(\"CREATE TABLE ledger (payment_id TEXT PRIMARY KEY, amount INT)\")\nfor e in events:\n    safe.execute(\"INSERT INTO ledger VALUES (?, ?) ON CONFLICT (payment_id) DO NOTHING\", (e[\"payment_id\"], e[\"amount\"]))\nprint(\"idempotent total:\", safe.execute(\"SELECT SUM(amount) FROM ledger\").fetchone()[0])",
   "note": "Every event needs a unique id; the consumer writes with an upsert/unique constraint (or keeps a processed-ids table). Then redelivery is harmless.",
   "out": {
    "text": "naive total:      2300\nidempotent total: 1400"
   }
  },
  {
   "h": "Producer settings",
   "code": "from confluent_kafka import Producer\n\nproducer = Producer({\n    \"bootstrap.servers\": \"broker1:9092,broker2:9092\",\n    \"acks\": \"all\",                    # wait for all in-sync replicas: no loss if a broker dies\n    \"enable.idempotence\": True,       # broker de-duplicates producer retries (no dupes from retries)\n    \"compression.type\": \"zstd\",\n    \"linger.ms\": 20,                  # small batching delay → higher throughput\n})\n\ndef delivery(err, msg):\n    if err:\n        print(\"delivery failed:\", err)            # send to retry/dead-letter handling\nproducer.produce(\"payments\", key=\"acct-1\", value=b'{\"payment_id\": \"p1\", \"amount\": 500}', callback=delivery)\nproducer.flush()",
   "lang": "python",
   "run": false
  },
  {
   "h": "Poison messages and dead-letter topics",
   "p": [
    "One malformed event shouldn't block a partition forever. Catch processing errors, retry a few times for transient problems, then send the event (with the error) to a <b>dead-letter topic</b> and move on. Alert on DLQ volume and replay after fixing."
   ],
   "code": "k = MiniKafka(); k.create_topic(\"orders\", 1); k.create_topic(\"orders.dlq\", 1)\nfor v in ['{\"id\": 1, \"amount\": 500}', '{\"id\": 2, \"amount\": \"abc\"}', 'not json', '{\"id\": 4, \"amount\": 700}']:\n    k.produce(\"orders\", key=\"k\", value=v)\n\ntotal = 0\nfor rec in k.poll(\"loader\", \"orders\", 0):\n    try:\n        e = json.loads(rec[\"value\"]); total += int(e[\"amount\"])\n    except (ValueError, KeyError) as err:\n        k.produce(\"orders.dlq\", key=\"k\", value={\"original\": rec[\"value\"], \"error\": type(err).__name__, \"offset\": rec[\"offset\"]})\n    k.commit(\"loader\", \"orders\", 0, rec[\"offset\"] + 1)\nprint(\"processed total:\", total)\nprint(\"dead letters:\", [r[\"value\"] for r in k.topics[\"orders.dlq\"][0]])",
   "out": {
    "text": "processed total: 1200\ndead letters: [{'original': '{\"id\": 2, \"amount\": \"abc\"}', 'error': 'ValueError', 'offset': 1}, {'original': 'not json', 'error': 'JSONDecodeError', 'offset': 2}]"
   }
  }
 ],
 "mistakes": [
  "Auto-committing offsets before processing finishes (silent loss).",
  "Assuming 'exactly-once' covers writes to your database.",
  "Events without unique ids, so duplicates can't be detected.",
  "Retrying a poison message forever and blocking the partition."
 ],
 "practice": [
  {
   "q": "Make a consumer idempotent using a processed_ids set (no database).",
   "code": "processed, balance = set(), 0\nfor e in [{\"id\": \"t1\", \"amt\": 100}, {\"id\": \"t2\", \"amt\": 50}, {\"id\": \"t1\", \"amt\": 100}]:\n    if e[\"id\"] in processed:\n        continue\n    balance += e[\"amt\"]; processed.add(e[\"id\"])\nprint(balance)",
   "out": {
    "text": "150"
   }
  },
  {
   "q": "Your consumer commits offsets every 5 seconds automatically, and writes to Postgres. After a crash, some orders are missing. Why, and how do you fix it?",
   "a": "Auto-commit committed offsets for records that were polled but not yet written when it crashed (at-most-once behaviour). Fix: disable auto-commit, commit only after the database write succeeds (at-least-once), and make the write idempotent (upsert on the event id) so redeliveries are safe."
  }
 ],
 "check": [
  [
   "Process then commit gives…",
   [
    "At-most-once",
    "At-least-once",
    "Exactly-once always",
    "No delivery"
   ],
   1,
   "Possible duplicates, no loss."
  ],
  [
   "How do you make duplicates harmless?",
   [
    "Hope",
    "Idempotent writes keyed by a unique event id",
    "More partitions",
    "Shorter retention"
   ],
   1,
   "Upsert / unique constraint."
  ],
  [
   "acks=all + enable.idempotence protect against…",
   [
    "Consumer bugs",
    "Loss on broker failure and duplicates from producer retries",
    "Schema changes",
    "Lag"
   ],
   1,
   "Producer-side safety."
  ]
 ],
 "remember": [
  "Commit after processing (at-least-once) + idempotent consumers.",
  "Unique event ids; upsert or processed-ids table.",
  "Producers: acks=all, enable.idempotence.",
  "Dead-letter topics for poison messages; alert on them."
 ]
};
L["kafka:hands-on"] = {
 "title": "Hands-on: producing, consuming and stream processing",
 "level": "Intermediate",
 "one": "Run Kafka locally with Docker, produce and consume with the Python client, and build stateful stream processing: windowed aggregates per key, joins with reference data, and output to another topic or a database.",
 "why": "Being able to stand up Kafka and write a working producer/consumer pair is the practical baseline for streaming roles.",
 "steps": [
  {
   "h": "Kafka locally (KRaft, no ZooKeeper)",
   "code": "docker run -d --name kafka -p 9092:9092 apache/kafka:latest\ndocker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 \\\n  --create --topic orders --partitions 3 --replication-factor 1\ndocker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic orders",
   "lang": "bash",
   "out": {
    "text": "Created topic orders.\nTopic: orders  PartitionCount: 3  ReplicationFactor: 1\n  Topic: orders  Partition: 0  Leader: 1  Replicas: 1  Isr: 1\n  Topic: orders  Partition: 1  Leader: 1  Replicas: 1  Isr: 1\n  Topic: orders  Partition: 2  Leader: 1  Replicas: 1  Isr: 1",
    "label": "Example output"
   }
  },
  {
   "h": "Producer and consumer in Python",
   "code": "# pip install confluent-kafka\nimport json\nfrom confluent_kafka import Producer, Consumer\n\np = Producer({\"bootstrap.servers\": \"localhost:9092\", \"acks\": \"all\", \"enable.idempotence\": True})\nfor order_id, amount in [(\"A\", 500), (\"B\", 900), (\"A\", 300)]:\n    p.produce(\"orders\", key=order_id, value=json.dumps({\"order_id\": order_id, \"amount\": amount}))\np.flush()\n\nc = Consumer({\"bootstrap.servers\": \"localhost:9092\", \"group.id\": \"revenue\",\n              \"auto.offset.reset\": \"earliest\", \"enable.auto.commit\": False})\nc.subscribe([\"orders\"])\nseen = 0\nwhile seen < 3:\n    msg = c.poll(1.0)\n    if msg is None or msg.error():\n        continue\n    event = json.loads(msg.value())\n    print(f\"partition={msg.partition()} offset={msg.offset()} key={msg.key().decode()} {event}\")\n    c.commit(message=msg)              # commit after processing\n    seen += 1\nc.close()",
   "lang": "python",
   "run": false,
   "out": {
    "text": "partition=0 offset=0 key=A {'order_id': 'A', 'amount': 500}\npartition=0 offset=1 key=A {'order_id': 'A', 'amount': 300}\npartition=2 offset=0 key=B {'order_id': 'B', 'amount': 900}",
    "label": "Example output"
   }
  },
  {
   "h": "Stateful processing: tumbling windows per key",
   "p": [
    "Most stream processing is keyed state over time windows: “revenue per store per minute”, “failed logins per user in 5 minutes”. Here is the logic Flink/Kafka Streams/Spark run for you, including a watermark for late events:"
   ],
   "code": "from collections import defaultdict\n\nevents = [  # (event_time_sec, store, amount)\n    (3, \"kochi\", 500), (12, \"dubai\", 300), (45, \"kochi\", 200), (61, \"kochi\", 900),\n    (58, \"dubai\", 100),   # arrives after 61: late but within the allowed 10s\n    (125, \"dubai\", 400),\n    (30, \"kochi\", 999),   # very late: its window already closed\n]\nWINDOW, ALLOWED_LATENESS = 60, 10\nstate, closed, watermark = defaultdict(int), set(), 0\n\ndef emit_ready():\n    for (start, store) in sorted(list(state)):\n        if start + WINDOW + ALLOWED_LATENESS <= watermark:\n            print(f\"window {start:>3}-{start + WINDOW:<3} {store:6} revenue={state.pop((start, store))}\")\n            closed.add(start)\n\nfor t, store, amount in events:\n    start = t // WINDOW * WINDOW\n    if start in closed:\n        print(f\"drop late event t={t} {store} {amount} (window {start} already emitted)\")\n        continue\n    state[(start, store)] += amount\n    watermark = max(watermark, t)\n    emit_ready()\nwatermark = float(\"inf\"); emit_ready()",
   "out": {
    "text": "window   0-60  dubai  revenue=400\nwindow   0-60  kochi  revenue=700\ndrop late event t=30 kochi 999 (window 0 already emitted)\nwindow  60-120 kochi  revenue=900\nwindow 120-180 dubai  revenue=400"
   }
  },
  {
   "h": "Stream processing frameworks",
   "code": "Kafka Streams     Java library inside your service; state stores; exactly-once in Kafka\nApache Flink      most powerful: event time, watermarks, large state, SQL; Confluent/AWS managed\nSpark Structured  micro-batch streams with the DataFrame API; easy if you already use Spark\nStreaming\nksqlDB / Flink SQL  streaming SQL: CREATE TABLE revenue_per_min AS SELECT ... WINDOW TUMBLING\nKafka Connect     no-code sources/sinks: Debezium CDC in, S3/Snowflake/Elasticsearch out",
   "lang": "text"
  },
  {
   "h": "Spark Structured Streaming from Kafka",
   "code": "from pyspark.sql import SparkSession, functions as F\n\nspark = SparkSession.builder.getOrCreate()\nschema = \"order_id STRING, store STRING, amount INT, event_time TIMESTAMP\"\norders = (spark.readStream.format(\"kafka\")\n          .option(\"kafka.bootstrap.servers\", \"localhost:9092\").option(\"subscribe\", \"orders\").load()\n          .select(F.from_json(F.col(\"value\").cast(\"string\"), schema).alias(\"e\")).select(\"e.*\"))\n\nrevenue = (orders.withWatermark(\"event_time\", \"10 minutes\")\n           .groupBy(F.window(\"event_time\", \"1 minute\"), \"store\")\n           .agg(F.sum(\"amount\").alias(\"revenue\")))\n\n(revenue.writeStream.outputMode(\"update\").format(\"delta\")\n        .option(\"checkpointLocation\", \"s3://lake/_checkpoints/revenue_per_min\")\n        .start(\"s3://lake/marts/revenue_per_min\"))",
   "lang": "python",
   "run": false
  }
 ],
 "mistakes": [
  "enable.auto.commit=True with slow processing (loss on crash).",
  "Unbounded state (no windows/TTL) that grows until memory runs out.",
  "No checkpoint location in Spark streaming (can't recover).",
  "Processing time windows when event time is needed."
 ],
 "practice": [
  {
   "q": "Count failed logins per user in 60-second windows and flag users with 3 or more.",
   "code": "from collections import Counter\nfails = [(5, \"u1\"), (20, \"u1\"), (40, \"u2\"), (55, \"u1\"), (70, \"u2\"), (80, \"u2\"), (95, \"u2\")]\ncounts = Counter((t // 60 * 60, user) for t, user in fails)\nprint({f\"{w}-{w + 60} {u}\": n for (w, u), n in sorted(counts.items()) if n >= 3})",
   "out": {
    "text": "{'0-60 u1': 3, '60-120 u2': 3}"
   }
  },
  {
   "q": "Which tool would you pick? (a) team already runs Databricks, wants 1-minute dashboards (b) a Java service needs per-user rolling counts inside the app (c) copy Postgres changes to S3 without code",
   "a": "(a) Spark Structured Streaming. (b) Kafka Streams. (c) Kafka Connect with Debezium (source) and an S3 sink connector."
  }
 ],
 "check": [
  [
   "Where should the Spark streaming checkpoint live?",
   [
    "Nowhere",
    "Durable storage (S3/HDFS) for recovery",
    "Driver memory",
    "XCom"
   ],
   1,
   "Recover progress and state."
  ],
  [
   "A watermark controls…",
   [
    "Encryption",
    "How long to wait for late events before finalising windows",
    "Partition count",
    "Retention"
   ],
   1,
   "Late data handling."
  ],
  [
   "No-code CDC from Postgres into Kafka?",
   [
    "Kafka Streams",
    "Kafka Connect + Debezium",
    "ksqlDB only",
    "Airflow"
   ],
   1,
   "Connectors."
  ]
 ],
 "remember": [
  "Kafka locally via Docker (KRaft).",
  "confluent-kafka: produce with keys; consume with manual commits.",
  "Keyed windows + watermarks = core of stream processing.",
  "Flink / Kafka Streams / Spark Streaming / ksqlDB / Connect: pick by team and need."
 ]
};
L["kafka:cdc"] = {
 "title": "Change data capture (CDC)",
 "level": "Advanced",
 "one": "<b>Change data capture</b> streams every insert, update and delete from a database's transaction log (e.g. with <b>Debezium</b>) into Kafka. Downstream, you apply the changes to keep a copy (lake, warehouse, search index) in sync in near real time.",
 "why": "CDC replaces slow full-table extracts, captures deletes that updated_at extracts miss, and is the standard way to feed lakes and warehouses from operational databases.",
 "steps": [
  {
   "h": "Why not just query updated_at?",
   "code": "updated_at polling                       log-based CDC (Debezium)\nmisses hard deletes                     captures inserts, updates AND deletes\nmisses intermediate changes             every change, in commit order\nload on the source (repeated queries)   reads the WAL/binlog, minimal load\nneeds an updated_at column everywhere   works for any table\nminutes-hours latency                   seconds",
   "lang": "text"
  },
  {
   "h": "What a Debezium change event looks like",
   "code": "{\n  \"before\": {\"id\": 42, \"status\": \"paid\",     \"amount\": 900},\n  \"after\":  {\"id\": 42, \"status\": \"refunded\", \"amount\": 900},\n  \"op\": \"u\",                                   // c = create, u = update, d = delete, r = snapshot read\n  \"ts_ms\": 1751712183000,\n  \"source\": {\"connector\": \"postgresql\", \"db\": \"shop\", \"table\": \"orders\", \"lsn\": 23974512}\n}",
   "lang": "json"
  },
  {
   "h": "Applying change events to a replica",
   "code": "import sqlite3\n\nchanges = [\n    {\"op\": \"r\", \"after\": {\"id\": 1, \"status\": \"paid\", \"amount\": 500}, \"lsn\": 100},      # initial snapshot\n    {\"op\": \"r\", \"after\": {\"id\": 2, \"status\": \"paid\", \"amount\": 900}, \"lsn\": 101},\n    {\"op\": \"c\", \"after\": {\"id\": 3, \"status\": \"pending\", \"amount\": 300}, \"lsn\": 110},\n    {\"op\": \"u\", \"before\": {\"id\": 2, \"status\": \"paid\"}, \"after\": {\"id\": 2, \"status\": \"refunded\", \"amount\": 900}, \"lsn\": 120},\n    {\"op\": \"d\", \"before\": {\"id\": 1, \"status\": \"paid\", \"amount\": 500}, \"after\": None, \"lsn\": 130},\n    {\"op\": \"u\", \"before\": {\"id\": 2, \"status\": \"paid\"}, \"after\": {\"id\": 2, \"status\": \"refunded\", \"amount\": 900}, \"lsn\": 120},  # redelivered\n]\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE orders (id INT PRIMARY KEY, status TEXT, amount INT, _lsn INT, _deleted INT DEFAULT 0)\")\n\ndef apply(ev):\n    row = ev[\"after\"] or ev[\"before\"]\n    if ev[\"op\"] == \"d\":\n        db.execute(\"UPDATE orders SET _deleted = 1, _lsn = ? WHERE id = ? AND _lsn < ?\", (ev[\"lsn\"], row[\"id\"], ev[\"lsn\"]))\n    else:\n        db.execute(\"\"\"INSERT INTO orders (id, status, amount, _lsn) VALUES (:id, :status, :amount, :lsn)\n                      ON CONFLICT (id) DO UPDATE SET status = excluded.status, amount = excluded.amount, _lsn = excluded._lsn\n                      WHERE excluded._lsn > orders._lsn\"\"\", {**row, \"lsn\": ev[\"lsn\"]})\n\nfor ev in changes:\n    apply(ev)\nprint(db.execute(\"SELECT * FROM orders ORDER BY id\").fetchall())\nprint(\"live orders:\", db.execute(\"SELECT id, status FROM orders WHERE _deleted = 0 ORDER BY id\").fetchall())",
   "note": "Upserts guarded by the log position (LSN) make replays and redeliveries safe; deletes become soft-delete flags so downstream jobs see them.",
   "out": {
    "text": "[(1, 'paid', 500, 130, 1), (2, 'refunded', 900, 120, 0), (3, 'pending', 300, 110, 0)]\nlive orders: [(2, 'refunded'), (3, 'pending')]"
   }
  },
  {
   "h": "Setting up Debezium (Kafka Connect)",
   "code": "{\n  \"name\": \"shop-postgres-cdc\",\n  \"config\": {\n    \"connector.class\": \"io.debezium.connector.postgresql.PostgresConnector\",\n    \"database.hostname\": \"shop-db.internal\",\n    \"database.port\": \"5432\",\n    \"database.user\": \"debezium\",\n    \"database.password\": \"${secrets:shop-db/password}\",\n    \"database.dbname\": \"shop\",\n    \"topic.prefix\": \"shop\",\n    \"table.include.list\": \"public.orders,public.customers\",\n    \"plugin.name\": \"pgoutput\",\n    \"snapshot.mode\": \"initial\"\n  }\n}",
   "lang": "json",
   "note": "Postgres needs <code>wal_level=logical</code> and a replication user. Topics appear as <code>shop.public.orders</code>, keyed by primary key, so all changes for one row stay in order."
  },
  {
   "h": "Landing CDC in the lake/warehouse",
   "p": [
    "Common pattern: Kafka → raw change table (append every event, with op and LSN) → a <b>MERGE</b> job (dbt incremental, Spark, Snowflake streams/tasks) that applies the latest change per key into the current-state table. Keeping the raw change log also gives you full history (SCD Type 2 for free)."
   ]
  }
 ],
 "mistakes": [
  "Ignoring deletes (op = d) downstream.",
  "Applying changes out of order without an LSN/version guard.",
  "Forgetting the initial snapshot and only capturing new changes.",
  "Replication slots left unconsumed, filling the source database's disk."
 ],
 "practice": [
  {
   "q": "From a list of change events, compute the current state per id (latest by lsn, excluding deletes) without a database.",
   "code": "events = [{\"op\": \"c\", \"id\": 1, \"status\": \"new\", \"lsn\": 1}, {\"op\": \"u\", \"id\": 1, \"status\": \"paid\", \"lsn\": 5},\n          {\"op\": \"c\", \"id\": 2, \"status\": \"new\", \"lsn\": 2}, {\"op\": \"d\", \"id\": 2, \"lsn\": 7}, {\"op\": \"u\", \"id\": 1, \"status\": \"new\", \"lsn\": 3}]\nstate = {}\nfor e in sorted(events, key=lambda e: e[\"lsn\"]):\n    if e[\"op\"] == \"d\":\n        state.pop(e[\"id\"], None)\n    else:\n        state[e[\"id\"]] = e[\"status\"]\nprint(state)",
   "out": {
    "text": "{1: 'paid'}"
   }
  },
  {
   "q": "Your Debezium connector was down for 2 days and the Postgres disk is filling up. Why, and what do you do?",
   "a": "The logical replication slot holds WAL until the connector consumes it, so WAL accumulates on the source. Restore the connector quickly so it catches up; monitor slot lag and disk with alerts; if it can't recover in time, drop the slot (protecting production) and re-snapshot the tables afterwards."
  }
 ],
 "check": [
  [
   "Advantage of log-based CDC over updated_at polling?",
   [
    "Simpler",
    "Captures deletes and every change with low source load",
    "No Kafka needed",
    "No ordering"
   ],
   1,
   "Reads the transaction log."
  ],
  [
   "Debezium op 'd' means…",
   [
    "Duplicate",
    "Delete",
    "Default",
    "Data"
   ],
   1,
   "c/u/d/r."
  ],
  [
   "How do you make CDC application safe for replays?",
   [
    "Plain INSERT",
    "Upsert guarded by LSN/version",
    "Truncate first",
    "Random order"
   ],
   1,
   "Newer wins."
  ]
 ],
 "remember": [
  "CDC reads the DB log: inserts, updates, deletes, in order.",
  "Debezium + Kafka Connect; topics keyed by primary key.",
  "Apply with LSN-guarded upserts; soft-delete flags.",
  "Initial snapshot + monitor replication slots."
 ]
};
L["kafka:build"] = {
 "title": "Project: a real-time order pipeline",
 "level": "Project",
 "one": "Build a streaming pipeline: order events flow through a topic keyed by order id, a consumer validates them (dead-lettering bad ones), keeps idempotent current state, computes per-minute revenue windows, and reports consumer lag.",
 "why": "This combines every streaming concept (keys, groups, offsets, idempotency, DLQ, windows, monitoring) into one story you can demo and explain in interviews.",
 "steps": [
  {
   "h": "Design",
   "code": "checkout service ──► topic orders (6 partitions, key = order_id, acks=all, idempotent producer)\n                         │\n            consumer group \"order-state\" (manual commits after processing)\n              ├─ validate (schema) ──bad──► orders.dlq (+ alert)\n              ├─ upsert current state by order_id (event_id dedupe)     → orders_current table\n              └─ tumbling 1-minute revenue windows by event time        → revenue_per_minute\nmonitoring: consumer lag per partition, DLQ rate, end-to-end latency",
   "lang": "text"
  },
  {
   "h": "The pipeline, running",
   "code": "import sqlite3\nfrom collections import defaultdict\n\nk = MiniKafka()\nk.create_topic(\"orders\", 3); k.create_topic(\"orders.dlq\", 1)\nevents = [\n    {\"event_id\": \"e1\", \"order_id\": \"A\", \"type\": \"created\", \"amount\": 500, \"t\": 5},\n    {\"event_id\": \"e2\", \"order_id\": \"B\", \"type\": \"created\", \"amount\": 900, \"t\": 20},\n    {\"event_id\": \"e3\", \"order_id\": \"A\", \"type\": \"paid\", \"amount\": 500, \"t\": 42},\n    {\"event_id\": \"e4\", \"order_id\": \"C\", \"type\": \"created\", \"amount\": \"oops\", \"t\": 50},\n    {\"event_id\": \"e5\", \"order_id\": \"B\", \"type\": \"paid\", \"amount\": 900, \"t\": 70},\n    {\"event_id\": \"e3\", \"order_id\": \"A\", \"type\": \"paid\", \"amount\": 500, \"t\": 42},           # duplicate delivery\n    {\"event_id\": \"e6\", \"order_id\": \"D\", \"type\": \"paid\", \"amount\": 1200, \"t\": 95},\n]\nfor e in events:\n    k.produce(\"orders\", key=e[\"order_id\"], value=e)\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE orders_current (order_id TEXT PRIMARY KEY, status TEXT, amount INT, last_t INT)\")\ndb.execute(\"CREATE TABLE processed (event_id TEXT PRIMARY KEY)\")\nrevenue = defaultdict(int)\n\ndef valid(e):\n    return isinstance(e.get(\"amount\"), int) and e.get(\"type\") in {\"created\", \"paid\", \"refunded\"}\n\ndef process(e):\n    if db.execute(\"SELECT 1 FROM processed WHERE event_id = ?\", (e[\"event_id\"],)).fetchone():\n        return \"duplicate\"\n    with db:\n        db.execute(\"INSERT INTO processed VALUES (?)\", (e[\"event_id\"],))\n        db.execute(\"\"\"INSERT INTO orders_current VALUES (?, ?, ?, ?) ON CONFLICT (order_id) DO UPDATE\n                      SET status = excluded.status, amount = excluded.amount, last_t = excluded.last_t\n                      WHERE excluded.last_t >= orders_current.last_t\"\"\", (e[\"order_id\"], e[\"type\"], e[\"amount\"], e[\"t\"]))\n    if e[\"type\"] == \"paid\":\n        revenue[e[\"t\"] // 60 * 60] += e[\"amount\"]\n    return \"ok\"\n\nresults = defaultdict(int)\nfor p in range(3):\n    for rec in k.poll(\"order-state\", \"orders\", p):\n        e = rec[\"value\"]\n        if not valid(e):\n            k.produce(\"orders.dlq\", key=e[\"order_id\"], value=e); results[\"dlq\"] += 1\n        else:\n            results[process(e)] += 1\n        k.commit(\"order-state\", \"orders\", p, rec[\"offset\"] + 1)\n\nprint(\"results:\", dict(results))\nprint(\"current state:\", db.execute(\"SELECT order_id, status, amount FROM orders_current ORDER BY order_id\").fetchall())\nprint(\"paid revenue per minute:\", {f\"{w}-{w + 60}s\": v for w, v in sorted(revenue.items())})\nprint(\"consumer lag:\", k.lag(\"order-state\", \"orders\"), \"| DLQ:\", [r[\"value\"][\"event_id\"] for r in k.topics[\"orders.dlq\"][0]])",
   "note": "The duplicate e3 was ignored, the malformed e4 went to the DLQ without blocking its partition, and lag is zero after processing.",
   "out": {
    "text": "results: {'ok': 5, 'dlq': 1, 'duplicate': 1}\ncurrent state: [('A', 'paid', 500), ('B', 'paid', 900), ('D', 'paid', 1200)]\npaid revenue per minute: {'0-60s': 500, '60-120s': 2100}\nconsumer lag: {0: 0, 1: 0, 2: 0} | DLQ: ['e4']"
   }
  },
  {
   "h": "Tests",
   "code": "def dedupe_apply(events):\n    seen, state = set(), {}\n    for e in events:\n        if e[\"event_id\"] in seen:\n            continue\n        seen.add(e[\"event_id\"])\n        cur = state.get(e[\"order_id\"])\n        if cur is None or e[\"t\"] >= cur[\"t\"]:\n            state[e[\"order_id\"]] = {\"status\": e[\"type\"], \"t\": e[\"t\"]}\n    return state\n\ndef test_duplicate_events_ignored():\n    ev = {\"event_id\": \"e1\", \"order_id\": \"A\", \"type\": \"paid\", \"t\": 1}\n    assert dedupe_apply([ev, ev]) == {\"A\": {\"status\": \"paid\", \"t\": 1}}\n\ndef test_out_of_order_does_not_regress_state():\n    events = [{\"event_id\": \"e2\", \"order_id\": \"A\", \"type\": \"paid\", \"t\": 10},\n              {\"event_id\": \"e1\", \"order_id\": \"A\", \"type\": \"created\", \"t\": 5}]\n    assert dedupe_apply(events)[\"A\"][\"status\"] == \"paid\"",
   "test": true,
   "out": {
    "text": "..  [100%]\n2 passed in 0.01s"
   }
  },
  {
   "h": "Real deployment",
   "p": [
    "Swap MiniKafka for a Kafka/Redpanda container and confluent-kafka, the dictionaries for Postgres tables, and the revenue dict for a windowed aggregate (Flink SQL or Spark Structured Streaming with a watermark). Expose lag and DLQ counts as Prometheus metrics with alerts. Docker Compose with the broker, producer, consumer and Postgres makes a great demo."
   ]
  }
 ],
 "mistakes": [
  "No dedupe (redeliveries double revenue).",
  "One bad message blocking a partition (no DLQ).",
  "Out-of-order events overwriting newer state.",
  "No lag monitoring."
 ],
 "practice": [
  {
   "q": "Add a refund event for order B and show the state and revenue impact (refunds subtract revenue in their window).",
   "code": "revenue = {60: 900}\nstate = {\"B\": \"paid\"}\nrefund = {\"order_id\": \"B\", \"type\": \"refunded\", \"amount\": 900, \"t\": 130}\nstate[refund[\"order_id\"]] = refund[\"type\"]\nw = refund[\"t\"] // 60 * 60\nrevenue[w] = revenue.get(w, 0) - refund[\"amount\"]\nprint(state, revenue)",
   "out": {
    "text": "{'B': 'refunded'} {60: 900, 120: -900}"
   }
  },
  {
   "q": "Lag on partition 4 keeps growing while others are near zero. What could be wrong?",
   "a": "A hot key sending most traffic to partition 4, a poison message being retried forever on that partition, or the consumer assigned to it is slow/stuck (e.g. a slow external call). Check per-key volume, DLQ/error logs and that consumer's processing time; fix with a better key, DLQ handling, or more efficient processing."
  }
 ],
 "check": [
  [
   "Why key by order_id?",
   [
    "Random spread",
    "All events for an order stay ordered in one partition",
    "Fewer topics",
    "Encryption"
   ],
   1,
   "Per-order ordering."
  ],
  [
   "Why record processed event ids?",
   [
    "Audit only",
    "So redelivered events are ignored (idempotency)",
    "Speed",
    "Kafka requires it"
   ],
   1,
   "At-least-once safe."
  ],
  [
   "What does the DLQ give you?",
   [
    "Faster processing",
    "Bad events set aside without blocking the stream, for later fixing/replay",
    "Encryption",
    "Compaction"
   ],
   1,
   "Resilience."
  ]
 ],
 "remember": [
  "Key by entity; manual commits after processing.",
  "Validate → DLQ; dedupe by event id; guard against out-of-order.",
  "Windows by event time for metrics.",
  "Monitor lag and DLQ rate."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
