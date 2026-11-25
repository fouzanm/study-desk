// Interview Prep. Shared by every path. Coding examples run.
module.exports = [
{
 id: "star",
 title: "Behavioural answers with STAR",
 level: "Interview",
 one: "Answer “tell me about a time…” questions with <b>STAR</b>: <b>Situation</b> (context), <b>Task</b> (your goal), <b>Action</b> (what <i>you</i> did), <b>Result</b> (measured outcome), in about 2 minutes.",
 why: "Every interview loop has behavioural questions, and many candidates ramble or say “we”. A prepared set of STAR stories is the cheapest big improvement you can make.",
 steps: [
  { h: "The structure",
    p: ["<b>S</b> (2 sentences): where, when, what was at stake. <b>T</b> (1 sentence): what you were responsible for. <b>A</b> (most of the time): the specific steps <b>you</b> took and why. <b>R</b> (2 sentences): the result with numbers, and what you learned."] },
  { h: "A worked example",
    code: `Q: Tell me about a time you solved a hard problem for a client.

S  A retail client's Odoo-to-e-commerce stock sync was overselling: about 40 orders a week
   were placed for items that were out of stock, each needing a refund and an apology.
T  I owned the integration and had to stop the overselling within two weeks.
A  I added logging and found two causes: a 15-minute polling delay, and a race when two
   warehouses updated the same product. I replaced polling with webhooks plus a queue,
   made stock updates idempotent with version numbers, and added a nightly reconciliation
   that compared both systems and alerted on differences. I tested it against a fake
   store that sent duplicate and out-of-order events.
R  Oversold orders dropped from ~40 a week to 1–2 a month, and the reconciliation caught
   three data issues in the first month before customers noticed. I now design every
   integration with reconciliation from day one.`, lang: "text" },
  { h: "Build a story bank",
    p: ["Prepare 6–8 stories that each cover several themes. Common themes: a hard technical problem, a mistake you made, a conflict or disagreement, working with an unhappy client or stakeholder, learning something fast, leading or influencing without authority, a trade-off under deadline, going beyond your role.",
        "Use your real work: Odoo projects, integrations, migrations and client deliveries are rich material."],
    code: `stories = {
    "Overselling stock sync": ["hard problem", "client", "ownership"],
    "Wrong data migration rollback": ["mistake", "pressure"],
    "Client wanted custom module vs config": ["disagreement", "trade-off", "client"],
    "Learned FastAPI in a week for a project": ["learning fast"],
}
themes = ["hard problem", "mistake", "disagreement", "client", "learning fast", "trade-off", "leadership"]
for t in themes:
    covered = [s for s, tags in stories.items() if t in tags]
    print(f"{t:14} {'OK ' if covered else 'GAP'} {covered}")` },
  { h: "Say “I”, show numbers, own mistakes",
    p: ["Interviewers hire <b>you</b>, so say “I”, while giving credit to the team. Quantify results (time saved, errors reduced, money, users). For mistakes: own it, show how you fixed it, and what you changed so it can't happen again. Never blame others."] },
  { h: "Practise out loud",
    p: ["Record yourself answering, time it (aim for ~2 minutes), and cut anything that isn't S, T, A or R. Practise follow-ups: “What would you do differently?”, “How did you measure that?”, “What did your manager think?”."] }
 ],
 mistakes: [
  "Long situation, tiny action. Most of the time belongs to Action.",
  "“We did…” throughout. Say what you did.",
  "No result, or a result without numbers.",
  "Mistake stories where it was someone else's fault."
 ],
 practice: [
  { q: "Write the R (result) for a story where you automated a monthly report that took 2 days by hand.", a: "Example: “The report now runs automatically in 10 minutes on the 1st of each month, saving about 2 days of finance time monthly (around 24 days a year), and the numbers stopped having copy-paste errors. Two other teams asked to reuse it.”" },
  { q: "Fill the gaps in your own story bank: which themes from the list have no story yet? Draft one STAR story for a gap.", a: "Use the bank checker above with your stories. For each gap, think of a real moment (even a small one) and write S, T, A, R in 6–8 lines." }
 ],
 check: [
  ["Which part of STAR should take the most time?", ["Situation", "Task", "Action", "Result"], 2, "What you did is what they assess."],
  ["Best way to describe teamwork in STAR?", ["Only “we”", "Say what you did, credit the team", "Only “I”, no credit", "Skip it"], 1, "Clear ownership, fair credit."],
  ["How many prepared stories is a good start?", ["1", "6–8 covering several themes each", "30", "None"], 1, "Reuse stories across questions."]
 ],
 remember: [
  "STAR: Situation, Task, Action (most time), Result (with numbers).",
  "~2 minutes; say “I”; credit the team.",
  "Bank of 6–8 real stories covering common themes.",
  "Mistakes: own it, fix, prevent.",
  "Practise out loud; prepare for follow-ups."
 ]
},
{
 id: "resume",
 title: "A resume that gets interviews",
 level: "Interview",
 one: "A resume is a one-to-two page advert for one kind of role: a clear <b>headline</b>, <b>impact bullets</b> with numbers, the <b>keywords</b> from the job posts, and <b>projects</b> that prove the new skills.",
 why: "Recruiters spend seconds on each resume, and applicant tracking systems filter on keywords. Tailoring it to the target role (FDE, AI engineer, data engineer) directly changes how many interviews you get.",
 steps: [
  { h: "Structure",
    code: `NAME · City · email · phone · github.com/you · linkedin.com/in/you · portfolio link

HEADLINE   Python engineer · 3+ years building ERP integrations and automations for 20+ businesses
           · now building LLM features (RAG, agents, MCP)

SKILLS     Python, SQL (PostgreSQL), FastAPI, REST/webhooks, Docker, Git, LLM APIs, RAG, evals, Odoo

EXPERIENCE (newest first; 3–6 impact bullets each)
PROJECTS   2–3 strong, relevant projects with links and one measured result each
EDUCATION  Degree, university, year`, lang: "text" },
  { h: "Impact bullets: action + what + result",
    p: ["Formula: <b>Did X</b> using <b>Y</b>, which <b>achieved Z (number)</b>. Start with a strong verb; avoid “responsible for”."],
    code: `WEAK   Responsible for Odoo customisations and integrations.
STRONG Built 12 Odoo integrations (payments, shipping, e-commerce) with Python and REST APIs,
       cutting manual order entry by ~60% for 8 retail clients.

WEAK   Worked on data migration.
STRONG Migrated 1.2M records from legacy ERP to Odoo with validation scripts and rollback plans;
       zero data loss and go-live on schedule.

WEAK   Made an AI chatbot.
STRONG Built a RAG help-centre assistant (FastAPI, pgvector, Claude) with citation checks;
       91% answer accuracy on a 50-question eval set.`, lang: "text" },
  { h: "Match the job post's keywords",
    p: ["Copy the target posting's key skills and make sure the ones you genuinely have appear in your resume, in the same words. A quick check:"],
    code: `job_post = """We're hiring a Forward Deployed Engineer. You'll work with Python, SQL and REST APIs,
build LLM applications with RAG and agents, write evals, deploy with Docker on AWS, and work directly
with customers to scope solutions."""

resume = """Python engineer. Built Odoo integrations with REST APIs and webhooks. PostgreSQL, SQL.
FastAPI, Docker. Built a RAG assistant with evals. Worked with clients on requirements."""

keywords = ["python", "sql", "rest", "llm", "rag", "agents", "evals", "docker", "aws", "customers"]
have = [k for k in keywords if k in resume.lower()]
missing = [k for k in keywords if k not in resume.lower()]
print("matched:", have)
print("missing:", missing)`,
    note: "Only add keywords you can talk about in an interview. For missing ones, build a small project (that's what the Projects menu is for)." },
  { h: "Projects that prove the switch",
    p: ["Moving from ERP work into AI or data roles, projects bridge the gap. Each project line: what it does, the stack, one measured result, and a link (GitHub with a good README, a live demo or a 2-minute video). Three strong projects beat ten tutorials."] },
  { h: "Final checks",
    p: ["One or two pages; same format throughout; no photos, age or long paragraphs; links work; PDF named <code>Firstname-Lastname-Role.pdf</code>. Tailor the headline and top bullets for each type of role you apply to. Ask someone in the target role to review it."] }
 ],
 mistakes: [
  "Task lists (“responsible for…”) instead of results.",
  "One generic resume for every role.",
  "Listing tools you can't discuss in depth.",
  "Projects with no link, no README and no result."
 ],
 practice: [
  { q: "Rewrite as an impact bullet: “Did reports in Odoo.”", a: "Example: “Built 15 custom Odoo reports (QWeb, SQL views) for finance and sales teams, replacing weekly Excel work and saving ~6 hours per week per team.”" },
  { q: "Run the keyword check with your own resume text and a real job post you like. Which 3 missing skills could a weekend project cover?", a: "Paste both texts into the checker. Typical gaps for ERP developers moving to FDE/AI roles: cloud (AWS), evals, agents/MCP. One project (e.g. the Projects menu's AI agent) can cover all three." }
 ],
 check: [
  ["Best bullet style?", ["Responsible for X", "Did X using Y, achieving Z (number)", "A paragraph", "A list of tools"], 1, "Action + result."],
  ["Why tailor keywords to the job post?", ["Looks nice", "Recruiters and applicant tracking systems filter on them", "Required by law", "Shorter resume"], 1, "Match the words they search for."],
  ["Best proof for a career switch into AI?", ["A long skills list", "2–3 real projects with links and measured results", "Certificates only", "A photo"], 1, "Show, don't tell."]
 ],
 remember: [
  "Headline for the target role; skills in the job post's words.",
  "Bullets: verb + what + how + measured result.",
  "2–3 strong projects with links, READMEs and results.",
  "Tailor per role type; 1–2 pages; links work.",
  "Only list what you can discuss deeply."
 ]
},
{
 id: "project-story",
 title: "Telling your project story",
 level: "Interview",
 one: "Interviewers will say “walk me through a project”. Have a crisp <b>5-part story</b> for 2–3 projects: <b>problem → constraints → design → hard part → result and what you'd improve</b>.",
 why: "This is where you prove depth. A clear project walkthrough with real trade-offs often decides the offer, especially for forward-deployed and AI roles.",
 steps: [
  { h: "The 5 parts (5–7 minutes)",
    p: ["<b>1. Problem</b>: who had it and why it mattered (numbers). <b>2. Constraints</b>: data, systems, time, budget, security. <b>3. Design</b>: the architecture in one drawing; why these choices. <b>4. The hard part</b>: one or two real problems and how you solved them. <b>5. Result</b>: measured outcome, what you learned, what you'd do next."] },
  { h: "Example skeleton",
    code: `1 PROBLEM   Support team answered 300 policy questions a day by hand; first reply took ~6 hours.
2 CONSTRAINTS Policies in 40 PDFs, updated monthly; answers must be correct and cited; no customer data to the LLM.
3 DESIGN    PDF → section chunks + metadata → hybrid search (BM25 + embeddings in pgvector) → Claude answers
            only from sources with [n] citations → citation check → reply or "I don't know" + human handoff.
4 HARD PART Old policy versions kept winning retrieval. Fix: valid_from/valid_to metadata filters and
            re-indexing by content hash. Recall@3 on 60 labelled questions: 71% -> 93%.
5 RESULT    64% of questions answered automatically, first reply under 1 minute for those, 0 wrong
            policy answers in a 2-week pilot. Next: Malayalam support and a feedback loop into evals.`, lang: "text" },
  { h: "Know your numbers and your diagram",
    p: ["Be ready to draw the architecture from memory and give: volumes (requests/day), latency, cost per request, accuracy on your eval set, and how you measured each. If you don't have a number, say how you would measure it."] },
  { h: "Expect these follow-ups",
    code: `Why this database / model / framework and not X?
What failed first? What would break at 10x volume?
How did you test it? How do you know the answers are correct?
What would you do differently with another month?
What was your part versus the team's?
How did the users/clients react? What did they ask for next?`, lang: "text",
    p: ["Prepare a short, honest answer to each for every project you list."] },
  { h: "Turn portfolio projects into stories",
    p: ["The Projects in this platform (AI agent, integration hub, data pipeline) are designed to give you exactly these stories: a real problem, design choices, a hard part, tests, and measured results. Write the 5-part story in each project's README as you build it."] }
 ],
 mistakes: [
  "Starting with the tech stack instead of the problem.",
  "No hard part: it sounds like a tutorial.",
  "No measured result, or claims you can't explain.",
  "Taking credit for the team's work; be clear about your part."
 ],
 practice: [
  { q: "Draft the 5-part story for one of your Odoo projects in 5 lines.", a: "Use the skeleton: problem with numbers, constraints, design in one sentence, one real hard part and its fix, measured result plus what you'd do next." },
  { q: "An interviewer asks “what would break at 10× volume?” for the RAG assistant above. Give an answer.", a: "Embedding/indexing time on monthly updates (fix: incremental hash-based re-indexing, already in place); LLM cost and rate limits (fix: caching repeated questions, smaller model for easy ones, batch indexing); pgvector query latency (fix: HNSW index tuning, read replica). I'd load-test before scaling." }
 ],
 check: [
  ["How should a project walkthrough start?", ["The tech stack", "The problem and why it mattered", "Your degree", "Code"], 1, "Problem first."],
  ["What makes a project story sound real?", ["Many buzzwords", "A genuine hard part and how you solved it, with numbers", "Length", "Screenshots"], 1, "Depth over breadth."],
  ["No exact number for latency. You say…", ["Make one up", "How you would measure it", "Skip the question", "“It was fast”"], 1, "Honest and practical."]
 ],
 remember: [
  "Problem → constraints → design → hard part → result + next steps.",
  "Draw the architecture from memory; know volumes, latency, cost, accuracy.",
  "Prepare answers to the standard follow-ups.",
  "Be honest about your part and missing numbers.",
  "Write each project's story in its README."
 ]
},
{
 id: "ai-tools",
 title: "Using AI tools well (at work and in interviews)",
 level: "Interview",
 one: "Companies expect engineers to use AI assistants (Claude, ChatGPT, Copilot, Cursor) <b>well</b>: to move faster while still <b>understanding, checking and owning</b> every line. Some interviews now test this directly.",
 why: "“How do you use AI in your work?” is now a common question, and AI-assisted coding rounds are spreading. Showing good judgement here is a real advantage, especially for AI-focused roles.",
 steps: [
  { h: "Where AI helps most",
    p: ["Boilerplate and scaffolding, explaining unfamiliar code or errors, writing tests (which you review), first drafts of docs and specs, SQL and regex drafts, learning a new library fast, and reviewing your own code for bugs and edge cases."] },
  { h: "Good habits",
    p: ["<b>Give context</b>: the goal, constraints, existing code, error messages. <b>Ask for small steps</b>, not whole systems. <b>Read and run everything</b>; write or keep tests. <b>Check facts</b> (API names, versions) against docs. <b>Never paste secrets or client confidential data</b> into tools your company hasn't approved."],
    code: `WEAK    "write a webhook handler"

STRONG  "In FastAPI (Python 3.12), write an endpoint POST /webhooks/shop that:
         - verifies an HMAC-SHA256 signature from header X-Shop-Signature using the raw body
         - stores the event in a SQLite table inbound_events with event_id as primary key
         - returns 200 {"status": "duplicate"} if the id already exists
         - returns 401 on a bad signature
         Include pytest tests for valid, duplicate and bad-signature cases."`, lang: "text" },
  { h: "Verify, don't trust",
    p: ["AI-written code often looks right and is subtly wrong. A quick example: an assistant suggested this to “get the last N items”. The tests show the bug instantly:"],
    code: `def last_n(items, n):                 # suggested code
    return items[-n:]

def test_last_two():
    assert last_n([1, 2, 3], 2) == [2, 3]

def test_zero_items():
    assert last_n([1, 2, 3], 0) == []      # items[-0:] returns the whole list!`, test: true, expectError: true,
    note: "<code>items[-0:]</code> is <code>items[0:]</code>, the whole list. The edge case is exactly where tests earn their keep." },
  { h: "AI-assisted interviews",
    p: ["When an interview allows AI tools: think and plan out loud first, use the tool for well-defined pieces, read every suggestion aloud and explain it, run and test, and fix its mistakes. They're assessing your judgement and understanding, not your typing.",
        "When AI isn't allowed: don't use it. Practise solving problems without it too, so you aren't dependent on it."] },
  { h: "Talking about it",
    p: ["A strong answer to “how do you use AI?”: concrete uses, how you verify, where you don't use it, and a result. For example: “I use Claude to scaffold integrations and draft tests; I review every line, run the tests, and check API details in the docs. It roughly halves my time on boilerplate, which I put into edge cases and evals. I never paste client data into unapproved tools.”"] }
 ],
 mistakes: [
  "Pasting code you can't explain into production or an interview.",
  "Sharing secrets or client data with unapproved tools.",
  "Accepting made-up function names or outdated APIs without checking docs.",
  "Becoming unable to code without the assistant."
 ],
 practice: [
  { q: "Fix <code>last_n</code> so n = 0 returns an empty list, and make the tests pass.", code: `def last_n(items, n):
    return items[-n:] if n > 0 else []

def test_last_two():
    assert last_n([1, 2, 3], 2) == [2, 3]

def test_zero_items():
    assert last_n([1, 2, 3], 0) == []`, test: true },
  { q: "Write a strong prompt asking an AI to write a SQL query: top 5 customers by completed revenue in 2025, from tables customers(id, name) and orders(id, customer_id, status, total, order_date).", a: "“PostgreSQL. Tables: customers(id, name), orders(id, customer_id, status, total, order_date). Write a query returning the top 5 customers by total of completed orders with order_date in 2025, columns name and revenue, highest first. Use a date range (not EXTRACT) so an index on order_date can be used. Explain any assumptions.”" }
 ],
 check: [
  ["Best way to use AI-generated code?", ["Paste and ship", "Read it, run it, test it and own it", "Never use it", "Only for comments"], 1, "You're responsible for every line."],
  ["What must never go into an unapproved AI tool?", ["Public docs", "Secrets and client confidential data", "Error messages from your own code", "Questions"], 1, "Protect data."],
  ["In an AI-allowed interview, what's being assessed?", ["Typing speed", "Your judgement, understanding and verification", "The tool", "Nothing"], 1, "Explain and check everything."]
 ],
 remember: [
  "Use AI for scaffolding, explanations, tests, drafts and reviews.",
  "Strong prompts: goal, constraints, context, small steps, tests.",
  "Read, run, test, check docs; never paste secrets or client data.",
  "In AI-allowed interviews: plan aloud, explain every suggestion, test.",
  "Keep the skill to work without it."
 ]
},
{
 id: "mock-tech",
 title: "Technical interview practice",
 level: "Interview",
 one: "Technical rounds test the same core areas again and again: <b>coding</b> (data structures and clean code), <b>SQL</b>, <b>APIs and systems</b>, and for AI roles <b>LLM, RAG and evals</b>. Practise a method, then the classic questions.",
 why: "Knowing the format removes panic. A steady method (clarify, plan, code, test, discuss) earns points even when you don't finish.",
 steps: [
  { h: "A method for coding questions",
    p: ["<b>1. Clarify</b>: inputs, outputs, edge cases, size. <b>2. Examples</b>: work one by hand. <b>3. Plan</b>: say the approach and its time/space cost before coding. <b>4. Code</b> cleanly, talking as you go. <b>5. Test</b> with your examples and edge cases. <b>6. Improve</b>: discuss a better approach if there is one."] },
  { h: "Worked example: find duplicate orders",
    p: ["<i>“Given a list of order ids, return the ids that appear more than once, in the order they first repeat.”</i> Clarify: empty list → empty result; ids are strings. Plan: one pass with a set of seen ids and a set of reported ones: O(n) time, O(n) space."],
    code: `def repeated_ids(ids: list[str]) -> list[str]:
    seen, reported, out = set(), set(), []
    for i in ids:
        if i in seen and i not in reported:
            out.append(i)
            reported.add(i)
        seen.add(i)
    return out

def test_basic():
    assert repeated_ids(["a", "b", "a", "c", "b", "a"]) == ["a", "b"]

def test_empty_and_unique():
    assert repeated_ids([]) == []
    assert repeated_ids(["x", "y"]) == []`, test: true },
  { h: "Common questions by area (with short answers)",
    code: `SQL        Second highest salary? (DENSE_RANK) · Duplicates? (GROUP BY HAVING COUNT>1)
           Top N per group? (ROW_NUMBER in a CTE) · WHERE vs HAVING? · LEFT JOIN anti-join?
PYTHON     List vs tuple vs set vs dict? · Mutable default arguments? · Generators and yield?
           How does a dict work (hashing)? · async vs threads?
APIs       PUT vs PATCH? · 401 vs 403? · Idempotency? · How do you handle rate limits and retries?
           How do you verify a webhook? · REST vs GraphQL?
SYSTEMS    Design a URL shortener / order sync / notification service (System Design course)
LLM/AI     What is RAG and when would you fine-tune instead? · How do you reduce hallucinations?
           How do you evaluate an LLM feature? · What is prompt injection and how do you defend?
           Tool calling: how does the loop work? · How do you control cost and latency?`, lang: "text" },
  { h: "Explaining complexity",
    p: ["Say time and space cost in big-O and why: “one pass over n items with set lookups, so O(n) time and O(n) extra space”. If brute force is O(n²), say so, then improve it. The DSA course covers this in depth."],
    code: `import time

def has_duplicate_slow(xs):                 # compare every pair: O(n^2)
    return any(xs[i] == xs[j] for i in range(len(xs)) for j in range(i + 1, len(xs)))

def has_duplicate_fast(xs):                 # set: O(n)
    return len(set(xs)) != len(xs)

data = list(range(3_000))
for f in (has_duplicate_slow, has_duplicate_fast):
    t = time.perf_counter()
    f(data)
    print(f"{f.__name__:20} {(time.perf_counter() - t) * 1000:8.1f} ms")` },
  { h: "When you're stuck",
    p: ["Say what you're thinking, solve a smaller version, try brute force first and improve, ask a clarifying question, or use a hint gracefully. Silence is worse than a clear partial solution."] }
 ],
 mistakes: [
  "Coding before clarifying and planning.",
  "Going silent while thinking.",
  "Never testing your code, or testing only the happy path.",
  "Not stating complexity."
 ],
 practice: [
  { q: "Write <code>first_unique_char(s)</code>: the index of the first character that appears once, or -1. Add tests.", code: `from collections import Counter

def first_unique_char(s: str) -> int:
    counts = Counter(s)
    for i, ch in enumerate(s):
        if counts[ch] == 1:
            return i
    return -1

def test_examples():
    assert first_unique_char("leetcode") == 0
    assert first_unique_char("loveleetcode") == 2
    assert first_unique_char("aabb") == -1
    assert first_unique_char("") == -1`, test: true },
  { q: "Answer in 3 sentences: “How do you reduce hallucinations in an LLM feature?”", a: "Give the model the facts it needs (RAG or tools) and tell it to answer only from them, with citations and permission to say “I don't know”. Validate outputs automatically (schemas, citation and cross-checks) and route doubtful cases to a human. Measure it with an eval set of real questions and track the rate over time." }
 ],
 check: [
  ["First step in a coding question?", ["Start typing", "Clarify inputs, outputs and edge cases", "Ask for the answer", "Optimise"], 1, "Understand first."],
  ["Duplicate check with a set is…", ["O(n²)", "O(n)", "O(log n)", "O(1)"], 1, "One pass with O(1) lookups."],
  ["You're stuck. Best move?", ["Go silent", "Explain your thinking, try brute force or a smaller case", "Give up", "Change the question"], 1, "Show your reasoning."]
 ],
 remember: [
  "Clarify → examples → plan + complexity → code aloud → test → improve.",
  "Know the classic SQL, Python, API, systems and LLM questions.",
  "State big-O with a reason.",
  "Stuck: think aloud, brute force, smaller case, ask."
 ]
},
{
 id: "mock-full",
 title: "Mock interview loop and a 30-day plan",
 level: "Interview",
 one: "Put it together: know the typical <b>interview loop</b>, run <b>mock interviews</b> with feedback, and follow a <b>30-day plan</b> that turns this platform's courses into interview readiness.",
 why: "Practice under realistic conditions is what turns knowledge into offers. A plan keeps you consistent while working full time.",
 steps: [
  { h: "The typical loop",
    code: `1 Recruiter screen (20–30 min)   motivation, background, salary range, logistics
2 Technical screen (45–60 min)   coding or SQL, sometimes a take-home
3 Onsite / virtual loop (3–5 rounds):
    · coding / data structures
    · system design (or AI system design: RAG, agents, evals)
    · practical round: build/debug something, often with AI tools allowed
    · behavioural (STAR) and project deep dive
    · for FDE/solutions roles: a customer case (discovery + design + communication)
4 Hiring manager / culture       why this company, how you work`, lang: "text" },
  { h: "Run mock interviews",
    p: ["Practise with a friend, a colleague, a mentor or an AI interviewer: timed, out loud, with a webcam on. After each, write down what went well and one thing to fix. Do at least one mock per round type before real interviews."] },
  { h: "Research each company",
    p: ["Read the job post closely, the company's product and customers, recent news, and the team's engineering blog. Prepare 3 questions to ask them (about the team, how success is measured, the biggest challenge in the role). Map your stories and projects to their needs."] },
  { h: "A 30-day plan alongside a full-time job",
    p: ["About 1.5–2 hours on weekdays and 4 hours on weekend days. Adjust the topics to your target path:"],
    code: `plan = [
    ("Week 1", "SQL course (lessons 1-15) + 2 STAR stories + resume rewrite"),
    ("Week 2", "Python + APIs courses + start Project: Integration Hub or AI Agent"),
    ("Week 3", "LLM + RAG + Agents courses + finish the project with tests and README"),
    ("Week 4", "System Design + Evals + 4 mock interviews (coding, design, behavioural, case)"),
]
for week, focus in plan:
    print(f"{week}: {focus}")
print("Daily: 1 coding problem (DSA) · 15 min flashcards on the Revise page")
print("Every Sunday: apply to 5-10 tailored roles, review what you learned")` },
  { h: "After each interview",
    p: ["Within an hour, write down every question you were asked and how you answered. Add weak spots to your study plan and new questions to your practice list. Send a short thank-you note. Rejections are data: ask for feedback when possible, adjust, keep going."] }
 ],
 mistakes: [
  "Only reading, never practising out loud under time pressure.",
  "Applying everywhere with the same resume.",
  "Not preparing questions for the interviewer.",
  "Not writing down questions after each interview."
 ],
 practice: [
  { q: "Write your own 30-day plan using the courses in your chosen path. Print it with the same code, changing the weeks to fit your time.", code: `plan = [
    ("Week 1", "SQL: lessons 1-8 · STAR stories 1-2"),
    ("Week 2", "SQL: lessons 9-15 · Python: lessons 1-6"),
    ("Week 3", "Python: lessons 7-13 · APIs course"),
    ("Week 4", "Project + 2 mock interviews"),
]
for week, focus in plan:
    print(f"{week}: {focus}")` },
  { q: "Write 3 good questions to ask an interviewer for a forward-deployed engineer role.", a: "Examples: “What does a typical customer engagement look like from first call to production?” · “How do you measure success for an FDE in the first 6 months?” · “What's the hardest customer problem the team solved recently, and what made it hard?”" }
 ],
 check: [
  ["Best way to prepare for interview rounds?", ["Only reading", "Timed mock interviews out loud, with feedback", "Memorising answers word for word", "Nothing"], 1, "Realistic practice."],
  ["What to do right after an interview?", ["Forget it", "Write down every question and your answers, then update your plan", "Apply to the same job again", "Complain online"], 1, "Interviews are data."],
  ["FDE/solutions loops often include…", ["Only coding", "A customer case round (discovery, design, communication)", "No technical rounds", "Only a quiz"], 1, "Client skills are tested."]
 ],
 remember: [
  "Loop: recruiter → tech screen → 3–5 rounds (coding, design, practical, behavioural, case) → manager.",
  "Mock every round type before real interviews.",
  "Research the company; prepare 3 questions to ask.",
  "30-day plan: courses + project + daily coding + weekly applications.",
  "After each interview: write it down, update the plan, send thanks."
 ]
}
];
