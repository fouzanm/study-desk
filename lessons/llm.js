// Lessons for course "llm". Keys are "course:lessonId" (see catalog/topics.js).
(function (L) {
L["llm:ai-engineer-role"] = {
 "title": "What an AI Engineer does",
 "one": "An AI Engineer <b>builds useful products on top of AI models</b> — like a chatbot that answers from company documents — and makes them reliable in production.",
 "learn": [
  "You usually don't train models. You <b>use</b> models (through an API like Claude or GPT) and build everything around them: the data they read, the tools they can use, the checks on their answers, and the server that runs it all.",
  "Job posts show this clearly: most ask for <b>Python</b>, <b>RAG</b> (answering from your own documents), <b>prompting</b>, <b>calling LLM APIs</b>, <b>agents</b>, plus normal engineering like Docker and cloud. Model training is rare.",
  "<b>AI Engineer</b> = builds AI apps. <b>ML Engineer</b> = trains and serves models. <b>Data Scientist</b> = analyses data and experiments."
 ],
 "points": [
  "Typical tasks: a support assistant, document Q&A, an invoice reader, an agent that updates a CRM.",
  "What makes you strong: you can prove your app works (evaluation) and keep it safe and cheap."
 ],
 "try": "Write down 3 problems from your own work that an AI app could solve. For each: what data does it need, and what could go wrong?",
 "remember": [
  "AI Engineer = build and ship apps using models.",
  "Core skills: Python, APIs, prompting, RAG, agents, evaluation, deployment.",
  "Training models is a small part of most job posts."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
