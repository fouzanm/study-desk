module.exports = {
 title: "dbt & Transformations",
 description: "ELT, idempotent and incremental transformations, dbt models, tests, docs and snapshots, all run for real on DuckDB, ending with a tested dbt project.",
 lessons: [
  ["elt", "ETL vs ELT and the modern data stack"],
  ["idempotent", "Idempotent, re-runnable transformations"],
  ["incremental", "Incremental models"],
  ["dbt-basics", "dbt basics: models, ref, sources and layers"],
  ["dbt-tests", "Testing and documenting with dbt"],
  ["build", "Project: a tested dbt project"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["ELT means…", ["Transform then load", "Load raw first, transform inside the warehouse", "Only extract", "Event streaming"], 1, "The modern default."],
  ["Main advantage of keeping raw data in the warehouse?", ["Looks nice", "You can re-transform any time without re-extracting", "Lower security", "No SQL needed"], 1, "Replayability."],
  ["Where should the definition of 'revenue' live?", ["Each dashboard", "One dbt mart model, tested and documented", "The extract script", "Excel"], 1, "One source of truth."],
  ["An idempotent transformation…", ["Runs fast", "Gives the same result when run again", "Appends always", "Uses Python only"], 1, "Safe retries."],
  ["An INSERT-only daily job is retried. Result?", ["Fine", "Doubled numbers", "Error", "Nothing"], 1, "Use replace/merge."],
  ["Why avoid now() inside transformation logic?", ["Slow", "Reruns/backfills compute different results", "Not allowed in SQL", "Timezones"], 1, "Pass the run date in."],
  ["ROW_NUMBER dedupe picks random rows when…", ["Never", "ORDER BY has ties", "Partitioned", "On views"], 1, "Add a tie-breaker."],
  ["A backfill is…", ["Deleting history", "Re-running a job for past dates", "A test", "A dashboard"], 1, "Easy when jobs are idempotent."],
  ["Incremental models help because…", ["They're simpler", "They process only new/changed rows of big tables", "They skip tests", "They're views"], 1, "Speed and cost."],
  ["unique_key in an incremental model…", ["Adds an index", "Makes dbt merge updated rows instead of duplicating", "Partitions", "Sorts"], 1, "Merge key."],
  ["How do you catch late-arriving rows?", ["You can't", "Lookback window + merge on unique key", "Full refresh every minute", "Ignore them"], 1, "Small safe overlap."],
  ["After changing an incremental model's logic, run…", ["dbt test", "dbt run --full-refresh for that model", "Nothing", "dbt seed"], 1, "Rebuild history."],
  ["ref('stg_orders') gives…", ["A comment", "A dependency edge in the DAG and the right table name", "A test", "A seed"], 1, "Build order."],
  ["Typical materialisation for staging models?", ["Incremental", "View", "Snapshot", "Seed"], 1, "Thin cleanup layer."],
  ["Select a model and everything downstream?", ["+model", "model+", "@model", "model-"], 1, "Plus after = downstream."],
  ["Sources (source()) are for…", ["Mart models", "Declaring raw tables, lineage and freshness checks", "Macros", "Seeds"], 1, "Where data comes from."],
  ["A dbt test passes when its query returns…", ["0 rows", "1 row", "An error", "All rows"], 0, "Tests select failing rows."],
  ["Minimum tests for a primary key?", ["None", "unique + not_null", "accepted_values", "relationships"], 1, "Always."],
  ["relationships test checks…", ["Duplicates", "Every foreign key exists in the parent", "Nulls", "Ranges"], 1, "Referential integrity."],
  ["dbt build with a failing test…", ["Ignores it", "Skips the models downstream of it", "Deletes data", "Loops"], 1, "Stops bad data spreading."],
  ["Business rule like 'refunds < 10% of revenue' is tested with…", ["accepted_values", "A singular SQL test", "Seeds", "Docs"], 1, "Custom SQL in tests/."],
  ["dbt snapshots implement…", ["Backups", "SCD Type 2 history", "Incremental append", "Caching"], 1, "valid_from/valid_to."],
  ["What should CI run on every PR?", ["dbt docs", "dbt build (models + tests), ideally state:modified+", "Nothing", "dbt seed only"], 1, "Test before merge."]
 ]
};
