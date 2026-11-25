// Copies a course's title, description, lesson list and quiz from tools/courses/<id>.meta.js into catalog/topics.js.
// Usage: node catalog.js <course-id>
const fs = require("fs"), path = require("path");
const id = process.argv[2];
const root = path.resolve(__dirname, "../..");
const meta = require(path.join(root, "tools/courses", id + ".meta.js"));
const f = path.join(root, "catalog/topics.js");
const lines = fs.readFileSync(f, "utf8").split("\n");
const i = lines.findIndex(l => l.startsWith(`{"id":${JSON.stringify(id)},`));
if (i < 0) throw new Error("course not found: " + id);
const comma = lines[i].endsWith(",");
const o = JSON.parse(comma ? lines[i].slice(0, -1) : lines[i]);
for (const k of ["title", "description", "lessons", "quiz"]) if (meta[k]) o[k] = meta[k];
for (const q of o.quiz) if (!(q[2] >= 0 && q[2] < q[1].length)) throw new Error("bad answer index: " + q[0]);
lines[i] = JSON.stringify(o) + (comma ? "," : "");
fs.writeFileSync(f, lines.join("\n"));

console.log(`${id}: ${o.lessons.length} lessons, ${o.quiz.length} quiz questions`);
