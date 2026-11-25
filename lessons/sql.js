// Lessons for course "sql". Keys are "course:lessonId" (see catalog/topics.js).
(function (L) {
L["sql:run-order-select"] = {
 "title": "SELECT, WHERE, ORDER BY, LIMIT",
 "one": "SQL asks the database a question. <b>SELECT</b> picks columns, <b>WHERE</b> picks rows, <b>ORDER BY</b> sorts, <b>LIMIT</b> cuts.",
 "learn": [
  "Install PostgreSQL and load a small sample shop database. Ask Claude: 'Give me a setup.sql with customers, orders and order_items for practice'.",
  "The database runs the parts in this order: <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>. That's why WHERE can't use names you create in SELECT.",
  "Useful filters: <code>IN ('a','b')</code>, <code>BETWEEN</code>, <code>LIKE '%text%'</code> (<code>ILIKE</code> ignores case), <code>IS NULL</code> (never <code>= NULL</code>)."
 ],
 "ex": "-- 5 biggest completed orders in 2026\nSELECT id, customer_id, total\nFROM orders\nWHERE status = 'completed'\n  AND order_date >= '2026-01-01'\nORDER BY total DESC\nLIMIT 5;",
 "try": "Show all customers from Kochi or Bengaluru, sorted by name.",
 "remember": [
  "Run order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
  "Use IS NULL, never = NULL.",
  "Text in single quotes."
 ]
};

L["sql:group-by"] = {
 "title": "GROUP BY, HAVING and aggregates",
 "one": "<b>GROUP BY</b> makes one pile per value; <b>COUNT, SUM, AVG, MIN, MAX</b> summarise each pile.",
 "learn": [
  "Most reports are 'something per something': revenue per day, orders per city, customers per month.",
  "Every column in SELECT must be in GROUP BY or inside an aggregate.",
  "<b>WHERE</b> filters rows before grouping. <b>HAVING</b> filters groups after grouping (so it can use SUM).",
  "For monthly reports use <code>date_trunc('month', order_date)</code>."
 ],
 "ex": "-- Daily revenue, only days above 10,000\nSELECT order_date, SUM(total) AS revenue, COUNT(*) AS orders\nFROM orders\nWHERE status = 'completed'\nGROUP BY order_date\nHAVING SUM(total) > 10000\nORDER BY order_date;",
 "try": "Monthly revenue and number of orders for 2026.",
 "remember": [
  "'X per Y' = GROUP BY Y.",
  "WHERE before grouping, HAVING after.",
  "Monthly = date_trunc('month', date)."
 ]
};

L["sql:joins"] = {
 "title": "JOINs and the 'doubled totals' trap",
 "one": "A <b>JOIN</b> combines tables by matching keys, like <code>orders.customer_id = customers.id</code>.",
 "learn": [
  "<b>INNER JOIN</b> keeps only matching rows. <b>LEFT JOIN</b> keeps every row from the left table and fills NULL where there's no match.",
  "Find 'customers who never ordered': LEFT JOIN orders, then <code>WHERE o.id IS NULL</code>.",
  "<b>The trap:</b> one order has many items. Join orders to order_items and the order row repeats once per item. <code>SUM(o.total)</code> is then counted several times. Sum item columns, or aggregate items first in a CTE, then join.",
  "Always check row counts before and after a join. It's the most common data bug."
 ],
 "ex": "-- Revenue per product (correct: sum the item level)\nSELECT i.product, SUM(i.qty * i.price) AS revenue\nFROM order_items i\nJOIN orders o ON o.id = i.order_id\nWHERE o.status = 'completed'\nGROUP BY i.product\nORDER BY revenue DESC;",
 "try": "List customers who never placed an order (LEFT JOIN + IS NULL).",
 "remember": [
  "INNER = matches only. LEFT = keep all left rows.",
  "No match = LEFT JOIN ... WHERE right.id IS NULL.",
  "One-to-many joins repeat rows: check counts, sum from the 'many' side."
 ]
};

L["sql:ctes"] = {
 "title": "Subqueries and CTEs",
 "one": "A <b>CTE</b> (<code>WITH name AS (...)</code>) breaks a big query into small named steps. Pipelines are full of them.",
 "learn": [
  "Write step 1, run it, check it. Then add step 2 that uses step 1. This is how you build and debug real transformation SQL.",
  "dbt models (week 5) are basically CTEs saved as files, so this habit matters."
 ],
 "ex": "WITH customer_revenue AS (\n  SELECT customer_id, SUM(total) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY customer_id\n),\nranked AS (\n  SELECT *, NTILE(10) OVER (ORDER BY revenue DESC) AS decile\n  FROM customer_revenue\n)\nSELECT c.name, r.revenue\nFROM ranked r\nJOIN customers c ON c.id = r.customer_id\nWHERE r.decile = 1;     -- top 10% customers",
 "try": "Using CTEs: find customers whose revenue is above the average customer revenue.",
 "remember": [
  "CTE = named step. Build and run one step at a time.",
  "Readable SQL is maintainable SQL.",
  "dbt models are CTE-style SQL files."
 ]
};

L["sql:window-functions"] = {
 "title": "Window functions: ROW_NUMBER, RANK, LAG, running totals",
 "one": "A <b>window function</b> calculates across related rows but <b>keeps every row</b>, unlike GROUP BY.",
 "learn": [
  "Shape: <code>function() OVER (PARTITION BY group ORDER BY sort)</code>. PARTITION BY = which rows belong together. ORDER BY = the order inside each group.",
  "<b>ROW_NUMBER()</b> numbers rows 1, 2, 3 in each group. Use it for 'latest order per customer'.",
  "<b>RANK()</b> gives ties the same number (1, 1, 3). <b>SUM(x) OVER (ORDER BY date)</b> gives a running total. <b>LAG(x)</b> looks at the previous row.",
  "You can't use the window result in WHERE of the same query (WHERE runs first). Wrap it in a CTE, then filter."
 ],
 "ex": "-- Latest order per customer (asked in many interviews)\nWITH ranked AS (\n  SELECT customer_id, id, order_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_id\n                            ORDER BY order_date DESC) AS rn\n  FROM orders\n)\nSELECT customer_id, id, order_date\nFROM ranked\nWHERE rn = 1;",
 "try": "Show each month's confirmed revenue and the change from the previous month using <code>LAG</code>.",
 "remember": [
  "Window = calculate across rows, keep every row.",
  "Latest per group = ROW_NUMBER() ... = 1 inside a CTE.",
  "Running total = SUM(x) OVER (ORDER BY date). Previous row = LAG(x)."
 ]
};

L["sql:indexes"] = {
 "title": "Indexes and EXPLAIN ANALYZE",
 "one": "An <b>index</b> is like the index at the back of a book: the database jumps to the right rows instead of reading every row.",
 "learn": [
  "Without an index, PostgreSQL does a <b>Seq Scan</b>: it reads the whole table. Fine for 1,000 rows, slow for 10 million.",
  "<code>EXPLAIN ANALYZE your query</code> runs the query and shows the plan and the real time. Look for 'Seq Scan' on a big table and 'Rows Removed by Filter' with a huge number. That means: add an index.",
  "For a filter like <code>WHERE customer_id = 42 AND order_date &gt;= '2026-01-01'</code>, create one index on <code>(customer_id, order_date)</code>: the '=' column first, the range column second.",
  "Indexes are not free: every insert and update must also update the index. Add them for real slow queries, not 'just in case'."
 ],
 "ex": "EXPLAIN ANALYZE\nSELECT * FROM orders\nWHERE customer_id = 42 AND order_date >= '2026-01-01';\n\nCREATE INDEX idx_orders_customer_date\n  ON orders (customer_id, order_date);",
 "out": "Before: Seq Scan ... Execution Time: 31 ms\nAfter:  Index Scan ... Execution Time: 0.1 ms",
 "try": "Load a big test table (ask Claude for a generate_series script with 1M orders), run EXPLAIN ANALYZE on a filter, add the right index and compare the time.",
 "remember": [
  "Slow query? EXPLAIN ANALYZE first.",
  "Seq Scan on a big table + many rows removed = missing index.",
  "Index order: = column first, range column second. Indexes slow down writes."
 ]
};

L["sql:transactions"] = {
 "title": "Transactions and locking",
 "one": "A <b>transaction</b> is a group of changes that all succeed or all fail. <b>Locks</b> stop two people changing the same thing at once.",
 "learn": [
  "Moving stock from A to B is two updates. If the second fails, the first must be undone, or stock vanishes. <code>BEGIN; ...; COMMIT;</code> saves both. <code>ROLLBACK;</code> undoes both.",
  "<b>The last-item problem:</b> stock = 1, two users click Buy at the same second. Both read 1, both sell. That's a <b>race condition</b>.",
  "Fix 1: lock the row with <code>SELECT ... FOR UPDATE</code>; the second user waits. Fix 2: one statement that checks and changes: <code>UPDATE stock SET qty = qty - 1 WHERE id = 7 AND qty &gt; 0</code>, then check how many rows changed.",
  "Stricter modes like <b>Repeatable Read</b> stop a transaction when someone else changed the same data first. You get a 'could not serialize access' error, and the app should simply try again."
 ],
 "ex": "BEGIN;\nSELECT qty FROM stock WHERE product_id = 7 FOR UPDATE;\n-- if qty > 0:\nUPDATE stock SET qty = qty - 1 WHERE product_id = 7;\nCOMMIT;",
 "try": "In two psql windows, start a transaction in each and run the FOR UPDATE query on the same row. Watch the second window wait until the first commits.",
 "remember": [
  "Transaction = all or nothing (BEGIN / COMMIT / ROLLBACK).",
  "Two users, last item = race condition. Fix with FOR UPDATE or a conditional UPDATE.",
  "Keep transactions short to avoid locks and deadlocks."
 ]
};

L["sql:practice"] = {
 "title": "Practice: 15 business questions",
 "one": "Practise like the job: real questions, answered with correct SQL, checked for sense.",
 "learn": [
  "Before writing, decide what <b>one row</b> of the answer means. Then check the result: do the totals look believable?"
 ],
 "points": [
  "1. Total revenue by month · 2. Top 10 customers · 3. Customers who never ordered",
  "4. Average order value per city · 5. Best-selling product each month · 6. Repeat customers (2+ orders)",
  "7. Revenue growth vs previous month · 8. Orders per weekday · 9. First order date per customer",
  "10. Customers who bought in Jan but not Feb · 11. Share of revenue from top 10% customers",
  "12. Days with zero orders · 13. Duplicate orders (same customer, same total, same minute)",
  "14. Running total of revenue · 15. Latest order per customer"
 ],
 "try": "Answer all 15. Send them to Claude: <i>“Check my SQL answers and explain mistakes simply.”</i>",
 "remember": [
  "Decide the grain (one row = ?) first.",
  "Sanity-check totals after every join.",
  "Questions 7, 14, 15 need window functions — next week."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
