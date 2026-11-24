// AI Engineer — Week 1 lessons (Python + APIs for AI apps).
(function (L) {
  const add = (key, v) => { L["ai-engineer:" + key] = v; };

  add("1-1", {
    title: "What an AI Engineer does",
    one: "An AI Engineer <b>builds useful products on top of AI models</b> — like a chatbot that answers from company documents — and makes them reliable in production.",
    learn: [
      "You usually don't train models. You <b>use</b> models (through an API like Claude or GPT) and build everything around them: the data they read, the tools they can use, the checks on their answers, and the server that runs it all.",
      "Job posts show this clearly: most ask for <b>Python</b>, <b>RAG</b> (answering from your own documents), <b>prompting</b>, <b>calling LLM APIs</b>, <b>agents</b>, plus normal engineering like Docker and cloud. Model training is rare.",
      "<b>AI Engineer</b> = builds AI apps. <b>ML Engineer</b> = trains and serves models. <b>Data Scientist</b> = analyses data and experiments."
    ],
    points: [
      "Typical tasks: a support assistant, document Q&A, an invoice reader, an agent that updates a CRM.",
      "What makes you strong: you can prove your app works (evaluation) and keep it safe and cheap."
    ],
    try: "Write down 3 problems from your own work that an AI app could solve. For each: what data does it need, and what could go wrong?",
    remember: [
      "AI Engineer = build and ship apps using models.",
      "Core skills: Python, APIs, prompting, RAG, agents, evaluation, deployment.",
      "Training models is a small part of most job posts."
    ]
  });

  add("1-2", {
    title: "Modern Python: type hints, dataclasses, Pydantic, async",
    one: "AI apps juggle lots of data and slow API calls. <b>Types</b> keep data clean; <b>async</b> keeps the app fast while it waits.",
    learn: [
      "<b>Type hints</b>: <code>def ask(question: str) -&gt; str</code>. They document what goes in and out.",
      "<b>Pydantic</b>: describe data once, and it checks it for you. You'll use it to validate what users send and what the AI returns.",
      "<b>async/await</b>: an LLM call can take 5 seconds. With async, your server can handle other requests while waiting, instead of freezing."
    ],
    ex: "from pydantic import BaseModel, Field\nimport asyncio\n\nclass Question(BaseModel):\n    text: str = Field(min_length=3)\n    user_id: int\n\nq = Question(text='What is our refund policy?', user_id=7)\n# Question(text='hi', user_id=7) would raise a clear validation error\n\nasync def slow_call(i: int) -> str:\n    await asyncio.sleep(1)          # pretend this is an API call\n    return f'answer {i}'\n\nasync def main():\n    results = await asyncio.gather(*(slow_call(i) for i in range(5)))\n    print(results)                  # finishes in ~1s, not 5s\n\nasyncio.run(main())",
    try: "Make a Pydantic model <code>Ticket</code> (title, priority 1–5, email). Check it rejects priority 9.",
    remember: [
      "Type hints document data; Pydantic enforces it.",
      "Validate everything: user input and AI output.",
      "async = do other work while waiting on slow calls."
    ]
  });

  add("1-3", {
    title: "HTTP and calling APIs",
    one: "Every LLM is reached through an <b>HTTP API</b>: you send JSON, it sends JSON back.",
    learn: [
      "Methods: <b>GET</b> read, <b>POST</b> send/create. LLM calls are POST requests with your prompt in the body and your API key in a header.",
      "Status codes: <b>200</b> ok, <b>400</b> bad request, <b>401</b> bad key, <b>429</b> rate-limited (wait and retry), <b>5xx</b> server problem (retry later).",
      "Always set a <b>timeout</b> and handle errors. In production, the API will fail sometimes — plan for it."
    ],
    ex: "import httpx\n\ndef get_json(url: str) -> dict:\n    try:\n        r = httpx.get(url, timeout=10)\n        r.raise_for_status()\n        return r.json()\n    except httpx.HTTPStatusError as e:\n        if e.response.status_code == 429:\n            print('Rate limited: wait and retry')\n        raise\n    except httpx.TimeoutException:\n        print('Timed out')\n        raise\n\nprint(get_json('https://api.github.com')['current_user_url'])",
    try: "Call a public API with httpx. Then call a URL that returns 404 and make your code print a friendly message instead of crashing.",
    remember: [
      "LLM APIs = POST JSON in, JSON out.",
      "429 = slow down and retry; 5xx = retry later; 401 = check key.",
      "Always set timeouts."
    ]
  });

  add("1-4", {
    title: "FastAPI: your app's front door",
    one: "<b>FastAPI</b> turns a Python function into a web API that other apps (or your UI) can call.",
    learn: [
      "Add a decorator like <code>@app.post('/ask')</code> to a function and it becomes an endpoint. FastAPI reads your Pydantic models, validates input, and builds interactive docs at <code>/docs</code>.",
      "This is how your AI features reach users: UI → your FastAPI endpoint → the LLM → back to the UI.",
      "Run it with <code>uvicorn main:app --reload</code>."
    ],
    ex: "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass AskIn(BaseModel):\n    question: str\n\nclass AskOut(BaseModel):\n    answer: str\n\n@app.post('/ask', response_model=AskOut)\nasync def ask(body: AskIn):\n    # later: call the LLM here\n    return AskOut(answer=f'You asked: {body.question}')",
    try: "Run this app, open <code>http://127.0.0.1:8000/docs</code>, and send a question. Then send an empty body and see the automatic 422 error.",
    remember: [
      "Decorator + function = endpoint.",
      "Pydantic models = automatic validation + docs.",
      "UI → FastAPI → LLM → UI."
    ]
  });

  add("1-5", {
    title: "Secrets and environment variables",
    one: "Your API key is like a credit card. <b>Never put it in code</b>; read it from an environment variable.",
    learn: [
      "Bots scan GitHub for leaked keys within minutes. A leaked LLM key can cost real money.",
      "Put keys in a <code>.env</code> file locally, add <code>.env</code> to <code>.gitignore</code>, and load them with <code>python-dotenv</code>. In production, use the host's secret settings.",
      "If a key ever leaks: <b>revoke it immediately</b> and create a new one. Deleting the commit is not enough."
    ],
    ex: "# .env   (never committed)\nANTHROPIC_API_KEY=sk-...\n\n# .gitignore\n.env\n\n# app.py\nimport os\nfrom dotenv import load_dotenv\n\nload_dotenv()\nAPI_KEY = os.environ['ANTHROPIC_API_KEY']   # crash early if missing",
    try: "Create a <code>.env</code> with a fake key, load it in Python, and confirm <code>git status</code> doesn't show the <code>.env</code> file.",
    remember: [
      "Keys live in env vars / secret managers, never in code.",
      ".env goes in .gitignore.",
      "Leaked key = revoke and rotate immediately."
    ]
  });

  add("1-6", {
    title: "Build: a /summarise endpoint",
    one: "Put the week together: a FastAPI service with one endpoint that summarises text. Next weeks you'll plug in a real model.",
    learn: [
      "Today the 'model' is a stub (a simple function), so you can build the structure without spending money. Swapping in a real LLM later is a one-line change.",
      "Good habits from day one: input validation, a timeout, a clear error when something fails, and the key read from the environment."
    ],
    ex: "from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel, Field\n\napp = FastAPI()\n\nclass SumIn(BaseModel):\n    text: str = Field(min_length=20, max_length=20000)\n\ndef fake_llm_summary(text: str) -> str:\n    first = text.split('.')[0]\n    return first[:200] + '…'\n\n@app.post('/summarise')\ndef summarise(body: SumIn):\n    try:\n        return {'summary': fake_llm_summary(body.text)}\n    except Exception:\n        raise HTTPException(502, 'Summary service failed, try again')",
    try: "Build it, test it in <code>/docs</code>, and push it to a new GitHub repo with a short README.",
    remember: [
      "Build the structure first; plug the model in later.",
      "Validate input length (long text = more tokens = more cost).",
      "Return clear errors instead of crashing."
    ]
  });
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
