// SQL course, lessons 6-10.
module.exports = [
{
 id: "joins",
 title: "JOINs: combining tables",
 level: "Intermediate",
 one: "A <b>JOIN</b> puts two tables side by side by matching a key, like <code>orders.customer_id = customers.id</code>.",
 why: "Data is split across tables on purpose. To answer “which customer placed this order?” or “revenue per product”, you must join. JOINs are asked in almost every SQL interview.",
 steps: [
  { h: "INNER JOIN: only rows that match",
    p: ["<code>JOIN</code> (same as <code>INNER JOIN</code>) keeps a row only when both sides match. Give tables short names (<code>o</code>, <code>c</code>) and prefix columns with them."],
    sql: `SELECT o.id, c.name, o.order_date, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'completed'
ORDER BY o.id;` },
  { h: "LEFT JOIN: keep everything on the left",
    p: ["<code>LEFT JOIN</code> keeps every row from the left table. Where there is no match on the right, the right columns are NULL.",
        "Priya has no orders, so her order columns are NULL:"],
    sql: `SELECT c.name, o.id AS order_id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
ORDER BY c.id, o.id;` },
  { h: "Find rows with no match",
    p: ["“Customers who never ordered”: LEFT JOIN, then keep rows where the right side is NULL. This pattern is called an <b>anti-join</b>."],
    sql: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;` },
  { h: "Joining three tables",
    p: ["Chain joins one after another. Here: order items → products (for the name) → orders (to keep completed only). Then group to get revenue per product."],
    sql: `SELECT p.name, SUM(i.qty) AS units, SUM(i.qty * i.price) AS revenue
FROM order_items i
JOIN products p ON p.id = i.product_id
JOIN orders   o ON o.id = i.order_id
WHERE o.status = 'completed'
GROUP BY p.name
ORDER BY revenue DESC;` },
  { h: "The trap: doubled totals",
    p: ["One order has many items. When you join orders to order_items, each order row repeats once per item. Then <code>SUM(o.total)</code> counts the same order several times.",
        "Asha's real completed total is 64,500 (55,000 + 6,900 + 2,600). Look what happens:"],
    sql: `SELECT c.name, SUM(o.total) AS wrong_total
FROM customers c
JOIN orders o      ON o.customer_id = c.id
JOIN order_items i ON i.order_id = o.id
WHERE o.status = 'completed'
GROUP BY c.name
ORDER BY c.name;`,
    note: "Asha shows 74,000 instead of 64,500, because orders 2 and 8 each have two items. <b>Fix:</b> don't join the items when you only need order totals, or sum the item level (<code>qty * price</code>) instead of the order total." },
  { h: "Where you put the filter matters in a LEFT JOIN",
    p: ["A condition on the right table in <b>WHERE</b> throws away the NULL rows, so your LEFT JOIN quietly becomes an INNER JOIN. Put it in the <b>ON</b> part to keep everyone.",
        "Every customer with their count of <i>completed</i> orders, including zero:"],
    sql: `SELECT c.name, COUNT(o.id) AS completed_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
GROUP BY c.name
ORDER BY completed_orders DESC, c.name;`,
    note: "<code>COUNT(o.id)</code> counts only matched orders, so Priya gets 0. <code>COUNT(*)</code> would wrongly give her 1." }
 ],
 mistakes: [
  "Summing a parent column (like <code>orders.total</code>) after joining to a child table (items). Totals double. Check row counts before and after every join.",
  "Filtering the right table in WHERE after a LEFT JOIN. It drops the unmatched rows. Move the condition into ON.",
  "<code>COUNT(*)</code> after a LEFT JOIN counts the NULL row as 1. Use <code>COUNT(right.id)</code>.",
  "Forgetting the ON condition, or joining on the wrong column. You get every combination (a huge result)."
 ],
 practice: [
  { q: "Show each order item with the product name and the customer name (order_id, customer, product, qty).", sql: `SELECT i.order_id, c.name AS customer, p.name AS product, i.qty
FROM order_items i
JOIN orders    o ON o.id = i.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products  p ON p.id = i.product_id
ORDER BY i.order_id, p.name;` },
  { q: "Which products have never been sold?", sql: `SELECT p.name
FROM products p
LEFT JOIN order_items i ON i.product_id = p.id
WHERE i.id IS NULL;` },
  { q: "Completed revenue per city (from order totals, no items).", sql: `SELECT c.city, SUM(o.total) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.city
ORDER BY revenue DESC;` }
 ],
 check: [
  ["Which join keeps customers with no orders?", ["INNER JOIN", "customers LEFT JOIN orders", "orders LEFT JOIN customers", "Any join"], 1, "LEFT JOIN keeps every row of the left table, here customers."],
  ["You join orders to order_items and SUM(orders.total). The result is too big. Why?", ["Bad data", "Each order repeats once per item, so its total is added several times", "SUM is broken", "You need DISTINCT in SELECT"], 1, "One-to-many joins repeat the parent row."],
  ["customers c LEFT JOIN orders o ON … WHERE o.status = 'completed' …", ["Keeps all customers", "Drops customers with no orders, like an INNER JOIN", "Errors", "Returns only NULLs"], 1, "WHERE removes rows where o.status is NULL. Put the condition in ON."]
 ],
 remember: [
  "JOIN = matching rows only. LEFT JOIN = all left rows + NULLs where no match.",
  "Never matched: LEFT JOIN … WHERE right.id IS NULL.",
  "One-to-many joins repeat the parent row: don't SUM parent columns after joining children.",
  "Right-table filters in a LEFT JOIN go in ON, not WHERE.",
  "After a LEFT JOIN, count with COUNT(right.id), not COUNT(*)."
 ]
},
{
 id: "exists-union",
 title: "More ways to combine: EXISTS, UNION and self joins",
 level: "Intermediate",
 one: "<code>EXISTS</code> asks “is there at least one matching row?”, <code>UNION</code> stacks results on top of each other, and a <b>self join</b> joins a table to itself.",
 why: "These solve questions JOIN handles badly: “customers who bought tea”, “one list of all contacts”, “who is each employee's manager?”.",
 steps: [
  { h: "EXISTS: is there at least one?",
    p: ["<code>WHERE EXISTS (subquery)</code> keeps a row if the subquery finds anything. It never repeats rows, so there's no doubling problem.",
        "Customers who have at least one completed order:"],
    sql: `SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = 'completed'
)
ORDER BY c.name;`,
    note: "<code>SELECT 1</code> is a habit: EXISTS only cares whether a row exists, not what's in it." },
  { h: "NOT EXISTS: none at all",
    p: ["The safest way to find “no match”. Customers who never bought a Grocery product:"],
    sql: `SELECT c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1
  FROM orders o
  JOIN order_items i ON i.order_id = o.id
  JOIN products p    ON p.id = i.product_id
  WHERE o.customer_id = c.id AND p.category = 'Grocery'
)
ORDER BY c.name;` },
  { h: "IN with a subquery",
    p: ["<code>IN (SELECT …)</code> reads well for simple lists. Products that appear in a cancelled order:"],
    sql: `SELECT name FROM products
WHERE id IN (
  SELECT i.product_id
  FROM order_items i JOIN orders o ON o.id = i.order_id
  WHERE o.status = 'cancelled'
);` },
  { h: "UNION and UNION ALL: stack results",
    p: ["Both queries must have the same number of columns, in the same order and type. <code>UNION</code> removes duplicate rows; <code>UNION ALL</code> keeps everything and is faster."],
    sql: `SELECT name, 'customer' AS kind FROM customers WHERE city = 'Dubai'
UNION ALL
SELECT name, 'employee' FROM employees WHERE manager_id = 1
ORDER BY kind, name;` },
  { h: "Self join: a table joined to itself",
    p: ["<code>employees.manager_id</code> points to another row in the same table. Join the table to itself with two different short names."],
    sql: `SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;` }
 ],
 mistakes: [
  "<code>NOT IN (subquery)</code> when the subquery can return NULL: it returns no rows at all. Use <code>NOT EXISTS</code> instead.",
  "Using UNION when you meant UNION ALL. UNION quietly removes duplicates and is slower.",
  "UNION with columns in a different order: the database stacks them by position, not by name."
 ],
 practice: [
  { q: "Customers who bought Headphones (use EXISTS).", sql: `SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  JOIN order_items i ON i.order_id = o.id
  JOIN products p    ON p.id = i.product_id
  WHERE o.customer_id = c.id AND p.name = 'Headphones'
)
ORDER BY c.name;` },
  { q: "List each manager and how many people report directly to them.", sql: `SELECT m.name AS manager, COUNT(e.id) AS reports
FROM employees m
JOIN employees e ON e.manager_id = m.id
GROUP BY m.name
ORDER BY reports DESC, m.name;` },
  { q: "Why is NOT EXISTS safer than NOT IN?", a: "If the subquery returns even one NULL, <code>x NOT IN (…)</code> is never true, so you get zero rows. NOT EXISTS isn't affected by NULLs." }
 ],
 check: [
  ["What does UNION do that UNION ALL doesn't?", ["Sorts the result", "Removes duplicate rows", "Joins on keys", "Nothing"], 1, "UNION removes duplicates; UNION ALL keeps them."],
  ["Best way to find customers with no orders?", ["NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)", "WHERE orders = 0", "INNER JOIN orders", "UNION"], 0, "NOT EXISTS (or LEFT JOIN … IS NULL) is the standard anti-join."],
  ["To show each employee with their manager's name you need…", ["UNION", "A self join on manager_id", "GROUP BY", "EXISTS"], 1, "Join employees to employees: e.manager_id = m.id."]
 ],
 remember: [
  "EXISTS = at least one match; never duplicates rows.",
  "Use NOT EXISTS, not NOT IN, when NULLs are possible.",
  "UNION removes duplicates; UNION ALL keeps all (faster). Same columns, same order.",
  "Self join: same table twice with different aliases (employee e, manager m)."
 ]
},
{
 id: "ctes",
 title: "Subqueries and CTEs (WITH)",
 level: "Intermediate",
 one: "A <b>CTE</b> (<code>WITH name AS (…)</code>) gives a step of your query a name, so you can build big answers from small, readable steps.",
 why: "Real questions take several steps: “find each customer's total, then compare it with the average”. CTEs keep this readable and fix the doubled-totals problem from the JOIN lesson.",
 steps: [
  { h: "A subquery inside WHERE",
    p: ["A query inside brackets runs first and gives a value. Orders bigger than the average completed order:"],
    sql: `SELECT id, total
FROM orders
WHERE status = 'completed'
  AND total > (SELECT AVG(total) FROM orders WHERE status = 'completed')
ORDER BY total DESC;` },
  { h: "The same idea as a CTE",
    p: ["<code>WITH</code> names a step. You then use it like a table. Read it top to bottom like a recipe."],
    sql: `WITH done AS (
  SELECT * FROM orders WHERE status = 'completed'
),
stats AS (
  SELECT AVG(total) AS avg_total FROM done
)
SELECT d.id, d.total, ROUND(s.avg_total) AS average
FROM done d, stats s
WHERE d.total > s.avg_total
ORDER BY d.total DESC;` },
  { h: "Aggregate first, then join (the doubled-totals fix)",
    p: ["Work out item totals per order in one step, then join that to orders. Each order now appears once, so totals are right."],
    sql: `WITH item_totals AS (
  SELECT order_id, SUM(qty * price) AS items_total, COUNT(*) AS lines
  FROM order_items
  GROUP BY order_id
)
SELECT o.id, o.total, t.items_total, t.lines
FROM orders o
JOIN item_totals t ON t.order_id = o.id
ORDER BY o.id;`,
    note: "This is also how you check data: order total should equal the sum of its items. Here they all match." },
  { h: "Several steps: customers above average spend",
    p: ["Step 1: spend per customer. Step 2: the average of those. Step 3: compare."],
    sql: `WITH spend AS (
  SELECT customer_id, SUM(total) AS spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY customer_id
)
SELECT c.name, s.spent
FROM spend s
JOIN customers c ON c.id = s.customer_id
WHERE s.spent > (SELECT AVG(spent) FROM spend)
ORDER BY s.spent DESC;` }
 ],
 mistakes: [
  "A subquery used with <code>=</code> that returns more than one row → error. Use <code>IN</code>, or make sure it returns one value.",
  "Writing one giant query. Break it into CTE steps and run each step alone to check it.",
  "Forgetting the comma between CTEs: <code>WITH a AS (…), b AS (…)</code>."
 ],
 practice: [
  { q: "Products priced above the average product price.", sql: `SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products)
