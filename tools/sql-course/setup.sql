-- Study Desk SQL practice database: a small online shop.
-- Run it once in PostgreSQL. Running it again resets everything.
DROP TABLE IF EXISTS order_items, orders, products, customers, employees CASCADE;

CREATE TABLE customers (
  id        int PRIMARY KEY,
  name      text NOT NULL,
  city      text,
  joined_on date NOT NULL
);

CREATE TABLE products (
  id       int PRIMARY KEY,
  name     text NOT NULL,
  category text NOT NULL,
  price    numeric(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id),
  order_date  date NOT NULL,
  status      text NOT NULL CHECK (status IN ('completed','pending','cancelled')),
  total       numeric(10,2) NOT NULL
);

CREATE TABLE order_items (
  id         int PRIMARY KEY,
  order_id   int NOT NULL REFERENCES orders(id),
  product_id int NOT NULL REFERENCES products(id),
  qty        int NOT NULL CHECK (qty > 0),
  price      numeric(10,2) NOT NULL
);

CREATE TABLE employees (
  id         int PRIMARY KEY,
  name       text NOT NULL,
  manager_id int REFERENCES employees(id)
);

INSERT INTO customers VALUES
  (1, 'Asha Rao',    'Kochi',     '2025-01-10'),
  (2, 'Ben Thomas',  'Bengaluru', '2025-02-03'),
  (3, 'Chen Li',     'Dubai',     '2025-02-20'),
  (4, 'Divya Menon', 'Kochi',     '2025-03-15'),
  (5, 'Omar Khan',   'Dubai',     '2025-04-01'),
  (6, 'Priya Nair',  NULL,        '2025-05-12');

INSERT INTO products VALUES
  (1, 'Laptop',           'Electronics', 55000),
  (2, 'Headphones',       'Electronics',  3000),
  (3, 'Coffee Beans 1kg', 'Grocery',       900),
  (4, 'Green Tea',        'Grocery',       400),
  (5, 'Desk Chair',       'Furniture',    8000),
  (6, 'Notebook',         'Stationery',    120);

INSERT INTO orders VALUES
  (1,  1, '2025-06-02', 'completed', 55000),
  (2,  1, '2025-06-15', 'completed',  6900),
  (3,  2, '2025-06-20', 'completed',  9200),
  (4,  3, '2025-07-01', 'cancelled',  3000),
  (5,  2, '2025-07-05', 'completed',  3600),
  (6,  4, '2025-07-18', 'pending',   58000),
  (7,  5, '2025-07-22', 'completed',  2000),
  (8,  1, '2025-08-03', 'completed',  2600),
  (9,  3, '2025-08-10', 'completed', 16000),
  (10, 4, '2025-08-25', 'completed',  3900);

INSERT INTO order_items VALUES
  (1,  1,  1, 1, 55000),
  (2,  2,  2, 2,  3000),
  (3,  2,  3, 1,   900),
  (4,  3,  5, 1,  8000),
  (5,  3,  4, 3,   400),
  (6,  4,  2, 1,  3000),
  (7,  5,  3, 4,   900),
  (8,  6,  1, 1, 55000),
  (9,  6,  2, 1,  3000),
  (10, 7,  4, 5,   400),
  (11, 8,  3, 2,   900),
  (12, 8,  4, 2,   400),
  (13, 9,  5, 2,  8000),
  (14, 10, 2, 1,  3000),
  (15, 10, 3, 1,   900);

INSERT INTO employees VALUES
  (1, 'Meera', NULL),
  (2, 'Arjun', 1),
  (3, 'Sara',  1),
  (4, 'Kiran', 2),
  (5, 'Leo',   2),
  (6, 'Nisha', 3);
