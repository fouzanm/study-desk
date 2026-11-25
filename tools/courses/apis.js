// APIs & Integrations course. Python examples are run by tools/course-builder.
// Examples that call an API run against FAKE_SHOP: a small fake shop API (hidden setup), so the output is real.
const FAKE_SHOP = String.raw`
import httpx, json as _json, itertools as _it
_CUSTOMERS = {1: {"id": 1, "name": "Asha Rao", "city": "Kochi"}, 2: {"id": 2, "name": "Ben Thomas", "city": "Bengaluru"}}
_ORDERS = [{"id": i, "customer_id": 1 + i % 2, "status": "completed" if i % 3 else "pending", "total": 1000 * i} for i in range(1, 8)]
_hits = _it.count(1)
def _shop(req):
    p, m = req.url.path, req.method
    if p.startswith("/customers/") and m == "GET":
        cid = int(p.rsplit("/", 1)[1])
        if cid in _CUSTOMERS:
            return httpx.Response(200, json=_CUSTOMERS[cid])
        return httpx.Response(404, json={"detail": "Customer not found"})
    if p == "/orders" and m == "GET":
        rows = [o for o in _ORDERS if req.url.params.get("status") in (None, o["status"])]
        page, size = int(req.url.params.get("page", 1)), int(req.url.params.get("page_size", 3))
        chunk = rows[(page - 1) * size: page * size]
        nxt = page + 1 if page * size < len(rows) else None
        return httpx.Response(200, json={"data": chunk, "page": page, "next_page": nxt})
    if p == "/orders" and m == "POST":
        if req.headers.get("authorization") != "Bearer test-key":
            return httpx.Response(401, json={"detail": "Missing or invalid API key"})
        body = _json.loads(req.content or b"{}")
        if "customer_id" not in body or not body.get("items"):
            return httpx.Response(422, json={"detail": "customer_id and items are required"})
        return httpx.Response(201, json={"id": 101, "status": "pending", **body}, headers={"Location": "/orders/101"})
    if p == "/busy":
        if next(_hits) <= 2:
            return httpx.Response(429, json={"detail": "Too many requests"}, headers={"Retry-After": "1"})
        return httpx.Response(200, json={"ok": True})
    if p == "/flaky":
        if next(_hits) <= 2:
            return httpx.Response(503, json={"detail": "Service unavailable"})
        return httpx.Response(200, json={"ok": True})
    if p == "/slow":
        raise httpx.ReadTimeout("timed out", request=req)
    return httpx.Response(404, json={"detail": "Not found"})
_orig_init = httpx.Client.__init__
def _init(self, *a, **k):
    k.setdefault("transport", httpx.MockTransport(_shop))
    _orig_init(self, *a, **k)
httpx.Client.__init__ = _init
def _get(url, **k):
    with httpx.Client() as c:
        return c.get(url, **k)
def _post(url, **k):
    with httpx.Client() as c:
        return c.post(url, **k)
httpx.get, httpx.post = _get, _post
import time as _t; _t.sleep = lambda s: print(f"   (waiting {s:.1f}s)")
`;

