// Project: Data Pipeline. API → lake (raw files) → warehouse (DuckDB here; Snowflake/BigQuery/Postgres in production)
// → dbt (really runs) → dashboard. Everything runs offline in a temp folder.
const PIPE = String.raw`
import os, json, pathlib, subprocess, shutil, logging, duckdb
os.environ["DO_NOT_TRACK"] = "1"; logging.disable(logging.WARNING)

def w(path, text):
    p = pathlib.Path(path); p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text.strip() + "\n")

# ---- the "shop API": orders per day (stand-in for an HTTP API) ----
API = {
    "2025-07-04": [{"id": 1, "customer": "asha", "city": "Kochi", "amount": 55000, "status": "paid", "updated_at": "2025-07-04T10:00:00"},
                   {"id": 2, "customer": "ben", "city": "Bengaluru", "amount": 9200, "status": "paid", "updated_at": "2025-07-04T12:30:00"}],
    "2025-07-05": [{"id": 3, "customer": "chen", "city": "Dubai", "amount": 3000, "status": "paid", "updated_at": "2025-07-05T09:15:00"},
                   {"id": 4, "customer": "asha", "city": "Kochi", "amount": 2400, "status": "refunded", "updated_at": "2025-07-05T18:00:00"}],
}

def extract(day):                                      # API → lake/raw/orders/dt=day/orders.jsonl (replace the day)
    out = pathlib.Path(f"lake/raw/orders/dt={day}"); out.mkdir(parents=True, exist_ok=True)
    rows = API.get(day, [])
    (out / "orders.jsonl").write_text("\n".join(json.dumps(r) for r in rows))
    return len(rows)

def load_raw():                                        # lake → warehouse raw schema (full reload of raw files)
    con = duckdb.connect("warehouse.duckdb")
    con.execute("CREATE SCHEMA IF NOT EXISTS raw")
    con.execute("""CREATE OR REPLACE TABLE raw.orders AS
                   SELECT *, filename AS _file FROM read_json_auto('lake/raw/orders/*/*.jsonl', filename = true,
                   columns = {'id': 'INT', 'customer': 'VARCHAR', 'city': 'VARCHAR', 'amount': 'INT',
                              'status': 'VARCHAR', 'updated_at': 'TIMESTAMP'})""")
    n = con.sql("SELECT COUNT(*) FROM raw.orders").fetchall()[0][0]
    con.close()
    return n

# ---- dbt project ----
w("dbt/dbt_project.yml", """
name: shop
version: '1.0'
profile: shop
models:
  shop:
    staging: {+materialized: view}
    marts: {+materialized: table}
""")
w("dbt/profiles.yml", """
shop:
  target: dev
  outputs:
    dev: {type: duckdb, path: ../warehouse.duckdb, threads: 1}
""")
w("dbt/models/staging/_sources.yml", """
version: 2
sources:
  - name: raw
    schema: raw
    tables: [{name: orders}]
""")
w("dbt/models/staging/stg_orders.sql", """
select id as order_id, customer, city, amount, lower(status) as status, updated_at,
       cast(updated_at as date) as order_date
from {{ source('raw', 'orders') }}
qualify row_number() over (partition by id order by updated_at desc, _file desc) = 1
""")
w("dbt/models/marts/fct_daily_revenue.sql", """
select order_date, city, count(*) as orders, sum(amount) as revenue
from {{ ref('stg_orders') }} where status = 'paid'
group by all
""")
w("dbt/models/_schema.yml", """
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
  - name: fct_daily_revenue
    columns:
      - name: revenue
        data_tests: [not_null]
""")
_DBT = shutil.which("dbt") or "dbt"
def dbt(*args, show=True):
    rr = pathlib.Path("dbt/target/run_results.json"); rr.unlink(missing_ok=True)
    p = subprocess.run([_DBT, *args, "--profiles-dir", ".", "--quiet"], cwd="dbt", capture_output=True, text=True)
    results = json.loads(rr.read_text())["results"] if rr.exists() else []
    if show:
        for r in results:
            kind, _, name = r["unique_id"].split(".", 2)
            extra = f"  ({r['failures']} failing rows)" if r.get("failures") else ""
            print(f"{kind:6} {name.split('.')[0]:58} {r['status'].upper()}{extra}")
    if not results:
        print((p.stdout + p.stderr).strip()[-600:])
    return p.returncode == 0

def query(sql):
    con = duckdb.connect("warehouse.duckdb")
    try:
        return con.sql(sql).fetchall()
    finally:
        con.close()
`;

