// Builds lessons/<course>.js from tools/courses/<course>.js.
// Python examples (lang "python", the default when `code` is set) are really run and their output stored.
// Usage: node build.js <course-id>
//
// Step / practice fields:
//   code       the example (shown with a Copy button)
//   lang       "python" (run), or "bash", "text", "json", "yaml", "js", "java", "http", "sql"… (shown, not run)
//   run        false to show Python without running it
//   pre        hidden Python that runs before `code` (setup), not shown
//   files      {name: content} files created in the working folder before running
//   test       true: run the code with pytest and show its summary
//   expectError true: the example is meant to fail; the last line of the error is shown
//   out        for code that isn't run: {text: "..."} written by hand (shown as "Example output")
const fs = require("fs"), path = require("path"), os = require("os");
const { execFileSync } = require("child_process");

const course = process.argv[2];
if (!course) { console.error("usage: node build.js <course-id>"); process.exit(1); }
const root = path.resolve(__dirname, "../..");
const lessons = require(path.join(root, "tools/courses", course + ".js"));

let ran = 0, problems = 0;
function runPython(item, where) {
  const lang = item.lang || "python";
  if (!item.code || lang !== "python" || item.run === false) return;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-"));
  for (const [n, c] of Object.entries(item.files || {})) {
    fs.mkdirSync(path.dirname(path.join(dir, n)), { recursive: true });
    fs.writeFileSync(path.join(dir, n), c);
  }
  const file = item.test ? "test_example.py" : "example.py";
  fs.writeFileSync(path.join(dir, file), (item.pre ? item.pre + "\n" : "") + item.code + "\n");
  const args = item.test ? ["-m", "pytest", "-q", "--no-header", "-p", "no:cacheprovider", file] : ["-I", file];
  let text, failed = false;
  try {
    text = execFileSync("python3", args, { cwd: dir, timeout: 30000, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PYTHONHASHSEED: "0", PYTHONDONTWRITEBYTECODE: "1" } });
  } catch (e) {
    failed = true;
    const err = (e.stdout || "") + (e.stderr || "");
    if (item.test) text = err;
    else {
      const errLines = (e.stderr || "").trim().split("\n").filter(Boolean);
      text = (e.stdout || "") + (errLines.length ? errLines[errLines.length - 1] : "");
    }
  }
  ran++;
  if (failed && !item.expectError && !item.test) { console.error("PYTHON FAILED in", where, "\n", text); problems++; }
  if (!failed && item.expectError) { console.error("EXPECTED AN ERROR in", where); problems++; }
  if (item.test && failed && !item.expectError) { console.error("TESTS FAILED in", where, "\n", text); problems++; }
  text = text.replace(new RegExp(dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), ".").replace(/\s+$/, "");
  if (item.test) text = text.replace(/ {2,}\[/g, "  [").split("\n").filter(l => !/^platform |^rootdir|^collected|^=+ (test session|warnings)/.test(l)).join("\n").trim();
  item.out = failed && item.expectError && !item.test ? { error: text } : { text };
  delete item.pre; delete item.files;
  fs.rmSync(dir, { recursive: true, force: true });
}

for (const L of lessons) {
  (L.steps || []).forEach((s, i) => runPython(s, L.id + " step " + (i + 1)));
  (L.practice || []).forEach((p, i) => runPython(p, L.id + " practice " + (i + 1)));
  for (const s of [...(L.steps || []), ...(L.practice || [])]) if (s.out && s.out.text != null && s.out.hand) { s.out.label = "Example output"; delete s.out.hand; }
}
if (problems) { console.error(problems + " problem(s)"); process.exit(1); }
const body = lessons.map(({ id, ...rest }) => `L[${JSON.stringify(course + ":" + id)}] = ${JSON.stringify(rest, null, 1)};`).join("\n");
fs.writeFileSync(path.join(root, "lessons", course + ".js"),
  `// Lessons for course "${course}". Built by tools/course-builder from tools/courses/${course}.js.\n// Python examples were run and their real output stored.\n(function (L) {\n${body}\n})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});\n`);
console.log(`${course}: ran ${ran} examples, wrote ${lessons.length} lessons`);
