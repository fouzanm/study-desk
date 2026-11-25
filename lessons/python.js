// Lessons for course "python". Built by tools/course-builder from tools/courses/python.js.
// Python examples were run and their real output stored.
(function (L) {
L["python:start-here"] = {
 "title": "Start here: install Python and run your first program",
 "level": "Beginner",
 "one": "Python is a programming language that reads almost like English. You write instructions in a <code>.py</code> file and Python runs them top to bottom.",
 "why": "Python is the most asked-for language in AI, data and backend jobs. It's also the easiest first language: short, readable and forgiving.",
 "steps": [
  {
   "h": "Install Python",
   "p": [
    "<b>Ubuntu:</b> Python 3 is usually already there. Check with <code>python3 --version</code>. If not: <code>sudo apt install python3 python3-pip python3-venv</code>.",
    "<b>Mac:</b> install from python.org or with Homebrew: <code>brew install python</code>. <b>Windows:</b> install from python.org and tick “Add Python to PATH”.",
    "Then install an editor. <b>VS Code</b> with the Python extension is the most common choice."
   ],
   "code": "python3 --version",
   "lang": "bash",
   "out": {
    "text": "Python 3.13.1",
    "label": "Example output"
   }
  },
  {
   "h": "Your first program",
   "p": [
    "Create a file <code>hello.py</code>, type this, save, and run <code>python3 hello.py</code> in the terminal.",
    "<code>print()</code> shows something on the screen. Text goes inside quotes. A line starting with <code>#</code> is a <b>comment</b>: Python ignores it; it's a note for humans."
   ],
   "code": "# my first program\nprint(\"Hello, world!\")\nprint(\"I am learning Python\")\nprint(2 + 3)",
   "out": {
    "text": "Hello, world!\nI am learning Python\n5"
   }
  },
  {
   "h": "Python runs top to bottom",
   "p": [
    "Each line runs in order. If a line has a mistake, Python stops there and shows an <b>error</b>. Errors are normal: read the last line, it tells you what went wrong."
   ],
   "code": "print(\"line 1 runs\")\nprint(\"line 2 runs\")\npritn(\"line 3 has a typo\")\nprint(\"line 4 never runs\")",
   "expectError": true,
   "note": "<code>NameError</code> means Python doesn't know that name. Here we typed <code>pritn</code> instead of <code>print</code>.",
   "out": {
    "error": "line 1 runs\nline 2 runs\nNameError: name 'pritn' is not defined. Did you mean: 'print'?"
   }
  },
  {
   "h": "The interactive shell (REPL)",
   "p": [
    "Type <code>python3</code> alone and press Enter. You get a <code>&gt;&gt;&gt;</code> prompt where each line runs as soon as you press Enter. Great for quick experiments. Type <code>exit()</code> to leave."
   ],
   "code": ">>> 10 * 3\n30\n>>> \"ha\" * 3\n'hahaha'\n>>> exit()",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Typing <code>python</code> instead of <code>python3</code> on Ubuntu/Mac (it may be missing or be old Python 2).",
  "Forgetting quotes around text: <code>print(hello)</code> looks for a variable named hello.",
  "Panicking at errors. Read the <b>last line</b> of the error first, then the line number above it."
 ],
 "practice": [
  {
   "q": "Write a program that prints your name, your city, and the result of 7 × 6.",
   "code": "print(\"Fouzan\")\nprint(\"Calicut\")\nprint(7 * 6)",
   "out": {
    "text": "Fouzan\nCalicut\n42"
   }
  },
  {
   "q": "What does this error mean? <code>SyntaxError: unterminated string literal</code>",
   "a": "You opened a quote and never closed it, for example <code>print(\"hello)</code>."
  }
 ],
 "check": [
  [
   "What does print() do?",
   [
    "Prints on paper",
    "Shows a value on the screen",
    "Saves a file",
    "Ends the program"
   ],
   1,
   "print() writes output to the terminal."
  ],
  [
   "A line starting with # is…",
   [
    "An error",
    "A comment that Python ignores",
    "A title",
    "A variable"
   ],
   1,
   "Comments are notes for people."
  ],
  [
   "Python hits an error on line 3 of 5. What happens?",
   [
    "It skips line 3",
    "It stops at line 3 and shows the error",
    "It runs lines 4 and 5 first",
    "Nothing"
   ],
   1,
   "Python stops at the first error."
  ]
 ],
 "remember": [
  "Run a file: python3 file.py. Quick tests: python3 (REPL).",
  "print(...) shows output. # starts a comment.",
  "Code runs top to bottom and stops at the first error.",
  "Read the last line of an error first."
 ]
};
L["python:basics"] = {
 "title": "Variables, numbers and text",
 "level": "Beginner",
 "one": "A <b>variable</b> is a name for a value: <code>price = 900</code>. Values have <b>types</b>: whole numbers (<code>int</code>), decimals (<code>float</code>), text (<code>str</code>) and True/False (<code>bool</code>).",
 "why": "Every program stores and changes values. Knowing types saves you from the most common beginner bugs, like adding text to a number.",
 "steps": [
  {
   "h": "Variables",
   "p": [
    "<code>=</code> puts a value into a name. Use lower_case_with_underscores for names. You can change a variable later."
   ],
   "code": "name = \"Asha\"\nage = 29\nprice = 899.50\nis_member = True\nprint(name, age, price, is_member)\n\nage = age + 1\nprint(\"Next year:\", age)",
   "out": {
    "text": "Asha 29 899.5 True\nNext year: 30"
   }
  },
  {
   "h": "Types and type()",
   "p": [
    "<code>type(x)</code> tells you what kind of value x is."
   ],
   "code": "print(type(29))\nprint(type(899.5))\nprint(type(\"Asha\"))\nprint(type(True))",
   "out": {
    "text": "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>"
   }
  },
  {
   "h": "Numbers and maths",
   "p": [
    "<code>+ - * /</code> work as expected. <code>/</code> always gives a float. <code>//</code> is whole-number division, <code>%</code> is the remainder, <code>**</code> is power. <code>round(x, 2)</code> rounds."
   ],
   "code": "print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 10)\nprint(round(10 / 3, 2))\nprint(0.1 + 0.2)",
   "note": "<code>0.1 + 0.2</code> isn't exactly 0.3: floats are stored in binary. For money use <code>Decimal</code> (later) or work in whole paise/cents.",
   "out": {
    "text": "3.5\n3\n1\n1024\n3.33\n0.30000000000000004"
   }
  },
  {
   "h": "Text (strings)",
   "p": [
    "Text goes in quotes. <code>len()</code> counts characters. Strings have methods: <code>.upper()</code>, <code>.lower()</code>, <code>.strip()</code> (remove spaces at the ends), <code>.replace()</code>, <code>.split()</code>.",
    "Indexing: <code>s[0]</code> is the first character, <code>s[-1]</code> the last. Slicing: <code>s[0:4]</code> is characters 0 to 3."
   ],
   "code": "city = \"  Kochi, Kerala \"\nclean = city.strip()\nprint(clean)\nprint(clean.upper())\nprint(len(clean))\nprint(clean[0], clean[-1])\nprint(clean[0:5])\nprint(clean.split(\", \"))",
   "out": {
    "text": "Kochi, Kerala\nKOCHI, KERALA\n13\nK a\nKochi\n['Kochi', 'Kerala']"
   }
  },
  {
   "h": "f-strings: put values inside text",
   "p": [
    "Put <code>f</code> before the quote and write variables in <code>{ }</code>. <code>{x:.2f}</code> shows 2 decimals; <code>{x:,}</code> adds thousands commas."
   ],
   "code": "name = \"Asha\"\ntotal = 64500\nprint(f\"{name} spent ₹{total:,} this year\")\nprint(f\"Average per order: {total / 3:.2f}\")",
   "out": {
    "text": "Asha spent ₹64,500 this year\nAverage per order: 21500.00"
   }
  },
  {
   "h": "Converting between types",
   "p": [
    "<code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code> convert. <code>input()</code> always gives text, so convert it before doing maths. Text and numbers can't be added directly:"
   ],
   "code": "qty = \"3\"\nprice = 400\nprint(int(qty) * price)\nprint(\"Total: \" + str(int(qty) * price))\nprint(qty + price)",
   "expectError": true,
   "out": {
    "error": "1200\nTotal: 1200\nTypeError: can only concatenate str (not \"int\") to str"
   }
  }
 ],
 "mistakes": [
  "Adding text and numbers: <code>\"3\" + 4</code> → TypeError. Convert first: <code>int(\"3\") + 4</code>.",
  "Using <code>=</code> (assign) when you mean <code>==</code> (compare).",
  "Expecting <code>/</code> to give a whole number. Use <code>//</code> for that.",
  "Forgetting strings can't be changed in place: <code>s.upper()</code> returns a new string; it doesn't change s."
 ],
 "practice": [
  {
   "q": "A product costs 900 and you buy 4. Print the total, and the total with 18% tax, rounded to 2 decimals, using f-strings.",
   "code": "price = 900\nqty = 4\ntotal = price * qty\nprint(f\"Total: {total}\")\nprint(f\"With tax: {total * 1.18:.2f}\")",
   "out": {
    "text": "Total: 3600\nWith tax: 4248.00"
   }
  },
  {
   "q": "From the text <code>\"  asha.rao@example.com \"</code>, print the clean email in lower case and the part before the @.",
   "code": "email = \"  asha.rao@example.com \"\nclean = email.strip().lower()\nprint(clean)\nprint(clean.split(\"@\")[0])",
   "out": {
    "text": "asha.rao@example.com\nasha.rao"
   }
  },
  {
   "q": "What's the difference between <code>7 / 2</code>, <code>7 // 2</code> and <code>7 % 2</code>?",
   "a": "3.5 (normal division, always a float), 3 (whole-number division) and 1 (the remainder)."
  }
 ],
 "check": [
  [
   "type(\"42\") is…",
   [
    "int",
    "str",
    "float",
    "bool"
   ],
   1,
   "Anything in quotes is a string."
  ],
  [
   "What does f\"{x:.2f}\" do when x = 3.14159?",
   [
    "Shows 3",
    "Shows 3.14",
    "Shows 3.14159",
    "Error"
   ],
   1,
   ".2f means 2 decimal places."
  ],
  [
   "\"5\" + 5 gives…",
   [
    "10",
    "\"55\"",
    "A TypeError",
    "5"
   ],
   2,
   "You can't add text and a number. Convert first."
  ]
 ],
 "remember": [
  "name = value. Types: int, float, str, bool. Check with type(x).",
  "/ gives float, // whole division, % remainder, ** power.",
  "Strings: len, .strip(), .lower(), .upper(), .replace(), .split(), s[0], s[-1], s[a:b].",
  "f\"{name} {x:.2f} {n:,}\" puts values in text.",
  "Convert with int(), float(), str(). input() always returns text."
 ]
};
L["python:collections"] = {
 "title": "Lists, dictionaries, sets and tuples",
 "level": "Beginner",
 "one": "A <b>list</b> is an ordered collection <code>[1, 2, 3]</code>, a <b>dict</b> maps keys to values <code>{\"name\": \"Asha\"}</code>, a <b>set</b> holds unique items, and a <b>tuple</b> is a list that can't change.",
 "why": "Real data is many things: many orders, a customer with many fields. JSON from APIs becomes lists and dicts in Python, so you'll use them every day.",
 "steps": [
  {
   "h": "Lists: ordered, changeable",
   "p": [
    "Create with <code>[ ]</code>. Index from 0. <code>.append()</code> adds to the end, <code>.remove()</code> removes a value, <code>len()</code> counts, <code>in</code> checks membership."
   ],
   "code": "cart = [\"laptop\", \"tea\"]\ncart.append(\"coffee\")\nprint(cart)\nprint(cart[0], len(cart))\nprint(\"tea\" in cart)\ncart.remove(\"tea\")\nprint(cart)",
   "out": {
    "text": "['laptop', 'tea', 'coffee']\nlaptop 3\nTrue\n['laptop', 'coffee']"
   }
  },
  {
   "h": "Sorting and slicing lists",
   "p": [
    "<code>sorted(x)</code> returns a new sorted list. <code>.sort()</code> sorts in place. <code>sum</code>, <code>min</code>, <code>max</code> work on numbers."
   ],
   "code": "prices = [55000, 3000, 900, 400, 8000]\nprint(sorted(prices))\nprint(sorted(prices, reverse=True)[:3])\nprint(sum(prices), min(prices), max(prices))",
   "out": {
    "text": "[400, 900, 3000, 8000, 55000]\n[55000, 8000, 3000]\n67300 400 55000"
   }
  },
  {
   "h": "Dictionaries: key → value",
   "p": [
    "Create with <code>{key: value}</code>. Read with <code>d[\"key\"]</code>. <code>d.get(\"key\", default)</code> doesn't crash if the key is missing. Add or change with <code>d[\"key\"] = value</code>."
   ],
   "code": "customer = {\"id\": 1, \"name\": \"Asha Rao\", \"city\": \"Kochi\"}\nprint(customer[\"name\"])\ncustomer[\"email\"] = \"asha@example.com\"\nprint(customer.get(\"phone\", \"no phone\"))\nfor key, value in customer.items():\n    print(key, \"=\", value)",
   "out": {
    "text": "Asha Rao\nno phone\nid = 1\nname = Asha Rao\ncity = Kochi\nemail = asha@example.com"
   }
  },
  {
   "h": "Lists of dicts: what API data looks like",
   "p": [
    "Most JSON from APIs is a list of dicts. Loop through it and pick fields."
   ],
   "code": "orders = [\n    {\"id\": 1, \"customer\": \"Asha\", \"total\": 55000, \"status\": \"completed\"},\n    {\"id\": 2, \"customer\": \"Ben\",  \"total\": 9200,  \"status\": \"completed\"},\n    {\"id\": 3, \"customer\": \"Chen\", \"total\": 3000,  \"status\": \"cancelled\"},\n]\ncompleted = [o for o in orders if o[\"status\"] == \"completed\"]\nprint(len(completed), \"completed\")\nprint(\"Revenue:\", sum(o[\"total\"] for o in completed))",
   "out": {
    "text": "2 completed\nRevenue: 64200"
   }
  },
  {
   "h": "Sets and tuples",
   "p": [
    "A <b>set</b> <code>{ }</code> keeps each value once, and makes “is x in here?” very fast. Great for removing duplicates.",
    "A <b>tuple</b> <code>( )</code> is like a list that can't change. Used for fixed pairs like coordinates, and to return two values from a function."
   ],
   "code": "cities = [\"Kochi\", \"Dubai\", \"Kochi\", \"Bengaluru\", \"Dubai\"]\nunique = set(cities)\nprint(sorted(unique), len(unique))\n\npoint = (10.5, 76.2)\nlat, lon = point\nprint(lat, lon)",
   "out": {
    "text": "['Bengaluru', 'Dubai', 'Kochi'] 3\n10.5 76.2"
   }
  },
  {
   "h": "Counting things",
   "p": [
    "Counting how often each value appears is very common. <code>collections.Counter</code> does it in one line."
   ],
   "code": "from collections import Counter\nstatuses = [\"completed\", \"pending\", \"completed\", \"cancelled\", \"completed\"]\ncounts = Counter(statuses)\nprint(counts)\nprint(counts.most_common(1))",
   "out": {
    "text": "Counter({'completed': 3, 'pending': 1, 'cancelled': 1})\n[('completed', 3)]"
   }
  }
 ],
 "mistakes": [
  "<code>d[\"missing\"]</code> → KeyError. Use <code>d.get(\"missing\")</code> when a key might not exist.",
  "Indexing past the end: a list of 3 items has indexes 0, 1, 2. <code>x[3]</code> → IndexError.",
  "Copying by assignment: <code>b = a</code> doesn't copy a list; both names point to the same list. Use <code>b = a.copy()</code>.",
  "Expecting a set to keep order. Sets are unordered; sort when you print."
 ],
 "practice": [
  {
   "q": "Given a list of order totals <code>[55000, 6900, 9200, 3000, 3600]</code>, print how many are over 5,000 and their sum.",
   "code": "totals = [55000, 6900, 9200, 3000, 3600]\nbig = [t for t in totals if t > 5000]\nprint(len(big), sum(big))",
   "out": {
    "text": "3 71100"
   }
  },
  {
   "q": "Build a dict of product → price for Laptop 55000, Tea 400, Coffee 900. Increase Tea by 10% and print the dict.",
   "code": "prices = {\"Laptop\": 55000, \"Tea\": 400, \"Coffee\": 900}\nprices[\"Tea\"] = round(prices[\"Tea\"] * 1.10)\nprint(prices)",
   "out": {
    "text": "{'Laptop': 55000, 'Tea': 440, 'Coffee': 900}"
   }
  },
  {
   "q": "From a list of emails with duplicates, print the unique emails sorted.",
   "code": "emails = [\"a@x.com\", \"b@x.com\", \"a@x.com\", \"c@x.com\", \"b@x.com\"]\nprint(sorted(set(emails)))",
   "out": {
    "text": "['a@x.com', 'b@x.com', 'c@x.com']"
   }
  }
 ],
 "check": [
  [
   "x = [10, 20, 30]. What is x[-1]?",
   [
    "10",
    "20",
    "30",
    "Error"
   ],
   2,
   "-1 means the last item."
  ],
  [
   "Safest way to read a key that may be missing?",
   [
    "d[\"key\"]",
    "d.get(\"key\")",
    "d.key",
    "d(\"key\")"
   ],
   1,
   ".get returns None (or your default) instead of crashing."
  ],
  [
   "Best way to remove duplicates from a list?",
   [
    "sorted(x)",
    "set(x)",
    "x.remove()",
    "len(x)"
   ],
   1,
   "A set keeps each value once."
  ]
 ],
 "remember": [
  "list [ ]: ordered, changeable. append, remove, len, in, sorted.",
  "dict {k: v}: d[k], d.get(k, default), d[k] = v, d.items().",
  "API JSON = list of dicts. Loop and pick fields.",
  "set: unique values, fast membership. tuple ( ): fixed, unpack with a, b = t.",
  "Counter(list) counts how often each value appears."
 ]
};
L["python:control-flow"] = {
 "title": "Decisions and loops: if, for, while",
 "level": "Beginner",
 "one": "<code>if</code> chooses what to do, <code>for</code> repeats for each item, <code>while</code> repeats until a condition is false. Python uses <b>indentation</b> (4 spaces) to group lines.",
 "why": "Programs make decisions (“is stock low?”) and process many items (“for each order…”). This is the core of all logic.",
 "steps": [
  {
   "h": "if, elif, else",
   "p": [
    "The indented lines run only when the condition is true. <code>elif</code> = else if. Comparisons: <code>== != &gt; &lt; &gt;= &lt;=</code>. Combine with <code>and</code>, <code>or</code>, <code>not</code>."
   ],
   "code": "total = 9200\nif total >= 10000:\n    print(\"big order\")\nelif total >= 3000:\n    print(\"medium order\")\nelse:\n    print(\"small order\")\n\ncity, is_member = \"Kochi\", True\nif city == \"Kochi\" and is_member:\n    print(\"free delivery\")",
   "out": {
    "text": "medium order\nfree delivery"
   }
  },
  {
   "h": "for loops",
   "p": [
    "<code>for item in collection:</code> runs the block once per item. <code>range(n)</code> gives 0 to n-1. <code>enumerate</code> gives the position too."
   ],
   "code": "products = [\"Laptop\", \"Tea\", \"Coffee\"]\nfor p in products:\n    print(\"Product:\", p)\n\nfor i, p in enumerate(products, start=1):\n    print(i, p)\n\nfor n in range(3):\n    print(\"round\", n)",
   "out": {
    "text": "Product: Laptop\nProduct: Tea\nProduct: Coffee\n1 Laptop\n2 Tea\n3 Coffee\nround 0\nround 1\nround 2"
   }
  },
  {
   "h": "Building results in a loop",
   "p": [
    "A very common pattern: start with an empty total or list, then add to it inside the loop."
   ],
   "code": "orders = [(\"Asha\", 55000), (\"Ben\", 9200), (\"Asha\", 6900), (\"Chen\", 3000)]\nper_customer = {}\nfor name, total in orders:\n    per_customer[name] = per_customer.get(name, 0) + total\nprint(per_customer)",
   "out": {
    "text": "{'Asha': 61900, 'Ben': 9200, 'Chen': 3000}"
   }
  },
  {
   "h": "while, break and continue",
   "p": [
    "<code>while condition:</code> repeats as long as it's true. <code>break</code> leaves the loop. <code>continue</code> skips to the next round. Make sure a while loop can end!"
   ],
   "code": "stock = 3\nwhile stock > 0:\n    print(\"sold one, left:\", stock - 1)\n    stock -= 1\n\nfor n in [5, -1, 8, 0, 3]:\n    if n < 0:\n        continue\n    if n == 0:\n        break\n    print(\"processing\", n)",
   "out": {
    "text": "sold one, left: 2\nsold one, left: 1\nsold one, left: 0\nprocessing 5\nprocessing 8"
   }
  },
  {
   "h": "Comprehensions: a loop in one line",
   "p": [
    "<code>[expression for item in list if condition]</code> builds a new list. Same idea for dicts: <code>{k: v for …}</code>. Use them for simple transforms; use a normal loop when it gets complicated."
   ],
   "code": "prices = {\"Laptop\": 55000, \"Tea\": 400, \"Coffee\": 900}\ncheap = [name for name, p in prices.items() if p < 1000]\nwith_tax = {name: round(p * 1.18) for name, p in prices.items()}\nprint(cheap)\nprint(with_tax)",
   "out": {
    "text": "['Tea', 'Coffee']\n{'Laptop': 64900, 'Tea': 472, 'Coffee': 1062}"
   }
  }
 ],
 "mistakes": [
  "Wrong indentation → <code>IndentationError</code> or logic that runs at the wrong time. Use 4 spaces, never mix tabs and spaces.",
  "Forgetting the colon <code>:</code> after if/for/while/def.",
  "A while loop whose condition never becomes false: it runs forever. Press Ctrl+C to stop it.",
  "Changing a list while looping over it. Loop over a copy, or build a new list."
 ],
 "practice": [
  {
   "q": "Print numbers 1 to 15, but print \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5 and \"FizzBuzz\" for both. (A classic interview warm-up.)",
   "code": "for n in range(1, 16):\n    if n % 15 == 0:\n        print(\"FizzBuzz\")\n    elif n % 3 == 0:\n        print(\"Fizz\")\n    elif n % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(n)",
   "out": {
    "text": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"
   }
  },
  {
   "q": "Given order statuses, count how many of each without using Counter.",
   "code": "statuses = [\"completed\", \"pending\", \"completed\", \"cancelled\", \"completed\"]\ncounts = {}\nfor s in statuses:\n    counts[s] = counts.get(s, 0) + 1\nprint(counts)",
   "out": {
    "text": "{'completed': 3, 'pending': 1, 'cancelled': 1}"
   }
  },
  {
   "q": "Using a comprehension, get the lengths of these words: ['sql', 'python', 'api'].",
   "code": "words = [\"sql\", \"python\", \"api\"]\nprint([len(w) for w in words])",
   "out": {
    "text": "[3, 6, 3]"
   }
  }
 ],
 "check": [
  [
   "What groups lines into an if block in Python?",
   [
    "Curly braces { }",
    "Indentation",
    "The word end",
    "Semicolons"
   ],
   1,
   "Python uses indentation (4 spaces)."
  ],
  [
   "range(3) gives…",
   [
    "1, 2, 3",
    "0, 1, 2",
    "0, 1, 2, 3",
    "3"
   ],
   1,
   "range(n) goes from 0 up to n-1."
  ],
  [
   "What does continue do inside a loop?",
   [
    "Ends the loop",
    "Skips the rest of this round and goes to the next",
    "Restarts the program",
    "Nothing"
   ],
   1,
   "break ends the loop; continue skips one round."
  ]
 ],
 "remember": [
  "if / elif / else with a colon, and a 4-space indented block.",
  "for x in items: ... · range(n) = 0..n-1 · enumerate(items, start=1).",
  "Accumulate: total = 0 / d = {} before the loop, update inside.",
  "while cond: ... must be able to end. break = leave, continue = skip.",
  "[f(x) for x in items if cond] for simple transforms."
 ]
};
L["python:functions"] = {
 "title": "Functions: reusable blocks of code",
 "level": "Beginner",
 "one": "A <b>function</b> is a named block of code you can run again and again: <code>def add_tax(amount): ...</code>. It takes <b>inputs</b> (parameters) and gives back an <b>output</b> with <code>return</code>.",
 "why": "Functions stop you repeating yourself, make code easy to test, and are how every real codebase is organised.",
 "steps": [
  {
   "h": "Define and call",
   "p": [
    "<code>def name(parameters):</code> then an indented body. <code>return</code> sends a value back. Call it with <code>name(arguments)</code>."
   ],
   "code": "def add_tax(amount, rate):\n    return round(amount * (1 + rate), 2)\n\nprint(add_tax(1000, 0.18))\nprint(add_tax(250, 0.05))",
   "out": {
    "text": "1180.0\n262.5"
   }
  },
  {
   "h": "Default values and keyword arguments",
   "p": [
    "Give a parameter a default so callers can skip it. Call with names (<code>rate=0.05</code>) to make calls clearer."
   ],
   "code": "def add_tax(amount, rate=0.18):\n    return round(amount * (1 + rate), 2)\n\nprint(add_tax(1000))\nprint(add_tax(1000, rate=0.05))",
   "out": {
    "text": "1180.0\n1050.0"
   }
  },
  {
   "h": "Return more than one value",
   "p": [
    "Return a tuple and unpack it."
   ],
   "code": "def min_max_avg(numbers):\n    return min(numbers), max(numbers), sum(numbers) / len(numbers)\n\nlow, high, avg = min_max_avg([55000, 6900, 9200, 3000])\nprint(low, high, round(avg))",
   "out": {
    "text": "3000 55000 18525"
   }
  },
  {
   "h": "print vs return",
   "p": [
    "<code>print</code> only shows a value. <code>return</code> gives it back so other code can use it. A function without return gives back <code>None</code>."
   ],
   "code": "def shows(x):\n    print(x * 2)\n\ndef gives(x):\n    return x * 2\n\na = shows(5)\nb = gives(5)\nprint(\"a is\", a)\nprint(\"b is\", b)",
   "out": {
    "text": "10\na is None\nb is 10"
   }
  },
  {
   "h": "Scope: variables inside stay inside",
   "p": [
    "Variables created inside a function exist only inside it. Pass values in as parameters and get results out with return; don't rely on outside variables."
   ],
   "code": "def make_label(name):\n    label = name.upper()\n    return label\n\nprint(make_label(\"asha\"))\nprint(label)",
   "expectError": true,
   "out": {
    "error": "ASHA\nNameError: name 'label' is not defined"
   }
  },
  {
   "h": "Docstrings and small functions",
   "p": [
    "Write a short <b>docstring</b> (text in triple quotes) saying what the function does. Keep functions small: one job each. If you can't name it simply, it's doing too much."
   ],
   "code": "def order_status_label(status):\n    \"\"\"Return a friendly label for an order status.\"\"\"\n    labels = {\"completed\": \"Delivered\", \"pending\": \"On the way\", \"cancelled\": \"Cancelled\"}\n    return labels.get(status, \"Unknown\")\n\nfor s in [\"completed\", \"pending\", \"lost\"]:\n    print(s, \"->\", order_status_label(s))",
   "out": {
    "text": "completed -> Delivered\npending -> On the way\nlost -> Unknown"
   }
  }
 ],
 "mistakes": [
  "Printing inside a function instead of returning. Then you can't use the result.",
  "A mutable default: <code>def f(items=[])</code> shares one list between all calls. Use <code>items=None</code> and create the list inside.",
  "Functions that do five things. Split them.",
  "Forgetting the brackets when calling: <code>add_tax</code> is the function itself; <code>add_tax(100)</code> runs it."
 ],
 "practice": [
  {
   "q": "Write <code>is_valid_email(text)</code> that returns True if the text has exactly one @ and a dot after it.",
   "code": "def is_valid_email(text):\n    if text.count(\"@\") != 1:\n        return False\n    name, domain = text.split(\"@\")\n    return len(name) > 0 and \".\" in domain\n\nfor e in [\"a@x.com\", \"bad.email\", \"a@@x.com\", \"a@xcom\"]:\n    print(e, is_valid_email(e))",
   "out": {
    "text": "a@x.com True\nbad.email False\na@@x.com False\na@xcom False"
   }
  },
  {
   "q": "Write <code>order_total(items)</code> where items is a list of (qty, price) pairs.",
   "code": "def order_total(items):\n    return sum(qty * price for qty, price in items)\n\nprint(order_total([(2, 3000), (1, 900)]))",
   "out": {
    "text": "6900"
   }
  },
  {
   "q": "Why is <code>def add(item, bag=[])</code> a bug?",
   "a": "The default list is created once and shared by every call, so items from earlier calls pile up. Use <code>bag=None</code> and inside write <code>if bag is None: bag = []</code>."
  }
 ],
 "check": [
  [
   "What does a function return if it has no return statement?",
   [
    "0",
    "An empty string",
    "None",
    "An error"
   ],
   2,
   "Without return, a function gives back None."
  ],
  [
   "def f(x, rate=0.18): … How do you call it with rate 0.05?",
   [
    "f(100, 0.05) or f(100, rate=0.05)",
    "f(rate=0.05)",
    "f(0.05)",
    "f.rate = 0.05"
   ],
   0,
   "Pass it by position or by name."
  ],
  [
   "Main difference between print and return?",
   [
    "None",
    "print shows a value; return hands it back to the caller",
    "return shows it on screen",
    "print is faster"
   ],
   1,
   "Use return when other code needs the result."
  ]
 ],
 "remember": [
  "def name(params): ... return value. Call with name(args).",
  "Defaults: def f(x, rate=0.18). Call by name: f(x, rate=0.05).",
  "Return several values as a tuple: a, b = f().",
  "print shows; return gives back. No return → None.",
  "Variables inside a function stay inside. Never use a list as a default value."
 ]
};
L["python:errors"] = {
 "title": "Errors and exceptions: handling problems",
 "level": "Beginner+",
 "one": "When something goes wrong, Python <b>raises an exception</b>. You can <b>catch</b> it with <code>try / except</code> and decide what to do instead of crashing.",
 "why": "Real programs meet bad input, missing files and failing APIs. Handling errors well is what makes software reliable, and it's a big part of integration work.",
 "steps": [
  {
   "h": "Reading a traceback",
   "p": [
    "The error message (traceback) shows where it happened and, on the last line, the <b>type</b> and <b>message</b>. Common types: <code>ValueError</code> (bad value), <code>TypeError</code> (wrong type), <code>KeyError</code> (missing dict key), <code>IndexError</code>, <code>FileNotFoundError</code>, <code>ZeroDivisionError</code>."
   ],
   "code": "qty = int(\"three\")",
   "expectError": true,
   "out": {
    "error": "ValueError: invalid literal for int() with base 10: 'three'"
   }
  },
  {
   "h": "try / except",
   "p": [
    "Put risky code in <code>try</code>. If that specific error happens, the <code>except</code> block runs instead of crashing."
   ],
   "code": "def parse_qty(text):\n    try:\n        return int(text)\n    except ValueError:\n        print(f\"'{text}' is not a number, using 0\")\n        return 0\n\nprint(parse_qty(\"4\"))\nprint(parse_qty(\"three\"))",
   "out": {
    "text": "4\n'three' is not a number, using 0\n0"
   }
  },
  {
   "h": "else and finally",
   "p": [
    "<code>else</code> runs if no error happened. <code>finally</code> always runs, error or not: used for cleanup like closing connections."
   ],
   "code": "def divide(a, b):\n    try:\n        result = a / b\n    except ZeroDivisionError:\n        print(\"can't divide by zero\")\n        return None\n    else:\n        print(\"worked\")\n        return result\n    finally:\n        print(\"done either way\")\n\nprint(divide(10, 2))\nprint(divide(10, 0))",
   "out": {
    "text": "worked\ndone either way\n5.0\ncan't divide by zero\ndone either way\nNone"
   }
  },
  {
   "h": "Raising your own errors",
   "p": [
    "Use <code>raise</code> when input breaks your rules. Fail early with a clear message rather than continuing with bad data."
   ],
   "code": "def set_rating(stars):\n    if not 1 <= stars <= 5:\n        raise ValueError(f\"rating must be 1-5, got {stars}\")\n    return stars\n\nprint(set_rating(4))\ntry:\n    set_rating(9)\nexcept ValueError as e:\n    print(\"Rejected:\", e)",
   "out": {
    "text": "4\nRejected: rating must be 1-5, got 9"
   }
  },
  {
   "h": "Your own exception types",
   "p": [
    "For bigger programs, make your own exception classes so callers can catch exactly your errors."
   ],
   "code": "class PaymentError(Exception):\n    pass\n\ndef charge(amount):\n    if amount <= 0:\n        raise PaymentError(\"amount must be positive\")\n    return f\"charged {amount}\"\n\nfor a in [500, -1]:\n    try:\n        print(charge(a))\n    except PaymentError as e:\n        print(\"Payment failed:\", e)",
   "out": {
    "text": "charged 500\nPayment failed: amount must be positive"
   }
  }
 ],
 "mistakes": [
  "A bare <code>except:</code> or <code>except Exception: pass</code>. It hides every bug, even typos. Catch the specific error you expect.",
  "Catching an error and continuing as if nothing happened. At least log it, or return a clear fallback.",
  "Using try/except for normal flow when a simple check is clearer (<code>if key in d</code>).",
  "Losing the original error. Inside except, <code>raise NewError(...) from e</code> keeps the cause."
 ],
 "practice": [
  {
   "q": "Write <code>safe_get_price(prices, name)</code> that returns the price, or None and a message if the product doesn't exist (use try/except KeyError).",
   "code": "def safe_get_price(prices, name):\n    try:\n        return prices[name]\n    except KeyError:\n        print(f\"no product called {name}\")\n        return None\n\nprices = {\"Tea\": 400}\nprint(safe_get_price(prices, \"Tea\"))\nprint(safe_get_price(prices, \"Milk\"))",
   "out": {
    "text": "400\nno product called Milk\nNone"
   }
  },
  {
   "q": "Convert a list of text values to numbers, skipping the bad ones and counting them.",
   "code": "raw = [\"10\", \"x\", \"25\", \"\", \"7\"]\nnumbers, bad = [], 0\nfor r in raw:\n    try:\n        numbers.append(int(r))\n    except ValueError:\n        bad += 1\nprint(numbers, \"bad:\", bad)",
   "out": {
    "text": "[10, 25, 7] bad: 2"
   }
  },
  {
   "q": "Why is <code>except Exception: pass</code> dangerous?",
   "a": "It silently swallows every error, including bugs and typos, so the program keeps running with wrong data and you never find out why."
  }
 ],
 "check": [
  [
   "int(\"abc\") raises…",
   [
    "TypeError",
    "ValueError",
    "KeyError",
    "NameError"
   ],
   1,
   "The type is right (str) but the value can't become a number."
  ],
  [
   "When does a finally block run?",
   [
    "Only on errors",
    "Only on success",
    "Always",
    "Never"
   ],
   2,
   "finally always runs: use it for cleanup."
  ],
  [
   "Best practice when catching errors?",
   [
    "except: pass",
    "Catch the specific error you expect and handle it",
    "Catch everything",
    "Never catch errors"
   ],
   1,
   "Specific excepts keep real bugs visible."
  ]
 ],
 "remember": [
  "Read the last line: ErrorType: message.",
  "try: risky · except SpecificError as e: handle · else: success · finally: always.",
  "raise ValueError(\"clear message\") when input breaks your rules.",
  "Custom errors: class MyError(Exception): pass.",
  "Never use bare except or except: pass."
 ]
};
L["python:modules-venv"] = {
 "title": "Modules, packages, pip and virtual environments",
 "level": "Beginner+",
 "one": "A <b>module</b> is a Python file you can <code>import</code>. <b>pip</b> installs other people's packages, and a <b>virtual environment</b> keeps each project's packages separate.",
 "why": "No real project is one file. You'll split code into modules, install libraries like requests or pandas, and every job expects you to use virtual environments.",
 "steps": [
  {
   "h": "Importing from the standard library",
   "p": [
    "Python comes with many modules built in: <code>math</code>, <code>datetime</code>, <code>json</code>, <code>random</code>, <code>pathlib</code>, <code>collections</code>… Import a whole module or just what you need."
   ],
   "code": "import math\nfrom datetime import date, timedelta\n\nprint(math.sqrt(144))\ntoday = date(2025, 7, 1)\nprint(today + timedelta(days=30))\nprint(today.strftime(\"%d %b %Y\"))",
   "out": {
    "text": "12.0\n2025-07-31\n01 Jul 2025"
   }
  },
  {
   "h": "Your own modules",
   "p": [
    "Any <code>.py</code> file is a module. Put helpers in <code>pricing.py</code> and import them in <code>main.py</code>."
   ],
   "code": "# main.py   (pricing.py is in the same folder)\nfrom pricing import with_tax, TAX_RATE\n\nprint(TAX_RATE)\nprint(with_tax(1000))",
   "out": {
    "text": "0.18\n1180.0"
   }
  },
  {
   "h": "if __name__ == \"__main__\"",
   "p": [
    "Code under this line runs only when you run the file directly, not when someone imports it. Use it for a file's “start” code."
   ],
   "code": "def main():\n    print(\"running as a script\")\n\nif __name__ == \"__main__\":\n    main()",
   "out": {
    "text": "running as a script"
   }
  },
  {
   "h": "Virtual environments",
   "p": [
    "A <b>venv</b> is a private folder of packages for one project, so project A can use pandas 1.x and project B pandas 2.x. Create one per project:"
   ],
   "code": "python3 -m venv .venv          # create (once per project)\nsource .venv/bin/activate      # activate (Windows: .venv\\Scripts\\activate)\npip install requests           # installs into .venv only\npip freeze > requirements.txt  # save exact versions\ndeactivate                     # leave",
   "lang": "bash"
  },
  {
   "h": "Installing from requirements.txt",
   "p": [
    "Teammates (and servers) recreate your setup with one command. Always add <code>.venv/</code> to <code>.gitignore</code>; commit <code>requirements.txt</code> instead.",
    "Newer projects often use <code>pyproject.toml</code> with tools like <b>uv</b> or <b>poetry</b>. The idea is the same: one file lists the packages, and one command installs them."
   ],
   "code": "pip install -r requirements.txt",
   "lang": "bash"
  }
 ],
 "mistakes": [
  "Installing packages globally with <code>sudo pip</code>. It can break your system Python. Use a venv.",
  "Naming your file the same as a library (<code>json.py</code>, <code>requests.py</code>). Then <code>import json</code> imports your file.",
  "Committing the <code>.venv</code> folder to Git. Commit requirements.txt instead.",
  "Forgetting to activate the venv, then wondering why a package “isn't installed”."
 ],
 "practice": [
  {
   "q": "Using <code>datetime</code>, print how many days are between 2025-06-02 and 2025-08-25.",
   "code": "from datetime import date\nprint((date(2025, 8, 25) - date(2025, 6, 2)).days)",
   "out": {
    "text": "84"
   }
  },
  {
   "q": "Using <code>random</code> with a fixed seed, pick 2 products from a list (so the result is repeatable).",
   "code": "import random\nrandom.seed(42)\nprint(random.sample([\"Laptop\", \"Tea\", \"Coffee\", \"Chair\", \"Notebook\"], 2))",
   "out": {
    "text": "['Laptop', 'Notebook']"
   }
  },
  {
   "q": "Write the commands to start a new project with its own venv and install <code>httpx</code>.",
   "code": "mkdir myproject && cd myproject\npython3 -m venv .venv\nsource .venv/bin/activate\npip install httpx\npip freeze > requirements.txt",
   "lang": "bash"
  }
 ],
 "check": [
  [
   "What is a virtual environment for?",
   [
    "Running Python faster",
    "Keeping each project's packages separate",
    "Hiding code",
    "Testing"
   ],
   1,
   "Each project gets its own package versions."
  ],
  [
   "What should you commit to Git?",
   [
    ".venv/",
    "requirements.txt",
    "Both",
    "Neither"
   ],
   1,
   "Commit the list of packages, not the installed files."
  ],
  [
   "Code under if __name__ == \"__main__\": runs…",
   [
    "Always",
    "Only when the file is run directly",
    "Only when imported",
    "Never"
   ],
   1,
   "It doesn't run when the file is imported."
  ]
 ],
 "remember": [
  "import module / from module import name. Any .py file is a module.",
  "Standard library: math, datetime, json, random, pathlib, collections, csv.",
  "if __name__ == \"__main__\": main() for script start code.",
  "python3 -m venv .venv · source .venv/bin/activate · pip install …",
  "pip freeze > requirements.txt; pip install -r requirements.txt. Ignore .venv in Git."
 ]
};
L["python:files-formats"] = {
 "title": "Files: text, CSV and JSON",
 "level": "Beginner+",
 "one": "Python reads and writes files with <code>open()</code>. The <code>csv</code> and <code>json</code> modules handle the two formats you'll meet most in real data work.",
 "why": "Exports, imports, configs and API payloads are files or JSON. Reading a client's CSV and turning it into clean JSON is a daily integration task.",
 "steps": [
  {
   "h": "Read and write text files",
   "p": [
    "Always use <code>with open(...)</code>: it closes the file for you, even if there's an error. Mode <code>\"w\"</code> writes (replaces), <code>\"a\"</code> appends, <code>\"r\"</code> reads (default). Set <code>encoding=\"utf-8\"</code>."
   ],
   "code": "with open(\"notes.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"first line\\n\")\n    f.write(\"second line\\n\")\n\nwith open(\"notes.txt\", encoding=\"utf-8\") as f:\n    for line in f:\n        print(line.strip())",
   "out": {
    "text": "first line\nsecond line"
   }
  },
  {
   "h": "Paths with pathlib",
   "p": [
    "<code>pathlib.Path</code> builds file paths that work on every OS and has handy helpers."
   ],
   "code": "from pathlib import Path\n\nfolder = Path(\"data\")\nfolder.mkdir(exist_ok=True)\nfile = folder / \"hello.txt\"\nfile.write_text(\"hi there\", encoding=\"utf-8\")\nprint(file, file.exists(), file.read_text(encoding=\"utf-8\"))\nprint([p.name for p in folder.glob(\"*.txt\")])",
   "out": {
    "text": "data/hello.txt True hi there\n['hello.txt']"
   }
  },
  {
   "h": "CSV: reading rows as dicts",
   "p": [
    "<code>csv.DictReader</code> uses the header row as keys. Every value comes in as <b>text</b>, so convert numbers yourself."
   ],
   "code": "import csv\n\nwith open(\"orders.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\nprint(rows[0])\nrevenue = sum(int(r[\"total\"]) for r in rows if r[\"status\"] == \"completed\")\nprint(\"Revenue:\", revenue)",
   "out": {
    "text": "{'id': '1', 'customer': 'Asha', 'total': '55000', 'status': 'completed'}\nRevenue: 71100"
   }
  },
  {
   "h": "CSV: writing",
   "p": [
    "<code>csv.DictWriter</code> writes a list of dicts with a header. Open with <code>newline=\"\"</code> to avoid blank lines on Windows."
   ],
   "code": "import csv\n\nsummary = [{\"customer\": \"Asha\", \"spent\": 61900}, {\"customer\": \"Ben\", \"spent\": 9200}]\nwith open(\"summary.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:\n    w = csv.DictWriter(f, fieldnames=[\"customer\", \"spent\"])\n    w.writeheader()\n    w.writerows(summary)\n\nprint(open(\"summary.csv\", encoding=\"utf-8\").read())",
   "out": {
    "text": "customer,spent\nAsha,61900\nBen,9200"
   }
  },
  {
   "h": "JSON: text ↔ Python",
   "p": [
    "<code>json.loads(text)</code> turns JSON text into dicts and lists; <code>json.dumps(obj)</code> does the reverse. <code>json.load(f)</code> and <code>json.dump(obj, f)</code> work with files. JSON true/false/null become Python True/False/None."
   ],
   "code": "import json\n\npayload = '{\"order_id\": 6, \"paid\": false, \"items\": [{\"sku\": \"LAP\", \"qty\": 1}], \"coupon\": null}'\ndata = json.loads(payload)\nprint(data[\"items\"][0][\"sku\"], data[\"paid\"], data[\"coupon\"])\n\ndata[\"paid\"] = True\nprint(json.dumps(data, indent=2))",
   "out": {
    "text": "LAP False None\n{\n  \"order_id\": 6,\n  \"paid\": true,\n  \"items\": [\n    {\n      \"sku\": \"LAP\",\n      \"qty\": 1\n    }\n  ],\n  \"coupon\": null\n}"
   }
  },
  {
   "h": "CSV to JSON: a small real task",
   "p": [
    "Read a CSV export, clean it, and produce the JSON an API expects."
   ],
   "code": "import csv, json\n\nwith open(\"customers.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    clean = []\n    for r in csv.DictReader(f):\n        email = r[\"email\"].strip().lower()\n        if not email:\n            print(\"skipping\", r[\"name\"].strip(), \"(no email)\")\n            continue\n        clean.append({\"id\": int(r[\"id\"]), \"name\": r[\"name\"].strip(), \"email\": email})\n\nprint(json.dumps(clean, indent=2))",
   "out": {
    "text": "skipping Chen Li (no email)\n[\n  {\n    \"id\": 1,\n    \"name\": \"Asha Rao\",\n    \"email\": \"asha@example.com\"\n  },\n  {\n    \"id\": 2,\n    \"name\": \"Ben Thomas\",\n    \"email\": \"ben@example.com\"\n  }\n]"
   }
  }
 ],
 "mistakes": [
  "Forgetting that CSV values are all strings: <code>\"100\" &gt; \"9\"</code> is False. Convert with int()/float().",
  "Opening files without <code>with</code>, so they're never closed.",
  "Not setting <code>encoding=\"utf-8\"</code>: names like “José” or “₹” break on some machines.",
  "Writing JSON with Python's <code>str(dict)</code> (single quotes). That isn't valid JSON. Use <code>json.dumps</code>."
 ],
 "practice": [
  {
   "q": "Count orders per status from the CSV.",
   "code": "import csv\nfrom collections import Counter\n\nwith open(\"orders.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    print(Counter(r[\"status\"] for r in csv.DictReader(f)))",
   "out": {
    "text": "Counter({'completed': 3, 'cancelled': 1, 'pending': 1})"
   }
  },
  {
   "q": "Save a dict of settings to <code>config.json</code> and read it back.",
   "code": "import json\n\nsettings = {\"api_url\": \"https://api.example.com\", \"retries\": 3, \"debug\": False}\nwith open(\"config.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(settings, f, indent=2)\nwith open(\"config.json\", encoding=\"utf-8\") as f:\n    print(json.load(f)[\"retries\"])",
   "out": {
    "text": "3"
   }
  }
 ],
 "check": [
  [
   "Why use with open(...) as f?",
   [
    "It's faster",
    "It closes the file automatically, even on errors",
    "It's required for CSV",
    "It encrypts the file"
   ],
   1,
   "with handles cleanup for you."
  ],
  [
   "Values from csv.DictReader are…",
   [
    "Already numbers",
    "Always strings",
    "Dates",
    "JSON"
   ],
   1,
   "Convert numbers yourself."
  ],
  [
   "json.loads turns…",
   [
    "Python into JSON text",
    "JSON text into Python dicts/lists",
    "CSV into JSON",
    "A file path into text"
   ],
   1,
   "loads = load from a string. dumps = dump to a string."
  ]
 ],
 "remember": [
  "with open(path, mode, encoding=\"utf-8\") as f: ... (r, w, a).",
  "pathlib: Path(\"data\") / \"file.txt\", .exists(), .read_text(), .glob().",
  "csv.DictReader → list of dicts (all strings). csv.DictWriter + writeheader().",
  "json.loads / json.dumps for text; json.load / json.dump for files.",
  "JSON true/false/null ↔ Python True/False/None."
 ]
};
L["python:classes"] = {
 "title": "Classes and objects",
 "level": "Intermediate",
 "one": "A <b>class</b> is a blueprint that bundles data (<b>attributes</b>) and behaviour (<b>methods</b>). Each thing made from it is an <b>object</b>.",
 "why": "Most libraries and frameworks (Django, FastAPI, Odoo, Pydantic) are built on classes. You need to read and write them comfortably.",
 "steps": [
  {
   "h": "A simple class",
   "p": [
    "<code>__init__</code> runs when you create an object and sets its attributes. <code>self</code> means “this object”. Methods are functions inside the class."
   ],
   "code": "class Order:\n    def __init__(self, order_id, customer):\n        self.order_id = order_id\n        self.customer = customer\n        self.items = []\n\n    def add_item(self, name, qty, price):\n        self.items.append((name, qty, price))\n\n    def total(self):\n        return sum(qty * price for _, qty, price in self.items)\n\no = Order(2, \"Asha\")\no.add_item(\"Headphones\", 2, 3000)\no.add_item(\"Coffee\", 1, 900)\nprint(o.customer, o.total())",
   "out": {
    "text": "Asha 6900"
   }
  },
  {
   "h": "Many objects from one class",
   "p": [
    "Each object has its own data."
   ],
   "code": "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError(\"deposit must be positive\")\n        self.balance += amount\n\na = Account(\"Asha\")\nb = Account(\"Ben\", 500)\na.deposit(1000)\nprint(a.owner, a.balance, \"|\", b.owner, b.balance)",
   "out": {
    "text": "Asha 1000 | Ben 500"
   }
  },
  {
   "h": "A nice printout: __repr__",
   "p": [
    "<code>__repr__</code> controls how the object looks when printed. Very helpful when debugging."
   ],
   "code": "class Product:\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n    def __repr__(self):\n        return f\"Product({self.name!r}, {self.price})\"\n\nprint(Product(\"Tea\", 400))\nprint([Product(\"Laptop\", 55000), Product(\"Coffee\", 900)])",
   "out": {
    "text": "Product('Tea', 400)\n[Product('Laptop', 55000), Product('Coffee', 900)]"
   }
  },
  {
   "h": "Inheritance: a class based on another",
   "p": [
    "A child class gets everything from the parent and can add or change behaviour. <code>super()</code> calls the parent's version."
   ],
   "code": "class Notifier:\n    def __init__(self, to):\n        self.to = to\n\n    def send(self, message):\n        return f\"[{self.channel()}] to {self.to}: {message}\"\n\n    def channel(self):\n        return \"generic\"\n\nclass EmailNotifier(Notifier):\n    def channel(self):\n        return \"email\"\n\nclass SmsNotifier(Notifier):\n    def channel(self):\n        return \"sms\"\n\nfor n in [EmailNotifier(\"asha@example.com\"), SmsNotifier(\"+91 98xxxx\")]:\n    print(n.send(\"Your order shipped\"))",
   "out": {
    "text": "[email] to asha@example.com: Your order shipped\n[sms] to +91 98xxxx: Your order shipped"
   }
  },
  {
   "h": "Class attributes and @property",
   "p": [
    "A <b>class attribute</b> is shared by all objects. <code>@property</code> makes a method look like an attribute: handy for values worked out from others."
   ],
   "code": "class LineItem:\n    tax_rate = 0.18\n\n    def __init__(self, price, qty):\n        self.price = price\n        self.qty = qty\n\n    @property\n    def total(self):\n        return round(self.price * self.qty * (1 + self.tax_rate), 2)\n\nitem = LineItem(900, 2)\nprint(item.total)",
   "out": {
    "text": "2124.0"
   }
  }
 ],
 "mistakes": [
  "Forgetting <code>self</code> as the first method parameter, or forgetting <code>self.</code> when setting attributes.",
  "Using a class when a function or a dict would do. Classes are for data + behaviour together.",
  "Deep inheritance chains. Prefer small classes and passing objects in (composition).",
  "A mutable class attribute (like a list) shared by every object by accident. Set lists in __init__."
 ],
 "practice": [
  {
   "q": "Write a <code>Cart</code> class with <code>add(name, price, qty=1)</code>, <code>remove(name)</code> and <code>total()</code>.",
   "code": "class Cart:\n    def __init__(self):\n        self.lines = {}\n\n    def add(self, name, price, qty=1):\n        old_qty = self.lines.get(name, (price, 0))[1]\n        self.lines[name] = (price, old_qty + qty)\n\n    def remove(self, name):\n        self.lines.pop(name, None)\n\n    def total(self):\n        return sum(price * qty for price, qty in self.lines.values())\n\nc = Cart()\nc.add(\"Tea\", 400, 2)\nc.add(\"Coffee\", 900)\nc.add(\"Tea\", 400)\nprint(c.total())\nc.remove(\"Coffee\")\nprint(c.total())",
   "out": {
    "text": "2100\n1200"
   }
  },
  {
   "q": "Give the Account class a <code>withdraw</code> method that refuses to go below zero.",
   "code": "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner, self.balance = owner, balance\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError(\"not enough money\")\n        self.balance -= amount\n\na = Account(\"Asha\", 1000)\na.withdraw(300)\nprint(a.balance)\ntry:\n    a.withdraw(5000)\nexcept ValueError as e:\n    print(\"Refused:\", e)",
   "out": {
    "text": "700\nRefused: not enough money"
   }
  }
 ],
 "check": [
  [
   "What does __init__ do?",
   [
    "Deletes the object",
    "Sets up a new object when it's created",
    "Prints the object",
    "Imports the class"
   ],
   1,
   "It runs on creation and sets attributes."
  ],
  [
   "What is self?",
   [
    "The class name",
    "The current object",
    "A keyword for loops",
    "The parent class"
   ],
   1,
   "self refers to the object the method is called on."
  ],
  [
   "class B(A): means…",
   [
    "B contains A",
    "B inherits from A",
    "A inherits from B",
    "B and A are the same"
   ],
   1,
   "B gets A's attributes and methods."
  ]
 ],
 "remember": [
  "class Name: def __init__(self, ...): self.x = ...",
  "Methods take self first. Call with obj.method().",
  "__repr__ = how it prints. @property = computed attribute.",
  "class Child(Parent): inherit; super() calls the parent.",
  "Use classes for data + behaviour; otherwise a function or dict is fine."
 ]
};
L["python:types-dataclasses"] = {
 "title": "Type hints and dataclasses",
 "level": "Intermediate",
 "one": "<b>Type hints</b> say what goes in and out of your code (<code>def total(prices: list[float]) -&gt; float</code>). <b>Dataclasses</b> create simple data classes with almost no code.",
 "why": "Modern Python teams use type hints everywhere: editors catch bugs, and code documents itself. FastAPI and Pydantic are built on them, and so is most AI tooling.",
 "steps": [
  {
   "h": "Type hints",
   "p": [
    "Write <code>name: type</code> for parameters and <code>-&gt; type</code> for the return. Python doesn't enforce them at run time; your editor and tools like <b>mypy</b> check them."
   ],
   "code": "def order_total(prices: list[float], tax_rate: float = 0.18) -> float:\n    return round(sum(prices) * (1 + tax_rate), 2)\n\nprint(order_total([900.0, 400.0]))",
   "out": {
    "text": "1534.0"
   }
  },
  {
   "h": "Optional values and unions",
   "p": [
    "<code>str | None</code> means “a string or None”. <code>dict[str, int]</code> is a dict with text keys and int values."
   ],
   "code": "def find_price(prices: dict[str, int], name: str) -> int | None:\n    return prices.get(name)\n\nprices = {\"Tea\": 400, \"Coffee\": 900}\nprint(find_price(prices, \"Tea\"), find_price(prices, \"Milk\"))",
   "out": {
    "text": "400 None"
   }
  },
  {
   "h": "Hints aren't checked at run time",
   "p": [
    "This runs without error even though the hint says int. That's why tools like mypy (and Pydantic, next lesson) exist."
   ],
   "code": "def double(x: int) -> int:\n    return x * 2\n\nprint(double(\"ab\"))",
   "out": {
    "text": "abab"
   }
  },
  {
   "h": "Dataclasses",
   "p": [
    "<code>@dataclass</code> writes <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> for you from the field list."
   ],
   "code": "from dataclasses import dataclass, field\n\n@dataclass\nclass Customer:\n    id: int\n    name: str\n    city: str | None = None\n    tags: list[str] = field(default_factory=list)\n\nc = Customer(1, \"Asha Rao\", \"Kochi\")\nc.tags.append(\"vip\")\nprint(c)\nprint(c == Customer(1, \"Asha Rao\", \"Kochi\", [\"vip\"]))",
   "out": {
    "text": "Customer(id=1, name='Asha Rao', city='Kochi', tags=['vip'])\nTrue"
   }
  },
  {
   "h": "Frozen dataclasses and methods",
   "p": [
    "<code>frozen=True</code> makes objects read-only: safer for values that shouldn't change. Dataclasses can have methods like any class."
   ],
   "code": "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Money:\n    amount: int      # in paise, to avoid float errors\n    currency: str = \"INR\"\n\n    def add(self, other: \"Money\") -> \"Money\":\n        if other.currency != self.currency:\n            raise ValueError(\"currency mismatch\")\n        return Money(self.amount + other.amount, self.currency)\n\ntotal = Money(90000).add(Money(40000))\nprint(total)\ntry:\n    total.amount = 5\nexcept Exception as e:\n    print(type(e).__name__)",
   "out": {
    "text": "Money(amount=130000, currency='INR')\nFrozenInstanceError"
   }
  }
 ],
 "mistakes": [
  "Thinking hints validate data. They don't; use Pydantic for that.",
  "A list default in a dataclass: <code>tags: list = []</code> errors. Use <code>field(default_factory=list)</code>.",
  "Over-complicated hints. Keep them readable; <code>dict[str, Any]</code> is fine when the shape varies.",
  "Floats for money. Store whole paise/cents as int, or use Decimal."
 ],
 "practice": [
  {
   "q": "Add type hints to <code>def apply_discount(price, percent)</code> that returns the new price.",
   "code": "def apply_discount(price: float, percent: float) -> float:\n    return round(price * (1 - percent / 100), 2)\n\nprint(apply_discount(1000, 15))",
   "out": {
    "text": "850.0"
   }
  },
  {
   "q": "Make a dataclass <code>OrderLine</code> with product, qty and unit_price, plus a <code>total</code> property.",
   "code": "from dataclasses import dataclass\n\n@dataclass\nclass OrderLine:\n    product: str\n    qty: int\n    unit_price: float\n\n    @property\n    def total(self) -> float:\n        return self.qty * self.unit_price\n\nline = OrderLine(\"Headphones\", 2, 3000)\nprint(line, line.total)",
   "out": {
    "text": "OrderLine(product='Headphones', qty=2, unit_price=3000) 6000"
   }
  }
 ],
 "check": [
  [
   "Does Python stop you passing a str to def f(x: int)?",
   [
    "Yes, always",
    "No, hints aren't enforced at run time",
    "Only in Python 2",
    "Only for ints"
   ],
   1,
   "Hints are for tools and readers. Use Pydantic to validate."
  ],
  [
   "What does @dataclass give you?",
   [
    "A database table",
    "Auto-generated __init__, __repr__ and __eq__",
    "Faster code",
    "Type checking"
   ],
   1,
   "It writes the boilerplate from your field list."
  ],
  [
   "How do you give a dataclass field an empty list default?",
   [
    "tags: list = []",
    "tags: list = field(default_factory=list)",
    "tags = list",
    "You can't"
   ],
   1,
   "Mutable defaults need default_factory."
  ]
 ],
 "remember": [
  "def f(x: int, name: str | None = None) -> float:",
  "list[str], dict[str, int], X | None. Not enforced at run time (mypy checks).",
  "@dataclass writes __init__/__repr__/__eq__. frozen=True = read-only.",
  "Mutable defaults: field(default_factory=list).",
  "Money: int paise or Decimal, not float."
 ]
};
L["python:pydantic-async"] = {
 "title": "Validating data with Pydantic, and async basics",
 "level": "Intermediate",
 "one": "<b>Pydantic</b> checks and converts data against your type hints, so bad input fails early with a clear message. <b>async</b> lets one program wait for many slow things (like API calls) at the same time.",
 "why": "Every AI app and API handles untrusted data: user input, webhooks, LLM output. Pydantic is the standard way to validate it (FastAPI uses it). Async makes programs that call many APIs much faster.",
 "steps": [
  {
   "h": "A Pydantic model",
   "p": [
    "Write a class with type hints. Pydantic converts compatible values (the text <code>\"3\"</code> becomes the number 3) and rejects wrong ones."
   ],
   "code": "from pydantic import BaseModel\n\nclass OrderIn(BaseModel):\n    order_id: int\n    customer_email: str\n    qty: int\n    coupon: str | None = None\n\no = OrderIn(order_id=\"6\", customer_email=\"asha@example.com\", qty=3)\nprint(o)\nprint(o.qty + 1)",
   "out": {
    "text": "order_id=6 customer_email='asha@example.com' qty=3 coupon=None\n4"
   }
  },
  {
   "h": "Bad data gives a clear error",
   "p": [
    "Instead of a crash deep in your code, you get one error listing every problem, at the edge where the data came in."
   ],
   "code": "from pydantic import BaseModel, ValidationError\n\nclass OrderIn(BaseModel):\n    order_id: int\n    qty: int\n\ntry:\n    OrderIn(order_id=\"abc\", qty=None)\nexcept ValidationError as e:\n    for err in e.errors():\n        print(err[\"loc\"], err[\"msg\"])",
   "out": {
    "text": "('order_id',) Input should be a valid integer, unable to parse string as an integer\n('qty',) Input should be a valid integer"
   }
  },
  {
   "h": "Rules with Field and validators",
   "p": [
    "<code>Field(gt=0)</code> adds rules. <code>@field_validator</code> runs your own check or clean-up."
   ],
   "code": "from pydantic import BaseModel, Field, field_validator\n\nclass Signup(BaseModel):\n    name: str = Field(min_length=2)\n    email: str\n    age: int = Field(ge=18, le=120)\n\n    @field_validator(\"email\")\n    @classmethod\n    def clean_email(cls, v: str) -> str:\n        v = v.strip().lower()\n        if \"@\" not in v:\n            raise ValueError(\"not an email\")\n        return v\n\nprint(Signup(name=\"Asha\", email=\"  ASHA@Example.com \", age=29))",
   "out": {
    "text": "name='Asha' email='asha@example.com' age=29"
   }
  },
  {
   "h": "JSON in, JSON out",
   "p": [
    "<code>model_validate_json</code> parses and validates JSON text in one step; <code>model_dump()</code> gives a dict and <code>model_dump_json()</code> gives JSON. Perfect for API payloads and LLM structured output."
   ],
   "code": "from pydantic import BaseModel\n\nclass Item(BaseModel):\n    sku: str\n    qty: int\n\nclass Order(BaseModel):\n    order_id: int\n    items: list[Item]\n\nraw = '{\"order_id\": 6, \"items\": [{\"sku\": \"LAP\", \"qty\": \"1\"}, {\"sku\": \"HP\", \"qty\": 2}]}'\norder = Order.model_validate_json(raw)\nprint(order.items[0].qty, type(order.items[0].qty).__name__)\nprint(order.model_dump())",
   "out": {
    "text": "1 int\n{'order_id': 6, 'items': [{'sku': 'LAP', 'qty': 1}, {'sku': 'HP', 'qty': 2}]}"
   }
  },
  {
   "h": "async: waiting for many things at once",
   "p": [
    "Calling 3 slow APIs one after another takes 3× as long. With <code>async def</code> and <code>await</code>, the program starts all three and waits for them together. <code>asyncio.gather</code> runs them side by side.",
    "Here <code>asyncio.sleep</code> stands in for a slow network call:"
   ],
   "code": "import asyncio, time\n\nasync def fetch(name: str, seconds: float) -> str:\n    await asyncio.sleep(seconds)   # pretend this is an API call\n    return f\"{name} done\"\n\nasync def main():\n    start = time.perf_counter()\n    results = await asyncio.gather(fetch(\"orders\", 1), fetch(\"customers\", 1), fetch(\"stock\", 1))\n    print(results)\n    print(f\"took {time.perf_counter() - start:.1f}s, not 3s\")\n\nasyncio.run(main())",
   "out": {
    "text": "['orders done', 'customers done', 'stock done']\ntook 1.0s, not 3s"
   }
  },
  {
   "h": "When to use async",
   "p": [
    "Use async when the program spends most of its time <b>waiting</b> (network, APIs, databases): web servers, scrapers, apps calling LLM APIs. It doesn't make heavy calculations faster.",
    "Real HTTP calls use an async client like <code>httpx.AsyncClient</code>:"
   ],
   "code": "import httpx, asyncio\n\nasync def main():\n    async with httpx.AsyncClient(timeout=10) as client:\n        r1, r2 = await asyncio.gather(\n            client.get(\"https://api.example.com/orders\"),\n            client.get(\"https://api.example.com/customers\"),\n        )\n        print(r1.status_code, r2.status_code)\n\nasyncio.run(main())",
   "run": false
  }
 ],
 "mistakes": [
  "Trusting input (user, webhook, LLM output) without validating it. Put a Pydantic model at every entry point.",
  "Calling an async function without <code>await</code>: you get a coroutine object, not the result.",
  "Using <code>time.sleep</code> or a normal blocking HTTP library inside async code. It freezes everything. Use <code>asyncio.sleep</code> and <code>httpx.AsyncClient</code>.",
  "Using async for CPU-heavy work. It only helps when waiting."
 ],
 "practice": [
  {
   "q": "Make a Pydantic model <code>Product</code> with name (at least 2 characters), price (more than 0) and category (default \"General\"). Show that a price of -5 is rejected.",
   "code": "from pydantic import BaseModel, Field, ValidationError\n\nclass Product(BaseModel):\n    name: str = Field(min_length=2)\n    price: float = Field(gt=0)\n    category: str = \"General\"\n\nprint(Product(name=\"Tea\", price=400))\ntry:\n    Product(name=\"Tea\", price=-5)\nexcept ValidationError as e:\n    print(e.errors()[0][\"msg\"])",
   "out": {
    "text": "name='Tea' price=400.0 category='General'\nInput should be greater than 0"
   }
  },
  {
   "q": "Run three pretend API calls of 0.5s each with asyncio.gather and print the total time.",
   "code": "import asyncio, time\n\nasync def call(i):\n    await asyncio.sleep(0.5)\n    return i\n\nasync def main():\n    t = time.perf_counter()\n    print(await asyncio.gather(call(1), call(2), call(3)))\n    print(f\"{time.perf_counter() - t:.1f}s\")\n\nasyncio.run(main())",
   "out": {
    "text": "[1, 2, 3]\n0.5s"
   }
  }
 ],
 "check": [
  [
   "Pydantic gets qty=\"3\" for an int field. What happens?",
   [
    "Error",
    "It converts it to 3",
    "It stays \"3\"",
    "It becomes None"
   ],
   1,
   "Pydantic converts compatible values and rejects others."
  ],
  [
   "Three 1-second API calls with asyncio.gather take about…",
   [
    "3 seconds",
    "1 second",
    "0 seconds",
    "6 seconds"
   ],
   1,
   "They wait at the same time."
  ],
  [
   "Async helps most when your program is…",
   [
    "Doing heavy maths",
    "Waiting on network or databases",
    "Reading small files",
    "Sorting lists"
   ],
   1,
   "Async is for waiting, not computing."
  ]
 ],
 "remember": [
  "class M(BaseModel): field: type = default → validates and converts.",
  "Field(gt=0, min_length=2) for rules; @field_validator for custom checks.",
  "Model.model_validate_json(text), m.model_dump(), m.model_dump_json().",
  "async def + await; asyncio.gather runs waits side by side; asyncio.run(main()).",
  "Async = for waiting (APIs, DB). Never time.sleep inside async."
 ]
};
L["python:pytest"] = {
 "title": "Testing with pytest",
 "level": "Intermediate",
 "one": "A <b>test</b> is code that checks your code. With <b>pytest</b> you write small functions starting with <code>test_</code> that use <code>assert</code>, and run them all with one command.",
 "why": "Tests let you change code without fear and prove it works. Every serious job expects them, and interviewers often ask you to write tests for your solution.",
 "steps": [
  {
   "h": "Your first test",
   "p": [
    "Put tests in files named <code>test_*.py</code>. Each test is a function starting with <code>test_</code>. <code>assert</code> checks something is true. Run <code>pytest</code> in the project folder."
   ],
   "code": "def add_tax(amount, rate=0.18):\n    return round(amount * (1 + rate), 2)\n\ndef test_add_tax_default():\n    assert add_tax(100) == 118.0\n\ndef test_add_tax_custom_rate():\n    assert add_tax(200, rate=0.05) == 210.0",
   "test": true,
   "out": {
    "text": "..  [100%]\n2 passed in 0.01s"
   }
  },
  {
   "h": "What a failure looks like",
   "p": [
    "pytest shows exactly what was expected and what came back. This bug only charges 8% tax:"
   ],
   "code": "def add_tax(amount, rate=0.08):\n    return round(amount * (1 + rate), 2)\n\ndef test_add_tax_default():\n    assert add_tax(100) == 118.0",
   "test": true,
   "expectError": true,
   "out": {
    "text": "F  [100%]\n=================================== FAILURES ===================================\n_____________________________ test_add_tax_default _____________________________\n\n    def test_add_tax_default():\n>       assert add_tax(100) == 118.0\nE       assert 108.0 == 118.0\nE        +  where 108.0 = add_tax(100)\n\ntest_example.py:5: AssertionError\n=========================== short test summary info ============================\nFAILED test_example.py::test_add_tax_default - assert 108.0 == 118.0\n1 failed in 0.01s"
   }
  },
  {
   "h": "Testing errors",
   "p": [
    "<code>pytest.raises</code> checks that the right error is raised."
   ],
   "code": "import pytest\n\ndef set_rating(stars):\n    if not 1 <= stars <= 5:\n        raise ValueError(\"rating must be 1-5\")\n    return stars\n\ndef test_valid_rating():\n    assert set_rating(5) == 5\n\ndef test_rating_too_high():\n    with pytest.raises(ValueError):\n        set_rating(9)",
   "test": true,
   "out": {
    "text": "..  [100%]\n2 passed in 0.00s"
   }
  },
  {
   "h": "Many cases with parametrize",
   "p": [
    "Run the same test with many inputs. Each case shows up as its own test."
   ],
   "code": "import pytest\n\ndef is_valid_email(text):\n    return text.count(\"@\") == 1 and \".\" in text.split(\"@\")[1]\n\n@pytest.mark.parametrize(\"email, ok\", [\n    (\"a@x.com\", True),\n    (\"no-at-sign.com\", False),\n    (\"a@@x.com\", False),\n    (\"a@xcom\", False),\n])\ndef test_is_valid_email(email, ok):\n    assert is_valid_email(email) == ok",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.01s"
   }
  },
  {
   "h": "Fixtures: shared setup",
   "p": [
    "A <b>fixture</b> prepares something tests need (sample data, a temp folder, a test database). Ask for it by naming it as a parameter. <code>tmp_path</code> is a built-in fixture that gives a fresh folder."
   ],
   "code": "import json, pytest\n\ndef load_orders(path):\n    return json.loads(path.read_text())\n\n@pytest.fixture\ndef orders_file(tmp_path):\n    p = tmp_path / \"orders.json\"\n    p.write_text(json.dumps([{\"id\": 1, \"total\": 500}, {\"id\": 2, \"total\": 700}]))\n    return p\n\ndef test_load_orders(orders_file):\n    orders = load_orders(orders_file)\n    assert len(orders) == 2\n    assert sum(o[\"total\"] for o in orders) == 1200",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.01s"
   }
  },
  {
   "h": "Faking slow or external things",
   "p": [
    "Tests shouldn't call real APIs. Pass the dependency in, and give a fake in tests (or use <code>unittest.mock</code> / pytest's <code>monkeypatch</code>)."
   ],
   "code": "def latest_rate(fetch):\n    data = fetch(\"https://api.example.com/rate\")\n    return data[\"rate\"]\n\ndef test_latest_rate_uses_api_value():\n    def fake_fetch(url):\n        return {\"rate\": 83.2}\n    assert latest_rate(fake_fetch) == 83.2",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  }
 ],
 "mistakes": [
  "Tests that call real APIs or real databases: slow and flaky. Fake them.",
  "Only testing the happy path. Test bad input, empty lists and edge cases too.",
  "One giant test that checks ten things. Small tests tell you exactly what broke.",
  "Comparing floats with ==. Use <code>pytest.approx(0.3)</code> for float results."
 ],
 "practice": [
  {
   "q": "Write tests for <code>order_total(items)</code>: a normal order, an empty order, and a negative qty that should raise ValueError.",
   "code": "import pytest\n\ndef order_total(items):\n    if any(qty < 0 for qty, _ in items):\n        raise ValueError(\"qty can't be negative\")\n    return sum(qty * price for qty, price in items)\n\ndef test_normal_order():\n    assert order_total([(2, 3000), (1, 900)]) == 6900\n\ndef test_empty_order():\n    assert order_total([]) == 0\n\ndef test_negative_qty():\n    with pytest.raises(ValueError):\n        order_total([(-1, 100)])",
   "test": true,
   "out": {
    "text": "...  [100%]\n3 passed in 0.01s"
   }
  },
  {
   "q": "Test that 0.1 + 0.2 equals 0.3 the right way.",
   "code": "import pytest\n\ndef test_float_sum():\n    assert 0.1 + 0.2 == pytest.approx(0.3)",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  }
 ],
 "check": [
  [
   "How does pytest find tests?",
   [
    "Any function",
    "Functions starting with test_ in test_*.py files",
    "Functions with @test",
    "Classes only"
   ],
   1,
   "Name files test_*.py and functions test_*."
  ],
  [
   "How do you check a function raises ValueError?",
   [
    "try/except in the test",
    "with pytest.raises(ValueError):",
    "assert ValueError",
    "@pytest.error"
   ],
   1,
   "pytest.raises is the clean way."
  ],
  [
   "Your test calls a real payment API. Problem?",
   [
    "None",
    "Slow, flaky and may charge money: fake it",
    "pytest can't do HTTP",
    "It's required"
   ],
   1,
   "Tests should be fast and isolated."
  ]
 ],
 "remember": [
  "Files test_*.py, functions test_*, plain assert. Run: pytest.",
  "pytest.raises(Error) for errors; pytest.approx for floats.",
  "@pytest.mark.parametrize for many cases.",
  "Fixtures share setup; tmp_path gives a temp folder.",
  "Fake external calls (pass dependencies in, or monkeypatch)."
 ]
};
L["python:practice"] = {
 "title": "Practice project: clean and report on an orders export",
 "level": "Project",
 "one": "Put everything together: read a messy CSV, validate rows with Pydantic, skip and report bad rows, compute a summary, write JSON, and test it.",
 "why": "This is a real day-one task in integration and data jobs. Doing it end to end, with tests, proves you can use Python for actual work, not just exercises.",
 "steps": [
  {
   "h": "The messy input",
   "p": [
    "A client sends <code>orders.csv</code>. Some rows are broken: a missing email, a quantity that isn't a number, a negative price."
   ],
   "code": "print(open(\"orders.csv\", encoding=\"utf-8\").read())",
   "out": {
    "text": "order_id,email,product,qty,price\n1,asha@example.com,Laptop,1,55000\n2, BEN@example.com ,Headphones,2,3000\n3,,Coffee,1,900\n4,chen@example.com,Tea,three,400\n5,divya@example.com,Chair,1,-8000\n6,omar@example.com,Tea,5,400"
   }
  },
  {
   "h": "Step 1: a model for one valid row",
   "p": [
    "Describe what a good row looks like. Pydantic does the checking and cleaning."
   ],
   "code": "from pydantic import BaseModel, Field, field_validator\n\nclass OrderRow(BaseModel):\n    order_id: int\n    email: str\n    product: str\n    qty: int = Field(gt=0)\n    price: float = Field(gt=0)\n\n    @field_validator(\"email\")\n    @classmethod\n    def clean_email(cls, v: str) -> str:\n        v = v.strip().lower()\n        if \"@\" not in v:\n            raise ValueError(\"missing or invalid email\")\n        return v\n\nprint(OrderRow(order_id=\"2\", email=\" BEN@example.com \", product=\"Headphones\", qty=\"2\", price=\"3000\"))",
   "out": {
    "text": "order_id=2 email='ben@example.com' product='Headphones' qty=2 price=3000.0"
   }
  },
  {
   "h": "Step 2: load, keep good rows, collect errors",
   "p": [
    "Never stop the whole import because of one bad row. Keep going and report every problem with its row number."
   ],
   "code": "import csv\nfrom pydantic import ValidationError\n\ndef load(path):\n    good, errors = [], []\n    with open(path, newline=\"\", encoding=\"utf-8\") as f:\n        for line_no, raw in enumerate(csv.DictReader(f), start=2):\n            try:\n                good.append(OrderRow(**raw))\n            except ValidationError as e:\n                problems = \"; \".join(f\"{err['loc'][0]}: {err['msg']}\" for err in e.errors())\n                errors.append({\"line\": line_no, \"problems\": problems})\n    return good, errors\n\ngood, errors = load(\"orders.csv\")\nprint(len(good), \"good rows\")\nfor e in errors:\n    print(e)",
   "out": {
    "text": "3 good rows\n{'line': 4, 'problems': 'email: Value error, missing or invalid email'}\n{'line': 5, 'problems': 'qty: Input should be a valid integer, unable to parse string as an integer'}\n{'line': 6, 'problems': 'price: Input should be greater than 0'}"
   }
  },
  {
   "h": "Step 3: summary and JSON output",
   "p": [
    "Compute what the client asked for and write it as JSON."
   ],
   "code": "import json\nfrom collections import defaultdict\n\ndef summarise(rows):\n    revenue_by_product = defaultdict(float)\n    for r in rows:\n        revenue_by_product[r.product] += r.qty * r.price\n    return {\n        \"orders\": len(rows),\n        \"revenue\": sum(revenue_by_product.values()),\n        \"by_product\": dict(sorted(revenue_by_product.items(), key=lambda kv: -kv[1])),\n    }\n\ngood, errors = load(\"orders.csv\")\nreport = {\"summary\": summarise(good), \"rejected\": errors}\nwith open(\"report.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(report, f, indent=2)\nprint(json.dumps(report, indent=2))",
   "out": {
    "text": "{\n  \"summary\": {\n    \"orders\": 3,\n    \"revenue\": 63000.0,\n    \"by_product\": {\n      \"Laptop\": 55000.0,\n      \"Headphones\": 6000.0,\n      \"Tea\": 2000.0\n    }\n  },\n  \"rejected\": [\n    {\n      \"line\": 4,\n      \"problems\": \"email: Value error, missing or invalid email\"\n    },\n    {\n      \"line\": 5,\n      \"problems\": \"qty: Input should be a valid integer, unable to parse string as an integer\"\n    },\n    {\n      \"line\": 6,\n      \"problems\": \"price: Input should be greater than 0\"\n    }\n  ]\n}"
   }
  },
  {
   "h": "Step 4: tests",
   "p": [
    "Test the pieces: a good row is cleaned, a bad row is rejected, and the summary adds up."
   ],
   "code": "import pytest\nfrom pydantic import BaseModel, Field, ValidationError, field_validator\n\nclass OrderRow(BaseModel):\n    order_id: int\n    email: str\n    product: str\n    qty: int = Field(gt=0)\n    price: float = Field(gt=0)\n\n    @field_validator(\"email\")\n    @classmethod\n    def clean_email(cls, v):\n        v = v.strip().lower()\n        if \"@\" not in v:\n            raise ValueError(\"missing or invalid email\")\n        return v\n\ndef summarise(rows):\n    return sum(r.qty * r.price for r in rows)\n\ndef test_email_is_cleaned():\n    row = OrderRow(order_id=1, email=\" A@X.COM \", product=\"Tea\", qty=1, price=400)\n    assert row.email == \"a@x.com\"\n\n@pytest.mark.parametrize(\"field, value\", [(\"qty\", \"three\"), (\"qty\", 0), (\"price\", -1), (\"email\", \"\")])\ndef test_bad_rows_are_rejected(field, value):\n    data = {\"order_id\": 1, \"email\": \"a@x.com\", \"product\": \"Tea\", \"qty\": 1, \"price\": 400}\n    data[field] = value\n    with pytest.raises(ValidationError):\n        OrderRow(**data)\n\ndef test_summary_total():\n    rows = [OrderRow(order_id=1, email=\"a@x.com\", product=\"Tea\", qty=2, price=400),\n            OrderRow(order_id=2, email=\"b@x.com\", product=\"Laptop\", qty=1, price=55000)]\n    assert summarise(rows) == 55800",
   "test": true,
   "out": {
    "text": "......  [100%]\n6 passed in 0.07s"
   }
  }
 ],
 "mistakes": [
  "Stopping the whole import at the first bad row. Collect errors and keep going.",
  "Reporting errors without the row number. The client can't fix what they can't find.",
  "Putting everything in one long script. Split into load / validate / summarise / write so each piece can be tested."
 ],
 "practice": [
  {
   "q": "Extend the report: add the number of distinct customers (by email).",
   "a": "Add <code>\"customers\": len({r.email for r in rows})</code> to the dict returned by <code>summarise</code>."
  },
  {
   "q": "The client also wants a CSV of rejected rows. How would you write it?",
   "a": "Open <code>rejected.csv</code> with <code>csv.DictWriter(f, fieldnames=[\"line\", \"problems\"])</code>, call <code>writeheader()</code>, then <code>writerows(errors)</code>."
  },
  {
   "q": "Turn it into a command: <code>python3 report.py orders.csv</code>. What do you add?",
   "a": "A <code>main()</code> that reads the path from <code>sys.argv[1]</code> (or uses <code>argparse</code>), calls load → summarise → write, and <code>if __name__ == \"__main__\": main()</code> at the bottom."
  }
 ],
 "check": [
  [
   "Best way to handle one bad row in an import?",
   [
    "Stop everything",
    "Skip it silently",
    "Skip it, record the row number and reason, keep going",
    "Delete the file"
   ],
   2,
   "Collect errors and report them."
  ],
  [
   "Why split the script into small functions?",
   [
    "It runs faster",
    "Each piece can be tested and reused",
    "Python requires it",
    "No reason"
   ],
   1,
   "Small functions are testable."
  ],
  [
   "Where should validation happen?",
   [
    "At the end",
    "Where data enters your program",
    "Only in tests",
    "Nowhere"
   ],
   1,
   "Validate at the edges, then trust the data inside."
  ]
 ],
 "remember": [
  "Pipeline: load → validate (Pydantic) → transform → write → test.",
  "Bad rows: skip, record line number + reason, continue.",
  "Validate at the edge; inside, work with clean objects.",
  "Small functions = easy tests. Use parametrize for many bad inputs."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
