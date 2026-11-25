module.exports = {
 title: "Cloud for Data Engineers",
 description: "Core AWS/GCP/Azure data services, lake layout and catalogs, cloud warehouses, cost and monitoring, Terraform, ending with a small, secure, reproducible cloud data platform.",
 lessons: [
  ["aws-core", "Core cloud services for data (AWS first)"],
  ["lake-layout", "Designing a data lake layout"],
  ["warehouses", "Cloud warehouses: Snowflake, BigQuery, Redshift"],
  ["cost", "Cost, monitoring and FinOps"],
  ["terraform", "Infrastructure as code with Terraform"],
  ["build", "Project: a small cloud data platform"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["The data lake on AWS is usually…", ["EBS", "S3", "RDS", "Lambda"], 1, "Object storage."],
  ["GCP's equivalent of S3 is…", ["BigQuery", "Cloud Storage", "Pub/Sub", "Dataproc"], 1, "Object storage."],
  ["Pipelines should access AWS using…", ["A developer's access keys", "IAM roles with least-privilege policies", "The root user", "Shared passwords"], 1, "Least privilege."],
  ["A policy allowing s3:* on * for a job is bad because…", ["It's slow", "A leaked credential exposes everything", "It's not valid JSON", "It costs more"], 1, "Blast radius."],
  ["Serverless SQL directly over S3 files on AWS?", ["Athena", "SQS", "EC2", "Route 53"], 0, "Pay per TB scanned."],
  ["Why keep compute in the same region as data?", ["Fashion", "Avoid transfer costs/latency and respect data residency", "Required by S3", "Better logs"], 1, "Cross-region costs money."],
  ["A good lake path starts with…", ["The developer's name", "The zone (raw/staging/marts)", "A random id", "The date"], 1, "Permissions and lifecycle per zone."],
  ["What does the Glue Data Catalog hold?", ["The data files", "Table metadata: schema, location, partitions", "Secrets", "Dashboards"], 1, "Makes files queryable."],
  ["New day landed but Athena doesn't see it. Likely cause?", ["S3 down", "Partition not registered in the catalog", "Wrong colour", "Parquet unsupported"], 1, "Add the partition/run MSCK or crawler."],
  ["Lifecycle rules are for…", ["Schemas", "Moving old data to cheaper storage or deleting it automatically", "Security groups", "Indexing"], 1, "Storage cost."],
  ["Why prefer Iceberg/Delta over loose Parquet for staging/marts?", ["Smaller", "Atomic commits, MERGE/DELETE, schema evolution, time travel", "Faster uploads", "No catalog needed"], 1, "Table features."],
  ["BigQuery on-demand pricing is based on…", ["Rows returned", "Bytes scanned", "Number of users", "Time of day"], 1, "Scan less."],
  ["Snowflake compute cost accrues when…", ["Data is stored", "A virtual warehouse is running", "Users log in", "Tables are created"], 1, "Auto-suspend matters."],
  ["Bulk load files from S3 into Snowflake/Redshift with…", ["INSERT per row", "COPY", "UPDATE", "Excel"], 1, "Bulk paths."],
  ["Why separate warehouses for BI and transformations?", ["Billing only", "Workloads don't block each other; costs are visible per workload", "Required", "Security only"], 1, "Isolation."],
  ["Tags on cloud resources help…", ["Performance", "Attribute costs to teams/projects", "Encryption", "Backups"], 1, "Ownership of spend."],
  ["A volume check alerts when…", ["A job fails", "Row counts fall far outside the normal range", "A user logs in", "Disk is full"], 1, "Catches silent partial loads."],
  ["terraform plan…", ["Creates resources", "Shows the changes that apply would make", "Deletes state", "Runs tests"], 1, "Review first."],
  ["Terraform state should be stored…", ["In Git", "In a remote backend with locking", "On a laptop", "In Slack"], 1, "Shared and safe."],
  ["Someone edited a resource in the console. Terraform calls this…", ["Drift", "Module", "Output", "Provider"], 0, "Fix it in code."],
  ["The plan wants to destroy the production bucket. You…", ["Apply quickly", "Stop, find why, fix with moved/state mv or revert; add prevent_destroy", "Delete state", "Ignore"], 1, "Never apply destroys blindly."],
  ["Test boto3 pipeline code offline with…", ["Production", "moto or localstack", "Nothing", "A spreadsheet"], 1, "Free and safe."]
 ]
};
