// Course template. Copy this file (e.g. courses/system-design.js),
// fill it in, then add this line in index.html next to the other courses:
//   <script src="courses/system-design.js"></script>
// Not loaded by default.
(window.STUDY_COURSES = window.STUDY_COURSES || []).push({
  id: "my-course",                 // unique, lowercase, no spaces. Never change it later (your progress is saved under it)
  title: "My Course",
  description: "One sentence about what this course covers.",
  hoursPerDay: [1, 1, 1, 1, 1, 3, 1],  // Mon..Sun
  areas: {                         // topic areas and their colors
    "Basics": "#7b8cff",
    "Practice": "#3fd69b"
  },
  // One entry per week: [area, week title, [7 topics, one per day]]
  weeks: [
    ["Basics", "Getting started", ["Topic for day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6 (longer session)", "Review + quiz"]],
    ["Practice", "First project", ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Review + quiz"]]
  ],
  // Optional quizzes by week number: [question, [options], correctIndex (0 = first), explanation]
  quiz: {
    1: [
      ["Example question?", ["Option A", "Option B", "Option C", "Option D"], 1, "Why B is right."]
    ]
  }
});
