// Python course. Every Python example is run by tools/course-builder/build.js and its real output stored.
module.exports = [
{
 id: "start-here",
 title: "Start here: install Python and run your first program",
 level: "Beginner",
 one: "Python is a programming language that reads almost like English. You write instructions in a <code>.py</code> file and Python runs them top to bottom.",
 why: "Python is the most asked-for language in AI, data and backend jobs. It's also the easiest first language: short, readable and forgiving.",
 steps: [
  { h: "Install Python",
    p: ["<b>Ubuntu:</b> Python 3 is usually already there. Check with <code>python3 --version</code>. If not: <code>sudo apt install python3 python3-pip python3-venv</code>.",
        "<b>Mac:</b> install from python.org or with Homebrew: <code>brew install python</code>. <b>Windows:</b> install from python.org and tick “Add Python to PATH”.",
        "Then install an editor. <b>VS Code</b> with the Python extension is the most common choice."],
    code: "python3 --version", lang: "bash", out: { text: "Python 3.13.1", hand: true } },
  { h: "Your first program",
    p: ["Create a file <code>hello.py</code>, type this, save, and run <code>python3 hello.py</code> in the terminal.",
        "<code>print()</code> shows something on the screen. Text goes inside quotes. A line starting with <code>#</code> is a <b>comment</b>: Python ignores it; it's a note for humans."],
    code: `# my first program
print("Hello, world!")
print("I am learning Python")
print(2 + 3)` },
  { h: "Python runs top to bottom",
    p: ["Each line runs in order. If a line has a mistake, Python stops there and shows an <b>error</b>. Errors are normal: read the last line, it tells you what went wrong."],
    code: `print("line 1 runs")
print("line 2 runs")
pritn("line 3 has a typo")
print("line 4 never runs")`, expectError: true,
    note: "<code>NameError</code> means Python doesn't know that name. Here we typed <code>pritn</code> instead of <code>print</code>." },
  { h: "The interactive shell (REPL)",
    p: ["Type <code>python3</code> alone and press Enter. You get a <code>&gt;&gt;&gt;</code> prompt where each line runs as soon as you press Enter. Great for quick experiments. Type <code>exit()</code> to leave."],
    code: `>>> 10 * 3
30
>>> "ha" * 3
'hahaha'
>>> exit()`, lang: "text" }
 ],
 mistakes: [
  "Typing <code>python</code> instead of <code>python3</code> on Ubuntu/Mac (it may be missing or be old Python 2).",
  "Forgetting quotes around text: <code>print(hello)</code> looks for a variable named hello.",
  "Panicking at errors. Read the <b>last line</b> of the error first, then the line number above it."
 ],
 practice: [
  { q: "Write a program that prints your name, your city, and the result of 7 × 6.", code: `print("Fouzan")
print("Calicut")
print(7 * 6)` },
  { q: "What does this error mean? <code>SyntaxError: unterminated string literal</code>", a: "You opened a quote and never closed it, for example <code>print(\"hello)</code>." }
 ],
 check: [
  ["What does print() do?", ["Prints on paper", "Shows a value on the screen", "Saves a file", "Ends the program"], 1, "print() writes output to the terminal."],
  ["A line starting with # is…", ["An error", "A comment that Python ignores", "A title", "A variable"], 1, "Comments are notes for people."],
  ["Python hits an error on line 3 of 5. What happens?", ["It skips line 3", "It stops at line 3 and shows the error", "It runs lines 4 and 5 first", "Nothing"], 1, "Python stops at the first error."]
 ],
 remember: [
  "Run a file: python3 file.py. Quick tests: python3 (REPL).",
  "print(...) shows output. # starts a comment.",
  "Code runs top to bottom and stops at the first error.",
  "Read the last line of an error first."
 ]
},
{
 id: "basics",
 title: "Variables, numbers and text",
 level: "Beginner",
 one: "A <b>variable</b> is a name for a value: <code>price = 900</code>. Values have <b>types</b>: whole numbers (<code>int</code>), decimals (<code>float</code>), text (<code>str</code>) and True/False (<code>bool</code>).",
 why: "Every program stores and changes values. Knowing types saves you from the most common beginner bugs, like adding text to a number.",
 steps: [
  { h: "Variables",
    p: ["<code>=</code> puts a value into a name. Use lower_case_with_underscores for names. You can change a variable later."],
    code: `name = "Asha"
age = 29
price = 899.50
is_member = True
print(name, age, price, is_member)

age = age + 1
print("Next year:", age)` },
  { h: "Types and type()",
    p: ["<code>type(x)</code> tells you what kind of value x is."],
    code: `print(type(29))
print(type(899.5))
print(type("Asha"))
print(type(True))` },
  { h: "Numbers and maths",
    p: ["<code>+ - * /</code> work as expected. <code>/</code> always gives a float. <code>//</code> is whole-number division, <code>%</code> is the remainder, <code>**</code> is power. <code>round(x, 2)</code> rounds."],
    code: `print(7 / 2)
print(7 // 2)
print(7 % 2)
print(2 ** 10)
print(round(10 / 3, 2))
print(0.1 + 0.2)`,
    note: "<code>0.1 + 0.2</code> isn't exactly 0.3: floats are stored in binary. For money use <code>Decimal</code> (later) or work in whole paise/cents." },
  { h: "Text (strings)",
    p: ["Text goes in quotes. <code>len()</code> counts characters. Strings have methods: <code>.upper()</code>, <code>.lower()</code>, <code>.strip()</code> (remove spaces at the ends), <code>.replace()</code>, <code>.split()</code>.",
        "Indexing: <code>s[0]</code> is the first character, <code>s[-1]</code> the last. Slicing: <code>s[0:4]</code> is characters 0 to 3."],
    code: `city = "  Kochi, Kerala "
clean = city.strip()
print(clean)
print(clean.upper())
print(len(clean))
print(clean[0], clean[-1])
print(clean[0:5])
print(clean.split(", "))` },
  { h: "f-strings: put values inside text",
    p: ["Put <code>f</code> before the quote and write variables in <code>{ }</code>. <code>{x:.2f}</code> shows 2 decimals; <code>{x:,}</code> adds thousands commas."],
    code: `name = "Asha"
total = 64500
print(f"{name} spent ₹{total:,} this year")
print(f"Average per order: {total / 3:.2f}")` },
  { h: "Converting between types",
    p: ["<code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code> convert. <code>input()</code> always gives text, so convert it before doing maths. Text and numbers can't be added directly:"],
    code: `qty = "3"
price = 400
print(int(qty) * price)
print("Total: " + str(int(qty) * price))
print(qty + price)`, expectError: true }
 ],
 mistakes: [
  "Adding text and numbers: <code>\"3\" + 4</code> → TypeError. Convert first: <code>int(\"3\") + 4</code>.",
  "Using <code>=</code> (assign) when you mean <code>==</code> (compare).",
  "Expecting <code>/</code> to give a whole number. Use <code>//</code> for that.",
  "Forgetting strings can't be changed in place: <code>s.upper()</code> returns a new string; it doesn't change s."
 ],
 practice: [
  { q: "A product costs 900 and you buy 4. Print the total, and the total with 18% tax, rounded to 2 decimals, using f-strings.", code: `price = 900
qty = 4
total = price * qty
print(f"Total: {total}")
print(f"With tax: {total * 1.18:.2f}")` },
  { q: "From the text <code>\"  asha.rao@example.com \"</code>, print the clean email in lower case and the part before the @.", code: `email = "  asha.rao@example.com "
clean = email.strip().lower()
print(clean)
print(clean.split("@")[0])` },
  { q: "What's the difference between <code>7 / 2</code>, <code>7 // 2</code> and <code>7 % 2</code>?", a: "3.5 (normal division, always a float), 3 (whole-number division) and 1 (the remainder)." }
 ],
 check: [
  ["type(\"42\") is…", ["int", "str", "float", "bool"], 1, "Anything in quotes is a string."],
  ["What does f\"{x:.2f}\" do when x = 3.14159?", ["Shows 3", "Shows 3.14", "Shows 3.14159", "Error"], 1, ".2f means 2 decimal places."],
  ["\"5\" + 5 gives…", ["10", "\"55\"", "A TypeError", "5"], 2, "You can't add text and a number. Convert first."]
 ],
 remember: [
  "name = value. Types: int, float, str, bool. Check with type(x).",
  "/ gives float, // whole division, % remainder, ** power.",
  "Strings: len, .strip(), .lower(), .upper(), .replace(), .split(), s[0], s[-1], s[a:b].",
  "f\"{name} {x:.2f} {n:,}\" puts values in text.",
  "Convert with int(), float(), str(). input() always returns text."
 ]
},
{
 id: "collections",
 title: "Lists, dictionaries, sets and tuples",
 level: "Beginner",
 one: "A <b>list</b> is an ordered collection <code>[1, 2, 3]</code>, a <b>dict</b> maps keys to values <code>{\"name\": \"Asha\"}</code>, a <b>set</b> holds unique items, and a <b>tuple</b> is a list that can't change.",
 why: "Real data is many things: many orders, a customer with many fields. JSON from APIs becomes lists and dicts in Python, so you'll use them every day.",
 steps: [
  { h: "Lists: ordered, changeable",
    p: ["Create with <code>[ ]</code>. Index from 0. <code>.append()</code> adds to the end, <code>.remove()</code> removes a value, <code>len()</code> counts, <code>in</code> checks membership."],
    code: `cart = ["laptop", "tea"]
cart.append("coffee")
print(cart)
print(cart[0], len(cart))
print("tea" in cart)
cart.remove("tea")
print(cart)` },
  { h: "Sorting and slicing lists",
    p: ["<code>sorted(x)</code> returns a new sorted list. <code>.sort()</code> sorts in place. <code>sum</code>, <code>min</code>, <code>max</code> work on numbers."],
    code: `prices = [55000, 3000, 900, 400, 8000]
print(sorted(prices))
print(sorted(prices, reverse=True)[:3])
print(sum(prices), min(prices), max(prices))` },
  { h: "Dictionaries: key → value",
    p: ["Create with <code>{key: value}</code>. Read with <code>d[\"key\"]</code>. <code>d.get(\"key\", default)</code> doesn't crash if the key is missing. Add or change with <code>d[\"key\"] = value</code>."],
    code: `customer = {"id": 1, "name": "Asha Rao", "city": "Kochi"}
print(customer["name"])
customer["email"] = "asha@example.com"
print(customer.get("phone", "no phone"))
for key, value in customer.items():
    print(key, "=", value)` },
  { h: "Lists of dicts: what API data looks like",
    p: ["Most JSON from APIs is a list of dicts. Loop through it and pick fields."],
    code: `orders = [
    {"id": 1, "customer": "Asha", "total": 55000, "status": "completed"},
    {"id": 2, "customer": "Ben",  "total": 9200,  "status": "completed"},
    {"id": 3, "customer": "Chen", "total": 3000,  "status": "cancelled"},
]
completed = [o for o in orders if o["status"] == "completed"]
print(len(completed), "completed")
print("Revenue:", sum(o["total"] for o in completed))` },
  { h: "Sets and tuples",
    p: ["A <b>set</b> <code>{ }</code> keeps each value once, and makes “is x in here?” very fast. Great for removing duplicates.",
        "A <b>tuple</b> <code>( )</code> is like a list that can't change. Used for fixed pairs like coordinates, and to return two values from a function."],
    code: `cities = ["Kochi", "Dubai", "Kochi", "Bengaluru", "Dubai"]
unique = set(cities)
print(sorted(unique), len(unique))

point = (10.5, 76.2)
lat, lon = point
print(lat, lon)` },
  { h: "Counting things",
    p: ["Counting how often each value appears is very common. <code>collections.Counter</code> does it in one line."],
    code: `from collections import Counter
statuses = ["completed", "pending", "completed", "cancelled", "completed"]
counts = Counter(statuses)
print(counts)
print(counts.most_common(1))` }
 ],
 mistakes: [
  "<code>d[\"missing\"]</code> → KeyError. Use <code>d.get(\"missing\")</code> when a key might not exist.",
  "Indexing past the end: a list of 3 items has indexes 0, 1, 2. <code>x[3]</code> → IndexError.",
  "Copying by assignment: <code>b = a</code> doesn't copy a list; both names point to the same list. Use <code>b = a.copy()</code>.",
  "Expecting a set to keep order. Sets are unordered; sort when you print."
 ],
 practice: [
  { q: "Given a list of order totals <code>[55000, 6900, 9200, 3000, 3600]</code>, print how many are over 5,000 and their sum.", code: `totals = [55000, 6900, 9200, 3000, 3600]
big = [t for t in totals if t > 5000]
print(len(big), sum(big))` },
  { q: "Build a dict of product → price for Laptop 55000, Tea 400, Coffee 900. Increase Tea by 10% and print the dict.", code: `prices = {"Laptop": 55000, "Tea": 400, "Coffee": 900}
prices["Tea"] = round(prices["Tea"] * 1.10)
print(prices)` },
  { q: "From a list of emails with duplicates, print the unique emails sorted.", code: `emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"]
print(sorted(set(emails)))` }
 ],
 check: [
  ["x = [10, 20, 30]. What is x[-1]?", ["10", "20", "30", "Error"], 2, "-1 means the last item."],
  ["Safest way to read a key that may be missing?", ["d[\"key\"]", "d.get(\"key\")", "d.key", "d(\"key\")"], 1, ".get returns None (or your default) instead of crashing."],
  ["Best way to remove duplicates from a list?", ["sorted(x)", "set(x)", "x.remove()", "len(x)"], 1, "A set keeps each value once."]
 ],
 remember: [
  "list [ ]: ordered, changeable. append, remove, len, in, sorted.",
  "dict {k: v}: d[k], d.get(k, default), d[k] = v, d.items().",
  "API JSON = list of dicts. Loop and pick fields.",
  "set: unique values, fast membership. tuple ( ): fixed, unpack with a, b = t.",
  "Counter(list) counts how often each value appears."
 ]
},
{
 id: "control-flow",
 title: "Decisions and loops: if, for, while",
 level: "Beginner",
 one: "<code>if</code> chooses what to do, <code>for</code> repeats for each item, <code>while</code> repeats until a condition is false. Python uses <b>indentation</b> (4 spaces) to group lines.",
 why: "Programs make decisions (“is stock low?”) and process many items (“for each order…”). This is the core of all logic.",
 steps: [
  { h: "if, elif, else",
    p: ["The indented lines run only when the condition is true. <code>elif</code> = else if. Comparisons: <code>== != &gt; &lt; &gt;= &lt;=</code>. Combine with <code>and</code>, <code>or</code>, <code>not</code>."],
    code: `total = 9200
if total >= 10000:
    print("big order")
elif total >= 3000:
    print("medium order")
else:
    print("small order")

city, is_member = "Kochi", True
if city == "Kochi" and is_member:
    print("free delivery")` },
  { h: "for loops",
    p: ["<code>for item in collection:</code> runs the block once per item. <code>range(n)</code> gives 0 to n-1. <code>enumerate</code> gives the position too."],
    code: `products = ["Laptop", "Tea", "Coffee"]
for p in products:
    print("Product:", p)

for i, p in enumerate(products, start=1):
    print(i, p)

for n in range(3):
    print("round", n)` },
  { h: "Building results in a loop",
    p: ["A very common pattern: start with an empty total or list, then add to it inside the loop."],
    code: `orders = [("Asha", 55000), ("Ben", 9200), ("Asha", 6900), ("Chen", 3000)]
per_customer = {}
for name, total in orders:
    per_customer[name] = per_customer.get(name, 0) + total
print(per_customer)` },
  { h: "while, break and continue",
    p: ["<code>while condition:</code> repeats as long as it's true. <code>break</code> leaves the loop. <code>continue</code> skips to the next round. Make sure a while loop can end!"],
    code: `stock = 3
while stock > 0:
    print("sold one, left:", stock - 1)
    stock -= 1

for n in [5, -1, 8, 0, 3]:
    if n < 0:
        continue
    if n == 0:
        break
    print("processing", n)` },
  { h: "Comprehensions: a loop in one line",
    p: ["<code>[expression for item in list if condition]</code> builds a new list. Same idea for dicts: <code>{k: v for …}</code>. Use them for simple transforms; use a normal loop when it gets complicated."],
    code: `prices = {"Laptop": 55000, "Tea": 400, "Coffee": 900}
cheap = [name for name, p in prices.items() if p < 1000]
with_tax = {name: round(p * 1.18) for name, p in prices.items()}
print(cheap)
print(with_tax)` }
 ],
 mistakes: [
  "Wrong indentation → <code>IndentationError</code> or logic that runs at the wrong time. Use 4 spaces, never mix tabs and spaces.",
  "Forgetting the colon <code>:</code> after if/for/while/def.",
  "A while loop whose condition never becomes false: it runs forever. Press Ctrl+C to stop it.",
  "Changing a list while looping over it. Loop over a copy, or build a new list."
 ],
 practice: [
  { q: "Print numbers 1 to 15, but print \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5 and \"FizzBuzz\" for both. (A classic interview warm-up.)", code: `for n in range(1, 16):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)` },
  { q: "Given order statuses, count how many of each without using Counter.", code: `statuses = ["completed", "pending", "completed", "cancelled", "completed"]
counts = {}
for s in statuses:
    counts[s] = counts.get(s, 0) + 1
print(counts)` },
  { q: "Using a comprehension, get the lengths of these words: ['sql', 'python', 'api'].", code: `words = ["sql", "python", "api"]
print([len(w) for w in words])` }
 ],
 check: [
  ["What groups lines into an if block in Python?", ["Curly braces { }", "Indentation", "The word end", "Semicolons"], 1, "Python uses indentation (4 spaces)."],
  ["range(3) gives…", ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3"], 1, "range(n) goes from 0 up to n-1."],
  ["What does continue do inside a loop?", ["Ends the loop", "Skips the rest of this round and goes to the next", "Restarts the program", "Nothing"], 1, "break ends the loop; continue skips one round."]
 ],
 remember: [
  "if / elif / else with a colon, and a 4-space indented block.",
  "for x in items: ... · range(n) = 0..n-1 · enumerate(items, start=1).",
  "Accumulate: total = 0 / d = {} before the loop, update inside.",
  "while cond: ... must be able to end. break = leave, continue = skip.",
  "[f(x) for x in items if cond] for simple transforms."
 ]
},
{
 id: "functions",
 title: "Functions: reusable blocks of code",
 level: "Beginner",
 one: "A <b>function</b> is a named block of code you can run again and again: <code>def add_tax(amount): ...</code>. It takes <b>inputs</b> (parameters) and gives back an <b>output</b> with <code>return</code>.",
 why: "Functions stop you repeating yourself, make code easy to test, and are how every real codebase is organised.",
 steps: [
  { h: "Define and call",
    p: ["<code>def name(parameters):</code> then an indented body. <code>return</code> sends a value back. Call it with <code>name(arguments)</code>."],
    code: `def add_tax(amount, rate):
    return round(amount * (1 + rate), 2)

print(add_tax(1000, 0.18))
print(add_tax(250, 0.05))` },
  { h: "Default values and keyword arguments",
    p: ["Give a parameter a default so callers can skip it. Call with names (<code>rate=0.05</code>) to make calls clearer."],
    code: `def add_tax(amount, rate=0.18):
    return round(amount * (1 + rate), 2)

print(add_tax(1000))
print(add_tax(1000, rate=0.05))` },
  { h: "Return more than one value",
    p: ["Return a tuple and unpack it."],
    code: `def min_max_avg(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

low, high, avg = min_max_avg([55000, 6900, 9200, 3000])
print(low, high, round(avg))` },
  { h: "print vs return",
    p: ["<code>print</code> only shows a value. <code>return</code> gives it back so other code can use it. A function without return gives back <code>None</code>."],
    code: `def shows(x):
    print(x * 2)

def gives(x):
    return x * 2

a = shows(5)
b = gives(5)
print("a is", a)
print("b is", b)` },
  { h: "Scope: variables inside stay inside",
    p: ["Variables created inside a function exist only inside it. Pass values in as parameters and get results out with return; don't rely on outside variables."],
    code: `def make_label(name):
    label = name.upper()
    return label

print(make_label("asha"))
print(label)`, expectError: true },
  { h: "Docstrings and small functions",
    p: ["Write a short <b>docstring</b> (text in triple quotes) saying what the function does. Keep functions small: one job each. If you can't name it simply, it's doing too much."],
    code: `def order_status_label(status):
    """Return a friendly label for an order status."""
    labels = {"completed": "Delivered", "pending": "On the way", "cancelled": "Cancelled"}
    return labels.get(status, "Unknown")

for s in ["completed", "pending", "lost"]:
    print(s, "->", order_status_label(s))` }
 ],
 mistakes: [
  "Printing inside a function instead of returning. Then you can't use the result.",
  "A mutable default: <code>def f(items=[])</code> shares one list between all calls. Use <code>items=None</code> and create the list inside.",
  "Functions that do five things. Split them.",
  "Forgetting the brackets when calling: <code>add_tax</code> is the function itself; <code>add_tax(100)</code> runs it."
 ],
 practice: [
  { q: "Write <code>is_valid_email(text)</code> that returns True if the text has exactly one @ and a dot after it.", code: `def is_valid_email(text):
    if text.count("@") != 1:
        return False
    name, domain = text.split("@")
    return len(name) > 0 and "." in domain

for e in ["a@x.com", "bad.email", "a@@x.com", "a@xcom"]:
    print(e, is_valid_email(e))` },
  { q: "Write <code>order_total(items)</code> where items is a list of (qty, price) pairs.", code: `def order_total(items):
    return sum(qty * price for qty, price in items)

print(order_total([(2, 3000), (1, 900)]))` },
  { q: "Why is <code>def add(item, bag=[])</code> a bug?", a: "The default list is created once and shared by every call, so items from earlier calls pile up. Use <code>bag=None</code> and inside write <code>if bag is None: bag = []</code>." }
 ],
 check: [
  ["What does a function return if it has no return statement?", ["0", "An empty string", "None", "An error"], 2, "Without return, a function gives back None."],
  ["def f(x, rate=0.18): … How do you call it with rate 0.05?", ["f(100, 0.05) or f(100, rate=0.05)", "f(rate=0.05)", "f(0.05)", "f.rate = 0.05"], 0, "Pass it by position or by name."],
  ["Main difference between print and return?", ["None", "print shows a value; return hands it back to the caller", "return shows it on screen", "print is faster"], 1, "Use return when other code needs the result."]
 ],
 remember: [
  "def name(params): ... return value. Call with name(args).",
  "Defaults: def f(x, rate=0.18). Call by name: f(x, rate=0.05).",
  "Return several values as a tuple: a, b = f().",
  "print shows; return gives back. No return → None.",
  "Variables inside a function stay inside. Never use a list as a default value."
 ]
},
{
 id: "errors",
 title: "Errors and exceptions: handling problems",
 level: "Beginner+",
 one: "When something goes wrong, Python <b>raises an exception</b>. You can <b>catch</b> it with <code>try / except</code> and decide what to do instead of crashing.",
 why: "Real programs meet bad input, missing files and failing APIs. Handling errors well is what makes software reliable, and it's a big part of integration work.",
 steps: [
  { h: "Reading a traceback",
    p: ["The error message (traceback) shows where it happened and, on the last line, the <b>type</b> and <b>message</b>. Common types: <code>ValueError</code> (bad value), <code>TypeError</code> (wrong type), <code>KeyError</code> (missing dict key), <code>IndexError</code>, <code>FileNotFoundError</code>, <code>ZeroDivisionError</code>."],
    code: `qty = int("three")`, expectError: true },
  { h: "try / except",
    p: ["Put risky code in <code>try</code>. If that specific error happens, the <code>except</code> block runs instead of crashing."],
    code: `def parse_qty(text):
    try:
        return int(text)
    except ValueError:
        print(f"'{text}' is not a number, using 0")
        return 0

print(parse_qty("4"))
print(parse_qty("three"))` },
  { h: "else and finally",
    p: ["<code>else</code> runs if no error happened. <code>finally</code> always runs, error or not: used for cleanup like closing connections."],
    code: `def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("can't divide by zero")
        return None
    else:
        print("worked")
        return result
    finally:
        print("done either way")

print(divide(10, 2))
print(divide(10, 0))` },
  { h: "Raising your own errors",
    p: ["Use <code>raise</code> when input breaks your rules. Fail early with a clear message rather than continuing with bad data."],
    code: `def set_rating(stars):
    if not 1 <= stars <= 5:
        raise ValueError(f"rating must be 1-5, got {stars}")
    return stars

print(set_rating(4))
try:
    set_rating(9)
except ValueError as e:
    print("Rejected:", e)` },
  { h: "Your own exception types",
    p: ["For bigger programs, make your own exception classes so callers can catch exactly your errors."],
    code: `class PaymentError(Exception):
    pass

def charge(amount):
    if amount <= 0:
        raise PaymentError("amount must be positive")
    return f"charged {amount}"

for a in [500, -1]:
    try:
        print(charge(a))
    except PaymentError as e:
        print("Payment failed:", e)` }
 ],
 mistakes: [
  "A bare <code>except:</code> or <code>except Exception: pass</code>. It hides every bug, even typos. Catch the specific error you expect.",
  "Catching an error and continuing as if nothing happened. At least log it, or return a clear fallback.",
  "Using try/except for normal flow when a simple check is clearer (<code>if key in d</code>).",
  "Losing the original error. Inside except, <code>raise NewError(...) from e</code> keeps the cause."
 ],
 practice: [
  { q: "Write <code>safe_get_price(prices, name)</code> that returns the price, or None and a message if the product doesn't exist (use try/except KeyError).", code: `def safe_get_price(prices, name):
    try:
        return prices[name]
    except KeyError:
        print(f"no product called {name}")
        return None

prices = {"Tea": 400}
print(safe_get_price(prices, "Tea"))
print(safe_get_price(prices, "Milk"))` },
  { q: "Convert a list of text values to numbers, skipping the bad ones and counting them.", code: `raw = ["10", "x", "25", "", "7"]
numbers, bad = [], 0
for r in raw:
    try:
        numbers.append(int(r))
    except ValueError:
        bad += 1
print(numbers, "bad:", bad)` },
  { q: "Why is <code>except Exception: pass</code> dangerous?", a: "It silently swallows every error, including bugs and typos, so the program keeps running with wrong data and you never find out why." }
 ],
 check: [
  ["int(\"abc\") raises…", ["TypeError", "ValueError", "KeyError", "NameError"], 1, "The type is right (str) but the value can't become a number."],
  ["When does a finally block run?", ["Only on errors", "Only on success", "Always", "Never"], 2, "finally always runs: use it for cleanup."],
  ["Best practice when catching errors?", ["except: pass", "Catch the specific error you expect and handle it", "Catch everything", "Never catch errors"], 1, "Specific excepts keep real bugs visible."]
 ],
 remember: [
  "Read the last line: ErrorType: message.",
  "try: risky · except SpecificError as e: handle · else: success · finally: always.",
  "raise ValueError(\"clear message\") when input breaks your rules.",
  "Custom errors: class MyError(Exception): pass.",
  "Never use bare except or except: pass."
 ]
},
{
 id: "modules-venv",
 title: "Modules, packages, pip and virtual environments",
 level: "Beginner+",
 one: "A <b>module</b> is a Python file you can <code>import</code>. <b>pip</b> installs other people's packages, and a <b>virtual environment</b> keeps each project's packages separate.",
 why: "No real project is one file. You'll split code into modules, install libraries like requests or pandas, and every job expects you to use virtual environments.",
 steps: [
  { h: "Importing from the standard library",
    p: ["Python comes with many modules built in: <code>math</code>, <code>datetime</code>, <code>json</code>, <code>random</code>, <code>pathlib</code>, <code>collections</code>… Import a whole module or just what you need."],
    code: `import math
from datetime import date, timedelta

print(math.sqrt(144))
today = date(2025, 7, 1)
print(today + timedelta(days=30))
print(today.strftime("%d %b %Y"))` },
  { h: "Your own modules",
    p: ["Any <code>.py</code> file is a module. Put helpers in <code>pricing.py</code> and import them in <code>main.py</code>."],
    files: { "pricing.py": `TAX_RATE = 0.18

def with_tax(amount):
    return round(amount * (1 + TAX_RATE), 2)
` },
    code: `# main.py   (pricing.py is in the same folder)
from pricing import with_tax, TAX_RATE

print(TAX_RATE)
print(with_tax(1000))`,
    pre: "import sys; sys.path.insert(0, '.')" },
  { h: "if __name__ == \"__main__\"",
    p: ["Code under this line runs only when you run the file directly, not when someone imports it. Use it for a file's “start” code."],
    code: `def main():
    print("running as a script")

if __name__ == "__main__":
    main()` },
  { h: "Virtual environments",
    p: ["A <b>venv</b> is a private folder of packages for one project, so project A can use pandas 1.x and project B pandas 2.x. Create one per project:"],
    code: `python3 -m venv .venv          # create (once per project)
source .venv/bin/activate      # activate (Windows: .venv\\Scripts\\activate)
pip install requests           # installs into .venv only
pip freeze > requirements.txt  # save exact versions
deactivate                     # leave`, lang: "bash" },
  { h: "Installing from requirements.txt",
    p: ["Teammates (and servers) recreate your setup with one command. Always add <code>.venv/</code> to <code>.gitignore</code>; commit <code>requirements.txt</code> instead.",
        "Newer projects often use <code>pyproject.toml</code> with tools like <b>uv</b> or <b>poetry</b>. The idea is the same: one file lists the packages, and one command installs them."],
    code: `pip install -r requirements.txt`, lang: "bash" }
 ],
 mistakes: [
  "Installing packages globally with <code>sudo pip</code>. It can break your system Python. Use a venv.",
  "Naming your file the same as a library (<code>json.py</code>, <code>requests.py</code>). Then <code>import json</code> imports your file.",
  "Committing the <code>.venv</code> folder to Git. Commit requirements.txt instead.",
  "Forgetting to activate the venv, then wondering why a package “isn't installed”."
 ],
 practice: [
  { q: "Using <code>datetime</code>, print how many days are between 2025-06-02 and 2025-08-25.", code: `from datetime import date
print((date(2025, 8, 25) - date(2025, 6, 2)).days)` },
  { q: "Using <code>random</code> with a fixed seed, pick 2 products from a list (so the result is repeatable).", code: `import random
random.seed(42)
print(random.sample(["Laptop", "Tea", "Coffee", "Chair", "Notebook"], 2))` },
  { q: "Write the commands to start a new project with its own venv and install <code>httpx</code>.", code: `mkdir myproject && cd myproject
python3 -m venv .venv
source .venv/bin/activate
pip install httpx
pip freeze > requirements.txt`, lang: "bash" }
 ],
 check: [
  ["What is a virtual environment for?", ["Running Python faster", "Keeping each project's packages separate", "Hiding code", "Testing"], 1, "Each project gets its own package versions."],
  ["What should you commit to Git?", [".venv/", "requirements.txt", "Both", "Neither"], 1, "Commit the list of packages, not the installed files."],
  ["Code under if __name__ == \"__main__\": runs…", ["Always", "Only when the file is run directly", "Only when imported", "Never"], 1, "It doesn't run when the file is imported."]
 ],
 remember: [
  "import module / from module import name. Any .py file is a module.",
  "Standard library: math, datetime, json, random, pathlib, collections, csv.",
  "if __name__ == \"__main__\": main() for script start code.",
  "python3 -m venv .venv · source .venv/bin/activate · pip install …",
  "pip freeze > requirements.txt; pip install -r requirements.txt. Ignore .venv in Git."
 ]
},
{
 id: "files-formats",
 title: "Files: text, CSV and JSON",
 level: "Beginner+",
 one: "Python reads and writes files with <code>open()</code>. The <code>csv</code> and <code>json</code> modules handle the two formats you'll meet most in real data work.",
 why: "Exports, imports, configs and API payloads are files or JSON. Reading a client's CSV and turning it into clean JSON is a daily integration task.",
 steps: [
  { h: "Read and write text files",
    p: ["Always use <code>with open(...)</code>: it closes the file for you, even if there's an error. Mode <code>\"w\"</code> writes (replaces), <code>\"a\"</code> appends, <code>\"r\"</code> reads (default). Set <code>encoding=\"utf-8\"</code>."],
    code: `with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("first line\\n")
    f.write("second line\\n")

with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())` },
  { h: "Paths with pathlib",
    p: ["<code>pathlib.Path</code> builds file paths that work on every OS and has handy helpers."],
    code: `from pathlib import Path

folder = Path("data")
folder.mkdir(exist_ok=True)
file = folder / "hello.txt"
file.write_text("hi there", encoding="utf-8")
print(file, file.exists(), file.read_text(encoding="utf-8"))
print([p.name for p in folder.glob("*.txt")])` },
  { h: "CSV: reading rows as dicts",
    p: ["<code>csv.DictReader</code> uses the header row as keys. Every value comes in as <b>text</b>, so convert numbers yourself."],
    files: { "orders.csv": "id,customer,total,status\n1,Asha,55000,completed\n2,Ben,9200,completed\n3,Chen,3000,cancelled\n4,Asha,6900,completed\n" },
    code: `import csv

with open("orders.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

print(rows[0])
revenue = sum(int(r["total"]) for r in rows if r["status"] == "completed")
print("Revenue:", revenue)` },
  { h: "CSV: writing",
    p: ["<code>csv.DictWriter</code> writes a list of dicts with a header. Open with <code>newline=\"\"</code> to avoid blank lines on Windows."],
    code: `import csv

summary = [{"customer": "Asha", "spent": 61900}, {"customer": "Ben", "spent": 9200}]
with open("summary.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["customer", "spent"])
    w.writeheader()
    w.writerows(summary)

print(open("summary.csv", encoding="utf-8").read())` },
  { h: "JSON: text ↔ Python",
    p: ["<code>json.loads(text)</code> turns JSON text into dicts and lists; <code>json.dumps(obj)</code> does the reverse. <code>json.load(f)</code> and <code>json.dump(obj, f)</code> work with files. JSON true/false/null become Python True/False/None."],
    code: `import json

payload = '{"order_id": 6, "paid": false, "items": [{"sku": "LAP", "qty": 1}], "coupon": null}'
data = json.loads(payload)
print(data["items"][0]["sku"], data["paid"], data["coupon"])

data["paid"] = True
print(json.dumps(data, indent=2))` },
  { h: "CSV to JSON: a small real task",
    p: ["Read a CSV export, clean it, and produce the JSON an API expects."],
    files: { "customers.csv": "id,name,email\n1, Asha Rao ,ASHA@EXAMPLE.COM\n2,Ben Thomas,ben@example.com\n3,Chen Li,\n" },
    code: `import csv, json

with open("customers.csv", newline="", encoding="utf-8") as f:
    clean = []
    for r in csv.DictReader(f):
        email = r["email"].strip().lower()
        if not email:
            print("skipping", r["name"].strip(), "(no email)")
            continue
        clean.append({"id": int(r["id"]), "name": r["name"].strip(), "email": email})

print(json.dumps(clean, indent=2))` }
 ],
 mistakes: [
  "Forgetting that CSV values are all strings: <code>\"100\" &gt; \"9\"</code> is False. Convert with int()/float().",
  "Opening files without <code>with</code>, so they're never closed.",
  "Not setting <code>encoding=\"utf-8\"</code>: names like “José” or “₹” break on some machines.",
  "Writing JSON with Python's <code>str(dict)</code> (single quotes). That isn't valid JSON. Use <code>json.dumps</code>."
 ],
 practice: [
  { q: "Count orders per status from the CSV.", files: { "orders.csv": "id,customer,total,status\n1,Asha,55000,completed\n2,Ben,9200,completed\n3,Chen,3000,cancelled\n4,Asha,6900,completed\n5,Divya,58000,pending\n" }, code: `import csv
from collections import Counter

with open("orders.csv", newline="", encoding="utf-8") as f:
    print(Counter(r["status"] for r in csv.DictReader(f)))` },
  { q: "Save a dict of settings to <code>config.json</code> and read it back.", code: `import json

settings = {"api_url": "https://api.example.com", "retries": 3, "debug": False}
with open("config.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2)
with open("config.json", encoding="utf-8") as f:
    print(json.load(f)["retries"])` }
 ],
 check: [
  ["Why use with open(...) as f?", ["It's faster", "It closes the file automatically, even on errors", "It's required for CSV", "It encrypts the file"], 1, "with handles cleanup for you."],
  ["Values from csv.DictReader are…", ["Already numbers", "Always strings", "Dates", "JSON"], 1, "Convert numbers yourself."],
  ["json.loads turns…", ["Python into JSON text", "JSON text into Python dicts/lists", "CSV into JSON", "A file path into text"], 1, "loads = load from a string. dumps = dump to a string."]
 ],
 remember: [
  "with open(path, mode, encoding=\"utf-8\") as f: ... (r, w, a).",
  "pathlib: Path(\"data\") / \"file.txt\", .exists(), .read_text(), .glob().",
  "csv.DictReader → list of dicts (all strings). csv.DictWriter + writeheader().",
  "json.loads / json.dumps for text; json.load / json.dump for files.",
  "JSON true/false/null ↔ Python True/False/None."
 ]
},
{
 id: "classes",
 title: "Classes and objects",
 level: "Intermediate",
 one: "A <b>class</b> is a blueprint that bundles data (<b>attributes</b>) and behaviour (<b>methods</b>). Each thing made from it is an <b>object</b>.",
 why: "Most libraries and frameworks (Django, FastAPI, Odoo, Pydantic) are built on classes. You need to read and write them comfortably.",
 steps: [
  { h: "A simple class",
    p: ["<code>__init__</code> runs when you create an object and sets its attributes. <code>self</code> means “this object”. Methods are functions inside the class."],
    code: `class Order:
    def __init__(self, order_id, customer):
        self.order_id = order_id
        self.customer = customer
        self.items = []

    def add_item(self, name, qty, price):
        self.items.append((name, qty, price))

    def total(self):
        return sum(qty * price for _, qty, price in self.items)

o = Order(2, "Asha")
o.add_item("Headphones", 2, 3000)
o.add_item("Coffee", 1, 900)
print(o.customer, o.total())` },
  { h: "Many objects from one class",
    p: ["Each object has its own data."],
    code: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.balance += amount

a = Account("Asha")
b = Account("Ben", 500)
a.deposit(1000)
print(a.owner, a.balance, "|", b.owner, b.balance)` },
  { h: "A nice printout: __repr__",
    p: ["<code>__repr__</code> controls how the object looks when printed. Very helpful when debugging."],
    code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __repr__(self):
        return f"Product({self.name!r}, {self.price})"

print(Product("Tea", 400))
print([Product("Laptop", 55000), Product("Coffee", 900)])` },
  { h: "Inheritance: a class based on another",
    p: ["A child class gets everything from the parent and can add or change behaviour. <code>super()</code> calls the parent's version."],
    code: `class Notifier:
    def __init__(self, to):
        self.to = to

    def send(self, message):
        return f"[{self.channel()}] to {self.to}: {message}"

    def channel(self):
        return "generic"

class EmailNotifier(Notifier):
    def channel(self):
        return "email"

class SmsNotifier(Notifier):
    def channel(self):
        return "sms"

for n in [EmailNotifier("asha@example.com"), SmsNotifier("+91 98xxxx")]:
    print(n.send("Your order shipped"))` },
  { h: "Class attributes and @property",
    p: ["A <b>class attribute</b> is shared by all objects. <code>@property</code> makes a method look like an attribute: handy for values worked out from others."],
    code: `class LineItem:
    tax_rate = 0.18

    def __init__(self, price, qty):
        self.price = price
        self.qty = qty

    @property
    def total(self):
        return round(self.price * self.qty * (1 + self.tax_rate), 2)

item = LineItem(900, 2)
print(item.total)` }
 ],
 mistakes: [
  "Forgetting <code>self</code> as the first method parameter, or forgetting <code>self.</code> when setting attributes.",
  "Using a class when a function or a dict would do. Classes are for data + behaviour together.",
  "Deep inheritance chains. Prefer small classes and passing objects in (composition).",
  "A mutable class attribute (like a list) shared by every object by accident. Set lists in __init__."
 ],
 practice: [
  { q: "Write a <code>Cart</code> class with <code>add(name, price, qty=1)</code>, <code>remove(name)</code> and <code>total()</code>.", code: `class Cart:
    def __init__(self):
        self.lines = {}

    def add(self, name, price, qty=1):
        old_qty = self.lines.get(name, (price, 0))[1]
        self.lines[name] = (price, old_qty + qty)

    def remove(self, name):
        self.lines.pop(name, None)

    def total(self):
        return sum(price * qty for price, qty in self.lines.values())

c = Cart()
c.add("Tea", 400, 2)
c.add("Coffee", 900)
c.add("Tea", 400)
print(c.total())
c.remove("Coffee")
print(c.total())` },
  { q: "Give the Account class a <code>withdraw</code> method that refuses to go below zero.", code: `class Account:
    def __init__(self, owner, balance=0):
        self.owner, self.balance = owner, balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("not enough money")
        self.balance -= amount

a = Account("Asha", 1000)
a.withdraw(300)
print(a.balance)
try:
    a.withdraw(5000)
except ValueError as e:
    print("Refused:", e)` }
 ],
 check: [
  ["What does __init__ do?", ["Deletes the object", "Sets up a new object when it's created", "Prints the object", "Imports the class"], 1, "It runs on creation and sets attributes."],
  ["What is self?", ["The class name", "The current object", "A keyword for loops", "The parent class"], 1, "self refers to the object the method is called on."],
  ["class B(A): means…", ["B contains A", "B inherits from A", "A inherits from B", "B and A are the same"], 1, "B gets A's attributes and methods."]
 ],
 remember: [
  "class Name: def __init__(self, ...): self.x = ...",
  "Methods take self first. Call with obj.method().",
  "__repr__ = how it prints. @property = computed attribute.",
  "class Child(Parent): inherit; super() calls the parent.",
  "Use classes for data + behaviour; otherwise a function or dict is fine."
 ]
},
{
 id: "types-dataclasses",
 title: "Type hints and dataclasses",
 level: "Intermediate",
 one: "<b>Type hints</b> say what goes in and out of your code (<code>def total(prices: list[float]) -&gt; float</code>). <b>Dataclasses</b> create simple data classes with almost no code.",
 why: "Modern Python teams use type hints everywhere: editors catch bugs, and code documents itself. FastAPI and Pydantic are built on them, and so is most AI tooling.",
 steps: [
  { h: "Type hints",
    p: ["Write <code>name: type</code> for parameters and <code>-&gt; type</code> for the return. Python doesn't enforce them at run time; your editor and tools like <b>mypy</b> check them."],
    code: `def order_total(prices: list[float], tax_rate: float = 0.18) -> float:
    return round(sum(prices) * (1 + tax_rate), 2)

print(order_total([900.0, 400.0]))` },
  { h: "Optional values and unions",
    p: ["<code>str | None</code> means “a string or None”. <code>dict[str, int]</code> is a dict with text keys and int values."],
    code: `def find_price(prices: dict[str, int], name: str) -> int | None:
    return prices.get(name)

prices = {"Tea": 400, "Coffee": 900}
print(find_price(prices, "Tea"), find_price(prices, "Milk"))` },
  { h: "Hints aren't checked at run time",
    p: ["This runs without error even though the hint says int. That's why tools like mypy (and Pydantic, next lesson) exist."],
    code: `def double(x: int) -> int:
    return x * 2

print(double("ab"))` },
  { h: "Dataclasses",
    p: ["<code>@dataclass</code> writes <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> for you from the field list."],
    code: `from dataclasses import dataclass, field

@dataclass
class Customer:
    id: int
    name: str
    city: str | None = None
    tags: list[str] = field(default_factory=list)

c = Customer(1, "Asha Rao", "Kochi")
c.tags.append("vip")
print(c)
print(c == Customer(1, "Asha Rao", "Kochi", ["vip"]))` },
  { h: "Frozen dataclasses and methods",
    p: ["<code>frozen=True</code> makes objects read-only: safer for values that shouldn't change. Dataclasses can have methods like any class."],
    code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount: int      # in paise, to avoid float errors
    currency: str = "INR"

    def add(self, other: "Money") -> "Money":
        if other.currency != self.currency:
            raise ValueError("currency mismatch")
        return Money(self.amount + other.amount, self.currency)

total = Money(90000).add(Money(40000))
print(total)
try:
    total.amount = 5
except Exception as e:
    print(type(e).__name__)` }
 ],
 mistakes: [
  "Thinking hints validate data. They don't; use Pydantic for that.",
  "A list default in a dataclass: <code>tags: list = []</code> errors. Use <code>field(default_factory=list)</code>.",
  "Over-complicated hints. Keep them readable; <code>dict[str, Any]</code> is fine when the shape varies.",
  "Floats for money. Store whole paise/cents as int, or use Decimal."
 ],
 practice: [
  { q: "Add type hints to <code>def apply_discount(price, percent)</code> that returns the new price.", code: `def apply_discount(price: float, percent: float) -> float:
    return round(price * (1 - percent / 100), 2)

print(apply_discount(1000, 15))` },
  { q: "Make a dataclass <code>OrderLine</code> with product, qty and unit_price, plus a <code>total</code> property.", code: `from dataclasses import dataclass

@dataclass
class OrderLine:
    product: str
    qty: int
    unit_price: float

    @property
    def total(self) -> float:
        return self.qty * self.unit_price

line = OrderLine("Headphones", 2, 3000)
print(line, line.total)` }
 ],
 check: [
  ["Does Python stop you passing a str to def f(x: int)?", ["Yes, always", "No, hints aren't enforced at run time", "Only in Python 2", "Only for ints"], 1, "Hints are for tools and readers. Use Pydantic to validate."],
  ["What does @dataclass give you?", ["A database table", "Auto-generated __init__, __repr__ and __eq__", "Faster code", "Type checking"], 1, "It writes the boilerplate from your field list."],
  ["How do you give a dataclass field an empty list default?", ["tags: list = []", "tags: list = field(default_factory=list)", "tags = list", "You can't"], 1, "Mutable defaults need default_factory."]
 ],
 remember: [
  "def f(x: int, name: str | None = None) -> float:",
  "list[str], dict[str, int], X | None. Not enforced at run time (mypy checks).",
  "@dataclass writes __init__/__repr__/__eq__. frozen=True = read-only.",
  "Mutable defaults: field(default_factory=list).",
  "Money: int paise or Decimal, not float."
 ]
},
{
 id: "pydantic-async",
 title: "Validating data with Pydantic, and async basics",
 level: "Intermediate",
 one: "<b>Pydantic</b> checks and converts data against your type hints, so bad input fails early with a clear message. <b>async</b> lets one program wait for many slow things (like API calls) at the same time.",
 why: "Every AI app and API handles untrusted data: user input, webhooks, LLM output. Pydantic is the standard way to validate it (FastAPI uses it). Async makes programs that call many APIs much faster.",
 steps: [
  { h: "A Pydantic model",
    p: ["Write a class with type hints. Pydantic converts compatible values (the text <code>\"3\"</code> becomes the number 3) and rejects wrong ones."],
    code: `from pydantic import BaseModel

class OrderIn(BaseModel):
    order_id: int
    customer_email: str
    qty: int
    coupon: str | None = None

o = OrderIn(order_id="6", customer_email="asha@example.com", qty=3)
print(o)
print(o.qty + 1)` },
  { h: "Bad data gives a clear error",
    p: ["Instead of a crash deep in your code, you get one error listing every problem, at the edge where the data came in."],
    code: `from pydantic import BaseModel, ValidationError

class OrderIn(BaseModel):
    order_id: int
    qty: int

try:
    OrderIn(order_id="abc", qty=None)
except ValidationError as e:
    for err in e.errors():
        print(err["loc"], err["msg"])` },
  { h: "Rules with Field and validators",
    p: ["<code>Field(gt=0)</code> adds rules. <code>@field_validator</code> runs your own check or clean-up."],
    code: `from pydantic import BaseModel, Field, field_validator

class Signup(BaseModel):
    name: str = Field(min_length=2)
    email: str
    age: int = Field(ge=18, le=120)

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("not an email")
        return v

print(Signup(name="Asha", email="  ASHA@Example.com ", age=29))` },
  { h: "JSON in, JSON out",
    p: ["<code>model_validate_json</code> parses and validates JSON text in one step; <code>model_dump()</code> gives a dict and <code>model_dump_json()</code> gives JSON. Perfect for API payloads and LLM structured output."],
    code: `from pydantic import BaseModel

class Item(BaseModel):
    sku: str
    qty: int

class Order(BaseModel):
    order_id: int
    items: list[Item]

raw = '{"order_id": 6, "items": [{"sku": "LAP", "qty": "1"}, {"sku": "HP", "qty": 2}]}'
order = Order.model_validate_json(raw)
print(order.items[0].qty, type(order.items[0].qty).__name__)
print(order.model_dump())` },
  { h: "async: waiting for many things at once",
    p: ["Calling 3 slow APIs one after another takes 3× as long. With <code>async def</code> and <code>await</code>, the program starts all three and waits for them together. <code>asyncio.gather</code> runs them side by side.",
        "Here <code>asyncio.sleep</code> stands in for a slow network call:"],
    code: `import asyncio, time

async def fetch(name: str, seconds: float) -> str:
    await asyncio.sleep(seconds)   # pretend this is an API call
    return f"{name} done"

async def main():
    start = time.perf_counter()
    results = await asyncio.gather(fetch("orders", 1), fetch("customers", 1), fetch("stock", 1))
    print(results)
    print(f"took {time.perf_counter() - start:.1f}s, not 3s")

asyncio.run(main())` },
  { h: "When to use async",
    p: ["Use async when the program spends most of its time <b>waiting</b> (network, APIs, databases): web servers, scrapers, apps calling LLM APIs. It doesn't make heavy calculations faster.",
        "Real HTTP calls use an async client like <code>httpx.AsyncClient</code>:"],
    code: `import httpx, asyncio

async def main():
    async with httpx.AsyncClient(timeout=10) as client:
        r1, r2 = await asyncio.gather(
            client.get("https://api.example.com/orders"),
            client.get("https://api.example.com/customers"),
        )
        print(r1.status_code, r2.status_code)

asyncio.run(main())`, run: false }
 ],
 mistakes: [
  "Trusting input (user, webhook, LLM output) without validating it. Put a Pydantic model at every entry point.",
  "Calling an async function without <code>await</code>: you get a coroutine object, not the result.",
  "Using <code>time.sleep</code> or a normal blocking HTTP library inside async code. It freezes everything. Use <code>asyncio.sleep</code> and <code>httpx.AsyncClient</code>.",
  "Using async for CPU-heavy work. It only helps when waiting."
 ],
 practice: [
  { q: "Make a Pydantic model <code>Product</code> with name (at least 2 characters), price (more than 0) and category (default \"General\"). Show that a price of -5 is rejected.", code: `from pydantic import BaseModel, Field, ValidationError

class Product(BaseModel):
    name: str = Field(min_length=2)
    price: float = Field(gt=0)
    category: str = "General"

print(Product(name="Tea", price=400))
try:
    Product(name="Tea", price=-5)
except ValidationError as e:
    print(e.errors()[0]["msg"])` },
  { q: "Run three pretend API calls of 0.5s each with asyncio.gather and print the total time.", code: `import asyncio, time

async def call(i):
    await asyncio.sleep(0.5)
    return i

async def main():
    t = time.perf_counter()
    print(await asyncio.gather(call(1), call(2), call(3)))
    print(f"{time.perf_counter() - t:.1f}s")

asyncio.run(main())` }
 ],
 check: [
  ["Pydantic gets qty=\"3\" for an int field. What happens?", ["Error", "It converts it to 3", "It stays \"3\"", "It becomes None"], 1, "Pydantic converts compatible values and rejects others."],
  ["Three 1-second API calls with asyncio.gather take about…", ["3 seconds", "1 second", "0 seconds", "6 seconds"], 1, "They wait at the same time."],
  ["Async helps most when your program is…", ["Doing heavy maths", "Waiting on network or databases", "Reading small files", "Sorting lists"], 1, "Async is for waiting, not computing."]
 ],
 remember: [
  "class M(BaseModel): field: type = default → validates and converts.",
  "Field(gt=0, min_length=2) for rules; @field_validator for custom checks.",
  "Model.model_validate_json(text), m.model_dump(), m.model_dump_json().",
  "async def + await; asyncio.gather runs waits side by side; asyncio.run(main()).",
  "Async = for waiting (APIs, DB). Never time.sleep inside async."
 ]
},
{
 id: "pytest",
 title: "Testing with pytest",
 level: "Intermediate",
 one: "A <b>test</b> is code that checks your code. With <b>pytest</b> you write small functions starting with <code>test_</code> that use <code>assert</code>, and run them all with one command.",
 why: "Tests let you change code without fear and prove it works. Every serious job expects them, and interviewers often ask you to write tests for your solution.",
 steps: [
  { h: "Your first test",
    p: ["Put tests in files named <code>test_*.py</code>. Each test is a function starting with <code>test_</code>. <code>assert</code> checks something is true. Run <code>pytest</code> in the project folder."],
    code: `def add_tax(amount, rate=0.18):
    return round(amount * (1 + rate), 2)

def test_add_tax_default():
    assert add_tax(100) == 118.0

def test_add_tax_custom_rate():
    assert add_tax(200, rate=0.05) == 210.0`, test: true },
  { h: "What a failure looks like",
    p: ["pytest shows exactly what was expected and what came back. This bug only charges 8% tax:"],
    code: `def add_tax(amount, rate=0.08):
    return round(amount * (1 + rate), 2)

def test_add_tax_default():
    assert add_tax(100) == 118.0`, test: true, expectError: true },
  { h: "Testing errors",
    p: ["<code>pytest.raises</code> checks that the right error is raised."],
    code: `import pytest

def set_rating(stars):
    if not 1 <= stars <= 5:
        raise ValueError("rating must be 1-5")
    return stars

def test_valid_rating():
    assert set_rating(5) == 5

def test_rating_too_high():
    with pytest.raises(ValueError):
        set_rating(9)`, test: true },
  { h: "Many cases with parametrize",
    p: ["Run the same test with many inputs. Each case shows up as its own test."],
    code: `import pytest

def is_valid_email(text):
    return text.count("@") == 1 and "." in text.split("@")[1]

@pytest.mark.parametrize("email, ok", [
    ("a@x.com", True),
    ("no-at-sign.com", False),
    ("a@@x.com", False),
    ("a@xcom", False),
])
def test_is_valid_email(email, ok):
    assert is_valid_email(email) == ok`, test: true },
  { h: "Fixtures: shared setup",
    p: ["A <b>fixture</b> prepares something tests need (sample data, a temp folder, a test database). Ask for it by naming it as a parameter. <code>tmp_path</code> is a built-in fixture that gives a fresh folder."],
    code: `import json, pytest

def load_orders(path):
    return json.loads(path.read_text())

@pytest.fixture
def orders_file(tmp_path):
    p = tmp_path / "orders.json"
    p.write_text(json.dumps([{"id": 1, "total": 500}, {"id": 2, "total": 700}]))
    return p

def test_load_orders(orders_file):
    orders = load_orders(orders_file)
    assert len(orders) == 2
    assert sum(o["total"] for o in orders) == 1200`, test: true },
  { h: "Faking slow or external things",
    p: ["Tests shouldn't call real APIs. Pass the dependency in, and give a fake in tests (or use <code>unittest.mock</code> / pytest's <code>monkeypatch</code>)."],
    code: `def latest_rate(fetch):
    data = fetch("https://api.example.com/rate")
    return data["rate"]

def test_latest_rate_uses_api_value():
    def fake_fetch(url):
        return {"rate": 83.2}
    assert latest_rate(fake_fetch) == 83.2`, test: true }
 ],
 mistakes: [
  "Tests that call real APIs or real databases: slow and flaky. Fake them.",
  "Only testing the happy path. Test bad input, empty lists and edge cases too.",
  "One giant test that checks ten things. Small tests tell you exactly what broke.",
  "Comparing floats with ==. Use <code>pytest.approx(0.3)</code> for float results."
 ],
 practice: [
  { q: "Write tests for <code>order_total(items)</code>: a normal order, an empty order, and a negative qty that should raise ValueError.", code: `import pytest

def order_total(items):
    if any(qty < 0 for qty, _ in items):
        raise ValueError("qty can't be negative")
    return sum(qty * price for qty, price in items)

def test_normal_order():
    assert order_total([(2, 3000), (1, 900)]) == 6900

def test_empty_order():
    assert order_total([]) == 0

def test_negative_qty():
    with pytest.raises(ValueError):
        order_total([(-1, 100)])`, test: true },
  { q: "Test that 0.1 + 0.2 equals 0.3 the right way.", code: `import pytest

def test_float_sum():
    assert 0.1 + 0.2 == pytest.approx(0.3)`, test: true }
 ],
 check: [
  ["How does pytest find tests?", ["Any function", "Functions starting with test_ in test_*.py files", "Functions with @test", "Classes only"], 1, "Name files test_*.py and functions test_*."],
  ["How do you check a function raises ValueError?", ["try/except in the test", "with pytest.raises(ValueError):", "assert ValueError", "@pytest.error"], 1, "pytest.raises is the clean way."],
  ["Your test calls a real payment API. Problem?", ["None", "Slow, flaky and may charge money: fake it", "pytest can't do HTTP", "It's required"], 1, "Tests should be fast and isolated."]
 ],
 remember: [
  "Files test_*.py, functions test_*, plain assert. Run: pytest.",
  "pytest.raises(Error) for errors; pytest.approx for floats.",
  "@pytest.mark.parametrize for many cases.",
  "Fixtures share setup; tmp_path gives a temp folder.",
  "Fake external calls (pass dependencies in, or monkeypatch)."
 ]
},
{
 id: "practice",
 title: "Practice project: clean and report on an orders export",
 level: "Project",
 one: "Put everything together: read a messy CSV, validate rows with Pydantic, skip and report bad rows, compute a summary, write JSON, and test it.",
 why: "This is a real day-one task in integration and data jobs. Doing it end to end, with tests, proves you can use Python for actual work, not just exercises.",
 steps: [
  { h: "The messy input",
    p: ["A client sends <code>orders.csv</code>. Some rows are broken: a missing email, a quantity that isn't a number, a negative price."],
    files: { "orders.csv": "order_id,email,product,qty,price\n1,asha@example.com,Laptop,1,55000\n2, BEN@example.com ,Headphones,2,3000\n3,,Coffee,1,900\n4,chen@example.com,Tea,three,400\n5,divya@example.com,Chair,1,-8000\n6,omar@example.com,Tea,5,400\n" },
    code: `print(open("orders.csv", encoding="utf-8").read())` },
  { h: "Step 1: a model for one valid row",
    p: ["Describe what a good row looks like. Pydantic does the checking and cleaning."],
    code: `from pydantic import BaseModel, Field, field_validator

class OrderRow(BaseModel):
    order_id: int
    email: str
    product: str
    qty: int = Field(gt=0)
    price: float = Field(gt=0)

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("missing or invalid email")
        return v

print(OrderRow(order_id="2", email=" BEN@example.com ", product="Headphones", qty="2", price="3000"))` },
  { h: "Step 2: load, keep good rows, collect errors",
    p: ["Never stop the whole import because of one bad row. Keep going and report every problem with its row number."],
    files: { "orders.csv": "order_id,email,product,qty,price\n1,asha@example.com,Laptop,1,55000\n2, BEN@example.com ,Headphones,2,3000\n3,,Coffee,1,900\n4,chen@example.com,Tea,three,400\n5,divya@example.com,Chair,1,-8000\n6,omar@example.com,Tea,5,400\n" },
    pre: `from pydantic import BaseModel, Field, field_validator
class OrderRow(BaseModel):
    order_id: int
    email: str
    product: str
    qty: int = Field(gt=0)
    price: float = Field(gt=0)
    @field_validator("email")
    @classmethod
    def clean_email(cls, v):
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("missing or invalid email")
        return v`,
    code: `import csv
from pydantic import ValidationError

def load(path):
    good, errors = [], []
    with open(path, newline="", encoding="utf-8") as f:
        for line_no, raw in enumerate(csv.DictReader(f), start=2):
            try:
                good.append(OrderRow(**raw))
            except ValidationError as e:
                problems = "; ".join(f"{err['loc'][0]}: {err['msg']}" for err in e.errors())
                errors.append({"line": line_no, "problems": problems})
    return good, errors

good, errors = load("orders.csv")
print(len(good), "good rows")
for e in errors:
    print(e)` },
  { h: "Step 3: summary and JSON output",
    p: ["Compute what the client asked for and write it as JSON."],
    files: { "orders.csv": "order_id,email,product,qty,price\n1,asha@example.com,Laptop,1,55000\n2, BEN@example.com ,Headphones,2,3000\n3,,Coffee,1,900\n4,chen@example.com,Tea,three,400\n5,divya@example.com,Chair,1,-8000\n6,omar@example.com,Tea,5,400\n" },
    pre: `import csv
from pydantic import BaseModel, Field, field_validator, ValidationError
class OrderRow(BaseModel):
    order_id: int
    email: str
    product: str
    qty: int = Field(gt=0)
    price: float = Field(gt=0)
    @field_validator("email")
    @classmethod
    def clean_email(cls, v):
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("missing or invalid email")
        return v
def load(path):
    good, errors = [], []
    with open(path, newline="", encoding="utf-8") as f:
        for line_no, raw in enumerate(csv.DictReader(f), start=2):
            try:
                good.append(OrderRow(**raw))
            except ValidationError as e:
                errors.append({"line": line_no, "problems": "; ".join(f"{x['loc'][0]}: {x['msg']}" for x in e.errors())})
    return good, errors`,
    code: `import json
from collections import defaultdict

def summarise(rows):
    revenue_by_product = defaultdict(float)
    for r in rows:
        revenue_by_product[r.product] += r.qty * r.price
    return {
        "orders": len(rows),
        "revenue": sum(revenue_by_product.values()),
        "by_product": dict(sorted(revenue_by_product.items(), key=lambda kv: -kv[1])),
    }

good, errors = load("orders.csv")
report = {"summary": summarise(good), "rejected": errors}
with open("report.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)
print(json.dumps(report, indent=2))` },
  { h: "Step 4: tests",
    p: ["Test the pieces: a good row is cleaned, a bad row is rejected, and the summary adds up."],
    code: `import pytest
from pydantic import BaseModel, Field, ValidationError, field_validator

class OrderRow(BaseModel):
    order_id: int
    email: str
    product: str
    qty: int = Field(gt=0)
    price: float = Field(gt=0)

    @field_validator("email")
    @classmethod
    def clean_email(cls, v):
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("missing or invalid email")
        return v

def summarise(rows):
    return sum(r.qty * r.price for r in rows)

def test_email_is_cleaned():
    row = OrderRow(order_id=1, email=" A@X.COM ", product="Tea", qty=1, price=400)
    assert row.email == "a@x.com"

@pytest.mark.parametrize("field, value", [("qty", "three"), ("qty", 0), ("price", -1), ("email", "")])
def test_bad_rows_are_rejected(field, value):
    data = {"order_id": 1, "email": "a@x.com", "product": "Tea", "qty": 1, "price": 400}
    data[field] = value
    with pytest.raises(ValidationError):
        OrderRow(**data)

def test_summary_total():
    rows = [OrderRow(order_id=1, email="a@x.com", product="Tea", qty=2, price=400),
            OrderRow(order_id=2, email="b@x.com", product="Laptop", qty=1, price=55000)]
    assert summarise(rows) == 55800`, test: true }
 ],
 mistakes: [
  "Stopping the whole import at the first bad row. Collect errors and keep going.",
  "Reporting errors without the row number. The client can't fix what they can't find.",
  "Putting everything in one long script. Split into load / validate / summarise / write so each piece can be tested."
 ],
 practice: [
  { q: "Extend the report: add the number of distinct customers (by email).", a: "Add <code>\"customers\": len({r.email for r in rows})</code> to the dict returned by <code>summarise</code>." },
  { q: "The client also wants a CSV of rejected rows. How would you write it?", a: "Open <code>rejected.csv</code> with <code>csv.DictWriter(f, fieldnames=[\"line\", \"problems\"])</code>, call <code>writeheader()</code>, then <code>writerows(errors)</code>." },
  { q: "Turn it into a command: <code>python3 report.py orders.csv</code>. What do you add?", a: "A <code>main()</code> that reads the path from <code>sys.argv[1]</code> (or uses <code>argparse</code>), calls load → summarise → write, and <code>if __name__ == \"__main__\": main()</code> at the bottom." }
 ],
 check: [
  ["Best way to handle one bad row in an import?", ["Stop everything", "Skip it silently", "Skip it, record the row number and reason, keep going", "Delete the file"], 2, "Collect errors and report them."],
  ["Why split the script into small functions?", ["It runs faster", "Each piece can be tested and reused", "Python requires it", "No reason"], 1, "Small functions are testable."],
  ["Where should validation happen?", ["At the end", "Where data enters your program", "Only in tests", "Nowhere"], 1, "Validate at the edges, then trust the data inside."]
 ],
 remember: [
  "Pipeline: load → validate (Pydantic) → transform → write → test.",
  "Bad rows: skip, record line number + reason, continue.",
  "Validate at the edge; inside, work with clean objects.",
  "Small functions = easy tests. Use parametrize for many bad inputs."
 ]
}
];
