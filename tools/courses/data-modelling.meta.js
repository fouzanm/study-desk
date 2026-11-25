module.exports = {
 title: "Data Modelling",
 description: "Facts and dimensions, grain, star schemas, slowly changing dimensions, lake/warehouse layers and partitioning, ending with a tested sales warehouse.",
 lessons: [
  ["facts-dims", "Facts and dimensions"],
  ["star-grain", "Star schema and grain"],
  ["scd", "Slowly changing dimensions (SCD)"],
  ["lake-warehouse", "Data lakes, warehouses and layers"],
  ["partitioning", "Partitioning, clustering and performance"],
  ["build-schema", "Project: design a sales warehouse"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["A fact table contains…", ["Descriptions of customers", "Measurable events: keys + numeric measures", "Only dates", "Config"], 1, "What happened and how much."],
  ["A dimension table contains…", ["Event amounts", "Context to slice by: who, what, when, where", "Logs", "Passwords"], 1, "Customer, product, date…"],
  ["Average price across order lines should be…", ["AVG(price)", "SUM(amount)/SUM(qty)", "MAX(price)", "COUNT(price)"], 1, "Recompute ratios from additive parts."],
  ["Inventory on hand is…", ["Additive", "Semi-additive: don't sum across time", "A dimension", "Non-numeric"], 1, "Take the last value per period."],
  ["Why a date dimension?", ["Required by SQL", "Holds month/weekday/holiday/fiscal attributes once", "Faster inserts", "Security"], 1, "No repeated date logic."],
  ["Why surrogate keys in dimensions?", ["Shorter names", "Support history versions and multiple source systems", "Required by Parquet", "Encryption"], 1, "Independent of source ids."],
  ["Grain is…", ["The table size", "A sentence saying what one fact row represents", "A partition", "An index"], 1, "Declare it first."],
  ["Order-level shipping fee repeated on each line, then summed?", ["Correct", "Double counting", "Faster", "Required"], 1, "Mixed grain."],
  ["Which grain should you prefer?", ["Most aggregated", "Most detailed available", "Monthly", "Random"], 1, "Roll up later; can't drill down."],
  ["Star vs snowflake in columnar warehouses?", ["Snowflake always", "Star: fewer joins, compression handles repetition", "Neither", "No dimensions"], 1, "Prefer stars."],
  ["Stock level per product per day is a…", ["Transaction fact", "Periodic snapshot", "Dimension", "Accumulating snapshot"], 1, "One row per thing per period."],
  ["Order lifecycle with paid_at, shipped_at, delivered_at columns is a…", ["Periodic snapshot", "Accumulating snapshot", "Dimension", "Bridge"], 1, "Updated as the process moves."],
  ["SCD Type 2 handles a change by…", ["Overwriting", "Adding a new row with valid_from/valid_to", "Deleting", "Ignoring"], 1, "Keeps history."],
  ["Best SCD type for a phone number correction?", ["Type 1", "Type 2", "Type 0", "Type 4"], 0, "No history needed."],
  ["How do old sales stay in the customer's old city?", ["They store the city text", "They store the surrogate key of the version valid at sale time", "Views", "Indexes"], 1, "Point-in-time keys."],
  ["A good SCD2 data test?", ["Count columns", "Exactly one current row per business id", "No nulls in names", "None"], 1, "Catches broken merges."],
  ["Raw layer rule?", ["Clean in place", "Keep as received, append-only", "Delete weekly", "Only CSV"], 1, "So you can replay."],
  ["Where does “active customer = ordered in last 90 days” belong?", ["Raw", "Staging", "Marts", "Source system"], 2, "Business definitions live in marts."],
  ["A lakehouse format (Delta/Iceberg) adds…", ["CSV support", "ACID transactions, updates, time travel on lake files", "Dashboards", "Nothing"], 1, "Table features on files."],
  ["Best partition column for event tables?", ["user_id", "Event date", "Email", "Random number"], 1, "What queries filter on."],
  ["Clustering/sort keys help because…", ["They encrypt", "Engines skip blocks using min/max stats", "They add replicas", "They delete old data"], 1, "Less data read."],
  ["A BigQuery dashboard scans 2 TB daily. First fixes?", ["Bigger slots", "Partition + date filter, cluster, fewer columns, pre-aggregated mart", "Export to Excel", "Run less often only"], 1, "Scan less data."],
  ["Inner join to dims silently dropped some facts. Better design?", ["Ignore", "Unknown-member rows + test fact totals vs staging", "Delete the dims", "Left join to nothing"], 1, "Never lose facts."]
 ]
};
