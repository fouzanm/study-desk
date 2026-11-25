module.exports = {
 title: "Data Pipeline",
 description: "Portfolio project: API → lake → warehouse → dbt → dashboard, with CI, Docker, failure scenarios (late data, duplicates, schema changes), Airflow scheduling and a runbook.",
 lessons: [
  ["git-ci", "Git workflow and CI for data"],
  ["docker", "Docker-ize the stack"],
  ["dashboard", "Serve: a dashboard on your marts"],
  ["failures", "Failure scenarios: late data, duplicates, schema changes"],
  ["ship", "Ship: the end-to-end pipeline"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["What should CI run for a data repo?", ["Nothing", "Lint, pytest and dbt build on sample data", "Production loads", "Dashboards"], 1, "Catch breakage before merge."],
  ["CI should use…", ["Production credentials", "Sample data on a throwaway warehouse", "Real customer data", "No data"], 1, "Fast and safe."],
  ["Changes reach main through…", ["Direct pushes", "Pull requests with green CI and review", "Email", "Copy-paste"], 1, "Reviewed changes."],
  ["Dev vs prod differences should live in…", ["Code branches", "Environment variables", "Comments", "Separate images"], 1, "One image."],
  ["MinIO is used locally as…", ["A warehouse", "S3-compatible storage", "An orchestrator", "A BI tool"], 1, "Local S3."],
  ["Dashboards should read from…", ["Raw tables", "Marts", "The source API", "CSV exports"], 1, "Tested, business-ready."],
  ["Average order value is…", ["Average of daily averages", "Total revenue / total orders", "Max order", "Median of cities"], 1, "Ratio of totals."],
  ["Every dashboard should show…", ["Animations", "A 'data as of' timestamp and source", "20 charts", "Raw SQL"], 1, "Freshness and trust."],
  ["The API sends a record twice. The fix is…", ["Delete raw files", "Dedupe latest per key in staging + unique test", "Ignore", "Fix in the dashboard"], 1, "Staging dedupe."],
  ["A late refund should…", ["Be ignored", "Update the order's latest version so revenue is corrected on rebuild", "Create a new order", "Delete history"], 1, "Rebuild from latest."],
  ["Which date should orders be reported on?", ["updated_at", "An immutable created/order date", "Load date", "Today"], 1, "Business date."],
  ["The source renamed amount → amount_inr. The pipeline should…", ["Load nulls", "Block the load and alert", "Guess", "Drop the column"], 1, "Schema check."],
  ["What proves the pipeline is idempotent?", ["A comment", "Re-running a day gives identical numbers (tested)", "Fast runs", "Logs"], 1, "Evidence."],
  ["Why does the run take a date parameter?", ["Logging", "Re-runs and backfills for any day", "Required by dbt", "Style"], 1, "Re-runnable."],
  ["Airflow setting that avoids overlapping daily runs?", ["catchup=True", "max_active_runs=1", "retries=0", "No schedule"], 1, "One at a time."],
  ["A runbook contains…", ["Source code", "Alert → action steps, backfill commands, owners", "Marketing copy", "Licenses"], 1, "Operations guide."],
  ["Partial extract (half the usual rows) is caught by…", ["Unit tests", "A volume check vs same weekday", "Linting", "Dashboards"], 1, "Volume monitoring."],
  ["To scale 100x you would first…", ["Buy a bigger laptop", "Partitioned Parquet/Iceberg, incremental loads/models, a cloud warehouse", "Add more dashboards", "Remove tests"], 1, "Incremental and partitioned."],
  ["Best README opening?", ["License", "Problem, architecture diagram and dashboard screenshot", "Folder tree", "Changelog"], 1, "Lead with value."],
  ["Why keep raw files per day (dt= folders)?", ["Pretty", "Replace a day on re-run and replay history", "Required by S3", "Smaller"], 1, "Idempotent extracts and replay."]
 ]
};
