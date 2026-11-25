// Lessons for course "ai-production". Built by tools/course-builder from tools/courses/ai-production.js.
// Python examples were run and their real output stored.
(function (L) {
L["ai-production:docker-ai"] = {
 "title": "Packaging an AI service with Docker",
 "level": "Intermediate",
 "one": "<b>Docker</b> packages your app, its Python version and libraries into an <b>image</b> that runs the same on your laptop, a teammate's machine and the cloud. Running an image gives a <b>container</b>.",
 "why": "“It works on my machine” isn't shippable. Almost every deployment platform runs containers, and job posts for AI and backend roles list Docker as a basic requirement.",
 "steps": [
  {
   "h": "Image, container, Dockerfile",
   "p": [
    "A <b>Dockerfile</b> is the recipe. <code>docker build</code> turns it into an <b>image</b> (a frozen snapshot). <code>docker run</code> starts a <b>container</b> from the image. You can run many containers from one image."
   ]
  },
  {
   "h": "A Dockerfile for a FastAPI + LLM service",
   "code": "FROM python:3.12-slim\n\nWORKDIR /app\nENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY app/ ./app/\n\nRUN useradd --create-home appuser\nUSER appuser\n\nEXPOSE 8000\nHEALTHCHECK CMD python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health/live')\"\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
   "lang": "dockerfile",
   "p": [
    "Copy <code>requirements.txt</code> and install <b>before</b> copying the code: Docker caches each step, so code changes don't reinstall all libraries. Run as a non-root user."
   ]
  },
  {
   "h": "Build and run",
   "code": "docker build -t support-assistant:0.1 .\ndocker run --rm -p 8000:8000 --env-file .env support-assistant:0.1\ncurl localhost:8000/health/live",
   "lang": "bash",
   "out": {
    "text": "{\"status\":\"ok\"}",
    "label": "Example output"
   },
   "p": [
    "Secrets come in at run time with <code>--env-file</code> or <code>-e</code>, never baked into the image. Add a <code>.dockerignore</code> (with <code>.env</code>, <code>.venv</code>, <code>.git</code>) so they're never copied in."
   ]
  },
  {
   "h": "Several services with Docker Compose",
   "p": [
    "An AI app often needs the API, a database (with pgvector) and a worker. <code>docker-compose.yml</code> starts them together for local development:"
   ],
   "code": "services:\n  api:\n    build: .\n    ports: [\"8000:8000\"]\n    env_file: .env\n    depends_on: [db]\n  worker:\n    build: .\n    command: python -m app.worker\n    env_file: .env\n    depends_on: [db]\n  db:\n    image: pgvector/pgvector:pg16\n    environment:\n      POSTGRES_PASSWORD: dev\n    volumes: [\"pgdata:/var/lib/postgresql/data\"]\nvolumes:\n  pgdata:",
   "lang": "yaml"
  },
  {
   "h": "Keep images small and safe",
   "p": [
    "Use slim base images; don't install compilers you don't need at run time; pin library versions; rebuild regularly for security fixes; scan images (<code>docker scout</code>, Trivy). Large ML models are better downloaded at start-up or mounted, not baked into every image version."
   ]
  }
 ],
 "mistakes": [
  "Copying .env or secrets into the image.",
  "COPY . . before pip install, so every code change reinstalls everything.",
  "Running as root inside the container.",
  "No health check, so the platform can't tell a broken container from a working one."
 ],
 "practice": [
  {
   "q": "Write a <code>.dockerignore</code> for a Python AI project.",
   "code": ".env\n.venv/\n__pycache__/\n*.pyc\n.git/\n.pytest_cache/\ndata/raw/\nnotebooks/",
   "lang": "text"
  },
  {
   "q": "Your image is 4 GB. Name three ways to shrink it.",
   "a": "Use <code>python:3.12-slim</code> instead of the full image; install only runtime dependencies (no build tools, or use a multi-stage build); don't bake model weights or datasets into the image; clean pip cache (<code>--no-cache-dir</code>); add a .dockerignore."
  }
 ],
 "check": [
  [
   "Image vs container?",
   [
    "Same thing",
    "Image = packaged snapshot; container = a running instance of it",
    "Container = recipe",
    "Image = a VM"
   ],
   1,
   "One image, many containers."
  ],
  [
   "How should secrets reach a container?",
   [
    "Baked into the image",
    "Environment variables / secret store at run time",
    "In the Dockerfile",
    "In git"
   ],
   1,
   "Never in the image."
  ],
  [
   "Why install requirements before copying the code?",
   [
    "Required",
    "Docker layer caching makes rebuilds fast",
    "Security",
    "Smaller image"
   ],
   1,
   "Code changes don't reinstall libraries."
  ]
 ],
 "remember": [
  "Dockerfile → docker build → image → docker run → container.",
  "Copy requirements and install first; then copy code (layer caching).",
  "Slim base, non-root user, HEALTHCHECK, .dockerignore.",
  "Secrets at run time (--env-file / platform secrets), never in images.",
  "docker compose for api + worker + db locally."
 ]
};
L["ai-production:deploy"] = {
 "title": "Deploying: where and how AI services run",
 "level": "Intermediate",
 "one": "Deploy your container to a platform that runs it, scales it and restarts it: a <b>PaaS</b> (Render, Railway, Fly.io), <b>serverless containers</b> (Cloud Run, AWS App Runner, Azure Container Apps), or <b>Kubernetes</b> for big teams.",
 "why": "Shipping is part of the job. Forward-deployed engineers often deploy into the client's cloud, so you need to know the options, their trade-offs and the basics of config, secrets and rollouts.",
 "steps": [
  {
   "h": "Choosing a platform",
   "p": [
    "<b>PaaS</b> (Render, Railway, Fly.io, Heroku): connect a repo, set env vars, done. Great for demos and small products. <b>Serverless containers</b> (Google Cloud Run, AWS App Runner/ECS Fargate, Azure Container Apps): run your image, scale to zero, pay per use; a strong default for AI APIs. <b>Kubernetes</b> (EKS, GKE, AKS): maximum control, but heavy to run; use when the company already has it.",
    "<b>Serverless functions</b> (Lambda, Vercel Functions) suit short tasks; check time limits for slow LLM calls and streaming."
   ]
  },
  {
   "h": "Deploy to Cloud Run (example)",
   "code": "gcloud builds submit --tag europe-west1-docker.pkg.dev/acme/apps/support-assistant:0.1\ngcloud run deploy support-assistant \\\n  --image europe-west1-docker.pkg.dev/acme/apps/support-assistant:0.1 \\\n  --region asia-south1 \\\n  --set-secrets ANTHROPIC_API_KEY=anthropic-key:latest \\\n  --min-instances 1 --max-instances 10 --concurrency 20 --timeout 120",
   "lang": "bash",
   "p": [
    "Every platform has the same knobs: <b>image</b>, <b>region</b> (close to users, and where client data may legally live), <b>secrets</b>, <b>min/max instances</b>, <b>concurrency</b>, <b>timeout</b> (LLM calls can take tens of seconds), <b>memory/CPU</b>."
   ]
  },
  {
   "h": "Configuration by environment",
   "p": [
    "The same image runs in dev, staging and production; only configuration changes. Load and validate it at start-up so a missing setting fails the deploy, not a user request."
   ],
   "code": "import os\nfrom pydantic import BaseModel, Field, ValidationError\n\nclass Settings(BaseModel):\n    app_env: str = Field(pattern=\"^(dev|staging|production)$\")\n    model: str\n    max_tokens: int = Field(gt=0, le=4000)\n    anthropic_api_key: str = Field(min_length=10)\n\ndef load() -> Settings:\n    return Settings(app_env=os.environ.get(\"APP_ENV\", \"\"), model=os.environ.get(\"MODEL\", \"\"),\n                    max_tokens=os.environ.get(\"MAX_TOKENS\", 0),\n                    anthropic_api_key=os.environ.get(\"ANTHROPIC_API_KEY\", \"\"))\n\ntry:\n    load()\nexcept ValidationError as e:\n    print(\"refusing to start:\", [err[\"loc\"][0] for err in e.errors()])",
   "out": {
    "text": "refusing to start: ['anthropic_api_key']"
   }
  },
  {
   "h": "Zero-downtime releases",
   "p": [
    "Platforms start new containers, wait for the <b>readiness check</b>, shift traffic, then stop old ones. Make it safe: backwards-compatible database changes (add columns first, remove later), graceful shutdown (finish in-flight requests), and a one-command <b>rollback</b> to the previous image tag."
   ]
  },
  {
   "h": "Data residency and client clouds",
   "p": [
    "Clients in finance, health or government may require data (including prompts sent to LLM APIs) to stay in a region or their own cloud account. Ask early. Options: deploy into their account, use the LLM provider's regional or cloud-marketplace endpoints (e.g. via AWS Bedrock, Google Vertex AI, Azure), mask personal data, or self-host open models."
   ]
  }
 ],
 "mistakes": [
  "Default request timeouts (30–60 s) killing long LLM calls or streams.",
  "Secrets as plain env vars in a repo file instead of the platform's secret manager.",
  "No rollback plan.",
  "Deploying in a region the client's compliance doesn't allow."
 ],
 "practice": [
  {
   "q": "Add a rule to the Settings model: in production, max_tokens must be at most 1500.",
   "code": "from pydantic import BaseModel, model_validator\n\nclass Settings(BaseModel):\n    app_env: str\n    max_tokens: int\n\n    @model_validator(mode=\"after\")\n    def prod_limits(self):\n        if self.app_env == \"production\" and self.max_tokens > 1500:\n            raise ValueError(\"max_tokens must be <= 1500 in production\")\n        return self\n\nprint(Settings(app_env=\"dev\", max_tokens=4000))\ntry:\n    Settings(app_env=\"production\", max_tokens=4000)\nexcept ValueError as e:\n    print(\"rejected:\", e.errors()[0][\"msg\"])",
   "out": {
    "text": "app_env='dev' max_tokens=4000\nrejected: Value error, max_tokens must be <= 1500 in production"
   }
  },
  {
   "q": "A client in banking needs all data to stay in India. What do you check before choosing where to deploy and which LLM endpoint to use?",
   "a": "That the hosting region is in India (e.g. Mumbai/Hyderabad), that the LLM API or cloud-marketplace endpoint processes data in an allowed region (or use a self-hosted model), that logs and backups stay in-region, and that the client's security team approves the data flow in writing."
  }
 ],
 "check": [
  [
   "A strong default for deploying an AI API container?",
   [
    "A laptop",
    "Serverless containers like Cloud Run / App Runner",
    "FTP upload",
    "A cron job"
   ],
   1,
   "Scales, simple, pay per use."
  ],
  [
   "Why validate configuration at start-up?",
   [
    "Speed",
    "A missing setting fails the deploy, not a user's request",
    "Style",
    "Required by Docker"
   ],
   1,
   "Fail fast."
  ],
  [
   "Which setting often needs raising for LLM services?",
   [
    "Port",
    "Request timeout",
    "Region",
    "Image name"
   ],
   1,
   "LLM calls can be slow."
  ]
 ],
 "remember": [
  "PaaS for demos; serverless containers as a strong default; Kubernetes when it already exists.",
  "Knobs: image, region, secrets, min/max instances, concurrency, timeout, memory.",
  "Same image everywhere; validate config at start-up.",
  "Readiness checks, graceful shutdown, compatible DB changes, one-command rollback.",
  "Ask about data residency early."
 ]
};
L["ai-production:tracing"] = {
 "title": "Tracing and monitoring LLM apps",
 "level": "Intermediate",
 "one": "<b>Tracing</b> records each step of a request (retrieval, model calls, tools) with timing, tokens and cost. Together with <b>metrics</b> and <b>user feedback</b>, it tells you what's slow, expensive or wrong in production.",
 "why": "LLM apps fail quietly: answers get worse, costs creep up, one tool gets slow. Without traces you're guessing; with them you can fix problems in minutes.",
 "steps": [
  {
   "h": "Spans: timing each step",
   "p": [
    "A <b>trace</b> is one request; each step inside it is a <b>span</b> with a name, duration and attributes. A tiny tracer built with a context manager:"
   ],
   "code": "import time, json\nfrom contextlib import contextmanager\n\nTRACE = []\n\n@contextmanager\ndef span(name, **attrs):\n    start = time.perf_counter()\n    record = {\"name\": name, **attrs}\n    try:\n        yield record\n    finally:\n        record[\"ms\"] = round((time.perf_counter() - start) * 1000)\n        TRACE.append(record)\n\ndef answer(question):\n    with span(\"request\", question=question):\n        with span(\"retrieve\", k=4) as s:\n            time.sleep(0.05); s[\"chunks\"] = 4\n        with span(\"llm\", model=\"medium\") as s:\n            time.sleep(0.12); s.update(input_tokens=2100, output_tokens=180)\n        with span(\"validate\"):\n            time.sleep(0.005)\n\nanswer(\"How long do refunds take?\")\nfor r in TRACE:\n    print(json.dumps(r))",
   "out": {
    "text": "{\"name\": \"retrieve\", \"k\": 4, \"chunks\": 4, \"ms\": 50}\n{\"name\": \"llm\", \"model\": \"medium\", \"input_tokens\": 2100, \"output_tokens\": 180, \"ms\": 120}\n{\"name\": \"validate\", \"ms\": 5}\n{\"name\": \"request\", \"question\": \"How long do refunds take?\", \"ms\": 176}"
   }
  },
  {
   "h": "Use a real tracing tool",
   "p": [
    "Don't build your own beyond learning. <b>OpenTelemetry</b> is the open standard; LLM-focused tools (Langfuse, LangSmith, Arize Phoenix, Helicone, Datadog LLM Observability) show prompts, outputs, tokens, cost and latency per step, and let you attach user feedback and eval scores to traces."
   ]
  },
  {
   "h": "Cost per request from traces",
   "code": "traces = [\n    {\"id\": \"t1\", \"spans\": [{\"name\": \"llm\", \"in\": 2100, \"out\": 180}, {\"name\": \"llm\", \"in\": 900, \"out\": 40}]},\n    {\"id\": \"t2\", \"spans\": [{\"name\": \"llm\", \"in\": 2300, \"out\": 220}]},\n    {\"id\": \"t3\", \"spans\": [{\"name\": \"llm\", \"in\": 9800, \"out\": 600}, {\"name\": \"llm\", \"in\": 9900, \"out\": 650}]},\n]\nPRICE_IN, PRICE_OUT = 3 / 1e6, 15 / 1e6\n\nfor t in traces:\n    cost = sum(s[\"in\"] * PRICE_IN + s[\"out\"] * PRICE_OUT for s in t[\"spans\"] if s[\"name\"] == \"llm\")\n    flag = \"  <- investigate\" if cost > 0.05 else \"\"\n    print(f\"{t['id']}: ${cost:.4f}{flag}\")",
   "note": "Trace t3 costs ~6× more: huge inputs. Traces show it's probably too many retrieved chunks or a runaway conversation history.",
   "out": {
    "text": "t1: $0.0123\nt2: $0.0102\nt3: $0.0779  <- investigate"
   }
  },
  {
   "h": "What to watch on a dashboard",
   "p": [
    "<b>Volume</b> (requests), <b>latency</b> (p50/p95 per step), <b>errors</b> (by type: timeouts, rate limits, validation failures), <b>cost</b> (per request and per day), <b>quality signals</b> (thumbs down rate, “I don't know” rate, escalations to humans, online eval scores on a sample).",
    "Alert on sudden changes: cost per request doubling, p95 jumping, error rate up, thumbs-down spiking after a release."
   ]
  },
  {
   "h": "Privacy in logs and traces",
   "p": [
    "Traces often contain user messages and model outputs. Mask personal data, restrict who can view prompts, set retention limits, and make sure the tracing vendor meets the client's data rules (or self-host it)."
   ]
  }
 ],
 "mistakes": [
  "Logging only errors; quality problems never show up as errors.",
  "No token/cost tracking per request, so a runaway bill is discovered at month end.",
  "Storing full prompts with personal data forever.",
  "No link between user feedback and the trace that produced the answer."
 ],
 "practice": [
  {
   "q": "From the TRACE list format above, compute the share of request time spent in the LLM span.",
   "code": "trace = [{\"name\": \"retrieve\", \"ms\": 52}, {\"name\": \"llm\", \"ms\": 1240}, {\"name\": \"validate\", \"ms\": 6}, {\"name\": \"request\", \"ms\": 1300}]\ntotal = next(s[\"ms\"] for s in trace if s[\"name\"] == \"request\")\nllm = sum(s[\"ms\"] for s in trace if s[\"name\"] == \"llm\")\nprint(f\"LLM share: {llm / total:.0%}\")",
   "out": {
    "text": "LLM share: 95%"
   }
  },
  {
   "q": "Thumbs-down rate jumped from 4% to 11% after Tuesday's release. How do you investigate?",
   "a": "Filter traces with thumbs-down since Tuesday, compare to before: did retrieval change (fewer/different chunks), the prompt or model version, or a tool start failing? Re-run the eval set on both versions. Roll back if the cause isn't quick to fix."
  }
 ],
 "check": [
  [
   "What is a span?",
   [
    "A whole request",
    "One timed step inside a request",
    "A log file",
    "A metric"
   ],
   1,
   "Traces are made of spans."
  ],
  [
   "Why track tokens per request?",
   [
    "Fun",
    "To see cost per request and catch runaways early",
    "Required by HTTP",
    "To slow requests"
   ],
   1,
   "Costs creep silently."
  ],
  [
   "Quality problems in LLM apps usually show up as…",
   [
    "500 errors",
    "Signals like thumbs-down, “I don't know” rate and eval scores",
    "CPU spikes",
    "Disk usage"
   ],
   1,
   "Watch quality signals, not just errors."
  ]
 ],
 "remember": [
  "Trace = request; spans = steps with time, tokens, cost, attributes.",
  "Use OpenTelemetry or an LLM tracing tool (Langfuse, LangSmith, Phoenix…).",
  "Dashboard: volume, p50/p95 per step, errors by type, cost, quality signals.",
  "Alert on sudden changes after releases.",
  "Mask PII and limit retention in traces."
 ]
};
L["ai-production:fallbacks"] = {
 "title": "Fallbacks, timeouts and graceful degradation",
 "level": "Intermediate",
 "one": "LLM APIs have outages, rate limits and slow days. Production apps set <b>timeouts</b>, <b>retry</b> wisely, <b>fall back</b> to another model or provider, and <b>degrade gracefully</b> when nothing works.",
 "why": "Users shouldn't see your provider's bad day. Clients ask “what happens when OpenAI/Anthropic is down?”, and a clear fallback design is a strong answer.",
 "steps": [
  {
   "h": "Know the failure types",
   "p": [
    "<b>Rate limited</b> (429): back off, maybe switch model. <b>Overloaded/server errors</b> (5xx, 529): retry briefly, then fall back. <b>Timeout</b>: retry once or fall back. <b>Bad output</b> (invalid JSON, failed checks): retry with the error, then fall back or route to a human. <b>Content refusal</b>: don't retry blindly; handle as a product case."
   ]
  },
  {
   "h": "A fallback chain",
   "p": [
    "Try the primary model; on temporary failure try a backup (a smaller model or another provider); if everything fails, return a safe response."
   ],
   "code": "class Temporary(Exception): pass\n\ndef call_with_fallbacks(prompt, providers, safe_answer):\n    for name, call in providers:\n        try:\n            reply = call(prompt)\n            return {\"answer\": reply, \"via\": name}\n        except Temporary as e:\n            print(f\"{name} failed: {e}; trying next\")\n    return {\"answer\": safe_answer, \"via\": \"safe fallback\"}\n\ndef primary(p):  raise Temporary(\"529 overloaded\")\ndef backup(p):   return \"Refunds take 5 to 7 working days after we receive the item.\"\ndef broken(p):   raise Temporary(\"timeout\")\n\nprint(call_with_fallbacks(\"refund time?\", [(\"primary-large\", primary), (\"backup-small\", backup)],\n                          \"Sorry, I can't answer right now. A team member will reply soon.\"))\nprint(call_with_fallbacks(\"refund time?\", [(\"primary-large\", primary), (\"backup-small\", broken)],\n                          \"Sorry, I can't answer right now. A team member will reply soon.\"))",
   "out": {
    "text": "primary-large failed: 529 overloaded; trying next\n{'answer': 'Refunds take 5 to 7 working days after we receive the item.', 'via': 'backup-small'}\nprimary-large failed: 529 overloaded; trying next\nbackup-small failed: timeout; trying next\n{'answer': \"Sorry, I can't answer right now. A team member will reply soon.\", 'via': 'safe fallback'}"
   }
  },
  {
   "h": "Timeouts and a total budget",
   "p": [
    "Give each attempt a timeout, and the whole request a <b>deadline</b>, so retries and fallbacks can't make users wait forever."
   ],
   "code": "import time\n\ndef with_deadline(steps, deadline_s, clock=time.monotonic):\n    start = clock()\n    for name, cost_s in steps:\n        remaining = deadline_s - (clock() - start)\n        if remaining <= 0:\n            return f\"deadline hit before {name}; returning best effort\"\n        timeout = min(cost_s, remaining)\n        print(f\"{name}: allowed {timeout:.1f}s\")\n        t[0] += timeout\n    return \"done\"\n\nt = [0.0]\nprint(with_deadline([(\"primary\", 8), (\"backup\", 8), (\"second backup\", 8)], deadline_s=12, clock=lambda: t[0]))",
   "out": {
    "text": "primary: allowed 8.0s\nbackup: allowed 4.0s\ndeadline hit before second backup; returning best effort"
   }
  },
  {
   "h": "Graceful degradation",
   "p": [
    "Decide in advance what the product does when AI is unavailable: show a cached answer for common questions, show search results without a generated summary, queue the request and reply by email later, or hand over to a human. The worst option is a spinner forever or an error page."
   ]
  },
  {
   "h": "Switching models safely",
   "p": [
    "A backup model behaves differently. Run your eval set on it before relying on it; keep prompts compatible (or keep a per-model prompt); validate outputs the same way. Note which model answered in the trace, so quality issues can be traced to fallbacks."
   ]
  }
 ],
 "mistakes": [
  "Retrying forever with no deadline.",
  "A backup model that was never evaluated.",
  "Showing raw provider errors to users.",
  "No plan for when every model is down."
 ],
 "practice": [
  {
   "q": "Add a cache to the fallback chain: if all providers fail and the question is in a cache of common answers, return the cached answer.",
   "code": "class Temporary(Exception): pass\n\nCACHE = {\"how long do refunds take?\": \"Refunds take 5 to 7 working days after we receive the item.\"}\n\ndef answer(question, providers):\n    for name, call in providers:\n        try:\n            return call(question), name\n        except Temporary:\n            pass\n    cached = CACHE.get(question.strip().lower())\n    return (cached, \"cache\") if cached else (\"A team member will reply soon.\", \"human handoff\")\n\ndef down(q): raise Temporary(\"outage\")\nprint(answer(\"How long do refunds take?\", [(\"primary\", down), (\"backup\", down)]))\nprint(answer(\"Can I change my address?\", [(\"primary\", down), (\"backup\", down)]))",
   "out": {
    "text": "('Refunds take 5 to 7 working days after we receive the item.', 'cache')\n('A team member will reply soon.', 'human handoff')"
   }
  },
  {
   "q": "Which failures should NOT trigger an automatic retry with the same prompt?",
   "a": "A content refusal or a policy block (retrying won't change it), a 400 bad request (fix the request), and repeated invalid output beyond your retry limit (route to fallback or a human)."
  }
 ],
 "check": [
  [
   "Provider returns 529 overloaded twice. Next step?",
   [
    "Retry forever",
    "Fall back to a backup model/provider",
    "Show the error",
    "Restart the server"
   ],
   1,
   "Fallback chain."
  ],
  [
   "Why a total deadline per request?",
   [
    "Style",
    "So retries and fallbacks can't make users wait forever",
    "Billing",
    "Required"
   ],
   1,
   "Bound the wait."
  ],
  [
   "Before relying on a backup model you should…",
   [
    "Nothing",
    "Run your evals on it",
    "Raise its temperature",
    "Hide it"
   ],
   1,
   "It behaves differently."
  ]
 ],
 "remember": [
  "Handle 429, 5xx/overloaded, timeouts, bad output and refusals differently.",
  "Fallback chain: primary → backup model/provider → safe response.",
  "Per-attempt timeouts + total request deadline.",
  "Degrade gracefully: cache, search results, queue, human handoff.",
  "Evaluate backup models; record which model answered."
 ]
};
L["ai-production:ci-evals"] = {
 "title": "CI/CD with eval gates",
 "level": "Intermediate",
 "one": "<b>CI/CD</b> runs checks automatically on every change and deploys when they pass. For AI apps, add an <b>eval gate</b>: the build fails if quality drops below a threshold or worse than the current version.",
 "why": "Prompt and model changes are code changes. Eval gates stop a “small prompt tweak” from silently breaking production, and they're a mark of a mature AI team.",
 "steps": [
  {
   "h": "The pipeline",
   "code": "on every pull request:\n  1. lint + type check\n  2. unit tests (parsers, validators, tools)     fast, no LLM calls\n  3. eval suite on a fixed dataset               real LLM calls, ~5-10 min\n  4. compare with main branch scores            fail if quality drops\non merge to main:\n  5. build image, deploy to staging, smoke test\n  6. deploy to production (gradually), watch metrics",
   "lang": "text"
  },
  {
   "h": "An eval gate script",
   "p": [
    "Compare the new scores to the baseline and fail (exit code 1) if anything important regresses beyond a tolerance."
   ],
   "code": "import sys\n\nbaseline = {\"accuracy\": 0.91, \"grounded\": 0.97, \"p95_ms\": 2400, \"cost_per_100\": 0.42}\ncandidate = {\"accuracy\": 0.93, \"grounded\": 0.94, \"p95_ms\": 2300, \"cost_per_100\": 0.40}\n\nRULES = {\n    \"accuracy\": (\"higher\", 0.01),\n    \"grounded\": (\"higher\", 0.01),\n    \"p95_ms\": (\"lower\", 300),\n    \"cost_per_100\": (\"lower\", 0.05),\n}\n\nfailures = []\nfor metric, (better, tolerance) in RULES.items():\n    b, c = baseline[metric], candidate[metric]\n    worse = (b - c) if better == \"higher\" else (c - b)\n    status = \"FAIL\" if worse > tolerance else \"ok\"\n    print(f\"{metric:13} {b:>8} -> {c:<8} {status}\")\n    if status == \"FAIL\":\n        failures.append(metric)\n\nif failures:\n    print(\"eval gate failed:\", failures)\n    sys.exit(1)\nprint(\"eval gate passed\")",
   "expectError": true,
   "note": "Accuracy went up, but groundedness dropped 3 points, so the change is blocked. That's exactly the trade-off a person should look at before merging.",
   "out": {
    "error": "accuracy          0.91 -> 0.93     ok\ngrounded          0.97 -> 0.94     FAIL\np95_ms            2400 -> 2300     ok\ncost_per_100      0.42 -> 0.4      ok\neval gate failed: ['grounded']"
   }
  },
  {
   "h": "GitHub Actions example",
   "code": "name: ci\non: [pull_request]\njobs:\n  test-and-eval:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: { python-version: \"3.12\" }\n      - run: pip install -r requirements.txt\n      - run: ruff check . && pytest -q\n      - run: python evals/run.py --dataset evals/support_v3.jsonl --out results.json\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n      - run: python evals/gate.py --baseline evals/baseline.json --candidate results.json",
   "lang": "yaml"
  },
  {
   "h": "Keep evals stable and affordable",
   "p": [
    "Fix the dataset version; use temperature 0 where possible; run each case once in PRs and more times nightly; cache responses for unchanged prompts; keep the PR suite small (50–200 cases) and run the full suite nightly. Update the baseline only on purpose, through review."
   ]
  },
  {
   "h": "Gradual rollout",
   "p": [
    "Even with passing evals, release gradually: a <b>canary</b> (5% of traffic) or a <b>feature flag</b> for some users, watch traces and feedback, then increase. Route by a stable hash so each user gets a consistent version:"
   ],
   "code": "import hashlib\n\ndef variant(user_id: str, new_percent: int) -> str:\n    bucket = int(hashlib.sha256(user_id.encode()).hexdigest(), 16) % 100\n    return \"new-prompt-v8\" if bucket < new_percent else \"prompt-v7\"\n\nusers = [f\"user-{i}\" for i in range(1000)]\nfor pct in [5, 25, 100]:\n    share = sum(variant(u, pct) == \"new-prompt-v8\" for u in users) / len(users)\n    print(f\"rollout {pct:3}% -> {share:.1%} of users on v8; user-42 gets {variant('user-42', pct)}\")",
   "out": {
    "text": "rollout   5% -> 4.0% of users on v8; user-42 gets prompt-v7\nrollout  25% -> 25.9% of users on v8; user-42 gets prompt-v7\nrollout 100% -> 100.0% of users on v8; user-42 gets new-prompt-v8"
   }
  }
 ],
 "mistakes": [
  "Prompt changes merged without running evals.",
  "Gates on a single average, hiding a drop in an important metric.",
  "Flaky evals (temperature 1, changing datasets) that fail randomly, so people ignore them.",
  "Releasing to 100% at once."
 ],
 "practice": [
  {
   "q": "Change the gate so a candidate passes when groundedness drops by at most 0.03. Does it pass now?",
   "code": "baseline = {\"accuracy\": 0.91, \"grounded\": 0.97}\ncandidate = {\"accuracy\": 0.93, \"grounded\": 0.94}\nrules = {\"accuracy\": 0.01, \"grounded\": 0.03}\nfails = [m for m, tol in rules.items() if baseline[m] - candidate[m] > tol + 1e-9]\nprint(\"passed\" if not fails else f\"failed: {fails}\")",
   "out": {
    "text": "passed"
   }
  },
  {
   "q": "Why should unit tests and evals be separate CI steps?",
   "a": "Unit tests are fast, free and deterministic (no LLM calls) and catch code bugs immediately. Evals are slower, cost money and measure model behaviour. Separating them gives fast feedback and makes failures easy to understand."
  }
 ],
 "check": [
  [
   "What does an eval gate do?",
   [
    "Deploys faster",
    "Fails the build if quality regresses",
    "Writes prompts",
    "Removes tests"
   ],
   1,
   "Quality as a CI check."
  ],
  [
   "Why roll out gradually?",
   [
    "Style",
    "Real traffic can reveal problems evals missed; limit the blast radius",
    "Cheaper",
    "Required by Git"
   ],
   1,
   "Canaries and flags."
  ],
  [
   "How to keep eval runs stable?",
   [
    "Temperature 1",
    "Fixed dataset version, temperature 0, reviewed baselines",
    "New data each run",
    "Skip them"
   ],
   1,
   "Avoid flaky gates."
  ]
 ],
 "remember": [
  "CI: lint → unit tests (no LLM) → evals → compare to baseline → gate.",
  "Gate per metric with tolerances (accuracy, groundedness, latency, cost).",
  "Stable evals: fixed dataset, temp 0, small PR suite, full nightly suite.",
  "Release gradually with canaries/flags; hash users to a stable variant.",
  "Update baselines deliberately, through review."
 ]
};
L["ai-production:ship"] = {
 "title": "Project: ship a production-ready AI service",
 "level": "Project",
 "one": "Take one of your AI projects (extractor, RAG assistant or agent) to production quality: container, config, health checks, tracing, fallbacks, eval gate in CI, gradual rollout and a runbook.",
 "why": "Most portfolios stop at a notebook or a demo. A project that's actually deployable and observable shows you can be trusted with real clients and real traffic.",
 "steps": [
  {
   "h": "The checklist",
   "code": "checklist = {\n    \"Dockerfile + .dockerignore, non-root, healthcheck\": True,\n    \"Settings validated at start-up; secrets from env\": True,\n    \"/health/live and /health/ready\": True,\n    \"Structured logs with request id; no PII\": True,\n    \"Tracing: spans for retrieval, LLM, tools; tokens + cost\": False,\n    \"Timeouts, retries, fallback model, safe response\": True,\n    \"Unit tests + eval suite + gate in CI\": False,\n    \"Deployed to a cloud URL with rollback\": False,\n    \"Dashboard + 3 alerts (errors, p95, cost)\": False,\n    \"README: architecture, eval results, runbook\": False,\n}\ndone = sum(checklist.values())\nprint(f\"{done}/{len(checklist)} done\")\nfor item, ok in checklist.items():\n    print((\"✔ \" if ok else \"· \") + item)",
   "out": {
    "text": "5/10 done\n✔ Dockerfile + .dockerignore, non-root, healthcheck\n✔ Settings validated at start-up; secrets from env\n✔ /health/live and /health/ready\n✔ Structured logs with request id; no PII\n· Tracing: spans for retrieval, LLM, tools; tokens + cost\n✔ Timeouts, retries, fallback model, safe response\n· Unit tests + eval suite + gate in CI\n· Deployed to a cloud URL with rollback\n· Dashboard + 3 alerts (errors, p95, cost)\n· README: architecture, eval results, runbook"
   }
  },
  {
   "h": "Suggested structure",
   "code": "support-assistant/\n├── app/\n│   ├── main.py          # FastAPI: /ask, /health/*, request ids\n│   ├── settings.py      # validated config\n│   ├── retrieval.py     # search + filters\n│   ├── llm.py           # client, prompts, fallbacks, timeouts\n│   ├── checks.py        # output validation + citation checks\n│   └── tracing.py       # spans / OpenTelemetry setup\n├── evals/\n│   ├── support_v3.jsonl # labelled cases\n│   ├── run.py  gate.py  baseline.json\n├── tests/               # unit tests, no LLM calls\n├── Dockerfile  .dockerignore  docker-compose.yml\n├── .github/workflows/ci.yml\n└── README.md            # what, architecture diagram, eval table, how to run, runbook",
   "lang": "text"
  },
  {
   "h": "The README that sells it",
   "p": [
    "Lead with the problem and a 2-minute demo video. Then: architecture diagram, how to run locally (<code>docker compose up</code>), the eval table (dataset size, accuracy, groundedness, p95, cost per 100 requests), reliability features (fallbacks, retries, health checks), what you'd do next. Recruiters and interviewers read the first screen; make it count."
   ]
  },
  {
   "h": "Rehearse an incident",
   "p": [
    "Pretend the primary model is down: switch its API key to an invalid one in staging and confirm the fallback works, the alert fires and the runbook steps are right. Then roll back a bad release in one command. Write what happened in the README's runbook section."
   ]
  }
 ],
 "mistakes": [
  "Calling a project “production-ready” without monitoring or rollback.",
  "Eval results nobody can reproduce.",
  "A README that starts with installation instructions instead of the problem and results."
 ],
 "practice": [
  {
   "q": "Write the eval-results table for your README (made-up example values are fine for now).",
   "code": "rows = [(\"Dataset\", \"120 real support questions (v3)\"), (\"Answer accuracy\", \"91%\"), (\"Grounded in sources\", \"97%\"),\n        (\"“I don't know” when unanswerable\", \"94%\"), (\"p95 latency\", \"2.4 s\"), (\"Cost per 100 requests\", \"$0.42\")]\nprint(\"| Metric | Result |\\n|---|---|\")\nfor k, v in rows:\n    print(f\"| {k} | {v} |\")",
   "out": {
    "text": "| Metric | Result |\n|---|---|\n| Dataset | 120 real support questions (v3) |\n| Answer accuracy | 91% |\n| Grounded in sources | 97% |\n| “I don't know” when unanswerable | 94% |\n| p95 latency | 2.4 s |\n| Cost per 100 requests | $0.42 |"
   }
  },
  {
   "q": "What three alerts would you set for the deployed assistant, with thresholds?",
   "a": "Error rate > 5% over 10 minutes; p95 latency > 6 s over 15 minutes; cost per request > 2× the weekly average (or daily spend over budget). Optionally: thumbs-down rate doubling after a release."
  }
 ],
 "check": [
  [
   "What makes a project 'production-ready'?",
   [
    "It runs on your laptop",
    "Container, config, health checks, monitoring, fallbacks, evals in CI, rollback",
    "A nice UI",
    "Many features"
   ],
   1,
   "Operability, not features."
  ],
  [
   "Best first screen of a project README?",
   [
    "Install steps",
    "Problem, demo video and results",
    "License",
    "Folder tree"
   ],
   1,
   "Lead with value."
  ],
  [
   "Why rehearse an incident?",
   [
    "Fun",
    "To prove fallbacks, alerts and the runbook actually work",
    "Required by Docker",
    "To break things"
   ],
   1,
   "Untested recovery is a guess."
  ]
 ],
 "remember": [
  "Container + validated config + health checks + structured logs + tracing.",
  "Timeouts, retries, fallbacks, safe responses.",
  "Unit tests + eval gate in CI; gradual rollout; one-command rollback.",
  "Dashboard + a few meaningful alerts + runbook.",
  "README: problem, demo, architecture, eval table, next steps."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
