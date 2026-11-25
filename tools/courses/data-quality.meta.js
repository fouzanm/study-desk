module.exports = {
 title: "Data Quality & Governance",
 description: "Quality dimensions, data tests, contracts, observability, lineage and privacy, ending with a tested quality gate that passes, warns or blocks each batch.",
 lessons: [
  ["dimensions", "Data quality dimensions"],
  ["tests", "Writing data tests"],
  ["contracts", "Data contracts"],
  ["monitoring", "Data observability and monitoring"],
  ["lineage-privacy", "Lineage, governance and privacy"],
  ["build", "Project: a data quality gate"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Same invoice appears twice: which dimension fails?", ["Completeness", "Uniqueness", "Timeliness", "Accuracy"], 1, "Duplicates."],
  ["Phone numbers containing letters fail…", ["Validity", "Timeliness", "Lineage", "Volume"], 0, "Format rules."],
  ["Yesterday's sales not loaded by 9am fails…", ["Uniqueness", "Timeliness", "Validity", "Consistency"], 1, "Freshness."],
  ["How do you check accuracy?", ["Count nulls", "Reconcile with a trusted source", "Sort the table", "Ask ChatGPT"], 1, "External reference."],
  ["First step before writing checks for a new table?", ["Deploy", "Profile it: nulls, distincts, ranges, values", "Delete it", "Build a dashboard"], 1, "Know the data."],
  ["A SQL data test passes when it returns…", ["0 rows", "All rows", "1 row", "NULL"], 0, "It selects failures."],
  ["Quarantining means…", ["Deleting bad rows", "Loading good rows and storing bad ones with reasons", "Stopping the pipeline", "Hiding errors"], 1, "Keep going, report."],
  ["Should every failed check block the pipeline?", ["Yes", "No: decide block/warn/quarantine per check", "Never block", "Only on Mondays"], 1, "Avoid alert fatigue."],
  ["pandera's lazy=True…", ["Skips validation", "Collects all failures instead of the first", "Runs async", "Coerces types"], 1, "Full report."],
  ["A data contract is an agreement between…", ["Two engineers", "Data producers and consumers", "Cloud vendors", "Users and HR"], 1, "Interface for data."],
  ["Which change is breaking?", ["New optional column", "Changing a column type", "More rows", "Better docs"], 1, "Consumers break."],
  ["Why reject unknown fields (extra='forbid')?", ["Speed", "They signal an unannounced upstream change", "Pydantic requires it", "Smaller payloads"], 1, "Catch drift early."],
  ["Best place to also run contract checks?", ["Only dashboards", "In the producer's CI and at ingestion", "Nowhere", "In Excel"], 1, "Stop breaking changes before release."],
  ["A job succeeded but loaded 30% of normal rows. What catches it?", ["Retries", "Volume monitoring", "Unit tests", "Lint"], 1, "Silent failures."],
  ["Why compare volume with the same weekday?", ["Habit", "Weekly seasonality causes false alarms otherwise", "Faster", "Cheaper"], 1, "Seasonality."],
  ["Null rate of email jumps from 2% to 40%. Which pillar?", ["Freshness", "Distribution", "Lineage", "Volume"], 1, "Value distribution changed."],
  ["During a data incident, after containing it you should…", ["Stay quiet", "Fix, tell consumers, then postmortem + new monitor", "Delete logs", "Blame the source"], 1, "Communicate and learn."],
  ["Lineage is most useful for…", ["Compression", "Impact analysis and audits", "Faster queries", "Encryption"], 1, "What's affected."],
  ["HMAC pseudonymisation of emails lets analysts…", ["Read emails", "Count/join customers without seeing emails", "Delete customers", "Send emails"], 1, "Stable keyed tokens."],
  ["Why is plain md5(email) weak?", ["Too long", "Anyone can hash known emails and match them", "Not deterministic", "Not supported"], 1, "Use a secret key."],
  ["Masking policies in a warehouse…", ["Delete data", "Show PII fully only to allowed roles", "Speed up queries", "Compress columns"], 1, "Role-based visibility."],
  ["To complete a deletion request you need…", ["Only to delete raw data", "To know every place the person's data lives and delete everywhere, with a log", "To wait 10 years", "Nothing"], 1, "Lineage + registry."],
  ["A quality gate should output…", ["Only logs", "A decision (pass/warn/block), counts and findings", "A dashboard only", "Nothing"], 1, "Actionable result."]
 ]
};
