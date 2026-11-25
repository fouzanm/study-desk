// Lessons for course "backend-data". Built by tools/course-builder from tools/courses/backend-data.js.
// Python examples were run and their real output stored.
(function (L) {
L["backend-data:modelling"] = {
 "title": "Modelling data for an application",
 "level": "Intermediate",
 "one": "Turn a feature into tables: find the <b>entities</b>, their <b>relationships</b> (one-to-many, many-to-many), the <b>constraints</b> that keep data valid, and the <b>indexes</b> your queries need.",
 "why": "The data model outlives the code. A good one makes features easy; a bad one causes bugs and slow queries for years. Backend interviews almost always include a modelling question.",
 "steps": [
  {
   "h": "From feature to entities",
   "p": [
    "Feature: “customers book appointments with staff for services; each booking has a time slot and a status.” Nouns → entities: customer, staff, service, booking. Relationships: a customer has many bookings; a booking has one service and one staff member; staff offer many services and services are offered by many staff (many-to-many)."
   ],
   "code": "customers (id, name, phone UNIQUE)\nstaff     (id, name)\nservices  (id, name, minutes, price)\nstaff_services (staff_id → staff, service_id → services, PRIMARY KEY (staff_id, service_id))\nbookings  (id, customer_id → customers, staff_id → staff, service_id → services,\n           starts_at, ends_at, status CHECK IN ('booked','done','cancelled'))",
   "lang": "text"
  },
  {
   "h": "Build it with constraints",
   "code": "import sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"PRAGMA foreign_keys = ON\")\ndb.executescript(\"\"\"\nCREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE);\nCREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE services (id INTEGER PRIMARY KEY, name TEXT NOT NULL, minutes INTEGER NOT NULL CHECK (minutes > 0));\nCREATE TABLE staff_services (staff_id INTEGER REFERENCES staff(id), service_id INTEGER REFERENCES services(id),\n                             PRIMARY KEY (staff_id, service_id));\nCREATE TABLE bookings (\n  id INTEGER PRIMARY KEY,\n  customer_id INTEGER NOT NULL REFERENCES customers(id),\n  staff_id INTEGER NOT NULL REFERENCES staff(id),\n  service_id INTEGER NOT NULL REFERENCES services(id),\n  starts_at TEXT NOT NULL, ends_at TEXT NOT NULL,\n  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','done','cancelled')),\n  CHECK (ends_at > starts_at));\nCREATE INDEX bookings_staff_time ON bookings (staff_id, starts_at);\n\"\"\")\ndb.execute(\"INSERT INTO customers VALUES (1, 'Asha', '+91 98000 11111')\")\ndb.execute(\"INSERT INTO staff VALUES (1, 'Meera')\")\ndb.execute(\"INSERT INTO services VALUES (1, 'Haircut', 30)\")\ndb.execute(\"INSERT INTO bookings (customer_id, staff_id, service_id, starts_at, ends_at) VALUES (1, 1, 1, '2025-07-03 10:00', '2025-07-03 10:30')\")\nfor bad in [\"INSERT INTO bookings (customer_id, staff_id, service_id, starts_at, ends_at) VALUES (99, 1, 1, '2025-07-03 11:00', '2025-07-03 11:30')\",\n            \"INSERT INTO customers VALUES (2, 'Asha again', '+91 98000 11111')\"]:\n    try:\n        db.execute(bad)\n    except sqlite3.IntegrityError as e:\n        print(\"blocked:\", e)",
   "out": {
    "text": "blocked: FOREIGN KEY constraint failed\nblocked: UNIQUE constraint failed: customers.phone"
   }
  },
  {
   "h": "Rules the schema can't express",
   "p": [
    "“A staff member can't have overlapping bookings” needs a check in code (or an exclusion constraint in PostgreSQL). Query for overlaps before inserting, inside a transaction:"
   ],
   "code": "import sqlite3\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE bookings (id INTEGER PRIMARY KEY, staff_id INT, starts_at TEXT, ends_at TEXT, status TEXT DEFAULT 'booked')\")\ndb.execute(\"INSERT INTO bookings (staff_id, starts_at, ends_at) VALUES (1, '2025-07-03 10:00', '2025-07-03 10:30')\")\n\ndef book(staff_id, start, end):\n    with db:\n        clash = db.execute(\"\"\"SELECT id FROM bookings WHERE staff_id = ? AND status = 'booked'\n                              AND starts_at < ? AND ends_at > ?\"\"\", (staff_id, end, start)).fetchone()\n        if clash:\n            return f\"slot taken (clashes with booking {clash[0]})\"\n        db.execute(\"INSERT INTO bookings (staff_id, starts_at, ends_at) VALUES (?, ?, ?)\", (staff_id, start, end))\n        return \"booked\"\n\nprint(book(1, \"2025-07-03 10:15\", \"2025-07-03 10:45\"))\nprint(book(1, \"2025-07-03 10:30\", \"2025-07-03 11:00\"))",
   "note": "Two ranges overlap when <code>start1 &lt; end2 AND end1 &gt; start2</code>. Worth memorising.",
   "out": {
    "text": "slot taken (clashes with booking 1)\nbooked"
   }
  },
  {
   "h": "Soft deletes, audit fields and money",
   "p": [
    "Add <code>created_at</code>/<code>updated_at</code> to most tables. Prefer a <code>status</code> or <code>deleted_at</code> over hard deletes for business records (you need history). Store money as integer paise or <code>NUMERIC</code>, with a currency column if you have more than one."
   ]
  }
 ],
 "mistakes": [
  "No foreign keys or unique constraints, so bad data gets in.",
  "Storing lists or JSON blobs where a proper relationship table belongs.",
  "Forgetting indexes for the queries you'll run most.",
  "Deleting business records you'll need for history and reports."
 ],
 "practice": [
  {
   "q": "Model a course platform: students, courses, lessons, enrolments, lesson completions. List tables and keys.",
   "a": "students(id, email UNIQUE) · courses(id, title) · lessons(id, course_id → courses, position, UNIQUE(course_id, position)) · enrolments(student_id, course_id, started_on, PRIMARY KEY(student_id, course_id)) · completions(student_id, lesson_id, completed_at, PRIMARY KEY(student_id, lesson_id)). Index completions(student_id)."
  },
  {
   "q": "Write the overlap condition for two time ranges and test it on (10:00–10:30) vs (10:30–11:00).",
   "code": "def overlaps(s1, e1, s2, e2):\n    return s1 < e2 and e1 > s2\n\nprint(overlaps(\"10:00\", \"10:30\", \"10:30\", \"11:00\"), overlaps(\"10:00\", \"10:30\", \"10:15\", \"10:45\"))",
   "out": {
    "text": "False True"
   }
  }
 ],
 "check": [
  [
   "A many-to-many relationship needs…",
   [
    "A list column",
    "A link table",
    "Two databases",
    "JSON"
   ],
   1,
   "e.g. staff_services."
  ],
  [
   "Two time ranges overlap when…",
   [
    "start1 = start2",
    "start1 < end2 AND end1 > start2",
    "end1 = end2",
    "Never"
   ],
   1,
   "The standard check."
  ],
  [
   "Why soft-delete business records?",
   [
    "Speed",
    "Keep history for audits and reports",
    "Required by SQL",
    "Less storage"
   ],
   1,
   "You'll need the history."
  ]
 ],
 "remember": [
  "Entities from nouns; relationships: 1-to-many (FK), many-to-many (link table).",
  "Constraints: PK, FK, UNIQUE, NOT NULL, CHECK.",
  "Index for the queries you'll run most.",
  "Overlap: start1 < end2 AND end1 > start2.",
  "created_at/updated_at; soft deletes; integer money."
 ]
};
L["backend-data:orm-n1"] = {
 "title": "ORMs and the N+1 query problem",
 "level": "Intermediate",
 "one": "An <b>ORM</b> (SQLAlchemy, Django ORM, Odoo's ORM) maps tables to classes. It's productive, but easy to misuse: the classic trap is <b>N+1 queries</b>, one query for the list plus one per row.",
 "why": "N+1 is the most common reason backend pages are slow. Spotting and fixing it is a daily backend skill and a frequent interview question.",
 "steps": [
  {
   "h": "Models with SQLAlchemy",
   "code": "from sqlalchemy import create_engine, ForeignKey, String, select\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session\n\nclass Base(DeclarativeBase): pass\n\nclass Customer(Base):\n    __tablename__ = \"customers\"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    name: Mapped[str] = mapped_column(String(80))\n    orders: Mapped[list[\"Order\"]] = relationship(back_populates=\"customer\")\n\nclass Order(Base):\n    __tablename__ = \"orders\"\n    id: Mapped[int] = mapped_column(primary_key=True)\n    customer_id: Mapped[int] = mapped_column(ForeignKey(\"customers.id\"))\n    total: Mapped[int]\n    customer: Mapped[Customer] = relationship(back_populates=\"orders\")\n\nengine = create_engine(\"sqlite://\")\nBase.metadata.create_all(engine)\nwith Session(engine) as s:\n    s.add_all([Customer(id=1, name=\"Asha\", orders=[Order(total=55000), Order(total=6900)]),\n               Customer(id=2, name=\"Ben\", orders=[Order(total=9200)])])\n    s.commit()\n    for c in s.scalars(select(Customer).order_by(Customer.id)):\n        print(c.name, [o.total for o in c.orders])",
   "out": {
    "text": "Asha [55000, 6900]\nBen [9200]"
   }
  },
  {
   "h": "Seeing the N+1 problem",
   "p": [
    "Count the SQL statements: loading 50 customers and touching <code>c.orders</code> for each fires 1 + 50 queries."
   ],
   "code": "with Session(engine) as s:\n    queries.clear()\n    customers = s.scalars(select(Customer)).all()\n    totals = {c.name: sum(o.total for o in c.orders) for c in customers}    # lazy-loads orders per customer\n    print(\"lazy loading:\", len(queries), \"queries\")\n\nwith Session(engine) as s:\n    queries.clear()\n    customers = s.scalars(select(Customer).options(selectinload(Customer.orders))).all()\n    totals = {c.name: sum(o.total for o in c.orders) for c in customers}\n    print(\"selectinload:\", len(queries), \"queries\")",
   "out": {
    "text": "lazy loading: 51 queries\nselectinload: 2 queries"
   }
  },
  {
   "h": "Or let the database do the work",
   "p": [
    "When you only need totals, don't load objects at all: aggregate in SQL."
   ],
   "code": "with Session(engine) as s:\n    stmt = (select(Customer.name, func.sum(Order.total).label(\"spent\"))\n            .join(Order).group_by(Customer.id).order_by(func.sum(Order.total).desc()).limit(3))\n    print(s.execute(stmt).all())\n    print(len(queries), \"query\")",
   "out": {
    "text": "[('c50', 5050), ('c49', 4950), ('c48', 4850)]\n1 query"
   }
  },
  {
   "h": "ORM habits",
   "p": [
    "Turn on SQL logging in development (<code>echo=True</code>) and watch query counts per request. Load related data deliberately (<code>selectinload</code>/<code>joinedload</code>, Django's <code>select_related</code>/<code>prefetch_related</code>, Odoo's <code>read_group</code> and prefetching on recordsets). Fetch only the columns you need. Use bulk operations for many rows instead of one save per row."
   ]
  }
 ],
 "mistakes": [
  "Touching a relationship inside a loop (N+1).",
  "Loading full objects to compute a count or sum: aggregate in SQL.",
  "Saving rows one by one in a loop for imports; use bulk inserts.",
  "Never looking at the SQL the ORM generates."
 ],
 "practice": [
  {
   "q": "A page lists 100 orders with their customer name and is slow. What's likely happening and how do you fix it in SQLAlchemy?",
   "a": "Each <code>order.customer.name</code> triggers a lazy query: 1 + 100 queries. Load customers with the orders: <code>select(Order).options(joinedload(Order.customer))</code> (one query with a join) or <code>selectinload</code> (two queries)."
  },
  {
   "q": "Count customers with at least one order over 5,000 using one SQL query through SQLAlchemy.",
   "code": "with Session(engine) as s:\n    n = s.scalar(select(func.count(func.distinct(Order.customer_id))).where(Order.total > 5000))\n    print(n)",
   "out": {
    "text": "1"
   }
  }
 ],
 "check": [
  [
   "N+1 queries means…",
   [
    "One query per page",
    "One query for the list plus one per row",
    "N joins",
    "A slow index"
   ],
   1,
   "Lazy loading in a loop."
  ],
  [
   "Fix N+1 in SQLAlchemy with…",
   [
    "More RAM",
    "selectinload / joinedload",
    "Raw strings",
    "A bigger server"
   ],
   1,
   "Eager loading."
  ],
  [
   "Need only the total revenue per customer?",
   [
    "Load all objects and sum in Python",
    "Aggregate in SQL (GROUP BY)",
    "Cache everything",
    "Use JSON"
   ],
   1,
   "Let the DB do it."
  ]
 ],
 "remember": [
  "ORM = tables as classes; watch the SQL it generates.",
  "N+1: relationship access inside a loop. Fix with eager loading.",
  "Aggregate in SQL when you need numbers, not objects.",
  "Fetch only needed columns; bulk operations for many rows.",
  "Same idea in Django (select_related/prefetch_related) and Odoo (read_group, prefetch)."
 ]
};
L["backend-data:redis"] = {
 "title": "Caching with Redis",
 "level": "Intermediate",
 "one": "<b>Redis</b> is an in-memory data store used for <b>caching</b>, <b>sessions</b>, <b>rate limiting</b>, <b>counters</b> and <b>simple queues</b>. Reads and writes take well under a millisecond.",
 "why": "Almost every production backend uses Redis. Knowing the cache-aside pattern, TTLs and invalidation is expected for backend roles.",
 "steps": [
  {
   "h": "Basic commands",
   "p": [
    "These examples use <code>fakeredis</code>, which runs real Redis commands in memory; with a real server you'd write <code>redis.Redis(host=..., port=6379)</code>."
   ],
   "code": "import fakeredis\n\nr = fakeredis.FakeRedis(decode_responses=True)\nr.set(\"greeting\", \"hello\")\nr.set(\"otp:+919800011111\", \"4821\", ex=300)          # expires in 5 minutes\nr.incr(\"page_views:home\"); r.incr(\"page_views:home\")\nr.hset(\"user:6\", mapping={\"name\": \"Asha\", \"plan\": \"pro\"})\nprint(r.get(\"greeting\"), r.ttl(\"otp:+919800011111\"), r.get(\"page_views:home\"), r.hgetall(\"user:6\"))",
   "out": {
    "text": "hello 300 2 {'name': 'Asha', 'plan': 'pro'}"
   }
  },
  {
   "h": "Cache-aside",
   "p": [
    "Check the cache; on a miss, load from the database and store it with a TTL. On updates, delete the cached key."
   ],
   "code": "import fakeredis, json, time\n\nr = fakeredis.FakeRedis(decode_responses=True)\nDB = {6: {\"id\": 6, \"name\": \"Headphones\", \"price\": 3000}}\ndb_reads = 0\n\ndef get_product(pid):\n    global db_reads\n    cached = r.get(f\"product:{pid}\")\n    if cached:\n        return json.loads(cached), \"cache\"\n    db_reads += 1\n    product = DB[pid]                                   # slow DB call in real life\n    r.set(f\"product:{pid}\", json.dumps(product), ex=600)\n    return product, \"db\"\n\ndef update_price(pid, price):\n    DB[pid][\"price\"] = price\n    r.delete(f\"product:{pid}\")                          # invalidate\n\nprint(get_product(6)); print(get_product(6))\nupdate_price(6, 3200)\nprint(get_product(6))\nprint(\"db reads:\", db_reads)",
   "out": {
    "text": "({'id': 6, 'name': 'Headphones', 'price': 3000}, 'db')\n({'id': 6, 'name': 'Headphones', 'price': 3000}, 'cache')\n({'id': 6, 'name': 'Headphones', 'price': 3200}, 'db')\ndb reads: 2"
   }
  },
  {
   "h": "Rate limiting with counters",
   "code": "import fakeredis\n\nr = fakeredis.FakeRedis()\n\ndef allow(user_id: str, minute: int, limit: int = 3) -> bool:\n    key = f\"rl:{user_id}:{minute}\"\n    count = r.incr(key)\n    if count == 1:\n        r.expire(key, 60)\n    return count <= limit\n\nprint([allow(\"u6\", minute=1000) for _ in range(5)], allow(\"u6\", minute=1001))",
   "note": "INCR is atomic, so many app servers can share one counter safely.",
   "out": {
    "text": "[True, True, True, False, False] True"
   }
  },
  {
   "h": "Leaderboards and queues",
   "code": "import fakeredis\n\nr = fakeredis.FakeRedis(decode_responses=True)\nfor name, score in [(\"asha\", 82), (\"ben\", 95), (\"chen\", 77), (\"divya\", 95)]:\n    r.zadd(\"quiz:sql\", {name: score})\nprint(r.zrevrange(\"quiz:sql\", 0, 2, withscores=True))\n\nr.rpush(\"jobs\", \"email:6\", \"sync:7\")\nprint(r.lpop(\"jobs\"), r.llen(\"jobs\"))",
   "out": {
    "text": "[('divya', 95.0), ('ben', 95.0), ('asha', 82.0)]\nemail:6 1"
   }
  },
  {
   "h": "Cache pitfalls",
   "p": [
    "<b>Stale data</b>: always set a TTL and invalidate on writes. <b>Stampede</b>: a popular key expires and 1,000 requests hit the DB at once; add jitter to TTLs or let one request refresh. <b>Memory</b>: Redis keeps data in RAM; set a max memory policy. <b>Not a database</b>: data can be lost on restart unless persistence is configured; keep the source of truth in your DB."
   ]
  }
 ],
 "mistakes": [
  "Caching without TTLs or invalidation, then serving old prices.",
  "Treating Redis as the only copy of important data.",
  "Huge keys/values (megabytes) that slow everything down.",
  "Caching per-user data under shared keys (data leaks between users)."
 ],
 "practice": [
  {
   "q": "Store a login session for 30 minutes and extend it on each request (sliding expiry).",
   "code": "import fakeredis\nr = fakeredis.FakeRedis(decode_responses=True)\nr.set(\"session:abc\", \"user:6\", ex=1800)\nr.expire(\"session:abc\", 1800)                # on each request: reset the timer\nprint(r.get(\"session:abc\"), r.ttl(\"session:abc\"))",
   "out": {
    "text": "user:6 1800"
   }
  },
  {
   "q": "Product prices change a few times a day; product descriptions rarely. What TTLs and invalidation would you use?",
   "a": "Descriptions: long TTL (hours) plus delete-on-update. Prices: short TTL (a minute or two) plus delete-on-update, or don't cache them at checkout (always read the DB for the final price)."
  }
 ],
 "check": [
  [
   "Cache-aside on a miss…",
   [
    "Returns nothing",
    "Loads from DB and stores in cache with a TTL",
    "Deletes the DB row",
    "Waits"
   ],
   1,
   "Then serves from cache next time."
  ],
  [
   "Why INCR for rate limits?",
   [
    "Pretty",
    "It's atomic, so many servers can share it",
    "Faster than GET",
    "Required"
   ],
   1,
   "No race conditions."
  ],
  [
   "After updating a product price you should…",
   [
    "Do nothing",
    "Delete or update the cached entry",
    "Restart Redis",
    "Increase the TTL"
   ],
   1,
   "Invalidate."
  ]
 ],
 "remember": [
  "Redis: in-memory, sub-ms; strings, hashes, lists, sorted sets, counters.",
  "Cache-aside: get → miss → load DB → set with TTL; delete on update.",
  "INCR + EXPIRE for rate limits; ZADD for leaderboards; lists for simple queues.",
  "Watch staleness, stampedes, memory; DB stays the source of truth."
 ]
};
L["backend-data:nosql"] = {
 "title": "NoSQL: document, key-value and when to use them",
 "level": "Intermediate",
 "one": "<b>NoSQL</b> databases trade joins and strict schemas for flexibility or scale: <b>document</b> (MongoDB), <b>key-value</b> (Redis, DynamoDB), <b>wide-column</b> (Cassandra), <b>search</b> (Elasticsearch). Choose by how you'll <b>read</b> the data.",
 "why": "Many companies run MongoDB or DynamoDB alongside Postgres. You need to model for them and, just as importantly, know when a relational database is the better choice.",
 "steps": [
  {
   "h": "Documents: store what you read together",
   "p": [
    "A document holds nested data in one record. Embed things that are read together and owned by the parent (order lines); reference things shared by many (customers, products). Examples use <code>mongomock</code>, which follows the MongoDB (pymongo) API in memory."
   ],
   "code": "import mongomock\n\ndb = mongomock.MongoClient().shop\ndb.orders.insert_many([\n    {\"_id\": 6, \"customer_id\": 1, \"status\": \"paid\", \"total\": 6900,\n     \"lines\": [{\"sku\": \"HP\", \"qty\": 2, \"price\": 3000}, {\"sku\": \"COF\", \"qty\": 1, \"price\": 900}],\n     \"shipping\": {\"city\": \"Kochi\", \"pin\": \"682001\"}},\n    {\"_id\": 7, \"customer_id\": 2, \"status\": \"pending\", \"total\": 2000,\n     \"lines\": [{\"sku\": \"TEA\", \"qty\": 5, \"price\": 400}], \"shipping\": {\"city\": \"Dubai\"}},\n])\norder = db.orders.find_one({\"_id\": 6})\nprint(order[\"shipping\"][\"city\"], [l[\"sku\"] for l in order[\"lines\"]])\nprint([o[\"_id\"] for o in db.orders.find({\"lines.sku\": \"TEA\"})])",
   "out": {
    "text": "Kochi ['HP', 'COF']\n[7]"
   }
  },
  {
   "h": "Queries and aggregation",
   "code": "import mongomock\n\ndb = mongomock.MongoClient().shop\ndb.orders.insert_many([\n    {\"_id\": 1, \"customer_id\": 1, \"status\": \"paid\", \"total\": 55000, \"shipping\": {\"city\": \"Kochi\"}},\n    {\"_id\": 2, \"customer_id\": 1, \"status\": \"paid\", \"total\": 6900, \"shipping\": {\"city\": \"Kochi\"}},\n    {\"_id\": 3, \"customer_id\": 2, \"status\": \"paid\", \"total\": 9200, \"shipping\": {\"city\": \"Bengaluru\"}},\n    {\"_id\": 4, \"customer_id\": 3, \"status\": \"cancelled\", \"total\": 3000, \"shipping\": {\"city\": \"Dubai\"}},\n])\nprint([o[\"_id\"] for o in db.orders.find({\"total\": {\"$gt\": 5000}, \"status\": \"paid\"})])\npipeline = [\n    {\"$match\": {\"status\": \"paid\"}},\n    {\"$group\": {\"_id\": \"$shipping.city\", \"revenue\": {\"$sum\": \"$total\"}, \"orders\": {\"$sum\": 1}}},\n    {\"$sort\": {\"revenue\": -1}},\n]\nprint(list(db.orders.aggregate(pipeline)))",
   "out": {
    "text": "[1, 2, 3]\n[{'revenue': 61900, 'orders': 2, '_id': 'Kochi'}, {'revenue': 9200, 'orders': 1, '_id': 'Bengaluru'}]"
   }
  },
  {
   "h": "Key-value design (DynamoDB style)",
   "p": [
    "Key-value stores are fast only through the key. You design keys around the questions you'll ask: <code>PK = CUSTOMER#1</code>, <code>SK = ORDER#2025-07-03#6</code> lets you fetch a customer's orders by date range in one call."
   ],
   "code": "items = {}\ndef put(pk, sk, data): items[(pk, sk)] = data\ndef query(pk, sk_prefix):\n    return [v for (p, s), v in sorted(items.items()) if p == pk and s.startswith(sk_prefix)]\n\nput(\"CUSTOMER#1\", \"PROFILE\", {\"name\": \"Asha\"})\nput(\"CUSTOMER#1\", \"ORDER#2025-06-02#1\", {\"total\": 55000})\nput(\"CUSTOMER#1\", \"ORDER#2025-07-03#6\", {\"total\": 6900})\nput(\"CUSTOMER#2\", \"ORDER#2025-07-05#7\", {\"total\": 2000})\nprint(query(\"CUSTOMER#1\", \"ORDER#2025-07\"))",
   "out": {
    "text": "[{'total': 6900}]"
   }
  },
  {
   "h": "SQL or NoSQL?",
   "p": [
    "<b>Relational</b>: data with many relationships, transactions across records, flexible reporting, strong consistency. Most business systems (orders, accounting, ERP).",
    "<b>Document</b>: self-contained records with varying shape (product catalogues with different attributes, content, event payloads). <b>Key-value</b>: huge scale lookups by a known key (sessions, carts, user settings). <b>Search</b>: full-text and faceted search. <b>Wide-column</b>: massive write volumes (events, IoT).",
    "PostgreSQL's <code>jsonb</code> often gives you document flexibility inside a relational database, which is a great middle ground."
   ]
  }
 ],
 "mistakes": [
  "Choosing MongoDB to avoid designing a schema; the schema just moves into code.",
  "Embedding things that grow without limit (all of a customer's orders inside the customer document).",
  "Needing joins and reports everywhere in a document store.",
  "Designing DynamoDB tables before listing the queries you'll run."
 ],
 "practice": [
  {
   "q": "With mongomock, count paid orders per customer and return customers with 2 or more.",
   "code": "import mongomock\ndb = mongomock.MongoClient().shop\ndb.orders.insert_many([{\"customer_id\": c, \"status\": \"paid\"} for c in [1, 1, 2, 3, 3, 3]])\nprint(list(db.orders.aggregate([\n    {\"$match\": {\"status\": \"paid\"}},\n    {\"$group\": {\"_id\": \"$customer_id\", \"n\": {\"$sum\": 1}}},\n    {\"$match\": {\"n\": {\"$gte\": 2}}},\n    {\"$sort\": {\"_id\": 1}},\n])))",
   "out": {
    "text": "[{'n': 2, '_id': 1}, {'n': 3, '_id': 3}]"
   }
  },
  {
   "q": "A product catalogue has phones (RAM, storage), shirts (size, colour) and books (author, pages). How would you store it in PostgreSQL without 40 nullable columns?",
   "a": "Common columns (id, name, price, category) as normal columns, and category-specific attributes in a <code>jsonb attributes</code> column, with a GIN index if you filter on them. Or a document store if the catalogue is the main workload."
  }
 ],
 "check": [
  [
   "In a document database, embed…",
   [
    "Everything",
    "Data read together and owned by the parent",
    "Shared entities like customers",
    "Nothing"
   ],
   1,
   "Reference shared things."
  ],
  [
   "Key-value stores are fast when you…",
   [
    "Scan everything",
    "Query by the designed key",
    "Join tables",
    "Use SQL"
   ],
   1,
   "Design keys around queries."
  ],
  [
   "Best default for an accounting system?",
   [
    "Key-value",
    "Relational (PostgreSQL)",
    "Wide-column",
    "Search engine"
   ],
   1,
   "Relationships, transactions, reports."
  ]
 ],
 "remember": [
  "Document (Mongo): embed what's read together; reference shared data.",
  "Key-value (Dynamo/Redis): design keys from the queries.",
  "Search engines for full text; wide-column for huge write volumes.",
  "Relational by default for business data; jsonb for flexible attributes.",
  "List your queries before choosing a store."
 ]
};
L["backend-data:concurrency"] = {
 "title": "Concurrency: race conditions and locking",
 "level": "Advanced",
 "one": "When two requests change the same data at the same time, one can overwrite the other: a <b>race condition</b>. Prevent it with <b>atomic updates</b>, <b>locks</b> (pessimistic) or <b>version checks</b> (optimistic).",
 "why": "Double-booked slots, oversold stock and lost updates are real, costly bugs. Interviewers love “two users click Buy at once — what happens?”.",
 "steps": [
  {
   "h": "A race in plain Python",
   "p": [
    "Two threads read, add and write a shared counter. Without a lock some updates are lost; with a lock the result is right."
   ],
   "code": "import threading, time\n\nclass Stock:\n    def __init__(self): self.qty = 100\n    def sell(self):\n        current = self.qty\n        time.sleep(0)               # gives other threads a chance to run here\n        self.qty = current - 1\n\ndef run(stock, lock=None):\n    def worker():\n        for _ in range(50):\n            if lock:\n                with lock: stock.sell()\n            else:\n                stock.sell()\n    threads = [threading.Thread(target=worker) for _ in range(2)]\n    [t.start() for t in threads]; [t.join() for t in threads]\n    return stock.qty\n\nprint(\"without lock:\", run(Stock()), \"(should be 0)\")\nprint(\"with lock:   \", run(Stock(), threading.Lock()))",
   "out": {
    "text": "without lock: 50 (should be 0)\nwith lock:    0"
   }
  },
  {
   "h": "Atomic updates in the database",
   "p": [
    "Let the database do read-check-write in one statement. Only one request can take the last unit."
   ],
   "code": "import sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE stock (sku TEXT PRIMARY KEY, qty INTEGER)\")\ndb.execute(\"INSERT INTO stock VALUES ('HP', 1)\")\n\ndef buy(sku):\n    cur = db.execute(\"UPDATE stock SET qty = qty - 1 WHERE sku = ? AND qty > 0\", (sku,))\n    return \"sold\" if cur.rowcount == 1 else \"sold out\"\n\nprint(buy(\"HP\"), buy(\"HP\"))",
   "out": {
    "text": "sold sold out"
   }
  },
  {
   "h": "Optimistic locking with a version column",
   "p": [
    "Read the row with its version; when saving, require the version to be unchanged. If someone else saved first, 0 rows update and you retry or tell the user. Great when conflicts are rare."
   ],
   "code": "import sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE profiles (id INTEGER PRIMARY KEY, address TEXT, version INTEGER)\")\ndb.execute(\"INSERT INTO profiles VALUES (6, 'Kochi', 1)\")\n\ndef save(pid, new_address, version_read):\n    cur = db.execute(\"UPDATE profiles SET address = ?, version = version + 1 WHERE id = ? AND version = ?\",\n                     (new_address, pid, version_read))\n    return \"saved\" if cur.rowcount else \"conflict: someone else changed it, reload and try again\"\n\nv = db.execute(\"SELECT version FROM profiles WHERE id = 6\").fetchone()[0]   # both users read v1\nprint(\"user A:\", save(6, \"Calicut\", v))\nprint(\"user B:\", save(6, \"Thrissur\", v))\nprint(db.execute(\"SELECT * FROM profiles\").fetchone())",
   "out": {
    "text": "user A: saved\nuser B: conflict: someone else changed it, reload and try again\n(6, 'Calicut', 2)"
   }
  },
  {
   "h": "Pessimistic locking",
   "p": [
    "When conflicts are common or the check is complex, lock the row while you work: <code>SELECT … FOR UPDATE</code> in PostgreSQL/MySQL. Other transactions wait. Keep these transactions short and lock rows in a consistent order to avoid deadlocks."
   ],
   "code": "BEGIN;\nSELECT qty FROM stock WHERE sku = 'HP' FOR UPDATE;   -- others wait here\n-- app checks business rules (reservations, limits...)\nUPDATE stock SET qty = qty - 1 WHERE sku = 'HP';\nCOMMIT;",
   "lang": "sql"
  },
  {
   "h": "Idempotency for duplicate requests",
   "p": [
    "Double-clicks and retries send the same request twice. A UNIQUE constraint on a client-generated id (or an idempotency key) makes the second insert fail harmlessly."
   ]
  }
 ],
 "mistakes": [
  "Read in code, check in code, write later: the classic race.",
  "Using Python locks to protect data shared across multiple servers (they only work inside one process).",
  "Long transactions holding row locks.",
  "Ignoring the “0 rows updated” result of a conditional update."
 ],
 "practice": [
  {
   "q": "Two staff edit the same invoice note. Which approach fits: optimistic or pessimistic? Why?",
   "a": "Optimistic: conflicts are rare and it doesn't block anyone. Use a version column; if the save updates 0 rows, show “someone changed this, reload”."
  },
  {
   "q": "Make <code>buy</code> support quantity n, refusing if not enough stock, in one statement.",
   "code": "import sqlite3\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE stock (sku TEXT PRIMARY KEY, qty INTEGER)\")\ndb.execute(\"INSERT INTO stock VALUES ('TEA', 5)\")\n\ndef buy(sku, n):\n    cur = db.execute(\"UPDATE stock SET qty = qty - ? WHERE sku = ? AND qty >= ?\", (n, sku, n))\n    return \"ok\" if cur.rowcount else \"not enough stock\"\n\nprint(buy(\"TEA\", 3), buy(\"TEA\", 3), db.execute(\"SELECT qty FROM stock\").fetchone()[0])",
   "out": {
    "text": "ok not enough stock 2"
   }
  }
 ],
 "check": [
  [
   "What is a race condition?",
   [
    "A fast loop",
    "Concurrent operations interfering so the result depends on timing",
    "A slow query",
    "A deadlock only"
   ],
   1,
   "Timing-dependent bugs."
  ],
  [
   "Optimistic locking uses…",
   [
    "SELECT FOR UPDATE",
    "A version check on update",
    "Python threading.Lock",
    "Sleep"
   ],
   1,
   "Detect conflicts at save time."
  ],
  [
   "Do Python locks protect data across several app servers?",
   [
    "Yes",
    "No, only within one process; use DB atomic updates or locks",
    "Only with threads",
    "Only on Linux"
   ],
   1,
   "Use the database."
  ]
 ],
 "remember": [
  "Race = read, check, write with something else in between.",
  "Prefer atomic conditional UPDATEs (check rowcount).",
  "Optimistic: version column; 0 rows = conflict.",
  "Pessimistic: SELECT … FOR UPDATE; short transactions; consistent lock order.",
  "UNIQUE ids / idempotency keys stop duplicate requests."
 ]
};
L["backend-data:background-jobs"] = {
 "title": "Background jobs and scheduled tasks",
 "level": "Intermediate",
 "one": "Slow work (emails, PDFs, imports, AI calls, syncs) shouldn't run inside a web request. Put it on a <b>job queue</b> processed by <b>workers</b>, and run recurring work with a <b>scheduler</b>.",
 "why": "Fast responses and reliable processing depend on it. Celery, RQ, Sidekiq, BullMQ and cloud queues are everywhere in backend jobs.",
 "steps": [
  {
   "h": "Request vs background",
   "p": [
    "The request validates input, saves a record, enqueues a job and returns immediately (often 202 Accepted with a job id). A worker does the slow part and updates the status. The user polls or gets notified when it's done."
   ]
  },
  {
   "h": "Workers in parallel",
   "p": [
    "For waiting-heavy jobs (emails, HTTP), several workers run side by side. A thread pool shows the effect:"
   ],
   "code": "import time\nfrom concurrent.futures import ThreadPoolExecutor\n\ndef send_invoice_email(order_id):\n    time.sleep(0.2)                 # pretend: render PDF + call email API\n    return f\"invoice for order {order_id} sent\"\n\norders = list(range(1, 11))\nt = time.perf_counter()\nfor o in orders:\n    send_invoice_email(o)\none_by_one = time.perf_counter() - t\n\nt = time.perf_counter()\nwith ThreadPoolExecutor(max_workers=5) as pool:\n    results = list(pool.map(send_invoice_email, orders))\nparallel = time.perf_counter() - t\nprint(results[0], \"...\")\nprint(f\"one by one: {one_by_one:.1f}s, 5 workers: {parallel:.1f}s\")",
   "out": {
    "text": "invoice for order 1 sent ...\none by one: 2.0s, 5 workers: 0.4s"
   }
  },
  {
   "h": "A job status table",
   "p": [
    "Track every job so users and support can see what happened: queued → running → done/failed, with attempts and the error."
   ],
   "code": "import sqlite3, json\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"\"\"CREATE TABLE jobs (id INTEGER PRIMARY KEY, kind TEXT, args TEXT, status TEXT DEFAULT 'queued',\n              attempts INTEGER DEFAULT 0, error TEXT, result TEXT)\"\"\")\n\ndef enqueue(kind, **args):\n    return db.execute(\"INSERT INTO jobs (kind, args) VALUES (?, ?)\", (kind, json.dumps(args))).lastrowid\n\nHANDLERS = {\"export_csv\": lambda rows: f\"exported {rows} rows\", \"resize_image\": lambda path: 1 / 0}\n\ndef work_once():\n    job = db.execute(\"SELECT id, kind, args FROM jobs WHERE status='queued' ORDER BY id LIMIT 1\").fetchone()\n    if not job:\n        return False\n    jid, kind, args = job\n    db.execute(\"UPDATE jobs SET status='running', attempts=attempts+1 WHERE id=?\", (jid,))\n    try:\n        result = HANDLERS[kind](**json.loads(args))\n        db.execute(\"UPDATE jobs SET status='done', result=? WHERE id=?\", (result, jid))\n    except Exception as e:\n        db.execute(\"UPDATE jobs SET status='failed', error=? WHERE id=?\", (f\"{type(e).__name__}: {e}\", jid))\n    return True\n\nenqueue(\"export_csv\", rows=1200); enqueue(\"resize_image\", path=\"a.jpg\")\nwhile work_once():\n    pass\nfor row in db.execute(\"SELECT id, kind, status, attempts, error, result FROM jobs\"):\n    print(row)",
   "out": {
    "text": "(1, 'export_csv', 'done', 1, None, 'exported 1200 rows')\n(2, 'resize_image', 'failed', 1, 'ZeroDivisionError: division by zero', None)"
   }
  },
  {
   "h": "Celery / RQ in real projects",
   "code": "# tasks.py  (Celery with Redis as the broker)\nfrom celery import Celery\napp = Celery(\"shop\", broker=\"redis://localhost:6379/0\")\n\n@app.task(bind=True, max_retries=5, default_retry_delay=30, acks_late=True)\ndef send_invoice(self, order_id):\n    try:\n        pdf = render_invoice(order_id)\n        email_api.send(order_id, pdf)\n    except TemporaryError as e:\n        raise self.retry(exc=e)\n\n# in the web request\nsend_invoice.delay(order_id=6)\n\n# scheduled job (celery beat): every night at 02:30\napp.conf.beat_schedule = {\"nightly-reconcile\": {\"task\": \"tasks.reconcile\", \"schedule\": crontab(hour=2, minute=30)}}",
   "lang": "python",
   "run": false
  },
  {
   "h": "Scheduled jobs",
   "p": [
    "Recurring work (nightly reports, reconciliation, cleanup) runs from a scheduler: cron, Celery beat, cloud schedulers, or your platform's cron. Make them <b>idempotent</b> (safe to run twice), <b>overlap-safe</b> (a lock so two runs don't overlap), and <b>monitored</b> (alert if a run fails or doesn't happen)."
   ],
   "code": "# crontab: minute hour day month weekday  command\n30 2 * * *   /app/.venv/bin/python -m app.jobs.reconcile      # every day at 02:30\n*/15 * * * * /app/.venv/bin/python -m app.jobs.poll_courier   # every 15 minutes",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Sending emails or calling slow APIs inside the web request.",
  "Jobs that aren't idempotent, so retries double-send.",
  "No job status: users and support can't see what happened.",
  "Scheduled jobs nobody monitors, which silently stop running."
 ],
 "practice": [
  {
   "q": "Design the flow for “Export all orders to Excel” on a page with 2 million orders.",
   "a": "POST /exports → create an export record (queued) and enqueue a job → return 202 with the export id. Worker streams rows from the DB in chunks into a file, uploads it to storage, marks the record done with a download link (expiring). The page polls GET /exports/{id} or the user gets an email/notification."
  },
  {
   "q": "Write the cron line to run a cleanup job every Sunday at 03:00.",
   "code": "0 3 * * 0   /app/.venv/bin/python -m app.jobs.cleanup",
   "lang": "text"
  }
 ],
 "check": [
  [
   "Where should a slow PDF + email step run?",
   [
    "Inside the request",
    "In a background job",
    "In the browser",
    "In a database trigger"
   ],
   1,
   "Keep requests fast."
  ],
  [
   "What should a long-running request return?",
   [
    "Nothing",
    "202 Accepted with a job id to check",
    "500",
    "A redirect loop"
   ],
   1,
   "Then poll or notify."
  ],
  [
   "Scheduled jobs must be…",
   [
    "Fast only",
    "Idempotent, overlap-safe and monitored",
    "Written in Bash",
    "Run hourly"
   ],
   1,
   "Safe and observable."
  ]
 ],
 "remember": [
  "Request: validate, save, enqueue, return 202 + job id.",
  "Workers do slow work; parallel workers for waiting-heavy jobs.",
  "Job table: status, attempts, error, result.",
  "Celery/RQ: retries with delay, acks_late, idempotent tasks.",
  "Schedulers (cron/beat): idempotent, no overlap, monitored."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
