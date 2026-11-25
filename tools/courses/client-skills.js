// Client & Delivery Skills. Mostly templates and worked examples; the ROI maths runs.
module.exports = [
{
 id: "discovery",
 title: "Discovery: understanding the real problem",
 level: "Beginner+",
 one: "<b>Discovery</b> is finding out what the client actually needs before building anything: the <b>workflow today</b>, the <b>pain</b>, the <b>people</b>, the <b>data and systems</b>, and how <b>success</b> will be measured.",
 why: "Forward-deployed, implementation and solutions roles are judged on building the <i>right</i> thing. Most failed projects solved the wrong problem well. Good discovery is the skill that separates you from a pure coder.",
 steps: [
  { h: "Start from the workflow, not the tool",
    p: ["Clients often arrive with a solution (“we need a chatbot”). Ask about the work: “Walk me through what happens today, step by step, when an order email arrives.” Write it down as steps with who does each, how long it takes, and where it goes wrong.",
        "Often the real fix is smaller or different from what they asked for."] },
  { h: "Questions that work",
    code: `WORKFLOW   Walk me through the last time this happened, step by step.
           Who does each step? How long does it take? How often per day?
PAIN       What goes wrong? What happens when it does? What does it cost?
           If this were fixed tomorrow, what would change for you?
DATA       Where does the information come from? What format? Who owns it?
           Can we get 20 real examples (with sensitive parts removed)?
SYSTEMS    Which systems are involved? Do they have APIs? Who can give access?
SUCCESS    How will you know this worked? What number should move, and by how much?
CONSTRAINTS Budget, deadline, security/compliance rules, who must approve?
PEOPLE     Who uses it daily? Who decides? Who might resist, and why?`, lang: "text" },
  { h: "Listen for numbers",
    p: ["Turn pain into numbers so the value is clear and you can prove success later. A quick estimate from discovery notes:"],
    code: `emails_per_day = 400
minutes_per_email = 4
working_days = 22
hourly_cost_inr = 450
error_rate = 0.03                 # 3% of manual entries have mistakes
cost_per_error_inr = 1_200        # wrong shipment, rework, angry customer

hours_per_month = emails_per_day * minutes_per_email / 60 * working_days
labour = hours_per_month * hourly_cost_inr
errors = emails_per_day * working_days * error_rate * cost_per_error_inr
print(f"{hours_per_month:,.0f} staff hours/month  ->  ₹{labour:,.0f}")
print(f"errors cost about ₹{errors:,.0f}/month")
print(f"total pain: ₹{labour + errors:,.0f}/month")` },
  { h: "Get real examples early",
    p: ["Ask for 20–50 real samples (emails, invoices, tickets) in week one. They reveal the messy reality (scans, handwriting, three languages, missing fields) that meetings hide, and they become your first eval set."] },
  { h: "Summarise back",
    p: ["End discovery by writing a one-page summary and asking the client to correct it: problem, current workflow, who's affected, success measure, constraints, open questions. Agreement on this page prevents most later arguments."] }
 ],
 mistakes: [
  "Starting to build after the first meeting.",
  "Talking to the manager only, never to the people who do the work.",
  "No success number agreed, so “done” is a matter of opinion.",
  "Asking “do you want X?” (they'll say yes) instead of “what happens today?”."
 ],
 practice: [
  { q: "A hospital says “we want AI for our appointment system.” Write five discovery questions.", a: "Examples: Walk me through how a patient books today, by phone and online. Where do bookings go wrong (no-shows, double bookings, long calls)? How many calls/bookings a day, and how long does each take? Which system holds the schedule, and does it have an API? What would success look like in numbers (fewer no-shows, shorter call times)? What privacy rules apply to patient data?" },
  { q: "Using the calculator above, how much staff time is saved per month if 70% of emails are handled automatically?", code: `hours = 400 * 4 / 60 * 22
print(f"{hours * 0.7:,.0f} hours saved per month")` }
 ],
 check: [
  ["Best opening discovery question?", ["Do you want a chatbot?", "Walk me through what happens today, step by step", "What's your budget?", "Which model do you like?"], 1, "Start from the workflow."],
  ["Why ask for real examples in week one?", ["Paperwork", "They reveal the messy reality and become your eval set", "Legal reasons", "To delay"], 1, "Reality beats meetings."],
  ["How do you end discovery?", ["Start coding", "A one-page summary the client confirms", "A long slide deck", "Send an invoice"], 1, "Agree on the problem."]
 ],
 remember: [
  "Workflow first: steps, who, how long, how often, where it breaks.",
  "Turn pain into numbers (hours, errors, money).",
  "Talk to the people doing the work, not only managers.",
  "Get 20–50 real examples in week one.",
  "Close with a one-page summary the client confirms."
 ]
},
{
 id: "specs",
 title: "Writing a clear spec and scope",
 level: "Beginner+",
 one: "A <b>spec</b> turns discovery into an agreed plan: goal, scope (<b>in and out</b>), how it works, success measures, risks, milestones. Short, specific, and signed off before the main build.",
 why: "A clear spec protects you and the client: it stops scope creep, sets expectations about AI accuracy, and makes “done” measurable.",
 steps: [
  { h: "A one-to-two page spec template",
    code: `TITLE        Order email → ERP draft orders (phase 1)
PROBLEM      400 order emails/day are typed into the ERP by hand: ~590 staff hours/month, 3% errors.
GOAL         Create draft orders automatically for routine emails; staff review and confirm.
SUCCESS      ≥ 70% of emails become correct drafts with no edits; review time ≤ 30 s per draft;
             zero orders lost; measured weekly on real traffic.
IN SCOPE     English emails with PDF or text orders; known customers; products in the catalogue.
OUT OF SCOPE Handwritten scans; new-customer creation; price negotiation emails (phase 2).
HOW          Email inbox → extractor (LLM + validation) → draft order in ERP via API → review screen.
             Uncertain or failed cases go to a review queue with the reason.
DATA/ACCESS  Read access to orders@ mailbox; ERP API key with draft-order permission only.
RISKS        Unusual formats lower accuracy → review queue; ERP API limits → queue + backoff.
MILESTONES   W1 eval set + baseline · W2 working pipeline on test data · W3 pilot with 2 staff · W4 go-live.
OPEN QUESTIONS Who approves go-live? Retention period for email copies?`, lang: "text" },
  { h: "Scope: say what's out",
    p: ["The “out of scope” list is as important as “in scope”. It stops “while you're at it, can it also…” from silently doubling the work. New requests go to a list for the next phase, with an estimate."] },
  { h: "Set honest AI expectations",
    p: ["Never promise 100%. Promise a <b>measured</b> target on <b>their</b> data, a review path for the rest, and a plan to improve. Express it in their terms: “7 out of 10 emails need no typing; the other 3 take 30 seconds to fix.”"] },
  { h: "Acceptance criteria",
    p: ["Write tests the client agrees with, in plain language, so “done” isn't a debate:"],
    code: `GIVEN a routine order email from a known customer with 1–20 catalogue items
WHEN it arrives in the orders@ inbox
THEN a draft order appears in the ERP within 5 minutes with customer, items, quantities and delivery date filled in

GIVEN an email the system isn't confident about
THEN it appears in the review queue with the original email and the reason, and no draft is created

GIVEN the ERP is unavailable
THEN no email is lost and drafts are created once it's back`, lang: "text" },
  { h: "Estimate with ranges",
    p: ["Give ranges and say what they depend on: “3–4 weeks, assuming API access in week 1 and 50 sample emails.” Split into milestones with something demo-able at each, so the client sees progress and can redirect early."] }
 ],
 mistakes: [
  "A 30-page spec nobody reads. Keep it short; link details.",
  "No out-of-scope list, so scope grows silently.",
  "Promising accuracy before seeing the client's real data.",
  "Single-number estimates with hidden assumptions."
 ],
 practice: [
  { q: "Write three out-of-scope items for a “chatbot that answers HR policy questions for employees.”", a: "Examples: answering questions about individual salaries or performance reviews; taking actions (applying for leave, changing bank details); policies in languages other than English in phase 1; questions from people outside the company." },
  { q: "Rewrite this as a measurable success criterion: “The bot should be accurate.”", a: "“On a test set of 100 real employee questions reviewed by HR, at least 85% of answers are correct and cite the right policy, and the bot says it doesn't know (and gives the HR contact) for questions outside the policies.”" }
 ],
 check: [
  ["Why include an out-of-scope list?", ["Formality", "To stop scope creep and set expectations", "Legal requirement", "Longer document"], 1, "Protects time and trust."],
  ["Good way to state AI accuracy?", ["“100% accurate”", "A measured target on their data plus a review path", "“Very good”", "Don't mention it"], 1, "Honest and measurable."],
  ["Best estimate format?", ["One exact date", "A range with stated assumptions and milestones", "No estimate", "Whatever the client wants"], 1, "Transparent."]
 ],
 remember: [
  "Spec: problem, goal, success numbers, in/out scope, how, access, risks, milestones, open questions.",
  "Out-of-scope list stops creep; new asks go to phase 2.",
  "AI targets: measured on their data + review path; never 100%.",
  "Acceptance criteria in Given/When/Then.",
  "Estimates as ranges with assumptions; demo at every milestone."
 ]
},
{
 id: "tradeoffs",
 title: "Explaining trade-offs to non-technical people",
 level: "Intermediate",
 one: "Clients decide between options all the time. Your job is to lay out <b>2–3 real options</b> with their <b>cost, time, risk and quality</b> in plain words, give a <b>recommendation</b>, and let them choose.",
 why: "Clients trust engineers who explain choices clearly and honestly. It's also what interviewers test in “tell me about a decision” and case questions.",
 steps: [
  { h: "Options, not a single answer",
    p: ["For most decisions, present: a <b>quick/cheap</b> option, a <b>balanced</b> option, and a <b>thorough</b> option. Same structure for each, so they're easy to compare."],
    code: `                 A: Rules + review     B: LLM extraction + review     C: Custom fine-tuned model
Automation        ~35% of emails        ~70% of emails                  ~80% (after 3 months data)
Time to launch    1 week                3–4 weeks                       3 months
Running cost      ~₹0                   ~₹9,000/month                   ~₹4,000/month + retraining
Risk              breaks on new formats  needs eval + review queue       needs lots of labelled data
Recommendation                          ✔ start here, revisit C at 6 months`, lang: "text" },
  { h: "Translate tech into their terms",
    p: ["Not “p95 latency is 4 seconds” but “most answers appear in about a second; a few take up to 4”. Not “recall 82%” but “it catches about 8 of every 10 urgent tickets, so we keep a quick human check on the rest”. Talk about time, money, risk and customers."] },
  { h: "Show the cost maths",
    p: ["Simple numbers build trust. Compare options over a year:"],
    code: `options = {
    "A rules": {"build": 60_000, "monthly": 0, "hours_saved": 205},
    "B LLM":   {"build": 220_000, "monthly": 9_000, "hours_saved": 410},
}
hourly = 450
for name, o in options.items():
    yearly_saving = o["hours_saved"] * hourly * 12
    yearly_cost = o["build"] + o["monthly"] * 12
    payback_months = o["build"] / (o["hours_saved"] * hourly - o["monthly"])
    print(f"{name}: saves ₹{yearly_saving:,.0f}/yr, costs ₹{yearly_cost:,.0f} in year 1, pays back in {payback_months:.1f} months")` },
  { h: "Disagreeing well",
    p: ["If a client wants something risky (“skip the review step, go fully automatic”), say what could happen in concrete terms, propose a safer path to the same goal (“full auto for the 60% of emails with high confidence, review for the rest; we'll widen it as accuracy is proven”), and document the decision if they still choose the risky way."] },
  { h: "Write decisions down",
    p: ["Keep a short decision log: date, decision, options considered, why, who agreed. Months later, when someone asks “why did we do it this way?”, you have the answer."] }
 ],
 mistakes: [
  "Presenting only the option you prefer.",
  "Jargon: “embeddings”, “p95”, “idempotency” in a business meeting.",
  "Hiding risks to get a yes.",
  "No recommendation: clients want your expert opinion, then the final say."
 ],
 practice: [
  { q: "Explain “we need a review queue” to a non-technical operations manager in two sentences.", a: "“The system will handle most emails on its own, but a few will be unusual or unclear. Those go to a short list where your team checks them in about 30 seconds each, so nothing wrong ever reaches a customer.”" },
  { q: "Option B saves 410 hours/month at ₹450/hour and costs ₹9,000/month to run. What's the net monthly saving?", code: `print(f"₹{410 * 450 - 9_000:,}")` }
 ],
 check: [
  ["Best way to present a decision?", ["One option", "2–3 options compared on cost, time, risk, quality + a recommendation", "A technical deep dive", "Let them figure it out"], 1, "Comparable options with your view."],
  ["“Recall 82%” for a client becomes…", ["Recall 82%", "It catches about 8 of every 10 urgent tickets", "It's 82% fast", "82% cheaper"], 1, "Their terms."],
  ["Client insists on a risky shortcut. You…", ["Refuse to work", "Explain concrete risks, offer a safer path, document their decision", "Do it silently", "Hide the risk"], 1, "Honest and professional."]
 ],
 remember: [
  "2–3 options in the same format: impact, time, cost, risk.",
  "Always give a recommendation; the client decides.",
  "Speak in time, money, risk and customers; no jargon.",
  "Show simple payback maths.",
  "Disagree with concrete risks + safer alternative; keep a decision log."
 ]
},
{
 id: "demos",
 title: "Demos, pilots and handover",
 level: "Intermediate",
 one: "A good <b>demo</b> shows the client's own problem solved with their own data. A <b>pilot</b> proves it in real use with a few people. A clean <b>handover</b> lets their team run it without you.",
 why: "Deals are won in demos, trust is built in pilots, and long-term success (and referrals) comes from good handovers. Forward-deployed engineers do all three.",
 steps: [
  { h: "Plan the demo story",
    p: ["Structure: <b>1.</b> the problem in their words and numbers (30 s) <b>2.</b> live run on <b>their real examples</b> (including one messy one) <b>3.</b> what happens when it's unsure (the review path) <b>4.</b> the results on the eval set <b>5.</b> next steps. Keep it under 10 minutes; leave time for questions."] },
  { h: "Rehearse and have a backup",
    p: ["Run the demo end to end beforehand on the same network and accounts. Have a recorded video or screenshots in case the live system or Wi-Fi fails. Never demo something you've never run."] },
  { h: "Pilot: prove it in real use",
    p: ["Pick 2–5 friendly users and a few weeks. Agree the success measure in advance. Collect every correction and complaint; review weekly; fix and re-measure. Share a short weekly update:"],
    code: `PILOT UPDATE · week 2
Processed: 1,840 emails · auto-drafted: 1,232 (67%, target 70%) · lost: 0
Review time: 24 s average (target ≤ 30 s)
Top issue: emails with 2 delivery addresses (41 cases) → fix shipped Thursday
Next week: add Hindi product names; start 3rd user on Monday
Need from you: confirm go-live date with finance`, lang: "text" },
  { h: "Handover",
    p: ["A runbook (how to check it's healthy, common problems and fixes), access and credentials transferred properly, monitoring and alerts pointed at their team, a short training session recorded, and an architecture page. Their team should be able to restart it, read the logs and handle the DLQ without calling you."] },
  { h: "Measure after launch",
    p: ["Report the success number from the spec after 30 days of real use, compared with the starting point. This is the story you'll tell in your next interview: problem, what you built, the measured result."],
    code: `before = {"hours": 587, "error_rate": 0.030}
after = {"hours": 198, "error_rate": 0.008}
print(f"staff hours: {before['hours']} -> {after['hours']} per month ({1 - after['hours'] / before['hours']:.0%} less)")
print(f"error rate: {before['error_rate']:.1%} -> {after['error_rate']:.1%}")` }
 ],
 mistakes: [
  "Demoing on perfect sample data the client never sees in reality.",
  "Hiding failure cases; clients trust you more when you show the review path.",
  "Pilots with no agreed success measure.",
  "Leaving without a runbook, so every problem becomes a call to you."
 ],
 practice: [
  { q: "Write the 5 parts of a demo script for an invoice-extraction tool.", a: "1) “Your team types 600 invoices a month, about 90 hours.” 2) Live: drop in 3 of their real invoices, including a blurry scan, show extracted fields. 3) Show a doubtful invoice going to review with the reason. 4) Show accuracy on their 50-invoice test set. 5) Propose a 3-week pilot with two clerks, success = 70% no-edit and ≤ 30 s review." },
  { q: "List 5 things that must be in a handover runbook.", a: "How to check health (dashboard, /health); how to read logs and find one order; how to handle the DLQ and retry; how to rotate the API keys; who to contact for each external system; how to deploy/roll back; known issues and their fixes." }
 ],
 check: [
  ["Best demo data?", ["Perfect made-up samples", "The client's own real examples, including messy ones", "Public datasets", "None, just slides"], 1, "Their problem, their data."],
  ["What makes a pilot useful?", ["Many users from day one", "A few users, a fixed period, an agreed success measure, weekly review", "No measurement", "Only managers"], 1, "Small, measured, iterative."],
  ["A good handover lets the client…", ["Call you for everything", "Run, monitor and fix common issues without you", "Rewrite it", "Turn it off"], 1, "Independence."]
 ],
 remember: [
  "Demo: their problem + their real (messy) data + the review path + results + next steps.",
  "Rehearse; keep a recorded backup.",
  "Pilot: few users, fixed time, agreed measure, weekly updates.",
  "Handover: runbook, access, alerts, training, architecture page.",
  "Report the measured result after 30 days."
 ]
},
{
 id: "case-practice",
 title: "Case practice: a full client scenario",
 level: "Interview",
 one: "Practise the whole flow on one realistic case: discovery questions, numbers, options with a recommendation, a short spec, risks, and how you'd measure success. Forward-deployed interviews often run exactly like this.",
 why: "Case interviews test judgement, communication and technical sense together. Working through one fully builds a structure you can reuse for any case.",
 steps: [
  { h: "The case",
    p: ["<i>A furniture retailer with 40 stores gets 1,500 customer messages a day (WhatsApp, email, website chat): delivery dates, damaged items, returns, product questions. 25 support staff answer them. Average first reply takes 9 hours and customers are unhappy. The CEO asks: “Can AI fix this?”</i>"] },
  { h: "1. Discovery questions you'd ask",
    code: `What are the top 5 message types and their share? (ask for 200 real messages to label)
Which systems hold orders, deliveries and returns? APIs available?
What can staff do today that an assistant must never do (refunds, discounts)?
Peak days? Languages used (English, Hindi, Malayalam)?
What does "fixed" mean: first reply time, resolution time, satisfaction score?
Who owns the policies (returns, warranty) and how often do they change?`, lang: "text" },
  { h: "2. Numbers",
    code: `messages_per_day = 1_500
share = {"where is my delivery": 0.40, "damaged item": 0.15, "returns": 0.15, "product questions": 0.20, "other": 0.10}
automatable = {"where is my delivery": 0.85, "returns": 0.60, "product questions": 0.70, "damaged item": 0.20, "other": 0.0}

auto = sum(messages_per_day * share[k] * automatable.get(k, 0) for k in share)
print(f"messages the assistant could fully answer: ~{auto:,.0f}/day ({auto / messages_per_day:.0%})")
print(f"left for staff: ~{messages_per_day - auto:,.0f}/day")`,
    note: "The estimates come from labelling the 200 sample messages. They point to delivery-status questions as the biggest, safest win." },
  { h: "3. Options and recommendation",
    code: `A  Auto-reply only to "where is my delivery" using the delivery system's API.     2–3 weeks · low risk
B  A + an assistant drafting replies for returns and product questions (RAG over      6–8 weeks · medium risk
   policies and catalogue); staff approve drafts; damaged items routed to a team.
C  Fully automatic assistant for everything, including refunds.                       3+ months · high risk

Recommend: A now (quick visible win on 40% of volume), then B. Not C: refunds and
damage claims need human judgement and photo checks.`, lang: "text" },
  { h: "4. Risks and how you'd handle them",
    p: ["Wrong delivery dates (source data stale) → show the courier's latest status and time; link to tracking. Policy answers going out of date → RAG over the live policy pages, with an owner. Angry customers → detect frustration and route to a human fast. Languages → evaluate on real Hindi/Malayalam messages before enabling. Privacy → verify the customer (order number + phone) before showing order details."] },
  { h: "5. Success measures",
    p: ["Median first reply time (9 h → under 5 min for automated types), share of messages resolved without staff, customer satisfaction on resolved chats, escalation rate, and zero wrong refund/discount promises. Weekly report during the pilot."] }
 ],
 mistakes: [
  "Answering “yes, build a chatbot” without questions or numbers.",
  "Automating the riskiest category first (refunds) instead of the biggest safe one.",
  "No plan for verification, languages or angry customers.",
  "Success defined as “launched” instead of a customer-facing number."
 ],
 practice: [
  { q: "Practise: a logistics company's drivers call dispatch 300 times a day to ask “where's my next pickup?”. Give options A/B/C and a recommendation in 5 lines.", a: "A: SMS/WhatsApp the next pickup automatically when a job is assigned (1–2 weeks, low risk). B: A + a driver chat assistant that answers schedule questions from the dispatch system (4–6 weeks). C: Voice assistant for calls (2–3 months, higher risk with accents/noise). Recommend A first (removes most calls fast), measure call volume, then B." },
  { q: "In the furniture case, the CEO says “just make it fully automatic.” How do you respond?", a: "Agree on the goal (fast replies), explain the concrete risk (a wrong refund or damage decision costs money and reputation), and offer the path: fully automatic for delivery status now (40% of volume), drafts-with-approval for returns, and widen automation category by category as measured accuracy proves it. Record the decision." }
 ],
 check: [
  ["Where should automation start in the furniture case?", ["Refunds", "High-volume, low-risk questions like delivery status", "Everything at once", "Damaged items"], 1, "Biggest safe win first."],
  ["Why label 200 real messages early?", ["Busywork", "To size categories and estimate what can be automated", "For marketing", "Legal"], 1, "Numbers drive the plan."],
  ["A good success measure here is…", ["The app launched", "Median first reply time and resolution without staff", "Lines of code", "Number of meetings"], 1, "Customer-facing outcomes."]
 ],
 remember: [
  "Case flow: questions → numbers → options A/B/C → recommendation → risks → success measures.",
  "Start with the biggest low-risk slice; keep humans on judgement calls.",
  "Label real samples to size the problem.",
  "Plan for verification, languages, escalation and privacy.",
  "Success = customer/business numbers, reported weekly."
 ]
}
];
