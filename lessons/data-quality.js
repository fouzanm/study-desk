// Lessons for course "data-quality". Built by tools/course-builder from tools/courses/data-quality.js.
// Python examples were run and their real output stored.
(function (L) {
L["data-quality:dimensions"] = {
 "title": "Data quality dimensions",
 "level": "Intermediate",
 "one": "“Good data” has measurable <b>dimensions</b>: <b>completeness</b> (no missing values), <b>uniqueness</b> (no duplicates), <b>validity</b> (right format/range), <b>consistency</b> (agrees across tables), <b>accuracy</b> (matches reality) and <b>timeliness</b> (fresh enough).",
 "why": "Bad data costs money and trust: wrong invoices, wrong forecasts, wrong AI answers. Naming the dimensions lets you measure quality instead of arguing about it.",
 "steps": [
  {
   "h": "The dimensions",
   "code": "dimension      question                                   example check\ncompleteness   is anything missing?                       customer_id not null\nuniqueness     is anything duplicated?                    order_id unique\nvalidity       does it follow the rules?                  amount >= 0, email has @, status in (...)\nconsistency    does it agree with other data?             every order's customer exists\naccuracy       does it match reality / the source?        revenue = payment provider's total\ntimeliness     is it fresh enough?                        loaded within 2 hours of midnight",
   "lang": "text"
  },
  {
   "h": "Profile a table",
   "code": "profile = pd.DataFrame({\n    \"nulls\": orders.isna().sum(),\n    \"distinct\": orders.nunique(),\n    \"example\": orders.iloc[0],\n})\nprint(profile.to_string())\nprint(\"\\nduplicate order_ids:\", orders[\"order_id\"].duplicated().sum())\nprint(\"amount range:\", orders[\"amount\"].min(), \"to\", orders[\"amount\"].max())\nprint(\"status values:\", sorted(orders[\"status\"].unique()))",
   "note": "Profiling first shows what to test: a null customer, a duplicate order, a negative and an absurd amount, inconsistent status casing and an order dated 2031.",
   "out": {
    "text": "             nulls  distinct              example\norder_id         0         7                    1\ncustomer_id      1         5                101.0\nemail            1         5           asha@x.com\namount           0         7                55000\nstatus           0         3                 paid\norder_date       0         5  2025-07-01 00:00:00\n\nduplicate order_ids: 1\namount range: -50 to 120000000\nstatus values: ['PAID', 'paid', 'refunded']"
   }
  },
  {
   "h": "Score each dimension",
   "code": "checks = {\n    \"completeness: customer_id not null\": orders[\"customer_id\"].notna(),\n    \"completeness: email not null\":       orders[\"email\"].notna(),\n    \"uniqueness: order_id\":               ~orders[\"order_id\"].duplicated(keep=False),\n    \"validity: amount in 0..10,000,000\":  orders[\"amount\"].between(0, 10_000_000),\n    \"validity: email format\":             orders[\"email\"].fillna(\"\").str.match(r\"^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$\"),\n    \"validity: status allowed\":           orders[\"status\"].isin([\"paid\", \"refunded\", \"pending\"]),\n    \"consistency: customer exists\":       orders[\"customer_id\"].isin(customers[\"customer_id\"]),\n    \"timeliness: date not in future\":     orders[\"order_date\"] <= pd.Timestamp(\"2025-07-05\"),\n}\nfor name, passed in checks.items():\n    print(f\"{passed.mean():6.0%}  {name}\")",
   "note": "A pass rate per check turns “the data is bad” into “97% of emails are valid, 12% of orders reference unknown customers”.",
   "out": {
    "text": "   88%  completeness: customer_id not null\n   88%  completeness: email not null\n   75%  uniqueness: order_id\n   75%  validity: amount in 0..10,000,000\n   62%  validity: email format\n   88%  validity: status allowed\n   75%  consistency: customer exists\n   88%  timeliness: date not in future"
   }
  },
  {
   "h": "Accuracy needs a reference",
   "p": [
    "Accuracy can't be checked from the table alone: compare with a trusted source. Typical: reconcile daily revenue with the payment provider's settlement report, or row counts with the source database. A difference over a tolerance is an incident."
   ]
  },
  {
   "h": "Who decides the rules",
   "p": [
    "Rules come from the business: finance decides what counts as revenue, sales decides what a valid lead is. Data engineers implement and automate the checks, and agree with owners what happens on failure (block, warn, quarantine)."
   ]
  }
 ],
 "mistakes": [
  "Talking about “bad data” without measuring which dimension failed.",
  "Inventing validity rules without asking the data owner.",
  "Checking only nulls and duplicates, never accuracy against a source.",
  "Fixing bad values silently instead of reporting them."
 ],
 "practice": [
  {
   "q": "Normalise status casing and recompute the status validity rate.",
   "code": "fixed = orders[\"status\"].str.lower()\nprint(f\"before: {orders['status'].isin(['paid', 'refunded', 'pending']).mean():.0%}, after: {fixed.isin(['paid', 'refunded', 'pending']).mean():.0%}\")",
   "out": {
    "text": "before: 88%, after: 100%"
   }
  },
  {
   "q": "Which dimension fails? (a) the same invoice appears twice (b) phone numbers with letters (c) yesterday's sales not loaded by 9am (d) CRM says 120 customers, warehouse says 95",
   "a": "(a) uniqueness. (b) validity. (c) timeliness. (d) consistency/accuracy against the source (completeness of the load)."
  }
 ],
 "check": [
  [
   "Order references a customer that doesn't exist: which dimension?",
   [
    "Uniqueness",
    "Consistency (referential integrity)",
    "Timeliness",
    "Validity"
   ],
   1,
   "Across tables."
  ],
  [
   "How do you check accuracy?",
   [
    "Count nulls",
    "Compare with a trusted reference/source",
    "Look at it",
    "Sort it"
   ],
   1,
   "Reconciliation."
  ],
  [
   "Who defines business validity rules?",
   [
    "Only engineers",
    "The data owners/business, implemented by engineers",
    "Nobody",
    "The BI tool"
   ],
   1,
   "Agreed rules."
  ]
 ],
 "remember": [
  "Completeness, uniqueness, validity, consistency, accuracy, timeliness.",
  "Profile first, then write checks.",
  "Measure pass rates per check.",
  "Accuracy = reconcile with a trusted source.",
  "Owners define rules; engineers automate them."
 ]
};
L["data-quality:tests"] = {
 "title": "Writing data tests",
 "level": "Intermediate",
 "one": "Data tests are automated checks that run <b>every time data moves</b>. Write them as SQL (dbt tests), as schemas (pandera, Great Expectations) or as plain assertions, and decide for each: <b>fail the pipeline</b>, <b>warn</b>, or <b>quarantine bad rows</b>.",
 "why": "Without automated tests, bad data reaches dashboards and models silently. With them, problems are caught at the step that caused them.",
 "steps": [
  {
   "h": "Tests as SQL",
   "code": "import duckdb\ncon = duckdb.connect()\ncon.register(\"orders\", orders); con.register(\"customers\", customers)\ntests = {\n    \"unique order_id\":     \"SELECT order_id FROM orders GROUP BY order_id HAVING COUNT(*) > 1\",\n    \"not null customer\":   \"SELECT * FROM orders WHERE customer_id IS NULL\",\n    \"amount >= 0\":         \"SELECT * FROM orders WHERE amount < 0\",\n    \"known customer\":      \"SELECT o.* FROM orders o LEFT JOIN customers c USING (customer_id) \"\n                           \"WHERE o.customer_id IS NOT NULL AND c.customer_id IS NULL\",\n}\nfor name, sql in tests.items():\n    bad = len(con.sql(sql).fetchall())\n    print(f\"{'PASS' if bad == 0 else 'FAIL'}  {name:20} {bad} failing rows\")",
   "note": "Same idea as dbt tests: each query returns the bad rows; zero rows means pass.",
   "out": {
    "text": "FAIL  unique order_id      1 failing rows\nFAIL  not null customer    1 failing rows\nFAIL  amount >= 0          1 failing rows\nFAIL  known customer       1 failing rows"
   }
  },
  {
   "h": "Schema validation with pandera",
   "code": "import pandera.pandas as pa\n\nschema = pa.DataFrameSchema({\n    \"order_id\": pa.Column(int, unique=True),\n    \"customer_id\": pa.Column(float, nullable=False),\n    \"amount\": pa.Column(int, pa.Check.in_range(0, 10_000_000)),\n    \"status\": pa.Column(str, pa.Check.isin([\"paid\", \"refunded\", \"pending\"])),\n    \"order_date\": pa.Column(\"datetime64[ns]\", pa.Check.le(pd.Timestamp(\"2025-07-05\")), coerce=True),\n})\ntry:\n    schema.validate(orders, lazy=True)              # lazy: collect every failure, not just the first\nexcept pa.errors.SchemaErrors as err:\n    report = err.failure_cases[[\"column\", \"check\", \"index\"]]\n    print(report.to_string(index=False))",
   "out": {
    "text": "     column                                      check  index\n   order_id                           field_uniqueness      2\n   order_id                           field_uniqueness      3\ncustomer_id                               not_nullable      4\n     amount                      in_range(0, 10000000)      4\n     amount                      in_range(0, 10000000)      7\n     status      isin(['paid', 'refunded', 'pending'])      5\n order_date less_than_or_equal_to(2025-07-05 00:00:00)      7"
   }
  },
  {
   "h": "Fail, warn or quarantine",
   "p": [
    "Not every failure should stop the pipeline. Agree a policy per check: <b>block</b> (duplicate primary keys, money totals off), <b>warn</b> (a few invalid emails), or <b>quarantine</b> (move bad rows aside, load the good ones, report)."
   ],
   "code": "rules = {\n    \"negative_or_huge_amount\": ~orders[\"amount\"].between(0, 10_000_000),\n    \"missing_customer\":        orders[\"customer_id\"].isna(),\n    \"future_date\":             orders[\"order_date\"] > pd.Timestamp(\"2025-07-05\"),\n}\nbad_mask = pd.concat(rules, axis=1).any(axis=1)\nreasons = pd.concat(rules, axis=1).apply(lambda r: \",\".join(k for k, v in r.items() if v), axis=1)\nquarantine = orders[bad_mask].assign(reason=reasons[bad_mask])\ngood = orders[~bad_mask].drop_duplicates(\"order_id\")\n\nprint(f\"loaded {len(good)} rows, quarantined {len(quarantine)}:\")\nprint(quarantine[[\"order_id\", \"amount\", \"reason\"]].to_string(index=False))\nif len(quarantine) / len(orders) > 0.2:\n    print(\"BLOCK: more than 20% of rows are bad; stopping and alerting the owner\")",
   "note": "Quarantined rows go to a table with the reason and load time, so owners can fix them at the source.",
   "out": {
    "text": "loaded 5 rows, quarantined 2:\n order_id    amount                                   reason\n        5       -50 negative_or_huge_amount,missing_customer\n        8 120000000      negative_or_huge_amount,future_date\nBLOCK: more than 20% of rows are bad; stopping and alerting the owner"
   }
  },
  {
   "h": "Where to test",
   "code": "at ingestion (raw → staging)   schema, types, required fields, duplicates   → contract checks\nafter transformation (marts)   business rules, totals reconcile, relationships\nbefore publishing              row count vs yesterday, freshness, key metrics within range\nin CI                          dbt tests on sample data before merging model changes",
   "lang": "text"
  },
  {
   "h": "Tools",
   "code": "dbt tests             SQL tests next to models (most common in warehouses)\npandera               DataFrame schemas in Python (pandas, Polars, PySpark)\nGreat Expectations    expectation suites + data docs, many backends\nSoda                  checks in YAML (SodaCL) across warehouses\nDeequ / PyDeequ       Spark-scale constraint checks",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Tests that only run when someone remembers.",
  "Every check blocking (pipeline always red, people ignore it).",
  "Dropping bad rows silently instead of quarantining with reasons.",
  "Testing only staging, never the final business tables."
 ],
 "practice": [
  {
   "q": "Write a SQL test that fails when an order_date is in the future.",
   "code": "import duckdb\ncon = duckdb.connect(); con.register(\"orders\", orders)\nbad = con.sql(\"SELECT order_id, order_date FROM orders WHERE order_date > DATE '2025-07-05'\").fetchall()\nprint(\"FAIL\" if bad else \"PASS\", bad)",
   "out": {
    "text": "FAIL [(8, datetime.datetime(2031, 1, 1, 0, 0))]"
   }
  },
  {
   "q": "Add a pandera check that emails must contain '@' (nullable allowed), and validate only that column.",
   "code": "import pandera.pandas as pa\nschema = pa.DataFrameSchema({\"email\": pa.Column(str, pa.Check.str_contains(\"@\"), nullable=True)})\nprint(\"valid\" if schema.validate(orders[[\"email\"]]) is not None else \"invalid\")",
   "out": {
    "text": "valid"
   }
  }
 ],
 "check": [
  [
   "A SQL data test passes when it returns…",
   [
    "All rows",
    "0 rows",
    "1 row",
    "An error"
   ],
   1,
   "Query selects failures."
  ],
  [
   "Quarantine means…",
   [
    "Delete bad rows",
    "Load good rows, move bad ones aside with reasons",
    "Stop everything",
    "Ignore"
   ],
   1,
   "Keep going, report problems."
  ],
  [
   "Why lazy=True in pandera?",
   [
    "Faster",
    "Collect all failures instead of stopping at the first",
    "Skip checks",
    "Required"
   ],
   1,
   "Full report."
  ]
 ],
 "remember": [
  "Tests run automatically on every load.",
  "SQL tests, schemas (pandera/GE/Soda), assertions.",
  "Per check: block, warn or quarantine.",
  "Test at ingestion, after transforms, before publishing, in CI."
 ]
};
L["data-quality:contracts"] = {
 "title": "Data contracts",
 "level": "Intermediate",
 "one": "A <b>data contract</b> is an agreement between a data <b>producer</b> (an app team, a vendor feed) and its <b>consumers</b>: the schema, meanings, quality rules, freshness and how changes are announced. It's enforced in code at the boundary.",
 "why": "Most pipeline breakages are upstream changes nobody announced: a renamed column, a new status value, cents instead of rupees. Contracts make those changes explicit and catch them before they break dashboards.",
 "steps": [
  {
   "h": "What a contract contains",
   "code": "dataset: shop.orders                    owner: checkout-team (#checkout)   version: 2.1.0\nschema:\n  order_id      int      required, unique\n  customer_id   int      required\n  amount_paise  int      required, >= 0          # integer paise, not rupees\n  currency      string   required, in [INR, AED]\n  status        string   required, in [paid, refunded, pending]\n  created_at    timestamp UTC, required\nquality:     duplicates = 0; null customer_id = 0\nfreshness:   new data every hour, max 2h delay\nchanges:     additive changes (new optional column) → minor version, announce 1 week ahead\n             breaking (rename/remove/type change) → major version, 30 days, run both in parallel",
   "lang": "yaml"
  },
  {
   "h": "Enforcing a contract with pydantic",
   "code": "from datetime import datetime\nfrom typing import Literal\nfrom pydantic import BaseModel, Field, ValidationError, ConfigDict\n\nclass OrderV2(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")          # unknown fields are a contract change\n    order_id: int\n    customer_id: int\n    amount_paise: int = Field(ge=0)\n    currency: Literal[\"INR\", \"AED\"]\n    status: Literal[\"paid\", \"refunded\", \"pending\"]\n    created_at: datetime\n\nincoming = [\n    {\"order_id\": 1, \"customer_id\": 101, \"amount_paise\": 5500000, \"currency\": \"INR\", \"status\": \"paid\", \"created_at\": \"2025-07-05T10:00:00Z\"},\n    {\"order_id\": 2, \"customer_id\": 102, \"amount_paise\": 240000, \"currency\": \"INR\", \"status\": \"cancelled\", \"created_at\": \"2025-07-05T11:00:00Z\"},\n    {\"order_id\": 3, \"customer_id\": 103, \"amount\": 30.5, \"currency\": \"INR\", \"status\": \"paid\", \"created_at\": \"2025-07-05T12:00:00Z\"},\n]\nfor rec in incoming:\n    try:\n        OrderV2.model_validate(rec)\n        print(f\"order {rec['order_id']}: ok\")\n    except ValidationError as e:\n        problems = \"; \".join(f\"{'.'.join(map(str, x['loc']))}: {x['msg']}\" for x in e.errors())\n        print(f\"order {rec['order_id']}: CONTRACT VIOLATION -> {problems}\")",
   "note": "Order 2 uses a new status value; order 3 renamed <code>amount_paise</code> to <code>amount</code> in rupees. Both are caught at the door instead of silently corrupting revenue.",
   "out": {
    "text": "order 1: ok\norder 2: CONTRACT VIOLATION -> status: Input should be 'paid', 'refunded' or 'pending'\norder 3: CONTRACT VIOLATION -> amount_paise: Field required; amount: Extra inputs are not permitted"
   }
  },
  {
   "h": "Detecting schema changes automatically",
   "code": "expected = {\"order_id\": \"int\", \"customer_id\": \"int\", \"amount_paise\": \"int\", \"status\": \"str\"}\n\ndef schema_diff(expected, actual):\n    added = sorted(set(actual) - set(expected))\n    removed = sorted(set(expected) - set(actual))\n    changed = sorted(c for c in set(expected) & set(actual) if expected[c] != actual[c])\n    breaking = bool(removed or changed)\n    return {\"added\": added, \"removed\": removed, \"type_changed\": changed, \"breaking\": breaking}\n\ntoday = {\"order_id\": \"int\", \"customer_id\": \"str\", \"amount_paise\": \"int\", \"status\": \"str\", \"coupon\": \"str\"}\nprint(schema_diff(expected, today))",
   "note": "Added optional columns are usually safe; removed columns and type changes are breaking and should block the load and alert both teams.",
   "out": {
    "text": "{'added': ['coupon'], 'removed': [], 'type_changed': ['customer_id'], 'breaking': True}"
   }
  },
  {
   "h": "Making contracts work in practice",
   "p": [
    "Store contracts as YAML in Git next to the producer's code; run contract checks in the producer's CI (so they can't ship a breaking change by accident) and at ingestion; version them; and have a named owner on both sides. Start with your most important 3–5 datasets, not everything."
   ]
  }
 ],
 "mistakes": [
  "Contracts as a document nobody enforces.",
  "Allowing extra/unknown fields silently.",
  "Breaking changes without a version bump and a migration period.",
  "No owner on the producer side."
 ],
 "practice": [
  {
   "q": "Add a rule to OrderV2 that created_at can't be in the future, and test it.",
   "code": "from datetime import datetime, timezone\nfrom pydantic import BaseModel, field_validator, ValidationError\n\nclass Order(BaseModel):\n    order_id: int\n    created_at: datetime\n\n    @field_validator(\"created_at\")\n    @classmethod\n    def not_future(cls, v):\n        if v > datetime(2025, 7, 6, tzinfo=timezone.utc):\n            raise ValueError(\"created_at is in the future\")\n        return v\n\nfor ts in [\"2025-07-05T10:00:00Z\", \"2031-01-01T00:00:00Z\"]:\n    try:\n        Order(order_id=1, created_at=ts); print(ts, \"ok\")\n    except ValidationError as e:\n        print(ts, \"->\", e.errors()[0][\"msg\"])",
   "out": {
    "text": "2025-07-05T10:00:00Z ok\n2031-01-01T00:00:00Z -> Value error, created_at is in the future"
   }
  },
  {
   "q": "The checkout team wants to rename status 'paid' to 'captured'. Using a contract process, how should this roll out?",
   "a": "It's a breaking change (allowed values change): bump the contract major version, announce to consumers with a date, update consumers to accept both values (or map captured → paid) first, run both in parallel for the agreed period, then switch the producer, and finally remove the old value from the contract."
  }
 ],
 "check": [
  [
   "A data contract is between…",
   [
    "Two databases",
    "Data producers and consumers",
    "Engineers and HR",
    "Users"
   ],
   1,
   "Agreed interface."
  ],
  [
   "Which change is breaking?",
   [
    "New optional column",
    "Renaming a column",
    "More rows",
    "Faster delivery"
   ],
   1,
   "Consumers break."
  ],
  [
   "Why extra='forbid'?",
   [
    "Speed",
    "Unknown fields signal an unannounced change",
    "Required by pydantic",
    "Security only"
   ],
   1,
   "Detect drift."
  ]
 ],
 "remember": [
  "Contract = schema + meanings + quality + freshness + change process + owners.",
  "Enforce in code at the boundary (and in producer CI).",
  "Detect schema drift; block breaking changes.",
  "Version contracts; parallel-run breaking changes."
 ]
};
L["data-quality:monitoring"] = {
 "title": "Data observability and monitoring",
 "level": "Intermediate",
 "one": "Tests catch known problems; <b>observability</b> catches unknown ones by watching <b>freshness</b>, <b>volume</b>, <b>schema</b>, <b>distribution</b> and <b>lineage</b> of every important table, alerting when something looks unusual.",
 "why": "The worst data incidents are silent: a pipeline “succeeds” with half the rows. Monitoring finds them before business users do.",
 "steps": [
  {
   "h": "The five pillars",
   "code": "freshness      when was the table last updated?            orders updated 7h ago (SLA 2h)  → alert\nvolume         how many rows arrived?                      12,000 today vs ~50,000 usual    → alert\nschema         did columns/types change?                   column 'amount' became string    → alert\ndistribution   do values look normal?                      null rate of email 2% → 40%      → alert\nlineage        what's upstream/downstream?                 which dashboards are affected?",
   "lang": "text"
  },
  {
   "h": "Freshness checks",
   "code": "from datetime import datetime, timedelta\n\ntables = {   # table: (last_loaded_at, freshness SLA)\n    \"raw.shop_orders\":     (datetime(2025, 7, 5, 8, 40), timedelta(hours=2)),\n    \"marts.daily_revenue\": (datetime(2025, 7, 5, 3, 10), timedelta(hours=26)),\n    \"raw.crm_contacts\":    (datetime(2025, 7, 4, 22, 0), timedelta(hours=6)),\n}\nnow = datetime(2025, 7, 5, 9, 30)\nfor name, (loaded, sla) in tables.items():\n    age = now - loaded\n    status = \"OK\" if age <= sla else \"STALE\"\n    print(f\"{status:5}  {name:22} age {age.total_seconds() / 3600:4.1f}h  (SLA {sla.total_seconds() / 3600:.0f}h)\")",
   "out": {
    "text": "OK     raw.shop_orders        age  0.8h  (SLA 2h)\nOK     marts.daily_revenue    age  6.3h  (SLA 26h)\nSTALE  raw.crm_contacts       age 11.5h  (SLA 6h)"
   }
  },
  {
   "h": "Volume and distribution anomalies",
   "code": "import pandas as pd\n\nhistory = pd.DataFrame({\n    \"day\": pd.date_range(\"2025-06-21\", periods=14),\n    \"rows\": [50120, 49800, 51200, 50500, 48700, 39100, 38800, 50900, 50300, 51000, 49900, 49200, 38500, 38900],\n    \"null_email_rate\": [0.020, 0.021, 0.019, 0.022, 0.020, 0.018, 0.019, 0.021, 0.020, 0.022, 0.019, 0.020, 0.018, 0.019],\n})\nhistory[\"weekday\"] = history[\"day\"].dt.dayofweek\n\ndef check(day, rows, null_rate):\n    same_weekday = history[history[\"weekday\"] == pd.Timestamp(day).dayofweek][\"rows\"]   # weekends are lower\n    expected = same_weekday.mean()\n    alerts = []\n    if abs(rows - expected) / expected > 0.25:\n        alerts.append(f\"volume {rows:,} vs expected ~{expected:,.0f}\")\n    if null_rate > history[\"null_email_rate\"].mean() * 3:\n        alerts.append(f\"null email rate {null_rate:.0%} vs usual {history['null_email_rate'].mean():.0%}\")\n    return alerts or [\"ok\"]\n\nprint(\"2025-07-05 (Sat):\", check(\"2025-07-05\", 38700, 0.02))\nprint(\"2025-07-07 (Mon):\", check(\"2025-07-07\", 24100, 0.02))\nprint(\"2025-07-08 (Tue):\", check(\"2025-07-08\", 50200, 0.38))",
   "note": "Comparing with the same weekday avoids false alarms on normal weekend dips; a sudden jump in null emails catches a broken upstream form even though row counts look fine.",
   "out": {
    "text": "2025-07-05 (Sat): ['ok']\n2025-07-07 (Mon): ['volume 24,100 vs expected ~51,100']\n2025-07-08 (Tue): ['null email rate 38% vs usual 2%']"
   }
  },
  {
   "h": "Incident response for data",
   "code": "1 detect     alert with table, check, numbers, link to run logs\n2 assess     what's affected downstream (lineage)? who uses it?\n3 contain    stop downstream jobs / mark dashboard \"data delayed\"\n4 fix        re-run, backfill, or fix the source with the owner\n5 tell       notify consumers: what happened, impact, when fixed\n6 learn      short postmortem; add a test/monitor so it can't recur silently",
   "lang": "text"
  },
  {
   "h": "Tools",
   "p": [
    "Elementary (dbt-native, open source), Monte Carlo, Bigeye, Metaplane, Soda, Datadog data monitors. Many teams start with dbt source freshness + a few volume tests + Slack alerts, which covers most incidents."
   ]
  }
 ],
 "mistakes": [
  "Alerting only on job failure (successful jobs can load wrong data).",
  "Static thresholds that ignore weekly patterns (alert fatigue).",
  "Alerts without an owner or a runbook.",
  "Not telling data consumers during incidents."
 ],
 "practice": [
  {
   "q": "Write a schema-drift check comparing yesterday's and today's column types.",
   "code": "yesterday = {\"order_id\": \"int64\", \"amount\": \"int64\", \"status\": \"object\"}\ntoday = {\"order_id\": \"int64\", \"amount\": \"object\", \"status\": \"object\", \"channel\": \"object\"}\nfor col in sorted(set(yesterday) | set(today)):\n    a, b = yesterday.get(col), today.get(col)\n    if a != b:\n        print(f\"{col}: {a} -> {b}\")",
   "out": {
    "text": "amount: int64 -> object\nchannel: None -> object"
   }
  },
  {
   "q": "Revenue on the dashboard dropped 40% today. Walk through your first 4 steps.",
   "a": "1) Check freshness/volume of the revenue mart and its sources: did all data arrive? 2) Use lineage to find which upstream table changed (row counts, schema, null rates). 3) If it's a data issue, mark the dashboard as delayed and tell the stakeholders. 4) Fix (re-run/backfill or source fix with the owner), verify against a trusted reference, then write a short postmortem and add a monitor."
  }
 ],
 "check": [
  [
   "A job succeeded but loaded half the rows. What catches it?",
   [
    "Retries",
    "Volume monitoring",
    "Unit tests",
    "Logs only"
   ],
   1,
   "Silent failure."
  ],
  [
   "Why compare with the same weekday?",
   [
    "Tradition",
    "Weekly patterns cause false alarms otherwise",
    "Faster",
    "Required"
   ],
   1,
   "Seasonality."
  ],
  [
   "Lineage helps during incidents by…",
   [
    "Fixing data",
    "Showing what's downstream and affected",
    "Speeding queries",
    "Encrypting"
   ],
   1,
   "Impact analysis."
  ]
 ],
 "remember": [
  "Freshness, volume, schema, distribution, lineage.",
  "Account for seasonality in thresholds.",
  "Detect → assess → contain → fix → tell → learn.",
  "Start simple: freshness + volume + key tests + Slack."
 ]
};
L["data-quality:lineage-privacy"] = {
 "title": "Lineage, governance and privacy",
 "level": "Intermediate",
 "one": "<b>Lineage</b> shows where data comes from and where it flows. <b>Governance</b> defines owners, definitions and access. <b>Privacy</b> protects personal data (PII): collect less, mask or pseudonymise it, restrict access, and delete it on request (DPDP Act, GDPR).",
 "why": "Regulations carry heavy fines, and customers trust companies that handle their data well. Data engineers build the pipes, so they implement most of these controls.",
 "steps": [
  {
   "h": "Lineage",
   "code": "from graphlib import TopologicalSorter\n\nlineage = {     # table: its inputs\n    \"staging.orders\": {\"raw.shop_orders\"},\n    \"staging.customers\": {\"raw.crm_contacts\"},\n    \"marts.fct_orders\": {\"staging.orders\", \"staging.customers\"},\n    \"marts.daily_revenue\": {\"marts.fct_orders\"},\n    \"dash.exec_kpis\": {\"marts.daily_revenue\"},\n    \"ml.churn_features\": {\"marts.fct_orders\"},\n}\n\ndef downstream(table):\n    found, todo = set(), [table]\n    while todo:\n        t = todo.pop()\n        for child, parents in lineage.items():\n            if t in parents and child not in found:\n                found.add(child); todo.append(child)\n    return sorted(found)\n\nprint(\"if raw.crm_contacts breaks, affected:\", downstream(\"raw.crm_contacts\"))\nprint(\"build order:\", list(TopologicalSorter(lineage).static_order()))",
   "note": "dbt docs, OpenLineage/Marquez, DataHub, Unity Catalog and cloud catalogs build this graph automatically from your pipelines.",
   "out": {
    "text": "if raw.crm_contacts breaks, affected: ['dash.exec_kpis', 'marts.daily_revenue', 'marts.fct_orders', 'ml.churn_features', 'staging.customers']\nbuild order: ['raw.shop_orders', 'raw.crm_contacts', 'staging.orders', 'staging.customers', 'marts.fct_orders', 'marts.daily_revenue', 'ml.churn_features', 'dash.exec_kpis']"
   }
  },
  {
   "h": "Classify and protect PII",
   "p": [
    "Tag columns by sensitivity (public, internal, confidential, PII). For PII choose: <b>drop</b> (don't collect it), <b>mask</b> (show partially), <b>pseudonymise</b> (replace with a keyed hash so joins still work), or <b>encrypt</b>, plus restricted access."
   ],
   "code": "import hmac, hashlib, re\n\nSECRET = b\"rotate-me-from-a-secrets-manager\"      # never hardcode in real code\n\ndef pseudonymise(value: str) -> str:              # same input → same token, can't be reversed without the key\n    return hmac.new(SECRET, value.lower().encode(), hashlib.sha256).hexdigest()[:16]\n\ndef mask_email(email: str) -> str:\n    user, domain = email.split(\"@\")\n    return f\"{user[0]}***@{domain}\"\n\ndef mask_phone(phone: str) -> str:\n    digits = re.sub(r\"\\D\", \"\", phone)\n    return \"*\" * (len(digits) - 4) + digits[-4:]\n\nrows = [(\"asha@example.com\", \"+91 98470 12345\"), (\"Asha@Example.com\", \"+91 98470 12345\"), (\"ben@example.com\", \"+971 50 123 4567\")]\nfor email, phone in rows:\n    print(f\"{pseudonymise(email)}  {mask_email(email):20}  {mask_phone(phone)}\")",
   "note": "Both Asha rows get the same token, so analysts can still count unique customers and join tables without ever seeing the email.",
   "out": {
    "text": "da29be86ee2be0d5  a***@example.com      ********2345\nda29be86ee2be0d5  A***@Example.com      ********2345\ndbb853e5e79340ed  b***@example.com      ********4567"
   }
  },
  {
   "h": "Access control",
   "code": "-- role-based access: analysts see masked PII, the support team sees it in full\nCREATE MASKING POLICY email_mask AS (val STRING) RETURNS STRING ->\n  CASE WHEN CURRENT_ROLE() IN ('SUPPORT') THEN val\n       ELSE REGEXP_REPLACE(val, '^.(.*)@', '*@') END;            -- Snowflake\nALTER TABLE marts.dim_customers MODIFY COLUMN email SET MASKING POLICY email_mask;\n\n-- row-level security: regional managers see only their region\nCREATE ROW ACCESS POLICY region_rls AS (region STRING) RETURNS BOOLEAN ->\n  region = CURRENT_SESSION_REGION() OR IS_ROLE_IN_SESSION('ADMIN');\n\nGRANT SELECT ON ALL TABLES IN SCHEMA marts TO ROLE analyst;    -- least privilege per schema",
   "lang": "sql"
  },
  {
   "h": "Deletion requests and retention",
   "p": [
    "Laws like India's DPDP Act and the EU GDPR give people rights to access and erase their data. Keep a registry of where each person's data lives (lineage helps), use table formats that support deletes (Delta/Iceberg), delete across raw → marts → backups within the deadline, and set retention periods so data isn't kept forever."
   ],
   "code": "import duckdb\ncon = duckdb.connect()\ncon.execute(\"CREATE TABLE raw_orders AS SELECT * FROM (VALUES (1, 'asha@example.com', 500), (2, 'ben@example.com', 900)) t(id, email, amount)\")\ncon.execute(\"CREATE TABLE fct_orders AS SELECT id, md5(email) AS customer_token, amount FROM raw_orders\")\ncon.execute(\"CREATE TABLE erasure_log (token TEXT, requested_at DATE, tables TEXT)\")\n\ndef erase(email, requested_at):\n    token = con.sql(f\"SELECT md5('{email}')\").fetchall()[0][0]\n    con.execute(\"BEGIN\")\n    con.execute(\"DELETE FROM raw_orders WHERE email = ?\", [email])\n    con.execute(\"DELETE FROM fct_orders WHERE customer_token = ?\", [token])\n    con.execute(\"INSERT INTO erasure_log VALUES (?, ?, 'raw_orders,fct_orders')\", [token, requested_at])\n    con.execute(\"COMMIT\")\n\nerase(\"asha@example.com\", \"2025-07-05\")\nprint(con.sql(\"SELECT COUNT(*) FROM raw_orders\").fetchall(), con.sql(\"SELECT COUNT(*) FROM fct_orders\").fetchall())\nprint(con.sql(\"SELECT tables FROM erasure_log\").fetchall())",
   "note": "The log keeps proof of the deletion without keeping the email itself.",
   "out": {
    "text": "[(1,)] [(1,)]\n[('raw_orders,fct_orders',)]"
   }
  }
 ],
 "mistakes": [
  "Copying raw PII into every table and every dev environment.",
  "Plain unsalted hashes of emails (easy to reverse with a dictionary).",
  "No record of where personal data lives, so deletion requests can't be completed.",
  "Granting analysts access to everything “for convenience”."
 ],
 "practice": [
  {
   "q": "Using the lineage dict, what's affected if marts.fct_orders is wrong?",
   "code": "lineage = {\"marts.daily_revenue\": {\"marts.fct_orders\"}, \"dash.exec_kpis\": {\"marts.daily_revenue\"},\n           \"ml.churn_features\": {\"marts.fct_orders\"}, \"marts.fct_orders\": {\"staging.orders\"}}\nfound, todo = set(), [\"marts.fct_orders\"]\nwhile todo:\n    t = todo.pop()\n    for child, parents in lineage.items():\n        if t in parents and child not in found:\n            found.add(child); todo.append(child)\nprint(sorted(found))",
   "out": {
    "text": "['dash.exec_kpis', 'marts.daily_revenue', 'ml.churn_features']"
   }
  },
  {
   "q": "An analyst needs to count repeat customers but shouldn't see emails or phone numbers. Propose a design.",
   "a": "Provide a customer dimension with a pseudonymised customer key (HMAC of the email with a secret held by the platform team), no raw email/phone columns in the analyst schema (or masking policies), and grant the analyst role only that schema. They can count and join by the token without seeing PII."
  }
 ],
 "check": [
  [
   "Pseudonymisation with HMAC lets you…",
   [
    "Read emails",
    "Join and count by person without seeing PII",
    "Delete data",
    "Speed up queries"
   ],
   1,
   "Stable keyed token."
  ],
  [
   "Why not plain md5(email)?",
   [
    "Too slow",
    "Easy to reverse by hashing known emails",
    "Not unique",
    "Not SQL"
   ],
   1,
   "Use a secret key."
  ],
  [
   "To honour a deletion request you need…",
   [
    "Luck",
    "To know where the person's data lives (lineage/registry) and delete everywhere",
    "Only delete raw",
    "Only delete backups"
   ],
   1,
   "Every copy."
  ]
 ],
 "remember": [
  "Lineage for impact analysis and audits.",
  "Classify columns; drop, mask, pseudonymise (HMAC), encrypt PII.",
  "Masking policies, row-level security, least-privilege grants.",
  "Deletion requests + retention, with a log."
 ]
};
L["data-quality:build"] = {
 "title": "Project: a data quality gate",
 "level": "Project",
 "one": "Build a reusable <b>quality gate</b> that sits between staging and marts: it validates a batch against a contract, quarantines bad rows with reasons, checks volume and freshness, writes a report, and decides <b>pass / warn / block</b>.",
 "why": "A quality gate with clear policies is something every data team needs, and it shows you can turn quality ideas into working, tested code.",
 "steps": [
  {
   "h": "The gate",
   "code": "from dataclasses import dataclass, field\n\n@dataclass\nclass GateResult:\n    status: str\n    loaded: int\n    quarantined: int\n    findings: list = field(default_factory=list)\n\nROW_RULES = {\n    \"order_id duplicated\": lambda d: d[\"order_id\"].duplicated(keep=\"first\"),\n    \"customer_id missing\": lambda d: d[\"customer_id\"].isna(),\n    \"amount out of range\": lambda d: ~d[\"amount\"].between(0, 10_000_000),\n    \"status not allowed\":  lambda d: ~d[\"status\"].str.lower().isin([\"paid\", \"refunded\", \"pending\"]),\n    \"date in future\":      lambda d: d[\"order_date\"] > pd.Timestamp(\"2025-07-05\"),\n}\n\ndef quality_gate(batch, expected_rows, max_bad_ratio=0.2, min_volume_ratio=0.5):\n    flags = pd.DataFrame({name: rule(batch) for name, rule in ROW_RULES.items()})\n    bad = flags.any(axis=1)\n    findings = [f\"{name}: {int(flags[name].sum())} rows\" for name in flags if flags[name].any()]\n    good = batch[~bad].assign(status=lambda d: d[\"status\"].str.lower())\n    status = \"pass\"\n    if findings:\n        status = \"warn\"\n    if bad.mean() > max_bad_ratio:\n        status = \"block\"; findings.append(f\"bad ratio {bad.mean():.0%} > {max_bad_ratio:.0%}\")\n    if len(batch) < expected_rows * min_volume_ratio:\n        status = \"block\"; findings.append(f\"volume {len(batch)} < {min_volume_ratio:.0%} of expected {expected_rows}\")\n    return GateResult(status, len(good) if status != \"block\" else 0, int(bad.sum()), findings), good\n\nresult, good = quality_gate(orders, expected_rows=8, max_bad_ratio=0.5)\nprint(\"status:\", result.status, \"| loaded:\", result.loaded, \"| quarantined:\", result.quarantined)\nfor f in result.findings:\n    print(\"  -\", f)\nprint(good[[\"order_id\", \"customer_id\", \"amount\", \"status\"]].to_string(index=False))\n\nstrict, _ = quality_gate(orders, expected_rows=8)                 # default 20% tolerance\nprint(\"\\nwith default tolerance:\", strict.status, strict.findings[-1])",
   "note": "Order 7 (customer 999) passes the row rules but isn't a known customer: add a consistency rule against the customer table as an exercise.",
   "out": {
    "text": "status: warn | loaded: 5 | quarantined: 3\n  - order_id duplicated: 1 rows\n  - customer_id missing: 1 rows\n  - amount out of range: 2 rows\n  - date in future: 1 rows\n order_id  customer_id  amount   status\n        1        101.0   55000     paid\n        2        101.0    2400     paid\n        3        102.0    9200 refunded\n        6        104.0    3600     paid\n        7        999.0     700     paid\n\nwith default tolerance: block bad ratio 38% > 20%"
   }
  },
  {
   "h": "Tests for the gate",
   "code": "import pandas as pd\n\ndef gate(df, max_bad=0.2):\n    bad = df[\"amount\"].lt(0) | df[\"order_id\"].duplicated()\n    if bad.mean() > max_bad:\n        return \"block\", 0\n    return (\"warn\" if bad.any() else \"pass\"), int((~bad).sum())\n\ndef make(amounts, ids=None):\n    return pd.DataFrame({\"order_id\": ids or list(range(len(amounts))), \"amount\": amounts})\n\ndef test_clean_batch_passes():\n    assert gate(make([10, 20, 30])) == (\"pass\", 3)\n\ndef test_few_bad_rows_warn_and_load_good_rows():\n    assert gate(make([10, 20, 30, 40, 50, 60, -1])) == (\"warn\", 6)\n\ndef test_many_bad_rows_block():\n    assert gate(make([-1, -2, 30])) == (\"block\", 0)\n\ndef test_duplicates_count_as_bad():\n    assert gate(make([10, 10, 10, 10, 10, 10], ids=[1, 1, 2, 3, 4, 5])) == (\"warn\", 5)",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.23s"
   }
  },
  {
   "h": "Wiring it into the pipeline",
   "code": "extract → staging ──► quality_gate ──pass──► build marts ──► publish\n                               ├─warn──► build marts + Slack summary with findings\n                               └─block─► stop, alert owner, dashboard shows \"data delayed\"\nquarantine table: qa.quarantine_orders(order_id, reason, batch_id, loaded_at)\nreport table:     qa.gate_runs(batch_id, status, loaded, quarantined, findings, run_at)",
   "lang": "text"
  },
  {
   "h": "Portfolio checklist",
   "p": [
    "Show the contract YAML, the gate code with tests, a sample report from a bad batch, and a small dashboard of gate results over time (pass/warn/block per day, top failing rules). Explain one policy decision, e.g. why 20% bad rows blocks."
   ]
  }
 ],
 "mistakes": [
  "A gate that only logs and never blocks.",
  "Blocking on every warning-level issue.",
  "Quarantine with no reason column, so nobody can fix the source."
 ],
 "practice": [
  {
   "q": "Add the missing consistency rule: customer_id must exist in customers.",
   "code": "rule = ~orders[\"customer_id\"].isin(customers[\"customer_id\"]) & orders[\"customer_id\"].notna()\nprint(\"unknown customers:\", orders.loc[rule, [\"order_id\", \"customer_id\"]].to_dict(\"records\"))",
   "out": {
    "text": "unknown customers: [{'order_id': 7, 'customer_id': 999.0}]"
   }
  },
  {
   "q": "Finance says any batch where total paid revenue differs from the payment provider report by more than 0.5% must block. Where does this check go and how do you implement it?",
   "a": "After building the revenue mart (or on the staging batch), before publishing: compute SUM(amount) for paid orders for the batch's date, fetch the provider's settlement total for the same date, and block if abs(diff)/provider_total > 0.005. Record both numbers in the gate report and alert finance and the data owner."
  }
 ],
 "check": [
  [
   "What should the gate do with a few bad rows?",
   [
    "Block always",
    "Quarantine them, load the rest, warn",
    "Ignore",
    "Delete the table"
   ],
   1,
   "Proportionate response."
  ],
  [
   "Why record findings per run?",
   [
    "Disk usage",
    "Trend quality over time and give owners evidence",
    "Required by pandas",
    "Speed"
   ],
   1,
   "Visibility."
  ],
  [
   "A volume rule protects against…",
   [
    "Typos",
    "Partial/missing loads",
    "Bad emails",
    "Duplicates"
   ],
   1,
   "Silent upstream failures."
  ]
 ],
 "remember": [
  "Gate = contract rules + quarantine + volume/freshness + policy.",
  "pass / warn / block with clear thresholds.",
  "Quarantine and report tables with reasons.",
  "Unit-test the gate's decisions."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
