// SQL course, lessons 11-15.
const BIG = `CREATE TABLE big_orders AS
  SELECT g AS id, (g % 5000) + 1 AS customer_id,
         DATE '2024-01-01' + (g % 600) AS order_date,
         (g % 997) * 10 AS total
  FROM generate_series(1, 200000) AS g;
ANALYZE big_orders;`;

module.exports = [
{
 id: "design",
 title: "Tables, keys and good design",
 level: "Intermediate",
 one: "Good tables have a <b>primary key</b>, link to each other with <b>foreign keys</b>, use the right <b>data types</b>, and store each fact <b>once</b>.",
 why: "Bad design causes wrong reports and endless clean-up. When you build integrations or new features, you'll design tables, and interviewers will ask you to.",
 steps: [
  { h: "Create a table with types and rules",
    p: ["Each column has a <b>type</b>: <code>int</code>, <code>numeric(10,2)</code> for money (never float), <code>text</code>, <code>date</code>, <code>timestamptz</code> (date + time + timezone), <code>boolean</code>, <code>jsonb</code>.",
        "<b>Constraints</b> are rules the database enforces for you: <code>PRIMARY KEY</code> (unique id, not null), <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK</code>, <code>REFERENCES</code> (foreign key), <code>DEFAULT</code>."],
    sql: `CREATE TABLE reviews (
  id          serial PRIMARY KEY,
  product_id  int NOT NULL REFERENCES products(id),
  customer_id int NOT NULL REFERENCES customers(id),
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, customer_id)
);
INSERT INTO reviews (product_id, customer_id, rating) VALUES (1, 1, 5)
RETURNING id, product_id, customer_id, rating;`,
    note: "<code>serial</code> makes the id count up by itself. The UNIQUE rule means one review per customer per product." },
  { h: "The database refuses bad data",
    p: ["That's the point of constraints: bad data never gets in, so you don't have to clean it later. A product with a negative price is rejected:"],
    sql: `INSERT INTO products (id, name, category, price) VALUES (9, 'Broken', 'Misc', -5);`,
    expectError: true },
  { h: "Store each fact once (normalisation)",
    p: ["Don't copy the customer's city into every order. If they move, you'd have to fix every row and you'd miss some. Store the city once in <code>customers</code> and join when you need it.",
        "Rule of thumb: <b>one table per thing</b> (customers, products, orders), and <b>one row per fact</b>. A many-to-many link (orders ↔ products) gets its own table, here <code>order_items</code>.",
        "Sometimes we copy on purpose: <code>order_items.price</code> stores the price <i>at the time of sale</i>, because the product price can change later. That's a deliberate snapshot, not a mistake."] },
  { h: "Change a table with ALTER TABLE",
    p: ["Add a column, add a rule, rename. On a big live table some changes lock it, so they're planned carefully."],
    sql: `ALTER TABLE customers ADD COLUMN email text;
ALTER TABLE customers ADD CONSTRAINT customers_email_key UNIQUE (email);
UPDATE customers SET email = 'asha@example.com' WHERE id = 1;
SELECT id, name, email FROM customers WHERE id <= 2 ORDER BY id;` }
 ],
 mistakes: [
  "Money in <code>float</code>: 0.1 + 0.2 isn't exactly 0.3. Use <code>numeric</code>.",
  "No foreign keys “for speed”. Then orphan rows appear (orders for customers that don't exist).",
  "Storing lists in one column (<code>'1,4,7'</code>). You can't join or index that. Use a link table.",
  "Dates stored as text. Sorting and maths break. Use <code>date</code> or <code>timestamptz</code>."
 ],
 practice: [
  { q: "Design a <code>payments</code> table: each payment belongs to an order, has an amount (money, must be above 0), a method ('card', 'upi' or 'cash') and a paid time defaulting to now.", sql: `CREATE TABLE payments (
  id       serial PRIMARY KEY,
  order_id int NOT NULL REFERENCES orders(id),
  amount   numeric(10,2) NOT NULL CHECK (amount > 0),
  method   text NOT NULL CHECK (method IN ('card','upi','cash')),
  paid_at  timestamptz NOT NULL DEFAULT now()
);
INSERT INTO payments (order_id, amount, method) VALUES (1, 55000, 'upi')
RETURNING id, order_id, amount, method;` },
  { q: "A student can join many courses and a course has many students. How do you store that?", a: "Three tables: <code>students</code>, <code>courses</code>, and a link table <code>enrolments(student_id, course_id, joined_on)</code> with a foreign key to each and <code>UNIQUE (student_id, course_id)</code>." }
 ],
 check: [
  ["Best type for prices?", ["float", "text", "numeric(10,2)", "int"], 2, "numeric is exact. float has rounding errors."],
  ["What does a foreign key do?", ["Makes queries faster", "Makes sure a value points to a real row in another table", "Encrypts the column", "Makes a column unique"], 1, "REFERENCES stops orphan rows."],
  ["Orders and products are many-to-many. How do you store it?", ["A product_ids text column in orders", "A link table like order_items", "Copy all product columns into orders", "You can't"], 1, "Many-to-many needs a link table."]
 ],
 remember: [
  "Every table: PRIMARY KEY. Links: REFERENCES (foreign key).",
  "Rules in the database: NOT NULL, UNIQUE, CHECK, DEFAULT.",
  "Money = numeric, dates = date/timestamptz, never text or float.",
  "Store each fact once; join to combine. Many-to-many → link table.",
  "Snapshot on purpose (price at sale time) is fine."
 ]
},
{
 id: "indexes",
 title: "Indexes and EXPLAIN: making queries fast",
 level: "Advanced",
 one: "An <b>index</b> is like the index at the back of a book: the database jumps to the right rows instead of reading the whole table.",
 why: "A query that takes 0.01 seconds on 10 rows can take a minute on 10 million. Knowing how to read a plan and add the right index is what separates juniors from seniors.",
 steps: [
  { h: "A bigger table to see the difference",
    p: ["Indexes don't matter on 10 rows, so for this lesson imagine a table with <b>200,000 orders</b>. (The setup for it is in the practice section.)",
        "<code>EXPLAIN</code> shows the <b>plan</b>: how the database will find the rows. Without an index it reads every row: a <b>Seq Scan</b> (sequential scan)."],
    pre: BIG,
    sql: `EXPLAIN (COSTS OFF)
SELECT * FROM big_orders WHERE customer_id = 42;` },
  { h: "Add an index, and the plan changes",
    p: ["Now the database uses the index to jump straight to customer 42's rows."],
    pre: BIG,
    sql: `CREATE INDEX big_orders_customer_idx ON big_orders (customer_id);
ANALYZE big_orders;
EXPLAIN (COSTS OFF)
SELECT * FROM big_orders WHERE customer_id = 42;`,
    note: "<b>Bitmap Index Scan</b> and <b>Index Scan</b> both mean the index is used. Run <code>EXPLAIN ANALYZE</code> to see real times. On our test machine this query took about 12 ms without the index and about 0.1 ms with it: over 100 times faster." },
  { h: "Which columns to index",
    p: ["Index columns you often <b>filter</b> (WHERE), <b>join</b> on (foreign keys like customer_id), or <b>sort</b> by. Primary keys and UNIQUE columns get an index automatically.",
        "A <b>composite index</b> covers several columns. Order matters: an index on <code>(customer_id, order_date)</code> helps <code>WHERE customer_id = 42</code> and <code>WHERE customer_id = 42 AND order_date &gt; …</code>, but not <code>WHERE order_date &gt; …</code> alone."],
    pre: BIG,
    sql: `CREATE INDEX big_orders_cust_date_idx ON big_orders (customer_id, order_date);
ANALYZE big_orders;
EXPLAIN (COSTS OFF)
SELECT * FROM big_orders
WHERE customer_id = 42 AND order_date >= '2025-01-01';` },
  { h: "When an index can't help",
    p: ["Wrapping the column in a function hides it from a normal index. <code>WHERE EXTRACT(year FROM order_date) = 2025</code> reads every row. Write it as a range instead: <code>order_date &gt;= '2025-01-01' AND order_date &lt; '2026-01-01'</code>.",
        "<code>LIKE '%tea'</code> (wildcard at the start) can't use a normal index either.",
        "Indexes aren't free: each one takes disk space and slows every INSERT and UPDATE, because the index must be updated too. Add them for real slow queries, not “just in case”."],
    pre: BIG + `\nCREATE INDEX ON big_orders (order_date); ANALYZE big_orders;`,
    sql: `EXPLAIN (COSTS OFF)
SELECT count(*) FROM big_orders WHERE EXTRACT(year FROM order_date) = 2025;` }
 ],
 mistakes: [
  "Adding an index on every column. Writes get slow and most indexes are never used.",
  "Functions on the indexed column in WHERE (<code>LOWER(email) = …</code>, <code>EXTRACT(year …)</code>). Rewrite as a range, or create an index on the expression.",
  "Forgetting to index foreign key columns used in joins (PostgreSQL doesn't do it automatically).",
  "Guessing. Always run <code>EXPLAIN ANALYZE</code> before and after."
 ],
 practice: [
  { q: "Create the 200,000-row table yourself and time a query with and without an index.", sql: BIG + `
-- Now compare:
-- EXPLAIN ANALYZE SELECT * FROM big_orders WHERE customer_id = 42;
-- CREATE INDEX ON big_orders (customer_id);
-- EXPLAIN ANALYZE SELECT * FROM big_orders WHERE customer_id = 42;`, run: false },
  { q: "This is slow: <code>WHERE EXTRACT(month FROM order_date) = 7 AND EXTRACT(year FROM order_date) = 2025</code>. Rewrite it so an index on order_date can be used.", a: "<code>WHERE order_date &gt;= '2025-07-01' AND order_date &lt; '2025-08-01'</code>" },
  { q: "You have an index on <code>(customer_id, order_date)</code>. Will it help <code>WHERE order_date = '2025-07-01'</code>?", a: "Mostly no. A composite index is used from the left. It helps queries that filter on customer_id (and optionally order_date), not order_date alone." }
 ],
 check: [
  ["What does Seq Scan in a plan mean?", ["The index was used", "The whole table was read row by row", "The query failed", "Rows were sorted"], 1, "Seq Scan = read every row."],
  ["Downside of indexes?", ["They make SELECT slower", "They use space and slow down INSERT/UPDATE", "They delete data", "None"], 1, "Every write must also update each index."],
  ["Which WHERE can use a normal index on order_date?", ["EXTRACT(year FROM order_date) = 2025", "order_date >= '2025-01-01' AND order_date < '2026-01-01'", "order_date::text LIKE '2025%'", "None"], 1, "Keep the column bare and use a range."]
 ],
 remember: [
  "Index = jump to rows instead of reading all. Seq Scan = reads all.",
  "Index columns you filter, join (foreign keys) and sort on.",
  "Composite index works left to right: (a, b) helps a, and a+b, not b alone.",
  "Functions on the column hide the index. Use ranges for dates.",
  "Indexes cost space and slow writes. Check with EXPLAIN ANALYZE."
 ]
},
{
 id: "transactions",
 title: "Transactions and locking",
 level: "Advanced",
 one: "A <b>transaction</b> is a group of changes that all succeed or all fail together. <b>Locks</b> stop two people changing the same thing at the same time.",
 why: "Payments, stock and integrations must never be half-done. Interviewers ask about ACID and race conditions, and real bugs come from getting this wrong.",
 steps: [
  { h: "All or nothing",
    p: ["Moving 1 unit of stock from warehouse A to B is two updates. If the second fails after the first succeeds, a unit disappears. Wrap them in a transaction:",
        "<code>BEGIN</code> starts it, <code>COMMIT</code> saves everything, <code>ROLLBACK</code> undoes everything since BEGIN. If any statement errors, PostgreSQL refuses further statements until you ROLLBACK."],
    sql: `BEGIN;
UPDATE stock SET qty = qty - 1 WHERE warehouse = 'A' AND product_id = 7;
UPDATE stock SET qty = qty + 1 WHERE warehouse = 'B' AND product_id = 7;
COMMIT;   -- or ROLLBACK; to undo both`, run: false },
  { h: "ACID in plain words",
    p: ["<b>Atomic</b>: all or nothing. <b>Consistent</b>: rules (constraints) are never broken. <b>Isolated</b>: transactions running at the same time don't see each other's half-finished work. <b>Durable</b>: once committed, it survives a crash."] },
  { h: "The race condition: two buyers, one item",
    p: ["Stock is 1. Two people click Buy at the same moment. Both read <code>qty = 1</code>, both think “in stock”, both sell. Now you've sold 2 of 1.",
        "<b>Fix 1, one statement that checks and changes:</b> the database does both steps at once, so only one buyer can win. Stock for product 7 is 1. The first buyer runs:"],
    pre: `CREATE TABLE stock (product_id int PRIMARY KEY, qty int NOT NULL);
INSERT INTO stock VALUES (7, 1);`,
    sql: `UPDATE stock SET qty = qty - 1
WHERE product_id = 7 AND qty > 0
RETURNING product_id, qty;`,
    note: "One row came back, so the sale worked and stock is now 0. When the second buyer runs the same statement, <code>qty &gt; 0</code> is false, it returns <b>no rows</b>, and the app shows “sold out”." },
  { h: "Fix 2: lock the row with FOR UPDATE",
    p: ["<code>SELECT … FOR UPDATE</code> locks the rows you read. A second transaction that wants the same row waits until the first one finishes."],
    sql: `BEGIN;
SELECT qty FROM stock WHERE product_id = 7 FOR UPDATE;  -- others wait here
-- your code checks qty > 0
UPDATE stock SET qty = qty - 1 WHERE product_id = 7;
COMMIT;                                                  -- lock released`, run: false },
  { h: "Isolation levels and deadlocks",
    p: ["PostgreSQL's default is <b>Read Committed</b>: each statement sees data committed before it started. Stricter modes like <b>Repeatable Read</b> stop a transaction when someone else changed the same data first. You get a 'could not serialize access' error, and the app should simply try again.",
        "A <b>deadlock</b> is when transaction 1 holds row A and waits for B, while transaction 2 holds B and waits for A. PostgreSQL cancels one of them. Avoid it by always locking rows in the same order (for example, by id), and keep transactions short."] }
 ],
 mistakes: [
  "Read, then decide in app code, then write, without a lock. That's the race condition.",
  "Long transactions (waiting for an API call or a user while holding locks). Everyone else waits.",
  "Forgetting to COMMIT. Your changes are invisible to others and are lost when you disconnect.",
  "Not retrying when the database reports a serialization failure or a deadlock."
 ],
 practice: [
  { q: "Write the safe one-statement way to take 1 unit from stock for product 7, only if there's stock.", a: "<code>UPDATE stock SET qty = qty - 1 WHERE product_id = 7 AND qty &gt; 0 RETURNING qty;</code> If no row comes back, it's sold out." },
  { q: "Explain ACID in one line each.", a: "Atomic: all or nothing. Consistent: rules always hold. Isolated: parallel transactions don't see each other's unfinished work. Durable: committed data survives crashes." },
  { q: "Two jobs update the same two accounts in opposite order and sometimes deadlock. How do you fix it?", a: "Make both jobs lock and update rows in the same order (for example, lowest id first), keep the transactions short, and retry if a deadlock still happens." }
 ],
 check: [
  ["What does ROLLBACK do?", ["Saves changes", "Undoes all changes since BEGIN", "Deletes the table", "Restarts the server"], 1, "ROLLBACK cancels the whole transaction."],
  ["Two users buy the last item at once. Safest fix?", ["Check stock in app code first", "UPDATE … SET qty = qty - 1 WHERE … AND qty > 0", "Add an index", "Use UNION"], 1, "Check and change in one statement (or lock with FOR UPDATE)."],
  ["The 'A' in ACID stands for…", ["Available", "Atomic", "Accurate", "Async"], 1, "Atomic: all or nothing."]
 ],
 remember: [
  "BEGIN … COMMIT saves all; ROLLBACK undoes all.",
  "ACID: Atomic, Consistent, Isolated, Durable.",
  "Race condition fix: check-and-change in one UPDATE, or SELECT … FOR UPDATE.",
  "Default isolation: Read Committed. Stricter modes can fail: retry.",
  "Deadlocks: lock in the same order, keep transactions short."
 ]
},
{
 id: "advanced",
 title: "Advanced tools: JSON, filling gaps, trees, views, paging",
 level: "Advanced",
 one: "PostgreSQL can store and query <b>JSON</b>, generate missing dates, walk <b>trees</b> with recursive queries, save queries as <b>views</b>, and page through big results.",
 why: "APIs send JSON, reports need every day even with no sales, org charts are trees, and apps show results page by page. These come up constantly in integration and data work.",
 steps: [
  { h: "JSON: storing API data",
    p: ["The <code>jsonb</code> type stores JSON. <code>-&gt;</code> gets a value as JSON, <code>-&gt;&gt;</code> gets it as text. Cast the text to use it as a number."],
    sql: `WITH events AS (
  SELECT '{"order_id": 6, "source": "app", "items": [{"sku": "LAP", "qty": 1}]}'::jsonb AS payload
)
SELECT payload->>'source'               AS source,
       (payload->>'order_id')::int      AS order_id,
       payload->'items'->0->>'sku'      AS first_sku,
       jsonb_array_length(payload->'items') AS item_count
FROM events;` },
  { h: "Turning rows into JSON",
    p: ["Handy when an API wants JSON. <code>jsonb_build_object</code> makes an object; <code>jsonb_agg</code> collects rows into an array."],
    sql: `SELECT jsonb_build_object(
         'order_id', o.id,
         'items', jsonb_agg(jsonb_build_object('product', p.name, 'qty', i.qty))
       ) AS order_json
FROM orders o
JOIN order_items i ON i.order_id = o.id
JOIN products p    ON p.id = i.product_id
WHERE o.id = 2
GROUP BY o.id;` },
  { h: "Filling gaps with generate_series",
    p: ["A sales report by day skips days with no sales. Generate every day, then LEFT JOIN the sales so empty days show 0."],
    sql: `SELECT d::date AS day, COALESCE(SUM(o.total), 0) AS revenue
FROM generate_series(DATE '2025-07-01', DATE '2025-07-07', INTERVAL '1 day') AS d
LEFT JOIN orders o ON o.order_date = d::date AND o.status = 'completed'
GROUP BY d
ORDER BY d;` },
  { h: "Trees with a recursive CTE",
    p: ["<code>WITH RECURSIVE</code> starts with some rows, then keeps adding the rows linked to them until there are none left. The whole org chart under Meera, with each person's level:"],
    sql: `WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS level, name::text AS path
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.level + 1, c.path || ' > ' || e.name
  FROM employees e
  JOIN chain c ON e.manager_id = c.id
)
SELECT level, name, path FROM chain ORDER BY path;` },
  { h: "Views: save a query with a name",
    p: ["A <b>view</b> is a saved SELECT that you can query like a table. Great for reports other people reuse."],
    sql: `CREATE VIEW completed_sales AS
SELECT o.id, c.name AS customer, o.order_date, o.total
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'completed';

SELECT customer, SUM(total) AS spent
FROM completed_sales
GROUP BY customer
ORDER BY spent DESC
LIMIT 3;` },
  { h: "Paging through results",
    p: ["<code>LIMIT 3 OFFSET 3</code> gives page 2 of 3 rows. It's simple, but on deep pages the database still reads and throws away all the earlier rows.",
        "<b>Keyset paging</b> is faster: remember the last id you showed and ask for rows after it."],
    sql: `-- page after the row with id 3
SELECT id, order_date, total
FROM orders
WHERE id > 3
ORDER BY id
LIMIT 3;` }
 ],
 mistakes: [
  "Putting everything in jsonb because it's easy. Columns you filter or join on belong in normal columns.",
  "Forgetting <code>-&gt;&gt;</code> returns text: <code>payload-&gt;&gt;'qty' &gt; 5</code> compares text. Cast: <code>(payload-&gt;&gt;'qty')::int</code>.",
  "A recursive CTE with no stopping point (a loop in the data) runs forever. Add a level limit if loops are possible.",
  "Deep OFFSET paging on big tables. Use keyset paging."
 ],
 practice: [
  { q: "Show monthly completed revenue for June to September 2025, with 0 for months with no sales.", sql: `SELECT m::date AS month, COALESCE(SUM(o.total), 0) AS revenue
FROM generate_series(DATE '2025-06-01', DATE '2025-09-01', INTERVAL '1 month') AS m
LEFT JOIN orders o ON date_trunc('month', o.order_date) = m AND o.status = 'completed'
GROUP BY m
ORDER BY m;` },
  { q: "Find everyone who reports to Arjun, directly or indirectly.", sql: `WITH RECURSIVE team AS (
  SELECT id, name FROM employees WHERE manager_id = 2
  UNION ALL
  SELECT e.id, e.name FROM employees e JOIN team t ON e.manager_id = t.id
)
SELECT name FROM team ORDER BY name;` },
  { q: "Return each customer as JSON: {\"name\": …, \"orders\": count}.", sql: `SELECT jsonb_build_object('name', c.name, 'orders', COUNT(o.id)) AS customer_json
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;` }
 ],
 check: [
  ["payload->>'source' returns…", ["JSON", "Text", "A number", "An array"], 1, "->> gives text; -> gives JSON."],
  ["How do you show days with no sales as 0?", ["Use INNER JOIN", "generate_series of days LEFT JOIN sales, COALESCE(SUM, 0)", "Use DISTINCT", "It's impossible"], 1, "Generate all days first, then LEFT JOIN."],
  ["What is a view?", ["A copy of a table", "A saved SELECT you can query like a table", "An index", "A backup"], 1, "A view stores the query, not the data."]
 ],
 remember: [
  "jsonb: -> gives JSON, ->> gives text; cast to use numbers.",
  "jsonb_build_object / jsonb_agg build JSON from rows.",
  "Missing days: generate_series + LEFT JOIN + COALESCE.",
  "Trees: WITH RECURSIVE (start rows UNION ALL linked rows).",
  "View = saved query. Keyset paging (WHERE id > last) beats deep OFFSET."
 ]
},
{
 id: "practice",
 title: "Interview practice: real business questions",
 level: "Interview",
 one: "These are the SQL questions interviewers ask most. Try each one yourself first, then open the answer.",
 why: "Interviews test patterns, not memory. If you can solve these on the practice shop, you can solve the same patterns on any database.",
 steps: [
  { h: "Q1. Second highest price",
    p: ["Classic. Use DENSE_RANK so ties don't break it (or ORDER BY … OFFSET 1 LIMIT 1 when ties don't matter)."],
    sql: `SELECT name, price
FROM (
  SELECT name, price, DENSE_RANK() OVER (ORDER BY price DESC) AS r
  FROM products
) t
WHERE r = 2;` },
  { h: "Q2. Find duplicates",
    p: ["Group by the column(s) that should be unique and keep groups with more than one row. Imagine an imported <code>contacts</code> table where some people were added twice:"],
    pre: `CREATE TABLE contacts AS SELECT id, name, city FROM customers;
INSERT INTO contacts VALUES (11, 'Asha Rao', 'Kochi'), (12, 'Ben Thomas', 'Bengaluru');`,
    sql: `SELECT name, city, COUNT(*) AS copies, MIN(id) AS keep_id
FROM contacts
GROUP BY name, city
HAVING COUNT(*) > 1
ORDER BY name;` },
  { h: "Q3. Delete duplicates, keep one",
    p: ["Number the copies with ROW_NUMBER and delete everything after the first. Same messy <code>contacts</code> table: keep the lowest id of each person."],
    pre: `CREATE TABLE contacts AS SELECT id, name, city FROM customers;
INSERT INTO contacts VALUES (11, 'Asha Rao', 'Kochi'), (12, 'Ben Thomas', 'Bengaluru');`,
    sql: `DELETE FROM contacts
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, city ORDER BY id) AS rn
    FROM contacts
  ) t
  WHERE rn > 1
)
RETURNING id, name;` },
  { h: "Q4. Top customer per city",
    p: ["Top-N per group: ROW_NUMBER inside a CTE."],
    sql: `WITH spend AS (
  SELECT c.city, c.name, SUM(o.total) AS spent,
         ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY SUM(o.total) DESC) AS rn
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
  GROUP BY c.city, c.name
)
SELECT city, name, spent FROM spend WHERE rn = 1 ORDER BY spent DESC;` },
  { h: "Q5. Month-over-month growth %",
    p: ["Monthly totals in a CTE, then LAG for last month. <code>NULLIF(x, 0)</code> avoids dividing by zero."],
    sql: `WITH m AS (
  SELECT date_trunc('month', order_date)::date AS month, SUM(total) AS revenue
  FROM orders WHERE status = 'completed' GROUP BY 1
)
SELECT month, revenue,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS growth_pct
FROM m ORDER BY month;` },
  { h: "Q6. First order and repeat customers",
    p: ["When did each customer first order, and did they come back?"],
    sql: `SELECT c.name,
       MIN(o.order_date) AS first_order,
       COUNT(o.id)       AS orders,
       CASE WHEN COUNT(o.id) > 1 THEN 'repeat' ELSE 'one-time' END AS type
FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
GROUP BY c.name
ORDER BY first_order;` },
  { h: "Q7. Customers who bought both Electronics and Grocery",
    p: ["Group per customer and count the different categories they bought, keeping only the two we care about."],
    sql: `SELECT c.name
FROM customers c
JOIN orders o      ON o.customer_id = c.id AND o.status = 'completed'
JOIN order_items i ON i.order_id = o.id
JOIN products p    ON p.id = i.product_id
WHERE p.category IN ('Electronics', 'Grocery')
GROUP BY c.name
HAVING COUNT(DISTINCT p.category) = 2
ORDER BY c.name;` },
  { h: "Q8. Each product's share of revenue",
    p: ["A window SUM with an empty <code>OVER ()</code> gives the grand total on every row."],
    sql: `SELECT p.name, SUM(i.qty * i.price) AS revenue,
       ROUND(100.0 * SUM(i.qty * i.price) / SUM(SUM(i.qty * i.price)) OVER (), 1) AS pct
FROM order_items i
JOIN products p ON p.id = i.product_id
JOIN orders o   ON o.id = i.order_id AND o.status = 'completed'
GROUP BY p.name
ORDER BY revenue DESC;` }
 ],
 mistakes: [
  "Jumping into writing. First say out loud: which tables, which rows count (status?), what one row of the answer means.",
  "Forgetting edge cases: NULLs, ties, customers with zero orders, cancelled orders.",
  "Not checking your result. Pick one customer and verify their number by hand."
 ],
 practice: [
  { q: "Which day of the week has the most completed revenue?", sql: `SELECT to_char(order_date, 'FMDay') AS weekday, SUM(total) AS revenue
FROM orders WHERE status = 'completed'
GROUP BY weekday ORDER BY revenue DESC LIMIT 1;` },
  { q: "Average number of items per completed order.", sql: `SELECT ROUND(AVG(items), 2) AS avg_items
FROM (
  SELECT o.id, SUM(i.qty) AS items
  FROM orders o JOIN order_items i ON i.order_id = o.id
  WHERE o.status = 'completed'
  GROUP BY o.id
) t;` },
  { q: "Customers whose latest order is more than 30 days before 2025-09-01 (at risk of leaving).", sql: `SELECT c.name, MAX(o.order_date) AS last_order
FROM customers c JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
HAVING MAX(o.order_date) < DATE '2025-09-01' - 30
ORDER BY last_order;` },
  { q: "In words: what's the difference between WHERE and HAVING, and between UNION and UNION ALL?", a: "WHERE filters rows before grouping; HAVING filters groups after. UNION removes duplicates; UNION ALL keeps every row and is faster." }
 ],
 check: [
  ["Second highest price, safe with ties?", ["MAX(price) - 1", "DENSE_RANK() OVER (ORDER BY price DESC) = 2", "ORDER BY price LIMIT 2", "MIN(price)"], 1, "DENSE_RANK handles ties correctly."],
  ["To keep one copy of duplicate rows you…", ["DELETE everything", "Number copies with ROW_NUMBER() OVER (PARTITION BY …) and delete rn > 1", "Use UNION", "Use LIMIT 1"], 1, "Partition by the columns that define a duplicate."],
  ["Dividing by a value that might be 0 safely:", ["x / y", "x / NULLIF(y, 0)", "x / COALESCE(y, 0)", "x / (y + 0)"], 1, "NULLIF turns 0 into NULL, so the result is NULL instead of an error."]
 ],
 remember: [
  "Nth highest: DENSE_RANK() OVER (ORDER BY x DESC) = N.",
  "Duplicates: GROUP BY key HAVING COUNT(*) > 1. Delete: ROW_NUMBER() … rn > 1.",
  "Top per group: ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC) = 1.",
  "Growth: LAG in a window; divide with NULLIF(x, 0).",
  "Share of total: x / SUM(x) OVER ().",
  "Before writing: which tables, which rows count, what one result row means."
 ]
}
];
