// Lessons for course "devops". Built by tools/course-builder from tools/courses/devops.js.
// Python examples were run and their real output stored.
(function (L) {
L["devops:git"] = {
 "title": "Git for teams: branches, merges and pull requests",
 "level": "Beginner+",
 "one": "<b>Git</b> records every change to your code as <b>commits</b>. Teams work on <b>branches</b>, open <b>pull requests</b> for review, and <b>merge</b> into <code>main</code>.",
 "why": "Every software job uses Git daily. Clean commits, branches and PRs are how teams collaborate, and how reviewers and interviewers judge your work.",
 "steps": [
  {
   "h": "The basic loop",
   "p": [
    "Change files → <code>git add</code> (stage) → <code>git commit</code> (save a snapshot with a message) → <code>git push</code> (share). <code>git status</code> and <code>git log</code> tell you where you are. These commands really ran in a fresh repository:"
   ],
   "code": "open(\"app.py\", \"w\").write(\"print('hello shop')\\n\")\nsh(\"git status --short\")\nsh(\"git add app.py\")\nsh(\"git commit -q -m 'Add app entry point'\")\nopen(\"app.py\", \"a\").write(\"print('orders: 0')\\n\")\nsh(\"git diff\")\nsh(\"git commit -qam 'Show order count'\")\nsh(\"git log --oneline\")",
   "out": {
    "text": "$ git status --short\n?? app.py\n$ git add app.py\n$ git commit -q -m 'Add app entry point'\n$ git diff\ndiff --git a/app.py b/app.py\nindex 2ccb2f6..67a5421 100644\n--- a/app.py\n+++ b/app.py\n@@ -1 +1,2 @@\n print('hello shop')\n+print('orders: 0')\n$ git commit -qam 'Show order count'\n$ git log --oneline\n7a69e49 Show order count\n1bb7923 Add app entry point"
   }
  },
  {
   "h": "Branches",
   "p": [
    "A branch is a separate line of work. Create one per feature or fix, so <code>main</code> stays working."
   ],
   "code": "sh(\"git switch -c feature/discounts\")\nopen(\"pricing.py\", \"w\").write(\"def discount(total):\\n    return total * 0.9\\n\")\nsh(\"git add pricing.py && git commit -qm 'Add 10% discount'\")\nsh(\"git switch main\")\nsh(\"ls\")\nsh(\"git log --oneline --all --graph\")",
   "note": "On <code>main</code>, <code>pricing.py</code> doesn't exist yet: the work lives on the branch until it's merged.",
   "out": {
    "text": "$ git switch -c feature/discounts\nSwitched to a new branch 'feature/discounts'\n$ git add pricing.py && git commit -qm 'Add 10% discount'\n$ git switch main\nSwitched to branch 'main'\n$ ls\napp.py\n$ git log --oneline --all --graph\n* 38bfd64 Add 10% discount\n* 953bb14 Initial commit"
   }
  },
  {
   "h": "Merging and conflicts",
   "p": [
    "If two branches change the same lines, Git can't decide and marks a <b>conflict</b>. You edit the file to the right final version, then add and commit."
   ],
   "code": "sh(\"git switch -qc fee-79 && sed -i 's/50/79/' config.py && git commit -qam 'Fee 79'\")\nsh(\"git switch -q main && sed -i 's/50/99/' config.py && git commit -qam 'Fee 99'\")\nsh(\"git merge fee-79\")\nprint(open(\"config.py\").read())\nopen(\"config.py\", \"w\").write(\"SHIPPING_FEE = 79\\n\")          # decide the right value\nsh(\"git add config.py && git commit -qm 'Merge fee-79: use 79' && git log --oneline -3\")",
   "out": {
    "text": "$ git switch -qc fee-79 && sed -i 's/50/79/' config.py && git commit -qam 'Fee 79'\n$ git switch -q main && sed -i 's/50/99/' config.py && git commit -qam 'Fee 99'\n$ git merge fee-79\nAuto-merging config.py\nCONFLICT (content): Merge conflict in config.py\nAutomatic merge failed; fix conflicts and then commit the result.\n<<<<<<< HEAD\nSHIPPING_FEE = 99\n=======\nSHIPPING_FEE = 79\n>>>>>>> fee-79\n\n$ git add config.py && git commit -qm 'Merge fee-79: use 79' && git log --oneline -3\n0b876cb Merge fee-79: use 79\neb4ef62 Fee 99\n1bbf7d7 Fee 79"
   }
  },
  {
   "h": "Pull requests and good commits",
   "p": [
    "Push your branch and open a <b>pull request</b> (PR) on GitHub/GitLab: teammates review, CI runs tests, then it's merged. Good PRs are small (under ~400 lines), focused on one change, with a description of what and why and how it was tested.",
    "Good commit messages: a short summary in the imperative (“Add retry to ERP sync”), then details if needed. Avoid “fix”, “wip”, “changes”."
   ],
   "code": "git switch -c fix/erp-timeout\n# ...edit, test...\ngit add -p                        # stage hunk by hunk: review your own change\ngit commit -m \"Add 10s timeout and retries to ERP sync\"\ngit push -u origin fix/erp-timeout\ngh pr create --fill               # or open the PR in the browser",
   "lang": "bash"
  },
  {
   "h": "Undo safely",
   "code": "git restore app.py               # throw away uncommitted changes to a file\ngit restore --staged app.py      # unstage, keep the change\ngit commit --amend               # fix the last commit (only if not pushed yet)\ngit revert <commit>              # undo a pushed commit with a new commit (safe for shared branches)\ngit stash / git stash pop        # park work in progress\ngit log --oneline --graph --all  # see where everything is",
   "lang": "bash",
   "p": [
    "Rule of thumb: never rewrite history (<code>reset --hard</code>, <code>push --force</code>) on branches other people use. Use <code>revert</code> instead."
   ]
  }
 ],
 "mistakes": [
  "Committing straight to main for team projects.",
  "Huge PRs mixing refactors, features and formatting.",
  "Committing secrets, .env files or large data files.",
  "Force-pushing shared branches."
 ],
 "practice": [
  {
   "q": "Create a branch, commit two files on it, and show that main doesn't have them.",
   "code": "sh(\"git switch -qc feature/reports\")\nfor name in [\"report.py\", \"test_report.py\"]:\n    open(name, \"w\").write(\"# todo\\n\")\nsh(\"git add . && git commit -qm 'Add report skeleton'\")\nsh(\"git switch -q main && ls\")",
   "out": {
    "text": "$ git switch -qc feature/reports\n$ git add . && git commit -qm 'Add report skeleton'\n$ git switch -q main && ls\nREADME.md"
   }
  },
  {
   "q": "You committed a bug that's already on main and pushed. How do you undo it safely?",
   "a": "<code>git revert &lt;commit-sha&gt;</code> creates a new commit that reverses it, without rewriting shared history. Push that (through a PR if required)."
  }
 ],
 "check": [
  [
   "What does git add do?",
   [
    "Uploads code",
    "Stages changes for the next commit",
    "Creates a branch",
    "Merges"
   ],
   1,
   "Then commit."
  ],
  [
   "Safe way to undo a pushed commit on a shared branch?",
   [
    "git reset --hard + force push",
    "git revert",
    "Delete the repo",
    "git stash"
   ],
   1,
   "Revert adds an undo commit."
  ],
  [
   "A good pull request is…",
   [
    "Huge and mixed",
    "Small, focused, described and tested",
    "Without description",
    "Pushed to main directly"
   ],
   1,
   "Easy to review."
  ]
 ],
 "remember": [
  "add → commit → push; status/log/diff to look around.",
  "One branch per feature/fix; main stays working.",
  "Conflicts: edit to the right result, add, commit.",
  "Small focused PRs; imperative commit messages.",
  "revert on shared branches; never force-push them."
 ]
};
L["devops:docker"] = {
 "title": "Docker for developers",
 "level": "Intermediate",
 "one": "Docker packages an app with everything it needs into an <b>image</b>; a <b>container</b> is a running copy. <b>Docker Compose</b> runs several containers (app, database, cache) together.",
 "why": "Docker makes “works on my machine” work everywhere: laptops, CI and servers. It's listed in most backend, data and DevOps job posts.",
 "steps": [
  {
   "h": "Everyday commands",
   "code": "docker run --rm -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16   # start a database\ndocker ps                         # running containers\ndocker logs -f <container>        # follow logs\ndocker exec -it <container> bash  # shell inside a container\ndocker stop <container>\ndocker images                     # images on your machine\ndocker system prune               # clean up old stuff",
   "lang": "bash"
  },
  {
   "h": "A Dockerfile for a Python web app",
   "code": "FROM python:3.12-slim\nWORKDIR /app\nENV PYTHONUNBUFFERED=1\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nRUN useradd -m app && chown -R app /app\nUSER app\nEXPOSE 8000\nCMD [\"gunicorn\", \"-k\", \"uvicorn.workers.UvicornWorker\", \"-b\", \"0.0.0.0:8000\", \"app.main:app\"]",
   "lang": "dockerfile",
   "p": [
    "Each line is a cached <b>layer</b>. Put things that change rarely (dependencies) before things that change often (your code) so rebuilds are fast."
   ]
  },
  {
   "h": "Multi-stage builds: small images",
   "p": [
    "Build in one stage (with compilers), copy only the result into a slim final stage. Common for Java, Go and Node apps:"
   ],
   "code": "FROM maven:3.9-eclipse-temurin-21 AS build\nWORKDIR /src\nCOPY pom.xml .\nRUN mvn -q dependency:go-offline\nCOPY src ./src\nRUN mvn -q package -DskipTests\n\nFROM eclipse-temurin:21-jre\nCOPY --from=build /src/target/app.jar /app.jar\nUSER 1000\nENTRYPOINT [\"java\", \"-jar\", \"/app.jar\"]",
   "lang": "dockerfile"
  },
  {
   "h": "Compose for local development",
   "code": "services:\n  api:\n    build: .\n    ports: [\"8000:8000\"]\n    environment:\n      DATABASE_URL: postgresql://app:dev@db:5432/shop\n      REDIS_URL: redis://cache:6379/0\n    depends_on:\n      db: { condition: service_healthy }\n  db:\n    image: postgres:16\n    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: dev, POSTGRES_DB: shop }\n    volumes: [\"pgdata:/var/lib/postgresql/data\"]\n    healthcheck: { test: [\"CMD\", \"pg_isready\", \"-U\", \"app\"], interval: 5s }\n  cache:\n    image: redis:7\nvolumes:\n  pgdata:",
   "lang": "yaml",
   "p": [
    "<code>docker compose up -d</code> starts everything; services reach each other by name (<code>db</code>, <code>cache</code>). Volumes keep database data between restarts."
   ]
  },
  {
   "h": "Debugging containers",
   "p": [
    "Container exits immediately? Read <code>docker logs</code>. Can't connect? Check the port mapping (<code>-p host:container</code>) and that the app listens on <code>0.0.0.0</code>, not <code>127.0.0.1</code>. Different behaviour than locally? Compare environment variables and file paths. Need to look around? <code>docker exec -it … sh</code>."
   ]
  }
 ],
 "mistakes": [
  "App listening on 127.0.0.1 inside the container: unreachable from outside.",
  "Database data without a volume: gone when the container is removed.",
  "Secrets baked into images.",
  "Using the latest tag in production: builds change silently. Pin versions."
 ],
 "practice": [
  {
   "q": "Write the command to run Redis 7 on port 6379 in the background, then see its logs.",
   "code": "docker run -d --name cache -p 6379:6379 redis:7\ndocker logs cache",
   "lang": "bash"
  },
  {
   "q": "Your API container can't reach Postgres at localhost:5432 inside Compose. Why?",
   "a": "Inside a container, localhost is the container itself. Use the Compose service name as the host: <code>db:5432</code>."
  }
 ],
 "check": [
  [
   "Inside Docker Compose, the API reaches the database at…",
   [
    "localhost",
    "The service name, e.g. db",
    "127.0.0.1",
    "The host IP only"
   ],
   1,
   "Compose provides DNS by service name."
  ],
  [
   "Why order Dockerfile lines carefully?",
   [
    "Style",
    "Layer caching: rarely-changing steps first speeds rebuilds",
    "Required",
    "Security only"
   ],
   1,
   "Dependencies before code."
  ],
  [
   "What keeps database data when a container is removed?",
   [
    "Nothing",
    "A volume",
    "An image",
    "A port"
   ],
   1,
   "Mount a volume."
  ]
 ],
 "remember": [
  "image = package; container = running copy; compose = many together.",
  "Dependencies before code in Dockerfiles; slim bases; non-root user.",
  "Multi-stage builds for small images.",
  "Compose: services talk by name; volumes for data; healthchecks.",
  "Debug: logs, exec, port mapping, 0.0.0.0."
 ]
};
L["devops:ci-cd"] = {
 "title": "CI/CD with GitHub Actions",
 "level": "Intermediate",
 "one": "<b>Continuous Integration (CI)</b> runs lint and tests on every push and PR. <b>Continuous Delivery/Deployment (CD)</b> builds and deploys automatically when changes reach <code>main</code>.",
 "why": "Teams ship many times a day safely because machines check every change. Setting up CI for your projects is expected, and it's visible proof of quality on your GitHub.",
 "steps": [
  {
   "h": "A CI workflow for Python",
   "code": "# .github/workflows/ci.yml\nname: ci\non:\n  pull_request:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16\n        env: { POSTGRES_PASSWORD: test }\n        ports: [\"5432:5432\"]\n        options: --health-cmd pg_isready --health-interval 5s\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: { python-version: \"3.12\", cache: pip }\n      - run: pip install -r requirements.txt\n      - run: ruff check .\n      - run: pytest -q\n        env:\n          DATABASE_URL: postgresql://postgres:test@localhost:5432/postgres",
   "lang": "yaml"
  },
  {
   "h": "Deploy on merge to main",
   "code": "  deploy:\n    needs: test\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    environment: production          # can require a manual approval\n    steps:\n      - uses: actions/checkout@v4\n      - run: docker build -t ghcr.io/acme/shop:${{ github.sha }} .\n      - run: echo \"${{ secrets.GITHUB_TOKEN }}\" | docker login ghcr.io -u ${{ github.actor }} --password-stdin\n      - run: docker push ghcr.io/acme/shop:${{ github.sha }}\n      - run: ./scripts/deploy.sh ${{ github.sha }}\n        env:\n          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}",
   "lang": "yaml",
   "p": [
    "Tag images with the commit SHA so you always know exactly what's running, and rolling back means deploying the previous SHA. Secrets live in the repository's settings, never in the YAML."
   ]
  },
  {
   "h": "A quality gate script",
   "p": [
    "CI steps are just commands that exit 0 (pass) or non-zero (fail). You can write your own checks, e.g. block if coverage drops:"
   ],
   "code": "import sys\n\ncoverage_now, coverage_main = 81.4, 83.0\nallowed_drop = 1.0\nprint(f\"coverage {coverage_main}% -> {coverage_now}%\")\nif coverage_main - coverage_now > allowed_drop:\n    print(\"FAIL: coverage dropped more than 1 point\")\n    sys.exit(1)\nprint(\"ok\")",
   "expectError": true,
   "out": {
    "error": "coverage 83.0% -> 81.4%\nFAIL: coverage dropped more than 1 point"
   }
  },
  {
   "h": "Branch protection",
   "p": [
    "In GitHub settings, protect <code>main</code>: require PRs, require CI to pass, require at least one review, block force-pushes. Then “main always works” is enforced, not hoped for."
   ]
  },
  {
   "h": "Fast, reliable pipelines",
   "p": [
    "Cache dependencies; run independent jobs in parallel (lint, unit tests, type checks); keep slow end-to-end tests to a separate job or nightly; fail fast with the cheapest checks first; fix flaky tests immediately; keep total PR feedback under ~10 minutes."
   ]
  }
 ],
 "mistakes": [
  "Secrets written in workflow files.",
  "CI that only runs on main, so broken PRs get merged.",
  "Ignoring a red build “because it's flaky”.",
  "Deploying a mutable tag (latest) so you can't tell what's running."
 ],
 "practice": [
  {
   "q": "Add a step to the CI workflow that fails if code isn't formatted.",
   "code": "      - run: ruff format --check .",
   "lang": "yaml"
  },
  {
   "q": "A deploy broke production. With SHA-tagged images, how do you roll back?",
   "a": "Re-run the deploy with the previous working commit SHA (or the platform's “rollback to previous revision” button). Then fix forward with a PR, and add a test that would have caught it."
  }
 ],
 "check": [
  [
   "CI should run on…",
   [
    "Only main",
    "Every push and pull request",
    "Once a week",
    "Manually"
   ],
   1,
   "Catch problems before merge."
  ],
  [
   "Where do deploy secrets go?",
   [
    "The workflow YAML",
    "Repository/environment secrets",
    "README",
    "Code comments"
   ],
   1,
   "Encrypted settings."
  ],
  [
   "Why tag images with the commit SHA?",
   [
    "Shorter names",
    "Know exactly what runs and roll back precisely",
    "Required by Docker",
    "Faster builds"
   ],
   1,
   "Traceability."
  ]
 ],
 "remember": [
  "CI on every push/PR: lint → tests (with service containers).",
  "CD on main: build → push SHA-tagged image → deploy (optional approval).",
  "Steps pass/fail by exit code; write your own gates.",
  "Protect main: PRs, green CI, reviews, no force-push.",
  "Cache, parallelise, fail fast, fix flaky tests."
 ]
};
L["devops:aws"] = {
 "title": "Cloud basics with AWS",
 "level": "Intermediate",
 "one": "The cloud rents you building blocks: <b>compute</b> (EC2, Lambda, ECS/Fargate), <b>storage</b> (S3), <b>databases</b> (RDS, DynamoDB), <b>queues</b> (SQS), and <b>IAM</b> for who can do what. Azure and Google Cloud have the same ideas with different names.",
 "why": "Almost every job post mentions a cloud. Knowing the core services and IAM basics lets you deploy and integrate confidently, including into a client's account.",
 "steps": [
  {
   "h": "The core services",
   "code": "Compute     EC2 (virtual machines) · ECS/Fargate (containers) · Lambda (functions) · App Runner\nStorage     S3 (files/objects) · EBS (VM disks)\nDatabases   RDS / Aurora (Postgres, MySQL) · DynamoDB (key-value) · ElastiCache (Redis)\nMessaging   SQS (queues) · SNS (pub/sub) · EventBridge (events, schedules)\nNetwork     VPC, subnets, security groups · ALB (load balancer) · CloudFront (CDN) · Route 53 (DNS)\nSecurity    IAM (users, roles, policies) · Secrets Manager · KMS (encryption keys)\nOps         CloudWatch (logs, metrics, alarms)\nAzure ≈ VMs, Blob Storage, Azure SQL, Service Bus · GCP ≈ Compute Engine, Cloud Storage, Cloud SQL, Pub/Sub",
   "lang": "text"
  },
  {
   "h": "S3 from Python (boto3)",
   "p": [
    "These run against <b>moto</b>, a library that fakes AWS in memory, so the calls and responses are real boto3 behaviour without an AWS account:"
   ],
   "code": "import boto3, json\nfrom moto import mock_aws\n\nwith mock_aws():\n    s3 = boto3.client(\"s3\", region_name=\"ap-south-1\")\n    s3.create_bucket(Bucket=\"acme-invoices\", CreateBucketConfiguration={\"LocationConstraint\": \"ap-south-1\"})\n    s3.put_object(Bucket=\"acme-invoices\", Key=\"2025/07/INV-204.json\",\n                  Body=json.dumps({\"invoice\": \"INV-204\", \"total\": 17000}))\n    s3.put_object(Bucket=\"acme-invoices\", Key=\"2025/07/INV-205.json\", Body=b\"{}\")\n    listing = s3.list_objects_v2(Bucket=\"acme-invoices\", Prefix=\"2025/07/\")\n    print([o[\"Key\"] for o in listing[\"Contents\"]])\n    body = s3.get_object(Bucket=\"acme-invoices\", Key=\"2025/07/INV-204.json\")[\"Body\"].read()\n    print(json.loads(body))\n    url = s3.generate_presigned_url(\"get_object\", Params={\"Bucket\": \"acme-invoices\", \"Key\": \"2025/07/INV-204.json\"}, ExpiresIn=600)\n    print(url.split(\"?\")[0], \"(temporary link, 10 minutes)\")",
   "out": {
    "text": "['2025/07/INV-204.json', '2025/07/INV-205.json']\n{'invoice': 'INV-204', 'total': 17000}\nhttps://acme-invoices.s3.amazonaws.com/2025/07/INV-204.json (temporary link, 10 minutes)"
   }
  },
  {
   "h": "SQS queues",
   "code": "import boto3, json\nfrom moto import mock_aws\n\nwith mock_aws():\n    sqs = boto3.client(\"sqs\", region_name=\"ap-south-1\")\n    url = sqs.create_queue(QueueName=\"erp-sync\")[\"QueueUrl\"]\n    for oid in [6, 7]:\n        sqs.send_message(QueueUrl=url, MessageBody=json.dumps({\"order_id\": oid}))\n    msgs = sqs.receive_message(QueueUrl=url, MaxNumberOfMessages=10, WaitTimeSeconds=1)[\"Messages\"]\n    for m in msgs:\n        print(\"processing\", json.loads(m[\"Body\"]))\n        sqs.delete_message(QueueUrl=url, ReceiptHandle=m[\"ReceiptHandle\"])     # done: remove it\n    print(\"left:\", sqs.get_queue_attributes(QueueUrl=url, AttributeNames=[\"ApproximateNumberOfMessages\"])[\"Attributes\"])",
   "note": "If a worker crashes before deleting, the message becomes visible again after the visibility timeout and is retried: at-least-once delivery.",
   "out": {
    "text": "processing {'order_id': 6}\nprocessing {'order_id': 7}\nleft: {'ApproximateNumberOfMessages': '0'}"
   }
  },
  {
   "h": "IAM: least privilege",
   "p": [
    "Services and people get <b>roles</b> with <b>policies</b> listing exactly the actions and resources allowed. Applications use roles (temporary credentials), not long-lived access keys. A worker that only reads invoices and sends to one queue needs only this:"
   ],
   "code": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    { \"Effect\": \"Allow\", \"Action\": [\"s3:GetObject\"], \"Resource\": \"arn:aws:s3:::acme-invoices/*\" },\n    { \"Effect\": \"Allow\", \"Action\": [\"sqs:SendMessage\"], \"Resource\": \"arn:aws:sqs:ap-south-1:123456789012:erp-sync\" }\n  ]\n}",
   "lang": "json"
  },
  {
   "h": "Cost and regions",
   "p": [
    "Pick a region near users and allowed by data rules (e.g. <code>ap-south-1</code> Mumbai). Costs come from running time, storage, requests and <b>data transfer out</b>. Set a budget alarm on day one; turn off what you don't use; tag resources by project so you can see who spends what."
   ]
  }
 ],
 "mistakes": [
  "Using the root account or admin keys in applications.",
  "Public S3 buckets by accident. Keep buckets private; share with presigned URLs.",
  "Long-lived access keys committed to Git.",
  "No budget alarm, then a surprise bill."
 ],
 "practice": [
  {
   "q": "Upload three files under different prefixes and list only one month's files.",
   "code": "import boto3\nfrom moto import mock_aws\n\nwith mock_aws():\n    s3 = boto3.client(\"s3\", region_name=\"us-east-1\")\n    s3.create_bucket(Bucket=\"reports\")\n    for key in [\"2025/06/a.csv\", \"2025/07/b.csv\", \"2025/07/c.csv\"]:\n        s3.put_object(Bucket=\"reports\", Key=key, Body=b\"x\")\n    print([o[\"Key\"] for o in s3.list_objects_v2(Bucket=\"reports\", Prefix=\"2025/07/\")[\"Contents\"]])",
   "out": {
    "text": "['2025/07/b.csv', '2025/07/c.csv']"
   }
  },
  {
   "q": "Which AWS services would you use for: a nightly batch job, storing uploaded PDFs, a Postgres database, and a queue for webhook events?",
   "a": "EventBridge schedule triggering a Lambda or ECS task; S3 for PDFs; RDS (or Aurora) PostgreSQL; SQS for the webhook queue (with a dead-letter queue)."
  }
 ],
 "check": [
  [
   "Where do files like PDFs and exports usually go?",
   [
    "EC2 disk",
    "S3",
    "DynamoDB",
    "SQS"
   ],
   1,
   "Object storage."
  ],
  [
   "Least privilege means…",
   [
    "Admin for everyone",
    "Only the actions and resources needed",
    "No IAM",
    "Shared keys"
   ],
   1,
   "Limit the blast radius."
  ],
  [
   "How should an app on AWS get credentials?",
   [
    "Hard-coded keys",
    "An IAM role with temporary credentials",
    "Root account",
    "Email"
   ],
   1,
   "No long-lived keys."
  ]
 ],
 "remember": [
  "Compute EC2/ECS/Lambda · storage S3 · DB RDS/DynamoDB · queues SQS · events EventBridge.",
  "boto3 for Python; moto to test without AWS.",
  "IAM roles + least-privilege policies; no keys in code.",
  "Private buckets + presigned URLs.",
  "Region by users/data rules; budget alarm day one; tag resources."
 ]
};
L["devops:kubernetes"] = {
 "title": "Kubernetes essentials",
 "level": "Advanced",
 "one": "<b>Kubernetes</b> runs containers across many machines. You describe the desired state in YAML (<b>Deployments</b>, <b>Services</b>, <b>ConfigMaps</b>, <b>Secrets</b>), and it keeps reality matching: restarting, scaling and rolling out new versions.",
 "why": "Many mid-to-large companies run on Kubernetes (EKS, GKE, AKS). You don't need to run clusters as a developer, but you must deploy to them and debug your app there.",
 "steps": [
  {
   "h": "The main objects",
   "code": "Pod         one or more containers running together (usually one)\nDeployment  \"keep N copies of this pod running; roll out new versions gradually\"\nService     a stable name + load balancing to the pods (pods come and go)\nIngress     routes outside HTTP traffic (hostnames, paths) to services\nConfigMap   non-secret configuration    Secret   passwords, keys (base64, store encrypted)\nJob/CronJob run-to-completion / scheduled tasks\nHPA         Horizontal Pod Autoscaler: add pods when CPU/requests rise",
   "lang": "text"
  },
  {
   "h": "A Deployment and Service",
   "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: shop-api }\nspec:\n  replicas: 3\n  selector: { matchLabels: { app: shop-api } }\n  template:\n    metadata: { labels: { app: shop-api } }\n    spec:\n      containers:\n        - name: api\n          image: ghcr.io/acme/shop:3f2c1ab\n          ports: [{ containerPort: 8000 }]\n          envFrom: [{ configMapRef: { name: shop-config } }, { secretRef: { name: shop-secrets } }]\n          resources:\n            requests: { cpu: \"250m\", memory: \"256Mi\" }\n            limits: { memory: \"512Mi\" }\n          readinessProbe: { httpGet: { path: /health/ready, port: 8000 }, periodSeconds: 5 }\n          livenessProbe:  { httpGet: { path: /health/live,  port: 8000 }, periodSeconds: 10 }\n---\napiVersion: v1\nkind: Service\nmetadata: { name: shop-api }\nspec:\n  selector: { app: shop-api }\n  ports: [{ port: 80, targetPort: 8000 }]",
   "lang": "yaml"
  },
  {
   "h": "kubectl: the daily commands",
   "code": "kubectl apply -f k8s/                       # create/update from YAML\nkubectl get pods -l app=shop-api             # list pods\nkubectl describe pod shop-api-7d9f...        # events: why is it failing?\nkubectl logs -f deploy/shop-api              # logs\nkubectl exec -it deploy/shop-api -- sh       # shell inside\nkubectl rollout status deploy/shop-api       # watch a rollout\nkubectl rollout undo deploy/shop-api         # roll back\nkubectl scale deploy/shop-api --replicas=5",
   "lang": "bash"
  },
  {
   "h": "Probes and resources matter",
   "p": [
    "<b>Readiness</b> probe: only send traffic when the app can serve (DB connected). <b>Liveness</b> probe: restart the container if it's stuck. Keep liveness simple, or a slow database will make Kubernetes restart healthy pods.",
    "<b>Requests</b> reserve CPU/memory for scheduling; <b>limits</b> cap them. Exceeding the memory limit kills the pod (<code>OOMKilled</code>)."
   ]
  },
  {
   "h": "Common failures and what they mean",
   "code": "CrashLoopBackOff   app keeps crashing on start → kubectl logs --previous\nImagePullBackOff   wrong image name/tag or no registry access\nPending            not enough CPU/memory on any node, or volume can't attach\nOOMKilled          exceeded memory limit → fix the leak or raise the limit\n0/3 ready          readiness probe failing → check /health/ready and dependencies",
   "lang": "text"
  }
 ],
 "mistakes": [
  "No readiness probe: traffic hits pods before they're ready.",
  "Liveness probes that check the database, causing restart storms.",
  "No resource requests/limits.",
  "Using Kubernetes for a tiny app a PaaS could run."
 ],
 "practice": [
  {
   "q": "Your pods show CrashLoopBackOff after a deploy. What are your first three commands?",
   "code": "kubectl get pods -l app=shop-api\nkubectl logs deploy/shop-api --previous\nkubectl describe pod <pod-name>          # events: config, secrets, probes, OOM",
   "lang": "bash"
  },
  {
   "q": "Write a CronJob that runs the reconcile job every day at 02:30.",
   "code": "apiVersion: batch/v1\nkind: CronJob\nmetadata: { name: reconcile }\nspec:\n  schedule: \"30 2 * * *\"\n  concurrencyPolicy: Forbid\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n            - name: reconcile\n              image: ghcr.io/acme/shop:3f2c1ab\n              command: [\"python\", \"-m\", \"app.jobs.reconcile\"]",
   "lang": "yaml"
  }
 ],
 "check": [
  [
   "What keeps 3 copies of your pod running?",
   [
    "Service",
    "Deployment",
    "ConfigMap",
    "Ingress"
   ],
   1,
   "Desired replicas."
  ],
  [
   "What gives pods a stable name and load balancing?",
   [
    "Deployment",
    "Service",
    "Secret",
    "Job"
   ],
   1,
   "Pods come and go."
  ],
  [
   "A pod is OOMKilled. Meaning?",
   [
    "Network error",
    "It exceeded its memory limit",
    "Image missing",
    "Probe failed"
   ],
   1,
   "Fix usage or raise the limit."
  ]
 ],
 "remember": [
  "Deployment (replicas, rollout) + Service (stable name) + Ingress (HTTP in).",
  "ConfigMap for config, Secret for secrets; envFrom.",
  "Readiness = ready for traffic; liveness = restart if stuck.",
  "Requests/limits; OOMKilled when over memory.",
  "kubectl get/describe/logs/exec/rollout undo."
 ]
};
L["devops:observability"] = {
 "title": "Observability: logs, metrics, traces and alerts",
 "level": "Intermediate",
 "one": "<b>Observability</b> is being able to tell what your system is doing from the outside: <b>logs</b> (events), <b>metrics</b> (numbers over time), <b>traces</b> (a request's path), plus <b>alerts</b> on what users feel.",
 "why": "Production problems are found and fixed through observability. On-call engineers live in dashboards and logs; knowing the basics makes you useful from week one.",
 "steps": [
  {
   "h": "Metrics with Prometheus",
   "p": [
    "Apps expose counters, gauges and histograms; Prometheus scrapes them and Grafana draws dashboards. With the Python client:"
   ],
   "code": "from prometheus_client import Counter, Histogram, CollectorRegistry, generate_latest\nimport random\n\nregistry = CollectorRegistry()\nREQUESTS = Counter(\"http_requests_total\", \"HTTP requests\", [\"route\", \"status\"], registry=registry)\nLATENCY = Histogram(\"http_request_seconds\", \"Request latency\", [\"route\"],\n                    buckets=[0.05, 0.1, 0.25, 0.5, 1, 2.5], registry=registry)\n\nrandom.seed(2)\nfor _ in range(200):\n    status = \"500\" if random.random() < 0.03 else \"200\"\n    REQUESTS.labels(route=\"/orders\", status=status).inc()\n    LATENCY.labels(route=\"/orders\").observe(random.expovariate(1 / 0.15))\n\ntext = generate_latest(registry).decode()\nprint(\"\\n\".join(l for l in text.splitlines() if l.startswith((\"http_requests_total{\", 'http_request_seconds_bucket{le=\"0.25\"', 'http_request_seconds_bucket{le=\"1.0\"', \"http_request_seconds_count\"))))",
   "out": {
    "text": "http_requests_total{route=\"/orders\",status=\"200\"} 191.0\nhttp_requests_total{route=\"/orders\",status=\"500\"} 9.0\nhttp_request_seconds_bucket{le=\"0.25\",route=\"/orders\"} 164.0\nhttp_request_seconds_bucket{le=\"1.0\",route=\"/orders\"} 200.0\nhttp_request_seconds_count{route=\"/orders\"} 200.0"
   }
  },
  {
   "h": "The four golden signals",
   "p": [
    "For every service watch: <b>latency</b> (p50/p95/p99), <b>traffic</b> (requests per second), <b>errors</b> (rate of failures), <b>saturation</b> (CPU, memory, connection pools, queue length). Most incidents show up in one of these first."
   ],
   "code": "import statistics\n\nlatencies = [0.08, 0.11, 0.09, 0.12, 0.10, 0.95, 0.10, 0.13, 1.40, 0.09, 0.11, 0.10, 0.12, 0.10, 0.09, 0.11, 0.14, 0.10, 0.12, 0.10]\nerrors, total = 7, 200\nq = statistics.quantiles(latencies, n=100, method=\"inclusive\")\nprint(f\"p50 {statistics.median(latencies) * 1000:.0f} ms · p95 {q[94] * 1000:.0f} ms · p99 {q[98] * 1000:.0f} ms\")\nprint(f\"error rate {errors / total:.1%}\")",
   "out": {
    "text": "p50 105 ms · p95 972 ms · p99 1314 ms\nerror rate 3.5%"
   }
  },
  {
   "h": "SLOs and error budgets",
   "p": [
    "An <b>SLO</b> (service level objective) is a target like “99.5% of checkout requests succeed in under 1 s, over 30 days”. The remaining 0.5% is the <b>error budget</b>: if you burn it fast, stop risky releases and fix reliability."
   ],
   "code": "requests_30d = 2_000_000\nslo = 0.995\nbudget = requests_30d * (1 - slo)\nfailed_so_far, days_passed = 6_200, 10\nburn = failed_so_far / (budget * days_passed / 30)\nprint(f\"error budget: {budget:,.0f} failed requests per 30 days\")\nprint(f\"used {failed_so_far:,} in {days_passed} days -> burning at {burn:.1f}x the sustainable rate\")",
   "out": {
    "text": "error budget: 10,000 failed requests per 30 days\nused 6,200 in 10 days -> burning at 1.9x the sustainable rate"
   }
  },
  {
   "h": "Logs and traces together",
   "p": [
    "Structured JSON logs with a <b>trace id</b> on every line; distributed tracing (OpenTelemetry) shows each request across services with timing. From an alert → dashboard → slow traces → their logs: that's the debugging path."
   ]
  },
  {
   "h": "Alerting and on-call",
   "p": [
    "Alert on symptoms and SLO burn rates (users affected), not every CPU spike. Each alert links to a runbook. After incidents, write a blameless <b>postmortem</b>: what happened, impact, timeline, root cause, what we'll change. Track the action items."
   ]
  }
 ],
 "mistakes": [
  "Dashboards nobody looks at and alerts nobody trusts.",
  "Averages instead of percentiles.",
  "High-cardinality labels (user ids, order ids) in metrics, which explode storage.",
  "Postmortems that blame people instead of fixing systems."
 ],
 "practice": [
  {
   "q": "A service has an SLO of 99.9% over 30 days with 10 million requests. How many failed requests are allowed?",
   "code": "print(f\"{10_000_000 * (1 - 0.999):,.0f}\")",
   "out": {
    "text": "10,000"
   }
  },
  {
   "q": "Name the four golden signals and one metric for each for a queue-based worker.",
   "a": "Latency: time from enqueue to done (p95). Traffic: jobs processed per minute. Errors: failed jobs / DLQ arrivals per minute. Saturation: queue depth and age of the oldest job, worker CPU."
  }
 ],
 "check": [
  [
   "The four golden signals are…",
   [
    "CPU, RAM, disk, network",
    "Latency, traffic, errors, saturation",
    "Logs, metrics, traces, alerts",
    "p50, p95, p99, max"
   ],
   1,
   "Watch these first."
  ],
  [
   "An error budget is…",
   [
    "Money for errors",
    "The allowed failures under the SLO",
    "A logging quota",
    "A bug list"
   ],
   1,
   "Spend it wisely."
  ],
  [
   "Why avoid user ids as metric labels?",
   [
    "Privacy only",
    "High cardinality explodes metric storage",
    "Prometheus forbids text",
    "Slower graphs only"
   ],
   1,
   "Use logs/traces for per-request detail."
  ]
 ],
 "remember": [
  "Logs (events), metrics (numbers), traces (request paths), alerts.",
  "Golden signals: latency, traffic, errors, saturation; use percentiles.",
  "SLO + error budget guide release speed vs reliability.",
  "Trace ids in logs; OpenTelemetry for tracing.",
  "Alert on user-facing symptoms with runbooks; blameless postmortems."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
