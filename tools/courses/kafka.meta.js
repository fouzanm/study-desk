module.exports = {
 title: "Kafka & Streaming",
 description: "Batch vs streaming, Kafka topics, partitions and consumer groups, delivery guarantees, stream processing, CDC with Debezium, ending with a real-time order pipeline.",
 lessons: [
  ["batch-stream", "Batch vs streaming"],
  ["concepts", "Kafka concepts: topics, partitions, consumer groups"],
  ["guarantees", "Delivery guarantees and idempotent consumers"],
  ["hands-on", "Hands-on: producing, consuming and stream processing"],
  ["cdc", "Change data capture (CDC)"],
  ["build", "Project: a real-time order pipeline"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Streaming is justified when…", ["Data is small", "A system must react within seconds", "Reports are monthly", "Always"], 1, "Latency need."],
  ["Event time is…", ["When it was processed", "When it actually happened", "The offset", "The retention"], 1, "Group by it for correctness."],
  ["A watermark decides…", ["Encryption", "How long to wait for late events before closing windows", "Partition count", "Consumer count"], 1, "Late data handling."],
  ["Kafka guarantees ordering…", ["Across the whole topic", "Within a partition", "Never", "Per consumer group"], 1, "Key → partition."],
  ["What decides an event's partition?", ["Time", "Its key (hash)", "Its size", "The consumer"], 1, "Same key, same partition."],
  ["3 partitions and 5 consumers in one group: how many idle?", ["0", "2", "3", "5"], 1, "One consumer per partition."],
  ["Consumer lag is…", ["Network latency", "Events produced but not yet processed", "Broker CPU", "Retention period"], 1, "Health metric."],
  ["A compacted topic keeps…", ["Everything forever", "The latest event per key", "Nothing", "Only deletes"], 1, "Current state."],
  ["Commit then process gives…", ["At-least-once", "At-most-once", "Exactly-once", "Never-once"], 1, "Crash = loss."],
  ["Process then commit gives…", ["At-most-once", "At-least-once", "Exactly-once always", "No delivery"], 1, "Crash = redelivery."],
  ["The practical way to handle duplicates?", ["Hope", "Idempotent consumers keyed by unique event ids", "More brokers", "Shorter retention"], 1, "Upsert/dedupe."],
  ["acks=all + enable.idempotence on producers prevent…", ["Consumer bugs", "Loss on broker failure and duplicates from producer retries", "Schema drift", "Lag"], 1, "Producer safety."],
  ["A malformed event keeps failing. Best handling?", ["Retry forever", "Send to a dead-letter topic and continue", "Delete the topic", "Restart Kafka"], 1, "Don't block the partition."],
  ["enable.auto.commit=True with slow processing risks…", ["Duplicates only", "Losing events on crash", "Faster processing", "Nothing"], 1, "Offsets committed too early."],
  ["Spark Structured Streaming needs a checkpoint location for…", ["Logging", "Recovering progress and state after failure", "Encryption", "Schemas"], 1, "Durable storage."],
  ["Unbounded state in stream processing causes…", ["Faster jobs", "Memory growth until failure", "Better accuracy", "Nothing"], 1, "Use windows/TTL."],
  ["Log-based CDC captures…", ["Only inserts", "Inserts, updates and deletes in commit order", "Only schema changes", "Only snapshots"], 1, "From the transaction log."],
  ["Why is updated_at polling weaker than CDC?", ["It's faster", "Misses hard deletes and intermediate changes", "Needs Kafka", "Can't filter"], 1, "Gaps."],
  ["Debezium event op 'u' means…", ["Unknown", "Update", "Undo", "Upload"], 1, "c/u/d/r."],
  ["Applying CDC events safely requires…", ["Plain INSERTs", "Upserts guarded by LSN/version + delete handling", "Random order", "Truncating daily"], 1, "Newer wins, deletes flagged."],
  ["An unconsumed Postgres replication slot causes…", ["Faster queries", "WAL piling up and filling the source disk", "Nothing", "Lost schemas"], 1, "Monitor slots."],
  ["Lag grows on one partition only. Likely cause?", ["Too many brokers", "Hot key, poison message or a stuck consumer", "Retention", "Compression"], 1, "Investigate that partition."]
 ]
};
