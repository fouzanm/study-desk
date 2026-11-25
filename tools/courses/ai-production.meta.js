module.exports = {
 title: "Shipping AI to Production",
 description: "Take AI features from demo to production: Docker, deployment and config, tracing and monitoring, fallbacks and timeouts, CI with eval gates and gradual rollouts.",
 lessons: [
  ["docker-ai", "Packaging an AI service with Docker"],
  ["deploy", "Deploying: where and how"],
  ["tracing", "Tracing and monitoring LLM apps"],
  ["fallbacks", "Fallbacks, timeouts, graceful degradation"],
  ["ci-evals", "CI/CD with eval gates"],
  ["ship", "Project: ship a production-ready AI service"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Image vs container?", ["Same", "Image = packaged snapshot; container = running instance", "Container = recipe", "Image = VM"], 1, "One image, many containers."],
  ["How should secrets reach a container?", ["Baked into the image", "At run time via env/secret store", "In the Dockerfile", "In git"], 1, "Never in images."],
  ["Why copy requirements.txt and install before copying code?", ["Required", "Layer caching makes rebuilds fast", "Security", "Smaller image"], 1, "Code changes don't reinstall libraries."],
  ["Run containers as…", ["root", "A non-root user", "Any user", "Administrator"], 1, "Least privilege."],
  ["Strong default for deploying an AI API?", ["FTP", "Serverless containers (Cloud Run, App Runner)", "A laptop", "Cron"], 1, "Simple and scalable."],
  ["Which setting often needs raising for LLM services?", ["Port", "Request timeout", "Image tag", "Region"], 1, "LLM calls can be slow."],
  ["Why validate config at start-up?", ["Style", "Missing settings fail the deploy, not user requests", "Speed", "Docker requires it"], 1, "Fail fast."],
  ["Data residency matters because…", ["Speed", "Some clients must keep data (incl. prompts) in a region or their cloud", "Cost only", "It doesn't"], 1, "Ask early."],
  ["What is a span?", ["A whole request", "One timed step in a request", "A log line", "A metric"], 1, "Traces contain spans."],
  ["Why track tokens per request?", ["Fun", "See cost per request and catch runaways", "HTTP needs it", "No reason"], 1, "Costs creep silently."],
  ["LLM quality problems usually show as…", ["500 errors", "Thumbs-down, “I don't know” rate, eval scores", "CPU spikes", "Disk usage"], 1, "Watch quality signals."],
  ["Provider overloaded twice. Next?", ["Retry forever", "Fall back to a backup model/provider", "Show the raw error", "Restart"], 1, "Fallback chain."],
  ["Why a total request deadline?", ["Style", "Retries and fallbacks can't make users wait forever", "Billing", "Required"], 1, "Bound the wait."],
  ["Before relying on a backup model…", ["Nothing", "Run your evals on it", "Raise temperature", "Hide it"], 1, "It behaves differently."],
  ["When everything fails, the product should…", ["Spin forever", "Degrade gracefully: cache, search results, queue or human", "Show a stack trace", "Crash"], 1, "Plan it in advance."],
  ["What does an eval gate do?", ["Deploys faster", "Fails the build if quality regresses", "Writes prompts", "Skips tests"], 1, "Quality as CI."],
  ["Why separate unit tests from evals in CI?", ["Style", "Fast free deterministic checks vs slower model-behaviour checks", "Required", "No reason"], 1, "Fast feedback, clear failures."],
  ["How to keep evals stable in CI?", ["Temperature 1", "Fixed dataset, temperature 0, reviewed baselines", "New data each run", "Skip them"], 1, "Avoid flaky gates."],
  ["Why roll out gradually?", ["Style", "Limit the blast radius of problems evals missed", "Cheaper", "Git requires it"], 1, "Canaries and flags."],
  ["“Production-ready” means…", ["Runs locally", "Container, config, health, monitoring, fallbacks, CI evals, rollback", "Nice UI", "Many features"], 1, "Operable and observable."]
 ]
};
