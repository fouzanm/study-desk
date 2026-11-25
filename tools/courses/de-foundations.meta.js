module.exports = {
 title: "Data Engineering Foundations",
 description: "What data engineers do, OLTP vs OLAP, pandas, incremental API extraction and idempotent loads, ending with a working pipeline you can re-run safely.",
 lessons: [
  ["role", "What data engineers do"],
  ["oltp-olap", "OLTP vs OLAP: app databases and analytics databases"],
  ["pandas", "pandas for data engineering"],
  ["extract-api", "Extracting data from APIs incrementally"],
  ["load-upsert", "Loading data safely: idempotent upserts"],
  ["build-extractor", "Project: an incremental API-to-warehouse pipeline"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["The main job of a data engineer is…", ["Designing UIs", "Delivering correct, timely data through reliable pipelines", "Only training models", "Managing laptops"], 1, "Pipelines that people can trust."],
  ["Which needs streaming rather than batch?", ["Monthly finance report", "Blocking fraudulent card payments", "Daily sales dashboard", "Quarterly board deck"], 1, "Decisions within seconds."],
  ["OLTP databases are built for…", ["Huge scans", "Many small reads/writes of single rows", "Only analytics", "Files"], 1, "Running applications."],
  ["Why are columnar warehouses fast for SUM(total)?", ["They cache everything", "They read only the needed column, compressed", "They skip rows", "GPUs"], 1, "Less data read."],
  ["Heavy reports slow down the production app. First fix?", ["Bigger laptop", "Use a read replica, then move analytics to a warehouse", "Run reports at noon", "Delete indexes"], 1, "Keep analytics off production."],
  ["Parquet vs CSV for analytics?", ["CSV is better", "Parquet: typed, compressed, columnar", "Same", "Parquet can't store dates"], 1, "Parquet is the lake standard."],
  ["pandas merge silently doubled your rows. Likely cause?", ["Bug in pandas", "Duplicate keys on the 'one' side", "Wrong sort", "Too many columns"], 1, "Use validate='many_to_one'."],
  ["'Kochi', 'kochi ' and 'KOCHI' appear as separate groups. Fix?", ["Ignore", "Normalise text: strip + title/lower", "Drop the column", "Sort"], 1, "Clean text before grouping."],
  ["Data is larger than your RAM. Best option?", ["pandas anyway", "DuckDB, Polars, chunked reads or Spark", "Excel", "Delete rows"], 1, "pandas is in-memory."],
  ["Incremental extraction means…", ["Download everything daily", "Only fetch records changed since the last watermark", "Random sampling", "Streaming only"], 1, "updated_since = watermark."],
  ["After a run, the watermark should be…", ["Now()", "The max updated_at actually received", "Midnight", "Zero"], 1, "Never skip late-arriving records."],
  ["When should you save the new watermark?", ["Before extracting", "After the load succeeds", "Every page", "Never"], 1, "Otherwise a failed load loses data."],
  ["Why overlap the watermark by a little?", ["Speed", "Catch records that arrived late; upserts make re-reads safe", "Required by APIs", "Logging"], 1, "Small overlap + idempotent load."],
  ["Why keep raw API responses?", ["They're pretty", "Re-process after a bug without calling the API again", "Required by law", "Faster dashboards"], 1, "Replayability."],
  ["The API only has created_at, no updated_at. Risk?", ["None", "Missing updates to old records", "Duplicate ids", "Slower"], 1, "Refresh recent windows or use webhooks."],
  ["An idempotent load means…", ["Faster", "Running it twice gives the same table", "Real-time", "Uses Spark"], 1, "Safe re-runs."],
  ["A plain INSERT pipeline is retried after a timeout. Result?", ["Fine", "Duplicated rows", "Error", "Faster"], 1, "Use upserts or partition replace."],
  ["What stops an older record overwriting a newer one in an upsert?", ["ORDER BY", "WHERE excluded.updated_at > target.updated_at", "An index", "LIMIT 1"], 1, "Guard on updated_at."],
  ["Simplest idempotent pattern for a daily aggregate?", ["Append", "Delete that day's rows and insert, in one transaction", "TRUNCATE all", "UPDATE every row"], 1, "Partition replace."],
  ["Why load into staging first?", ["Required", "Validate before touching the live table; readers never see half a load", "Speed only", "Cheaper storage"], 1, "Stage → check → apply atomically."],
  ["Fastest way to load 1M rows into PostgreSQL?", ["One INSERT per row", "COPY / bulk load", "Via Excel", "UPDATE"], 1, "Bulk paths."],
  ["A good data check after loading?", ["None needed", "No duplicate keys, no negative totals, volume vs yesterday", "Check colours", "Count columns"], 1, "Catch bad data before dashboards do."]
 ]
};
