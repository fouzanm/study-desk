module.exports = {
 title: "Spark & Big Data",
 description: "When to use Spark, how drivers, executors, partitions and shuffles work, PySpark DataFrames, performance tuning, Spark SQL and Delta Lake, ending with a tested Spark batch job.",
 lessons: [
  ["why", "Why Spark: when data outgrows one machine"],
  ["architecture", "Spark architecture: driver, executors, partitions, shuffles"],
  ["dataframes", "PySpark DataFrames"],
  ["performance", "Spark performance: joins, skew, files"],
  ["spark-sql", "Spark SQL, Delta Lake and lakehouse tables"],
  ["build", "Project: a Spark batch job"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["When is Spark the right tool?", ["2 GB CSV on a laptop", "Hundreds of GB to TBs of lake data or heavy distributed joins", "A single API call", "Small dashboards"], 1, "Otherwise DuckDB/Polars/warehouse."],
  ["Spark transformations are…", ["Run immediately", "Lazy until an action", "Never run", "Run twice"], 1, "Actions trigger execution."],
  ["Which is an action?", ["filter", "select", "count", "withColumn"], 2, "count runs the job."],
  ["Why avoid collect() on big data?", ["It's deprecated", "It pulls all rows onto the driver", "It's slow to type", "It deletes data"], 1, "Driver out of memory."],
  ["One Spark task processes…", ["One job", "One partition", "One cluster", "One column"], 1, "Tasks ↔ partitions."],
  ["Which causes a shuffle?", ["filter", "withColumn", "groupBy", "select"], 2, "Wide transformation."],
  ["In a physical plan, a shuffle appears as…", ["Project", "Exchange", "Filter", "Scan"], 1, "Exchange = data movement."],
  ["coalesce(n) vs repartition(n)?", ["Same", "coalesce merges partitions without a full shuffle", "coalesce always shuffles", "repartition can't increase"], 1, "Cheaper reduction."],
  ["A good partition size target is roughly…", ["1 KB", "100–200 MB", "50 GB", "1 row"], 1, "Balance parallelism and overhead."],
  ["When should you cache a DataFrame?", ["Always", "When it's reused several times", "Never", "Before every write"], 1, "And unpersist after."],
  ["Why define a schema when reading CSV/JSON?", ["Required", "Correct types and no slow inference", "Encryption", "Smaller output"], 1, "Faster and safer."],
  ["Prefer built-in functions over Python UDFs because…", ["Shorter", "They run optimised in the JVM; UDFs serialise rows to Python", "UDFs are banned", "Same speed"], 1, "Big performance gap."],
  ["Running total per customer needs…", ["groupBy", "A window with an ordered frame", "distinct", "union"], 1, "Window functions."],
  ["Big fact table joined to a 5 MB dimension: best strategy?", ["Sort-merge join", "Broadcast the dimension", "Cross join", "collect both"], 1, "Avoid shuffling the big side."],
  ["Data skew means…", ["Wrong schema", "A few keys hold most rows, so a few tasks run far longer", "Too many columns", "Old Spark"], 1, "Uneven work."],
  ["One way to fix skew in aggregations?", ["coalesce(1)", "Salt the hot key and aggregate twice", "More retries", "Python loops"], 1, "Spreads the hot key; AQE can help."],
  ["Thousands of tiny output files cause…", ["Faster reads", "Slow reads and listing overhead later", "Nothing", "Smaller bills always"], 1, "Compact / coalesce."],
  ["Spark SQL vs DataFrame API?", ["SQL is slower", "Both compile to the same optimised plan", "DataFrames can't join", "SQL can't window"], 1, "Use whichever is clearer."],
  ["Delta Lake/Iceberg add to Parquet…", ["Nothing", "ACID log: MERGE, DELETE, time travel", "JSON support", "Dashboards"], 1, "Lakehouse tables."],
  ["Re-process July only in a month-partitioned Parquet table?", ["Overwrite everything", "Dynamic partition overwrite", "Append", "Delete the lake"], 1, "Replaces only July."],
  ["Why keep transformation functions separate from file I/O?", ["Style", "To unit test them with tiny DataFrames", "Spark requires it", "Speed"], 1, "Testability."],
  ["How does Airflow usually run a Databricks/EMR Spark job?", ["Inside the scheduler", "Submits it with the run date ({{ ds }}) as a parameter", "Copies data to XCom", "Via email"], 1, "Orchestrate; Spark computes."]
 ]
};
