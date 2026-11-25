module.exports = {
 title: "OOP, Design Patterns & Testing",
 description: "Write code that's easy to change: object-oriented design, SOLID, clean code habits, the patterns teams really use, dependency injection, a test strategy, and a small well-designed library.",
 lessons: [
  ["oop", "Object-oriented design"],
  ["solid", "SOLID in plain words"],
  ["clean-code", "Clean code: names, functions, errors"],
  ["patterns", "Design patterns that get used"],
  ["di", "Dependency injection and testable design"],
  ["testing", "Testing strategy: unit, integration, E2E"],
  ["build-library", "Project: a small, well-designed library"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Encapsulation means…", ["Everything public", "Data kept with the behaviour that enforces its rules", "Inheritance", "Comments"], 1, "Protect invariants."],
  ["“Has a” relationships suggest…", ["Inheritance", "Composition", "Globals", "Static methods"], 1, "Build from parts."],
  ["An abstract base class is for…", ["Speed", "Stating a contract implementations follow", "Hiding code", "Testing only"], 1, "Polymorphism with a clear interface."],
  ["Single responsibility means…", ["One method", "One reason to change", "One file", "One user"], 1, "One job."],
  ["Open/closed: a new case should…", ["Edit a long if/elif", "Be added without changing existing code", "Need a rewrite", "Be impossible"], 1, "Extend, don't modify."],
  ["A subclass that throws 'not supported' for a parent method breaks…", ["S", "O", "Liskov", "DI"], 2, "Children must keep the promise."],
  ["Dependency inversion says logic should…", ["Create its own DB clients", "Receive its dependencies", "Use globals", "Avoid classes"], 1, "Inject them."],
  ["Best boolean name?", ["flag", "is_paid", "x", "check"], 1, "Reads like a question."],
  ["Guard clauses…", ["Add nesting", "Return early so the main path is flat", "Hide errors", "Slow code"], 1, "Less nesting."],
  ["The same tax rate in 3 files is a problem because…", ["Style", "One change gets missed: rules belong in one place", "Python forbids it", "Speed"], 1, "No duplicated rules."],
  ["Good comments explain…", ["Each line", "Why something non-obvious is done", "The author", "Nothing"], 1, "Reasons, not mechanics."],
  ["Wrapping three courier APIs behind one interface is…", ["Observer", "Adapter", "Singleton", "Strategy"], 1, "Make them fit."],
  ["Picking a pricing rule at runtime is…", ["Strategy", "Repository", "Observer", "Decorator"], 0, "Swap the algorithm."],
  ["Adding retries around a function in Python is often a…", ["Factory", "Decorator", "Adapter", "Repository"], 1, "Wrap behaviour."],
  ["The Repository pattern hides…", ["Rules", "Where data is stored", "Errors", "UI"], 1, "save/get interface."],
  ["Why inject a clock?", ["Speed", "So tests can fix the time", "Required", "Style"], 1, "Controllable time."],
  ["Where are real dependencies wired?", ["Everywhere", "Once at start-up", "In tests", "In templates"], 1, "The composition root."],
  ["Most tests should be…", ["E2E", "Unit tests", "Manual", "Load tests"], 1, "The pyramid."],
  ["Why integration tests with a real DB?", ["Speed", "Fakes can't catch wrong SQL or constraints", "Required", "Coverage"], 1, "Real interactions."],
  ["When is a mock most useful?", ["Always", "Verifying an important call happened", "Replacing all logic", "Never"], 1, "Use sparingly."]
 ]
};
