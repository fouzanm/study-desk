// FDE Prep — Week 1 lessons (SQL basics). Day 7 is the review day (built automatically).
(function (L) {
  const add = (key, v) => { L["fde:" + key] = v; };

  add("1-1", {
    title: "How a SQL query runs + SELECT, WHERE, ORDER BY, LIMIT",
    one: "SQL is how you ask a database a question. You <b>write</b> SELECT first, but the database <b>runs</b> FROM first.",
    learn: [
      "Every Odoo screen you have used is stored in PostgreSQL tables. <code>sale_order</code> has one row per order. SQL lets you read those rows directly, without the Odoo ORM.",
      "<b>SELECT</b> picks the columns. <b>FROM</b> picks the table. <b>WHERE</b> keeps only the rows you want. <b>ORDER BY</b> sorts. <b>LIMIT</b> keeps the first few rows.",
      "The database runs the parts in this order: <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>. Memory trick: <i>Friendly Workers Go Home Safely Over Lunch</i>.",
      "Text values go in single quotes: <code>'sale'</code>. Numbers don't need quotes."
    ],
    ex: "-- The 3 biggest confirmed orders\nSELECT name, amount_total\nFROM sale_order\nWHERE state = 'sale'\nORDER BY amount_total DESC\nLIMIT 3;",
    out: "name  | amount_total\nS001  | 5000\nS003  | 3000\nS005  | 2500",
    try: "Open <code>psql</code> on a copy of an Odoo database and show the 10 newest sale orders with <code>name</code>, <code>date_order</code> and <code>amount_total</code>.",
    remember: [
      "Run order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
      "WHERE filters rows. ORDER BY sorts (DESC = biggest first). LIMIT cuts.",
      "Text in single quotes. Double quotes mean a column name in PostgreSQL."
    ]
  });

  add("1-2", {
    title: "GROUP BY, HAVING and totals",
    one: "<b>GROUP BY</b> makes one pile of rows per value, then you count or add up each pile.",
    learn: [
      "The five totals you'll use: <code>COUNT(*)</code> how many rows, <code>SUM(x)</code> add up, <code>AVG(x)</code> average, <code>MIN(x)</code> smallest, <code>MAX(x)</code> biggest.",
      "Rule: every column in SELECT must either be in GROUP BY or inside a total like SUM(). Otherwise the database doesn't know which value to show.",
      "<b>WHERE</b> removes rows <i>before</i> grouping. <b>HAVING</b> removes groups <i>after</i> grouping. So only HAVING can use <code>SUM()</code>."
    ],
    ex: "-- Customers with more than 5000 in confirmed sales\nSELECT partner_id, SUM(amount_total) AS revenue\nFROM sale_order\nWHERE state = 'sale'\nGROUP BY partner_id\nHAVING SUM(amount_total) > 5000\nORDER BY revenue DESC;",
    try: "Count how many sale orders exist in each <code>state</code> (draft, sale, cancel).",
    remember: [
      "GROUP BY = one result row per group.",
      "WHERE = before grouping. HAVING = after grouping (can use SUM, COUNT).",
      "Every SELECT column is grouped or aggregated."
    ]
  });

  add("1-3", {
    title: "JOINs: combining tables",
    one: "A <b>JOIN</b> puts rows from two tables side by side when they match, like <code>sale_order.partner_id = res_partner.id</code>.",
    learn: [
      "<code>sale_order</code> only stores <code>partner_id = 7</code>. To see the customer's name you must join <code>res_partner</code>.",
      "<b>INNER JOIN</b> (or just JOIN) keeps only rows that match in both tables. <b>LEFT JOIN</b> keeps every row from the left table, and fills NULL where there is no match.",
      "Use LEFT JOIN when you must not lose rows, for example 'every customer, including those with zero orders'. Then count with <code>COUNT(o.id)</code>, not <code>COUNT(*)</code>.",
      "Careful: joining one order to its many lines repeats the order. If you then <code>SUM(o.amount_total)</code> you count the order several times. Sum the lines instead."
    ],
    ex: "-- Revenue per product from order lines\nSELECT l.product_id, SUM(l.product_uom_qty * l.price_unit) AS revenue\nFROM sale_order_line l\nJOIN sale_order o ON o.id = l.order_id\nWHERE o.state = 'sale'\nGROUP BY l.product_id\nORDER BY revenue DESC;",
    try: "List every customer with their number of orders, <b>including customers with 0 orders</b> (LEFT JOIN + COUNT(o.id)).",
    remember: [
      "INNER = only matches. LEFT = all left rows + NULLs.",
      "With LEFT JOIN, count the right table's id, not *.",
      "Joining one-to-many repeats the 'one' side. Sum from the 'many' side."
    ]
  });

  add("1-4", {
    title: "Subqueries and CTEs (WITH)",
    one: "A <b>CTE</b> lets you build a big query in small named steps, like writing notes before the final answer.",
    learn: [
      "A <b>subquery</b> is a query inside another query. Example: find orders bigger than the average order.",
      "A <b>CTE</b> starts with <code>WITH name AS (...)</code>. You can then use <code>name</code> like a table. Long queries become easy to read and debug.",
      "Tip: write the first step, run it, check the result. Then add the next step. Interviewers love this way of working."
    ],
    ex: "WITH revenue AS (\n  SELECT partner_id, SUM(amount_total) AS total\n  FROM sale_order\n  WHERE state = 'sale'\n  GROUP BY partner_id\n)\nSELECT p.name, r.total\nFROM revenue r\nJOIN res_partner p ON p.id = r.partner_id\nWHERE r.total > 3000\nORDER BY r.total DESC;",
    try: "Using a CTE, find products whose confirmed revenue is more than 10,000.",
    remember: [
      "Subquery = query inside a query.",
      "CTE = WITH name AS (...) — named steps, easier to read.",
      "Build step by step and run each step."
    ]
  });

  add("1-5", {
    title: "Practice: 10 real business questions",
    one: "Today you only practise. Real client questions, answered in SQL on your Odoo database.",
    learn: [
      "Answer each question yourself before checking with Claude. Write the query, run it, and look at the result: does it make business sense?",
      "These are the questions clients actually ask in reports and meetings."
    ],
    points: [
      "1. Total confirmed revenue this month.",
      "2. Revenue per month for the last 12 months.",
      "3. Top 10 customers by revenue, with names.",
      "4. Customers who never ordered.",
      "5. Top 5 products by quantity sold.",
      "6. Average order value per salesperson (<code>user_id</code>).",
      "7. Number of draft orders older than 30 days.",
      "8. Orders where the total is above the average order.",
      "9. Customers who ordered in each of the last 3 months.",
      "10. Revenue per country (join <code>res_partner</code> → <code>res_country</code>)."
    ],
    try: "Do all 10. Send your queries to Claude with: <i>“Check my SQL answers and tell me what's wrong.”</i>",
    remember: [
      "Read the question twice: what is one row in the answer?",
      "Check results make sense (no doubled totals from joins).",
      "Use date_trunc('month', date_order) for monthly reports."
    ]
  });

  add("1-6", {
    title: "Window functions: ROW_NUMBER, RANK, SUM OVER",
    one: "A <b>window function</b> calculates across related rows but <b>keeps every row</b>, unlike GROUP BY.",
    learn: [
      "Shape: <code>function() OVER (PARTITION BY group ORDER BY sort)</code>. PARTITION BY = which rows belong together. ORDER BY = the order inside each group.",
      "<b>ROW_NUMBER()</b> numbers rows 1, 2, 3 in each group. Use it for 'latest order per customer'.",
      "<b>RANK()</b> gives ties the same number (1, 1, 3). <b>SUM(x) OVER (ORDER BY date)</b> gives a running total. <b>LAG(x)</b> looks at the previous row.",
      "You can't use the window result in WHERE of the same query (WHERE runs first). Wrap it in a CTE, then filter."
    ],
    ex: "-- Latest order per customer (asked in many interviews)\nWITH ranked AS (\n  SELECT partner_id, name, date_order,\n         ROW_NUMBER() OVER (PARTITION BY partner_id\n                            ORDER BY date_order DESC) AS rn\n  FROM sale_order\n)\nSELECT partner_id, name, date_order\nFROM ranked\nWHERE rn = 1;",
    try: "Show each month's confirmed revenue and the change from the previous month using <code>LAG</code>.",
    remember: [
      "Window = calculate across rows, keep every row.",
      "Latest per group = ROW_NUMBER() ... = 1 inside a CTE.",
      "Running total = SUM(x) OVER (ORDER BY date). Previous row = LAG(x)."
    ]
  });
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
