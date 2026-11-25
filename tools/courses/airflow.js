// Airflow. DAG files below were run with Airflow 3 (`airflow dags test`); their output is shown as example output.
const SHOP_DAG = String.raw`import sqlite3, pendulum
from datetime import timedelta
from airflow.sdk import dag, task

DB = "/tmp/warehouse.db"
FAKE_ORDERS = {   # what the shop API would return for each day
    "2025-07-04": [(1, 101, 500, "paid"), (2, 102, 900, "paid"), (3, 101, 300, "refunded")],
    "2025-07-05": [(4, 103, 1200, "paid"), (5, 101, 450, "paid")],
}

@dag(dag_id="shop_daily", schedule="0 2 * * *", start_date=pendulum.datetime(2025, 7, 1, tz="Asia/Kolkata"),
     catchup=False, max_active_runs=1, tags=["shop"],
     default_args={"retries": 2, "retry_delay": timedelta(minutes=5), "owner": "data"})
def shop_daily():
    @task
    def extract(ds=None) -> list:
        rows = FAKE_ORDERS.get(ds, [])
        print(f"extracted {len(rows)} orders for {ds}")
        return rows

    @task
    def load(rows: list, ds=None) -> int:
        con = sqlite3.connect(DB)
        con.execute("CREATE TABLE IF NOT EXISTS orders (order_id INT PRIMARY KEY, customer_id INT, amount INT, status TEXT, day TEXT)")
        with con:
            con.executemany("""INSERT INTO orders VALUES (?, ?, ?, ?, ?) ON CONFLICT (order_id) DO UPDATE
                               SET amount = excluded.amount, status = excluded.status""", [(*r, ds) for r in rows])
        return len(rows)

    @task
    def transform(ds=None):
        con = sqlite3.connect(DB)
        con.execute("CREATE TABLE IF NOT EXISTS daily_revenue (day TEXT PRIMARY KEY, orders INT, revenue INT)")
        with con:
            con.execute("DELETE FROM daily_revenue WHERE day = ?", (ds,))
            con.execute("""INSERT INTO daily_revenue SELECT day, COUNT(*), SUM(amount) FROM orders
                           WHERE day = ? AND status = 'paid' GROUP BY day""", (ds,))
        print("daily_revenue:", con.execute("SELECT * FROM daily_revenue WHERE day = ?", (ds,)).fetchall())

    @task
    def check(loaded: int, ds=None):
        con = sqlite3.connect(DB)
        dupes = con.execute("SELECT COUNT(*) - COUNT(DISTINCT order_id) FROM orders").fetchone()[0]
        if dupes or loaded == 0:
            raise ValueError(f"checks failed for {ds}: dupes={dupes}, loaded={loaded}")
        print(f"checks passed for {ds}")

    loaded = load(extract())
    loaded >> transform() >> check(loaded)

shop_daily()`;

