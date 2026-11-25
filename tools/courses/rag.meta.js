module.exports = {
 title: "RAG",
 description: "Answer from your own documents: chunking, embeddings and vector search, grounded answers with checked citations, hybrid search, reranking and keeping the index fresh, ending with a measured help-centre assistant.",
 lessons: [
  ["what-is-rag", "What RAG is and why it's used"],
  ["chunking", "Loading and chunking documents"],
  ["vector-search", "Embeddings and vector search"],
  ["citations", "Grounded answers with citations"],
  ["hybrid-rerank", "Hybrid search and reranking"],
  ["freshness", "Fresh, filtered and permission-safe indexes"],
  ["build-rag", "Project: help-centre assistant, measured"],
  ["review", "Review + quiz", "review"]
 ],
 quiz: [
  ["What does RAG do?", ["Retrains the model", "Retrieves relevant passages and answers from them", "Compresses prompts", "Speeds up GPUs"], 1, "Retrieve, then generate."],
  ["Most bad RAG answers are caused by…", ["The model's grammar", "Retrieval missing the right chunk", "Too many citations", "Low temperature"], 1, "Inspect retrieval first."],
  ["Best way to update an assistant's company knowledge?", ["Fine-tune weekly", "Update the indexed documents", "Bigger model", "Longer prompts"], 1, "RAG follows the documents."],
  ["Why overlap chunks?", ["Save space", "Text cut at a border still appears whole somewhere", "Required", "Speed"], 1, "Protects sentences at the edges."],
  ["Best split points for structured docs?", ["Every 50 characters", "Headings and paragraphs", "Random", "Whole document"], 1, "Follow the document's structure."],
  ["What should every chunk carry?", ["Nothing", "Metadata: file, section, date, URL, permissions", "The full document", "A random id only"], 1, "For citations, filters and permissions."],
  ["An embedding is…", ["A file format", "A vector capturing meaning", "An index type", "A prompt"], 1, "Similar meaning → close vectors."],
  ["Chunks and questions embedded with different models?", ["Fine", "Broken: vectors aren't comparable", "Faster", "Better recall"], 1, "Use one model."],
  ["Embeddings beat keywords at…", ["Exact product codes", "Synonyms and paraphrases", "Counting", "Dates"], 1, "Meaning, not spelling."],
  ["Keywords (BM25) beat embeddings at…", ["Paraphrases", "Exact codes, names and rare terms", "Translations", "Images"], 1, "That's why hybrid search exists."],
  ["How does reciprocal rank fusion combine results?", ["Adds raw scores", "Sums 1/(k + rank) from each ranking", "Picks randomly", "Uses the longest chunk"], 1, "Ranks, not incomparable scores."],
  ["Typical reranking setup?", ["Retrieve 3, rerank 3", "Retrieve 20–50, rerank, keep 3–5", "No retrieval", "Rerank everything"], 1, "Wide first pass, precise second."],
  ["Why rewrite follow-up questions before searching?", ["Style", "“and for express?” has no context on its own", "Cost", "Required by vector DBs"], 1, "Make it standalone."],
  ["A cheap check against made-up answers?", ["Ask the model if it's sure", "Verify the quote appears in the cited source", "More sources", "Higher temperature"], 1, "Check citations automatically."],
  ["Nothing relevant was retrieved. Best move?", ["Let the model guess", "Say you couldn't find it and offer help", "Pick any doc", "Retry forever"], 1, "Refuse gracefully and log the gap."],
  ["Where should document permissions be enforced?", ["In the prompt", "In the search filter", "After answering", "Nowhere"], 1, "Never retrieve what the user can't see."],
  ["How do you avoid re-embedding unchanged docs?", ["Rebuild nightly", "Compare content hashes", "Bigger batches", "Skip deletes"], 1, "Only changed content is reprocessed."],
  ["Two price-list versions exist. Use the current one by…", ["Hoping", "valid_from/valid_to filters", "Longer chunks", "Higher k"], 1, "Filter by validity first."],
  ["recall@k measures…", ["Answer style", "How often the right chunk is in the top k", "Latency", "Cost"], 1, "A retrieval metric."],
  ["A change to chunking: how do you know it helped?", ["It feels better", "Re-run the labelled retrieval eval and compare", "Ask the model", "Check the file size"], 1, "Measure before and after."]
 ]
};
