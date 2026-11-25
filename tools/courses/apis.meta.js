module.exports = {
 title: "APIs & Integrations",
 description: "How APIs work, building one with FastAPI, secrets, auth (keys, OAuth, JWT), webhooks, retries, rate limits and pagination, ending with a tested orders API.",
 lessons: [
  ["http-rest", "How APIs work: HTTP and REST"],
  ["fastapi", "Building an API with FastAPI"],
  ["secrets", "Keeping secrets safe"],
  ["auth", "Auth: API keys, OAuth and JWT"],
  ["webhooks", "Webhooks: receiving events safely"],
  ["rate-limits", "Timeouts, retries, rate limits, pagination"],
  ["build-api", "Project: build and test an orders API"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["Which method reads data without changing it?", ["GET", "POST", "PATCH", "DELETE"], 0, "GET only reads."],
  ["401 means…", ["Not found", "Missing or bad credentials", "Server error", "Too many requests"], 1, "403 is 'known but not allowed'."],
  ["Which status means you're calling too often?", ["400", "404", "429", "503"], 2, "429 Too Many Requests; check Retry-After."],
  ["Which errors should you retry?", ["400 and 422", "429 and 5xx", "401 and 403", "All"], 1, "Only temporary errors."],
  ["Why is a POST risky to retry?", ["It's slow", "It may create a duplicate if the first one actually worked", "POST can't be retried", "It isn't risky"], 1, "Use an idempotency key."],
  ["What is exponential backoff?", ["Retry instantly", "Wait 1s, 2s, 4s… between retries", "Retry once", "Stop after one error"], 1, "Add jitter and a max number of tries."],
  ["Best REST URL for one order?", ["/getOrder?id=6", "/orders/6", "/order-6", "/api?action=order&id=6"], 1, "Nouns in the path, the method says the action."],
  ["FastAPI gets a body that fails its Pydantic model. It returns…", ["200", "400", "422", "500"], 2, "422 with a list of problems."],
  ["What does response_model protect against?", ["Slow responses", "Leaking fields you didn't mean to return", "Bad requests", "DDoS"], 1, "Only declared fields go out."],
  ["Where should a production API key live?", ["In the code", "In Git", "Platform env vars or a secret manager", "In a comment"], 2, "Never in code or Git."],
  ["A key leaked on GitHub. First step?", ["Delete the repo", "Rotate the key", "Make it private", "Rename the variable"], 1, "Rotating makes the leaked key useless."],
  ["Basic auth's base64…", ["Encrypts the password", "Only encodes it; anyone can decode it", "Hashes it", "Signs it"], 1, "Only safe over HTTPS."],
  ["Machine-to-machine OAuth uses…", ["Authorization code", "Client credentials", "Cookies", "Passwords"], 1, "The app authenticates as itself."],
  ["Can anyone read a JWT's payload?", ["No", "Yes; the signature only proves it's unchanged", "Only with the key", "Only admins"], 1, "Never put secrets in it; always verify the signature."],
  ["How do you check a webhook really came from the provider?", ["Check the IP only", "Verify the HMAC signature of the raw body", "Parse the JSON", "Trust it"], 1, "Use compare_digest on the raw bytes."],
  ["The same webhook event arrives twice. You should…", ["Process it twice", "Skip it using the stored event id", "Return 500", "Delete both"], 1, "Make handlers idempotent."],
  ["When should a webhook handler respond?", ["After all slow work", "As soon as the event is verified and saved", "After an hour", "Never"], 1, "Respond fast, work in the background."],
  ["You only read page 1 of an API's results. Problem?", ["None", "You miss the rest of the data", "It's slower", "It's against REST"], 1, "Loop until there's no next page."],
  ["Why prefer cursor pagination for changing data?", ["Shorter URLs", "Inserts don't shift your position, so no skips or repeats", "It's faster to type", "REST requires it"], 1, "A cursor points after an exact item."],
  ["What's missing here: httpx.get(url)?", ["Nothing", "A timeout", "A body", "A cookie"], 1, "Always set timeout=."]
 ]
};
