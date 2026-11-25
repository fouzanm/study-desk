module.exports = {
 title: "Reliable Integrations",
 description: "Connect systems so they don't break: integration patterns, queues and workers, webhook intake, retries and dead-letter queues, testing against failing APIs, and monitoring.",
 lessons: [
  ["patterns", "Integration patterns: how systems talk"],
  ["queue-worker", "Queues and workers"],
  ["webhook-intake", "A reliable webhook intake"],
  ["retries-dlq", "Retries, DLQs and idempotency keys"],
  ["failing-api-tests", "Testing against failing APIs"],
  ["logging-health", "Logging, monitoring and health checks"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["When should a call be synchronous?", ["Always", "When the user needs the answer now", "For nightly jobs", "Never"], 1, "Otherwise prefer async."],
  ["What is a polling watermark?", ["A logo", "The last processed timestamp/id", "An error", "A queue name"], 1, "Fetch only newer items; advance after success."],
  ["Why a nightly reconciliation job?", ["Speed", "To catch anything webhooks or workers missed", "Required by REST", "To clear logs"], 1, "Events can be lost."],
  ["Where should field mapping between systems live?", ["Spread everywhere", "One explicit, tested place", "In comments", "In the database only"], 1, "And fail loudly on unknown values."],
  ["Main benefit of a queue?", ["Exactly-once delivery", "Producers don't wait; spikes and downtime are absorbed", "No code", "Faster CPU"], 1, "Decoupling."],
  ["At-least-once delivery means workers must be…", ["Fast", "Idempotent", "Single", "Synchronous"], 1, "Duplicates will happen."],
  ["How do several Postgres workers avoid grabbing the same job?", ["Luck", "SELECT … FOR UPDATE SKIP LOCKED", "UNION", "A bigger table"], 1, "Row locks that skip claimed jobs."],
  ["A webhook intake endpoint should…", ["Do all processing", "Verify, store raw event, enqueue, return 200", "Email the team", "Return 500 on duplicates"], 1, "Fast and safe."],
  ["Why store raw events?", ["Disk is cheap", "To replay after fixing bugs", "HTTP requires it", "Style"], 1, "Replay saves the day."],
  ["Respond to a duplicate webhook with…", ["500", "200 'duplicate'", "401", "Nothing"], 1, "Stops retries."],
  ["Which error should be retried?", ["422", "503", "404", "400"], 1, "Temporary errors only."],
  ["Jobs that keep failing should go to…", ["/dev/null", "A dead-letter queue with the reason", "The same queue forever", "Email"], 1, "For a human to fix and retry."],
  ["Why send an Idempotency-Key on a payment POST?", ["Speed", "A retry won't create a second payment", "Encryption", "Compression"], 1, "Same key → same result."],
  ["How do you make API-calling code testable?", ["Call production in tests", "Inject the client/transport and use a fake", "Print more", "Use async"], 1, "httpx.MockTransport."],
  ["Why fake sleep in retry tests?", ["Style", "Tests stay instant and you can check waits", "pytest requires it", "To slow tests"], 1, "Fast and checkable."],
  ["Contract tests check…", ["UI", "The real API (sandbox) still matches what your code expects", "Load", "Prices"], 1, "Catch drift."],
  ["Why JSON logs?", ["Pretty", "Searchable and countable by field", "Smaller", "Required"], 1, "Logs as data."],
  ["A correlation id lets you…", ["Encrypt logs", "Follow one event across all services", "Skip logs", "Speed up queues"], 1, "One search, whole journey."],
  ["Two key integration health numbers?", ["CPU and RAM", "Queue lag and DLQ size", "Lines of code", "Workers"], 1, "Alert on these."],
  ["A readiness check should…", ["Always say ok", "Check key dependencies and return 503 if one is down", "Be removed", "Restart the server"], 1, "Honest health."]
 ]
};
