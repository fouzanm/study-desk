// Lessons for course "sql". Built by running every example on PostgreSQL 16.
// Keys are "course:lessonId" (see catalog/topics.js).
(function (L) {
L["sql:start-here"] = {
 "title": "Start here: what SQL is, and your practice database",
 "level": "Beginner",
 "one": "SQL is the language you use to ask a database questions, like <i>“which customers spent the most last month?”</i>",
 "why": "Almost every tech job touches data. Developers, data engineers, AI engineers and consultants all use SQL to check data, build reports, find bugs and move data between systems. It is the one skill that appears in nearly every job post.",
 "steps": [
  {
   "h": "A database is a set of tables",
   "p": [
    "A <b>table</b> is like a spreadsheet: it has <b>columns</b> (name, city…) and <b>rows</b> (one row per customer).",
    "Each row has an <b>id</b> that is never repeated. Other tables point to that id. For example, an order stores <code>customer_id = 1</code> to say “this order belongs to customer 1”.",
    "Here is the <code>customers</code> table from your practice shop:"
   ],
   "sql": "SELECT * FROM customers;",
   "note": "<code>*</code> means “all columns”. Priya has no city, so it shows as <code>NULL</code>, which means “unknown / empty”.",
   "out": {
    "cols": [
     "id",
     "name",
     "city",
     "joined_on"
    ],
    "rows": [
     [
      "1",
      "Asha Rao",
      "Kochi",
      "2025-01-10"
     ],
     [
      "2",
      "Ben Thomas",
      "Bengaluru",
      "2025-02-03"
     ],
     [
      "3",
      "Chen Li",
      "Dubai",
      "2025-02-20"
     ],
     [
      "4",
      "Divya Menon",
      "Kochi",
      "2025-03-15"
     ],
     [
      "5",
      "Omar Khan",
      "Dubai",
      "2025-04-01"
     ],
     [
      "6",
      "Priya Nair",
      null,
      "2025-05-12"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "The practice shop: five tables",
   "p": [
    "Every lesson in this course uses the same small online shop, so you always know what the data looks like:",
    "<b>customers</b>: who buys. <b>products</b>: what we sell. <b>orders</b>: one row per order, with a <code>status</code> (completed, pending or cancelled) and a <code>total</code>. <b>order_items</b>: the lines inside an order (which product, how many, at what price). <b>employees</b>: staff and their manager.",
    "The products:"
   ],
   "sql": "SELECT * FROM products;",
   "out": {
    "cols": [
     "id",
     "name",
     "category",
     "price"
    ],
    "rows": [
     [
      "1",
      "Laptop",
      "Electronics",
      "55000.00"
     ],
     [
      "2",
      "Headphones",
      "Electronics",
      "3000.00"
     ],
     [
      "3",
      "Coffee Beans 1kg",
      "Grocery",
      "900.00"
     ],
     [
      "4",
      "Green Tea",
      "Grocery",
      "400.00"
     ],
     [
      "5",
      "Desk Chair",
      "Furniture",
      "8000.00"
     ],
     [
      "6",
      "Notebook",
      "Stationery",
      "120.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "How the tables connect",
   "p": [
    "<code>orders.customer_id</code> points to <code>customers.id</code>. <code>order_items.order_id</code> points to <code>orders.id</code>, and <code>order_items.product_id</code> points to <code>products.id</code>.",
    "So one customer has many orders, and one order has many items. Keep this picture in your head; it matters a lot in the JOIN lesson.",
    "The orders:"
   ],
   "sql": "SELECT * FROM orders;",
   "out": {
    "cols": [
     "id",
     "customer_id",
     "order_date",
     "status",
     "total"
    ],
    "rows": [
     [
      "1",
      "1",
      "2025-06-02",
      "completed",
      "55000.00"
     ],
     [
      "2",
      "1",
      "2025-06-15",
      "completed",
      "6900.00"
     ],
     [
      "3",
      "2",
      "2025-06-20",
      "completed",
      "9200.00"
     ],
     [
      "4",
      "3",
      "2025-07-01",
      "cancelled",
      "3000.00"
     ],
     [
      "5",
      "2",
      "2025-07-05",
      "completed",
      "3600.00"
     ],
     [
      "6",
      "4",
      "2025-07-18",
      "pending",
      "58000.00"
     ],
     [
      "7",
      "5",
      "2025-07-22",
      "completed",
      "2000.00"
     ],
     [
      "8",
      "1",
      "2025-08-03",
      "completed",
      "2600.00"
     ],
     [
      "9",
      "3",
      "2025-08-10",
      "completed",
      "16000.00"
     ],
     [
      "10",
      "4",
      "2025-08-25",
      "completed",
      "3900.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Set up the database on your computer (10 minutes)",
   "p": [
    "<b>1.</b> Install PostgreSQL. On Ubuntu: <code>sudo apt install postgresql</code>. On Mac: install <i>Postgres.app</i>. On Windows: use the installer from postgresql.org.",
    "<b>2.</b> Create a database and open it: <code>createdb learn</code>, then <code>psql learn</code>. (On Ubuntu you may first need <code>sudo -u postgres createuser -s $USER</code>.)",
    "<b>3.</b> Copy the script below, paste it into psql and press Enter. It creates all five tables with data. Run it again any time to reset everything.",
    "<b>No install?</b> Open any free online PostgreSQL playground (search “PostgreSQL online”), paste the script and run it there."
   ],
   "sql": "-- Study Desk SQL practice database: a small online shop.\n-- Run it once in PostgreSQL. Running it again resets everything.\nDROP TABLE IF EXISTS order_items, orders, products, customers, employees CASCADE;\n\nCREATE TABLE customers (\n  id        int PRIMARY KEY,\n  name      text NOT NULL,\n  city      text,\n  joined_on date NOT NULL\n);\n\nCREATE TABLE products (\n  id       int PRIMARY KEY,\n  name     text NOT NULL,\n  category text NOT NULL,\n  price    numeric(10,2) NOT NULL CHECK (price >= 0)\n);\n\nCREATE TABLE orders (\n  id          int PRIMARY KEY,\n  customer_id int NOT NULL REFERENCES customers(id),\n  order_date  date NOT NULL,\n  status      text NOT NULL CHECK (status IN ('completed','pending','cancelled')),\n  total       numeric(10,2) NOT NULL\n);\n\nCREATE TABLE order_items (\n  id         int PRIMARY KEY,\n  order_id   int NOT NULL REFERENCES orders(id),\n  product_id int NOT NULL REFERENCES products(id),\n  qty        int NOT NULL CHECK (qty > 0),\n  price      numeric(10,2) NOT NULL\n);\n\nCREATE TABLE employees (\n  id         int PRIMARY KEY,\n  name       text NOT NULL,\n  manager_id int REFERENCES employees(id)\n);\n\nINSERT INTO customers VALUES\n  (1, 'Asha Rao',    'Kochi',     '2025-01-10'),\n  (2, 'Ben Thomas',  'Bengaluru', '2025-02-03'),\n  (3, 'Chen Li',     'Dubai',     '2025-02-20'),\n  (4, 'Divya Menon', 'Kochi',     '2025-03-15'),\n  (5, 'Omar Khan',   'Dubai',     '2025-04-01'),\n  (6, 'Priya Nair',  NULL,        '2025-05-12');\n\nINSERT INTO products VALUES\n  (1, 'Laptop',           'Electronics', 55000),\n  (2, 'Headphones',       'Electronics',  3000),\n  (3, 'Coffee Beans 1kg', 'Grocery',       900),\n  (4, 'Green Tea',        'Grocery',       400),\n  (5, 'Desk Chair',       'Furniture',    8000),\n  (6, 'Notebook',         'Stationery',    120);\n\nINSERT INTO orders VALUES\n  (1,  1, '2025-06-02', 'completed', 55000),\n  (2,  1, '2025-06-15', 'completed',  6900),\n  (3,  2, '2025-06-20', 'completed',  9200),\n  (4,  3, '2025-07-01', 'cancelled',  3000),\n  (5,  2, '2025-07-05', 'completed',  3600),\n  (6,  4, '2025-07-18', 'pending',   58000),\n  (7,  5, '2025-07-22', 'completed',  2000),\n  (8,  1, '2025-08-03', 'completed',  2600),\n  (9,  3, '2025-08-10', 'completed', 16000),\n  (10, 4, '2025-08-25', 'completed',  3900);\n\nINSERT INTO order_items VALUES\n  (1,  1,  1, 1, 55000),\n  (2,  2,  2, 2,  3000),\n  (3,  2,  3, 1,   900),\n  (4,  3,  5, 1,  8000),\n  (5,  3,  4, 3,   400),\n  (6,  4,  2, 1,  3000),\n  (7,  5,  3, 4,   900),\n  (8,  6,  1, 1, 55000),\n  (9,  6,  2, 1,  3000),\n  (10, 7,  4, 5,   400),\n  (11, 8,  3, 2,   900),\n  (12, 8,  4, 2,   400),\n  (13, 9,  5, 2,  8000),\n  (14, 10, 2, 1,  3000),\n  (15, 10, 3, 1,   900);\n\nINSERT INTO employees VALUES\n  (1, 'Meera', NULL),\n  (2, 'Arjun', 1),\n  (3, 'Sara',  1),\n  (4, 'Kiran', 2),\n  (5, 'Leo',   2),\n  (6, 'Nisha', 3);",
   "run": false
  }
 ],
 "mistakes": [
  "Copying examples instead of typing them. Typing is how your hands and brain learn the patterns. Type every query in this course.",
  "Forgetting the semicolon <code>;</code> at the end. In psql nothing happens until you type it.",
  "Being afraid to break things. This is a practice database: run the setup script again and it's fresh."
 ],
 "practice": [
  {
   "q": "Show every column of the <code>order_items</code> table.",
   "sql": "SELECT * FROM order_items;",
   "out": {
    "cols": [
     "id",
     "order_id",
     "product_id",
     "qty",
     "price"
    ],
    "rows": [
     [
      "1",
      "1",
      "1",
      "1",
      "55000.00"
     ],
     [
      "2",
      "2",
      "2",
      "2",
      "3000.00"
     ],
     [
      "3",
      "2",
      "3",
      "1",
      "900.00"
     ],
     [
      "4",
      "3",
      "5",
      "1",
      "8000.00"
     ],
     [
      "5",
      "3",
      "4",
      "3",
      "400.00"
     ],
     [
      "6",
      "4",
      "2",
      "1",
      "3000.00"
     ],
     [
      "7",
      "5",
      "3",
      "4",
      "900.00"
     ],
     [
      "8",
      "6",
      "1",
      "1",
      "55000.00"
     ],
     [
      "9",
      "6",
      "2",
      "1",
      "3000.00"
     ],
     [
      "10",
      "7",
      "4",
      "5",
      "400.00"
     ],
     [
      "11",
      "8",
      "3",
      "2",
      "900.00"
     ],
     [
      "12",
      "8",
      "4",
      "2",
      "400.00"
     ],
     [
      "13",
      "9",
      "5",
      "2",
      "8000.00"
     ],
     [
      "14",
      "10",
      "2",
      "1",
      "3000.00"
     ],
     [
      "15",
      "10",
      "3",
      "1",
      "900.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Show every employee. Who has no manager?",
   "sql": "SELECT * FROM employees;",
   "a": "Meera has <code>manager_id</code> NULL, so she is the top boss.",
   "out": {
    "cols": [
     "id",
     "name",
     "manager_id"
    ],
    "rows": [
     [
      "1",
      "Meera",
      null
     ],
     [
      "2",
      "Arjun",
      "1"
     ],
     [
      "3",
      "Sara",
      "1"
     ],
     [
      "4",
      "Kiran",
      "2"
     ],
     [
      "5",
      "Leo",
      "2"
     ],
     [
      "6",
      "Nisha",
      "3"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "In a table, what is a row?",
   [
    "A type of data, like text or number",
    "One record, for example one customer",
    "The name of a column",
    "A database"
   ],
   1,
   "Columns are the fields (name, city). Each row is one record."
  ],
  [
   "What does NULL mean?",
   [
    "Zero",
    "An empty string ''",
    "Unknown or missing value",
    "An error"
   ],
   2,
   "NULL means “no value”. It is not 0 and not an empty string."
  ],
  [
   "orders.customer_id = 3 means…",
   [
    "The order has 3 items",
    "The order belongs to the customer whose id is 3",
    "It is the third order",
    "The order total is 3"
   ],
   1,
   "A column like customer_id stores the id of a row in another table. That's how tables connect."
  ]
 ],
 "remember": [
  "Table = columns (fields) + rows (records). Each row has a unique id.",
  "Tables connect by storing another table's id, e.g. orders.customer_id → customers.id.",
  "NULL = unknown/missing. Not 0, not ''.",
  "One customer → many orders → many order_items."
 ]
};
L["sql:run-order-select"] = {
 "title": "SELECT, WHERE, ORDER BY and LIMIT",
 "level": "Beginner",
 "one": "<code>SELECT</code> picks columns, <code>WHERE</code> picks rows, <code>ORDER BY</code> sorts them, <code>LIMIT</code> keeps the first few.",
 "why": "These four words answer most everyday questions: “show me pending orders”, “who joined this year?”, “what are our 3 most expensive products?”.",
 "steps": [
  {
   "h": "Pick columns with SELECT",
   "p": [
    "List the columns you want, separated by commas. Use <code>AS</code> to give a column a nicer name in the result."
   ],
   "sql": "SELECT name, price AS price_inr\nFROM products;",
   "out": {
    "cols": [
     "name",
     "price_inr"
    ],
    "rows": [
     [
      "Laptop",
      "55000.00"
     ],
     [
      "Headphones",
      "3000.00"
     ],
     [
      "Coffee Beans 1kg",
      "900.00"
     ],
     [
      "Green Tea",
      "400.00"
     ],
     [
      "Desk Chair",
      "8000.00"
     ],
     [
      "Notebook",
      "120.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Pick rows with WHERE",
   "p": [
    "<code>WHERE</code> keeps only rows where the condition is true. Text goes in single quotes: <code>'Kochi'</code>.",
    "Comparison signs: <code>=</code>, <code>&lt;&gt;</code> (not equal), <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>. Combine conditions with <code>AND</code> / <code>OR</code>."
   ],
   "sql": "SELECT id, customer_id, total\nFROM orders\nWHERE status = 'completed' AND total > 5000;",
   "out": {
    "cols": [
     "id",
     "customer_id",
     "total"
    ],
    "rows": [
     [
      "1",
      "1",
      "55000.00"
     ],
     [
      "2",
      "1",
      "6900.00"
     ],
     [
      "3",
      "2",
      "9200.00"
     ],
     [
      "9",
      "3",
      "16000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Handy filters: IN, BETWEEN, LIKE",
   "p": [
    "<code>IN (...)</code> matches any value in a list. <code>BETWEEN a AND b</code> includes both ends. <code>LIKE '%tea%'</code> finds text containing “tea”; <code>ILIKE</code> does the same but ignores upper/lower case.",
    "<code>%</code> means “any characters”. So <code>'C%'</code> = starts with C."
   ],
   "sql": "SELECT name, category, price\nFROM products\nWHERE category IN ('Grocery', 'Stationery')\n   OR name ILIKE '%chair%';",
   "out": {
    "cols": [
     "name",
     "category",
     "price"
    ],
    "rows": [
     [
      "Coffee Beans 1kg",
      "Grocery",
      "900.00"
     ],
     [
      "Green Tea",
      "Grocery",
      "400.00"
     ],
     [
      "Desk Chair",
      "Furniture",
      "8000.00"
     ],
     [
      "Notebook",
      "Stationery",
      "120.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "NULL needs IS NULL",
   "p": [
    "NULL is “unknown”, so <code>city = NULL</code> is never true; it finds nothing. Always write <code>IS NULL</code> or <code>IS NOT NULL</code>."
   ],
   "sql": "SELECT name FROM customers WHERE city IS NULL;",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Priya Nair"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Sort with ORDER BY, keep a few with LIMIT",
   "p": [
    "<code>ORDER BY</code> sorts ascending (small → big, A → Z). Add <code>DESC</code> for big → small. You can sort by several columns.",
    "<code>LIMIT 3</code> keeps the first 3 rows <i>after</i> sorting. Without ORDER BY the order is random, so LIMIT alone gives random rows."
   ],
   "sql": "SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 3;",
   "out": {
    "cols": [
     "name",
     "price"
    ],
    "rows": [
     [
      "Laptop",
      "55000.00"
     ],
     [
      "Desk Chair",
      "8000.00"
     ],
     [
      "Headphones",
      "3000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Remove duplicates with DISTINCT",
   "p": [
    "<code>DISTINCT</code> shows each different value once."
   ],
   "sql": "SELECT DISTINCT city\nFROM customers\nORDER BY city;",
   "note": "NULL sorts last in ascending order in PostgreSQL.",
   "out": {
    "cols": [
     "city"
    ],
    "rows": [
     [
      "Bengaluru"
     ],
     [
      "Dubai"
     ],
     [
      "Kochi"
     ],
     [
      null
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "<code>WHERE city = NULL</code>: finds nothing. Use <code>IS NULL</code>.",
  "Double quotes for text: <code>\"Kochi\"</code> means a <i>column</i> named Kochi. Text values use single quotes <code>'Kochi'</code>.",
  "<code>LIMIT</code> without <code>ORDER BY</code>: you get random rows, and they can change between runs.",
  "Mixing AND/OR without brackets. <code>a OR b AND c</code> means <code>a OR (b AND c)</code>. Add brackets to say what you mean."
 ],
 "practice": [
  {
   "q": "Show the name and price of products that cost less than 1,000, cheapest first.",
   "sql": "SELECT name, price\nFROM products\nWHERE price < 1000\nORDER BY price;",
   "out": {
    "cols": [
     "name",
     "price"
    ],
    "rows": [
     [
      "Notebook",
      "120.00"
     ],
     [
      "Green Tea",
      "400.00"
     ],
     [
      "Coffee Beans 1kg",
      "900.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Show orders placed in July 2025 (id, order_date, status).",
   "sql": "SELECT id, order_date, status\nFROM orders\nWHERE order_date BETWEEN '2025-07-01' AND '2025-07-31'\nORDER BY order_date;",
   "out": {
    "cols": [
     "id",
     "order_date",
     "status"
    ],
    "rows": [
     [
      "4",
      "2025-07-01",
      "cancelled"
     ],
     [
      "5",
      "2025-07-05",
      "completed"
     ],
     [
      "6",
      "2025-07-18",
      "pending"
     ],
     [
      "7",
      "2025-07-22",
      "completed"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Which customers live in Kochi or Dubai? Show name and city, sorted by city then name.",
   "sql": "SELECT name, city\nFROM customers\nWHERE city IN ('Kochi', 'Dubai')\nORDER BY city, name;",
   "out": {
    "cols": [
     "name",
     "city"
    ],
    "rows": [
     [
      "Chen Li",
      "Dubai"
     ],
     [
      "Omar Khan",
      "Dubai"
     ],
     [
      "Asha Rao",
      "Kochi"
     ],
     [
      "Divya Menon",
      "Kochi"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "Which finds customers with no city?",
   [
    "WHERE city = NULL",
    "WHERE city IS NULL",
    "WHERE city = ''",
    "WHERE city == NULL"
   ],
   1,
   "Comparing with = NULL is never true. Use IS NULL."
  ],
  [
   "ORDER BY price DESC LIMIT 1 returns…",
   [
    "The cheapest product",
    "The most expensive product",
    "A random product",
    "All products"
   ],
   1,
   "DESC sorts big to small, LIMIT 1 keeps the first row: the most expensive."
  ],
  [
   "name LIKE 'C%' matches…",
   [
    "Names ending in C",
    "Names containing C anywhere",
    "Names starting with C",
    "Only the name 'C'"
   ],
   2,
   "% means any characters, so 'C%' is C followed by anything."
  ]
 ],
 "remember": [
  "SELECT columns · FROM table · WHERE rows · ORDER BY sort · LIMIT n.",
  "Text in single quotes 'Kochi'. Double quotes are for column names.",
  "NULL: use IS NULL / IS NOT NULL, never = NULL.",
  "IN (list), BETWEEN a AND b (both ends included), LIKE / ILIKE with %.",
  "LIMIT without ORDER BY = random rows."
 ]
};
L["sql:query-order"] = {
 "title": "The order SQL runs in (very important)",
 "level": "Beginner",
 "one": "You <i>write</i> SELECT first, but the database <i>runs</i> it in this order: <b>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>.",
 "why": "This one idea explains most confusing SQL errors, like “why can't I use my alias in WHERE?”. Interviewers love asking it.",
 "steps": [
  {
   "h": "The seven steps",
   "p": [
    "<b>1. FROM</b>: take the table (and joins). <b>2. WHERE</b>: throw away rows. <b>3. GROUP BY</b>: put rows into groups. <b>4. HAVING</b>: throw away groups. <b>5. SELECT</b>: work out the columns. <b>6. ORDER BY</b>: sort. <b>7. LIMIT</b>: keep the first few.",
    "Think of it like cooking: get the ingredients (FROM), wash out the bad ones (WHERE), sort into bowls (GROUP BY), throw away bowls you don't need (HAVING), then plate it (SELECT), arrange it (ORDER BY) and serve a few (LIMIT)."
   ]
  },
  {
   "h": "Why an alias doesn't work in WHERE",
   "p": [
    "The alias <code>line_total</code> is created in step 5 (SELECT). WHERE runs in step 2, before the alias exists. So this fails:"
   ],
   "sql": "SELECT id, qty * price AS line_total\nFROM order_items\nWHERE line_total > 5000;",
   "expectError": true,
   "out": {
    "error": "ERROR: column \"line_total\" does not exist"
   }
  },
  {
   "h": "Fix: repeat the expression",
   "p": [
    "Write the calculation again in WHERE. (Or use a CTE, which you'll learn later.)"
   ],
   "sql": "SELECT id, qty * price AS line_total\nFROM order_items\nWHERE qty * price > 5000;",
   "out": {
    "cols": [
     "id",
     "line_total"
    ],
    "rows": [
     [
      "1",
      "55000.00"
     ],
     [
      "2",
      "6000.00"
     ],
     [
      "4",
      "8000.00"
     ],
     [
      "8",
      "55000.00"
     ],
     [
      "13",
      "16000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "But ORDER BY can use the alias",
   "p": [
    "ORDER BY runs in step 6, after SELECT, so the alias exists by then."
   ],
   "sql": "SELECT id, qty * price AS line_total\nFROM order_items\nORDER BY line_total DESC\nLIMIT 3;",
   "out": {
    "cols": [
     "id",
     "line_total"
    ],
    "rows": [
     [
      "1",
      "55000.00"
     ],
     [
      "8",
      "55000.00"
     ],
     [
      "13",
      "16000.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "Using a SELECT alias in WHERE or HAVING. They run before SELECT. (PostgreSQL does allow aliases in GROUP BY, as a convenience.)",
  "Putting a condition on a total (like SUM) in WHERE. Totals don't exist yet at step 2. That's what HAVING is for (next lesson)."
 ],
 "practice": [
  {
   "q": "Without running it: in <code>SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT 5</code>, does LIMIT run before or after ORDER BY?",
   "a": "After. ORDER BY is step 6, LIMIT is step 7. So you get the top 5 of the sorted result."
  },
  {
   "q": "Show order items where qty × price is at least 3,000, with the line total named <code>line_total</code>, biggest first.",
   "sql": "SELECT id, order_id, qty * price AS line_total\nFROM order_items\nWHERE qty * price >= 3000\nORDER BY line_total DESC;",
   "out": {
    "cols": [
     "id",
     "order_id",
     "line_total"
    ],
    "rows": [
     [
      "8",
      "6",
      "55000.00"
     ],
     [
      "1",
      "1",
      "55000.00"
     ],
     [
      "13",
      "9",
      "16000.00"
     ],
     [
      "4",
      "3",
      "8000.00"
     ],
     [
      "2",
      "2",
      "6000.00"
     ],
     [
      "7",
      "5",
      "3600.00"
     ],
     [
      "9",
      "6",
      "3000.00"
     ],
     [
      "6",
      "4",
      "3000.00"
     ],
     [
      "14",
      "10",
      "3000.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "Which runs first?",
   [
    "SELECT",
    "WHERE",
    "ORDER BY",
    "LIMIT"
   ],
   1,
   "Order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT."
  ],
  [
   "Why does WHERE line_total > 5000 fail when line_total is a SELECT alias?",
   [
    "Aliases must be in quotes",
    "WHERE runs before SELECT, so the alias doesn't exist yet",
    "You can't compare numbers in WHERE",
    "line_total is a reserved word"
   ],
   1,
   "WHERE is step 2, SELECT is step 5."
  ],
  [
   "Can ORDER BY use a SELECT alias?",
   [
    "Yes, it runs after SELECT",
    "No, never",
    "Only with DESC",
    "Only with LIMIT"
   ],
   0,
   "ORDER BY is step 6, after SELECT."
  ]
 ],
 "remember": [
  "Run order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
  "WHERE filters rows (before grouping). HAVING filters groups (after grouping).",
  "A SELECT alias can be used in ORDER BY, not in WHERE."
 ]
};
L["sql:group-by"] = {
 "title": "Counting and totals: GROUP BY and HAVING",
 "level": "Beginner",
 "one": "<code>GROUP BY</code> puts rows into groups and <b>aggregate functions</b> (COUNT, SUM, AVG, MIN, MAX) give one answer per group.",
 "why": "Every report is a total of something: sales per month, orders per customer, revenue per product. This is the most used SQL in real jobs.",
 "steps": [
  {
   "h": "Aggregates on the whole table",
   "p": [
    "Without GROUP BY, an aggregate squashes the whole table into one row."
   ],
   "sql": "SELECT COUNT(*)   AS orders,\n       SUM(total) AS revenue,\n       ROUND(AVG(total), 2) AS avg_order,\n       MAX(total) AS biggest\nFROM orders\nWHERE status = 'completed';",
   "note": "AVG gives many decimals on its own, so we wrap it in <code>ROUND(…, 2)</code>.",
   "out": {
    "cols": [
     "orders",
     "revenue",
     "avg_order",
     "biggest"
    ],
    "rows": [
     [
      "8",
      "99200.00",
      "12400.00",
      "55000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "One row per group",
   "p": [
    "<code>GROUP BY status</code> makes one group per status. Each aggregate is worked out inside each group."
   ],
   "sql": "SELECT status, COUNT(*) AS orders, SUM(total) AS amount\nFROM orders\nGROUP BY status\nORDER BY amount DESC;",
   "out": {
    "cols": [
     "status",
     "orders",
     "amount"
    ],
    "rows": [
     [
      "completed",
      "8",
      "99200.00"
     ],
     [
      "pending",
      "1",
      "58000.00"
     ],
     [
      "cancelled",
      "1",
      "3000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "The golden rule",
   "p": [
    "Every column in SELECT must be either <b>in GROUP BY</b> or <b>inside an aggregate</b>. Otherwise the database doesn't know which value to show, so it errors:"
   ],
   "sql": "SELECT customer_id, order_date, SUM(total)\nFROM orders\nGROUP BY customer_id;",
   "expectError": true,
   "out": {
    "error": "ERROR: column \"orders.order_date\" must appear in the GROUP BY clause or be used in an aggregate function"
   }
  },
  {
   "h": "Filter groups with HAVING",
   "p": [
    "WHERE filters rows <i>before</i> grouping. HAVING filters groups <i>after</i>. Here: completed orders only (WHERE), then keep customers who spent over 10,000 (HAVING)."
   ],
   "sql": "SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spent\nFROM orders\nWHERE status = 'completed'\nGROUP BY customer_id\nHAVING SUM(total) > 10000\nORDER BY spent DESC;",
   "out": {
    "cols": [
     "customer_id",
     "orders",
     "spent"
    ],
    "rows": [
     [
      "1",
      "3",
      "64500.00"
     ],
     [
      "3",
      "1",
      "16000.00"
     ],
     [
      "2",
      "2",
      "12800.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "COUNT(*) vs COUNT(column) vs COUNT(DISTINCT …)",
   "p": [
    "<code>COUNT(*)</code> counts rows. <code>COUNT(city)</code> counts rows where city is not NULL. <code>COUNT(DISTINCT city)</code> counts different cities."
   ],
   "sql": "SELECT COUNT(*)             AS customers,\n       COUNT(city)          AS with_city,\n       COUNT(DISTINCT city) AS cities\nFROM customers;",
   "out": {
    "cols": [
     "customers",
     "with_city",
     "cities"
    ],
    "rows": [
     [
      "6",
      "5",
      "3"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Group by a calculated value",
   "p": [
    "You can group by an expression. <code>date_trunc('month', order_date)</code> turns every date into the first day of its month, so you get one row per month."
   ],
   "sql": "SELECT date_trunc('month', order_date)::date AS month,\n       COUNT(*)   AS orders,\n       SUM(total) AS revenue\nFROM orders\nWHERE status = 'completed'\nGROUP BY month\nORDER BY month;",
   "out": {
    "cols": [
     "month",
     "orders",
     "revenue"
    ],
    "rows": [
     [
      "2025-06-01",
      "3",
      "71100.00"
     ],
     [
      "2025-07-01",
      "2",
      "5600.00"
     ],
     [
      "2025-08-01",
      "3",
      "22500.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "A column in SELECT that is not in GROUP BY and not aggregated → error.",
  "<code>WHERE SUM(total) &gt; 1000</code> → error. Conditions on totals go in HAVING.",
  "Forgetting that SUM/AVG/COUNT(column) skip NULLs. AVG of (10, NULL, 20) is 15, not 10.",
  "Counting cancelled orders as sales. Always ask: which statuses count?"
 ],
 "practice": [
  {
   "q": "How many customers are there in each city? Show city and count, biggest first.",
   "sql": "SELECT city, COUNT(*) AS customers\nFROM customers\nGROUP BY city\nORDER BY customers DESC;",
   "a": "The empty city is Priya (NULL). GROUP BY puts all NULLs into one group.",
   "out": {
    "cols": [
     "city",
     "customers"
    ],
    "rows": [
     [
      "Kochi",
      "2"
     ],
     [
      "Dubai",
      "2"
     ],
     [
      null,
      "1"
     ],
     [
      "Bengaluru",
      "1"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Total quantity sold per product_id (all order items), only products with more than 3 units.",
   "sql": "SELECT product_id, SUM(qty) AS units\nFROM order_items\nGROUP BY product_id\nHAVING SUM(qty) > 3\nORDER BY units DESC;",
   "out": {
    "cols": [
     "product_id",
     "units"
    ],
    "rows": [
     [
      "4",
      "10"
     ],
     [
      "3",
      "8"
     ],
     [
      "2",
      "5"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Average price per category, rounded to 0 decimals.",
   "sql": "SELECT category, ROUND(AVG(price)) AS avg_price\nFROM products\nGROUP BY category\nORDER BY avg_price DESC;",
   "out": {
    "cols": [
     "category",
     "avg_price"
    ],
    "rows": [
     [
      "Electronics",
      "29000"
     ],
     [
      "Furniture",
      "8000"
     ],
     [
      "Grocery",
      "650"
     ],
     [
      "Stationery",
      "120"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "Which keeps only customers with more than 2 orders?",
   [
    "WHERE COUNT(*) > 2",
    "HAVING COUNT(*) > 2",
    "LIMIT 2",
    "ORDER BY COUNT(*) > 2"
   ],
   1,
   "Conditions on aggregates go in HAVING."
  ],
  [
   "COUNT(city) on customers returns 5, COUNT(*) returns 6. Why?",
   [
    "One row is a duplicate",
    "One customer has city NULL, and COUNT(column) skips NULLs",
    "COUNT(*) counts the header",
    "A bug"
   ],
   1,
   "COUNT(column) ignores NULLs."
  ],
  [
   "SELECT city, name, COUNT(*) FROM customers GROUP BY city; …",
   [
    "Works",
    "Errors, because name is not grouped or aggregated",
    "Returns one row",
    "Returns names only"
   ],
   1,
   "Every selected column must be in GROUP BY or inside an aggregate."
  ]
 ],
 "remember": [
  "COUNT, SUM, AVG, MIN, MAX = one answer per group.",
  "Every SELECT column: in GROUP BY or inside an aggregate.",
  "WHERE = filter rows before grouping. HAVING = filter groups after.",
  "COUNT(*) counts rows; COUNT(col) skips NULLs; COUNT(DISTINCT col) counts different values.",
  "Per month: GROUP BY date_trunc('month', date)."
 ]
};
L["sql:case-dates-text"] = {
 "title": "Handy tools: CASE, COALESCE, dates and text",
 "level": "Beginner+",
 "one": "<code>CASE</code> is SQL's if/else, <code>COALESCE</code> replaces NULL with a default, and date and text functions clean up values.",
 "why": "Real reports need labels (“big order”), defaults (“unknown city”), months and clean names. These small tools make results readable.",
 "steps": [
  {
   "h": "CASE: if / else inside a query",
   "p": [
    "<code>CASE WHEN condition THEN value … ELSE value END</code>. Conditions are checked top to bottom; the first true one wins."
   ],
   "sql": "SELECT id, total,\n       CASE WHEN total >= 10000 THEN 'big'\n            WHEN total >= 3000  THEN 'medium'\n            ELSE 'small'\n       END AS size\nFROM orders\nORDER BY total DESC;",
   "out": {
    "cols": [
     "id",
     "total",
     "size"
    ],
    "rows": [
     [
      "6",
      "58000.00",
      "big"
     ],
     [
      "1",
      "55000.00",
      "big"
     ],
     [
      "9",
      "16000.00",
      "big"
     ],
     [
      "3",
      "9200.00",
      "medium"
     ],
     [
      "2",
      "6900.00",
      "medium"
     ],
     [
      "10",
      "3900.00",
      "medium"
     ],
     [
      "5",
      "3600.00",
      "medium"
     ],
     [
      "4",
      "3000.00",
      "medium"
     ],
     [
      "8",
      "2600.00",
      "small"
     ],
     [
      "7",
      "2000.00",
      "small"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "CASE inside SUM: several totals in one row",
   "p": [
    "A very common trick: count or sum only the rows that match, side by side. This is how you build a “pivot” report."
   ],
   "sql": "SELECT COUNT(*) FILTER (WHERE status = 'completed') AS completed,\n       COUNT(*) FILTER (WHERE status = 'pending')   AS pending,\n       SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END) AS cancelled_amount\nFROM orders;",
   "note": "<code>FILTER (WHERE …)</code> is PostgreSQL's short way. <code>SUM(CASE WHEN … THEN … ELSE 0 END)</code> works in every database.",
   "out": {
    "cols": [
     "completed",
     "pending",
     "cancelled_amount"
    ],
    "rows": [
     [
      "8",
      "1",
      "3000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "COALESCE: a default for NULL",
   "p": [
    "<code>COALESCE(a, b, c)</code> returns the first value that isn't NULL."
   ],
   "sql": "SELECT name, COALESCE(city, 'Unknown') AS city\nFROM customers\nORDER BY id;",
   "out": {
    "cols": [
     "name",
     "city"
    ],
    "rows": [
     [
      "Asha Rao",
      "Kochi"
     ],
     [
      "Ben Thomas",
      "Bengaluru"
     ],
     [
      "Chen Li",
      "Dubai"
     ],
     [
      "Divya Menon",
      "Kochi"
     ],
     [
      "Omar Khan",
      "Dubai"
     ],
     [
      "Priya Nair",
      "Unknown"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Dates",
   "p": [
    "<code>CURRENT_DATE</code> is today. Subtracting two dates gives days. <code>EXTRACT(month FROM d)</code> pulls out a part. <code>date_trunc('month', d)</code> rounds down to the month. <code>date + 7</code> adds 7 days (use <code>INTERVAL '1 month'</code> for months). <code>to_char</code> formats a date as text."
   ],
   "sql": "SELECT id, order_date,\n       EXTRACT(month FROM order_date)        AS month_no,\n       to_char(order_date, 'Mon YYYY')       AS month_label,\n       order_date + 7                        AS deliver_by,\n       DATE '2025-09-01' - order_date        AS days_ago\nFROM orders\nWHERE id <= 3;",
   "out": {
    "cols": [
     "id",
     "order_date",
     "month_no",
     "month_label",
     "deliver_by",
     "days_ago"
    ],
    "rows": [
     [
      "1",
      "2025-06-02",
      "6",
      "Jun 2025",
      "2025-06-09",
      "91"
     ],
     [
      "2",
      "2025-06-15",
      "6",
      "Jun 2025",
      "2025-06-22",
      "78"
     ],
     [
      "3",
      "2025-06-20",
      "6",
      "Jun 2025",
      "2025-06-27",
      "73"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Text",
   "p": [
    "<code>UPPER</code>, <code>LOWER</code>, <code>TRIM</code> (remove spaces), <code>LENGTH</code>, <code>||</code> (join text), <code>SPLIT_PART</code> (take a piece), <code>REPLACE</code>."
   ],
   "sql": "SELECT name,\n       UPPER(name)               AS shout,\n       SPLIT_PART(name, ' ', 1)  AS first_name,\n       LENGTH(name)              AS chars,\n       name || ' (' || COALESCE(city, '?') || ')' AS label\nFROM customers\nWHERE id IN (1, 6);",
   "out": {
    "cols": [
     "name",
     "shout",
     "first_name",
     "chars",
     "label"
    ],
    "rows": [
     [
      "Asha Rao",
      "ASHA RAO",
      "Asha",
      "8",
      "Asha Rao (Kochi)"
     ],
     [
      "Priya Nair",
      "PRIYA NAIR",
      "Priya",
      "10",
      "Priya Nair (?)"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Changing types with ::",
   "p": [
    "<code>'2025-07-01'::date</code> turns text into a date. <code>12.75::int</code> rounds to a whole number (13). <code>CAST(x AS type)</code> is the standard spelling of the same thing."
   ],
   "sql": "SELECT '2025-07-01'::date + 30 AS plus_30_days,\n       12.75::int           AS rounded,\n       CAST('42' AS int) * 2 AS doubled;",
   "out": {
    "cols": [
     "plus_30_days",
     "rounded",
     "doubled"
    ],
    "rows": [
     [
      "2025-07-31",
      "13",
      "84"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "CASE without ELSE returns NULL for rows that match nothing. Add an ELSE.",
  "<code>name || city</code> becomes NULL if city is NULL. Wrap it: <code>COALESCE(city, '')</code>.",
  "Comparing a timestamp column with <code>= '2025-07-01'</code> only matches midnight. For a whole day use <code>&gt;= '2025-07-01' AND &lt; '2025-07-02'</code>.",
  "Integer division: <code>5 / 2</code> is 2, not 2.5. Write <code>5 / 2.0</code> or cast to numeric."
 ],
 "practice": [
  {
   "q": "Label each product as 'cheap' (under 1,000), 'mid' (under 10,000) or 'premium'.",
   "sql": "SELECT name, price,\n       CASE WHEN price < 1000  THEN 'cheap'\n            WHEN price < 10000 THEN 'mid'\n            ELSE 'premium' END AS band\nFROM products\nORDER BY price;",
   "out": {
    "cols": [
     "name",
     "price",
     "band"
    ],
    "rows": [
     [
      "Notebook",
      "120.00",
      "cheap"
     ],
     [
      "Green Tea",
      "400.00",
      "cheap"
     ],
     [
      "Coffee Beans 1kg",
      "900.00",
      "cheap"
     ],
     [
      "Headphones",
      "3000.00",
      "mid"
     ],
     [
      "Desk Chair",
      "8000.00",
      "mid"
     ],
     [
      "Laptop",
      "55000.00",
      "premium"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "In one row, show completed revenue for June, July and August 2025 as three columns.",
   "sql": "SELECT SUM(total) FILTER (WHERE EXTRACT(month FROM order_date) = 6) AS jun,\n       SUM(total) FILTER (WHERE EXTRACT(month FROM order_date) = 7) AS jul,\n       SUM(total) FILTER (WHERE EXTRACT(month FROM order_date) = 8) AS aug\nFROM orders\nWHERE status = 'completed';",
   "out": {
    "cols": [
     "jun",
     "jul",
     "aug"
    ],
    "rows": [
     [
      "71100.00",
      "5600.00",
      "22500.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Show each customer's first name in capitals and their city, or 'N/A' if missing.",
   "sql": "SELECT UPPER(SPLIT_PART(name, ' ', 1)) AS first_name,\n       COALESCE(city, 'N/A') AS city\nFROM customers\nORDER BY id;",
   "out": {
    "cols": [
     "first_name",
     "city"
    ],
    "rows": [
     [
      "ASHA",
      "Kochi"
     ],
     [
      "BEN",
      "Bengaluru"
     ],
     [
      "CHEN",
      "Dubai"
     ],
     [
      "DIVYA",
      "Kochi"
     ],
     [
      "OMAR",
      "Dubai"
     ],
     [
      "PRIYA",
      "N/A"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "COALESCE(NULL, NULL, 'x', 'y') returns…",
   [
    "NULL",
    "'x'",
    "'y'",
    "An error"
   ],
   1,
   "COALESCE returns the first non-NULL value."
  ],
  [
   "A CASE with no ELSE, for a row that matches no WHEN, gives…",
   [
    "0",
    "An error",
    "NULL",
    "The first THEN value"
   ],
   2,
   "No match and no ELSE means NULL."
  ],
  [
   "What is 7 / 2 in PostgreSQL (both integers)?",
   [
    "3.5",
    "3",
    "4",
    "Error"
   ],
   1,
   "Integer ÷ integer drops the decimals. Use 7 / 2.0 for 3.5."
  ]
 ],
 "remember": [
  "CASE WHEN … THEN … ELSE … END = if/else. Always add ELSE.",
  "Pivot: SUM(CASE WHEN cond THEN x ELSE 0 END) or COUNT(*) FILTER (WHERE cond).",
  "COALESCE(col, default) replaces NULL.",
  "Dates: CURRENT_DATE, date − date = days, date + 7, + INTERVAL '1 month', EXTRACT, date_trunc, to_char.",
  "Text: UPPER, LOWER, TRIM, LENGTH, ||, SPLIT_PART, REPLACE. Cast with ::type.",
  "int / int drops decimals: use 2.0 or ::numeric."
 ]
};
L["sql:joins"] = {
 "title": "JOINs: combining tables",
 "level": "Intermediate",
 "one": "A <b>JOIN</b> puts two tables side by side by matching a key, like <code>orders.customer_id = customers.id</code>.",
 "why": "Data is split across tables on purpose. To answer “which customer placed this order?” or “revenue per product”, you must join. JOINs are asked in almost every SQL interview.",
 "steps": [
  {
   "h": "INNER JOIN: only rows that match",
   "p": [
    "<code>JOIN</code> (same as <code>INNER JOIN</code>) keeps a row only when both sides match. Give tables short names (<code>o</code>, <code>c</code>) and prefix columns with them."
   ],
   "sql": "SELECT o.id, c.name, o.order_date, o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'completed'\nORDER BY o.id;",
   "out": {
    "cols": [
     "id",
     "name",
     "order_date",
     "total"
    ],
    "rows": [
     [
      "1",
      "Asha Rao",
      "2025-06-02",
      "55000.00"
     ],
     [
      "2",
      "Asha Rao",
      "2025-06-15",
      "6900.00"
     ],
     [
      "3",
      "Ben Thomas",
      "2025-06-20",
      "9200.00"
     ],
     [
      "5",
      "Ben Thomas",
      "2025-07-05",
      "3600.00"
     ],
     [
      "7",
      "Omar Khan",
      "2025-07-22",
      "2000.00"
     ],
     [
      "8",
      "Asha Rao",
      "2025-08-03",
      "2600.00"
     ],
     [
      "9",
      "Chen Li",
      "2025-08-10",
      "16000.00"
     ],
     [
      "10",
      "Divya Menon",
      "2025-08-25",
      "3900.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "LEFT JOIN: keep everything on the left",
   "p": [
    "<code>LEFT JOIN</code> keeps every row from the left table. Where there is no match on the right, the right columns are NULL.",
    "Priya has no orders, so her order columns are NULL:"
   ],
   "sql": "SELECT c.name, o.id AS order_id, o.total\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
   "out": {
    "cols": [
     "name",
     "order_id",
     "total"
    ],
    "rows": [
     [
      "Asha Rao",
      "1",
      "55000.00"
     ],
     [
      "Asha Rao",
      "2",
      "6900.00"
     ],
     [
      "Asha Rao",
      "8",
      "2600.00"
     ],
     [
      "Ben Thomas",
      "3",
      "9200.00"
     ],
     [
      "Ben Thomas",
      "5",
      "3600.00"
     ],
     [
      "Chen Li",
      "4",
      "3000.00"
     ],
     [
      "Chen Li",
      "9",
      "16000.00"
     ],
     [
      "Divya Menon",
      "6",
      "58000.00"
     ],
     [
      "Divya Menon",
      "10",
      "3900.00"
     ],
     [
      "Omar Khan",
      "7",
      "2000.00"
     ],
     [
      "Priya Nair",
      null,
      null
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Find rows with no match",
   "p": [
    "“Customers who never ordered”: LEFT JOIN, then keep rows where the right side is NULL. This pattern is called an <b>anti-join</b>."
   ],
   "sql": "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Priya Nair"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Joining three tables",
   "p": [
    "Chain joins one after another. Here: order items → products (for the name) → orders (to keep completed only). Then group to get revenue per product."
   ],
   "sql": "SELECT p.name, SUM(i.qty) AS units, SUM(i.qty * i.price) AS revenue\nFROM order_items i\nJOIN products p ON p.id = i.product_id\nJOIN orders   o ON o.id = i.order_id\nWHERE o.status = 'completed'\nGROUP BY p.name\nORDER BY revenue DESC;",
   "out": {
    "cols": [
     "name",
     "units",
     "revenue"
    ],
    "rows": [
     [
      "Laptop",
      "1",
      "55000.00"
     ],
     [
      "Desk Chair",
      "3",
      "24000.00"
     ],
     [
      "Headphones",
      "3",
      "9000.00"
     ],
     [
      "Coffee Beans 1kg",
      "8",
      "7200.00"
     ],
     [
      "Green Tea",
      "10",
      "4000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "The trap: doubled totals",
   "p": [
    "One order has many items. When you join orders to order_items, each order row repeats once per item. Then <code>SUM(o.total)</code> counts the same order several times.",
    "Asha's real completed total is 64,500 (55,000 + 6,900 + 2,600). Look what happens:"
   ],
   "sql": "SELECT c.name, SUM(o.total) AS wrong_total\nFROM customers c\nJOIN orders o      ON o.customer_id = c.id\nJOIN order_items i ON i.order_id = o.id\nWHERE o.status = 'completed'\nGROUP BY c.name\nORDER BY c.name;",
   "note": "Asha shows 74,000 instead of 64,500, because orders 2 and 8 each have two items. <b>Fix:</b> don't join the items when you only need order totals, or sum the item level (<code>qty * price</code>) instead of the order total.",
   "out": {
    "cols": [
     "name",
     "wrong_total"
    ],
    "rows": [
     [
      "Asha Rao",
      "74000.00"
     ],
     [
      "Ben Thomas",
      "22000.00"
     ],
     [
      "Chen Li",
      "16000.00"
     ],
     [
      "Divya Menon",
      "7800.00"
     ],
     [
      "Omar Khan",
      "2000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Where you put the filter matters in a LEFT JOIN",
   "p": [
    "A condition on the right table in <b>WHERE</b> throws away the NULL rows, so your LEFT JOIN quietly becomes an INNER JOIN. Put it in the <b>ON</b> part to keep everyone.",
    "Every customer with their count of <i>completed</i> orders, including zero:"
   ],
   "sql": "SELECT c.name, COUNT(o.id) AS completed_orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'\nGROUP BY c.name\nORDER BY completed_orders DESC, c.name;",
   "note": "<code>COUNT(o.id)</code> counts only matched orders, so Priya gets 0. <code>COUNT(*)</code> would wrongly give her 1.",
   "out": {
    "cols": [
     "name",
     "completed_orders"
    ],
    "rows": [
     [
      "Asha Rao",
      "3"
     ],
     [
      "Ben Thomas",
      "2"
     ],
     [
      "Chen Li",
      "1"
     ],
     [
      "Divya Menon",
      "1"
     ],
     [
      "Omar Khan",
      "1"
     ],
     [
      "Priya Nair",
      "0"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "Summing a parent column (like <code>orders.total</code>) after joining to a child table (items). Totals double. Check row counts before and after every join.",
  "Filtering the right table in WHERE after a LEFT JOIN. It drops the unmatched rows. Move the condition into ON.",
  "<code>COUNT(*)</code> after a LEFT JOIN counts the NULL row as 1. Use <code>COUNT(right.id)</code>.",
  "Forgetting the ON condition, or joining on the wrong column. You get every combination (a huge result)."
 ],
 "practice": [
  {
   "q": "Show each order item with the product name and the customer name (order_id, customer, product, qty).",
   "sql": "SELECT i.order_id, c.name AS customer, p.name AS product, i.qty\nFROM order_items i\nJOIN orders    o ON o.id = i.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN products  p ON p.id = i.product_id\nORDER BY i.order_id, p.name;",
   "out": {
    "cols": [
     "order_id",
     "customer",
     "product",
     "qty"
    ],
    "rows": [
     [
      "1",
      "Asha Rao",
      "Laptop",
      "1"
     ],
     [
      "2",
      "Asha Rao",
      "Coffee Beans 1kg",
      "1"
     ],
     [
      "2",
      "Asha Rao",
      "Headphones",
      "2"
     ],
     [
      "3",
      "Ben Thomas",
      "Desk Chair",
      "1"
     ],
     [
      "3",
      "Ben Thomas",
      "Green Tea",
      "3"
     ],
     [
      "4",
      "Chen Li",
      "Headphones",
      "1"
     ],
     [
      "5",
      "Ben Thomas",
      "Coffee Beans 1kg",
      "4"
     ],
     [
      "6",
      "Divya Menon",
      "Headphones",
      "1"
     ],
     [
      "6",
      "Divya Menon",
      "Laptop",
      "1"
     ],
     [
      "7",
      "Omar Khan",
      "Green Tea",
      "5"
     ],
     [
      "8",
      "Asha Rao",
      "Coffee Beans 1kg",
      "2"
     ],
     [
      "8",
      "Asha Rao",
      "Green Tea",
      "2"
     ],
     [
      "9",
      "Chen Li",
      "Desk Chair",
      "2"
     ],
     [
      "10",
      "Divya Menon",
      "Coffee Beans 1kg",
      "1"
     ],
     [
      "10",
      "Divya Menon",
      "Headphones",
      "1"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Which products have never been sold?",
   "sql": "SELECT p.name\nFROM products p\nLEFT JOIN order_items i ON i.product_id = p.id\nWHERE i.id IS NULL;",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Notebook"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Completed revenue per city (from order totals, no items).",
   "sql": "SELECT c.city, SUM(o.total) AS revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.city\nORDER BY revenue DESC;",
   "out": {
    "cols": [
     "city",
     "revenue"
    ],
    "rows": [
     [
      "Kochi",
      "68400.00"
     ],
     [
      "Dubai",
      "18000.00"
     ],
     [
      "Bengaluru",
      "12800.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "Which join keeps customers with no orders?",
   [
    "INNER JOIN",
    "customers LEFT JOIN orders",
    "orders LEFT JOIN customers",
    "Any join"
   ],
   1,
   "LEFT JOIN keeps every row of the left table, here customers."
  ],
  [
   "You join orders to order_items and SUM(orders.total). The result is too big. Why?",
   [
    "Bad data",
    "Each order repeats once per item, so its total is added several times",
    "SUM is broken",
    "You need DISTINCT in SELECT"
   ],
   1,
   "One-to-many joins repeat the parent row."
  ],
  [
   "customers c LEFT JOIN orders o ON … WHERE o.status = 'completed' …",
   [
    "Keeps all customers",
    "Drops customers with no orders, like an INNER JOIN",
    "Errors",
    "Returns only NULLs"
   ],
   1,
   "WHERE removes rows where o.status is NULL. Put the condition in ON."
  ]
 ],
 "remember": [
  "JOIN = matching rows only. LEFT JOIN = all left rows + NULLs where no match.",
  "Never matched: LEFT JOIN … WHERE right.id IS NULL.",
  "One-to-many joins repeat the parent row: don't SUM parent columns after joining children.",
  "Right-table filters in a LEFT JOIN go in ON, not WHERE.",
  "After a LEFT JOIN, count with COUNT(right.id), not COUNT(*)."
 ]
};
L["sql:exists-union"] = {
 "title": "More ways to combine: EXISTS, UNION and self joins",
 "level": "Intermediate",
 "one": "<code>EXISTS</code> asks “is there at least one matching row?”, <code>UNION</code> stacks results on top of each other, and a <b>self join</b> joins a table to itself.",
 "why": "These solve questions JOIN handles badly: “customers who bought tea”, “one list of all contacts”, “who is each employee's manager?”.",
 "steps": [
  {
   "h": "EXISTS: is there at least one?",
   "p": [
    "<code>WHERE EXISTS (subquery)</code> keeps a row if the subquery finds anything. It never repeats rows, so there's no doubling problem.",
    "Customers who have at least one completed order:"
   ],
   "sql": "SELECT c.name\nFROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'completed'\n)\nORDER BY c.name;",
   "note": "<code>SELECT 1</code> is a habit: EXISTS only cares whether a row exists, not what's in it.",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Asha Rao"
     ],
     [
      "Ben Thomas"
     ],
     [
      "Chen Li"
     ],
     [
      "Divya Menon"
     ],
     [
      "Omar Khan"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "NOT EXISTS: none at all",
   "p": [
    "The safest way to find “no match”. Customers who never bought a Grocery product:"
   ],
   "sql": "SELECT c.name\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p    ON p.id = i.product_id\n  WHERE o.customer_id = c.id AND p.category = 'Grocery'\n)\nORDER BY c.name;",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Chen Li"
     ],
     [
      "Priya Nair"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "IN with a subquery",
   "p": [
    "<code>IN (SELECT …)</code> reads well for simple lists. Products that appear in a cancelled order:"
   ],
   "sql": "SELECT name FROM products\nWHERE id IN (\n  SELECT i.product_id\n  FROM order_items i JOIN orders o ON o.id = i.order_id\n  WHERE o.status = 'cancelled'\n);",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Headphones"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "UNION and UNION ALL: stack results",
   "p": [
    "Both queries must have the same number of columns, in the same order and type. <code>UNION</code> removes duplicate rows; <code>UNION ALL</code> keeps everything and is faster."
   ],
   "sql": "SELECT name, 'customer' AS kind FROM customers WHERE city = 'Dubai'\nUNION ALL\nSELECT name, 'employee' FROM employees WHERE manager_id = 1\nORDER BY kind, name;",
   "out": {
    "cols": [
     "name",
     "kind"
    ],
    "rows": [
     [
      "Chen Li",
      "customer"
     ],
     [
      "Omar Khan",
      "customer"
     ],
     [
      "Arjun",
      "employee"
     ],
     [
      "Sara",
      "employee"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Self join: a table joined to itself",
   "p": [
    "<code>employees.manager_id</code> points to another row in the same table. Join the table to itself with two different short names."
   ],
   "sql": "SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.id = e.manager_id\nORDER BY e.id;",
   "out": {
    "cols": [
     "employee",
     "manager"
    ],
    "rows": [
     [
      "Meera",
      null
     ],
     [
      "Arjun",
      "Meera"
     ],
     [
      "Sara",
      "Meera"
     ],
     [
      "Kiran",
      "Arjun"
     ],
     [
      "Leo",
      "Arjun"
     ],
     [
      "Nisha",
      "Sara"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "<code>NOT IN (subquery)</code> when the subquery can return NULL: it returns no rows at all. Use <code>NOT EXISTS</code> instead.",
  "Using UNION when you meant UNION ALL. UNION quietly removes duplicates and is slower.",
  "UNION with columns in a different order: the database stacks them by position, not by name."
 ],
 "practice": [
  {
   "q": "Customers who bought Headphones (use EXISTS).",
   "sql": "SELECT c.name\nFROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  JOIN order_items i ON i.order_id = o.id\n  JOIN products p    ON p.id = i.product_id\n  WHERE o.customer_id = c.id AND p.name = 'Headphones'\n)\nORDER BY c.name;",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Asha Rao"
     ],
     [
      "Chen Li"
     ],
     [
      "Divya Menon"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "List each manager and how many people report directly to them.",
   "sql": "SELECT m.name AS manager, COUNT(e.id) AS reports\nFROM employees m\nJOIN employees e ON e.manager_id = m.id\nGROUP BY m.name\nORDER BY reports DESC, m.name;",
   "out": {
    "cols": [
     "manager",
     "reports"
    ],
    "rows": [
     [
      "Arjun",
      "2"
     ],
     [
      "Meera",
      "2"
     ],
     [
      "Sara",
      "1"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Why is NOT EXISTS safer than NOT IN?",
   "a": "If the subquery returns even one NULL, <code>x NOT IN (…)</code> is never true, so you get zero rows. NOT EXISTS isn't affected by NULLs."
  }
 ],
 "check": [
  [
   "What does UNION do that UNION ALL doesn't?",
   [
    "Sorts the result",
    "Removes duplicate rows",
    "Joins on keys",
    "Nothing"
   ],
   1,
   "UNION removes duplicates; UNION ALL keeps them."
  ],
  [
   "Best way to find customers with no orders?",
   [
    "NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)",
    "WHERE orders = 0",
    "INNER JOIN orders",
    "UNION"
   ],
   0,
   "NOT EXISTS (or LEFT JOIN … IS NULL) is the standard anti-join."
  ],
  [
   "To show each employee with their manager's name you need…",
   [
    "UNION",
    "A self join on manager_id",
    "GROUP BY",
    "EXISTS"
   ],
   1,
   "Join employees to employees: e.manager_id = m.id."
  ]
 ],
 "remember": [
  "EXISTS = at least one match; never duplicates rows.",
  "Use NOT EXISTS, not NOT IN, when NULLs are possible.",
  "UNION removes duplicates; UNION ALL keeps all (faster). Same columns, same order.",
  "Self join: same table twice with different aliases (employee e, manager m)."
 ]
};
L["sql:ctes"] = {
 "title": "Subqueries and CTEs (WITH)",
 "level": "Intermediate",
 "one": "A <b>CTE</b> (<code>WITH name AS (…)</code>) gives a step of your query a name, so you can build big answers from small, readable steps.",
 "why": "Real questions take several steps: “find each customer's total, then compare it with the average”. CTEs keep this readable and fix the doubled-totals problem from the JOIN lesson.",
 "steps": [
  {
   "h": "A subquery inside WHERE",
   "p": [
    "A query inside brackets runs first and gives a value. Orders bigger than the average completed order:"
   ],
   "sql": "SELECT id, total\nFROM orders\nWHERE status = 'completed'\n  AND total > (SELECT AVG(total) FROM orders WHERE status = 'completed')\nORDER BY total DESC;",
   "out": {
    "cols": [
     "id",
     "total"
    ],
    "rows": [
     [
      "1",
      "55000.00"
     ],
     [
      "9",
      "16000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "The same idea as a CTE",
   "p": [
    "<code>WITH</code> names a step. You then use it like a table. Read it top to bottom like a recipe."
   ],
   "sql": "WITH done AS (\n  SELECT * FROM orders WHERE status = 'completed'\n),\nstats AS (\n  SELECT AVG(total) AS avg_total FROM done\n)\nSELECT d.id, d.total, ROUND(s.avg_total) AS average\nFROM done d, stats s\nWHERE d.total > s.avg_total\nORDER BY d.total DESC;",
   "out": {
    "cols": [
     "id",
     "total",
     "average"
    ],
    "rows": [
     [
      "1",
      "55000.00",
      "12400"
     ],
     [
      "9",
      "16000.00",
      "12400"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Aggregate first, then join (the doubled-totals fix)",
   "p": [
    "Work out item totals per order in one step, then join that to orders. Each order now appears once, so totals are right."
   ],
   "sql": "WITH item_totals AS (\n  SELECT order_id, SUM(qty * price) AS items_total, COUNT(*) AS lines\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT o.id, o.total, t.items_total, t.lines\nFROM orders o\nJOIN item_totals t ON t.order_id = o.id\nORDER BY o.id;",
   "note": "This is also how you check data: order total should equal the sum of its items. Here they all match.",
   "out": {
    "cols": [
     "id",
     "total",
     "items_total",
     "lines"
    ],
    "rows": [
     [
      "1",
      "55000.00",
      "55000.00",
      "1"
     ],
     [
      "2",
      "6900.00",
      "6900.00",
      "2"
     ],
     [
      "3",
      "9200.00",
      "9200.00",
      "2"
     ],
     [
      "4",
      "3000.00",
      "3000.00",
      "1"
     ],
     [
      "5",
      "3600.00",
      "3600.00",
      "1"
     ],
     [
      "6",
      "58000.00",
      "58000.00",
      "2"
     ],
     [
      "7",
      "2000.00",
      "2000.00",
      "1"
     ],
     [
      "8",
      "2600.00",
      "2600.00",
      "2"
     ],
     [
      "9",
      "16000.00",
      "16000.00",
      "1"
     ],
     [
      "10",
      "3900.00",
      "3900.00",
      "2"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Several steps: customers above average spend",
   "p": [
    "Step 1: spend per customer. Step 2: the average of those. Step 3: compare."
   ],
   "sql": "WITH spend AS (\n  SELECT customer_id, SUM(total) AS spent\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY customer_id\n)\nSELECT c.name, s.spent\nFROM spend s\nJOIN customers c ON c.id = s.customer_id\nWHERE s.spent > (SELECT AVG(spent) FROM spend)\nORDER BY s.spent DESC;",
   "out": {
    "cols": [
     "name",
     "spent"
    ],
    "rows": [
     [
      "Asha Rao",
      "64500.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "A subquery used with <code>=</code> that returns more than one row → error. Use <code>IN</code>, or make sure it returns one value.",
  "Writing one giant query. Break it into CTE steps and run each step alone to check it.",
  "Forgetting the comma between CTEs: <code>WITH a AS (…), b AS (…)</code>."
 ],
 "practice": [
  {
   "q": "Products priced above the average product price.",
   "sql": "SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products)\nORDER BY price DESC;",
   "out": {
    "cols": [
     "name",
     "price"
    ],
    "rows": [
     [
      "Laptop",
      "55000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Using a CTE, find each customer's number of completed orders, then show only customers with 2 or more.",
   "sql": "WITH counts AS (\n  SELECT customer_id, COUNT(*) AS n\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY customer_id\n)\nSELECT c.name, counts.n\nFROM counts JOIN customers c ON c.id = counts.customer_id\nWHERE counts.n >= 2\nORDER BY counts.n DESC;",
   "out": {
    "cols": [
     "name",
     "n"
    ],
    "rows": [
     [
      "Asha Rao",
      "3"
     ],
     [
      "Ben Thomas",
      "2"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Check the data: list any order whose total does not equal the sum of its items.",
   "sql": "WITH item_totals AS (\n  SELECT order_id, SUM(qty * price) AS items_total\n  FROM order_items GROUP BY order_id\n)\nSELECT o.id, o.total, t.items_total\nFROM orders o JOIN item_totals t ON t.order_id = o.id\nWHERE o.total <> t.items_total;",
   "a": "No rows: every order matches. On a real client database, this kind of check often finds bugs.",
   "out": {
    "cols": [
     "id",
     "total",
     "items_total"
    ],
    "rows": [],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "What does WITH x AS (…) do?",
   [
    "Creates a permanent table",
    "Names a step you can use later in the same query",
    "Creates an index",
    "Starts a transaction"
   ],
   1,
   "A CTE only exists while that one query runs."
  ],
  [
   "How do you avoid doubled totals when you need both order totals and item counts?",
   [
    "Use DISTINCT",
    "Aggregate the items per order first (CTE), then join",
    "Use UNION",
    "Use LIMIT"
   ],
   1,
   "Aggregate the 'many' side first so each order has one row."
  ],
  [
   "WHERE price = (SELECT price FROM products) errors because…",
   [
    "= can't compare numbers",
    "The subquery returns many rows, but = needs one value",
    "Missing GROUP BY",
    "Subqueries aren't allowed in WHERE"
   ],
   1,
   "Use IN for a list, or make the subquery return one value."
  ]
 ],
 "remember": [
  "Subquery = a query in brackets that runs first.",
  "CTE: WITH step1 AS (…), step2 AS (…) SELECT … Read top to bottom.",
  "Fix doubled totals: aggregate the child table in a CTE, then join.",
  "Build big queries step by step; run each CTE alone to check it."
 ]
};
L["sql:window-functions"] = {
 "title": "Window functions: rank, running totals, previous row",
 "level": "Advanced",
 "one": "A <b>window function</b> calculates across related rows <i>without squashing them</i>: you keep every row and add a rank, a running total or the previous value.",
 "why": "“Top product per category”, “month-over-month growth”, “each customer's latest order”: these are classic interview questions, and window functions solve them cleanly.",
 "steps": [
  {
   "h": "GROUP BY squashes, OVER doesn't",
   "p": [
    "<code>SUM(total) OVER (PARTITION BY customer_id)</code> works out each customer's total but keeps every order row. <code>PARTITION BY</code> is like GROUP BY for windows."
   ],
   "sql": "SELECT id, customer_id, total,\n       SUM(total) OVER (PARTITION BY customer_id) AS customer_total\nFROM orders\nWHERE status = 'completed'\nORDER BY customer_id, id;",
   "out": {
    "cols": [
     "id",
     "customer_id",
     "total",
     "customer_total"
    ],
    "rows": [
     [
      "1",
      "1",
      "55000.00",
      "64500.00"
     ],
     [
      "2",
      "1",
      "6900.00",
      "64500.00"
     ],
     [
      "8",
      "1",
      "2600.00",
      "64500.00"
     ],
     [
      "3",
      "2",
      "9200.00",
      "12800.00"
     ],
     [
      "5",
      "2",
      "3600.00",
      "12800.00"
     ],
     [
      "9",
      "3",
      "16000.00",
      "16000.00"
     ],
     [
      "10",
      "4",
      "3900.00",
      "3900.00"
     ],
     [
      "7",
      "5",
      "2000.00",
      "2000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Numbering rows: ROW_NUMBER, RANK, DENSE_RANK",
   "p": [
    "Add <code>ORDER BY</code> inside OVER to number rows. On ties, <code>ROW_NUMBER</code> still gives 1, 2, 3; <code>RANK</code> gives 1, 1, 3; <code>DENSE_RANK</code> gives 1, 1, 2."
   ],
   "sql": "WITH counts AS (\n  SELECT c.name, COUNT(o.id) AS orders\n  FROM customers c\n  LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'\n  GROUP BY c.name\n)\nSELECT name, orders,\n       ROW_NUMBER() OVER (ORDER BY orders DESC, name) AS row_no,\n       RANK()       OVER (ORDER BY orders DESC)       AS rnk,\n       DENSE_RANK() OVER (ORDER BY orders DESC)       AS dense\nFROM counts\nORDER BY orders DESC, name;",
   "note": "Chen, Divya and Omar tie on 1 order. RANK gives all three 3, then jumps to 6 for Priya. DENSE_RANK gives them 3, then 4.",
   "out": {
    "cols": [
     "name",
     "orders",
     "row_no",
     "rnk",
     "dense"
    ],
    "rows": [
     [
      "Asha Rao",
      "3",
      "1",
      "1",
      "1"
     ],
     [
      "Ben Thomas",
      "2",
      "2",
      "2",
      "2"
     ],
     [
      "Chen Li",
      "1",
      "3",
      "3",
      "3"
     ],
     [
      "Divya Menon",
      "1",
      "4",
      "3",
      "3"
     ],
     [
      "Omar Khan",
      "1",
      "5",
      "3",
      "3"
     ],
     [
      "Priya Nair",
      "0",
      "6",
      "6",
      "4"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Top 1 per group",
   "p": [
    "The classic pattern: number rows inside each group, then keep number 1. Each customer's most recent order:"
   ],
   "sql": "WITH ranked AS (\n  SELECT o.*,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn\n  FROM orders o\n)\nSELECT customer_id, id AS latest_order, order_date, status\nFROM ranked\nWHERE rn = 1\nORDER BY customer_id;",
   "note": "You can't filter on a window function in WHERE (it runs at the SELECT step), so you wrap it in a CTE first.",
   "out": {
    "cols": [
     "customer_id",
     "latest_order",
     "order_date",
     "status"
    ],
    "rows": [
     [
      "1",
      "8",
      "2025-08-03",
      "completed"
     ],
     [
      "2",
      "5",
      "2025-07-05",
      "completed"
     ],
     [
      "3",
      "9",
      "2025-08-10",
      "completed"
     ],
     [
      "4",
      "10",
      "2025-08-25",
      "completed"
     ],
     [
      "5",
      "7",
      "2025-07-22",
      "completed"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Running totals",
   "p": [
    "<code>SUM(…) OVER (ORDER BY …)</code> adds up everything so far. Revenue growing day by day:"
   ],
   "sql": "SELECT order_date, total,\n       SUM(total) OVER (ORDER BY order_date) AS running_revenue\nFROM orders\nWHERE status = 'completed'\nORDER BY order_date;",
   "out": {
    "cols": [
     "order_date",
     "total",
     "running_revenue"
    ],
    "rows": [
     [
      "2025-06-02",
      "55000.00",
      "55000.00"
     ],
     [
      "2025-06-15",
      "6900.00",
      "61900.00"
     ],
     [
      "2025-06-20",
      "9200.00",
      "71100.00"
     ],
     [
      "2025-07-05",
      "3600.00",
      "74700.00"
     ],
     [
      "2025-07-22",
      "2000.00",
      "76700.00"
     ],
     [
      "2025-08-03",
      "2600.00",
      "79300.00"
     ],
     [
      "2025-08-10",
      "16000.00",
      "95300.00"
     ],
     [
      "2025-08-25",
      "3900.00",
      "99200.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Previous row: LAG (and LEAD)",
   "p": [
    "<code>LAG(x)</code> looks one row back; <code>LEAD(x)</code> looks one row ahead. Monthly revenue with change from last month:"
   ],
   "sql": "WITH monthly AS (\n  SELECT date_trunc('month', order_date)::date AS month, SUM(total) AS revenue\n  FROM orders WHERE status = 'completed'\n  GROUP BY 1\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month)           AS last_month,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly\nORDER BY month;",
   "note": "<code>GROUP BY 1</code> means “group by the first column in SELECT”. June has no previous month, so LAG is NULL.",
   "out": {
    "cols": [
     "month",
     "revenue",
     "last_month",
     "change"
    ],
    "rows": [
     [
      "2025-06-01",
      "71100.00",
      null,
      null
     ],
     [
      "2025-07-01",
      "5600.00",
      "71100.00",
      "-65500.00"
     ],
     [
      "2025-08-01",
      "22500.00",
      "5600.00",
      "16900.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "Filtering on a window function in WHERE → error. Compute it in a CTE, filter outside.",
  "Using RANK when you need exactly one row per group. Ties give two rank-1 rows. Use ROW_NUMBER.",
  "Forgetting ORDER BY inside OVER for ROW_NUMBER, LAG or running totals: the order becomes random."
 ],
 "practice": [
  {
   "q": "Most expensive product in each category (one row per category).",
   "sql": "WITH r AS (\n  SELECT name, category, price,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn\n  FROM products\n)\nSELECT category, name, price FROM r WHERE rn = 1 ORDER BY category;",
   "out": {
    "cols": [
     "category",
     "name",
     "price"
    ],
    "rows": [
     [
      "Electronics",
      "Laptop",
      "55000.00"
     ],
     [
      "Furniture",
      "Desk Chair",
      "8000.00"
     ],
     [
      "Grocery",
      "Coffee Beans 1kg",
      "900.00"
     ],
     [
      "Stationery",
      "Notebook",
      "120.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "For each completed order, show the customer's previous order date (or NULL).",
   "sql": "SELECT customer_id, id, order_date,\n       LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS previous_order\nFROM orders\nWHERE status = 'completed'\nORDER BY customer_id, order_date;",
   "out": {
    "cols": [
     "customer_id",
     "id",
     "order_date",
     "previous_order"
    ],
    "rows": [
     [
      "1",
      "1",
      "2025-06-02",
      null
     ],
     [
      "1",
      "2",
      "2025-06-15",
      "2025-06-02"
     ],
     [
      "1",
      "8",
      "2025-08-03",
      "2025-06-15"
     ],
     [
      "2",
      "3",
      "2025-06-20",
      null
     ],
     [
      "2",
      "5",
      "2025-07-05",
      "2025-06-20"
     ],
     [
      "3",
      "9",
      "2025-08-10",
      null
     ],
     [
      "4",
      "10",
      "2025-08-25",
      null
     ],
     [
      "5",
      "7",
      "2025-07-22",
      null
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Each order's share of its customer's total spend, as a percentage (completed only).",
   "sql": "SELECT customer_id, id, total,\n       ROUND(100.0 * total / SUM(total) OVER (PARTITION BY customer_id), 1) AS pct_of_customer\nFROM orders\nWHERE status = 'completed'\nORDER BY customer_id, id;",
   "out": {
    "cols": [
     "customer_id",
     "id",
     "total",
     "pct_of_customer"
    ],
    "rows": [
     [
      "1",
      "1",
      "55000.00",
      "85.3"
     ],
     [
      "1",
      "2",
      "6900.00",
      "10.7"
     ],
     [
      "1",
      "8",
      "2600.00",
      "4.0"
     ],
     [
      "2",
      "3",
      "9200.00",
      "71.9"
     ],
     [
      "2",
      "5",
      "3600.00",
      "28.1"
     ],
     [
      "3",
      "9",
      "16000.00",
      "100.0"
     ],
     [
      "4",
      "10",
      "3900.00",
      "100.0"
     ],
     [
      "5",
      "7",
      "2000.00",
      "100.0"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "Prices 100, 100, 90 sorted DESC. RANK() gives…",
   [
    "1, 2, 3",
    "1, 1, 2",
    "1, 1, 3",
    "1, 2, 2"
   ],
   2,
   "RANK skips after ties: 1, 1, 3. DENSE_RANK would give 1, 1, 2."
  ],
  [
   "What does PARTITION BY do?",
   [
    "Sorts the table",
    "Splits rows into groups for the window, without squashing them",
    "Deletes duplicates",
    "Creates a new table"
   ],
   1,
   "Like GROUP BY, but every row stays."
  ],
  [
   "Best pattern for 'latest order per customer'?",
   [
    "MAX(id) only",
    "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) = 1",
    "LIMIT 1",
    "DISTINCT customer_id"
   ],
   1,
   "Number each customer's orders newest first, keep row 1."
  ]
 ],
 "remember": [
  "func() OVER (PARTITION BY group ORDER BY sort): keeps every row.",
  "ROW_NUMBER 1,2,3 · RANK 1,1,3 · DENSE_RANK 1,1,2.",
  "Top-N per group: ROW_NUMBER in a CTE, then WHERE rn <= N.",
  "Running total: SUM(x) OVER (ORDER BY date).",
  "LAG = previous row, LEAD = next row.",
  "Can't filter window results in WHERE: wrap in a CTE."
 ]
};
L["sql:changing-data"] = {
 "title": "Changing data: INSERT, UPDATE, DELETE and UPSERT",
 "level": "Intermediate",
 "one": "<code>INSERT</code> adds rows, <code>UPDATE</code> changes them, <code>DELETE</code> removes them, and <b>UPSERT</b> inserts or updates in one go.",
 "why": "Imports, data fixes and integrations all change data. One wrong UPDATE can damage thousands of rows, so the safe habits here matter more than the syntax.",
 "steps": [
  {
   "h": "INSERT: add rows",
   "p": [
    "Name the columns, then give the values. <code>RETURNING</code> shows what was inserted (handy for getting new ids)."
   ],
   "sql": "INSERT INTO customers (id, name, city, joined_on)\nVALUES (7, 'Rahul Das', 'Chennai', '2025-09-01')\nRETURNING *;",
   "note": "Every example in this lesson runs inside a transaction that is rolled back, so the practice data stays the same for you.",
   "out": {
    "cols": [
     "id",
     "name",
     "city",
     "joined_on"
    ],
    "rows": [
     [
      "7",
      "Rahul Das",
      "Chennai",
      "2025-09-01"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "UPDATE: change rows (always with WHERE)",
   "p": [
    "<b>Safe habit:</b> first run a SELECT with the same WHERE to see which rows will change. Then run the UPDATE."
   ],
   "sql": "UPDATE orders\nSET status = 'completed'\nWHERE id = 6\nRETURNING id, status, total;",
   "out": {
    "cols": [
     "id",
     "status",
     "total"
    ],
    "rows": [
     [
      "6",
      "completed",
      "58000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "UPDATE using another table",
   "p": [
    "Mark pending orders from Kochi customers as completed. <code>UPDATE … FROM</code> lets you join."
   ],
   "sql": "UPDATE orders o\nSET status = 'completed'\nFROM customers c\nWHERE c.id = o.customer_id\n  AND c.city = 'Kochi'\n  AND o.status = 'pending'\nRETURNING o.id, c.name;",
   "out": {
    "cols": [
     "id",
     "name"
    ],
    "rows": [
     [
      "6",
      "Divya Menon"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "DELETE: remove rows",
   "p": [
    "Same rule: WHERE, and check with SELECT first. A table with a <b>foreign key</b> protects you: you can't delete a customer who still has orders."
   ],
   "sql": "DELETE FROM customers WHERE id = 1;",
   "expectError": true,
   "out": {
    "error": "ERROR: update or delete on table \"customers\" violates foreign key constraint \"orders_customer_id_fkey\" on table \"orders\""
   }
  },
  {
   "h": "UPSERT: insert, or update if it already exists",
   "p": [
    "<code>INSERT … ON CONFLICT (key) DO UPDATE</code>. Perfect for syncing data from another system: run it again and again safely. <code>EXCLUDED</code> means “the row you tried to insert”."
   ],
   "sql": "INSERT INTO products (id, name, category, price)\nVALUES (2, 'Headphones', 'Electronics', 3200),\n       (7, 'USB Cable',  'Electronics',  250)\nON CONFLICT (id) DO UPDATE\nSET price = EXCLUDED.price\nRETURNING id, name, price;",
   "note": "Product 2 already existed, so its price was updated. Product 7 was new, so it was inserted.",
   "out": {
    "cols": [
     "id",
     "name",
     "price"
    ],
    "rows": [
     [
      "2",
      "Headphones",
      "3200.00"
     ],
     [
      "7",
      "USB Cable",
      "250.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "UPDATE or DELETE without WHERE changes <b>every row</b>. Always SELECT first, and on real data wrap the change in <code>BEGIN; … COMMIT;</code> so you can ROLLBACK.",
  "Inserting without naming columns: <code>INSERT INTO t VALUES (…)</code> breaks when someone adds a column.",
  "Running an import twice and creating duplicates. Use UPSERT (ON CONFLICT) with a unique key.",
  "Deleting parent rows (customers) before child rows (orders). Delete children first, or rethink why you're deleting."
 ],
 "practice": [
  {
   "q": "Add a new product: id 8, 'Bookshelf', 'Furniture', 6500. Return the new row.",
   "sql": "INSERT INTO products (id, name, category, price)\nVALUES (8, 'Bookshelf', 'Furniture', 6500)\nRETURNING *;",
   "out": {
    "cols": [
     "id",
     "name",
     "category",
     "price"
    ],
    "rows": [
     [
      "8",
      "Bookshelf",
      "Furniture",
      "6500.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Increase all Grocery prices by 10%. Return name and new price.",
   "sql": "UPDATE products\nSET price = ROUND(price * 1.10, 2)\nWHERE category = 'Grocery'\nRETURNING name, price;",
   "out": {
    "cols": [
     "name",
     "price"
    ],
    "rows": [
     [
      "Coffee Beans 1kg",
      "990.00"
     ],
     [
      "Green Tea",
      "440.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Upsert customer 6 (Priya) with city 'Mumbai'. If she exists, only update the city.",
   "sql": "INSERT INTO customers (id, name, city, joined_on)\nVALUES (6, 'Priya Nair', 'Mumbai', '2025-05-12')\nON CONFLICT (id) DO UPDATE SET city = EXCLUDED.city\nRETURNING *;",
   "out": {
    "cols": [
     "id",
     "name",
     "city",
     "joined_on"
    ],
    "rows": [
     [
      "6",
      "Priya Nair",
      "Mumbai",
      "2025-05-12"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "UPDATE orders SET status = 'cancelled'; (no WHERE) does what?",
   [
    "Errors",
    "Changes nothing",
    "Cancels every order",
    "Cancels one order"
   ],
   2,
   "No WHERE means every row."
  ],
  [
   "What does ON CONFLICT (id) DO UPDATE give you?",
   [
    "Faster deletes",
    "Insert new rows and update existing ones in one statement",
    "A backup",
    "Duplicate rows"
   ],
   1,
   "That's an upsert: safe to run repeatedly."
  ],
  [
   "Best habit before a big UPDATE on real data?",
   [
    "Run it and hope",
    "Run a SELECT with the same WHERE, and use BEGIN … COMMIT",
    "Drop the table",
    "Use LIMIT"
   ],
   1,
   "Preview the rows, and keep a way to roll back."
  ]
 ],
 "remember": [
  "INSERT INTO t (cols) VALUES (…) RETURNING *.",
  "UPDATE t SET col = … WHERE …; DELETE FROM t WHERE …: never forget WHERE.",
  "SELECT with the same WHERE first. Use BEGIN; … COMMIT; / ROLLBACK; on real data.",
  "UPSERT: INSERT … ON CONFLICT (key) DO UPDATE SET col = EXCLUDED.col.",
  "Foreign keys stop you deleting a parent that still has children."
 ]
};
L["sql:design"] = {
 "title": "Tables, keys and good design",
 "level": "Intermediate",
 "one": "Good tables have a <b>primary key</b>, link to each other with <b>foreign keys</b>, use the right <b>data types</b>, and store each fact <b>once</b>.",
 "why": "Bad design causes wrong reports and endless clean-up. When you build integrations or new features, you'll design tables, and interviewers will ask you to.",
 "steps": [
  {
   "h": "Create a table with types and rules",
   "p": [
    "Each column has a <b>type</b>: <code>int</code>, <code>numeric(10,2)</code> for money (never float), <code>text</code>, <code>date</code>, <code>timestamptz</code> (date + time + timezone), <code>boolean</code>, <code>jsonb</code>.",
    "<b>Constraints</b> are rules the database enforces for you: <code>PRIMARY KEY</code> (unique id, not null), <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK</code>, <code>REFERENCES</code> (foreign key), <code>DEFAULT</code>."
   ],
   "sql": "CREATE TABLE reviews (\n  id          serial PRIMARY KEY,\n  product_id  int NOT NULL REFERENCES products(id),\n  customer_id int NOT NULL REFERENCES customers(id),\n  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),\n  comment     text,\n  created_at  timestamptz NOT NULL DEFAULT now(),\n  UNIQUE (product_id, customer_id)\n);\nINSERT INTO reviews (product_id, customer_id, rating) VALUES (1, 1, 5)\nRETURNING id, product_id, customer_id, rating;",
   "note": "<code>serial</code> makes the id count up by itself. The UNIQUE rule means one review per customer per product.",
   "out": {
    "cols": [
     "id",
     "product_id",
     "customer_id",
     "rating"
    ],
    "rows": [
     [
      "1",
      "1",
      "1",
      "5"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "The database refuses bad data",
   "p": [
    "That's the point of constraints: bad data never gets in, so you don't have to clean it later. A product with a negative price is rejected:"
   ],
   "sql": "INSERT INTO products (id, name, category, price) VALUES (9, 'Broken', 'Misc', -5);",
   "expectError": true,
   "out": {
    "error": "ERROR: new row for relation \"products\" violates check constraint \"products_price_check\""
   }
  },
  {
   "h": "Store each fact once (normalisation)",
   "p": [
    "Don't copy the customer's city into every order. If they move, you'd have to fix every row and you'd miss some. Store the city once in <code>customers</code> and join when you need it.",
    "Rule of thumb: <b>one table per thing</b> (customers, products, orders), and <b>one row per fact</b>. A many-to-many link (orders ↔ products) gets its own table, here <code>order_items</code>.",
    "Sometimes we copy on purpose: <code>order_items.price</code> stores the price <i>at the time of sale</i>, because the product price can change later. That's a deliberate snapshot, not a mistake."
   ]
  },
  {
   "h": "Change a table with ALTER TABLE",
   "p": [
    "Add a column, add a rule, rename. On a big live table some changes lock it, so they're planned carefully."
   ],
   "sql": "ALTER TABLE customers ADD COLUMN email text;\nALTER TABLE customers ADD CONSTRAINT customers_email_key UNIQUE (email);\nUPDATE customers SET email = 'asha@example.com' WHERE id = 1;\nSELECT id, name, email FROM customers WHERE id <= 2 ORDER BY id;",
   "out": {
    "cols": [
     "id",
     "name",
     "email"
    ],
    "rows": [
     [
      "1",
      "Asha Rao",
      "asha@example.com"
     ],
     [
      "2",
      "Ben Thomas",
      null
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "Money in <code>float</code>: 0.1 + 0.2 isn't exactly 0.3. Use <code>numeric</code>.",
  "No foreign keys “for speed”. Then orphan rows appear (orders for customers that don't exist).",
  "Storing lists in one column (<code>'1,4,7'</code>). You can't join or index that. Use a link table.",
  "Dates stored as text. Sorting and maths break. Use <code>date</code> or <code>timestamptz</code>."
 ],
 "practice": [
  {
   "q": "Design a <code>payments</code> table: each payment belongs to an order, has an amount (money, must be above 0), a method ('card', 'upi' or 'cash') and a paid time defaulting to now.",
   "sql": "CREATE TABLE payments (\n  id       serial PRIMARY KEY,\n  order_id int NOT NULL REFERENCES orders(id),\n  amount   numeric(10,2) NOT NULL CHECK (amount > 0),\n  method   text NOT NULL CHECK (method IN ('card','upi','cash')),\n  paid_at  timestamptz NOT NULL DEFAULT now()\n);\nINSERT INTO payments (order_id, amount, method) VALUES (1, 55000, 'upi')\nRETURNING id, order_id, amount, method;",
   "out": {
    "cols": [
     "id",
     "order_id",
     "amount",
     "method"
    ],
    "rows": [
     [
      "1",
      "1",
      "55000.00",
      "upi"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "A student can join many courses and a course has many students. How do you store that?",
   "a": "Three tables: <code>students</code>, <code>courses</code>, and a link table <code>enrolments(student_id, course_id, joined_on)</code> with a foreign key to each and <code>UNIQUE (student_id, course_id)</code>."
  }
 ],
 "check": [
  [
   "Best type for prices?",
   [
    "float",
    "text",
    "numeric(10,2)",
    "int"
   ],
   2,
   "numeric is exact. float has rounding errors."
  ],
  [
   "What does a foreign key do?",
   [
    "Makes queries faster",
    "Makes sure a value points to a real row in another table",
    "Encrypts the column",
    "Makes a column unique"
   ],
   1,
   "REFERENCES stops orphan rows."
  ],
  [
   "Orders and products are many-to-many. How do you store it?",
   [
    "A product_ids text column in orders",
    "A link table like order_items",
    "Copy all product columns into orders",
    "You can't"
   ],
   1,
   "Many-to-many needs a link table."
  ]
 ],
 "remember": [
  "Every table: PRIMARY KEY. Links: REFERENCES (foreign key).",
  "Rules in the database: NOT NULL, UNIQUE, CHECK, DEFAULT.",
  "Money = numeric, dates = date/timestamptz, never text or float.",
  "Store each fact once; join to combine. Many-to-many → link table.",
  "Snapshot on purpose (price at sale time) is fine."
 ]
};
L["sql:indexes"] = {
 "title": "Indexes and EXPLAIN: making queries fast",
 "level": "Advanced",
 "one": "An <b>index</b> is like the index at the back of a book: the database jumps to the right rows instead of reading the whole table.",
 "why": "A query that takes 0.01 seconds on 10 rows can take a minute on 10 million. Knowing how to read a plan and add the right index is what separates juniors from seniors.",
 "steps": [
  {
   "h": "A bigger table to see the difference",
   "p": [
    "Indexes don't matter on 10 rows, so for this lesson imagine a table with <b>200,000 orders</b>. (The setup for it is in the practice section.)",
    "<code>EXPLAIN</code> shows the <b>plan</b>: how the database will find the rows. Without an index it reads every row: a <b>Seq Scan</b> (sequential scan)."
   ],
   "sql": "EXPLAIN (COSTS OFF)\nSELECT * FROM big_orders WHERE customer_id = 42;",
   "out": {
    "cols": [
     "QUERY PLAN"
    ],
    "rows": [
     [
      "Seq Scan on big_orders"
     ],
     [
      "  Filter: (customer_id = 42)"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Add an index, and the plan changes",
   "p": [
    "Now the database uses the index to jump straight to customer 42's rows."
   ],
   "sql": "CREATE INDEX big_orders_customer_idx ON big_orders (customer_id);\nANALYZE big_orders;\nEXPLAIN (COSTS OFF)\nSELECT * FROM big_orders WHERE customer_id = 42;",
   "note": "<b>Bitmap Index Scan</b> and <b>Index Scan</b> both mean the index is used. Run <code>EXPLAIN ANALYZE</code> to see real times. On our test machine this query took about 12 ms without the index and about 0.1 ms with it: over 100 times faster.",
   "out": {
    "cols": [
     "QUERY PLAN"
    ],
    "rows": [
     [
      "Bitmap Heap Scan on big_orders"
     ],
     [
      "  Recheck Cond: (customer_id = 42)"
     ],
     [
      "  ->  Bitmap Index Scan on big_orders_customer_idx"
     ],
     [
      "        Index Cond: (customer_id = 42)"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Which columns to index",
   "p": [
    "Index columns you often <b>filter</b> (WHERE), <b>join</b> on (foreign keys like customer_id), or <b>sort</b> by. Primary keys and UNIQUE columns get an index automatically.",
    "A <b>composite index</b> covers several columns. Order matters: an index on <code>(customer_id, order_date)</code> helps <code>WHERE customer_id = 42</code> and <code>WHERE customer_id = 42 AND order_date &gt; …</code>, but not <code>WHERE order_date &gt; …</code> alone."
   ],
   "sql": "CREATE INDEX big_orders_cust_date_idx ON big_orders (customer_id, order_date);\nANALYZE big_orders;\nEXPLAIN (COSTS OFF)\nSELECT * FROM big_orders\nWHERE customer_id = 42 AND order_date >= '2025-01-01';",
   "out": {
    "cols": [
     "QUERY PLAN"
    ],
    "rows": [
     [
      "Bitmap Heap Scan on big_orders"
     ],
     [
      "  Recheck Cond: ((customer_id = 42) AND (order_date >= '2025-01-01'::date))"
     ],
     [
      "  ->  Bitmap Index Scan on big_orders_cust_date_idx"
     ],
     [
      "        Index Cond: ((customer_id = 42) AND (order_date >= '2025-01-01'::date))"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "When an index can't help",
   "p": [
    "Wrapping the column in a function hides it from a normal index. <code>WHERE EXTRACT(year FROM order_date) = 2025</code> reads every row. Write it as a range instead: <code>order_date &gt;= '2025-01-01' AND order_date &lt; '2026-01-01'</code>.",
    "<code>LIKE '%tea'</code> (wildcard at the start) can't use a normal index either.",
    "Indexes aren't free: each one takes disk space and slows every INSERT and UPDATE, because the index must be updated too. Add them for real slow queries, not “just in case”."
   ],
   "sql": "EXPLAIN (COSTS OFF)\nSELECT count(*) FROM big_orders WHERE EXTRACT(year FROM order_date) = 2025;",
   "out": {
    "cols": [
     "QUERY PLAN"
    ],
    "rows": [
     [
      "Finalize Aggregate"
     ],
     [
      "  ->  Gather"
     ],
     [
      "        Workers Planned: 1"
     ],
     [
      "        ->  Partial Aggregate"
     ],
     [
      "              ->  Parallel Seq Scan on big_orders"
     ],
     [
      "                    Filter: (EXTRACT(year FROM order_date) = '2025'::numeric)"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "Adding an index on every column. Writes get slow and most indexes are never used.",
  "Functions on the indexed column in WHERE (<code>LOWER(email) = …</code>, <code>EXTRACT(year …)</code>). Rewrite as a range, or create an index on the expression.",
  "Forgetting to index foreign key columns used in joins (PostgreSQL doesn't do it automatically).",
  "Guessing. Always run <code>EXPLAIN ANALYZE</code> before and after."
 ],
 "practice": [
  {
   "q": "Create the 200,000-row table yourself and time a query with and without an index.",
   "sql": "CREATE TABLE big_orders AS\n  SELECT g AS id, (g % 5000) + 1 AS customer_id,\n         DATE '2024-01-01' + (g % 600) AS order_date,\n         (g % 997) * 10 AS total\n  FROM generate_series(1, 200000) AS g;\nANALYZE big_orders;\n-- Now compare:\n-- EXPLAIN ANALYZE SELECT * FROM big_orders WHERE customer_id = 42;\n-- CREATE INDEX ON big_orders (customer_id);\n-- EXPLAIN ANALYZE SELECT * FROM big_orders WHERE customer_id = 42;",
   "run": false
  },
  {
   "q": "This is slow: <code>WHERE EXTRACT(month FROM order_date) = 7 AND EXTRACT(year FROM order_date) = 2025</code>. Rewrite it so an index on order_date can be used.",
   "a": "<code>WHERE order_date &gt;= '2025-07-01' AND order_date &lt; '2025-08-01'</code>"
  },
  {
   "q": "You have an index on <code>(customer_id, order_date)</code>. Will it help <code>WHERE order_date = '2025-07-01'</code>?",
   "a": "Mostly no. A composite index is used from the left. It helps queries that filter on customer_id (and optionally order_date), not order_date alone."
  }
 ],
 "check": [
  [
   "What does Seq Scan in a plan mean?",
   [
    "The index was used",
    "The whole table was read row by row",
    "The query failed",
    "Rows were sorted"
   ],
   1,
   "Seq Scan = read every row."
  ],
  [
   "Downside of indexes?",
   [
    "They make SELECT slower",
    "They use space and slow down INSERT/UPDATE",
    "They delete data",
    "None"
   ],
   1,
   "Every write must also update each index."
  ],
  [
   "Which WHERE can use a normal index on order_date?",
   [
    "EXTRACT(year FROM order_date) = 2025",
    "order_date >= '2025-01-01' AND order_date < '2026-01-01'",
    "order_date::text LIKE '2025%'",
    "None"
   ],
   1,
   "Keep the column bare and use a range."
  ]
 ],
 "remember": [
  "Index = jump to rows instead of reading all. Seq Scan = reads all.",
  "Index columns you filter, join (foreign keys) and sort on.",
  "Composite index works left to right: (a, b) helps a, and a+b, not b alone.",
  "Functions on the column hide the index. Use ranges for dates.",
  "Indexes cost space and slow writes. Check with EXPLAIN ANALYZE."
 ]
};
L["sql:transactions"] = {
 "title": "Transactions and locking",
 "level": "Advanced",
 "one": "A <b>transaction</b> is a group of changes that all succeed or all fail together. <b>Locks</b> stop two people changing the same thing at the same time.",
 "why": "Payments, stock and integrations must never be half-done. Interviewers ask about ACID and race conditions, and real bugs come from getting this wrong.",
 "steps": [
  {
   "h": "All or nothing",
   "p": [
    "Moving 1 unit of stock from warehouse A to B is two updates. If the second fails after the first succeeds, a unit disappears. Wrap them in a transaction:",
    "<code>BEGIN</code> starts it, <code>COMMIT</code> saves everything, <code>ROLLBACK</code> undoes everything since BEGIN. If any statement errors, PostgreSQL refuses further statements until you ROLLBACK."
   ],
   "sql": "BEGIN;\nUPDATE stock SET qty = qty - 1 WHERE warehouse = 'A' AND product_id = 7;\nUPDATE stock SET qty = qty + 1 WHERE warehouse = 'B' AND product_id = 7;\nCOMMIT;   -- or ROLLBACK; to undo both",
   "run": false
  },
  {
   "h": "ACID in plain words",
   "p": [
    "<b>Atomic</b>: all or nothing. <b>Consistent</b>: rules (constraints) are never broken. <b>Isolated</b>: transactions running at the same time don't see each other's half-finished work. <b>Durable</b>: once committed, it survives a crash."
   ]
  },
  {
   "h": "The race condition: two buyers, one item",
   "p": [
    "Stock is 1. Two people click Buy at the same moment. Both read <code>qty = 1</code>, both think “in stock”, both sell. Now you've sold 2 of 1.",
    "<b>Fix 1, one statement that checks and changes:</b> the database does both steps at once, so only one buyer can win. Stock for product 7 is 1. The first buyer runs:"
   ],
   "sql": "UPDATE stock SET qty = qty - 1\nWHERE product_id = 7 AND qty > 0\nRETURNING product_id, qty;",
   "note": "One row came back, so the sale worked and stock is now 0. When the second buyer runs the same statement, <code>qty &gt; 0</code> is false, it returns <b>no rows</b>, and the app shows “sold out”.",
   "out": {
    "cols": [
     "product_id",
     "qty"
    ],
    "rows": [
     [
      "7",
      "0"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Fix 2: lock the row with FOR UPDATE",
   "p": [
    "<code>SELECT … FOR UPDATE</code> locks the rows you read. A second transaction that wants the same row waits until the first one finishes."
   ],
   "sql": "BEGIN;\nSELECT qty FROM stock WHERE product_id = 7 FOR UPDATE;  -- others wait here\n-- your code checks qty > 0\nUPDATE stock SET qty = qty - 1 WHERE product_id = 7;\nCOMMIT;                                                  -- lock released",
   "run": false
  },
  {
   "h": "Isolation levels and deadlocks",
   "p": [
    "PostgreSQL's default is <b>Read Committed</b>: each statement sees data committed before it started. Stricter modes like <b>Repeatable Read</b> stop a transaction when someone else changed the same data first. You get a 'could not serialize access' error, and the app should simply try again.",
    "A <b>deadlock</b> is when transaction 1 holds row A and waits for B, while transaction 2 holds B and waits for A. PostgreSQL cancels one of them. Avoid it by always locking rows in the same order (for example, by id), and keep transactions short."
   ]
  }
 ],
 "mistakes": [
  "Read, then decide in app code, then write, without a lock. That's the race condition.",
  "Long transactions (waiting for an API call or a user while holding locks). Everyone else waits.",
  "Forgetting to COMMIT. Your changes are invisible to others and are lost when you disconnect.",
  "Not retrying when the database reports a serialization failure or a deadlock."
 ],
 "practice": [
  {
   "q": "Write the safe one-statement way to take 1 unit from stock for product 7, only if there's stock.",
   "a": "<code>UPDATE stock SET qty = qty - 1 WHERE product_id = 7 AND qty &gt; 0 RETURNING qty;</code> If no row comes back, it's sold out."
  },
  {
   "q": "Explain ACID in one line each.",
   "a": "Atomic: all or nothing. Consistent: rules always hold. Isolated: parallel transactions don't see each other's unfinished work. Durable: committed data survives crashes."
  },
  {
   "q": "Two jobs update the same two accounts in opposite order and sometimes deadlock. How do you fix it?",
   "a": "Make both jobs lock and update rows in the same order (for example, lowest id first), keep the transactions short, and retry if a deadlock still happens."
  }
 ],
 "check": [
  [
   "What does ROLLBACK do?",
   [
    "Saves changes",
    "Undoes all changes since BEGIN",
    "Deletes the table",
    "Restarts the server"
   ],
   1,
   "ROLLBACK cancels the whole transaction."
  ],
  [
   "Two users buy the last item at once. Safest fix?",
   [
    "Check stock in app code first",
    "UPDATE … SET qty = qty - 1 WHERE … AND qty > 0",
    "Add an index",
    "Use UNION"
   ],
   1,
   "Check and change in one statement (or lock with FOR UPDATE)."
  ],
  [
   "The 'A' in ACID stands for…",
   [
    "Available",
    "Atomic",
    "Accurate",
    "Async"
   ],
   1,
   "Atomic: all or nothing."
  ]
 ],
 "remember": [
  "BEGIN … COMMIT saves all; ROLLBACK undoes all.",
  "ACID: Atomic, Consistent, Isolated, Durable.",
  "Race condition fix: check-and-change in one UPDATE, or SELECT … FOR UPDATE.",
  "Default isolation: Read Committed. Stricter modes can fail: retry.",
  "Deadlocks: lock in the same order, keep transactions short."
 ]
};
L["sql:advanced"] = {
 "title": "Advanced tools: JSON, filling gaps, trees, views, paging",
 "level": "Advanced",
 "one": "PostgreSQL can store and query <b>JSON</b>, generate missing dates, walk <b>trees</b> with recursive queries, save queries as <b>views</b>, and page through big results.",
 "why": "APIs send JSON, reports need every day even with no sales, org charts are trees, and apps show results page by page. These come up constantly in integration and data work.",
 "steps": [
  {
   "h": "JSON: storing API data",
   "p": [
    "The <code>jsonb</code> type stores JSON. <code>-&gt;</code> gets a value as JSON, <code>-&gt;&gt;</code> gets it as text. Cast the text to use it as a number."
   ],
   "sql": "WITH events AS (\n  SELECT '{\"order_id\": 6, \"source\": \"app\", \"items\": [{\"sku\": \"LAP\", \"qty\": 1}]}'::jsonb AS payload\n)\nSELECT payload->>'source'               AS source,\n       (payload->>'order_id')::int      AS order_id,\n       payload->'items'->0->>'sku'      AS first_sku,\n       jsonb_array_length(payload->'items') AS item_count\nFROM events;",
   "out": {
    "cols": [
     "source",
     "order_id",
     "first_sku",
     "item_count"
    ],
    "rows": [
     [
      "app",
      "6",
      "LAP",
      "1"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Turning rows into JSON",
   "p": [
    "Handy when an API wants JSON. <code>jsonb_build_object</code> makes an object; <code>jsonb_agg</code> collects rows into an array."
   ],
   "sql": "SELECT jsonb_build_object(\n         'order_id', o.id,\n         'items', jsonb_agg(jsonb_build_object('product', p.name, 'qty', i.qty))\n       ) AS order_json\nFROM orders o\nJOIN order_items i ON i.order_id = o.id\nJOIN products p    ON p.id = i.product_id\nWHERE o.id = 2\nGROUP BY o.id;",
   "out": {
    "cols": [
     "order_json"
    ],
    "rows": [
     [
      "{\"items\": [{\"qty\": 2, \"product\": \"Headphones\"}, {\"qty\": 1, \"product\": \"Coffee Beans 1kg\"}], \"order_id\": 2}"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Filling gaps with generate_series",
   "p": [
    "A sales report by day skips days with no sales. Generate every day, then LEFT JOIN the sales so empty days show 0."
   ],
   "sql": "SELECT d::date AS day, COALESCE(SUM(o.total), 0) AS revenue\nFROM generate_series(DATE '2025-07-01', DATE '2025-07-07', INTERVAL '1 day') AS d\nLEFT JOIN orders o ON o.order_date = d::date AND o.status = 'completed'\nGROUP BY d\nORDER BY d;",
   "out": {
    "cols": [
     "day",
     "revenue"
    ],
    "rows": [
     [
      "2025-07-01",
      "0"
     ],
     [
      "2025-07-02",
      "0"
     ],
     [
      "2025-07-03",
      "0"
     ],
     [
      "2025-07-04",
      "0"
     ],
     [
      "2025-07-05",
      "3600.00"
     ],
     [
      "2025-07-06",
      "0"
     ],
     [
      "2025-07-07",
      "0"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Trees with a recursive CTE",
   "p": [
    "<code>WITH RECURSIVE</code> starts with some rows, then keeps adding the rows linked to them until there are none left. The whole org chart under Meera, with each person's level:"
   ],
   "sql": "WITH RECURSIVE chain AS (\n  SELECT id, name, manager_id, 1 AS level, name::text AS path\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, c.level + 1, c.path || ' > ' || e.name\n  FROM employees e\n  JOIN chain c ON e.manager_id = c.id\n)\nSELECT level, name, path FROM chain ORDER BY path;",
   "out": {
    "cols": [
     "level",
     "name",
     "path"
    ],
    "rows": [
     [
      "1",
      "Meera",
      "Meera"
     ],
     [
      "2",
      "Arjun",
      "Meera > Arjun"
     ],
     [
      "3",
      "Kiran",
      "Meera > Arjun > Kiran"
     ],
     [
      "3",
      "Leo",
      "Meera > Arjun > Leo"
     ],
     [
      "2",
      "Sara",
      "Meera > Sara"
     ],
     [
      "3",
      "Nisha",
      "Meera > Sara > Nisha"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Views: save a query with a name",
   "p": [
    "A <b>view</b> is a saved SELECT that you can query like a table. Great for reports other people reuse."
   ],
   "sql": "CREATE VIEW completed_sales AS\nSELECT o.id, c.name AS customer, o.order_date, o.total\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'completed';\n\nSELECT customer, SUM(total) AS spent\nFROM completed_sales\nGROUP BY customer\nORDER BY spent DESC\nLIMIT 3;",
   "out": {
    "cols": [
     "customer",
     "spent"
    ],
    "rows": [
     [
      "Asha Rao",
      "64500.00"
     ],
     [
      "Chen Li",
      "16000.00"
     ],
     [
      "Ben Thomas",
      "12800.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Paging through results",
   "p": [
    "<code>LIMIT 3 OFFSET 3</code> gives page 2 of 3 rows. It's simple, but on deep pages the database still reads and throws away all the earlier rows.",
    "<b>Keyset paging</b> is faster: remember the last id you showed and ask for rows after it."
   ],
   "sql": "-- page after the row with id 3\nSELECT id, order_date, total\nFROM orders\nWHERE id > 3\nORDER BY id\nLIMIT 3;",
   "out": {
    "cols": [
     "id",
     "order_date",
     "total"
    ],
    "rows": [
     [
      "4",
      "2025-07-01",
      "3000.00"
     ],
     [
      "5",
      "2025-07-05",
      "3600.00"
     ],
     [
      "6",
      "2025-07-18",
      "58000.00"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "Putting everything in jsonb because it's easy. Columns you filter or join on belong in normal columns.",
  "Forgetting <code>-&gt;&gt;</code> returns text: <code>payload-&gt;&gt;'qty' &gt; 5</code> compares text. Cast: <code>(payload-&gt;&gt;'qty')::int</code>.",
  "A recursive CTE with no stopping point (a loop in the data) runs forever. Add a level limit if loops are possible.",
  "Deep OFFSET paging on big tables. Use keyset paging."
 ],
 "practice": [
  {
   "q": "Show monthly completed revenue for June to September 2025, with 0 for months with no sales.",
   "sql": "SELECT m::date AS month, COALESCE(SUM(o.total), 0) AS revenue\nFROM generate_series(DATE '2025-06-01', DATE '2025-09-01', INTERVAL '1 month') AS m\nLEFT JOIN orders o ON date_trunc('month', o.order_date) = m AND o.status = 'completed'\nGROUP BY m\nORDER BY m;",
   "out": {
    "cols": [
     "month",
     "revenue"
    ],
    "rows": [
     [
      "2025-06-01",
      "71100.00"
     ],
     [
      "2025-07-01",
      "5600.00"
     ],
     [
      "2025-08-01",
      "22500.00"
     ],
     [
      "2025-09-01",
      "0"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Find everyone who reports to Arjun, directly or indirectly.",
   "sql": "WITH RECURSIVE team AS (\n  SELECT id, name FROM employees WHERE manager_id = 2\n  UNION ALL\n  SELECT e.id, e.name FROM employees e JOIN team t ON e.manager_id = t.id\n)\nSELECT name FROM team ORDER BY name;",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Kiran"
     ],
     [
      "Leo"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Return each customer as JSON: {\"name\": …, \"orders\": count}.",
   "sql": "SELECT jsonb_build_object('name', c.name, 'orders', COUNT(o.id)) AS customer_json\nFROM customers c LEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY c.id;",
   "out": {
    "cols": [
     "customer_json"
    ],
    "rows": [
     [
      "{\"name\": \"Asha Rao\", \"orders\": 3}"
     ],
     [
      "{\"name\": \"Ben Thomas\", \"orders\": 2}"
     ],
     [
      "{\"name\": \"Chen Li\", \"orders\": 2}"
     ],
     [
      "{\"name\": \"Divya Menon\", \"orders\": 2}"
     ],
     [
      "{\"name\": \"Omar Khan\", \"orders\": 1}"
     ],
     [
      "{\"name\": \"Priya Nair\", \"orders\": 0}"
     ]
    ],
    "more": 0
   }
  }
 ],
 "check": [
  [
   "payload->>'source' returns…",
   [
    "JSON",
    "Text",
    "A number",
    "An array"
   ],
   1,
   "->> gives text; -> gives JSON."
  ],
  [
   "How do you show days with no sales as 0?",
   [
    "Use INNER JOIN",
    "generate_series of days LEFT JOIN sales, COALESCE(SUM, 0)",
    "Use DISTINCT",
    "It's impossible"
   ],
   1,
   "Generate all days first, then LEFT JOIN."
  ],
  [
   "What is a view?",
   [
    "A copy of a table",
    "A saved SELECT you can query like a table",
    "An index",
    "A backup"
   ],
   1,
   "A view stores the query, not the data."
  ]
 ],
 "remember": [
  "jsonb: -> gives JSON, ->> gives text; cast to use numbers.",
  "jsonb_build_object / jsonb_agg build JSON from rows.",
  "Missing days: generate_series + LEFT JOIN + COALESCE.",
  "Trees: WITH RECURSIVE (start rows UNION ALL linked rows).",
  "View = saved query. Keyset paging (WHERE id > last) beats deep OFFSET."
 ]
};
L["sql:practice"] = {
 "title": "Interview practice: real business questions",
 "level": "Interview",
 "one": "These are the SQL questions interviewers ask most. Try each one yourself first, then open the answer.",
 "why": "Interviews test patterns, not memory. If you can solve these on the practice shop, you can solve the same patterns on any database.",
 "steps": [
  {
   "h": "Q1. Second highest price",
   "p": [
    "Classic. Use DENSE_RANK so ties don't break it (or ORDER BY … OFFSET 1 LIMIT 1 when ties don't matter)."
   ],
   "sql": "SELECT name, price\nFROM (\n  SELECT name, price, DENSE_RANK() OVER (ORDER BY price DESC) AS r\n  FROM products\n) t\nWHERE r = 2;",
   "out": {
    "cols": [
     "name",
     "price"
    ],
    "rows": [
     [
      "Desk Chair",
      "8000.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Q2. Find duplicates",
   "p": [
    "Group by the column(s) that should be unique and keep groups with more than one row. Imagine an imported <code>contacts</code> table where some people were added twice:"
   ],
   "sql": "SELECT name, city, COUNT(*) AS copies, MIN(id) AS keep_id\nFROM contacts\nGROUP BY name, city\nHAVING COUNT(*) > 1\nORDER BY name;",
   "out": {
    "cols": [
     "name",
     "city",
     "copies",
     "keep_id"
    ],
    "rows": [
     [
      "Asha Rao",
      "Kochi",
      "2",
      "1"
     ],
     [
      "Ben Thomas",
      "Bengaluru",
      "2",
      "2"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Q3. Delete duplicates, keep one",
   "p": [
    "Number the copies with ROW_NUMBER and delete everything after the first. Same messy <code>contacts</code> table: keep the lowest id of each person."
   ],
   "sql": "DELETE FROM contacts\nWHERE id IN (\n  SELECT id FROM (\n    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, city ORDER BY id) AS rn\n    FROM contacts\n  ) t\n  WHERE rn > 1\n)\nRETURNING id, name;",
   "out": {
    "cols": [
     "id",
     "name"
    ],
    "rows": [
     [
      "11",
      "Asha Rao"
     ],
     [
      "12",
      "Ben Thomas"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Q4. Top customer per city",
   "p": [
    "Top-N per group: ROW_NUMBER inside a CTE."
   ],
   "sql": "WITH spend AS (\n  SELECT c.city, c.name, SUM(o.total) AS spent,\n         ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY SUM(o.total) DESC) AS rn\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'\n  GROUP BY c.city, c.name\n)\nSELECT city, name, spent FROM spend WHERE rn = 1 ORDER BY spent DESC;",
   "out": {
    "cols": [
     "city",
     "name",
     "spent"
    ],
    "rows": [
     [
      "Kochi",
      "Asha Rao",
      "64500.00"
     ],
     [
      "Dubai",
      "Chen Li",
      "16000.00"
     ],
     [
      "Bengaluru",
      "Ben Thomas",
      "12800.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Q5. Month-over-month growth %",
   "p": [
    "Monthly totals in a CTE, then LAG for last month. <code>NULLIF(x, 0)</code> avoids dividing by zero."
   ],
   "sql": "WITH m AS (\n  SELECT date_trunc('month', order_date)::date AS month, SUM(total) AS revenue\n  FROM orders WHERE status = 'completed' GROUP BY 1\n)\nSELECT month, revenue,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS growth_pct\nFROM m ORDER BY month;",
   "out": {
    "cols": [
     "month",
     "revenue",
     "growth_pct"
    ],
    "rows": [
     [
      "2025-06-01",
      "71100.00",
      null
     ],
     [
      "2025-07-01",
      "5600.00",
      "-92.1"
     ],
     [
      "2025-08-01",
      "22500.00",
      "301.8"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Q6. First order and repeat customers",
   "p": [
    "When did each customer first order, and did they come back?"
   ],
   "sql": "SELECT c.name,\n       MIN(o.order_date) AS first_order,\n       COUNT(o.id)       AS orders,\n       CASE WHEN COUNT(o.id) > 1 THEN 'repeat' ELSE 'one-time' END AS type\nFROM customers c\nJOIN orders o ON o.customer_id = c.id AND o.status = 'completed'\nGROUP BY c.name\nORDER BY first_order;",
   "out": {
    "cols": [
     "name",
     "first_order",
     "orders",
     "type"
    ],
    "rows": [
     [
      "Asha Rao",
      "2025-06-02",
      "3",
      "repeat"
     ],
     [
      "Ben Thomas",
      "2025-06-20",
      "2",
      "repeat"
     ],
     [
      "Omar Khan",
      "2025-07-22",
      "1",
      "one-time"
     ],
     [
      "Chen Li",
      "2025-08-10",
      "1",
      "one-time"
     ],
     [
      "Divya Menon",
      "2025-08-25",
      "1",
      "one-time"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Q7. Customers who bought both Electronics and Grocery",
   "p": [
    "Group per customer and count the different categories they bought, keeping only the two we care about."
   ],
   "sql": "SELECT c.name\nFROM customers c\nJOIN orders o      ON o.customer_id = c.id AND o.status = 'completed'\nJOIN order_items i ON i.order_id = o.id\nJOIN products p    ON p.id = i.product_id\nWHERE p.category IN ('Electronics', 'Grocery')\nGROUP BY c.name\nHAVING COUNT(DISTINCT p.category) = 2\nORDER BY c.name;",
   "out": {
    "cols": [
     "name"
    ],
    "rows": [
     [
      "Asha Rao"
     ],
     [
      "Divya Menon"
     ]
    ],
    "more": 0
   }
  },
  {
   "h": "Q8. Each product's share of revenue",
   "p": [
    "A window SUM with an empty <code>OVER ()</code> gives the grand total on every row."
   ],
   "sql": "SELECT p.name, SUM(i.qty * i.price) AS revenue,\n       ROUND(100.0 * SUM(i.qty * i.price) / SUM(SUM(i.qty * i.price)) OVER (), 1) AS pct\nFROM order_items i\nJOIN products p ON p.id = i.product_id\nJOIN orders o   ON o.id = i.order_id AND o.status = 'completed'\nGROUP BY p.name\nORDER BY revenue DESC;",
   "out": {
    "cols": [
     "name",
     "revenue",
     "pct"
    ],
    "rows": [
     [
      "Laptop",
      "55000.00",
      "55.4"
     ],
     [
      "Desk Chair",
      "24000.00",
      "24.2"
     ],
     [
      "Headphones",
      "9000.00",
      "9.1"
     ],
     [
      "Coffee Beans 1kg",
      "7200.00",
      "7.3"
     ],
     [
      "Green Tea",
      "4000.00",
      "4.0"
     ]
    ],
    "more": 0
   }
  }
 ],
 "mistakes": [
  "Jumping into writing. First say out loud: which tables, which rows count (status?), what one row of the answer means.",
  "Forgetting edge cases: NULLs, ties, customers with zero orders, cancelled orders.",
  "Not checking your result. Pick one customer and verify their number by hand."
 ],
 "practice": [
  {
   "q": "Which day of the week has the most completed revenue?",
   "sql": "SELECT to_char(order_date, 'FMDay') AS weekday, SUM(total) AS revenue\nFROM orders WHERE status = 'completed'\nGROUP BY weekday ORDER BY revenue DESC LIMIT 1;",
   "out": {
    "cols": [
     "weekday",
     "revenue"
    ],
    "rows": [
     [
      "Monday",
      "58900.00"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Average number of items per completed order.",
   "sql": "SELECT ROUND(AVG(items), 2) AS avg_items\nFROM (\n  SELECT o.id, SUM(i.qty) AS items\n  FROM orders o JOIN order_items i ON i.order_id = o.id\n  WHERE o.status = 'completed'\n  GROUP BY o.id\n) t;",
   "out": {
    "cols": [
     "avg_items"
    ],
    "rows": [
     [
      "3.13"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "Customers whose latest order is more than 30 days before 2025-09-01 (at risk of leaving).",
   "sql": "SELECT c.name, MAX(o.order_date) AS last_order\nFROM customers c JOIN orders o ON o.customer_id = c.id\nGROUP BY c.name\nHAVING MAX(o.order_date) < DATE '2025-09-01' - 30\nORDER BY last_order;",
   "out": {
    "cols": [
     "name",
     "last_order"
    ],
    "rows": [
     [
      "Ben Thomas",
      "2025-07-05"
     ],
     [
      "Omar Khan",
      "2025-07-22"
     ]
    ],
    "more": 0
   }
  },
  {
   "q": "In words: what's the difference between WHERE and HAVING, and between UNION and UNION ALL?",
   "a": "WHERE filters rows before grouping; HAVING filters groups after. UNION removes duplicates; UNION ALL keeps every row and is faster."
  }
 ],
 "check": [
  [
   "Second highest price, safe with ties?",
   [
    "MAX(price) - 1",
    "DENSE_RANK() OVER (ORDER BY price DESC) = 2",
    "ORDER BY price LIMIT 2",
    "MIN(price)"
   ],
   1,
   "DENSE_RANK handles ties correctly."
  ],
  [
   "To keep one copy of duplicate rows you…",
   [
    "DELETE everything",
    "Number copies with ROW_NUMBER() OVER (PARTITION BY …) and delete rn > 1",
    "Use UNION",
    "Use LIMIT 1"
   ],
   1,
   "Partition by the columns that define a duplicate."
  ],
  [
   "Dividing by a value that might be 0 safely:",
   [
    "x / y",
    "x / NULLIF(y, 0)",
    "x / COALESCE(y, 0)",
    "x / (y + 0)"
   ],
   1,
   "NULLIF turns 0 into NULL, so the result is NULL instead of an error."
  ]
 ],
 "remember": [
  "Nth highest: DENSE_RANK() OVER (ORDER BY x DESC) = N.",
  "Duplicates: GROUP BY key HAVING COUNT(*) > 1. Delete: ROW_NUMBER() … rn > 1.",
  "Top per group: ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC) = 1.",
  "Growth: LAG in a window; divide with NULLIF(x, 0).",
  "Share of total: x / SUM(x) OVER ().",
  "Before writing: which tables, which rows count, what one result row means."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
