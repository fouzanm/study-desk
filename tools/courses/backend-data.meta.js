module.exports = {
 title: "Databases & Caching for Backends",
 description: "Data in real applications: modelling with constraints, ORMs and the N+1 problem, caching with Redis, NoSQL and when to use it, race conditions and locking, and background jobs.",
 lessons: [
  ["modelling", "Modelling data for an application"],
  ["orm-n1", "ORMs and the N+1 query problem"],
  ["redis", "Caching with Redis"],
  ["nosql", "NoSQL: document and key-value"],
  ["concurrency", "Race conditions and locking"],
  ["background-jobs", "Background jobs and scheduled tasks"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["A many-to-many relationship needs…", ["A list column", "A link table", "Two databases", "A view"], 1, "e.g. staff_services."],
  ["Two time ranges overlap when…", ["start1 = start2", "start1 < end2 AND end1 > start2", "end1 = end2", "Never"], 1, "Memorise it."],
  ["Why soft-delete business records?", ["Speed", "Keep history for audits and reports", "SQL requires it", "Less storage"], 1, "History matters."],
  ["N+1 queries means…", ["One query per page", "One list query plus one per row", "N joins", "A missing index"], 1, "Lazy loading in a loop."],
  ["Fix N+1 in SQLAlchemy with…", ["More RAM", "selectinload / joinedload", "Raw strings", "Caching everything"], 1, "Eager loading."],
  ["Need totals per customer?", ["Load objects and sum in Python", "Aggregate in SQL", "Cache first", "Use JSON"], 1, "Let the DB do it."],
  ["Cache-aside on a miss…", ["Returns nothing", "Loads from DB and stores in cache with a TTL", "Deletes the DB row", "Waits"], 1, "Then cache hits."],
  ["After updating a product price you should…", ["Nothing", "Invalidate the cached entry", "Restart Redis", "Raise the TTL"], 1, "Avoid stale prices."],
  ["Why INCR for rate limiting?", ["Style", "Atomic across many servers", "Faster than GET", "Required"], 1, "No race conditions."],
  ["Is Redis a safe single source of truth?", ["Yes always", "No; keep the truth in your database", "Only with TTLs", "Only for money"], 1, "It's a cache first."],
  ["In MongoDB, embed…", ["Everything", "Data read together and owned by the parent", "Shared customers", "Nothing"], 1, "Reference shared data."],
  ["Key-value stores are fast when you…", ["Scan", "Query by the designed key", "Join", "Use SQL"], 1, "Design keys from queries."],
  ["Best default for an accounting system?", ["Key-value", "Relational", "Wide-column", "Search engine"], 1, "Relationships and transactions."],
  ["A race condition is…", ["A fast loop", "Timing-dependent interference between concurrent operations", "A deadlock only", "A slow query"], 1, "Lost updates, double bookings."],
  ["Safest way to sell the last unit?", ["Check in code then update", "UPDATE … WHERE qty > 0 and check rowcount", "Sleep first", "Cache the stock"], 1, "Atomic conditional update."],
  ["Optimistic locking uses…", ["SELECT FOR UPDATE", "A version check on update", "threading.Lock", "Retries only"], 1, "0 rows = conflict."],
  ["Python threading.Lock across 3 app servers…", ["Works", "Doesn't help; use DB locks or atomic updates", "Works on Linux", "Works with async"], 1, "It's per process."],
  ["Where should slow email + PDF work run?", ["In the request", "In a background job", "In the browser", "In a trigger"], 1, "Keep requests fast."],
  ["A long task's request should return…", ["Nothing", "202 Accepted with a job id", "500", "A redirect loop"], 1, "Then poll or notify."],
  ["Scheduled jobs must be…", ["Fast only", "Idempotent, overlap-safe, monitored", "Hourly", "Written in Bash"], 1, "Safe and observable."]
 ]
};
