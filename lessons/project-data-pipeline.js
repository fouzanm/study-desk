// Lessons for course "project-data-pipeline". Built by tools/course-builder from tools/courses/project-data-pipeline.js.
// Python examples were run and their real output stored.
(function (L) {
L["project-data-pipeline:git-ci"] = {
 "title": "Git workflow and CI for data",
 "level": "Project",
 "one": "Treat the pipeline like software: one repo for extract code, dbt models, orchestration and infra; <b>pull requests</b> for every change; and <b>CI</b> that lints, unit-tests the Python, and runs <b>dbt build</b> on sample data so broken SQL never reaches production.",
 "why": "Data teams hire engineers who ship reliable changes. A repo with a clean structure and green CI is the first thing a reviewer of your portfolio project will notice.",
 "steps": [
  {
   "h": "The project you're shipping",
   "code": "shop API ──extract (Python)──► lake: raw/orders/dt=YYYY-MM-DD/*.jsonl  (S3 in production)\n                                      │ load_raw\n                                      ▼\n                         warehouse raw.orders  (DuckDB locally; Snowflake/BigQuery/Postgres in prod)\n                                      │ dbt build (staging → marts, with tests)\n                                      ▼\n                         marts.fct_daily_revenue ──► dashboard (Metabase / Streamlit)\norchestration: Airflow DAG per day · CI: lint + pytest + dbt build on sample data · docs: README + runbook",
   "lang": "text"
  },
  {
   "h": "Repo layout",
   "code": "shop-pipeline/\n  README.md  RUNBOOK.md  Makefile  docker-compose.yml  .env.example\n  pipeline/            extract.py, load.py, config.py      (Python package)\n  dbt/                 dbt_project.yml, models/{staging,marts}, seeds/ (sample data for CI), tests/\n  dags/                shop_daily.py                       (Airflow)\n  dashboard/           app.py (Streamlit) or metabase/ exports\n  infra/               terraform for bucket, roles, warehouse\n  tests/               test_extract.py, test_load.py\n  .github/workflows/ci.yml",
   "lang": "text"
  },
  {
   "h": "Branching and pull requests",
   "code": "git switch -c feat/add-city-to-revenue\n# edit dbt/models/marts/fct_daily_revenue.sql, add a test\nmake lint test dbt-build            # same checks CI runs\ngit commit -m \"Add city to daily revenue mart\"\ngit push -u origin feat/add-city-to-revenue\ngh pr create --fill                 # CI runs; a teammate reviews SQL + test changes; squash-merge to main",
   "lang": "bash"
  },
  {
   "h": "What CI runs, for real",
   "code": "for day in [\"2025-07-04\", \"2025-07-05\"]:\n    extract(day)\nprint(\"raw rows loaded:\", load_raw())\nok = dbt(\"build\")\nprint(\"CI\", \"PASSED\" if ok else \"FAILED\")",
   "note": "This is the same <code>dbt build</code> CI runs: models are created on a throwaway DuckDB warehouse and every test runs. A typo in SQL or a broken test fails the pull request.",
   "out": {
    "text": "raw rows loaded: 4\nmodel  stg_orders                                                 SUCCESS\ntest   accepted_values_stg_orders_status__paid__refunded__pending PASS\ntest   not_null_stg_orders_order_id                               PASS\ntest   unique_stg_orders_order_id                                 PASS\nmodel  fct_daily_revenue                                          SUCCESS\ntest   not_null_fct_daily_revenue_revenue                         PASS\nCI PASSED"
   }
  },
  {
   "h": "The CI workflow",
   "code": "name: ci\non: [pull_request, push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: {python-version: \"3.12\", cache: pip}\n      - run: pip install -e \".[dev]\" dbt-duckdb\n      - run: ruff check pipeline tests && sqlfluff lint dbt/models --dialect duckdb\n      - run: pytest -q\n      - name: dbt build on sample data\n        run: |\n          python -m pipeline.load --sample          # loads dbt/seeds sample files into raw.*\n          cd dbt && dbt build --profiles-dir ci --target ci\n  # main branch only: deploy DAGs + dbt docs (see \"ship\")",
   "lang": "yaml"
  }
 ],
 "mistakes": [
  "SQL changes merged without running dbt in CI.",
  "CI that needs production credentials (use sample data and DuckDB).",
  "One giant commit per week instead of small reviewed PRs.",
  "Secrets in the repo (.env committed)."
 ],
 "practice": [
  {
   "q": "Break the SQL on purpose (reference a column that doesn't exist) and watch CI fail.",
   "code": "extract(\"2025-07-04\"); load_raw()\nw(\"dbt/models/marts/fct_daily_revenue.sql\", \"select order_date, sum(amount_inr) as revenue from {{ ref('stg_orders') }} group by 1\")\nprint(\"CI\", \"PASSED\" if dbt(\"build\", show=False) else \"FAILED (good: the broken model was caught)\")",
   "out": {
    "text": "CI FAILED (good: the broken model was caught)"
   }
  },
  {
   "q": "Write the Makefile targets that mirror CI so developers run the same checks locally.",
   "code": "lint:\n\truff check pipeline tests && sqlfluff lint dbt/models --dialect duckdb\ntest:\n\tpytest -q\ndbt-build:\n\tpython -m pipeline.load --sample && cd dbt && dbt build --profiles-dir ci --target ci\nci: lint test dbt-build",
   "lang": "makefile"
  }
 ],
 "check": [
  [
   "Why run dbt build in CI?",
   [
    "Speed",
    "Catch broken SQL and failing data tests before merge",
    "Required by GitHub",
    "Docs only"
   ],
   1,
   "Shift left."
  ],
  [
   "What data should CI use?",
   [
    "Production",
    "Small sample data on a throwaway warehouse (DuckDB)",
    "None",
    "Random"
   ],
   1,
   "Fast and safe."
  ],
  [
   "How do changes reach main?",
   [
    "Direct push",
    "Pull request with green CI and review",
    "Email",
    "FTP"
   ],
   1,
   "Reviewed changes."
  ]
 ],
 "remember": [
  "One repo: pipeline code, dbt, DAGs, dashboard, infra.",
  "Small PRs; CI = lint + pytest + dbt build on sample data.",
  "Make targets mirror CI locally.",
  "No prod credentials or secrets in CI/Git."
 ]
};
L["project-data-pipeline:docker"] = {
 "title": "Docker-ize the stack",
 "level": "Project",
 "one": "Package the pipeline as a <b>Docker image</b> and run the whole stack locally with <b>Docker Compose</b>: warehouse (Postgres or DuckDB), object storage (MinIO as local S3), Airflow and the dashboard, configured entirely by <b>environment variables</b>.",
 "why": "“Clone, docker compose up, open localhost” is what makes a portfolio project easy to evaluate, and it's how teams make pipelines run the same on every laptop and in production.",
 "steps": [
  {
   "h": "One config, many environments",
   "code": "import os\nfrom dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Config:\n    env: str\n    lake_uri: str\n    warehouse_url: str\n    api_base: str\n\ndef load_config() -> Config:\n    env = os.environ.get(\"PIPELINE_ENV\", \"local\")\n    defaults = {\"local\": (\"file://./lake\", \"duckdb:///warehouse.duckdb\"),\n                \"prod\": (\"s3://acme-shop-lake\", \"snowflake://...\")}[env]\n    return Config(env=env,\n                  lake_uri=os.environ.get(\"LAKE_URI\", defaults[0]),\n                  warehouse_url=os.environ.get(\"WAREHOUSE_URL\", defaults[1]),\n                  api_base=os.environ.get(\"SHOP_API_BASE\", \"https://api.example-shop.com\"))\n\nprint(load_config())\nos.environ.update(PIPELINE_ENV=\"prod\", WAREHOUSE_URL=\"snowflake://acct/ANALYTICS\")\nprint(load_config())",
   "note": "Code never checks “am I on a laptop?”. The same image runs everywhere; only environment variables change.",
   "out": {
    "text": "Config(env='local', lake_uri='file://./lake', warehouse_url='duckdb:///warehouse.duckdb', api_base='https://api.example-shop.com')\nConfig(env='prod', lake_uri='s3://acme-shop-lake', warehouse_url='snowflake://acct/ANALYTICS', api_base='https://api.example-shop.com')"
   }
  },
  {
   "h": "The pipeline image",
   "code": "FROM python:3.12-slim\nWORKDIR /app\nRUN pip install --no-cache-dir uv\nCOPY pyproject.toml uv.lock ./\nRUN uv pip install --system -r pyproject.toml\nCOPY pipeline/ pipeline/\nCOPY dbt/ dbt/\nENV PYTHONUNBUFFERED=1 DO_NOT_TRACK=1\nRUN cd dbt && dbt deps\nUSER nobody\nENTRYPOINT [\"python\", \"-m\", \"pipeline\"]          # e.g. docker run shop-pipeline run --date 2025-07-05",
   "lang": "dockerfile"
  },
  {
   "h": "Docker Compose: the local stack",
   "code": "services:\n  minio:                                  # local S3\n    image: minio/minio\n    command: server /data --console-address \":9001\"\n    environment: {MINIO_ROOT_USER: minio, MINIO_ROOT_PASSWORD: minio12345}\n    ports: [\"9000:9000\", \"9001:9001\"]\n  warehouse:\n    image: postgres:16\n    environment: {POSTGRES_USER: wh, POSTGRES_PASSWORD: wh, POSTGRES_DB: analytics}\n    ports: [\"5433:5432\"]\n  pipeline:\n    build: .\n    env_file: .env                        # LAKE_URI=s3://lake (MinIO), WAREHOUSE_URL=postgresql://wh:wh@warehouse/analytics\n    depends_on: [minio, warehouse]\n    profiles: [\"manual\"]                  # run on demand: docker compose run pipeline run --date 2025-07-05\n  airflow:\n    image: apache/airflow:3.1.0\n    command: standalone\n    volumes: [\"./dags:/opt/airflow/dags\"]\n    ports: [\"8080:8080\"]\n  metabase:\n    image: metabase/metabase\n    ports: [\"3000:3000\"]\n    depends_on: [warehouse]",
   "lang": "yaml"
  },
  {
   "h": "Running it",
   "code": "cp .env.example .env\ndocker compose up -d minio warehouse airflow metabase\ndocker compose run --rm pipeline run --date 2025-07-05\ndocker compose ps",
   "lang": "bash",
   "out": {
    "text": "extracted 2 orders for 2025-07-05 -> s3://lake/raw/orders/dt=2025-07-05/\nloaded raw.orders (4 rows)\ndbt build: 2 models, 4 tests passed\n\nNAME          STATUS\nminio-1       Up\nwarehouse-1   Up\nairflow-1     Up (healthy)\nmetabase-1    Up",
    "label": "Example output"
   }
  }
 ],
 "mistakes": [
  "Hard-coded paths and credentials in code.",
  "Images that run as root.",
  "“Works on my machine” setups that need ten manual steps.",
  "Building a new image per environment instead of one image + env vars."
 ],
 "practice": [
  {
   "q": "Write the .env.example for the local stack (no real secrets).",
   "code": "PIPELINE_ENV=local\nLAKE_URI=s3://lake\nAWS_ENDPOINT_URL=http://minio:9000\nAWS_ACCESS_KEY_ID=minio\nAWS_SECRET_ACCESS_KEY=minio12345\nWAREHOUSE_URL=postgresql://wh:wh@warehouse:5432/analytics\nSHOP_API_BASE=https://api.example-shop.com\nSHOP_API_TOKEN=",
   "lang": "bash"
  },
  {
   "q": "Why use MinIO locally instead of a real S3 bucket?",
   "a": "It speaks the S3 API, so the same boto3/fsspec code works unchanged by switching AWS_ENDPOINT_URL; it's free, offline, and reviewers can run the project without an AWS account or credentials."
  }
 ],
 "check": [
  [
   "Best way to handle dev vs prod?",
   [
    "Different code",
    "Same image, different environment variables",
    "Comments",
    "Separate repos"
   ],
   1,
   "12-factor config."
  ],
  [
   "MinIO gives you…",
   [
    "A database",
    "S3-compatible storage locally",
    "Airflow",
    "Dashboards"
   ],
   1,
   "Local S3."
  ],
  [
   "Why USER nobody in the Dockerfile?",
   [
    "Speed",
    "Don't run as root",
    "Required",
    "Smaller image"
   ],
   1,
   "Least privilege."
  ]
 ],
 "remember": [
  "One image, config by env vars.",
  "Compose: MinIO (S3), warehouse, Airflow, dashboard.",
  "docker compose run pipeline run --date …",
  "No secrets in images; non-root user."
 ]
};
L["project-data-pipeline:dashboard"] = {
 "title": "Serve: a dashboard on your marts",
 "level": "Project",
 "one": "The pipeline exists so people can make decisions. Build a small dashboard on the <b>marts</b> (never raw tables): a few <b>well-defined KPIs</b>, a trend, a breakdown, and a freshness note, using Metabase/Superset or a Streamlit app.",
 "why": "A dashboard turns your pipeline into something a non-engineer understands in 10 seconds, which is exactly what portfolio reviewers and clients need to see.",
 "steps": [
  {
   "h": "Define the KPIs first",
   "code": "KPI                 definition (lives in dbt, documented)              source\nrevenue             sum(amount) of paid orders, INR                    fct_daily_revenue\norders              count of paid orders                               fct_daily_revenue\navg order value     revenue / orders (computed, never averaged)        fct_daily_revenue\nrefund rate         refunded orders / all orders                       stg_orders\nfreshness           max(updated_at) loaded                             stg_orders",
   "lang": "text"
  },
  {
   "h": "The dashboard queries",
   "code": "for day in [\"2025-07-04\", \"2025-07-05\"]:\n    extract(day)\nload_raw(); dbt(\"build\", show=False)\n\nkpis = query(\"\"\"select sum(revenue) as revenue, sum(orders) as orders, round(sum(revenue) / sum(orders)) as aov\n                from main.fct_daily_revenue\"\"\")[0]\nrefund_rate = query(\"select round(avg((status = 'refunded')::int), 2) from main.stg_orders\")[0][0]\nfreshness = query(\"select max(updated_at) from main.stg_orders\")[0][0]\nprint(f\"Revenue ₹{kpis[0]:,} · Orders {kpis[1]} · AOV ₹{kpis[2]:,.0f} · Refund rate {refund_rate:.0%}\")\nprint(\"by day:\", query(\"select cast(order_date as varchar), sum(revenue) from main.fct_daily_revenue group by 1 order by 1\"))\nprint(\"by city:\", query(\"select city, sum(revenue) as r from main.fct_daily_revenue group by 1 order by r desc\"))\nprint(\"data as of:\", freshness)",
   "note": "Average order value is computed from totals (revenue ÷ orders), not by averaging daily averages.",
   "out": {
    "text": "Revenue ₹67,200 · Orders 3 · AOV ₹22,400 · Refund rate 25%\nby day: [('2025-07-04', 64200), ('2025-07-05', 3000)]\nby city: [('Kochi', 55000), ('Bengaluru', 9200), ('Dubai', 3000)]\ndata as of: 2025-07-05 18:00:00"
   }
  },
  {
   "h": "A Streamlit dashboard",
   "code": "# dashboard/app.py   (streamlit run dashboard/app.py)\nimport duckdb, streamlit as st\n\ncon = duckdb.connect(\"warehouse.duckdb\", read_only=True)\nst.set_page_config(page_title=\"Shop revenue\", layout=\"wide\")\nst.title(\"Shop revenue\")\n\ndays = st.slider(\"Last N days\", 7, 90, 30)\nk = con.sql(f\"\"\"select sum(revenue), sum(orders) from fct_daily_revenue\n                where order_date >= current_date - {int(days)}\"\"\").fetchone()\nc1, c2, c3 = st.columns(3)\nc1.metric(\"Revenue\", f\"₹{k[0] or 0:,.0f}\")\nc2.metric(\"Orders\", k[1] or 0)\nc3.metric(\"Avg order value\", f\"₹{(k[0] or 0) / max(k[1] or 1, 1):,.0f}\")\n\nst.line_chart(con.sql(\"select order_date, sum(revenue) as revenue from fct_daily_revenue group by 1 order by 1\").df(),\n              x=\"order_date\", y=\"revenue\")\nst.bar_chart(con.sql(\"select city, sum(revenue) as revenue from fct_daily_revenue group by 1\").df(), x=\"city\", y=\"revenue\")\nst.caption(f\"Data as of {con.sql('select max(updated_at) from stg_orders').fetchone()[0]} · source: marts.fct_daily_revenue\")",
   "lang": "python",
   "run": false
  },
  {
   "h": "Metabase/Superset instead",
   "p": [
    "For business users, a BI tool is often better: point Metabase at the warehouse, give it read access to the <b>marts</b> schema only, build questions on <code>fct_daily_revenue</code>, and arrange them in a dashboard with a date filter. Export the dashboard definition (or screenshots) into the repo so reviewers can see it."
   ]
  },
  {
   "h": "Dashboard design rules",
   "code": "top row     3-5 KPIs with comparison to previous period\nmiddle      one trend over time (line), one breakdown (bar)\nbottom      a detail table for drill-down\nalways      a \"data as of\" timestamp and the source table\nnever       raw/staging tables, pie charts with 12 slices, metrics without definitions",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Dashboards on raw tables with their own business logic.",
  "Averaging averages for AOV or rates.",
  "No freshness indicator, so stale data looks current.",
  "Twenty charts nobody reads."
 ],
 "practice": [
  {
   "q": "Add a KPI: share of revenue from Kochi.",
   "code": "for day in [\"2025-07-04\", \"2025-07-05\"]:\n    extract(day)\nload_raw(); dbt(\"build\", show=False)\nshare = query(\"select sum(revenue) filter (where city = 'Kochi') / sum(revenue) from main.fct_daily_revenue\")[0][0]\nprint(f\"Kochi share of revenue: {share:.0%}\")",
   "out": {
    "text": "Kochi share of revenue: 82%"
   }
  },
  {
   "q": "A manager says the dashboard's revenue doesn't match finance. How do you investigate?",
   "a": "Compare definitions first (paid vs invoiced, refunds, tax, dates/timezones). Then reconcile for one day: sum in fct_daily_revenue vs staging vs raw vs the source/finance report. Check freshness (late data not loaded yet) and duplicates. Fix the definition in dbt (documented), add a reconciliation test, and note the change on the dashboard."
  }
 ],
 "check": [
  [
   "Dashboards should query…",
   [
    "Raw tables",
    "Marts",
    "Source APIs",
    "Staging only"
   ],
   1,
   "Business-ready, tested tables."
  ],
  [
   "Average order value =",
   [
    "avg(daily AOV)",
    "sum(revenue) / sum(orders)",
    "max(revenue)",
    "avg(amount) of all orders incl. refunds"
   ],
   1,
   "Ratio of totals."
  ],
  [
   "Why show 'data as of'?",
   [
    "Decoration",
    "So people know if data is stale",
    "Required by Streamlit",
    "SEO"
   ],
   1,
   "Trust."
  ]
 ],
 "remember": [
  "Define KPIs in dbt; dashboards read marts.",
  "KPIs on top, trend, breakdown, detail.",
  "Ratios from totals.",
  "Freshness + source shown on every dashboard."
 ]
};
L["project-data-pipeline:failures"] = {
 "title": "Failure scenarios: late data, duplicates, schema changes",
 "level": "Project",
 "one": "Make the pipeline survive the three most common real-world problems: <b>late-arriving data</b> (an order updated days later), <b>duplicates</b> (the API sends the same record twice), and <b>schema changes</b> (a renamed or new column). Each gets a fix and a test.",
 "why": "Every data pipeline meets these in its first months. Showing that yours handles them, with evidence, is what separates a production-grade project from a tutorial.",
 "steps": [
  {
   "h": "Duplicates from the source",
   "code": "API[\"2025-07-05\"].append(dict(API[\"2025-07-05\"][0]))       # API returns order 3 twice\nfor day in [\"2025-07-04\", \"2025-07-05\"]:\n    extract(day)\nprint(\"raw rows:\", load_raw())\ndbt(\"build\", show=False)\nprint(\"staging rows:\", query(\"select count(*) from main.stg_orders\")[0][0],\n      \"| unique order ids:\", query(\"select count(distinct order_id) from main.stg_orders\")[0][0])",
   "note": "The <code>qualify row_number() … = 1</code> dedupe in stg_orders keeps one row per order (the latest), and the <code>unique</code> test on order_id proves it on every run.",
   "out": {
    "text": "raw rows: 5\nstaging rows: 4 | unique order ids: 4"
   }
  },
  {
   "h": "Late-arriving updates",
   "p": [
    "Order 1 (placed July 4) is refunded on July 6. The July 6 extract contains the update. Because staging keeps the latest version per order and the mart is rebuilt from staging, July 4's revenue is corrected automatically:"
   ],
   "code": "for day in [\"2025-07-04\", \"2025-07-05\"]:\n    extract(day)\nload_raw(); dbt(\"build\", show=False)\nprint(\"July 4 revenue before:\", query(\"select sum(revenue) from main.fct_daily_revenue where order_date = '2025-07-04'\")[0][0])\n\nAPI[\"2025-07-06\"] = [{\"id\": 1, \"customer\": \"asha\", \"city\": \"Kochi\", \"amount\": 55000, \"status\": \"refunded\",\n                      \"updated_at\": \"2025-07-06T11:00:00\"}]\nextract(\"2025-07-06\"); load_raw(); dbt(\"build\", show=False)\nprint(\"July 4 revenue after the late refund:\", query(\"select coalesce(sum(revenue), 0) from main.fct_daily_revenue where order_date = '2025-07-04'\")[0][0])\nprint(\"order 1 now:\", query(\"select order_id, status, cast(order_date as varchar) from main.stg_orders where order_id = 1\"))",
   "note": "Careful: <code>order_date</code> here comes from <code>updated_at</code>, so the refunded order moved to July 6 in staging. In a real model keep a separate, immutable <code>created_at</code> for the order date, and use <code>updated_at</code> only to pick the latest version. Spotting that kind of bug is exactly why you write these scenarios down.",
   "out": {
    "text": "July 4 revenue before: 64200\nJuly 4 revenue after the late refund: 9200\norder 1 now: [(1, 'refunded', '2025-07-06')]"
   }
  },
  {
   "h": "Schema changes: detect before loading",
   "code": "EXPECTED = {\"id\": \"int\", \"customer\": \"str\", \"city\": \"str\", \"amount\": \"int\", \"status\": \"str\", \"updated_at\": \"str\"}\n\ndef check_schema(records):\n    seen = {}\n    for r in records:\n        for k, v in r.items():\n            seen.setdefault(k, set()).add(type(v).__name__)\n    added = sorted(set(seen) - set(EXPECTED))\n    missing = sorted(set(EXPECTED) - set(seen))\n    changed = sorted(k for k in set(seen) & set(EXPECTED) if seen[k] != {EXPECTED[k]})\n    return {\"added\": added, \"missing\": missing, \"type_changed\": changed,\n            \"action\": \"block\" if missing or changed else (\"warn\" if added else \"ok\")}\n\nprint(check_schema(API[\"2025-07-04\"]))\nnew_api = [{\"id\": 5, \"customer\": \"omar\", \"city\": \"Dubai\", \"amount_inr\": \"700.00\", \"status\": \"paid\",\n            \"updated_at\": \"2025-07-07T10:00:00\", \"channel\": \"app\"}]\nprint(check_schema(new_api))",
   "note": "The API renamed <code>amount</code> to <code>amount_inr</code> and made it a string. Blocking the load (and alerting) beats silently loading nulls into revenue.",
   "out": {
    "text": "{'added': [], 'missing': [], 'type_changed': [], 'action': 'ok'}\n{'added': ['amount_inr', 'channel'], 'missing': ['amount'], 'type_changed': [], 'action': 'block'}"
   }
  },
  {
   "h": "More scenarios to cover",
   "code": "scenario                         handling                                              evidence\nAPI down / rate limited          retries with backoff in extract; DAG retries; alert   Airflow logs, retry test\npartial extract (fewer rows)     volume check vs same weekday; block publish           volume test\nbackfill / re-run a day          extract replaces dt= folder; dbt rebuild; idempotent  re-run test gives same numbers\nbad values (negative amount)     dbt test (accepted range) → fail build / quarantine   dbt test\ntimezone confusion               store UTC; convert in marts to Asia/Kolkata          documented in model",
   "lang": "text"
  },
  {
   "h": "Tests that lock it in",
   "code": "def latest_per_order(rows):\n    best = {}\n    for r in rows:\n        if r[\"id\"] not in best or r[\"updated_at\"] > best[r[\"id\"]][\"updated_at\"]:\n            best[r[\"id\"]] = r\n    return best\n\ndef revenue(rows):\n    return sum(r[\"amount\"] for r in latest_per_order(rows).values() if r[\"status\"] == \"paid\")\n\nbase = [{\"id\": 1, \"amount\": 500, \"status\": \"paid\", \"updated_at\": \"2025-07-04T10:00\"},\n        {\"id\": 2, \"amount\": 900, \"status\": \"paid\", \"updated_at\": \"2025-07-04T11:00\"}]\n\ndef test_duplicates_not_double_counted():\n    assert revenue(base + [base[0]]) == 1400\n\ndef test_late_refund_removes_revenue():\n    late = {\"id\": 1, \"amount\": 500, \"status\": \"refunded\", \"updated_at\": \"2025-07-06T09:00\"}\n    assert revenue(base + [late]) == 900\n\ndef test_older_record_does_not_override_newer():\n    old = {\"id\": 2, \"amount\": 900, \"status\": \"pending\", \"updated_at\": \"2025-07-01T00:00\"}\n    assert revenue(base + [old]) == 1400\n\ndef test_rerun_is_identical():\n    assert revenue(base) == revenue(list(base))",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.00s"
   }
  }
 ],
 "mistakes": [
  "Appending raw data without dedupe downstream.",
  "Using updated_at as the business date.",
  "Loading whatever columns arrive (silent nulls after a rename).",
  "Handling failures in code but not documenting or testing them."
 ],
 "practice": [
  {
   "q": "Fix the model: add created_at to the API data and use it for order_date. What changes in staging SQL?",
   "a": "Select <code>cast(created_at as date) as order_date</code> (immutable business date) and keep <code>updated_at</code> only in the <code>qualify row_number() over (partition by id order by updated_at desc)</code> to choose the latest version. Then a late refund removes revenue from the original order day instead of moving the order."
  },
  {
   "q": "Write a volume check that blocks publishing when today's raw rows are below 50% of the average of the last 4 same weekdays.",
   "code": "def volume_ok(today, last_same_weekdays):\n    avg = sum(last_same_weekdays) / len(last_same_weekdays)\n    return today >= 0.5 * avg, round(avg)\n\nprint(volume_ok(1180, [1200, 1150, 1300, 1250]))\nprint(volume_ok(400, [1200, 1150, 1300, 1250]))",
   "out": {
    "text": "(True, 1225)\n(False, 1225)"
   }
  }
 ],
 "check": [
  [
   "API sends a record twice. Where is it fixed?",
   [
    "Dashboard",
    "Staging dedupe (latest per key) + unique test",
    "Nowhere",
    "Raw files deleted"
   ],
   1,
   "Dedupe in staging."
  ],
  [
   "A renamed source column should…",
   [
    "Load as nulls",
    "Block the load and alert",
    "Be ignored",
    "Crash silently"
   ],
   1,
   "Schema check."
  ],
  [
   "Business date for orders should be…",
   [
    "updated_at",
    "An immutable created/order date",
    "Load time",
    "Random"
   ],
   1,
   "Don't move orders between days."
  ]
 ],
 "remember": [
  "Duplicates: latest per key in staging + unique test.",
  "Late data: rebuild from latest versions; immutable business date.",
  "Schema drift: check before loading; block on missing/changed.",
  "Every scenario documented and tested."
 ]
};
L["project-data-pipeline:ship"] = {
 "title": "Ship: the end-to-end pipeline",
 "level": "Project",
 "one": "Put it all together and ship: one command runs <b>extract → load → dbt build → checks</b> for any date, Airflow schedules it daily, CI guards every change, the dashboard shows the result, and the README + <b>runbook</b> explain how it works and what to do when it breaks.",
 "why": "An end-to-end, documented, re-runnable pipeline is the most convincing data engineering portfolio piece. It shows you can own a pipeline, not just write a query.",
 "steps": [
  {
   "h": "One command for any date",
   "code": "import time\n\ndef run(day):\n    t = time.perf_counter()\n    n = extract(day)\n    total = load_raw()\n    ok = dbt(\"build\", show=False)\n    if not ok:\n        raise RuntimeError(f\"dbt build failed for {day}\")\n    dupes = query(\"select count(*) - count(distinct order_id) from main.stg_orders\")[0][0]\n    assert dupes == 0, \"duplicate orders in staging\"\n    return f\"{day}: extracted {n}, raw total {total}, dbt ok, checks ok ({time.perf_counter() - t:.1f}s)\"\n\nfor day in [\"2025-07-04\", \"2025-07-05\", \"2025-07-05\"]:          # last one is a re-run: same result\n    print(run(day))\nprint(query(\"select cast(order_date as varchar), city, orders, revenue from main.fct_daily_revenue order by 1, 2\"))",
   "note": "Re-running July 5 replaced that day's raw folder and rebuilt the marts, so the numbers stay identical. That's what makes backfills safe.",
   "out": {
    "text": "2025-07-04: extracted 2, raw total 2, dbt ok, checks ok (3.5s)\n2025-07-05: extracted 2, raw total 4, dbt ok, checks ok (2.8s)\n2025-07-05: extracted 2, raw total 4, dbt ok, checks ok (2.4s)\n[('2025-07-04', 'Bengaluru', 1, 9200), ('2025-07-04', 'Kochi', 1, 55000), ('2025-07-05', 'Dubai', 1, 3000)]"
   }
  },
  {
   "h": "Schedule it with Airflow",
   "code": "import pendulum\nfrom datetime import timedelta\nfrom airflow.sdk import dag, task\nfrom airflow.providers.standard.operators.bash import BashOperator\n\n@dag(schedule=\"0 3 * * *\", start_date=pendulum.datetime(2025, 7, 1, tz=\"Asia/Kolkata\"), catchup=False,\n     max_active_runs=1, default_args={\"retries\": 2, \"retry_delay\": timedelta(minutes=10)})\ndef shop_pipeline():\n    @task\n    def extract_day(ds=None):\n        from pipeline.extract import extract\n        return extract(ds)\n\n    @task\n    def load(ds=None):\n        from pipeline.load import load_raw\n        return load_raw()\n\n    dbt_build = BashOperator(task_id=\"dbt_build\", bash_command=\"cd /app/dbt && dbt build --target prod\")\n    extract_day() >> load() >> dbt_build\n\nshop_pipeline()",
   "lang": "python",
   "run": false
  },
  {
   "h": "The runbook",
   "code": "# RUNBOOK.md\n## Daily run\n03:00 IST Airflow shop_pipeline: extract → load → dbt build. Dashboard updates by 03:20.\n\n## Alerts and what to do\ndbt test failed (unique order_id)   check stg_orders dedupe; inspect raw dt= folder for the day; re-run the day\nschema check blocked                compare API response with EXPECTED; update contract + staging; re-run\nextract failed after retries        check API status/token; re-run: airflow dags test shop_pipeline <date>\ndata late / dashboard stale         check Airflow run state; freshness = max(updated_at) in stg_orders\n\n## Backfill\nairflow backfill create --dag-id shop_pipeline --from-date 2025-06-01 --to-date 2025-06-30 --max-active-runs 1\n\n## Owners\npipeline: you@example.com · data definitions: finance-analytics@example.com",
   "lang": "markdown"
  },
  {
   "h": "README checklist",
   "code": "1 one-paragraph problem + architecture diagram (API → lake → warehouse → dbt → dashboard)\n2 screenshot/GIF of the dashboard and the Airflow DAG\n3 quick start: git clone → cp .env.example .env → docker compose up → make run DATE=2025-07-05\n4 data model: grain of each mart, KPI definitions, dbt docs link (lineage graph)\n5 quality: tests list, failure scenarios table (duplicates, late data, schema change, outages, backfills)\n6 CI badge + what CI runs\n7 cost/scale notes: what changes for 100x data (partitioning, incremental models, Spark)\n8 what I'd do next",
   "lang": "text"
  },
  {
   "h": "Interview story",
   "p": [
    "Practise a 2-minute walkthrough: the business question, the architecture, one design decision (e.g. idempotent day-partitioned extracts + rebuildable marts), one failure you handled (the late refund and the business-date bug you caught), and how you'd scale it. Keep the repo link and dashboard screenshot ready."
   ]
  }
 ],
 "mistakes": [
  "A pipeline that only works for 'today'.",
  "No runbook: nobody knows what to do when alerts fire.",
  "README without a quick start that actually works.",
  "Claiming production-grade without tests or failure handling."
 ],
 "practice": [
  {
   "q": "Backfill three days with the run() function and confirm the totals don't change on a second backfill.",
   "code": "def run(day):\n    extract(day); load_raw(); assert dbt(\"build\", show=False)\nAPI[\"2025-07-06\"] = [{\"id\": 9, \"customer\": \"divya\", \"city\": \"Kochi\", \"amount\": 700, \"status\": \"paid\", \"updated_at\": \"2025-07-06T08:00:00\"}]\ndays = [\"2025-07-04\", \"2025-07-05\", \"2025-07-06\"]\nfor d in days: run(d)\nfirst = query(\"select sum(revenue) from main.fct_daily_revenue\")[0][0]\nfor d in days: run(d)\nsecond = query(\"select sum(revenue) from main.fct_daily_revenue\")[0][0]\nprint(first, second, \"identical\" if first == second else \"DIFFERENT\")",
   "out": {
    "text": "67900 67900 identical"
   }
  },
  {
   "q": "What would you change to handle 100x more data?",
   "a": "Partition raw data by date in Parquet/Iceberg instead of JSON; load incrementally (only new partitions) instead of full reloads; make fct models incremental with a lookback window; move the warehouse to Snowflake/BigQuery (or Spark/Databricks for heavy transforms); cluster/partition marts by date; and add cost monitoring."
  }
 ],
 "check": [
  [
   "Why must the pipeline accept a date parameter?",
   [
    "Style",
    "Re-runs and backfills for any day",
    "Required by Python",
    "Logging"
   ],
   1,
   "Idempotent days."
  ],
  [
   "What does the runbook give you?",
   [
    "Code",
    "What to do for each alert, backfill steps, owners",
    "Marketing",
    "Licenses"
   ],
   1,
   "Operability."
  ],
  [
   "Proof of idempotency?",
   [
    "Trust",
    "Re-run gives identical numbers (tested)",
    "Logs",
    "Screenshots"
   ],
   1,
   "Evidence."
  ]
 ],
 "remember": [
  "run(date): extract → load → dbt build → checks.",
  "Airflow daily, retries, max_active_runs=1, backfills.",
  "README + runbook + dashboard + CI badge.",
  "Tell the story: decision, failure handled, scaling plan."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
