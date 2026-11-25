module.exports = {
 title: "Airflow & Orchestration",
 description: "Why orchestration beats cron, DAGs and logical dates, running Airflow, retries and alerts, safe backfills, ending with a tested daily pipeline DAG.",
 lessons: [
  ["why", "Why orchestration: beyond cron"],
  ["concepts", "Airflow concepts: DAGs, tasks, scheduling"],
  ["docker", "Running Airflow locally and in production"],
  ["retries-alerts", "Retries, timeouts and alerts"],
  ["backfills", "Backfills, catchup and idempotent tasks"],
  ["build", "Project: an orchestrated daily pipeline"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["What does an orchestrator add over cron?", ["Faster CPUs", "Dependencies, retries, alerts, history and backfills", "Free hosting", "SQL"], 1, "Coordination."],
  ["A DAG must not contain…", ["Tasks", "Cycles", "Python", "Schedules"], 1, "Directed acyclic graph."],
  ["Where should heavy data processing happen?", ["Inside Airflow workers", "In the warehouse, dbt or Spark, triggered by Airflow", "In XCom", "In the scheduler"], 1, "Orchestrate, don't compute."],
  ["In TaskFlow, load(extract()) means…", ["Parallel", "load runs after extract and receives its return value", "extract after load", "Nothing"], 1, "Implicit dependency via XCom."],
  ["XCom should carry…", ["DataFrames", "Small values like ids, counts, paths", "Files", "Passwords"], 1, "Keep it small."],
  ["The daily run covering July 5 has ds =", ["2025-07-06", "2025-07-05", "Today", "2025-07-04"], 1, "Logical date = interval start."],
  ["When does that run actually start?", ["July 5 00:00", "After the interval ends (July 6)", "Random", "On deploy"], 1, "Data must be complete first."],
  ["Tasks should filter data by…", ["current_date", "ds / data_interval_start", "now()", "max(id)"], 1, "Backfill-safe."],
  ["Why avoid API calls at the top level of DAG files?", ["Style", "DAG files are parsed constantly; the calls run on every parse", "Not allowed", "Security"], 1, "Slow and costly parsing."],
  ["Where do credentials live?", ["DAG code", "Connections from env vars or a secrets backend", "Variables in Git", "Task ids"], 1, "Never in code."],
  ["Run a whole DAG once locally for a date?", ["airflow dags test <dag> <date>", "airflow db reset", "docker rm", "airflow users create"], 0, "In-process run."],
  ["Managed Airflow on GCP is…", ["Dataflow", "Cloud Composer", "BigQuery", "Pub/Sub"], 1, "AWS: MWAA."],
  ["Which error deserves retries?", ["SQL syntax error", "API timeout / 503", "Wrong password", "Failed data check"], 1, "Transient only."],
  ["retry_exponential_backoff does what?", ["Retries faster", "Waits longer between each retry", "Skips retries", "Alerts"], 1, "Gives the source time to recover."],
  ["Why set execution_timeout?", ["Cost", "Hung tasks fail visibly instead of blocking forever", "Required", "Logging"], 1, "Fail loudly."],
  ["on_failure_callback is used to…", ["Retry", "Alert people (Slack, email, PagerDuty)", "Skip tasks", "Backfill"], 1, "Tell a human."],
  ["A DAG silently never ran last night. What catches it?", ["Retries", "A freshness/lateness check or deadline alert", "XCom", "catchup"], 1, "No run means no failure."],
  ["Safe default for catchup?", ["True", "False", "Always unset", "Random"], 1, "Backfill deliberately."],
  ["What makes backfills safe?", ["More workers", "Idempotent tasks that process and replace only their interval", "Bigger DB", "Retries"], 1, "Replace per ds."],
  ["During a one-year backfill against a rate-limited API, set…", ["Unlimited parallelism", "max_active_runs/pools low + backoff", "No retries", "catchup=True"], 1, "Protect the source."],
  ["Why upsert in the load task?", ["Faster", "Retries/backfills don't duplicate rows", "Airflow requires it", "Smaller files"], 1, "Idempotency."],
  ["A DagBag import test in CI catches…", ["Bad data", "Import/syntax errors and wrong DAG structure before deploy", "Slow SQL", "API outages"], 1, "Cheap safety net."]
 ]
};
