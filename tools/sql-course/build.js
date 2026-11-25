// Builds lessons/sql.js: runs every SQL example against PostgreSQL and stores the real result.
// Usage: node build.js <src.js> <out.js>
const fs = require("fs");
const pg = require("pg");
for (const oid of [1082, 1114, 1184, 1186, 114, 3802, 1700, 20]) pg.types.setTypeParser(oid, v => v);

const [src, out] = process.argv.slice(2);
const lessons = require(require("path").resolve(src));
const setup = fs.readFileSync(__dirname + "/setup.sql", "utf8");

const MAXROWS = 15;
function toOut(res) {
  const list = Array.isArray(res) ? res : [res];
  const withRows = list.filter(r => r.fields && r.fields.length);
  const last = withRows.length ? withRows[withRows.length - 1] : list[list.length - 1];
  if (last.fields && last.fields.length) {
    const cols = last.fields.map(f => f.name);
    const rows = last.rows.map(r => cols.map((c, i) => {
      const v = r[c] === undefined ? Object.values(r)[i] : r[c];
      return v === null ? null : typeof v === "object" ? JSON.stringify(v) : String(v);
    }));
    return { cols, rows: rows.slice(0, MAXROWS), more: Math.max(0, rows.length - MAXROWS) };
  }
  return { msg: list.map(r => r.command + (r.rowCount != null && /INSERT|UPDATE|DELETE|SELECT/.test(r.command) ? " " + r.rowCount : "")).join("\n") };
}

(async () => {
  const c = new pg.Client({ host: "localhost", user: "claude", password: "x", database: "learn" });
  await c.connect();
  await c.query(setup);
  let n = 0, errors = 0;
  async function run(item, where) {
    if (!item.sql || item.run === false) return;
    n++;
    await c.query("BEGIN");
    try {
      if (item.pre) await c.query(item.pre);
      const r = await c.query(item.sql);
      if (item.expectError) { console.error("EXPECTED ERROR BUT RAN:", where); errors++; }
      item.out = toOut(r);
    } catch (e) {
      if (item.expectError) item.out = { error: "ERROR: " + e.message };
      else { console.error("SQL FAILED in", where, "\n", item.sql, "\n ->", e.message); errors++; }
    } finally { await c.query("ROLLBACK"); }
    delete item.pre;
  }
  for (const L of lessons) {
    for (const s of (L.steps || [])) if (s.sql === "SETUP") s.sql = setup.trim();
    for (const [i, s] of (L.steps || []).entries()) await run(s, L.id + " step " + (i + 1));
    for (const [i, p] of (L.practice || []).entries()) await run(p, L.id + " practice " + (i + 1));
  }
  await c.end();
  if (errors) { console.error(errors + " problem(s)"); process.exit(1); }
  const body = lessons.map(L => {
    const { id, ...rest } = L;
    return `L[${JSON.stringify("sql:" + id)}] = ${JSON.stringify(rest, null, 1)};`;
  }).join("\n");
  fs.writeFileSync(out, `// Lessons for course "sql". Built by running every example on PostgreSQL 16.\n// Keys are "course:lessonId" (see catalog/topics.js).\n(function (L) {\n${body}\n})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});\n`);
  console.log(`ran ${n} queries, wrote ${lessons.length} lessons to ${out}`);
})().catch(e => { console.error(e); process.exit(1); });
