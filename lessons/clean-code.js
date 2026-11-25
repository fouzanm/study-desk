// Lessons for course "clean-code". Built by tools/course-builder from tools/courses/clean-code.js.
// Python examples were run and their real output stored.
(function (L) {
L["clean-code:oop"] = {
 "title": "Object-oriented design: encapsulation, inheritance, composition",
 "level": "Intermediate",
 "one": "Good object-oriented design groups data with the behaviour that protects it (<b>encapsulation</b>), shares behaviour through <b>interfaces</b> (polymorphism), and prefers <b>composition</b> (objects that hold other objects) over deep <b>inheritance</b>.",
 "why": "Every framework you'll use (Django, FastAPI, Spring, Odoo) is object-oriented. Interviewers ask you to model things like a parking lot or a shopping cart to see how you think.",
 "steps": [
  {
   "h": "Encapsulation: protect the rules",
   "p": [
    "Keep data and the rules about it together, and change state only through methods that enforce the rules. A leading underscore signals “internal”."
   ],
   "code": "class Account:\n    def __init__(self, owner: str):\n        self.owner = owner\n        self._balance = 0\n        self._history = []\n\n    @property\n    def balance(self):\n        return self._balance\n\n    def deposit(self, amount: int):\n        if amount <= 0:\n            raise ValueError(\"deposit must be positive\")\n        self._balance += amount\n        self._history.append((\"deposit\", amount))\n\n    def withdraw(self, amount: int):\n        if amount > self._balance:\n            raise ValueError(\"insufficient funds\")\n        self._balance -= amount\n        self._history.append((\"withdraw\", amount))\n\na = Account(\"Asha\")\na.deposit(1000); a.withdraw(300)\nprint(a.balance, a._history)",
   "out": {
    "text": "700 [('deposit', 1000), ('withdraw', 300)]"
   }
  },
  {
   "h": "Polymorphism with a shared interface",
   "p": [
    "Different classes with the same method can be used the same way. An <b>abstract base class</b> states the contract."
   ],
   "code": "from abc import ABC, abstractmethod\n\nclass PaymentMethod(ABC):\n    @abstractmethod\n    def charge(self, amount: int) -> str: ...\n\nclass Card(PaymentMethod):\n    def __init__(self, last4): self.last4 = last4\n    def charge(self, amount): return f\"charged ₹{amount} to card ••{self.last4}\"\n\nclass UPI(PaymentMethod):\n    def __init__(self, vpa): self.vpa = vpa\n    def charge(self, amount): return f\"requested ₹{amount} from {self.vpa}\"\n\ndef checkout(total: int, method: PaymentMethod):\n    return method.charge(total)\n\nfor m in [Card(\"4242\"), UPI(\"asha@okbank\")]:\n    print(checkout(6900, m))",
   "out": {
    "text": "charged ₹6900 to card ••4242\nrequested ₹6900 from asha@okbank"
   }
  },
  {
   "h": "Composition over inheritance",
   "p": [
    "Inheritance says “is a”; composition says “has a”. Deep inheritance trees get rigid fast. Build objects from smaller parts instead:"
   ],
   "code": "class FlatShipping:\n    def cost(self, weight_kg): return 50\n\nclass WeightShipping:\n    def cost(self, weight_kg): return 30 + 20 * weight_kg\n\nclass Order:\n    def __init__(self, items, shipping):\n        self.items, self.shipping = items, shipping        # Order HAS a shipping strategy\n    def total(self):\n        goods = sum(price * qty for price, qty, _ in self.items)\n        weight = sum(w * qty for _, qty, w in self.items)\n        return goods + self.shipping.cost(weight)\n\nitems = [(900, 2, 1.0), (400, 1, 0.2)]\nprint(Order(items, FlatShipping()).total(), Order(items, WeightShipping()).total())",
   "out": {
    "text": "2250 2274.0"
   }
  },
  {
   "h": "Modelling exercise: a parking lot",
   "p": [
    "A classic interview prompt. Find the nouns (lot, level, spot, vehicle, ticket) and the verbs (park, leave, pay). Keep each class small:"
   ],
   "code": "from dataclasses import dataclass, field\nimport itertools\n\n@dataclass\nclass Spot:\n    id: str\n    size: str                 # \"bike\" | \"car\" | \"truck\"\n    vehicle: str | None = None\n\nSIZES = {\"bike\": 0, \"car\": 1, \"truck\": 2}\n\n@dataclass\nclass ParkingLot:\n    spots: list[Spot]\n    tickets: dict = field(default_factory=dict)\n    _ids: itertools.count = field(default_factory=lambda: itertools.count(1))\n\n    def park(self, plate: str, size: str):\n        for s in self.spots:\n            if s.vehicle is None and SIZES[s.size] >= SIZES[size]:\n                s.vehicle = plate\n                tid = next(self._ids)\n                self.tickets[tid] = s\n                return tid\n        return None\n\n    def leave(self, ticket: int):\n        spot = self.tickets.pop(ticket)\n        spot.vehicle = None\n        return spot.id\n\nlot = ParkingLot([Spot(\"A1\", \"bike\"), Spot(\"A2\", \"car\"), Spot(\"B1\", \"truck\")])\nt1 = lot.park(\"KL-11-AB-1234\", \"car\"); t2 = lot.park(\"KL-07-X-9\", \"truck\")\nprint(t1, t2, lot.park(\"KL-01-Z-1\", \"car\"))\nprint(\"freed\", lot.leave(t1), \"-> new car:\", lot.park(\"KL-01-Z-1\", \"car\"))",
   "out": {
    "text": "1 2 None\nfreed A2 -> new car: 3"
   }
  }
 ],
 "mistakes": [
  "Classes that are only bags of data with logic scattered elsewhere.",
  "Deep inheritance (Vehicle → Car → ElectricCar → LuxuryElectricCar…).",
  "God classes that do everything.",
  "Letting outside code change internal state directly, bypassing the rules."
 ],
 "practice": [
  {
   "q": "Add a <code>WalletPayment</code> that fails when the wallet balance is too low, and use it in checkout.",
   "code": "from abc import ABC, abstractmethod\n\nclass PaymentMethod(ABC):\n    @abstractmethod\n    def charge(self, amount: int) -> str: ...\n\nclass Wallet(PaymentMethod):\n    def __init__(self, balance): self.balance = balance\n    def charge(self, amount):\n        if amount > self.balance:\n            raise ValueError(\"wallet balance too low\")\n        self.balance -= amount\n        return f\"paid ₹{amount} from wallet, ₹{self.balance} left\"\n\nw = Wallet(10_000)\nprint(w.charge(6900))\ntry:\n    w.charge(6900)\nexcept ValueError as e:\n    print(\"failed:\", e)",
   "out": {
    "text": "paid ₹6900 from wallet, ₹3100 left\nfailed: wallet balance too low"
   }
  },
  {
   "q": "For a library system, list the main classes and one method each.",
   "a": "Book (is_available), Member (borrow_limit), Loan (is_overdue), Library (lend(book, member), return_book(loan)), Fine (amount_for(loan)). Keep rules (limits, due dates) inside the class that owns the data."
  }
 ],
 "check": [
  [
   "Encapsulation means…",
   [
    "Making everything public",
    "Keeping data with the behaviour that enforces its rules",
    "Using inheritance",
    "Writing comments"
   ],
   1,
   "Protect invariants."
  ],
  [
   "“Has a” relationships suggest…",
   [
    "Inheritance",
    "Composition",
    "Global variables",
    "Static methods"
   ],
   1,
   "Build from parts."
  ],
  [
   "Why define an abstract base class?",
   [
    "Speed",
    "To state a contract that different implementations follow",
    "Required by Python",
    "To hide code"
   ],
   1,
   "Polymorphism with a clear interface."
  ]
 ],
 "remember": [
  "Encapsulate: change state only through methods that enforce rules.",
  "Polymorphism: same interface, different implementations (ABC).",
  "Prefer composition (has-a) over deep inheritance (is-a).",
  "Model problems: nouns → classes, verbs → methods; keep classes small."
 ]
};
L["clean-code:solid"] = {
 "title": "SOLID principles in plain words",
 "level": "Intermediate",
 "one": "<b>SOLID</b> is five habits for code that's easy to change: <b>S</b>ingle responsibility, <b>O</b>pen/closed, <b>L</b>iskov substitution, <b>I</b>nterface segregation, <b>D</b>ependency inversion.",
 "why": "Interviewers ask about SOLID, and more importantly these habits decide whether adding a feature takes an hour or a week.",
 "steps": [
  {
   "h": "S: one reason to change",
   "p": [
    "A class or function should do one job. This report function fetches, calculates, formats and emails, so a change to any of those touches it:"
   ],
   "code": "# before: one function, four jobs\ndef monthly_report_bad(db, mailer):\n    rows = db[\"orders\"]\n    total = sum(r[\"total\"] for r in rows if r[\"status\"] == \"completed\")\n    html = f\"<h1>Revenue: {total}</h1>\"\n    mailer.append((\"finance@acme.com\", html))\n\n# after: each job separate, each easy to test and change\ndef completed_revenue(rows):    return sum(r[\"total\"] for r in rows if r[\"status\"] == \"completed\")\ndef render(total):              return f\"<h1>Revenue: {total}</h1>\"\ndef send(mailer, to, html):     mailer.append((to, html))\n\ndb = {\"orders\": [{\"total\": 500, \"status\": \"completed\"}, {\"total\": 200, \"status\": \"cancelled\"}]}\noutbox = []\nsend(outbox, \"finance@acme.com\", render(completed_revenue(db[\"orders\"])))\nprint(outbox)",
   "out": {
    "text": "[('finance@acme.com', '<h1>Revenue: 500</h1>')]"
   }
  },
  {
   "h": "O: add, don't edit",
   "p": [
    "Open for extension, closed for modification: adding a new case shouldn't mean editing a growing if/elif chain. Use a registry or polymorphism:"
   ],
   "code": "DISCOUNTS = {}\n\ndef discount(name):\n    def register(fn):\n        DISCOUNTS[name] = fn\n        return fn\n    return register\n\n@discount(\"none\")\ndef no_discount(total): return total\n\n@discount(\"festival\")\ndef festival(total): return total * 0.9\n\n@discount(\"bulk\")\ndef bulk(total): return total - 500 if total > 10_000 else total\n\nfor name in DISCOUNTS:\n    print(name, DISCOUNTS[name](12_000))",
   "note": "A new discount is a new function; nothing existing changes, so nothing existing breaks.",
   "out": {
    "text": "none 12000\nfestival 10800.0\nbulk 11500"
   }
  },
  {
   "h": "L: subclasses must keep the promise",
   "p": [
    "Anywhere the parent works, a child must work too. The classic violation: a <code>Square</code> that inherits <code>Rectangle</code> but breaks when width and height are set separately. If a subclass has to refuse or change the parent's behaviour, it probably shouldn't inherit."
   ],
   "code": "class Notifier:\n    def send(self, to: str, msg: str) -> bool:\n        raise NotImplementedError\n\nclass EmailNotifier(Notifier):\n    def send(self, to, msg): return \"@\" in to\n\nclass BrokenSmsNotifier(Notifier):\n    def send(self, to, msg): raise RuntimeError(\"SMS not supported\")   # breaks the promise\n\nfor n in [EmailNotifier(), BrokenSmsNotifier()]:\n    try:\n        print(type(n).__name__, n.send(\"asha@example.com\", \"hi\"))\n    except RuntimeError as e:\n        print(type(n).__name__, \"breaks callers:\", e)",
   "out": {
    "text": "EmailNotifier True\nBrokenSmsNotifier breaks callers: SMS not supported"
   }
  },
  {
   "h": "I: small interfaces",
   "p": [
    "Don't force classes to implement methods they don't need. Several small interfaces beat one giant one. In Python, <code>typing.Protocol</code> describes just the methods a function needs:"
   ],
   "code": "from typing import Protocol\n\nclass CanExport(Protocol):\n    def export(self) -> str: ...\n\nclass Invoice:\n    def __init__(self, n): self.n = n\n    def export(self): return f\"INV-{self.n}.pdf\"\n\nclass Report:\n    def export(self): return \"sales.csv\"\n\ndef export_all(items: list[CanExport]):\n    return [i.export() for i in items]\n\nprint(export_all([Invoice(204), Report()]))",
   "out": {
    "text": "['INV-204.pdf', 'sales.csv']"
   }
  },
  {
   "h": "D: depend on abstractions",
   "p": [
    "High-level logic shouldn't create its low-level tools (database, email, HTTP); it should receive them. That makes swapping and testing easy. The next lesson goes deeper (dependency injection)."
   ],
   "code": "class OrderService:\n    def __init__(self, repo, notifier):      # given, not created inside\n        self.repo, self.notifier = repo, notifier\n    def place(self, order):\n        self.repo.append(order)\n        self.notifier.append(f\"order {order['id']} placed\")\n\nrepo, sent = [], []\nOrderService(repo, sent).place({\"id\": 6})\nprint(repo, sent)",
   "out": {
    "text": "[{'id': 6}] ['order 6 placed']"
   }
  }
 ],
 "mistakes": [
  "Applying every principle everywhere: tiny scripts don't need five interfaces.",
  "Huge if/elif chains for types that keep growing.",
  "Inheriting just to reuse code, then overriding methods to throw errors.",
  "Creating database or HTTP clients inside business logic."
 ],
 "practice": [
  {
   "q": "Refactor this to follow open/closed: <code>if kind == 'pdf': … elif kind == 'csv': … elif kind == 'xlsx': …</code>",
   "code": "EXPORTERS = {\n    \"pdf\": lambda rows: f\"pdf with {len(rows)} rows\",\n    \"csv\": lambda rows: \"\\n\".join(\",\".join(map(str, r)) for r in rows),\n}\ndef export(kind, rows):\n    if kind not in EXPORTERS:\n        raise ValueError(f\"no exporter for {kind}\")\n    return EXPORTERS[kind](rows)\n\nEXPORTERS[\"json\"] = lambda rows: str(rows)    # new format: no existing code changed\nprint(export(\"csv\", [(1, \"tea\"), (2, \"coffee\")]))\nprint(export(\"json\", [(1, \"tea\")]))",
   "out": {
    "text": "1,tea\n2,coffee\n[(1, 'tea')]"
   }
  },
  {
   "q": "Explain SOLID's “D” in one sentence to a junior developer.",
   "a": "Your business logic should receive the tools it uses (database, email sender, API client) from outside instead of creating them, so you can swap them (e.g. fakes in tests) without changing the logic."
  }
 ],
 "check": [
  [
   "Single responsibility means a class has…",
   [
    "One method",
    "One reason to change",
    "One attribute",
    "One user"
   ],
   1,
   "One job."
  ],
  [
   "Open/closed: adding a new case should…",
   [
    "Edit a big if/elif",
    "Add new code without changing existing code",
    "Rewrite the class",
    "Be impossible"
   ],
   1,
   "Extend, don't modify."
  ],
  [
   "A subclass that raises 'not supported' for a parent method breaks…",
   [
    "S",
    "O",
    "L (Liskov)",
    "D"
   ],
   2,
   "Children must keep the parent's promise."
  ]
 ],
 "remember": [
  "S: one job per class/function.",
  "O: add new behaviour by adding code (registry, polymorphism).",
  "L: subclasses must work wherever the parent does.",
  "I: small, focused interfaces (Protocols).",
  "D: receive dependencies; don't create them inside logic."
 ]
};
L["clean-code:clean-code"] = {
 "title": "Clean code: names, functions, errors",
 "level": "Beginner+",
 "one": "Clean code is code the next person (often you in six months) can read and change safely: <b>clear names</b>, <b>small functions</b>, <b>no surprises</b>, <b>explicit errors</b>, and <b>no duplication</b> of rules.",
 "why": "Most of an engineer's time is spent reading code. Clean code is what reviewers, teammates and interviewers notice first.",
 "steps": [
  {
   "h": "Names that explain",
   "code": "# unclear\ndef calc(d, t):\n    r = []\n    for x in d:\n        if x[2] > t:\n            r.append(x)\n    return r\n\n# clear\ndef orders_above(orders: list[tuple], min_total: int) -> list[tuple]:\n    return [order for order in orders if order_total(order) > min_total]\n\ndef order_total(order: tuple) -> int:\n    _id, _customer, total = order\n    return total\n\norders = [(1, \"asha\", 55000), (2, \"ben\", 900), (3, \"chen\", 16000)]\nprint(orders_above(orders, 10_000))",
   "p": [
    "Names say what something is or does. Booleans read as questions (<code>is_paid</code>, <code>has_stock</code>). Avoid abbreviations nobody shares."
   ],
   "out": {
    "text": "[(1, 'asha', 55000), (3, 'chen', 16000)]"
   }
  },
  {
   "h": "Small functions, one level of detail",
   "p": [
    "A function should do one thing, at one level of detail. Early returns (guard clauses) remove deep nesting:"
   ],
   "code": "def can_refund_nested(order, today):\n    if order is not None:\n        if order[\"status\"] == \"delivered\":\n            if (today - order[\"delivered_day\"]) <= 30:\n                if not order[\"refunded\"]:\n                    return True\n    return False\n\ndef can_refund(order, today):\n    if order is None:\n        return False\n    if order[\"status\"] != \"delivered\" or order[\"refunded\"]:\n        return False\n    return today - order[\"delivered_day\"] <= 30\n\no = {\"status\": \"delivered\", \"delivered_day\": 100, \"refunded\": False}\nprint(can_refund_nested(o, 120), can_refund(o, 120), can_refund(o, 140))",
   "out": {
    "text": "True True False"
   }
  },
  {
   "h": "Magic numbers and duplicated rules",
   "p": [
    "Name constants, and keep each business rule in exactly one place, so it can't be updated in one spot and forgotten in another."
   ],
   "code": "RETURN_WINDOW_DAYS = 30\nGST_RATE = 0.18\nFREE_SHIPPING_FROM = 999\n\ndef shipping_fee(subtotal: int) -> int:\n    return 0 if subtotal >= FREE_SHIPPING_FROM else 79\n\ndef with_tax(amount: float) -> float:\n    return round(amount * (1 + GST_RATE), 2)\n\nprint(shipping_fee(1200), shipping_fee(500), with_tax(1000))",
   "out": {
    "text": "0 79 1180.0"
   }
  },
  {
   "h": "Explicit errors",
   "p": [
    "Fail loudly and early with a useful message. Don't return <code>None</code> or <code>-1</code> to mean “something went wrong”, and never swallow exceptions."
   ],
   "code": "class OrderNotFound(Exception):\n    pass\n\nORDERS = {6: {\"status\": \"shipped\"}}\n\ndef get_order(order_id: int) -> dict:\n    try:\n        return ORDERS[order_id]\n    except KeyError:\n        raise OrderNotFound(f\"order {order_id} does not exist\") from None\n\ntry:\n    get_order(9)\nexcept OrderNotFound as e:\n    print(\"handled:\", e)",
   "out": {
    "text": "handled: order 9 does not exist"
   }
  },
  {
   "h": "Comments explain why, not what",
   "code": "# bad: repeats the code\ni = i + 1  # add one to i\n\n# good: explains a reason the code can't show\n# The courier API counts days from 0 for same-day dispatch, so we add 1\n# to match what customers see on the tracking page.\neta_days = courier_days + 1",
   "lang": "python",
   "run": false,
   "p": [
    "Use a formatter (<code>black</code> or <code>ruff format</code>) and a linter (<code>ruff</code>) so style is automatic and reviews focus on logic."
   ]
  }
 ],
 "mistakes": [
  "Names like data, temp, x2, handle_stuff.",
  "Functions longer than a screen with deep nesting.",
  "The same rule (tax rate, return window) written in several places.",
  "Catching exceptions and returning None silently."
 ],
 "practice": [
  {
   "q": "Rewrite with clear names and a guard clause: <code>def f(u): if u: if u['a']: return u['e'] return None</code>",
   "code": "def active_user_email(user: dict | None) -> str | None:\n    if not user or not user.get(\"active\"):\n        return None\n    return user[\"email\"]\n\nprint(active_user_email({\"active\": True, \"email\": \"a@x.com\"}), active_user_email(None))",
   "out": {
    "text": "a@x.com None"
   }
  },
  {
   "q": "What's wrong with <code>if total > 999: shipping = 0</code> appearing in three files?",
   "a": "The free-shipping rule is duplicated and uses a magic number. When marketing changes it to 1,499, someone will update one file and miss the others. Put it in one named constant and one function, and call that everywhere."
  }
 ],
 "check": [
  [
   "Best boolean name?",
   [
    "flag",
    "check",
    "is_paid",
    "p"
   ],
   2,
   "Reads like a question."
  ],
  [
   "Guard clauses help by…",
   [
    "Adding nesting",
    "Returning early so the main path is flat",
    "Hiding errors",
    "Speeding up Python"
   ],
   1,
   "Less nesting."
  ],
  [
   "Good comments explain…",
   [
    "What each line does",
    "Why the code does something non-obvious",
    "Who wrote it",
    "Nothing"
   ],
   1,
   "The reason, not the mechanics."
  ]
 ],
 "remember": [
  "Names say what; booleans read as questions.",
  "Small functions, one level of detail, guard clauses.",
  "Named constants; each business rule in one place.",
  "Raise specific errors early; never swallow exceptions.",
  "Comments explain why; formatter + linter for style."
 ]
};
L["clean-code:patterns"] = {
 "title": "Design patterns that actually get used",
 "level": "Intermediate",
 "one": "Design patterns are named solutions to common problems. A handful show up constantly: <b>Strategy</b>, <b>Factory</b>, <b>Adapter</b>, <b>Observer</b>, <b>Decorator</b>, <b>Repository</b>.",
 "why": "Knowing the names lets you discuss designs quickly with other engineers, recognise them in frameworks, and answer interview questions about them.",
 "steps": [
  {
   "h": "Strategy: swap an algorithm",
   "p": [
    "Pass in the behaviour that varies (pricing, shipping, ranking). You saw it with shipping in the OOP lesson; with functions it's even simpler:"
   ],
   "code": "def regular(price): return price\ndef member(price): return round(price * 0.95)\ndef clearance(price): return round(price * 0.6)\n\ndef price_cart(items, strategy):\n    return sum(strategy(p) for p in items)\n\ncart = [900, 400, 3000]\nfor s in (regular, member, clearance):\n    print(s.__name__, price_cart(cart, s))",
   "out": {
    "text": "regular 4300\nmember 4085\nclearance 2580"
   }
  },
  {
   "h": "Factory: create the right object from data",
   "code": "class EmailChannel:\n    def __init__(self, cfg): self.to = cfg[\"to\"]\n    def send(self, msg): return f\"email to {self.to}: {msg}\"\n\nclass SmsChannel:\n    def __init__(self, cfg): self.phone = cfg[\"phone\"]\n    def send(self, msg): return f\"sms to {self.phone}: {msg[:30]}\"\n\nCHANNELS = {\"email\": EmailChannel, \"sms\": SmsChannel}\n\ndef make_channel(cfg):\n    kind = cfg[\"type\"]\n    if kind not in CHANNELS:\n        raise ValueError(f\"unknown channel {kind}\")\n    return CHANNELS[kind](cfg)\n\nfor cfg in [{\"type\": \"email\", \"to\": \"asha@x.com\"}, {\"type\": \"sms\", \"phone\": \"+91 98xxxx\"}]:\n    print(make_channel(cfg).send(\"Your order has shipped and will arrive tomorrow\"))",
   "out": {
    "text": "email to asha@x.com: Your order has shipped and will arrive tomorrow\nsms to +91 98xxxx: Your order has shipped and wil"
   }
  },
  {
   "h": "Adapter: make a different interface fit",
   "p": [
    "Integration work is full of adapters: wrap each external system so the rest of your code sees one consistent interface."
   ],
   "code": "class OldCourierApi:                               # their interface\n    def trackParcel(self, awb): return {\"STATUS\": \"OUT_FOR_DELIVERY\", \"AWB\": awb}\n\nclass NewCourierApi:\n    def get_shipment(self, tracking_id): return {\"state\": \"delivered\", \"id\": tracking_id}\n\nclass OldCourierAdapter:                            # our interface: status(tracking_id) -> str\n    def __init__(self, api): self.api = api\n    def status(self, tracking_id): return self.api.trackParcel(tracking_id)[\"STATUS\"].lower()\n\nclass NewCourierAdapter:\n    def __init__(self, api): self.api = api\n    def status(self, tracking_id): return self.api.get_shipment(tracking_id)[\"state\"]\n\nfor courier in [OldCourierAdapter(OldCourierApi()), NewCourierAdapter(NewCourierApi())]:\n    print(type(courier).__name__, \"->\", courier.status(\"AWB123\"))",
   "out": {
    "text": "OldCourierAdapter -> out_for_delivery\nNewCourierAdapter -> delivered"
   }
  },
  {
   "h": "Observer: notify subscribers of events",
   "code": "class EventBus:\n    def __init__(self): self.handlers = {}\n    def subscribe(self, event, fn): self.handlers.setdefault(event, []).append(fn)\n    def publish(self, event, data):\n        for fn in self.handlers.get(event, []):\n            fn(data)\n\nbus = EventBus()\nbus.subscribe(\"order_paid\", lambda o: print(\"email receipt to\", o[\"email\"]))\nbus.subscribe(\"order_paid\", lambda o: print(\"reserve stock for order\", o[\"id\"]))\nbus.publish(\"order_paid\", {\"id\": 6, \"email\": \"asha@example.com\"})",
   "out": {
    "text": "email receipt to asha@example.com\nreserve stock for order 6"
   }
  },
  {
   "h": "Decorator: add behaviour around a function",
   "p": [
    "Python's <code>@decorator</code> wraps a function: timing, retries, caching, logging, permission checks."
   ],
   "code": "import functools, time\n\ndef retry(times=3, on=(ConnectionError,)):\n    def wrap(fn):\n        @functools.wraps(fn)\n        def inner(*args, **kwargs):\n            for attempt in range(1, times + 1):\n                try:\n                    return fn(*args, **kwargs)\n                except on as e:\n                    print(f\"  attempt {attempt} failed: {e}\")\n            raise RuntimeError(f\"{fn.__name__} failed after {times} attempts\")\n        return inner\n    return wrap\n\ncalls = {\"n\": 0}\n@retry(times=3)\ndef fetch_rates():\n    calls[\"n\"] += 1\n    if calls[\"n\"] < 3:\n        raise ConnectionError(\"network blip\")\n    return {\"USD\": 83.2}\n\nprint(fetch_rates())",
   "out": {
    "text": "  attempt 1 failed: network blip\n  attempt 2 failed: network blip\n{'USD': 83.2}"
   }
  },
  {
   "h": "Repository: hide where data lives",
   "p": [
    "Business logic calls <code>repo.get(id)</code> and <code>repo.save(obj)</code>; the repository hides whether it's Postgres, an API or a dict. Swapping storage or testing becomes easy."
   ],
   "code": "class InMemoryOrderRepo:\n    def __init__(self): self._rows = {}\n    def save(self, order): self._rows[order[\"id\"]] = order\n    def get(self, order_id): return self._rows.get(order_id)\n    def by_status(self, status): return [o for o in self._rows.values() if o[\"status\"] == status]\n\ndef mark_shipped(repo, order_id):\n    order = repo.get(order_id)\n    order[\"status\"] = \"shipped\"\n    repo.save(order)\n\nrepo = InMemoryOrderRepo()\nrepo.save({\"id\": 6, \"status\": \"paid\"}); repo.save({\"id\": 7, \"status\": \"paid\"})\nmark_shipped(repo, 6)\nprint(repo.by_status(\"shipped\"), repo.by_status(\"paid\"))",
   "out": {
    "text": "[{'id': 6, 'status': 'shipped'}] [{'id': 7, 'status': 'paid'}]"
   }
  }
 ],
 "mistakes": [
  "Using patterns for their own sake (“FactoryFactory”). Use one when the problem appears.",
  "Adapters that leak the external system's quirks into your code.",
  "Observers with hidden side effects that are hard to trace.",
  "Decorators that swallow exceptions."
 ],
 "practice": [
  {
   "q": "Write a <code>@timed</code> decorator that prints how long a function took.",
   "code": "import functools, time\n\ndef timed(fn):\n    @functools.wraps(fn)\n    def inner(*a, **k):\n        t = time.perf_counter()\n        try:\n            return fn(*a, **k)\n        finally:\n            print(f\"{fn.__name__} took {(time.perf_counter() - t) * 1000:.0f} ms\")\n    return inner\n\n@timed\ndef slow_sum(n): return sum(range(n))\nprint(slow_sum(2_000_000))",
   "out": {
    "text": "slow_sum took 27 ms\n1999999000000"
   }
  },
  {
   "q": "Which pattern? (a) support three courier APIs behind one interface (b) different pricing rules per customer type (c) send email and update stock when an order is paid (d) add caching to a slow function",
   "a": "(a) Adapter (b) Strategy (c) Observer (event bus) (d) Decorator."
  }
 ],
 "check": [
  [
   "Wrapping three courier APIs behind one interface is…",
   [
    "Observer",
    "Adapter",
    "Singleton",
    "Factory"
   ],
   1,
   "Make different interfaces fit."
  ],
  [
   "Choosing a pricing rule at runtime is…",
   [
    "Strategy",
    "Repository",
    "Observer",
    "Decorator"
   ],
   0,
   "Swap the algorithm."
  ],
  [
   "The Repository pattern hides…",
   [
    "Business rules",
    "Where and how data is stored",
    "Errors",
    "The UI"
   ],
   1,
   "Storage behind save/get."
  ]
 ],
 "remember": [
  "Strategy: pass in the varying behaviour.",
  "Factory: build the right object from config/data.",
  "Adapter: wrap external APIs behind your interface.",
  "Observer: publish events to subscribers.",
  "Decorator: wrap functions (retry, cache, timing). Repository: hide storage."
 ]
};
L["clean-code:di"] = {
 "title": "Dependency injection and testable design",
 "level": "Intermediate",
 "one": "<b>Dependency injection</b> means passing a component the things it needs (database, HTTP client, clock, email sender) instead of creating them inside. Then tests can pass fakes, and swapping implementations is trivial.",
 "why": "This single habit makes code testable. Frameworks like FastAPI (<code>Depends</code>) and Spring are built around it.",
 "steps": [
  {
   "h": "Hard-wired vs injected",
   "code": "import datetime\n\nclass HardWiredReminder:\n    def due_today(self, invoices):\n        today = datetime.date.today()            # can't control in tests\n        return [i for i in invoices if i[\"due\"] == today]\n\nclass Reminder:\n    def __init__(self, clock):                   # injected\n        self.clock = clock\n    def due_today(self, invoices):\n        return [i for i in invoices if i[\"due\"] == self.clock()]\n\ninvoices = [{\"id\": 1, \"due\": datetime.date(2025, 7, 3)}, {\"id\": 2, \"due\": datetime.date(2025, 7, 9)}]\nfixed_clock = lambda: datetime.date(2025, 7, 3)\nprint(Reminder(fixed_clock).due_today(invoices))",
   "out": {
    "text": "[{'id': 1, 'due': datetime.date(2025, 7, 3)}]"
   }
  },
  {
   "h": "Inject the slow and external things",
   "p": [
    "Database, HTTP, email, payment, LLM, file system, time and randomness: inject them all. Business logic then becomes pure and fast to test."
   ],
   "code": "class SignupService:\n    def __init__(self, users, mailer, id_gen):\n        self.users, self.mailer, self.id_gen = users, mailer, id_gen\n\n    def signup(self, email):\n        email = email.strip().lower()\n        if any(u[\"email\"] == email for u in self.users):\n            raise ValueError(\"email already registered\")\n        user = {\"id\": self.id_gen(), \"email\": email}\n        self.users.append(user)\n        self.mailer(email, \"Welcome to Study Desk!\")\n        return user\n\nsent = []\nsvc = SignupService(users=[], mailer=lambda to, msg: sent.append((to, msg)), id_gen=lambda: \"u-1\")\nprint(svc.signup(\" Asha@Example.com \"), sent)",
   "out": {
    "text": "{'id': 'u-1', 'email': 'asha@example.com'} [('asha@example.com', 'Welcome to Study Desk!')]"
   }
  },
  {
   "h": "Composition root: wire it up in one place",
   "p": [
    "Create real dependencies once, at start-up, and pass them in. Everything else stays unaware of which implementation it got."
   ],
   "code": "import itertools\n\nclass SignupService:\n    def __init__(self, users, mailer, id_gen):\n        self.users, self.mailer, self.id_gen = users, mailer, id_gen\n    def signup(self, email):\n        user = {\"id\": self.id_gen(), \"email\": email}\n        self.users.append(user)\n        self.mailer(email, \"Welcome!\")\n        return user\n\ndef build_app(env: str) -> SignupService:          # the only place that knows real vs fake\n    ids = itertools.count(1)\n    if env == \"test\":\n        outbox = []\n        mailer = lambda to, msg: outbox.append(to)\n    else:\n        mailer = lambda to, msg: print(f\"[smtp] sending to {to}\")\n    return SignupService(users=[], mailer=mailer, id_gen=lambda: f\"u-{next(ids)}\")\n\napp = build_app(\"production\")\nprint(app.signup(\"ben@example.com\"))",
   "out": {
    "text": "[smtp] sending to ben@example.com\n{'id': 'u-1', 'email': 'ben@example.com'}"
   }
  },
  {
   "h": "FastAPI's Depends is DI",
   "code": "from fastapi import FastAPI, Depends\nfrom fastapi.testclient import TestClient\n\napp = FastAPI()\n\ndef get_rates():\n    return {\"USD\": 83.2}                  # real version would call an API\n\n@app.get(\"/convert\")\ndef convert(amount: float, rates: dict = Depends(get_rates)):\n    return {\"inr\": round(amount * rates[\"USD\"], 2)}\n\napp.dependency_overrides[get_rates] = lambda: {\"USD\": 80.0}      # tests swap the dependency\nprint(TestClient(app).get(\"/convert\", params={\"amount\": 10}).json())",
   "out": {
    "text": "{'inr': 800.0}"
   }
  }
 ],
 "mistakes": [
  "Creating clients inside functions (<code>requests.get</code>, <code>datetime.now()</code>, DB connections) so tests can't control them.",
  "Global singletons that tests can't replace.",
  "Over-engineering: a heavy DI framework for a 200-line script."
 ],
 "practice": [
  {
   "q": "Make this testable: <code>def is_expired(token): return token['exp'] &lt; time.time()</code>",
   "code": "import time\n\ndef is_expired(token, now=time.time):\n    return token[\"exp\"] < now()\n\nprint(is_expired({\"exp\": 1000}, now=lambda: 2000), is_expired({\"exp\": 3000}, now=lambda: 2000))",
   "out": {
    "text": "True False"
   }
  },
  {
   "q": "Write a pytest test for SignupService that checks a duplicate email is rejected, using fakes.",
   "code": "import pytest\n\nclass SignupService:\n    def __init__(self, users, mailer, id_gen): self.users, self.mailer, self.id_gen = users, mailer, id_gen\n    def signup(self, email):\n        email = email.strip().lower()\n        if any(u[\"email\"] == email for u in self.users): raise ValueError(\"email already registered\")\n        user = {\"id\": self.id_gen(), \"email\": email}; self.users.append(user); self.mailer(email, \"hi\"); return user\n\ndef test_duplicate_rejected():\n    sent = []\n    svc = SignupService([{\"email\": \"a@x.com\"}], lambda to, m: sent.append(to), lambda: \"u\")\n    with pytest.raises(ValueError):\n        svc.signup(\"A@X.com\")\n    assert sent == []",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  }
 ],
 "check": [
  [
   "Dependency injection means…",
   [
    "Creating everything inside functions",
    "Passing a component the things it needs",
    "Using globals",
    "Using inheritance"
   ],
   1,
   "Dependencies come from outside."
  ],
  [
   "Why inject a clock?",
   [
    "Speed",
    "Tests can fix the time",
    "Required by Python",
    "Smaller code"
   ],
   1,
   "Time becomes controllable."
  ],
  [
   "Where should real dependencies be created?",
   [
    "Everywhere",
    "Once, at start-up (composition root)",
    "In tests only",
    "In templates"
   ],
   1,
   "Wire it up in one place."
  ]
 ],
 "remember": [
  "Pass in DB, HTTP, email, LLM, clock, random, file system.",
  "Business logic becomes pure and fast to test with fakes.",
  "Wire real implementations once at start-up.",
  "FastAPI Depends + dependency_overrides = DI in practice."
 ]
};
L["clean-code:testing"] = {
 "title": "Testing strategy: unit, integration, end-to-end",
 "level": "Intermediate",
 "one": "A healthy test suite is mostly fast <b>unit tests</b>, fewer <b>integration tests</b> (real database, real HTTP within your system), and a handful of <b>end-to-end</b> tests of key user journeys: the <b>test pyramid</b>.",
 "why": "Teams ship confidently when tests are fast, reliable and meaningful. Interviewers ask how you'd test your solution; reviewers judge PRs by their tests.",
 "steps": [
  {
   "h": "The test pyramid",
   "code": "            /  E2E  \\           few: full user journeys (signup → order → email)\n           /---------\\\n          / integration \\        some: your code + real DB / HTTP / queue\n         /---------------\\\n        /      unit       \\      many: pure logic, milliseconds each\n       /___________________\\",
   "lang": "text"
  },
  {
   "h": "Unit tests: arrange, act, assert",
   "code": "import pytest\n\ndef apply_coupon(total, code):\n    coupons = {\"WELCOME10\": 0.10, \"FEST20\": 0.20}\n    if code not in coupons:\n        raise ValueError(\"invalid coupon\")\n    discount = min(total * coupons[code], 1000)          # capped at ₹1,000\n    return round(total - discount, 2)\n\ndef test_percentage_discount():\n    assert apply_coupon(2000, \"WELCOME10\") == 1800       # arrange+act+assert in one line\n\ndef test_discount_is_capped():\n    assert apply_coupon(10_000, \"FEST20\") == 9000\n\ndef test_invalid_coupon():\n    with pytest.raises(ValueError):\n        apply_coupon(500, \"FREE100\")\n\n@pytest.mark.parametrize(\"total\", [0, 0.5, 999_999])\ndef test_never_negative(total):\n    assert apply_coupon(total, \"FEST20\") >= 0",
   "test": true,
   "out": {
    "text": "......  [100%]\n6 passed in 0.01s"
   }
  },
  {
   "h": "Integration tests: real database",
   "p": [
    "Test your SQL and repository against a real database (SQLite here; for Postgres use a test container or a throwaway test database). Fakes can't catch wrong SQL."
   ],
   "code": "import sqlite3, pytest\n\nclass OrderRepo:\n    def __init__(self, conn): self.conn = conn\n    def add(self, oid, total, status): self.conn.execute(\"INSERT INTO orders VALUES (?, ?, ?)\", (oid, total, status))\n    def revenue(self): return self.conn.execute(\"SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed'\").fetchone()[0]\n\n@pytest.fixture\ndef repo():\n    conn = sqlite3.connect(\":memory:\")\n    conn.execute(\"CREATE TABLE orders (id INTEGER PRIMARY KEY, total INTEGER, status TEXT)\")\n    yield OrderRepo(conn)\n    conn.close()\n\ndef test_revenue_counts_only_completed(repo):\n    repo.add(1, 500, \"completed\"); repo.add(2, 300, \"cancelled\"); repo.add(3, 200, \"completed\")\n    assert repo.revenue() == 700\n\ndef test_revenue_empty(repo):\n    assert repo.revenue() == 0\n\ndef test_duplicate_id_rejected(repo):\n    repo.add(1, 500, \"completed\")\n    with pytest.raises(sqlite3.IntegrityError):\n        repo.add(1, 100, \"completed\")",
   "test": true,
   "out": {
    "text": "...  [100%]\n3 passed in 0.01s"
   }
  },
  {
   "h": "Test doubles: fakes, stubs, mocks",
   "p": [
    "<b>Stub</b>: returns canned answers. <b>Fake</b>: a working simple version (in-memory repo). <b>Mock</b>: records calls so you can check them. Prefer fakes and stubs; use mocks to check that an important call happened (e.g. an email was sent once)."
   ],
   "code": "from unittest.mock import Mock\n\ndef notify_if_large(order, mailer):\n    if order[\"total\"] > 50_000:\n        mailer.send(\"finance@acme.com\", f\"large order {order['id']}\")\n\ndef test_large_order_notifies_finance():\n    mailer = Mock()\n    notify_if_large({\"id\": 6, \"total\": 58_000}, mailer)\n    mailer.send.assert_called_once_with(\"finance@acme.com\", \"large order 6\")\n\ndef test_small_order_does_not_notify():\n    mailer = Mock()\n    notify_if_large({\"id\": 7, \"total\": 900}, mailer)\n    mailer.send.assert_not_called()",
   "test": true,
   "out": {
    "text": "..  [100%]\n2 passed in 0.01s"
   }
  },
  {
   "h": "Coverage and what to test",
   "p": [
    "Test behaviour, not implementation details. Cover business rules, edge cases (empty, zero, max, None, duplicates), error paths and bugs you've fixed. Coverage (<code>pytest --cov</code>) shows untested lines; it's a guide, not a goal: 100% coverage with weak assertions proves little."
   ]
  }
 ],
 "mistakes": [
  "Only end-to-end tests: slow, flaky, hard to debug.",
  "Mocking everything, so tests pass while real integrations fail.",
  "Tests that depend on order or shared state.",
  "Asserting on implementation details, so every refactor breaks tests."
 ],
 "practice": [
  {
   "q": "Write parametrized tests for <code>shipping_fee(subtotal)</code>: free from ₹999, else ₹79. Include the boundary.",
   "code": "import pytest\n\ndef shipping_fee(subtotal): return 0 if subtotal >= 999 else 79\n\n@pytest.mark.parametrize(\"subtotal, fee\", [(0, 79), (998, 79), (999, 0), (5000, 0)])\ndef test_shipping_fee(subtotal, fee):\n    assert shipping_fee(subtotal) == fee",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.01s"
   }
  },
  {
   "q": "Your E2E suite takes 40 minutes and fails randomly. What do you change?",
   "a": "Move most checks down the pyramid: business rules into unit tests, DB/API behaviour into integration tests. Keep only a few E2E journeys. Fix flakiness causes (fixed waits → explicit waits, shared data → per-test data, external calls → stubs) and run E2E nightly if needed."
  }
 ],
 "check": [
  [
   "Most tests in a healthy suite should be…",
   [
    "End-to-end",
    "Unit tests",
    "Manual",
    "Load tests"
   ],
   1,
   "Fast and focused."
  ],
  [
   "Why integration tests with a real database?",
   [
    "Speed",
    "Fakes can't catch wrong SQL or constraints",
    "Required",
    "Coverage"
   ],
   1,
   "Test the real interaction."
  ],
  [
   "When is a mock most useful?",
   [
    "Always",
    "To check an important call happened (e.g. email sent once)",
    "To replace all logic",
    "Never"
   ],
   1,
   "Verify interactions sparingly."
  ]
 ],
 "remember": [
  "Pyramid: many unit, some integration, few E2E.",
  "Arrange → act → assert; parametrize edge cases and boundaries.",
  "Integration tests use real DB/HTTP inside your system.",
  "Prefer fakes/stubs; mocks to verify key calls.",
  "Test behaviour, not internals; coverage is a guide."
 ]
};
L["clean-code:build-library"] = {
 "title": "Project: a small, well-designed library",
 "level": "Project",
 "one": "Build a small reusable library, for example a <b>notification sender</b> that supports email, SMS and WhatsApp with retries and templates, using the course's ideas: clear interfaces, patterns, DI and a solid test suite.",
 "why": "A clean, tested library on GitHub shows design skill better than a big messy app. It's also exactly what teams need: shared code others can rely on.",
 "steps": [
  {
   "h": "The design",
   "code": "notify/\n├── channels.py     Channel protocol + EmailChannel, SmsChannel (adapters around providers)\n├── templates.py    render(template_name, **values) with required-field checks\n├── sender.py       Notifier: picks channel (factory), retries (decorator), logs results\n└── tests/          unit tests with fake providers; one integration test per real provider (optional)",
   "lang": "text"
  },
  {
   "h": "The core, small and injected",
   "code": "from dataclasses import dataclass\nfrom typing import Protocol\nimport string\n\nclass Channel(Protocol):\n    def send(self, to: str, body: str) -> str: ...\n\nTEMPLATES = {\n    \"shipped\": \"Hi $name, your order $order_id has shipped. Track it: $link\",\n    \"otp\": \"Your code is $code. It expires in 10 minutes.\",\n}\n\ndef render(template_name: str, **values) -> str:\n    template = string.Template(TEMPLATES[template_name])\n    try:\n        return template.substitute(**values)\n    except KeyError as e:\n        raise ValueError(f\"template {template_name!r} needs {e.args[0]!r}\") from None\n\nclass TemporaryError(Exception): pass\n\n@dataclass\nclass Notifier:\n    channels: dict\n    max_attempts: int = 3\n    def notify(self, channel: str, to: str, template: str, **values) -> str:\n        body = render(template, **values)\n        last = None\n        for attempt in range(1, self.max_attempts + 1):\n            try:\n                return self.channels[channel].send(to, body)\n            except TemporaryError as e:\n                last = e\n        raise RuntimeError(f\"{channel} failed after {self.max_attempts} attempts: {last}\")\n\nclass FakeSms:\n    def __init__(self, fail_times=0): self.fail_times, self.sent = fail_times, []\n    def send(self, to, body):\n        if self.fail_times:\n            self.fail_times -= 1\n            raise TemporaryError(\"provider 503\")\n        self.sent.append((to, body))\n        return f\"sms-{len(self.sent)}\"\n\nsms = FakeSms(fail_times=1)\nn = Notifier({\"sms\": sms})\nprint(n.notify(\"sms\", \"+91 98xxxx\", \"shipped\", name=\"Asha\", order_id=6, link=\"https://t.co/x\"))\nprint(sms.sent)\ntry:\n    n.notify(\"sms\", \"+91 98xxxx\", \"shipped\", name=\"Asha\")\nexcept ValueError as e:\n    print(\"error:\", e)",
   "out": {
    "text": "sms-1\n[('+91 98xxxx', 'Hi Asha, your order 6 has shipped. Track it: https://t.co/x')]\nerror: template 'shipped' needs 'order_id'"
   }
  },
  {
   "h": "The tests",
   "code": "import pytest, string\nfrom dataclasses import dataclass\n\nTEMPLATES = {\"otp\": \"Your code is $code.\"}\ndef render(template_name, **values):\n    try:\n        return string.Template(TEMPLATES[template_name]).substitute(**values)\n    except KeyError as e:\n        raise ValueError(f\"needs {e.args[0]}\") from None\n\nclass TemporaryError(Exception): pass\n\n@dataclass\nclass Notifier:\n    channels: dict\n    max_attempts: int = 3\n    def notify(self, channel, to, template, **values):\n        body = render(template, **values)\n        for _ in range(self.max_attempts):\n            try:\n                return self.channels[channel].send(to, body)\n            except TemporaryError:\n                pass\n        raise RuntimeError(\"gave up\")\n\nclass FakeChannel:\n    def __init__(self, fail_times=0): self.fail_times, self.sent = fail_times, []\n    def send(self, to, body):\n        if self.fail_times:\n            self.fail_times -= 1; raise TemporaryError()\n        self.sent.append((to, body)); return \"ok\"\n\ndef test_sends_rendered_message():\n    ch = FakeChannel()\n    assert Notifier({\"sms\": ch}).notify(\"sms\", \"+91\", \"otp\", code=\"4821\") == \"ok\"\n    assert ch.sent == [(\"+91\", \"Your code is 4821.\")]\n\ndef test_retries_temporary_errors():\n    ch = FakeChannel(fail_times=2)\n    assert Notifier({\"sms\": ch}).notify(\"sms\", \"+91\", \"otp\", code=\"1\") == \"ok\"\n\ndef test_gives_up_after_max_attempts():\n    with pytest.raises(RuntimeError):\n        Notifier({\"sms\": FakeChannel(fail_times=5)}).notify(\"sms\", \"+91\", \"otp\", code=\"1\")\n\ndef test_missing_template_value():\n    with pytest.raises(ValueError):\n        Notifier({\"sms\": FakeChannel()}).notify(\"sms\", \"+91\", \"otp\")",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.01s"
   }
  },
  {
   "h": "Publish it properly",
   "p": [
    "Add a <code>pyproject.toml</code>, a README with a 10-line usage example, type hints throughout, <code>ruff</code> + <code>pytest</code> in GitHub Actions, and a CHANGELOG. Version it (0.1.0) and tag releases. That's what a reusable library looks like in a real company."
   ]
  }
 ],
 "mistakes": [
  "A library that depends on a specific provider everywhere instead of behind an adapter.",
  "No tests for failure paths (provider down, missing template values).",
  "A README without a usage example.",
  "Parameter names that clash with user data: <code>render(name, **values)</code> breaks when a template needs a <code>name</code> value. (The build of this very lesson caught that bug.)"
 ],
 "practice": [
  {
   "q": "Add a WhatsApp channel. Which files change, and which don't?",
   "a": "Add a <code>WhatsAppChannel</code> adapter in channels.py (and its tests). Notifier, templates and existing channels don't change; you register the new channel in the dict. That's open/closed in action."
  },
  {
   "q": "How would you make sure two notifications for the same order event aren't sent twice?",
   "a": "Accept an idempotency key (e.g. <code>order-6-shipped</code>), store keys of sent messages (Redis or DB with a TTL), and skip if already present. Test it with a fake store."
  }
 ],
 "check": [
  [
   "Where do provider-specific details belong?",
   [
    "Everywhere",
    "Inside adapter classes behind a common interface",
    "In templates",
    "In tests only"
   ],
   1,
   "Adapters isolate them."
  ],
  [
   "Adding a new channel should…",
   [
    "Change Notifier's logic",
    "Add a new adapter and register it",
    "Rewrite everything",
    "Be impossible"
   ],
   1,
   "Open/closed."
  ],
  [
   "Why fake channels in tests?",
   [
    "Speed and control: test retries and failures without real SMS",
    "They're required",
    "Real channels are illegal",
    "No reason"
   ],
   0,
   "Deterministic tests."
  ]
 ],
 "remember": [
  "Small protocol + adapters + factory + retry, all injected.",
  "Tests for success, retries, give-up and missing values.",
  "pyproject, README example, type hints, CI, versioned releases."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
