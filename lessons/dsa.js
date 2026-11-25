// Lessons for course "dsa". Built by tools/course-builder from tools/courses/dsa.js.
// Python examples were run and their real output stored.
(function (L) {
L["dsa:big-o"] = {
 "title": "Big-O: how fast does it grow?",
 "level": "Beginner",
 "one": "<b>Big-O</b> describes how the work grows as the input grows: O(1) constant, O(log n), O(n), O(n log n), O(n²). It lets you compare solutions without a stopwatch.",
 "why": "Every coding interview asks “what's the time and space complexity?”, and the right data structure can turn a 20-minute job into 2 seconds in real systems.",
 "steps": [
  {
   "h": "Counting steps",
   "p": [
    "Count how many basic steps run as n grows, and keep only the biggest term: 3n + 5 → O(n); n² + n → O(n²)."
   ],
   "code": "def count_steps(n):\n    linear = sum(1 for _ in range(n))                         # one loop\n    quadratic = sum(1 for _ in range(n) for _ in range(n))    # loop inside a loop\n    return linear, quadratic\n\nfor n in [10, 100, 1000]:\n    lin, quad = count_steps(n)\n    print(f\"n={n:5}: O(n) does {lin:>9,} steps, O(n^2) does {quad:>11,}\")",
   "out": {
    "text": "n=   10: O(n) does        10 steps, O(n^2) does         100\nn=  100: O(n) does       100 steps, O(n^2) does      10,000\nn= 1000: O(n) does     1,000 steps, O(n^2) does   1,000,000"
   }
  },
  {
   "h": "The common classes",
   "code": "import math\n\nprint(f\"{'n':>10} {'log n':>7} {'n log n':>12} {'n^2':>16}\")\nfor n in [10, 1_000, 1_000_000]:\n    print(f\"{n:>10,} {math.log2(n):>7.0f} {n * math.log2(n):>12,.0f} {n * n:>16,}\")",
   "p": [
    "O(1): dict lookup, list index. O(log n): binary search (halve each step). O(n): one pass. O(n log n): good sorting. O(n²): nested loops over the same data. O(2ⁿ): trying every subset (only tiny n)."
   ],
   "out": {
    "text": "         n   log n      n log n              n^2\n        10       3           33              100\n     1,000      10        9,966        1,000,000\n 1,000,000      20   19,931,569 1,000,000,000,000"
   }
  },
  {
   "h": "Feel the difference",
   "p": [
    "Checking “is x in this collection?” 10,000 times: a list scans every time (O(n) each), a set jumps straight there (O(1) each)."
   ],
   "code": "import time\n\nitems = list(range(20_000))\nas_set = set(items)\nqueries = range(10_000, 20_000)\n\nt = time.perf_counter(); sum(q in items for q in queries); list_ms = (time.perf_counter() - t) * 1000\nt = time.perf_counter(); sum(q in as_set for q in queries); set_ms = (time.perf_counter() - t) * 1000\nprint(f\"list: {list_ms:.0f} ms   set: {set_ms:.2f} ms\")",
   "out": {
    "text": "list: 789 ms   set: 0.42 ms"
   }
  },
  {
   "h": "Space complexity",
   "p": [
    "Extra memory counts too. Building a new list of n items is O(n) space; using two variables is O(1). Recursion uses stack space: depth n → O(n)."
   ]
  },
  {
   "h": "Python operations you should know",
   "code": "list:  index O(1) · append O(1) · pop() O(1) · pop(0)/insert(0, x) O(n) · x in list O(n) · sort O(n log n)\ndict:  get/set/delete O(1) average · x in dict O(1)\nset:   add/remove/in O(1) average · union/intersection O(n)\ndeque: append/appendleft/pop/popleft O(1)\nheapq: push/pop O(log n) · smallest item O(1)\nstr:   building with += in a loop can be O(n^2); use \"\".join(parts)",
   "lang": "text"
  }
 ],
 "mistakes": [
  "Saying O(2n) or O(n + 5): drop constants, write O(n).",
  "Missing hidden loops: <code>x in list</code>, <code>list.pop(0)</code> and slicing are O(n).",
  "Forgetting space complexity.",
  "Optimising before you have a correct solution."
 ],
 "practice": [
  {
   "q": "What's the complexity of this, and how would you make it O(n)?<br><code>for a in nums: for b in nums: if a + b == target: return True</code>",
   "a": "O(n²) time. Use a set: for each number, check if <code>target - num</code> was already seen, then add num. One pass: O(n) time, O(n) space (that's the Two Sum pattern)."
  },
  {
   "q": "Show that joining strings with <code>''.join</code> is faster than += in a loop for 200,000 pieces.",
   "code": "import time\nparts = [\"x\"] * 200_000\nt = time.perf_counter(); s = \"\"\nfor p in parts: s += p\na = time.perf_counter() - t\nt = time.perf_counter(); s2 = \"\".join(parts); b = time.perf_counter() - t\nprint(s == s2, f\"join is faster: {b < a}\")",
   "out": {
    "text": "True join is faster: True"
   }
  }
 ],
 "check": [
  [
   "Complexity of one loop over n items with a dict lookup inside?",
   [
    "O(1)",
    "O(n)",
    "O(n²)",
    "O(log n)"
   ],
   1,
   "n iterations × O(1) lookups."
  ],
  [
   "Binary search on a sorted list is…",
   [
    "O(n)",
    "O(log n)",
    "O(1)",
    "O(n²)"
   ],
   1,
   "It halves the range each step."
  ],
  [
   "Which is O(n) in Python?",
   [
    "dict lookup",
    "list.append",
    "x in list",
    "set.add"
   ],
   2,
   "A list membership test scans."
  ]
 ],
 "remember": [
  "Drop constants and small terms: 3n + 5 → O(n).",
  "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).",
  "dict/set lookups O(1); x in list O(n); sort O(n log n).",
  "Count space too (new lists, recursion depth).",
  "Correct first, then fast."
 ]
};
L["dsa:two-pointers"] = {
 "title": "Two pointers",
 "level": "Beginner+",
 "one": "Use <b>two indexes</b> that move through the data, often from both ends of a sorted array or one fast and one slow, to avoid nested loops.",
 "why": "Turns many O(n²) problems (pairs, palindromes, merging, removing duplicates) into O(n). It's one of the most common interview patterns.",
 "steps": [
  {
   "h": "Pair with a target sum (sorted input)",
   "p": [
    "Start at both ends. If the sum is too small, move the left pointer right; too big, move the right pointer left."
   ],
   "code": "def pair_with_sum(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        s = nums[lo] + nums[hi]\n        if s == target:\n            return nums[lo], nums[hi]\n        if s < target:\n            lo += 1\n        else:\n            hi -= 1\n    return None\n\nprint(pair_with_sum([1, 3, 4, 6, 8, 11], 10))\nprint(pair_with_sum([1, 2, 3], 100))",
   "out": {
    "text": "(4, 6)\nNone"
   }
  },
  {
   "h": "Palindrome check",
   "code": "def is_palindrome(s: str) -> bool:\n    chars = [c.lower() for c in s if c.isalnum()]\n    lo, hi = 0, len(chars) - 1\n    while lo < hi:\n        if chars[lo] != chars[hi]:\n            return False\n        lo, hi = lo + 1, hi - 1\n    return True\n\nfor s in [\"Malayalam\", \"A man, a plan, a canal: Panama\", \"Kochi\"]:\n    print(s, \"->\", is_palindrome(s))",
   "out": {
    "text": "Malayalam -> True\nA man, a plan, a canal: Panama -> True\nKochi -> False"
   }
  },
  {
   "h": "Slow and fast: remove duplicates in place",
   "p": [
    "In a sorted list, a slow pointer marks where the next unique value goes; a fast pointer scans. O(n) time, O(1) extra space."
   ],
   "code": "def dedupe_sorted(nums):\n    if not nums:\n        return 0\n    slow = 0\n    for fast in range(1, len(nums)):\n        if nums[fast] != nums[slow]:\n            slow += 1\n            nums[slow] = nums[fast]\n    return slow + 1\n\nnums = [1, 1, 2, 3, 3, 3, 7]\nk = dedupe_sorted(nums)\nprint(k, nums[:k])",
   "out": {
    "text": "4 [1, 2, 3, 7]"
   }
  },
  {
   "h": "Merging two sorted lists",
   "code": "def merge(a, b):\n    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    return out + a[i:] + b[j:]\n\nprint(merge([1, 4, 9], [2, 3, 10, 12]))",
   "note": "This is the heart of merge sort, and of merging two sorted exports (e.g. by date) in real data work.",
   "out": {
    "text": "[1, 2, 3, 4, 9, 10, 12]"
   }
  },
  {
   "h": "Tests",
   "code": "def pair_with_sum(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        s = nums[lo] + nums[hi]\n        if s == target: return nums[lo], nums[hi]\n        lo, hi = (lo + 1, hi) if s < target else (lo, hi - 1)\n    return None\n\ndef test_found():   assert pair_with_sum([1, 3, 4, 6, 8, 11], 10) in {(4, 6)}\ndef test_missing(): assert pair_with_sum([1, 2], 9) is None\ndef test_empty():   assert pair_with_sum([], 1) is None\ndef test_negative(): assert pair_with_sum([-5, -1, 2, 7], 1) == (-1, 2)",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.01s"
   }
  }
 ],
 "mistakes": [
  "Using the both-ends technique on unsorted data.",
  "Off-by-one: <code>while lo &lt; hi</code> vs <code>&lt;=</code>. Think about the middle element.",
  "Forgetting to move a pointer, causing an infinite loop."
 ],
 "practice": [
  {
   "q": "Reverse a list in place with two pointers.",
   "code": "def reverse(xs):\n    lo, hi = 0, len(xs) - 1\n    while lo < hi:\n        xs[lo], xs[hi] = xs[hi], xs[lo]\n        lo, hi = lo + 1, hi - 1\n    return xs\n\nprint(reverse([1, 2, 3, 4, 5]))",
   "out": {
    "text": "[5, 4, 3, 2, 1]"
   }
  },
  {
   "q": "Move all zeros to the end, keeping the order of other numbers, in place.",
   "code": "def move_zeros(nums):\n    slow = 0\n    for fast in range(len(nums)):\n        if nums[fast] != 0:\n            nums[slow], nums[fast] = nums[fast], nums[slow]\n            slow += 1\n    return nums\n\nprint(move_zeros([0, 1, 0, 3, 12]))",
   "out": {
    "text": "[1, 3, 12, 0, 0]"
   }
  }
 ],
 "check": [
  [
   "Two pointers from both ends usually needs…",
   [
    "Random data",
    "Sorted data",
    "A dict",
    "Recursion"
   ],
   1,
   "Order lets you decide which pointer to move."
  ],
  [
   "Complexity of pair_with_sum on sorted input?",
   [
    "O(n²)",
    "O(n)",
    "O(log n)",
    "O(1)"
   ],
   1,
   "Each step moves one pointer."
  ],
  [
   "Slow/fast pointers often give…",
   [
    "O(n) extra space",
    "O(1) extra space, in place",
    "O(n²) time",
    "Recursion"
   ],
   1,
   "Work in place."
  ]
 ],
 "remember": [
  "Sorted + pair/target → pointers at both ends.",
  "Slow/fast → in-place filtering, removing duplicates.",
  "Merge two sorted lists with two pointers: O(n + m).",
  "Watch loop conditions and always move a pointer."
 ]
};
L["dsa:hashing"] = {
 "title": "Hash maps and sets",
 "level": "Beginner+",
 "one": "A <b>dict</b> (hash map) and a <b>set</b> give O(1) average lookups. Many problems become one pass: “have I seen this before?” or “how many times?”.",
 "why": "Hash maps are the single most useful tool in coding interviews and in real code (deduplication, grouping, joins in memory, caches).",
 "steps": [
  {
   "h": "Two Sum (unsorted)",
   "p": [
    "For each number, check whether <code>target - number</code> was seen. Store value → index. O(n) time, O(n) space."
   ],
   "code": "def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return seen[target - x], i\n        seen[x] = i\n    return None\n\nprint(two_sum([8, 3, 11, 5, 2], 13))",
   "out": {
    "text": "(0, 3)"
   }
  },
  {
   "h": "Counting and grouping",
   "code": "from collections import Counter, defaultdict\n\nwords = [\"listen\", \"silent\", \"enlist\", \"google\", \"gogole\", \"cat\", \"act\", \"tac\"]\ngroups = defaultdict(list)\nfor w in words:\n    groups[\"\".join(sorted(w))].append(w)        # anagrams share a sorted key\nprint(list(groups.values()))\n\nprint(Counter(\"mississippi\").most_common(2))",
   "out": {
    "text": "[['listen', 'silent', 'enlist'], ['google', 'gogole'], ['cat', 'act', 'tac']]\n[('i', 4), ('s', 4)]"
   }
  },
  {
   "h": "Seen-set for duplicates and first repeats",
   "code": "def first_repeat(xs):\n    seen = set()\n    for x in xs:\n        if x in seen:\n            return x\n        seen.add(x)\n    return None\n\nprint(first_repeat([\"INV-3\", \"INV-7\", \"INV-1\", \"INV-7\", \"INV-3\"]))",
   "out": {
    "text": "INV-7"
   }
  },
  {
   "h": "Longest consecutive sequence (a classic)",
   "p": [
    "Put all numbers in a set; only start counting from numbers whose predecessor isn't in the set. Each number is visited a constant number of times: O(n)."
   ],
   "code": "def longest_consecutive(nums):\n    s = set(nums)\n    best = 0\n    for x in s:\n        if x - 1 not in s:                  # x starts a run\n            length = 1\n            while x + length in s:\n                length += 1\n            best = max(best, length)\n    return best\n\nprint(longest_consecutive([100, 4, 200, 1, 3, 2]))",
   "out": {
    "text": "4"
   }
  },
  {
   "h": "Tests",
   "code": "def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen: return seen[target - x], i\n        seen[x] = i\n    return None\n\ndef test_basic():     assert two_sum([2, 7, 11, 15], 9) == (0, 1)\ndef test_same_value(): assert two_sum([3, 3], 6) == (0, 1)\ndef test_none():      assert two_sum([1, 2, 3], 7) is None\ndef test_negatives(): assert two_sum([-3, 4, 3, 90], 0) == (0, 2)",
   "test": true,
   "out": {
    "text": "....  [100%]\n4 passed in 0.01s"
   }
  }
 ],
 "mistakes": [
  "Using a list for membership checks inside a loop (O(n²)).",
  "Using unhashable keys (lists) in dicts/sets; convert to tuples.",
  "In Two Sum, adding the current number before checking, so it pairs with itself."
 ],
 "practice": [
  {
   "q": "Return True if two strings are anagrams.",
   "code": "from collections import Counter\ndef is_anagram(a, b): return Counter(a) == Counter(b)\nprint(is_anagram(\"listen\", \"silent\"), is_anagram(\"rat\", \"car\"))",
   "out": {
    "text": "True False"
   }
  },
  {
   "q": "Given orders as (customer, amount), return the total per customer, sorted by total descending.",
   "code": "from collections import defaultdict\norders = [(\"asha\", 500), (\"ben\", 200), (\"asha\", 300), (\"chen\", 900)]\ntotals = defaultdict(int)\nfor c, amt in orders:\n    totals[c] += amt\nprint(sorted(totals.items(), key=lambda kv: -kv[1]))",
   "out": {
    "text": "[('chen', 900), ('asha', 800), ('ben', 200)]"
   }
  }
 ],
 "check": [
  [
   "Average cost of a dict lookup?",
   [
    "O(n)",
    "O(1)",
    "O(log n)",
    "O(n²)"
   ],
   1,
   "Hashing jumps to the bucket."
  ],
  [
   "Two Sum on unsorted data, best approach?",
   [
    "Nested loops",
    "One pass with a dict of seen values",
    "Sort then binary search only",
    "Recursion"
   ],
   1,
   "O(n)."
  ],
  [
   "Group anagrams by…",
   [
    "Length",
    "Their sorted letters as the key",
    "First letter",
    "Hash of the list"
   ],
   1,
   "Same letters → same key."
  ]
 ],
 "remember": [
  "dict/set: O(1) average lookup, insert, delete.",
  "“Seen before?” → set. “How many?” → Counter. “Group by” → defaultdict(list).",
  "Two Sum: check complement, then store.",
  "Keys must be hashable (tuples, not lists)."
 ]
};
L["dsa:sliding-window"] = {
 "title": "Sliding window",
 "level": "Intermediate",
 "one": "A <b>sliding window</b> keeps a range [left, right] over an array or string and moves it forward, updating a running total or count instead of recomputing from scratch.",
 "why": "Perfect for “longest/shortest/maximum sub-array or substring with a condition” problems, and for rolling metrics in real data (7-day averages, rate limits).",
 "steps": [
  {
   "h": "Fixed-size window: max sum of k in a row",
   "p": [
    "Add the new element, remove the one that slid out. O(n) instead of O(n·k)."
   ],
   "code": "def max_sum_k(nums, k):\n    window = sum(nums[:k])\n    best = window\n    for i in range(k, len(nums)):\n        window += nums[i] - nums[i - k]\n        best = max(best, window)\n    return best\n\ndaily_sales = [120, 90, 300, 250, 80, 400, 50]\nprint(max_sum_k(daily_sales, 3))",
   "out": {
    "text": "730"
   }
  },
  {
   "h": "Variable window: longest substring without repeats",
   "p": [
    "Grow the right edge; when the condition breaks, shrink from the left until it holds again."
   ],
   "code": "def longest_unique(s):\n    last_seen, left, best = {}, 0, 0\n    for right, ch in enumerate(s):\n        if ch in last_seen and last_seen[ch] >= left:\n            left = last_seen[ch] + 1\n        last_seen[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nfor s in [\"abcabcbb\", \"bbbbb\", \"pwwkew\", \"\"]:\n    print(repr(s), longest_unique(s))",
   "out": {
    "text": "'abcabcbb' 3\n'bbbbb' 1\n'pwwkew' 3\n'' 0"
   }
  },
  {
   "h": "Shortest window with a sum ≥ target",
   "code": "def min_len_at_least(nums, target):\n    left, total, best = 0, 0, float(\"inf\")\n    for right, x in enumerate(nums):\n        total += x\n        while total >= target:\n            best = min(best, right - left + 1)\n            total -= nums[left]\n            left += 1\n    return 0 if best == float(\"inf\") else best\n\nprint(min_len_at_least([2, 3, 1, 2, 4, 3], 7))",
   "out": {
    "text": "2"
   }
  },
  {
   "h": "Real use: a rolling rate limiter",
   "p": [
    "Allow at most N requests in any rolling 60 seconds: keep timestamps in a deque and drop ones older than the window."
   ],
   "code": "from collections import deque\n\nclass RollingLimiter:\n    def __init__(self, limit, window_s):\n        self.limit, self.window_s, self.hits = limit, window_s, deque()\n    def allow(self, now):\n        while self.hits and now - self.hits[0] >= self.window_s:\n            self.hits.popleft()\n        if len(self.hits) < self.limit:\n            self.hits.append(now)\n            return True\n        return False\n\nrl = RollingLimiter(limit=3, window_s=60)\nprint([rl.allow(t) for t in [0, 10, 20, 30, 61, 75]])",
   "out": {
    "text": "[True, True, True, False, True, True]"
   }
  },
  {
   "h": "Tests",
   "code": "def longest_unique(s):\n    last, left, best = {}, 0, 0\n    for r, ch in enumerate(s):\n        if ch in last and last[ch] >= left: left = last[ch] + 1\n        last[ch] = r\n        best = max(best, r - left + 1)\n    return best\n\nimport pytest\n@pytest.mark.parametrize(\"s, n\", [(\"abcabcbb\", 3), (\"bbbbb\", 1), (\"pwwkew\", 3), (\"\", 0), (\"abba\", 2)])\ndef test_longest_unique(s, n):\n    assert longest_unique(s) == n",
   "test": true,
   "out": {
    "text": ".....  [100%]\n5 passed in 0.01s"
   }
  }
 ],
 "mistakes": [
  "Recomputing the whole window each step (O(n·k)).",
  "Forgetting to shrink from the left in variable windows.",
  "Off-by-one in window length: right - left + 1."
 ],
 "practice": [
  {
   "q": "Max average of any 4 consecutive days.",
   "code": "def max_avg(nums, k):\n    w = best = sum(nums[:k])\n    for i in range(k, len(nums)):\n        w += nums[i] - nums[i - k]\n        best = max(best, w)\n    return best / k\n\nprint(max_avg([1, 12, -5, -6, 50, 3], 4))",
   "out": {
    "text": "12.75"
   }
  },
  {
   "q": "Longest substring with at most 2 different characters.",
   "code": "from collections import defaultdict\ndef longest_two(s):\n    count, left, best = defaultdict(int), 0, 0\n    for right, ch in enumerate(s):\n        count[ch] += 1\n        while len(count) > 2:\n            count[s[left]] -= 1\n            if count[s[left]] == 0: del count[s[left]]\n            left += 1\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest_two(\"eceba\"), longest_two(\"ccaabbb\"))",
   "out": {
    "text": "3 5"
   }
  }
 ],
 "check": [
  [
   "Sliding window turns O(n·k) into…",
   [
    "O(n²)",
    "O(n)",
    "O(log n)",
    "O(k²)"
   ],
   1,
   "Update instead of recompute."
  ],
  [
   "In a variable window, when the condition breaks you…",
   [
    "Restart",
    "Shrink from the left",
    "Grow the right",
    "Sort"
   ],
   1,
   "Move left until valid."
  ],
  [
   "Window length from left and right indexes?",
   [
    "right - left",
    "right - left + 1",
    "left - right",
    "right + left"
   ],
   1,
   "Both ends inclusive."
  ]
 ],
 "remember": [
  "Fixed window: add new, subtract old.",
  "Variable window: grow right; while invalid, shrink left.",
  "Length = right − left + 1.",
  "Rolling limits: deque of timestamps."
 ]
};
L["dsa:prefix-sorting"] = {
 "title": "Prefix sums and sorting tricks",
 "level": "Intermediate",
 "one": "A <b>prefix sum</b> array answers “sum of any range” in O(1) after one pass. <b>Sorting</b> first (O(n log n)) often makes the rest of a problem easy: intervals, meetings, closest pairs.",
 "why": "Range totals, overlapping bookings and merging time ranges appear constantly in business software and interviews.",
 "steps": [
  {
   "h": "Prefix sums",
   "p": [
    "<code>prefix[i]</code> = sum of the first i items. Sum of items i..j = <code>prefix[j+1] - prefix[i]</code>."
   ],
   "code": "from itertools import accumulate\n\nsales = [120, 90, 300, 250, 80, 400, 50]\nprefix = [0] + list(accumulate(sales))\n\ndef range_sum(i, j):\n    return prefix[j + 1] - prefix[i]\n\nprint(prefix)\nprint(\"days 2-4:\", range_sum(2, 4))",
   "out": {
    "text": "[0, 120, 210, 510, 760, 840, 1240, 1290]\ndays 2-4: 630"
   }
  },
  {
   "h": "Subarrays that sum to k",
   "p": [
    "Count how many contiguous runs sum to k, using prefix sums in a dict: O(n)."
   ],
   "code": "from collections import defaultdict\n\ndef count_subarrays(nums, k):\n    seen = defaultdict(int)\n    seen[0] = 1\n    total = count = 0\n    for x in nums:\n        total += x\n        count += seen[total - k]\n        seen[total] += 1\n    return count\n\nprint(count_subarrays([1, 2, 3, -2, 2, 1], 3))",
   "out": {
    "text": "5"
   }
  },
  {
   "h": "Merge overlapping intervals",
   "p": [
    "Sort by start, then merge each interval into the last one if they overlap."
   ],
   "code": "def merge_intervals(intervals):\n    out = []\n    for start, end in sorted(intervals):\n        if out and start <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], end)\n        else:\n            out.append([start, end])\n    return out\n\nbookings = [(9, 11), (13, 14), (10, 12), (14, 16), (18, 19)]\nprint(merge_intervals(bookings))",
   "out": {
    "text": "[[9, 12], [13, 16], [18, 19]]"
   }
  },
  {
   "h": "Meeting rooms needed",
   "p": [
    "Sort start and end times separately and sweep: a start needs a room, an end frees one."
   ],
   "code": "def rooms_needed(meetings):\n    starts = sorted(s for s, _ in meetings)\n    ends = sorted(e for _, e in meetings)\n    rooms = best = j = 0\n    for s in starts:\n        while j < len(ends) and ends[j] <= s:\n            rooms -= 1; j += 1\n        rooms += 1\n        best = max(best, rooms)\n    return best\n\nprint(rooms_needed([(9, 10), (9.5, 11), (10, 12), (11, 12.5)]))",
   "out": {
    "text": "2"
   }
  },
  {
   "h": "Custom sort keys",
   "code": "orders = [{\"id\": 3, \"priority\": 2, \"date\": \"2025-07-03\"},\n          {\"id\": 1, \"priority\": 1, \"date\": \"2025-07-05\"},\n          {\"id\": 2, \"priority\": 1, \"date\": \"2025-07-01\"}]\nprint([o[\"id\"] for o in sorted(orders, key=lambda o: (o[\"priority\"], o[\"date\"]))])\nprint([o[\"id\"] for o in sorted(orders, key=lambda o: (-o[\"priority\"], o[\"date\"]))])",
   "out": {
    "text": "[2, 1, 3]\n[3, 2, 1]"
   }
  }
 ],
 "mistakes": [
  "Off-by-one in prefix arrays: keep a leading 0.",
  "Merging intervals without sorting first.",
  "Treating touching intervals (10–12 and 12–14) inconsistently: decide if they overlap."
 ],
 "practice": [
  {
   "q": "Find the index where the sum of the left side equals the sum of the right side (pivot index).",
   "code": "def pivot_index(nums):\n    total, left = sum(nums), 0\n    for i, x in enumerate(nums):\n        if left == total - left - x:\n            return i\n        left += x\n    return -1\n\nprint(pivot_index([1, 7, 3, 6, 5, 6]))",
   "out": {
    "text": "3"
   }
  },
  {
   "q": "Insert a new booking (12, 15) into [(9, 11), (13, 14), (16, 18)] and merge.",
   "code": "def merge(iv):\n    out = []\n    for s, e in sorted(iv):\n        if out and s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)\n        else: out.append([s, e])\n    return out\n\nprint(merge([(9, 11), (13, 14), (16, 18), (12, 15)]))",
   "out": {
    "text": "[[9, 11], [12, 15], [16, 18]]"
   }
  }
 ],
 "check": [
  [
   "Sum of range i..j with prefix sums?",
   [
    "prefix[j] - prefix[i]",
    "prefix[j+1] - prefix[i]",
    "prefix[i] + prefix[j]",
    "sum(nums)"
   ],
   1,
   "Leading 0 makes this work."
  ],
  [
   "First step to merge intervals?",
   [
    "Reverse",
    "Sort by start",
    "Use a set",
    "Binary search"
   ],
   1,
   "Then one pass."
  ],
  [
   "Complexity of sort + one pass?",
   [
    "O(n)",
    "O(n log n)",
    "O(n²)",
    "O(log n)"
   ],
   1,
   "Sorting dominates."
  ]
 ],
 "remember": [
  "prefix = [0] + accumulate(nums); range sum = prefix[j+1] − prefix[i].",
  "Subarray sum = k: prefix sums in a dict.",
  "Intervals: sort by start, merge into the last.",
  "Rooms: sort starts and ends, sweep.",
  "Sort keys with tuples; negate for descending."
 ]
};
L["dsa:practice-1"] = {
 "title": "Practice set 1: arrays, hashing and windows",
 "level": "Interview",
 "one": "Five classic problems that use the first patterns: hashing, two pointers, sliding window and prefix sums. Try each before reading the solution, then check it with the tests.",
 "why": "Patterns stick when you apply them to new problems. These five come up again and again in screens.",
 "steps": [
  {
   "h": "1. Contains duplicate within k positions",
   "code": "def nearby_duplicate(nums, k):\n    last = {}\n    for i, x in enumerate(nums):\n        if x in last and i - last[x] <= k:\n            return True\n        last[x] = i\n    return False\n\ndef test_nearby():\n    assert nearby_duplicate([1, 2, 3, 1], 3)\n    assert not nearby_duplicate([1, 2, 3, 1, 2, 3], 2)",
   "test": true,
   "p": [
    "Hashing: remember the last index of each value. O(n)."
   ],
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  },
  {
   "h": "2. Product of array except self (no division)",
   "code": "def product_except_self(nums):\n    n = len(nums)\n    out = [1] * n\n    left = 1\n    for i in range(n):\n        out[i] = left\n        left *= nums[i]\n    right = 1\n    for i in range(n - 1, -1, -1):\n        out[i] *= right\n        right *= nums[i]\n    return out\n\ndef test_product():\n    assert product_except_self([1, 2, 3, 4]) == [24, 12, 8, 6]\n    assert product_except_self([2, 0, 3]) == [0, 6, 0]",
   "test": true,
   "p": [
    "Prefix products from the left and right. O(n) time, O(1) extra space besides the output."
   ],
   "out": {
    "text": ".  [100%]\n1 passed in 0.01s"
   }
  },
  {
   "h": "3. Container with most water",
   "code": "def max_area(heights):\n    lo, hi, best = 0, len(heights) - 1, 0\n    while lo < hi:\n        best = max(best, (hi - lo) * min(heights[lo], heights[hi]))\n        if heights[lo] < heights[hi]:\n            lo += 1\n        else:\n            hi -= 1\n    return best\n\ndef test_area():\n    assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49\n    assert max_area([1, 1]) == 1",
   "test": true,
   "p": [
    "Two pointers: always move the shorter side, because the area is limited by it."
   ],
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  },
  {
   "h": "4. Top k frequent elements",
   "code": "from collections import Counter\nimport heapq\n\ndef top_k(nums, k):\n    counts = Counter(nums)\n    return [x for x, _ in heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])]\n\ndef test_top_k():\n    assert top_k([1, 1, 1, 2, 2, 3], 2) == [1, 2]\n    assert top_k([\"tea\", \"coffee\", \"tea\"], 1) == [\"tea\"]",
   "test": true,
   "p": [
    "Count with a dict, then take the k biggest with a heap: O(n log k)."
   ],
   "out": {
    "text": ".  [100%]\n1 passed in 0.01s"
   }
  },
  {
   "h": "5. Minimum window substring",
   "code": "from collections import Counter\n\ndef min_window(s, t):\n    need, missing = Counter(t), len(t)\n    left = start = 0\n    best_len = float(\"inf\")\n    for right, ch in enumerate(s):\n        if need[ch] > 0:\n            missing -= 1\n        need[ch] -= 1\n        while missing == 0:\n            if right - left + 1 < best_len:\n                start, best_len = left, right - left + 1\n            need[s[left]] += 1\n            if need[s[left]] > 0:\n                missing += 1\n            left += 1\n    return \"\" if best_len == float(\"inf\") else s[start:start + best_len]\n\ndef test_min_window():\n    assert min_window(\"ADOBECODEBANC\", \"ABC\") == \"BANC\"\n    assert min_window(\"a\", \"aa\") == \"\"",
   "test": true,
   "p": [
    "Variable sliding window with counts. A hard-level classic; walk through it slowly."
   ],
   "out": {
    "text": ".  [100%]\n1 passed in 0.02s"
   }
  }
 ],
 "mistakes": [
  "Jumping to code without naming the pattern first.",
  "Not testing edge cases: empty input, one element, all equal, negatives.",
  "Forgetting to state complexity."
 ],
 "practice": [
  {
   "q": "Best time to buy and sell a stock once: max profit from a list of daily prices.",
   "code": "def max_profit(prices):\n    lowest, best = float(\"inf\"), 0\n    for p in prices:\n        lowest = min(lowest, p)\n        best = max(best, p - lowest)\n    return best\n\nprint(max_profit([7, 1, 5, 3, 6, 4]), max_profit([7, 6, 4, 3, 1]))",
   "out": {
    "text": "5 0"
   }
  },
  {
   "q": "Which pattern fits? (a) longest run of days with sales above 100 (b) does any pair of invoices sum to the payment amount (c) total sales for any date range, asked thousands of times",
   "a": "(a) Sliding window (or a simple run counter). (b) Hashing (Two Sum). (c) Prefix sums."
  }
 ],
 "check": [
  [
   "Max profit from one buy and one sell is…",
   [
    "O(n²) at best",
    "O(n): track the lowest price so far",
    "O(log n)",
    "Impossible"
   ],
   1,
   "One pass."
  ],
  [
   "Container with most water: which pointer moves?",
   [
    "The taller one",
    "The shorter one",
    "Both",
    "Random"
   ],
   1,
   "The short side limits area."
  ],
  [
   "Top k frequent with a heap is…",
   [
    "O(n²)",
    "O(n log k)",
    "O(1)",
    "O(k²)"
   ],
   1,
   "Count, then heap of size k."
  ]
 ],
 "remember": [
  "Name the pattern first: hashing, two pointers, window, prefix.",
  "Test empty, single, duplicates, negatives.",
  "Say complexity for every solution."
 ]
};
L["dsa:stacks-queues"] = {
 "title": "Stacks and queues",
 "level": "Intermediate",
 "one": "A <b>stack</b> is last-in-first-out (use a list: append/pop). A <b>queue</b> is first-in-first-out (use <code>collections.deque</code>). Stacks handle nesting and “next greater”; queues handle order and BFS.",
 "why": "Brackets, undo history, expression parsing, task processing and breadth-first search all use these. They're simple and appear in many interview problems.",
 "steps": [
  {
   "h": "Valid brackets with a stack",
   "code": "def balanced(s):\n    pairs = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    stack = []\n    for ch in s:\n        if ch in \"([{\":\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack\n\nfor s in [\"{[()()]}\", \"([)]\", \"((\", \"\"]:\n    print(repr(s), balanced(s))",
   "out": {
    "text": "'{[()()]}' True\n'([)]' False\n'((' False\n'' True"
   }
  },
  {
   "h": "Queue with deque",
   "p": [
    "<code>list.pop(0)</code> is O(n); <code>deque.popleft()</code> is O(1)."
   ],
   "code": "from collections import deque\n\ntasks = deque([\"email asha\", \"sync order 6\", \"send invoice\"])\ntasks.append(\"backup db\")\nwhile tasks:\n    print(\"doing:\", tasks.popleft())",
   "out": {
    "text": "doing: email asha\ndoing: sync order 6\ndoing: send invoice\ndoing: backup db"
   }
  },
  {
   "h": "Monotonic stack: next warmer day",
   "p": [
    "For each day, how many days until a warmer one? Keep a stack of days still waiting; pop them when a warmer day arrives. O(n)."
   ],
   "code": "def days_until_warmer(temps):\n    out = [0] * len(temps)\n    stack = []                              # indexes, temperatures decreasing\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            out[j] = i - j\n        stack.append(i)\n    return out\n\nprint(days_until_warmer([30, 31, 29, 28, 33, 30, 34]))",
   "out": {
    "text": "[1, 3, 2, 1, 2, 1, 0]"
   }
  },
  {
   "h": "Min stack: O(1) minimum",
   "code": "class MinStack:\n    def __init__(self):\n        self.items, self.mins = [], []\n    def push(self, x):\n        self.items.append(x)\n        self.mins.append(min(x, self.mins[-1]) if self.mins else x)\n    def pop(self):\n        self.mins.pop()\n        return self.items.pop()\n    def min(self):\n        return self.mins[-1]\n\ns = MinStack()\nfor x in [5, 3, 7, 2]:\n    s.push(x)\nprint(s.min()); s.pop(); print(s.min())",
   "out": {
    "text": "2\n3"
   }
  },
  {
   "h": "Evaluate reverse Polish notation",
   "code": "def rpn(tokens):\n    stack = []\n    ops = {\"+\": lambda a, b: a + b, \"-\": lambda a, b: a - b,\n           \"*\": lambda a, b: a * b, \"/\": lambda a, b: int(a / b)}\n    for t in tokens:\n        if t in ops:\n            b, a = stack.pop(), stack.pop()\n            stack.append(ops[t](a, b))\n        else:\n            stack.append(int(t))\n    return stack[0]\n\nprint(rpn([\"2\", \"1\", \"+\", \"3\", \"*\"]), rpn([\"4\", \"13\", \"5\", \"/\", \"+\"]))",
   "out": {
    "text": "9 6"
   }
  }
 ],
 "mistakes": [
  "Using list.pop(0) as a queue (O(n) each time).",
  "Popping from an empty stack: check first.",
  "Forgetting to check the stack is empty at the end (unclosed brackets)."
 ],
 "practice": [
  {
   "q": "Simplify a Unix path like <code>/a/./b/../../c/</code>.",
   "code": "def simplify(path):\n    stack = []\n    for part in path.split(\"/\"):\n        if part == \"..\":\n            if stack: stack.pop()\n        elif part and part != \".\":\n            stack.append(part)\n    return \"/\" + \"/\".join(stack)\n\nprint(simplify(\"/a/./b/../../c/\"), simplify(\"/../\"))",
   "out": {
    "text": "/c /"
   }
  },
  {
   "q": "Implement a queue using two stacks.",
   "code": "class Queue:\n    def __init__(self): self.inbox, self.outbox = [], []\n    def push(self, x): self.inbox.append(x)\n    def pop(self):\n        if not self.outbox:\n            while self.inbox: self.outbox.append(self.inbox.pop())\n        return self.outbox.pop()\n\nq = Queue()\nfor x in [1, 2, 3]: q.push(x)\nprint(q.pop(), q.pop()); q.push(4); print(q.pop(), q.pop())",
   "out": {
    "text": "1 2\n3 4"
   }
  }
 ],
 "check": [
  [
   "Stack order?",
   [
    "FIFO",
    "LIFO",
    "Random",
    "Sorted"
   ],
   1,
   "Last in, first out."
  ],
  [
   "Best Python queue?",
   [
    "list with pop(0)",
    "collections.deque",
    "dict",
    "set"
   ],
   1,
   "O(1) at both ends."
  ],
  [
   "“Next greater element” problems use…",
   [
    "A queue",
    "A monotonic stack",
    "Sorting",
    "A heap"
   ],
   1,
   "Pop smaller items when a bigger one arrives."
  ]
 ],
 "remember": [
  "Stack = list (append/pop): nesting, undo, next-greater.",
  "Queue = deque (append/popleft): order, BFS.",
  "Monotonic stack keeps items in increasing/decreasing order.",
  "Check for empty before popping."
 ]
};
L["dsa:linked-lists"] = {
 "title": "Linked lists",
 "level": "Intermediate",
 "one": "A <b>linked list</b> is a chain of nodes, each holding a value and a pointer to the next. Inserting or removing at a known node is O(1); finding the i-th item is O(n).",
 "why": "Less common in everyday Python, but a staple of interviews: they test careful pointer handling. The fast/slow pointer tricks are worth knowing.",
 "steps": [
  {
   "h": "A node and a list",
   "code": "class Node:\n    def __init__(self, val, next=None):\n        self.val, self.next = val, next\n\ndef from_list(xs):\n    head = None\n    for x in reversed(xs):\n        head = Node(x, head)\n    return head\n\ndef to_list(head):\n    out = []\n    while head:\n        out.append(head.val)\n        head = head.next\n    return out\n\nprint(to_list(from_list([1, 2, 3, 4])))",
   "out": {
    "text": "[1, 2, 3, 4]"
   }
  },
  {
   "h": "Reverse a linked list",
   "p": [
    "Walk the list, turning each arrow around. Three pointers: prev, current, next."
   ],
   "code": "def reverse(head):\n    prev = None\n    while head:\n        nxt = head.next\n        head.next = prev\n        prev, head = head, nxt\n    return prev\n\nprint(to_list(reverse(from_list([1, 2, 3, 4, 5]))))",
   "out": {
    "text": "[5, 4, 3, 2, 1]"
   }
  },
  {
   "h": "Fast and slow pointers",
   "p": [
    "Fast moves 2 steps, slow moves 1. When fast reaches the end, slow is in the middle. If there's a cycle, they eventually meet."
   ],
   "code": "def middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n    return slow.val\n\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast:\n            return True\n    return False\n\nprint(middle(from_list([1, 2, 3, 4, 5])))\nlooped = from_list([1, 2, 3, 4])\nlooped.next.next.next.next = looped.next          # 4 -> 2\nprint(has_cycle(from_list([1, 2, 3])), has_cycle(looped))",
   "out": {
    "text": "3\nFalse True"
   }
  },
  {
   "h": "Merge two sorted lists (with a dummy head)",
   "p": [
    "A <b>dummy</b> starting node removes special cases for the first element."
   ],
   "code": "def merge(a, b):\n    dummy = tail = Node(0)\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next\n\nprint(to_list(merge(from_list([1, 4, 9]), from_list([2, 3, 10]))))",
   "out": {
    "text": "[1, 2, 3, 4, 9, 10]"
   }
  },
  {
   "h": "Tests",
   "code": "class Node:\n    def __init__(self, val, next=None): self.val, self.next = val, next\ndef from_list(xs):\n    head = None\n    for x in reversed(xs): head = Node(x, head)\n    return head\ndef to_list(h):\n    out = []\n    while h: out.append(h.val); h = h.next\n    return out\ndef reverse(head):\n    prev = None\n    while head:\n        head.next, prev, head = prev, head, head.next\n    return prev\n\ndef test_reverse():       assert to_list(reverse(from_list([1, 2, 3]))) == [3, 2, 1]\ndef test_reverse_empty(): assert reverse(None) is None\ndef test_reverse_one():   assert to_list(reverse(from_list([7]))) == [7]",
   "test": true,
   "out": {
    "text": "...  [100%]\n3 passed in 0.01s"
   }
  }
 ],
 "mistakes": [
  "Losing the rest of the list by overwriting <code>next</code> before saving it.",
  "Not handling empty lists or one-node lists.",
  "Forgetting that Python lists and deques are usually better in real code."
 ],
 "practice": [
  {
   "q": "Remove the n-th node from the end in one pass (n is valid).",
   "code": "def remove_nth_from_end(head, n):\n    dummy = Node(0, head)\n    fast = slow = dummy\n    for _ in range(n + 1):\n        fast = fast.next\n    while fast:\n        fast, slow = fast.next, slow.next\n    slow.next = slow.next.next\n    return dummy.next\n\nprint(to_list(remove_nth_from_end(from_list([1, 2, 3, 4, 5]), 2)))",
   "out": {
    "text": "[1, 2, 3, 5]"
   }
  },
  {
   "q": "Why is accessing the 1,000th element slow in a linked list?",
   "a": "There's no index: you must follow 999 next-pointers from the head, so it's O(n). Arrays (Python lists) jump straight there in O(1)."
  }
 ],
 "check": [
  [
   "Finding the middle of a linked list in one pass uses…",
   [
    "Two passes only",
    "Fast and slow pointers",
    "A heap",
    "Sorting"
   ],
   1,
   "Fast moves twice as fast."
  ],
  [
   "Why use a dummy head node?",
   [
    "Speed",
    "Removes special cases at the start of the list",
    "Required",
    "Memory"
   ],
   1,
   "Simpler code."
  ],
  [
   "Reversing a linked list is…",
   [
    "O(n²)",
    "O(n) time, O(1) space",
    "O(log n)",
    "O(n) space"
   ],
   1,
   "One pass, in place."
  ]
 ],
 "remember": [
  "Node = value + next. Access by position is O(n).",
  "Reverse: prev/current/next, save next before overwriting.",
  "Fast/slow: middle, cycle detection, n-th from end.",
  "Dummy head simplifies inserts/merges; handle empty and single-node lists."
 ]
};
L["dsa:binary-search"] = {
 "title": "Binary search",
 "level": "Intermediate",
 "one": "On sorted data, <b>binary search</b> checks the middle and throws away half each time: O(log n). It also works on any yes/no condition that flips once (“first day the stock ran out”).",
 "why": "Searching a million items in 20 steps. Interviews love it because the boundaries are easy to get wrong; real systems use it in databases, logs and version bisecting.",
 "steps": [
  {
   "h": "Classic search",
   "code": "def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nnums = [3, 8, 15, 23, 42, 57, 91]\nprint(binary_search(nums, 42), binary_search(nums, 5))",
   "out": {
    "text": "4 -1"
   }
  },
  {
   "h": "Python's bisect",
   "p": [
    "The standard library does it for you: <code>bisect_left</code> gives the first position where x could go."
   ],
   "code": "import bisect\n\nprices = [120, 400, 900, 3000, 8000, 55000]\nprint(bisect.bisect_left(prices, 900))     # index of 900\nprint(bisect.bisect_left(prices, 1000))    # where 1000 would be inserted\nbudget = 5000\nprint(\"products under budget:\", bisect.bisect_right(prices, budget))",
   "out": {
    "text": "2\n3\nproducts under budget: 4"
   }
  },
  {
   "h": "Search on the answer: first true",
   "p": [
    "If a condition is false, false, …, true, true, binary search finds the first true. Example: the first version where a bug appeared (like <code>git bisect</code>)."
   ],
   "code": "def first_true(lo, hi, condition):\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if condition(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo\n\nbad_from = 137\nchecks = []\ndef is_bad(version):\n    checks.append(version)\n    return version >= bad_from\n\nprint(\"first bad version:\", first_true(1, 1000, is_bad), \"after\", len(checks), \"checks\")",
   "out": {
    "text": "first bad version: 137 after 10 checks"
   }
  },
  {
   "h": "Minimum capacity to ship in D days",
   "p": [
    "Search over the answer: the smallest truck capacity that ships all packages (in order) within D days. Check a capacity with a simple simulation."
   ],
   "code": "def can_ship(weights, days, cap):\n    needed, load = 1, 0\n    for w in weights:\n        if load + w > cap:\n            needed, load = needed + 1, 0\n        load += w\n    return needed <= days\n\ndef min_capacity(weights, days):\n    lo, hi = max(weights), sum(weights)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if can_ship(weights, days, mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo\n\nprint(min_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))",
   "out": {
    "text": "15"
   }
  },
  {
   "h": "Tests for boundaries",
   "code": "def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target: return mid\n        lo, hi = (mid + 1, hi) if nums[mid] < target else (lo, mid - 1)\n    return -1\n\ndef test_first_and_last():\n    assert binary_search([1, 3, 5], 1) == 0\n    assert binary_search([1, 3, 5], 5) == 2\ndef test_missing_and_empty():\n    assert binary_search([1, 3, 5], 4) == -1\n    assert binary_search([], 4) == -1",
   "test": true,
   "out": {
    "text": "..  [100%]\n2 passed in 0.01s"
   }
  }
 ],
 "mistakes": [
  "Using it on unsorted data.",
  "Infinite loops from wrong updates (lo = mid instead of mid + 1).",
  "Mixing up the two styles: <code>while lo &lt;= hi</code> with hi = mid − 1, or <code>while lo &lt; hi</code> with hi = mid.",
  "Not testing first, last, missing and empty."
 ],
 "practice": [
  {
   "q": "Integer square root without math.sqrt.",
   "code": "def isqrt(n):\n    lo, hi = 0, n\n    while lo < hi:\n        mid = (lo + hi + 1) // 2\n        if mid * mid <= n: lo = mid\n        else: hi = mid - 1\n    return lo\n\nprint(isqrt(15), isqrt(16), isqrt(0))",
   "out": {
    "text": "3 4 0"
   }
  },
  {
   "q": "Find the first and last position of 8 in [5, 7, 7, 8, 8, 10].",
   "code": "import bisect\nnums = [5, 7, 7, 8, 8, 10]\nl, r = bisect.bisect_left(nums, 8), bisect.bisect_right(nums, 8) - 1\nprint((l, r) if l < len(nums) and nums[l] == 8 else (-1, -1))",
   "out": {
    "text": "(3, 4)"
   }
  }
 ],
 "check": [
  [
   "Binary search needs…",
   [
    "Random data",
    "Sorted data or a monotonic yes/no condition",
    "A dict",
    "Recursion"
   ],
   1,
   "Something you can halve."
  ],
  [
   "Searching 1,000,000 sorted items takes about…",
   [
    "1,000,000 steps",
    "20 steps",
    "1,000 steps",
    "1 step"
   ],
   1,
   "log₂(1,000,000) ≈ 20."
  ],
  [
   "“First version with a bug” is…",
   [
    "Linear search only",
    "Binary search on a false…true condition",
    "Sorting",
    "A heap"
   ],
   1,
   "Like git bisect."
  ]
 ],
 "remember": [
  "Sorted → halve each step → O(log n).",
  "Two consistent styles: lo <= hi (hi = mid − 1) or lo < hi (hi = mid).",
  "bisect_left / bisect_right in Python.",
  "Search on the answer: find the first value where a check turns true.",
  "Test first, last, missing, empty."
 ]
};
L["dsa:recursion"] = {
 "title": "Recursion and backtracking",
 "level": "Intermediate",
 "one": "A <b>recursive</b> function calls itself on a smaller problem until it reaches a <b>base case</b>. <b>Backtracking</b> builds choices step by step and undoes them to try others: subsets, permutations, puzzles.",
 "why": "Trees, nested data (JSON, folders, org charts) and “all combinations” problems are naturally recursive. It's essential for the trees and graphs lessons.",
 "steps": [
  {
   "h": "Base case + smaller problem",
   "code": "def factorial(n):\n    if n <= 1:                 # base case\n        return 1\n    return n * factorial(n - 1)\n\ndef total_size(folder):        # nested data is naturally recursive\n    return folder.get(\"size\", 0) + sum(total_size(c) for c in folder.get(\"children\", []))\n\nprint(factorial(5))\nprint(total_size({\"size\": 10, \"children\": [{\"size\": 5}, {\"size\": 2, \"children\": [{\"size\": 7}]}]}))",
   "out": {
    "text": "120\n24"
   }
  },
  {
   "h": "Nested JSON: flatten keys",
   "code": "def flatten(obj, prefix=\"\"):\n    out = {}\n    if isinstance(obj, dict):\n        for k, v in obj.items():\n            out.update(flatten(v, f\"{prefix}{k}.\"))\n    elif isinstance(obj, list):\n        for i, v in enumerate(obj):\n            out.update(flatten(v, f\"{prefix}{i}.\"))\n    else:\n        out[prefix[:-1]] = obj\n    return out\n\norder = {\"id\": 6, \"customer\": {\"name\": \"Asha\", \"city\": \"Kochi\"}, \"items\": [{\"sku\": \"HP\", \"qty\": 2}]}\nprint(flatten(order))",
   "out": {
    "text": "{'id': 6, 'customer.name': 'Asha', 'customer.city': 'Kochi', 'items.0.sku': 'HP', 'items.0.qty': 2}"
   }
  },
  {
   "h": "Backtracking: all subsets",
   "p": [
    "Choose → explore → un-choose. Each element is either in or out: 2ⁿ subsets."
   ],
   "code": "def subsets(items):\n    out, current = [], []\n    def explore(i):\n        if i == len(items):\n            out.append(current[:])\n            return\n        current.append(items[i]); explore(i + 1); current.pop()    # with item i\n        explore(i + 1)                                              # without item i\n    explore(0)\n    return out\n\nprint(subsets([\"tea\", \"coffee\", \"milk\"]))",
   "out": {
    "text": "[['tea', 'coffee', 'milk'], ['tea', 'coffee'], ['tea', 'milk'], ['tea'], ['coffee', 'milk'], ['coffee'], ['milk'], []]"
   }
  },
  {
   "h": "Combination sum: pick items that hit a budget",
   "code": "def combos(prices, target):\n    out = []\n    def explore(start, remaining, chosen):\n        if remaining == 0:\n            out.append(chosen[:]); return\n        for i in range(start, len(prices)):\n            if prices[i] > remaining:\n                break                              # sorted, so stop early (pruning)\n            chosen.append(prices[i])\n            explore(i, remaining - prices[i], chosen)\n            chosen.pop()\n    explore(0, target, [])\n    return out\n\nprint(combos(sorted([2, 3, 6, 7]), 7))",
   "out": {
    "text": "[[2, 2, 3], [7]]"
   }
  },
  {
   "h": "Recursion depth and memoisation",
   "p": [
    "Python stops at about 1,000 nested calls (RecursionError). Deep problems need loops instead. When the same sub-problem repeats, cache results with <code>functools.cache</code> (memoisation), which leads into dynamic programming."
   ],
   "code": "from functools import cache\nimport time\n\ndef fib_slow(n): return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)\n\n@cache\ndef fib_fast(n): return n if n < 2 else fib_fast(n - 1) + fib_fast(n - 2)\n\nt = time.perf_counter(); fib_slow(27); slow = time.perf_counter() - t\nt = time.perf_counter(); fib_fast(27); fast = time.perf_counter() - t\nprint(fib_fast(27), f\"cached is {slow / fast:,.0f}x faster\")",
   "out": {
    "text": "196418 cached is 1,061x faster"
   }
  }
 ],
 "mistakes": [
  "No base case, or a base case that's never reached → infinite recursion.",
  "Forgetting to undo the choice in backtracking (the pop).",
  "Appending the same list object instead of a copy (<code>current[:]</code>).",
  "Deep recursion on large inputs; use loops or iterative versions."
 ],
 "practice": [
  {
   "q": "All permutations of [1, 2, 3].",
   "code": "def permutations(nums):\n    out = []\n    def explore(path, left):\n        if not left:\n            out.append(path); return\n        for i in range(len(left)):\n            explore(path + [left[i]], left[:i] + left[i + 1:])\n    explore([], nums)\n    return out\n\nprint(permutations([1, 2, 3]))",
   "out": {
    "text": "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]"
   }
  },
  {
   "q": "Count all the leaf values in a nested list like [1, [2, [3, 4]], 5].",
   "code": "def count_leaves(x):\n    return sum(count_leaves(i) for i in x) if isinstance(x, list) else 1\n\nprint(count_leaves([1, [2, [3, 4]], 5]))",
   "out": {
    "text": "5"
   }
  }
 ],
 "check": [
  [
   "Every recursive function needs…",
   [
    "A loop",
    "A base case",
    "A global",
    "A class"
   ],
   1,
   "Otherwise it never stops."
  ],
  [
   "Backtracking pattern?",
   [
    "Sort, search",
    "Choose, explore, un-choose",
    "Push, pop",
    "Hash, check"
   ],
   1,
   "Undo to try alternatives."
  ],
  [
   "Number of subsets of n items?",
   [
    "n",
    "n²",
    "2ⁿ",
    "n!"
   ],
   2,
   "Each item in or out."
  ]
 ],
 "remember": [
  "Base case + a smaller self-call.",
  "Great for nested data: JSON, folders, trees.",
  "Backtracking: choose → explore → un-choose; copy results.",
  "Prune early when a branch can't succeed.",
  "Watch depth (~1,000 in Python); cache repeated sub-problems."
 ]
};
L["dsa:trees"] = {
 "title": "Trees and binary search trees",
 "level": "Intermediate",
 "one": "A <b>tree</b> is nodes with children and no cycles. A <b>binary tree</b> has up to two children. Traverse it <b>depth-first</b> (recursion) or <b>breadth-first</b> (a queue, level by level).",
 "why": "Org charts, categories, file systems, HTML/JSON and database indexes are trees. Tree traversal questions are very common in interviews.",
 "steps": [
  {
   "h": "A binary tree and DFS orders",
   "code": "class T:\n    def __init__(self, val, left=None, right=None):\n        self.val, self.left, self.right = val, left, right\n\n#        8\n#      /   \\\n#     3     10\n#    / \\      \\\n#   1   6      14\nroot = T(8, T(3, T(1), T(6)), T(10, None, T(14)))\n\ndef inorder(n):  return inorder(n.left) + [n.val] + inorder(n.right) if n else []\ndef preorder(n): return [n.val] + preorder(n.left) + preorder(n.right) if n else []\nprint(\"in-order: \", inorder(root))\nprint(\"pre-order:\", preorder(root))",
   "note": "In-order on a binary search tree gives sorted values.",
   "out": {
    "text": "in-order:  [1, 3, 6, 8, 10, 14]\npre-order: [8, 3, 1, 6, 10, 14]"
   }
  },
  {
   "h": "Height and path sums",
   "code": "def height(n):\n    return 0 if n is None else 1 + max(height(n.left), height(n.right))\n\ndef has_path_sum(n, target):\n    if n is None:\n        return False\n    if not n.left and not n.right:\n        return n.val == target\n    return has_path_sum(n.left, target - n.val) or has_path_sum(n.right, target - n.val)\n\nprint(height(root), has_path_sum(root, 17), has_path_sum(root, 100))",
   "out": {
    "text": "3 True False"
   }
  },
  {
   "h": "BFS: level by level",
   "code": "from collections import deque\n\ndef levels(root):\n    out, q = [], deque([root] if root else [])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            n = q.popleft()\n            level.append(n.val)\n            q.extend(c for c in (n.left, n.right) if c)\n        out.append(level)\n    return out\n\nprint(levels(root))",
   "out": {
    "text": "[[8], [3, 10], [1, 6, 14]]"
   }
  },
  {
   "h": "Binary search tree: insert and search",
   "p": [
    "In a BST every left value is smaller and every right value larger, so search is O(height): O(log n) if balanced, O(n) if it degenerates into a line."
   ],
   "code": "class T:\n    def __init__(self, val): self.val, self.left, self.right = val, None, None\n\ndef insert(n, v):\n    if n is None: return T(v)\n    if v < n.val: n.left = insert(n.left, v)\n    else:         n.right = insert(n.right, v)\n    return n\n\ndef contains(n, v):\n    while n:\n        if v == n.val: return True\n        n = n.left if v < n.val else n.right\n    return False\n\nroot = None\nfor v in [8, 3, 10, 1, 6, 14]:\n    root = insert(root, v)\nprint(contains(root, 6), contains(root, 7))",
   "out": {
    "text": "True False"
   }
  },
  {
   "h": "Validate a BST",
   "code": "class T:\n    def __init__(self, val, left=None, right=None): self.val, self.left, self.right = val, left, right\n\ndef is_bst(n, lo=float(\"-inf\"), hi=float(\"inf\")):\n    if n is None:\n        return True\n    if not lo < n.val < hi:\n        return False\n    return is_bst(n.left, lo, n.val) and is_bst(n.right, n.val, hi)\n\ngood = T(8, T(3, T(1), T(6)), T(10))\nbad = T(8, T(3, T(1), T(9)), T(10))      # 9 is in the left subtree of 8\nprint(is_bst(good), is_bst(bad))",
   "note": "Checking only each node against its direct children isn't enough; pass the allowed range down.",
   "out": {
    "text": "True False"
   }
  }
 ],
 "mistakes": [
  "Forgetting the None (empty) case.",
  "Validating a BST by comparing only parent and child.",
  "Using recursion on very deep, unbalanced trees (stack depth).",
  "Mixing up DFS orders: in/pre/post."
 ],
 "practice": [
  {
   "q": "Return the maximum value at each level of the tree.",
   "code": "from collections import deque\ndef level_max(root):\n    out, q = [], deque([root])\n    while q:\n        out.append(max(n.val for n in q))\n        q = deque(c for n in q for c in (n.left, n.right) if c)\n    return out\n\nprint(level_max(root))",
   "out": {
    "text": "[8, 10, 14]"
   }
  },
  {
   "q": "Lowest common ancestor of 1 and 6 in the BST above (8, 3, 10, 1, 6, 14).",
   "code": "def lca(n, a, b):\n    while n:\n        if a < n.val and b < n.val: n = n.left\n        elif a > n.val and b > n.val: n = n.right\n        else: return n.val\n\nprint(lca(root, 1, 6), lca(root, 1, 14))",
   "out": {
    "text": "3 8"
   }
  }
 ],
 "check": [
  [
   "Level-by-level traversal uses…",
   [
    "A stack",
    "A queue (BFS)",
    "Sorting",
    "Binary search"
   ],
   1,
   "Breadth-first."
  ],
  [
   "In-order traversal of a BST gives…",
   [
    "Random order",
    "Sorted values",
    "Reverse insertion order",
    "Levels"
   ],
   1,
   "Left, node, right."
  ],
  [
   "Search in a balanced BST is…",
   [
    "O(n)",
    "O(log n)",
    "O(1)",
    "O(n²)"
   ],
   1,
   "Halves each step."
  ]
 ],
 "remember": [
  "DFS (recursion): pre/in/post order. BFS (queue): level by level.",
  "Always handle None.",
  "BST: left < node < right; search O(height).",
  "Validate a BST by passing (low, high) bounds down.",
  "Real trees: org charts, categories, folders, JSON."
 ]
};
L["dsa:graphs"] = {
 "title": "Graphs: BFS, DFS and shortest paths",
 "level": "Advanced",
 "one": "A <b>graph</b> is nodes connected by edges (roads, network links, dependencies, “follows”). Store it as an <b>adjacency list</b>; explore with <b>BFS</b> (shortest hops), <b>DFS</b> (reachability, cycles), <b>topological sort</b> (order with dependencies) and <b>Dijkstra</b> (weighted shortest paths).",
 "why": "Delivery routes, task dependencies, recommendation networks and permission chains are graphs. Graph questions are standard in mid-level interviews.",
 "steps": [
  {
   "h": "Adjacency list + BFS shortest hops",
   "code": "from collections import deque, defaultdict\n\nedges = [(\"Kochi\", \"Calicut\"), (\"Kochi\", \"Thrissur\"), (\"Thrissur\", \"Palakkad\"),\n         (\"Calicut\", \"Kannur\"), (\"Palakkad\", \"Coimbatore\"), (\"Thrissur\", \"Calicut\")]\ngraph = defaultdict(list)\nfor a, b in edges:\n    graph[a].append(b); graph[b].append(a)\n\ndef shortest_hops(start, goal):\n    q, prev = deque([start]), {start: None}\n    while q:\n        node = q.popleft()\n        if node == goal:\n            path = []\n            while node:\n                path.append(node); node = prev[node]\n            return path[::-1]\n        for nxt in graph[node]:\n            if nxt not in prev:\n                prev[nxt] = node; q.append(nxt)\n    return None\n\nprint(shortest_hops(\"Kannur\", \"Coimbatore\"))",
   "out": {
    "text": "['Kannur', 'Calicut', 'Thrissur', 'Palakkad', 'Coimbatore']"
   }
  },
  {
   "h": "DFS: count connected groups (islands)",
   "code": "grid = [\"11000\",\n        \"11010\",\n        \"00100\",\n        \"00011\"]\n\ndef islands(grid):\n    rows, cols, seen, count = len(grid), len(grid[0]), set(), 0\n    def dfs(r, c):\n        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == \"0\" or (r, c) in seen:\n            return\n        seen.add((r, c))\n        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n            dfs(r + dr, c + dc)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == \"1\" and (r, c) not in seen:\n                count += 1; dfs(r, c)\n    return count\n\nprint(islands(grid))",
   "out": {
    "text": "4"
   }
  },
  {
   "h": "Topological sort: order tasks with dependencies",
   "p": [
    "Kahn's algorithm: repeatedly take tasks with no remaining dependencies. If some are left over, there's a cycle."
   ],
   "code": "from collections import deque, defaultdict\n\ndeps = {\"deploy\": [\"build\", \"migrate\"], \"build\": [\"install\"], \"migrate\": [\"install\"], \"install\": [], \"test\": [\"build\"]}\n\ndef topo_order(deps):\n    indeg = {t: len(d) for t, d in deps.items()}\n    users = defaultdict(list)\n    for t, ds in deps.items():\n        for d in ds:\n            users[d].append(t)\n    q = deque(sorted(t for t, n in indeg.items() if n == 0))\n    order = []\n    while q:\n        t = q.popleft(); order.append(t)\n        for u in sorted(users[t]):\n            indeg[u] -= 1\n            if indeg[u] == 0:\n                q.append(u)\n    if len(order) != len(deps):\n        raise ValueError(\"cycle in dependencies\")\n    return order\n\nprint(topo_order(deps))",
   "out": {
    "text": "['install', 'build', 'migrate', 'test', 'deploy']"
   }
  },
  {
   "h": "Dijkstra: shortest path with weights",
   "p": [
    "With distances on edges, BFS isn't enough. Dijkstra always expands the closest unvisited node, using a heap. O((V + E) log V)."
   ],
   "code": "import heapq\n\nroads = {\"Kochi\": {\"Thrissur\": 75, \"Kottayam\": 65}, \"Thrissur\": {\"Palakkad\": 70, \"Calicut\": 120},\n         \"Kottayam\": {\"Thrissur\": 130}, \"Palakkad\": {\"Calicut\": 140}, \"Calicut\": {}}\n\ndef dijkstra(graph, start):\n    dist, heap = {start: 0}, [(0, start)]\n    while heap:\n        d, node = heapq.heappop(heap)\n        if d > dist.get(node, float(\"inf\")):\n            continue\n        for nxt, w in graph[node].items():\n            nd = d + w\n            if nd < dist.get(nxt, float(\"inf\")):\n                dist[nxt] = nd\n                heapq.heappush(heap, (nd, nxt))\n    return dist\n\nprint(dijkstra(roads, \"Kochi\"))",
   "out": {
    "text": "{'Kochi': 0, 'Thrissur': 75, 'Kottayam': 65, 'Palakkad': 145, 'Calicut': 195}"
   }
  }
 ],
 "mistakes": [
  "Forgetting the visited set: infinite loops on cycles.",
  "Using BFS for weighted shortest paths.",
  "Dijkstra with negative weights (it breaks; use Bellman-Ford).",
  "Recursion depth problems with DFS on huge graphs; use an explicit stack."
 ],
 "practice": [
  {
   "q": "Detect a cycle in a directed dependency graph using DFS colours.",
   "code": "def has_cycle(deps):\n    state = {}                                # 1 = visiting, 2 = done\n    def visit(n):\n        if state.get(n) == 1: return True\n        if state.get(n) == 2: return False\n        state[n] = 1\n        if any(visit(d) for d in deps.get(n, [])): return True\n        state[n] = 2\n        return False\n    return any(visit(n) for n in deps)\n\nprint(has_cycle({\"a\": [\"b\"], \"b\": [\"c\"], \"c\": []}), has_cycle({\"a\": [\"b\"], \"b\": [\"a\"]}))",
   "out": {
    "text": "False True"
   }
  },
  {
   "q": "Which algorithm? (a) fewest flight changes (b) cheapest route with prices (c) order to run DB migrations (d) are these two users connected?",
   "a": "(a) BFS (b) Dijkstra (c) Topological sort (d) BFS/DFS (or union-find for many queries)."
  }
 ],
 "check": [
  [
   "Shortest path counting hops (no weights)?",
   [
    "DFS",
    "BFS",
    "Sorting",
    "Binary search"
   ],
   1,
   "BFS explores in layers."
  ],
  [
   "Order tasks with dependencies?",
   [
    "Dijkstra",
    "Topological sort",
    "BFS only",
    "Heap sort"
   ],
   1,
   "And it detects cycles."
  ],
  [
   "Weighted shortest paths (non-negative)?",
   [
    "BFS",
    "Dijkstra",
    "DFS",
    "Two pointers"
   ],
   1,
   "A heap of closest nodes."
  ]
 ],
 "remember": [
  "Adjacency list: dict of node → neighbours.",
  "BFS: fewest hops. DFS: reachability, components, cycles.",
  "Topological sort (Kahn): dependencies order; leftover = cycle.",
  "Dijkstra: weighted, non-negative, heap.",
  "Always track visited."
 ]
};
L["dsa:heaps"] = {
 "title": "Heaps and priority queues",
 "level": "Intermediate",
 "one": "A <b>heap</b> always gives you the smallest (or largest) item in O(1) and adds/removes in O(log n). Python's <code>heapq</code> is a min-heap on a list.",
 "why": "Top-k lists, scheduling the next job, merging sorted streams and Dijkstra all use heaps. Very common in interviews and in real schedulers.",
 "steps": [
  {
   "h": "heapq basics",
   "code": "import heapq\n\ntasks = []\nheapq.heappush(tasks, (2, \"send invoices\"))\nheapq.heappush(tasks, (1, \"fix payment outage\"))\nheapq.heappush(tasks, (3, \"update docs\"))\nwhile tasks:\n    priority, name = heapq.heappop(tasks)\n    print(priority, name)",
   "note": "Tuples compare by the first item, so (priority, name) pops the most urgent first. For a max-heap, push negative numbers.",
   "out": {
    "text": "1 fix payment outage\n2 send invoices\n3 update docs"
   }
  },
  {
   "h": "Top k without sorting everything",
   "p": [
    "Keep a min-heap of size k: if a new item beats the smallest, replace it. O(n log k), great when n is huge and k small."
   ],
   "code": "import heapq, random\n\nrandom.seed(4)\norder_totals = [random.randint(100, 100_000) for _ in range(100_000)]\n\ndef top_k(nums, k):\n    heap = nums[:k]\n    heapq.heapify(heap)\n    for x in nums[k:]:\n        if x > heap[0]:\n            heapq.heapreplace(heap, x)\n    return sorted(heap, reverse=True)\n\nprint(top_k(order_totals, 5))\nprint(heapq.nlargest(5, order_totals))",
   "out": {
    "text": "[99999, 99998, 99994, 99992, 99992]\n[99999, 99998, 99994, 99992, 99992]"
   }
  },
  {
   "h": "Merge k sorted lists",
   "code": "import heapq\n\nbranch_sales = [[100, 300, 900], [50, 400], [200, 250, 1000]]\nprint(list(heapq.merge(*branch_sales)))\n\ndef merge_k(lists):\n    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]\n    heapq.heapify(heap)\n    out = []\n    while heap:\n        val, i, j = heapq.heappop(heap)\n        out.append(val)\n        if j + 1 < len(lists[i]):\n            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))\n    return out\n\nprint(merge_k(branch_sales))",
   "out": {
    "text": "[50, 100, 200, 250, 300, 400, 900, 1000]\n[50, 100, 200, 250, 300, 400, 900, 1000]"
   }
  },
  {
   "h": "Running median with two heaps",
   "p": [
    "Keep the lower half in a max-heap and the upper half in a min-heap; the median is at the tops."
   ],
   "code": "import heapq\n\nclass RunningMedian:\n    def __init__(self):\n        self.low, self.high = [], []          # low is a max-heap (negated)\n    def add(self, x):\n        heapq.heappush(self.low, -x)\n        heapq.heappush(self.high, -heapq.heappop(self.low))\n        if len(self.high) > len(self.low):\n            heapq.heappush(self.low, -heapq.heappop(self.high))\n    def median(self):\n        if len(self.low) > len(self.high):\n            return -self.low[0]\n        return (-self.low[0] + self.high[0]) / 2\n\nrm = RunningMedian()\nfor x in [5, 15, 1, 3, 8]:\n    rm.add(x)\n    print(x, \"->\", rm.median())",
   "out": {
    "text": "5 -> 5\n15 -> 10.0\n1 -> 5\n3 -> 4.0\n8 -> 5"
   }
  },
  {
   "h": "Scheduling: earliest deadline next",
   "code": "import heapq\n\njobs = [(\"report\", 17), (\"backup\", 9), (\"sync\", 12), (\"email\", 9)]\nheap = [(deadline, name) for name, deadline in jobs]\nheapq.heapify(heap)\nprint([heapq.heappop(heap)[1] for _ in range(len(jobs))])",
   "out": {
    "text": "['backup', 'email', 'sync', 'report']"
   }
  }
 ],
 "mistakes": [
  "Sorting the whole list for top-k when a heap of size k is enough.",
  "Forgetting Python's heapq is a min-heap; negate for max.",
  "Pushing items that can't be compared (add a tie-breaker index)."
 ],
 "practice": [
  {
   "q": "k-th largest element in a list.",
   "code": "import heapq\ndef kth_largest(nums, k): return heapq.nlargest(k, nums)[-1]\nprint(kth_largest([3, 2, 1, 5, 6, 4], 2))",
   "out": {
    "text": "5"
   }
  },
  {
   "q": "Return the k closest points to the origin.",
   "code": "import heapq\npts = [(1, 3), (-2, 2), (5, 8), (0, 1)]\nprint(heapq.nsmallest(2, pts, key=lambda p: p[0] ** 2 + p[1] ** 2))",
   "out": {
    "text": "[(0, 1), (-2, 2)]"
   }
  }
 ],
 "check": [
  [
   "Python heapq gives you…",
   [
    "The largest item",
    "The smallest item",
    "A sorted list",
    "A random item"
   ],
   1,
   "Min-heap; negate for max."
  ],
  [
   "Top 5 of 10 million items, best approach?",
   [
    "Sort everything",
    "Heap of size 5",
    "Binary search",
    "Two pointers"
   ],
   1,
   "O(n log k)."
  ],
  [
   "heappush/heappop cost?",
   [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)"
   ],
   1,
   "The heap rebalances."
  ]
 ],
 "remember": [
  "heapq = min-heap; push/pop O(log n), peek O(1).",
  "(priority, item) tuples; negate for max; add tie-breakers.",
  "Top k: heap of size k → O(n log k); nlargest/nsmallest.",
  "Merge k sorted lists; running median with two heaps."
 ]
};
L["dsa:dp-intro"] = {
 "title": "Dynamic programming",
 "level": "Advanced",
 "one": "<b>Dynamic programming (DP)</b> solves a problem by combining answers to smaller overlapping sub-problems, storing each answer once. Define the <b>state</b>, the <b>recurrence</b>, the <b>base cases</b>, then fill a table (or memoise).",
 "why": "DP questions are a classic of harder interviews, and the idea (don't recompute; build from smaller answers) appears in pricing, scheduling and text comparison (diffs).",
 "steps": [
  {
   "h": "Climbing stairs: the simplest DP",
   "p": [
    "Ways to reach step n taking 1 or 2 steps: ways(n) = ways(n−1) + ways(n−2). Keep only the last two values."
   ],
   "code": "def climb(n):\n    a, b = 1, 1                 # ways to reach step 0 and step 1\n    for _ in range(n - 1):\n        a, b = b, a + b\n    return b\n\nprint([climb(n) for n in range(1, 8)])",
   "out": {
    "text": "[1, 2, 3, 5, 8, 13, 21]"
   }
  },
  {
   "h": "Coin change: fewest coins",
   "p": [
    "State: <code>best[x]</code> = fewest coins to make x. Recurrence: best[x] = 1 + min(best[x − coin])."
   ],
   "code": "def fewest_coins(coins, amount):\n    best = [0] + [float(\"inf\")] * amount\n    for x in range(1, amount + 1):\n        for c in coins:\n            if c <= x:\n                best[x] = min(best[x], best[x - c] + 1)\n    return best[amount] if best[amount] != float(\"inf\") else -1\n\nprint(fewest_coins([1, 2, 5], 11), fewest_coins([2], 3), fewest_coins([1, 5, 10, 25], 63))",
   "out": {
    "text": "3 -1 6"
   }
  },
  {
   "h": "House robber: take or skip",
   "p": [
    "Choose houses (non-adjacent) to maximise money. At each house: skip it (keep the previous best) or take it (best from two back + this one)."
   ],
   "code": "def rob(money):\n    take = skip = 0\n    for m in money:\n        take, skip = skip + m, max(take, skip)\n    return max(take, skip)\n\nprint(rob([2, 7, 9, 3, 1]), rob([5, 1, 1, 5]))",
   "out": {
    "text": "12 10"
   }
  },
  {
   "h": "Longest common subsequence (how diffs work)",
   "p": [
    "A 2D table: <code>dp[i][j]</code> = LCS of the first i letters of a and first j of b."
   ],
   "code": "def lcs(a, b):\n    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\n    for i in range(1, len(a) + 1):\n        for j in range(1, len(b) + 1):\n            if a[i - 1] == b[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[-1][-1]\n\nprint(lcs(\"ABCBDAB\", \"BDCABA\"), lcs(\"invoice\", \"invoices\"))",
   "out": {
    "text": "4 7"
   }
  },
  {
   "h": "0/1 knapsack: best value within a limit",
   "p": [
    "Pick items (each once) to maximise value without exceeding weight. Go through capacities from high to low so each item is used once."
   ],
   "code": "def knapsack(items, capacity):\n    best = [0] * (capacity + 1)\n    for weight, value in items:\n        for c in range(capacity, weight - 1, -1):\n            best[c] = max(best[c], best[c - weight] + value)\n    return best[capacity]\n\nparcels = [(1, 1500), (3, 2000), (4, 3000)]    # (kg, revenue)\nprint(knapsack(parcels, 4))",
   "out": {
    "text": "3500"
   }
  }
 ],
 "mistakes": [
  "Starting with code before defining the state and recurrence in words.",
  "Wrong base cases (e.g. best[0] for coin change must be 0).",
  "Plain recursion without memoisation: exponential time.",
  "In 0/1 knapsack, looping capacity upwards (reuses items)."
 ],
 "practice": [
  {
   "q": "Count the ways to make an amount with coins (order doesn't matter).",
   "code": "def ways(coins, amount):\n    dp = [1] + [0] * amount\n    for c in coins:\n        for x in range(c, amount + 1):\n            dp[x] += dp[x - c]\n    return dp[amount]\n\nprint(ways([1, 2, 5], 5))",
   "out": {
    "text": "4"
   }
  },
  {
   "q": "Longest increasing subsequence length of [10, 9, 2, 5, 3, 7, 101, 18].",
   "code": "def lis(nums):\n    dp = [1] * len(nums)\n    for i in range(len(nums)):\n        for j in range(i):\n            if nums[j] < nums[i]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp, default=0)\n\nprint(lis([10, 9, 2, 5, 3, 7, 101, 18]))",
   "out": {
    "text": "4"
   }
  }
 ],
 "check": [
  [
   "DP works when sub-problems…",
   [
    "Never repeat",
    "Overlap and combine into the answer",
    "Are random",
    "Need sorting"
   ],
   1,
   "Store each sub-answer once."
  ],
  [
   "First step in a DP problem?",
   [
    "Write loops",
    "Define the state and recurrence in words",
    "Sort",
    "Use a heap"
   ],
   1,
   "Then base cases, then code."
  ],
  [
   "Coin change best[0] should be…",
   [
    "infinity",
    "0",
    "1",
    "-1"
   ],
   1,
   "Zero coins make zero."
  ]
 ],
 "remember": [
  "State → recurrence → base cases → order of filling → answer.",
  "Top-down (memoise) or bottom-up (table).",
  "Classics: stairs, coin change, house robber, LCS, knapsack, LIS.",
  "Often you only need the last row or last two values (O(1)/O(n) space)."
 ]
};
L["dsa:practice-2"] = {
 "title": "Practice set 2: mixed interview problems",
 "level": "Interview",
 "one": "Five mixed problems covering stacks, binary search, trees, graphs, heaps and DP. Name the pattern, solve, test, and state the complexity.",
 "why": "Real interviews don't tell you which lesson a problem comes from. Mixed practice trains you to recognise the pattern.",
 "steps": [
  {
   "h": "1. Search in a rotated sorted array (binary search)",
   "code": "def search_rotated(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] <= nums[mid]:                 # left half sorted\n            if nums[lo] <= target < nums[mid]: hi = mid - 1\n            else: lo = mid + 1\n        else:                                     # right half sorted\n            if nums[mid] < target <= nums[hi]: lo = mid + 1\n            else: hi = mid - 1\n    return -1\n\ndef test_rotated():\n    assert search_rotated([4, 5, 6, 7, 0, 1, 2], 0) == 4\n    assert search_rotated([4, 5, 6, 7, 0, 1, 2], 3) == -1\n    assert search_rotated([1], 1) == 0",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  },
  {
   "h": "2. Course schedule (graph cycle / topological sort)",
   "code": "from collections import defaultdict, deque\n\ndef can_finish(n, prereqs):\n    indeg, nxt = [0] * n, defaultdict(list)\n    for course, pre in prereqs:\n        nxt[pre].append(course); indeg[course] += 1\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    done = 0\n    while q:\n        c = q.popleft(); done += 1\n        for d in nxt[c]:\n            indeg[d] -= 1\n            if indeg[d] == 0: q.append(d)\n    return done == n\n\ndef test_courses():\n    assert can_finish(2, [(1, 0)])\n    assert not can_finish(2, [(1, 0), (0, 1)])",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  },
  {
   "h": "3. Largest rectangle in a histogram (monotonic stack)",
   "code": "def largest_rectangle(heights):\n    stack, best = [], 0\n    for i, h in enumerate(heights + [0]):\n        start = i\n        while stack and stack[-1][1] > h:\n            idx, height = stack.pop()\n            best = max(best, height * (i - idx))\n            start = idx\n        stack.append((start, h))\n    return best\n\ndef test_histogram():\n    assert largest_rectangle([2, 1, 5, 6, 2, 3]) == 10\n    assert largest_rectangle([2, 4]) == 4",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  },
  {
   "h": "4. Task scheduler with cooldown (counting / heap)",
   "code": "from collections import Counter\n\ndef least_interval(tasks, n):\n    counts = Counter(tasks).values()\n    top = max(counts)\n    tied = sum(1 for c in counts if c == top)\n    return max(len(tasks), (top - 1) * (n + 1) + tied)\n\ndef test_scheduler():\n    assert least_interval([\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], 2) == 8\n    assert least_interval([\"A\", \"B\", \"C\"], 2) == 3",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  },
  {
   "h": "5. Word break (DP)",
   "code": "def word_break(s, words):\n    words = set(words)\n    ok = [True] + [False] * len(s)\n    for i in range(1, len(s) + 1):\n        ok[i] = any(ok[j] and s[j:i] in words for j in range(i))\n    return ok[-1]\n\ndef test_word_break():\n    assert word_break(\"kochibiryani\", [\"kochi\", \"biryani\"])\n    assert not word_break(\"catsandog\", [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"])",
   "test": true,
   "out": {
    "text": ".  [100%]\n1 passed in 0.00s"
   }
  }
 ],
 "mistakes": [
  "Not saying the pattern out loud before coding.",
  "Skipping edge cases (single element, cycles, empty input).",
  "Forgetting complexity: rotated search O(log n), course schedule O(V + E), histogram O(n), scheduler O(n), word break O(n²)."
 ],
 "practice": [
  {
   "q": "Number of ways to decode a digit string where 1–26 map to A–Z (\"226\" → 3).",
   "code": "def decodings(s):\n    if not s or s[0] == \"0\": return 0\n    prev2, prev1 = 1, 1\n    for i in range(1, len(s)):\n        cur = prev1 if s[i] != \"0\" else 0\n        if 10 <= int(s[i - 1:i + 1]) <= 26:\n            cur += prev2\n        prev2, prev1 = prev1, cur\n    return prev1\n\nprint(decodings(\"226\"), decodings(\"06\"), decodings(\"11106\"))",
   "out": {
    "text": "3 0 2"
   }
  },
  {
   "q": "Make a weekly plan: one DSA problem a day from each pattern. How would you track it?",
   "a": "Make a list of patterns (hashing, two pointers, window, prefix, stack, linked list, binary search, recursion, trees, graphs, heaps, DP). Each day solve one problem from the next pattern; note the date, time taken and whether you needed a hint; revisit failed ones after 3 days and after a week."
  }
 ],
 "check": [
  [
   "Rotated sorted array search is…",
   [
    "O(n)",
    "O(log n)",
    "O(n²)",
    "O(1)"
   ],
   1,
   "One half is always sorted."
  ],
  [
   "Course schedule is really…",
   [
    "Sorting",
    "Cycle detection / topological sort",
    "Two pointers",
    "DP"
   ],
   1,
   "Dependencies graph."
  ],
  [
   "Word break is solved with…",
   [
    "A heap",
    "DP over prefixes",
    "BFS only",
    "Binary search"
   ],
   1,
   "ok[i] from earlier ok[j]."
  ]
 ],
 "remember": [
  "Recognise → name the pattern → plan → code → test → complexity.",
  "Mixed practice daily beats long sessions weekly.",
  "Revisit failed problems after a few days."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
