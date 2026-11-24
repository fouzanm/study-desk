// Lessons for course "python". Keys are "course:lessonId" (see catalog/topics.js).
(function (L) {
L["python:types-dataclasses"] = {
 "title": "Python refresh: types, dataclasses, exceptions",
 "one": "Outside Odoo, clean Python means: clear types, small data classes, and errors you handle on purpose.",
 "learn": [
  "<b>Type hints</b> say what a function takes and returns: <code>def total(prices: list[float]) -&gt; float</code>. They don't change how code runs, but make it easier to read and let tools catch mistakes.",
  "<b>dataclasses</b> give you a simple class for data without boilerplate: you list the fields and Python writes <code>__init__</code> and printing for you.",
  "<b>Exceptions</b>: catch only what you expect (<code>except ValueError</code>), never a bare <code>except:</code> that hides bugs. Raise clear errors with a message."
 ],
 "ex": "from dataclasses import dataclass\n\n@dataclass\nclass Invoice:\n    number: str\n    amount: float\n    paid: bool = False\n\ndef parse_amount(text: str) -> float:\n    try:\n        return float(text.replace(',', ''))\n    except ValueError:\n        raise ValueError(f'Not a valid amount: {text!r}')\n\ninv = Invoice('INV-1', parse_amount('1,250.50'))\nprint(inv)  # Invoice(number='INV-1', amount=1250.5, paid=False)",
 "try": "Write a dataclass <code>OrderLine</code> (product, qty, price) and a function <code>order_total(lines) -&gt; float</code> with type hints. Make it raise a clear error if qty is negative.",
 "remember": [
  "Type hints: say what goes in and comes out.",
  "@dataclass for simple data objects.",
  "Catch specific exceptions; never a bare except."
 ]
};

L["python:pydantic-async"] = {
 "title": "Modern Python: type hints, dataclasses, Pydantic, async",
 "one": "AI apps juggle lots of data and slow API calls. <b>Types</b> keep data clean; <b>async</b> keeps the app fast while it waits.",
 "learn": [
  "<b>Type hints</b>: <code>def ask(question: str) -&gt; str</code>. They document what goes in and out.",
  "<b>Pydantic</b>: describe data once, and it checks it for you. You'll use it to validate what users send and what the AI returns.",
  "<b>async/await</b>: an LLM call can take 5 seconds. With async, your server can handle other requests while waiting, instead of freezing."
 ],
 "ex": "from pydantic import BaseModel, Field\nimport asyncio\n\nclass Question(BaseModel):\n    text: str = Field(min_length=3)\n    user_id: int\n\nq = Question(text='What is our refund policy?', user_id=7)\n# Question(text='hi', user_id=7) would raise a clear validation error\n\nasync def slow_call(i: int) -> str:\n    await asyncio.sleep(1)          # pretend this is an API call\n    return f'answer {i}'\n\nasync def main():\n    results = await asyncio.gather(*(slow_call(i) for i in range(5)))\n    print(results)                  # finishes in ~1s, not 5s\n\nasyncio.run(main())",
 "try": "Make a Pydantic model <code>Ticket</code> (title, priority 1–5, email). Check it rejects priority 9.",
 "remember": [
  "Type hints document data; Pydantic enforces it.",
  "Validate everything: user input and AI output.",
  "async = do other work while waiting on slow calls."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
