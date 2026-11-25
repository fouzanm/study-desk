# SQL course builder

`lessons/sql.js` is generated from these files, so every result table in the course is real PostgreSQL output.

- `setup.sql`: the practice shop database (also shown in lesson 1).
- `src1.js`–`src3.js`: lesson text and SQL examples.
- `build.js`: runs every example on PostgreSQL (each inside a transaction that is rolled back) and writes the results into `lessons/sql.js`.

To rebuild after editing a lesson:

```bash
cd tools/sql-course
npm install pg
# needs a PostgreSQL database named "learn" that user "claude" (password "x") can use;
# change the connection in build.js to match yours
node build.js src.js ../../lessons/sql.js
```

The build stops if any example fails, so broken SQL never reaches the site.
