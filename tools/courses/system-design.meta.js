module.exports = {
 title: "System Design",
 description: "Design systems the way interviews and clients expect: a clear approach, scaling and caching, databases at scale, events and messaging, monolith vs microservices and reliability, with a full worked design.",
 lessons: [
  ["approach", "How to approach a design question"],
  ["scaling", "Load balancers, caching, statelessness"],
  ["databases-scale", "Replicas, sharding, SQL vs NoSQL"],
  ["messaging", "Messaging and event-driven design"],
  ["microservices", "Monolith vs microservices, reliability"],
  ["practice", "Practice: design an order sync"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["First step in a design question?", ["Draw boxes", "Clarify requirements and scale", "Pick Kafka", "Write code"], 1, "Understand before designing."],
  ["Roughly how many seconds in a day?", ["8,640", "86,400", "864,000", "3,600"], 1, "Round to ~100k for quick maths."],
  ["Why do back-of-the-envelope estimates?", ["To impress", "The numbers decide how much design is needed", "Required", "Fun"], 1, "Avoid over- or under-engineering."],
  ["What makes horizontal scaling work?", ["Bigger servers", "Stateless app servers behind a load balancer", "More RAM", "Sticky files"], 1, "Any server handles any request."],
  ["Users log out randomly after adding a 2nd server. Likely cause?", ["Bad CSS", "Sessions stored in each server's memory", "DNS", "Too much RAM"], 1, "Move sessions to Redis or tokens."],
  ["Hardest part of caching?", ["Buying Redis", "Invalidation when data changes", "Naming keys", "Hit rate maths"], 1, "Stale data is the risk."],
  ["First database scaling step?", ["Sharding", "Better queries and indexes", "NoSQL", "Microservices"], 1, "Cheapest wins first."],
  ["Replication lag causes…", ["Faster reads", "Stale reads right after a write", "Data loss always", "Nothing"], 1, "Read your own writes from primary."],
  ["A good shard key…", ["Creates hot spots", "Spreads load evenly and keeps related data together", "Is the date", "Is random per row"], 1, "Even and cohesive."],
  ["Consistent hashing means adding a node moves…", ["All keys", "About 1/N of keys", "No keys", "Half the keys"], 1, "Minimal reshuffling."],
  ["Default database for invoices and orders?", ["Key-value", "Relational (PostgreSQL)", "Graph", "Search engine"], 1, "Relational data, transactions, reporting."],
  ["Queue vs pub/sub?", ["Same", "Queue: one consumer per message; pub/sub: each group gets every message", "Pub/sub is a database", "Queues fan out"], 1, "Distribution vs fan-out."],
  ["The outbox pattern solves…", ["Slow queries", "DB writes and event publishing getting out of sync", "Caching", "Auth"], 1, "Event row in the same transaction."],
  ["A saga handles failure by…", ["Ignoring it", "Running compensating steps for completed ones", "Rolling back across services", "Retrying forever"], 1, "Undo with compensations."],
  ["Events should be named…", ["As commands", "In past tense, e.g. OrderPlaced", "Randomly", "By date"], 1, "Something that happened."],
  ["Five services at 99.9% in a chain?", ["99.9%", "About 99.5%", "100%", "90%"], 1, "Availabilities multiply."],
  ["99.9% availability allows about…", ["8.8 hours down a year", "1 minute a year", "1 week a year", "30 days a year"], 0, "Three nines ≈ 8.8 h."],
  ["What does a circuit breaker do?", ["Load balances", "Stops calling a failing dependency for a while", "Encrypts", "Caches"], 1, "Fail fast, recover later."],
  ["Best architecture for a 4-person team's new product?", ["20 microservices", "A modular monolith", "No backend", "Mainframe"], 1, "Split later with a reason."],
  ["In the order-sync design, why a queue?", ["Fashion", "Peaks exceed the ERP's rate limit and the ERP can be down", "Cheaper hosting", "Required by webhooks"], 1, "Numbers justified it."]
 ]
};