module.exports = [
{
 id: "git-ci",
 title: "Git workflow and CI for data",
 level: "Project",
 one: "Treat the pipeline like software: one repo for extract code, dbt models, orchestration and infra; <b>pull requests</b> for every change; and <b>CI</b> that lints, unit-tests the Python, and runs <b>dbt build</b> on sample data so broken SQL never reaches production.",
 why: "Data teams hire engineers who ship reliable changes. A repo with a clean structure and green CI is the first thing a reviewer of your portfolio project will notice.",
 steps: [
  { h: "The project you're shipping",
    code: `shop API ──extract (Python)──► lake: raw/orders/dt=YYYY-MM-DD/*.jsonl  (S3 in production)
                                      │ load_raw
                                      ▼
                         warehouse raw.orders  (DuckDB locally; Snowflake/BigQuery/Postgres in prod)
                                      │ dbt build (staging → marts, with tests)
                                      ▼
                         marts.fct_daily_revenue ──► dashboard (Metabase / Streamlit)
orchestration: Airflow DAG per day · CI: lint + pytest + dbt build on sample data · docs: README + runbook`, lang: "text" },
  { h: "Repo layout",
    code: `shop-pipeline/
  README.md  RUNBOOK.md  Makefile  docker-compose.yml  .env.example
  pipeline/            extract.py, load.py, config.py      (Python package)
  dbt/                 dbt_project.yml, models/{staging,marts}, seeds/ (sample data for CI), tests/
  dags/                shop_daily.py                       (Airflow)
  dashboard/           app.py (Streamlit) or metabase/ exports
  infra/               terraform for bucket, roles, warehouse
  tests/               test_extract.py, test_load.py
  .github/workflows/ci.yml`, lang: "text" },
  { h: "Branching and pull requests",
    code: `git switch -c feat/add-city-to-revenue
# edit dbt/models/marts/fct_daily_revenue.sql, add a test
make lint test dbt-build            # same checks CI runs
git commit -m "Add city to daily revenue mart"
git push -u origin feat/add-city-to-revenue
gh pr create --fill                 # CI runs; a teammate reviews SQL + test changes; squash-merge to main`, lang: "bash" },
  { h: "What CI runs, for real",
    pre: PIPE,
    code: `for day in ["2025-07-04", "2025-07-05"]:
    extract(day)
print("raw rows loaded:", load_raw())
ok = dbt("build")
print("CI", "PASSED" if ok else "FAILED")`,
    note: "This is the same <code>dbt build</code> CI runs: models are created on a throwaway DuckDB warehouse and every test runs. A typo in SQL or a broken test fails the pull request." },
  { h: "The CI workflow",
    code: `name: ci
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12", cache: pip}
      - run: pip install -e ".[dev]" dbt-duckdb
      - run: ruff check pipeline tests && sqlfluff lint dbt/models --dialect duckdb
      - run: pytest -q
      - name: dbt build on sample data
        run: |
          python -m pipeline.load --sample          # loads dbt/seeds sample files into raw.*
          cd dbt && dbt build --profiles-dir ci --target ci
  # main branch only: deploy DAGs + dbt docs (see "ship")`, lang: "yaml" }
 ],
 mistakes: [
  "SQL changes merged without running dbt in CI.",
  "CI that needs production credentials (use sample data and DuckDB).",
  "One giant commit per week instead of small reviewed PRs.",
  "Secrets in the repo (.env committed)."
 ],
 practice: [
  { q: "Break the SQL on purpose (reference a column that doesn't exist) and watch CI fail.", pre: PIPE, code: `extract("2025-07-04"); load_raw()
w("dbt/models/marts/fct_daily_revenue.sql", "select order_date, sum(amount_inr) as revenue from {{ ref('stg_orders') }} group by 1")
print("CI", "PASSED" if dbt("build", show=False) else "FAILED (good: the broken model was caught)")` },
  { q: "Write the Makefile targets that mirror CI so developers run the same checks locally.", code: `lint:
	ruff check pipeline tests && sqlfluff lint dbt/models --dialect duckdb
test:
	pytest -q
dbt-build:
	python -m pipeline.load --sample && cd dbt && dbt build --profiles-dir ci --target ci
ci: lint test dbt-build`, lang: "makefile" }
 ],
 check: [
  ["Why run dbt build in CI?", ["Speed", "Catch broken SQL and failing data tests before merge", "Required by GitHub", "Docs only"], 1, "Shift left."],
  ["What data should CI use?", ["Production", "Small sample data on a throwaway warehouse (DuckDB)", "None", "Random"], 1, "Fast and safe."],
  ["How do changes reach main?", ["Direct push", "Pull request with green CI and review", "Email", "FTP"], 1, "Reviewed changes."]
 ],
 remember: [
  "One repo: pipeline code, dbt, DAGs, dashboard, infra.",
  "Small PRs; CI = lint + pytest + dbt build on sample data.",
  "Make targets mirror CI locally.",
  "No prod credentials or secrets in CI/Git."
 ]
},
{
 id: "docker",
 title: "Docker-ize the stack",
 level: "Project",
 one: "Package the pipeline as a <b>Docker image</b> and run the whole stack locally with <b>Docker Compose</b>: warehouse (Postgres or DuckDB), object storage (MinIO as local S3), Airflow and the dashboard, configured entirely by <b>environment variables</b>.",
 why: "“Clone, docker compose up, open localhost” is what makes a portfolio project easy to evaluate, and it's how teams make pipelines run the same on every laptop and in production.",
 steps: [
  { h: "One config, many environments",
    code: `import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Config:
    env: str
    lake_uri: str
    warehouse_url: str
    api_base: str

def load_config() -> Config:
    env = os.environ.get("PIPELINE_ENV", "local")
    defaults = {"local": ("file://./lake", "duckdb:///warehouse.duckdb"),
                "prod": ("s3://acme-shop-lake", "snowflake://...")}[env]
    return Config(env=env,
                  lake_uri=os.environ.get("LAKE_URI", defaults[0]),
                  warehouse_url=os.environ.get("WAREHOUSE_URL", defaults[1]),
                  api_base=os.environ.get("SHOP_API_BASE", "https://api.example-shop.com"))

print(load_config())
os.environ.update(PIPELINE_ENV="prod", WAREHOUSE_URL="snowflake://acct/ANALYTICS")
print(load_config())`,
    note: "Code never checks “am I on a laptop?”. The same image runs everywhere; only environment variables change." },
  { h: "The pipeline image",
    code: `FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv pip install --system -r pyproject.toml
COPY pipeline/ pipeline/
COPY dbt/ dbt/
ENV PYTHONUNBUFFERED=1 DO_NOT_TRACK=1
RUN cd dbt && dbt deps
USER nobody
ENTRYPOINT ["python", "-m", "pipeline"]          # e.g. docker run shop-pipeline run --date 2025-07-05`, lang: "dockerfile" },
  { h: "Docker Compose: the local stack",
    code: `services:
  minio:                                  # local S3
    image: minio/minio
    command: server /data --console-address ":9001"
    environment: {MINIO_ROOT_USER: minio, MINIO_ROOT_PASSWORD: minio12345}
    ports: ["9000:9000", "9001:9001"]
  warehouse:
    image: postgres:16
    environment: {POSTGRES_USER: wh, POSTGRES_PASSWORD: wh, POSTGRES_DB: analytics}
    ports: ["5433:5432"]
  pipeline:
    build: .
    env_file: .env                        # LAKE_URI=s3://lake (MinIO), WAREHOUSE_URL=postgresql://wh:wh@warehouse/analytics
    depends_on: [minio, warehouse]
    profiles: ["manual"]                  # run on demand: docker compose run pipeline run --date 2025-07-05
  airflow:
    image: apache/airflow:3.1.0
    command: standalone
    volumes: ["./dags:/opt/airflow/dags"]
    ports: ["8080:8080"]
  metabase:
    image: metabase/metabase
    ports: ["3000:3000"]
    depends_on: [warehouse]`, lang: "yaml" },
  { h: "Running it",
    code: `cp .env.example .env
docker compose up -d minio warehouse airflow metabase
docker compose run --rm pipeline run --date 2025-07-05
docker compose ps`, lang: "bash",
    out: { text: "extracted 2 orders for 2025-07-05 -> s3://lake/raw/orders/dt=2025-07-05/\nloaded raw.orders (4 rows)\ndbt build: 2 models, 4 tests passed\n\nNAME          STATUS\nminio-1       Up\nwarehouse-1   Up\nairflow-1     Up (healthy)\nmetabase-1    Up", hand: true } }
 ],
 mistakes: [
  "Hard-coded paths and credentials in code.",
  "Images that run as root.",
  "“Works on my machine” setups that need ten manual steps.",
  "Building a new image per environment instead of one image + env vars."
 ],
 practice: [
  { q: "Write the .env.example for the local stack (no real secrets).", code: `PIPELINE_ENV=local
LAKE_URI=s3://lake
AWS_ENDPOINT_URL=http://minio:9000
AWS_ACCESS_KEY_ID=minio
AWS_SECRET_ACCESS_KEY=minio12345
WAREHOUSE_URL=postgresql://wh:wh@warehouse:5432/analytics
SHOP_API_BASE=https://api.example-shop.com
SHOP_API_TOKEN=`, lang: "bash" },
  { q: "Why use MinIO locally instead of a real S3 bucket?", a: "It speaks the S3 API, so the same boto3/fsspec code works unchanged by switching AWS_ENDPOINT_URL; it's free, offline, and reviewers can run the project without an AWS account or credentials." }
 ],
 check: [
  ["Best way to handle dev vs prod?", ["Different code", "Same image, different environment variables", "Comments", "Separate repos"], 1, "12-factor config."],
  ["MinIO gives you…", ["A database", "S3-compatible storage locally", "Airflow", "Dashboards"], 1, "Local S3."],
  ["Why USER nobody in the Dockerfile?", ["Speed", "Don't run as root", "Required", "Smaller image"], 1, "Least privilege."]
 ],
 remember: [
  "One image, config by env vars.",
  "Compose: MinIO (S3), warehouse, Airflow, dashboard.",
  "docker compose run pipeline run --date …",
  "No secrets in images; non-root user."
 ]
},
{
 id: "dashboard",
 title: "Serve: a dashboard on your marts",
 level: "Project",
 one: "The pipeline exists so people can make decisions. Build a small dashboard on the <b>marts</b> (never raw tables): a few <b>well-defined KPIs</b>, a trend, a breakdown, and a freshness note, using Metabase/Superset or a Streamlit app.",
 why: "A dashboard turns your pipeline into something a non-engineer understands in 10 seconds, which is exactly what portfolio reviewers and clients need to see.",
 steps: [
  { h: "Define the KPIs first",
    code: `KPI                 definition (lives in dbt, documented)              source
revenue             sum(amount) of paid orders, INR                    fct_daily_revenue
orders              count of paid orders                               fct_daily_revenue
avg order value     revenue / orders (computed, never averaged)        fct_daily_revenue
refund rate         refunded orders / all orders                       stg_orders
freshness           max(updated_at) loaded                             stg_orders`, lang: "text" },
  { h: "The dashboard queries",
    pre: PIPE,
    code: `for day in ["2025-07-04", "2025-07-05"]:
    extract(day)
load_raw(); dbt("build", show=False)

kpis = query("""select sum(revenue) as revenue, sum(orders) as orders, round(sum(revenue) / sum(orders)) as aov
                from main.fct_daily_revenue""")[0]
refund_rate = query("select round(avg((status = 'refunded')::int), 2) from main.stg_orders")[0][0]
freshness = query("select max(updated_at) from main.stg_orders")[0][0]
print(f"Revenue ₹{kpis[0]:,} · Orders {kpis[1]} · AOV ₹{kpis[2]:,.0f} · Refund rate {refund_rate:.0%}")
print("by day:", query("select cast(order_date as varchar), sum(revenue) from main.fct_daily_revenue group by 1 order by 1"))
print("by city:", query("select city, sum(revenue) as r from main.fct_daily_revenue group by 1 order by r desc"))
print("data as of:", freshness)`,
    note: "Average order value is computed from totals (revenue ÷ orders), not by averaging daily averages." },
  { h: "A Streamlit dashboard",
    code: `# dashboard/app.py   (streamlit run dashboard/app.py)
import duckdb, streamlit as st

con = duckdb.connect("warehouse.duckdb", read_only=True)
st.set_page_config(page_title="Shop revenue", layout="wide")
st.title("Shop revenue")

days = st.slider("Last N days", 7, 90, 30)
k = con.sql(f"""select sum(revenue), sum(orders) from fct_daily_revenue
                where order_date >= current_date - {int(days)}""").fetchone()
c1, c2, c3 = st.columns(3)
c1.metric("Revenue", f"₹{k[0] or 0:,.0f}")
c2.metric("Orders", k[1] or 0)
c3.metric("Avg order value", f"₹{(k[0] or 0) / max(k[1] or 1, 1):,.0f}")

st.line_chart(con.sql("select order_date, sum(revenue) as revenue from fct_daily_revenue group by 1 order by 1").df(),
              x="order_date", y="revenue")
st.bar_chart(con.sql("select city, sum(revenue) as revenue from fct_daily_revenue group by 1").df(), x="city", y="revenue")
st.caption(f"Data as of {con.sql('select max(updated_at) from stg_orders').fetchone()[0]} · source: marts.fct_daily_revenue")`, lang: "python", run: false },
  { h: "Metabase/Superset instead",
    p: ["For business users, a BI tool is often better: point Metabase at the warehouse, give it read access to the <b>marts</b> schema only, build questions on <code>fct_daily_revenue</code>, and arrange them in a dashboard with a date filter. Export the dashboard definition (or screenshots) into the repo so reviewers can see it."] },
  { h: "Dashboard design rules",
    code: `top row     3-5 KPIs with comparison to previous period
middle      one trend over time (line), one breakdown (bar)
bottom      a detail table for drill-down
always      a "data as of" timestamp and the source table
never       raw/staging tables, pie charts with 12 slices, metrics without definitions`, lang: "text" }
 ],
 mistakes: [
  "Dashboards on raw tables with their own business logic.",
  "Averaging averages for AOV or rates.",
  "No freshness indicator, so stale data looks current.",
  "Twenty charts nobody reads."
 ],
 practice: [
  { q: "Add a KPI: share of revenue from Kochi.", pre: PIPE, code: `for day in ["2025-07-04", "2025-07-05"]:
    extract(day)
load_raw(); dbt("build", show=False)
share = query("select sum(revenue) filter (where city = 'Kochi') / sum(revenue) from main.fct_daily_revenue")[0][0]
print(f"Kochi share of revenue: {share:.0%}")` },
  { q: "A manager says the dashboard's revenue doesn't match finance. How do you investigate?", a: "Compare definitions first (paid vs invoiced, refunds, tax, dates/timezones). Then reconcile for one day: sum in fct_daily_revenue vs staging vs raw vs the source/finance report. Check freshness (late data not loaded yet) and duplicates. Fix the definition in dbt (documented), add a reconciliation test, and note the change on the dashboard." }
 ],
 check: [
  ["Dashboards should query…", ["Raw tables", "Marts", "Source APIs", "Staging only"], 1, "Business-ready, tested tables."],
  ["Average order value =", ["avg(daily AOV)", "sum(revenue) / sum(orders)", "max(revenue)", "avg(amount) of all orders incl. refunds"], 1, "Ratio of totals."],
  ["Why show 'data as of'?", ["Decoration", "So people know if data is stale", "Required by Streamlit", "SEO"], 1, "Trust."]
 ],
 remember: [
  "Define KPIs in dbt; dashboards read marts.",
  "KPIs on top, trend, breakdown, detail.",
  "Ratios from totals.",
  "Freshness + source shown on every dashboard."
 ]
},
{
 id: "failures",
 title: "Failure scenarios: late data, duplicates, schema changes",
 level: "Project",
 one: "Make the pipeline survive the three most common real-world problems: <b>late-arriving data</b> (an order updated days later), <b>duplicates</b> (the API sends the same record twice), and <b>schema changes</b> (a renamed or new column). Each gets a fix and a test.",
 why: "Every data pipeline meets these in its first months. Showing that yours handles them, with evidence, is what separates a production-grade project from a tutorial.",
 steps: [
  { h: "Duplicates from the source",
    pre: PIPE,
    code: `API["2025-07-05"].append(dict(API["2025-07-05"][0]))       # API returns order 3 twice
for day in ["2025-07-04", "2025-07-05"]:
    extract(day)
print("raw rows:", load_raw())
dbt("build", show=False)
print("staging rows:", query("select count(*) from main.stg_orders")[0][0],
      "| unique order ids:", query("select count(distinct order_id) from main.stg_orders")[0][0])`,
    note: "The <code>qualify row_number() … = 1</code> dedupe in stg_orders keeps one row per order (the latest), and the <code>unique</code> test on order_id proves it on every run." },
  { h: "Late-arriving updates",
    p: ["Order 1 (placed July 4) is refunded on July 6. The July 6 extract contains the update. Because staging keeps the latest version per order and the mart is rebuilt from staging, July 4's revenue is corrected automatically:"],
    pre: PIPE,
    code: `for day in ["2025-07-04", "2025-07-05"]:
    extract(day)
load_raw(); dbt("build", show=False)
print("July 4 revenue before:", query("select sum(revenue) from main.fct_daily_revenue where order_date = '2025-07-04'")[0][0])

API["2025-07-06"] = [{"id": 1, "customer": "asha", "city": "Kochi", "amount": 55000, "status": "refunded",
                      "updated_at": "2025-07-06T11:00:00"}]
extract("2025-07-06"); load_raw(); dbt("build", show=False)
print("July 4 revenue after the late refund:", query("select coalesce(sum(revenue), 0) from main.fct_daily_revenue where order_date = '2025-07-04'")[0][0])
print("order 1 now:", query("select order_id, status, cast(order_date as varchar) from main.stg_orders where order_id = 1"))`,
    note: "Careful: <code>order_date</code> here comes from <code>updated_at</code>, so the refunded order moved to July 6 in staging. In a real model keep a separate, immutable <code>created_at</code> for the order date, and use <code>updated_at</code> only to pick the latest version. Spotting that kind of bug is exactly why you write these scenarios down." },
  { h: "Schema changes: detect before loading",
    pre: PIPE,
    code: `EXPECTED = {"id": "int", "customer": "str", "city": "str", "amount": "int", "status": "str", "updated_at": "str"}

def check_schema(records):
    seen = {}
    for r in records:
        for k, v in r.items():
            seen.setdefault(k, set()).add(type(v).__name__)
    added = sorted(set(seen) - set(EXPECTED))
    missing = sorted(set(EXPECTED) - set(seen))
    changed = sorted(k for k in set(seen) & set(EXPECTED) if seen[k] != {EXPECTED[k]})
    return {"added": added, "missing": missing, "type_changed": changed,
            "action": "block" if missing or changed else ("warn" if added else "ok")}

print(check_schema(API["2025-07-04"]))
new_api = [{"id": 5, "customer": "omar", "city": "Dubai", "amount_inr": "700.00", "status": "paid",
            "updated_at": "2025-07-07T10:00:00", "channel": "app"}]
print(check_schema(new_api))`,
    note: "The API renamed <code>amount</code> to <code>amount_inr</code> and made it a string. Blocking the load (and alerting) beats silently loading nulls into revenue." },
  { h: "More scenarios to cover",
    code: `scenario                         handling                                              evidence
API down / rate limited          retries with backoff in extract; DAG retries; alert   Airflow logs, retry test
partial extract (fewer rows)     volume check vs same weekday; block publish           volume test
backfill / re-run a day          extract replaces dt= folder; dbt rebuild; idempotent  re-run test gives same numbers
bad values (negative amount)     dbt test (accepted range) → fail build / quarantine   dbt test
timezone confusion               store UTC; convert in marts to Asia/Kolkata          documented in model`, lang: "text" },
  { h: "Tests that lock it in",
    code: `def latest_per_order(rows):
    best = {}
    for r in rows:
        if r["id"] not in best or r["updated_at"] > best[r["id"]]["updated_at"]:
            best[r["id"]] = r
    return best

def revenue(rows):
    return sum(r["amount"] for r in latest_per_order(rows).values() if r["status"] == "paid")

base = [{"id": 1, "amount": 500, "status": "paid", "updated_at": "2025-07-04T10:00"},
        {"id": 2, "amount": 900, "status": "paid", "updated_at": "2025-07-04T11:00"}]

def test_duplicates_not_double_counted():
    assert revenue(base + [base[0]]) == 1400

def test_late_refund_removes_revenue():
    late = {"id": 1, "amount": 500, "status": "refunded", "updated_at": "2025-07-06T09:00"}
    assert revenue(base + [late]) == 900

def test_older_record_does_not_override_newer():
    old = {"id": 2, "amount": 900, "status": "pending", "updated_at": "2025-07-01T00:00"}
    assert revenue(base + [old]) == 1400

def test_rerun_is_identical():
    assert revenue(base) == revenue(list(base))`, test: true }
 ],
 mistakes: [
  "Appending raw data without dedupe downstream.",
  "Using updated_at as the business date.",
  "Loading whatever columns arrive (silent nulls after a rename).",
  "Handling failures in code but not documenting or testing them."
 ],
 practice: [
  { q: "Fix the model: add created_at to the API data and use it for order_date. What changes in staging SQL?", a: "Select <code>cast(created_at as date) as order_date</code> (immutable business date) and keep <code>updated_at</code> only in the <code>qualify row_number() over (partition by id order by updated_at desc)</code> to choose the latest version. Then a late refund removes revenue from the original order day instead of moving the order." },
  { q: "Write a volume check that blocks publishing when today's raw rows are below 50% of the average of the last 4 same weekdays.", code: `def volume_ok(today, last_same_weekdays):
    avg = sum(last_same_weekdays) / len(last_same_weekdays)
    return today >= 0.5 * avg, round(avg)

print(volume_ok(1180, [1200, 1150, 1300, 1250]))
print(volume_ok(400, [1200, 1150, 1300, 1250]))` }
 ],
 check: [
  ["API sends a record twice. Where is it fixed?", ["Dashboard", "Staging dedupe (latest per key) + unique test", "Nowhere", "Raw files deleted"], 1, "Dedupe in staging."],
  ["A renamed source column should…", ["Load as nulls", "Block the load and alert", "Be ignored", "Crash silently"], 1, "Schema check."],
  ["Business date for orders should be…", ["updated_at", "An immutable created/order date", "Load time", "Random"], 1, "Don't move orders between days."]
 ],
 remember: [
  "Duplicates: latest per key in staging + unique test.",
  "Late data: rebuild from latest versions; immutable business date.",
  "Schema drift: check before loading; block on missing/changed.",
  "Every scenario documented and tested."
 ]
},
{
 id: "ship",
 title: "Ship: the end-to-end pipeline",
 level: "Project",
 one: "Put it all together and ship: one command runs <b>extract → load → dbt build → checks</b> for any date, Airflow schedules it daily, CI guards every change, the dashboard shows the result, and the README + <b>runbook</b> explain how it works and what to do when it breaks.",
 why: "An end-to-end, documented, re-runnable pipeline is the most convincing data engineering portfolio piece. It shows you can own a pipeline, not just write a query.",
 steps: [
  { h: "One command for any date",
    pre: PIPE,
    code: `import time

def run(day):
    t = time.perf_counter()
    n = extract(day)
    total = load_raw()
    ok = dbt("build", show=False)
    if not ok:
        raise RuntimeError(f"dbt build failed for {day}")
    dupes = query("select count(*) - count(distinct order_id) from main.stg_orders")[0][0]
    assert dupes == 0, "duplicate orders in staging"
    return f"{day}: extracted {n}, raw total {total}, dbt ok, checks ok ({time.perf_counter() - t:.1f}s)"

for day in ["2025-07-04", "2025-07-05", "2025-07-05"]:          # last one is a re-run: same result
    print(run(day))
print(query("select cast(order_date as varchar), city, orders, revenue from main.fct_daily_revenue order by 1, 2"))`,
    note: "Re-running July 5 replaced that day's raw folder and rebuilt the marts, so the numbers stay identical. That's what makes backfills safe." },
  { h: "Schedule it with Airflow",
    code: `import pendulum
from datetime import timedelta
from airflow.sdk import dag, task
from airflow.providers.standard.operators.bash import BashOperator

@dag(schedule="0 3 * * *", start_date=pendulum.datetime(2025, 7, 1, tz="Asia/Kolkata"), catchup=False,
     max_active_runs=1, default_args={"retries": 2, "retry_delay": timedelta(minutes=10)})
def shop_pipeline():
    @task
    def extract_day(ds=None):
        from pipeline.extract import extract
        return extract(ds)

    @task
    def load(ds=None):
        from pipeline.load import load_raw
        return load_raw()

    dbt_build = BashOperator(task_id="dbt_build", bash_command="cd /app/dbt && dbt build --target prod")
    extract_day() >> load() >> dbt_build

shop_pipeline()`, lang: "python", run: false },
  { h: "The runbook",
    code: `# RUNBOOK.md
## Daily run
03:00 IST Airflow shop_pipeline: extract → load → dbt build. Dashboard updates by 03:20.

## Alerts and what to do
dbt test failed (unique order_id)   check stg_orders dedupe; inspect raw dt= folder for the day; re-run the day
schema check blocked                compare API response with EXPECTED; update contract + staging; re-run
extract failed after retries        check API status/token; re-run: airflow dags test shop_pipeline <date>
data late / dashboard stale         check Airflow run state; freshness = max(updated_at) in stg_orders

## Backfill
airflow backfill create --dag-id shop_pipeline --from-date 2025-06-01 --to-date 2025-06-30 --max-active-runs 1

## Owners
pipeline: you@example.com · data definitions: finance-analytics@example.com`, lang: "markdown" },
  { h: "README checklist",
    code: `1 one-paragraph problem + architecture diagram (API → lake → warehouse → dbt → dashboard)
2 screenshot/GIF of the dashboard and the Airflow DAG
3 quick start: git clone → cp .env.example .env → docker compose up → make run DATE=2025-07-05
4 data model: grain of each mart, KPI definitions, dbt docs link (lineage graph)
5 quality: tests list, failure scenarios table (duplicates, late data, schema change, outages, backfills)
6 CI badge + what CI runs
7 cost/scale notes: what changes for 100x data (partitioning, incremental models, Spark)
8 what I'd do next`, lang: "text" },
  { h: "Interview story",
    p: ["Practise a 2-minute walkthrough: the business question, the architecture, one design decision (e.g. idempotent day-partitioned extracts + rebuildable marts), one failure you handled (the late refund and the business-date bug you caught), and how you'd scale it. Keep the repo link and dashboard screenshot ready."] }
 ],
 mistakes: [
  "A pipeline that only works for 'today'.",
  "No runbook: nobody knows what to do when alerts fire.",
  "README without a quick start that actually works.",
  "Claiming production-grade without tests or failure handling."
 ],
 practice: [
  { q: "Backfill three days with the run() function and confirm the totals don't change on a second backfill.", pre: PIPE, code: `def run(day):
    extract(day); load_raw(); assert dbt("build", show=False)
API["2025-07-06"] = [{"id": 9, "customer": "divya", "city": "Kochi", "amount": 700, "status": "paid", "updated_at": "2025-07-06T08:00:00"}]
days = ["2025-07-04", "2025-07-05", "2025-07-06"]
for d in days: run(d)
first = query("select sum(revenue) from main.fct_daily_revenue")[0][0]
for d in days: run(d)
second = query("select sum(revenue) from main.fct_daily_revenue")[0][0]
print(first, second, "identical" if first == second else "DIFFERENT")` },
  { q: "What would you change to handle 100x more data?", a: "Partition raw data by date in Parquet/Iceberg instead of JSON; load incrementally (only new partitions) instead of full reloads; make fct models incremental with a lookback window; move the warehouse to Snowflake/BigQuery (or Spark/Databricks for heavy transforms); cluster/partition marts by date; and add cost monitoring." }
 ],
 check: [
  ["Why must the pipeline accept a date parameter?", ["Style", "Re-runs and backfills for any day", "Required by Python", "Logging"], 1, "Idempotent days."],
  ["What does the runbook give you?", ["Code", "What to do for each alert, backfill steps, owners", "Marketing", "Licenses"], 1, "Operability."],
  ["Proof of idempotency?", ["Trust", "Re-run gives identical numbers (tested)", "Logs", "Screenshots"], 1, "Evidence."]
 ],
 remember: [
  "run(date): extract → load → dbt build → checks.",
  "Airflow daily, retries, max_active_runs=1, backfills.",
  "README + runbook + dashboard + CI badge.",
  "Tell the story: decision, failure handled, scaling plan."
 ]
}
];
