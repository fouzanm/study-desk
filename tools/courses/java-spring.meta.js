module.exports = {
 title: "Java & Spring Boot",
 description: "Java for Python developers: modern Java essentials, lambdas and streams, Spring Boot REST APIs, Spring Data JPA and transactions, testing with JUnit and Mockito, and building and running services.",
 lessons: [
  ["java-basics", "Java essentials for Python developers"],
  ["java-streams", "Lambdas and streams"],
  ["spring-boot", "Spring Boot: building a REST API"],
  ["jpa", "Spring Data JPA and transactions"],
  ["junit", "Testing with JUnit and Mockito"],
  ["build", "Build, package and run Java services"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Compare strings' contents in Java with…", ["==", ".equals()", "===", "is"], 1, "== compares references."],
  ["Best type for money?", ["double", "long paise or BigDecimal", "float", "String"], 1, "No floating-point errors."],
  ["A record is…", ["A DB row", "An immutable data class with generated methods", "A log line", "A map"], 1, "Like a frozen dataclass."],
  ["Optional is for…", ["Speed", "Values that may be missing, instead of null", "Threads", "Collections"], 1, "Avoid NullPointerException."],
  ["Group and sum by customer with streams uses…", ["joining", "groupingBy + summingInt", "Stream.of", "reduce only"], 1, "Classic task."],
  ["Predicate<T> is…", ["A value", "A true/false test", "A factory", "A logger"], 1, "test(t)."],
  ["Spring endpoint for POST /orders?", ["@GetMapping", "@PostMapping on a @RestController", "@Service", "@Entity"], 1, "Like @app.post."],
  ["Preferred injection style?", ["Field @Autowired", "Constructor injection", "Static fields", "new"], 1, "Testable."],
  ["Where do business rules go?", ["Controllers", "Services", "YAML", "Entities only"], 1, "Thin controllers."],
  ["Central HTTP error handling?", ["try/catch everywhere", "@RestControllerAdvice", "Logging", "Filters only"], 1, "One place."],
  ["Return entities from controllers?", ["Yes", "No; return DTO records", "Only lists", "Only with JSON"], 1, "Avoid leaking internals."],
  ["Spring Data method findByStatus…", ["Needs SQL", "Generates the query from the name", "Is invalid", "Uses NoSQL"], 1, "Derived queries."],
  ["@Transactional makes a method…", ["Faster", "All-or-nothing", "Async", "Cached"], 1, "Commit or roll back together."],
  ["@Version gives…", ["Speed", "Optimistic locking", "Auditing", "Caching"], 1, "Detect conflicts."],
  ["Fix N+1 in JPA with…", ["open-in-view", "join fetch / @EntityGraph / projections", "Bigger pool", "More RAM"], 1, "Load deliberately."],
  ["Production schema changes should use…", ["ddl-auto: update", "Flyway/Liquibase migrations", "Manual SQL", "Never"], 1, "Versioned."],
  ["JUnit annotation for many input cases?", ["@Test", "@ParameterizedTest", "@Mock", "@Before"], 1, "With @CsvSource."],
  ["Why Testcontainers over H2?", ["Faster", "Real PostgreSQL catches SQL differences", "No Docker", "Required"], 1, "Real DB."],
  ["Why commit mvnw?", ["Style", "Same build tool version everywhere", "Git needs it", "Speed"], 1, "Reproducible."],
  ["Heap setting in containers?", ["Fixed -Xmx always", "-XX:MaxRAMPercentage", "None", "-Xss"], 1, "Fits limits."]
 ]
};
