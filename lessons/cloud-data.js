// Lessons for course "cloud-data". Built by tools/course-builder from tools/courses/cloud-data.js.
// Python examples were run and their real output stored.
(function (L) {
L["cloud-data:aws-core"] = {
 "title": "Core cloud services for data (AWS first)",
 "level": "Intermediate",
 "one": "Data platforms are built from a few cloud building blocks: <b>object storage</b> (S3), <b>identity</b> (IAM roles), <b>compute</b> (Glue, EMR, Lambda, containers), <b>warehouses/query engines</b> (Redshift, Athena, Snowflake) and <b>orchestration/monitoring</b>.",
 "why": "Most data engineering job posts ask for one cloud (AWS is the most common, then Azure and GCP). The concepts map across all three, so learn one well.",
 "steps": [
  {
   "h": "The building blocks across clouds",
   "code": "need                    AWS                        GCP                     Azure\nobject storage (lake)   S3                         Cloud Storage           ADLS Gen2 / Blob\nidentity                IAM roles & policies       IAM service accounts    Entra ID, managed identity\ncatalog                 Glue Data Catalog          Dataplex / BigLake      Purview / Unity Catalog\nserverless SQL on lake  Athena                     BigQuery (external)     Synapse serverless\nwarehouse               Redshift (or Snowflake)    BigQuery                Synapse / Fabric\nSpark                   EMR, Glue, Databricks      Dataproc, Databricks    Databricks, Fabric\norchestration           MWAA (Airflow), Step Fn    Cloud Composer          Data Factory\nstreaming               Kinesis, MSK (Kafka)       Pub/Sub, Dataflow       Event Hubs\nsecrets                 Secrets Manager            Secret Manager          Key Vault\nmonitoring              CloudWatch                 Cloud Monitoring        Azure Monitor",
   "lang": "text"
  },
  {
   "h": "S3 basics with boto3",
   "code": "s3 = boto3.client(\"s3\")\ns3.create_bucket(Bucket=\"acme-data-lake\", CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\ns3.put_object(Bucket=\"acme-data-lake\", Key=\"raw/shop/orders/dt=2025-07-05/orders.jsonl\",\n              Body=b'{\"id\": 1, \"amount\": 500}\\n{\"id\": 2, \"amount\": 900}\\n')\nfor obj in s3.list_objects_v2(Bucket=\"acme-data-lake\", Prefix=\"raw/\")[\"Contents\"]:\n    print(obj[\"Key\"], obj[\"Size\"], \"bytes\")\nbody = s3.get_object(Bucket=\"acme-data-lake\", Key=\"raw/shop/orders/dt=2025-07-05/orders.jsonl\")[\"Body\"].read()\nprint([json.loads(line)[\"amount\"] for line in body.splitlines()])",
   "note": "This runs against moto, an offline AWS simulator, so it's free and safe. Remove the mock and the same code talks to real S3.",
   "out": {
    "text": "raw/shop/orders/dt=2025-07-05/orders.jsonl 50 bytes\n[500, 900]"
   }
  },
  {
   "h": "IAM: least privilege with roles",
   "p": [
    "Pipelines never use personal access keys. Each job runs as a <b>role</b> with a policy allowing only what it needs: e.g. the extract job may write to <code>raw/shop/*</code> but not read finance data."
   ],
   "code": "iam = boto3.client(\"iam\")\npolicy = {\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n        {\"Effect\": \"Allow\", \"Action\": [\"s3:PutObject\"], \"Resource\": \"arn:aws:s3:::acme-data-lake/raw/shop/*\"},\n        {\"Effect\": \"Allow\", \"Action\": [\"s3:ListBucket\"], \"Resource\": \"arn:aws:s3:::acme-data-lake\",\n         \"Condition\": {\"StringLike\": {\"s3:prefix\": [\"raw/shop/*\"]}}},\n    ],\n}\ntrust = {\"Version\": \"2012-10-17\", \"Statement\": [{\"Effect\": \"Allow\", \"Principal\": {\"Service\": \"glue.amazonaws.com\"},\n                                                  \"Action\": \"sts:AssumeRole\"}]}\nrole = iam.create_role(RoleName=\"shop-extract-job\", AssumeRolePolicyDocument=json.dumps(trust))\niam.put_role_policy(RoleName=\"shop-extract-job\", PolicyName=\"write-raw-shop\", PolicyDocument=json.dumps(policy))\nprint(role[\"Role\"][\"Arn\"])\nprint([s[\"Action\"] for s in policy[\"Statement\"]])",
   "out": {
    "text": "arn:aws:iam::123456789012:role/shop-extract-job\n[['s3:PutObject'], ['s3:ListBucket']]"
   }
  },
  {
   "h": "Compute choices",
   "code": "Lambda             small event-driven steps (≤15 min): react to a file landing, call an API\nGlue jobs          serverless Spark/Python ETL; Glue crawlers fill the catalog\nEMR / EMR Serverless   big Spark/Hive/Trino jobs, more control\nECS / Fargate      containerised Python jobs (your extractor in Docker)\nAthena             serverless SQL over S3 (pay per TB scanned)\nRedshift / Snowflake   warehouse for modelled data and BI",
   "lang": "text"
  },
  {
   "h": "Regions, networking, encryption",
   "p": [
    "Keep data and compute in the same <b>region</b> (cross-region transfer costs money and adds latency; data residency laws may require a region). Databases sit in private subnets; jobs reach them through the VPC. Turn on encryption at rest (SSE-S3/KMS) and in transit (TLS), and block public access on buckets."
   ]
  }
 ],
 "mistakes": [
  "Using personal access keys in pipelines instead of roles.",
  "Policies with s3:* on * (one leaked job credential exposes everything).",
  "Public S3 buckets.",
  "Compute in one region reading data from another."
 ],
 "practice": [
  {
   "q": "Upload two files under different date prefixes and list only July 6.",
   "code": "s3 = boto3.client(\"s3\")\ns3.create_bucket(Bucket=\"lake\", CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\nfor d in [\"2025-07-05\", \"2025-07-06\"]:\n    s3.put_object(Bucket=\"lake\", Key=f\"raw/orders/dt={d}/part-0.jsonl\", Body=b\"{}\")\nprint([o[\"Key\"] for o in s3.list_objects_v2(Bucket=\"lake\", Prefix=\"raw/orders/dt=2025-07-06/\")[\"Contents\"]])",
   "out": {
    "text": "['raw/orders/dt=2025-07-06/part-0.jsonl']"
   }
  },
  {
   "q": "Write the IAM statement that lets a reporting job only read objects under <code>marts/</code> in acme-data-lake.",
   "a": "<code>{\"Effect\": \"Allow\", \"Action\": [\"s3:GetObject\"], \"Resource\": \"arn:aws:s3:::acme-data-lake/marts/*\"}</code> plus <code>s3:ListBucket</code> on the bucket ARN with a <code>s3:prefix</code> condition of <code>marts/*</code>."
  }
 ],
 "check": [
  [
   "Where does a data lake live on AWS?",
   [
    "EC2 disks",
    "S3",
    "Lambda",
    "IAM"
   ],
   1,
   "Object storage."
  ],
  [
   "Pipelines should authenticate with…",
   [
    "Personal keys",
    "IAM roles with least-privilege policies",
    "Root account",
    "Shared password"
   ],
   1,
   "Least privilege."
  ],
  [
   "Serverless SQL over S3 files on AWS?",
   [
    "Athena",
    "Kinesis",
    "SNS",
    "CloudFront"
   ],
   0,
   "Pay per data scanned."
  ]
 ],
 "remember": [
  "Storage, identity, compute, query, orchestration, monitoring.",
  "S3 for the lake; roles + least privilege for access.",
  "Glue/EMR for Spark, Athena for SQL on files, Redshift/Snowflake for warehouses.",
  "Same region; private networking; encryption; no public buckets."
 ]
};
L["cloud-data:lake-layout"] = {
 "title": "Designing a data lake layout",
 "level": "Intermediate",
 "one": "A lake stays usable when paths follow rules: <b>zone/source/table/partition=value/files</b>, open formats (Parquet/Delta/Iceberg), a <b>catalog</b> describing every table, and <b>lifecycle rules</b> for old data.",
 "why": "A badly organised bucket becomes a “data swamp” nobody trusts. A clear layout makes querying, permissions and costs manageable.",
 "steps": [
  {
   "h": "A standard layout",
   "code": "s3://acme-data-lake/\n  raw/shop/orders/dt=2025-07-05/part-0000.jsonl.gz       as received, immutable\n  raw/erp/invoices/dt=2025-07-05/invoices.csv.gz\n  staging/shop/orders/dt=2025-07-05/part-0000.parquet    cleaned, typed, deduped\n  marts/sales/daily_revenue/month=2025-07/part-0000.parquet  business-ready\n  _tmp/ ...                                                scratch (auto-deleted)\n\nrules: lowercase, snake_case · zone first (permissions per zone) · partition by date\n       one table per folder · never mix formats in a table folder",
   "lang": "text"
  },
  {
   "h": "Writing partitioned Parquet to S3",
   "code": "import io, pandas as pd\ns3 = boto3.client(\"s3\")\ns3.create_bucket(Bucket=\"acme-data-lake\", CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\norders = pd.DataFrame({\"order_id\": [1, 2, 3, 4], \"amount\": [500, 900, 1200, 450],\n                       \"dt\": [\"2025-07-04\", \"2025-07-04\", \"2025-07-05\", \"2025-07-05\"]})\nfor dt, part in orders.groupby(\"dt\"):\n    buf = io.BytesIO()\n    part.drop(columns=\"dt\").to_parquet(buf, index=False)\n    s3.put_object(Bucket=\"acme-data-lake\", Key=f\"staging/shop/orders/dt={dt}/part-0000.parquet\", Body=buf.getvalue())\nkeys = [o[\"Key\"] for o in s3.list_objects_v2(Bucket=\"acme-data-lake\", Prefix=\"staging/\")[\"Contents\"]]\nprint(\"\\n\".join(keys))",
   "out": {
    "text": "staging/shop/orders/dt=2025-07-04/part-0000.parquet\nstaging/shop/orders/dt=2025-07-05/part-0000.parquet"
   }
  },
  {
   "h": "Register tables in the catalog",
   "p": [
    "Files alone aren't tables. The <b>Glue Data Catalog</b> (or a crawler) records each table's location, schema, format and partitions, so Athena, Redshift Spectrum, EMR and Glue can all query it by name."
   ],
   "code": "glue = boto3.client(\"glue\")\nglue.create_database(DatabaseInput={\"Name\": \"staging_shop\"})\nglue.create_table(DatabaseName=\"staging_shop\", TableInput={\n    \"Name\": \"orders\",\n    \"TableType\": \"EXTERNAL_TABLE\",\n    \"PartitionKeys\": [{\"Name\": \"dt\", \"Type\": \"string\"}],\n    \"StorageDescriptor\": {\n        \"Columns\": [{\"Name\": \"order_id\", \"Type\": \"bigint\"}, {\"Name\": \"amount\", \"Type\": \"bigint\"}],\n        \"Location\": \"s3://acme-data-lake/staging/shop/orders/\",\n        \"InputFormat\": \"org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat\",\n        \"OutputFormat\": \"org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat\",\n        \"SerdeInfo\": {\"SerializationLibrary\": \"org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe\"},\n    },\n})\nfor dt in [\"2025-07-04\", \"2025-07-05\"]:\n    glue.create_partition(DatabaseName=\"staging_shop\", TableName=\"orders\", PartitionInput={\n        \"Values\": [dt], \"StorageDescriptor\": {\"Location\": f\"s3://acme-data-lake/staging/shop/orders/dt={dt}/\"}})\nt = glue.get_table(DatabaseName=\"staging_shop\", Name=\"orders\")[\"Table\"]\nprint(t[\"Name\"], [c[\"Name\"] for c in t[\"StorageDescriptor\"][\"Columns\"]], \"partitioned by\", [p[\"Name\"] for p in t[\"PartitionKeys\"]])\nprint(\"partitions:\", [p[\"Values\"][0] for p in glue.get_partitions(DatabaseName=\"staging_shop\", TableName=\"orders\")[\"Partitions\"]])",
   "note": "Then Athena can run <code>SELECT SUM(amount) FROM staging_shop.orders WHERE dt = '2025-07-05'</code>, reading only that partition's files.",
   "out": {
    "text": "orders ['order_id', 'amount'] partitioned by ['dt']\npartitions: ['2025-07-04', '2025-07-05']"
   }
  },
  {
   "h": "Lifecycle rules",
   "code": "s3 = boto3.client(\"s3\")\ns3.create_bucket(Bucket=\"acme-data-lake\", CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\ns3.put_bucket_lifecycle_configuration(Bucket=\"acme-data-lake\", LifecycleConfiguration={\"Rules\": [\n    {\"ID\": \"raw-to-cold\", \"Filter\": {\"Prefix\": \"raw/\"}, \"Status\": \"Enabled\",\n     \"Transitions\": [{\"Days\": 30, \"StorageClass\": \"STANDARD_IA\"}, {\"Days\": 180, \"StorageClass\": \"GLACIER_IR\"}]},\n    {\"ID\": \"tmp-cleanup\", \"Filter\": {\"Prefix\": \"_tmp/\"}, \"Status\": \"Enabled\", \"Expiration\": {\"Days\": 3}},\n]})\nfor r in s3.get_bucket_lifecycle_configuration(Bucket=\"acme-data-lake\")[\"Rules\"]:\n    print(r[\"ID\"], r[\"Filter\"][\"Prefix\"], r.get(\"Transitions\") or r.get(\"Expiration\"))",
   "out": {
    "text": "raw-to-cold raw/ [{'Days': 30, 'StorageClass': 'STANDARD_IA'}, {'Days': 180, 'StorageClass': 'GLACIER_IR'}]\ntmp-cleanup _tmp/ {'Days': 3}"
   }
  },
  {
   "h": "Table formats",
   "p": [
    "For staging and marts, prefer an open table format (<b>Iceberg</b> or <b>Delta</b>) over loose Parquet: you get atomic commits (readers never see half-written data), MERGE/DELETE, schema evolution and time travel. Athena, Glue, EMR, Snowflake and BigQuery all read Iceberg."
   ]
  }
 ],
 "mistakes": [
  "Random folder names per developer.",
  "Files without a catalog entry (nobody can find or query them).",
  "Keeping raw data in expensive storage forever, or deleting it too early.",
  "Partitioning by high-cardinality columns (millions of tiny folders)."
 ],
 "practice": [
  {
   "q": "Design the S3 paths for: raw Razorpay payments (JSON, daily), cleaned payments (Parquet), and a monthly revenue mart.",
   "a": "<code>raw/razorpay/payments/dt=YYYY-MM-DD/*.jsonl.gz</code>, <code>staging/razorpay/payments/dt=YYYY-MM-DD/*.parquet</code> (or an Iceberg table), <code>marts/finance/monthly_revenue/month=YYYY-MM/*.parquet</code>. Catalog databases raw_razorpay, staging_razorpay, marts_finance; lifecycle rule moving raw/ to colder storage after 30–90 days."
  },
  {
   "q": "Add a lifecycle rule that deletes objects under <code>exports/</code> after 7 days.",
   "code": "s3 = boto3.client(\"s3\")\ns3.create_bucket(Bucket=\"lake\", CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\ns3.put_bucket_lifecycle_configuration(Bucket=\"lake\", LifecycleConfiguration={\"Rules\": [\n    {\"ID\": \"exports-7d\", \"Filter\": {\"Prefix\": \"exports/\"}, \"Status\": \"Enabled\", \"Expiration\": {\"Days\": 7}}]})\nprint(s3.get_bucket_lifecycle_configuration(Bucket=\"lake\")[\"Rules\"][0][\"Expiration\"])",
   "out": {
    "text": "{'Days': 7}"
   }
  }
 ],
 "check": [
  [
   "Why put the zone (raw/staging/marts) first in paths?",
   [
    "Alphabetical",
    "Permissions and lifecycle rules per zone",
    "Faster uploads",
    "Required by S3"
   ],
   1,
   "Policies by prefix."
  ],
  [
   "The Glue Data Catalog stores…",
   [
    "The data",
    "Table metadata: schema, location, partitions",
    "Passwords",
    "Logs"
   ],
   1,
   "Makes files queryable by name."
  ],
  [
   "Lifecycle rules help with…",
   [
    "Speed",
    "Cost: moving/deleting old data automatically",
    "Security only",
    "Schemas"
   ],
   1,
   "Storage classes and expiry."
  ]
 ],
 "remember": [
  "zone/source/table/partition=value/files.",
  "Parquet/Iceberg/Delta; never mix formats in a table.",
  "Catalog every table (Glue/Unity).",
  "Lifecycle rules for raw and temp data."
 ]
};
L["cloud-data:warehouses"] = {
 "title": "Cloud warehouses: Snowflake, BigQuery, Redshift",
 "level": "Intermediate",
 "one": "Cloud warehouses separate <b>storage</b> from <b>compute</b>, scale on demand and bill differently: Snowflake by <b>warehouse-seconds</b>, BigQuery by <b>bytes scanned</b> (or slots), Redshift by <b>cluster/serverless capacity</b>.",
 "why": "You'll load data into and model data in one of these. Knowing how each bills and performs changes how you design tables and queries.",
 "steps": [
  {
   "h": "Comparison",
   "code": "                Snowflake                    BigQuery                    Redshift\ncompute         virtual warehouses (XS..6XL)  serverless slots            provisioned cluster or serverless RPUs\nbilling         credits per second running    on-demand: $/TB scanned     per hour of nodes / RPU-hours\n                (auto-suspend!)               or reserved slots\nstorage         compressed micro-partitions   columnar Capacitor          columnar, sort/dist keys\nperformance     clustering keys, search opt.  partition + cluster         sort keys, dist keys, MVs\nloading         COPY INTO from stage (S3)     load jobs, Storage Write    COPY from S3\nlake access     external/Iceberg tables       BigLake, external tables    Spectrum\nsharing         data sharing, marketplace     Analytics Hub               datashares",
   "lang": "text"
  },
  {
   "h": "Loading from the lake",
   "code": "-- Snowflake: stage pointing at S3, then COPY (idempotent: already-loaded files are skipped)\nCREATE STAGE raw_shop URL='s3://acme-data-lake/staging/shop/' STORAGE_INTEGRATION = s3_int\n  FILE_FORMAT = (TYPE = PARQUET);\nCOPY INTO staging.orders FROM @raw_shop/orders/ MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;\n\n-- BigQuery\nLOAD DATA INTO staging.orders FROM FILES (format = 'PARQUET',\n  uris = ['gs://acme-data-lake/staging/shop/orders/dt=2025-07-05/*.parquet']);\n\n-- Redshift\nCOPY staging.orders FROM 's3://acme-data-lake/staging/shop/orders/dt=2025-07-05/'\nIAM_ROLE 'arn:aws:iam::123456789012:role/redshift-load' FORMAT AS PARQUET;",
   "lang": "sql"
  },
  {
   "h": "Why bytes scanned matters (BigQuery-style billing)",
   "p": [
    "On-demand BigQuery charges per TB scanned, so columns selected and partitions filtered decide the bill. A quick model:"
   ],
   "code": "PRICE_PER_TB = 6.25                      # USD, on-demand list price (check current pricing)\ntable_tb = 5.0                            # 5 TB table, 40 columns, 3 years of daily partitions\ncolumns, days = 40, 3 * 365\n\ndef cost(cols_read, days_read):\n    tb = table_tb * (cols_read / columns) * (days_read / days)\n    return tb, tb * PRICE_PER_TB\n\nfor label, c, d in [(\"SELECT *, no date filter\", 40, days), (\"3 columns, no date filter\", 3, days),\n                    (\"3 columns, last 7 days\", 3, 7)]:\n    tb, usd = cost(c, d)\n    print(f\"{label:28} {tb * 1000:9.1f} GB  ${usd:8.2f} per run  ${usd * 24 * 30:10.2f}/month if hourly\")",
   "note": "Same question, very different bills. Partition + cluster tables and select only the columns you need.",
   "out": {
    "text": "SELECT *, no date filter        5000.0 GB  $   31.25 per run  $  22500.00/month if hourly\n3 columns, no date filter        375.0 GB  $    2.34 per run  $   1687.50/month if hourly\n3 columns, last 7 days             2.4 GB  $    0.01 per run  $     10.79/month if hourly"
   }
  },
  {
   "h": "Snowflake: warehouses cost while running",
   "code": "CREATE WAREHOUSE transform_wh WAREHOUSE_SIZE = 'SMALL'\n  AUTO_SUSPEND = 60 AUTO_RESUME = TRUE INITIALLY_SUSPENDED = TRUE;    -- stop after 60s idle\n\n-- separate warehouses per workload, so BI users don't queue behind dbt runs\nCREATE WAREHOUSE bi_wh WAREHOUSE_SIZE = 'XSMALL' AUTO_SUSPEND = 60;\n\n-- see what costs money\nSELECT warehouse_name, SUM(credits_used) AS credits\nFROM snowflake.account_usage.warehouse_metering_history\nWHERE start_time > DATEADD(day, -7, CURRENT_TIMESTAMP())\nGROUP BY 1 ORDER BY 2 DESC;",
   "lang": "sql"
  },
  {
   "h": "Choosing",
   "p": [
    "Already on GCP: BigQuery. AWS shop with steady workloads: Redshift, or Snowflake for multi-cloud and ease of use. Databricks shops often use Databricks SQL on Delta. The modelling, dbt and SQL skills transfer between all of them."
   ]
  }
 ],
 "mistakes": [
  "Snowflake warehouses without auto-suspend (billed while idle).",
  "SELECT * on wide BigQuery tables in scheduled queries.",
  "One warehouse for everything, so dashboards queue behind batch jobs.",
  "Loading with row-by-row INSERTs instead of COPY/load jobs."
 ],
 "practice": [
  {
   "q": "A dashboard runs a BigQuery query every 15 minutes that scans 800 GB. Estimate the monthly on-demand cost and propose two fixes.",
   "code": "runs_per_month = 4 * 24 * 30\ntb_per_run = 0.8\nprint(f\"~${runs_per_month * tb_per_run * 6.25:,.0f} per month at $6.25/TB\")",
   "out": {
    "text": "~$14,400 per month at $6.25/TB"
   }
  },
  {
   "q": "Snowflake bill doubled. Where do you look first?",
   "a": "account_usage.warehouse_metering_history (which warehouses), query_history (which queries/users, long runtimes, spilling), and settings: auto-suspend times, warehouse sizes, multi-cluster settings. Then fix: auto-suspend 60s, right-size, separate workloads, fix expensive queries (pruning, clustering)."
  }
 ],
 "check": [
  [
   "BigQuery on-demand bills by…",
   [
    "Rows returned",
    "Bytes scanned",
    "Users",
    "Tables"
   ],
   1,
   "Scan less."
  ],
  [
   "Snowflake bills compute by…",
   [
    "Bytes scanned",
    "Warehouse running time (credits)",
    "Rows",
    "Queries"
   ],
   1,
   "Auto-suspend matters."
  ],
  [
   "Fast bulk load into a warehouse?",
   [
    "Row-by-row INSERT",
    "COPY / load jobs from object storage",
    "Copy-paste",
    "ODBC loop"
   ],
   1,
   "Bulk paths."
  ]
 ],
 "remember": [
  "Storage and compute separate; billing differs per warehouse.",
  "Load with COPY/load jobs from the lake.",
  "BigQuery: scan less (partition, cluster, fewer columns).",
  "Snowflake: auto-suspend, right-size, separate workloads."
 ]
};
L["cloud-data:cost"] = {
 "title": "Cost, monitoring and FinOps",
 "level": "Intermediate",
 "one": "Cloud data platforms can get expensive fast. Know what drives cost (<b>compute time, data scanned, storage, data transfer</b>), tag everything, set <b>budgets and alerts</b>, and monitor pipelines with metrics and logs.",
 "why": "Teams that ignore cost get surprise bills; engineers who can cut cost by 40% are valued. Monitoring is what makes a platform reliable.",
 "steps": [
  {
   "h": "Where the money goes",
   "code": "compute       warehouses left running, oversized clusters, Spark jobs on huge instances\nscanning      SELECT * and unpartitioned scans (Athena/BigQuery)\nstorage       never-deleted raw data, many copies of the same table, old snapshots\ntransfer      cross-region/cross-cloud copies, egress to the internet\nsmall things  millions of S3 requests (tiny files), NAT gateway traffic, idle dev resources",
   "lang": "text"
  },
  {
   "h": "Estimating a monthly bill",
   "code": "prices = {\"s3_gb_month\": 0.023, \"athena_tb\": 5.0, \"glue_dpu_hour\": 0.44, \"redshift_rpu_hour\": 0.375}\n\nusage = {\n    \"s3_gb_month\": 2_000,              # 2 TB stored\n    \"athena_tb\": 0.4 * 30,             # 400 GB scanned a day\n    \"glue_dpu_hour\": 10 * 0.5 * 30,    # 10 DPUs for 30 minutes daily\n    \"redshift_rpu_hour\": 8 * 4 * 30,   # 8 RPUs busy 4 hours a day\n}\ntotal = 0\nfor k, qty in usage.items():\n    cost = qty * prices[k]\n    total += cost\n    print(f\"{k:20} {qty:10,.1f} x {prices[k]:<6} = ${cost:9,.2f}\")\nprint(f\"{'total':20} {'':23} ${total:9,.2f} per month (illustrative prices; check current regional pricing)\")",
   "out": {
    "text": "s3_gb_month             2,000.0 x 0.023  = $    46.00\nathena_tb                  12.0 x 5.0    = $    60.00\nglue_dpu_hour             150.0 x 0.44   = $    66.00\nredshift_rpu_hour         960.0 x 0.375  = $   360.00\ntotal                                        $   532.00 per month (illustrative prices; check current regional pricing)"
   }
  },
  {
   "h": "Cost controls",
   "code": "tags            every resource: team, project, env  → cost reports per team\nbudgets         AWS Budgets / GCP budgets with alerts at 50/80/100%\nlimits          BigQuery max bytes billed per query; Snowflake resource monitors\nauto-stop       auto-suspend warehouses, auto-terminate clusters, scale to zero\nright-size      smaller instances, spot/preemptible for batch Spark\ndata hygiene    lifecycle rules, compaction, drop unused tables, partition everything",
   "lang": "text"
  },
  {
   "h": "Monitoring pipelines",
   "p": [
    "Emit a few metrics from every pipeline run (rows in/out, duration, freshness) and alert on them. A simple pattern, checked here with a small in-memory history:"
   ],
   "code": "from statistics import mean, pstdev\n\nhistory = [10_120, 9_980, 10_340, 10_050, 9_870, 10_210, 10_005]       # rows loaded per day\ndef check_volume(today, history, z=3.0):\n    mu, sd = mean(history), pstdev(history)\n    zscore = (today - mu) / sd if sd else 0\n    return (\"ALERT\" if abs(zscore) > z else \"ok\"), round(zscore, 1)\n\nfor today in [10_150, 6_200]:\n    print(today, check_volume(today, history))",
   "note": "In production these numbers go to CloudWatch/Datadog/Prometheus, and alerts go to Slack/PagerDuty. dbt tests and tools like Elementary or Monte Carlo do similar anomaly checks on tables.",
   "out": {
    "text": "10150 ('ok', 0.5)\n6200 ('ALERT', -26.8)"
   }
  },
  {
   "h": "What to alert on",
   "code": "failure        job failed after retries                → page/Slack immediately\nfreshness      table not updated within SLA            → Slack, page if business-critical\nvolume         rows far outside normal range           → Slack\nquality        tests failing (nulls, duplicates)       → Slack, block downstream\ncost           daily spend > budget threshold          → Slack/email to owner",
   "lang": "text"
  }
 ],
 "mistakes": [
  "No tags, so nobody knows which team owns the bill.",
  "Dev clusters running all weekend.",
  "Alerts with no owner or runbook.",
  "Monitoring only job success, not data freshness or volume."
 ],
 "practice": [
  {
   "q": "Athena scans 300 GB per query, 200 queries/day, at $5/TB. Compute the monthly cost, then the cost if partition pruning cuts scans by 90%.",
   "code": "per_day = 200 * 0.3 * 5\nprint(f\"before: ${per_day * 30:,.0f}/month, after: ${per_day * 30 * 0.1:,.0f}/month\")",
   "out": {
    "text": "before: $9,000/month, after: $900/month"
   }
  },
  {
   "q": "List 4 quick wins to cut a data platform's cloud bill.",
   "a": "1) Auto-suspend/auto-terminate idle warehouses and clusters. 2) Partition/cluster big tables and remove SELECT * from scheduled queries. 3) Lifecycle rules for raw and temp data; compact small files. 4) Tag resources and review the top 10 cost items weekly (often a forgotten dev cluster or a runaway query)."
  }
 ],
 "check": [
  [
   "Biggest cost driver for idle Snowflake warehouses?",
   [
    "Storage",
    "Running compute without auto-suspend",
    "Users",
    "Tags"
   ],
   1,
   "Credits accrue while running."
  ],
  [
   "Tags help…",
   [
    "Speed",
    "Attribute cost to teams/projects",
    "Security only",
    "Compression"
   ],
   1,
   "Ownership of spend."
  ],
  [
   "Volume monitoring catches…",
   [
    "Syntax errors",
    "Partial loads and upstream outages that don't fail jobs",
    "Slow UI",
    "Bad passwords"
   ],
   1,
   "Silent data problems."
  ]
 ],
 "remember": [
  "Cost = compute + scanning + storage + transfer.",
  "Tags, budgets, alerts, per-query limits.",
  "Auto-stop, right-size, spot for batch.",
  "Monitor freshness, volume, quality, cost; every alert has an owner."
 ]
};
L["cloud-data:terraform"] = {
 "title": "Infrastructure as code with Terraform",
 "level": "Intermediate",
 "one": "<b>Terraform</b> describes cloud resources (buckets, roles, databases, warehouses) in code. <code>plan</code> shows what will change, <code>apply</code> makes it so, and the <b>state</b> remembers what exists. Everything is reviewed in Git like application code.",
 "why": "Clicking resources together in consoles doesn't scale and can't be reviewed or repeated. Data teams manage S3, IAM, Glue, Snowflake and Airflow infrastructure with Terraform.",
 "steps": [
  {
   "h": "A lake bucket and job role",
   "code": "# main.tf\nterraform {\n  required_providers { aws = { source = \"hashicorp/aws\", version = \"~> 5.0\" } }\n  backend \"s3\" { bucket = \"acme-tf-state\", key = \"data-platform/terraform.tfstate\", region = \"ap-south-1\" }\n}\nprovider \"aws\" { region = var.region }\n\nvariable \"region\" { default = \"ap-south-1\" }\nvariable \"env\"    { type = string }\n\nresource \"aws_s3_bucket\" \"lake\" {\n  bucket = \"acme-data-lake-${var.env}\"\n  tags   = { team = \"data\", env = var.env }\n}\n\nresource \"aws_s3_bucket_public_access_block\" \"lake\" {\n  bucket                  = aws_s3_bucket.lake.id\n  block_public_acls       = true\n  block_public_policy     = true\n  ignore_public_acls      = true\n  restrict_public_buckets = true\n}\n\nresource \"aws_iam_role\" \"extract_job\" {\n  name               = \"shop-extract-${var.env}\"\n  assume_role_policy = data.aws_iam_policy_document.glue_trust.json\n}\n\ndata \"aws_iam_policy_document\" \"glue_trust\" {\n  statement {\n    actions = [\"sts:AssumeRole\"]\n    principals { type = \"Service\", identifiers = [\"glue.amazonaws.com\"] }\n  }\n}\n\nresource \"aws_iam_role_policy\" \"write_raw\" {\n  role   = aws_iam_role.extract_job.id\n  policy = jsonencode({\n    Version = \"2012-10-17\"\n    Statement = [{ Effect = \"Allow\", Action = [\"s3:PutObject\"],\n                   Resource = \"${aws_s3_bucket.lake.arn}/raw/shop/*\" }]\n  })\n}\n\noutput \"lake_bucket\" { value = aws_s3_bucket.lake.bucket }",
   "lang": "hcl"
  },
  {
   "h": "The workflow",
   "code": "terraform init                      # download providers, connect to remote state\nterraform fmt && terraform validate\nterraform plan -var env=dev -out plan.tfplan\nterraform apply plan.tfplan",
   "lang": "bash",
   "out": {
    "text": "Terraform will perform the following actions:\n\n  # aws_iam_role.extract_job will be created\n  # aws_iam_role_policy.write_raw will be created\n  # aws_s3_bucket.lake will be created\n  # aws_s3_bucket_public_access_block.lake will be created\n\nPlan: 4 to add, 0 to change, 0 to destroy.\n\nApply complete! Resources: 4 added, 0 changed, 0 destroyed.\n\nOutputs:\nlake_bucket = \"acme-data-lake-dev\"",
    "label": "Example output"
   }
  },
  {
   "h": "State, environments and modules",
   "code": "state        remote (S3 + DynamoDB lock / Terraform Cloud), never on a laptop, never in Git\nenvs         same code, different variables: env=dev / env=prod (workspaces or folders)\nmodules      reusable pieces: module \"lake\" { source = \"./modules/lake\", env = \"prod\" }\ndrift        someone clicked in the console → plan shows the difference; fix in code\nsecrets      never in .tf files; read from Secrets Manager or pass via CI variables",
   "lang": "text"
  },
  {
   "h": "Terraform in CI",
   "code": "# .github/workflows/infra.yml\non:\n  pull_request: { paths: [\"infra/**\"] }\n  push: { branches: [main], paths: [\"infra/**\"] }\njobs:\n  terraform:\n    runs-on: ubuntu-latest\n    permissions: { id-token: write, contents: read, pull-requests: write }\n    steps:\n      - uses: actions/checkout@v4\n      - uses: hashicorp/setup-terraform@v3\n      - uses: aws-actions/configure-aws-credentials@v4      # OIDC role, no stored keys\n        with: { role-to-assume: \"arn:aws:iam::123456789012:role/gh-terraform\", aws-region: ap-south-1 }\n      - run: terraform -chdir=infra init && terraform -chdir=infra plan -var env=prod -out plan.tfplan\n      - if: github.ref == 'refs/heads/main'\n        run: terraform -chdir=infra apply plan.tfplan",
   "lang": "yaml"
  },
  {
   "h": "Other tools",
   "p": [
    "Pulumi and AWS CDK do the same in Python/TypeScript; CloudFormation is AWS-native YAML. Snowflake, Databricks and Datadog all have Terraform providers, so warehouses, users and grants can be managed the same way."
   ]
  }
 ],
 "mistakes": [
  "Local state files (lost laptop = lost infrastructure knowledge).",
  "Applying without reviewing the plan.",
  "Fixing things in the console and never updating the code (drift).",
  "Secrets or access keys committed in .tf files."
 ],
 "practice": [
  {
   "q": "Write a Terraform lifecycle rule resource that deletes objects under _tmp/ after 3 days for the lake bucket.",
   "code": "resource \"aws_s3_bucket_lifecycle_configuration\" \"lake\" {\n  bucket = aws_s3_bucket.lake.id\n  rule {\n    id     = \"tmp-cleanup\"\n    status = \"Enabled\"\n    filter { prefix = \"_tmp/\" }\n    expiration { days = 3 }\n  }\n}",
   "lang": "hcl"
  },
  {
   "q": "terraform plan says it will destroy and recreate the production bucket. What do you do?",
   "a": "Stop. Don't apply. Find why (renamed resource, changed an immutable attribute like bucket name, moved module). Fix with a <code>moved</code> block or <code>terraform state mv</code>, or revert the change, until the plan shows no destroy. Add <code>lifecycle { prevent_destroy = true }</code> on critical resources."
  }
 ],
 "check": [
  [
   "terraform plan does what?",
   [
    "Creates resources",
    "Shows what would change",
    "Deletes state",
    "Formats code"
   ],
   1,
   "Review before apply."
  ],
  [
   "Where should Terraform state live?",
   [
    "Git",
    "Remote backend with locking",
    "Laptop",
    "Email"
   ],
   1,
   "Shared and safe."
  ],
  [
   "Someone changed a bucket in the console. Terraform calls that…",
   [
    "State",
    "Drift",
    "Module",
    "Output"
   ],
   1,
   "Fix it in code."
  ]
 ],
 "remember": [
  "Resources in code; plan → review → apply.",
  "Remote state with locking; envs via variables.",
  "Modules for reuse; prevent_destroy on critical resources.",
  "CI runs plan on PRs, apply on main, with OIDC roles."
 ]
};
L["cloud-data:build"] = {
 "title": "Project: a small cloud data platform",
 "level": "Project",
 "one": "Put the pieces together: a lake bucket with zones and lifecycle rules, a least-privilege job role, a cataloged partitioned table, a pipeline step that lands and registers data idempotently, and cost/monitoring checks, all reproducible from code.",
 "why": "Being able to design and stand up a minimal, secure, cost-aware platform is what separates a data engineer from someone who only writes queries.",
 "steps": [
  {
   "h": "Architecture",
   "code": "shop API ──(Airflow on MWAA: extract task, role shop-extract)──► s3://lake/raw/shop/orders/dt=…/\n                                    │\n                         Glue/Spark job (role transform)      ──► s3://lake/staging/shop/orders/ (Iceberg)\n                                    │\n                        dbt on Redshift/Snowflake/Athena       ──► marts.daily_revenue ──► BI dashboard\ninfra: Terraform (buckets, roles, catalog, warehouse) · CI: plan on PR, apply on main\nops: CloudWatch alarms (failure, freshness, volume) · budget alerts · lifecycle rules",
   "lang": "text"
  },
  {
   "h": "The landing step, end to end",
   "code": "import io, pandas as pd\ns3, glue = boto3.client(\"s3\"), boto3.client(\"glue\")\nBUCKET = \"acme-data-lake-dev\"\n\ndef bootstrap():\n    s3.create_bucket(Bucket=BUCKET, CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\n    s3.put_public_access_block(Bucket=BUCKET, PublicAccessBlockConfiguration={\n        \"BlockPublicAcls\": True, \"IgnorePublicAcls\": True, \"BlockPublicPolicy\": True, \"RestrictPublicBuckets\": True})\n    glue.create_database(DatabaseInput={\"Name\": \"staging_shop\"})\n    glue.create_table(DatabaseName=\"staging_shop\", TableInput={\n        \"Name\": \"orders\", \"PartitionKeys\": [{\"Name\": \"dt\", \"Type\": \"string\"}],\n        \"StorageDescriptor\": {\"Columns\": [{\"Name\": \"order_id\", \"Type\": \"bigint\"}, {\"Name\": \"amount\", \"Type\": \"bigint\"}],\n                              \"Location\": f\"s3://{BUCKET}/staging/shop/orders/\"}})\n\ndef land(dt, rows):\n    prefix = f\"staging/shop/orders/dt={dt}/\"\n    old = s3.list_objects_v2(Bucket=BUCKET, Prefix=prefix).get(\"Contents\", [])\n    if old:                                                    # idempotent: replace the day\n        s3.delete_objects(Bucket=BUCKET, Delete={\"Objects\": [{\"Key\": o[\"Key\"]} for o in old]})\n    buf = io.BytesIO(); pd.DataFrame(rows, columns=[\"order_id\", \"amount\"]).to_parquet(buf, index=False)\n    s3.put_object(Bucket=BUCKET, Key=prefix + \"part-0000.parquet\", Body=buf.getvalue())\n    try:\n        glue.create_partition(DatabaseName=\"staging_shop\", TableName=\"orders\", PartitionInput={\n            \"Values\": [dt], \"StorageDescriptor\": {\"Location\": f\"s3://{BUCKET}/{prefix}\"}})\n    except glue.exceptions.AlreadyExistsException:\n        pass\n    return len(rows)\n\ndef check(dt, expected_min=1):\n    objs = s3.list_objects_v2(Bucket=BUCKET, Prefix=f\"staging/shop/orders/dt={dt}/\").get(\"Contents\", [])\n    df = pd.read_parquet(io.BytesIO(s3.get_object(Bucket=BUCKET, Key=objs[0][\"Key\"])[\"Body\"].read()))\n    assert len(objs) == 1 and len(df) >= expected_min and df[\"order_id\"].is_unique\n    return f\"{dt}: {len(df)} rows, {len(objs)} file, checks passed\"\n\nbootstrap()\nland(\"2025-07-05\", [(1, 500), (2, 900)])\nland(\"2025-07-05\", [(1, 500), (2, 900), (3, 1200)])          # re-run with a late order: day replaced\nland(\"2025-07-06\", [(4, 450)])\nprint(check(\"2025-07-05\")); print(check(\"2025-07-06\"))\nparts = glue.get_partitions(DatabaseName=\"staging_shop\", TableName=\"orders\")[\"Partitions\"]\nprint(\"catalog partitions:\", sorted(p[\"Values\"][0] for p in parts))",
   "out": {
    "text": "2025-07-05: 3 rows, 1 file, checks passed\n2025-07-06: 1 rows, 1 file, checks passed\ncatalog partitions: ['2025-07-05', '2025-07-06']"
   }
  },
  {
   "h": "Tests",
   "code": "import os, boto3, pytest\nfrom moto import mock_aws\nos.environ.update(AWS_ACCESS_KEY_ID=\"testing\", AWS_SECRET_ACCESS_KEY=\"testing\", AWS_DEFAULT_REGION=\"ap-south-1\")\n\nBUCKET = \"lake-test\"\n\n@pytest.fixture\ndef s3():\n    with mock_aws():                                  # fresh fake AWS for every test\n        client = boto3.client(\"s3\")\n        client.create_bucket(Bucket=BUCKET, CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\n        yield client\n\ndef land(s3, dt, body):\n    prefix = f\"raw/orders/dt={dt}/\"\n    for o in s3.list_objects_v2(Bucket=BUCKET, Prefix=prefix).get(\"Contents\", []):\n        s3.delete_object(Bucket=BUCKET, Key=o[\"Key\"])\n    s3.put_object(Bucket=BUCKET, Key=prefix + \"part-0000.jsonl\", Body=body)\n\ndef test_rerun_replaces_day(s3):\n    land(s3, \"2025-07-05\", b\"a\"); land(s3, \"2025-07-05\", b\"b\")\n    objs = s3.list_objects_v2(Bucket=BUCKET, Prefix=\"raw/orders/dt=2025-07-05/\")[\"Contents\"]\n    assert len(objs) == 1\n    assert s3.get_object(Bucket=BUCKET, Key=objs[0][\"Key\"])[\"Body\"].read() == b\"b\"\n\ndef test_other_days_untouched(s3):\n    land(s3, \"2025-07-05\", b\"a\"); land(s3, \"2025-07-06\", b\"b\"); land(s3, \"2025-07-06\", b\"c\")\n    assert s3.get_object(Bucket=BUCKET, Key=\"raw/orders/dt=2025-07-05/part-0000.jsonl\")[\"Body\"].read() == b\"a\"",
   "test": true,
   "out": {
    "text": "..  [100%]\n2 passed in 0.34s"
   }
  },
  {
   "h": "Portfolio checklist",
   "p": [
    "Repo with <code>infra/</code> (Terraform), <code>pipelines/</code> (Airflow DAG + jobs), <code>dbt/</code>, and tests that run offline with moto. README: architecture diagram, IAM design (which role can touch which prefix), cost estimate per month, alerts and their owners, and how to deploy dev from scratch with one command."
   ]
  }
 ],
 "mistakes": [
  "Hand-created resources nobody can reproduce.",
  "One admin role used by every job.",
  "Files landed without catalog partitions (queries miss new data).",
  "No cost estimate or budget alert."
 ],
 "practice": [
  {
   "q": "Why does land() delete the day's existing objects before writing?",
   "a": "So a re-run or backfill replaces that day instead of adding a second file with duplicate rows. Readers would otherwise count both files. With Iceberg/Delta you'd do an atomic overwrite of the partition instead."
  },
  {
   "q": "Write a volume check that fails if a day has fewer than half of the previous day's rows.",
   "code": "def volume_ok(today_rows: int, yesterday_rows: int) -> bool:\n    return yesterday_rows == 0 or today_rows >= 0.5 * yesterday_rows\n\nprint(volume_ok(480, 900), volume_ok(300, 900))",
   "out": {
    "text": "True False"
   }
  }
 ],
 "check": [
  [
   "Why register partitions in the catalog?",
   [
    "Required by S3",
    "So query engines see the new day's data",
    "Encryption",
    "Cost"
   ],
   1,
   "Otherwise queries miss it."
  ],
  [
   "Testing AWS code offline uses…",
   [
    "Production account",
    "moto / localstack",
    "Screenshots",
    "Nothing"
   ],
   1,
   "Free and safe."
  ],
  [
   "Least privilege here means…",
   [
    "One admin role",
    "Each job's role can only touch its own prefixes",
    "No roles",
    "Public bucket"
   ],
   1,
   "Limits blast radius."
  ]
 ],
 "remember": [
  "Zones + lifecycle + public access block + catalog.",
  "Roles per job, least privilege.",
  "Idempotent landing (replace the day) + catalog partitions + checks.",
  "Everything in Terraform; tests offline with moto; cost estimate in README."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
