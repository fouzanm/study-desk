module.exports = {
 title: "Integration Hub",
 description: "Portfolio project: a FastAPI service that turns shop webhooks into Odoo sales orders, with HMAC intake, a Postgres-backed worker queue, retries, dead-letter and replay, failure tests and CI.",
 lessons: [
  ["setup", "Repo, FastAPI, PostgreSQL, Docker Compose"],
  ["intake", "Webhook intake with HMAC"],
  ["worker", "Queue + worker to the external API"],
  ["reliability", "Retries, dead-letter, idempotency"],
  ["tests-ci", "Tests and CI"],
  ["ship", "Ship: deploy + failure-scenarios README"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Why store webhooks in an inbox before calling Odoo?", ["Style", "Reply fast and never lose events when Odoo is down", "FastAPI requires it", "Cheaper"], 1, "Decouple intake and delivery."],
  ["Configuration should come from…", ["Hardcoded constants", "Environment variables via a Settings class", "Git", "Comments"], 1, "Fail fast if missing."],
  ["The webhook HMAC is computed over…", ["Parsed JSON", "The exact raw body bytes", "Headers", "The URL"], 1, "Raw bytes."],
  ["Comparing signatures should use…", ["==", "hmac.compare_digest", "in", "startswith"], 1, "Constant time."],
  ["A forged signature gets…", ["200", "401 and nothing stored", "500", "Stored as pending"], 1, "Reject."],
  ["A duplicate webhook gets…", ["500", "200 and is not stored again", "404", "Stored twice"], 1, "Stop provider retries."],
  ["What prevents duplicate inbox rows?", ["Sorting", "Primary key on the provider's event id", "Retries", "Logs"], 1, "Idempotent insert."],
  ["Several workers share the Postgres queue safely using…", ["LIMIT 1", "FOR UPDATE SKIP LOCKED", "TRUNCATE", "Sleep"], 1, "Row locks, skip locked."],
  ["Why find-or-create by client_order_ref in Odoo?", ["Reporting", "Retries after a crash don't create a second order", "Required field", "Speed"], 1, "Idempotent push."],
  ["Odoo's (0, 0, {...}) command means…", ["Delete line", "Create a new line", "Update line", "Unlink"], 1, "One2many create."],
  ["A worker loop should…", ["Crash on first error", "Log and continue; shut down gracefully on SIGTERM", "Never sleep", "Run in the API process"], 1, "Resilient."],
  ["Which error should be retried?", ["Unknown SKU", "Odoo timeout / 503", "Invalid payload", "401"], 1, "Transient."],
  ["An order with no lines should…", ["Retry forever", "Dead-letter immediately with the reason", "Be dropped silently", "Create an empty order"], 1, "Permanent."],
  ["Why add jitter to backoff?", ["Fun", "Avoid all retries hitting Odoo at once", "Faster", "Required by HTTP"], 1, "Thundering herd."],
  ["After max attempts…", ["Retry forever", "Dead-letter and alert", "Delete", "Ignore"], 1, "Visible failure."],
  ["Replay of a dead letter must be safe because…", ["Humans are careful", "The push is idempotent", "Odoo dedupes", "It runs once"], 1, "Find-or-create."],
  ["Unit tests use a fake Odoo because…", ["Odoo is slow and real outages can't be scheduled", "Odoo forbids tests", "Cheaper", "No reason"], 0, "Deterministic failure simulation."],
  ["CI gets a real database via…", ["Production", "A Postgres service container", "Excel", "None"], 1, "Service containers."],
  ["Which test proves no duplicate orders after a worker crash?", ["Signature test", "Push the same order twice → one Odoo order", "Health test", "Lint"], 1, "Idempotency."],
  ["Most important alerts?", ["CPU", "New dead letters, growing backlog, old pending events", "Disk only", "Logins"], 1, "Orders at risk."],
  ["Why log the event id on every line?", ["Required", "Trace one order end to end", "Smaller logs", "Speed"], 1, "Debuggability."],
  ["Centrepiece of this project's README?", ["Folder tree", "Failure-scenarios table linked to tests", "License", "Credits"], 1, "Designed for failure."]
 ]
};