ORDER BY price DESC;` },
  { q: "Using a CTE, find each customer's number of completed orders, then show only customers with 2 or more.", sql: `WITH counts AS (
  SELECT customer_id, COUNT(*) AS n
  FROM orders
  WHERE status = 'completed'
  GROUP BY customer_id
)
SELECT c.name, counts.n
FROM counts JOIN customers c ON c.id = counts.customer_id
WHERE counts.n >= 2
ORDER BY counts.n DESC;` },
  { q: "Check the data: list any order whose total does not equal the sum of its items.", sql: `WITH item_totals AS (
  SELECT order_id, SUM(qty * price) AS items_total
  FROM order_items GROUP BY order_id
)
SELECT o.id, o.total, t.items_total
FROM orders o JOIN item_totals t ON t.order_id = o.id
WHERE o.total <> t.items_total;`, a: "No rows: every order matches. On a real client database, this kind of check often finds bugs." }
 ],
 check: [
  ["What does WITH x AS (…) do?", ["Creates a permanent table", "Names a step you can use later in the same query", "Creates an index", "Starts a transaction"], 1, "A CTE only exists while that one query runs."],
  ["How do you avoid doubled totals when you need both order totals and item counts?", ["Use DISTINCT", "Aggregate the items per order first (CTE), then join", "Use UNION", "Use LIMIT"], 1, "Aggregate the 'many' side first so each order has one row."],
  ["WHERE price = (SELECT price FROM products) errors because…", ["= can't compare numbers", "The subquery returns many rows, but = needs one value", "Missing GROUP BY", "Subqueries aren't allowed in WHERE"], 1, "Use IN for a list, or make the subquery return one value."]
 ],
 remember: [
  "Subquery = a query in brackets that runs first.",
  "CTE: WITH step1 AS (…), step2 AS (…) SELECT … Read top to bottom.",
  "Fix doubled totals: aggregate the child table in a CTE, then join.",
  "Build big queries step by step; run each CTE alone to check it."
 ]
},
{
 id: "window-functions",
 title: "Window functions: rank, running totals, previous row",
 level: "Advanced",
 one: "A <b>window function</b> calculates across related rows <i>without squashing them</i>: you keep every row and add a rank, a running total or the previous value.",
 why: "“Top product per category”, “month-over-month growth”, “each customer's latest order”: these are classic interview questions, and window functions solve them cleanly.",
 steps: [
  { h: "GROUP BY squashes, OVER doesn't",
    p: ["<code>SUM(total) OVER (PARTITION BY customer_id)</code> works out each customer's total but keeps every order row. <code>PARTITION BY</code> is like GROUP BY for windows."],
    sql: `SELECT id, customer_id, total,
       SUM(total) OVER (PARTITION BY customer_id) AS customer_total
