// SQL course, lessons 1-5. Every `sql` is run on PostgreSQL by build.js and its real result is stored.
module.exports = [
{
 id: "start-here",
 title: "Start here: what SQL is, and your practice database",
 level: "Beginner",
 one: "SQL is the language you use to ask a database questions, like <i>“which customers spent the most last month?”</i>",
 why: "Almost every tech job touches data. Developers, data engineers, AI engineers and consultants all use SQL to check data, build reports, find bugs and move data between systems. It is the one skill that appears in nearly every job post.",
 steps: [
  { h: "A database is a set of tables",
    p: ["A <b>table</b> is like a spreadsheet: it has <b>columns</b> (name, city…) and <b>rows</b> (one row per customer).",
        "Each row has an <b>id</b> that is never repeated. Other tables point to that id. For example, an order stores <code>customer_id = 1</code> to say “this order belongs to customer 1”.",
        "Here is the <code>customers</code> table from your practice shop:"],
    sql: `SELECT * FROM customers;`,
    note: "<code>*</code> means “all columns”. Priya has no city, so it shows as <code>NULL</code>, which means “unknown / empty”." },
  { h: "The practice shop: five tables",
    p: ["Every lesson in this course uses the same small online shop, so you always know what the data looks like:",
        "<b>customers</b>: who buys. <b>products</b>: what we sell. <b>orders</b>: one row per order, with a <code>status</code> (completed, pending or cancelled) and a <code>total</code>. <b>order_items</b>: the lines inside an order (which product, how many, at what price). <b>employees</b>: staff and their manager.",
        "The products:"],
    sql: `SELECT * FROM products;` },
  { h: "How the tables connect",
    p: ["<code>orders.customer_id</code> points to <code>customers.id</code>. <code>order_items.order_id</code> points to <code>orders.id</code>, and <code>order_items.product_id</code> points to <code>products.id</code>.",
        "So one customer has many orders, and one order has many items. Keep this picture in your head; it matters a lot in the JOIN lesson.",
        "The orders:"],
    sql: `SELECT * FROM orders;` },
  { h: "Set up the database on your computer (10 minutes)",
    p: ["<b>1.</b> Install PostgreSQL. On Ubuntu: <code>sudo apt install postgresql</code>. On Mac: install <i>Postgres.app</i>. On Windows: use the installer from postgresql.org.",
        "<b>2.</b> Create a database and open it: <code>createdb learn</code>, then <code>psql learn</code>. (On Ubuntu you may first need <code>sudo -u postgres createuser -s $USER</code>.)",
        "<b>3.</b> Copy the script below, paste it into psql and press Enter. It creates all five tables with data. Run it again any time to reset everything.",
        "<b>No install?</b> Open any free online PostgreSQL playground (search “PostgreSQL online”), paste the script and run it there."],
    sql: "SETUP", run: false }
 ],
 mistakes: [
  "Copying examples instead of typing them. Typing is how your hands and brain learn the patterns. Type every query in this course.",
  "Forgetting the semicolon <code>;</code> at the end. In psql nothing happens until you type it.",
  "Being afraid to break things. This is a practice database: run the setup script again and it's fresh."
 ],
 practice: [
  { q: "Show every column of the <code>order_items</code> table.", sql: `SELECT * FROM order_items;` },
  { q: "Show every employee. Who has no manager?", sql: `SELECT * FROM employees;`, a: "Meera has <code>manager_id</code> NULL, so she is the top boss." }
 ],
 check: [
  ["In a table, what is a row?", ["A type of data, like text or number", "One record, for example one customer", "The name of a column", "A database"], 1, "Columns are the fields (name, city). Each row is one record."],
  ["What does NULL mean?", ["Zero", "An empty string ''", "Unknown or missing value", "An error"], 2, "NULL means “no value”. It is not 0 and not an empty string."],
  ["orders.customer_id = 3 means…", ["The order has 3 items", "The order belongs to the customer whose id is 3", "It is the third order", "The order total is 3"], 1, "A column like customer_id stores the id of a row in another table. That's how tables connect."]
 ],
 remember: [
  "Table = columns (fields) + rows (records). Each row has a unique id.",
  "Tables connect by storing another table's id, e.g. orders.customer_id → customers.id.",
  "NULL = unknown/missing. Not 0, not ''.",
  "One customer → many orders → many order_items."
 ]
},
{
 id: "run-order-select",
 title: "SELECT, WHERE, ORDER BY and LIMIT",
 level: "Beginner",
 one: "<code>SELECT</code> picks columns, <code>WHERE</code> picks rows, <code>ORDER BY</code> sorts them, <code>LIMIT</code> keeps the first few.",
 why: "These four words answer most everyday questions: “show me pending orders”, “who joined this year?”, “what are our 3 most expensive products?”.",
 steps: [
  { h: "Pick columns with SELECT",
    p: ["List the columns you want, separated by commas. Use <code>AS</code> to give a column a nicer name in the result."],
    sql: `SELECT name, price AS price_inr
FROM products;` },
  { h: "Pick rows with WHERE",
    p: ["<code>WHERE</code> keeps only rows where the condition is true. Text goes in single quotes: <code>'Kochi'</code>.",
        "Comparison signs: <code>=</code>, <code>&lt;&gt;</code> (not equal), <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>. Combine conditions with <code>AND</code> / <code>OR</code>."],
    sql: `SELECT id, customer_id, total
FROM orders
WHERE status = 'completed' AND total > 5000;` },
  { h: "Handy filters: IN, BETWEEN, LIKE",
    p: ["<code>IN (...)</code> matches any value in a list. <code>BETWEEN a AND b</code> includes both ends. <code>LIKE '%tea%'</code> finds text containing “tea”; <code>ILIKE</code> does the same but ignores upper/lower case.",
        "<code>%</code> means “any characters”. So <code>'C%'</code> = starts with C."],
    sql: `SELECT name, category, price
FROM products
WHERE category IN ('Grocery', 'Stationery')
   OR name ILIKE '%chair%';` },
  { h: "NULL needs IS NULL",
    p: ["NULL is “unknown”, so <code>city = NULL</code> is never true; it finds nothing. Always write <code>IS NULL</code> or <code>IS NOT NULL</code>."],
    sql: `SELECT name FROM customers WHERE city IS NULL;` },
  { h: "Sort with ORDER BY, keep a few with LIMIT",
    p: ["<code>ORDER BY</code> sorts ascending (small → big, A → Z). Add <code>DESC</code> for big → small. You can sort by several columns.",
        "<code>LIMIT 3</code> keeps the first 3 rows <i>after</i> sorting. Without ORDER BY the order is random, so LIMIT alone gives random rows."],
    sql: `SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 3;` },
  { h: "Remove duplicates with DISTINCT",
    p: ["<code>DISTINCT</code> shows each different value once."],
    sql: `SELECT DISTINCT city
FROM customers
ORDER BY city;`,
    note: "NULL sorts last in ascending order in PostgreSQL." }
 ],
 mistakes: [
  "<code>WHERE city = NULL</code>: finds nothing. Use <code>IS NULL</code>.",
  "Double quotes for text: <code>\"Kochi\"</code> means a <i>column</i> named Kochi. Text values use single quotes <code>'Kochi'</code>.",
  "<code>LIMIT</code> without <code>ORDER BY</code>: you get random rows, and they can change between runs.",
  "Mixing AND/OR without brackets. <code>a OR b AND c</code> means <code>a OR (b AND c)</code>. Add brackets to say what you mean."
 ],
 practice: [
  { q: "Show the name and price of products that cost less than 1,000, cheapest first.", sql: `SELECT name, price
FROM products
WHERE price < 1000
ORDER BY price;` },
  { q: "Show orders placed in July 2025 (id, order_date, status).", sql: `SELECT id, order_date, status
FROM orders
WHERE order_date BETWEEN '2025-07-01' AND '2025-07-31'
ORDER BY order_date;` },
  { q: "Which customers live in Kochi or Dubai? Show name and city, sorted by city then name.", sql: `SELECT name, city
FROM customers
WHERE city IN ('Kochi', 'Dubai')
ORDER BY city, name;` }
 ],
 check: [
  ["Which finds customers with no city?", ["WHERE city = NULL", "WHERE city IS NULL", "WHERE city = ''", "WHERE city == NULL"], 1, "Comparing with = NULL is never true. Use IS NULL."],
  ["ORDER BY price DESC LIMIT 1 returns…", ["The cheapest product", "The most expensive product", "A random product", "All products"], 1, "DESC sorts big to small, LIMIT 1 keeps the first row: the most expensive."],
  ["name LIKE 'C%' matches…", ["Names ending in C", "Names containing C anywhere", "Names starting with C", "Only the name 'C'"], 2, "% means any characters, so 'C%' is C followed by anything."]
 ],
 remember: [
  "SELECT columns · FROM table · WHERE rows · ORDER BY sort · LIMIT n.",
  "Text in single quotes 'Kochi'. Double quotes are for column names.",
  "NULL: use IS NULL / IS NOT NULL, never = NULL.",
  "IN (list), BETWEEN a AND b (both ends included), LIKE / ILIKE with %.",
  "LIMIT without ORDER BY = random rows."
 ]
},
{
 id: "query-order",
 title: "The order SQL runs in (very important)",
 level: "Beginner",
 one: "You <i>write</i> SELECT first, but the database <i>runs</i> it in this order: <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>.",
 why: "This one idea explains most confusing SQL errors, like “why can't I use my alias in WHERE?”. Interviewers love asking it.",
 steps: [
  { h: "The seven steps",
    p: ["<b>1. FROM</b>: take the table (and joins). <b>2. WHERE</b>: throw away rows. <b>3. GROUP BY</b>: put rows into groups. <b>4. HAVING</b>: throw away groups. <b>5. SELECT</b>: work out the columns. <b>6. ORDER BY</b>: sort. <b>7. LIMIT</b>: keep the first few.",
        "Think of it like cooking: get the ingredients (FROM), wash out the bad ones (WHERE), sort into bowls (GROUP BY), throw away bowls you don't need (HAVING), then plate it (SELECT), arrange it (ORDER BY) and serve a few (LIMIT)."] },
  { h: "Why an alias doesn't work in WHERE",
    p: ["The alias <code>line_total</code> is created in step 5 (SELECT). WHERE runs in step 2, before the alias exists. So this fails:"],
    sql: `SELECT id, qty * price AS line_total
FROM order_items
WHERE line_total > 5000;`, expectError: true },
  { h: "Fix: repeat the expression",
    p: ["Write the calculation again in WHERE. (Or use a CTE, which you'll learn later.)"],
    sql: `SELECT id, qty * price AS line_total
FROM order_items
WHERE qty * price > 5000;` },
  { h: "But ORDER BY can use the alias",
    p: ["ORDER BY runs in step 6, after SELECT, so the alias exists by then."],
    sql: `SELECT id, qty * price AS line_total
FROM order_items
ORDER BY line_total DESC
LIMIT 3;` }
 ],
 mistakes: [
  "Using a SELECT alias in WHERE or HAVING. They run before SELECT. (PostgreSQL does allow aliases in GROUP BY, as a convenience.)",
  "Putting a condition on a total (like SUM) in WHERE. Totals don't exist yet at step 2. That's what HAVING is for (next lesson)."
 ],
 practice: [
  { q: "Without running it: in <code>SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT 5</code>, does LIMIT run before or after ORDER BY?", a: "After. ORDER BY is step 6, LIMIT is step 7. So you get the top 5 of the sorted result." },
  { q: "Show order items where qty × price is at least 3,000, with the line total named <code>line_total</code>, biggest first.", sql: `SELECT id, order_id, qty * price AS line_total
FROM order_items
WHERE qty * price >= 3000
ORDER BY line_total DESC;` }
 ],
 check: [
  ["Which runs first?", ["SELECT", "WHERE", "ORDER BY", "LIMIT"], 1, "Order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT."],
  ["Why does WHERE line_total > 5000 fail when line_total is a SELECT alias?", ["Aliases must be in quotes", "WHERE runs before SELECT, so the alias doesn't exist yet", "You can't compare numbers in WHERE", "line_total is a reserved word"], 1, "WHERE is step 2, SELECT is step 5."],
  ["Can ORDER BY use a SELECT alias?", ["Yes, it runs after SELECT", "No, never", "Only with DESC", "Only with LIMIT"], 0, "ORDER BY is step 6, after SELECT."]
 ],
 remember: [
  "Run order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
  "WHERE filters rows (before grouping). HAVING filters groups (after grouping).",
  "A SELECT alias can be used in ORDER BY, not in WHERE."
 ]
},
{
 id: "group-by",
 title: "Counting and totals: GROUP BY and HAVING",
 level: "Beginner",
 one: "<code>GROUP BY</code> puts rows into groups and <b>aggregate functions</b> (COUNT, SUM, AVG, MIN, MAX) give one answer per group.",
 why: "Every report is a total of something: sales per month, orders per customer, revenue per product. This is the most used SQL in real jobs.",
 steps: [
  { h: "Aggregates on the whole table",
    p: ["Without GROUP BY, an aggregate squashes the whole table into one row."],
    sql: `SELECT COUNT(*)   AS orders,
       SUM(total) AS revenue,
       ROUND(AVG(total), 2) AS avg_order,
       MAX(total) AS biggest
FROM orders
WHERE status = 'completed';`,
    note: "AVG gives many decimals on its own, so we wrap it in <code>ROUND(…, 2)</code>." },
  { h: "One row per group",
    p: ["<code>GROUP BY status</code> makes one group per status. Each aggregate is worked out inside each group."],
    sql: `SELECT status, COUNT(*) AS orders, SUM(total) AS amount
FROM orders
GROUP BY status
ORDER BY amount DESC;` },
  { h: "The golden rule",
    p: ["Every column in SELECT must be either <b>in GROUP BY</b> or <b>inside an aggregate</b>. Otherwise the database doesn't know which value to show, so it errors:"],
    sql: `SELECT customer_id, order_date, SUM(total)
FROM orders
GROUP BY customer_id;`, expectError: true },
  { h: "Filter groups with HAVING",
    p: ["WHERE filters rows <i>before</i> grouping. HAVING filters groups <i>after</i>. Here: completed orders only (WHERE), then keep customers who spent over 10,000 (HAVING)."],
    sql: `SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spent
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
HAVING SUM(total) > 10000
ORDER BY spent DESC;` },
  { h: "COUNT(*) vs COUNT(column) vs COUNT(DISTINCT …)",
    p: ["<code>COUNT(*)</code> counts rows. <code>COUNT(city)</code> counts rows where city is not NULL. <code>COUNT(DISTINCT city)</code> counts different cities."],
    sql: `SELECT COUNT(*)             AS customers,
       COUNT(city)          AS with_city,
       COUNT(DISTINCT city) AS cities
FROM customers;` },
  { h: "Group by a calculated value",
    p: ["You can group by an expression. <code>date_trunc('month', order_date)</code> turns every date into the first day of its month, so you get one row per month."],
    sql: `SELECT date_trunc('month', order_date)::date AS month,
       COUNT(*)   AS orders,
       SUM(total) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY month
ORDER BY month;` }
 ],
 mistakes: [
  "A column in SELECT that is not in GROUP BY and not aggregated → error.",
  "<code>WHERE SUM(total) &gt; 1000</code> → error. Conditions on totals go in HAVING.",
  "Forgetting that SUM/AVG/COUNT(column) skip NULLs. AVG of (10, NULL, 20) is 15, not 10.",
  "Counting cancelled orders as sales. Always ask: which statuses count?"
 ],
 practice: [
  { q: "How many customers are there in each city? Show city and count, biggest first.", sql: `SELECT city, COUNT(*) AS customers
FROM customers
GROUP BY city
ORDER BY customers DESC;`, a: "The empty city is Priya (NULL). GROUP BY puts all NULLs into one group." },
  { q: "Total quantity sold per product_id (all order items), only products with more than 3 units.", sql: `SELECT product_id, SUM(qty) AS units
FROM order_items
GROUP BY product_id
HAVING SUM(qty) > 3
ORDER BY units DESC;` },
  { q: "Average price per category, rounded to 0 decimals.", sql: `SELECT category, ROUND(AVG(price)) AS avg_price
FROM products
GROUP BY category
ORDER BY avg_price DESC;` }
 ],
 check: [
  ["Which keeps only customers with more than 2 orders?", ["WHERE COUNT(*) > 2", "HAVING COUNT(*) > 2", "LIMIT 2", "ORDER BY COUNT(*) > 2"], 1, "Conditions on aggregates go in HAVING."],
  ["COUNT(city) on customers returns 5, COUNT(*) returns 6. Why?", ["One row is a duplicate", "One customer has city NULL, and COUNT(column) skips NULLs", "COUNT(*) counts the header", "A bug"], 1, "COUNT(column) ignores NULLs."],
  ["SELECT city, name, COUNT(*) FROM customers GROUP BY city; …", ["Works", "Errors, because name is not grouped or aggregated", "Returns one row", "Returns names only"], 1, "Every selected column must be in GROUP BY or inside an aggregate."]
 ],
 remember: [
  "COUNT, SUM, AVG, MIN, MAX = one answer per group.",
  "Every SELECT column: in GROUP BY or inside an aggregate.",
  "WHERE = filter rows before grouping. HAVING = filter groups after.",
  "COUNT(*) counts rows; COUNT(col) skips NULLs; COUNT(DISTINCT col) counts different values.",
  "Per month: GROUP BY date_trunc('month', date)."
 ]
},
{
 id: "case-dates-text",
 title: "Handy tools: CASE, COALESCE, dates and text",
 level: "Beginner+",
 one: "<code>CASE</code> is SQL's if/else, <code>COALESCE</code> replaces NULL with a default, and date and text functions clean up values.",
 why: "Real reports need labels (“big order”), defaults (“unknown city”), months and clean names. These small tools make results readable.",
 steps: [
  { h: "CASE: if / else inside a query",
    p: ["<code>CASE WHEN condition THEN value … ELSE value END</code>. Conditions are checked top to bottom; the first true one wins."],
    sql: `SELECT id, total,
       CASE WHEN total >= 10000 THEN 'big'
            WHEN total >= 3000  THEN 'medium'
            ELSE 'small'
       END AS size
FROM orders
ORDER BY total DESC;` },
  { h: "CASE inside SUM: several totals in one row",
    p: ["A very common trick: count or sum only the rows that match, side by side. This is how you build a “pivot” report."],
    sql: `SELECT COUNT(*) FILTER (WHERE status = 'completed') AS completed,
       COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
       SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END) AS cancelled_amount
FROM orders;`,
    note: "<code>FILTER (WHERE …)</code> is PostgreSQL's short way. <code>SUM(CASE WHEN … THEN … ELSE 0 END)</code> works in every database." },
  { h: "COALESCE: a default for NULL",
    p: ["<code>COALESCE(a, b, c)</code> returns the first value that isn't NULL."],
    sql: `SELECT name, COALESCE(city, 'Unknown') AS city
FROM customers
ORDER BY id;` },
  { h: "Dates",
    p: ["<code>CURRENT_DATE</code> is today. Subtracting two dates gives days. <code>EXTRACT(month FROM d)</code> pulls out a part. <code>date_trunc('month', d)</code> rounds down to the month. <code>date + 7</code> adds 7 days (use <code>INTERVAL '1 month'</code> for months). <code>to_char</code> formats a date as text."],
    sql: `SELECT id, order_date,
       EXTRACT(month FROM order_date)        AS month_no,
       to_char(order_date, 'Mon YYYY')       AS month_label,
       order_date + 7                        AS deliver_by,
       DATE '2025-09-01' - order_date        AS days_ago
FROM orders
WHERE id <= 3;` },
  { h: "Text",
    p: ["<code>UPPER</code>, <code>LOWER</code>, <code>TRIM</code> (remove spaces), <code>LENGTH</code>, <code>||</code> (join text), <code>SPLIT_PART</code> (take a piece), <code>REPLACE</code>."],
    sql: `SELECT name,
       UPPER(name)               AS shout,
       SPLIT_PART(name, ' ', 1)  AS first_name,
       LENGTH(name)              AS chars,
       name || ' (' || COALESCE(city, '?') || ')' AS label
FROM customers
WHERE id IN (1, 6);` },
  { h: "Changing types with ::",
    p: ["<code>'2025-07-01'::date</code> turns text into a date. <code>12.75::int</code> rounds to a whole number (13). <code>CAST(x AS type)</code> is the standard spelling of the same thing."],
    sql: `SELECT '2025-07-01'::date + 30 AS plus_30_days,
       12.75::int           AS rounded,
       CAST('42' AS int) * 2 AS doubled;` }
 ],
 mistakes: [
  "CASE without ELSE returns NULL for rows that match nothing. Add an ELSE.",
  "<code>name || city</code> becomes NULL if city is NULL. Wrap it: <code>COALESCE(city, '')</code>.",
  "Comparing a timestamp column with <code>= '2025-07-01'</code> only matches midnight. For a whole day use <code>&gt;= '2025-07-01' AND &lt; '2025-07-02'</code>.",
  "Integer division: <code>5 / 2</code> is 2, not 2.5. Write <code>5 / 2.0</code> or cast to numeric."
 ],
 practice: [
  { q: "Label each product as 'cheap' (under 1,000), 'mid' (under 10,000) or 'premium'.", sql: `SELECT name, price,
       CASE WHEN price < 1000  THEN 'cheap'
            WHEN price < 10000 THEN 'mid'
            ELSE 'premium' END AS band
FROM products
ORDER BY price;` },
  { q: "In one row, show completed revenue for June, July and August 2025 as three columns.", sql: `SELECT SUM(total) FILTER (WHERE EXTRACT(month FROM order_date) = 6) AS jun,
       SUM(total) FILTER (WHERE EXTRACT(month FROM order_date) = 7) AS jul,
       SUM(total) FILTER (WHERE EXTRACT(month FROM order_date) = 8) AS aug
FROM orders
WHERE status = 'completed';` },
  { q: "Show each customer's first name in capitals and their city, or 'N/A' if missing.", sql: `SELECT UPPER(SPLIT_PART(name, ' ', 1)) AS first_name,
       COALESCE(city, 'N/A') AS city
FROM customers
ORDER BY id;` }
 ],
 check: [
  ["COALESCE(NULL, NULL, 'x', 'y') returns…", ["NULL", "'x'", "'y'", "An error"], 1, "COALESCE returns the first non-NULL value."],
  ["A CASE with no ELSE, for a row that matches no WHEN, gives…", ["0", "An error", "NULL", "The first THEN value"], 2, "No match and no ELSE means NULL."],
  ["What is 7 / 2 in PostgreSQL (both integers)?", ["3.5", "3", "4", "Error"], 1, "Integer ÷ integer drops the decimals. Use 7 / 2.0 for 3.5."]
 ],
 remember: [
  "CASE WHEN … THEN … ELSE … END = if/else. Always add ELSE.",
  "Pivot: SUM(CASE WHEN cond THEN x ELSE 0 END) or COUNT(*) FILTER (WHERE cond).",
  "COALESCE(col, default) replaces NULL.",
  "Dates: CURRENT_DATE, date − date = days, date + 7, + INTERVAL '1 month', EXTRACT, date_trunc, to_char.",
  "Text: UPPER, LOWER, TRIM, LENGTH, ||, SPLIT_PART, REPLACE. Cast with ::type.",
  "int / int drops decimals: use 2.0 or ::numeric."
 ]
}
];
