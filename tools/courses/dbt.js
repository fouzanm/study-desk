// dbt & transformations. dbt examples really run (dbt-core + dbt-duckdb) in a temp folder.
const DBT = String.raw`
import os, pathlib, duckdb, logging
os.environ["DO_NOT_TRACK"] = "1"
logging.disable(logging.WARNING)
def w(path, text):
    p = pathlib.Path("shop") / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text.strip() + "\n")
w("dbt_project.yml", """
name: shop
version: '1.0'
profile: shop
model-paths: ['models']
seed-paths: ['seeds']
snapshot-paths: ['snapshots']
macro-paths: ['macros']
models:
  shop:
    staging: {+materialized: view}
    marts: {+materialized: table}
""")
w("profiles.yml", """
shop:
  target: dev
  outputs:
    dev: {type: duckdb, path: shop.duckdb, threads: 1}
""")
w("seeds/raw_orders.csv", """
id,cust,amt,status,updated_at
1,101,55000,PAID,2025-06-02 10:00:00
2,101,2400,paid,2025-06-15 09:00:00
3,102,9200,Refunded,2025-06-20 12:00:00
4,103,3000,paid,2025-07-01 08:30:00
5,102,3600,paid,2025-07-05 16:10:00
""")
w("seeds/raw_customers.csv", """
id,name,city
101,Asha,Kochi
102,Ben,Bengaluru
103,Chen,Dubai
""")
import subprocess, json, sys, shutil
_DBT = shutil.which("dbt") or "dbt"
def dbt(*args):
    rr = pathlib.Path("shop/target/run_results.json")
    rr.unlink(missing_ok=True)
    p = subprocess.run([_DBT, *args, "--profiles-dir", ".", "--quiet"], cwd="shop", capture_output=True, text=True)
    if rr.exists():
        for r in json.loads(rr.read_text())["results"]:
            kind, _, name = r["unique_id"].split(".", 2)
            name = name.split(".")[0]
            msg = f"  ({r['failures']} failing rows)" if r.get("failures") else ""
            print(f"{kind:8} {name:42} {r['status'].upper()}{msg}")
    if p.returncode not in (0, 1) or (p.returncode == 1 and not rr.exists()):
        print((p.stdout + p.stderr).strip()[-800:])
    return p.returncode
def query(sql):
    con = duckdb.connect("shop/shop.duckdb")
    try:
        print(con.sql(sql))
    finally:
        con.close()
`;

