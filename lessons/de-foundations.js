// Lessons for course "de-foundations". Keys are "course:lessonId" (see catalog/topics.js).
(function (L) {
L["de-foundations:role"] = {
 "title": "What a data engineer does",
 "one": "A data engineer builds the <b>pipes</b> that move data from where it's created to where people use it — reliably, every day.",
 "learn": [
  "Think of an online shop. Orders are saved in the app's database. Clicks go to log files. Payments come from Razorpay. The business wants one dashboard: 'How much did we sell, and to whom?'",
  "The data engineer connects these. The journey has five steps, called the <b>data engineering lifecycle</b>:",
  "<b>1. Source</b> (where data is born) → <b>2. Ingest</b> (copy it in) → <b>3. Store</b> (data lake / warehouse) → <b>4. Transform</b> (clean, join, model) → <b>5. Serve</b> (dashboards, reports, ML).",
  "A data analyst asks questions of the data. A data scientist builds models. The data engineer makes sure the data is there, correct and on time."
 ],
 "points": [
  "Daily tools you'll learn: SQL, Python, dbt, Airflow, Spark, a cloud warehouse (Snowflake/BigQuery), S3.",
  "What 'good' means: correct numbers, on time, and pipelines that recover from failures."
 ],
 "try": "Draw the 5 lifecycle steps for an online shop on paper. For each step, write one example (e.g. Source = orders table in PostgreSQL).",
 "remember": [
  "Source → Ingest → Store → Transform → Serve.",
  "DE = reliable data pipes. Analyst = questions. Scientist = models.",
  "Every DE job asks for SQL and Python first."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
