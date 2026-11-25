// Data Quality & Governance. Examples run with pandas, DuckDB, pandera and pydantic.
const ORDERS = String.raw`
import warnings; warnings.filterwarnings("ignore")
import pandas as pd
orders = pd.DataFrame({
    "order_id":    [1, 2, 3, 3, 5, 6, 7, 8],
    "customer_id": [101, 101, 102, 102, None, 104, 999, 103],
    "email":       ["asha@x.com", "asha@x.com", "ben@x", "ben@x", "chen@x.com", None, "omar@x.com", "divya@x.com"],
    "amount":      [55000, 2400, 9200, 9200, -50, 3600, 700, 120000000],
    "status":      ["paid", "paid", "refunded", "refunded", "paid", "PAID", "paid", "paid"],
    "order_date":  pd.to_datetime(["2025-07-01", "2025-07-02", "2025-07-02", "2025-07-02", "2025-07-03",
                                   "2025-07-03", "2025-07-04", "2031-01-01"]),
})
customers = pd.DataFrame({"customer_id": [101, 102, 103, 104], "name": ["Asha", "Ben", "Chen", "Divya"]})
`;

module.exports = [
{
 id: "dimensions",
 title: "Data quality dimensions",
 level: "Intermediate",
 one: "“Good data” has measurable <b>dimensions</b>: <b>completeness</b> (no missing values), <b>uniqueness</b> (no duplicates), <b>validity</b> (right format/range), <b>consistency</b> (agrees across tables), <b>accuracy</b> (matches reality) and <b>timeliness</b> (fresh enough).",
 why: "Bad data costs money and trust: wrong invoices, wrong forecasts, wrong AI answers. Naming the dimensions lets you measure quality instead of arguing about it.",
 steps: [
  { h: "The dimensions",
    code: `dimension      question                                   example check
completeness   is anything missing?                       customer_id not null
uniqueness     is anything duplicated?                    order_id unique
validity       does it follow the rules?                  amount >= 0, email has @, status in (...)
consistency    does it agree with other data?             every order's customer exists
accuracy       does it match reality / the source?        revenue = payment provider's total
timeliness     is it fresh enough?                        loaded within 2 hours of midnight`, lang: "text" },
  { h: "Profile a table",
    pre: ORDERS,
    code: `profile = pd.DataFrame({
    "nulls": orders.isna().sum(),
    "distinct": orders.nunique(),
    "example": orders.iloc[0],
})
print(profile.to_string())
print("\\nduplicate order_ids:", orders["order_id"].duplicated().sum())
print("amount range:", orders["amount"].min(), "to", orders["amount"].max())
print("status values:", sorted(orders["status"].unique()))`,
    note: "Profiling first shows what to test: a null customer, a duplicate order, a negative and an absurd amount, inconsistent status casing and an order dated 2031." },
  { h: "Score each dimension",
    pre: ORDERS,
    code: `checks = {
    "completeness: customer_id not null": orders["customer_id"].notna(),
    "completeness: email not null":       orders["email"].notna(),
    "uniqueness: order_id":               ~orders["order_id"].duplicated(keep=False),
    "validity: amount in 0..10,000,000":  orders["amount"].between(0, 10_000_000),
    "validity: email format":             orders["email"].fillna("").str.match(r"^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$"),
    "validity: status allowed":           orders["status"].isin(["paid", "refunded", "pending"]),
    "consistency: customer exists":       orders["customer_id"].isin(customers["customer_id"]),
    "timeliness: date not in future":     orders["order_date"] <= pd.Timestamp("2025-07-05"),
}
for name, passed in checks.items():
    print(f"{passed.mean():6.0%}  {name}")`,
    note: "A pass rate per check turns “the data is bad” into “97% of emails are valid, 12% of orders reference unknown customers”." },
  { h: "Accuracy needs a reference",
    p: ["Accuracy can't be checked from the table alone: compare with a trusted source. Typical: reconcile daily revenue with the payment provider's settlement report, or row counts with the source database. A difference over a tolerance is an incident."] },
  { h: "Who decides the rules",
    p: ["Rules come from the business: finance decides what counts as revenue, sales decides what a valid lead is. Data engineers implement and automate the checks, and agree with owners what happens on failure (block, warn, quarantine)."] }
 ],
 mistakes: [
  "Talking about “bad data” without measuring which dimension failed.",
  "Inventing validity rules without asking the data owner.",
  "Checking only nulls and duplicates, never accuracy against a source.",
  "Fixing bad values silently instead of reporting them."
 ],
 practice: [
  { q: "Normalise status casing and recompute the status validity rate.", pre: ORDERS, code: `fixed = orders["status"].str.lower()
print(f"before: {orders['status'].isin(['paid', 'refunded', 'pending']).mean():.0%}, after: {fixed.isin(['paid', 'refunded', 'pending']).mean():.0%}")` },
  { q: "Which dimension fails? (a) the same invoice appears twice (b) phone numbers with letters (c) yesterday's sales not loaded by 9am (d) CRM says 120 customers, warehouse says 95", a: "(a) uniqueness. (b) validity. (c) timeliness. (d) consistency/accuracy against the source (completeness of the load)." }
 ],
 check: [
  ["Order references a customer that doesn't exist: which dimension?", ["Uniqueness", "Consistency (referential integrity)", "Timeliness", "Validity"], 1, "Across tables."],
  ["How do you check accuracy?", ["Count nulls", "Compare with a trusted reference/source", "Look at it", "Sort it"], 1, "Reconciliation."],
  ["Who defines business validity rules?", ["Only engineers", "The data owners/business, implemented by engineers", "Nobody", "The BI tool"], 1, "Agreed rules."]
 ],
 remember: [
  "Completeness, uniqueness, validity, consistency, accuracy, timeliness.",
  "Profile first, then write checks.",
  "Measure pass rates per check.",
  "Accuracy = reconcile with a trusted source.",
  "Owners define rules; engineers automate them."
 ]
},
{
 id: "tests",
 title: "Writing data tests",
 level: "Intermediate",
 one: "Data tests are automated checks that run <b>every time data moves</b>. Write them as SQL (dbt tests), as schemas (pandera, Great Expectations) or as plain assertions, and decide for each: <b>fail the pipeline</b>, <b>warn</b>, or <b>quarantine bad rows</b>.",
 why: "Without automated tests, bad data reaches dashboards and models silently. With them, problems are caught at the step that caused them.",
 steps: [
  { h: "Tests as SQL",
    pre: ORDERS,
    code: `import duckdb
con = duckdb.connect()
con.register("orders", orders); con.register("customers", customers)
tests = {
    "unique order_id":     "SELECT order_id FROM orders GROUP BY order_id HAVING COUNT(*) > 1",
    "not null customer":   "SELECT * FROM orders WHERE customer_id IS NULL",
    "amount >= 0":         "SELECT * FROM orders WHERE amount < 0",
    "known customer":      "SELECT o.* FROM orders o LEFT JOIN customers c USING (customer_id) "
                           "WHERE o.customer_id IS NOT NULL AND c.customer_id IS NULL",
}
for name, sql in tests.items():
    bad = len(con.sql(sql).fetchall())
    print(f"{'PASS' if bad == 0 else 'FAIL'}  {name:20} {bad} failing rows")`,
    note: "Same idea as dbt tests: each query returns the bad rows; zero rows means pass." },
  { h: "Schema validation with pandera",
    pre: ORDERS,
    code: `import pandera.pandas as pa

schema = pa.DataFrameSchema({
    "order_id": pa.Column(int, unique=True),
    "customer_id": pa.Column(float, nullable=False),
    "amount": pa.Column(int, pa.Check.in_range(0, 10_000_000)),
    "status": pa.Column(str, pa.Check.isin(["paid", "refunded", "pending"])),
    "order_date": pa.Column("datetime64[ns]", pa.Check.le(pd.Timestamp("2025-07-05")), coerce=True),
})
try:
    schema.validate(orders, lazy=True)              # lazy: collect every failure, not just the first
except pa.errors.SchemaErrors as err:
    report = err.failure_cases[["column", "check", "index"]]
    print(report.to_string(index=False))` },
  { h: "Fail, warn or quarantine",
    p: ["Not every failure should stop the pipeline. Agree a policy per check: <b>block</b> (duplicate primary keys, money totals off), <b>warn</b> (a few invalid emails), or <b>quarantine</b> (move bad rows aside, load the good ones, report)."],
    pre: ORDERS,
    code: `rules = {
    "negative_or_huge_amount": ~orders["amount"].between(0, 10_000_000),
    "missing_customer":        orders["customer_id"].isna(),
    "future_date":             orders["order_date"] > pd.Timestamp("2025-07-05"),
}
bad_mask = pd.concat(rules, axis=1).any(axis=1)
reasons = pd.concat(rules, axis=1).apply(lambda r: ",".join(k for k, v in r.items() if v), axis=1)
quarantine = orders[bad_mask].assign(reason=reasons[bad_mask])
good = orders[~bad_mask].drop_duplicates("order_id")

print(f"loaded {len(good)} rows, quarantined {len(quarantine)}:")
print(quarantine[["order_id", "amount", "reason"]].to_string(index=False))
if len(quarantine) / len(orders) > 0.2:
    print("BLOCK: more than 20% of rows are bad; stopping and alerting the owner")`,
    note: "Quarantined rows go to a table with the reason and load time, so owners can fix them at the source." },
  { h: "Where to test",
    code: `at ingestion (raw → staging)   schema, types, required fields, duplicates   → contract checks
after transformation (marts)   business rules, totals reconcile, relationships
before publishing              row count vs yesterday, freshness, key metrics within range
in CI                          dbt tests on sample data before merging model changes`, lang: "text" },
  { h: "Tools",
    code: `dbt tests             SQL tests next to models (most common in warehouses)
pandera               DataFrame schemas in Python (pandas, Polars, PySpark)
Great Expectations    expectation suites + data docs, many backends
Soda                  checks in YAML (SodaCL) across warehouses
Deequ / PyDeequ       Spark-scale constraint checks`, lang: "text" }
 ],
 mistakes: [
  "Tests that only run when someone remembers.",
  "Every check blocking (pipeline always red, people ignore it).",
  "Dropping bad rows silently instead of quarantining with reasons.",
  "Testing only staging, never the final business tables."
 ],
 practice: [
  { q: "Write a SQL test that fails when an order_date is in the future.", pre: ORDERS, code: `import duckdb
con = duckdb.connect(); con.register("orders", orders)
bad = con.sql("SELECT order_id, order_date FROM orders WHERE order_date > DATE '2025-07-05'").fetchall()
print("FAIL" if bad else "PASS", bad)` },
  { q: "Add a pandera check that emails must contain '@' (nullable allowed), and validate only that column.", pre: ORDERS, code: `import pandera.pandas as pa
schema = pa.DataFrameSchema({"email": pa.Column(str, pa.Check.str_contains("@"), nullable=True)})
print("valid" if schema.validate(orders[["email"]]) is not None else "invalid")` }
 ],
 check: [
  ["A SQL data test passes when it returns…", ["All rows", "0 rows", "1 row", "An error"], 1, "Query selects failures."],
  ["Quarantine means…", ["Delete bad rows", "Load good rows, move bad ones aside with reasons", "Stop everything", "Ignore"], 1, "Keep going, report problems."],
  ["Why lazy=True in pandera?", ["Faster", "Collect all failures instead of stopping at the first", "Skip checks", "Required"], 1, "Full report."]
 ],
 remember: [
  "Tests run automatically on every load.",
  "SQL tests, schemas (pandera/GE/Soda), assertions.",
  "Per check: block, warn or quarantine.",
  "Test at ingestion, after transforms, before publishing, in CI."
 ]
},
{
 id: "contracts",
 title: "Data contracts",
 level: "Intermediate",
 one: "A <b>data contract</b> is an agreement between a data <b>producer</b> (an app team, a vendor feed) and its <b>consumers</b>: the schema, meanings, quality rules, freshness and how changes are announced. It's enforced in code at the boundary.",
 why: "Most pipeline breakages are upstream changes nobody announced: a renamed column, a new status value, cents instead of rupees. Contracts make those changes explicit and catch them before they break dashboards.",
 steps: [
  { h: "What a contract contains",
    code: `dataset: shop.orders                    owner: checkout-team (#checkout)   version: 2.1.0
schema:
  order_id      int      required, unique
  customer_id   int      required
  amount_paise  int      required, >= 0          # integer paise, not rupees
  currency      string   required, in [INR, AED]
  status        string   required, in [paid, refunded, pending]
  created_at    timestamp UTC, required
quality:     duplicates = 0; null customer_id = 0
freshness:   new data every hour, max 2h delay
changes:     additive changes (new optional column) → minor version, announce 1 week ahead
             breaking (rename/remove/type change) → major version, 30 days, run both in parallel`, lang: "yaml" },
  { h: "Enforcing a contract with pydantic",
    code: `from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, ValidationError, ConfigDict

class OrderV2(BaseModel):
    model_config = ConfigDict(extra="forbid")          # unknown fields are a contract change
    order_id: int
    customer_id: int
    amount_paise: int = Field(ge=0)
    currency: Literal["INR", "AED"]
    status: Literal["paid", "refunded", "pending"]
    created_at: datetime

incoming = [
    {"order_id": 1, "customer_id": 101, "amount_paise": 5500000, "currency": "INR", "status": "paid", "created_at": "2025-07-05T10:00:00Z"},
    {"order_id": 2, "customer_id": 102, "amount_paise": 240000, "currency": "INR", "status": "cancelled", "created_at": "2025-07-05T11:00:00Z"},
    {"order_id": 3, "customer_id": 103, "amount": 30.5, "currency": "INR", "status": "paid", "created_at": "2025-07-05T12:00:00Z"},
]
for rec in incoming:
    try:
        OrderV2.model_validate(rec)
        print(f"order {rec['order_id']}: ok")
    except ValidationError as e:
        problems = "; ".join(f"{'.'.join(map(str, x['loc']))}: {x['msg']}" for x in e.errors())
        print(f"order {rec['order_id']}: CONTRACT VIOLATION -> {problems}")`,
    note: "Order 2 uses a new status value; order 3 renamed <code>amount_paise</code> to <code>amount</code> in rupees. Both are caught at the door instead of silently corrupting revenue." },
  { h: "Detecting schema changes automatically",
    code: `expected = {"order_id": "int", "customer_id": "int", "amount_paise": "int", "status": "str"}

def schema_diff(expected, actual):
    added = sorted(set(actual) - set(expected))
    removed = sorted(set(expected) - set(actual))
    changed = sorted(c for c in set(expected) & set(actual) if expected[c] != actual[c])
    breaking = bool(removed or changed)
    return {"added": added, "removed": removed, "type_changed": changed, "breaking": breaking}

today = {"order_id": "int", "customer_id": "str", "amount_paise": "int", "status": "str", "coupon": "str"}
print(schema_diff(expected, today))`,
    note: "Added optional columns are usually safe; removed columns and type changes are breaking and should block the load and alert both teams." },
  { h: "Making contracts work in practice",
    p: ["Store contracts as YAML in Git next to the producer's code; run contract checks in the producer's CI (so they can't ship a breaking change by accident) and at ingestion; version them; and have a named owner on both sides. Start with your most important 3–5 datasets, not everything."] }
 ],
 mistakes: [
  "Contracts as a document nobody enforces.",
  "Allowing extra/unknown fields silently.",
  "Breaking changes without a version bump and a migration period.",
  "No owner on the producer side."
 ],
 practice: [
  { q: "Add a rule to OrderV2 that created_at can't be in the future, and test it.", code: `from datetime import datetime, timezone
from pydantic import BaseModel, field_validator, ValidationError

class Order(BaseModel):
    order_id: int
    created_at: datetime

    @field_validator("created_at")
    @classmethod
    def not_future(cls, v):
        if v > datetime(2025, 7, 6, tzinfo=timezone.utc):
            raise ValueError("created_at is in the future")
        return v

for ts in ["2025-07-05T10:00:00Z", "2031-01-01T00:00:00Z"]:
    try:
        Order(order_id=1, created_at=ts); print(ts, "ok")
    except ValidationError as e:
        print(ts, "->", e.errors()[0]["msg"])` },
  { q: "The checkout team wants to rename status 'paid' to 'captured'. Using a contract process, how should this roll out?", a: "It's a breaking change (allowed values change): bump the contract major version, announce to consumers with a date, update consumers to accept both values (or map captured → paid) first, run both in parallel for the agreed period, then switch the producer, and finally remove the old value from the contract." }
 ],
 check: [
  ["A data contract is between…", ["Two databases", "Data producers and consumers", "Engineers and HR", "Users"], 1, "Agreed interface."],
  ["Which change is breaking?", ["New optional column", "Renaming a column", "More rows", "Faster delivery"], 1, "Consumers break."],
  ["Why extra='forbid'?", ["Speed", "Unknown fields signal an unannounced change", "Required by pydantic", "Security only"], 1, "Detect drift."]
 ],
 remember: [
  "Contract = schema + meanings + quality + freshness + change process + owners.",
  "Enforce in code at the boundary (and in producer CI).",
  "Detect schema drift; block breaking changes.",
  "Version contracts; parallel-run breaking changes."
 ]
},
{
 id: "monitoring",
 title: "Data observability and monitoring",
 level: "Intermediate",
 one: "Tests catch known problems; <b>observability</b> catches unknown ones by watching <b>freshness</b>, <b>volume</b>, <b>schema</b>, <b>distribution</b> and <b>lineage</b> of every important table, alerting when something looks unusual.",
 why: "The worst data incidents are silent: a pipeline “succeeds” with half the rows. Monitoring finds them before business users do.",
 steps: [
  { h: "The five pillars",
    code: `freshness      when was the table last updated?            orders updated 7h ago (SLA 2h)  → alert
volume         how many rows arrived?                      12,000 today vs ~50,000 usual    → alert
schema         did columns/types change?                   column 'amount' became string    → alert
distribution   do values look normal?                      null rate of email 2% → 40%      → alert
lineage        what's upstream/downstream?                 which dashboards are affected?`, lang: "text" },
  { h: "Freshness checks",
    code: `from datetime import datetime, timedelta

tables = {   # table: (last_loaded_at, freshness SLA)
    "raw.shop_orders":     (datetime(2025, 7, 5, 8, 40), timedelta(hours=2)),
    "marts.daily_revenue": (datetime(2025, 7, 5, 3, 10), timedelta(hours=26)),
    "raw.crm_contacts":    (datetime(2025, 7, 4, 22, 0), timedelta(hours=6)),
}
now = datetime(2025, 7, 5, 9, 30)
for name, (loaded, sla) in tables.items():
    age = now - loaded
    status = "OK" if age <= sla else "STALE"
    print(f"{status:5}  {name:22} age {age.total_seconds() / 3600:4.1f}h  (SLA {sla.total_seconds() / 3600:.0f}h)")` },
  { h: "Volume and distribution anomalies",
    code: `import pandas as pd

history = pd.DataFrame({
    "day": pd.date_range("2025-06-21", periods=14),
    "rows": [50120, 49800, 51200, 50500, 48700, 39100, 38800, 50900, 50300, 51000, 49900, 49200, 38500, 38900],
    "null_email_rate": [0.020, 0.021, 0.019, 0.022, 0.020, 0.018, 0.019, 0.021, 0.020, 0.022, 0.019, 0.020, 0.018, 0.019],
})
history["weekday"] = history["day"].dt.dayofweek

def check(day, rows, null_rate):
    same_weekday = history[history["weekday"] == pd.Timestamp(day).dayofweek]["rows"]   # weekends are lower
    expected = same_weekday.mean()
    alerts = []
    if abs(rows - expected) / expected > 0.25:
        alerts.append(f"volume {rows:,} vs expected ~{expected:,.0f}")
    if null_rate > history["null_email_rate"].mean() * 3:
        alerts.append(f"null email rate {null_rate:.0%} vs usual {history['null_email_rate'].mean():.0%}")
    return alerts or ["ok"]

print("2025-07-05 (Sat):", check("2025-07-05", 38700, 0.02))
print("2025-07-07 (Mon):", check("2025-07-07", 24100, 0.02))
print("2025-07-08 (Tue):", check("2025-07-08", 50200, 0.38))`,
    note: "Comparing with the same weekday avoids false alarms on normal weekend dips; a sudden jump in null emails catches a broken upstream form even though row counts look fine." },
  { h: "Incident response for data",
    code: `1 detect     alert with table, check, numbers, link to run logs
2 assess     what's affected downstream (lineage)? who uses it?
3 contain    stop downstream jobs / mark dashboard "data delayed"
4 fix        re-run, backfill, or fix the source with the owner
5 tell       notify consumers: what happened, impact, when fixed
6 learn      short postmortem; add a test/monitor so it can't recur silently`, lang: "text" },
  { h: "Tools",
    p: ["Elementary (dbt-native, open source), Monte Carlo, Bigeye, Metaplane, Soda, Datadog data monitors. Many teams start with dbt source freshness + a few volume tests + Slack alerts, which covers most incidents."] }
 ],
 mistakes: [
  "Alerting only on job failure (successful jobs can load wrong data).",
  "Static thresholds that ignore weekly patterns (alert fatigue).",
  "Alerts without an owner or a runbook.",
  "Not telling data consumers during incidents."
 ],
 practice: [
  { q: "Write a schema-drift check comparing yesterday's and today's column types.", code: `yesterday = {"order_id": "int64", "amount": "int64", "status": "object"}
today = {"order_id": "int64", "amount": "object", "status": "object", "channel": "object"}
for col in sorted(set(yesterday) | set(today)):
    a, b = yesterday.get(col), today.get(col)
    if a != b:
        print(f"{col}: {a} -> {b}")` },
  { q: "Revenue on the dashboard dropped 40% today. Walk through your first 4 steps.", a: "1) Check freshness/volume of the revenue mart and its sources: did all data arrive? 2) Use lineage to find which upstream table changed (row counts, schema, null rates). 3) If it's a data issue, mark the dashboard as delayed and tell the stakeholders. 4) Fix (re-run/backfill or source fix with the owner), verify against a trusted reference, then write a short postmortem and add a monitor." }
 ],
 check: [
  ["A job succeeded but loaded half the rows. What catches it?", ["Retries", "Volume monitoring", "Unit tests", "Logs only"], 1, "Silent failure."],
  ["Why compare with the same weekday?", ["Tradition", "Weekly patterns cause false alarms otherwise", "Faster", "Required"], 1, "Seasonality."],
  ["Lineage helps during incidents by…", ["Fixing data", "Showing what's downstream and affected", "Speeding queries", "Encrypting"], 1, "Impact analysis."]
 ],
 remember: [
  "Freshness, volume, schema, distribution, lineage.",
  "Account for seasonality in thresholds.",
  "Detect → assess → contain → fix → tell → learn.",
  "Start simple: freshness + volume + key tests + Slack."
 ]
},
{
 id: "lineage-privacy",
 title: "Lineage, governance and privacy",
 level: "Intermediate",
 one: "<b>Lineage</b> shows where data comes from and where it flows. <b>Governance</b> defines owners, definitions and access. <b>Privacy</b> protects personal data (PII): collect less, mask or pseudonymise it, restrict access, and delete it on request (DPDP Act, GDPR).",
 why: "Regulations carry heavy fines, and customers trust companies that handle their data well. Data engineers build the pipes, so they implement most of these controls.",
 steps: [
  { h: "Lineage",
    code: `from graphlib import TopologicalSorter

lineage = {     # table: its inputs
    "staging.orders": {"raw.shop_orders"},
    "staging.customers": {"raw.crm_contacts"},
    "marts.fct_orders": {"staging.orders", "staging.customers"},
    "marts.daily_revenue": {"marts.fct_orders"},
    "dash.exec_kpis": {"marts.daily_revenue"},
    "ml.churn_features": {"marts.fct_orders"},
}

def downstream(table):
    found, todo = set(), [table]
    while todo:
        t = todo.pop()
        for child, parents in lineage.items():
            if t in parents and child not in found:
                found.add(child); todo.append(child)
    return sorted(found)

print("if raw.crm_contacts breaks, affected:", downstream("raw.crm_contacts"))
print("build order:", list(TopologicalSorter(lineage).static_order()))`,
    note: "dbt docs, OpenLineage/Marquez, DataHub, Unity Catalog and cloud catalogs build this graph automatically from your pipelines." },
  { h: "Classify and protect PII",
    p: ["Tag columns by sensitivity (public, internal, confidential, PII). For PII choose: <b>drop</b> (don't collect it), <b>mask</b> (show partially), <b>pseudonymise</b> (replace with a keyed hash so joins still work), or <b>encrypt</b>, plus restricted access."],
    code: `import hmac, hashlib, re

SECRET = b"rotate-me-from-a-secrets-manager"      # never hardcode in real code

def pseudonymise(value: str) -> str:              # same input → same token, can't be reversed without the key
    return hmac.new(SECRET, value.lower().encode(), hashlib.sha256).hexdigest()[:16]

def mask_email(email: str) -> str:
    user, domain = email.split("@")
    return f"{user[0]}***@{domain}"

def mask_phone(phone: str) -> str:
    digits = re.sub(r"\\D", "", phone)
    return "*" * (len(digits) - 4) + digits[-4:]

rows = [("asha@example.com", "+91 98470 12345"), ("Asha@Example.com", "+91 98470 12345"), ("ben@example.com", "+971 50 123 4567")]
for email, phone in rows:
    print(f"{pseudonymise(email)}  {mask_email(email):20}  {mask_phone(phone)}")`,
    note: "Both Asha rows get the same token, so analysts can still count unique customers and join tables without ever seeing the email." },
  { h: "Access control",
    code: `-- role-based access: analysts see masked PII, the support team sees it in full
CREATE MASKING POLICY email_mask AS (val STRING) RETURNS STRING ->
  CASE WHEN CURRENT_ROLE() IN ('SUPPORT') THEN val
       ELSE REGEXP_REPLACE(val, '^.(.*)@', '*@') END;            -- Snowflake
ALTER TABLE marts.dim_customers MODIFY COLUMN email SET MASKING POLICY email_mask;

-- row-level security: regional managers see only their region
CREATE ROW ACCESS POLICY region_rls AS (region STRING) RETURNS BOOLEAN ->
  region = CURRENT_SESSION_REGION() OR IS_ROLE_IN_SESSION('ADMIN');

GRANT SELECT ON ALL TABLES IN SCHEMA marts TO ROLE analyst;    -- least privilege per schema`, lang: "sql" },
  { h: "Deletion requests and retention",
    p: ["Laws like India's DPDP Act and the EU GDPR give people rights to access and erase their data. Keep a registry of where each person's data lives (lineage helps), use table formats that support deletes (Delta/Iceberg), delete across raw → marts → backups within the deadline, and set retention periods so data isn't kept forever."],
    code: `import duckdb
con = duckdb.connect()
con.execute("CREATE TABLE raw_orders AS SELECT * FROM (VALUES (1, 'asha@example.com', 500), (2, 'ben@example.com', 900)) t(id, email, amount)")
con.execute("CREATE TABLE fct_orders AS SELECT id, md5(email) AS customer_token, amount FROM raw_orders")
con.execute("CREATE TABLE erasure_log (token TEXT, requested_at DATE, tables TEXT)")

def erase(email, requested_at):
    token = con.sql(f"SELECT md5('{email}')").fetchall()[0][0]
    con.execute("BEGIN")
    con.execute("DELETE FROM raw_orders WHERE email = ?", [email])
    con.execute("DELETE FROM fct_orders WHERE customer_token = ?", [token])
    con.execute("INSERT INTO erasure_log VALUES (?, ?, 'raw_orders,fct_orders')", [token, requested_at])
    con.execute("COMMIT")

erase("asha@example.com", "2025-07-05")
print(con.sql("SELECT COUNT(*) FROM raw_orders").fetchall(), con.sql("SELECT COUNT(*) FROM fct_orders").fetchall())
print(con.sql("SELECT tables FROM erasure_log").fetchall())`,
    note: "The log keeps proof of the deletion without keeping the email itself." }
 ],
 mistakes: [
  "Copying raw PII into every table and every dev environment.",
  "Plain unsalted hashes of emails (easy to reverse with a dictionary).",
  "No record of where personal data lives, so deletion requests can't be completed.",
  "Granting analysts access to everything “for convenience”."
 ],
 practice: [
  { q: "Using the lineage dict, what's affected if marts.fct_orders is wrong?", code: `lineage = {"marts.daily_revenue": {"marts.fct_orders"}, "dash.exec_kpis": {"marts.daily_revenue"},
           "ml.churn_features": {"marts.fct_orders"}, "marts.fct_orders": {"staging.orders"}}
found, todo = set(), ["marts.fct_orders"]
while todo:
    t = todo.pop()
    for child, parents in lineage.items():
        if t in parents and child not in found:
            found.add(child); todo.append(child)
print(sorted(found))` },
  { q: "An analyst needs to count repeat customers but shouldn't see emails or phone numbers. Propose a design.", a: "Provide a customer dimension with a pseudonymised customer key (HMAC of the email with a secret held by the platform team), no raw email/phone columns in the analyst schema (or masking policies), and grant the analyst role only that schema. They can count and join by the token without seeing PII." }
 ],
 check: [
  ["Pseudonymisation with HMAC lets you…", ["Read emails", "Join and count by person without seeing PII", "Delete data", "Speed up queries"], 1, "Stable keyed token."],
  ["Why not plain md5(email)?", ["Too slow", "Easy to reverse by hashing known emails", "Not unique", "Not SQL"], 1, "Use a secret key."],
  ["To honour a deletion request you need…", ["Luck", "To know where the person's data lives (lineage/registry) and delete everywhere", "Only delete raw", "Only delete backups"], 1, "Every copy."]
 ],
 remember: [
  "Lineage for impact analysis and audits.",
  "Classify columns; drop, mask, pseudonymise (HMAC), encrypt PII.",
  "Masking policies, row-level security, least-privilege grants.",
  "Deletion requests + retention, with a log."
 ]
},
{
 id: "build",
 title: "Project: a data quality gate",
 level: "Project",
 one: "Build a reusable <b>quality gate</b> that sits between staging and marts: it validates a batch against a contract, quarantines bad rows with reasons, checks volume and freshness, writes a report, and decides <b>pass / warn / block</b>.",
 why: "A quality gate with clear policies is something every data team needs, and it shows you can turn quality ideas into working, tested code.",
 steps: [
  { h: "The gate",
    pre: ORDERS,
    code: `from dataclasses import dataclass, field

@dataclass
class GateResult:
    status: str
    loaded: int
    quarantined: int
    findings: list = field(default_factory=list)

ROW_RULES = {
    "order_id duplicated": lambda d: d["order_id"].duplicated(keep="first"),
    "customer_id missing": lambda d: d["customer_id"].isna(),
    "amount out of range": lambda d: ~d["amount"].between(0, 10_000_000),
    "status not allowed":  lambda d: ~d["status"].str.lower().isin(["paid", "refunded", "pending"]),
    "date in future":      lambda d: d["order_date"] > pd.Timestamp("2025-07-05"),
}

def quality_gate(batch, expected_rows, max_bad_ratio=0.2, min_volume_ratio=0.5):
    flags = pd.DataFrame({name: rule(batch) for name, rule in ROW_RULES.items()})
    bad = flags.any(axis=1)
    findings = [f"{name}: {int(flags[name].sum())} rows" for name in flags if flags[name].any()]
    good = batch[~bad].assign(status=lambda d: d["status"].str.lower())
    status = "pass"
    if findings:
        status = "warn"
    if bad.mean() > max_bad_ratio:
        status = "block"; findings.append(f"bad ratio {bad.mean():.0%} > {max_bad_ratio:.0%}")
    if len(batch) < expected_rows * min_volume_ratio:
        status = "block"; findings.append(f"volume {len(batch)} < {min_volume_ratio:.0%} of expected {expected_rows}")
    return GateResult(status, len(good) if status != "block" else 0, int(bad.sum()), findings), good

result, good = quality_gate(orders, expected_rows=8, max_bad_ratio=0.5)
print("status:", result.status, "| loaded:", result.loaded, "| quarantined:", result.quarantined)
for f in result.findings:
    print("  -", f)
print(good[["order_id", "customer_id", "amount", "status"]].to_string(index=False))

strict, _ = quality_gate(orders, expected_rows=8)                 # default 20% tolerance
print("\\nwith default tolerance:", strict.status, strict.findings[-1])`,
    note: "Order 7 (customer 999) passes the row rules but isn't a known customer: add a consistency rule against the customer table as an exercise." },
  { h: "Tests for the gate",
    code: `import pandas as pd

def gate(df, max_bad=0.2):
    bad = df["amount"].lt(0) | df["order_id"].duplicated()
    if bad.mean() > max_bad:
        return "block", 0
    return ("warn" if bad.any() else "pass"), int((~bad).sum())

def make(amounts, ids=None):
    return pd.DataFrame({"order_id": ids or list(range(len(amounts))), "amount": amounts})

def test_clean_batch_passes():
    assert gate(make([10, 20, 30])) == ("pass", 3)

def test_few_bad_rows_warn_and_load_good_rows():
    assert gate(make([10, 20, 30, 40, 50, 60, -1])) == ("warn", 6)

def test_many_bad_rows_block():
    assert gate(make([-1, -2, 30])) == ("block", 0)

def test_duplicates_count_as_bad():
    assert gate(make([10, 10, 10, 10, 10, 10], ids=[1, 1, 2, 3, 4, 5])) == ("warn", 5)`, test: true },
  { h: "Wiring it into the pipeline",
    code: `extract → staging ──► quality_gate ──pass──► build marts ──► publish
                               ├─warn──► build marts + Slack summary with findings
                               └─block─► stop, alert owner, dashboard shows "data delayed"
quarantine table: qa.quarantine_orders(order_id, reason, batch_id, loaded_at)
report table:     qa.gate_runs(batch_id, status, loaded, quarantined, findings, run_at)`, lang: "text" },
  { h: "Portfolio checklist",
    p: ["Show the contract YAML, the gate code with tests, a sample report from a bad batch, and a small dashboard of gate results over time (pass/warn/block per day, top failing rules). Explain one policy decision, e.g. why 20% bad rows blocks."] }
 ],
 mistakes: [
  "A gate that only logs and never blocks.",
  "Blocking on every warning-level issue.",
  "Quarantine with no reason column, so nobody can fix the source."
 ],
 practice: [
  { q: "Add the missing consistency rule: customer_id must exist in customers.", pre: ORDERS, code: `rule = ~orders["customer_id"].isin(customers["customer_id"]) & orders["customer_id"].notna()
print("unknown customers:", orders.loc[rule, ["order_id", "customer_id"]].to_dict("records"))` },
  { q: "Finance says any batch where total paid revenue differs from the payment provider report by more than 0.5% must block. Where does this check go and how do you implement it?", a: "After building the revenue mart (or on the staging batch), before publishing: compute SUM(amount) for paid orders for the batch's date, fetch the provider's settlement total for the same date, and block if abs(diff)/provider_total > 0.005. Record both numbers in the gate report and alert finance and the data owner." }
 ],
 check: [
  ["What should the gate do with a few bad rows?", ["Block always", "Quarantine them, load the rest, warn", "Ignore", "Delete the table"], 1, "Proportionate response."],
  ["Why record findings per run?", ["Disk usage", "Trend quality over time and give owners evidence", "Required by pandas", "Speed"], 1, "Visibility."],
  ["A volume rule protects against…", ["Typos", "Partial/missing loads", "Bad emails", "Duplicates"], 1, "Silent upstream failures."]
 ],
 remember: [
  "Gate = contract rules + quarantine + volume/freshness + policy.",
  "pass / warn / block with clear thresholds.",
  "Quarantine and report tables with reasons.",
  "Unit-test the gate's decisions."
 ]
}
];