module.exports = [
{
 id: "why",
 title: "Why orchestration: beyond cron",
 level: "Beginner+",
 one: "An <b>orchestrator</b> (Airflow, Dagster, Prefect) runs pipelines on a schedule <b>in the right order</b>, retries failures, alerts people, keeps history and logs, and can re-run past dates. Cron only starts commands at times.",
 why: "Real pipelines have dozens of dependent steps across systems. Airflow is the most common orchestrator in data engineering job posts.",
 steps: [
  { h: "What cron can't do",
    code: `cron                                     orchestrator (Airflow)
0 2 * * * extract.sh                     extract >> load >> transform >> check
30 2 * * * transform.sh   # hope         transform starts only when load succeeded
no retries                               retries with backoff per task
failures noticed when CEO asks           alerts on failure / lateness
logs on one server                       logs + history per run in a UI
re-run July 3rd? by hand                 backfill a date range with one command`, lang: "text" },
  { h: "Pipelines are DAGs",
    p: ["A <b>DAG</b> (directed acyclic graph) is a set of tasks with dependencies and no cycles. The orchestrator works out a valid order and runs independent tasks in parallel. Python's standard library can show the idea:"],
    code: `from graphlib import TopologicalSorter

pipeline = {                         # task: the tasks it depends on
    "load_orders": {"extract_orders"},
    "load_customers": {"extract_customers"},
    "build_fct_sales": {"load_orders", "load_customers"},
    "check_fct_sales": {"build_fct_sales"},
    "refresh_dashboard": {"check_fct_sales"},
}
ts = TopologicalSorter(pipeline)
ts.prepare()
step = 1
while ts.is_active():
    ready = sorted(ts.get_ready())
    print(f"wave {step}: run in parallel -> {ready}")
    ts.done(*ready)
    step += 1` },
  { h: "Orchestrator options",
    code: `Airflow    most widely used, huge provider ecosystem (AWS, GCP, Snowflake, dbt...), Python DAGs
           managed: MWAA (AWS), Cloud Composer (GCP), Astronomer
Dagster    asset-centric (tables as first-class), strong local dev and testing
Prefect    Pythonic flows, easy start, hybrid cloud
dbt Cloud  schedules dbt jobs only
cron/CI    fine for one or two simple scripts`, lang: "text" },
  { h: "What orchestration does NOT do",
    p: ["Airflow coordinates work; it shouldn't do heavy processing itself. Tasks should call out to the warehouse (SQL/dbt), Spark, or small Python steps. Big data in a task's memory, or passing large datasets between tasks, are anti-patterns."] }
 ],
 mistakes: [
  "Chaining cron jobs by time and hoping the previous step finished.",
  "Doing heavy data processing inside Airflow workers.",
  "No alerts, so failures are discovered by users.",
  "Picking a complex orchestrator for one tiny script."
 ],
 practice: [
  { q: "Add a cycle to the pipeline (refresh_dashboard → extract_orders) and see what happens.", code: `from graphlib import TopologicalSorter, CycleError
pipeline = {"load": {"extract"}, "transform": {"load"}, "extract": {"transform"}}
try:
    list(TopologicalSorter(pipeline).static_order())
except CycleError as e:
    print("not a DAG:", e.args[1])` },
  { q: "A company has 3 nightly scripts started by cron at 1:00, 1:30 and 2:00. Last week the 1:00 one ran slow and the others used half-loaded data. Explain how an orchestrator fixes it.", a: "Model the scripts as tasks with dependencies (a >> b >> c). Each starts only when the previous one succeeds, regardless of time. Add retries for transient failures, an alert on failure, and a data check before the last step so incomplete data never reaches the dashboard." }
 ],
 check: [
  ["DAG stands for…", ["Data and graphs", "Directed acyclic graph", "Daily automated grid", "Data access gateway"], 1, "Tasks + dependencies, no cycles."],
  ["Main advantage over cron?", ["Faster CPU", "Dependencies, retries, alerts, history, backfills", "Free", "No Python"], 1, "Coordination."],
  ["Should Airflow tasks process 50 GB in memory?", ["Yes", "No: push heavy work to the warehouse/Spark", "Only at night", "Only with XCom"], 1, "Orchestrate, don't compute."]
 ],
 remember: [
  "Orchestrator = order + retries + alerts + history + backfills.",
  "Pipelines are DAGs.",
  "Airflow most common; Dagster/Prefect alternatives.",
  "Coordinate work; heavy lifting happens in warehouse/Spark."
 ]
},
{
 id: "concepts",
 title: "Airflow concepts: DAGs, tasks, scheduling",
 level: "Intermediate",
 one: "In Airflow you write a <b>DAG</b> in Python. Each <b>task</b> is a unit of work (an operator or a <code>@task</code> function). The <b>scheduler</b> creates a <b>DAG run</b> per schedule interval, with a <b>logical date</b> that tells tasks which period of data to process.",
 why: "These concepts (especially the logical date and data interval) are where most Airflow confusion and bugs come from, and they're asked in interviews.",
 steps: [
  { h: "A first DAG (TaskFlow API)",
    code: `import pendulum
from airflow.sdk import dag, task

@dag(schedule="@daily", start_date=pendulum.datetime(2025, 7, 1, tz="UTC"), catchup=False)
def orders_daily():
    @task
    def extract(ds=None):
        print("extract for", ds)
        return [1, 2, 3]

    @task
    def load(rows):
        print("loaded", len(rows))
        return len(rows)

    load(extract())          # calling one task with another's result sets the dependency

orders_daily()`, run: false,
    out: { text: "$ airflow dags test orders_daily 2025-07-05\nextract for 2025-07-05\nloaded 3\nDagRun finished: state=success", hand: true } },
  { h: "Key pieces",
    code: `DAG            the workflow: schedule, start_date, catchup, default_args, tags
task           one step; @task functions or operators (BashOperator, SQLExecuteQueryOperator,
               S3ToSnowflakeOperator, DbtCloudRunJobOperator, KubernetesPodOperator...)
dependencies   a >> b  (b after a),  [a, b] >> c,  or implicit via TaskFlow arguments
XCom           small values passed between tasks (ids, counts, paths), NOT datasets
DAG run        one execution of the DAG for one logical date
task instance  one task in one DAG run: queued, running, success, failed, up_for_retry
scheduler      decides what should run; executor runs it (Local, Celery, Kubernetes)`, lang: "text" },
  { h: "Logical date and data interval",
    p: ["A daily DAG run for the interval <b>July 5 00:00 → July 6 00:00</b> starts <b>after</b> the interval ends (on July 6), but its logical date (<code>ds</code>) is <b>2025-07-05</b>: the period of data it should process. Tasks must use <code>ds</code>/<code>data_interval_start</code>, never “today”."],
    code: `from datetime import datetime, timedelta

def daily_run(logical_date):
    start = logical_date
    end = start + timedelta(days=1)
    return {"ds": start.date().isoformat(), "data_interval": f"{start:%Y-%m-%d %H:%M} -> {end:%Y-%m-%d %H:%M}",
            "actually_starts_after": f"{end:%Y-%m-%d %H:%M}"}

for d in [datetime(2025, 7, 5), datetime(2025, 7, 6)]:
    print(daily_run(d))`,
    note: "So the query is <code>WHERE order_date = '{{ ds }}'</code> (or between data_interval_start and data_interval_end), never <code>current_date</code>." },
  { h: "Schedules",
    code: `"@daily" / "@hourly"      presets
"0 2 * * *"               cron: 02:00 every day (in the DAG's timezone)
"0 6 * * 1-5"             06:00 on weekdays
timedelta(minutes=30)     fixed interval
None                      only manual/triggered runs
[Asset("s3://.../orders")] data-aware: run when an upstream DAG updates this asset`, lang: "text" },
  { h: "Templates and Jinja",
    p: ["Operators accept Jinja templates filled per run: <code>{{ ds }}</code>, <code>{{ data_interval_start }}</code>, <code>{{ params.x }}</code>, <code>{{ var.value.y }}</code>. TaskFlow functions get the same values as keyword arguments (<code>ds=None</code>)."],
    code: `from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator

load_day = SQLExecuteQueryOperator(
    task_id="build_daily_revenue",
    conn_id="warehouse",
    sql="""
        DELETE FROM marts.daily_revenue WHERE day = '{{ ds }}';
        INSERT INTO marts.daily_revenue
        SELECT order_date, SUM(amount) FROM staging.orders
        WHERE order_date = '{{ ds }}' AND status = 'paid' GROUP BY order_date;
    """,
)`, lang: "python", run: false }
 ],
 mistakes: [
  "Using datetime.now()/current_date inside tasks instead of ds.",
  "Expecting the daily run for July 5 to start on July 5 (it starts after the interval ends).",
  "Passing DataFrames through XCom.",
  "Top-level code in DAG files that calls APIs/databases (runs on every parse)."
 ],
 practice: [
  { q: "Compute the data interval for an hourly DAG run with logical date 2025-07-05 13:00.", code: `from datetime import datetime, timedelta
start = datetime(2025, 7, 5, 13, 0)
print(f"{start:%H:%M} -> {start + timedelta(hours=1):%H:%M}, runs after {start + timedelta(hours=1):%Y-%m-%d %H:%M}")` },
  { q: "Write the dependency line for: extract_orders and extract_customers both before build_sales, then check, then notify.", a: "<code>[extract_orders, extract_customers] &gt;&gt; build_sales &gt;&gt; check &gt;&gt; notify</code>" }
 ],
 check: [
  ["What is ds for the daily run covering July 5?", ["2025-07-06", "2025-07-05", "Today", "Random"], 1, "Logical date = start of the interval."],
  ["XCom is for…", ["Large datasets", "Small values between tasks", "Logs", "Secrets"], 1, "Ids, counts, paths."],
  ["a >> b means…", ["b before a", "b runs after a succeeds", "Parallel", "Copy a to b"], 1, "Dependency."]
 ],
 remember: [
  "DAG of tasks; TaskFlow @task or operators.",
  "Each run has a logical date (ds) and data interval.",
  "Tasks process ds's data, never 'today'.",
  "XCom only for small values.",
  "No heavy top-level code in DAG files."
 ]
},
{
 id: "docker",
 title: "Running Airflow locally and in production",
 level: "Intermediate",
 one: "Run Airflow locally with <code>airflow standalone</code> or the official <b>Docker Compose</b> setup; in production use a managed service (MWAA, Cloud Composer, Astronomer) or Kubernetes. Keep secrets in <b>connections</b> (env vars or a secrets backend), not in DAG code.",
 why: "You'll need a local Airflow to develop and test DAGs, and you should know how teams deploy it and manage credentials safely.",
 steps: [
  { h: "Quick local start (pip)",
    code: `python -m venv .venv && source .venv/bin/activate
pip install "apache-airflow==3.*" --constraint \\
  "https://raw.githubusercontent.com/apache/airflow/constraints-3.1.0/constraints-3.12.txt"
export AIRFLOW_HOME=~/airflow
airflow standalone            # creates the DB, a user, starts scheduler + API server + UI
# open http://localhost:8080, put DAG files in ~/airflow/dags`, lang: "bash" },
  { h: "Docker Compose (team setup)",
    code: `curl -LfO 'https://airflow.apache.org/docs/apache-airflow/stable/docker-compose.yaml'
mkdir -p ./dags ./logs ./plugins ./config
echo "AIRFLOW_UID=$(id -u)" > .env
docker compose up airflow-init
docker compose up -d
docker compose ps        # api-server, scheduler, dag-processor, worker, triggerer, postgres, redis`, lang: "bash",
    out: { text: "NAME                       STATUS\nairflow-apiserver-1        Up (healthy)\nairflow-scheduler-1        Up (healthy)\nairflow-dag-processor-1    Up (healthy)\nairflow-worker-1           Up (healthy)\nairflow-triggerer-1        Up (healthy)\npostgres-1                 Up (healthy)\nredis-1                    Up (healthy)", hand: true } },
  { h: "Testing a DAG without the UI",
    code: `airflow dags list                                  # did it parse?
airflow dags list-import-errors                    # why not?
airflow tasks test shop_daily extract 2025-07-05   # run one task, no state saved
airflow dags test shop_daily 2025-07-05            # run the whole DAG once, in-process`, lang: "bash" },
  { h: "Connections and secrets",
    p: ["Tasks get credentials from <b>connections</b> by id (<code>conn_id=\"warehouse\"</code>). Define them as environment variables in dev, and a secrets backend (AWS Secrets Manager, GCP Secret Manager, Vault) in production. Never hardcode passwords in DAG files: DAG code is in Git and visible in the UI."],
    code: `# dev: environment variable (URI or JSON form)
export AIRFLOW_CONN_WAREHOUSE='postgresql://etl_user:s3cret@db.internal:5432/analytics'
export AIRFLOW_VAR_SHOP_API_BASE='https://api.example-shop.com'

# in a task
from airflow.providers.postgres.hooks.postgres import PostgresHook
rows = PostgresHook(postgres_conn_id="warehouse").get_records("SELECT COUNT(*) FROM orders")`, lang: "bash" },
  { h: "Production setups",
    code: `managed      AWS MWAA, GCP Cloud Composer, Astronomer   least ops work, costs more
Kubernetes   official Helm chart, KubernetesExecutor     flexible, needs k8s skills
executors    LocalExecutor (one machine), CeleryExecutor (worker pool),
             KubernetesExecutor (a pod per task)
deploy DAGs  Git → CI (lint, import test, unit tests) → sync to the DAGs bucket/image`, lang: "text" }
 ],
 mistakes: [
  "Passwords in DAG files or in Airflow Variables visible to everyone.",
  "Installing Airflow without the constraints file (dependency conflicts).",
  "Developing only in the UI, never with airflow dags test.",
  "Running production on the default SQLite + SequentialExecutor."
 ],
 practice: [
  { q: "Your DAG doesn't appear in the UI. List the first three things you check.", a: "1) <code>airflow dags list-import-errors</code> (syntax/import error in the file). 2) The file is in the DAGs folder the scheduler/dag-processor reads, and contains a DAG object at module level (the decorated function is called). 3) The DAG isn't paused/filtered and the dag-processor has re-parsed it (wait or check its logs)." },
  { q: "Write the environment variable that defines a connection named <code>shop_api</code> of type HTTP with host api.example-shop.com and a token in the password.", a: "<code>export AIRFLOW_CONN_SHOP_API='http://:MY_TOKEN@api.example-shop.com/'</code> (or the JSON form <code>{\"conn_type\": \"http\", \"host\": \"api.example-shop.com\", \"password\": \"MY_TOKEN\"}</code>). In production keep it in a secrets backend." }
 ],
 check: [
  ["Where do credentials belong?", ["DAG code", "Connections from env vars/secrets backend", "XCom", "Task names"], 1, "Never in Git."],
  ["Run a whole DAG once locally without the scheduler?", ["airflow dags test", "airflow db reset", "airflow run all", "docker kill"], 0, "In-process test run."],
  ["Managed Airflow on AWS is…", ["Glue", "MWAA", "Lambda", "EMR"], 1, "Managed Workflows for Apache Airflow."]
 ],
 remember: [
  "Local: airflow standalone or Docker Compose.",
  "airflow dags test / tasks test / list-import-errors.",
  "Secrets in connections via env vars or a secrets backend.",
  "Production: managed service or Helm on Kubernetes; CI tests DAGs."
 ]
},
{
 id: "retries-alerts",
 title: "Retries, timeouts and alerts",
 level: "Intermediate",
 one: "Make DAGs resilient: <b>retries</b> with backoff for transient failures, <b>timeouts</b> so stuck tasks fail, <b>failure callbacks</b> that alert a human, and checks for <b>lateness</b> so you know before your users do.",
 why: "APIs time out and databases restart. A pipeline that retries sensibly and alerts clearly is the difference between a quiet night and an angry morning.",
 steps: [
  { h: "Retries with exponential backoff",
    code: `import pathlib, pendulum
from datetime import timedelta
from airflow.sdk import dag, task

def notify_failure(context):
    ti = context["ti"]
    print(f"ALERT: {ti.dag_id}.{ti.task_id} failed for {context['ds']} after {ti.try_number} tries")

@dag(schedule="@daily", start_date=pendulum.datetime(2025, 7, 1, tz="UTC"), catchup=False,
     default_args={"retries": 3, "retry_delay": timedelta(seconds=1), "retry_exponential_backoff": True,
                   "on_failure_callback": notify_failure})
def flaky_api():
    @task
    def call_api():
        counter = pathlib.Path("/tmp/flaky_counter")
        n = int(counter.read_text()) + 1 if counter.exists() else 1
        counter.write_text(str(n))
        if n < 3:
            raise ConnectionError(f"attempt {n}: API timed out")
        print(f"attempt {n}: got 120 orders")
        return 120
    call_api()

flaky_api()`, run: false,
    out: { text: "$ airflow dags test flaky_api 2025-07-05\n[error] Task failed with exception\nConnectionError: attempt 1: API timed out\n(task up_for_retry)\n[error] Task failed with exception\nConnectionError: attempt 2: API timed out\n(task up_for_retry, waiting longer this time)\nattempt 3: got 120 orders\nDagRun finished: state=success", hand: true },
    note: "Two transient failures, then success on the third try, with no human involved." },
  { h: "When retries run out: the alert",
    p: ["The same DAG with <code>retries: 1</code> against an API that's really down:"],
    code: `ConnectionError: attempt 1: API timed out
ConnectionError: attempt 2: API timed out
ALERT: always_down.call_api failed for 2025-07-05 after 2 tries
DagRun failed`, lang: "text",
    note: "In real DAGs the callback posts to Slack/Teams/PagerDuty or sends an email, with the DAG, task, date and a link to the log." },
  { h: "What to retry, and how much",
    code: `retry      network timeouts, 429/503 from APIs, warehouse busy, lost worker
don't      bad credentials, SQL syntax errors, failed data checks (fail fast, alert)
how        retries=2-3, retry_delay 5 min, exponential backoff, max_retry_delay cap
timeouts   execution_timeout=timedelta(hours=1) on each task (stuck tasks fail)
           dagrun_timeout on the DAG; sensors with timeout and mode="reschedule"`, lang: "text" },
  { h: "Backoff maths",
    code: `from datetime import timedelta

def retry_waits(retries, base=timedelta(minutes=5), cap=timedelta(minutes=60)):
    return [min(base * 2 ** i, cap) for i in range(retries)]

for wait in retry_waits(5):
    print(f"wait {int(wait.total_seconds() // 60)} min")`,
    note: "Waiting longer each time gives a struggling API room to recover. Airflow also adds jitter so many tasks don't retry at the same moment." },
  { h: "Alerting on lateness, not just failure",
    p: ["A DAG that silently never starts (scheduler down, paused, upstream stuck) doesn't fail. Add a freshness check: a separate monitor (or the last task) that alerts if <code>max(loaded_at)</code> in the target table is older than expected. Airflow 3 also has <b>deadline alerts</b> on DAG runs."] }
 ],
 mistakes: [
  "Retrying data-quality failures (same bad data, same failure, just later).",
  "No execution_timeout, so a hung task blocks everything for days.",
  "Alerts that fire for every retry (alert fatigue).",
  "Only alerting on failure, never on lateness."
 ],
 practice: [
  { q: "Write default_args for a DAG: 3 retries, 5-minute delay with exponential backoff capped at 30 minutes, 1-hour task timeout, Slack alert callback named slack_alert.", code: `from datetime import timedelta
default_args = {
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
    "max_retry_delay": timedelta(minutes=30),
    "execution_timeout": timedelta(hours=1),
    "on_failure_callback": "slack_alert",   # pass the real function in your DAG
}
print(sorted(default_args))`},
  { q: "A task fails every night at 2:05 with “password authentication failed”. Should you add retries?", a: "No. Credentials are not a transient problem; retries just delay the alert. Fail fast, alert, and fix the connection (rotate/update the secret). Retries are for transient errors like timeouts and 503s." }
 ],
 check: [
  ["Which failure should be retried?", ["SQL syntax error", "API 503 / timeout", "Wrong password", "Failed data check"], 1, "Transient."],
  ["Why execution_timeout?", ["Speed", "Stuck tasks fail instead of hanging forever", "Cost reporting", "Required"], 1, "Visible failure."],
  ["A DAG never started. Who notices?", ["Failure callback", "A freshness/lateness check", "Retries", "XCom"], 1, "No failure means no failure alert."]
 ],
 remember: [
  "Retries + exponential backoff for transient errors only.",
  "execution_timeout on tasks; dagrun timeouts.",
  "on_failure_callback → Slack/PagerDuty with context.",
  "Alert on lateness/freshness too."
 ]
},
{
 id: "backfills",
 title: "Backfills, catchup and idempotent tasks",
 level: "Intermediate",
 one: "A <b>backfill</b> runs a DAG for past logical dates: to load history, or to fix data after a bug. It only works safely if every task is <b>idempotent</b> and processes exactly its own <code>ds</code>.",
 why: "Every data team backfills regularly. A DAG that can't be safely re-run for any date will eventually corrupt data.",
 steps: [
  { h: "catchup",
    p: ["With <code>catchup=True</code>, enabling a DAG with <code>start_date</code> 2025-01-01 immediately creates a run for every missed interval up to today. That's usually not what you want by accident: keep <code>catchup=False</code> and run backfills deliberately."] },
  { h: "Running a backfill",
    code: `# Airflow 3
airflow backfill create --dag-id shop_daily \\
    --from-date 2025-07-01 --to-date 2025-07-07 \\
    --max-active-runs 2 \\
    --reprocess-behavior failed      # none | failed | completed

# or from the UI: DAG → Trigger → Backfill`, lang: "bash" },
  { h: "Idempotent tasks make re-runs safe",
    p: ["This DAG (the project in the next lesson) loads with upserts and rebuilds each day's revenue with delete + insert, so running a date twice changes nothing:"],
    code: `$ airflow dags test shop_daily 2025-07-04
extracted 3 orders for 2025-07-04
daily_revenue: [('2025-07-04', 2, 1400)]
checks passed for 2025-07-04

$ airflow dags test shop_daily 2025-07-05
extracted 2 orders for 2025-07-05
daily_revenue: [('2025-07-05', 2, 1650)]
checks passed for 2025-07-05

$ airflow dags test shop_daily 2025-07-05      # re-run the same day
extracted 2 orders for 2025-07-05
daily_revenue: [('2025-07-05', 2, 1650)]
checks passed for 2025-07-05

warehouse after 3 runs: daily_revenue = [('2025-07-04', 2, 1400), ('2025-07-05', 2, 1650)], orders = 5 rows`, lang: "text" },
  { h: "Rules for backfill-safe tasks",
    code: `process only the run's interval        WHERE day = '{{ ds }}' / data_interval_start..end
write by replacing that interval        delete+insert, INSERT OVERWRITE partition, MERGE by key
no "now" or "latest" logic              no current_date, no "since last run" state in tasks
deterministic output                    same inputs → same rows (see the dbt course)
mind upstream limits                    max_active_runs, pools, API rate limits during backfills`, lang: "text" },
  { h: "Simulating a safe backfill",
    code: `import sqlite3
from datetime import date, timedelta

src = sqlite3.connect(":memory:")
src.execute("CREATE TABLE orders (day TEXT, amount INT)")
src.executemany("INSERT INTO orders VALUES (?, ?)", [("2025-07-01", 500), ("2025-07-01", 700), ("2025-07-02", 300),
                                                       ("2025-07-03", 900), ("2025-07-03", 100)])
src.execute("CREATE TABLE daily (day TEXT PRIMARY KEY, revenue INT)")

def task(ds):                                       # idempotent, processes only ds
    with src:
        src.execute("DELETE FROM daily WHERE day = ?", (ds,))
        src.execute("INSERT INTO daily SELECT day, SUM(amount) FROM orders WHERE day = ? GROUP BY day", (ds,))

def backfill(start, end):
    d = start
    while d <= end:
        task(d.isoformat()); d += timedelta(days=1)

backfill(date(2025, 7, 1), date(2025, 7, 3))
src.execute("UPDATE orders SET amount = 1000 WHERE day = '2025-07-02'")   # source fixed for July 2
backfill(date(2025, 7, 2), date(2025, 7, 2))                              # re-run just that day
print(src.execute("SELECT * FROM daily ORDER BY day").fetchall())` }
 ],
 mistakes: [
  "catchup=True by accident: hundreds of runs hammer the source.",
  "Tasks that append, so backfills duplicate data.",
  "Tasks that read 'latest' data instead of the run's interval.",
  "Backfilling with unlimited parallelism and hitting API limits."
 ],
 practice: [
  { q: "Rewrite this task to be backfill-safe: <code>INSERT INTO daily SELECT current_date, SUM(amount) FROM orders WHERE order_date = current_date - 1</code>", a: "Use the logical date and replace the partition: <code>DELETE FROM daily WHERE day = '{{ ds }}'; INSERT INTO daily SELECT '{{ ds }}', SUM(amount) FROM orders WHERE order_date = '{{ ds }}';</code> in one transaction." },
  { q: "You found a bug that affected revenue for March. What's the plan?", a: "1) Fix and deploy the transformation. 2) Backfill March: <code>airflow backfill create --dag-id … --from-date 2025-03-01 --to-date 2025-03-31 --reprocess-behavior completed</code> with limited concurrency. 3) Check totals against the source. 4) Tell dashboard users that March numbers were corrected and why." }
 ],
 check: [
  ["Safe default for catchup?", ["True", "False, backfill on purpose", "Depends on weather", "Unset"], 1, "Avoid surprise runs."],
  ["What makes a backfill safe?", ["Fast workers", "Idempotent tasks processing only their ds", "More retries", "Bigger DB"], 1, "Replace per interval."],
  ["During a big backfill, limit…", ["Nothing", "max_active_runs / pools to protect sources", "Logging", "Tests"], 1, "Don't overload upstream."]
 ],
 remember: [
  "Backfill = run past logical dates.",
  "catchup=False by default; backfill deliberately.",
  "Tasks process only their interval and replace it.",
  "Limit concurrency during backfills; verify afterwards."
 ]
},
{
 id: "build",
 title: "Project: an orchestrated daily pipeline",
 level: "Project",
 one: "Build an Airflow DAG that runs a daily pipeline end to end: extract a day of orders, upsert them, rebuild that day's revenue, and run checks, with retries, a sensible schedule and tests that prove the DAG loads correctly.",
 why: "An orchestrated, tested, backfill-safe DAG is what data engineering teams expect you to deliver. It ties together everything in the path.",
 steps: [
  { h: "The DAG",
    code: SHOP_DAG, run: false,
    note: "extract → load → transform → check. Every task works only on its <code>ds</code>, loads are upserts and the daily table is replaced per day, so retries and backfills are safe. (The fake data stands in for an API call so the DAG runs anywhere.)" },
  { h: "Run it",
    code: `$ airflow dags test shop_daily 2025-07-04
extracted 3 orders for 2025-07-04
daily_revenue: [('2025-07-04', 2, 1400)]
checks passed for 2025-07-04`, lang: "text" },
  { h: "DAG tests in CI",
    code: `# tests/test_dags.py   (run with: pytest tests)
from airflow.dag_processing.dagbag import DagBag

def test_no_import_errors():
    bag = DagBag(dag_folder="dags")
    assert bag.import_errors == {}

def test_shop_daily_shape():
    dag = DagBag(dag_folder="dags").get_dag("shop_daily")
    assert {t.task_id for t in dag.tasks} == {"extract", "load", "transform", "check"}
    assert all(t.retries >= 1 for t in dag.tasks)
    assert dag.catchup is False`, lang: "python", run: false,
    out: { text: "..                                                                       [100%]\n2 passed in 1.37s", hand: true } },
  { h: "From demo to real",
    code: `replace FAKE_ORDERS      call the shop API with httpx (incremental, paginated) and write raw JSON to S3
replace sqlite           warehouse connection via PostgresHook/SnowflakeHook (conn_id from secrets)
transform                dbt: DbtCloudRunJobOperator, or BashOperator("dbt build --select ... --vars ...")
alerts                   on_failure_callback → Slack; freshness check on daily_revenue
deploy                   GitHub Actions: lint + pytest tests → sync dags/ to MWAA/Composer bucket`, lang: "text" },
  { h: "Portfolio checklist",
    p: ["README with the DAG graph screenshot, what each task does, schedule and timezone, how retries/alerts work, how to backfill, and how to run it locally with Docker Compose. Show a backfill of a week and the re-run producing identical numbers."] }
 ],
 mistakes: [
  "Tasks that work on 'today' instead of ds.",
  "No checks task, so bad data passes silently.",
  "No DAG import test in CI (a typo takes down every DAG in the file)."
 ],
 practice: [
  { q: "Add a fifth task, notify, that runs only after check succeeds and prints a summary. Where does it go in the dependency line?", a: "Define <code>@task def notify(ds=None): print(f\"shop_daily done for {ds}\")</code> and extend the chain: <code>loaded &gt;&gt; transform() &gt;&gt; check(loaded) &gt;&gt; notify()</code>." },
  { q: "The shop API has a rate limit of 60 requests/minute and you need to backfill a year. What do you set?", a: "Limit concurrency: <code>max_active_runs=1</code> (or 2) on the DAG or a pool with a few slots for the extract task; keep retries with exponential backoff for 429s; consider a bulk export endpoint for the historical load instead of day-by-day calls." }
 ],
 check: [
  ["Why does load use an upsert?", ["Speed", "Retries/backfills don't duplicate orders", "Required by Airflow", "Smaller DB"], 1, "Idempotency."],
  ["What does the DAG import test catch?", ["Slow queries", "Syntax/import errors and wrong DAG structure before deploy", "Bad data", "API outages"], 1, "Cheap safety net."],
  ["Where do real credentials come from?", ["DAG file", "Airflow connections backed by a secrets store", "XCom", "Task names"], 1, "Never in code."]
 ],
 remember: [
  "extract → load (upsert) → transform (replace ds) → check.",
  "Retries, catchup=False, max_active_runs, timezone-aware schedule.",
  "pytest DagBag tests in CI.",
  "Swap fakes for hooks/connections and dbt in production."
 ]
}
];
