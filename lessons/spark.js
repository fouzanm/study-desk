// Lessons for course "spark". Built by tools/course-builder from tools/courses/spark.js.
// Python examples were run and their real output stored.
(function (L) {
L["spark:why"] = {
 "title": "Why Spark: when data outgrows one machine",
 "level": "Intermediate",
 "one": "<b>Apache Spark</b> processes data in parallel across many machines (or many cores). You write DataFrame code or SQL once; Spark splits the data into <b>partitions</b> and runs the work on a cluster.",
 "why": "When data reaches hundreds of GB or TB, pandas can't load it and single databases get slow. Spark (Databricks, EMR, Glue, Dataproc) is the standard big-data engine and appears in many data engineering roles.",
 "steps": [
  {
   "h": "When to reach for Spark",
   "code": "size / need                          tool\n< a few GB, one machine                pandas, Polars, DuckDB (simpler, often faster)\nwarehouse already holds the data       SQL / dbt in the warehouse\n100s of GB to PBs of files in a lake   Spark (Databricks, EMR, Glue, Dataproc)\nheavy joins/ML feature prep at scale   Spark\nstreaming with complex state           Spark Structured Streaming or Flink",
   "lang": "text"
  },
  {
   "h": "First Spark program",
   "code": "print(\"Spark\", spark.version, \"| partitions of this DataFrame:\", orders.rdd.getNumPartitions())\n(orders.filter(F.col(\"status\") == \"paid\")\n       .groupBy(\"city\")\n       .agg(F.count(\"*\").alias(\"orders\"), F.sum(\"amount\").alias(\"revenue\"))\n       .orderBy(F.desc(\"revenue\"))\n       .show())",
   "note": "The same code runs unchanged on a laptop (local mode, as here) or a 100-node cluster reading terabytes from S3.",
   "out": {
    "text": "Spark 4.3.0 | partitions of this DataFrame: 2\n+---------+------+-------+\n|     city|orders|revenue|\n+---------+------+-------+\n|    Kochi|     3| 131800|\n|    Dubai|     2|   3700|\n|Bengaluru|     1|   3600|\n+---------+------+-------+"
   }
  },
  {
   "h": "Lazy evaluation",
   "p": [
    "Transformations (<code>filter</code>, <code>select</code>, <code>groupBy</code>) only build a plan. Nothing runs until an <b>action</b> (<code>show</code>, <code>count</code>, <code>collect</code>, <code>write</code>). This lets Spark optimise the whole plan first."
   ],
   "code": "import time\nt = time.perf_counter()\nplan = orders.filter(F.col(\"amount\") > 3000).select(\"order_id\", \"city\")   # transformations\nprint(f\"built plan in {(time.perf_counter() - t) * 1000:.1f} ms, nothing executed yet\")\nprint(\"action -> rows:\", plan.count())",
   "out": {
    "text": "built plan in 74.6 ms, nothing executed yet\naction -> rows: 4"
   }
  },
  {
   "h": "Spark in the ecosystem",
   "code": "Databricks         managed Spark + Delta Lake + notebooks + jobs (most common in industry)\nAWS                EMR (clusters), Glue (serverless Spark jobs), EMR Serverless\nGCP / Azure        Dataproc / Synapse, Fabric, HDInsight\nlanguages          PySpark (most common), Scala, SQL, R\nreads/writes       Parquet, Delta, Iceberg, JSON, CSV, JDBC databases, Kafka",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Using Spark for 2 GB of data that DuckDB or pandas would handle in seconds.",
  "Calling .collect() on a big DataFrame (pulls everything onto one machine).",
  "Thinking each line of PySpark runs immediately (it's lazy).",
  "Python loops over rows instead of DataFrame operations."
 ],
 "practice": [
  {
   "q": "Count paid orders per month with Spark.",
   "code": "(orders.filter(\"status = 'paid'\")\n       .groupBy(F.substring(\"order_date\", 1, 7).alias(\"month\"))\n       .count().orderBy(\"month\").show())",
   "out": {
    "text": "+-------+-----+\n|  month|count|\n+-------+-----+\n|2025-06|    2|\n|2025-07|    4|\n+-------+-----+"
   }
  },
  {
   "q": "Your data is 8 GB of Parquet and you have a 32 GB laptop. Spark, or something else?",
   "a": "Probably DuckDB or Polars: one machine, fast, no cluster to manage. Spark shines when data or compute exceeds one machine, or when the team already runs everything on Databricks/EMR."
  }
 ],
 "check": [
  [
   "Spark's main benefit?",
   [
    "Pretty charts",
    "Parallel processing across many machines/cores",
    "Smaller files",
    "Free storage"
   ],
   1,
   "Scale out."
  ],
  [
   "When does a Spark transformation run?",
   [
    "Immediately",
    "When an action is called",
    "Never",
    "On save only"
   ],
   1,
   "Lazy evaluation."
  ],
  [
   "5 GB CSV on a laptop?",
   [
    "Always Spark",
    "DuckDB/Polars/pandas is often simpler",
    "Excel",
    "Kafka"
   ],
   1,
   "Right-size the tool."
  ]
 ],
 "remember": [
  "Spark = distributed DataFrames/SQL over partitions.",
  "Lazy: transformations build a plan, actions run it.",
  "Use it for data beyond one machine; otherwise DuckDB/Polars.",
  "Databricks/EMR/Glue/Dataproc run it for you."
 ]
};
L["spark:architecture"] = {
 "title": "Spark architecture: driver, executors, partitions, shuffles",
 "level": "Intermediate",
 "one": "A <b>driver</b> plans the job; <b>executors</b> on worker nodes run <b>tasks</b>, one per <b>partition</b>. Operations that need data from other partitions (groupBy, join, orderBy) cause a <b>shuffle</b>, which splits the job into <b>stages</b>.",
 "why": "Every Spark performance problem (slow jobs, out-of-memory, skew) is explained by partitions and shuffles. Interviewers ask about narrow vs wide transformations constantly.",
 "steps": [
  {
   "h": "The pieces",
   "code": "driver      your program: builds the plan, schedules tasks, collects results\nexecutors   JVM processes on worker nodes; run tasks, hold cached data\npartition   a chunk of the data; one task processes one partition\njob         triggered by an action (count, write)\nstage       a set of tasks that can run without moving data between machines\nshuffle     redistributing data by key across executors (network + disk): expensive\n\n            driver\n          /   |    \\\n   executor executor executor      ← tasks run in parallel, one per partition",
   "lang": "text"
  },
  {
   "h": "Narrow vs wide transformations",
   "p": [
    "<b>Narrow</b> (filter, select, withColumn): each output partition needs one input partition, no data moves. <b>Wide</b> (groupBy, join, distinct, orderBy): rows with the same key must meet, so data is shuffled. The physical plan shows shuffles as <code>Exchange</code>:"
   ],
   "code": "narrow = orders.filter(\"amount > 1000\").withColumn(\"big\", F.col(\"amount\") > 10000)\nwide = orders.groupBy(\"city\").sum(\"amount\")\nfor name, df in [(\"narrow\", narrow), (\"wide\", wide)]:\n    plan = df._jdf.queryExecution().executedPlan().toString()\n    print(f\"{name}: shuffle (Exchange) in plan = {'Exchange' in plan}\")",
   "out": {
    "text": "narrow: shuffle (Exchange) in plan = False\nwide: shuffle (Exchange) in plan = True"
   }
  },
  {
   "h": "Partitions in practice",
   "code": "big = spark.range(0, 1_000_000).withColumn(\"city\", (F.col(\"id\") % 4).cast(\"string\"))\nprint(\"partitions after range:\", big.rdd.getNumPartitions())\nprint(\"after repartition(8):\", big.repartition(8).rdd.getNumPartitions())\nprint(\"after coalesce(1):\", big.coalesce(1).rdd.getNumPartitions())\nsizes = big.repartition(4, \"city\").rdd.glom().map(len).collect()\nprint(\"rows per partition after repartition by city:\", sizes)",
   "note": "<code>repartition</code> shuffles to any number of partitions (optionally by a key); <code>coalesce</code> only merges partitions without a full shuffle (good before writing fewer files).",
   "out": {
    "text": "partitions after range: 2\nafter repartition(8): 8\nafter coalesce(1): 1\nrows per partition after repartition by city: [250000, 250000, 250000, 250000]"
   }
  },
  {
   "h": "How many partitions?",
   "p": [
    "Aim for partitions of roughly <b>100–200 MB</b> and at least 2–4× the total cores. Too few: cores sit idle and tasks run out of memory. Too many: scheduling overhead and tiny output files. <code>spark.sql.shuffle.partitions</code> (default 200) sets the count after shuffles; <b>Adaptive Query Execution</b> (AQE, on by default) merges small shuffle partitions automatically."
   ]
  },
  {
   "h": "Memory and caching",
   "code": "paid = orders.filter(\"status = 'paid'\").cache()      # keep in executor memory after first use\nprint(\"first action (computes + caches):\", paid.count())\nprint(\"second action (reads cache):\", paid.agg(F.sum(\"amount\")).first()[0])\nprint(\"storage level:\", paid.storageLevel)\npaid.unpersist()",
   "note": "Cache only DataFrames you reuse several times, and unpersist when done; caching everything wastes memory.",
   "out": {
    "text": "first action (computes + caches): 6\nsecond action (reads cache): 139100\nstorage level: Disk Memory Deserialized 1x Replicated"
   }
  }
 ],
 "mistakes": [
  "repartition(1) to write one file from a huge DataFrame (all data through one task).",
  "Leaving shuffle partitions at 200 for tiny data, or too low for huge data.",
  "Caching DataFrames used only once.",
  "Ignoring Exchange operators when reading plans."
 ],
 "practice": [
  {
   "q": "Which of these cause a shuffle: filter, groupBy, select, join, withColumn, distinct, orderBy?",
   "a": "Shuffle (wide): groupBy, join (unless broadcast), distinct, orderBy. No shuffle (narrow): filter, select, withColumn."
  },
  {
   "q": "Check how many distinct cities end up in each partition after repartitioning orders by city into 2 partitions.",
   "code": "parts = orders.repartition(2, \"city\").rdd.glom().map(lambda rows: sorted({r.city for r in rows})).collect()\nprint(parts)",
   "out": {
    "text": "[['Bengaluru'], ['Dubai', 'Kochi']]"
   }
  }
 ],
 "check": [
  [
   "One task processes…",
   [
    "One job",
    "One partition",
    "One executor",
    "One file always"
   ],
   1,
   "Tasks map to partitions."
  ],
  [
   "A shuffle happens on…",
   [
    "filter",
    "groupBy/join/orderBy",
    "select",
    "withColumn"
   ],
   1,
   "Wide transformations."
  ],
  [
   "coalesce vs repartition?",
   [
    "Same",
    "coalesce merges partitions without a full shuffle",
    "coalesce shuffles more",
    "repartition only reduces"
   ],
   1,
   "Cheaper reduction."
  ]
 ],
 "remember": [
  "Driver plans; executors run tasks; one task per partition.",
  "Narrow = no data movement; wide = shuffle (Exchange).",
  "~100–200 MB partitions; AQE helps.",
  "repartition (shuffle) vs coalesce (merge).",
  "Cache only reused data."
 ]
};
L["spark:dataframes"] = {
 "title": "PySpark DataFrames",
 "level": "Intermediate",
 "one": "PySpark DataFrames work like SQL tables in code: <code>select</code>, <code>filter</code>, <code>withColumn</code>, <code>groupBy/agg</code>, <code>join</code>, window functions, and reading/writing Parquet with a defined <b>schema</b>.",
 "why": "This is the daily API of Spark data engineering on Databricks/EMR/Glue. Interview coding rounds often ask for a PySpark transformation.",
 "steps": [
  {
   "h": "Read with an explicit schema",
   "code": "schema = \"order_id INT, customer_id INT, city STRING, order_date DATE, amount INT, status STRING\"\ndf = spark.read.csv(\"orders.csv\", header=True, schema=schema, mode=\"PERMISSIVE\")\ndf.printSchema()\ndf.show()",
   "note": "With an explicit schema types are right and reading is faster (no inference pass). The bad amount became <code>null</code>; use <code>mode=\"FAILFAST\"</code> to stop instead, or count nulls as a check.",
   "out": {
    "text": "root\n |-- order_id: integer (nullable = true)\n |-- customer_id: integer (nullable = true)\n |-- city: string (nullable = true)\n |-- order_date: date (nullable = true)\n |-- amount: integer (nullable = true)\n |-- status: string (nullable = true)\n\n+--------+-----------+---------+----------+------+--------+\n|order_id|customer_id|     city|order_date|amount|  status|\n+--------+-----------+---------+----------+------+--------+\n|       1|        101|    Kochi|2025-06-02| 55000|    paid|\n|       2|        101|   kochi |2025-06-15|  2400|    PAID|\n|       3|        102|Bengaluru|2025-06-20|  9200|refunded|\n|       4|        103|    Dubai|2025-07-01|  NULL|    paid|\n+--------+-----------+---------+----------+------+--------+"
   }
  },
  {
   "h": "Select, clean, derive",
   "code": "clean = (orders\n    .withColumn(\"city\", F.initcap(F.trim(\"city\")))\n    .withColumn(\"status\", F.lower(\"status\"))\n    .withColumn(\"order_date\", F.to_date(\"order_date\"))\n    .withColumn(\"month\", F.date_format(\"order_date\", \"yyyy-MM\"))\n    .withColumn(\"size\", F.when(F.col(\"amount\") >= 50000, \"large\")\n                         .when(F.col(\"amount\") >= 5000, \"medium\").otherwise(\"small\"))\n    .select(\"order_id\", \"city\", \"month\", \"amount\", \"size\"))\nclean.show()",
   "out": {
    "text": "+--------+---------+-------+------+------+\n|order_id|     city|  month|amount|  size|\n+--------+---------+-------+------+------+\n|       1|    Kochi|2025-06| 55000| large|\n|       2|    Kochi|2025-06|  2400| small|\n|       3|Bengaluru|2025-06|  9200|medium|\n|       4|    Dubai|2025-07|  3000| small|\n|       5|Bengaluru|2025-07|  3600| small|\n|       6|    Kochi|2025-07| 74400| large|\n|       7|    Dubai|2025-07|   700| small|\n+--------+---------+-------+------+------+"
   }
  },
  {
   "h": "Aggregations and joins",
   "code": "customers = spark.createDataFrame([(101, \"Asha\", \"retail\"), (102, \"Ben\", \"business\"), (103, \"Chen\", \"retail\")],\n                                  \"customer_id INT, name STRING, segment STRING\")\n(orders.filter(\"status = 'paid'\")\n    .join(customers, \"customer_id\", \"left\")\n    .groupBy(\"segment\")\n    .agg(F.countDistinct(\"customer_id\").alias(\"customers\"), F.sum(\"amount\").alias(\"revenue\"),\n         F.round(F.avg(\"amount\"), 0).alias(\"avg_order\"))\n    .orderBy(\"segment\")\n    .show())",
   "note": "Customer 104 has no customer record, so the left join gives a <code>null</code> segment. Without the left join that revenue would silently disappear.",
   "out": {
    "text": "+--------+---------+-------+---------+\n| segment|customers|revenue|avg_order|\n+--------+---------+-------+---------+\n|    NULL|        1|  74400|  74400.0|\n|business|        1|   3600|   3600.0|\n|  retail|        2|  61100|  15275.0|\n+--------+---------+-------+---------+"
   }
  },
  {
   "h": "Window functions",
   "code": "w = Window.partitionBy(\"customer_id\").orderBy(\"order_date\")\n(orders.filter(\"status = 'paid'\")\n    .withColumn(\"order_no\", F.row_number().over(w))\n    .withColumn(\"running_total\", F.sum(\"amount\").over(w.rowsBetween(Window.unboundedPreceding, 0)))\n    .withColumn(\"prev_amount\", F.lag(\"amount\").over(w))\n    .select(\"customer_id\", \"order_date\", \"amount\", \"order_no\", \"running_total\", \"prev_amount\")\n    .orderBy(\"customer_id\", \"order_date\")\n    .show())",
   "out": {
    "text": "+-----------+----------+------+--------+-------------+-----------+\n|customer_id|order_date|amount|order_no|running_total|prev_amount|\n+-----------+----------+------+--------+-------------+-----------+\n|        101|2025-06-02| 55000|       1|        55000|       NULL|\n|        101|2025-06-15|  2400|       2|        57400|      55000|\n|        102|2025-07-05|  3600|       1|         3600|       NULL|\n|        103|2025-07-01|  3000|       1|         3000|       NULL|\n|        103|2025-07-22|   700|       2|         3700|       3000|\n|        104|2025-07-12| 74400|       1|        74400|       NULL|\n+-----------+----------+------+--------+-------------+-----------+"
   }
  },
  {
   "h": "Write partitioned Parquet",
   "code": "import os\n(orders.withColumn(\"month\", F.substring(\"order_date\", 1, 7))\n    .write.mode(\"overwrite\").partitionBy(\"month\").parquet(\"lake/orders\"))\nprint(sorted(d for d in os.listdir(\"lake/orders\") if d.startswith(\"month=\")))\nback = spark.read.parquet(\"lake/orders\").filter(\"month = '2025-07'\")\nprint(\"July rows:\", back.count())",
   "out": {
    "text": "['month=2025-06', 'month=2025-07']\nJuly rows: 4"
   }
  }
 ],
 "mistakes": [
  "Schema inference on big CSV/JSON (slow, wrong types).",
  "Python UDFs for things built-in functions can do (much slower).",
  "Inner joins that silently drop unmatched rows.",
  "mode('overwrite') on a whole table when you meant one partition (see dynamic partition overwrite)."
 ],
 "practice": [
  {
   "q": "For each customer, find their largest paid order (keep ties out: one row per customer).",
   "code": "w = Window.partitionBy(\"customer_id\").orderBy(F.desc(\"amount\"), \"order_id\")\n(orders.filter(\"status = 'paid'\").withColumn(\"rn\", F.row_number().over(w))\n    .filter(\"rn = 1\").select(\"customer_id\", \"order_id\", \"amount\").orderBy(\"customer_id\").show())",
   "out": {
    "text": "+-----------+--------+------+\n|customer_id|order_id|amount|\n+-----------+--------+------+\n|        101|       1| 55000|\n|        102|       5|  3600|\n|        103|       4|  3000|\n|        104|       6| 74400|\n+-----------+--------+------+"
   }
  },
  {
   "q": "Count null values in every column of a DataFrame (a common data check).",
   "code": "df = orders.withColumn(\"city\", F.when(F.col(\"order_id\") == 3, None).otherwise(F.col(\"city\")))\ndf.select([F.sum(F.col(c).isNull().cast(\"int\")).alias(c) for c in df.columns]).show()",
   "out": {
    "text": "+--------+-----------+----+----------+------+------+\n|order_id|customer_id|city|order_date|amount|status|\n+--------+-----------+----+----------+------+------+\n|       0|          0|   1|         0|     0|     0|\n+--------+-----------+----+----------+------+------+"
   }
  }
 ],
 "check": [
  [
   "Why give an explicit schema?",
   [
    "Required",
    "Correct types and no inference pass",
    "Smaller files",
    "Encryption"
   ],
   1,
   "Faster and safer."
  ],
  [
   "Prefer which over Python UDFs?",
   [
    "Loops",
    "Built-in functions in pyspark.sql.functions",
    "collect()",
    "RDDs"
   ],
   1,
   "Run inside the JVM, optimised."
  ],
  [
   "Running total per customer uses…",
   [
    "groupBy",
    "A window with rowsBetween",
    "join",
    "distinct"
   ],
   1,
   "Window functions."
  ]
 ],
 "remember": [
  "Read with explicit schemas; choose a bad-record mode.",
  "withColumn + F functions; when/otherwise for logic.",
  "groupBy/agg, joins (watch join type), windows.",
  "Write Parquet/Delta partitioned by date/month.",
  "Avoid Python UDFs when a built-in exists."
 ]
};
L["spark:performance"] = {
 "title": "Spark performance: joins, skew, files",
 "level": "Advanced",
 "one": "Most Spark tuning comes down to <b>moving less data</b>: broadcast small tables in joins, fix <b>skewed</b> keys, prune columns and partitions early, and avoid millions of tiny files.",
 "why": "A slow or failing Spark job costs real money on a cluster. Explaining broadcast joins and skew handling is a classic senior data engineering interview question.",
 "steps": [
  {
   "h": "Broadcast joins",
   "p": [
    "Joining a big fact to a small dimension normally shuffles both sides. <b>Broadcasting</b> sends the small table to every executor so the big one never moves. Spark does it automatically under <code>spark.sql.autoBroadcastJoinThreshold</code> (10 MB), or you can hint it:"
   ],
   "code": "spark.conf.set(\"spark.sql.autoBroadcastJoinThreshold\", -1)         # turn auto off to compare\nfacts = spark.range(0, 2_000_000).withColumn(\"city_id\", (F.col(\"id\") % 4).cast(\"int\"))\ncities = spark.createDataFrame([(0, \"Kochi\"), (1, \"Dubai\"), (2, \"Bengaluru\"), (3, \"Chennai\")], \"city_id INT, city STRING\")\n\ndef strategy(df):\n    plan = df._jdf.queryExecution().executedPlan().toString()\n    return \"BroadcastHashJoin\" if \"BroadcastHashJoin\" in plan else \"SortMergeJoin (shuffles both sides)\"\n\nprint(\"plain join:    \", strategy(facts.join(cities, \"city_id\")))\nprint(\"broadcast hint:\", strategy(facts.join(F.broadcast(cities), \"city_id\")))",
   "out": {
    "text": "plain join:     SortMergeJoin (shuffles both sides)\nbroadcast hint: BroadcastHashJoin"
   }
  },
  {
   "h": "Data skew",
   "p": [
    "If one key has most of the rows (one huge customer, <code>null</code> keys, a default country), the task holding that key runs far longer than the rest and may run out of memory:"
   ],
   "code": "events = spark.range(0, 1_000_000).withColumn(\n    \"customer_id\", F.when(F.col(\"id\") % 10 < 8, F.lit(1)).otherwise(F.col(\"id\") % 1000))   # 80% customer 1\nbefore = events.repartition(8, \"customer_id\").rdd.glom().map(len).collect()\nprint(\"rows per partition:\", sorted(before, reverse=True))\n\n# fix: salt the hot key so its rows spread over several partitions, then aggregate twice\nsalted = events.withColumn(\"salt\", (F.rand(seed=1) * 16).cast(\"int\"))\nafter = salted.repartition(8, \"customer_id\", \"salt\").rdd.glom().map(len).collect()\nprint(\"after salting:     \", sorted(after, reverse=True))\nprint(f\"largest task: {max(before):,} rows -> {max(after):,} rows\")\nresult = (salted.groupBy(\"customer_id\", \"salt\").count()\n                .groupBy(\"customer_id\").agg(F.sum(\"count\").alias(\"events\"))\n                .orderBy(F.desc(\"events\")).first())\nprint(\"customer 1 events still correct:\", result)",
   "note": "AQE also splits skewed join partitions automatically (<code>spark.sql.adaptive.skewJoin.enabled</code>). Filter out or handle <code>null</code> keys before joins too.",
   "out": {
    "text": "rows per partition: [825000, 30000, 29000, 28000, 24000, 24000, 21000, 19000]\nafter salting:      [225229, 176948, 175154, 125527, 123495, 75723, 74429, 23495]\nlargest task: 825,000 rows -> 225,229 rows\ncustomer 1 events still correct: Row(customer_id=1, events=800000)"
   }
  },
  {
   "h": "Prune early",
   "code": "read only needed columns     spark.read.parquet(path).select(\"order_id\", \"amount\")  (Parquet reads only those)\nfilter on partition columns  .filter(\"order_date >= '2025-07-01'\")   → partition pruning\nfilter before joins          shrink both sides first\npredicate pushdown           filters pushed into Parquet/JDBC scans (see PushedFilters in explain())",
   "lang": "text"
  },
  {
   "h": "The small files problem",
   "code": "import os, glob\ndf = spark.range(0, 100_000).repartition(50)\ndf.write.mode(\"overwrite\").parquet(\"out/too_many\")\ndf.coalesce(2).write.mode(\"overwrite\").parquet(\"out/compacted\")\nfor path in [\"out/too_many\", \"out/compacted\"]:\n    print(path, \"->\", len(glob.glob(f\"{path}/*.parquet\")), \"files\")",
   "note": "Thousands of tiny files make every later read slow (file listing and open costs). Coalesce before writing, run compaction (Delta <code>OPTIMIZE</code>), and target files of 128 MB–1 GB.",
   "out": {
    "text": "out/too_many -> 50 files\nout/compacted -> 2 files"
   }
  },
  {
   "h": "Reading the plan",
   "code": "(orders.filter(\"status = 'paid'\").groupBy(\"city\").sum(\"amount\")).explain(mode=\"formatted\")",
   "note": "Look for <b>Exchange</b> (shuffle), <b>BroadcastHashJoin</b> vs <b>SortMergeJoin</b>, <b>PushedFilters</b> and partition filters on scans. On a cluster, the Spark UI shows the same per stage with time, shuffle size and spill.",
   "out": {
    "text": "== Physical Plan ==\nAdaptiveSparkPlan (7)\n+- HashAggregate (6)\n   +- Exchange (5)\n      +- HashAggregate (4)\n         +- Project (3)\n            +- Filter (2)\n               +- Scan ExistingRDD (1)\n\n\n(1) Scan ExistingRDD\nOutput [6]: [order_id#0, customer_id#1, city#2, order_date#3, amount#4, status#5]\nArguments: [order_id#0, customer_id#1, city#2, order_date#3, amount#4, status#5], MapPartitionsRDD[4] at applySchemaToPythonRDD at DirectMethodHandleAccessor.java:103, ExistingRDD, UnknownPartitioning(0)\n\n(2) Filter\nInput [6]: [order_id#0, customer_id#1, city#2, order_date#3, amount#4, status#5]\nCondition : (isnotnull(status#5) AND (status#5 = paid))\n\n(3) Project\nOutput [2]: [city#2, amount#4]\nInput [6]: [order_id#0, customer_id#1, city#2, order_date#3, amount#4, status#5]\n\n(4) HashAggregate\nInput [2]: [city#2, amount#4]\nKeys [1]: [city#2]\nFunctions [1]: [partial_sum(amount#4)]\nAggregate Attributes [1]: [sum#14L]\nResults [2]: [city#2, sum#15L]\n\n(5) Exchange\nInput [2]: [city#2, sum#15L]\nArguments: hashpartitioning(city#2, 4), ENSURE_REQUIREMENTS, [plan_id=19]\n\n(6) HashAggregate\nInput [2]: [city#2, sum#15L]\nKeys [1]: [city#2]\nFunctions [1]: [sum(amount#4)]\nAggregate Attributes [1]: [sum(amount#4)#12L]\nResults [2]: [city#2, sum(amount#4)#12L AS sum(amount)#13L]\n\n(7) AdaptiveSparkPlan\nOutput [2]: [city#2, sum(amount)#13L]\nArguments: isFinalPlan=false"
   }
  }
 ],
 "mistakes": [
  "Joining two big tables when one side could be filtered or broadcast.",
  "Ignoring skew: one task runs for an hour while 199 finish in a minute.",
  "Writing thousands of tiny files per partition.",
  "Tuning executor memory before fixing the plan."
 ],
 "practice": [
  {
   "q": "A job joins a 2 TB events table with a 5 MB country table and is slow. What do you check and change?",
   "a": "Check the plan: if it's a SortMergeJoin, both sides shuffle. Broadcast the country table (F.broadcast or raise the auto threshold). Also select only needed columns and filter events by date partition before the join."
  },
  {
   "q": "Prove the broadcast hint removes the shuffle of the big side by checking for Exchange in the plan.",
   "code": "spark.conf.set(\"spark.sql.autoBroadcastJoinThreshold\", -1)\nbig = spark.range(0, 100_000).withColumn(\"k\", F.col(\"id\") % 3)\nsmall = spark.createDataFrame([(0, \"a\"), (1, \"b\"), (2, \"c\")], \"k LONG, label STRING\")\nfor name, df in [(\"plain\", big.join(small, \"k\")), (\"broadcast\", big.join(F.broadcast(small), \"k\"))]:\n    plan = df._jdf.queryExecution().executedPlan().toString()\n    print(name, \"Exchange hashpartitioning:\", \"Exchange hashpartitioning\" in plan)",
   "out": {
    "text": "plain Exchange hashpartitioning: True\nbroadcast Exchange hashpartitioning: False"
   }
  }
 ],
 "check": [
  [
   "Best join for big fact + small dimension?",
   [
    "Cross join",
    "Broadcast hash join",
    "Sort-merge both",
    "Python loop"
   ],
   1,
   "Small side goes to every executor."
  ],
  [
   "Data skew means…",
   [
    "Wrong types",
    "A few keys hold most rows, so a few tasks take forever",
    "Small files",
    "Too much memory"
   ],
   1,
   "Uneven partitions."
  ],
  [
   "A fix for skewed aggregations?",
   [
    "More retries",
    "Salting the hot key and aggregating in two steps",
    "collect()",
    "Coalesce(1)"
   ],
   1,
   "Spread the hot key."
  ]
 ],
 "remember": [
  "Move less data: prune columns/partitions, filter early.",
  "Broadcast small join sides.",
  "Detect skew (uneven tasks); salt or let AQE split.",
  "Avoid tiny files; compact.",
  "Read the plan: Exchange, join type, pushed filters."
 ]
};
L["spark:spark-sql"] = {
 "title": "Spark SQL, Delta Lake and lakehouse tables",
 "level": "Intermediate",
 "one": "Everything in Spark can be written as <b>SQL</b> on temp views or catalog tables. On Databricks and modern lakes those tables are <b>Delta Lake</b>/<b>Iceberg</b>: Parquet files plus a transaction log that adds MERGE, updates, deletes and time travel.",
 "why": "Many teams write most Spark logic in SQL, and lakehouse tables (Delta/Iceberg) are the standard storage on Databricks and increasingly everywhere.",
 "steps": [
  {
   "h": "SQL on DataFrames",
   "code": "orders.createOrReplaceTempView(\"orders\")\nspark.sql(\"\"\"\n    SELECT city,\n           COUNT(*)                                   AS orders,\n           SUM(amount)                                AS revenue,\n           RANK() OVER (ORDER BY SUM(amount) DESC)    AS revenue_rank\n    FROM orders\n    WHERE status = 'paid'\n    GROUP BY city\n\"\"\").show()",
   "note": "SQL and DataFrame code compile to the same plan, so mix them freely: use whichever is clearer.",
   "out": {
    "text": "+---------+------+-------+------------+\n|     city|orders|revenue|revenue_rank|\n+---------+------+-------+------------+\n|    Kochi|     3| 131800|           1|\n|    Dubai|     2|   3700|           2|\n|Bengaluru|     1|   3600|           3|\n+---------+------+-------+------------+"
   }
  },
  {
   "h": "Tables in a catalog",
   "code": "spark.sql(\"CREATE DATABASE IF NOT EXISTS sales\")\norders.write.mode(\"overwrite\").saveAsTable(\"sales.orders\")\nspark.sql(\"DROP TABLE IF EXISTS sales.monthly_revenue\")\nspark.sql(\"\"\"\nCREATE TABLE sales.monthly_revenue USING parquet AS\nSELECT substring(order_date, 1, 7) AS month, SUM(amount) AS revenue\nFROM sales.orders WHERE status = 'paid' GROUP BY 1\n\"\"\")\nprint([t.name for t in spark.catalog.listTables(\"sales\")])\nspark.table(\"sales.monthly_revenue\").orderBy(\"month\").show()",
   "note": "On Delta tables you can write <code>CREATE OR REPLACE TABLE</code> directly. On Databricks the catalog is Unity Catalog (<code>catalog.schema.table</code>) with permissions and lineage; on AWS it's often the Glue Data Catalog.",
   "out": {
    "text": "['monthly_revenue', 'orders']\n+-------+-------+\n|  month|revenue|\n+-------+-------+\n|2025-06|  57400|\n|2025-07|  81700|\n+-------+-------+"
   }
  },
  {
   "h": "Delta Lake / Iceberg: MERGE and time travel",
   "p": [
    "Plain Parquet files can't be updated row by row. Delta Lake and Iceberg add a transaction log so you can upsert, delete (e.g. for GDPR), and read old versions:"
   ],
   "code": "-- upsert today's changes into the lakehouse table\nMERGE INTO sales.orders AS t\nUSING updates AS s\nON t.order_id = s.order_id\nWHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *;\n\nDELETE FROM sales.customers WHERE customer_id = 101;          -- right to be forgotten\n\nSELECT * FROM sales.orders VERSION AS OF 12;                   -- time travel\nSELECT * FROM sales.orders TIMESTAMP AS OF '2025-07-01';\nDESCRIBE HISTORY sales.orders;                                 -- who changed what, when\n\nOPTIMIZE sales.orders ZORDER BY (customer_id);                 -- compact files + cluster\nVACUUM sales.orders RETAIN 168 HOURS;                          -- remove old unreferenced files",
   "lang": "sql"
  },
  {
   "h": "Dynamic partition overwrite",
   "p": [
    "To re-process just some dates in a partitioned Parquet table without wiping the rest, enable dynamic partition overwrite: only partitions present in the new data are replaced."
   ],
   "code": "spark.conf.set(\"spark.sql.sources.partitionOverwriteMode\", \"dynamic\")\nby_month = orders.withColumn(\"month\", F.substring(\"order_date\", 1, 7))\nby_month.write.mode(\"overwrite\").partitionBy(\"month\").parquet(\"lake/orders\")\n\nfixed_july = by_month.filter(\"month = '2025-07'\").withColumn(\"amount\", F.col(\"amount\") * 0 + 1)\nfixed_july.write.mode(\"overwrite\").partitionBy(\"month\").parquet(\"lake/orders\")   # replaces July only\n\nspark.read.parquet(\"lake/orders\").groupBy(\"month\").agg(F.count(\"*\").alias(\"rows\"), F.sum(\"amount\").alias(\"amount\")).orderBy(\"month\").show()",
   "note": "June is untouched; July was replaced. Without dynamic mode, the second write would have deleted June too.",
   "out": {
    "text": "+-------+----+------+\n|  month|rows|amount|\n+-------+----+------+\n|2025-06|   3| 66600|\n|2025-07|   4|     4|\n+-------+----+------+"
   }
  }
 ],
 "mistakes": [
  "Overwriting a whole partitioned table when re-processing one day.",
  "Plain Parquet where you need upserts/deletes (use Delta/Iceberg).",
  "Never running OPTIMIZE/VACUUM, so Delta tables fill with small files.",
  "Mixing SQL and DataFrame code without clear layering."
 ],
 "practice": [
  {
   "q": "Write Spark SQL for each customer's first and latest paid order date.",
   "code": "orders.createOrReplaceTempView(\"orders\")\nspark.sql(\"\"\"SELECT customer_id, MIN(order_date) AS first_order, MAX(order_date) AS latest_order\n             FROM orders WHERE status = 'paid' GROUP BY customer_id ORDER BY customer_id\"\"\").show()",
   "out": {
    "text": "+-----------+-----------+------------+\n|customer_id|first_order|latest_order|\n+-----------+-----------+------------+\n|        101| 2025-06-02|  2025-06-15|\n|        102| 2025-07-05|  2025-07-05|\n|        103| 2025-07-01|  2025-07-22|\n|        104| 2025-07-12|  2025-07-12|\n+-----------+-----------+------------+"
   }
  },
  {
   "q": "A customer asks to be deleted from your lake. Your data is plain Parquet. What's the problem and the fix?",
   "a": "Plain Parquet files are immutable: you'd have to rewrite every file containing that customer. With Delta Lake/Iceberg you run <code>DELETE FROM … WHERE customer_id = …</code>, then VACUUM (Delta) or expire snapshots (Iceberg) after the retention period so old files with the data are physically removed."
  }
 ],
 "check": [
  [
   "Spark SQL vs DataFrame API performance?",
   [
    "SQL slower",
    "Same optimiser, same plan",
    "DataFrames slower",
    "Depends on font"
   ],
   1,
   "Both go through Catalyst."
  ],
  [
   "Delta Lake adds…",
   [
    "CSV support",
    "A transaction log: MERGE, deletes, time travel",
    "Dashboards",
    "Streaming only"
   ],
   1,
   "Lakehouse table features."
  ],
  [
   "Re-process one month in a partitioned Parquet table?",
   [
    "Overwrite all",
    "Dynamic partition overwrite",
    "Append",
    "Delete folder by hand"
   ],
   1,
   "Replaces only those partitions."
  ]
 ],
 "remember": [
  "createOrReplaceTempView + spark.sql; same plans as DataFrames.",
  "Catalog tables (Unity/Glue) with saveAsTable.",
  "Delta/Iceberg: MERGE, DELETE, time travel, OPTIMIZE, VACUUM.",
  "Dynamic partition overwrite for partial re-processing."
 ]
};
L["spark:build"] = {
 "title": "Project: a Spark batch job",
 "level": "Project",
 "one": "Build a production-style PySpark job: read raw JSON events, clean and deduplicate them, join a dimension with a broadcast, aggregate daily metrics, write partitioned Parquet idempotently, and test the transformation logic with pytest.",
 "why": "This is the shape of real Databricks/EMR/Glue jobs. A clean, tested Spark job is a strong portfolio piece and gives you concrete performance stories for interviews.",
 "steps": [
  {
   "h": "The job",
   "code": "EVENT_SCHEMA = \"event_id STRING, user_id INT, type STRING, product STRING, amount INT, ts TIMESTAMP\"\n\ndef clean_events(raw):\n    return (raw.filter(F.col(\"user_id\").isNotNull())\n               .dropDuplicates([\"event_id\"])\n               .withColumn(\"event_date\", F.to_date(\"ts\")))\n\ndef daily_product_metrics(events, products):\n    return (events.join(F.broadcast(products), \"product\", \"left\")\n        .groupBy(\"event_date\", \"category\", \"product\")\n        .agg(F.sum((F.col(\"type\") == \"view\").cast(\"int\")).alias(\"views\"),\n             F.sum((F.col(\"type\") == \"purchase\").cast(\"int\")).alias(\"purchases\"),\n             F.coalesce(F.sum(\"amount\"), F.lit(0)).alias(\"revenue\"))\n        .withColumn(\"conversion\", F.round(F.col(\"purchases\") / F.col(\"views\"), 2)))\n\ndef run(run_date):\n    raw = spark.read.schema(EVENT_SCHEMA).json(f\"raw/events/{run_date}.json\")\n    products = spark.createDataFrame([(\"LAP-14\", \"Computers\"), (\"MOU-01\", \"Accessories\"), (\"MON-27\", \"Computers\")],\n                                     \"product STRING, category STRING\")\n    events = clean_events(raw)\n    print(f\"raw={raw.count()} clean={events.count()} (dropped null users + duplicate events)\")\n    metrics = daily_product_metrics(events, products)\n    spark.conf.set(\"spark.sql.sources.partitionOverwriteMode\", \"dynamic\")\n    metrics.coalesce(1).write.mode(\"overwrite\").partitionBy(\"event_date\").parquet(\"lake/product_metrics\")\n    return metrics\n\nrun(\"2025-07-05\").orderBy(\"product\").show()\nrun(\"2025-07-05\")                                   # re-run: same partition replaced, no duplicates\nprint(\"rows in lake:\", spark.read.parquet(\"lake/product_metrics\").count())",
   "out": {
    "text": "raw=7 clean=5 (dropped null users + duplicate events)\n+----------+-----------+-------+-----+---------+-------+----------+\n|event_date|   category|product|views|purchases|revenue|conversion|\n+----------+-----------+-------+-----+---------+-------+----------+\n|2025-07-05|  Computers| LAP-14|    2|        1|  55000|       0.5|\n|2025-07-05|Accessories| MOU-01|    1|        1|    700|       1.0|\n+----------+-----------+-------+-----+---------+-------+----------+\n\nraw=7 clean=5 (dropped null users + duplicate events)\nrows in lake: 2"
   }
  },
  {
   "h": "Unit tests for the logic",
   "code": "import pytest\n\ndef clean_events(raw):\n    return raw.filter(F.col(\"user_id\").isNotNull()).dropDuplicates([\"event_id\"]).withColumn(\"event_date\", F.to_date(\"ts\"))\n\nSCHEMA = \"event_id STRING, user_id INT, type STRING, product STRING, amount INT, ts TIMESTAMP\"\n\ndef make(rows):\n    from datetime import datetime\n    return spark.createDataFrame([(*r, datetime(2025, 7, 5, 9)) for r in rows], SCHEMA)\n\ndef test_duplicates_removed():\n    out = clean_events(make([(\"e1\", 1, \"view\", \"A\", None), (\"e1\", 1, \"view\", \"A\", None)]))\n    assert out.count() == 1\n\ndef test_null_users_dropped():\n    out = clean_events(make([(\"e1\", None, \"view\", \"A\", None), (\"e2\", 2, \"view\", \"A\", None)]))\n    assert [r.event_id for r in out.collect()] == [\"e2\"]\n\ndef test_event_date_added():\n    out = clean_events(make([(\"e1\", 1, \"view\", \"A\", None)]))\n    assert str(out.first().event_date) == \"2025-07-05\"",
   "test": true,
   "out": {
    "text": "...  [100%]\n3 passed in 9.46s"
   }
  },
  {
   "h": "Deploying it",
   "code": "package        job code as a Python package/wheel; config (paths, dates) as arguments\nrun            Databricks Job / EMR Serverless / Glue job, triggered by Airflow with the run date\n               e.g. DatabricksSubmitRunOperator(..., python_params=[\"--date\", \"{{ ds }}\"])\nstorage        Delta tables instead of Parquet folders (MERGE, OPTIMIZE)\nobserve        Spark UI per stage; log row counts in/out; alert on drops\ncost           autoscaling clusters, spot instances, right-sized partitions",
   "lang": "text"
  },
  {
   "h": "Portfolio checklist",
   "p": [
    "README with the job diagram, input/output schemas, how idempotency works (dynamic partition overwrite), one performance improvement you measured (e.g. broadcast join: before/after time and shuffle size from the Spark UI), and how to run the tests locally."
   ]
  }
 ],
 "mistakes": [
  "Transformation logic mixed with I/O, so it can't be unit tested.",
  "No dedupe on event ids (at-least-once sources send duplicates).",
  "Appending output on re-runs instead of replacing the date partition."
 ],
 "practice": [
  {
   "q": "Add a check that fails the job if more than 10% of raw events have a null user_id.",
   "code": "raw = spark.createDataFrame([(\"e1\", 1), (\"e2\", None), (\"e3\", 3), (\"e4\", 4)], \"event_id STRING, user_id INT\")\ntotal = raw.count()\nnulls = raw.filter(F.col(\"user_id\").isNull()).count()\nratio = nulls / total\nprint(f\"null user_id ratio: {ratio:.0%}\")\nif ratio > 0.10:\n    print(\"FAIL: too many events without a user; stop before writing\")",
   "out": {
    "text": "null user_id ratio: 25%\nFAIL: too many events without a user; stop before writing"
   }
  },
  {
   "q": "How would you make this job process late events that arrive a day after their event_date?",
   "a": "Read the last N days of raw data on each run (or by ingestion date), recompute metrics for every event_date present, and write with dynamic partition overwrite so those dates are replaced. With Delta, MERGE on (event_date, product) instead."
  }
 ],
 "check": [
  [
   "Why separate clean_events from reading files?",
   [
    "Style",
    "So the logic can be unit tested with small DataFrames",
    "Speed",
    "Spark requires it"
   ],
   1,
   "Testable transformations."
  ],
  [
   "What makes re-runs safe here?",
   [
    "Retries",
    "dropDuplicates + dynamic partition overwrite",
    "Caching",
    "coalesce"
   ],
   1,
   "Replace the run's partition."
  ],
  [
   "Why broadcast the products table?",
   [
    "It's big",
    "It's small, so the big events side doesn't shuffle",
    "Required",
    "Security"
   ],
   1,
   "Cheap join."
  ]
 ],
 "remember": [
  "Read with schema → clean/dedupe → broadcast join → aggregate → partitioned write.",
  "Dynamic partition overwrite (or Delta MERGE) for idempotency.",
  "Pure transformation functions + pytest.",
  "Orchestrate with Airflow passing {{ ds }}."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