module.exports = [
{
 id: "elt",
 title: "ETL vs ELT and the modern data stack",
 level: "Beginner+",
 one: "<b>ETL</b> transforms data before loading it. <b>ELT</b> loads raw data into the warehouse first, then transforms it there with SQL. Cloud warehouses made ELT the default, and <b>dbt</b> is the tool most teams use for the T.",
 why: "Almost every modern data team works ELT-style with dbt. Understanding why tells you where each piece of logic goes and why SQL skills matter so much.",
 steps: [
  { h: "ETL vs ELT",
    code: `ETL (older)   source ──extract──► transform in Python/ETL tool ──load──► warehouse
              + less data stored         − raw data lost, changes need re-extracting
ELT (modern)  source ──extract──load──► warehouse (raw) ──transform with SQL──► marts
              + raw kept, re-transform any time, analysts can read/change SQL
              + warehouse compute is fast and elastic`, lang: "text" },
  { h: "The modern data stack",
    code: `ingest        Fivetran / Airbyte / dlt / custom Python   → raw tables
store         Snowflake / BigQuery / Redshift / Databricks / DuckDB / Postgres
transform     dbt (SQL + Jinja, tests, docs, lineage)    → staging → marts
orchestrate   Airflow / Dagster / dbt Cloud jobs
consume       BI (Power BI, Looker, Metabase), ML, reverse ETL back to apps
quality       dbt tests, Great Expectations, monitors`, lang: "text" },
  { h: "Why transform with SQL in the warehouse",
    p: ["The data is already there (no moving it out and back); warehouses scale compute up for big jobs; SQL is readable by analysts too; and transformations become versioned code in Git, reviewed like any software. Python still has a place: extraction, ML, complex parsing."] },
  { h: "A first transformation in the warehouse",
    pre: DBT,
    code: `w("models/staging/stg_orders.sql", """
select id as order_id, cust as customer_id, amt as amount,
       lower(status) as status, cast(updated_at as timestamp) as updated_at
from {{ ref('raw_orders') }}
""")
dbt("seed")
dbt("run")
query("select * from stg_orders order by order_id")`,
    note: "<code>dbt seed</code> loaded the CSVs as raw tables (playing the role of an ingestion tool), and <code>dbt run</code> created the staging view in DuckDB." },
  { h: "Where logic goes",
    code: `extraction (Python/tool)   pagination, auth, retries, writing raw data as-is
staging models             rename, cast, clean casing, dedupe, one model per source table
intermediate models        joins and reusable building blocks
mart models                business definitions: revenue, active customer, churn`, lang: "text" }
 ],
 mistakes: [
  "Cleaning data inside the extract script so raw data is lost.",
  "Business definitions in the BI tool (different dashboards disagree).",
  "Giant single SQL files instead of layered models.",
  "Treating SQL transformations as not real code (no Git, no review, no tests)."
 ],
 practice: [
  { q: "A team computes revenue three ways in three dashboards. How does ELT + dbt fix it?", a: "Define revenue once in a dbt mart model (e.g. fct_orders.revenue with documented rules), test it, and have every dashboard read that mart instead of computing its own. Changes then happen in one reviewed place." },
  { q: "Add a staging model for customers that upper-cases city names, then query it.", pre: DBT, code: `w("models/staging/stg_customers.sql", """
select id as customer_id, name, upper(city) as city from {{ ref('raw_customers') }}
""")
dbt("seed")
dbt("run", "--select", "stg_customers")
query("select * from stg_customers")` }
 ],
 check: [
  ["ELT means…", ["Transform before loading", "Load raw first, transform in the warehouse", "Only extract", "Streaming"], 1, "Modern default."],
  ["Main benefit of keeping raw data?", ["Pretty tables", "Re-transform any time without re-extracting", "Cheaper", "Faster dashboards"], 1, "Replay."],
  ["dbt is used for…", ["Extraction", "Transformations in SQL with tests and docs", "Dashboards", "Streaming"], 1, "The T in ELT."]
 ],
 remember: [
  "ELT: load raw, transform in the warehouse.",
  "Stack: ingest → warehouse → dbt → BI/ML, orchestrated and tested.",
  "Staging = clean per source; marts = business definitions.",
  "Transformations are code: Git, review, tests."
 ]
},
{
 id: "idempotent",
 title: "Idempotent, re-runnable transformations",
 level: "Intermediate",
 one: "A transformation is <b>idempotent</b> when running it again gives the same result. Build tables as <b>pure functions of their inputs</b> (rebuild or replace by key/partition), never as “append whatever happened since last time”.",
 why: "Jobs get retried, backfilled and re-run after bugs. Non-idempotent transforms double numbers or lose data, and these are the bugs that destroy trust in a data team.",
 steps: [
  { h: "The non-idempotent trap",
    code: `import duckdb
con = duckdb.connect()
con.execute("CREATE TABLE orders AS SELECT * FROM (VALUES (1, DATE '2025-07-05', 500), (2, DATE '2025-07-05', 900)) t(id, day, amount)")
con.execute("CREATE TABLE daily_revenue (day DATE, revenue INT)")

def bad_job(day):                       # appends every time it runs
    con.execute("INSERT INTO daily_revenue SELECT day, SUM(amount) FROM orders WHERE day = ? GROUP BY day", [day])

bad_job("2025-07-05"); bad_job("2025-07-05")       # retried after a timeout
print(con.sql("SELECT day, SUM(revenue) AS reported FROM daily_revenue GROUP BY day"))`,
    note: "The dashboard now shows 2800 instead of 1400." },
  { h: "Three idempotent patterns",
    code: `1. full rebuild        CREATE OR REPLACE TABLE x AS SELECT ...       (dbt materialized='table')
2. replace partition    DELETE WHERE day = :d; INSERT ... WHERE day = :d  in one transaction
                        (warehouses: INSERT OVERWRITE / dbt incremental 'delete+insert')
3. merge by key         MERGE INTO x USING new ON key ... UPDATE/INSERT   (dbt incremental 'merge')`, lang: "text" },
  { h: "Partition replace, running",
    code: `import duckdb
con = duckdb.connect()
con.execute("CREATE TABLE orders AS SELECT * FROM (VALUES (1, DATE '2025-07-05', 500), (2, DATE '2025-07-05', 900), (3, DATE '2025-07-06', 300)) t(id, day, amount)")
con.execute("CREATE TABLE daily_revenue (day DATE, revenue INT)")

def good_job(day):
    con.execute("BEGIN")
    con.execute("DELETE FROM daily_revenue WHERE day = ?", [day])
    con.execute("INSERT INTO daily_revenue SELECT day, SUM(amount) FROM orders WHERE day = ? GROUP BY day", [day])
    con.execute("COMMIT")

for _ in range(3):
    good_job("2025-07-05")
good_job("2025-07-06")
print(con.sql("SELECT * FROM daily_revenue ORDER BY day"))` },
  { h: "Determinism: same inputs, same output",
    p: ["Idempotent also means <b>deterministic</b>. Avoid <code>now()</code>/<code>current_date</code> inside logic (pass the run date in as a variable), random sampling without a seed, and <code>ROW_NUMBER()</code> without a complete <code>ORDER BY</code> (ties pick arbitrary rows)."],
    code: `import duckdb
con = duckdb.connect()
con.execute("""CREATE TABLE updates AS SELECT * FROM (VALUES
  (1, 'paid', TIMESTAMP '2025-07-05 10:00', 1), (1, 'refunded', TIMESTAMP '2025-07-05 10:00', 2),
  (2, 'paid', TIMESTAMP '2025-07-05 11:00', 3)) t(order_id, status, updated_at, ingest_seq)""")
print(con.sql("""
SELECT order_id, status FROM (
  SELECT *, row_number() OVER (PARTITION BY order_id ORDER BY updated_at DESC, ingest_seq DESC) AS rn
  FROM updates) WHERE rn = 1 ORDER BY order_id
"""))`,
    note: "Two updates share the same timestamp; the tie-breaker <code>ingest_seq</code> makes the latest-row choice stable on every run." },
  { h: "Backfills",
    p: ["Because each day is replaced as a unit, fixing a bug in history is simple: deploy the fix and re-run the affected days (a <b>backfill</b>). Orchestrators (Airflow) pass the logical date, so a backfill is just “run this job for each date in the range”."] }
 ],
 mistakes: [
  "INSERT-append jobs with no delete/merge.",
  "Using now() inside transformations, so reruns give different answers.",
  "ROW_NUMBER with ties for dedupe.",
  "Delete and insert in separate transactions (readers see a gap)."
 ],
 practice: [
  { q: "Make this dedupe deterministic: keep the latest row per customer_id by updated_at.", code: `import duckdb
con = duckdb.connect()
con.execute("""CREATE TABLE src AS SELECT * FROM (VALUES (101, 'Kochi', 1, 10), (101, 'Dubai', 2, 11), (102, 'Pune', 1, 12), (102, 'Goa', 1, 13)) t(customer_id, city, updated_at, _loaded_seq)""")
print(con.sql("""SELECT customer_id, city FROM src
QUALIFY row_number() OVER (PARTITION BY customer_id ORDER BY updated_at DESC, _loaded_seq DESC) = 1
ORDER BY customer_id""").fetchall())` },
  { q: "A job computes “orders in the last 7 days” using current_date. Why is that a problem for backfills, and what's the fix?", a: "Re-running it for a past day uses today's date, not that day's, so backfills compute the wrong window. Pass the run (logical) date as a variable (dbt var / Airflow {{ ds }}) and use it instead of current_date." }
 ],
 check: [
  ["Idempotent transform means…", ["Fast", "Re-running gives the same result", "Uses Python", "Streaming"], 1, "Safe retries/backfills."],
  ["Which breaks determinism?", ["GROUP BY", "now() inside the logic", "JOIN", "Views"], 1, "Pass the run date in."],
  ["Partition replace must be…", ["Two transactions", "One transaction (delete + insert)", "Without delete", "Daily only"], 1, "No gap or double data."]
 ],
 remember: [
  "Tables = pure functions of inputs.",
  "Full rebuild, partition replace, or merge by key.",
  "No now()/random/ambiguous ROW_NUMBER in logic.",
  "Run date passed in → backfills are just re-runs."
 ]
},
{
 id: "incremental",
 title: "Incremental models",
 level: "Intermediate",
 one: "For big tables, rebuild only what changed: an <b>incremental model</b> processes new/updated rows since the last run and <b>merges</b> them into the existing table, instead of recomputing years of history every time.",
 why: "Full rebuilds of billion-row tables are slow and expensive. Incremental models are how real warehouses stay fast and cheap, and getting them right (late data, merges, full refresh) is a core skill.",
 steps: [
  { h: "Incremental in dbt",
    pre: DBT,
    code: `w("models/marts/fct_orders.sql", """
{{ config(materialized='incremental', unique_key='order_id') }}
select id as order_id, cust as customer_id, amt as amount, lower(status) as status,
       cast(updated_at as timestamp) as updated_at
from {{ ref('raw_orders') }}
{% if is_incremental() %}
where cast(updated_at as timestamp) > (select max(updated_at) from {{ this }})
{% endif %}
""")
dbt("seed"); dbt("run")
query("select count(*) as rows, max(updated_at) as newest from fct_orders")

# new data arrives: order 3 is updated, order 6 is new
w("seeds/raw_orders.csv", """
id,cust,amt,status,updated_at
1,101,55000,PAID,2025-06-02 10:00:00
2,101,2400,paid,2025-06-15 09:00:00
3,102,9200,paid,2025-07-08 12:00:00
4,103,3000,paid,2025-07-01 08:30:00
5,102,3600,paid,2025-07-05 16:10:00
6,101,700,paid,2025-07-09 09:45:00
""")
dbt("seed"); dbt("run")
query("select order_id, status, updated_at from fct_orders where order_id in (3, 6) order by order_id")
query("select count(*) as rows from fct_orders")`,
    note: "The second run processed only rows newer than the table's max <code>updated_at</code>, updated order 3 in place (thanks to <code>unique_key</code>) and added order 6. No duplicates." },
  { h: "How the merge works",
    code: `first run / --full-refresh      CREATE TABLE fct_orders AS <whole query>
later runs (is_incremental())   1. run the query with the WHERE filter → new/changed rows
                                2. MERGE into fct_orders on unique_key:
                                   matched → update, not matched → insert
strategies                      merge (default on most warehouses), delete+insert,
                                append (only for immutable events), insert_overwrite (partitions)`, lang: "text" },
  { h: "Late-arriving data: use a lookback",
    p: ["Filtering strictly on <code>&gt; max(updated_at)</code> misses rows that arrive late with an older timestamp. Re-process a small window (e.g. the last 3 days) on each run; the merge on <code>unique_key</code> makes that safe."],
    code: `{% if is_incremental() %}
where updated_at > (select max(updated_at) - interval 3 day from {{ this }})
{% endif %}`, lang: "sql" },
  { h: "Full refresh",
    p: ["When the model's logic changes (a new column, a bug fix in history), rebuild from scratch: <code>dbt run --select fct_orders --full-refresh</code>. Schedule occasional full refreshes for tables where drift could accumulate."],
    pre: DBT,
    code: `w("models/marts/fct_orders.sql", """
{{ config(materialized='incremental', unique_key='order_id') }}
select id as order_id, amt as amount from {{ ref('raw_orders') }}
{% if is_incremental() %} where false {% endif %}
""")
dbt("seed"); dbt("run")
dbt("run", "--select", "fct_orders", "--full-refresh")
query("select count(*) as rows from fct_orders")` },
  { h: "When to use incremental",
    p: ["Use it when the table is big (tens of millions of rows+) or slow to rebuild, and rows have a reliable <code>updated_at</code> or event time plus a unique key. Small tables: keep them as plain <code>table</code> models; simpler is better."] }
 ],
 mistakes: [
  "Incremental without unique_key, creating duplicates when rows update.",
  "No lookback window, so late data is silently missed.",
  "Changing model logic and forgetting --full-refresh.",
  "Making every model incremental (complexity with no benefit)."
 ],
 practice: [
  { q: "Write the incremental filter for an events table (immutable events, column event_ts) with a 2-day lookback, using append-safe merge on event_id.", a: "<code>{{ config(materialized='incremental', unique_key='event_id') }} … {% if is_incremental() %} where event_ts &gt; (select max(event_ts) - interval 2 day from {{ this }}) {% endif %}</code>. The unique_key merge stops the 2-day overlap from duplicating events." },
  { q: "Your incremental table's totals slowly drift from the source over months. What are likely causes and fixes?", a: "Causes: late-arriving updates outside the lookback, deletes in the source never propagated, logic changes without full refresh. Fixes: widen the lookback, handle deletes (soft-delete flags or periodic reconciliation), schedule periodic full refreshes, and add a test comparing totals with the source." }
 ],
 check: [
  ["is_incremental() is true when…", ["Always", "The table exists and it's not a full refresh", "First run", "Never"], 1, "Then the filter applies."],
  ["unique_key does what?", ["Indexes", "Lets dbt merge updated rows instead of duplicating", "Sorts", "Partitions"], 1, "Merge key."],
  ["Late-arriving data fix?", ["Ignore", "Lookback window + merge", "Full refresh hourly", "Delete late rows"], 1, "Safe overlap."]
 ],
 remember: [
  "materialized='incremental' + unique_key + is_incremental() filter.",
  "Merge updates in place; append only for immutable events.",
  "Lookback window for late data.",
  "--full-refresh after logic changes.",
  "Only for big/slow tables."
 ]
},
{
 id: "dbt-basics",
 title: "dbt basics: models, ref, sources and layers",
 level: "Intermediate",
 one: "A dbt project is a folder of SQL <b>models</b> (SELECT statements). <code>ref()</code> links models so dbt knows the build order (the <b>DAG</b>), materialisations decide view vs table, and Jinja macros remove repetition.",
 why: "dbt is in most data engineering and analytics engineering job posts. Knowing its building blocks lets you work in any team's project on day one.",
 steps: [
  { h: "Project layout",
    code: `shop/
  dbt_project.yml          project name, folders, default materialisations
  profiles.yml             connection (usually ~/.dbt/profiles.yml, not in Git)
  models/
    staging/  stg_orders.sql, stg_customers.sql, _sources.yml, _schema.yml
    intermediate/ int_orders_enriched.sql
    marts/    fct_orders.sql, dim_customers.sql, _schema.yml
  seeds/      small CSVs (country codes, mappings)
  snapshots/  SCD Type 2 history
  macros/     reusable Jinja
  tests/      custom SQL tests`, lang: "text" },
  { h: "Models and ref() build a DAG",
    pre: DBT,
    code: `w("models/staging/stg_orders.sql", """
select id as order_id, cust as customer_id, amt as amount, lower(status) as status,
       cast(updated_at as timestamp) as ordered_at
from {{ ref('raw_orders') }}
""")
w("models/staging/stg_customers.sql", """
select id as customer_id, name, city from {{ ref('raw_customers') }}
""")
w("models/marts/dim_customers.sql", """
select c.customer_id, c.name, c.city,
       count(o.order_id) as orders, coalesce(sum(o.amount), 0) as lifetime_value,
       min(o.ordered_at) as first_order_at
from {{ ref('stg_customers') }} c
left join {{ ref('stg_orders') }} o on o.customer_id = c.customer_id and o.status = 'paid'
group by all
""")
dbt("build")
query("select * from dim_customers order by lifetime_value desc")`,
    note: "dbt worked out the order from the <code>ref()</code> calls: seeds → staging → marts. Staging became views and marts tables, as set in dbt_project.yml." },
  { h: "Selecting parts of the DAG",
    code: `dbt build                                  everything: seeds, models, snapshots, tests
dbt run --select stg_orders                one model
dbt run --select stg_orders+               it and everything downstream
dbt run --select +dim_customers            it and everything upstream
dbt run --select staging                   a folder
dbt build --select state:modified+         only what changed in this PR (CI)
dbt docs generate && dbt docs serve        documentation site with lineage graph`, lang: "text" },
  { h: "Sources",
    p: ["Raw tables loaded by ingestion tools are declared as <b>sources</b> in YAML and referenced with <code>{{ source('shop', 'orders') }}</code>. This documents where data comes from, enables freshness checks, and shows raw tables in the lineage graph."],
    code: `# models/staging/_sources.yml
version: 2
sources:
  - name: shop
    schema: raw
    loaded_at_field: _loaded_at
    freshness:
      warn_after: {count: 6, period: hour}
      error_after: {count: 24, period: hour}
    tables:
      - name: orders
      - name: customers

-- models/staging/stg_orders.sql
select id as order_id, ... from {{ source('shop', 'orders') }}`, lang: "yaml" },
  { h: "Jinja macros",
    pre: DBT,
    code: `w("macros/cents_to_rupees.sql", """
{% macro paise_to_rupees(col) %} round({{ col }} / 100.0, 2) {% endmacro %}
""")
w("models/staging/stg_payments.sql", """
{% set methods = ['upi', 'card', 'cash'] %}
select 1 as payment_id, {{ paise_to_rupees('125050') }} as amount_rupees,
  {% for m in methods %} {{ loop.index }} as {{ m }}_rank{% if not loop.last %},{% endif %} {% endfor %}
""")
dbt("run", "--select", "stg_payments")
query("select * from stg_payments")` }
 ],
 mistakes: [
  "Hardcoding table names instead of ref()/source() (dbt can't build the DAG).",
  "Putting business logic in staging models.",
  "profiles.yml with passwords committed to Git.",
  "Over-using Jinja until SQL is unreadable."
 ],
 practice: [
  { q: "Build a mart of revenue by city using ref() to staging models.", pre: DBT, code: `w("models/staging/stg_orders.sql", "select id as order_id, cust as customer_id, amt as amount, lower(status) as status from {{ ref('raw_orders') }}")
w("models/staging/stg_customers.sql", "select id as customer_id, city from {{ ref('raw_customers') }}")
w("models/marts/revenue_by_city.sql", """
select c.city, sum(o.amount) as revenue
from {{ ref('stg_orders') }} o join {{ ref('stg_customers') }} c using (customer_id)
where o.status = 'paid' group by c.city
""")
dbt("build")
query("select * from revenue_by_city order by revenue desc")` },
  { q: "You changed stg_orders. What command rebuilds it and everything that depends on it, with tests?", a: "<code>dbt build --select stg_orders+</code>" }
 ],
 check: [
  ["What does ref() give you?", ["A comment", "Dependencies, build order and environment-aware table names", "Speed only", "Tests"], 1, "The DAG."],
  ["Staging models are usually…", ["Tables with business logic", "Views that clean one source table", "Snapshots", "Seeds"], 1, "Thin cleanup layer."],
  ["Select a model and everything downstream?", ["+model", "model+", "model*", "-model"], 1, "Plus after = downstream."]
 ],
 remember: [
  "Models are SELECTs; ref()/source() build the DAG.",
  "staging (views) → intermediate → marts (tables).",
  "Selectors: model+, +model, folder, state:modified+.",
  "Sources document raw tables and freshness.",
  "Macros for repetition, used sparingly."
 ]
},
{
 id: "dbt-tests",
 title: "Testing and documenting with dbt",
 level: "Intermediate",
 one: "dbt tests are SQL queries that return <b>failing rows</b>. Declare generic tests (unique, not_null, accepted_values, relationships) in YAML, write custom SQL tests for business rules, and <code>dbt build</code> stops downstream models when tests fail.",
 why: "Tests are what make data trustworthy. Teams that test catch broken data before executives see it on a dashboard. Interviewers ask “how do you ensure data quality in your pipelines?”.",
 steps: [
  { h: "Generic tests in YAML",
    pre: DBT,
    code: `w("models/staging/stg_orders.sql", """
select id as order_id, cust as customer_id, amt as amount, lower(status) as status
from {{ ref('raw_orders') }}
""")
w("models/staging/stg_customers.sql", "select id as customer_id, name, city from {{ ref('raw_customers') }}")
w("models/staging/_schema.yml", """
version: 2
models:
  - name: stg_orders
    columns:
      - name: order_id
        data_tests: [unique, not_null]
      - name: status
        data_tests:
          - accepted_values:
              arguments: {values: ['paid', 'refunded', 'pending']}
      - name: customer_id
        data_tests:
          - relationships:
              arguments: {to: ref('stg_customers'), field: customer_id}
""")
dbt("build")`,
    note: "Each test is compiled to a SELECT that returns bad rows; zero rows means PASS." },
  { h: "When a test fails",
    p: ["New raw data arrives with a duplicate order and an unknown customer. Watch dbt catch both:"],
    pre: DBT,
    code: `w("seeds/raw_orders.csv", """
id,cust,amt,status,updated_at
1,101,55000,paid,2025-06-02 10:00:00
1,101,55000,paid,2025-06-02 10:00:00
2,999,2400,paid,2025-06-15 09:00:00
""")
w("models/staging/stg_orders.sql", "select id as order_id, cust as customer_id, amt as amount from {{ ref('raw_orders') }}")
w("models/staging/stg_customers.sql", "select id as customer_id from {{ ref('raw_customers') }}")
w("models/marts/fct_orders.sql", "select * from {{ ref('stg_orders') }}")
w("models/staging/_schema.yml", """
version: 2
models:
  - name: stg_orders
    columns:
      - name: order_id
        data_tests: [unique]
      - name: customer_id
        data_tests:
          - relationships:
              arguments: {to: ref('stg_customers'), field: customer_id}
""")
dbt("build")`,
    note: "fct_orders was SKIPPED: dbt build doesn't build downstream models on top of failing data." },
  { h: "Custom (singular) tests for business rules",
    pre: DBT,
    code: `w("models/staging/stg_orders.sql", "select id as order_id, amt as amount, lower(status) as status from {{ ref('raw_orders') }}")
w("tests/no_negative_or_huge_amounts.sql", """
-- returns the bad rows; the test fails if any come back
select * from {{ ref('stg_orders') }}
where amount < 0 or amount > 1000000
""")
w("tests/refunds_less_than_10_percent.sql", """
select 1 from {{ ref('stg_orders') }}
having sum(case when status = 'refunded' then amount else 0 end) > 0.1 * sum(amount)
""")
dbt("build")`,
    note: "The refunds rule fails on this sample data (9,200 refunded out of 73,200). That's the point: a business expectation broke, and someone should look before the numbers go out." },
  { h: "Severity, thresholds and packages",
    code: `- name: email
  data_tests:
    - not_null:
        config:
          severity: warn                 # warn instead of failing the run
          error_if: ">100"               # fail only above 100 bad rows
          warn_if: ">0"

packages (packages.yml → dbt deps)
  dbt_utils            unique_combination_of_columns, expression_is_true, recency
  dbt_expectations     ranges, regex, row counts, distributions
  elementary           anomaly detection + data observability reports`, lang: "yaml" },
  { h: "Documentation",
    p: ["Add <code>description:</code> to models and columns in the same YAML. <code>dbt docs generate</code> builds a site with every model, column, test and an interactive lineage graph, so “where does this number come from?” has an answer."],
    code: `models:
  - name: fct_orders
    description: "One row per order. Revenue excludes refunds and test orders."
    columns:
      - name: revenue
        description: "Order total in INR after discounts, before tax."`, lang: "yaml" }
 ],
 mistakes: [
  "No tests on primary keys (unique + not_null is the minimum).",
  "Tests that always warn, so everyone ignores them.",
  "Testing only staging, never business rules in marts.",
  "No descriptions, so nobody knows what a column means."
 ],
 practice: [
  { q: "Write the YAML tests for dim_customers: customer_id unique/not null, segment in (retail, business), email not null as a warning.", a: "<code>models: - name: dim_customers / columns: - name: customer_id / data_tests: [unique, not_null] - name: segment / data_tests: - accepted_values: arguments: {values: ['retail','business']} - name: email / data_tests: - not_null: config: {severity: warn}</code>" },
  { q: "Write a singular test that fails when any order date is in the future.", pre: DBT, code: `w("models/staging/stg_orders.sql", "select id as order_id, cast(updated_at as timestamp) as updated_at from {{ ref('raw_orders') }}")
w("tests/no_future_orders.sql", "select * from {{ ref('stg_orders') }} where updated_at > now()")
dbt("build")` }
 ],
 check: [
  ["A dbt test passes when its query returns…", ["1 row", "0 rows", "An error", "NULL"], 1, "Tests select failing rows."],
  ["relationships test checks…", ["Uniqueness", "Every foreign key exists in the parent model", "Nulls", "Formats"], 1, "Referential integrity."],
  ["What does dbt build do on a failing test?", ["Ignores it", "Skips downstream models", "Deletes data", "Retries forever"], 1, "Stops bad data spreading."]
 ],
 remember: [
  "unique + not_null on every primary key.",
  "accepted_values, relationships for categories and FKs.",
  "Singular SQL tests for business rules.",
  "dbt build skips downstream on failure.",
  "Severity/thresholds; descriptions + docs site."
 ]
},
{
 id: "build",
 title: "Project: a tested dbt project",
 level: "Project",
 one: "Build a complete small dbt project: sources → staging → an incremental fact and a dimension → a revenue mart, with tests, a snapshot for SCD Type 2 history, and one command that builds and checks everything.",
 why: "A clean dbt repo with layers, tests and docs is one of the most convincing portfolio pieces for data/analytics engineering roles.",
 steps: [
  { h: "Plan",
    code: `seeds        raw_orders, raw_customers (stand-ins for ingested raw tables)
staging      stg_orders (clean, dedupe), stg_customers                 views
marts        fct_orders (incremental, unique_key=order_id)             tables
             dim_customers (lifetime value, first order)
             mart_monthly_revenue (paid orders by month)
snapshot     customers_snapshot (city history, SCD2)
tests        keys, accepted values, relationships, revenue reconciles`, lang: "text" },
  { h: "Build and test it all",
    pre: DBT,
    code: `w("models/staging/stg_orders.sql", """
select order_id, customer_id, amount, status, updated_at from (
  select id as order_id, cust as customer_id, amt as amount, lower(status) as status,
         cast(updated_at as timestamp) as updated_at,
         row_number() over (partition by id order by updated_at desc) as rn
  from {{ ref('raw_orders') }}) where rn = 1
""")
w("models/staging/stg_customers.sql", "select id as customer_id, name, city from {{ ref('raw_customers') }}")
w("models/marts/fct_orders.sql", """
{{ config(materialized='incremental', unique_key='order_id') }}
select * from {{ ref('stg_orders') }}
{% if is_incremental() %}
where updated_at > (select max(updated_at) - interval 3 day from {{ this }})
{% endif %}
""")
w("models/marts/dim_customers.sql", """
select c.*, count(o.order_id) as paid_orders, coalesce(sum(o.amount), 0) as lifetime_value
from {{ ref('stg_customers') }} c
left join {{ ref('fct_orders') }} o on o.customer_id = c.customer_id and o.status = 'paid'
group by all
""")
w("models/marts/mart_monthly_revenue.sql", """
select strftime(updated_at, '%Y-%m') as month, count(*) as orders, sum(amount) as revenue
from {{ ref('fct_orders') }} where status = 'paid' group by 1
""")
w("models/_schema.yml", """
version: 2
models:
  - name: stg_orders
    columns:
      - name: order_id
        data_tests: [unique, not_null]
      - name: status
        data_tests:
          - accepted_values:
              arguments: {values: ['paid', 'refunded', 'pending']}
  - name: fct_orders
    columns:
      - name: order_id
        data_tests: [unique, not_null]
      - name: customer_id
        data_tests:
          - relationships:
              arguments: {to: ref('dim_customers'), field: customer_id}
""")
w("tests/revenue_reconciles.sql", """
select 1 from (select sum(revenue) as mart from {{ ref('mart_monthly_revenue') }}) m,
              (select sum(amount) as src from {{ ref('stg_orders') }} where status = 'paid') s
where m.mart <> s.src
""")
dbt("build")
query("select * from mart_monthly_revenue order by month")` },
  { h: "Snapshots: SCD Type 2 for free",
    pre: DBT,
    code: `w("snapshots/customers_snapshot.yml", """
snapshots:
  - name: customers_snapshot
    relation: ref('raw_customers')
    config:
      unique_key: id
      strategy: check
      check_cols: [city]
""")
dbt("seed"); dbt("snapshot")
w("seeds/raw_customers.csv", """
id,name,city
101,Asha,Dubai
102,Ben,Bengaluru
103,Chen,Dubai
""")
dbt("seed"); dbt("snapshot")
query("select id, city, dbt_valid_from is not null as has_from, dbt_valid_to is null as is_current from customers_snapshot order by id, is_current")`,
    note: "Asha's move to Dubai produced a new current row while the Kochi row was closed, exactly the SCD Type 2 pattern from the Data Modelling course, maintained by dbt." },
  { h: "CI and portfolio",
    p: ["In GitHub Actions run <code>dbt build</code> against a DuckDB file (or a CI schema in your warehouse) on every pull request; use <code>--select state:modified+</code> for speed. In the README: the lineage graph screenshot (<code>dbt docs</code>), the grain of each mart, what each test protects, and how to run it locally in one command."] }
 ],
 mistakes: [
  "No reconciliation test between marts and staging.",
  "Snapshots on already-transformed models instead of raw sources.",
  "Running only dbt run in CI (no tests)."
 ],
 practice: [
  { q: "Add a test that fails if mart_monthly_revenue has a month with zero orders.", pre: DBT, code: `w("models/marts/mart_monthly_revenue.sql", "select strftime(cast(updated_at as timestamp), '%Y-%m') as month, count(*) as orders from {{ ref('raw_orders') }} group by 1")
w("tests/no_empty_months.sql", "select * from {{ ref('mart_monthly_revenue') }} where orders = 0")
dbt("build")` },
  { q: "Write the GitHub Actions steps to test a dbt-duckdb project on every PR.", code: `name: dbt
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: pip install dbt-duckdb
      - run: dbt deps && dbt build --profiles-dir .`, lang: "yaml" }
 ],
 check: [
  ["dbt snapshot implements…", ["Backups", "SCD Type 2 history", "Incremental merges", "Docs"], 1, "valid_from/valid_to tracking."],
  ["What should CI run?", ["dbt run only", "dbt build (models + tests)", "Nothing", "dbt docs only"], 1, "Tests included."],
  ["A reconciliation test compares…", ["Column names", "Mart totals with source/staging totals", "Run times", "Colours"], 1, "No lost or doubled money."]
 ],
 remember: [
  "Layers + incremental fact + dims + mart + tests + snapshot.",
  "dbt build runs and tests in DAG order.",
  "Reconciliation tests protect money numbers.",
  "CI on every PR; docs/lineage in the README."
 ]
}
];
