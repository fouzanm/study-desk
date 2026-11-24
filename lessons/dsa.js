// Lessons for course "dsa". Keys are "course:lessonId" (see catalog/topics.js).
(function (L) {
L["dsa:big-o"] = {
 "title": "Big-O in plain words",
 "one": "<b>Big-O</b> tells you how much slower your code gets when the input gets bigger.",
 "learn": [
  "Imagine finding a name in a phone book. Reading every page is <b>O(n)</b>: twice the pages, twice the work. Opening the middle and halving each time is <b>O(log n)</b>: a million pages takes only about 20 steps.",
  "<b>O(1)</b>: same time whatever the size (looking up a key in a dict). <b>O(n)</b>: one loop. <b>O(n²)</b>: a loop inside a loop. <b>O(n log n)</b>: good sorting.",
  "Drop constants and small parts: <code>2n + 5</code> is just O(n). Interviewers want the big picture.",
  "Space matters too: making a copy of the list uses O(n) extra memory."
 ],
 "ex": "def has_duplicate_slow(nums):      # O(n²)\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] == nums[j]:\n                return True\n    return False\n\ndef has_duplicate_fast(nums):      # O(n) time, O(n) space\n    seen = set()\n    for x in nums:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False",
 "try": "Write the Big-O for: summing a list; printing every pair of items; binary search on a sorted list.",
 "remember": [
  "O(1) < O(log n) < O(n) < O(n log n) < O(n²).",
  "Loop = O(n). Loop in a loop = O(n²).",
  "A set or dict often turns O(n²) into O(n)."
 ]
};

L["dsa:two-pointers"] = {
 "title": "Arrays, strings and two pointers",
 "one": "<b>Two pointers</b>: one index from the start, one from the end (or both moving forward), so you solve it in one pass.",
 "learn": [
  "Arrays (Python lists) give instant access by position: <code>nums[3]</code> is O(1). Inserting in the middle is O(n) because items shift.",
  "Use two pointers when the data is <b>sorted</b> or when you compare both ends, like checking a palindrome.",
  "Move the pointer that makes progress, and stop when they meet."
 ],
 "ex": "def is_palindrome(s: str) -> bool:\n    s = ''.join(c.lower() for c in s if c.isalnum())\n    left, right = 0, len(s) - 1\n    while left < right:\n        if s[left] != s[right]:\n            return False\n        left += 1\n        right -= 1\n    return True\n\nprint(is_palindrome('A man, a plan, a canal: Panama'))  # True",
 "try": "Given a sorted list and a target, return the two positions whose values add up to the target, in O(n), using two pointers.",
 "remember": [
  "Two pointers work great on sorted data and 'both ends' problems.",
  "One pass = O(n), no extra memory.",
  "Ask: which pointer should move to get closer to the answer?"
 ]
};

L["dsa:hashing"] = {
 "title": "Hash maps and sets",
 "one": "A <b>hash map</b> (Python dict) finds a value by its key in about one step. It's the most useful tool in coding interviews.",
 "learn": [
  "Use a <b>set</b> to answer 'have I seen this before?' in O(1).",
  "Use a <b>dict</b> to count things, or to remember where you saw something.",
  "Classic: <b>Two-sum</b>. For each number, check if <code>target - number</code> is already in the dict. One pass, O(n)."
 ],
 "ex": "def two_sum(nums, target):\n    seen = {}                     # value -> index\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n\nprint(two_sum([2, 7, 11, 15], 9))   # [0, 1]\n\nfrom collections import Counter\nprint(Counter('banana'))             # {'a': 3, 'n': 2, 'b': 1}",
 "try": "Group words that are anagrams: <code>['eat','tea','tan','ate','nat']</code> → <code>[['eat','tea','ate'],['tan','nat']]</code>. Hint: use the sorted word as the dict key.",
 "remember": [
  "Set = seen before? Dict = count or remember positions.",
  "Two-sum: look for target − x in a dict.",
  "Hash lookups are O(1) on average."
 ]
};

L["dsa:sliding-window"] = {
 "title": "Sliding window",
 "one": "A <b>sliding window</b> is a range that grows on the right and shrinks on the left, so you never re-check the same items.",
 "learn": [
  "Use it for 'longest/shortest/best <b>continuous</b> part of an array or string'.",
  "Move the right edge to add an item. If the window breaks a rule, move the left edge until it's valid again. Track the best answer as you go.",
  "Each item enters and leaves once, so it's O(n)."
 ],
 "ex": "def longest_unique(s: str) -> int:\n    seen = set()\n    left = best = 0\n    for right, ch in enumerate(s):\n        while ch in seen:          # window broken: shrink\n            seen.remove(s[left])\n            left += 1\n        seen.add(ch)\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest_unique('abcabcbb'))   # 3 ('abc')",
 "try": "Find the maximum sum of any 3 consecutive numbers in <code>[2, 1, 5, 1, 3, 2]</code> (answer: 9) using a sliding window.",
 "remember": [
  "'Continuous part' + 'longest/shortest' = sliding window.",
  "Grow right, shrink left when the rule breaks.",
  "O(n): each item enters and leaves once."
 ]
};

L["dsa:prefix-sorting"] = {
 "title": "Prefix sums and sorting tricks",
 "one": "A <b>prefix sum</b> stores running totals, so the sum of any range is one subtraction.",
 "learn": [
  "<code>prefix[i]</code> = sum of the first i numbers. Sum from i to j = <code>prefix[j+1] − prefix[i]</code>. Building it is O(n); every range question after that is O(1).",
  "<b>Sorting first</b> often makes a problem easy: duplicates sit next to each other, two pointers start working, intervals can be merged in order. Sorting costs O(n log n).",
  "Python: <code>sorted(items, key=lambda x: x[1])</code> sorts by the second field."
 ],
 "ex": "nums = [3, 1, 4, 1, 5]\nprefix = [0]\nfor x in nums:\n    prefix.append(prefix[-1] + x)   # [0,3,4,8,9,14]\n\n# sum of nums[1..3] = 1+4+1 = 6\nprint(prefix[4] - prefix[1])        # 6\n\n# merge overlapping meetings after sorting by start\nmeetings = sorted([(1,3),(8,10),(2,6)])\nmerged = [meetings[0]]\nfor s, e in meetings[1:]:\n    if s <= merged[-1][1]:\n        merged[-1] = (merged[-1][0], max(merged[-1][1], e))\n    else:\n        merged.append((s, e))\nprint(merged)                       # [(1, 6), (8, 10)]",
 "try": "Given daily sales for 30 days, answer 'total sales from day 10 to day 20' instantly using a prefix sum.",
 "remember": [
  "Range sum = prefix[j+1] − prefix[i].",
  "Stuck? Try sorting first.",
  "Sorting is O(n log n)."
 ]
};

L["dsa:practice-1"] = {
 "title": "Practice: solve problems like an interview",
 "one": "Today you practise the method, not just answers: <b>understand → brute force → improve → test</b>.",
 "learn": [
  "<b>1. Understand:</b> repeat the problem in your words and ask about edge cases (empty input, negatives, duplicates).",
  "<b>2. Brute force:</b> say the simple solution and its Big-O, even if slow.",
  "<b>3. Improve:</b> which tool helps? Set/dict, two pointers, sliding window, sorting, prefix sum.",
  "<b>4. Test:</b> walk through a small example by hand, then edge cases. Talk the whole time."
 ],
 "points": [
  "Easy: Contains duplicate · Valid anagram · Two sum · Best time to buy and sell stock · Valid palindrome",
  "Easy: Move zeroes · Merge sorted array · Majority element · Missing number · Running sum",
  "Medium: Longest substring without repeating characters · Group anagrams · Product of array except self"
 ],
 "try": "Solve the 13 problems on LeetCode or NeetCode, 25 minutes each. If stuck after 25 minutes, read the solution, then re-solve it tomorrow without looking.",
 "remember": [
  "Understand → brute force → improve → test.",
  "Name the pattern out loud.",
  "Re-solve problems you got wrong."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
