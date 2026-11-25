// Lessons for course "data-modelling". Built by tools/course-builder from tools/courses/data-modelling.js.
// Python examples were run and their real output stored.
(function (L) {
L["data-modelling:facts-dims"] = {
 "title": "Facts and dimensions",
 "level": "Beginner+",
 "one": "Analytics tables split into <b>facts</b> (events you measure: sales, payments, clicks, with numbers like amount and qty) and <b>dimensions</b> (the context you slice by: customer, product, date, store).",
 "why": "Almost every warehouse, dashboard and dbt project uses this split. It makes queries simple, fast and consistent, and it's a standard data engineering interview topic.",
 "steps": [
  {
   "h": "Facts vs dimensions",
   "code": "FACT (what happened, how much)          DIMENSION (who, what, when, where)\nfact_sales: one row per order line      dim_customer: name, city, segment\n  date_key, customer_key, product_key   dim_product: name, category, brand\n  qty, amount   ← measures (numbers)    dim_date: day, month, weekday, holiday\ngrows fast (millions of rows)           small, changes slowly\nquestions: \"how much?\" \"how many?\"      questions: \"by what?\" \"for whom?\"",
   "lang": "text"
  },
  {
   "h": "Business questions become simple joins",
   "code": "show(\"\"\"\nSELECT d.year_month, p.category, SUM(f.amount) AS revenue, SUM(f.qty) AS units\nFROM fact_sales f\nJOIN dim_date d USING (date_key)\nJOIN dim_product p USING (product_key)\nGROUP BY ALL ORDER BY d.year_month, revenue DESC\n\"\"\")",
   "note": "Every question has the same shape: facts in the middle, join the dimensions you need, group by their attributes.",
   "out": {
    "text": "┌────────────┬─────────────┬─────────┬────────┐\n│ year_month │  category   │ revenue │ units  │\n│  varchar   │   varchar   │ int128  │ int128 │\n├────────────┼─────────────┼─────────┼────────┤\n│ 2025-06    │ Computers   │   64200 │      2 │\n│ 2025-06    │ Accessories │    3800 │      3 │\n│ 2025-07    │ Computers   │   74400 │      3 │\n│ 2025-07    │ Accessories │    5200 │      5 │\n└────────────┴─────────────┴─────────┴────────┘"
   }
  },
  {
   "h": "Measures: additive or not",
   "p": [
    "<b>Additive</b> measures (amount, qty) can be summed across any dimension. <b>Semi-additive</b> ones (account balance, stock level) can be summed across customers but not across time (use the last value). <b>Non-additive</b> ones (prices, ratios, percentages) must be recomputed from their parts: store <code>amount</code> and <code>qty</code>, compute average price as <code>SUM(amount)/SUM(qty)</code>."
   ],
   "code": "show(\"\"\"\nSELECT p.category,\n       SUM(f.amount) / SUM(f.qty) AS correct_avg_unit_price,\n       AVG(f.amount / f.qty)      AS wrong_avg_of_line_prices\nFROM fact_sales f JOIN dim_product p USING (product_key)\nWHERE p.category = 'Accessories'\nGROUP BY p.category\n\"\"\")",
   "out": {
    "text": "┌─────────────┬────────────────────────┬──────────────────────────┐\n│  category   │ correct_avg_unit_price │ wrong_avg_of_line_prices │\n│   varchar   │         double         │          double          │\n├─────────────┼────────────────────────┼──────────────────────────┤\n│ Accessories │                 1125.0 │                   1380.0 │\n└─────────────┴────────────────────────┴──────────────────────────┘"
   }
  },
  {
   "h": "The date dimension",
   "p": [
    "A <code>dim_date</code> table (one row per day) holds everything about a date: month, quarter, weekday, weekend, holidays, fiscal year. Queries then filter by <code>is_weekend</code> or <code>fiscal_quarter</code> without date maths everywhere."
   ],
   "code": "show(\"\"\"\nSELECT d.is_weekend, COUNT(DISTINCT f.order_id) AS orders, SUM(f.amount) AS revenue\nFROM fact_sales f JOIN dim_date d USING (date_key)\nGROUP BY d.is_weekend ORDER BY d.is_weekend\n\"\"\")",
   "out": {
    "text": "┌────────────┬────────┬─────────┐\n│ is_weekend │ orders │ revenue │\n│  boolean   │ int64  │ int128  │\n├────────────┼────────┼─────────┤\n│ false      │      4 │   68400 │\n│ true       │      3 │   79200 │\n└────────────┴────────┴─────────┘"
   }
  },
  {
   "h": "Surrogate keys",
   "p": [
    "Dimensions get their own integer <b>surrogate key</b> (<code>customer_key</code>) separate from the source system's id (<code>customer_id</code>). This lets one customer have several historical versions (next lessons), combines customers from several source systems, and keeps fact tables narrow."
   ]
  }
 ],
 "mistakes": [
  "Putting descriptive text (customer name, city) in the fact table instead of a dimension.",
  "Storing averages or percentages in facts and then summing them.",
  "No date dimension, so every query repeats date logic.",
  "Using source system ids as the only key, breaking when two systems collide."
 ],
 "practice": [
  {
   "q": "Revenue and number of distinct customers by city.",
   "code": "show(\"\"\"\nSELECT c.city, SUM(f.amount) AS revenue, COUNT(DISTINCT f.customer_key) AS customers\nFROM fact_sales f JOIN dim_customer c USING (customer_key)\nGROUP BY c.city ORDER BY revenue DESC\n\"\"\")",
   "out": {
    "text": "┌───────────┬─────────┬───────────┐\n│   city    │ revenue │ customers │\n│  varchar  │ int128  │   int64   │\n├───────────┼─────────┼───────────┤\n│ Kochi     │  133200 │         2 │\n│ Bengaluru │   11600 │         1 │\n│ Dubai     │    2800 │         1 │\n└───────────┴─────────┴───────────┘"
   }
  },
  {
   "q": "Classify these: (a) payment amount (b) product category (c) inventory on hand (d) conversion rate (e) store region.",
   "a": "(a) additive measure in a fact. (b) dimension attribute. (c) semi-additive measure (sum across products, not across days). (d) non-additive: store numerator and denominator, compute the ratio. (e) dimension attribute (dim_store)."
  }
 ],
 "check": [
  [
   "A fact table holds…",
   [
    "Descriptions",
    "Measurable events with numbers and keys",
    "Only dates",
    "Users"
   ],
   1,
   "What happened, how much."
  ],
  [
   "Correct average price across lines?",
   [
    "AVG(price)",
    "SUM(amount)/SUM(qty)",
    "MAX(price)",
    "SUM(price)"
   ],
   1,
   "Recompute ratios from parts."
  ],
  [
   "Account balance is…",
   [
    "Additive",
    "Semi-additive (not across time)",
    "Non-additive",
    "A dimension"
   ],
   1,
   "Take the last value over time."
  ]
 ],
 "remember": [
  "Facts = events + measures. Dimensions = context to slice by.",
  "Queries: fact in the middle, join dims, group by attributes.",
  "Additive, semi-additive, non-additive measures: store parts, compute ratios.",
  "Always have a date dimension.",
  "Surrogate keys in dimensions."
 ]
};
L["data-modelling:star-grain"] = {
 "title": "Star schema and grain",
 "level": "Intermediate",
 "one": "A <b>star schema</b> is one fact table surrounded by dimensions. Its <b>grain</b> is a precise sentence describing what one fact row means, like “one row per order line”. Get the grain right and everything else follows.",
 "why": "Wrong or mixed grain is the #1 cause of wrong numbers (double counting). Interviewers almost always ask “what is the grain of this table?”.",
 "steps": [
  {
   "h": "Declare the grain first",
   "code": "fact_sales           one row per ORDER LINE               (order 1 with 2 products = 2 rows)\nfact_orders          one row per ORDER                    (header totals, shipping fee)\nfact_daily_stock     one row per PRODUCT per STORE per DAY (periodic snapshot)\nfact_payments        one row per PAYMENT ATTEMPT\n\nRule: pick the most detailed grain you can. You can always roll up, never drill down.",
   "lang": "text"
  },
  {
   "h": "Mixed grain causes double counting",
   "p": [
    "Shipping fees belong to the order, not the line. Put the fee on each line and a sum counts it twice for multi-line orders:"
   ],
   "code": "con.execute(\"CREATE TABLE orders (order_id INT, shipping_fee INT)\")\ncon.execute(\"INSERT INTO orders VALUES (1, 100), (2, 50), (3, 50), (4, 50), (5, 50), (6, 100), (7, 50)\")\nshow(\"\"\"\nSELECT (SELECT SUM(shipping_fee) FROM orders) AS true_shipping,\n       SUM(o.shipping_fee) AS joined_to_lines_wrong\nFROM fact_sales f JOIN orders o USING (order_id)\n\"\"\")",
   "note": "Keep order-level measures in an order-grain fact (or allocate them across lines on purpose).",
   "out": {
    "text": "┌───────────────┬───────────────────────┐\n│ true_shipping │ joined_to_lines_wrong │\n│    int128     │        int128         │\n├───────────────┼───────────────────────┤\n│           450 │                   650 │\n└───────────────┴───────────────────────┘"
   }
  },
  {
   "h": "Star vs snowflake",
   "p": [
    "<b>Star</b>: dimensions are flat (category is a column on dim_product). <b>Snowflake</b>: dimensions are normalised (dim_product → dim_category → dim_department). Stars mean fewer joins and simpler SQL; columnar warehouses compress repeated text well, so prefer stars."
   ]
  },
  {
   "h": "Fact table types",
   "code": "transaction      one row per event (sale, click, payment)          most common\nperiodic snapshot one row per thing per period (stock per day,     balances, inventory\n                  account balance per month)\naccumulating     one row per process instance, updated as it        order lifecycle:\nsnapshot         moves (ordered_at, paid_at, shipped_at, ...)       time between steps",
   "lang": "text"
  },
  {
   "h": "Accumulating snapshot example",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"CREATE TABLE fact_order_lifecycle AS SELECT * FROM (VALUES\n  (1, TIMESTAMP '2025-07-01 10:00', TIMESTAMP '2025-07-01 10:05', TIMESTAMP '2025-07-02 15:00', TIMESTAMP '2025-07-04 11:00'),\n  (2, TIMESTAMP '2025-07-01 12:00', TIMESTAMP '2025-07-01 12:01', TIMESTAMP '2025-07-03 09:00', NULL),\n  (3, TIMESTAMP '2025-07-02 09:00', NULL, NULL, NULL)\n) t(order_id, ordered_at, paid_at, shipped_at, delivered_at)\"\"\")\nprint(con.sql(\"\"\"\nSELECT COUNT(*) AS orders, COUNT(paid_at) AS paid, COUNT(shipped_at) AS shipped, COUNT(delivered_at) AS delivered,\n       ROUND(AVG(date_diff('hour', paid_at, shipped_at)), 1) AS avg_hours_to_ship\nFROM fact_order_lifecycle\n\"\"\"))",
   "out": {
    "text": "┌────────┬───────┬─────────┬───────────┬───────────────────┐\n│ orders │ paid  │ shipped │ delivered │ avg_hours_to_ship │\n│ int64  │ int64 │  int64  │   int64   │      double       │\n├────────┼───────┼─────────┼───────────┼───────────────────┤\n│      3 │     2 │       2 │         1 │              37.0 │\n└────────┴───────┴─────────┴───────────┴───────────────────┘"
   }
  }
 ],
 "mistakes": [
  "Not writing down the grain.",
  "Mixing order-level and line-level measures in one table.",
  "Aggregating too early (daily totals only) so you can't answer per-order questions later.",
  "Snowflaking dimensions in a columnar warehouse for no benefit."
 ],
 "practice": [
  {
   "q": "State the grain for a gym chain's table that records each member check-in at each branch.",
   "a": "“One row per member check-in event (member, branch, timestamp).” Dimensions: dim_member, dim_branch, dim_date (+ time of day). Measures: maybe just a count (a factless fact table) or duration if check-out is recorded."
  },
  {
   "q": "Average order value: compute it correctly from the line-grain fact.",
   "code": "show(\"\"\"\nSELECT SUM(amount) / COUNT(DISTINCT order_id) AS avg_order_value\nFROM fact_sales\n\"\"\")",
   "out": {
    "text": "┌────────────────────┐\n│  avg_order_value   │\n│       double       │\n├────────────────────┤\n│ 21085.714285714286 │\n└────────────────────┘"
   }
  }
 ],
 "check": [
  [
   "Grain means…",
   [
    "Table size",
    "What one fact row represents",
    "The index",
    "Partitioning"
   ],
   1,
   "Declare it first."
  ],
  [
   "Shipping fee repeated on every order line, then summed?",
   [
    "Correct",
    "Double counting",
    "Faster",
    "Required"
   ],
   1,
   "Mixed grain."
  ],
  [
   "Prefer which in columnar warehouses?",
   [
    "Snowflake",
    "Star",
    "No dimensions",
    "One giant table only"
   ],
   1,
   "Fewer joins, good compression."
  ]
 ],
 "remember": [
  "Write the grain as a sentence before building.",
  "Most detailed grain possible; roll up later.",
  "Never mix grains in one fact.",
  "Star over snowflake.",
  "Transaction, periodic snapshot, accumulating snapshot."
 ]
};
L["data-modelling:scd"] = {
 "title": "Slowly changing dimensions (SCD)",
 "level": "Intermediate",
 "one": "When a dimension attribute changes (a customer moves city), you choose: <b>Type 1</b> overwrite (no history) or <b>Type 2</b> add a new row with validity dates (full history), so old sales stay attached to the old city.",
 "why": "“What were sales by region last year, with customers in the region they were in then?” needs SCD Type 2. It's a very common interview and real-world requirement.",
 "steps": [
  {
   "h": "The problem",
   "p": [
    "Asha moved from Kochi to Dubai in July. With Type 1 (overwrite), all her June sales suddenly count as Dubai sales in every report: history is rewritten."
   ]
  },
  {
   "h": "Type 2 table design",
   "code": "dim_customer\ncustomer_key  customer_id  name  city   valid_from  valid_to    is_current\n1             101          Asha  Kochi  2025-01-01  2025-07-10  false\n5             101          Asha  Dubai  2025-07-10  9999-12-31  true\n\nfacts store customer_key, so June sales point to key 1 (Kochi) forever,\nand sales after July 10 point to key 5 (Dubai).",
   "lang": "text"
  },
  {
   "h": "Applying a change (Type 2 merge)",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"\nCREATE TABLE dim_customer (customer_key INT, customer_id INT, name TEXT, city TEXT,\n                           valid_from DATE, valid_to DATE, is_current BOOLEAN);\nINSERT INTO dim_customer VALUES (1, 101, 'Asha', 'Kochi', '2025-01-01', '9999-12-31', true),\n                                (2, 102, 'Ben', 'Bengaluru', '2025-01-01', '9999-12-31', true);\nCREATE TABLE incoming (customer_id INT, name TEXT, city TEXT);\nINSERT INTO incoming VALUES (101, 'Asha', 'Dubai'), (102, 'Ben', 'Bengaluru'), (103, 'Chen', 'Dubai');\n\"\"\")\n\ndef apply_scd2(as_of):\n    con.execute(\"BEGIN\")\n    # 1) close current rows whose tracked attributes changed\n    con.execute(\"\"\"UPDATE dim_customer d SET valid_to = ?, is_current = false\n                   FROM incoming i WHERE d.customer_id = i.customer_id AND d.is_current\n                   AND d.city IS DISTINCT FROM i.city\"\"\", [as_of])\n    # 2) insert new versions for changed + brand-new customers\n    con.execute(\"\"\"INSERT INTO dim_customer\n                   SELECT (SELECT MAX(customer_key) FROM dim_customer) + row_number() OVER (ORDER BY i.customer_id),\n                          i.customer_id, i.name, i.city, ?, DATE '9999-12-31', true\n                   FROM incoming i\n                   WHERE NOT EXISTS (SELECT 1 FROM dim_customer d\n                                     WHERE d.customer_id = i.customer_id AND d.is_current)\"\"\", [as_of])\n    con.execute(\"COMMIT\")\n\napply_scd2(\"2025-07-10\")\napply_scd2(\"2025-07-10\")          # re-run: nothing changes\nprint(con.sql(\"SELECT * FROM dim_customer ORDER BY customer_id, valid_from\"))",
   "note": "Step 1 closes changed rows; step 2 inserts a new current row only where none exists, so the merge is idempotent.",
   "out": {
    "text": "┌──────────────┬─────────────┬─────────┬───────────┬────────────┬────────────┬────────────┐\n│ customer_key │ customer_id │  name   │   city    │ valid_from │  valid_to  │ is_current │\n│    int32     │    int32    │ varchar │  varchar  │    date    │    date    │  boolean   │\n├──────────────┼─────────────┼─────────┼───────────┼────────────┼────────────┼────────────┤\n│            1 │         101 │ Asha    │ Kochi     │ 2025-01-01 │ 2025-07-10 │ false      │\n│            3 │         101 │ Asha    │ Dubai     │ 2025-07-10 │ 9999-12-31 │ true       │\n│            2 │         102 │ Ben     │ Bengaluru │ 2025-01-01 │ 9999-12-31 │ true       │\n│            4 │         103 │ Chen    │ Dubai     │ 2025-07-10 │ 9999-12-31 │ true       │\n└──────────────┴─────────────┴─────────┴───────────┴────────────┴────────────┴────────────┘"
   }
  },
  {
   "h": "Joining facts to the right version",
   "p": [
    "Either store the correct <code>customer_key</code> on the fact at load time (look up the version current on the sale date), or join on id and date range:"
   ],
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"\nCREATE TABLE dim_customer AS SELECT * FROM (VALUES\n  (1, 101, 'Kochi', DATE '2025-01-01', DATE '2025-07-10'),\n  (5, 101, 'Dubai', DATE '2025-07-10', DATE '9999-12-31')) t(customer_key, customer_id, city, valid_from, valid_to);\nCREATE TABLE sales AS SELECT * FROM (VALUES\n  (101, DATE '2025-06-02', 55000), (101, DATE '2025-06-15', 2400), (101, DATE '2025-07-20', 3000)) t(customer_id, sale_date, amount);\n\"\"\")\nprint(con.sql(\"\"\"\nSELECT d.city, SUM(s.amount) AS revenue\nFROM sales s JOIN dim_customer d\n  ON s.customer_id = d.customer_id AND s.sale_date >= d.valid_from AND s.sale_date < d.valid_to\nGROUP BY d.city ORDER BY d.city\n\"\"\"))",
   "out": {
    "text": "┌─────────┬─────────┐\n│  city   │ revenue │\n│ varchar │ int128  │\n├─────────┼─────────┤\n│ Dubai   │    3000 │\n│ Kochi   │   57400 │\n└─────────┴─────────┘"
   }
  },
  {
   "h": "Choosing a type per column",
   "code": "Type 0  never changes            date_of_birth, original signup channel\nType 1  overwrite, no history    typo fixes in name, phone number, email\nType 2  new row, full history    city/region, segment, sales rep, price tier\n(dbt snapshots implement Type 2 for you: see the dbt course)",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Overwriting attributes that reports group by (region, segment).",
  "Type 2 on every column, including typo fixes, exploding the table.",
  "Overlapping validity ranges (two current rows for one customer).",
  "Facts joined to the current version only, rewriting history anyway."
 ],
 "practice": [
  {
   "q": "Write a query that finds customers with more than one current row (a data bug).",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"CREATE TABLE dim_customer AS SELECT * FROM (VALUES\n  (1, 101, true), (5, 101, true), (2, 102, true), (3, 103, false), (4, 103, true)) t(customer_key, customer_id, is_current)\"\"\")\nprint(con.sql(\"\"\"SELECT customer_id, COUNT(*) AS current_rows FROM dim_customer\n                 WHERE is_current GROUP BY customer_id HAVING COUNT(*) > 1\"\"\"))",
   "out": {
    "text": "┌─────────────┬──────────────┐\n│ customer_id │ current_rows │\n│    int32    │    int64     │\n├─────────────┼──────────────┤\n│         101 │            2 │\n└─────────────┴──────────────┘"
   }
  },
  {
   "q": "A customer's email changes and their segment changes from retail to business. Which SCD type for each, and why?",
   "a": "Email: Type 1 (no one reports by old email; just keep it current). Segment: Type 2 (reports by segment over time must keep past sales in the segment the customer had then)."
  }
 ],
 "check": [
  [
   "Type 2 SCD…",
   [
    "Overwrites",
    "Adds a new row with validity dates",
    "Deletes old rows",
    "Uses a new table"
   ],
   1,
   "Keeps history."
  ],
  [
   "Best type for fixing a typo in a name?",
   [
    "Type 1",
    "Type 2",
    "Type 0",
    "Type 6"
   ],
   0,
   "No history needed."
  ],
  [
   "How do facts keep pointing to the old version?",
   [
    "They store the surrogate key of the version valid at sale time",
    "Magic",
    "They store names",
    "Indexes"
   ],
   0,
   "Surrogate keys."
  ]
 ],
 "remember": [
  "Type 1 overwrite; Type 2 new row with valid_from/valid_to/is_current.",
  "Pick the type per column.",
  "Merge = close changed current rows, insert new versions, in one transaction.",
  "Facts store the surrogate key of the version valid then.",
  "Test: one current row per business id, no overlapping ranges."
 ]
};
L["data-modelling:lake-warehouse"] = {
 "title": "Data lakes, warehouses and layers",
 "level": "Intermediate",
 "one": "A <b>data lake</b> stores raw files cheaply (S3 + Parquet). A <b>warehouse</b> stores modelled tables for fast SQL. A <b>lakehouse</b> adds table features (transactions, updates) to lake files. Organise data in <b>layers</b>: raw → staging → marts.",
 "why": "Every data platform follows this structure. Knowing the layers tells you where each piece of logic belongs and makes pipelines debuggable.",
 "steps": [
  {
   "h": "Lake, warehouse, lakehouse",
   "code": "data lake    files in object storage (S3/GCS/ADLS): JSON, CSV, Parquet\n             cheap, any format, schema-on-read · needs engines to query (Athena, Spark, DuckDB)\nwarehouse    Snowflake, BigQuery, Redshift: managed tables, fast SQL, access control\n             storage + compute managed for you · pay for compute\nlakehouse    open table formats on lake files: Delta Lake, Apache Iceberg, Hudi\n             ACID transactions, updates/deletes, time travel · Databricks, Snowflake/BigQuery Iceberg",
   "lang": "text"
  },
  {
   "h": "Layers (medallion: bronze, silver, gold)",
   "code": "raw / bronze      exactly as received, append-only, never edited     raw.shop_orders\nstaging / silver  cleaned: types cast, renamed, deduplicated, tested   stg_orders\nmarts / gold      business-ready facts and dimensions                  fct_sales, dim_customer\n                                                                       mart_daily_revenue\nRule: each layer reads only from the layer below. Dashboards read only marts.",
   "lang": "text"
  },
  {
   "h": "The layers, running",
   "code": "import duckdb\ncon = duckdb.connect()\n\n# raw: exactly as received\ncon.execute(\"CREATE TABLE raw_orders AS SELECT * FROM read_json_auto('raw/orders.jsonl')\")\n\n# staging: types, names, casing, dedupe\ncon.execute(\"\"\"\nCREATE VIEW stg_orders AS\nSELECT DISTINCT CAST(id AS INT) AS order_id, CAST(cust AS INT) AS customer_id,\n       CAST(amt AS INT) AS amount, lower(status) AS status, CAST(ts AS TIMESTAMP) AS ordered_at\nFROM raw_orders\n\"\"\")\n\n# mart: business-ready\ncon.execute(\"\"\"\nCREATE VIEW mart_monthly_revenue AS\nSELECT strftime(ordered_at, '%Y-%m') AS month, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM stg_orders WHERE status = 'paid' GROUP BY 1\n\"\"\")\nprint(\"raw rows:\", con.sql(\"SELECT COUNT(*) FROM raw_orders\").fetchall()[0][0],\n      \"| staged rows:\", con.sql(\"SELECT COUNT(*) FROM stg_orders\").fetchall()[0][0])\nprint(con.sql(\"SELECT * FROM mart_monthly_revenue ORDER BY month\"))",
   "out": {
    "text": "raw rows: 5 | staged rows: 4\n┌─────────┬────────┬─────────┐\n│  month  │ orders │ revenue │\n│ varchar │ int64  │ int128  │\n├─────────┼────────┼─────────┤\n│ 2025-06 │      2 │   57400 │\n│ 2025-07 │      1 │    3000 │\n└─────────┴────────┴─────────┘"
   }
  },
  {
   "h": "Querying lake files directly",
   "p": [
    "Engines like DuckDB, Athena, Spark and BigQuery external tables query Parquet files where they sit, using folder names as partition columns:"
   ],
   "code": "import duckdb, pandas as pd, os\n\nfor month, rows in {\"2025-06\": [(1, 55000), (2, 2400)], \"2025-07\": [(3, 3000), (4, 700)]}.items():\n    os.makedirs(f\"lake/orders/month={month}\", exist_ok=True)\n    pd.DataFrame(rows, columns=[\"order_id\", \"amount\"]).to_parquet(f\"lake/orders/month={month}/part-0.parquet\")\n\nprint(duckdb.sql(\"\"\"\nSELECT month, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM read_parquet('lake/orders/*/*.parquet', hive_partitioning = true)\nGROUP BY month ORDER BY month\n\"\"\"))",
   "out": {
    "text": "┌─────────┬────────┬─────────┐\n│  month  │ orders │ revenue │\n│ varchar │ int64  │ int128  │\n├─────────┼────────┼─────────┤\n│ 2025-06 │      2 │   57400 │\n│ 2025-07 │      2 │    3700 │\n└─────────┴────────┴─────────┘"
   }
  },
  {
   "h": "Which to choose",
   "p": [
    "Small/medium company with SQL analysts: a warehouse (Snowflake/BigQuery) + dbt, with raw files in S3 as backup. Large volumes, ML and many file types: a lakehouse (Databricks/Iceberg). Learning or small data: PostgreSQL or DuckDB with the same layering."
   ]
  }
 ],
 "mistakes": [
  "Editing raw data in place (you lose the ability to replay).",
  "Dashboards querying raw or staging tables.",
  "Business logic spread across layers so nobody knows where a number comes from.",
  "A lake with no catalog or layout rules (a “data swamp”)."
 ],
 "practice": [
  {
   "q": "Add a staging rule that drops orders with a negative or missing amount, and count how many were dropped.",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"CREATE TABLE raw_orders AS SELECT * FROM read_json_auto('raw/orders.jsonl')\")\ncon.execute(\"CREATE VIEW stg_orders AS SELECT CAST(id AS INT) AS order_id, CAST(amt AS INT) AS amount FROM raw_orders WHERE CAST(amt AS INT) >= 0\")\nkept = con.sql(\"SELECT COUNT(*) FROM stg_orders\").fetchall()[0][0]\ntotal = con.sql(\"SELECT COUNT(*) FROM raw_orders\").fetchall()[0][0]\nprint(\"kept:\", kept, \"dropped:\", total - kept)",
   "out": {
    "text": "kept: 2 dropped: 2"
   }
  },
  {
   "q": "Where does each belong: (a) renaming amt to amount (b) “active customer = ordered in last 90 days” (c) the original API JSON (d) casting text dates to timestamps?",
   "a": "(a) staging. (b) marts (business definition). (c) raw. (d) staging."
  }
 ],
 "check": [
  [
   "Raw layer rule?",
   [
    "Clean it daily",
    "Keep exactly as received, append-only",
    "Delete after a week",
    "Only CSV"
   ],
   1,
   "Replayability."
  ],
  [
   "Dashboards should read…",
   [
    "Raw",
    "Staging",
    "Marts",
    "Source DBs"
   ],
   2,
   "Business-ready tables only."
  ],
  [
   "A lakehouse adds…",
   [
    "Nothing",
    "Transactions/updates/time travel on lake files",
    "Only dashboards",
    "CSV support"
   ],
   1,
   "Delta/Iceberg/Hudi."
  ]
 ],
 "remember": [
  "Lake = cheap files; warehouse = managed SQL tables; lakehouse = table features on files.",
  "Layers: raw → staging → marts (bronze/silver/gold).",
  "Each layer reads only from the one below; dashboards read marts.",
  "Business definitions live in marts.",
  "Query Parquet in place with hive partitioning."
 ]
};
L["data-modelling:partitioning"] = {
 "title": "Partitioning, clustering and performance",
 "level": "Intermediate",
 "one": "<b>Partitioning</b> splits a big table by a column (usually date) so queries read only the slices they need. <b>Clustering/sorting</b> orders data inside partitions so engines skip blocks. Both cut query time and cloud cost.",
 "why": "In BigQuery/Snowflake/Athena you pay for data scanned or compute time. A well-partitioned table can make a query 100× cheaper. Interviewers ask how you'd speed up a slow warehouse query.",
 "steps": [
  {
   "h": "Partition pruning",
   "p": [
    "With date-partitioned files, a filter on the partition column means the engine never opens the other files:"
   ],
   "code": "import duckdb, pandas as pd, os, random\n\nrandom.seed(3)\nfor day in pd.date_range(\"2025-01-01\", \"2025-03-31\"):\n    d = day.strftime(\"%Y-%m-%d\")\n    os.makedirs(f\"lake/events/dt={d}\", exist_ok=True)\n    pd.DataFrame({\"user_id\": [random.randint(1, 5000) for _ in range(5000)],\n                  \"amount\": [random.randint(1, 900) for _ in range(5000)]}).to_parquet(f\"lake/events/dt={d}/part.parquet\")\n\ncon = duckdb.connect()\nsrc = \"read_parquet('lake/events/*/*.parquet', hive_partitioning = true)\"\nplan = con.sql(f\"EXPLAIN ANALYZE SELECT SUM(amount) FROM {src} WHERE dt = '2025-03-15'\").fetchall()[0][1]\nfiles = [line.strip() for line in plan.splitlines() if \"Files Read\" in line or \"Scanning Files\" in line]\nprint(\"files in lake:\", len(os.listdir(\"lake/events\")))\nprint(files[0] if files else \"plan:\\n\" + plan[:600])\nprint(\"result:\", con.sql(f\"SELECT COUNT(*), SUM(amount) FROM {src} WHERE dt = '2025-03-15'\").fetchall()[0])",
   "out": {
    "text": "files in lake: 90\n│ Scanning Files: 1/90                   │\nresult: (5000, 2240824)"
   }
  },
  {
   "h": "Choosing a partition column",
   "p": [
    "Partition by what queries filter on most, almost always the <b>event date</b>. Aim for partitions that are not tiny (avoid millions of small files) and not huge. Daily is common; monthly for small tables. Don't partition by high-cardinality columns like user_id."
   ]
  },
  {
   "h": "Clustering / sort keys",
   "p": [
    "Inside partitions, sort by columns often used in filters or joins (customer_id, country). Parquet and warehouses store min/max per block, so sorted data lets them skip blocks. Snowflake: clustering keys; BigQuery: <code>CLUSTER BY</code>; Redshift: sort keys; Delta: Z-ORDER."
   ],
   "code": "-- BigQuery\nCREATE TABLE analytics.fct_events\nPARTITION BY DATE(event_ts)\nCLUSTER BY customer_id, event_type\nAS SELECT * FROM staging.events;\n\n-- Queries that filter on the partition and cluster columns scan far less:\nSELECT event_type, COUNT(*)\nFROM analytics.fct_events\nWHERE DATE(event_ts) BETWEEN '2025-07-01' AND '2025-07-07'   -- prunes partitions\n  AND customer_id = 101                                      -- skips blocks\nGROUP BY event_type;",
   "lang": "sql"
  },
  {
   "h": "Other performance habits",
   "code": "select only needed columns      no SELECT * on wide tables (columnar = pay per column)\nfilter early                     WHERE before JOIN; push filters into subqueries/CTEs\npre-aggregate                    build daily summary marts for dashboards\navoid tiny files                 compact small files (target ~128 MB-1 GB per file)\nincremental models               process new partitions only (dbt incremental)\ncheck the plan                   EXPLAIN / query profile: look at bytes scanned",
   "lang": "text"
  },
  {
   "h": "Selecting fewer columns",
   "code": "import duckdb, pandas as pd, numpy as np, time\n\nn = 2_000_000\npd.DataFrame({\"id\": np.arange(n), \"amount\": np.random.randint(1, 900, n),\n              **{f\"attr_{i}\": np.random.rand(n) for i in range(20)}}).to_parquet(\"wide.parquet\")\nfor sql in [\"SELECT * FROM 'wide.parquet'\", \"SELECT id, amount FROM 'wide.parquet'\"]:\n    t = time.perf_counter()\n    duckdb.sql(sql).fetchnumpy()\n    print(f\"{sql:40} {(time.perf_counter() - t) * 1000:.0f} ms\")",
   "out": {
    "text": "SELECT * FROM 'wide.parquet'             405 ms\nSELECT id, amount FROM 'wide.parquet'    35 ms"
   }
  }
 ],
 "mistakes": [
  "No partition filter in queries on huge tables (full scans, big bills).",
  "Partitioning by user_id and creating millions of tiny files.",
  "SELECT * in dashboards on wide tables.",
  "Wrapping the partition column in a function the engine can't prune on."
 ],
 "practice": [
  {
   "q": "A BigQuery dashboard query scans 2 TB daily and costs too much. List 4 fixes.",
   "a": "1) Partition the table by event date and make the dashboard filter by date range. 2) Cluster by the columns it filters on (e.g. customer_id, country). 3) Select only needed columns. 4) Build a pre-aggregated daily mart that the dashboard reads instead of raw events. Also set require_partition_filter on the table."
  },
  {
   "q": "Using DuckDB, write lake files partitioned by country and query only one country.",
   "code": "import duckdb, pandas as pd\ndf = pd.DataFrame({\"country\": [\"IN\", \"IN\", \"AE\", \"AE\", \"US\"], \"amount\": [100, 200, 300, 400, 500]})\nduckdb.sql(\"COPY (SELECT * FROM df) TO 'by_country' (FORMAT parquet, PARTITION_BY (country), OVERWRITE_OR_IGNORE)\")\nprint(duckdb.sql(\"SELECT country, SUM(amount) FROM read_parquet('by_country/*/*.parquet', hive_partitioning = true) WHERE country = 'AE' GROUP BY country\").fetchall())",
   "out": {
    "text": "[('AE', 700)]"
   }
  }
 ],
 "check": [
  [
   "Best partition column for event data?",
   [
    "user_id",
    "Event date",
    "Random",
    "Email"
   ],
   1,
   "What queries filter on."
  ],
  [
   "Why does SELECT * cost more in columnar warehouses?",
   [
    "It doesn't",
    "It reads every column",
    "It locks tables",
    "It skips indexes"
   ],
   1,
   "Pay per column scanned."
  ],
  [
   "Clustering helps by…",
   [
    "Encrypting",
    "Sorting data so blocks can be skipped",
    "Adding replicas",
    "Compressing JSON"
   ],
   1,
   "Min/max per block."
  ]
 ],
 "remember": [
  "Partition by date; always filter on it.",
  "Cluster/sort by common filter/join columns.",
  "Select only needed columns.",
  "Avoid tiny files; compact.",
  "Pre-aggregate for dashboards; check EXPLAIN/bytes scanned."
 ]
};
L["data-modelling:build-schema"] = {
 "title": "Project: design a sales warehouse",
 "level": "Project",
 "one": "Design and build a small sales warehouse: a star schema with a declared grain, a date dimension, an SCD Type 2 customer dimension, staging and mart layers, and tests that prove the numbers are right.",
 "why": "A modelled warehouse with clear grain and tests is exactly what data teams build. It's a strong portfolio piece and gives you concrete answers for modelling interviews.",
 "steps": [
  {
   "h": "Design document (write this first)",
   "code": "business questions   revenue by month/category/city; top customers; avg order value;\n                     revenue by the city the customer lived in at the time\nfct_sales            grain: one row per order line\n                     keys: date_key, customer_key (SCD2 version at order time), product_key\n                     measures: qty, amount\ndim_customer (SCD2)  customer_id, name, city*, segment*   (*tracked as Type 2)\ndim_product          sku, name, category\ndim_date             date, month, year_month, weekday, is_weekend\nlayers               raw_* → stg_* → dim_*/fct_* → mart_monthly_revenue\ntests                unique keys, not null keys, every fact key found in its dim,\n                     one current row per customer, fact total = staging total",
   "lang": "text"
  },
  {
   "h": "Build it",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"\n-- raw (as received)\nCREATE TABLE raw_customers AS SELECT * FROM (VALUES\n  (101, 'Asha', 'Kochi', DATE '2025-01-01'), (101, 'Asha', 'Dubai', DATE '2025-07-10'),\n  (102, 'Ben', 'Bengaluru', DATE '2025-01-01')) t(customer_id, name, city, changed_at);\nCREATE TABLE raw_orders AS SELECT * FROM (VALUES\n  (1, 101, DATE '2025-06-02', 'LAP-14', 1, 55000), (1, 101, DATE '2025-06-02', 'MOU-01', 2, 1400),\n  (2, 102, DATE '2025-06-20', 'MON-27', 1, 9200), (3, 101, DATE '2025-07-20', 'KEY-02', 1, 2400)\n) t(order_id, customer_id, order_date, sku, qty, amount);\nCREATE TABLE raw_products AS SELECT * FROM (VALUES\n  ('LAP-14', 'Laptop 14', 'Computers'), ('MOU-01', 'Wireless mouse', 'Accessories'),\n  ('MON-27', 'Monitor 27', 'Computers'), ('KEY-02', 'Keyboard', 'Accessories')) t(sku, name, category);\n\n-- dimensions\nCREATE TABLE dim_customer AS\nSELECT row_number() OVER (ORDER BY customer_id, changed_at) AS customer_key, customer_id, name, city,\n       changed_at AS valid_from,\n       COALESCE(LEAD(changed_at) OVER (PARTITION BY customer_id ORDER BY changed_at), DATE '9999-12-31') AS valid_to\nFROM raw_customers;\nCREATE TABLE dim_product AS SELECT row_number() OVER (ORDER BY sku) AS product_key, * FROM raw_products;\nCREATE TABLE dim_date AS SELECT CAST(strftime(d, '%Y%m%d') AS INT) AS date_key, CAST(d AS DATE) AS date,\n       strftime(d, '%Y-%m') AS year_month FROM range(DATE '2025-01-01', DATE '2026-01-01', INTERVAL 1 DAY) t(d);\n\n-- fact at order-line grain, with the customer version valid on the order date\nCREATE TABLE fct_sales AS\nSELECT o.order_id, CAST(strftime(o.order_date, '%Y%m%d') AS INT) AS date_key,\n       c.customer_key, p.product_key, o.qty, o.amount\nFROM raw_orders o\nJOIN dim_customer c ON c.customer_id = o.customer_id AND o.order_date >= c.valid_from AND o.order_date < c.valid_to\nJOIN dim_product p ON p.sku = o.sku;\n\n-- mart\nCREATE VIEW mart_revenue_by_city AS\nSELECT d.year_month, c.city, SUM(f.amount) AS revenue\nFROM fct_sales f JOIN dim_date d USING (date_key) JOIN dim_customer c USING (customer_key)\nGROUP BY ALL;\n\"\"\")\nprint(con.sql(\"SELECT * FROM dim_customer\"))\nprint(con.sql(\"SELECT * FROM mart_revenue_by_city ORDER BY year_month, city\"))",
   "note": "Asha's June orders stay in Kochi and her July order counts for Dubai, because each fact row points to the customer version valid on its date.",
   "out": {
    "text": "┌──────────────┬─────────────┬─────────┬───────────┬────────────┬────────────┐\n│ customer_key │ customer_id │  name   │   city    │ valid_from │  valid_to  │\n│    int64     │    int32    │ varchar │  varchar  │    date    │    date    │\n├──────────────┼─────────────┼─────────┼───────────┼────────────┼────────────┤\n│            3 │         102 │ Ben     │ Bengaluru │ 2025-01-01 │ 9999-12-31 │\n│            1 │         101 │ Asha    │ Kochi     │ 2025-01-01 │ 2025-07-10 │\n│            2 │         101 │ Asha    │ Dubai     │ 2025-07-10 │ 9999-12-31 │\n└──────────────┴─────────────┴─────────┴───────────┴────────────┴────────────┘\n\n┌────────────┬───────────┬─────────┐\n│ year_month │   city    │ revenue │\n│  varchar   │  varchar  │ int128  │\n├────────────┼───────────┼─────────┤\n│ 2025-06    │ Bengaluru │    9200 │\n│ 2025-06    │ Kochi     │   56400 │\n│ 2025-07    │ Dubai     │    2400 │\n└────────────┴───────────┴─────────┘"
   }
  },
  {
   "h": "Tests that prove it",
   "code": "import duckdb\n\ndef build():\n    con = duckdb.connect()\n    con.execute(\"\"\"\n    CREATE TABLE dim_customer AS SELECT * FROM (VALUES (1, 101, DATE '2025-01-01', DATE '2025-07-10'),\n        (2, 101, DATE '2025-07-10', DATE '9999-12-31'), (3, 102, DATE '2025-01-01', DATE '9999-12-31'))\n        t(customer_key, customer_id, valid_from, valid_to);\n    CREATE TABLE stg_orders AS SELECT * FROM (VALUES (1, 101, DATE '2025-06-02', 55000), (2, 102, DATE '2025-06-20', 9200),\n        (3, 101, DATE '2025-07-20', 2400)) t(order_id, customer_id, order_date, amount);\n    CREATE TABLE fct_sales AS SELECT o.order_id, c.customer_key, o.amount FROM stg_orders o\n        JOIN dim_customer c ON c.customer_id = o.customer_id AND o.order_date >= c.valid_from AND o.order_date < c.valid_to;\n    \"\"\")\n    return con\n\ndef one(con, sql):\n    return con.sql(sql).fetchall()[0][0]\n\ndef test_fact_keys_unique():\n    con = build()\n    assert one(con, \"SELECT COUNT(*) - COUNT(DISTINCT order_id) FROM fct_sales\") == 0\n\ndef test_no_orders_lost_in_joins():\n    con = build()\n    assert one(con, \"SELECT SUM(amount) FROM fct_sales\") == one(con, \"SELECT SUM(amount) FROM stg_orders\")\n\ndef test_one_current_version_per_customer():\n    con = build()\n    assert one(con, \"\"\"SELECT COUNT(*) FROM (SELECT customer_id FROM dim_customer\n                       WHERE valid_to = DATE '9999-12-31' GROUP BY 1 HAVING COUNT(*) > 1)\"\"\") == 0\n\ndef test_july_order_uses_new_version():\n    con = build()\n    assert one(con, \"SELECT customer_key FROM fct_sales WHERE order_id = 3\") == 2",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.13s"
   }
  },
  {
   "h": "Make it portfolio-ready",
   "p": [
    "Load real public data (e.g. an e-commerce dataset), build it in dbt (next course) on DuckDB or Postgres, add the design document and an ER diagram to the README, and show one dashboard built on the mart. Explain the grain and the SCD choice in two sentences each."
   ]
  }
 ],
 "mistakes": [
  "Building tables before writing the grain and questions down.",
  "Inner joins that silently drop facts with unknown dimension keys (use an 'unknown' member row or test totals).",
  "No tests comparing fact totals with staging totals."
 ],
 "practice": [
  {
   "q": "Facts arrive for a product SKU that's not in dim_product yet. What should happen?",
   "a": "Don't drop the sale. Either add an 'unknown' dimension row (product_key = -1) and map unmatched facts to it, then alert; or insert a placeholder (“late-arriving dimension”) row for the SKU and fill its attributes when the product data arrives. Test that fact totals still match staging."
  },
  {
   "q": "Write a query on the warehouse above: top category by revenue in June 2025.",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"\"\"CREATE TABLE fct AS SELECT * FROM (VALUES (20250602, 'Computers', 55000), (20250602, 'Accessories', 1400),\n  (20250620, 'Computers', 9200), (20250720, 'Accessories', 2400)) t(date_key, category, amount)\"\"\")\nprint(con.sql(\"\"\"SELECT category, SUM(amount) AS revenue FROM fct\n                 WHERE date_key BETWEEN 20250601 AND 20250630 GROUP BY category ORDER BY revenue DESC LIMIT 1\"\"\").fetchall())",
   "out": {
    "text": "[('Computers', 64200)]"
   }
  }
 ],
 "check": [
  [
   "What do you write before building tables?",
   [
    "The dashboard",
    "Business questions + grain of each fact",
    "Indexes",
    "Passwords"
   ],
   1,
   "Design first."
  ],
  [
   "Test that joins didn't drop facts?",
   [
    "Row count only of dims",
    "Fact total equals staging total",
    "None",
    "Check colours"
   ],
   1,
   "Reconcile totals."
  ],
  [
   "Unknown dimension key on a fact?",
   [
    "Drop the row",
    "Map to an 'unknown' member and alert",
    "Crash",
    "Ignore forever"
   ],
   1,
   "Never lose facts."
  ]
 ],
 "remember": [
  "Questions → grain → facts/dims → layers → tests.",
  "SCD2 lookup by date when loading facts.",
  "Tests: unique keys, referential integrity, one current version, totals reconcile.",
  "Unknown members instead of dropped facts."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