module.exports = [
{
 id: "http-rest",
 title: "How APIs work: HTTP and REST",
 level: "Beginner",
 one: "An <b>API</b> lets one program ask another for data or actions over the internet. The message format is <b>HTTP</b>: a <b>request</b> (method + URL + headers + body) gets a <b>response</b> (status code + headers + body).",
 why: "Every integration, mobile app and AI tool talks through APIs. Integration, implementation and forward-deployed jobs are mostly about connecting APIs reliably.",
 steps: [
  { h: "Request and response",
    p: ["A request has: a <b>method</b> (what to do), a <b>URL</b> (which thing), <b>headers</b> (extra info like who you are) and sometimes a <b>body</b> (data you send, usually JSON).",
        "The response has a <b>status code</b> (did it work?), headers and a body. Here's what actually travels over the network:"],
    code: `GET /customers/1 HTTP/1.1
Host: api.example-shop.com
Accept: application/json
Authorization: Bearer test-key

HTTP/1.1 200 OK
Content-Type: application/json

{"id": 1, "name": "Asha Rao", "city": "Kochi"}`, lang: "http" },
  { h: "Methods: what you want to do",
    p: ["<b>GET</b> read · <b>POST</b> create · <b>PUT</b> replace · <b>PATCH</b> change some fields · <b>DELETE</b> remove.",
        "GET, PUT and DELETE are <b>idempotent</b>: doing them twice has the same effect as once. POST usually isn't: posting an order twice can create two orders. Remember this for retries."] },
  { h: "Status codes: did it work?",
    p: ["<b>2xx</b> success: 200 OK, 201 Created, 204 No Content. <b>4xx</b> your mistake: 400 Bad Request, 401 Unauthorized (who are you?), 403 Forbidden (you can't do this), 404 Not Found, 409 Conflict, 422 invalid data, 429 Too Many Requests. <b>5xx</b> their problem: 500 Server Error, 502/503/504 gateway or overload.",
        "Rule of thumb: retry 429 and 5xx (with waits); don't retry other 4xx, because sending the same bad request again won't fix it."] },
  { h: "REST: URLs are nouns",
    p: ["A <b>REST</b> API names things (<b>resources</b>) in the URL and uses the method for the action:",
        "<code>GET /orders</code> list · <code>GET /orders/6</code> one · <code>POST /orders</code> create · <code>PATCH /orders/6</code> update · <code>DELETE /orders/6</code> delete · <code>GET /customers/1/orders</code> a customer's orders.",
        "Filters and paging go in the <b>query string</b>: <code>GET /orders?status=pending&amp;page=2</code>."] },
  { h: "Calling an API from Python",
    p: ["<code>httpx</code> (or the older <code>requests</code>) sends requests. Always set a <b>timeout</b>, check the status, then read <code>.json()</code>.",
        "These examples run against a small fake shop API, so the output you see is real."],
    pre: FAKE_SHOP,
    code: `import httpx

r = httpx.get("https://api.example-shop.com/customers/1", timeout=10)
print(r.status_code)
print(r.headers["content-type"])
print(r.json())

r = httpx.get("https://api.example-shop.com/customers/99", timeout=10)
print(r.status_code, r.json())` },
  { h: "The same call with curl",
    p: ["<code>curl</code> is the command-line tool for quick API tests. <code>-i</code> shows headers, <code>-H</code> adds a header, <code>-d</code> sends a body. Most API docs show curl examples, so learn to read them."],
    code: `curl -i https://api.example-shop.com/customers/1

curl -X POST https://api.example-shop.com/orders \\
  -H "Authorization: Bearer test-key" \\
  -H "Content-Type: application/json" \\
  -d '{"customer_id": 1, "items": [{"sku": "TEA", "qty": 2}]}'`, lang: "bash" }
 ],
 mistakes: [
  "No timeout. One slow server freezes your program forever. Always pass <code>timeout=</code>.",
  "Reading <code>.json()</code> without checking the status first. An error page may not even be JSON.",
  "Retrying a 400 or 422. The request is wrong; fix it instead.",
  "Verbs in URLs (<code>/getOrders</code>, <code>/createOrder</code>). Use nouns plus methods."
 ],
 practice: [
  { q: "Fetch orders with status <code>pending</code> from the fake shop and print their ids.", pre: FAKE_SHOP, code: `import httpx

r = httpx.get("https://api.example-shop.com/orders", params={"status": "pending"}, timeout=10)
r.raise_for_status()
print([o["id"] for o in r.json()["data"]])` },
  { q: "Which status code fits? (a) order created (b) wrong API key (c) order 999 doesn't exist (d) server crashed (e) too many calls", a: "(a) 201 Created (b) 401 Unauthorized (c) 404 Not Found (d) 500 Internal Server Error (e) 429 Too Many Requests." },
  { q: "Design REST URLs for: list a customer's invoices, get one invoice, mark an invoice paid.", a: "<code>GET /customers/{id}/invoices</code>, <code>GET /invoices/{id}</code>, <code>PATCH /invoices/{id}</code> with body <code>{\"status\": \"paid\"}</code> (or <code>POST /invoices/{id}/payments</code> if paying creates a payment record)." }
 ],
 check: [
  ["Which method creates a new resource?", ["GET", "POST", "DELETE", "HEAD"], 1, "POST creates; PUT/PATCH update."],
  ["401 vs 403?", ["Same", "401 = not identified (bad/missing credentials); 403 = identified but not allowed", "401 = server error", "403 = not found"], 1, "Authentication vs permission."],
  ["Which errors are worth retrying?", ["400 and 422", "429 and 5xx", "404", "All of them"], 1, "Retry rate limits and server errors, with waits."]
 ],
 remember: [
  "Request = method + URL + headers + body. Response = status + headers + body.",
  "GET read, POST create, PUT replace, PATCH update, DELETE remove.",
  "2xx ok · 4xx your mistake · 5xx their problem. 401 who are you, 403 not allowed, 422 bad data, 429 slow down.",
  "REST: nouns in URLs (/orders/6), filters in query (?status=pending).",
  "Always set a timeout and check the status before .json()."
 ]
},
{
 id: "fastapi",
 title: "Building an API with FastAPI",
 level: "Intermediate",
 one: "<b>FastAPI</b> builds APIs from normal Python functions. Type hints and Pydantic models give you validation, error messages and interactive docs for free.",
 why: "FastAPI is the most popular Python API framework for new projects and AI services. Building your own API shows you understand both sides of an integration.",
 steps: [
  { h: "A first endpoint",
    p: ["Create an app, then decorate a function with the method and path. Return a dict and FastAPI sends JSON.",
        "Run it with <code>uvicorn main:app --reload</code> and open <code>http://localhost:8000/docs</code> for interactive docs. In lessons we call it with FastAPI's <code>TestClient</code>, which works without a server."],
    code: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

client = TestClient(app)
r = client.get("/health")
print(r.status_code, r.json())` },
  { h: "Path and query parameters",
    p: ["<code>{order_id}</code> in the path becomes a function argument. Other arguments become query parameters. Type hints convert and validate them."],
    code: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
ORDERS = {1: {"id": 1, "status": "completed", "total": 55000},
          2: {"id": 2, "status": "pending", "total": 6900}}

@app.get("/orders/{order_id}")
def get_order(order_id: int):
    if order_id not in ORDERS:
        raise HTTPException(status_code=404, detail="Order not found")
    return ORDERS[order_id]

@app.get("/orders")
def list_orders(status: str | None = None, limit: int = 10):
    rows = [o for o in ORDERS.values() if status in (None, o["status"])]
    return rows[:limit]

c = TestClient(app)
print(c.get("/orders/1").json())
print(c.get("/orders/9").status_code, c.get("/orders/9").json())
print(c.get("/orders", params={"status": "pending"}).json())
print(c.get("/orders/abc").status_code)` },
  { h: "Request bodies with Pydantic",
    p: ["Declare a Pydantic model as a parameter and FastAPI reads, validates and converts the JSON body. Bad data gets an automatic <b>422</b> with details."],
    code: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

app = FastAPI()

class Item(BaseModel):
    sku: str
    qty: int = Field(gt=0)

class OrderIn(BaseModel):
    customer_id: int
    items: list[Item] = Field(min_length=1)

@app.post("/orders", status_code=201)
def create_order(order: OrderIn):
    return {"id": 101, "status": "pending", **order.model_dump()}

c = TestClient(app)
ok = c.post("/orders", json={"customer_id": 1, "items": [{"sku": "TEA", "qty": 2}]})
print(ok.status_code, ok.json())
bad = c.post("/orders", json={"customer_id": 1, "items": [{"sku": "TEA", "qty": 0}]})
print(bad.status_code, bad.json()["detail"][0]["msg"])` },
  { h: "Response models: control what goes out",
    p: ["<code>response_model</code> filters the output to the fields you declare, so internal fields (like cost price or password hashes) never leak."],
    code: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class ProductOut(BaseModel):
    id: int
    name: str
    price: float

DB = {1: {"id": 1, "name": "Laptop", "price": 55000, "cost_price": 41000, "supplier_secret": "x"}}

@app.get("/products/{pid}", response_model=ProductOut)
def get_product(pid: int):
    return DB[pid]

print(TestClient(app).get("/products/1").json())` },
  { h: "Dependencies: shared logic",
    p: ["<code>Depends</code> runs a function before your endpoint, for things like database sessions, the current user or an API-key check. Write it once, reuse it everywhere."],
    code: `from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
VALID_KEYS = {"test-key": "partner-a"}

def current_partner(x_api_key: str = Header(default="")):
    if x_api_key not in VALID_KEYS:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return VALID_KEYS[x_api_key]

@app.get("/me")
def me(partner: str = Depends(current_partner)):
    return {"partner": partner}

c = TestClient(app)
print(c.get("/me").status_code)
print(c.get("/me", headers={"X-API-Key": "test-key"}).json())` }
 ],
 mistakes: [
  "Returning your database rows directly. Use a <code>response_model</code> so secret fields never leak.",
  "Returning 200 for everything. Use 201 for created, 404 for missing, 422 for bad input.",
  "Putting all logic inside the endpoint. Keep endpoints thin; put business logic in plain functions you can test.",
  "Doing slow blocking work (big files, sync HTTP calls) inside <code>async def</code> endpoints. Use plain <code>def</code> or async libraries."
 ],
 practice: [
  { q: "Add <code>PATCH /orders/{id}</code> that changes only the status, allowing 'pending', 'completed' or 'cancelled'.", code: `from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
ORDERS = {1: {"id": 1, "status": "pending"}}

class StatusUpdate(BaseModel):
    status: Literal["pending", "completed", "cancelled"]

@app.patch("/orders/{oid}")
def update_status(oid: int, body: StatusUpdate):
    if oid not in ORDERS:
        raise HTTPException(404, "Order not found")
    ORDERS[oid]["status"] = body.status
    return ORDERS[oid]

c = TestClient(app)
print(c.patch("/orders/1", json={"status": "completed"}).json())
print(c.patch("/orders/1", json={"status": "lost"}).status_code)` },
  { q: "Where do you see the interactive docs of a running FastAPI app?", a: "At <code>/docs</code> (Swagger UI) and <code>/redoc</code>. The raw OpenAPI spec is at <code>/openapi.json</code>, which you can share with partners or use to generate clients." }
 ],
 check: [
  ["A FastAPI endpoint gets a body that fails the Pydantic model. Status?", ["200", "400", "422", "500"], 2, "FastAPI returns 422 with details."],
  ["What does response_model do?", ["Speeds up responses", "Shapes and filters the output to declared fields", "Validates the request", "Adds auth"], 1, "It stops extra fields leaking."],
  ["Best place for an API-key check used by many endpoints?", ["Copy it into each endpoint", "A dependency with Depends", "The client", "A comment"], 1, "Dependencies are reusable checks."]
 ],
 remember: [
  "@app.get/post/patch/delete(\"/path/{id}\") on a normal function.",
  "Path params from {id}; other args = query params; Pydantic model arg = JSON body.",
  "Bad input → automatic 422. Raise HTTPException(404, \"…\") for your own errors.",
  "response_model controls output; Depends() for shared checks.",
  "Run: uvicorn main:app --reload; docs at /docs. Test with TestClient."
 ]
},
{
 id: "secrets",
 title: "Keeping secrets safe: API keys and environment variables",
 level: "Beginner+",
 one: "API keys and passwords must never be in your code or Git. Keep them in <b>environment variables</b> (often loaded from a <code>.env</code> file that Git ignores).",
 why: "Leaked keys are one of the most common and expensive mistakes: bots scan GitHub for keys within minutes. Clients will trust you with their credentials, so this habit matters from day one.",
 steps: [
  { h: "The wrong way",
    p: ["A key written in code ends up in Git history, screenshots, logs and every copy of the repo. Deleting it later doesn't remove it from history."],
    code: `API_KEY = "sk_live_51H...abc"   # never do this
client = PaymentClient(API_KEY)`, run: false },
  { h: "Read from environment variables",
    p: ["The environment is a set of name=value settings given to your program by the system. <code>os.environ</code> reads them. Fail early with a clear message if a required one is missing."],
    pre: `import os; os.environ["SHOP_API_KEY"] = "test-key"`,
    code: `import os

api_key = os.environ.get("SHOP_API_KEY")
if not api_key:
    raise RuntimeError("SHOP_API_KEY is not set")
print("key loaded:", "****" + api_key[-4:])

timeout = int(os.environ.get("SHOP_TIMEOUT", "10"))
print("timeout:", timeout)` },
  { h: "A .env file for local development",
    p: ["Put local secrets in <code>.env</code>, add it to <code>.gitignore</code>, and commit a <code>.env.example</code> with the names but fake values. <code>python-dotenv</code> loads the file into the environment."],
    files: { ".env": "SHOP_API_KEY=test-key\nSHOP_BASE_URL=https://api.example-shop.com\n" },
    code: `from dotenv import load_dotenv
import os

load_dotenv()          # reads .env in the current folder
print(os.environ["SHOP_BASE_URL"])
print("key set:", bool(os.environ.get("SHOP_API_KEY")))` },
  { h: "The files to commit and to ignore",
    code: `# .gitignore
.env
.venv/

# .env.example   (committed: tells teammates what to set)
SHOP_API_KEY=your-key-here
SHOP_BASE_URL=https://api.example-shop.com`, lang: "text",
    p: ["In production, secrets come from the hosting platform's settings (Netlify, Vercel, Render environment variables) or a secret manager (AWS Secrets Manager, GCP Secret Manager, Vault), never from a file in the repo."] },
  { h: "Settings in one place",
    p: ["In bigger apps, load all settings once into one object and pass it around. <code>pydantic-settings</code> does this with validation; a small dataclass works too."],
    pre: `import os; os.environ.update({"SHOP_API_KEY": "test-key", "SHOP_TIMEOUT": "5"})`,
    code: `import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    api_key: str
    base_url: str = "https://api.example-shop.com"
    timeout: int = 10

def load_settings() -> Settings:
    return Settings(
        api_key=os.environ["SHOP_API_KEY"],
        timeout=int(os.environ.get("SHOP_TIMEOUT", 10)),
    )

s = load_settings()
print(s.base_url, s.timeout, "key ok" if s.api_key else "missing")` },
  { h: "If a key leaks",
    p: ["<b>1.</b> Revoke/rotate it immediately in the provider's dashboard: that's the only real fix. <b>2.</b> Check the provider's logs for misuse. <b>3.</b> Remove it from the code and history (<code>git filter-repo</code>), but assume it's already been copied.",
        "Prevent it: turn on GitHub secret scanning, and use a pre-commit hook such as <code>gitleaks</code>."] }
 ],
 mistakes: [
  "Committing <code>.env</code>. Add it to .gitignore before your first commit.",
  "Printing or logging full keys. Log only the last few characters, if anything.",
  "Putting secret keys in frontend (browser) code. Anyone can read them. Only public keys (like a Supabase anon key) belong there.",
  "Sharing keys in chat or email. Use the platform's secret settings or a password manager."
 ],
 practice: [
  { q: "Write code that reads <code>DB_URL</code> and fails with a helpful message if it's missing.", code: `import os

def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} is not set. Add it to your .env file.")
    return value

try:
    require_env("DB_URL")
except RuntimeError as e:
    print(e)` },
  { q: "You pushed a commit with a live Stripe key 10 minutes ago. What do you do first?", a: "Rotate (revoke) the key in the Stripe dashboard right now, then check recent activity for misuse. Removing it from Git comes after: once pushed, assume it's been copied." }
 ],
 check: [
  ["Where should a production API key live?", ["In the code", "In the hosting platform's environment variables or a secret manager", "In README.md", "In a comment"], 1, "Never in code or Git."],
  ["What goes in .env.example?", ["Real keys", "Variable names with fake values", "Nothing", "Passwords"], 1, "It documents what to set, without secrets."],
  ["A key leaked on GitHub. The real fix is…", ["Delete the file", "Rotate the key", "Make the repo private", "Rename the variable"], 1, "Only rotating makes the leaked key useless."]
 ],
 remember: [
  "Secrets never in code or Git. Read with os.environ.get(\"NAME\").",
  "Local: .env (git-ignored) + .env.example (committed). load_dotenv().",
  "Production: platform env vars or a secret manager.",
  "Fail early if a required setting is missing.",
  "Leaked? Rotate first, investigate, then clean history."
 ]
},
{
 id: "auth",
 title: "Authentication: API keys, tokens, OAuth and JWT",
 level: "Intermediate",
 one: "<b>Authentication</b> proves who is calling. APIs use <b>API keys</b>, <b>Bearer tokens</b>, <b>OAuth 2</b> (log in with a provider and get a token) and <b>JWTs</b> (signed tokens that carry information).",
 why: "Every API you integrate needs a different auth method. Getting tokens, refreshing them and keeping them safe is a daily part of integration work.",
 steps: [
  { h: "API keys",
    p: ["The simplest: a long secret string sent in a header on every request (<code>X-API-Key: …</code> or <code>Authorization: Bearer …</code>). Good for server-to-server calls."],
    pre: FAKE_SHOP,
    code: `import httpx

body = {"customer_id": 1, "items": [{"sku": "TEA", "qty": 2}]}
r = httpx.post("https://api.example-shop.com/orders", json=body, timeout=10)
print("without key:", r.status_code, r.json())

r = httpx.post("https://api.example-shop.com/orders", json=body, timeout=10,
               headers={"Authorization": "Bearer test-key"})
print("with key:", r.status_code, r.json()["id"], r.headers["location"])` },
  { h: "Basic auth",
    p: ["Username and password, base64-encoded in a header. Base64 is <b>not encryption</b>: anyone can decode it, so Basic auth is only safe over HTTPS."],
    code: `import base64

token = base64.b64encode(b"shop_user:s3cret").decode()
print("Authorization: Basic " + token)
print(base64.b64decode(token).decode())` },
  { h: "OAuth 2: tokens instead of passwords",
    p: ["OAuth lets an app act for a user or a system without seeing a password. You exchange something for an <b>access token</b> (short-lived, maybe 1 hour) and often a <b>refresh token</b> (to get new access tokens).",
        "<b>Client credentials</b> (machine to machine): your app sends its client id + secret to the token URL and gets a token. <b>Authorization code</b> (a user logs in): the user approves on the provider's page (the “Sign in with Google” screen), your app gets a code, then swaps it for tokens."],
    code: `POST https://auth.example.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=abc&client_secret=xyz&scope=orders.read

HTTP/1.1 200 OK
{"access_token": "eyJhbGciOi...", "token_type": "Bearer", "expires_in": 3600}`, lang: "http" },
  { h: "Caching and refreshing tokens",
    p: ["Don't fetch a new token on every call. Keep it, and get a new one shortly before it expires (or when you get a 401)."],
    code: `import time

class TokenCache:
    def __init__(self, fetch_token, clock=time.time):
        self.fetch_token, self.clock = fetch_token, clock
        self.token, self.expires_at = None, 0

    def get(self):
        if self.token is None or self.clock() > self.expires_at - 60:
            data = self.fetch_token()
            self.token = data["access_token"]
            self.expires_at = self.clock() + data["expires_in"]
            print("fetched a new token")
        return self.token

calls = 0
def fake_token_endpoint():
    global calls
    calls += 1
    return {"access_token": f"token-{calls}", "expires_in": 3600}

now = [1000.0]
cache = TokenCache(fake_token_endpoint, clock=lambda: now[0])
print(cache.get()); print(cache.get())
now[0] += 3580          # almost an hour later
print(cache.get())` },
  { h: "JWT: a signed token you can read",
    p: ["A <b>JWT</b> has three base64 parts: header.payload.signature. Anyone can <b>read</b> the payload; only someone with the key can <b>create</b> a valid signature. So never put secrets in a JWT, and always <b>verify</b> the signature before trusting it."],
    code: `import jwt, time

SECRET = "server-side-secret"
token = jwt.encode({"sub": "user-42", "role": "admin", "exp": int(time.time()) + 3600}, SECRET, algorithm="HS256")
print(token[:40] + "...")

print(jwt.decode(token, SECRET, algorithms=["HS256"])["role"])

tampered = jwt.encode({"sub": "user-42", "role": "admin"}, "wrong-secret", algorithm="HS256")
try:
    jwt.decode(tampered, SECRET, algorithms=["HS256"])
except jwt.InvalidSignatureError as e:
    print("rejected:", e)` }
 ],
 mistakes: [
  "Trusting a JWT without verifying the signature (or allowing the <code>none</code> algorithm). Always decode with your key and a fixed algorithm list.",
  "Fetching a new OAuth token on every request. You'll hit the provider's limits. Cache it until it nearly expires.",
  "Storing user passwords instead of using OAuth or a proper auth provider.",
  "Sending credentials over plain http://. Always HTTPS."
 ],
 practice: [
  { q: "A partner API returns 401 halfway through a long sync. What's the likely cause and fix?", a: "The access token expired. Refresh it (or fetch a new one with client credentials), then retry that request once. Better: refresh proactively a minute before <code>expires_in</code> runs out." },
  { q: "Create a JWT that expires in 1 second, wait 2 seconds, and show that decoding fails.", code: `import jwt, time

t = jwt.encode({"sub": "u1", "exp": int(time.time()) + 1}, "k", algorithm="HS256")
time.sleep(2)
try:
    jwt.decode(t, "k", algorithms=["HS256"])
except jwt.ExpiredSignatureError:
    print("token expired")` }
 ],
 check: [
  ["Is Basic auth's base64 encoding secure on its own?", ["Yes", "No, anyone can decode it; it needs HTTPS", "Only with long passwords", "Only on mobile"], 1, "Base64 is encoding, not encryption."],
  ["Can anyone read a JWT's payload?", ["No, it's encrypted", "Yes; the signature only proves it wasn't changed", "Only admins", "Only with the key"], 1, "Don't put secrets in JWTs."],
  ["Machine-to-machine OAuth usually uses…", ["Authorization code with a login page", "Client credentials", "Basic auth", "Cookies"], 1, "No user involved, so the app uses its own id and secret."]
 ],
 remember: [
  "API key / Bearer token in a header on every call. HTTPS only.",
  "Basic = base64(user:pass): encoding, not encryption.",
  "OAuth 2: client credentials (machine) or authorization code (user login) → access token (+ refresh token).",
  "Cache tokens; refresh before expiry or on 401, then retry once.",
  "JWT = header.payload.signature. Readable by anyone; always verify the signature."
 ]
},
{
 id: "webhooks",
 title: "Webhooks: receiving events safely",
 level: "Intermediate",
 one: "A <b>webhook</b> is an API calling <i>you</i>: when something happens (payment succeeded, order shipped), the provider sends an HTTP POST to your URL.",
 why: "Payments, e-commerce, CRMs and messaging all use webhooks. Handling them safely (verify, deduplicate, respond fast) is a core integration skill and a common interview topic.",
 steps: [
  { h: "Polling vs webhooks",
    p: ["<b>Polling</b>: you ask “anything new?” every minute. Simple, but wasteful and slow to notice changes. <b>Webhooks</b>: they tell you the moment it happens. Most systems use webhooks, plus a small poll as a safety net in case some are missed."] },
  { h: "Verify the signature",
    p: ["Anyone can POST to your URL, so providers <b>sign</b> each webhook: they compute an HMAC of the raw body with a shared secret and send it in a header. You compute the same and compare. If they don't match, reject it (401)."],
    code: `import hmac, hashlib

SECRET = b"whsec_test_123"

def sign(body: bytes) -> str:
    return hmac.new(SECRET, body, hashlib.sha256).hexdigest()

def is_valid(body: bytes, signature: str) -> bool:
    return hmac.compare_digest(sign(body), signature)

body = b'{"event_id": "evt_1", "type": "payment.succeeded", "order_id": 6}'
good_sig = sign(body)
print(is_valid(body, good_sig))
print(is_valid(b'{"event_id": "evt_1", "type": "payment.succeeded", "order_id": 7}', good_sig))`,
    note: "Use <code>hmac.compare_digest</code>, not <code>==</code>: it takes the same time whatever the input, so attackers can't guess the signature by timing. Verify the <b>raw bytes</b>, before parsing JSON." },
  { h: "Deduplicate: the same event can arrive twice",
    p: ["Providers retry when they don't get a 2xx fast enough, so you <b>will</b> receive duplicates. Store each event id and skip ones you've already processed. This makes your handler <b>idempotent</b>."],
    code: `processed = set()      # in real life: a database table with a UNIQUE event_id

def handle(event: dict) -> str:
    if event["event_id"] in processed:
        return "duplicate, ignored"
    processed.add(event["event_id"])
    return f"marked order {event['order_id']} as paid"

e = {"event_id": "evt_1", "type": "payment.succeeded", "order_id": 6}
print(handle(e))
print(handle(e))` },
  { h: "Respond fast, work later",
    p: ["Providers wait only a few seconds. Verify, save the event, return <b>200</b> immediately, and do slow work (emails, updating other systems) in a background worker. A complete receiver:"],
    code: `import hmac, hashlib, json
from fastapi import FastAPI, Request, HTTPException
from fastapi.testclient import TestClient

SECRET = b"whsec_test_123"
app = FastAPI()
seen, queue = set(), []

@app.post("/webhooks/payments")
async def payments_webhook(request: Request):
    raw = await request.body()
    expected = hmac.new(SECRET, raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, request.headers.get("X-Signature", "")):
        raise HTTPException(401, "bad signature")
    event = json.loads(raw)
    if event["event_id"] in seen:
        return {"status": "duplicate"}
    seen.add(event["event_id"])
    queue.append(event)            # a worker processes this later
    return {"status": "queued"}

c = TestClient(app)
body = json.dumps({"event_id": "evt_9", "type": "payment.succeeded", "order_id": 6}).encode()
sig = hmac.new(SECRET, body, hashlib.sha256).hexdigest()
print(c.post("/webhooks/payments", content=body, headers={"X-Signature": sig}).json())
print(c.post("/webhooks/payments", content=body, headers={"X-Signature": sig}).json())
print(c.post("/webhooks/payments", content=body, headers={"X-Signature": "fake"}).status_code)
print("queue:", queue)` },
  { h: "Events can arrive out of order",
    p: ["“order.updated” might arrive before “order.created”. Don't trust arrival order: compare a timestamp or version in the event, or fetch the latest state from the API when an event arrives."] },
  { h: "Testing webhooks locally",
    p: ["Your laptop isn't reachable from the internet. Use a tunnel (<code>ngrok http 8000</code> or <code>cloudflared</code>) to get a public URL, or the provider's CLI (for example <code>stripe listen --forward-to localhost:8000/webhooks</code>). Most providers also have a “send test event” button and a delivery log."] }
 ],
 mistakes: [
  "Not verifying signatures. Anyone could fake “payment succeeded”.",
  "Verifying after parsing and re-serialising the JSON. The bytes change and the signature fails. Verify the raw body.",
  "Doing slow work before responding. The provider times out, retries, and you process it twice.",
  "Assuming each event arrives exactly once and in order."
 ],
 practice: [
  { q: "Write <code>handle_once(event, store)</code> that processes an event only the first time its id is seen, and returns whether it did work.", code: `def handle_once(event, store):
    if event["id"] in store:
        return False
    store.add(event["id"])
    return True

store = set()
print([handle_once({"id": i}, store) for i in ["a", "b", "a", "c", "b"]])` },
  { q: "The provider says your endpoint “timed out” on 30% of deliveries. Why, and how do you fix it?", a: "Your handler does slow work before returning. Return 200 as soon as you've verified and saved the event, and move the work to a background job or queue." }
 ],
 check: [
  ["Why do providers sign webhooks?", ["To compress them", "So you can verify they really came from the provider and weren't changed", "For speed", "For logging"], 1, "Your URL is public; signatures prove origin."],
  ["You receive the same event twice. Best handling?", ["Process it twice", "Store event ids and skip ones already processed", "Return 500", "Ignore all events"], 1, "Idempotency via event id."],
  ["When should a webhook handler return 200?", ["After all the slow work", "As soon as the event is verified and safely stored", "Never", "Only on Mondays"], 1, "Respond fast; process in the background."]
 ],
 remember: [
  "Webhook = provider POSTs to your URL when something happens.",
  "Verify HMAC of the raw body with compare_digest; reject bad ones (401).",
  "Expect duplicates: store event ids (UNIQUE) and skip repeats.",
  "Verify → save → return 200 fast → work in the background.",
  "Order isn't guaranteed: use timestamps/versions or re-fetch state."
 ]
},
{
 id: "rate-limits",
 title: "Rate limits, retries, timeouts and pagination",
 level: "Intermediate",
 one: "Real APIs fail, slow down and limit you. Reliable code uses <b>timeouts</b>, <b>retries with backoff</b> for temporary errors, respects <b>429 rate limits</b>, and walks through <b>pages</b> of results.",
 why: "The difference between a demo and a production integration is how it behaves when the other side misbehaves. This is exactly what clients pay integration engineers for.",
 steps: [
  { h: "Timeouts",
    p: ["Without a timeout, a hung server hangs your program. Catch the timeout and decide: retry, or fail with a clear message."],
    pre: FAKE_SHOP,
    code: `import httpx

try:
    httpx.get("https://api.example-shop.com/slow", timeout=5)
except httpx.TimeoutException:
    print("the shop API didn't answer in 5s")` },
  { h: "Retry with exponential backoff",
    p: ["For 429, 5xx and network errors, wait and try again: 1s, 2s, 4s… (<b>exponential backoff</b>), plus a little randomness (<b>jitter</b>) so many clients don't retry at the same moment. Give up after a few tries."],
    pre: FAKE_SHOP,
    code: `import httpx, random, time

RETRY_ON = {429, 500, 502, 503, 504}

def get_with_retry(url, tries=4, base=1.0):
    for attempt in range(1, tries + 1):
        r = httpx.get(url, timeout=10)
        if r.status_code not in RETRY_ON:
            return r
        if attempt == tries:
            r.raise_for_status()
        wait = float(r.headers.get("Retry-After", base * 2 ** (attempt - 1)))
        wait += random.uniform(0, 0.3)
        print(f"attempt {attempt}: {r.status_code}, retrying")
        time.sleep(wait)

random.seed(1)
r = get_with_retry("https://api.example-shop.com/flaky")
print("finally:", r.status_code, r.json())`,
    note: "The fake API fails twice with 503, then works. (Waits are skipped in this demo.) If the server sends a <code>Retry-After</code> header, wait that long instead." },
  { h: "Rate limits (429)",
    p: ["APIs allow a number of calls per second or minute. Over the limit you get <b>429 Too Many Requests</b>, often with <code>Retry-After</code>. Respect it, and slow yourself down before you hit it: many APIs send headers like <code>X-RateLimit-Remaining</code>.",
        "A simple way to stay under “5 calls per second” is to space calls out:"],
    code: `import time

class Throttle:
    def __init__(self, per_second: float, clock=time.monotonic, sleep=time.sleep):
        self.gap, self.clock, self.sleep = 1 / per_second, clock, sleep
        self.next_ok = 0.0

    def wait(self):
        now = self.clock()
        if now < self.next_ok:
            self.sleep(self.next_ok - now)
            now = self.next_ok
        self.next_ok = now + self.gap

t = [0.0]
def fake_sleep(s):
    print(f"  wait {s:.2f}s"); t[0] += s

th = Throttle(per_second=5, clock=lambda: t[0], sleep=fake_sleep)
for i in range(4):
    th.wait()
    print(f"call {i + 1} at t={t[0]:.2f}s")` },
  { h: "Pagination: getting all the results",
    p: ["APIs return big lists in pages. Keep asking for the next page until there isn't one. Styles: page numbers (<code>?page=2</code>), offsets (<code>?offset=100</code>) or <b>cursors</b> (<code>?cursor=abc</code>, the most reliable for changing data)."],
    pre: FAKE_SHOP,
    code: `import httpx

def all_orders(status=None):
    page = 1
    with httpx.Client(base_url="https://api.example-shop.com", timeout=10) as client:
        while page:
            r = client.get("/orders", params={"page": page, "page_size": 3, **({"status": status} if status else {})})
            r.raise_for_status()
            body = r.json()
            print(f"page {page}: {len(body['data'])} orders")
            yield from body["data"]
            page = body["next_page"]

orders = list(all_orders())
print(len(orders), "orders total:", [o["id"] for o in orders])`,
    note: "<code>yield</code> makes a <b>generator</b>: it hands back orders one by one as pages arrive, so huge result sets don't fill memory." },
  { h: "Don't retry everything",
    p: ["Retrying a POST that actually succeeded (but whose response got lost) can create duplicates. Only retry POSTs when the API supports an <b>idempotency key</b>: a unique id you send in a header, so the server knows it's the same request.",
        "<code>Idempotency-Key: 6f1c…</code> → second try with the same key returns the first result instead of creating a second order."] }
 ],
 mistakes: [
  "Retrying instantly in a tight loop. You make the outage worse and get banned. Back off.",
  "Retrying 400/401/422. They won't fix themselves.",
  "Retrying forever. Cap the attempts and alert a human.",
  "Fetching only page 1 and thinking you have all the data.",
  "Retrying POSTs without an idempotency key → duplicate orders or payments."
 ],
 practice: [
  { q: "Print the wait times for exponential backoff with base 0.5s over 5 attempts (no jitter).", code: `print([0.5 * 2 ** (a - 1) for a in range(1, 6)])` },
  { q: "Call the fake <code>/busy</code> endpoint, which returns 429 twice with Retry-After: 1, and retry until it works.", pre: FAKE_SHOP, code: `import httpx, time

for attempt in range(1, 5):
    r = httpx.get("https://api.example-shop.com/busy", timeout=10)
    if r.status_code != 429:
        print("ok:", r.json())
        break
    wait = float(r.headers.get("Retry-After", 1))
    print(f"429, waiting {wait}s as asked")
    time.sleep(wait)` },
  { q: "Why are cursor-based pages safer than page numbers when new orders keep arriving?", a: "With page numbers, a new order shifts everything down, so you can see one item twice or skip one. A cursor points to “after this exact item”, so inserts don't shift your position." }
 ],
 check: [
  ["Which responses should be retried?", ["400, 404", "429, 503", "401, 403", "422"], 1, "Temporary errors only."],
  ["What is exponential backoff?", ["Retry instantly", "Wait longer after each failure: 1s, 2s, 4s…", "Never retry", "Retry every 1s forever"], 1, "Plus jitter, with a max number of tries."],
  ["How do you safely retry a POST that creates a payment?", ["Just retry", "Send the same idempotency key with each try", "Use GET instead", "Retry with a new body"], 1, "The server recognises the repeat and doesn't create a second one."]
 ],
 remember: [
  "Always set timeouts; catch TimeoutException.",
  "Retry 429/5xx/network errors with exponential backoff + jitter, max N tries.",
  "Honour Retry-After; throttle yourself below the limit.",
  "Paginate until there's no next page; cursors beat page numbers.",
  "Retry POSTs only with an idempotency key."
 ]
},
{
 id: "build-api",
 title: "Project: build and test a small orders API",
 level: "Project",
 one: "Build a small but real API: create and list orders, validate input, protect writes with an API key, handle errors properly, and prove it all with tests.",
 why: "A working, tested API is the best portfolio proof for integration and backend roles. Interviewers love asking you to walk through one you built.",
 steps: [
  { h: "The plan",
    p: ["<code>POST /orders</code> create (API key required) · <code>GET /orders</code> list with optional status filter · <code>GET /orders/{id}</code> one order · <code>PATCH /orders/{id}</code> change status.",
        "Files: <code>app.py</code> (the API) and <code>test_app.py</code> (tests). Storage is a dict here; swapping in a database later doesn't change the API."] },
  { h: "The API",
    code: `# app.py
import os
from typing import Literal
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Orders API")
API_KEY = os.environ.get("ORDERS_API_KEY", "dev-key")
DB: dict[int, dict] = {}

class Item(BaseModel):
    sku: str = Field(min_length=1)
    qty: int = Field(gt=0)
    price: float = Field(gt=0)

class OrderIn(BaseModel):
    customer_email: str
    items: list[Item] = Field(min_length=1)

class OrderOut(OrderIn):
    id: int
    status: Literal["pending", "completed", "cancelled"]
    total: float

class StatusIn(BaseModel):
    status: Literal["pending", "completed", "cancelled"]

def require_key(x_api_key: str = Header(default="")):
    if x_api_key != API_KEY:
        raise HTTPException(401, "Invalid API key")

@app.post("/orders", response_model=OrderOut, status_code=201, dependencies=[Depends(require_key)])
def create_order(body: OrderIn):
    oid = len(DB) + 1
    total = round(sum(i.qty * i.price for i in body.items), 2)
    DB[oid] = {"id": oid, "status": "pending", "total": total, **body.model_dump()}
    return DB[oid]

@app.get("/orders", response_model=list[OrderOut])
def list_orders(status: str | None = None):
    return [o for o in DB.values() if status in (None, o["status"])]

@app.get("/orders/{oid}", response_model=OrderOut)
def get_order(oid: int):
    if oid not in DB:
        raise HTTPException(404, "Order not found")
    return DB[oid]

@app.patch("/orders/{oid}", response_model=OrderOut, dependencies=[Depends(require_key)])
def set_status(oid: int, body: StatusIn):
    order = get_order(oid)
    if order["status"] == "cancelled":
        raise HTTPException(409, "Cancelled orders can't change")
    order["status"] = body.status
    return order`, run: false },
  { h: "The tests",
    p: ["Tests cover the happy path, auth, validation, not-found and the business rule (cancelled orders are final). They run in well under a second."],
    files: { "app.py": `import os
from typing import Literal
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Orders API")
API_KEY = os.environ.get("ORDERS_API_KEY", "dev-key")
DB: dict[int, dict] = {}

class Item(BaseModel):
    sku: str = Field(min_length=1)
    qty: int = Field(gt=0)
    price: float = Field(gt=0)

class OrderIn(BaseModel):
    customer_email: str
    items: list[Item] = Field(min_length=1)

class OrderOut(OrderIn):
    id: int
    status: Literal["pending", "completed", "cancelled"]
    total: float

class StatusIn(BaseModel):
    status: Literal["pending", "completed", "cancelled"]

def require_key(x_api_key: str = Header(default="")):
    if x_api_key != API_KEY:
        raise HTTPException(401, "Invalid API key")

@app.post("/orders", response_model=OrderOut, status_code=201, dependencies=[Depends(require_key)])
def create_order(body: OrderIn):
    oid = len(DB) + 1
    total = round(sum(i.qty * i.price for i in body.items), 2)
    DB[oid] = {"id": oid, "status": "pending", "total": total, **body.model_dump()}
    return DB[oid]

@app.get("/orders", response_model=list[OrderOut])
def list_orders(status: str | None = None):
    return [o for o in DB.values() if status in (None, o["status"])]

@app.get("/orders/{oid}", response_model=OrderOut)
def get_order(oid: int):
    if oid not in DB:
        raise HTTPException(404, "Order not found")
    return DB[oid]

@app.patch("/orders/{oid}", response_model=OrderOut, dependencies=[Depends(require_key)])
def set_status(oid: int, body: StatusIn):
    order = get_order(oid)
    if order["status"] == "cancelled":
        raise HTTPException(409, "Cancelled orders can't change")
    order["status"] = body.status
    return order
` },
    code: `# test_app.py
import pytest
from fastapi.testclient import TestClient
from app import app, DB

KEY = {"X-API-Key": "dev-key"}
ORDER = {"customer_email": "asha@example.com", "items": [{"sku": "TEA", "qty": 2, "price": 400}]}

@pytest.fixture(autouse=True)
def clean_db():
    DB.clear()

@pytest.fixture
def client():
    return TestClient(app)

def test_create_and_get(client):
    r = client.post("/orders", json=ORDER, headers=KEY)
    assert r.status_code == 201
    assert r.json()["total"] == 800
    assert client.get(f"/orders/{r.json()['id']}").json()["status"] == "pending"

def test_create_needs_key(client):
    assert client.post("/orders", json=ORDER).status_code == 401

@pytest.mark.parametrize("bad", [{"items": []}, {"items": [{"sku": "TEA", "qty": 0, "price": 400}]}])
def test_bad_input_is_422(client, bad):
    assert client.post("/orders", json={**ORDER, **bad}, headers=KEY).status_code == 422

def test_missing_order_is_404(client):
    assert client.get("/orders/999").status_code == 404

def test_filter_by_status(client):
    client.post("/orders", json=ORDER, headers=KEY)
    oid = client.post("/orders", json=ORDER, headers=KEY).json()["id"]
    client.patch(f"/orders/{oid}", json={"status": "completed"}, headers=KEY)
    assert [o["id"] for o in client.get("/orders", params={"status": "completed"}).json()] == [oid]

def test_cancelled_is_final(client):
    oid = client.post("/orders", json=ORDER, headers=KEY).json()["id"]
    client.patch(f"/orders/{oid}", json={"status": "cancelled"}, headers=KEY)
    assert client.patch(f"/orders/{oid}", json={"status": "completed"}, headers=KEY).status_code == 409`,
    test: true, pre: "import sys; sys.path.insert(0, '.')" },
  { h: "Run it for real",
    code: `pip install fastapi uvicorn pytest httpx
uvicorn app:app --reload          # API on http://localhost:8000, docs at /docs
pytest -q                         # run the tests

curl -X POST localhost:8000/orders -H "X-API-Key: dev-key" \\
  -H "Content-Type: application/json" \\
  -d '{"customer_email":"asha@example.com","items":[{"sku":"TEA","qty":2,"price":400}]}'`, lang: "bash" },
  { h: "Make it portfolio-ready",
    p: ["Add: a README (what it does, how to run, example curl), a <code>.env.example</code>, a Dockerfile, a GitHub Actions workflow that runs pytest on every push, and swap the dict for SQLite/Postgres. Each step is covered in later courses."] }
 ],
 mistakes: [
  "No tests for the unhappy paths (401, 404, 422, 409). Those are where real bugs live.",
  "Tests that depend on each other's data. Reset state in a fixture (<code>autouse=True</code>).",
  "Hard-coding the API key. Read it from the environment, with a safe dev default only for local use."
 ],
 practice: [
  { q: "Add <code>DELETE /orders/{id}</code> that only works for pending orders (409 otherwise). Which tests would you add?", a: "Tests: deleting a pending order returns 204 and then GET gives 404; deleting a completed order returns 409; deleting a missing order returns 404; deleting without the API key returns 401." },
  { q: "How would you stop two clients creating the same order twice when they retry?", a: "Accept an <code>Idempotency-Key</code> header. Store key → created order id. If the same key comes again, return the stored order instead of creating a new one." }
 ],
 check: [
  ["Which status for changing a cancelled order?", ["200", "404", "409 Conflict", "500"], 2, "409 = the request conflicts with the current state."],
  ["What does an autouse fixture that clears the DB give you?", ["Faster tests", "Each test starts from a clean state", "More coverage", "Nothing"], 1, "Tests stay independent."],
  ["Best proof your API works?", ["It ran once on your laptop", "Automated tests covering success and failure cases", "A screenshot", "Comments"], 1, "Tests prove it, every time."]
 ],
 remember: [
  "Endpoints: thin; validation in Pydantic; rules in code you can test.",
  "Status codes: 201 created, 401 no key, 404 missing, 409 conflict, 422 bad input.",
  "Tests: happy path + every error path; reset state per test.",
  "Key from environment; README + .env.example + CI make it portfolio-ready."
 ]
}
];
