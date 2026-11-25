// Cloud for Data Engineers. AWS examples run against moto (an offline AWS simulator); same boto3 code works on real AWS.
const AWS = String.raw`
import os, json, boto3
os.environ.update(AWS_ACCESS_KEY_ID="testing", AWS_SECRET_ACCESS_KEY="testing", AWS_DEFAULT_REGION="ap-south-1")
from moto import mock_aws
_mock = mock_aws(); _mock.start()
`;

module.exports = [
{
 id: "aws-core",
 title: "Core cloud services for data (AWS first)",
 level: "Intermediate",
 one: "Data platforms are built from a few cloud building blocks: <b>object storage</b> (S3), <b>identity</b> (IAM roles), <b>compute</b> (Glue, EMR, Lambda, containers), <b>warehouses/query engines</b> (Redshift, Athena, Snowflake) and <b>orchestration/monitoring</b>.",
 why: "Most data engineering job posts ask for one cloud (AWS is the most common, then Azure and GCP). The concepts map across all three, so learn one well.",
 steps: [
  { h: "The building blocks across clouds",
    code: `need                    AWS                        GCP                     Azure
object storage (lake)   S3                         Cloud Storage           ADLS Gen2 / Blob
identity                IAM roles & policies       IAM service accounts    Entra ID, managed identity
catalog                 Glue Data Catalog          Dataplex / BigLake      Purview / Unity Catalog
serverless SQL on lake  Athena                     BigQuery (external)     Synapse serverless
warehouse               Redshift (or Snowflake)    BigQuery                Synapse / Fabric
Spark                   EMR, Glue, Databricks      Dataproc, Databricks    Databricks, Fabric
orchestration           MWAA (Airflow), Step Fn    Cloud Composer          Data Factory
streaming               Kinesis, MSK (Kafka)       Pub/Sub, Dataflow       Event Hubs
secrets                 Secrets Manager            Secret Manager          Key Vault
monitoring              CloudWatch                 Cloud Monitoring        Azure Monitor`, lang: "text" },
  { h: "S3 basics with boto3",
    pre: AWS,
    code: `s3 = boto3.client("s3")
s3.create_bucket(Bucket="acme-data-lake", CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
s3.put_object(Bucket="acme-data-lake", Key="raw/shop/orders/dt=2025-07-05/orders.jsonl",
              Body=b'{"id": 1, "amount": 500}\\n{"id": 2, "amount": 900}\\n')
for obj in s3.list_objects_v2(Bucket="acme-data-lake", Prefix="raw/")["Contents"]:
    print(obj["Key"], obj["Size"], "bytes")
body = s3.get_object(Bucket="acme-data-lake", Key="raw/shop/orders/dt=2025-07-05/orders.jsonl")["Body"].read()
print([json.loads(line)["amount"] for line in body.splitlines()])`,
    note: "This runs against moto, an offline AWS simulator, so it's free and safe. Remove the mock and the same code talks to real S3." },
  { h: "IAM: least privilege with roles",
    p: ["Pipelines never use personal access keys. Each job runs as a <b>role</b> with a policy allowing only what it needs: e.g. the extract job may write to <code>raw/shop/*</code> but not read finance data."],
    pre: AWS,
    code: `iam = boto3.client("iam")
policy = {
    "Version": "2012-10-17",
    "Statement": [
        {"Effect": "Allow", "Action": ["s3:PutObject"], "Resource": "arn:aws:s3:::acme-data-lake/raw/shop/*"},
        {"Effect": "Allow", "Action": ["s3:ListBucket"], "Resource": "arn:aws:s3:::acme-data-lake",
         "Condition": {"StringLike": {"s3:prefix": ["raw/shop/*"]}}},
    ],
}
trust = {"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": {"Service": "glue.amazonaws.com"},
                                                  "Action": "sts:AssumeRole"}]}
role = iam.create_role(RoleName="shop-extract-job", AssumeRolePolicyDocument=json.dumps(trust))
iam.put_role_policy(RoleName="shop-extract-job", PolicyName="write-raw-shop", PolicyDocument=json.dumps(policy))
print(role["Role"]["Arn"])
print([s["Action"] for s in policy["Statement"]])` },
  { h: "Compute choices",
    code: `Lambda             small event-driven steps (≤15 min): react to a file landing, call an API
Glue jobs          serverless Spark/Python ETL; Glue crawlers fill the catalog
EMR / EMR Serverless   big Spark/Hive/Trino jobs, more control
ECS / Fargate      containerised Python jobs (your extractor in Docker)
Athena             serverless SQL over S3 (pay per TB scanned)
Redshift / Snowflake   warehouse for modelled data and BI`, lang: "text" },
  { h: "Regions, networking, encryption",
    p: ["Keep data and compute in the same <b>region</b> (cross-region transfer costs money and adds latency; data residency laws may require a region). Databases sit in private subnets; jobs reach them through the VPC. Turn on encryption at rest (SSE-S3/KMS) and in transit (TLS), and block public access on buckets."] }
 ],
 mistakes: [
  "Using personal access keys in pipelines instead of roles.",
  "Policies with s3:* on * (one leaked job credential exposes everything).",
  "Public S3 buckets.",
  "Compute in one region reading data from another."
 ],
 practice: [
  { q: "Upload two files under different date prefixes and list only July 6.", pre: AWS, code: `s3 = boto3.client("s3")
s3.create_bucket(Bucket="lake", CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
for d in ["2025-07-05", "2025-07-06"]:
    s3.put_object(Bucket="lake", Key=f"raw/orders/dt={d}/part-0.jsonl", Body=b"{}")
print([o["Key"] for o in s3.list_objects_v2(Bucket="lake", Prefix="raw/orders/dt=2025-07-06/")["Contents"]])` },
  { q: "Write the IAM statement that lets a reporting job only read objects under <code>marts/</code> in acme-data-lake.", a: "<code>{\"Effect\": \"Allow\", \"Action\": [\"s3:GetObject\"], \"Resource\": \"arn:aws:s3:::acme-data-lake/marts/*\"}</code> plus <code>s3:ListBucket</code> on the bucket ARN with a <code>s3:prefix</code> condition of <code>marts/*</code>." }
 ],
 check: [
  ["Where does a data lake live on AWS?", ["EC2 disks", "S3", "Lambda", "IAM"], 1, "Object storage."],
  ["Pipelines should authenticate with…", ["Personal keys", "IAM roles with least-privilege policies", "Root account", "Shared password"], 1, "Least privilege."],
  ["Serverless SQL over S3 files on AWS?", ["Athena", "Kinesis", "SNS", "CloudFront"], 0, "Pay per data scanned."]
 ],
 remember: [
  "Storage, identity, compute, query, orchestration, monitoring.",
  "S3 for the lake; roles + least privilege for access.",
  "Glue/EMR for Spark, Athena for SQL on files, Redshift/Snowflake for warehouses.",
  "Same region; private networking; encryption; no public buckets."
 ]
},
{
 id: "lake-layout",
 title: "Designing a data lake layout",
 level: "Intermediate",
 one: "A lake stays usable when paths follow rules: <b>zone/source/table/partition=value/files</b>, open formats (Parquet/Delta/Iceberg), a <b>catalog</b> describing every table, and <b>lifecycle rules</b> for old data.",
 why: "A badly organised bucket becomes a “data swamp” nobody trusts. A clear layout makes querying, permissions and costs manageable.",
 steps: [
  { h: "A standard layout",
    code: `s3://acme-data-lake/
  raw/shop/orders/dt=2025-07-05/part-0000.jsonl.gz       as received, immutable
  raw/erp/invoices/dt=2025-07-05/invoices.csv.gz
  staging/shop/orders/dt=2025-07-05/part-0000.parquet    cleaned, typed, deduped
  marts/sales/daily_revenue/month=2025-07/part-0000.parquet  business-ready
  _tmp/ ...                                                scratch (auto-deleted)

rules: lowercase, snake_case · zone first (permissions per zone) · partition by date
       one table per folder · never mix formats in a table folder`, lang: "text" },
  { h: "Writing partitioned Parquet to S3",
    pre: AWS,
    code: `import io, pandas as pd
s3 = boto3.client("s3")
s3.create_bucket(Bucket="acme-data-lake", CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
orders = pd.DataFrame({"order_id": [1, 2, 3, 4], "amount": [500, 900, 1200, 450],
                       "dt": ["2025-07-04", "2025-07-04", "2025-07-05", "2025-07-05"]})
for dt, part in orders.groupby("dt"):
    buf = io.BytesIO()
    part.drop(columns="dt").to_parquet(buf, index=False)
    s3.put_object(Bucket="acme-data-lake", Key=f"staging/shop/orders/dt={dt}/part-0000.parquet", Body=buf.getvalue())
keys = [o["Key"] for o in s3.list_objects_v2(Bucket="acme-data-lake", Prefix="staging/")["Contents"]]
print("\\n".join(keys))` },
  { h: "Register tables in the catalog",
    p: ["Files alone aren't tables. The <b>Glue Data Catalog</b> (or a crawler) records each table's location, schema, format and partitions, so Athena, Redshift Spectrum, EMR and Glue can all query it by name."],
    pre: AWS,
    code: `glue = boto3.client("glue")
glue.create_database(DatabaseInput={"Name": "staging_shop"})
glue.create_table(DatabaseName="staging_shop", TableInput={
    "Name": "orders",
    "TableType": "EXTERNAL_TABLE",
    "PartitionKeys": [{"Name": "dt", "Type": "string"}],
    "StorageDescriptor": {
        "Columns": [{"Name": "order_id", "Type": "bigint"}, {"Name": "amount", "Type": "bigint"}],
        "Location": "s3://acme-data-lake/staging/shop/orders/",
        "InputFormat": "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat",
        "OutputFormat": "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat",
        "SerdeInfo": {"SerializationLibrary": "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"},
    },
})
for dt in ["2025-07-04", "2025-07-05"]:
    glue.create_partition(DatabaseName="staging_shop", TableName="orders", PartitionInput={
        "Values": [dt], "StorageDescriptor": {"Location": f"s3://acme-data-lake/staging/shop/orders/dt={dt}/"}})
t = glue.get_table(DatabaseName="staging_shop", Name="orders")["Table"]
print(t["Name"], [c["Name"] for c in t["StorageDescriptor"]["Columns"]], "partitioned by", [p["Name"] for p in t["PartitionKeys"]])
print("partitions:", [p["Values"][0] for p in glue.get_partitions(DatabaseName="staging_shop", TableName="orders")["Partitions"]])`,
    note: "Then Athena can run <code>SELECT SUM(amount) FROM staging_shop.orders WHERE dt = '2025-07-05'</code>, reading only that partition's files." },
  { h: "Lifecycle rules",
    pre: AWS,
    code: `s3 = boto3.client("s3")
s3.create_bucket(Bucket="acme-data-lake", CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
s3.put_bucket_lifecycle_configuration(Bucket="acme-data-lake", LifecycleConfiguration={"Rules": [
    {"ID": "raw-to-cold", "Filter": {"Prefix": "raw/"}, "Status": "Enabled",
     "Transitions": [{"Days": 30, "StorageClass": "STANDARD_IA"}, {"Days": 180, "StorageClass": "GLACIER_IR"}]},
    {"ID": "tmp-cleanup", "Filter": {"Prefix": "_tmp/"}, "Status": "Enabled", "Expiration": {"Days": 3}},
]})
for r in s3.get_bucket_lifecycle_configuration(Bucket="acme-data-lake")["Rules"]:
    print(r["ID"], r["Filter"]["Prefix"], r.get("Transitions") or r.get("Expiration"))` },
  { h: "Table formats",
    p: ["For staging and marts, prefer an open table format (<b>Iceberg</b> or <b>Delta</b>) over loose Parquet: you get atomic commits (readers never see half-written data), MERGE/DELETE, schema evolution and time travel. Athena, Glue, EMR, Snowflake and BigQuery all read Iceberg."] }
 ],
 mistakes: [
  "Random folder names per developer.",
  "Files without a catalog entry (nobody can find or query them).",
  "Keeping raw data in expensive storage forever, or deleting it too early.",
  "Partitioning by high-cardinality columns (millions of tiny folders)."
 ],
 practice: [
  { q: "Design the S3 paths for: raw Razorpay payments (JSON, daily), cleaned payments (Parquet), and a monthly revenue mart.", a: "<code>raw/razorpay/payments/dt=YYYY-MM-DD/*.jsonl.gz</code>, <code>staging/razorpay/payments/dt=YYYY-MM-DD/*.parquet</code> (or an Iceberg table), <code>marts/finance/monthly_revenue/month=YYYY-MM/*.parquet</code>. Catalog databases raw_razorpay, staging_razorpay, marts_finance; lifecycle rule moving raw/ to colder storage after 30–90 days." },
  { q: "Add a lifecycle rule that deletes objects under <code>exports/</code> after 7 days.", pre: AWS, code: `s3 = boto3.client("s3")
s3.create_bucket(Bucket="lake", CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
s3.put_bucket_lifecycle_configuration(Bucket="lake", LifecycleConfiguration={"Rules": [
    {"ID": "exports-7d", "Filter": {"Prefix": "exports/"}, "Status": "Enabled", "Expiration": {"Days": 7}}]})
print(s3.get_bucket_lifecycle_configuration(Bucket="lake")["Rules"][0]["Expiration"])` }
 ],
 check: [
  ["Why put the zone (raw/staging/marts) first in paths?", ["Alphabetical", "Permissions and lifecycle rules per zone", "Faster uploads", "Required by S3"], 1, "Policies by prefix."],
  ["The Glue Data Catalog stores…", ["The data", "Table metadata: schema, location, partitions", "Passwords", "Logs"], 1, "Makes files queryable by name."],
  ["Lifecycle rules help with…", ["Speed", "Cost: moving/deleting old data automatically", "Security only", "Schemas"], 1, "Storage classes and expiry."]
 ],
 remember: [
  "zone/source/table/partition=value/files.",
  "Parquet/Iceberg/Delta; never mix formats in a table.",
  "Catalog every table (Glue/Unity).",
  "Lifecycle rules for raw and temp data."
 ]
},
{
 id: "warehouses",
 title: "Cloud warehouses: Snowflake, BigQuery, Redshift",
 level: "Intermediate",
 one: "Cloud warehouses separate <b>storage</b> from <b>compute</b>, scale on demand and bill differently: Snowflake by <b>warehouse-seconds</b>, BigQuery by <b>bytes scanned</b> (or slots), Redshift by <b>cluster/serverless capacity</b>.",
 why: "You'll load data into and model data in one of these. Knowing how each bills and performs changes how you design tables and queries.",
 steps: [
  { h: "Comparison",
    code: `                Snowflake                    BigQuery                    Redshift
compute         virtual warehouses (XS..6XL)  serverless slots            provisioned cluster or serverless RPUs
billing         credits per second running    on-demand: $/TB scanned     per hour of nodes / RPU-hours
                (auto-suspend!)               or reserved slots
storage         compressed micro-partitions   columnar Capacitor          columnar, sort/dist keys
performance     clustering keys, search opt.  partition + cluster         sort keys, dist keys, MVs
loading         COPY INTO from stage (S3)     load jobs, Storage Write    COPY from S3
lake access     external/Iceberg tables       BigLake, external tables    Spectrum
sharing         data sharing, marketplace     Analytics Hub               datashares`, lang: "text" },
  { h: "Loading from the lake",
    code: `-- Snowflake: stage pointing at S3, then COPY (idempotent: already-loaded files are skipped)
CREATE STAGE raw_shop URL='s3://acme-data-lake/staging/shop/' STORAGE_INTEGRATION = s3_int
  FILE_FORMAT = (TYPE = PARQUET);
COPY INTO staging.orders FROM @raw_shop/orders/ MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;

-- BigQuery
LOAD DATA INTO staging.orders FROM FILES (format = 'PARQUET',
  uris = ['gs://acme-data-lake/staging/shop/orders/dt=2025-07-05/*.parquet']);

-- Redshift
COPY staging.orders FROM 's3://acme-data-lake/staging/shop/orders/dt=2025-07-05/'
IAM_ROLE 'arn:aws:iam::123456789012:role/redshift-load' FORMAT AS PARQUET;`, lang: "sql" },
  { h: "Why bytes scanned matters (BigQuery-style billing)",
    p: ["On-demand BigQuery charges per TB scanned, so columns selected and partitions filtered decide the bill. A quick model:"],
    code: `PRICE_PER_TB = 6.25                      # USD, on-demand list price (check current pricing)
table_tb = 5.0                            # 5 TB table, 40 columns, 3 years of daily partitions
columns, days = 40, 3 * 365

def cost(cols_read, days_read):
    tb = table_tb * (cols_read / columns) * (days_read / days)
    return tb, tb * PRICE_PER_TB

for label, c, d in [("SELECT *, no date filter", 40, days), ("3 columns, no date filter", 3, days),
                    ("3 columns, last 7 days", 3, 7)]:
    tb, usd = cost(c, d)
    print(f"{label:28} {tb * 1000:9.1f} GB  \${usd:8.2f} per run  \${usd * 24 * 30:10.2f}/month if hourly")`,
    note: "Same question, very different bills. Partition + cluster tables and select only the columns you need." },
  { h: "Snowflake: warehouses cost while running",
    code: `CREATE WAREHOUSE transform_wh WAREHOUSE_SIZE = 'SMALL'
  AUTO_SUSPEND = 60 AUTO_RESUME = TRUE INITIALLY_SUSPENDED = TRUE;    -- stop after 60s idle

-- separate warehouses per workload, so BI users don't queue behind dbt runs
CREATE WAREHOUSE bi_wh WAREHOUSE_SIZE = 'XSMALL' AUTO_SUSPEND = 60;

-- see what costs money
SELECT warehouse_name, SUM(credits_used) AS credits
FROM snowflake.account_usage.warehouse_metering_history
WHERE start_time > DATEADD(day, -7, CURRENT_TIMESTAMP())
GROUP BY 1 ORDER BY 2 DESC;`, lang: "sql" },
  { h: "Choosing",
    p: ["Already on GCP: BigQuery. AWS shop with steady workloads: Redshift, or Snowflake for multi-cloud and ease of use. Databricks shops often use Databricks SQL on Delta. The modelling, dbt and SQL skills transfer between all of them."] }
 ],
 mistakes: [
  "Snowflake warehouses without auto-suspend (billed while idle).",
  "SELECT * on wide BigQuery tables in scheduled queries.",
  "One warehouse for everything, so dashboards queue behind batch jobs.",
  "Loading with row-by-row INSERTs instead of COPY/load jobs."
 ],
 practice: [
  { q: "A dashboard runs a BigQuery query every 15 minutes that scans 800 GB. Estimate the monthly on-demand cost and propose two fixes.", code: `runs_per_month = 4 * 24 * 30
tb_per_run = 0.8
print(f"~\${runs_per_month * tb_per_run * 6.25:,.0f} per month at \$6.25/TB")`, },
  { q: "Snowflake bill doubled. Where do you look first?", a: "account_usage.warehouse_metering_history (which warehouses), query_history (which queries/users, long runtimes, spilling), and settings: auto-suspend times, warehouse sizes, multi-cluster settings. Then fix: auto-suspend 60s, right-size, separate workloads, fix expensive queries (pruning, clustering)." }
 ],
 check: [
  ["BigQuery on-demand bills by…", ["Rows returned", "Bytes scanned", "Users", "Tables"], 1, "Scan less."],
  ["Snowflake bills compute by…", ["Bytes scanned", "Warehouse running time (credits)", "Rows", "Queries"], 1, "Auto-suspend matters."],
  ["Fast bulk load into a warehouse?", ["Row-by-row INSERT", "COPY / load jobs from object storage", "Copy-paste", "ODBC loop"], 1, "Bulk paths."]
 ],
 remember: [
  "Storage and compute separate; billing differs per warehouse.",
  "Load with COPY/load jobs from the lake.",
  "BigQuery: scan less (partition, cluster, fewer columns).",
  "Snowflake: auto-suspend, right-size, separate workloads."
 ]
},
{
 id: "cost",
 title: "Cost, monitoring and FinOps",
 level: "Intermediate",
 one: "Cloud data platforms can get expensive fast. Know what drives cost (<b>compute time, data scanned, storage, data transfer</b>), tag everything, set <b>budgets and alerts</b>, and monitor pipelines with metrics and logs.",
 why: "Teams that ignore cost get surprise bills; engineers who can cut cost by 40% are valued. Monitoring is what makes a platform reliable.",
 steps: [
  { h: "Where the money goes",
    code: `compute       warehouses left running, oversized clusters, Spark jobs on huge instances
scanning      SELECT * and unpartitioned scans (Athena/BigQuery)
storage       never-deleted raw data, many copies of the same table, old snapshots
transfer      cross-region/cross-cloud copies, egress to the internet
small things  millions of S3 requests (tiny files), NAT gateway traffic, idle dev resources`, lang: "text" },
  { h: "Estimating a monthly bill",
    code: `prices = {"s3_gb_month": 0.023, "athena_tb": 5.0, "glue_dpu_hour": 0.44, "redshift_rpu_hour": 0.375}

usage = {
    "s3_gb_month": 2_000,              # 2 TB stored
    "athena_tb": 0.4 * 30,             # 400 GB scanned a day
    "glue_dpu_hour": 10 * 0.5 * 30,    # 10 DPUs for 30 minutes daily
    "redshift_rpu_hour": 8 * 4 * 30,   # 8 RPUs busy 4 hours a day
}
total = 0
for k, qty in usage.items():
    cost = qty * prices[k]
    total += cost
    print(f"{k:20} {qty:10,.1f} x {prices[k]:<6} = \${cost:9,.2f}")
print(f"{'total':20} {'':23} \${total:9,.2f} per month (illustrative prices; check current regional pricing)")` },
  { h: "Cost controls",
    code: `tags            every resource: team, project, env  → cost reports per team
budgets         AWS Budgets / GCP budgets with alerts at 50/80/100%
limits          BigQuery max bytes billed per query; Snowflake resource monitors
auto-stop       auto-suspend warehouses, auto-terminate clusters, scale to zero
right-size      smaller instances, spot/preemptible for batch Spark
data hygiene    lifecycle rules, compaction, drop unused tables, partition everything`, lang: "text" },
  { h: "Monitoring pipelines",
    p: ["Emit a few metrics from every pipeline run (rows in/out, duration, freshness) and alert on them. A simple pattern, checked here with a small in-memory history:"],
    code: `from statistics import mean, pstdev

history = [10_120, 9_980, 10_340, 10_050, 9_870, 10_210, 10_005]       # rows loaded per day
def check_volume(today, history, z=3.0):
    mu, sd = mean(history), pstdev(history)
    zscore = (today - mu) / sd if sd else 0
    return ("ALERT" if abs(zscore) > z else "ok"), round(zscore, 1)

for today in [10_150, 6_200]:
    print(today, check_volume(today, history))`,
    note: "In production these numbers go to CloudWatch/Datadog/Prometheus, and alerts go to Slack/PagerDuty. dbt tests and tools like Elementary or Monte Carlo do similar anomaly checks on tables." },
  { h: "What to alert on",
    code: `failure        job failed after retries                → page/Slack immediately
freshness      table not updated within SLA            → Slack, page if business-critical
volume         rows far outside normal range           → Slack
quality        tests failing (nulls, duplicates)       → Slack, block downstream
cost           daily spend > budget threshold          → Slack/email to owner`, lang: "text" }
 ],
 mistakes: [
  "No tags, so nobody knows which team owns the bill.",
  "Dev clusters running all weekend.",
  "Alerts with no owner or runbook.",
  "Monitoring only job success, not data freshness or volume."
 ],
 practice: [
  { q: "Athena scans 300 GB per query, 200 queries/day, at $5/TB. Compute the monthly cost, then the cost if partition pruning cuts scans by 90%.", code: `per_day = 200 * 0.3 * 5
print(f"before: \${per_day * 30:,.0f}/month, after: \${per_day * 30 * 0.1:,.0f}/month")` },
  { q: "List 4 quick wins to cut a data platform's cloud bill.", a: "1) Auto-suspend/auto-terminate idle warehouses and clusters. 2) Partition/cluster big tables and remove SELECT * from scheduled queries. 3) Lifecycle rules for raw and temp data; compact small files. 4) Tag resources and review the top 10 cost items weekly (often a forgotten dev cluster or a runaway query)." }
 ],
 check: [
  ["Biggest cost driver for idle Snowflake warehouses?", ["Storage", "Running compute without auto-suspend", "Users", "Tags"], 1, "Credits accrue while running."],
  ["Tags help…", ["Speed", "Attribute cost to teams/projects", "Security only", "Compression"], 1, "Ownership of spend."],
  ["Volume monitoring catches…", ["Syntax errors", "Partial loads and upstream outages that don't fail jobs", "Slow UI", "Bad passwords"], 1, "Silent data problems."]
 ],
 remember: [
  "Cost = compute + scanning + storage + transfer.",
  "Tags, budgets, alerts, per-query limits.",
  "Auto-stop, right-size, spot for batch.",
  "Monitor freshness, volume, quality, cost; every alert has an owner."
 ]
},
{
 id: "terraform",
 title: "Infrastructure as code with Terraform",
 level: "Intermediate",
 one: "<b>Terraform</b> describes cloud resources (buckets, roles, databases, warehouses) in code. <code>plan</code> shows what will change, <code>apply</code> makes it so, and the <b>state</b> remembers what exists. Everything is reviewed in Git like application code.",
 why: "Clicking resources together in consoles doesn't scale and can't be reviewed or repeated. Data teams manage S3, IAM, Glue, Snowflake and Airflow infrastructure with Terraform.",
 steps: [
  { h: "A lake bucket and job role",
    code: `# main.tf
terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
  backend "s3" { bucket = "acme-tf-state", key = "data-platform/terraform.tfstate", region = "ap-south-1" }
}
provider "aws" { region = var.region }

variable "region" { default = "ap-south-1" }
variable "env"    { type = string }

resource "aws_s3_bucket" "lake" {
  bucket = "acme-data-lake-\${var.env}"
  tags   = { team = "data", env = var.env }
}

resource "aws_s3_bucket_public_access_block" "lake" {
  bucket                  = aws_s3_bucket.lake.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_role" "extract_job" {
  name               = "shop-extract-\${var.env}"
  assume_role_policy = data.aws_iam_policy_document.glue_trust.json
}

data "aws_iam_policy_document" "glue_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals { type = "Service", identifiers = ["glue.amazonaws.com"] }
  }
}

resource "aws_iam_role_policy" "write_raw" {
  role   = aws_iam_role.extract_job.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = ["s3:PutObject"],
                   Resource = "\${aws_s3_bucket.lake.arn}/raw/shop/*" }]
  })
}

output "lake_bucket" { value = aws_s3_bucket.lake.bucket }`, lang: "hcl" },
  { h: "The workflow",
    code: `terraform init                      # download providers, connect to remote state
terraform fmt && terraform validate
terraform plan -var env=dev -out plan.tfplan
terraform apply plan.tfplan`, lang: "bash",
    out: { text: "Terraform will perform the following actions:\n\n  # aws_iam_role.extract_job will be created\n  # aws_iam_role_policy.write_raw will be created\n  # aws_s3_bucket.lake will be created\n  # aws_s3_bucket_public_access_block.lake will be created\n\nPlan: 4 to add, 0 to change, 0 to destroy.\n\nApply complete! Resources: 4 added, 0 changed, 0 destroyed.\n\nOutputs:\nlake_bucket = \"acme-data-lake-dev\"", hand: true } },
  { h: "State, environments and modules",
    code: `state        remote (S3 + DynamoDB lock / Terraform Cloud), never on a laptop, never in Git
envs         same code, different variables: env=dev / env=prod (workspaces or folders)
modules      reusable pieces: module "lake" { source = "./modules/lake", env = "prod" }
drift        someone clicked in the console → plan shows the difference; fix in code
secrets      never in .tf files; read from Secrets Manager or pass via CI variables`, lang: "text" },
  { h: "Terraform in CI",
    code: `# .github/workflows/infra.yml
on:
  pull_request: { paths: ["infra/**"] }
  push: { branches: [main], paths: ["infra/**"] }
jobs:
  terraform:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read, pull-requests: write }
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: aws-actions/configure-aws-credentials@v4      # OIDC role, no stored keys
        with: { role-to-assume: "arn:aws:iam::123456789012:role/gh-terraform", aws-region: ap-south-1 }
      - run: terraform -chdir=infra init && terraform -chdir=infra plan -var env=prod -out plan.tfplan
      - if: github.ref == 'refs/heads/main'
        run: terraform -chdir=infra apply plan.tfplan`, lang: "yaml" },
  { h: "Other tools",
    p: ["Pulumi and AWS CDK do the same in Python/TypeScript; CloudFormation is AWS-native YAML. Snowflake, Databricks and Datadog all have Terraform providers, so warehouses, users and grants can be managed the same way."] }
 ],
 mistakes: [
  "Local state files (lost laptop = lost infrastructure knowledge).",
  "Applying without reviewing the plan.",
  "Fixing things in the console and never updating the code (drift).",
  "Secrets or access keys committed in .tf files."
 ],
 practice: [
  { q: "Write a Terraform lifecycle rule resource that deletes objects under _tmp/ after 3 days for the lake bucket.", code: `resource "aws_s3_bucket_lifecycle_configuration" "lake" {
  bucket = aws_s3_bucket.lake.id
  rule {
    id     = "tmp-cleanup"
    status = "Enabled"
    filter { prefix = "_tmp/" }
    expiration { days = 3 }
  }
}`, lang: "hcl" },
  { q: "terraform plan says it will destroy and recreate the production bucket. What do you do?", a: "Stop. Don't apply. Find why (renamed resource, changed an immutable attribute like bucket name, moved module). Fix with a <code>moved</code> block or <code>terraform state mv</code>, or revert the change, until the plan shows no destroy. Add <code>lifecycle { prevent_destroy = true }</code> on critical resources." }
 ],
 check: [
  ["terraform plan does what?", ["Creates resources", "Shows what would change", "Deletes state", "Formats code"], 1, "Review before apply."],
  ["Where should Terraform state live?", ["Git", "Remote backend with locking", "Laptop", "Email"], 1, "Shared and safe."],
  ["Someone changed a bucket in the console. Terraform calls that…", ["State", "Drift", "Module", "Output"], 1, "Fix it in code."]
 ],
 remember: [
  "Resources in code; plan → review → apply.",
  "Remote state with locking; envs via variables.",
  "Modules for reuse; prevent_destroy on critical resources.",
  "CI runs plan on PRs, apply on main, with OIDC roles."
 ]
},
{
 id: "build",
 title: "Project: a small cloud data platform",
 level: "Project",
 one: "Put the pieces together: a lake bucket with zones and lifecycle rules, a least-privilege job role, a cataloged partitioned table, a pipeline step that lands and registers data idempotently, and cost/monitoring checks, all reproducible from code.",
 why: "Being able to design and stand up a minimal, secure, cost-aware platform is what separates a data engineer from someone who only writes queries.",
 steps: [
  { h: "Architecture",
    code: `shop API ──(Airflow on MWAA: extract task, role shop-extract)──► s3://lake/raw/shop/orders/dt=…/
                                    │
                         Glue/Spark job (role transform)      ──► s3://lake/staging/shop/orders/ (Iceberg)
                                    │
                        dbt on Redshift/Snowflake/Athena       ──► marts.daily_revenue ──► BI dashboard
infra: Terraform (buckets, roles, catalog, warehouse) · CI: plan on PR, apply on main
ops: CloudWatch alarms (failure, freshness, volume) · budget alerts · lifecycle rules`, lang: "text" },
  { h: "The landing step, end to end",
    pre: AWS,
    code: `import io, pandas as pd
s3, glue = boto3.client("s3"), boto3.client("glue")
BUCKET = "acme-data-lake-dev"

def bootstrap():
    s3.create_bucket(Bucket=BUCKET, CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
    s3.put_public_access_block(Bucket=BUCKET, PublicAccessBlockConfiguration={
        "BlockPublicAcls": True, "IgnorePublicAcls": True, "BlockPublicPolicy": True, "RestrictPublicBuckets": True})
    glue.create_database(DatabaseInput={"Name": "staging_shop"})
    glue.create_table(DatabaseName="staging_shop", TableInput={
        "Name": "orders", "PartitionKeys": [{"Name": "dt", "Type": "string"}],
        "StorageDescriptor": {"Columns": [{"Name": "order_id", "Type": "bigint"}, {"Name": "amount", "Type": "bigint"}],
                              "Location": f"s3://{BUCKET}/staging/shop/orders/"}})

def land(dt, rows):
    prefix = f"staging/shop/orders/dt={dt}/"
    old = s3.list_objects_v2(Bucket=BUCKET, Prefix=prefix).get("Contents", [])
    if old:                                                    # idempotent: replace the day
        s3.delete_objects(Bucket=BUCKET, Delete={"Objects": [{"Key": o["Key"]} for o in old]})
    buf = io.BytesIO(); pd.DataFrame(rows, columns=["order_id", "amount"]).to_parquet(buf, index=False)
    s3.put_object(Bucket=BUCKET, Key=prefix + "part-0000.parquet", Body=buf.getvalue())
    try:
        glue.create_partition(DatabaseName="staging_shop", TableName="orders", PartitionInput={
            "Values": [dt], "StorageDescriptor": {"Location": f"s3://{BUCKET}/{prefix}"}})
    except glue.exceptions.AlreadyExistsException:
        pass
    return len(rows)

def check(dt, expected_min=1):
    objs = s3.list_objects_v2(Bucket=BUCKET, Prefix=f"staging/shop/orders/dt={dt}/").get("Contents", [])
    df = pd.read_parquet(io.BytesIO(s3.get_object(Bucket=BUCKET, Key=objs[0]["Key"])["Body"].read()))
    assert len(objs) == 1 and len(df) >= expected_min and df["order_id"].is_unique
    return f"{dt}: {len(df)} rows, {len(objs)} file, checks passed"

bootstrap()
land("2025-07-05", [(1, 500), (2, 900)])
land("2025-07-05", [(1, 500), (2, 900), (3, 1200)])          # re-run with a late order: day replaced
land("2025-07-06", [(4, 450)])
print(check("2025-07-05")); print(check("2025-07-06"))
parts = glue.get_partitions(DatabaseName="staging_shop", TableName="orders")["Partitions"]
print("catalog partitions:", sorted(p["Values"][0] for p in parts))` },
  { h: "Tests",
    code: `import os, boto3, pytest
from moto import mock_aws
os.environ.update(AWS_ACCESS_KEY_ID="testing", AWS_SECRET_ACCESS_KEY="testing", AWS_DEFAULT_REGION="ap-south-1")

BUCKET = "lake-test"

@pytest.fixture
def s3():
    with mock_aws():                                  # fresh fake AWS for every test
        client = boto3.client("s3")
        client.create_bucket(Bucket=BUCKET, CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
        yield client

def land(s3, dt, body):
    prefix = f"raw/orders/dt={dt}/"
    for o in s3.list_objects_v2(Bucket=BUCKET, Prefix=prefix).get("Contents", []):
        s3.delete_object(Bucket=BUCKET, Key=o["Key"])
    s3.put_object(Bucket=BUCKET, Key=prefix + "part-0000.jsonl", Body=body)

def test_rerun_replaces_day(s3):
    land(s3, "2025-07-05", b"a"); land(s3, "2025-07-05", b"b")
    objs = s3.list_objects_v2(Bucket=BUCKET, Prefix="raw/orders/dt=2025-07-05/")["Contents"]
    assert len(objs) == 1
    assert s3.get_object(Bucket=BUCKET, Key=objs[0]["Key"])["Body"].read() == b"b"

def test_other_days_untouched(s3):
    land(s3, "2025-07-05", b"a"); land(s3, "2025-07-06", b"b"); land(s3, "2025-07-06", b"c")
    assert s3.get_object(Bucket=BUCKET, Key="raw/orders/dt=2025-07-05/part-0000.jsonl")["Body"].read() == b"a"`, test: true },
  { h: "Portfolio checklist",
    p: ["Repo with <code>infra/</code> (Terraform), <code>pipelines/</code> (Airflow DAG + jobs), <code>dbt/</code>, and tests that run offline with moto. README: architecture diagram, IAM design (which role can touch which prefix), cost estimate per month, alerts and their owners, and how to deploy dev from scratch with one command."] }
 ],
 mistakes: [
  "Hand-created resources nobody can reproduce.",
  "One admin role used by every job.",
  "Files landed without catalog partitions (queries miss new data).",
  "No cost estimate or budget alert."
 ],
 practice: [
  { q: "Why does land() delete the day's existing objects before writing?", a: "So a re-run or backfill replaces that day instead of adding a second file with duplicate rows. Readers would otherwise count both files. With Iceberg/Delta you'd do an atomic overwrite of the partition instead." },
  { q: "Write a volume check that fails if a day has fewer than half of the previous day's rows.", code: `def volume_ok(today_rows: int, yesterday_rows: int) -> bool:
    return yesterday_rows == 0 or today_rows >= 0.5 * yesterday_rows

print(volume_ok(480, 900), volume_ok(300, 900))` }
 ],
 check: [
  ["Why register partitions in the catalog?", ["Required by S3", "So query engines see the new day's data", "Encryption", "Cost"], 1, "Otherwise queries miss it."],
  ["Testing AWS code offline uses…", ["Production account", "moto / localstack", "Screenshots", "Nothing"], 1, "Free and safe."],
  ["Least privilege here means…", ["One admin role", "Each job's role can only touch its own prefixes", "No roles", "Public bucket"], 1, "Limits blast radius."]
 ],
 remember: [
  "Zones + lifecycle + public access block + catalog.",
  "Roles per job, least privilege.",
  "Idempotent landing (replace the day) + catalog partitions + checks.",
  "Everything in Terraform; tests offline with moto; cost estimate in README."
 ]
}
];
