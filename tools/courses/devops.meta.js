module.exports = {
 title: "Git, Docker, CI/CD & Cloud",
 description: "Ship software like a team: Git branches and pull requests, Docker and Compose, CI/CD with GitHub Actions, AWS basics with least-privilege IAM, Kubernetes essentials, and observability.",
 lessons: [
  ["git", "Git for teams: branches, merges, PRs"],
  ["docker", "Docker for developers"],
  ["ci-cd", "CI/CD with GitHub Actions"],
  ["aws", "Cloud basics with AWS"],
  ["kubernetes", "Kubernetes essentials"],
  ["observability", "Logs, metrics, traces and alerts"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["git add does what?", ["Uploads", "Stages changes for the next commit", "Creates a branch", "Merges"], 1, "Then commit."],
  ["Safe undo of a pushed commit on a shared branch?", ["reset --hard + force push", "git revert", "Delete the repo", "stash"], 1, "Revert adds an undo commit."],
  ["A merge conflict means…", ["Git crashed", "Both branches changed the same lines; you choose the result", "The repo is corrupt", "A network error"], 1, "Edit, add, commit."],
  ["A good pull request is…", ["Huge", "Small, focused, described and tested", "Pushed to main directly", "Undescribed"], 1, "Easy to review."],
  ["Image vs container?", ["Same", "Image = package; container = running copy", "Container = recipe", "Image = VM"], 1, "Many containers per image."],
  ["Inside Compose, the API reaches Postgres at…", ["localhost", "The service name (db)", "127.0.0.1", "The host IP"], 1, "DNS by service name."],
  ["What keeps database data across container removal?", ["Nothing", "A volume", "An image", "A port"], 1, "Mount a volume."],
  ["Multi-stage builds give…", ["Bigger images", "Small runtime images without build tools", "Slower builds only", "Nothing"], 1, "Build, then copy the result."],
  ["CI should run on…", ["Only main", "Every push and PR", "Weekly", "Manually"], 1, "Before merge."],
  ["Where do deploy secrets go?", ["Workflow YAML", "Repository/environment secrets", "README", "Comments"], 1, "Encrypted settings."],
  ["Why tag images with the commit SHA?", ["Short names", "Know exactly what runs; precise rollback", "Docker requires it", "Speed"], 1, "Traceability."],
  ["Where do uploaded files usually go on AWS?", ["EC2 disk", "S3", "SQS", "DynamoDB"], 1, "Object storage."],
  ["Least privilege means…", ["Admin for all", "Only the actions/resources needed", "No IAM", "Shared keys"], 1, "Small blast radius."],
  ["Apps on AWS should get credentials from…", ["Hard-coded keys", "An IAM role", "The root account", "Email"], 1, "Temporary credentials."],
  ["Kubernetes object that keeps N pods running?", ["Service", "Deployment", "ConfigMap", "Ingress"], 1, "Desired replicas."],
  ["Stable name + load balancing to pods?", ["Deployment", "Service", "Secret", "Job"], 1, "Pods come and go."],
  ["OOMKilled means…", ["Network error", "Exceeded the memory limit", "Image missing", "Probe failed"], 1, "Fix usage or limits."],
  ["The four golden signals?", ["CPU, RAM, disk, network", "Latency, traffic, errors, saturation", "Logs, metrics, traces, alerts", "p50–p99"], 1, "Watch them first."],
  ["An error budget is…", ["Money", "Allowed failures under the SLO", "A log quota", "A bug list"], 1, "Balances speed and reliability."],
  ["Why not user ids as metric labels?", ["Privacy only", "High cardinality explodes storage", "Not allowed", "Slow graphs"], 1, "Use logs/traces."]
 ]
};
