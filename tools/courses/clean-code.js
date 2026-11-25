// OOP, Design Patterns & Testing. All examples run.
module.exports = [
{
 id: "oop",
 title: "Object-oriented design: encapsulation, inheritance, composition",
 level: "Intermediate",
 one: "Good object-oriented design groups data with the behaviour that protects it (<b>encapsulation</b>), shares behaviour through <b>interfaces</b> (polymorphism), and prefers <b>composition</b> (objects that hold other objects) over deep <b>inheritance</b>.",
 why: "Every framework you'll use (Django, FastAPI, Spring, Odoo) is object-oriented. Interviewers ask you to model things like a parking lot or a shopping cart to see how you think.",
 steps: [
  { h: "Encapsulation: protect the rules",
    p: ["Keep data and the rules about it together, and change state only through methods that enforce the rules. A leading underscore signals “internal”."],
    code: `class Account:
    def __init__(self, owner: str):
        self.owner = owner
        self._balance = 0
        self._history = []

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount: int):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount
        self._history.append(("deposit", amount))

    def withdraw(self, amount: int):
        if amount > self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount
        self._history.append(("withdraw", amount))

a = Account("Asha")
a.deposit(1000); a.withdraw(300)
print(a.balance, a._history)` },
  { h: "Polymorphism with a shared interface",
    p: ["Different classes with the same method can be used the same way. An <b>abstract base class</b> states the contract."],
    code: `from abc import ABC, abstractmethod

class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, amount: int) -> str: ...

class Card(PaymentMethod):
    def __init__(self, last4): self.last4 = last4
    def charge(self, amount): return f"charged ₹{amount} to card ••{self.last4}"

class UPI(PaymentMethod):
    def __init__(self, vpa): self.vpa = vpa
    def charge(self, amount): return f"requested ₹{amount} from {self.vpa}"

def checkout(total: int, method: PaymentMethod):
    return method.charge(total)

for m in [Card("4242"), UPI("asha@okbank")]:
    print(checkout(6900, m))` },
  { h: "Composition over inheritance",
    p: ["Inheritance says “is a”; composition says “has a”. Deep inheritance trees get rigid fast. Build objects from smaller parts instead:"],
    code: `class FlatShipping:
    def cost(self, weight_kg): return 50

class WeightShipping:
    def cost(self, weight_kg): return 30 + 20 * weight_kg

class Order:
    def __init__(self, items, shipping):
        self.items, self.shipping = items, shipping        # Order HAS a shipping strategy
    def total(self):
        goods = sum(price * qty for price, qty, _ in self.items)
        weight = sum(w * qty for _, qty, w in self.items)
        return goods + self.shipping.cost(weight)

items = [(900, 2, 1.0), (400, 1, 0.2)]
print(Order(items, FlatShipping()).total(), Order(items, WeightShipping()).total())` },
  { h: "Modelling exercise: a parking lot",
    p: ["A classic interview prompt. Find the nouns (lot, level, spot, vehicle, ticket) and the verbs (park, leave, pay). Keep each class small:"],
    code: `from dataclasses import dataclass, field
import itertools

@dataclass
class Spot:
    id: str
    size: str                 # "bike" | "car" | "truck"
    vehicle: str | None = None

SIZES = {"bike": 0, "car": 1, "truck": 2}

@dataclass
class ParkingLot:
    spots: list[Spot]
    tickets: dict = field(default_factory=dict)
    _ids: itertools.count = field(default_factory=lambda: itertools.count(1))

    def park(self, plate: str, size: str):
        for s in self.spots:
            if s.vehicle is None and SIZES[s.size] >= SIZES[size]:
                s.vehicle = plate
                tid = next(self._ids)
                self.tickets[tid] = s
                return tid
        return None

    def leave(self, ticket: int):
        spot = self.tickets.pop(ticket)
        spot.vehicle = None
        return spot.id

lot = ParkingLot([Spot("A1", "bike"), Spot("A2", "car"), Spot("B1", "truck")])
t1 = lot.park("KL-11-AB-1234", "car"); t2 = lot.park("KL-07-X-9", "truck")
print(t1, t2, lot.park("KL-01-Z-1", "car"))
print("freed", lot.leave(t1), "-> new car:", lot.park("KL-01-Z-1", "car"))` }
 ],
 mistakes: [
  "Classes that are only bags of data with logic scattered elsewhere.",
  "Deep inheritance (Vehicle → Car → ElectricCar → LuxuryElectricCar…).",
  "God classes that do everything.",
  "Letting outside code change internal state directly, bypassing the rules."
 ],
 practice: [
  { q: "Add a <code>WalletPayment</code> that fails when the wallet balance is too low, and use it in checkout.", code: `from abc import ABC, abstractmethod

class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, amount: int) -> str: ...

class Wallet(PaymentMethod):
    def __init__(self, balance): self.balance = balance
    def charge(self, amount):
        if amount > self.balance:
            raise ValueError("wallet balance too low")
        self.balance -= amount
        return f"paid ₹{amount} from wallet, ₹{self.balance} left"

w = Wallet(10_000)
print(w.charge(6900))
try:
    w.charge(6900)
except ValueError as e:
    print("failed:", e)` },
  { q: "For a library system, list the main classes and one method each.", a: "Book (is_available), Member (borrow_limit), Loan (is_overdue), Library (lend(book, member), return_book(loan)), Fine (amount_for(loan)). Keep rules (limits, due dates) inside the class that owns the data." }
 ],
 check: [
  ["Encapsulation means…", ["Making everything public", "Keeping data with the behaviour that enforces its rules", "Using inheritance", "Writing comments"], 1, "Protect invariants."],
  ["“Has a” relationships suggest…", ["Inheritance", "Composition", "Global variables", "Static methods"], 1, "Build from parts."],
  ["Why define an abstract base class?", ["Speed", "To state a contract that different implementations follow", "Required by Python", "To hide code"], 1, "Polymorphism with a clear interface."]
 ],
 remember: [
  "Encapsulate: change state only through methods that enforce rules.",
  "Polymorphism: same interface, different implementations (ABC).",
  "Prefer composition (has-a) over deep inheritance (is-a).",
  "Model problems: nouns → classes, verbs → methods; keep classes small."
 ]
},
{
 id: "solid",
 title: "SOLID principles in plain words",
 level: "Intermediate",
 one: "<b>SOLID</b> is five habits for code that's easy to change: <b>S</b>ingle responsibility, <b>O</b>pen/closed, <b>L</b>iskov substitution, <b>I</b>nterface segregation, <b>D</b>ependency inversion.",
 why: "Interviewers ask about SOLID, and more importantly these habits decide whether adding a feature takes an hour or a week.",
 steps: [
  { h: "S: one reason to change",
    p: ["A class or function should do one job. This report function fetches, calculates, formats and emails, so a change to any of those touches it:"],
    code: `# before: one function, four jobs
def monthly_report_bad(db, mailer):
    rows = db["orders"]
    total = sum(r["total"] for r in rows if r["status"] == "completed")
    html = f"<h1>Revenue: {total}</h1>"
    mailer.append(("finance@acme.com", html))

# after: each job separate, each easy to test and change
def completed_revenue(rows):    return sum(r["total"] for r in rows if r["status"] == "completed")
def render(total):              return f"<h1>Revenue: {total}</h1>"
def send(mailer, to, html):     mailer.append((to, html))

db = {"orders": [{"total": 500, "status": "completed"}, {"total": 200, "status": "cancelled"}]}
outbox = []
send(outbox, "finance@acme.com", render(completed_revenue(db["orders"])))
print(outbox)` },
  { h: "O: add, don't edit",
    p: ["Open for extension, closed for modification: adding a new case shouldn't mean editing a growing if/elif chain. Use a registry or polymorphism:"],
    code: `DISCOUNTS = {}

def discount(name):
    def register(fn):
        DISCOUNTS[name] = fn
        return fn
    return register

@discount("none")
def no_discount(total): return total

@discount("festival")
def festival(total): return total * 0.9

@discount("bulk")
def bulk(total): return total - 500 if total > 10_000 else total

for name in DISCOUNTS:
    print(name, DISCOUNTS[name](12_000))`,
    note: "A new discount is a new function; nothing existing changes, so nothing existing breaks." },
  { h: "L: subclasses must keep the promise",
    p: ["Anywhere the parent works, a child must work too. The classic violation: a <code>Square</code> that inherits <code>Rectangle</code> but breaks when width and height are set separately. If a subclass has to refuse or change the parent's behaviour, it probably shouldn't inherit."],
    code: `class Notifier:
    def send(self, to: str, msg: str) -> bool:
        raise NotImplementedError

class EmailNotifier(Notifier):
    def send(self, to, msg): return "@" in to

class BrokenSmsNotifier(Notifier):
    def send(self, to, msg): raise RuntimeError("SMS not supported")   # breaks the promise

for n in [EmailNotifier(), BrokenSmsNotifier()]:
    try:
        print(type(n).__name__, n.send("asha@example.com", "hi"))
    except RuntimeError as e:
        print(type(n).__name__, "breaks callers:", e)` },
  { h: "I: small interfaces",
    p: ["Don't force classes to implement methods they don't need. Several small interfaces beat one giant one. In Python, <code>typing.Protocol</code> describes just the methods a function needs:"],
    code: `from typing import Protocol

class CanExport(Protocol):
    def export(self) -> str: ...

class Invoice:
    def __init__(self, n): self.n = n
    def export(self): return f"INV-{self.n}.pdf"

class Report:
    def export(self): return "sales.csv"

def export_all(items: list[CanExport]):
    return [i.export() for i in items]

print(export_all([Invoice(204), Report()]))` },
  { h: "D: depend on abstractions",
    p: ["High-level logic shouldn't create its low-level tools (database, email, HTTP); it should receive them. That makes swapping and testing easy. The next lesson goes deeper (dependency injection)."],
    code: `class OrderService:
    def __init__(self, repo, notifier):      # given, not created inside
        self.repo, self.notifier = repo, notifier
    def place(self, order):
        self.repo.append(order)
        self.notifier.append(f"order {order['id']} placed")

repo, sent = [], []
OrderService(repo, sent).place({"id": 6})
print(repo, sent)` }
 ],
 mistakes: [
  "Applying every principle everywhere: tiny scripts don't need five interfaces.",
  "Huge if/elif chains for types that keep growing.",
  "Inheriting just to reuse code, then overriding methods to throw errors.",
  "Creating database or HTTP clients inside business logic."
 ],
 practice: [
  { q: "Refactor this to follow open/closed: <code>if kind == 'pdf': … elif kind == 'csv': … elif kind == 'xlsx': …</code>", code: `EXPORTERS = {
    "pdf": lambda rows: f"pdf with {len(rows)} rows",
    "csv": lambda rows: "\\n".join(",".join(map(str, r)) for r in rows),
}
def export(kind, rows):
    if kind not in EXPORTERS:
        raise ValueError(f"no exporter for {kind}")
    return EXPORTERS[kind](rows)

EXPORTERS["json"] = lambda rows: str(rows)    # new format: no existing code changed
print(export("csv", [(1, "tea"), (2, "coffee")]))
print(export("json", [(1, "tea")]))` },
  { q: "Explain SOLID's “D” in one sentence to a junior developer.", a: "Your business logic should receive the tools it uses (database, email sender, API client) from outside instead of creating them, so you can swap them (e.g. fakes in tests) without changing the logic." }
 ],
 check: [
  ["Single responsibility means a class has…", ["One method", "One reason to change", "One attribute", "One user"], 1, "One job."],
  ["Open/closed: adding a new case should…", ["Edit a big if/elif", "Add new code without changing existing code", "Rewrite the class", "Be impossible"], 1, "Extend, don't modify."],
  ["A subclass that raises 'not supported' for a parent method breaks…", ["S", "O", "L (Liskov)", "D"], 2, "Children must keep the parent's promise."]
 ],
 remember: [
  "S: one job per class/function.",
  "O: add new behaviour by adding code (registry, polymorphism).",
  "L: subclasses must work wherever the parent does.",
  "I: small, focused interfaces (Protocols).",
  "D: receive dependencies; don't create them inside logic."
 ]
},
{
 id: "clean-code",
 title: "Clean code: names, functions, errors",
 level: "Beginner+",
 one: "Clean code is code the next person (often you in six months) can read and change safely: <b>clear names</b>, <b>small functions</b>, <b>no surprises</b>, <b>explicit errors</b>, and <b>no duplication</b> of rules.",
 why: "Most of an engineer's time is spent reading code. Clean code is what reviewers, teammates and interviewers notice first.",
 steps: [
  { h: "Names that explain",
    code: `# unclear
def calc(d, t):
    r = []
    for x in d:
        if x[2] > t:
            r.append(x)
    return r

# clear
def orders_above(orders: list[tuple], min_total: int) -> list[tuple]:
    return [order for order in orders if order_total(order) > min_total]

def order_total(order: tuple) -> int:
    _id, _customer, total = order
    return total

orders = [(1, "asha", 55000), (2, "ben", 900), (3, "chen", 16000)]
print(orders_above(orders, 10_000))`,
    p: ["Names say what something is or does. Booleans read as questions (<code>is_paid</code>, <code>has_stock</code>). Avoid abbreviations nobody shares."] },
  { h: "Small functions, one level of detail",
    p: ["A function should do one thing, at one level of detail. Early returns (guard clauses) remove deep nesting:"],
    code: `def can_refund_nested(order, today):
    if order is not None:
        if order["status"] == "delivered":
            if (today - order["delivered_day"]) <= 30:
                if not order["refunded"]:
                    return True
    return False

def can_refund(order, today):
    if order is None:
        return False
    if order["status"] != "delivered" or order["refunded"]:
        return False
    return today - order["delivered_day"] <= 30

o = {"status": "delivered", "delivered_day": 100, "refunded": False}
print(can_refund_nested(o, 120), can_refund(o, 120), can_refund(o, 140))` },
  { h: "Magic numbers and duplicated rules",
    p: ["Name constants, and keep each business rule in exactly one place, so it can't be updated in one spot and forgotten in another."],
    code: `RETURN_WINDOW_DAYS = 30
GST_RATE = 0.18
FREE_SHIPPING_FROM = 999

def shipping_fee(subtotal: int) -> int:
    return 0 if subtotal >= FREE_SHIPPING_FROM else 79

def with_tax(amount: float) -> float:
    return round(amount * (1 + GST_RATE), 2)

print(shipping_fee(1200), shipping_fee(500), with_tax(1000))` },
  { h: "Explicit errors",
    p: ["Fail loudly and early with a useful message. Don't return <code>None</code> or <code>-1</code> to mean “something went wrong”, and never swallow exceptions."],
    code: `class OrderNotFound(Exception):
    pass

ORDERS = {6: {"status": "shipped"}}

def get_order(order_id: int) -> dict:
    try:
        return ORDERS[order_id]
    except KeyError:
        raise OrderNotFound(f"order {order_id} does not exist") from None

try:
    get_order(9)
except OrderNotFound as e:
    print("handled:", e)` },
  { h: "Comments explain why, not what",
    code: `# bad: repeats the code
i = i + 1  # add one to i

# good: explains a reason the code can't show
# The courier API counts days from 0 for same-day dispatch, so we add 1
# to match what customers see on the tracking page.
eta_days = courier_days + 1`, lang: "python", run: false,
    p: ["Use a formatter (<code>black</code> or <code>ruff format</code>) and a linter (<code>ruff</code>) so style is automatic and reviews focus on logic."] }
 ],
 mistakes: [
  "Names like data, temp, x2, handle_stuff.",
  "Functions longer than a screen with deep nesting.",
  "The same rule (tax rate, return window) written in several places.",
  "Catching exceptions and returning None silently."
 ],
 practice: [
  { q: "Rewrite with clear names and a guard clause: <code>def f(u): if u: if u['a']: return u['e'] return None</code>", code: `def active_user_email(user: dict | None) -> str | None:
    if not user or not user.get("active"):
        return None
    return user["email"]

print(active_user_email({"active": True, "email": "a@x.com"}), active_user_email(None))` },
  { q: "What's wrong with <code>if total > 999: shipping = 0</code> appearing in three files?", a: "The free-shipping rule is duplicated and uses a magic number. When marketing changes it to 1,499, someone will update one file and miss the others. Put it in one named constant and one function, and call that everywhere." }
 ],
 check: [
  ["Best boolean name?", ["flag", "check", "is_paid", "p"], 2, "Reads like a question."],
  ["Guard clauses help by…", ["Adding nesting", "Returning early so the main path is flat", "Hiding errors", "Speeding up Python"], 1, "Less nesting."],
  ["Good comments explain…", ["What each line does", "Why the code does something non-obvious", "Who wrote it", "Nothing"], 1, "The reason, not the mechanics."]
 ],
 remember: [
  "Names say what; booleans read as questions.",
  "Small functions, one level of detail, guard clauses.",
  "Named constants; each business rule in one place.",
  "Raise specific errors early; never swallow exceptions.",
  "Comments explain why; formatter + linter for style."
 ]
},
{
 id: "patterns",
 title: "Design patterns that actually get used",
 level: "Intermediate",
 one: "Design patterns are named solutions to common problems. A handful show up constantly: <b>Strategy</b>, <b>Factory</b>, <b>Adapter</b>, <b>Observer</b>, <b>Decorator</b>, <b>Repository</b>.",
 why: "Knowing the names lets you discuss designs quickly with other engineers, recognise them in frameworks, and answer interview questions about them.",
 steps: [
  { h: "Strategy: swap an algorithm",
    p: ["Pass in the behaviour that varies (pricing, shipping, ranking). You saw it with shipping in the OOP lesson; with functions it's even simpler:"],
    code: `def regular(price): return price
def member(price): return round(price * 0.95)
def clearance(price): return round(price * 0.6)

def price_cart(items, strategy):
    return sum(strategy(p) for p in items)

cart = [900, 400, 3000]
for s in (regular, member, clearance):
    print(s.__name__, price_cart(cart, s))` },
  { h: "Factory: create the right object from data",
    code: `class EmailChannel:
    def __init__(self, cfg): self.to = cfg["to"]
    def send(self, msg): return f"email to {self.to}: {msg}"

class SmsChannel:
    def __init__(self, cfg): self.phone = cfg["phone"]
    def send(self, msg): return f"sms to {self.phone}: {msg[:30]}"

CHANNELS = {"email": EmailChannel, "sms": SmsChannel}

def make_channel(cfg):
    kind = cfg["type"]
    if kind not in CHANNELS:
        raise ValueError(f"unknown channel {kind}")
    return CHANNELS[kind](cfg)

for cfg in [{"type": "email", "to": "asha@x.com"}, {"type": "sms", "phone": "+91 98xxxx"}]:
    print(make_channel(cfg).send("Your order has shipped and will arrive tomorrow"))` },
  { h: "Adapter: make a different interface fit",
    p: ["Integration work is full of adapters: wrap each external system so the rest of your code sees one consistent interface."],
    code: `class OldCourierApi:                               # their interface
    def trackParcel(self, awb): return {"STATUS": "OUT_FOR_DELIVERY", "AWB": awb}

class NewCourierApi:
    def get_shipment(self, tracking_id): return {"state": "delivered", "id": tracking_id}

class OldCourierAdapter:                            # our interface: status(tracking_id) -> str
    def __init__(self, api): self.api = api
    def status(self, tracking_id): return self.api.trackParcel(tracking_id)["STATUS"].lower()

class NewCourierAdapter:
    def __init__(self, api): self.api = api
    def status(self, tracking_id): return self.api.get_shipment(tracking_id)["state"]

for courier in [OldCourierAdapter(OldCourierApi()), NewCourierAdapter(NewCourierApi())]:
    print(type(courier).__name__, "->", courier.status("AWB123"))` },
  { h: "Observer: notify subscribers of events",
    code: `class EventBus:
    def __init__(self): self.handlers = {}
    def subscribe(self, event, fn): self.handlers.setdefault(event, []).append(fn)
    def publish(self, event, data):
        for fn in self.handlers.get(event, []):
            fn(data)

bus = EventBus()
bus.subscribe("order_paid", lambda o: print("email receipt to", o["email"]))
bus.subscribe("order_paid", lambda o: print("reserve stock for order", o["id"]))
bus.publish("order_paid", {"id": 6, "email": "asha@example.com"})` },
  { h: "Decorator: add behaviour around a function",
    p: ["Python's <code>@decorator</code> wraps a function: timing, retries, caching, logging, permission checks."],
    code: `import functools, time

def retry(times=3, on=(ConnectionError,)):
    def wrap(fn):
        @functools.wraps(fn)
        def inner(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except on as e:
                    print(f"  attempt {attempt} failed: {e}")
            raise RuntimeError(f"{fn.__name__} failed after {times} attempts")
        return inner
    return wrap

calls = {"n": 0}
@retry(times=3)
def fetch_rates():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("network blip")
    return {"USD": 83.2}

print(fetch_rates())` },
  { h: "Repository: hide where data lives",
    p: ["Business logic calls <code>repo.get(id)</code> and <code>repo.save(obj)</code>; the repository hides whether it's Postgres, an API or a dict. Swapping storage or testing becomes easy."],
    code: `class InMemoryOrderRepo:
    def __init__(self): self._rows = {}
    def save(self, order): self._rows[order["id"]] = order
    def get(self, order_id): return self._rows.get(order_id)
    def by_status(self, status): return [o for o in self._rows.values() if o["status"] == status]

def mark_shipped(repo, order_id):
    order = repo.get(order_id)
    order["status"] = "shipped"
    repo.save(order)

repo = InMemoryOrderRepo()
repo.save({"id": 6, "status": "paid"}); repo.save({"id": 7, "status": "paid"})
mark_shipped(repo, 6)
print(repo.by_status("shipped"), repo.by_status("paid"))` }
 ],
 mistakes: [
  "Using patterns for their own sake (“FactoryFactory”). Use one when the problem appears.",
  "Adapters that leak the external system's quirks into your code.",
  "Observers with hidden side effects that are hard to trace.",
  "Decorators that swallow exceptions."
 ],
 practice: [
  { q: "Write a <code>@timed</code> decorator that prints how long a function took.", code: `import functools, time

def timed(fn):
    @functools.wraps(fn)
    def inner(*a, **k):
        t = time.perf_counter()
        try:
            return fn(*a, **k)
        finally:
            print(f"{fn.__name__} took {(time.perf_counter() - t) * 1000:.0f} ms")
    return inner

@timed
def slow_sum(n): return sum(range(n))
print(slow_sum(2_000_000))` },
  { q: "Which pattern? (a) support three courier APIs behind one interface (b) different pricing rules per customer type (c) send email and update stock when an order is paid (d) add caching to a slow function", a: "(a) Adapter (b) Strategy (c) Observer (event bus) (d) Decorator." }
 ],
 check: [
  ["Wrapping three courier APIs behind one interface is…", ["Observer", "Adapter", "Singleton", "Factory"], 1, "Make different interfaces fit."],
  ["Choosing a pricing rule at runtime is…", ["Strategy", "Repository", "Observer", "Decorator"], 0, "Swap the algorithm."],
  ["The Repository pattern hides…", ["Business rules", "Where and how data is stored", "Errors", "The UI"], 1, "Storage behind save/get."]
 ],
 remember: [
  "Strategy: pass in the varying behaviour.",
  "Factory: build the right object from config/data.",
  "Adapter: wrap external APIs behind your interface.",
  "Observer: publish events to subscribers.",
  "Decorator: wrap functions (retry, cache, timing). Repository: hide storage."
 ]
},
{
 id: "di",
 title: "Dependency injection and testable design",
 level: "Intermediate",
 one: "<b>Dependency injection</b> means passing a component the things it needs (database, HTTP client, clock, email sender) instead of creating them inside. Then tests can pass fakes, and swapping implementations is trivial.",
 why: "This single habit makes code testable. Frameworks like FastAPI (<code>Depends</code>) and Spring are built around it.",
 steps: [
  { h: "Hard-wired vs injected",
    code: `import datetime

class HardWiredReminder:
    def due_today(self, invoices):
        today = datetime.date.today()            # can't control in tests
        return [i for i in invoices if i["due"] == today]

class Reminder:
    def __init__(self, clock):                   # injected
        self.clock = clock
    def due_today(self, invoices):
        return [i for i in invoices if i["due"] == self.clock()]

invoices = [{"id": 1, "due": datetime.date(2025, 7, 3)}, {"id": 2, "due": datetime.date(2025, 7, 9)}]
fixed_clock = lambda: datetime.date(2025, 7, 3)
print(Reminder(fixed_clock).due_today(invoices))` },
  { h: "Inject the slow and external things",
    p: ["Database, HTTP, email, payment, LLM, file system, time and randomness: inject them all. Business logic then becomes pure and fast to test."],
    code: `class SignupService:
    def __init__(self, users, mailer, id_gen):
        self.users, self.mailer, self.id_gen = users, mailer, id_gen

    def signup(self, email):
        email = email.strip().lower()
        if any(u["email"] == email for u in self.users):
            raise ValueError("email already registered")
        user = {"id": self.id_gen(), "email": email}
        self.users.append(user)
        self.mailer(email, "Welcome to Study Desk!")
        return user

sent = []
svc = SignupService(users=[], mailer=lambda to, msg: sent.append((to, msg)), id_gen=lambda: "u-1")
print(svc.signup(" Asha@Example.com "), sent)` },
  { h: "Composition root: wire it up in one place",
    p: ["Create real dependencies once, at start-up, and pass them in. Everything else stays unaware of which implementation it got."],
    code: `import itertools

class SignupService:
    def __init__(self, users, mailer, id_gen):
        self.users, self.mailer, self.id_gen = users, mailer, id_gen
    def signup(self, email):
        user = {"id": self.id_gen(), "email": email}
        self.users.append(user)
        self.mailer(email, "Welcome!")
        return user

def build_app(env: str) -> SignupService:          # the only place that knows real vs fake
    ids = itertools.count(1)
    if env == "test":
        outbox = []
        mailer = lambda to, msg: outbox.append(to)
    else:
        mailer = lambda to, msg: print(f"[smtp] sending to {to}")
    return SignupService(users=[], mailer=mailer, id_gen=lambda: f"u-{next(ids)}")

app = build_app("production")
print(app.signup("ben@example.com"))` },
  { h: "FastAPI's Depends is DI",
    code: `from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

def get_rates():
    return {"USD": 83.2}                  # real version would call an API

@app.get("/convert")
def convert(amount: float, rates: dict = Depends(get_rates)):
    return {"inr": round(amount * rates["USD"], 2)}

app.dependency_overrides[get_rates] = lambda: {"USD": 80.0}      # tests swap the dependency
print(TestClient(app).get("/convert", params={"amount": 10}).json())` }
 ],
 mistakes: [
  "Creating clients inside functions (<code>requests.get</code>, <code>datetime.now()</code>, DB connections) so tests can't control them.",
  "Global singletons that tests can't replace.",
  "Over-engineering: a heavy DI framework for a 200-line script."
 ],
 practice: [
  { q: "Make this testable: <code>def is_expired(token): return token['exp'] &lt; time.time()</code>", code: `import time

def is_expired(token, now=time.time):
    return token["exp"] < now()

print(is_expired({"exp": 1000}, now=lambda: 2000), is_expired({"exp": 3000}, now=lambda: 2000))` },
  { q: "Write a pytest test for SignupService that checks a duplicate email is rejected, using fakes.", code: `import pytest

class SignupService:
    def __init__(self, users, mailer, id_gen): self.users, self.mailer, self.id_gen = users, mailer, id_gen
    def signup(self, email):
        email = email.strip().lower()
        if any(u["email"] == email for u in self.users): raise ValueError("email already registered")
        user = {"id": self.id_gen(), "email": email}; self.users.append(user); self.mailer(email, "hi"); return user

def test_duplicate_rejected():
    sent = []
    svc = SignupService([{"email": "a@x.com"}], lambda to, m: sent.append(to), lambda: "u")
    with pytest.raises(ValueError):
        svc.signup("A@X.com")
    assert sent == []`, test: true }
 ],
 check: [
  ["Dependency injection means…", ["Creating everything inside functions", "Passing a component the things it needs", "Using globals", "Using inheritance"], 1, "Dependencies come from outside."],
  ["Why inject a clock?", ["Speed", "Tests can fix the time", "Required by Python", "Smaller code"], 1, "Time becomes controllable."],
  ["Where should real dependencies be created?", ["Everywhere", "Once, at start-up (composition root)", "In tests only", "In templates"], 1, "Wire it up in one place."]
 ],
 remember: [
  "Pass in DB, HTTP, email, LLM, clock, random, file system.",
  "Business logic becomes pure and fast to test with fakes.",
  "Wire real implementations once at start-up.",
  "FastAPI Depends + dependency_overrides = DI in practice."
 ]
},
{
 id: "testing",
 title: "Testing strategy: unit, integration, end-to-end",
 level: "Intermediate",
 one: "A healthy test suite is mostly fast <b>unit tests</b>, fewer <b>integration tests</b> (real database, real HTTP within your system), and a handful of <b>end-to-end</b> tests of key user journeys: the <b>test pyramid</b>.",
 why: "Teams ship confidently when tests are fast, reliable and meaningful. Interviewers ask how you'd test your solution; reviewers judge PRs by their tests.",
 steps: [
  { h: "The test pyramid",
    code: `            /  E2E  \\           few: full user journeys (signup → order → email)
           /---------\\
          / integration \\        some: your code + real DB / HTTP / queue
         /---------------\\
        /      unit       \\      many: pure logic, milliseconds each
       /___________________\\`, lang: "text" },
  { h: "Unit tests: arrange, act, assert",
    code: `import pytest

def apply_coupon(total, code):
    coupons = {"WELCOME10": 0.10, "FEST20": 0.20}
    if code not in coupons:
        raise ValueError("invalid coupon")
    discount = min(total * coupons[code], 1000)          # capped at ₹1,000
    return round(total - discount, 2)

def test_percentage_discount():
    assert apply_coupon(2000, "WELCOME10") == 1800       # arrange+act+assert in one line

def test_discount_is_capped():
    assert apply_coupon(10_000, "FEST20") == 9000

def test_invalid_coupon():
    with pytest.raises(ValueError):
        apply_coupon(500, "FREE100")

@pytest.mark.parametrize("total", [0, 0.5, 999_999])
def test_never_negative(total):
    assert apply_coupon(total, "FEST20") >= 0`, test: true },
  { h: "Integration tests: real database",
    p: ["Test your SQL and repository against a real database (SQLite here; for Postgres use a test container or a throwaway test database). Fakes can't catch wrong SQL."],
    code: `import sqlite3, pytest

class OrderRepo:
    def __init__(self, conn): self.conn = conn
    def add(self, oid, total, status): self.conn.execute("INSERT INTO orders VALUES (?, ?, ?)", (oid, total, status))
    def revenue(self): return self.conn.execute("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed'").fetchone()[0]

@pytest.fixture
def repo():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, total INTEGER, status TEXT)")
    yield OrderRepo(conn)
    conn.close()

def test_revenue_counts_only_completed(repo):
    repo.add(1, 500, "completed"); repo.add(2, 300, "cancelled"); repo.add(3, 200, "completed")
    assert repo.revenue() == 700

def test_revenue_empty(repo):
    assert repo.revenue() == 0

def test_duplicate_id_rejected(repo):
    repo.add(1, 500, "completed")
    with pytest.raises(sqlite3.IntegrityError):
        repo.add(1, 100, "completed")`, test: true },
  { h: "Test doubles: fakes, stubs, mocks",
    p: ["<b>Stub</b>: returns canned answers. <b>Fake</b>: a working simple version (in-memory repo). <b>Mock</b>: records calls so you can check them. Prefer fakes and stubs; use mocks to check that an important call happened (e.g. an email was sent once)."],
    code: `from unittest.mock import Mock

def notify_if_large(order, mailer):
    if order["total"] > 50_000:
        mailer.send("finance@acme.com", f"large order {order['id']}")

def test_large_order_notifies_finance():
    mailer = Mock()
    notify_if_large({"id": 6, "total": 58_000}, mailer)
    mailer.send.assert_called_once_with("finance@acme.com", "large order 6")

def test_small_order_does_not_notify():
    mailer = Mock()
    notify_if_large({"id": 7, "total": 900}, mailer)
    mailer.send.assert_not_called()`, test: true },
  { h: "Coverage and what to test",
    p: ["Test behaviour, not implementation details. Cover business rules, edge cases (empty, zero, max, None, duplicates), error paths and bugs you've fixed. Coverage (<code>pytest --cov</code>) shows untested lines; it's a guide, not a goal: 100% coverage with weak assertions proves little."] }
 ],
 mistakes: [
  "Only end-to-end tests: slow, flaky, hard to debug.",
  "Mocking everything, so tests pass while real integrations fail.",
  "Tests that depend on order or shared state.",
  "Asserting on implementation details, so every refactor breaks tests."
 ],
 practice: [
  { q: "Write parametrized tests for <code>shipping_fee(subtotal)</code>: free from ₹999, else ₹79. Include the boundary.", code: `import pytest

def shipping_fee(subtotal): return 0 if subtotal >= 999 else 79

@pytest.mark.parametrize("subtotal, fee", [(0, 79), (998, 79), (999, 0), (5000, 0)])
def test_shipping_fee(subtotal, fee):
    assert shipping_fee(subtotal) == fee`, test: true },
  { q: "Your E2E suite takes 40 minutes and fails randomly. What do you change?", a: "Move most checks down the pyramid: business rules into unit tests, DB/API behaviour into integration tests. Keep only a few E2E journeys. Fix flakiness causes (fixed waits → explicit waits, shared data → per-test data, external calls → stubs) and run E2E nightly if needed." }
 ],
 check: [
  ["Most tests in a healthy suite should be…", ["End-to-end", "Unit tests", "Manual", "Load tests"], 1, "Fast and focused."],
  ["Why integration tests with a real database?", ["Speed", "Fakes can't catch wrong SQL or constraints", "Required", "Coverage"], 1, "Test the real interaction."],
  ["When is a mock most useful?", ["Always", "To check an important call happened (e.g. email sent once)", "To replace all logic", "Never"], 1, "Verify interactions sparingly."]
 ],
 remember: [
  "Pyramid: many unit, some integration, few E2E.",
  "Arrange → act → assert; parametrize edge cases and boundaries.",
  "Integration tests use real DB/HTTP inside your system.",
  "Prefer fakes/stubs; mocks to verify key calls.",
  "Test behaviour, not internals; coverage is a guide."
 ]
},
{
 id: "build-library",
 title: "Project: a small, well-designed library",
 level: "Project",
 one: "Build a small reusable library, for example a <b>notification sender</b> that supports email, SMS and WhatsApp with retries and templates, using the course's ideas: clear interfaces, patterns, DI and a solid test suite.",
 why: "A clean, tested library on GitHub shows design skill better than a big messy app. It's also exactly what teams need: shared code others can rely on.",
 steps: [
  { h: "The design",
    code: `notify/
├── channels.py     Channel protocol + EmailChannel, SmsChannel (adapters around providers)
├── templates.py    render(template_name, **values) with required-field checks
├── sender.py       Notifier: picks channel (factory), retries (decorator), logs results
└── tests/          unit tests with fake providers; one integration test per real provider (optional)`, lang: "text" },
  { h: "The core, small and injected",
    code: `from dataclasses import dataclass
from typing import Protocol
import string

class Channel(Protocol):
    def send(self, to: str, body: str) -> str: ...

TEMPLATES = {
    "shipped": "Hi $name, your order $order_id has shipped. Track it: $link",
    "otp": "Your code is $code. It expires in 10 minutes.",
}

def render(template_name: str, **values) -> str:
    template = string.Template(TEMPLATES[template_name])
    try:
        return template.substitute(**values)
    except KeyError as e:
        raise ValueError(f"template {template_name!r} needs {e.args[0]!r}") from None

class TemporaryError(Exception): pass

@dataclass
class Notifier:
    channels: dict
    max_attempts: int = 3
    def notify(self, channel: str, to: str, template: str, **values) -> str:
        body = render(template, **values)
        last = None
        for attempt in range(1, self.max_attempts + 1):
            try:
                return self.channels[channel].send(to, body)
            except TemporaryError as e:
                last = e
        raise RuntimeError(f"{channel} failed after {self.max_attempts} attempts: {last}")

class FakeSms:
    def __init__(self, fail_times=0): self.fail_times, self.sent = fail_times, []
    def send(self, to, body):
        if self.fail_times:
            self.fail_times -= 1
            raise TemporaryError("provider 503")
        self.sent.append((to, body))
        return f"sms-{len(self.sent)}"

sms = FakeSms(fail_times=1)
n = Notifier({"sms": sms})
print(n.notify("sms", "+91 98xxxx", "shipped", name="Asha", order_id=6, link="https://t.co/x"))
print(sms.sent)
try:
    n.notify("sms", "+91 98xxxx", "shipped", name="Asha")
except ValueError as e:
    print("error:", e)` },
  { h: "The tests",
    code: `import pytest, string
from dataclasses import dataclass

TEMPLATES = {"otp": "Your code is $code."}
def render(template_name, **values):
    try:
        return string.Template(TEMPLATES[template_name]).substitute(**values)
    except KeyError as e:
        raise ValueError(f"needs {e.args[0]}") from None

class TemporaryError(Exception): pass

@dataclass
class Notifier:
    channels: dict
    max_attempts: int = 3
    def notify(self, channel, to, template, **values):
        body = render(template, **values)
        for _ in range(self.max_attempts):
            try:
                return self.channels[channel].send(to, body)
            except TemporaryError:
                pass
        raise RuntimeError("gave up")

class FakeChannel:
    def __init__(self, fail_times=0): self.fail_times, self.sent = fail_times, []
    def send(self, to, body):
        if self.fail_times:
            self.fail_times -= 1; raise TemporaryError()
        self.sent.append((to, body)); return "ok"

def test_sends_rendered_message():
    ch = FakeChannel()
    assert Notifier({"sms": ch}).notify("sms", "+91", "otp", code="4821") == "ok"
    assert ch.sent == [("+91", "Your code is 4821.")]

def test_retries_temporary_errors():
    ch = FakeChannel(fail_times=2)
    assert Notifier({"sms": ch}).notify("sms", "+91", "otp", code="1") == "ok"

def test_gives_up_after_max_attempts():
    with pytest.raises(RuntimeError):
        Notifier({"sms": FakeChannel(fail_times=5)}).notify("sms", "+91", "otp", code="1")

def test_missing_template_value():
    with pytest.raises(ValueError):
        Notifier({"sms": FakeChannel()}).notify("sms", "+91", "otp")`, test: true },
  { h: "Publish it properly",
    p: ["Add a <code>pyproject.toml</code>, a README with a 10-line usage example, type hints throughout, <code>ruff</code> + <code>pytest</code> in GitHub Actions, and a CHANGELOG. Version it (0.1.0) and tag releases. That's what a reusable library looks like in a real company."] }
 ],
 mistakes: [
  "A library that depends on a specific provider everywhere instead of behind an adapter.",
  "No tests for failure paths (provider down, missing template values).",
  "A README without a usage example.",
  "Parameter names that clash with user data: <code>render(name, **values)</code> breaks when a template needs a <code>name</code> value. (The build of this very lesson caught that bug.)"
 ],
 practice: [
  { q: "Add a WhatsApp channel. Which files change, and which don't?", a: "Add a <code>WhatsAppChannel</code> adapter in channels.py (and its tests). Notifier, templates and existing channels don't change; you register the new channel in the dict. That's open/closed in action." },
  { q: "How would you make sure two notifications for the same order event aren't sent twice?", a: "Accept an idempotency key (e.g. <code>order-6-shipped</code>), store keys of sent messages (Redis or DB with a TTL), and skip if already present. Test it with a fake store." }
 ],
 check: [
  ["Where do provider-specific details belong?", ["Everywhere", "Inside adapter classes behind a common interface", "In templates", "In tests only"], 1, "Adapters isolate them."],
  ["Adding a new channel should…", ["Change Notifier's logic", "Add a new adapter and register it", "Rewrite everything", "Be impossible"], 1, "Open/closed."],
  ["Why fake channels in tests?", ["Speed and control: test retries and failures without real SMS", "They're required", "Real channels are illegal", "No reason"], 0, "Deterministic tests."]
 ],
 remember: [
  "Small protocol + adapters + factory + retry, all injected.",
  "Tests for success, retries, give-up and missing values.",
  "pyproject, README example, type hints, CI, versioned releases."
 ]
}
];
