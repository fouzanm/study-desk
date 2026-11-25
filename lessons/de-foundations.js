// Lessons for course "de-foundations". Built by tools/course-builder from tools/courses/de-foundations.js.
// Python examples were run and their real output stored.
(function (L) {
L["de-foundations:role"] = {
 "title": "What data engineers do",
 "level": "Beginner",
 "one": "Data engineers build the <b>pipelines</b> that move data from where it's created (apps, APIs, files, databases) to where it's used (warehouses, dashboards, ML/AI), <b>reliably, on time and correct</b>.",
 "why": "Every company that wants dashboards, analytics or AI needs clean, trustworthy data first. Data engineering roles are in steady demand, and integration experience (like ERP work) transfers directly.",
 "steps": [
  {
   "h": "The data journey",
   "code": "SOURCES            INGEST           STORE / TRANSFORM               SERVE\napp databases ─┐                  ┌─ raw (as received)            dashboards (BI)\nSaaS APIs ─────┼─► extract/load ─►├─ staging (cleaned)    ─────►  reports, finance\nfiles / SFTP ──┤   (batch/stream) └─ marts (business-ready)       ML features, AI/RAG\nevents ────────┘                     data lake / warehouse        reverse ETL to apps\n                     orchestration (Airflow) · quality checks · monitoring · access control",
   "lang": "text"
  },
  {
   "h": "Everyday tasks",
   "p": [
    "Write extract jobs for APIs and databases; load data safely (no duplicates, no gaps); model tables for analysis (facts and dimensions); transform with SQL/dbt; schedule and monitor pipelines; add data quality tests; fix broken loads; optimise slow queries and costs; work with analysts and business teams on definitions (“what counts as an active customer?”)."
   ]
  },
  {
   "h": "Core skills and tools",
   "code": "must-have   SQL (advanced) · Python · data modelling · Git · one cloud\npipelines   Airflow / Dagster / Prefect · dbt · pandas/Polars · Spark (big data)\nstorage     PostgreSQL · Snowflake / BigQuery / Redshift / Databricks · S3 + Parquet\nstreaming   Kafka · CDC (Debezium) (for real-time roles)\nquality     tests, data contracts, monitoring, lineage\nsoft        clear definitions, documentation, talking to data consumers",
   "lang": "text"
  },
  {
   "h": "Batch vs streaming",
   "p": [
    "<b>Batch</b>: process data in chunks on a schedule (every hour, every night). Simpler, cheaper, enough for most reporting. <b>Streaming</b>: process events continuously within seconds. Needed for fraud detection, live tracking, real-time inventory. Most companies are mostly batch with a few streaming use cases."
   ]
  },
  {
   "h": "What makes a pipeline “good”",
   "p": [
    "<b>Correct</b> (numbers match the source), <b>idempotent</b> (safe to re-run), <b>incremental</b> (only processes new data), <b>observable</b> (you know when it fails or is late), <b>tested</b> (data quality checks), <b>documented</b> (definitions, owners). The rest of this path teaches each of these."
   ]
  }
 ],
 "mistakes": [
  "Thinking the job is only moving data; definitions and trust matter as much.",
  "Building complex streaming when a nightly batch would do.",
  "Pipelines nobody monitors, so dashboards go stale silently.",
  "Skipping SQL depth: it's the #1 skill in data engineering interviews."
 ],
 "practice": [
  {
   "q": "A retail chain wants a daily sales dashboard combining their POS database and their e-commerce platform's API. Sketch the pipeline in 4 steps.",
   "a": "1) Extract: nightly incremental pull of yesterday's sales from the POS DB and the e-commerce API. 2) Load raw data into the warehouse (raw tables, unchanged). 3) Transform with SQL/dbt: clean, map product codes, combine into a fact_sales table with dimensions (store, product, date). 4) Dashboard reads the mart; quality checks (row counts, totals vs source) and alerts if late."
  },
  {
   "q": "Batch or streaming? (a) monthly finance report (b) blocking fraudulent card payments (c) daily marketing dashboard (d) live delivery tracking map",
   "a": "(a) Batch. (b) Streaming (decide in milliseconds/seconds). (c) Batch. (d) Streaming (or frequent micro-batches)."
  }
 ],
 "check": [
  [
   "Main job of a data engineer?",
   [
    "Design logos",
    "Build reliable pipelines that deliver correct data where it's needed",
    "Train every model",
    "Only make dashboards"
   ],
   1,
   "Reliable, correct, on time."
  ],
  [
   "Most reporting needs…",
   [
    "Streaming",
    "Batch",
    "Neither",
    "Blockchain"
   ],
   1,
   "Batch is simpler and enough."
  ],
  [
   "“Idempotent pipeline” means…",
   [
    "Fast",
    "Safe to re-run without duplicates",
    "Real-time",
    "Uses Spark"
   ],
   1,
   "Re-runs give the same result."
  ]
 ],
 "remember": [
  "Sources → ingest → store/transform (raw, staging, marts) → serve.",
  "Core: SQL, Python, modelling, orchestration, a warehouse, a cloud.",
  "Batch by default; streaming when seconds matter.",
  "Good pipelines: correct, idempotent, incremental, observable, tested, documented."
 ]
};
L["de-foundations:oltp-olap"] = {
 "title": "OLTP vs OLAP: app databases and analytics databases",
 "level": "Beginner+",
 "one": "<b>OLTP</b> databases (PostgreSQL, MySQL) run applications: many small reads and writes of single rows. <b>OLAP</b> systems (Snowflake, BigQuery, DuckDB, Redshift) run analytics: big scans and aggregations over millions of rows, using <b>columnar</b> storage.",
 "why": "Running heavy reports on the production app database slows down the app. Understanding why analytics lives in a separate, columnar store explains most of data engineering's architecture.",
 "steps": [
  {
   "h": "Different jobs",
   "code": "                 OLTP (app database)              OLAP (warehouse)\ntypical query    get/update one order             revenue by month by city, 3 years\nrows touched     a few                            millions to billions\nwrites           constant, small                  bulk loads (batch)\ndesign           normalised, many tables          denormalised: facts + dimensions\nstorage          row-oriented                     column-oriented, compressed\nexamples         PostgreSQL, MySQL, SQL Server    Snowflake, BigQuery, Redshift, DuckDB, ClickHouse",
   "lang": "text"
  },
  {
   "h": "Why columnar is fast for analytics",
   "p": [
    "An aggregate like <code>SUM(total)</code> only needs one column. A row store reads whole rows; a column store reads just that column, compressed. Let's compare SQLite (row store) with DuckDB (column store) on 1 million rows:"
   ],
   "code": "import sqlite3, duckdb, time, random\nimport pandas as pd\n\nrandom.seed(1)\nrows = [(i, random.choice([\"Kochi\", \"Dubai\", \"Bengaluru\", \"Chennai\"]), random.randint(100, 50_000),\n         f\"2025-{random.randint(1, 12):02d}-01\", \"x\" * 40) for i in range(1_000_000)]\n\nlite = sqlite3.connect(\":memory:\")\nlite.execute(\"CREATE TABLE sales (id INT, city TEXT, total INT, month TEXT, notes TEXT)\")\nlite.executemany(\"INSERT INTO sales VALUES (?, ?, ?, ?, ?)\", rows)\n\nduck = duckdb.connect()\ndf = pd.DataFrame(rows, columns=[\"id\", \"city\", \"total\", \"month\", \"notes\"])\nduck.execute(\"CREATE TABLE sales AS SELECT * FROM df\")\n\nq = \"SELECT city, month, SUM(total), COUNT(*) FROM sales GROUP BY city, month\"\nfor name, con in [(\"SQLite (row store)\", lite), (\"DuckDB (column store)\", duck)]:\n    t = time.perf_counter()\n    result = con.execute(q).fetchall()\n    print(f\"{name:22} {len(result)} groups in {(time.perf_counter() - t) * 1000:.0f} ms\")",
   "note": "Same query, same data: the columnar engine is many times faster for this kind of question. Warehouses use the same idea at much larger scale.",
   "out": {
    "text": "SQLite (row store)     48 groups in 571 ms\nDuckDB (column store)  48 groups in 26 ms"
   }
  },
  {
   "h": "Don't report on production",
   "p": [
    "Heavy analytics on the app database competes with customers for CPU and locks. Options, in order: a <b>read replica</b> for light reporting, then <b>copying data</b> into a warehouse (ELT) for real analytics. That copying is the core of data engineering."
   ]
  },
  {
   "h": "File formats: CSV vs Parquet",
   "p": [
    "<b>Parquet</b> is the columnar file format of data lakes: typed, compressed, readable column-by-column. CSV has no types and is large and slow. Compare:"
   ],
   "code": "import pandas as pd, os, random\n\nrandom.seed(2)\ndf = pd.DataFrame({\"order_id\": range(300_000),\n                   \"city\": [random.choice([\"Kochi\", \"Dubai\", \"Bengaluru\"]) for _ in range(300_000)],\n                   \"total\": [random.randint(100, 50_000) for _ in range(300_000)],\n                   \"order_date\": pd.date_range(\"2024-01-01\", periods=300_000, freq=\"min\")})\ndf.to_csv(\"orders.csv\", index=False)\ndf.to_parquet(\"orders.parquet\", index=False)\nprint(f\"CSV:     {os.path.getsize('orders.csv') / 1e6:.1f} MB\")\nprint(f\"Parquet: {os.path.getsize('orders.parquet') / 1e6:.1f} MB\")\nback = pd.read_parquet(\"orders.parquet\", columns=[\"city\", \"total\"])\nprint(back.dtypes.astype(str).to_dict())",
   "note": "Parquet keeps types (dates stay dates) and lets you read only the columns you need.",
   "out": {
    "text": "CSV:     11.9 MB\nParquet: 4.4 MB\n{'city': 'str', 'total': 'int64'}"
   }
  }
 ],
 "mistakes": [
  "Running big reports on the production database.",
  "Copying the app's normalised schema unchanged into the warehouse and wondering why analysis is hard.",
  "Storing analytics data as CSV forever.",
  "Using the warehouse as an app database for single-row updates."
 ],
 "practice": [
  {
   "q": "Use DuckDB to query a pandas DataFrame directly with SQL: revenue by city.",
   "code": "import duckdb, pandas as pd\ndf = pd.DataFrame({\"city\": [\"Kochi\", \"Dubai\", \"Kochi\", \"Bengaluru\"], \"total\": [55000, 3000, 6900, 9200]})\nprint(duckdb.sql(\"SELECT city, SUM(total) AS revenue FROM df GROUP BY city ORDER BY revenue DESC\").fetchall())",
   "out": {
    "text": "[('Kochi', 61900), ('Bengaluru', 9200), ('Dubai', 3000)]"
   }
  },
  {
   "q": "The sales team runs a 3-minute report on the production database every morning, and checkout slows down. What do you propose?",
   "a": "Short term: point the report at a read replica. Proper fix: copy sales data into a warehouse or DuckDB/Postgres analytics database nightly (or incrementally) and model it for reporting; the report then runs in seconds without touching production."
  }
 ],
 "check": [
  [
   "OLAP systems are optimised for…",
   [
    "Single-row updates",
    "Large scans and aggregations",
    "Transactions per user",
    "Email"
   ],
   1,
   "Analytics."
  ],
  [
   "Why is columnar storage fast for SUM(total)?",
   [
    "It's in memory",
    "It reads only the needed column, compressed",
    "It skips rows randomly",
    "It uses indexes only"
   ],
   1,
   "Less data to read."
  ],
  [
   "Best file format for analytics data?",
   [
    "CSV",
    "Parquet",
    "XML",
    "TXT"
   ],
   1,
   "Typed, compressed, columnar."
  ]
 ],
 "remember": [
  "OLTP = app database (rows, small writes). OLAP = analytics (columns, big scans).",
  "Columnar engines (Snowflake, BigQuery, DuckDB) scan only needed columns.",
  "Don't report on production: replica first, warehouse for real analytics.",
  "Parquet over CSV for analytics files."
 ]
};
L["de-foundations:pandas"] = {
 "title": "pandas for data engineering",
 "level": "Beginner+",
 "one": "<b>pandas</b> is Python's table library: load data into a <b>DataFrame</b>, clean it, join it, group it, and write it out. Perfect for small-to-medium data (up to a few GB) and for checking data quickly.",
 "why": "Most extract-and-clean steps, quick analyses and data checks are written in pandas. It appears in nearly every data job post.",
 "steps": [
  {
   "h": "Load and inspect",
   "code": "import pandas as pd\n\ndf = pd.read_csv(\"orders.csv\", parse_dates=[\"order_date\"])\nprint(df.shape)\nprint(df.dtypes.astype(str).to_dict())\nprint(df.head(3).to_string(index=False))\nprint(\"missing values:\", df.isna().sum()[lambda s: s > 0].to_dict())\nprint(\"duplicate rows:\", df.duplicated().sum())",
   "out": {
    "text": "(8, 6)\n{'order_id': 'int64', 'customer': 'str', 'city': 'str', 'order_date': 'datetime64[us]', 'total': 'float64', 'status': 'str'}\n order_id customer      city order_date   total    status\n        1     Asha     Kochi 2025-06-02 55000.0 completed\n        2     Asha     Kochi 2025-06-15  6900.0 completed\n        3      Ben Bengaluru 2025-06-20  9200.0 completed\nmissing values: {'total': 1}\nduplicate rows: 1"
   }
  },
  {
   "h": "Clean: duplicates, text, missing values, types",
   "code": "import pandas as pd\n\ndf = pd.read_csv(\"orders.csv\", parse_dates=[\"order_date\"])\nclean = (df.drop_duplicates()\n           .assign(city=lambda d: d[\"city\"].str.strip().str.title(),\n                   total=lambda d: d[\"total\"].fillna(0).astype(int)))\nprint(clean[\"city\"].value_counts().to_dict())\nprint(len(df), \"->\", len(clean), \"rows\")",
   "out": {
    "text": "{'Kochi': 3, 'Bengaluru': 2, 'Dubai': 2}\n8 -> 7 rows"
   }
  },
  {
   "h": "Filter, group and aggregate",
   "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"customer\": [\"Asha\", \"Asha\", \"Ben\", \"Chen\", \"Ben\", \"Omar\"],\n    \"city\": [\"Kochi\", \"Kochi\", \"Bengaluru\", \"Dubai\", \"Bengaluru\", \"Dubai\"],\n    \"month\": [\"2025-06\", \"2025-06\", \"2025-06\", \"2025-07\", \"2025-07\", \"2025-07\"],\n    \"total\": [55000, 6900, 9200, 3000, 3600, 2000],\n    \"status\": [\"completed\", \"completed\", \"completed\", \"cancelled\", \"completed\", \"completed\"],\n})\ndone = df[df[\"status\"] == \"completed\"]\nprint(done.groupby(\"city\", as_index=False).agg(orders=(\"total\", \"size\"), revenue=(\"total\", \"sum\"))\n          .sort_values(\"revenue\", ascending=False).to_string(index=False))\nprint(done.pivot_table(index=\"city\", columns=\"month\", values=\"total\", aggfunc=\"sum\", fill_value=0))",
   "out": {
    "text": "     city  orders  revenue\n    Kochi       2    61900\nBengaluru       2    12800\n    Dubai       1     2000\nmonth      2025-06  2025-07\ncity                       \nBengaluru     9200     3600\nDubai            0     2000\nKochi        61900        0"
   }
  },
  {
   "h": "Joins (merge)",
   "code": "import pandas as pd\n\norders = pd.DataFrame({\"order_id\": [1, 2, 3, 4], \"customer_id\": [1, 1, 2, 9], \"total\": [55000, 6900, 9200, 500]})\ncustomers = pd.DataFrame({\"customer_id\": [1, 2, 3], \"name\": [\"Asha\", \"Ben\", \"Chen\"]})\n\njoined = orders.merge(customers, on=\"customer_id\", how=\"left\", validate=\"many_to_one\", indicator=True)\nprint(joined.to_string(index=False))\nprint(\"orders with unknown customer:\", (joined[\"_merge\"] == \"left_only\").sum())",
   "note": "<code>validate=\"many_to_one\"</code> raises an error if customers has duplicate ids (which would silently double rows). <code>indicator=True</code> shows unmatched rows.",
   "out": {
    "text": " order_id  customer_id  total name    _merge\n        1            1  55000 Asha      both\n        2            1   6900 Asha      both\n        3            2   9200  Ben      both\n        4            9    500  NaN left_only\norders with unknown customer: 1"
   }
  },
  {
   "h": "Write out, and know the limits",
   "p": [
    "Write results to Parquet (or straight to a database). pandas loads everything into memory: for data bigger than RAM use <b>DuckDB</b>, <b>Polars</b>, chunked reading, or Spark."
   ],
   "code": "import pandas as pd\n\nbig = pd.DataFrame({\"id\": range(1_000_000), \"total\": 1})\nprint(f\"{big.memory_usage(deep=True).sum() / 1e6:.0f} MB in memory for 1M rows x 2 numeric columns\")\ntotal = 0\nbig.to_csv(\"big.csv\", index=False)\nfor chunk in pd.read_csv(\"big.csv\", chunksize=250_000):\n    total += chunk[\"total\"].sum()\nprint(\"summed in chunks:\", total)",
   "out": {
    "text": "16 MB in memory for 1M rows x 2 numeric columns\nsummed in chunks: 1000000"
   }
  }
 ],
 "mistakes": [
  "Merging on keys that aren't unique and silently duplicating rows (use validate=).",
  "Leaving text messy (“Kochi”, “kochi ”, “KOCHI”) so groups split.",
  "Loops over rows (iterrows) instead of vectorised operations.",
  "Loading a 20 GB file into pandas on a 16 GB laptop."
 ],
 "practice": [
  {
   "q": "Find each customer's first order date and number of orders.",
   "code": "import pandas as pd\ndf = pd.DataFrame({\"customer\": [\"Asha\", \"Ben\", \"Asha\", \"Ben\", \"Chen\"],\n                   \"order_date\": pd.to_datetime([\"2025-06-15\", \"2025-06-20\", \"2025-06-02\", \"2025-07-05\", \"2025-07-01\"])})\nprint(df.groupby(\"customer\").agg(first_order=(\"order_date\", \"min\"), orders=(\"order_date\", \"size\")).reset_index().to_string(index=False))",
   "out": {
    "text": "customer first_order  orders\n    Asha  2025-06-02       2\n     Ben  2025-06-20       2\n    Chen  2025-07-01       1"
   }
  },
  {
   "q": "Add a column with each order's share of its customer's total (no loops).",
   "code": "import pandas as pd\ndf = pd.DataFrame({\"customer\": [\"Asha\", \"Asha\", \"Ben\"], \"total\": [55000, 6900, 9200]})\ndf[\"share\"] = (df[\"total\"] / df.groupby(\"customer\")[\"total\"].transform(\"sum\")).round(2)\nprint(df.to_string(index=False))",
   "out": {
    "text": "customer  total  share\n    Asha  55000   0.89\n    Asha   6900   0.11\n     Ben   9200   1.00"
   }
  }
 ],
 "check": [
  [
   "Why use validate='many_to_one' in merge?",
   [
    "Speed",
    "Catch duplicate keys that would multiply rows",
    "Sort output",
    "Required"
   ],
   1,
   "Protects against silent duplication."
  ],
  [
   "Data bigger than memory?",
   [
    "pandas anyway",
    "DuckDB/Polars/chunks/Spark",
    "Excel",
    "Delete columns"
   ],
   1,
   "pandas is in-memory."
  ],
  [
   "Fastest way to transform a column?",
   [
    "iterrows loop",
    "Vectorised column operations",
    "apply with print",
    "Manual"
   ],
   1,
   "Vectorised."
  ]
 ],
 "remember": [
  "read_csv/read_parquet → inspect (shape, dtypes, isna, duplicated).",
  "Clean: drop_duplicates, str.strip/title, fillna, astype.",
  "groupby + agg; pivot_table; transform for per-group values.",
  "merge(how=, validate=, indicator=True).",
  "Write Parquet; beyond RAM use DuckDB/Polars/chunks/Spark."
 ]
};
L["de-foundations:extract-api"] = {
 "title": "Extracting data from APIs incrementally",
 "level": "Intermediate",
 "one": "Pull data from SaaS APIs <b>incrementally</b>: ask only for records changed since your last run (a <b>watermark</b>), walk through <b>pages</b>, handle <b>rate limits</b>, and save the raw responses.",
 "why": "Most company data lives in SaaS tools (CRM, payments, e-commerce, ERP). Reliable API extraction is a core data engineering task, and the same skills as integration work.",
 "steps": [
  {
   "h": "Full vs incremental",
   "p": [
    "<b>Full</b>: download everything every time. Simple, but slow and expensive as data grows, and hits rate limits. <b>Incremental</b>: download only what changed since the last successful run, using an <code>updated_at</code> filter and a stored watermark."
   ]
  },
  {
   "h": "Paginated incremental extract",
   "p": [
    "The fake API here returns pages of 10 orders and supports <code>updated_since</code>, like most real APIs:"
   ],
   "code": "import httpx\n\ndef extract(updated_since: str):\n    rows, cursor = [], 0\n    with httpx.Client(base_url=\"https://api.example-shop.com\", timeout=30) as client:\n        while cursor is not None:\n            r = client.get(\"/orders\", params={\"updated_since\": updated_since, \"cursor\": cursor})\n            r.raise_for_status()\n            body = r.json()\n            rows.extend(body[\"data\"])\n            cursor = body[\"next_cursor\"]\n    return rows\n\nall_rows = extract(updated_since=\"\")\nprint(\"full load:\", len(all_rows), \"rows\")\nrecent = extract(updated_since=\"2025-07-04T00:00:00\")\nprint(\"incremental:\", len(recent), \"rows, newest:\", max(r[\"updated_at\"] for r in recent))",
   "out": {
    "text": "full load: 23 rows\nincremental: 12 rows, newest: 2025-07-06T10:00:00"
   }
  },
  {
   "h": "Store the watermark safely",
   "p": [
    "Save the new watermark only <b>after</b> the data is safely loaded. Use the max <code>updated_at</code> you actually received (not “now”), and overlap slightly to catch late-arriving updates; deduplicate on load."
   ],
   "code": "import httpx, json, os\nfrom datetime import datetime, timedelta\n\nSTATE = \"state.json\"\n\ndef get_watermark():\n    return json.load(open(STATE))[\"orders\"] if os.path.exists(STATE) else \"\"\n\ndef set_watermark(ts):\n    json.dump({\"orders\": ts}, open(STATE, \"w\"))\n\ndef run():\n    since = get_watermark()\n    if since:\n        since = (datetime.fromisoformat(since) - timedelta(hours=1)).isoformat()   # small overlap\n    with httpx.Client(base_url=\"https://api.example-shop.com\") as c:\n        rows, cursor = [], 0\n        while cursor is not None:\n            body = c.get(\"/orders\", params={\"updated_since\": since, \"cursor\": cursor}).json()\n            rows += body[\"data\"]; cursor = body[\"next_cursor\"]\n    # ... load rows into the warehouse here (idempotent upsert) ...\n    if rows:\n        set_watermark(max(r[\"updated_at\"] for r in rows))\n    return len(rows)\n\nprint(\"run 1 loaded\", run(), \"rows; watermark\", get_watermark())\nprint(\"run 2 loaded\", run(), \"rows (overlap re-reads the last hour; upserts make that safe)\")",
   "out": {
    "text": "run 1 loaded 23 rows; watermark 2025-07-06T10:00:00\nrun 2 loaded 4 rows (overlap re-reads the last hour; upserts make that safe)"
   }
  },
  {
   "h": "Keep raw responses",
   "p": [
    "Save each raw page (JSON lines in object storage, partitioned by date) before transforming. If a transform bug is found, you can re-process from raw without hitting the API again."
   ],
   "code": "import httpx, json, pathlib, datetime\n\nrun_date = datetime.date(2025, 7, 6)\nout = pathlib.Path(f\"raw/orders/dt={run_date}\")\nout.mkdir(parents=True, exist_ok=True)\nwith httpx.Client(base_url=\"https://api.example-shop.com\") as c:\n    cursor, page = 0, 0\n    while cursor is not None:\n        body = c.get(\"/orders\", params={\"cursor\": cursor}).json()\n        (out / f\"page-{page:04d}.jsonl\").write_text(\"\\n\".join(json.dumps(r) for r in body[\"data\"]))\n        cursor, page = body[\"next_cursor\"], page + 1\nprint(sorted(str(p) for p in out.iterdir()))",
   "out": {
    "text": "['raw/orders/dt=2025-07-06/page-0000.jsonl', 'raw/orders/dt=2025-07-06/page-0001.jsonl', 'raw/orders/dt=2025-07-06/page-0002.jsonl']"
   }
  },
  {
   "h": "Rate limits and failures",
   "p": [
    "Use the retry/backoff patterns from the APIs course: retry 429 and 5xx with backoff, respect <code>Retry-After</code>, cap attempts, and make the whole run resumable (keep the cursor so a failed run can continue). Use bulk/export endpoints when the API offers them for large backfills."
   ]
  }
 ],
 "mistakes": [
  "Setting the watermark to “now” instead of the max updated_at received (you skip records that arrive late).",
  "Saving the watermark before the load succeeds.",
  "Not saving raw responses.",
  "Full reloads every hour that hit rate limits."
 ],
 "practice": [
  {
   "q": "Count extracted orders by status after an incremental pull since 2025-07-03.",
   "code": "import httpx\nfrom collections import Counter\n\nwith httpx.Client(base_url=\"https://api.example-shop.com\") as c:\n    rows, cursor = [], 0\n    while cursor is not None:\n        body = c.get(\"/orders\", params={\"updated_since\": \"2025-07-03T00:00:00\", \"cursor\": cursor}).json()\n        rows += body[\"data\"]; cursor = body[\"next_cursor\"]\nprint(Counter(r[\"status\"] for r in rows))",
   "out": {
    "text": "Counter({'paid': 8, 'refunded': 4, 'pending': 4})"
   }
  },
  {
   "q": "An API has no updated_since filter, only created_at. What problems does that cause, and what can you do?",
   "a": "You'll miss updates to old records (status changes, refunds). Options: a periodic full refresh of recent windows (e.g. last 30 days nightly), use webhooks for changes if available, or ask the vendor for change feeds/exports. Then upsert by id."
  }
 ],
 "check": [
  [
   "What should the watermark be after a run?",
   [
    "Current time",
    "Max updated_at actually received",
    "Zero",
    "Random"
   ],
   1,
   "Never skip late records."
  ],
  [
   "When do you save the watermark?",
   [
    "Before extracting",
    "After the data is safely loaded",
    "Never",
    "Every page"
   ],
   1,
   "Otherwise you can lose data."
  ],
  [
   "Why keep raw API responses?",
   [
    "Disk is free",
    "Re-process after bugs without calling the API again",
    "Required by APIs",
    "For logs"
   ],
   1,
   "Replayability."
  ]
 ],
 "remember": [
  "Incremental: updated_since = stored watermark (with small overlap).",
  "Paginate until no next cursor.",
  "Watermark = max updated_at received, saved after a successful load.",
  "Store raw pages (date-partitioned) before transforming.",
  "Retries/backoff, Retry-After, resumable runs."
 ]
};
L["de-foundations:load-upsert"] = {
 "title": "Loading data safely: idempotent upserts",
 "level": "Intermediate",
 "one": "Loads must be <b>idempotent</b>: running the same load twice gives the same table, not duplicates. Use <b>upserts</b> (insert or update by key), <b>staging tables</b>, and <b>transactions</b>.",
 "why": "Pipelines fail and re-run all the time. Duplicates or partial loads destroy trust in every number downstream. This is one of the most important habits in data engineering.",
 "steps": [
  {
   "h": "The duplicate problem",
   "code": "import sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE orders (order_id INT, status TEXT, total INT)\")\nbatch = [(1, \"paid\", 500), (2, \"paid\", 900)]\nfor _ in range(2):                                     # pipeline retried after a timeout\n    db.executemany(\"INSERT INTO orders VALUES (?, ?, ?)\", batch)\nprint(db.execute(\"SELECT COUNT(*), SUM(total) FROM orders\").fetchone(), \"<- doubled\")",
   "out": {
    "text": "(4, 2800) <- doubled"
   }
  },
  {
   "h": "Upsert by key",
   "p": [
    "A primary key plus <code>INSERT … ON CONFLICT DO UPDATE</code> (PostgreSQL/SQLite) or <code>MERGE</code> (Snowflake, BigQuery, SQL Server) makes re-runs safe and applies updates."
   ],
   "code": "import sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE orders (order_id INT PRIMARY KEY, status TEXT, total INT, updated_at TEXT)\")\nUPSERT = \"\"\"INSERT INTO orders VALUES (?, ?, ?, ?)\n            ON CONFLICT (order_id) DO UPDATE SET status = excluded.status, total = excluded.total,\n                                                 updated_at = excluded.updated_at\n            WHERE excluded.updated_at > orders.updated_at\"\"\"\ndb.executemany(UPSERT, [(1, \"paid\", 500, \"2025-07-01\"), (2, \"paid\", 900, \"2025-07-01\")])\ndb.executemany(UPSERT, [(1, \"paid\", 500, \"2025-07-01\"), (2, \"paid\", 900, \"2025-07-01\")])     # re-run\ndb.executemany(UPSERT, [(2, \"refunded\", 900, \"2025-07-03\"), (3, \"paid\", 1200, \"2025-07-03\")])  # changes\ndb.executemany(UPSERT, [(2, \"paid\", 900, \"2025-07-01\")])                                     # stale, ignored\nprint(db.execute(\"SELECT * FROM orders ORDER BY order_id\").fetchall())",
   "note": "The <code>WHERE excluded.updated_at &gt; orders.updated_at</code> guard stops an older record from overwriting a newer one.",
   "out": {
    "text": "[(1, 'paid', 500, '2025-07-01'), (2, 'refunded', 900, '2025-07-03'), (3, 'paid', 1200, '2025-07-03')]"
   }
  },
  {
   "h": "Staging + swap in one transaction",
   "p": [
    "Load into a staging table, validate it, then apply to the target in <b>one transaction</b>. Readers never see a half-loaded table, and a failed check leaves the target untouched."
   ],
   "code": "import sqlite3\n\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE daily_sales (day TEXT, city TEXT, revenue INT)\")\ndb.execute(\"INSERT INTO daily_sales VALUES ('2025-07-05', 'Kochi', 1000)\")\n\ndef load_day(day, rows):\n    db.execute(\"CREATE TEMP TABLE stage (day TEXT, city TEXT, revenue INT)\")\n    db.executemany(\"INSERT INTO stage VALUES (?, ?, ?)\", rows)\n    bad = db.execute(\"SELECT COUNT(*) FROM stage WHERE revenue < 0 OR city IS NULL\").fetchone()[0]\n    try:\n        if bad:\n            raise ValueError(f\"{bad} bad rows, load aborted\")\n        with db:                                          # one transaction: delete + insert\n            db.execute(\"DELETE FROM daily_sales WHERE day = ?\", (day,))\n            db.execute(\"INSERT INTO daily_sales SELECT * FROM stage\")\n        return \"loaded\"\n    except ValueError as e:\n        return str(e)\n    finally:\n        db.execute(\"DROP TABLE stage\")\n\nprint(load_day(\"2025-07-06\", [(\"2025-07-06\", \"Kochi\", 2500), (\"2025-07-06\", \"Dubai\", 900)]))\nprint(load_day(\"2025-07-06\", [(\"2025-07-06\", \"Kochi\", 2500), (\"2025-07-06\", \"Dubai\", 900)]))   # re-run: same result\nprint(load_day(\"2025-07-07\", [(\"2025-07-07\", None, -5)]))\nprint(db.execute(\"SELECT * FROM daily_sales ORDER BY day, city\").fetchall())",
   "out": {
    "text": "loaded\nloaded\n1 bad rows, load aborted\n[('2025-07-05', 'Kochi', 1000), ('2025-07-06', 'Dubai', 900), ('2025-07-06', 'Kochi', 2500)]"
   }
  },
  {
   "h": "Delete-insert by partition",
   "p": [
    "For daily aggregates, the simplest idempotent pattern is shown above: <b>delete the partition (day) and insert it again</b>, in one transaction. Re-running a day always gives the same result. Warehouses do this with partition overwrite (<code>INSERT OVERWRITE</code>) or <code>MERGE</code>."
   ]
  },
  {
   "h": "Bulk loading",
   "p": [
    "Row-by-row inserts are slow. Use bulk paths: <code>COPY</code> in PostgreSQL, <code>COPY INTO</code> from S3 in Snowflake/Redshift, load jobs in BigQuery, or <code>executemany</code>/batches of a few thousand rows."
   ],
   "code": "import sqlite3, time, os\n\nif os.path.exists(\"load.db\"):\n    os.remove(\"load.db\")\ndb = sqlite3.connect(\"load.db\")\ndb.execute(\"CREATE TABLE t (id INT PRIMARY KEY, v INT)\")\n\nt = time.perf_counter()\nfor i in range(2_000):                                   # one INSERT + one commit per row\n    db.execute(\"INSERT INTO t VALUES (?, ?)\", (i, i))\n    db.commit()\nper_row = (time.perf_counter() - t) / 2_000\n\ndb.execute(\"DELETE FROM t\"); db.commit()\nt = time.perf_counter()\nwith db:                                                 # one batch, one transaction\n    db.executemany(\"INSERT INTO t VALUES (?, ?)\", [(i, i) for i in range(200_000)])\nbulk = time.perf_counter() - t\nprint(f\"row by row with commits: ~{per_row * 200_000:.1f}s for 200k rows (estimated)\")\nprint(f\"executemany in one transaction: {bulk:.2f}s for 200k rows\")",
   "out": {
    "text": "row by row with commits: ~257.7s for 200k rows (estimated)\nexecutemany in one transaction: 0.13s for 200k rows"
   }
  }
 ],
 "mistakes": [
  "Plain INSERT in a pipeline that can be retried.",
  "No primary/unique key on the target, so duplicates can't even be detected.",
  "Letting older records overwrite newer ones.",
  "Loading straight into the live table so readers see half a load."
 ],
 "practice": [
  {
   "q": "Make this load idempotent: daily job inserts yesterday's revenue rows into <code>daily_revenue(day, city, revenue)</code>.",
   "a": "Either add a primary key (day, city) and upsert, or in one transaction: <code>DELETE FROM daily_revenue WHERE day = :day</code> then insert the recomputed rows for that day. Re-runs then replace the day instead of duplicating it."
  },
  {
   "q": "Upsert customers so that emails are lower-cased and the latest name wins.",
   "code": "import sqlite3\ndb = sqlite3.connect(\":memory:\")\ndb.execute(\"CREATE TABLE customers (email TEXT PRIMARY KEY, name TEXT)\")\nrows = [(\"Asha@Example.com\", \"Asha\"), (\"asha@example.com\", \"Asha Rao\"), (\"ben@example.com\", \"Ben\")]\ndb.executemany(\"INSERT INTO customers VALUES (lower(?), ?) ON CONFLICT (email) DO UPDATE SET name = excluded.name\", rows)\nprint(db.execute(\"SELECT * FROM customers ORDER BY email\").fetchall())",
   "out": {
    "text": "[('asha@example.com', 'Asha Rao'), ('ben@example.com', 'Ben')]"
   }
  }
 ],
 "check": [
  [
   "Idempotent load means…",
   [
    "Fast load",
    "Running it twice gives the same result",
    "Streaming",
    "No transactions"
   ],
   1,
   "Safe re-runs."
  ],
  [
   "Best pattern for re-running a daily aggregate?",
   [
    "INSERT again",
    "Delete that day's partition and insert, in one transaction",
    "TRUNCATE everything",
    "Append with a timestamp"
   ],
   1,
   "Partition replace."
  ],
  [
   "Why guard upserts with updated_at?",
   [
    "Speed",
    "Stop older records overwriting newer ones",
    "Required by SQL",
    "Indexes"
   ],
   1,
   "Late, stale data happens."
  ]
 ],
 "remember": [
  "Every load must be safe to re-run.",
  "Upsert by key (ON CONFLICT / MERGE) with an updated_at guard.",
  "Stage → validate → apply in one transaction.",
  "Daily aggregates: delete partition + insert (or INSERT OVERWRITE).",
  "Bulk load (COPY, executemany, load jobs), not row by row."
 ]
};
L["de-foundations:build-extractor"] = {
 "title": "Project: an incremental API-to-warehouse pipeline",
 "level": "Project",
 "one": "Build a small but real pipeline: extract orders incrementally from an API, keep raw files, load idempotently into a database, build a daily revenue table, check the data, and make every step safe to re-run.",
 "why": "This is the shape of most real data engineering work. A clean, tested version is a strong first portfolio project and a great interview story.",
 "steps": [
  {
   "h": "The pipeline",
   "code": "extract  → raw/orders/dt=YYYY-MM-DD/page-NNNN.jsonl     (incremental by updated_at, watermark in state)\nload     → staging.orders → upsert into core.orders       (by order_id, newer updated_at wins)\ntransform→ marts.daily_revenue (delete day + insert)       (completed orders only)\ncheck    → row counts, no duplicate ids, totals >= 0, revenue matches source sample\nrun      → python -m pipeline run --date 2025-07-06        (cron/Airflow later)",
   "lang": "text"
  },
  {
   "h": "The whole pipeline, running",
   "code": "import httpx, json, sqlite3, pathlib\n\ndb = sqlite3.connect(\":memory:\")\ndb.executescript(\"\"\"\nCREATE TABLE core_orders (order_id INT PRIMARY KEY, customer TEXT, status TEXT, total INT, updated_at TEXT);\nCREATE TABLE daily_revenue (day TEXT, revenue INT, orders INT, PRIMARY KEY (day));\nCREATE TABLE state (name TEXT PRIMARY KEY, value TEXT);\n\"\"\")\n\ndef extract(since):\n    rows, cursor = [], 0\n    with httpx.Client(base_url=\"https://api.example-shop.com\", timeout=30) as c:\n        while cursor is not None:\n            body = c.get(\"/orders\", params={\"updated_since\": since, \"cursor\": cursor}).json()\n            rows += body[\"data\"]; cursor = body[\"next_cursor\"]\n    raw = pathlib.Path(\"raw/orders\"); raw.mkdir(parents=True, exist_ok=True)\n    (raw / f\"since={since or 'start'}.jsonl\").write_text(\"\\n\".join(json.dumps(r) for r in rows))\n    return rows\n\ndef load(rows):\n    with db:\n        db.executemany(\"\"\"INSERT INTO core_orders VALUES (:id, :customer, :status, :total, :updated_at)\n                          ON CONFLICT (order_id) DO UPDATE SET status = excluded.status, total = excluded.total,\n                          updated_at = excluded.updated_at WHERE excluded.updated_at > core_orders.updated_at\"\"\", rows)\n\ndef transform():\n    with db:\n        db.execute(\"DELETE FROM daily_revenue\")\n        db.execute(\"\"\"INSERT INTO daily_revenue\n                      SELECT substr(updated_at, 1, 10), SUM(total), COUNT(*) FROM core_orders\n                      WHERE status = 'paid' GROUP BY 1\"\"\")\n\ndef check():\n    dupes = db.execute(\"SELECT COUNT(*) - COUNT(DISTINCT order_id) FROM core_orders\").fetchone()[0]\n    negative = db.execute(\"SELECT COUNT(*) FROM core_orders WHERE total < 0\").fetchone()[0]\n    assert dupes == 0 and negative == 0, \"data checks failed\"\n    return \"checks passed\"\n\ndef run():\n    since = (db.execute(\"SELECT value FROM state WHERE name = 'orders'\").fetchone() or [\"\"])[0]\n    rows = extract(since)\n    load(rows); transform()\n    if rows:\n        with db:\n            db.execute(\"INSERT INTO state VALUES ('orders', ?) ON CONFLICT (name) DO UPDATE SET value = excluded.value\",\n                       (max(r[\"updated_at\"] for r in rows),))\n    return f\"{len(rows)} rows, {check()}\"\n\nprint(\"run 1:\", run())\nprint(\"run 2:\", run())\nprint(db.execute(\"SELECT * FROM daily_revenue ORDER BY day LIMIT 4\").fetchall())\nprint(\"core rows:\", db.execute(\"SELECT COUNT(*) FROM core_orders\").fetchone()[0])",
   "note": "Run 2 finds nothing new (the watermark moved), and nothing is duplicated. Re-running is always safe.",
   "out": {
    "text": "run 1: 23 rows, checks passed\nrun 2: 0 rows, checks passed\n[('2025-07-01', 637, 1), ('2025-07-02', 2233, 2), ('2025-07-03', 3329, 2), ('2025-07-04', 4425, 2)]\ncore rows: 23"
   }
  },
  {
   "h": "Tests",
   "code": "import sqlite3\n\ndef upsert(db, rows):\n    db.executemany(\"\"\"INSERT INTO o VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET status = excluded.status,\n                      updated_at = excluded.updated_at WHERE excluded.updated_at > o.updated_at\"\"\", rows)\n\ndef make():\n    db = sqlite3.connect(\":memory:\")\n    db.execute(\"CREATE TABLE o (id INT PRIMARY KEY, status TEXT, updated_at TEXT)\")\n    return db\n\ndef test_rerun_does_not_duplicate():\n    db = make(); upsert(db, [(1, \"paid\", \"t1\")]); upsert(db, [(1, \"paid\", \"t1\")])\n    assert db.execute(\"SELECT COUNT(*) FROM o\").fetchone()[0] == 1\n\ndef test_newer_update_wins():\n    db = make(); upsert(db, [(1, \"paid\", \"t1\")]); upsert(db, [(1, \"refunded\", \"t2\")])\n    assert db.execute(\"SELECT status FROM o\").fetchone()[0] == \"refunded\"\n\ndef test_stale_update_ignored():\n    db = make(); upsert(db, [(1, \"refunded\", \"t2\")]); upsert(db, [(1, \"paid\", \"t1\")])\n    assert db.execute(\"SELECT status FROM o\").fetchone()[0] == \"refunded\"",
   "test": true,
   "out": {
    "text": "...  [100%]\n3 passed in 0.01s"
   }
  },
  {
   "h": "Make it portfolio-ready",
   "p": [
    "Swap SQLite for PostgreSQL or DuckDB, use a real public API (or the Integration Hub project's API), schedule it (cron now, Airflow later in this path), add a README with the diagram, how to run, the checks, and a screenshot of a small dashboard built on <code>daily_revenue</code>."
   ]
  }
 ],
 "mistakes": [
  "No checks, so bad data reaches dashboards.",
  "Watermark saved before the load.",
  "A pipeline you can't re-run for a specific past date."
 ],
 "practice": [
  {
   "q": "Add a check that fails if today's row count drops by more than 50% compared with yesterday. Write it as a function.",
   "code": "def volume_check(today: int, yesterday: int, max_drop: float = 0.5) -> str:\n    if yesterday and today < yesterday * (1 - max_drop):\n        raise ValueError(f\"row count dropped from {yesterday} to {today}\")\n    return \"ok\"\n\nprint(volume_check(950, 1000))\ntry:\n    volume_check(300, 1000)\nexcept ValueError as e:\n    print(\"FAIL:\", e)",
   "out": {
    "text": "ok\nFAIL: row count dropped from 1000 to 300"
   }
  },
  {
   "q": "How would you re-process July 3rd after fixing a transform bug?",
   "a": "Re-run the transform for that day from the stored raw/core data: delete and rebuild the day's partition in the mart (idempotent), then re-run the checks. No new API calls are needed because raw data is kept."
  }
 ],
 "check": [
  [
   "Why did run 2 load 0 rows?",
   [
    "Bug",
    "The watermark moved past all existing records",
    "The API was down",
    "Rate limit"
   ],
   1,
   "Incremental extraction."
  ],
  [
   "What protects against duplicate orders?",
   [
    "Luck",
    "Primary key + upsert",
    "Sorting",
    "Indexes only"
   ],
   1,
   "Idempotent loads."
  ],
  [
   "Where do checks run?",
   [
    "Never",
    "After load/transform, before data is used",
    "Only in tests",
    "In the dashboard"
   ],
   1,
   "Stop bad data early."
  ]
 ],
 "remember": [
  "Extract incrementally → raw files → upsert core → rebuild marts → check.",
  "State (watermark) saved after success.",
  "Every step idempotent and re-runnable for any date.",
  "Test the upsert rules: no duplicates, newer wins, stale ignored."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
