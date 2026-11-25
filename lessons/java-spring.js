// Lessons for course "java-spring". Built by tools/course-builder from tools/courses/java-spring.js.
// Python examples were run and their real output stored.
(function (L) {
L["java-spring:java-basics"] = {
 "title": "Java essentials for Python developers",
 "level": "Beginner+",
 "one": "Java is <b>statically typed</b> and <b>compiled</b>: every variable has a type, code lives in <b>classes</b>, and the compiler catches many mistakes before the program runs. Modern Java (17/21) has records, <code>var</code>, and pattern matching that make it far less wordy.",
 "why": "Java and Spring Boot power a huge share of enterprise backends (banks, telecom, e-commerce, ERP integrations). Many software engineer job posts in India ask for Java even when the team also uses Python.",
 "steps": [
  {
   "h": "Hello, types",
   "p": [
    "Every program starts in <code>main</code>. Types come before names (or use <code>var</code> when obvious). Statements end with semicolons; blocks use braces."
   ],
   "lang": "java",
   "code": "public class Main {\n    public static void main(String[] args) {\n        String name = \"Asha\";\n        int orders = 3;\n        double total = 64_500.50;\n        boolean member = true;\n        var city = \"Kochi\";                  // type inferred: String\n        System.out.println(name + \" from \" + city + \" placed \" + orders + \" orders worth \" + total);\n        System.out.printf(\"member=%b, average=%.2f%n\", member, total / orders);\n    }\n}",
   "out": {
    "text": "Asha from Kochi placed 3 orders worth 64500.5\nmember=true, average=21500.17"
   }
  },
  {
   "h": "Classes and records",
   "p": [
    "A <b>record</b> is an immutable data class in one line (like a frozen Python dataclass): constructor, getters, equals, hashCode and toString included."
   ],
   "lang": "java",
   "code": "public class Main {\n    record Product(String sku, String name, int pricePaise) {\n        Product {\n            if (pricePaise < 0) throw new IllegalArgumentException(\"price must be >= 0\");\n        }\n        double priceRupees() { return pricePaise / 100.0; }\n    }\n\n    static class Cart {\n        private final java.util.List<Product> items = new java.util.ArrayList<>();\n        void add(Product p) { items.add(p); }\n        int totalPaise() { return items.stream().mapToInt(Product::pricePaise).sum(); }\n    }\n\n    public static void main(String[] args) {\n        var tea = new Product(\"TEA\", \"Green Tea\", 40_000);\n        var cart = new Cart();\n        cart.add(tea);\n        cart.add(new Product(\"COF\", \"Coffee Beans\", 90_000));\n        System.out.println(tea);\n        System.out.println(tea.name() + \" costs ₹\" + tea.priceRupees());\n        System.out.println(\"cart total paise: \" + cart.totalPaise());\n        System.out.println(tea.equals(new Product(\"TEA\", \"Green Tea\", 40_000)));\n    }\n}",
   "out": {
    "text": "Product[sku=TEA, name=Green Tea, pricePaise=40000]\nGreen Tea costs ₹400.0\ncart total paise: 130000\ntrue"
   }
  },
  {
   "h": "Collections: List, Map, Set",
   "lang": "java",
   "code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<String> statuses = List.of(\"paid\", \"pending\", \"paid\", \"cancelled\", \"paid\");\n        Map<String, Integer> counts = new TreeMap<>();\n        for (String s : statuses) {\n            counts.merge(s, 1, Integer::sum);\n        }\n        Set<String> unique = new HashSet<>(statuses);\n        System.out.println(counts);\n        System.out.println(unique.size() + \" distinct statuses\");\n        System.out.println(counts.getOrDefault(\"refunded\", 0));\n    }\n}",
   "note": "<code>List.of</code> makes an immutable list. Use <code>new ArrayList&lt;&gt;(...)</code> when you need to change it.",
   "out": {
    "text": "{cancelled=1, paid=3, pending=1}\n3 distinct statuses\n0"
   }
  },
  {
   "h": "null, Optional and exceptions",
   "p": [
    "<code>NullPointerException</code> is Java's most common crash. Return <code>Optional</code> when a value may be missing, and throw specific exceptions for broken rules."
   ],
   "lang": "java",
   "code": "import java.util.*;\n\npublic class Main {\n    static final Map<Integer, String> CUSTOMERS = Map.of(1, \"Asha\", 2, \"Ben\");\n\n    static Optional<String> findCustomer(int id) {\n        return Optional.ofNullable(CUSTOMERS.get(id));\n    }\n\n    static class OrderNotFoundException extends RuntimeException {\n        OrderNotFoundException(int id) { super(\"order \" + id + \" not found\"); }\n    }\n\n    public static void main(String[] args) {\n        System.out.println(findCustomer(1).orElse(\"unknown\"));\n        System.out.println(findCustomer(9).map(String::toUpperCase).orElse(\"unknown\"));\n        try {\n            throw new OrderNotFoundException(42);\n        } catch (OrderNotFoundException e) {\n            System.out.println(\"handled: \" + e.getMessage());\n        }\n    }\n}",
   "out": {
    "text": "Asha\nunknown\nhandled: order 42 not found"
   }
  },
  {
   "h": "Switch and pattern matching (Java 21)",
   "lang": "java",
   "code": "public class Main {\n    sealed interface Payment permits Card, Upi, Cash {}\n    record Card(String last4) implements Payment {}\n    record Upi(String vpa) implements Payment {}\n    record Cash() implements Payment {}\n\n    static String describe(Payment p) {\n        return switch (p) {\n            case Card c -> \"card ending \" + c.last4();\n            case Upi u -> \"UPI \" + u.vpa();\n            case Cash c -> \"cash on delivery\";\n        };\n    }\n\n    public static void main(String[] args) {\n        for (Payment p : new Payment[]{new Card(\"4242\"), new Upi(\"asha@okbank\"), new Cash()}) {\n            System.out.println(describe(p));\n        }\n    }\n}",
   "note": "Because <code>Payment</code> is <code>sealed</code>, the compiler checks the switch covers every case.",
   "out": {
    "text": "card ending 4242\nUPI asha@okbank\ncash on delivery"
   }
  }
 ],
 "mistakes": [
  "Comparing strings with <code>==</code> (compares references). Use <code>.equals()</code>.",
  "Returning null everywhere, then crashing with NullPointerException.",
  "Using <code>double</code> for money; use <code>long</code> paise or <code>BigDecimal</code>.",
  "Mutable public fields instead of private fields with methods (or records)."
 ],
 "practice": [
  {
   "q": "Count words in a sentence with a Map and print them sorted.",
   "lang": "java",
   "code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        String text = \"tea coffee tea milk tea coffee\";\n        Map<String, Integer> counts = new TreeMap<>();\n        for (String w : text.split(\" \")) counts.merge(w, 1, Integer::sum);\n        System.out.println(counts);\n    }\n}",
   "out": {
    "text": "{coffee=2, milk=1, tea=3}"
   }
  },
  {
   "q": "Why does <code>new String(\"tea\") == \"tea\"</code> give false?",
   "a": "<code>==</code> compares whether two references point to the same object; <code>new String</code> creates a different object. <code>.equals()</code> compares the contents and gives true."
  }
 ],
 "check": [
  [
   "Best Java type for money?",
   [
    "double",
    "long (paise) or BigDecimal",
    "float",
    "String"
   ],
   1,
   "Avoid floating-point errors."
  ],
  [
   "Compare two strings' contents with…",
   [
    "==",
    ".equals()",
    "===",
    "compare()"
   ],
   1,
   "== compares references."
  ],
  [
   "A Java record is…",
   [
    "A database row",
    "An immutable data class with generated methods",
    "A log entry",
    "A map"
   ],
   1,
   "Like a frozen dataclass."
  ]
 ],
 "remember": [
  "Static types; code in classes; main is the entry point; var for local inference.",
  "Records for immutable data; private fields + methods for behaviour.",
  "List/Map/Set; List.of is immutable; map.merge to count.",
  "Optional for maybe-missing values; specific exceptions.",
  ".equals() for strings; long/BigDecimal for money."
 ]
};
L["java-spring:java-streams"] = {
 "title": "Lambdas and streams",
 "level": "Intermediate",
 "one": "<b>Streams</b> process collections as a pipeline: <code>filter</code> → <code>map</code> → <code>collect</code>, with <b>lambdas</b> (<code>o -&gt; o.total() &gt; 5000</code>). It's Java's version of Python comprehensions and pandas-style grouping.",
 "why": "Modern Java code is full of streams. Interviewers often ask you to “group and sum” with them, and Spring code uses lambdas everywhere.",
 "steps": [
  {
   "h": "filter, map, collect",
   "lang": "java",
   "code": "import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    record Order(int id, String customer, String status, int total) {}\n\n    public static void main(String[] args) {\n        List<Order> orders = List.of(\n            new Order(1, \"Asha\", \"completed\", 55000), new Order(2, \"Asha\", \"completed\", 6900),\n            new Order(3, \"Ben\", \"completed\", 9200), new Order(4, \"Chen\", \"cancelled\", 3000),\n            new Order(5, \"Ben\", \"completed\", 3600));\n\n        List<Integer> bigIds = orders.stream()\n            .filter(o -> o.status().equals(\"completed\"))\n            .filter(o -> o.total() > 5000)\n            .map(Order::id)\n            .toList();\n        int revenue = orders.stream().filter(o -> o.status().equals(\"completed\")).mapToInt(Order::total).sum();\n        System.out.println(bigIds + \" revenue=\" + revenue);\n    }\n}",
   "out": {
    "text": "[1, 2, 3] revenue=74700"
   }
  },
  {
   "h": "Grouping and summing",
   "lang": "java",
   "code": "import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    record Order(int id, String customer, String status, int total) {}\n\n    public static void main(String[] args) {\n        List<Order> orders = List.of(\n            new Order(1, \"Asha\", \"completed\", 55000), new Order(2, \"Asha\", \"completed\", 6900),\n            new Order(3, \"Ben\", \"completed\", 9200), new Order(4, \"Chen\", \"cancelled\", 3000),\n            new Order(5, \"Ben\", \"completed\", 3600));\n\n        Map<String, Integer> spend = orders.stream()\n            .filter(o -> o.status().equals(\"completed\"))\n            .collect(Collectors.groupingBy(Order::customer, TreeMap::new, Collectors.summingInt(Order::total)));\n        Map<String, Long> byStatus = orders.stream()\n            .collect(Collectors.groupingBy(Order::status, TreeMap::new, Collectors.counting()));\n        Optional<Order> biggest = orders.stream().max(Comparator.comparingInt(Order::total));\n\n        System.out.println(spend);\n        System.out.println(byStatus);\n        System.out.println(biggest.map(Order::id).orElse(-1));\n    }\n}",
   "out": {
    "text": "{Asha=61900, Ben=12800}\n{cancelled=1, completed=4}\n1"
   }
  },
  {
   "h": "Sorting and joining",
   "lang": "java",
   "code": "import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    record Product(String name, String category, int price) {}\n\n    public static void main(String[] args) {\n        var products = List.of(new Product(\"Laptop\", \"Electronics\", 55000), new Product(\"Tea\", \"Grocery\", 400),\n                               new Product(\"Headphones\", \"Electronics\", 3000), new Product(\"Coffee\", \"Grocery\", 900));\n        String list = products.stream()\n            .sorted(Comparator.comparing(Product::category).thenComparing(Product::price, Comparator.reverseOrder()))\n            .map(p -> p.category() + \":\" + p.name())\n            .collect(Collectors.joining(\", \"));\n        System.out.println(list);\n    }\n}",
   "out": {
    "text": "Electronics:Laptop, Electronics:Headphones, Grocery:Coffee, Grocery:Tea"
   }
  },
  {
   "h": "Functional interfaces",
   "p": [
    "A lambda is an implementation of a one-method interface: <code>Predicate&lt;T&gt;</code> (test), <code>Function&lt;T,R&gt;</code> (map), <code>Supplier&lt;T&gt;</code> (create), <code>Consumer&lt;T&gt;</code> (use). Passing behaviour around is how Strategy works in Java."
   ],
   "lang": "java",
   "code": "import java.util.function.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Predicate<Integer> isBig = total -> total > 10_000;\n        Function<Integer, Integer> withTax = total -> Math.round(total * 1.18f);\n        Supplier<String> newId = () -> \"ORD-\" + 1001;\n        System.out.println(isBig.test(55000) + \" \" + withTax.apply(1000) + \" \" + newId.get());\n    }\n}",
   "out": {
    "text": "true 1180 ORD-1001"
   }
  }
 ],
 "mistakes": [
  "Side effects inside streams (modifying outside lists in map/filter).",
  "Very long stream chains nobody can read: split into named steps.",
  "Using streams for simple loops where a for-loop is clearer.",
  "Calling .get() on an Optional without checking; use orElse/orElseThrow."
 ],
 "practice": [
  {
   "q": "From a list of words, return the distinct words longer than 3 letters, upper-cased and sorted.",
   "lang": "java",
   "code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        var words = List.of(\"tea\", \"coffee\", \"milk\", \"coffee\", \"sugar\", \"ice\");\n        System.out.println(words.stream().filter(w -> w.length() > 3).distinct().map(String::toUpperCase).sorted().toList());\n    }\n}",
   "out": {
    "text": "[COFFEE, MILK, SUGAR]"
   }
  },
  {
   "q": "Average order total per customer with Collectors.averagingInt.",
   "lang": "java",
   "code": "import java.util.*;\nimport java.util.stream.*;\n\npublic class Main {\n    record Order(String customer, int total) {}\n    public static void main(String[] args) {\n        var orders = List.of(new Order(\"Asha\", 55000), new Order(\"Asha\", 6900), new Order(\"Ben\", 9200));\n        Map<String, Double> avg = orders.stream()\n            .collect(Collectors.groupingBy(Order::customer, TreeMap::new, Collectors.averagingInt(Order::total)));\n        System.out.println(avg);\n    }\n}",
   "out": {
    "text": "{Asha=30950.0, Ben=9200.0}"
   }
  }
 ],
 "check": [
  [
   "Stream equivalent of a Python list comprehension with a condition?",
   [
    "forEach",
    "filter + map + toList",
    "reduce only",
    "sorted"
   ],
   1,
   "Filter then transform."
  ],
  [
   "Group and sum by customer uses…",
   [
    "Collectors.joining",
    "Collectors.groupingBy + summingInt",
    "Stream.of",
    "Optional"
   ],
   1,
   "Classic interview task."
  ],
  [
   "Predicate<T> represents…",
   [
    "A value",
    "A true/false test",
    "A factory",
    "A consumer"
   ],
   1,
   "test(t) → boolean."
  ]
 ],
 "remember": [
  "stream().filter().map().toList() / collect(...).",
  "groupingBy(key, summingInt / counting / averagingInt).",
  "Comparator.comparing(...).thenComparing(...); reverseOrder().",
  "Predicate, Function, Supplier, Consumer = lambda types.",
  "No side effects in streams; readable over clever."
 ]
};
L["java-spring:spring-boot"] = {
 "title": "Spring Boot: building a REST API",
 "level": "Intermediate",
 "one": "<b>Spring Boot</b> builds production Java services quickly: <code>@RestController</code> for endpoints, <b>dependency injection</b> wiring your classes together, validation, configuration per environment, and an embedded web server.",
 "why": "Spring Boot is the most common Java backend framework in job posts. If you know FastAPI, the ideas map directly: routes, models, validation, dependencies.",
 "steps": [
  {
   "h": "Project structure",
   "p": [
    "Generate a project at <b>start.spring.io</b> (dependencies: Spring Web, Validation, Spring Data JPA, PostgreSQL Driver, Actuator). Code is organised in layers:"
   ],
   "code": "src/main/java/com/acme/shop/\n├── ShopApplication.java          @SpringBootApplication: starts everything\n├── order/\n│   ├── OrderController.java      HTTP layer: routes, status codes\n│   ├── OrderService.java         business rules\n│   ├── OrderRepository.java      database access (Spring Data JPA)\n│   ├── Order.java                entity\n│   └── dto/CreateOrderRequest.java, OrderResponse.java\n└── common/ApiExceptionHandler.java\nsrc/main/resources/application.yml",
   "lang": "text"
  },
  {
   "h": "A controller with validation",
   "lang": "java",
   "run": false,
   "code": "@RestController\n@RequestMapping(\"/orders\")\nclass OrderController {\n    private final OrderService service;\n\n    OrderController(OrderService service) {          // constructor injection\n        this.service = service;\n    }\n\n    record ItemRequest(@NotBlank String sku, @Positive int qty) {}\n    record CreateOrderRequest(@Email String customerEmail, @NotEmpty List<@Valid ItemRequest> items) {}\n\n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    OrderResponse create(@Valid @RequestBody CreateOrderRequest req) {\n        return service.create(req);\n    }\n\n    @GetMapping(\"/{id}\")\n    OrderResponse get(@PathVariable long id) {\n        return service.get(id);                      // throws OrderNotFoundException → 404\n    }\n\n    @GetMapping\n    List<OrderResponse> list(@RequestParam(required = false) String status) {\n        return service.list(status);\n    }\n}",
   "out": {
    "text": "POST /orders {\"customerEmail\":\"asha@example.com\",\"items\":[{\"sku\":\"TEA\",\"qty\":2}]}\n→ 201 {\"id\":101,\"status\":\"PENDING\",\"total\":800}\n\nPOST /orders {\"customerEmail\":\"not-an-email\",\"items\":[]}\n→ 400 {\"errors\":{\"customerEmail\":\"must be a well-formed email address\",\"items\":\"must not be empty\"}}",
    "label": "Example output"
   }
  },
  {
   "h": "Services and dependency injection",
   "p": [
    "Classes annotated <code>@Service</code>, <code>@Repository</code>, <code>@Component</code> are created by Spring (as <b>beans</b>) and injected through constructors. That's the same DI idea from the clean-code course, done by the framework. Here's the idea in plain, runnable Java:"
   ],
   "lang": "java",
   "code": "import java.util.*;\n\npublic class Main {\n    interface OrderRepository { void save(String order); List<String> findAll(); }\n    interface Notifier { void send(String msg); }\n\n    static class OrderService {\n        private final OrderRepository repo;\n        private final Notifier notifier;\n        OrderService(OrderRepository repo, Notifier notifier) { this.repo = repo; this.notifier = notifier; }\n        void place(String order) { repo.save(order); notifier.send(\"placed \" + order); }\n    }\n\n    public static void main(String[] args) {\n        var stored = new ArrayList<String>();\n        OrderRepository memoryRepo = new OrderRepository() {\n            public void save(String o) { stored.add(o); }\n            public List<String> findAll() { return stored; }\n        };\n        var service = new OrderService(memoryRepo, msg -> System.out.println(\"notify: \" + msg));\n        service.place(\"ORD-6\");\n        System.out.println(memoryRepo.findAll());\n    }\n}",
   "note": "Spring does the “new OrderService(repo, notifier)” wiring for you at start-up; in tests you can still construct it by hand with fakes.",
   "out": {
    "text": "notify: placed ORD-6\n[ORD-6]"
   }
  },
  {
   "h": "Error handling in one place",
   "lang": "java",
   "run": false,
   "code": "@RestControllerAdvice\nclass ApiExceptionHandler {\n    @ExceptionHandler(OrderNotFoundException.class)\n    @ResponseStatus(HttpStatus.NOT_FOUND)\n    Map<String, String> notFound(OrderNotFoundException e) {\n        return Map.of(\"error\", e.getMessage());\n    }\n\n    @ExceptionHandler(MethodArgumentNotValidException.class)\n    @ResponseStatus(HttpStatus.BAD_REQUEST)\n    Map<String, Object> invalid(MethodArgumentNotValidException e) {\n        var errors = new TreeMap<String, String>();\n        e.getBindingResult().getFieldErrors().forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));\n        return Map.of(\"errors\", errors);\n    }\n}"
  },
  {
   "h": "Configuration and profiles",
   "code": "# src/main/resources/application.yml\nspring:\n  datasource:\n    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/shop}\n    username: ${DATABASE_USER:app}\n    password: ${DATABASE_PASSWORD:dev}\n  jpa:\n    open-in-view: false\nshop:\n  free-shipping-from: 999\nmanagement:\n  endpoints.web.exposure.include: health,info,prometheus\n---\nspring.config.activate.on-profile: test\nspring.datasource.url: jdbc:h2:mem:shop",
   "lang": "yaml",
   "p": [
    "Values come from environment variables with defaults; profiles (<code>dev</code>, <code>test</code>, <code>prod</code>) switch settings. <b>Actuator</b> gives <code>/actuator/health</code> and metrics for free. Bind your own settings to a <code>@ConfigurationProperties</code> record."
   ]
  }
 ],
 "mistakes": [
  "Field injection (<code>@Autowired private X x;</code>) instead of constructor injection: harder to test.",
  "Returning JPA entities directly from controllers; use DTOs (records).",
  "Business logic in controllers; keep it in services.",
  "Secrets in application.yml committed to Git."
 ],
 "practice": [
  {
   "q": "Map these FastAPI ideas to Spring Boot: <code>@app.get</code>, Pydantic model, <code>HTTPException(404)</code>, <code>Depends</code>.",
   "a": "<code>@GetMapping</code> on a <code>@RestController</code> method; a record DTO with Bean Validation annotations (<code>@Valid</code>); throwing a custom exception handled by <code>@RestControllerAdvice</code> with <code>@ResponseStatus(NOT_FOUND)</code>; constructor injection of <code>@Service</code>/<code>@Repository</code> beans."
  },
  {
   "q": "Write a record for a PATCH request that only allows the statuses PENDING, COMPLETED or CANCELLED.",
   "lang": "java",
   "code": "public class Main {\n    enum Status { PENDING, COMPLETED, CANCELLED }\n    record UpdateStatusRequest(Status status) {}\n\n    public static void main(String[] args) {\n        System.out.println(new UpdateStatusRequest(Status.valueOf(\"COMPLETED\")));\n        try {\n            Status.valueOf(\"LOST\");\n        } catch (IllegalArgumentException e) {\n            System.out.println(\"rejected: LOST is not a valid status\");\n        }\n    }\n}",
   "out": {
    "text": "UpdateStatusRequest[status=COMPLETED]\nrejected: LOST is not a valid status"
   }
  }
 ],
 "check": [
  [
   "Preferred way to inject dependencies in Spring?",
   [
    "Field @Autowired",
    "Constructor injection",
    "Static fields",
    "new inside methods"
   ],
   1,
   "Testable and explicit."
  ],
  [
   "Where do business rules belong?",
   [
    "Controllers",
    "Services",
    "application.yml",
    "Entities only"
   ],
   1,
   "Controllers stay thin."
  ],
  [
   "How do you turn exceptions into HTTP errors in one place?",
   [
    "try/catch in every method",
    "@RestControllerAdvice with @ExceptionHandler",
    "Logging",
    "Filters only"
   ],
   1,
   "Central handling."
  ]
 ],
 "remember": [
  "@RestController + @GetMapping/@PostMapping; @Valid DTO records.",
  "Layers: controller → service → repository.",
  "Constructor injection of beans (@Service, @Repository).",
  "@RestControllerAdvice for errors; return DTOs, not entities.",
  "application.yml with env vars and profiles; Actuator for health/metrics."
 ]
};
L["java-spring:jpa"] = {
 "title": "Spring Data JPA and transactions",
 "level": "Intermediate",
 "one": "<b>JPA/Hibernate</b> maps Java classes to tables; <b>Spring Data</b> writes queries from method names (<code>findByStatus</code>). <code>@Transactional</code> makes a service method all-or-nothing.",
 "why": "Most Spring Boot apps talk to a relational database through JPA. Knowing entities, repositories, N+1 and transactions is essential, and it's where most Spring performance bugs come from.",
 "steps": [
  {
   "h": "Entities",
   "lang": "java",
   "run": false,
   "code": "@Entity\n@Table(name = \"orders\")\nclass Order {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n\n    @ManyToOne(fetch = FetchType.LAZY, optional = false)\n    private Customer customer;\n\n    @Enumerated(EnumType.STRING)\n    private OrderStatus status = OrderStatus.PENDING;\n\n    private long totalPaise;\n\n    @OneToMany(mappedBy = \"order\", cascade = CascadeType.ALL, orphanRemoval = true)\n    private List<OrderLine> lines = new ArrayList<>();\n\n    @Version\n    private long version;                     // optimistic locking\n\n    protected Order() {}                      // for JPA\n    // constructor, getters, business methods...\n}"
  },
  {
   "h": "Repositories from method names",
   "lang": "java",
   "run": false,
   "code": "interface OrderRepository extends JpaRepository<Order, Long> {\n    List<Order> findByStatusOrderByIdDesc(OrderStatus status);\n\n    @Query(\"select o from Order o join fetch o.customer where o.status = :status\")\n    List<Order> findWithCustomerByStatus(@Param(\"status\") OrderStatus status);     // avoids N+1\n\n    @Query(\"select o.customer.id as customerId, sum(o.totalPaise) as spent from Order o group by o.customer.id\")\n    List<CustomerSpend> spendPerCustomer();\n}",
   "out": {
    "text": "findByStatusOrderByIdDesc(COMPLETED) generates:\nselect ... from orders o where o.status=? order by o.id desc",
    "label": "Example output"
   }
  },
  {
   "h": "Transactions",
   "p": [
    "<code>@Transactional</code> on a service method: everything inside commits together, or rolls back if a runtime exception is thrown. Keep transactions short; don't call slow external APIs inside them."
   ],
   "lang": "java",
   "run": false,
   "code": "@Service\nclass CheckoutService {\n    private final OrderRepository orders;\n    private final StockRepository stock;\n    private final ApplicationEventPublisher events;\n\n    @Transactional\n    Order checkout(long customerId, List<LineRequest> lines) {\n        for (var l : lines) {\n            int updated = stock.decrementIfAvailable(l.sku(), l.qty());     // UPDATE ... WHERE qty >= ?\n            if (updated == 0) throw new OutOfStockException(l.sku());        // rolls everything back\n        }\n        var order = orders.save(Order.create(customerId, lines));\n        events.publishEvent(new OrderPlaced(order.getId()));                 // handled after commit\n        return order;\n    }\n}"
  },
  {
   "h": "The N+1 problem, again",
   "p": [
    "Lazy relationships accessed in a loop fire one query per row, exactly like SQLAlchemy. Fixes: <code>join fetch</code> queries, <code>@EntityGraph</code>, or DTO projections. Turn on SQL logging in development (<code>spring.jpa.show-sql=true</code>) and watch the count.",
    "Here's the effect simulated in plain Java with a query counter:"
   ],
   "lang": "java",
   "code": "import java.util.*;\n\npublic class Main {\n    static int queries = 0;\n    static Map<Long, String> customers = new HashMap<>();\n    static String loadCustomer(long id) { queries++; return customers.get(id); }\n    static Map<Long, String> loadCustomers(Collection<Long> ids) { queries++; var m = new HashMap<Long, String>(); ids.forEach(i -> m.put(i, customers.get(i))); return m; }\n\n    public static void main(String[] args) {\n        List<long[]> orders = new ArrayList<>();            // {orderId, customerId}\n        for (long i = 1; i <= 50; i++) { customers.put(i, \"c\" + i); orders.add(new long[]{i, i}); }\n\n        queries = 1;                                        // the orders query\n        for (long[] o : orders) loadCustomer(o[1]);          // lazy load per order\n        System.out.println(\"lazy: \" + queries + \" queries\");\n\n        queries = 1;\n        var all = loadCustomers(orders.stream().map(o -> o[1]).toList());   // one batch fetch\n        System.out.println(\"batched: \" + queries + \" queries, \" + all.size() + \" customers\");\n    }\n}",
   "out": {
    "text": "lazy: 51 queries\nbatched: 2 queries, 50 customers"
   }
  },
  {
   "h": "Migrations with Flyway",
   "p": [
    "Don't let Hibernate change production tables (<code>ddl-auto: validate</code>). Write versioned SQL migrations that run on start-up, in order, exactly once:"
   ],
   "code": "src/main/resources/db/migration/\n  V1__create_customers_and_orders.sql\n  V2__add_order_version_column.sql\n  V3__index_orders_status.sql\n\n-- V3__index_orders_status.sql\nCREATE INDEX CONCURRENTLY IF NOT EXISTS orders_status_idx ON orders (status);",
   "lang": "sql"
  }
 ],
 "mistakes": [
  "Lazy loading in loops (N+1) and <code>open-in-view</code> hiding it.",
  "<code>ddl-auto: update</code> in production instead of migrations.",
  "Calling slow APIs inside @Transactional methods (long locks).",
  "Calling a @Transactional method from the same class (the proxy is bypassed, so no transaction)."
 ],
 "practice": [
  {
   "q": "Write a Spring Data method to find a customer's orders created after a date, newest first.",
   "lang": "java",
   "run": false,
   "code": "List<Order> findByCustomerIdAndCreatedAtAfterOrderByCreatedAtDesc(Long customerId, Instant after);"
  },
  {
   "q": "Why might @Transactional on a private method, or one called from inside the same class, not work?",
   "a": "Spring applies transactions through a proxy around the bean. Calls from outside go through the proxy; private methods and self-calls skip it, so no transaction starts. Put the transactional method on a public method of a bean called from another bean."
  }
 ],
 "check": [
  [
   "What does @Version on an entity give you?",
   [
    "Faster queries",
    "Optimistic locking",
    "Auditing",
    "Caching"
   ],
   1,
   "Conflicting updates are detected."
  ],
  [
   "Best fix for N+1 in Spring Data?",
   [
    "More RAM",
    "join fetch / @EntityGraph / projections",
    "open-in-view",
    "Bigger pool"
   ],
   1,
   "Load related data deliberately."
  ],
  [
   "How should production schemas change?",
   [
    "ddl-auto: update",
    "Versioned migrations (Flyway/Liquibase)",
    "By hand in the console",
    "Never"
   ],
   1,
   "Repeatable and reviewed."
  ]
 ],
 "remember": [
  "@Entity + JpaRepository; queries from method names or @Query.",
  "@Transactional on public service methods; short, no slow calls inside.",
  "N+1: join fetch, @EntityGraph, DTO projections; watch SQL logs.",
  "@Version for optimistic locking; enums as STRING.",
  "Flyway migrations; ddl-auto: validate in production."
 ]
};
L["java-spring:junit"] = {
 "title": "Testing Java with JUnit and Mockito",
 "level": "Intermediate",
 "one": "<b>JUnit 5</b> runs tests (<code>@Test</code>, assertions, parameterized tests). <b>Mockito</b> creates fakes for dependencies. Spring adds slice tests (<code>@WebMvcTest</code>, <code>@DataJpaTest</code>) and <b>Testcontainers</b> for a real database.",
 "why": "Java teams expect tests with every change. The same pyramid applies: many fast unit tests, some integration tests, few end-to-end.",
 "steps": [
  {
   "h": "A unit test",
   "lang": "java",
   "run": false,
   "code": "class PricingTest {\n    @Test\n    void freeShippingFrom999() {\n        assertEquals(0, Pricing.shippingFee(999));\n        assertEquals(79, Pricing.shippingFee(998));\n    }\n\n    @ParameterizedTest\n    @CsvSource({\"2000, WELCOME10, 1800\", \"10000, FEST20, 9000\"})\n    void couponsApplyWithCap(int total, String code, int expected) {\n        assertEquals(expected, Pricing.applyCoupon(total, code));\n    }\n\n    @Test\n    void unknownCouponIsRejected() {\n        var e = assertThrows(IllegalArgumentException.class, () -> Pricing.applyCoupon(500, \"FREE100\"));\n        assertTrue(e.getMessage().contains(\"invalid coupon\"));\n    }\n}",
   "out": {
    "text": "PricingTest\n  ✔ freeShippingFrom999()\n  ✔ couponsApplyWithCap(int, String, int) [1] 2000, WELCOME10, 1800\n  ✔ couponsApplyWithCap(int, String, int) [2] 10000, FEST20, 9000\n  ✔ unknownCouponIsRejected()\nTests run: 4, Failures: 0",
    "label": "Example output"
   }
  },
  {
   "h": "The logic under test, running for real",
   "p": [
    "The same rules as plain Java with simple checks, so you can see them pass:"
   ],
   "lang": "java",
   "code": "import java.util.Map;\n\npublic class Main {\n    static int shippingFee(int subtotal) { return subtotal >= 999 ? 0 : 79; }\n    static int applyCoupon(int total, String code) {\n        var rates = Map.of(\"WELCOME10\", 0.10, \"FEST20\", 0.20);\n        if (!rates.containsKey(code)) throw new IllegalArgumentException(\"invalid coupon \" + code);\n        return (int) (total - Math.min(total * rates.get(code), 1000));\n    }\n    static void check(boolean ok, String name) { System.out.println((ok ? \"PASS \" : \"FAIL \") + name); }\n\n    public static void main(String[] args) {\n        check(shippingFee(999) == 0 && shippingFee(998) == 79, \"free shipping from 999\");\n        check(applyCoupon(2000, \"WELCOME10\") == 1800, \"10% coupon\");\n        check(applyCoupon(10000, \"FEST20\") == 9000, \"discount capped at 1000\");\n        try { applyCoupon(500, \"FREE100\"); check(false, \"unknown coupon\"); }\n        catch (IllegalArgumentException e) { check(e.getMessage().contains(\"invalid coupon\"), \"unknown coupon rejected\"); }\n    }\n}",
   "out": {
    "text": "PASS free shipping from 999\nPASS 10% coupon\nPASS discount capped at 1000\nPASS unknown coupon rejected"
   }
  },
  {
   "h": "Mocking dependencies",
   "lang": "java",
   "run": false,
   "code": "@ExtendWith(MockitoExtension.class)\nclass CheckoutServiceTest {\n    @Mock StockRepository stock;\n    @Mock OrderRepository orders;\n    @InjectMocks CheckoutService service;\n\n    @Test\n    void outOfStockRollsBackAndSavesNothing() {\n        when(stock.decrementIfAvailable(\"TEA\", 2)).thenReturn(0);\n        assertThrows(OutOfStockException.class, () -> service.checkout(1L, List.of(new LineRequest(\"TEA\", 2))));\n        verify(orders, never()).save(any());\n    }\n}"
  },
  {
   "h": "Slice and integration tests",
   "lang": "java",
   "run": false,
   "code": "@WebMvcTest(OrderController.class)                 // only the web layer\nclass OrderControllerTest {\n    @Autowired MockMvc mvc;\n    @MockBean OrderService service;\n\n    @Test\n    void invalidEmailGives400() throws Exception {\n        mvc.perform(post(\"/orders\").contentType(APPLICATION_JSON)\n                .content(\"{\\\"customerEmail\\\":\\\"nope\\\",\\\"items\\\":[]}\"))\n           .andExpect(status().isBadRequest());\n    }\n}\n\n@SpringBootTest\n@Testcontainers\nclass OrderRepositoryIT {                           // real PostgreSQL in Docker\n    @Container static PostgreSQLContainer<?> db = new PostgreSQLContainer<>(\"postgres:16\");\n    @DynamicPropertySource static void props(DynamicPropertyRegistry r) {\n        r.add(\"spring.datasource.url\", db::getJdbcUrl);\n        r.add(\"spring.datasource.username\", db::getUsername);\n        r.add(\"spring.datasource.password\", db::getPassword);\n    }\n    // tests that run real SQL and migrations...\n}",
   "p": [
    "Use <code>@WebMvcTest</code> for controllers (fast), <code>@DataJpaTest</code> for repositories, and <b>Testcontainers</b> when you need the real database, not H2, to catch SQL differences."
   ]
  }
 ],
 "mistakes": [
  "Mocking everything, including the database queries you most need to test.",
  "Using H2 in tests when production is PostgreSQL; SQL differences slip through.",
  "One giant @SpringBootTest for everything: slow.",
  "Asserting on log output or internals instead of behaviour."
 ],
 "practice": [
  {
   "q": "Write a JUnit test that checks a cancelled order can't be completed (service throws IllegalStateException).",
   "lang": "java",
   "run": false,
   "code": "@Test\nvoid cancelledOrderCannotBeCompleted() {\n    var order = new Order(6L, OrderStatus.CANCELLED);\n    assertThrows(IllegalStateException.class, () -> order.complete());\n    assertEquals(OrderStatus.CANCELLED, order.getStatus());\n}"
  },
  {
   "q": "When would you use @WebMvcTest vs @SpringBootTest with Testcontainers?",
   "a": "@WebMvcTest to test controllers quickly (routing, validation, status codes) with the service mocked. @SpringBootTest + Testcontainers to test the full flow against a real PostgreSQL: repositories, migrations, transactions."
  }
 ],
 "check": [
  [
   "JUnit 5 annotation for multiple input cases?",
   [
    "@Test",
    "@ParameterizedTest",
    "@Mock",
    "@Before"
   ],
   1,
   "With @CsvSource etc."
  ],
  [
   "Mockito's verify(orders, never()).save(any()) checks…",
   [
    "save was called",
    "save was never called",
    "orders is empty",
    "a database"
   ],
   1,
   "Interaction check."
  ],
  [
   "Why Testcontainers over H2?",
   [
    "Faster",
    "Tests run against the real PostgreSQL, catching SQL differences",
    "No Docker needed",
    "Required"
   ],
   1,
   "Real database behaviour."
  ]
 ],
 "remember": [
  "JUnit 5: @Test, assertEquals/assertThrows, @ParameterizedTest.",
  "Mockito: @Mock, @InjectMocks, when/thenReturn, verify.",
  "@WebMvcTest (controllers), @DataJpaTest (repos), @SpringBootTest (full).",
  "Testcontainers for real PostgreSQL in integration tests.",
  "Test behaviour; don't mock what you most need to verify."
 ]
};
L["java-spring:build"] = {
 "title": "Build, package and run Java services",
 "level": "Intermediate",
 "one": "<b>Maven</b> or <b>Gradle</b> manage dependencies, compile, test and package your service into a single runnable <b>jar</b>. Then it goes into a Docker image and through CI like any other service.",
 "why": "Reading a pom.xml or build.gradle, running builds and fixing dependency problems is everyday Java work, and needed for CI/CD.",
 "steps": [
  {
   "h": "Maven essentials",
   "code": "<project>\n  <groupId>com.acme</groupId>\n  <artifactId>shop</artifactId>\n  <version>0.1.0</version>\n  <parent>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-parent</artifactId>\n    <version>3.3.5</version>\n  </parent>\n  <properties><java.version>21</java.version></properties>\n  <dependencies>\n    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>\n    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>\n    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>\n    <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>\n    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>\n  </dependencies>\n</project>",
   "lang": "xml"
  },
  {
   "h": "Everyday commands",
   "code": "./mvnw spring-boot:run              # run locally\n./mvnw test                         # unit tests\n./mvnw verify                       # tests + integration tests + checks\n./mvnw package -DskipTests          # build target/shop-0.1.0.jar\njava -jar target/shop-0.1.0.jar --spring.profiles.active=prod\n./mvnw dependency:tree              # who pulls in which library (fix conflicts)\n\n# Gradle equivalents: ./gradlew bootRun | test | build | dependencies",
   "lang": "bash",
   "p": [
    "Always use the <b>wrapper</b> (<code>mvnw</code>/<code>gradlew</code>) committed in the repo, so everyone and CI use the same build tool version."
   ]
  },
  {
   "h": "JVM settings that matter in containers",
   "p": [
    "Modern JVMs respect container memory limits. Set heap as a percentage so it fits the container: <code>-XX:MaxRAMPercentage=75</code>. Watch start-up time and memory; Spring Boot apps typically need 300–600 MB."
   ],
   "lang": "java",
   "code": "public class Main {\n    public static void main(String[] args) {\n        var rt = Runtime.getRuntime();\n        System.out.printf(\"Java %d, CPUs seen: %d, max heap: %d MB%n\",\n            Runtime.version().feature(), rt.availableProcessors(), rt.maxMemory() / 1024 / 1024);\n    }\n}",
   "out": {
    "text": "Java 21, CPUs seen: 2, max heap: 1494 MB"
   }
  },
  {
   "h": "CI for a Java service",
   "code": "name: ci\non: [pull_request, push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-java@v4\n        with: { distribution: temurin, java-version: \"21\", cache: maven }\n      - run: ./mvnw -B verify\n      - run: docker build -t ghcr.io/acme/shop:${{ github.sha }} .",
   "lang": "yaml"
  },
  {
   "h": "Health, metrics and graceful shutdown",
   "p": [
    "Spring Boot Actuator gives <code>/actuator/health</code> (with liveness/readiness groups for Kubernetes) and <code>/actuator/prometheus</code> for metrics. Enable graceful shutdown (<code>server.shutdown: graceful</code>) so in-flight requests finish during deploys."
   ]
  }
 ],
 "mistakes": [
  "Not committing the Maven/Gradle wrapper, so builds differ between machines.",
  "Fat Docker images with the full JDK and build tools (use multi-stage + JRE).",
  "Ignoring dependency conflicts until runtime errors (NoSuchMethodError).",
  "No memory settings: the container gets killed under load."
 ],
 "practice": [
  {
   "q": "Write a multi-stage Dockerfile for the Spring Boot jar.",
   "code": "FROM eclipse-temurin:21-jdk AS build\nWORKDIR /src\nCOPY . .\nRUN ./mvnw -q -B package -DskipTests\n\nFROM eclipse-temurin:21-jre\nCOPY --from=build /src/target/*.jar /app.jar\nUSER 1000\nENV JAVA_TOOL_OPTIONS=\"-XX:MaxRAMPercentage=75\"\nENTRYPOINT [\"java\", \"-jar\", \"/app.jar\"]",
   "lang": "dockerfile"
  },
  {
   "q": "A dependency upgrade causes NoSuchMethodError at runtime. How do you investigate?",
   "a": "Run <code>./mvnw dependency:tree</code> to see which versions of the library are pulled in and by whom, then align them (dependencyManagement / BOM, or exclude the old transitive version). Add a test that exercises the failing path."
  }
 ],
 "check": [
  [
   "Why commit mvnw / gradlew?",
   [
    "Style",
    "Everyone and CI use the same build tool version",
    "Required by Git",
    "Speed"
   ],
   1,
   "Reproducible builds."
  ],
  [
   "Command to see which library pulls in what?",
   [
    "mvn clean",
    "mvn dependency:tree",
    "mvn deploy",
    "java -jar"
   ],
   1,
   "Find conflicts."
  ],
  [
   "Heap setting for containers?",
   [
    "-Xmx fixed always",
    "-XX:MaxRAMPercentage=75",
    "None",
    "-Xss"
   ],
   1,
   "Fits the container limit."
  ]
 ],
 "remember": [
  "Maven/Gradle: dependencies, test, package to a runnable jar; use the wrapper.",
  "mvnw spring-boot:run · test · verify · package · dependency:tree.",
  "Multi-stage Docker (JDK build → JRE run); MaxRAMPercentage.",
  "CI: setup-java with cache, mvnw verify, SHA-tagged image.",
  "Actuator health/prometheus; graceful shutdown."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
