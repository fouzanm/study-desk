// Data Engineer — Week 1 lessons (what DEs do + SQL fundamentals).
// Example tables: customers(id, name, city), orders(id, customer_id, order_date, status, total),
// order_items(id, order_id, product, qty, price).
(function (L) {
  const add = (key, v) => { L["data-engineer:" + key] = v; };

  add("1-1", {
    title: "What a data engineer does",
    one: "A data engineer builds the <b>pipes</b> that move data from where it's created to where people use it — reliably, every day.",
    learn: [
      "Think of an online shop. Orders are saved in the app's database. Clicks go to log files. Payments come from Razorpay. The business wants one dashboard: 'How much did we sell, and to whom?'",
      "The data engineer connects these. The journey has five steps, called the <b>data engineering lifecycle</b>:",
      "<b>1. Source</b> (where data is born) → <b>2. Ingest</b> (copy it in) → <b>3. Store</b> (data lake / warehouse) → <b>4. Transform</b> (clean, join, model) → <b>5. Serve</b> (dashboards, reports, ML).",
      "A data analyst asks questions of the data. A data scientist builds models. The data engineer makes sure the data is there, correct and on time."
    ],
    points: [
      "Daily tools you'll learn: SQL, Python, dbt, Airflow, Spark, a cloud warehouse (Snowflake/BigQuery), S3.",
      "What 'good' means: correct numbers, on time, and pipelines that recover from failures."
    ],
    try: "Draw the 5 lifecycle steps for an online shop on paper. For each step, write one example (e.g. Source = orders table in PostgreSQL).",
    remember: [
      "Source → Ingest → Store → Transform → Serve.",
      "DE = reliable data pipes. Analyst = questions. Scientist = models.",
      "Every DE job asks for SQL and Python first."
    ]
  });

  add("1-2", {
    title: "SELECT, WHERE, ORDER BY, LIMIT",
    one: "SQL asks the database a question. <b>SELECT</b> picks columns, <b>WHERE</b> picks rows, <b>ORDER BY</b> sorts, <b>LIMIT</b> cuts.",
    learn: [
      "Install PostgreSQL and load a small sample shop database. Ask Claude: 'Give me a setup.sql with customers, orders and order_items for practice'.",
      "The database runs the parts in this order: <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>. That's why WHERE can't use names you create in SELECT.",
      "Useful filters: <code>IN ('a','b')</code>, <code>BETWEEN</code>, <code>LIKE '%text%'</code> (<code>ILIKE</code> ignores case), <code>IS NULL</code> (never <code>= NULL</code>)."
    ],
    ex: "-- 5 biggest completed orders in 2026\nSELECT id, customer_id, total\nFROM orders\nWHERE status = 'completed'\n  AND order_date >= '2026-01-01'\nORDER BY total DESC\nLIMIT 5;",
    try: "Show all customers from Kochi or Bengaluru, sorted by name.",
    remember: [
      "Run order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
      "Use IS NULL, never = NULL.",
      "Text in single quotes."
    ]
  });

  add("1-3", {
    title: "GROUP BY, HAVING and aggregates",
    one: "<b>GROUP BY</b> makes one pile per value; <b>COUNT, SUM, AVG, MIN, MAX</b> summarise each pile.",
    learn: [
      "Most reports are 'something per something': revenue per day, orders per city, customers per month.",
      "Every column in SELECT must be in GROUP BY or inside an aggregate.",
      "<b>WHERE</b> filters rows before grouping. <b>HAVING</b> filters groups after grouping (so it can use SUM).",
      "For monthly reports use <code>date_trunc('month', order_date)</code>."
    ],
    ex: "-- Daily revenue, only days above 10,000\nSELECT order_date, SUM(total) AS revenue, COUNT(*) AS orders\nFROM orders\nWHERE status = 'completed'\nGROUP BY order_date\nHAVING SUM(total) > 10000\nORDER BY order_date;",
    try: "Monthly revenue and number of orders for 2026.",
    remember: [
      "'X per Y' = GROUP BY Y.",
      "WHERE before grouping, HAVING after.",
      "Monthly = date_trunc('month', date)."
    ]
  });

  add("1-4", {
    title: "JOINs and the 'doubled totals' trap",
    one: "A <b>JOIN</b> combines tables by matching keys, like <code>orders.customer_id = customers.id</code>.",
    learn: [
      "<b>INNER JOIN</b> keeps only matching rows. <b>LEFT JOIN</b> keeps every row from the left table and fills NULL where there's no match.",
      "Find 'customers who never ordered': LEFT JOIN orders, then <code>WHERE o.id IS NULL</code>.",
      "<b>The trap:</b> one order has many items. Join orders to order_items and the order row repeats once per item. <code>SUM(o.total)</code> is then counted several times. Sum item columns, or aggregate items first in a CTE, then join.",
      "Always check row counts before and after a join. It's the most common data bug."
    ],
    ex: "-- Revenue per product (correct: sum the item level)\nSELECT i.product, SUM(i.qty * i.price) AS revenue\nFROM order_items i\nJOIN orders o ON o.id = i.order_id\nWHERE o.status = 'completed'\nGROUP BY i.product\nORDER BY revenue DESC;",
    try: "List customers who never placed an order (LEFT JOIN + IS NULL).",
    remember: [
      "INNER = matches only. LEFT = keep all left rows.",
      "No match = LEFT JOIN ... WHERE right.id IS NULL.",
      "One-to-many joins repeat rows: check counts, sum from the 'many' side."
    ]
  });

  add("1-5", {
    title: "Subqueries and CTEs",
    one: "A <b>CTE</b> (<code>WITH name AS (...)</code>) breaks a big query into small named steps. Pipelines are full of them.",
    learn: [
      "Write step 1, run it, check it. Then add step 2 that uses step 1. This is how you build and debug real transformation SQL.",
      "dbt models (week 5) are basically CTEs saved as files, so this habit matters."
    ],
    ex: "WITH customer_revenue AS (\n  SELECT customer_id, SUM(total) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY customer_id\n),\nranked AS (\n  SELECT *, NTILE(10) OVER (ORDER BY revenue DESC) AS decile\n  FROM customer_revenue\n)\nSELECT c.name, r.revenue\nFROM ranked r\nJOIN customers c ON c.id = r.customer_id\nWHERE r.decile = 1;     -- top 10% customers",
    try: "Using CTEs: find customers whose revenue is above the average customer revenue.",
    remember: [
      "CTE = named step. Build and run one step at a time.",
      "Readable SQL is maintainable SQL.",
      "dbt models are CTE-style SQL files."
    ]
  });

  add("1-6", {
    title: "Practice: 15 business questions",
    one: "Practise like the job: real questions, answered with correct SQL, checked for sense.",
    learn: ["Before writing, decide what <b>one row</b> of the answer means. Then check the result: do the totals look believable?"],
    points: [
      "1. Total revenue by month · 2. Top 10 customers · 3. Customers who never ordered",
      "4. Average order value per city · 5. Best-selling product each month · 6. Repeat customers (2+ orders)",
      "7. Revenue growth vs previous month · 8. Orders per weekday · 9. First order date per customer",
      "10. Customers who bought in Jan but not Feb · 11. Share of revenue from top 10% customers",
      "12. Days with zero orders · 13. Duplicate orders (same customer, same total, same minute)",
      "14. Running total of revenue · 15. Latest order per customer"
    ],
    try: "Answer all 15. Send them to Claude: <i>“Check my SQL answers and explain mistakes simply.”</i>",
    remember: [
      "Decide the grain (one row = ?) first.",
      "Sanity-check totals after every join.",
      "Questions 7, 14, 15 need window functions — next week."
    ]
  });
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