FROM orders
WHERE status = 'completed'
ORDER BY customer_id, id;` },
  { h: "Numbering rows: ROW_NUMBER, RANK, DENSE_RANK",
    p: ["Add <code>ORDER BY</code> inside OVER to number rows. On ties, <code>ROW_NUMBER</code> still gives 1, 2, 3; <code>RANK</code> gives 1, 1, 3; <code>DENSE_RANK</code> gives 1, 1, 2."],
    sql: `WITH counts AS (
  SELECT c.name, COUNT(o.id) AS orders
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
  GROUP BY c.name
)
SELECT name, orders,
       ROW_NUMBER() OVER (ORDER BY orders DESC, name) AS row_no,
       RANK()       OVER (ORDER BY orders DESC)       AS rnk,
       DENSE_RANK() OVER (ORDER BY orders DESC)       AS dense
FROM counts
ORDER BY orders DESC, name;`,
    note: "Chen, Divya and Omar tie on 1 order. RANK gives all three 3, then jumps to 6 for Priya. DENSE_RANK gives them 3, then 4." },
  { h: "Top 1 per group",
    p: ["The classic pattern: number rows inside each group, then keep number 1. Each customer's most recent order:"],
    sql: `WITH ranked AS (
  SELECT o.*,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn
  FROM orders o
)
SELECT customer_id, id AS latest_order, order_date, status
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
    note: "You can't filter on a window function in WHERE (it runs at the SELECT step), so you wrap it in a CTE first." },
  { h: "Running totals",
    p: ["<code>SUM(…) OVER (ORDER BY …)</code> adds up everything so far. Revenue growing day by day:"],
    sql: `SELECT order_date, total,
       SUM(total) OVER (ORDER BY order_date) AS running_revenue
FROM orders
WHERE status = 'completed'
ORDER BY order_date;` },
  { h: "Previous row: LAG (and LEAD)",
    p: ["<code>LAG(x)</code> looks one row back; <code>LEAD(x)</code> looks one row ahead. Monthly revenue with change from last month:"],
    sql: `WITH monthly AS (
  SELECT date_trunc('month', order_date)::date AS month, SUM(total) AS revenue
  FROM orders WHERE status = 'completed'
  GROUP BY 1
)
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month)           AS last_month,
       revenue - LAG(revenue) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month;`,
    note: "<code>GROUP BY 1</code> means “group by the first column in SELECT”. June has no previous month, so LAG is NULL." }
 ],
 mistakes: [
  "Filtering on a window function in WHERE → error. Compute it in a CTE, filter outside.",
  "Using RANK when you need exactly one row per group. Ties give two rank-1 rows. Use ROW_NUMBER.",
  "Forgetting ORDER BY inside OVER for ROW_NUMBER, LAG or running totals: the order becomes random."
 ],
 practice: [
  { q: "Most expensive product in each category (one row per category).", sql: `WITH r AS (
  SELECT name, category, price,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
  FROM products
)
SELECT category, name, price FROM r WHERE rn = 1 ORDER BY category;` },
  { q: "For each completed order, show the customer's previous order date (or NULL).", sql: `SELECT customer_id, id, order_date,
       LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS previous_order
FROM orders
WHERE status = 'completed'
ORDER BY customer_id, order_date;` },
  { q: "Each order's share of its customer's total spend, as a percentage (completed only).", sql: `SELECT customer_id, id, total,
       ROUND(100.0 * total / SUM(total) OVER (PARTITION BY customer_id), 1) AS pct_of_customer
FROM orders
WHERE status = 'completed'
ORDER BY customer_id, id;` }
 ],
 check: [
  ["Prices 100, 100, 90 sorted DESC. RANK() gives…", ["1, 2, 3", "1, 1, 2", "1, 1, 3", "1, 2, 2"], 2, "RANK skips after ties: 1, 1, 3. DENSE_RANK would give 1, 1, 2."],
  ["What does PARTITION BY do?", ["Sorts the table", "Splits rows into groups for the window, without squashing them", "Deletes duplicates", "Creates a new table"], 1, "Like GROUP BY, but every row stays."],
  ["Best pattern for 'latest order per customer'?", ["MAX(id) only", "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) = 1", "LIMIT 1", "DISTINCT customer_id"], 1, "Number each customer's orders newest first, keep row 1."]
 ],
 remember: [
  "func() OVER (PARTITION BY group ORDER BY sort): keeps every row.",
  "ROW_NUMBER 1,2,3 · RANK 1,1,3 · DENSE_RANK 1,1,2.",
  "Top-N per group: ROW_NUMBER in a CTE, then WHERE rn <= N.",
  "Running total: SUM(x) OVER (ORDER BY date).",
  "LAG = previous row, LEAD = next row.",
  "Can't filter window results in WHERE: wrap in a CTE."
 ]
},
{
 id: "changing-data",
 title: "Changing data: INSERT, UPDATE, DELETE and UPSERT",
 level: "Intermediate",
 one: "<code>INSERT</code> adds rows, <code>UPDATE</code> changes them, <code>DELETE</code> removes them, and <b>UPSERT</b> inserts or updates in one go.",
 why: "Imports, data fixes and integrations all change data. One wrong UPDATE can damage thousands of rows, so the safe habits here matter more than the syntax.",
 steps: [
  { h: "INSERT: add rows",
    p: ["Name the columns, then give the values. <code>RETURNING</code> shows what was inserted (handy for getting new ids)."],
    sql: `INSERT INTO customers (id, name, city, joined_on)
VALUES (7, 'Rahul Das', 'Chennai', '2025-09-01')
RETURNING *;`,
    note: "Every example in this lesson runs inside a transaction that is rolled back, so the practice data stays the same for you." },
  { h: "UPDATE: change rows (always with WHERE)",
    p: ["<b>Safe habit:</b> first run a SELECT with the same WHERE to see which rows will change. Then run the UPDATE."],
    sql: `UPDATE orders
SET status = 'completed'
WHERE id = 6
RETURNING id, status, total;` },
  { h: "UPDATE using another table",
    p: ["Mark pending orders from Kochi customers as completed. <code>UPDATE … FROM</code> lets you join."],
    sql: `UPDATE orders o
SET status = 'completed'
FROM customers c
WHERE c.id = o.customer_id
  AND c.city = 'Kochi'
  AND o.status = 'pending'
RETURNING o.id, c.name;` },
  { h: "DELETE: remove rows",
    p: ["Same rule: WHERE, and check with SELECT first. A table with a <b>foreign key</b> protects you: you can't delete a customer who still has orders."],
    sql: `DELETE FROM customers WHERE id = 1;`, expectError: true },
  { h: "UPSERT: insert, or update if it already exists",
    p: ["<code>INSERT … ON CONFLICT (key) DO UPDATE</code>. Perfect for syncing data from another system: run it again and again safely. <code>EXCLUDED</code> means “the row you tried to insert”."],
    sql: `INSERT INTO products (id, name, category, price)
VALUES (2, 'Headphones', 'Electronics', 3200),
       (7, 'USB Cable',  'Electronics',  250)
ON CONFLICT (id) DO UPDATE
SET price = EXCLUDED.price
RETURNING id, name, price;`,
    note: "Product 2 already existed, so its price was updated. Product 7 was new, so it was inserted." }
 ],
 mistakes: [
  "UPDATE or DELETE without WHERE changes <b>every row</b>. Always SELECT first, and on real data wrap the change in <code>BEGIN; … COMMIT;</code> so you can ROLLBACK.",
  "Inserting without naming columns: <code>INSERT INTO t VALUES (…)</code> breaks when someone adds a column.",
  "Running an import twice and creating duplicates. Use UPSERT (ON CONFLICT) with a unique key.",
  "Deleting parent rows (customers) before child rows (orders). Delete children first, or rethink why you're deleting."
 ],
 practice: [
  { q: "Add a new product: id 8, 'Bookshelf', 'Furniture', 6500. Return the new row.", sql: `INSERT INTO products (id, name, category, price)
VALUES (8, 'Bookshelf', 'Furniture', 6500)
RETURNING *;` },
  { q: "Increase all Grocery prices by 10%. Return name and new price.", sql: `UPDATE products
SET price = ROUND(price * 1.10, 2)
WHERE category = 'Grocery'
RETURNING name, price;` },
  { q: "Upsert customer 6 (Priya) with city 'Mumbai'. If she exists, only update the city.", sql: `INSERT INTO customers (id, name, city, joined_on)
VALUES (6, 'Priya Nair', 'Mumbai', '2025-05-12')
ON CONFLICT (id) DO UPDATE SET city = EXCLUDED.city
RETURNING *;` }
 ],
 check: [
  ["UPDATE orders SET status = 'cancelled'; (no WHERE) does what?", ["Errors", "Changes nothing", "Cancels every order", "Cancels one order"], 2, "No WHERE means every row."],
  ["What does ON CONFLICT (id) DO UPDATE give you?", ["Faster deletes", "Insert new rows and update existing ones in one statement", "A backup", "Duplicate rows"], 1, "That's an upsert: safe to run repeatedly."],
  ["Best habit before a big UPDATE on real data?", ["Run it and hope", "Run a SELECT with the same WHERE, and use BEGIN … COMMIT", "Drop the table", "Use LIMIT"], 1, "Preview the rows, and keep a way to roll back."]
 ],
 remember: [
  "INSERT INTO t (cols) VALUES (…) RETURNING *.",
  "UPDATE t SET col = … WHERE …; DELETE FROM t WHERE …: never forget WHERE.",
  "SELECT with the same WHERE first. Use BEGIN; … COMMIT; / ROLLBACK; on real data.",
  "UPSERT: INSERT … ON CONFLICT (key) DO UPDATE SET col = EXCLUDED.col.",
  "Foreign keys stop you deleting a parent that still has children."
 ]
}
];
