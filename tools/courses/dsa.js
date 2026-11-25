// Data Structures & Algorithms. Every solution runs, with tests.
module.exports = [
{
 id: "big-o",
 title: "Big-O: how fast does it grow?",
 level: "Beginner",
 one: "<b>Big-O</b> describes how the work grows as the input grows: O(1) constant, O(log n), O(n), O(n log n), O(n²). It lets you compare solutions without a stopwatch.",
 why: "Every coding interview asks “what's the time and space complexity?”, and the right data structure can turn a 20-minute job into 2 seconds in real systems.",
 steps: [
  { h: "Counting steps",
    p: ["Count how many basic steps run as n grows, and keep only the biggest term: 3n + 5 → O(n); n² + n → O(n²)."],
    code: `def count_steps(n):
    linear = sum(1 for _ in range(n))                         # one loop
    quadratic = sum(1 for _ in range(n) for _ in range(n))    # loop inside a loop
    return linear, quadratic

for n in [10, 100, 1000]:
    lin, quad = count_steps(n)
    print(f"n={n:5}: O(n) does {lin:>9,} steps, O(n^2) does {quad:>11,}")` },
  { h: "The common classes",
    code: `import math

print(f"{'n':>10} {'log n':>7} {'n log n':>12} {'n^2':>16}")
for n in [10, 1_000, 1_000_000]:
    print(f"{n:>10,} {math.log2(n):>7.0f} {n * math.log2(n):>12,.0f} {n * n:>16,}")`,
    p: ["O(1): dict lookup, list index. O(log n): binary search (halve each step). O(n): one pass. O(n log n): good sorting. O(n²): nested loops over the same data. O(2ⁿ): trying every subset (only tiny n)."] },
  { h: "Feel the difference",
    p: ["Checking “is x in this collection?” 10,000 times: a list scans every time (O(n) each), a set jumps straight there (O(1) each)."],
    code: `import time

items = list(range(20_000))
as_set = set(items)
queries = range(10_000, 20_000)

t = time.perf_counter(); sum(q in items for q in queries); list_ms = (time.perf_counter() - t) * 1000
t = time.perf_counter(); sum(q in as_set for q in queries); set_ms = (time.perf_counter() - t) * 1000
print(f"list: {list_ms:.0f} ms   set: {set_ms:.2f} ms")` },
  { h: "Space complexity",
    p: ["Extra memory counts too. Building a new list of n items is O(n) space; using two variables is O(1). Recursion uses stack space: depth n → O(n)."] },
  { h: "Python operations you should know",
    code: `list:  index O(1) · append O(1) · pop() O(1) · pop(0)/insert(0, x) O(n) · x in list O(n) · sort O(n log n)
dict:  get/set/delete O(1) average · x in dict O(1)
set:   add/remove/in O(1) average · union/intersection O(n)
deque: append/appendleft/pop/popleft O(1)
heapq: push/pop O(log n) · smallest item O(1)
str:   building with += in a loop can be O(n^2); use "".join(parts)`, lang: "text" }
 ],
 mistakes: [
  "Saying O(2n) or O(n + 5): drop constants, write O(n).",
  "Missing hidden loops: <code>x in list</code>, <code>list.pop(0)</code> and slicing are O(n).",
  "Forgetting space complexity.",
  "Optimising before you have a correct solution."
 ],
 practice: [
  { q: "What's the complexity of this, and how would you make it O(n)?<br><code>for a in nums: for b in nums: if a + b == target: return True</code>", a: "O(n²) time. Use a set: for each number, check if <code>target - num</code> was already seen, then add num. One pass: O(n) time, O(n) space (that's the Two Sum pattern)." },
  { q: "Show that joining strings with <code>''.join</code> is faster than += in a loop for 200,000 pieces.", code: `import time
parts = ["x"] * 200_000
t = time.perf_counter(); s = ""
for p in parts: s += p
a = time.perf_counter() - t
t = time.perf_counter(); s2 = "".join(parts); b = time.perf_counter() - t
print(s == s2, f"join is faster: {b < a}")` }
 ],
 check: [
  ["Complexity of one loop over n items with a dict lookup inside?", ["O(1)", "O(n)", "O(n²)", "O(log n)"], 1, "n iterations × O(1) lookups."],
  ["Binary search on a sorted list is…", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 1, "It halves the range each step."],
  ["Which is O(n) in Python?", ["dict lookup", "list.append", "x in list", "set.add"], 2, "A list membership test scans."]
 ],
 remember: [
  "Drop constants and small terms: 3n + 5 → O(n).",
  "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).",
  "dict/set lookups O(1); x in list O(n); sort O(n log n).",
  "Count space too (new lists, recursion depth).",
  "Correct first, then fast."
 ]
},
{
 id: "two-pointers",
 title: "Two pointers",
 level: "Beginner+",
 one: "Use <b>two indexes</b> that move through the data, often from both ends of a sorted array or one fast and one slow, to avoid nested loops.",
 why: "Turns many O(n²) problems (pairs, palindromes, merging, removing duplicates) into O(n). It's one of the most common interview patterns.",
 steps: [
  { h: "Pair with a target sum (sorted input)",
    p: ["Start at both ends. If the sum is too small, move the left pointer right; too big, move the right pointer left."],
    code: `def pair_with_sum(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            return nums[lo], nums[hi]
        if s < target:
            lo += 1
        else:
            hi -= 1
    return None

print(pair_with_sum([1, 3, 4, 6, 8, 11], 10))
print(pair_with_sum([1, 2, 3], 100))` },
  { h: "Palindrome check",
    code: `def is_palindrome(s: str) -> bool:
    chars = [c.lower() for c in s if c.isalnum()]
    lo, hi = 0, len(chars) - 1
    while lo < hi:
        if chars[lo] != chars[hi]:
            return False
        lo, hi = lo + 1, hi - 1
    return True

for s in ["Malayalam", "A man, a plan, a canal: Panama", "Kochi"]:
    print(s, "->", is_palindrome(s))` },
  { h: "Slow and fast: remove duplicates in place",
    p: ["In a sorted list, a slow pointer marks where the next unique value goes; a fast pointer scans. O(n) time, O(1) extra space."],
    code: `def dedupe_sorted(nums):
    if not nums:
        return 0
    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1

nums = [1, 1, 2, 3, 3, 3, 7]
k = dedupe_sorted(nums)
print(k, nums[:k])` },
  { h: "Merging two sorted lists",
    code: `def merge(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    return out + a[i:] + b[j:]

print(merge([1, 4, 9], [2, 3, 10, 12]))`,
    note: "This is the heart of merge sort, and of merging two sorted exports (e.g. by date) in real data work." },
  { h: "Tests",
    code: `def pair_with_sum(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target: return nums[lo], nums[hi]
        lo, hi = (lo + 1, hi) if s < target else (lo, hi - 1)
    return None

def test_found():   assert pair_with_sum([1, 3, 4, 6, 8, 11], 10) in {(4, 6)}
def test_missing(): assert pair_with_sum([1, 2], 9) is None
def test_empty():   assert pair_with_sum([], 1) is None
def test_negative(): assert pair_with_sum([-5, -1, 2, 7], 1) == (-1, 2)`, test: true }
 ],
 mistakes: [
  "Using the both-ends technique on unsorted data.",
  "Off-by-one: <code>while lo &lt; hi</code> vs <code>&lt;=</code>. Think about the middle element.",
  "Forgetting to move a pointer, causing an infinite loop."
 ],
 practice: [
  { q: "Reverse a list in place with two pointers.", code: `def reverse(xs):
    lo, hi = 0, len(xs) - 1
    while lo < hi:
        xs[lo], xs[hi] = xs[hi], xs[lo]
        lo, hi = lo + 1, hi - 1
    return xs

print(reverse([1, 2, 3, 4, 5]))` },
  { q: "Move all zeros to the end, keeping the order of other numbers, in place.", code: `def move_zeros(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums

print(move_zeros([0, 1, 0, 3, 12]))` }
 ],
 check: [
  ["Two pointers from both ends usually needs…", ["Random data", "Sorted data", "A dict", "Recursion"], 1, "Order lets you decide which pointer to move."],
  ["Complexity of pair_with_sum on sorted input?", ["O(n²)", "O(n)", "O(log n)", "O(1)"], 1, "Each step moves one pointer."],
  ["Slow/fast pointers often give…", ["O(n) extra space", "O(1) extra space, in place", "O(n²) time", "Recursion"], 1, "Work in place."]
 ],
 remember: [
  "Sorted + pair/target → pointers at both ends.",
  "Slow/fast → in-place filtering, removing duplicates.",
  "Merge two sorted lists with two pointers: O(n + m).",
  "Watch loop conditions and always move a pointer."
 ]
},
{
 id: "hashing",
 title: "Hash maps and sets",
 level: "Beginner+",
 one: "A <b>dict</b> (hash map) and a <b>set</b> give O(1) average lookups. Many problems become one pass: “have I seen this before?” or “how many times?”.",
 why: "Hash maps are the single most useful tool in coding interviews and in real code (deduplication, grouping, joins in memory, caches).",
 steps: [
  { h: "Two Sum (unsorted)",
    p: ["For each number, check whether <code>target - number</code> was seen. Store value → index. O(n) time, O(n) space."],
    code: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return seen[target - x], i
        seen[x] = i
    return None

print(two_sum([8, 3, 11, 5, 2], 13))` },
  { h: "Counting and grouping",
    code: `from collections import Counter, defaultdict

words = ["listen", "silent", "enlist", "google", "gogole", "cat", "act", "tac"]
groups = defaultdict(list)
for w in words:
    groups["".join(sorted(w))].append(w)        # anagrams share a sorted key
print(list(groups.values()))

print(Counter("mississippi").most_common(2))` },
  { h: "Seen-set for duplicates and first repeats",
    code: `def first_repeat(xs):
    seen = set()
    for x in xs:
        if x in seen:
            return x
        seen.add(x)
    return None

print(first_repeat(["INV-3", "INV-7", "INV-1", "INV-7", "INV-3"]))` },
  { h: "Longest consecutive sequence (a classic)",
    p: ["Put all numbers in a set; only start counting from numbers whose predecessor isn't in the set. Each number is visited a constant number of times: O(n)."],
    code: `def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:                  # x starts a run
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best

print(longest_consecutive([100, 4, 200, 1, 3, 2]))` },
  { h: "Tests",
    code: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen: return seen[target - x], i
        seen[x] = i
    return None

def test_basic():     assert two_sum([2, 7, 11, 15], 9) == (0, 1)
def test_same_value(): assert two_sum([3, 3], 6) == (0, 1)
def test_none():      assert two_sum([1, 2, 3], 7) is None
def test_negatives(): assert two_sum([-3, 4, 3, 90], 0) == (0, 2)`, test: true }
 ],
 mistakes: [
  "Using a list for membership checks inside a loop (O(n²)).",
  "Using unhashable keys (lists) in dicts/sets; convert to tuples.",
  "In Two Sum, adding the current number before checking, so it pairs with itself."
 ],
 practice: [
  { q: "Return True if two strings are anagrams.", code: `from collections import Counter
def is_anagram(a, b): return Counter(a) == Counter(b)
print(is_anagram("listen", "silent"), is_anagram("rat", "car"))` },
  { q: "Given orders as (customer, amount), return the total per customer, sorted by total descending.", code: `from collections import defaultdict
orders = [("asha", 500), ("ben", 200), ("asha", 300), ("chen", 900)]
totals = defaultdict(int)
for c, amt in orders:
    totals[c] += amt
print(sorted(totals.items(), key=lambda kv: -kv[1]))` }
 ],
 check: [
  ["Average cost of a dict lookup?", ["O(n)", "O(1)", "O(log n)", "O(n²)"], 1, "Hashing jumps to the bucket."],
  ["Two Sum on unsorted data, best approach?", ["Nested loops", "One pass with a dict of seen values", "Sort then binary search only", "Recursion"], 1, "O(n)."],
  ["Group anagrams by…", ["Length", "Their sorted letters as the key", "First letter", "Hash of the list"], 1, "Same letters → same key."]
 ],
 remember: [
  "dict/set: O(1) average lookup, insert, delete.",
  "“Seen before?” → set. “How many?” → Counter. “Group by” → defaultdict(list).",
  "Two Sum: check complement, then store.",
  "Keys must be hashable (tuples, not lists)."
 ]
},
{
 id: "sliding-window",
 title: "Sliding window",
 level: "Intermediate",
 one: "A <b>sliding window</b> keeps a range [left, right] over an array or string and moves it forward, updating a running total or count instead of recomputing from scratch.",
 why: "Perfect for “longest/shortest/maximum sub-array or substring with a condition” problems, and for rolling metrics in real data (7-day averages, rate limits).",
 steps: [
  { h: "Fixed-size window: max sum of k in a row",
    p: ["Add the new element, remove the one that slid out. O(n) instead of O(n·k)."],
    code: `def max_sum_k(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best

daily_sales = [120, 90, 300, 250, 80, 400, 50]
print(max_sum_k(daily_sales, 3))` },
  { h: "Variable window: longest substring without repeats",
    p: ["Grow the right edge; when the condition breaks, shrink from the left until it holds again."],
    code: `def longest_unique(s):
    last_seen, left, best = {}, 0, 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best

for s in ["abcabcbb", "bbbbb", "pwwkew", ""]:
    print(repr(s), longest_unique(s))` },
  { h: "Shortest window with a sum ≥ target",
    code: `def min_len_at_least(nums, target):
    left, total, best = 0, 0, float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best

print(min_len_at_least([2, 3, 1, 2, 4, 3], 7))` },
  { h: "Real use: a rolling rate limiter",
    p: ["Allow at most N requests in any rolling 60 seconds: keep timestamps in a deque and drop ones older than the window."],
    code: `from collections import deque

class RollingLimiter:
    def __init__(self, limit, window_s):
        self.limit, self.window_s, self.hits = limit, window_s, deque()
    def allow(self, now):
        while self.hits and now - self.hits[0] >= self.window_s:
            self.hits.popleft()
        if len(self.hits) < self.limit:
            self.hits.append(now)
            return True
        return False

rl = RollingLimiter(limit=3, window_s=60)
print([rl.allow(t) for t in [0, 10, 20, 30, 61, 75]])` },
  { h: "Tests",
    code: `def longest_unique(s):
    last, left, best = {}, 0, 0
    for r, ch in enumerate(s):
        if ch in last and last[ch] >= left: left = last[ch] + 1
        last[ch] = r
        best = max(best, r - left + 1)
    return best

import pytest
@pytest.mark.parametrize("s, n", [("abcabcbb", 3), ("bbbbb", 1), ("pwwkew", 3), ("", 0), ("abba", 2)])
def test_longest_unique(s, n):
    assert longest_unique(s) == n`, test: true }
 ],
 mistakes: [
  "Recomputing the whole window each step (O(n·k)).",
  "Forgetting to shrink from the left in variable windows.",
  "Off-by-one in window length: right - left + 1."
 ],
 practice: [
  { q: "Max average of any 4 consecutive days.", code: `def max_avg(nums, k):
    w = best = sum(nums[:k])
    for i in range(k, len(nums)):
        w += nums[i] - nums[i - k]
        best = max(best, w)
    return best / k

print(max_avg([1, 12, -5, -6, 50, 3], 4))` },
  { q: "Longest substring with at most 2 different characters.", code: `from collections import defaultdict
def longest_two(s):
    count, left, best = defaultdict(int), 0, 0
    for right, ch in enumerate(s):
        count[ch] += 1
        while len(count) > 2:
            count[s[left]] -= 1
            if count[s[left]] == 0: del count[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_two("eceba"), longest_two("ccaabbb"))` }
 ],
 check: [
  ["Sliding window turns O(n·k) into…", ["O(n²)", "O(n)", "O(log n)", "O(k²)"], 1, "Update instead of recompute."],
  ["In a variable window, when the condition breaks you…", ["Restart", "Shrink from the left", "Grow the right", "Sort"], 1, "Move left until valid."],
  ["Window length from left and right indexes?", ["right - left", "right - left + 1", "left - right", "right + left"], 1, "Both ends inclusive."]
 ],
 remember: [
  "Fixed window: add new, subtract old.",
  "Variable window: grow right; while invalid, shrink left.",
  "Length = right − left + 1.",
  "Rolling limits: deque of timestamps."
 ]
},
{
 id: "prefix-sorting",
 title: "Prefix sums and sorting tricks",
 level: "Intermediate",
 one: "A <b>prefix sum</b> array answers “sum of any range” in O(1) after one pass. <b>Sorting</b> first (O(n log n)) often makes the rest of a problem easy: intervals, meetings, closest pairs.",
 why: "Range totals, overlapping bookings and merging time ranges appear constantly in business software and interviews.",
 steps: [
  { h: "Prefix sums",
    p: ["<code>prefix[i]</code> = sum of the first i items. Sum of items i..j = <code>prefix[j+1] - prefix[i]</code>."],
    code: `from itertools import accumulate

sales = [120, 90, 300, 250, 80, 400, 50]
prefix = [0] + list(accumulate(sales))

def range_sum(i, j):
    return prefix[j + 1] - prefix[i]

print(prefix)
print("days 2-4:", range_sum(2, 4))` },
  { h: "Subarrays that sum to k",
    p: ["Count how many contiguous runs sum to k, using prefix sums in a dict: O(n)."],
    code: `from collections import defaultdict

def count_subarrays(nums, k):
    seen = defaultdict(int)
    seen[0] = 1
    total = count = 0
    for x in nums:
        total += x
        count += seen[total - k]
        seen[total] += 1
    return count

print(count_subarrays([1, 2, 3, -2, 2, 1], 3))` },
  { h: "Merge overlapping intervals",
    p: ["Sort by start, then merge each interval into the last one if they overlap."],
    code: `def merge_intervals(intervals):
    out = []
    for start, end in sorted(intervals):
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out

bookings = [(9, 11), (13, 14), (10, 12), (14, 16), (18, 19)]
print(merge_intervals(bookings))` },
  { h: "Meeting rooms needed",
    p: ["Sort start and end times separately and sweep: a start needs a room, an end frees one."],
    code: `def rooms_needed(meetings):
    starts = sorted(s for s, _ in meetings)
    ends = sorted(e for _, e in meetings)
    rooms = best = j = 0
    for s in starts:
        while j < len(ends) and ends[j] <= s:
            rooms -= 1; j += 1
        rooms += 1
        best = max(best, rooms)
    return best

print(rooms_needed([(9, 10), (9.5, 11), (10, 12), (11, 12.5)]))` },
  { h: "Custom sort keys",
    code: `orders = [{"id": 3, "priority": 2, "date": "2025-07-03"},
          {"id": 1, "priority": 1, "date": "2025-07-05"},
          {"id": 2, "priority": 1, "date": "2025-07-01"}]
print([o["id"] for o in sorted(orders, key=lambda o: (o["priority"], o["date"]))])
print([o["id"] for o in sorted(orders, key=lambda o: (-o["priority"], o["date"]))])` }
 ],
 mistakes: [
  "Off-by-one in prefix arrays: keep a leading 0.",
  "Merging intervals without sorting first.",
  "Treating touching intervals (10–12 and 12–14) inconsistently: decide if they overlap."
 ],
 practice: [
  { q: "Find the index where the sum of the left side equals the sum of the right side (pivot index).", code: `def pivot_index(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1

print(pivot_index([1, 7, 3, 6, 5, 6]))` },
  { q: "Insert a new booking (12, 15) into [(9, 11), (13, 14), (16, 18)] and merge.", code: `def merge(iv):
    out = []
    for s, e in sorted(iv):
        if out and s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)
        else: out.append([s, e])
    return out

print(merge([(9, 11), (13, 14), (16, 18), (12, 15)]))` }
 ],
 check: [
  ["Sum of range i..j with prefix sums?", ["prefix[j] - prefix[i]", "prefix[j+1] - prefix[i]", "prefix[i] + prefix[j]", "sum(nums)"], 1, "Leading 0 makes this work."],
  ["First step to merge intervals?", ["Reverse", "Sort by start", "Use a set", "Binary search"], 1, "Then one pass."],
  ["Complexity of sort + one pass?", ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], 1, "Sorting dominates."]
 ],
 remember: [
  "prefix = [0] + accumulate(nums); range sum = prefix[j+1] − prefix[i].",
  "Subarray sum = k: prefix sums in a dict.",
  "Intervals: sort by start, merge into the last.",
  "Rooms: sort starts and ends, sweep.",
  "Sort keys with tuples; negate for descending."
 ]
},
{
 id: "practice-1",
 title: "Practice set 1: arrays, hashing and windows",
 level: "Interview",
 one: "Five classic problems that use the first patterns: hashing, two pointers, sliding window and prefix sums. Try each before reading the solution, then check it with the tests.",
 why: "Patterns stick when you apply them to new problems. These five come up again and again in screens.",
 steps: [
  { h: "1. Contains duplicate within k positions",
    code: `def nearby_duplicate(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False

def test_nearby():
    assert nearby_duplicate([1, 2, 3, 1], 3)
    assert not nearby_duplicate([1, 2, 3, 1, 2, 3], 2)`, test: true,
    p: ["Hashing: remember the last index of each value. O(n)."] },
  { h: "2. Product of array except self (no division)",
    code: `def product_except_self(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out

def test_product():
    assert product_except_self([1, 2, 3, 4]) == [24, 12, 8, 6]
    assert product_except_self([2, 0, 3]) == [0, 6, 0]`, test: true,
    p: ["Prefix products from the left and right. O(n) time, O(1) extra space besides the output."] },
  { h: "3. Container with most water",
    code: `def max_area(heights):
    lo, hi, best = 0, len(heights) - 1, 0
    while lo < hi:
        best = max(best, (hi - lo) * min(heights[lo], heights[hi]))
        if heights[lo] < heights[hi]:
            lo += 1
        else:
            hi -= 1
    return best

def test_area():
    assert max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]) == 49
    assert max_area([1, 1]) == 1`, test: true,
    p: ["Two pointers: always move the shorter side, because the area is limited by it."] },
  { h: "4. Top k frequent elements",
    code: `from collections import Counter
import heapq

def top_k(nums, k):
    counts = Counter(nums)
    return [x for x, _ in heapq.nlargest(k, counts.items(), key=lambda kv: kv[1])]

def test_top_k():
    assert top_k([1, 1, 1, 2, 2, 3], 2) == [1, 2]
    assert top_k(["tea", "coffee", "tea"], 1) == ["tea"]`, test: true,
    p: ["Count with a dict, then take the k biggest with a heap: O(n log k)."] },
  { h: "5. Minimum window substring",
    code: `from collections import Counter

def min_window(s, t):
    need, missing = Counter(t), len(t)
    left = start = 0
    best_len = float("inf")
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            if right - left + 1 < best_len:
                start, best_len = left, right - left + 1
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    return "" if best_len == float("inf") else s[start:start + best_len]

def test_min_window():
    assert min_window("ADOBECODEBANC", "ABC") == "BANC"
    assert min_window("a", "aa") == ""`, test: true,
    p: ["Variable sliding window with counts. A hard-level classic; walk through it slowly."] }
 ],
 mistakes: [
  "Jumping to code without naming the pattern first.",
  "Not testing edge cases: empty input, one element, all equal, negatives.",
  "Forgetting to state complexity."
 ],
 practice: [
  { q: "Best time to buy and sell a stock once: max profit from a list of daily prices.", code: `def max_profit(prices):
    lowest, best = float("inf"), 0
    for p in prices:
        lowest = min(lowest, p)
        best = max(best, p - lowest)
    return best

print(max_profit([7, 1, 5, 3, 6, 4]), max_profit([7, 6, 4, 3, 1]))` },
  { q: "Which pattern fits? (a) longest run of days with sales above 100 (b) does any pair of invoices sum to the payment amount (c) total sales for any date range, asked thousands of times", a: "(a) Sliding window (or a simple run counter). (b) Hashing (Two Sum). (c) Prefix sums." }
 ],
 check: [
  ["Max profit from one buy and one sell is…", ["O(n²) at best", "O(n): track the lowest price so far", "O(log n)", "Impossible"], 1, "One pass."],
  ["Container with most water: which pointer moves?", ["The taller one", "The shorter one", "Both", "Random"], 1, "The short side limits area."],
  ["Top k frequent with a heap is…", ["O(n²)", "O(n log k)", "O(1)", "O(k²)"], 1, "Count, then heap of size k."]
 ],
 remember: [
  "Name the pattern first: hashing, two pointers, window, prefix.",
  "Test empty, single, duplicates, negatives.",
  "Say complexity for every solution."
 ]
},
{
 id: "stacks-queues",
 title: "Stacks and queues",
 level: "Intermediate",
 one: "A <b>stack</b> is last-in-first-out (use a list: append/pop). A <b>queue</b> is first-in-first-out (use <code>collections.deque</code>). Stacks handle nesting and “next greater”; queues handle order and BFS.",
 why: "Brackets, undo history, expression parsing, task processing and breadth-first search all use these. They're simple and appear in many interview problems.",
 steps: [
  { h: "Valid brackets with a stack",
    code: `def balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

for s in ["{[()()]}", "([)]", "((", ""]:
    print(repr(s), balanced(s))` },
  { h: "Queue with deque",
    p: ["<code>list.pop(0)</code> is O(n); <code>deque.popleft()</code> is O(1)."],
    code: `from collections import deque

tasks = deque(["email asha", "sync order 6", "send invoice"])
tasks.append("backup db")
while tasks:
    print("doing:", tasks.popleft())` },
  { h: "Monotonic stack: next warmer day",
    p: ["For each day, how many days until a warmer one? Keep a stack of days still waiting; pop them when a warmer day arrives. O(n)."],
    code: `def days_until_warmer(temps):
    out = [0] * len(temps)
    stack = []                              # indexes, temperatures decreasing
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            out[j] = i - j
        stack.append(i)
    return out

print(days_until_warmer([30, 31, 29, 28, 33, 30, 34]))` },
  { h: "Min stack: O(1) minimum",
    code: `class MinStack:
    def __init__(self):
        self.items, self.mins = [], []
    def push(self, x):
        self.items.append(x)
        self.mins.append(min(x, self.mins[-1]) if self.mins else x)
    def pop(self):
        self.mins.pop()
        return self.items.pop()
    def min(self):
        return self.mins[-1]

s = MinStack()
for x in [5, 3, 7, 2]:
    s.push(x)
print(s.min()); s.pop(); print(s.min())` },
  { h: "Evaluate reverse Polish notation",
    code: `def rpn(tokens):
    stack = []
    ops = {"+": lambda a, b: a + b, "-": lambda a, b: a - b,
           "*": lambda a, b: a * b, "/": lambda a, b: int(a / b)}
    for t in tokens:
        if t in ops:
            b, a = stack.pop(), stack.pop()
            stack.append(ops[t](a, b))
        else:
            stack.append(int(t))
    return stack[0]

print(rpn(["2", "1", "+", "3", "*"]), rpn(["4", "13", "5", "/", "+"]))` }
 ],
 mistakes: [
  "Using list.pop(0) as a queue (O(n) each time).",
  "Popping from an empty stack: check first.",
  "Forgetting to check the stack is empty at the end (unclosed brackets)."
 ],
 practice: [
  { q: "Simplify a Unix path like <code>/a/./b/../../c/</code>.", code: `def simplify(path):
    stack = []
    for part in path.split("/"):
        if part == "..":
            if stack: stack.pop()
        elif part and part != ".":
            stack.append(part)
    return "/" + "/".join(stack)

print(simplify("/a/./b/../../c/"), simplify("/../"))` },
  { q: "Implement a queue using two stacks.", code: `class Queue:
    def __init__(self): self.inbox, self.outbox = [], []
    def push(self, x): self.inbox.append(x)
    def pop(self):
        if not self.outbox:
            while self.inbox: self.outbox.append(self.inbox.pop())
        return self.outbox.pop()

q = Queue()
for x in [1, 2, 3]: q.push(x)
print(q.pop(), q.pop()); q.push(4); print(q.pop(), q.pop())` }
 ],
 check: [
  ["Stack order?", ["FIFO", "LIFO", "Random", "Sorted"], 1, "Last in, first out."],
  ["Best Python queue?", ["list with pop(0)", "collections.deque", "dict", "set"], 1, "O(1) at both ends."],
  ["“Next greater element” problems use…", ["A queue", "A monotonic stack", "Sorting", "A heap"], 1, "Pop smaller items when a bigger one arrives."]
 ],
 remember: [
  "Stack = list (append/pop): nesting, undo, next-greater.",
  "Queue = deque (append/popleft): order, BFS.",
  "Monotonic stack keeps items in increasing/decreasing order.",
  "Check for empty before popping."
 ]
},
{
 id: "linked-lists",
 title: "Linked lists",
 level: "Intermediate",
 one: "A <b>linked list</b> is a chain of nodes, each holding a value and a pointer to the next. Inserting or removing at a known node is O(1); finding the i-th item is O(n).",
 why: "Less common in everyday Python, but a staple of interviews: they test careful pointer handling. The fast/slow pointer tricks are worth knowing.",
 steps: [
  { h: "A node and a list",
    code: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def from_list(xs):
    head = None
    for x in reversed(xs):
        head = Node(x, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

print(to_list(from_list([1, 2, 3, 4])))` },
  { h: "Reverse a linked list",
    p: ["Walk the list, turning each arrow around. Three pointers: prev, current, next."],
    pre: `class Node:
    def __init__(self, val, next=None): self.val, self.next = val, next
def from_list(xs):
    head = None
    for x in reversed(xs): head = Node(x, head)
    return head
def to_list(h):
    out = []
    while h: out.append(h.val); h = h.next
    return out`,
    code: `def reverse(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev, head = head, nxt
    return prev

print(to_list(reverse(from_list([1, 2, 3, 4, 5]))))` },
  { h: "Fast and slow pointers",
    p: ["Fast moves 2 steps, slow moves 1. When fast reaches the end, slow is in the middle. If there's a cycle, they eventually meet."],
    pre: `class Node:
    def __init__(self, val, next=None): self.val, self.next = val, next
def from_list(xs):
    head = None
    for x in reversed(xs): head = Node(x, head)
    return head`,
    code: `def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow.val

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

print(middle(from_list([1, 2, 3, 4, 5])))
looped = from_list([1, 2, 3, 4])
looped.next.next.next.next = looped.next          # 4 -> 2
print(has_cycle(from_list([1, 2, 3])), has_cycle(looped))` },
  { h: "Merge two sorted lists (with a dummy head)",
    p: ["A <b>dummy</b> starting node removes special cases for the first element."],
    pre: `class Node:
    def __init__(self, val, next=None): self.val, self.next = val, next
def from_list(xs):
    head = None
    for x in reversed(xs): head = Node(x, head)
    return head
def to_list(h):
    out = []
    while h: out.append(h.val); h = h.next
    return out`,
    code: `def merge(a, b):
    dummy = tail = Node(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next

print(to_list(merge(from_list([1, 4, 9]), from_list([2, 3, 10]))))` },
  { h: "Tests",
    code: `class Node:
    def __init__(self, val, next=None): self.val, self.next = val, next
def from_list(xs):
    head = None
    for x in reversed(xs): head = Node(x, head)
    return head
def to_list(h):
    out = []
    while h: out.append(h.val); h = h.next
    return out
def reverse(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev

def test_reverse():       assert to_list(reverse(from_list([1, 2, 3]))) == [3, 2, 1]
def test_reverse_empty(): assert reverse(None) is None
def test_reverse_one():   assert to_list(reverse(from_list([7]))) == [7]`, test: true }
 ],
 mistakes: [
  "Losing the rest of the list by overwriting <code>next</code> before saving it.",
  "Not handling empty lists or one-node lists.",
  "Forgetting that Python lists and deques are usually better in real code."
 ],
 practice: [
  { q: "Remove the n-th node from the end in one pass (n is valid).", pre: `class Node:
    def __init__(self, val, next=None): self.val, self.next = val, next
def from_list(xs):
    head = None
    for x in reversed(xs): head = Node(x, head)
    return head
def to_list(h):
    out = []
    while h: out.append(h.val); h = h.next
    return out`, code: `def remove_nth_from_end(head, n):
    dummy = Node(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast, slow = fast.next, slow.next
    slow.next = slow.next.next
    return dummy.next

print(to_list(remove_nth_from_end(from_list([1, 2, 3, 4, 5]), 2)))` },
  { q: "Why is accessing the 1,000th element slow in a linked list?", a: "There's no index: you must follow 999 next-pointers from the head, so it's O(n). Arrays (Python lists) jump straight there in O(1)." }
 ],
 check: [
  ["Finding the middle of a linked list in one pass uses…", ["Two passes only", "Fast and slow pointers", "A heap", "Sorting"], 1, "Fast moves twice as fast."],
  ["Why use a dummy head node?", ["Speed", "Removes special cases at the start of the list", "Required", "Memory"], 1, "Simpler code."],
  ["Reversing a linked list is…", ["O(n²)", "O(n) time, O(1) space", "O(log n)", "O(n) space"], 1, "One pass, in place."]
 ],
 remember: [
  "Node = value + next. Access by position is O(n).",
  "Reverse: prev/current/next, save next before overwriting.",
  "Fast/slow: middle, cycle detection, n-th from end.",
  "Dummy head simplifies inserts/merges; handle empty and single-node lists."
 ]
},
{
 id: "binary-search",
 title: "Binary search",
 level: "Intermediate",
 one: "On sorted data, <b>binary search</b> checks the middle and throws away half each time: O(log n). It also works on any yes/no condition that flips once (“first day the stock ran out”).",
 why: "Searching a million items in 20 steps. Interviews love it because the boundaries are easy to get wrong; real systems use it in databases, logs and version bisecting.",
 steps: [
  { h: "Classic search",
    code: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

nums = [3, 8, 15, 23, 42, 57, 91]
print(binary_search(nums, 42), binary_search(nums, 5))` },
  { h: "Python's bisect",
    p: ["The standard library does it for you: <code>bisect_left</code> gives the first position where x could go."],
    code: `import bisect

prices = [120, 400, 900, 3000, 8000, 55000]
print(bisect.bisect_left(prices, 900))     # index of 900
print(bisect.bisect_left(prices, 1000))    # where 1000 would be inserted
budget = 5000
print("products under budget:", bisect.bisect_right(prices, budget))` },
  { h: "Search on the answer: first true",
    p: ["If a condition is false, false, …, true, true, binary search finds the first true. Example: the first version where a bug appeared (like <code>git bisect</code>)."],
    code: `def first_true(lo, hi, condition):
    while lo < hi:
        mid = (lo + hi) // 2
        if condition(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

bad_from = 137
checks = []
def is_bad(version):
    checks.append(version)
    return version >= bad_from

print("first bad version:", first_true(1, 1000, is_bad), "after", len(checks), "checks")` },
  { h: "Minimum capacity to ship in D days",
    p: ["Search over the answer: the smallest truck capacity that ships all packages (in order) within D days. Check a capacity with a simple simulation."],
    code: `def can_ship(weights, days, cap):
    needed, load = 1, 0
    for w in weights:
        if load + w > cap:
            needed, load = needed + 1, 0
        load += w
    return needed <= days

def min_capacity(weights, days):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_ship(weights, days, mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

print(min_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))` },
  { h: "Tests for boundaries",
    code: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
        lo, hi = (mid + 1, hi) if nums[mid] < target else (lo, mid - 1)
    return -1

def test_first_and_last():
    assert binary_search([1, 3, 5], 1) == 0
    assert binary_search([1, 3, 5], 5) == 2
def test_missing_and_empty():
    assert binary_search([1, 3, 5], 4) == -1
    assert binary_search([], 4) == -1`, test: true }
 ],
 mistakes: [
  "Using it on unsorted data.",
  "Infinite loops from wrong updates (lo = mid instead of mid + 1).",
  "Mixing up the two styles: <code>while lo &lt;= hi</code> with hi = mid − 1, or <code>while lo &lt; hi</code> with hi = mid.",
  "Not testing first, last, missing and empty."
 ],
 practice: [
  { q: "Integer square root without math.sqrt.", code: `def isqrt(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid <= n: lo = mid
        else: hi = mid - 1
    return lo

print(isqrt(15), isqrt(16), isqrt(0))` },
  { q: "Find the first and last position of 8 in [5, 7, 7, 8, 8, 10].", code: `import bisect
nums = [5, 7, 7, 8, 8, 10]
l, r = bisect.bisect_left(nums, 8), bisect.bisect_right(nums, 8) - 1
print((l, r) if l < len(nums) and nums[l] == 8 else (-1, -1))` }
 ],
 check: [
  ["Binary search needs…", ["Random data", "Sorted data or a monotonic yes/no condition", "A dict", "Recursion"], 1, "Something you can halve."],
  ["Searching 1,000,000 sorted items takes about…", ["1,000,000 steps", "20 steps", "1,000 steps", "1 step"], 1, "log₂(1,000,000) ≈ 20."],
  ["“First version with a bug” is…", ["Linear search only", "Binary search on a false…true condition", "Sorting", "A heap"], 1, "Like git bisect."]
 ],
 remember: [
  "Sorted → halve each step → O(log n).",
  "Two consistent styles: lo <= hi (hi = mid − 1) or lo < hi (hi = mid).",
  "bisect_left / bisect_right in Python.",
  "Search on the answer: find the first value where a check turns true.",
  "Test first, last, missing, empty."
 ]
},
{
 id: "recursion",
 title: "Recursion and backtracking",
 level: "Intermediate",
 one: "A <b>recursive</b> function calls itself on a smaller problem until it reaches a <b>base case</b>. <b>Backtracking</b> builds choices step by step and undoes them to try others: subsets, permutations, puzzles.",
 why: "Trees, nested data (JSON, folders, org charts) and “all combinations” problems are naturally recursive. It's essential for the trees and graphs lessons.",
 steps: [
  { h: "Base case + smaller problem",
    code: `def factorial(n):
    if n <= 1:                 # base case
        return 1
    return n * factorial(n - 1)

def total_size(folder):        # nested data is naturally recursive
    return folder.get("size", 0) + sum(total_size(c) for c in folder.get("children", []))

print(factorial(5))
print(total_size({"size": 10, "children": [{"size": 5}, {"size": 2, "children": [{"size": 7}]}]}))` },
  { h: "Nested JSON: flatten keys",
    code: `def flatten(obj, prefix=""):
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.update(flatten(v, f"{prefix}{k}."))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            out.update(flatten(v, f"{prefix}{i}."))
    else:
        out[prefix[:-1]] = obj
    return out

order = {"id": 6, "customer": {"name": "Asha", "city": "Kochi"}, "items": [{"sku": "HP", "qty": 2}]}
print(flatten(order))` },
  { h: "Backtracking: all subsets",
    p: ["Choose → explore → un-choose. Each element is either in or out: 2ⁿ subsets."],
    code: `def subsets(items):
    out, current = [], []
    def explore(i):
        if i == len(items):
            out.append(current[:])
            return
        current.append(items[i]); explore(i + 1); current.pop()    # with item i
        explore(i + 1)                                              # without item i
    explore(0)
    return out

print(subsets(["tea", "coffee", "milk"]))` },
  { h: "Combination sum: pick items that hit a budget",
    code: `def combos(prices, target):
    out = []
    def explore(start, remaining, chosen):
        if remaining == 0:
            out.append(chosen[:]); return
        for i in range(start, len(prices)):
            if prices[i] > remaining:
                break                              # sorted, so stop early (pruning)
            chosen.append(prices[i])
            explore(i, remaining - prices[i], chosen)
            chosen.pop()
    explore(0, target, [])
    return out

print(combos(sorted([2, 3, 6, 7]), 7))` },
  { h: "Recursion depth and memoisation",
    p: ["Python stops at about 1,000 nested calls (RecursionError). Deep problems need loops instead. When the same sub-problem repeats, cache results with <code>functools.cache</code> (memoisation), which leads into dynamic programming."],
    code: `from functools import cache
import time

def fib_slow(n): return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)

@cache
def fib_fast(n): return n if n < 2 else fib_fast(n - 1) + fib_fast(n - 2)

t = time.perf_counter(); fib_slow(27); slow = time.perf_counter() - t
t = time.perf_counter(); fib_fast(27); fast = time.perf_counter() - t
print(fib_fast(27), f"cached is {slow / fast:,.0f}x faster")` }
 ],
 mistakes: [
  "No base case, or a base case that's never reached → infinite recursion.",
  "Forgetting to undo the choice in backtracking (the pop).",
  "Appending the same list object instead of a copy (<code>current[:]</code>).",
  "Deep recursion on large inputs; use loops or iterative versions."
 ],
 practice: [
  { q: "All permutations of [1, 2, 3].", code: `def permutations(nums):
    out = []
    def explore(path, left):
        if not left:
            out.append(path); return
        for i in range(len(left)):
            explore(path + [left[i]], left[:i] + left[i + 1:])
    explore([], nums)
    return out

print(permutations([1, 2, 3]))` },
  { q: "Count all the leaf values in a nested list like [1, [2, [3, 4]], 5].", code: `def count_leaves(x):
    return sum(count_leaves(i) for i in x) if isinstance(x, list) else 1

print(count_leaves([1, [2, [3, 4]], 5]))` }
 ],
 check: [
  ["Every recursive function needs…", ["A loop", "A base case", "A global", "A class"], 1, "Otherwise it never stops."],
  ["Backtracking pattern?", ["Sort, search", "Choose, explore, un-choose", "Push, pop", "Hash, check"], 1, "Undo to try alternatives."],
  ["Number of subsets of n items?", ["n", "n²", "2ⁿ", "n!"], 2, "Each item in or out."]
 ],
 remember: [
  "Base case + a smaller self-call.",
  "Great for nested data: JSON, folders, trees.",
  "Backtracking: choose → explore → un-choose; copy results.",
  "Prune early when a branch can't succeed.",
  "Watch depth (~1,000 in Python); cache repeated sub-problems."
 ]
},
{
 id: "trees",
 title: "Trees and binary search trees",
 level: "Intermediate",
 one: "A <b>tree</b> is nodes with children and no cycles. A <b>binary tree</b> has up to two children. Traverse it <b>depth-first</b> (recursion) or <b>breadth-first</b> (a queue, level by level).",
 why: "Org charts, categories, file systems, HTML/JSON and database indexes are trees. Tree traversal questions are very common in interviews.",
 steps: [
  { h: "A binary tree and DFS orders",
    code: `class T:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

#        8
#      /   \\
#     3     10
#    / \\      \\
#   1   6      14
root = T(8, T(3, T(1), T(6)), T(10, None, T(14)))

def inorder(n):  return inorder(n.left) + [n.val] + inorder(n.right) if n else []
def preorder(n): return [n.val] + preorder(n.left) + preorder(n.right) if n else []
print("in-order: ", inorder(root))
print("pre-order:", preorder(root))`,
    note: "In-order on a binary search tree gives sorted values." },
  { h: "Height and path sums",
    pre: `class T:
    def __init__(self, val, left=None, right=None): self.val, self.left, self.right = val, left, right
root = T(8, T(3, T(1), T(6)), T(10, None, T(14)))`,
    code: `def height(n):
    return 0 if n is None else 1 + max(height(n.left), height(n.right))

def has_path_sum(n, target):
    if n is None:
        return False
    if not n.left and not n.right:
        return n.val == target
    return has_path_sum(n.left, target - n.val) or has_path_sum(n.right, target - n.val)

print(height(root), has_path_sum(root, 17), has_path_sum(root, 100))` },
  { h: "BFS: level by level",
    pre: `class T:
    def __init__(self, val, left=None, right=None): self.val, self.left, self.right = val, left, right
root = T(8, T(3, T(1), T(6)), T(10, None, T(14)))`,
    code: `from collections import deque

def levels(root):
    out, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            n = q.popleft()
            level.append(n.val)
            q.extend(c for c in (n.left, n.right) if c)
        out.append(level)
    return out

print(levels(root))` },
  { h: "Binary search tree: insert and search",
    p: ["In a BST every left value is smaller and every right value larger, so search is O(height): O(log n) if balanced, O(n) if it degenerates into a line."],
    code: `class T:
    def __init__(self, val): self.val, self.left, self.right = val, None, None

def insert(n, v):
    if n is None: return T(v)
    if v < n.val: n.left = insert(n.left, v)
    else:         n.right = insert(n.right, v)
    return n

def contains(n, v):
    while n:
        if v == n.val: return True
        n = n.left if v < n.val else n.right
    return False

root = None
for v in [8, 3, 10, 1, 6, 14]:
    root = insert(root, v)
print(contains(root, 6), contains(root, 7))` },
  { h: "Validate a BST",
    code: `class T:
    def __init__(self, val, left=None, right=None): self.val, self.left, self.right = val, left, right

def is_bst(n, lo=float("-inf"), hi=float("inf")):
    if n is None:
        return True
    if not lo < n.val < hi:
        return False
    return is_bst(n.left, lo, n.val) and is_bst(n.right, n.val, hi)

good = T(8, T(3, T(1), T(6)), T(10))
bad = T(8, T(3, T(1), T(9)), T(10))      # 9 is in the left subtree of 8
print(is_bst(good), is_bst(bad))`,
    note: "Checking only each node against its direct children isn't enough; pass the allowed range down." }
 ],
 mistakes: [
  "Forgetting the None (empty) case.",
  "Validating a BST by comparing only parent and child.",
  "Using recursion on very deep, unbalanced trees (stack depth).",
  "Mixing up DFS orders: in/pre/post."
 ],
 practice: [
  { q: "Return the maximum value at each level of the tree.", pre: `class T:
    def __init__(self, val, left=None, right=None): self.val, self.left, self.right = val, left, right
root = T(8, T(3, T(1), T(6)), T(10, None, T(14)))`, code: `from collections import deque
def level_max(root):
    out, q = [], deque([root])
    while q:
        out.append(max(n.val for n in q))
        q = deque(c for n in q for c in (n.left, n.right) if c)
    return out

print(level_max(root))` },
  { q: "Lowest common ancestor of 1 and 6 in the BST above (8, 3, 10, 1, 6, 14).", pre: `class T:
    def __init__(self, val, left=None, right=None): self.val, self.left, self.right = val, left, right
root = T(8, T(3, T(1), T(6)), T(10, None, T(14)))`, code: `def lca(n, a, b):
    while n:
        if a < n.val and b < n.val: n = n.left
        elif a > n.val and b > n.val: n = n.right
        else: return n.val

print(lca(root, 1, 6), lca(root, 1, 14))` }
 ],
 check: [
  ["Level-by-level traversal uses…", ["A stack", "A queue (BFS)", "Sorting", "Binary search"], 1, "Breadth-first."],
  ["In-order traversal of a BST gives…", ["Random order", "Sorted values", "Reverse insertion order", "Levels"], 1, "Left, node, right."],
  ["Search in a balanced BST is…", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 1, "Halves each step."]
 ],
 remember: [
  "DFS (recursion): pre/in/post order. BFS (queue): level by level.",
  "Always handle None.",
  "BST: left < node < right; search O(height).",
  "Validate a BST by passing (low, high) bounds down.",
  "Real trees: org charts, categories, folders, JSON."
 ]
},
{
 id: "graphs",
 title: "Graphs: BFS, DFS and shortest paths",
 level: "Advanced",
 one: "A <b>graph</b> is nodes connected by edges (roads, network links, dependencies, “follows”). Store it as an <b>adjacency list</b>; explore with <b>BFS</b> (shortest hops), <b>DFS</b> (reachability, cycles), <b>topological sort</b> (order with dependencies) and <b>Dijkstra</b> (weighted shortest paths).",
 why: "Delivery routes, task dependencies, recommendation networks and permission chains are graphs. Graph questions are standard in mid-level interviews.",
 steps: [
  { h: "Adjacency list + BFS shortest hops",
    code: `from collections import deque, defaultdict

edges = [("Kochi", "Calicut"), ("Kochi", "Thrissur"), ("Thrissur", "Palakkad"),
         ("Calicut", "Kannur"), ("Palakkad", "Coimbatore"), ("Thrissur", "Calicut")]
graph = defaultdict(list)
for a, b in edges:
    graph[a].append(b); graph[b].append(a)

def shortest_hops(start, goal):
    q, prev = deque([start]), {start: None}
    while q:
        node = q.popleft()
        if node == goal:
            path = []
            while node:
                path.append(node); node = prev[node]
            return path[::-1]
        for nxt in graph[node]:
            if nxt not in prev:
                prev[nxt] = node; q.append(nxt)
    return None

print(shortest_hops("Kannur", "Coimbatore"))` },
  { h: "DFS: count connected groups (islands)",
    code: `grid = ["11000",
        "11010",
        "00100",
        "00011"]

def islands(grid):
    rows, cols, seen, count = len(grid), len(grid[0]), set(), 0
    def dfs(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == "0" or (r, c) in seen:
            return
        seen.add((r, c))
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            dfs(r + dr, c + dc)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1; dfs(r, c)
    return count

print(islands(grid))` },
  { h: "Topological sort: order tasks with dependencies",
    p: ["Kahn's algorithm: repeatedly take tasks with no remaining dependencies. If some are left over, there's a cycle."],
    code: `from collections import deque, defaultdict

deps = {"deploy": ["build", "migrate"], "build": ["install"], "migrate": ["install"], "install": [], "test": ["build"]}

def topo_order(deps):
    indeg = {t: len(d) for t, d in deps.items()}
    users = defaultdict(list)
    for t, ds in deps.items():
        for d in ds:
            users[d].append(t)
    q = deque(sorted(t for t, n in indeg.items() if n == 0))
    order = []
    while q:
        t = q.popleft(); order.append(t)
        for u in sorted(users[t]):
            indeg[u] -= 1
            if indeg[u] == 0:
                q.append(u)
    if len(order) != len(deps):
        raise ValueError("cycle in dependencies")
    return order

print(topo_order(deps))` },
  { h: "Dijkstra: shortest path with weights",
    p: ["With distances on edges, BFS isn't enough. Dijkstra always expands the closest unvisited node, using a heap. O((V + E) log V)."],
    code: `import heapq

roads = {"Kochi": {"Thrissur": 75, "Kottayam": 65}, "Thrissur": {"Palakkad": 70, "Calicut": 120},
         "Kottayam": {"Thrissur": 130}, "Palakkad": {"Calicut": 140}, "Calicut": {}}

def dijkstra(graph, start):
    dist, heap = {start: 0}, [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float("inf")):
            continue
        for nxt, w in graph[node].items():
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(heap, (nd, nxt))
    return dist

print(dijkstra(roads, "Kochi"))` }
 ],
 mistakes: [
  "Forgetting the visited set: infinite loops on cycles.",
  "Using BFS for weighted shortest paths.",
  "Dijkstra with negative weights (it breaks; use Bellman-Ford).",
  "Recursion depth problems with DFS on huge graphs; use an explicit stack."
 ],
 practice: [
  { q: "Detect a cycle in a directed dependency graph using DFS colours.", code: `def has_cycle(deps):
    state = {}                                # 1 = visiting, 2 = done
    def visit(n):
        if state.get(n) == 1: return True
        if state.get(n) == 2: return False
        state[n] = 1
        if any(visit(d) for d in deps.get(n, [])): return True
        state[n] = 2
        return False
    return any(visit(n) for n in deps)

print(has_cycle({"a": ["b"], "b": ["c"], "c": []}), has_cycle({"a": ["b"], "b": ["a"]}))` },
  { q: "Which algorithm? (a) fewest flight changes (b) cheapest route with prices (c) order to run DB migrations (d) are these two users connected?", a: "(a) BFS (b) Dijkstra (c) Topological sort (d) BFS/DFS (or union-find for many queries)." }
 ],
 check: [
  ["Shortest path counting hops (no weights)?", ["DFS", "BFS", "Sorting", "Binary search"], 1, "BFS explores in layers."],
  ["Order tasks with dependencies?", ["Dijkstra", "Topological sort", "BFS only", "Heap sort"], 1, "And it detects cycles."],
  ["Weighted shortest paths (non-negative)?", ["BFS", "Dijkstra", "DFS", "Two pointers"], 1, "A heap of closest nodes."]
 ],
 remember: [
  "Adjacency list: dict of node → neighbours.",
  "BFS: fewest hops. DFS: reachability, components, cycles.",
  "Topological sort (Kahn): dependencies order; leftover = cycle.",
  "Dijkstra: weighted, non-negative, heap.",
  "Always track visited."
 ]
},
{
 id: "heaps",
 title: "Heaps and priority queues",
 level: "Intermediate",
 one: "A <b>heap</b> always gives you the smallest (or largest) item in O(1) and adds/removes in O(log n). Python's <code>heapq</code> is a min-heap on a list.",
 why: "Top-k lists, scheduling the next job, merging sorted streams and Dijkstra all use heaps. Very common in interviews and in real schedulers.",
 steps: [
  { h: "heapq basics",
    code: `import heapq

tasks = []
heapq.heappush(tasks, (2, "send invoices"))
heapq.heappush(tasks, (1, "fix payment outage"))
heapq.heappush(tasks, (3, "update docs"))
while tasks:
    priority, name = heapq.heappop(tasks)
    print(priority, name)`,
    note: "Tuples compare by the first item, so (priority, name) pops the most urgent first. For a max-heap, push negative numbers." },
  { h: "Top k without sorting everything",
    p: ["Keep a min-heap of size k: if a new item beats the smallest, replace it. O(n log k), great when n is huge and k small."],
    code: `import heapq, random

random.seed(4)
order_totals = [random.randint(100, 100_000) for _ in range(100_000)]

def top_k(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for x in nums[k:]:
        if x > heap[0]:
            heapq.heapreplace(heap, x)
    return sorted(heap, reverse=True)

print(top_k(order_totals, 5))
print(heapq.nlargest(5, order_totals))` },
  { h: "Merge k sorted lists",
    code: `import heapq

branch_sales = [[100, 300, 900], [50, 400], [200, 250, 1000]]
print(list(heapq.merge(*branch_sales)))

def merge_k(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out

print(merge_k(branch_sales))` },
  { h: "Running median with two heaps",
    p: ["Keep the lower half in a max-heap and the upper half in a min-heap; the median is at the tops."],
    code: `import heapq

class RunningMedian:
    def __init__(self):
        self.low, self.high = [], []          # low is a max-heap (negated)
    def add(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))
    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

rm = RunningMedian()
for x in [5, 15, 1, 3, 8]:
    rm.add(x)
    print(x, "->", rm.median())` },
  { h: "Scheduling: earliest deadline next",
    code: `import heapq

jobs = [("report", 17), ("backup", 9), ("sync", 12), ("email", 9)]
heap = [(deadline, name) for name, deadline in jobs]
heapq.heapify(heap)
print([heapq.heappop(heap)[1] for _ in range(len(jobs))])` }
 ],
 mistakes: [
  "Sorting the whole list for top-k when a heap of size k is enough.",
  "Forgetting Python's heapq is a min-heap; negate for max.",
  "Pushing items that can't be compared (add a tie-breaker index)."
 ],
 practice: [
  { q: "k-th largest element in a list.", code: `import heapq
def kth_largest(nums, k): return heapq.nlargest(k, nums)[-1]
print(kth_largest([3, 2, 1, 5, 6, 4], 2))` },
  { q: "Return the k closest points to the origin.", code: `import heapq
pts = [(1, 3), (-2, 2), (5, 8), (0, 1)]
print(heapq.nsmallest(2, pts, key=lambda p: p[0] ** 2 + p[1] ** 2))` }
 ],
 check: [
  ["Python heapq gives you…", ["The largest item", "The smallest item", "A sorted list", "A random item"], 1, "Min-heap; negate for max."],
  ["Top 5 of 10 million items, best approach?", ["Sort everything", "Heap of size 5", "Binary search", "Two pointers"], 1, "O(n log k)."],
  ["heappush/heappop cost?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 1, "The heap rebalances."]
 ],
 remember: [
  "heapq = min-heap; push/pop O(log n), peek O(1).",
  "(priority, item) tuples; negate for max; add tie-breakers.",
  "Top k: heap of size k → O(n log k); nlargest/nsmallest.",
  "Merge k sorted lists; running median with two heaps."
 ]
},
{
 id: "dp-intro",
 title: "Dynamic programming",
 level: "Advanced",
 one: "<b>Dynamic programming (DP)</b> solves a problem by combining answers to smaller overlapping sub-problems, storing each answer once. Define the <b>state</b>, the <b>recurrence</b>, the <b>base cases</b>, then fill a table (or memoise).",
 why: "DP questions are a classic of harder interviews, and the idea (don't recompute; build from smaller answers) appears in pricing, scheduling and text comparison (diffs).",
 steps: [
  { h: "Climbing stairs: the simplest DP",
    p: ["Ways to reach step n taking 1 or 2 steps: ways(n) = ways(n−1) + ways(n−2). Keep only the last two values."],
    code: `def climb(n):
    a, b = 1, 1                 # ways to reach step 0 and step 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b

print([climb(n) for n in range(1, 8)])` },
  { h: "Coin change: fewest coins",
    p: ["State: <code>best[x]</code> = fewest coins to make x. Recurrence: best[x] = 1 + min(best[x − coin])."],
    code: `def fewest_coins(coins, amount):
    best = [0] + [float("inf")] * amount
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x:
                best[x] = min(best[x], best[x - c] + 1)
    return best[amount] if best[amount] != float("inf") else -1

print(fewest_coins([1, 2, 5], 11), fewest_coins([2], 3), fewest_coins([1, 5, 10, 25], 63))` },
  { h: "House robber: take or skip",
    p: ["Choose houses (non-adjacent) to maximise money. At each house: skip it (keep the previous best) or take it (best from two back + this one)."],
    code: `def rob(money):
    take = skip = 0
    for m in money:
        take, skip = skip + m, max(take, skip)
    return max(take, skip)

print(rob([2, 7, 9, 3, 1]), rob([5, 1, 1, 5]))` },
  { h: "Longest common subsequence (how diffs work)",
    p: ["A 2D table: <code>dp[i][j]</code> = LCS of the first i letters of a and first j of b."],
    code: `def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[-1][-1]

print(lcs("ABCBDAB", "BDCABA"), lcs("invoice", "invoices"))` },
  { h: "0/1 knapsack: best value within a limit",
    p: ["Pick items (each once) to maximise value without exceeding weight. Go through capacities from high to low so each item is used once."],
    code: `def knapsack(items, capacity):
    best = [0] * (capacity + 1)
    for weight, value in items:
        for c in range(capacity, weight - 1, -1):
            best[c] = max(best[c], best[c - weight] + value)
    return best[capacity]

parcels = [(1, 1500), (3, 2000), (4, 3000)]    # (kg, revenue)
print(knapsack(parcels, 4))` }
 ],
 mistakes: [
  "Starting with code before defining the state and recurrence in words.",
  "Wrong base cases (e.g. best[0] for coin change must be 0).",
  "Plain recursion without memoisation: exponential time.",
  "In 0/1 knapsack, looping capacity upwards (reuses items)."
 ],
 practice: [
  { q: "Count the ways to make an amount with coins (order doesn't matter).", code: `def ways(coins, amount):
    dp = [1] + [0] * amount
    for c in coins:
        for x in range(c, amount + 1):
            dp[x] += dp[x - c]
    return dp[amount]

print(ways([1, 2, 5], 5))` },
  { q: "Longest increasing subsequence length of [10, 9, 2, 5, 3, 7, 101, 18].", code: `def lis(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)

print(lis([10, 9, 2, 5, 3, 7, 101, 18]))` }
 ],
 check: [
  ["DP works when sub-problems…", ["Never repeat", "Overlap and combine into the answer", "Are random", "Need sorting"], 1, "Store each sub-answer once."],
  ["First step in a DP problem?", ["Write loops", "Define the state and recurrence in words", "Sort", "Use a heap"], 1, "Then base cases, then code."],
  ["Coin change best[0] should be…", ["infinity", "0", "1", "-1"], 1, "Zero coins make zero."]
 ],
 remember: [
  "State → recurrence → base cases → order of filling → answer.",
  "Top-down (memoise) or bottom-up (table).",
  "Classics: stairs, coin change, house robber, LCS, knapsack, LIS.",
  "Often you only need the last row or last two values (O(1)/O(n) space)."
 ]
},
{
 id: "practice-2",
 title: "Practice set 2: mixed interview problems",
 level: "Interview",
 one: "Five mixed problems covering stacks, binary search, trees, graphs, heaps and DP. Name the pattern, solve, test, and state the complexity.",
 why: "Real interviews don't tell you which lesson a problem comes from. Mixed practice trains you to recognise the pattern.",
 steps: [
  { h: "1. Search in a rotated sorted array (binary search)",
    code: `def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:                 # left half sorted
            if nums[lo] <= target < nums[mid]: hi = mid - 1
            else: lo = mid + 1
        else:                                     # right half sorted
            if nums[mid] < target <= nums[hi]: lo = mid + 1
            else: hi = mid - 1
    return -1

def test_rotated():
    assert search_rotated([4, 5, 6, 7, 0, 1, 2], 0) == 4
    assert search_rotated([4, 5, 6, 7, 0, 1, 2], 3) == -1
    assert search_rotated([1], 1) == 0`, test: true },
  { h: "2. Course schedule (graph cycle / topological sort)",
    code: `from collections import defaultdict, deque

def can_finish(n, prereqs):
    indeg, nxt = [0] * n, defaultdict(list)
    for course, pre in prereqs:
        nxt[pre].append(course); indeg[course] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    done = 0
    while q:
        c = q.popleft(); done += 1
        for d in nxt[c]:
            indeg[d] -= 1
            if indeg[d] == 0: q.append(d)
    return done == n

def test_courses():
    assert can_finish(2, [(1, 0)])
    assert not can_finish(2, [(1, 0), (0, 1)])`, test: true },
  { h: "3. Largest rectangle in a histogram (monotonic stack)",
    code: `def largest_rectangle(heights):
    stack, best = [], 0
    for i, h in enumerate(heights + [0]):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            best = max(best, height * (i - idx))
            start = idx
        stack.append((start, h))
    return best

def test_histogram():
    assert largest_rectangle([2, 1, 5, 6, 2, 3]) == 10
    assert largest_rectangle([2, 4]) == 4`, test: true },
  { h: "4. Task scheduler with cooldown (counting / heap)",
    code: `from collections import Counter

def least_interval(tasks, n):
    counts = Counter(tasks).values()
    top = max(counts)
    tied = sum(1 for c in counts if c == top)
    return max(len(tasks), (top - 1) * (n + 1) + tied)

def test_scheduler():
    assert least_interval(["A", "A", "A", "B", "B", "B"], 2) == 8
    assert least_interval(["A", "B", "C"], 2) == 3`, test: true },
  { h: "5. Word break (DP)",
    code: `def word_break(s, words):
    words = set(words)
    ok = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        ok[i] = any(ok[j] and s[j:i] in words for j in range(i))
    return ok[-1]

def test_word_break():
    assert word_break("kochibiryani", ["kochi", "biryani"])
    assert not word_break("catsandog", ["cats", "dog", "sand", "and", "cat"])`, test: true }
 ],
 mistakes: [
  "Not saying the pattern out loud before coding.",
  "Skipping edge cases (single element, cycles, empty input).",
  "Forgetting complexity: rotated search O(log n), course schedule O(V + E), histogram O(n), scheduler O(n), word break O(n²)."
 ],
 practice: [
  { q: "Number of ways to decode a digit string where 1–26 map to A–Z (\"226\" → 3).", code: `def decodings(s):
    if not s or s[0] == "0": return 0
    prev2, prev1 = 1, 1
    for i in range(1, len(s)):
        cur = prev1 if s[i] != "0" else 0
        if 10 <= int(s[i - 1:i + 1]) <= 26:
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1

print(decodings("226"), decodings("06"), decodings("11106"))` },
  { q: "Make a weekly plan: one DSA problem a day from each pattern. How would you track it?", a: "Make a list of patterns (hashing, two pointers, window, prefix, stack, linked list, binary search, recursion, trees, graphs, heaps, DP). Each day solve one problem from the next pattern; note the date, time taken and whether you needed a hint; revisit failed ones after 3 days and after a week." }
 ],
 check: [
  ["Rotated sorted array search is…", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 1, "One half is always sorted."],
  ["Course schedule is really…", ["Sorting", "Cycle detection / topological sort", "Two pointers", "DP"], 1, "Dependencies graph."],
  ["Word break is solved with…", ["A heap", "DP over prefixes", "BFS only", "Binary search"], 1, "ok[i] from earlier ok[j]."]
 ],
 remember: [
  "Recognise → name the pattern → plan → code → test → complexity.",
  "Mixed practice daily beats long sessions weekly.",
  "Revisit failed problems after a few days."
 ]
}
];
