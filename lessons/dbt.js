// Lessons for course "dbt". Built by tools/course-builder from tools/courses/dbt.js.
// Python examples were run and their real output stored.
(function (L) {
L["dbt:elt"] = {
 "title": "ETL vs ELT and the modern data stack",
 "level": "Beginner+",
 "one": "<b>ETL</b> transforms data before loading it. <b>ELT</b> loads raw data into the warehouse first, then transforms it there with SQL. Cloud warehouses made ELT the default, and <b>dbt</b> is the tool most teams use for the T.",
 "why": "Almost every modern data team works ELT-style with dbt. Understanding why tells you where each piece of logic goes and why SQL skills matter so much.",
 "steps": [
  {
   "h": "ETL vs ELT",
   "code": "ETL (older)   source ──extract──► transform in Python/ETL tool ──load──► warehouse\n              + less data stored         − raw data lost, changes need re-extracting\nELT (modern)  source ──extract──load──► warehouse (raw) ──transform with SQL──► marts\n              + raw kept, re-transform any time, analysts can read/change SQL\n              + warehouse compute is fast and elastic",
   "lang": "text"
  },
  {
   "h": "The modern data stack",
   "code": "ingest        Fivetran / Airbyte / dlt / custom Python   → raw tables\nstore         Snowflake / BigQuery / Redshift / Databricks / DuckDB / Postgres\ntransform     dbt (SQL + Jinja, tests, docs, lineage)    → staging → marts\norchestrate   Airflow / Dagster / dbt Cloud jobs\nconsume       BI (Power BI, Looker, Metabase), ML, reverse ETL back to apps\nquality       dbt tests, Great Expectations, monitors",
   "lang": "text"
  },
  {
   "h": "Why transform with SQL in the warehouse",
   "p": [
    "The data is already there (no moving it out and back); warehouses scale compute up for big jobs; SQL is readable by analysts too; and transformations become versioned code in Git, reviewed like any software. Python still has a place: extraction, ML, complex parsing."
   ]
  },
  {
   "h": "A first transformation in the warehouse",
   "code": "w(\"models/staging/stg_orders.sql\", \"\"\"\nselect id as order_id, cust as customer_id, amt as amount,\n       lower(status) as status, cast(updated_at as timestamp) as updated_at\nfrom {{ ref('raw_orders') }}\n\"\"\")\ndbt(\"seed\")\ndbt(\"run\")\nquery(\"select * from stg_orders order by order_id\")",
   "note": "<code>dbt seed</code> loaded the CSVs as raw tables (playing the role of an ingestion tool), and <code>dbt run</code> created the staging view in DuckDB.",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_orders                                 SUCCESS\n┌──────────┬─────────────┬────────┬──────────┬─────────────────────┐\n│ order_id │ customer_id │ amount │  status  │     updated_at      │\n│  int32   │    int32    │ int32  │ varchar  │      timestamp      │\n├──────────┼─────────────┼────────┼──────────┼─────────────────────┤\n│        1 │         101 │  55000 │ paid     │ 2025-06-02 10:00:00 │\n│        2 │         101 │   2400 │ paid     │ 2025-06-15 09:00:00 │\n│        3 │         102 │   9200 │ refunded │ 2025-06-20 12:00:00 │\n│        4 │         103 │   3000 │ paid     │ 2025-07-01 08:30:00 │\n│        5 │         102 │   3600 │ paid     │ 2025-07-05 16:10:00 │\n└──────────┴─────────────┴────────┴──────────┴─────────────────────┘"
   }
  },
  {
   "h": "Where logic goes",
   "code": "extraction (Python/tool)   pagination, auth, retries, writing raw data as-is\nstaging models             rename, cast, clean casing, dedupe, one model per source table\nintermediate models        joins and reusable building blocks\nmart models                business definitions: revenue, active customer, churn",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Cleaning data inside the extract script so raw data is lost.",
  "Business definitions in the BI tool (different dashboards disagree).",
  "Giant single SQL files instead of layered models.",
  "Treating SQL transformations as not real code (no Git, no review, no tests)."
 ],
 "practice": [
  {
   "q": "A team computes revenue three ways in three dashboards. How does ELT + dbt fix it?",
   "a": "Define revenue once in a dbt mart model (e.g. fct_orders.revenue with documented rules), test it, and have every dashboard read that mart instead of computing its own. Changes then happen in one reviewed place."
  },
  {
   "q": "Add a staging model for customers that upper-cases city names, then query it.",
   "code": "w(\"models/staging/stg_customers.sql\", \"\"\"\nselect id as customer_id, name, upper(city) as city from {{ ref('raw_customers') }}\n\"\"\")\ndbt(\"seed\")\ndbt(\"run\", \"--select\", \"stg_customers\")\nquery(\"select * from stg_customers\")",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_customers                              SUCCESS\n┌─────────────┬─────────┬───────────┐\n│ customer_id │  name   │   city    │\n│    int32    │ varchar │  varchar  │\n├─────────────┼─────────┼───────────┤\n│         101 │ Asha    │ KOCHI     │\n│         102 │ Ben     │ BENGALURU │\n│         103 │ Chen    │ DUBAI     │\n└─────────────┴─────────┴───────────┘"
   }
  }
 ],
 "check": [
  [
   "ELT means…",
   [
    "Transform before loading",
    "Load raw first, transform in the warehouse",
    "Only extract",
    "Streaming"
   ],
   1,
   "Modern default."
  ],
  [
   "Main benefit of keeping raw data?",
   [
    "Pretty tables",
    "Re-transform any time without re-extracting",
    "Cheaper",
    "Faster dashboards"
   ],
   1,
   "Replay."
  ],
  [
   "dbt is used for…",
   [
    "Extraction",
    "Transformations in SQL with tests and docs",
    "Dashboards",
    "Streaming"
   ],
   1,
   "The T in ELT."
  ]
 ],
 "remember": [
  "ELT: load raw, transform in the warehouse.",
  "Stack: ingest → warehouse → dbt → BI/ML, orchestrated and tested.",
  "Staging = clean per source; marts = business definitions.",
  "Transformations are code: Git, review, tests."
 ]
};
L["dbt:idempotent"] = {
 "title": "Idempotent, re-runnable transformations",
 "level": "Intermediate",
 "one": "A transformation is <b>idempotent</b> when running it again gives the same result. Build tables as <b>pure functions of their inputs</b> (rebuild or replace by key/partition), never as “append whatever happened since last time”.",
 "why": "Jobs get retried, backfilled and re-run after bugs. Non-idempotent transforms double numbers or lose data, and these are the bugs that destroy trust in a data team.",
 "steps": [
  {
   "h": "The non-idempotent trap",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"CREATE TABLE orders AS SELECT * FROM (VALUES (1, DATE '2025-07-05', 500), (2, DATE '2025-07-05', 900)) t(id, day, amount)\")\ncon.execute(\"CREATE TABLE daily_revenue (day DATE, revenue INT)\")\n\ndef bad_job(day):                       # appends every time it runs\n    con.execute(\"INSERT INTO daily_revenue SELECT day, SUM(amount) FROM orders WHERE day = ? GROUP BY day\", [day])\n\nbad_job(\"2025-07-05\"); bad_job(\"2025-07-05\")       # retried after a timeout\nprint(con.sql(\"SELECT day, SUM(revenue) AS reported FROM daily_revenue GROUP BY day\"))",
   "note": "The dashboard now shows 2800 instead of 1400.",
   "out": {
    "text": "┌────────────┬──────────┐\n│    day     │ reported │\n│    date    │  int128  │\n├────────────┼──────────┤\n│ 2025-07-05 │     2800 │\n└────────────┴──────────┘"
   }
  },
  {
   "h": "Three idempotent patterns",
   "code": "1. full rebuild        CREATE OR REPLACE TABLE x AS SELECT ...       (dbt materialized='table')\n2. replace partition    DELETE WHERE day = :d; INSERT ... WHERE day = :d  in one transaction\n                        (warehouses: INSERT OVERWRITE / dbt incremental 'delete+insert')\n3. merge by key         MERGE INTO x USING new ON key ... UPDATE/INSERT   (dbt incremental 'merge')",
   "lang": "text"
  },
  {
   "h": "Partition replace, running",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"CREATE TABLE orders AS SELECT * FROM (VALUES (1, DATE '2025-07-05', 500), (2, DATE '2025-07-05', 900), (3, DATE '2025-07-06', 300)) t(id, day, amount)\")\ncon.execute(\"CREATE TABLE daily_revenue (day DATE, revenue INT)\")\n\ndef good_job(day):\n    con.execute(\"BEGIN\")\n    con.execute(\"DELETE FROM daily_revenue WHERE day = ?\", [day])\n    con.execute(\"INSERT INTO daily_revenue SELECT day, SUM(amount) FROM orders WHERE day = ? GROUP BY day\", [day])\n    con.execute(\"COMMIT\")\n\nfor _ in range(3):\n    good_job(\"2025-07-05\")\ngood_job(\"2025-07-06\")\nprint(con.sql(\"SELECT * FROM daily_revenue ORDER BY day\"))",
   "out": {
    "text": "┌────────────┬─────────┐\n│    day     │ revenue │\n│    date    │  int32  │\n├────────────┼─────────┤\n│ 2025-07-05 │    1400 │\n│ 2025-07-06 │     300 │\n└────────────┴─────────┘"
   }
  },
  {
   "h": "Determinism: same inputs, same output",
   "p": [
    "Idempotent also means <b>deterministic</b>. Avoid <code>now()</code>/<code>current_date</code> inside logic (pass the run date in as a variable), random sampling without a seed, and <code>ROW_NUMBER()</code> without a complete <code>ORDER BY</code> (ties pick arbitrary rows)."
   ],
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"CREATE TABLE updates AS SELECT * FROM (VALUES\n  (1, 'paid', TIMESTAMP '2025-07-05 10:00', 1), (1, 'refunded', TIMESTAMP '2025-07-05 10:00', 2),\n  (2, 'paid', TIMESTAMP '2025-07-05 11:00', 3)) t(order_id, status, updated_at, ingest_seq)\"\"\")\nprint(con.sql(\"\"\"\nSELECT order_id, status FROM (\n  SELECT *, row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC, ingest_seq DESC) AS rn\n  FROM updates) WHERE rn = 1 ORDER BY order_id\n\"\"\"))",
   "note": "Two updates share the same timestamp; the tie-breaker <code>ingest_seq</code> makes the latest-row choice stable on every run.",
   "out": {
    "text": "┌──────────┬──────────┐\n│ order_id │  status  │\n│  int32   │ varchar  │\n├──────────┼──────────┤\n│        1 │ refunded │\n│        2 │ paid     │\n└──────────┴──────────┘"
   }
  },
  {
   "h": "Backfills",
   "p": [
    "Because each day is replaced as a unit, fixing a bug in history is simple: deploy the fix and re-run the affected days (a <b>backfill</b>). Orchestrators (Airflow) pass the logical date, so a backfill is just “run this job for each date in the range”."
   ]
  }
 ],
 "mistakes": [
  "INSERT-append jobs with no delete/merge.",
  "Using now() inside transformations, so reruns give different answers.",
  "ROW_NUMBER with ties for dedupe.",
  "Delete and insert in separate transactions (readers see a gap)."
 ],
 "practice": [
  {
   "q": "Make this dedupe deterministic: keep the latest row per customer_id by updated_at.",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"CREATE TABLE src AS SELECT * FROM (VALUES (101, 'Kochi', 1, 10), (101, 'Dubai', 2, 11), (102, 'Pune', 1, 12), (102, 'Goa', 1, 13)) t(customer_id, city, updated_at, _loaded_seq)\"\"\")\nprint(con.sql(\"\"\"SELECT customer_id, city FROM src\nQUALIFY row_number() OVER (PARTITION BY customer_id ORDER BY updated_at DESC, _loaded_seq DESC) = 1\nORDER BY customer_id\"\"\").fetchall())",
   "out": {
    "text": "[(101, 'Dubai'), (102, 'Goa')]"
   }
  },
  {
   "q": "A job computes “orders in the last 7 days” using current_date. Why is that a problem for backfills, and what's the fix?",
   "a": "Re-running it for a past day uses today's date, not that day's, so backfills compute the wrong window. Pass the run (logical) date as a variable (dbt var / Airflow {{ ds }}) and use it instead of current_date."
  }
 ],
 "check": [
  [
   "Idempotent transform means…",
   [
    "Fast",
    "Re-running gives the same result",
    "Uses Python",
    "Streaming"
   ],
   1,
   "Safe retries/backfills."
  ],
  [
   "Which breaks determinism?",
   [
    "GROUP BY",
    "now() inside the logic",
    "JOIN",
    "Views"
   ],
   1,
   "Pass the run date in."
  ],
  [
   "Partition replace must be…",
   [
    "Two transactions",
    "One transaction (delete + insert)",
    "Without delete",
    "Daily only"
   ],
   1,
   "No gap or double data."
  ]
 ],
 "remember": [
  "Tables = pure functions of inputs.",
  "Full rebuild, partition replace, or merge by key.",
  "No now()/random/ambiguous ROW_NUMBER in logic.",
  "Run date passed in → backfills are just re-runs."
 ]
};
L["dbt:incremental"] = {
 "title": "Incremental models",
 "level": "Intermediate",
 "one": "For big tables, rebuild only what changed: an <b>incremental model</b> processes new/updated rows since the last run and <b>merges</b> them into the existing table, instead of recomputing years of history every time.",
 "why": "Full rebuilds of billion-row tables are slow and expensive. Incremental models are how real warehouses stay fast and cheap, and getting them right (late data, merges, full refresh) is a core skill.",
 "steps": [
  {
   "h": "Incremental in dbt",
   "code": "w(\"models/marts/fct_orders.sql\", \"\"\"\n{{ config(materialized='incremental', unique_key='order_id') }}\nselect id as order_id, cust as customer_id, amt as amount, lower(status) as status,\n       cast(updated_at as timestamp) as updated_at\nfrom {{ ref('raw_orders') }}\n{% if is_incremental() %}\nwhere cast(updated_at as timestamp) > (select max(updated_at) from {{ this }})\n{% endif %}\n\"\"\")\ndbt(\"seed\"); dbt(\"run\")\nquery(\"select count(*) as rows, max(updated_at) as newest from fct_orders\")\n\n# new data arrives: order 3 is updated, order 6 is new\nw(\"seeds/raw_orders.csv\", \"\"\"\nid,cust,amt,status,updated_at\n1,101,55000,PAID,2025-06-02 10:00:00\n2,101,2400,paid,2025-06-15 09:00:00\n3,102,9200,paid,2025-07-08 12:00:00\n4,103,3000,paid,2025-07-01 08:30:00\n5,102,3600,paid,2025-07-05 16:10:00\n6,101,700,paid,2025-07-09 09:45:00\n\"\"\")\ndbt(\"seed\"); dbt(\"run\")\nquery(\"select order_id, status, updated_at from fct_orders where order_id in (3, 6) order by order_id\")\nquery(\"select count(*) as rows from fct_orders\")",
   "note": "The second run processed only rows newer than the table's max <code>updated_at</code>, updated order 3 in place (thanks to <code>unique_key</code>) and added order 6. No duplicates.",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    fct_orders                                 SUCCESS\n┌───────┬─────────────────────┐\n│ rows  │       newest        │\n│ int64 │      timestamp      │\n├───────┼─────────────────────┤\n│     5 │ 2025-07-05 16:10:00 │\n└───────┴─────────────────────┘\n\nseed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    fct_orders                                 SUCCESS\n┌──────────┬─────────┬─────────────────────┐\n│ order_id │ status  │     updated_at      │\n│  int32   │ varchar │      timestamp      │\n├──────────┼─────────┼─────────────────────┤\n│        3 │ paid    │ 2025-07-08 12:00:00 │\n│        6 │ paid    │ 2025-07-09 09:45:00 │\n└──────────┴─────────┴─────────────────────┘\n\n┌───────┐\n│ rows  │\n│ int64 │\n├───────┤\n│     6 │\n└───────┘"
   }
  },
  {
   "h": "How the merge works",
   "code": "first run / --full-refresh      CREATE TABLE fct_orders AS <whole query>\nlater runs (is_incremental())   1. run the query with the WHERE filter → new/changed rows\n                                2. MERGE into fct_orders on unique_key:\n                                   matched → update, not matched → insert\nstrategies                      merge (default on most warehouses), delete+insert,\n                                append (only for immutable events), insert_overwrite (partitions)",
   "lang": "text"
  },
  {
   "h": "Late-arriving data: use a lookback",
   "p": [
    "Filtering strictly on <code>&gt; max(updated_at)</code> misses rows that arrive late with an older timestamp. Re-process a small window (e.g. the last 3 days) on each run; the merge on <code>unique_key</code> makes that safe."
   ],
   "code": "{% if is_incremental() %}\nwhere updated_at > (select max(updated_at) - interval 3 day from {{ this }})\n{% endif %}",
   "lang": "sql"
  },
  {
   "h": "Full refresh",
   "p": [
    "When the model's logic changes (a new column, a bug fix in history), rebuild from scratch: <code>dbt run --select fct_orders --full-refresh</code>. Schedule occasional full refreshes for tables where drift could accumulate."
   ],
   "code": "w(\"models/marts/fct_orders.sql\", \"\"\"\n{{ config(materialized='incremental', unique_key='order_id') }}\nselect id as order_id, amt as amount from {{ ref('raw_orders') }}\n{% if is_incremental() %} where false {% endif %}\n\"\"\")\ndbt(\"seed\"); dbt(\"run\")\ndbt(\"run\", \"--select\", \"fct_orders\", \"--full-refresh\")\nquery(\"select count(*) as rows from fct_orders\")",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    fct_orders                                 SUCCESS\nmodel    fct_orders                                 SUCCESS\n┌───────┐\n│ rows  │\n│ int64 │\n├───────┤\n│     5 │\n└───────┘"
   }
  },
  {
   "h": "When to use incremental",
   "p": [
    "Use it when the table is big (tens of millions of rows+) or slow to rebuild, and rows have a reliable <code>updated_at</code> or event time plus a unique key. Small tables: keep them as plain <code>table</code> models; simpler is better."
   ]
  }
 ],
 "mistakes": [
  "Incremental without unique_key, creating duplicates when rows update.",
  "No lookback window, so late data is silently missed.",
  "Changing model logic and forgetting --full-refresh.",
  "Making every model incremental (complexity with no benefit)."
 ],
 "practice": [
  {
   "q": "Write the incremental filter for an events table (immutable events, column event_ts) with a 2-day lookback, using append-safe merge on event_id.",
   "a": "<code>{{ config(materialized='incremental', unique_key='event_id') }} … {% if is_incremental() %} where event_ts &gt; (select max(event_ts) - interval 2 day from {{ this }}) {% endif %}</code>. The unique_key merge stops the 2-day overlap from duplicating events."
  },
  {
   "q": "Your incremental table's totals slowly drift from the source over months. What are likely causes and fixes?",
   "a": "Causes: late-arriving updates outside the lookback, deletes in the source never propagated, logic changes without full refresh. Fixes: widen the lookback, handle deletes (soft-delete flags or periodic reconciliation), schedule periodic full refreshes, and add a test comparing totals with the source."
  }
 ],
 "check": [
  [
   "is_incremental() is true when…",
   [
    "Always",
    "The table exists and it's not a full refresh",
    "First run",
    "Never"
   ],
   1,
   "Then the filter applies."
  ],
  [
   "unique_key does what?",
   [
    "Indexes",
    "Lets dbt merge updated rows instead of duplicating",
    "Sorts",
    "Partitions"
   ],
   1,
   "Merge key."
  ],
  [
   "Late-arriving data fix?",
   [
    "Ignore",
    "Lookback window + merge",
    "Full refresh hourly",
    "Delete late rows"
   ],
   1,
   "Safe overlap."
  ]
 ],
 "remember": [
  "materialized='incremental' + unique_key + is_incremental() filter.",
  "Merge updates in place; append only for immutable events.",
  "Lookback window for late data.",
  "--full-refresh after logic changes.",
  "Only for big/slow tables."
 ]
};
L["dbt:dbt-basics"] = {
 "title": "dbt basics: models, ref, sources and layers",
 "level": "Intermediate",
 "one": "A dbt project is a folder of SQL <b>models</b> (SELECT statements). <code>ref()</code> links models so dbt knows the build order (the <b>DAG</b>), materialisations decide view vs table, and Jinja macros remove repetition.",
 "why": "dbt is in most data engineering and analytics engineering job posts. Knowing its building blocks lets you work in any team's project on day one.",
 "steps": [
  {
   "h": "Project layout",
   "code": "shop/\n  dbt_project.yml          project name, folders, default materialisations\n  profiles.yml             connection (usually ~/.dbt/profiles.yml, not in Git)\n  models/\n    staging/  stg_orders.sql, stg_customers.sql, _sources.yml, _schema.yml\n    intermediate/ int_orders_enriched.sql\n    marts/    fct_orders.sql, dim_customers.sql, _schema.yml\n  seeds/      small CSVs (country codes, mappings)\n  snapshots/  SCD Type 2 history\n  macros/     reusable Jinja\n  tests/      custom SQL tests",
   "lang": "text"
  },
  {
   "h": "Models and ref() build a DAG",
   "code": "w(\"models/staging/stg_orders.sql\", \"\"\"\nselect id as order_id, cust as customer_id, amt as amount, lower(status) as status,\n       cast(updated_at as timestamp) as ordered_at\nfrom {{ ref('raw_orders') }}\n\"\"\")\nw(\"models/staging/stg_customers.sql\", \"\"\"\nselect id as customer_id, name, city from {{ ref('raw_customers') }}\n\"\"\")\nw(\"models/marts/dim_customers.sql\", \"\"\"\nselect c.customer_id, c.name, c.city,\n       count(o.order_id) as orders, coalesce(sum(o.amount), 0) as lifetime_value,\n       min(o.ordered_at) as first_order_at\nfrom {{ ref('stg_customers') }} c\nleft join {{ ref('stg_orders') }} o on o.customer_id = c.customer_id and o.status = 'paid'\ngroup by all\n\"\"\")\ndbt(\"build\")\nquery(\"select * from dim_customers order by lifetime_value desc\")",
   "note": "dbt worked out the order from the <code>ref()</code> calls: seeds → staging → marts. Staging became views and marts tables, as set in dbt_project.yml.",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_customers                              SUCCESS\nmodel    stg_orders                                 SUCCESS\nmodel    dim_customers                              SUCCESS\n┌─────────────┬─────────┬───────────┬────────┬────────────────┬─────────────────────┐\n│ customer_id │  name   │   city    │ orders │ lifetime_value │   first_order_at    │\n│    int32    │ varchar │  varchar  │ int64  │     int128     │      timestamp      │\n├─────────────┼─────────┼───────────┼────────┼────────────────┼─────────────────────┤\n│         101 │ Asha    │ Kochi     │      2 │          57400 │ 2025-06-02 10:00:00 │\n│         102 │ Ben     │ Bengaluru │      1 │           3600 │ 2025-07-05 16:10:00 │\n│         103 │ Chen    │ Dubai     │      1 │           3000 │ 2025-07-01 08:30:00 │\n└─────────────┴─────────┴───────────┴────────┴────────────────┴─────────────────────┘"
   }
  },
  {
   "h": "Selecting parts of the DAG",
   "code": "dbt build                                  everything: seeds, models, snapshots, tests\ndbt run --select stg_orders                one model\ndbt run --select stg_orders+               it and everything downstream\ndbt run --select +dim_customers            it and everything upstream\ndbt run --select staging                   a folder\ndbt build --select state:modified+         only what changed in this PR (CI)\ndbt docs generate && dbt docs serve        documentation site with lineage graph",
   "lang": "text"
  },
  {
   "h": "Sources",
   "p": [
    "Raw tables loaded by ingestion tools are declared as <b>sources</b> in YAML and referenced with <code>{{ source('shop', 'orders') }}</code>. This documents where data comes from, enables freshness checks, and shows raw tables in the lineage graph."
   ],
   "code": "# models/staging/_sources.yml\nversion: 2\nsources:\n  - name: shop\n    schema: raw\n    loaded_at_field: _loaded_at\n    freshness:\n      warn_after: {count: 6, period: hour}\n      error_after: {count: 24, period: hour}\n    tables:\n      - name: orders\n      - name: customers\n\n-- models/staging/stg_orders.sql\nselect id as order_id, ... from {{ source('shop', 'orders') }}",
   "lang": "yaml"
  },
  {
   "h": "Jinja macros",
   "code": "w(\"macros/cents_to_rupees.sql\", \"\"\"\n{% macro paise_to_rupees(col) %} round({{ col }} / 100.0, 2) {% endmacro %}\n\"\"\")\nw(\"models/staging/stg_payments.sql\", \"\"\"\n{% set methods = ['upi', 'card', 'cash'] %}\nselect 1 as payment_id, {{ paise_to_rupees('125050') }} as amount_rupees,\n  {% for m in methods %} {{ loop.index }} as {{ m }}_rank{% if not loop.last %},{% endif %} {% endfor %}\n\"\"\")\ndbt(\"run\", \"--select\", \"stg_payments\")\nquery(\"select * from stg_payments\")",
   "out": {
    "text": "model    stg_payments                               SUCCESS\n┌────────────┬───────────────┬──────────┬───────────┬───────────┐\n│ payment_id │ amount_rupees │ upi_rank │ card_rank │ cash_rank │\n│   int32    │    double     │  int32   │   int32   │   int32   │\n├────────────┼───────────────┼──────────┼───────────┼───────────┤\n│          1 │        1250.5 │        1 │         2 │         3 │\n└────────────┴───────────────┴──────────┴───────────┴───────────┘"
   }
  }
 ],
 "mistakes": [
  "Hardcoding table names instead of ref()/source() (dbt can't build the DAG).",
  "Putting business logic in staging models.",
  "profiles.yml with passwords committed to Git.",
  "Over-using Jinja until SQL is unreadable."
 ],
 "practice": [
  {
   "q": "Build a mart of revenue by city using ref() to staging models.",
   "code": "w(\"models/staging/stg_orders.sql\", \"select id as order_id, cust as customer_id, amt as amount, lower(status) as status from {{ ref('raw_orders') }}\")\nw(\"models/staging/stg_customers.sql\", \"select id as customer_id, city from {{ ref('raw_customers') }}\")\nw(\"models/marts/revenue_by_city.sql\", \"\"\"\nselect c.city, sum(o.amount) as revenue\nfrom {{ ref('stg_orders') }} o join {{ ref('stg_customers') }} c using (customer_id)\nwhere o.status = 'paid' group by c.city\n\"\"\")\ndbt(\"build\")\nquery(\"select * from revenue_by_city order by revenue desc\")",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_customers                              SUCCESS\nmodel    stg_orders                                 SUCCESS\nmodel    revenue_by_city                            SUCCESS\n┌───────────┬─────────┐\n│   city    │ revenue │\n│  varchar  │ int128  │\n├───────────┼─────────┤\n│ Kochi     │   57400 │\n│ Bengaluru │    3600 │\n│ Dubai     │    3000 │\n└───────────┴─────────┘"
   }
  },
  {
   "q": "You changed stg_orders. What command rebuilds it and everything that depends on it, with tests?",
   "a": "<code>dbt build --select stg_orders+</code>"
  }
 ],
 "check": [
  [
   "What does ref() give you?",
   [
    "A comment",
    "Dependencies, build order and environment-aware table names",
    "Speed only",
    "Tests"
   ],
   1,
   "The DAG."
  ],
  [
   "Staging models are usually…",
   [
    "Tables with business logic",
    "Views that clean one source table",
    "Snapshots",
    "Seeds"
   ],
   1,
   "Thin cleanup layer."
  ],
  [
   "Select a model and everything downstream?",
   [
    "+model",
    "model+",
    "model*",
    "-model"
   ],
   1,
   "Plus after = downstream."
  ]
 ],
 "remember": [
  "Models are SELECTs; ref()/source() build the DAG.",
  "staging (views) → intermediate → marts (tables).",
  "Selectors: model+, +model, folder, state:modified+.",
  "Sources document raw tables and freshness.",
  "Macros for repetition, used sparingly."
 ]
};
L["dbt:dbt-tests"] = {
 "title": "Testing and documenting with dbt",
 "level": "Intermediate",
 "one": "dbt tests are SQL queries that return <b>failing rows</b>. Declare generic tests (unique, not_null, accepted_values, relationships) in YAML, write custom SQL tests for business rules, and <code>dbt build</code> stops downstream models when tests fail.",
 "why": "Tests are what make data trustworthy. Teams that test catch broken data before executives see it on a dashboard. Interviewers ask “how do you ensure data quality in your pipelines?”.",
 "steps": [
  {
   "h": "Generic tests in YAML",
   "code": "w(\"models/staging/stg_orders.sql\", \"\"\"\nselect id as order_id, cust as customer_id, amt as amount, lower(status) as status\nfrom {{ ref('raw_orders') }}\n\"\"\")\nw(\"models/staging/stg_customers.sql\", \"select id as customer_id, name, city from {{ ref('raw_customers') }}\")\nw(\"models/staging/_schema.yml\", \"\"\"\nversion: 2\nmodels:\n  - name: stg_orders\n    columns:\n      - name: order_id\n        data_tests: [unique, not_null]\n      - name: status\n        data_tests:\n          - accepted_values:\n              arguments: {values: ['paid', 'refunded', 'pending']}\n      - name: customer_id\n        data_tests:\n          - relationships:\n              arguments: {to: ref('stg_customers'), field: customer_id}\n\"\"\")\ndbt(\"build\")",
   "note": "Each test is compiled to a SELECT that returns bad rows; zero rows means PASS.",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_customers                              SUCCESS\nmodel    stg_orders                                 SUCCESS\ntest     accepted_values_stg_orders_status__paid__refunded__pending PASS\ntest     not_null_stg_orders_order_id               PASS\ntest     relationships_stg_orders_customer_id__customer_id__ref_stg_customers_ PASS\ntest     unique_stg_orders_order_id                 PASS"
   }
  },
  {
   "h": "When a test fails",
   "p": [
    "New raw data arrives with a duplicate order and an unknown customer. Watch dbt catch both:"
   ],
   "code": "w(\"seeds/raw_orders.csv\", \"\"\"\nid,cust,amt,status,updated_at\n1,101,55000,paid,2025-06-02 10:00:00\n1,101,55000,paid,2025-06-02 10:00:00\n2,999,2400,paid,2025-06-15 09:00:00\n\"\"\")\nw(\"models/staging/stg_orders.sql\", \"select id as order_id, cust as customer_id, amt as amount from {{ ref('raw_orders') }}\")\nw(\"models/staging/stg_customers.sql\", \"select id as customer_id from {{ ref('raw_customers') }}\")\nw(\"models/marts/fct_orders.sql\", \"select * from {{ ref('stg_orders') }}\")\nw(\"models/staging/_schema.yml\", \"\"\"\nversion: 2\nmodels:\n  - name: stg_orders\n    columns:\n      - name: order_id\n        data_tests: [unique]\n      - name: customer_id\n        data_tests:\n          - relationships:\n              arguments: {to: ref('stg_customers'), field: customer_id}\n\"\"\")\ndbt(\"build\")",
   "note": "fct_orders was SKIPPED: dbt build doesn't build downstream models on top of failing data.",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_customers                              SUCCESS\nmodel    stg_orders                                 SUCCESS\ntest     relationships_stg_orders_customer_id__customer_id__ref_stg_customers_ FAIL  (1 failing rows)\ntest     unique_stg_orders_order_id                 FAIL  (1 failing rows)\nmodel    fct_orders                                 SKIPPED"
   }
  },
  {
   "h": "Custom (singular) tests for business rules",
   "code": "w(\"models/staging/stg_orders.sql\", \"select id as order_id, amt as amount, lower(status) as status from {{ ref('raw_orders') }}\")\nw(\"tests/no_negative_or_huge_amounts.sql\", \"\"\"\n-- returns the bad rows; the test fails if any come back\nselect * from {{ ref('stg_orders') }}\nwhere amount < 0 or amount > 1000000\n\"\"\")\nw(\"tests/refunds_less_than_10_percent.sql\", \"\"\"\nselect 1 from {{ ref('stg_orders') }}\nhaving sum(case when status = 'refunded' then amount else 0 end) > 0.1 * sum(amount)\n\"\"\")\ndbt(\"build\")",
   "note": "The refunds rule fails on this sample data (9,200 refunded out of 73,200). That's the point: a business expectation broke, and someone should look before the numbers go out.",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_orders                                 SUCCESS\ntest     no_negative_or_huge_amounts                PASS\ntest     refunds_less_than_10_percent               FAIL  (1 failing rows)"
   }
  },
  {
   "h": "Severity, thresholds and packages",
   "code": "- name: email\n  data_tests:\n    - not_null:\n        config:\n          severity: warn                 # warn instead of failing the run\n          error_if: \">100\"               # fail only above 100 bad rows\n          warn_if: \">0\"\n\npackages (packages.yml → dbt deps)\n  dbt_utils            unique_combination_of_columns, expression_is_true, recency\n  dbt_expectations     ranges, regex, row counts, distributions\n  elementary           anomaly detection + data observability reports",
   "lang": "yaml"
  },
  {
   "h": "Documentation",
   "p": [
    "Add <code>description:</code> to models and columns in the same YAML. <code>dbt docs generate</code> builds a site with every model, column, test and an interactive lineage graph, so “where does this number come from?” has an answer."
   ],
   "code": "models:\n  - name: fct_orders\n    description: \"One row per order. Revenue excludes refunds and test orders.\"\n    columns:\n      - name: revenue\n        description: \"Order total in INR after discounts, before tax.\"",
   "lang": "yaml"
  }
 ],
 "mistakes": [
  "No tests on primary keys (unique + not_null is the minimum).",
  "Tests that always warn, so everyone ignores them.",
  "Testing only staging, never business rules in marts.",
  "No descriptions, so nobody knows what a column means."
 ],
 "practice": [
  {
   "q": "Write the YAML tests for dim_customers: customer_id unique/not null, segment in (retail, business), email not null as a warning.",
   "a": "<code>models: - name: dim_customers / columns: - name: customer_id / data_tests: [unique, not_null] - name: segment / data_tests: - accepted_values: arguments: {values: ['retail','business']} - name: email / data_tests: - not_null: config: {severity: warn}</code>"
  },
  {
   "q": "Write a singular test that fails when any order date is in the future.",
   "code": "w(\"models/staging/stg_orders.sql\", \"select id as order_id, cast(updated_at as timestamp) as updated_at from {{ ref('raw_orders') }}\")\nw(\"tests/no_future_orders.sql\", \"select * from {{ ref('stg_orders') }} where updated_at > now()\")\ndbt(\"build\")",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_orders                                 SUCCESS\ntest     no_future_orders                           PASS"
   }
  }
 ],
 "check": [
  [
   "A dbt test passes when its query returns…",
   [
    "1 row",
    "0 rows",
    "An error",
    "NULL"
   ],
   1,
   "Tests select failing rows."
  ],
  [
   "relationships test checks…",
   [
    "Uniqueness",
    "Every foreign key exists in the parent model",
    "Nulls",
    "Formats"
   ],
   1,
   "Referential integrity."
  ],
  [
   "What does dbt build do on a failing test?",
   [
    "Ignores it",
    "Skips downstream models",
    "Deletes data",
    "Retries forever"
   ],
   1,
   "Stops bad data spreading."
  ]
 ],
 "remember": [
  "unique + not_null on every primary key.",
  "accepted_values, relationships for categories and FKs.",
  "Singular SQL tests for business rules.",
  "dbt build skips downstream on failure.",
  "Severity/thresholds; descriptions + docs site."
 ]
};
L["dbt:build"] = {
 "title": "Project: a tested dbt project",
 "level": "Project",
 "one": "Build a complete small dbt project: sources → staging → an incremental fact and a dimension → a revenue mart, with tests, a snapshot for SCD Type 2 history, and one command that builds and checks everything.",
 "why": "A clean dbt repo with layers, tests and docs is one of the most convincing portfolio pieces for data/analytics engineering roles.",
 "steps": [
  {
   "h": "Plan",
   "code": "seeds        raw_orders, raw_customers (stand-ins for ingested raw tables)\nstaging      stg_orders (clean, dedupe), stg_customers                 views\nmarts        fct_orders (incremental, unique_key=order_id)             tables\n             dim_customers (lifetime value, first order)\n             mart_monthly_revenue (paid orders by month)\nsnapshot     customers_snapshot (city history, SCD2)\ntests        keys, accepted values, relationships, revenue reconciles",
   "lang": "text"
  },
  {
   "h": "Build and test it all",
   "code": "w(\"models/staging/stg_orders.sql\", \"\"\"\nselect order_id, customer_id, amount, status, updated_at from (\n  select id as order_id, cust as customer_id, amt as amount, lower(status) as status,\n         cast(updated_at as timestamp) as updated_at,\n         row_number() over (partition by id order by updated_at desc) as rn\n  from {{ ref('raw_orders') }}) where rn = 1\n\"\"\")\nw(\"models/staging/stg_customers.sql\", \"select id as customer_id, name, city from {{ ref('raw_customers') }}\")\nw(\"models/marts/fct_orders.sql\", \"\"\"\n{{ config(materialized='incremental', unique_key='order_id') }}\nselect * from {{ ref('stg_orders') }}\n{% if is_incremental() %}\nwhere updated_at > (select max(updated_at) - interval 3 day from {{ this }})\n{% endif %}\n\"\"\")\nw(\"models/marts/dim_customers.sql\", \"\"\"\nselect c.*, count(o.order_id) as paid_orders, coalesce(sum(o.amount), 0) as lifetime_value\nfrom {{ ref('stg_customers') }} c\nleft join {{ ref('fct_orders') }} o on o.customer_id = c.customer_id and o.status = 'paid'\ngroup by all\n\"\"\")\nw(\"models/marts/mart_monthly_revenue.sql\", \"\"\"\nselect strftime(updated_at, '%Y-%m') as month, count(*) as orders, sum(amount) as revenue\nfrom {{ ref('fct_orders') }} where status = 'paid' group by 1\n\"\"\")\nw(\"models/_schema.yml\", \"\"\"\nversion: 2\nmodels:\n  - name: stg_orders\n    columns:\n      - name: order_id\n        data_tests: [unique, not_null]\n      - name: status\n        data_tests:\n          - accepted_values:\n              arguments: {values: ['paid', 'refunded', 'pending']}\n  - name: fct_orders\n    columns:\n      - name: order_id\n        data_tests: [unique, not_null]\n      - name: customer_id\n        data_tests:\n          - relationships:\n              arguments: {to: ref('dim_customers'), field: customer_id}\n\"\"\")\nw(\"tests/revenue_reconciles.sql\", \"\"\"\nselect 1 from (select sum(revenue) as mart from {{ ref('mart_monthly_revenue') }}) m,\n              (select sum(amount) as src from {{ ref('stg_orders') }} where status = 'paid') s\nwhere m.mart <> s.src\n\"\"\")\ndbt(\"build\")\nquery(\"select * from mart_monthly_revenue order by month\")",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    stg_customers                              SUCCESS\nmodel    stg_orders                                 SUCCESS\ntest     accepted_values_stg_orders_status__paid__refunded__pending PASS\ntest     not_null_stg_orders_order_id               PASS\ntest     unique_stg_orders_order_id                 PASS\nmodel    fct_orders                                 SUCCESS\ntest     not_null_fct_orders_order_id               PASS\ntest     unique_fct_orders_order_id                 PASS\nmodel    dim_customers                              SUCCESS\nmodel    mart_monthly_revenue                       SUCCESS\ntest     relationships_fct_orders_customer_id__customer_id__ref_dim_customers_ PASS\ntest     revenue_reconciles                         PASS\n┌─────────┬────────┬─────────┐\n│  month  │ orders │ revenue │\n│ varchar │ int64  │ int128  │\n├─────────┼────────┼─────────┤\n│ 2025-06 │      2 │   57400 │\n│ 2025-07 │      2 │    6600 │\n└─────────┴────────┴─────────┘"
   }
  },
  {
   "h": "Snapshots: SCD Type 2 for free",
   "code": "w(\"snapshots/customers_snapshot.yml\", \"\"\"\nsnapshots:\n  - name: customers_snapshot\n    relation: ref('raw_customers')\n    config:\n      unique_key: id\n      strategy: check\n      check_cols: [city]\n\"\"\")\ndbt(\"seed\"); dbt(\"snapshot\")\nw(\"seeds/raw_customers.csv\", \"\"\"\nid,name,city\n101,Asha,Dubai\n102,Ben,Bengaluru\n103,Chen,Dubai\n\"\"\")\ndbt(\"seed\"); dbt(\"snapshot\")\nquery(\"select id, city, dbt_valid_from is not null as has_from, dbt_valid_to is null as is_current from customers_snapshot order by id, is_current\")",
   "note": "Asha's move to Dubai produced a new current row while the Kochi row was closed, exactly the SCD Type 2 pattern from the Data Modelling course, maintained by dbt.",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nsnapshot customers_snapshot                         SUCCESS\nseed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nsnapshot customers_snapshot                         SUCCESS\n┌───────┬───────────┬──────────┬────────────┐\n│  id   │   city    │ has_from │ is_current │\n│ int32 │  varchar  │ boolean  │  boolean   │\n├───────┼───────────┼──────────┼────────────┤\n│   101 │ Kochi     │ true     │ false      │\n│   101 │ Dubai     │ true     │ true       │\n│   102 │ Bengaluru │ true     │ true       │\n│   103 │ Dubai     │ true     │ true       │\n└───────┴───────────┴──────────┴────────────┘"
   }
  },
  {
   "h": "CI and portfolio",
   "p": [
    "In GitHub Actions run <code>dbt build</code> against a DuckDB file (or a CI schema in your warehouse) on every pull request; use <code>--select state:modified+</code> for speed. In the README: the lineage graph screenshot (<code>dbt docs</code>), the grain of each mart, what each test protects, and how to run it locally in one command."
   ]
  }
 ],
 "mistakes": [
  "No reconciliation test between marts and staging.",
  "Snapshots on already-transformed models instead of raw sources.",
  "Running only dbt run in CI (no tests)."
 ],
 "practice": [
  {
   "q": "Add a test that fails if mart_monthly_revenue has a month with zero orders.",
   "code": "w(\"models/marts/mart_monthly_revenue.sql\", \"select strftime(cast(updated_at as timestamp), '%Y-%m') as month, count(*) as orders from {{ ref('raw_orders') }} group by 1\")\nw(\"tests/no_empty_months.sql\", \"select * from {{ ref('mart_monthly_revenue') }} where orders = 0\")\ndbt(\"build\")",
   "out": {
    "text": "seed     raw_customers                              SUCCESS\nseed     raw_orders                                 SUCCESS\nmodel    mart_monthly_revenue                       SUCCESS\ntest     no_empty_months                            PASS"
   }
  },
  {
   "q": "Write the GitHub Actions steps to test a dbt-duckdb project on every PR.",
   "code": "name: dbt\non: [pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: {python-version: \"3.12\"}\n      - run: pip install dbt-duckdb\n      - run: dbt deps && dbt build --profiles-dir .",
   "lang": "yaml"
  }
 ],
 "check": [
  [
   "dbt snapshot implements…",
   [
    "Backups",
    "SCD Type 2 history",
    "Incremental merges",
    "Docs"
   ],
   1,
   "valid_from/valid_to tracking."
  ],
  [
   "What should CI run?",
   [
    "dbt run only",
    "dbt build (models + tests)",
    "Nothing",
    "dbt docs only"
   ],
   1,
   "Tests included."
  ],
  [
   "A reconciliation test compares…",
   [
    "Column names",
    "Mart totals with source/staging totals",
    "Run times",
    "Colours"
   ],
   1,
   "No lost or doubled money."
  ]
 ],
 "remember": [
  "Layers + incremental fact + dims + mart + tests + snapshot.",
  "dbt build runs and tests in DAG order.",
  "Reconciliation tests protect money numbers.",
  "CI on every PR; docs/lineage in the README."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
