// Lessons for course "rag". Built by tools/course-builder from tools/courses/rag.js.
// Python examples were run and their real output stored.
(function (L) {
L["rag:what-is-rag"] = {
 "title": "What RAG is and why it's used",
 "level": "Intermediate",
 "one": "<b>RAG (retrieval-augmented generation)</b> means: <b>find</b> the parts of your documents that answer the question, <b>put them in the prompt</b>, and ask the model to answer <b>only from them</b>, with citations.",
 "why": "Companies want AI that answers from <i>their</i> policies, manuals, tickets and contracts. RAG is the standard way to do it, and one of the most requested skills in AI engineering job posts.",
 "steps": [
  {
   "h": "Why not just ask the model?",
   "p": [
    "The model doesn't know your private documents, and its knowledge stops at its training cutoff. Asked anyway, it guesses (hallucinates). Fine-tuning doesn't fix this well either: it's costly, hard to update and still doesn't cite sources.",
    "RAG keeps knowledge in documents you control: update a document and answers change straight away."
   ]
  },
  {
   "h": "The two halves",
   "p": [
    "<b>Indexing</b> (done ahead of time): load documents → split into chunks → turn each chunk into a vector (embedding) → store in a search index.",
    "<b>Answering</b> (each question): turn the question into a vector → find the closest chunks → put them in the prompt → the model answers and cites them."
   ],
   "code": "INDEXING:   documents ─► split into chunks ─► embed ─► vector store\nANSWERING:  question ─► embed ─► search top-k chunks ─► prompt(question + chunks) ─► model ─► answer + citations",
   "lang": "text"
  },
  {
   "h": "The smallest possible RAG",
   "p": [
    "Real systems use embeddings, but the idea fits in a few lines. Here the “search” is word overlap, and we show the prompt that would go to the model:"
   ],
   "code": "chunks = [(name, para) for name, text in DOCS.items() for para in text.split(\"\\n\\n\")]\n\ndef search(question: str, k: int = 2):\n    q = {w.lower().strip(\"?.,\") for w in question.split()}\n    score = lambda c: len(q & {w.lower().strip(\".,\") for w in c[1].split()})\n    return sorted(chunks, key=score, reverse=True)[:k]\n\nquestion = \"How long do refunds take?\"\nhits = search(question)\ncontext = \"\\n\\n\".join(f'<source id=\"{i + 1}\" file=\"{n}\">\\n{t}\\n</source>' for i, (n, t) in enumerate(hits))\nprompt = f\"\"\"Answer using only the sources below. Cite sources like [1].\nIf the answer isn't in the sources, say you don't know.\n\n{context}\n\nQuestion: {question}\"\"\"\nprint(prompt)",
   "out": {
    "text": "Answer using only the sources below. Cite sources like [1].\nIf the answer isn't in the sources, say you don't know.\n\n<source id=\"1\" file=\"returns.md\">\n# Refunds\nRefunds go back to the original payment method within 5 to 7 working days after we receive the item.\nCash on delivery orders are refunded by bank transfer.\n</source>\n\n<source id=\"2\" file=\"returns.md\">\n# Returns\nUnused items can be returned within 30 days of delivery. The item must be in its original packaging.\nTo start a return, open the order in your account and choose Return item.\n</source>\n\nQuestion: How long do refunds take?"
   }
  },
  {
   "h": "What the model would answer",
   "p": [
    "Given that prompt, a model replies along these lines. The answer comes from the source, and says which one:"
   ],
   "code": "# model call (see the LLM course)\nanswer = client.messages.create(model=MODEL, max_tokens=300, messages=[{\"role\": \"user\", \"content\": prompt}])",
   "run": false,
   "out": {
    "text": "Refunds go back to your original payment method within 5 to 7 working days after the item is received [1].",
    "label": "Example output"
   }
  },
  {
   "h": "Where RAG goes wrong",
   "p": [
    "Most bad RAG answers are <b>retrieval</b> failures, not model failures: the right chunk wasn't found, chunks cut a sentence in half, an old document version won, or the question used different words than the document.",
    "So when debugging, first look at <b>what was retrieved</b>. If the answer wasn't in the retrieved chunks, no prompt will fix it."
   ]
  }
 ],
 "mistakes": [
  "Blaming the model when the right chunk was never retrieved. Always inspect retrieval first.",
  "No “I don't know” rule, so the model fills gaps with guesses.",
  "Using fine-tuning to teach facts. Use RAG for knowledge, fine-tuning for style or format.",
  "No citations: users can't check answers, and you can't debug them."
 ],
 "practice": [
  {
   "q": "Using the same tiny search, which chunks come back for “Is water damage covered?”",
   "code": "chunks = [(n, p) for n, t in DOCS.items() for p in t.split(\"\\n\\n\")]\nq = {w.lower().strip(\"?.,\") for w in \"Is water damage covered?\".split()}\nbest = max(chunks, key=lambda c: len(q & {w.lower().strip(\".,\") for w in c[1].split()}))\nprint(best[0]); print(best[1])",
   "out": {
    "text": "warranty.md\n# Warranty\nElectronics have a 1 year manufacturer warranty from the delivery date.\nDamage caused by drops or water is not covered."
   }
  },
  {
   "q": "A user asks “Do you ship to Sri Lanka?” and no document mentions it. What should a good RAG system answer?",
   "a": "Something like “I couldn't find information about shipping to Sri Lanka in our help documents” and offer a human contact. It must not invent a policy."
  }
 ],
 "check": [
  [
   "What does RAG add to a model?",
   [
    "More parameters",
    "Relevant passages from your documents at question time",
    "A faster GPU",
    "Fine-tuning"
   ],
   1,
   "Retrieve, then generate from what was found."
  ],
  [
   "Most bad RAG answers come from…",
   [
    "The model's grammar",
    "Retrieval: the right chunk wasn't found",
    "Too many citations",
    "Low temperature"
   ],
   1,
   "Inspect retrieval first."
  ],
  [
   "Best way to keep an AI's company knowledge up to date?",
   [
    "Retrain monthly",
    "Update the documents in the RAG index",
    "Longer prompts",
    "Bigger model"
   ],
   1,
   "RAG knowledge changes when documents change."
  ]
 ],
 "remember": [
  "RAG = retrieve relevant chunks → put in prompt → answer only from them, with citations.",
  "Indexing: load → chunk → embed → store. Answering: embed question → top-k → prompt → answer.",
  "Always allow “I don't know”.",
  "Debug retrieval first: if the chunk isn't there, the answer can't be."
 ]
};
L["rag:chunking"] = {
 "title": "Loading and chunking documents",
 "level": "Intermediate",
 "one": "Search works on <b>chunks</b>: pieces of a document small enough to be specific but big enough to make sense. How you split documents decides how good retrieval can be.",
 "why": "Bad chunking is the most common hidden cause of bad RAG. Getting it right costs little and helps every answer.",
 "steps": [
  {
   "h": "Loading: get clean text first",
   "p": [
    "PDFs, Word files, HTML pages and wikis need converting to text. Use libraries like <code>pypdf</code>, <code>python-docx</code>, <code>BeautifulSoup</code>, or a converter like <code>markitdown</code>/<code>unstructured</code>. Remove headers, footers, page numbers and menus, and keep headings: they carry meaning.",
    "Always keep <b>metadata</b> with the text: file name, title, section, URL, last updated date. You'll need it for citations and filtering."
   ]
  },
  {
   "h": "Fixed-size chunks with overlap",
   "p": [
    "The simplest method: cut every N characters (or tokens), overlapping a little so a sentence cut at a border appears whole in one of the chunks."
   ],
   "code": "def fixed_chunks(text: str, size: int = 120, overlap: int = 30) -> list[str]:\n    chunks, start = [], 0\n    while start < len(text):\n        chunks.append(text[start:start + size])\n        start += size - overlap\n    return chunks\n\ntext = (\"Unused items can be returned within 30 days of delivery. The item must be in its original packaging. \"\n        \"Refunds go back to the original payment method within 5 to 7 working days.\")\nfor c in fixed_chunks(text):\n    print(repr(c))",
   "note": "Notice the cuts in the middle of words. Fixed-size chunking is easy but clumsy.",
   "out": {
    "text": "'Unused items can be returned within 30 days of delivery. The item must be in its original packaging. Refunds go back to '\n'packaging. Refunds go back to the original payment method within 5 to 7 working days.'"
   }
  },
  {
   "h": "Split on structure: headings and paragraphs",
   "p": [
    "Better: split where the document already splits, at headings and paragraphs, and only cut further if a piece is too long. Keep the heading with each chunk so it still makes sense alone."
   ],
   "code": "import re\n\ndef section_chunks(name: str, text: str, max_chars: int = 400) -> list[dict]:\n    out = []\n    for block in re.split(r\"\\n(?=# )\", text):\n        lines = block.strip().splitlines()\n        heading = lines[0].lstrip(\"# \").strip()\n        body = \" \".join(l.strip() for l in lines[1:] if l.strip())\n        for i in range(0, len(body), max_chars):\n            out.append({\"file\": name, \"section\": heading, \"text\": f\"{heading}: {body[i:i + max_chars]}\"})\n    return out\n\nchunks = [c for name, text in DOCS.items() for c in section_chunks(name, text)]\nprint(len(chunks), \"chunks\")\nfor c in chunks[:4]:\n    print(c)",
   "out": {
    "text": "6 chunks\n{'file': 'returns.md', 'section': 'Returns', 'text': 'Returns: Unused items can be returned within 30 days of delivery. The item must be in its original packaging. To start a return, open the order in your account and choose Return item.'}\n{'file': 'returns.md', 'section': 'Refunds', 'text': 'Refunds: Refunds go back to the original payment method within 5 to 7 working days after we receive the item. Cash on delivery orders are refunded by bank transfer.'}\n{'file': 'shipping.md', 'section': 'Shipping times', 'text': 'Shipping times: Standard delivery takes 3 to 5 working days. Express delivery takes 1 to 2 working days and costs 99 rupees. Orders placed after 4 pm ship the next working day.'}\n{'file': 'shipping.md', 'section': 'Tracking', 'text': 'Tracking: You get a tracking link by SMS and email when the parcel leaves our warehouse.'}"
   }
  },
  {
   "h": "Choosing a chunk size",
   "p": [
    "Small chunks (100–300 tokens): precise matches, but may lose context. Large chunks (800–1500 tokens): more context, but less precise and more tokens per answer. A common start: about 300–800 tokens with 10–20% overlap, or one section per chunk. Then <b>measure</b> with retrieval evals and adjust."
   ]
  },
  {
   "h": "Add context to each chunk",
   "p": [
    "A chunk like “It takes 3 to 5 days.” is useless alone. Prefix each chunk with where it came from (document title + section), and for long documents consider a one-line summary of the document. This simple trick noticeably improves retrieval."
   ],
   "code": "def contextualise(chunk: dict, doc_title: str) -> str:\n    return f\"[{doc_title} > {chunk['section']}] {chunk['text']}\"\n\nprint(contextualise({\"section\": \"Shipping times\", \"text\": \"Standard delivery takes 3 to 5 working days.\"},\n                    \"Help Centre: Shipping\"))",
   "out": {
    "text": "[Help Centre: Shipping > Shipping times] Standard delivery takes 3 to 5 working days."
   }
  }
 ],
 "mistakes": [
  "Chunking raw PDF text full of page headers, footers and broken lines.",
  "Throwing away metadata (file, section, date), so you can't cite or filter.",
  "Cutting tables or code blocks in half. Keep them whole where possible.",
  "Picking a chunk size once and never measuring it."
 ],
 "practice": [
  {
   "q": "Split this FAQ into one chunk per question-answer pair, keeping the question in each chunk.",
   "code": "faq = \"\"\"Q: Can I change my address?\nA: Yes, until the order ships.\n\nQ: Do you deliver on Sundays?\nA: Only in Kochi and Bengaluru.\n\nQ: Can I pay cash?\nA: Yes, cash on delivery is available for orders under 10,000 rupees.\"\"\"\n\nchunks = [block.replace(\"\\n\", \" \") for block in faq.split(\"\\n\\n\")]\nfor c in chunks:\n    print(c)",
   "out": {
    "text": "Q: Can I change my address? A: Yes, until the order ships.\nQ: Do you deliver on Sundays? A: Only in Kochi and Bengaluru.\nQ: Can I pay cash? A: Yes, cash on delivery is available for orders under 10,000 rupees."
   }
  },
  {
   "q": "Your chunks are whole 40-page manuals. What problems will you see?",
   "a": "Retrieval returns huge, vague chunks; the relevant sentence is buried; each answer costs many tokens; and fewer chunks fit in the prompt. Split by section into a few hundred tokens each."
  }
 ],
 "check": [
  [
   "Why overlap fixed-size chunks?",
   [
    "To save space",
    "So text cut at a border still appears whole in one chunk",
    "It's required",
    "For speed"
   ],
   1,
   "Overlap protects sentences at the edges."
  ],
  [
   "Best split points for documents with headings?",
   [
    "Every 50 characters",
    "Headings and paragraphs",
    "Random",
    "Every page"
   ],
   1,
   "Follow the document's own structure."
  ],
  [
   "What should each chunk keep alongside its text?",
   [
    "Nothing",
    "Metadata: file, section, date, URL",
    "The whole document",
    "The embedding model name only"
   ],
   1,
   "Needed for citations and filters."
  ]
 ],
 "remember": [
  "Clean text first (no headers/footers); keep headings.",
  "Split by structure (sections, paragraphs); cap size; small overlap.",
  "Start ~300–800 tokens per chunk, then measure.",
  "Keep metadata; prefix chunks with document title + section."
 ]
};
L["rag:vector-search"] = {
 "title": "Embeddings and vector search",
 "level": "Intermediate",
 "one": "An <b>embedding</b> turns text into a list of numbers (a <b>vector</b>) so that texts with similar <i>meaning</i> get similar vectors. Search = find the chunk vectors closest to the question's vector.",
 "why": "Vector search finds “how long until I get my money back?” even when the document says “refunds take 5 to 7 working days”. It's the core of RAG and of semantic search in general.",
 "steps": [
  {
   "h": "Vectors and similarity",
   "p": [
    "Each text becomes a vector (embedding models give 384–3,072 numbers). <b>Cosine similarity</b> measures how closely two vectors point the same way: 1 = same meaning, 0 = unrelated. Here's the maths on tiny made-up vectors:"
   ],
   "code": "import numpy as np\n\ndef cosine(a, b):\n    a, b = np.array(a), np.array(b)\n    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))\n\nrefund_q   = [0.9, 0.1, 0.0]\nrefund_doc = [0.8, 0.2, 0.1]\nshipping   = [0.1, 0.9, 0.2]\nprint(round(cosine(refund_q, refund_doc), 3))\nprint(round(cosine(refund_q, shipping), 3))",
   "out": {
    "text": "0.984\n0.214"
   }
  },
  {
   "h": "Getting real embeddings",
   "p": [
    "You call an embedding model: an API (OpenAI, Voyage, Cohere, Google) or a local model (<code>sentence-transformers</code>). Embed every chunk once when indexing, and each question at query time, with the <b>same</b> model."
   ],
   "code": "# local model (downloads once):  pip install sentence-transformers\nfrom sentence_transformers import SentenceTransformer\nmodel = SentenceTransformer(\"all-MiniLM-L6-v2\")\nvectors = model.encode([\"Refunds take 5 to 7 working days.\", \"Standard delivery takes 3 to 5 days.\"])\nprint(vectors.shape)          # (2, 384)",
   "run": false,
   "out": {
    "text": "(2, 384)",
    "label": "Example output"
   }
  },
  {
   "h": "Search over your chunks",
   "p": [
    "To run offline here we use <b>TF-IDF</b> vectors (word-based, from scikit-learn) instead of a neural embedding model. The search code is exactly what you'd write with real embeddings: vectorise chunks, vectorise the question, rank by cosine similarity."
   ],
   "code": "from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\nchunks = [(n, p.strip()) for n, t in DOCS.items() for p in t.split(\"\\n\\n\")]\ntexts = [t for _, t in chunks]\n\nvectorizer = TfidfVectorizer(stop_words=\"english\")\nchunk_vectors = vectorizer.fit_transform(texts)          # indexing: once\n\ndef search(question: str, k: int = 2):\n    q = vectorizer.transform([question])                 # each question\n    scores = cosine_similarity(q, chunk_vectors)[0]\n    best = scores.argsort()[::-1][:k]\n    return [(round(float(scores[i]), 3), chunks[i][0], texts[i][:70]) for i in best]\n\nfor question in [\"How long do refunds take?\", \"Is express delivery available?\", \"What if my item arrives broken?\"]:\n    print(question)\n    for hit in search(question):\n        print(\"  \", hit)",
   "note": "The last question still finds the “Damaged on arrival” section, but only through the words “item” and “arrives”: “broken” never appears in the documents. Neural embeddings understand that broken ≈ damaged, which is their big advantage over word matching.",
   "out": {
    "text": "How long do refunds take?\n   (0.528, 'returns.md', '# Refunds\\nRefunds go back to the original payment method within 5 to 7')\n   (0.0, 'warranty.md', '# Damaged on arrival\\nIf an item arrives damaged, send a photo within 4')\nIs express delivery available?\n   (0.293, 'shipping.md', '# Shipping times\\nStandard delivery takes 3 to 5 working days. Express ')\n   (0.083, 'warranty.md', '# Warranty\\nElectronics have a 1 year manufacturer warranty from the de')\nWhat if my item arrives broken?\n   (0.309, 'warranty.md', '# Damaged on arrival\\nIf an item arrives damaged, send a photo within 4')\n   (0.184, 'returns.md', '# Returns\\nUnused items can be returned within 30 days of delivery. The')"
   }
  },
  {
   "h": "Vector databases",
   "p": [
    "For thousands to millions of chunks, store vectors in a <b>vector store</b>: <b>pgvector</b> (an extension for PostgreSQL, great when you already use Postgres), Chroma or LanceDB (simple, local), or hosted ones like Pinecone, Weaviate, Qdrant. They use approximate indexes (HNSW) for fast search and let you filter by metadata.",
    "With pgvector, search is just SQL:"
   ],
   "code": "CREATE EXTENSION vector;\nCREATE TABLE chunks (\n  id        bigserial PRIMARY KEY,\n  file      text,\n  section   text,\n  content   text,\n  embedding vector(384)\n);\nCREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);\n\n-- top 3 chunks for a question vector, only from current help-centre docs\nSELECT file, section, content, 1 - (embedding <=> $1) AS similarity\nFROM chunks\nWHERE file LIKE 'help/%'\nORDER BY embedding <=> $1\nLIMIT 3;",
   "lang": "sql"
  },
  {
   "h": "Choosing k and a cut-off",
   "p": [
    "<b>k</b> = how many chunks to retrieve (often 3–10). Too few: the answer may be missing. Too many: noise and cost. Also drop hits below a minimum similarity, and if nothing passes, answer “I don't know”."
   ]
  }
 ],
 "mistakes": [
  "Embedding chunks and questions with different models. The vectors aren't comparable.",
  "Re-embedding everything on every question. Embed chunks once; re-embed only changed documents.",
  "Ignoring metadata filters (product, language, date), so outdated or wrong documents win.",
  "Assuming vector search is always better than keyword search. For codes, names and exact phrases, keywords often win (next lesson)."
 ],
 "practice": [
  {
   "q": "Compute cosine similarity between [1, 0, 1] and [1, 1, 0].",
   "code": "import numpy as np\na, b = np.array([1, 0, 1]), np.array([1, 1, 0])\nprint(round(float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b))), 3))",
   "out": {
    "text": "0.5"
   }
  },
  {
   "q": "Using the TF-IDF search, which file answers “How do I track my parcel?”",
   "code": "from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\nchunks = [(n, p) for n, t in DOCS.items() for p in t.split(\"\\n\\n\")]\nv = TfidfVectorizer(stop_words=\"english\")\nm = v.fit_transform([p for _, p in chunks])\nscores = cosine_similarity(v.transform([\"How do I track my parcel?\"]), m)[0]\nbest = scores.argmax()\nprint(chunks[best][0], round(float(scores[best]), 3))",
   "out": {
    "text": "shipping.md 0.316"
   }
  }
 ],
 "check": [
  [
   "What is an embedding?",
   [
    "A compressed file",
    "A vector of numbers that captures meaning",
    "A database index",
    "A prompt"
   ],
   1,
   "Similar meaning → similar vectors."
  ],
  [
   "Cosine similarity of 1 means…",
   [
    "Unrelated",
    "Pointing the same way: very similar",
    "Opposite",
    "An error"
   ],
   1,
   "Higher = more similar."
  ],
  [
   "Chunks embedded with model A, questions with model B. Result?",
   [
    "Fine",
    "Broken search: vectors aren't comparable",
    "Faster",
    "Better"
   ],
   1,
   "Always use the same model."
  ]
 ],
 "remember": [
  "Embedding = text → vector; similar meaning → close vectors.",
  "Cosine similarity ranks chunks; same model for chunks and questions.",
  "Embed chunks once; store in a vector store (pgvector, Chroma, Qdrant…).",
  "Use metadata filters; pick k (3–10) and a minimum similarity.",
  "Embeddings handle synonyms; keywords handle exact codes and names."
 ]
};
L["rag:citations"] = {
 "title": "Grounded answers with citations",
 "level": "Intermediate",
 "one": "A <b>grounded</b> answer uses only the retrieved sources and <b>cites</b> them, so users can check it and you can spot made-up claims.",
 "why": "Trust is everything for internal AI tools. Citations turn “the AI said so” into “page 4 of the returns policy says so”, and make wrong answers easy to catch.",
 "steps": [
  {
   "h": "Number the sources in the prompt",
   "p": [
    "Give each retrieved chunk an id and its metadata, then ask for citations by id."
   ],
   "code": "hits = [\n    {\"file\": \"returns.md\", \"section\": \"Refunds\", \"text\": \"Refunds go back to the original payment method within 5 to 7 working days after we receive the item.\"},\n    {\"file\": \"returns.md\", \"section\": \"Returns\", \"text\": \"Unused items can be returned within 30 days of delivery.\"},\n]\n\ndef build_prompt(question: str, hits: list[dict]) -> str:\n    sources = \"\\n\".join(f'<source id=\"{i}\" file=\"{h[\"file\"]}\" section=\"{h[\"section\"]}\">{h[\"text\"]}</source>'\n                        for i, h in enumerate(hits, start=1))\n    return f\"\"\"You answer customer questions for an online shop.\nUse ONLY the sources. After each sentence, cite its source like [1].\nIf the sources don't contain the answer, reply exactly: I don't know.\n\n<sources>\n{sources}\n</sources>\n\n<question>{question}</question>\"\"\"\n\nprint(build_prompt(\"When will I get my refund?\", hits))",
   "out": {
    "text": "You answer customer questions for an online shop.\nUse ONLY the sources. After each sentence, cite its source like [1].\nIf the sources don't contain the answer, reply exactly: I don't know.\n\n<sources>\n<source id=\"1\" file=\"returns.md\" section=\"Refunds\">Refunds go back to the original payment method within 5 to 7 working days after we receive the item.</source>\n<source id=\"2\" file=\"returns.md\" section=\"Returns\">Unused items can be returned within 30 days of delivery.</source>\n</sources>\n\n<question>When will I get my refund?</question>"
   }
  },
  {
   "h": "Ask for structured answers",
   "p": [
    "For apps, ask for JSON: the answer plus the ids of the sources it used, or quotes. Then your code can show clickable sources and check them."
   ],
   "code": "from pydantic import BaseModel\n\nclass Cited(BaseModel):\n    answer: str\n    source_ids: list[int]\n    quote: str        # the exact words from the source that support the answer\n\nreply = '{\"answer\": \"Your refund will reach your original payment method within 5 to 7 working days after we receive the item.\", \"source_ids\": [1], \"quote\": \"within 5 to 7 working days after we receive the item\"}'\nc = Cited.model_validate_json(reply)\nprint(c.answer, \"->\", c.source_ids)",
   "out": {
    "text": "Your refund will reach your original payment method within 5 to 7 working days after we receive the item. -> [1]"
   }
  },
  {
   "h": "Check the citations",
   "p": [
    "Cheap automatic checks catch many made-up answers: every cited id must exist, and the quote must really appear in that source."
   ],
   "code": "sources = {1: \"Refunds go back to the original payment method within 5 to 7 working days after we receive the item.\",\n           2: \"Unused items can be returned within 30 days of delivery.\"}\n\ndef check(source_ids: list[int], quote: str) -> list[str]:\n    problems = [f\"source {i} doesn't exist\" for i in source_ids if i not in sources]\n    if not any(quote.lower() in sources.get(i, \"\").lower() for i in source_ids):\n        problems.append(\"quote not found in cited sources\")\n    return problems\n\nprint(check([1], \"within 5 to 7 working days\"))\nprint(check([2], \"within 3 working days\"))\nprint(check([5], \"anything\"))",
   "out": {
    "text": "[]\n['quote not found in cited sources']\n[\"source 5 doesn't exist\", 'quote not found in cited sources']"
   }
  },
  {
   "h": "“I don't know” is a feature",
   "p": [
    "When retrieval finds nothing relevant, don't even call the model: answer that you couldn't find it, and offer a human or a link to search. Track how often this happens; those questions show what documentation is missing."
   ],
   "code": "MIN_SCORE = 0.2\n\ndef answer_or_refuse(hits: list[tuple[float, str]]) -> str:\n    good = [h for h in hits if h[0] >= MIN_SCORE]\n    if not good:\n        return \"I couldn't find that in our help articles. Would you like to talk to a person?\"\n    return f\"(call the model with {len(good)} sources)\"\n\nprint(answer_or_refuse([(0.61, \"Refunds...\"), (0.12, \"Shipping...\")]))\nprint(answer_or_refuse([(0.08, \"Warranty...\"), (0.05, \"Tracking...\")]))",
   "out": {
    "text": "(call the model with 1 sources)\nI couldn't find that in our help articles. Would you like to talk to a person?"
   }
  },
  {
   "h": "Showing sources to users",
   "p": [
    "Show the cited file/section as a link next to the answer, and let users open the original. Ask for feedback (thumbs up/down) on each answer; bad ratings with their retrieved chunks are your best debugging data."
   ]
  }
 ],
 "mistakes": [
  "Asking for citations but never checking them. Models sometimes cite the wrong source.",
  "Calling the model even when nothing relevant was retrieved, which invites made-up answers.",
  "Citations with no way to open the original document.",
  "Hiding “I don't know” rates. They tell you what docs to write."
 ],
 "practice": [
  {
   "q": "Write a check that flags an answer when it cites no sources at all.",
   "code": "def needs_review(answer: dict) -> bool:\n    return not answer.get(\"source_ids\")\n\nprint(needs_review({\"answer\": \"Refunds take 5-7 days.\", \"source_ids\": [1]}))\nprint(needs_review({\"answer\": \"We ship to Mars.\", \"source_ids\": []}))",
   "out": {
    "text": "False\nTrue"
   }
  },
  {
   "q": "Users say answers are “confident but wrong” about warranty. What do you look at first?",
   "a": "The retrieved chunks for those questions: was the warranty section retrieved at all? Then check whether citations point to it and quotes match. Usually it's retrieval (wrong or missing chunk), not the model."
  }
 ],
 "check": [
  [
   "What does 'grounded' mean?",
   [
    "Short",
    "Based only on the provided sources",
    "Polite",
    "Fast"
   ],
   1,
   "Answers come from retrieved text."
  ],
  [
   "A cheap way to catch made-up answers?",
   [
    "Ask the model if it's sure",
    "Check the quote really appears in the cited source",
    "Raise temperature",
    "Use more sources"
   ],
   1,
   "Verify citations automatically."
  ],
  [
   "Nothing relevant was retrieved. Best move?",
   [
    "Let the model try anyway",
    "Say you couldn't find it and offer help",
    "Pick a random doc",
    "Retry forever"
   ],
   1,
   "Refuse gracefully; log the gap."
  ]
 ],
 "remember": [
  "Number sources in tags; ask for [n] citations; allow “I don't know”.",
  "Structured answers: answer + source_ids + supporting quote.",
  "Check: cited ids exist, quote appears in the source.",
  "No good hits → don't call the model; log the question.",
  "Show sources to users; collect feedback."
 ]
};
L["rag:hybrid-rerank"] = {
 "title": "Better retrieval: hybrid search and reranking",
 "level": "Advanced",
 "one": "<b>Hybrid search</b> combines keyword search (great for exact words, codes and names) with vector search (great for meaning). A <b>reranker</b> then re-scores the top results more carefully.",
 "why": "This is the standard upgrade path when basic RAG isn't good enough, and it's what production systems use.",
 "steps": [
  {
   "h": "Keyword search: BM25",
   "p": [
    "<b>BM25</b> scores documents by matching words, giving more weight to rare words. It finds “error E-4012” or “SKU HP-200” exactly, where embeddings can blur them."
   ],
   "code": "from rank_bm25 import BM25Okapi\n\nchunks = [(n, p.strip()) for n, t in DOCS.items() for p in t.split(\"\\n\\n\")]\ntokenise = lambda s: [w.strip(\".,?#\").lower() for w in s.split()]\nbm25 = BM25Okapi([tokenise(t) for _, t in chunks])\n\nscores = bm25.get_scores(tokenise(\"express delivery cost\"))\nfor i in scores.argsort()[::-1][:2]:\n    print(round(float(scores[i]), 2), chunks[i][0], chunks[i][1][:60])",
   "out": {
    "text": "1.53 shipping.md # Shipping times\nStandard delivery takes 3 to 5 working days\n0.29 warranty.md # Warranty\nElectronics have a 1 year manufacturer warranty f"
   }
  },
  {
   "h": "Combine the two: reciprocal rank fusion",
   "p": [
    "Scores from BM25 and vectors aren't on the same scale, so combine <b>ranks</b> instead. <b>Reciprocal rank fusion (RRF)</b>: each result gets 1/(60 + rank) from each list, summed."
   ],
   "code": "def rrf(*rankings: list[str], k: int = 60) -> list[tuple[str, float]]:\n    scores = {}\n    for ranking in rankings:\n        for rank, doc in enumerate(ranking, start=1):\n            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)\n    return sorted(((d, round(s, 4)) for d, s in scores.items()), key=lambda x: -x[1])\n\nkeyword_ranking = [\"shipping#times\", \"returns#refunds\", \"warranty#damaged\"]\nvector_ranking  = [\"returns#refunds\", \"warranty#damaged\", \"shipping#tracking\"]\nfor doc, score in rrf(keyword_ranking, vector_ranking):\n    print(score, doc)",
   "note": "Chunks that rank well in <b>both</b> lists rise to the top.",
   "out": {
    "text": "0.0325 returns#refunds\n0.032 warranty#damaged\n0.0164 shipping#times\n0.0159 shipping#tracking"
   }
  },
  {
   "h": "Reranking",
   "p": [
    "Retrieve a generous top 20–50 with hybrid search, then use a <b>reranker</b> to re-score each (question, chunk) pair together, and keep the best 3–5. Rerankers (Cohere Rerank, Voyage, open cross-encoders like <code>bge-reranker</code>, or an LLM asked to score relevance) are slower per item but much more accurate than first-pass search."
   ],
   "code": "# with an open cross-encoder (pip install sentence-transformers)\nfrom sentence_transformers import CrossEncoder\nreranker = CrossEncoder(\"BAAI/bge-reranker-base\")\npairs = [(question, chunk_text) for chunk_text in candidates]     # 20-50 candidates\nscores = reranker.predict(pairs)\ntop = [c for _, c in sorted(zip(scores, candidates), reverse=True)[:5]]",
   "run": false
  },
  {
   "h": "Query rewriting",
   "p": [
    "Users write short, vague or chatty questions (“and for express?”). Before searching, rewrite the question into a standalone search query using the conversation, or generate a few variants and search with each. One cheap model call often improves retrieval a lot."
   ],
   "code": "Conversation:\n  user: How long does standard delivery take?\n  assistant: 3 to 5 working days.\n  user: and for express?\n\nRewritten search query: \"express delivery time how many days\"",
   "lang": "text"
  },
  {
   "h": "Measure before and after",
   "p": [
    "Every one of these upgrades costs time or money. Keep a set of 30–50 real questions with the chunk(s) that should be found, and measure <b>recall@k</b> (how often the right chunk is in the top k) before and after each change. The next course covers this properly."
   ]
  }
 ],
 "mistakes": [
  "Adding rerankers and hybrid search without measuring whether retrieval actually improved.",
  "Adding raw BM25 and cosine scores together: different scales. Fuse ranks (RRF) or normalise.",
  "Reranking only the top 3. The reranker can only reorder what it's given; retrieve wider first.",
  "Searching with the raw follow-up question (“and for express?”), which has no context."
 ],
 "practice": [
  {
   "q": "Fuse these rankings with RRF: keyword = [A, B, C], vector = [C, A, D]. Which comes first?",
   "code": "def rrf(*rankings, k=60):\n    s = {}\n    for r in rankings:\n        for i, d in enumerate(r, 1):\n            s[d] = s.get(d, 0) + 1 / (k + i)\n    return sorted(s, key=s.get, reverse=True)\n\nprint(rrf([\"A\", \"B\", \"C\"], [\"C\", \"A\", \"D\"]))",
   "out": {
    "text": "['A', 'C', 'B', 'D']"
   }
  },
  {
   "q": "Users often search for product codes like “HP-200”. Which retrieval helps most?",
   "a": "Keyword search (BM25) or exact-match filters: embeddings can treat HP-200 and HP-300 as nearly the same. Use hybrid search so codes match exactly while normal questions still match by meaning."
  }
 ],
 "check": [
  [
   "What is BM25 good at?",
   [
    "Synonyms",
    "Exact words, codes and names",
    "Images",
    "Translations"
   ],
   1,
   "Keyword matching with rare-word weighting."
  ],
  [
   "Why fuse ranks instead of adding scores?",
   [
    "Faster",
    "BM25 and cosine scores are on different scales",
    "Required by law",
    "No reason"
   ],
   1,
   "RRF uses positions, not raw scores."
  ],
  [
   "Typical reranking setup?",
   [
    "Retrieve 3, rerank 3",
    "Retrieve 20–50, rerank, keep the best 3–5",
    "Skip retrieval",
    "Rerank the whole corpus"
   ],
   1,
   "Wide first pass, precise second pass."
  ]
 ],
 "remember": [
  "Hybrid = BM25 (exact words) + vectors (meaning).",
  "Combine with reciprocal rank fusion: Σ 1/(60 + rank).",
  "Rerank: retrieve 20–50 → reranker → keep 3–5.",
  "Rewrite follow-up questions into standalone search queries.",
  "Measure recall@k before and after every change."
 ]
};
L["rag:freshness"] = {
 "title": "Keeping the index fresh, filtered and safe",
 "level": "Advanced",
 "one": "Real document sets change every day. A production RAG system <b>re-indexes only what changed</b>, removes deleted documents, <b>filters by metadata</b> (version, product, region), and respects <b>who is allowed to see what</b>.",
 "why": "Stale or leaked answers destroy trust fast. A RAG system that quotes last year's price list, or shows HR documents to everyone, is worse than none.",
 "steps": [
  {
   "h": "Update only what changed",
   "p": [
    "Store a <b>hash</b> of each document's content. On each sync, re-chunk and re-embed only documents whose hash changed, add new ones, and delete removed ones."
   ],
   "code": "import hashlib\n\ndef digest(text: str) -> str:\n    return hashlib.sha256(text.encode()).hexdigest()[:12]\n\nindexed = {\"returns.md\": digest(\"v1 returns\"), \"shipping.md\": digest(\"v1 shipping\"), \"old-promo.md\": digest(\"sale\")}\ncurrent = {\"returns.md\": \"v1 returns\", \"shipping.md\": \"v2 shipping: express now 79 rupees\", \"warranty.md\": \"1 year\"}\n\nto_add    = [d for d in current if d not in indexed]\nto_update = [d for d in current if d in indexed and digest(current[d]) != indexed[d]]\nto_delete = [d for d in indexed if d not in current]\nprint(\"add:\", to_add, \"| update:\", to_update, \"| delete:\", to_delete)",
   "out": {
    "text": "add: ['warranty.md'] | update: ['shipping.md'] | delete: ['old-promo.md']"
   }
  },
  {
   "h": "Metadata filters",
   "p": [
    "Store fields like <code>product</code>, <code>region</code>, <code>language</code>, <code>valid_from</code>/<code>valid_to</code> and <code>doc_type</code>. Filter <b>before</b> ranking so the wrong version can't win just because it's similar."
   ],
   "code": "from datetime import date\n\nchunks = [\n    {\"text\": \"Express delivery costs 99 rupees.\", \"region\": \"IN\", \"valid_to\": date(2025, 6, 30)},\n    {\"text\": \"Express delivery costs 79 rupees.\", \"region\": \"IN\", \"valid_to\": None},\n    {\"text\": \"Express delivery costs 15 dirhams.\", \"region\": \"AE\", \"valid_to\": None},\n]\n\ndef candidates(region: str, today: date):\n    return [c[\"text\"] for c in chunks\n            if c[\"region\"] == region and (c[\"valid_to\"] is None or c[\"valid_to\"] >= today)]\n\nprint(candidates(\"IN\", date(2025, 8, 1)))",
   "out": {
    "text": "['Express delivery costs 79 rupees.']"
   }
  },
  {
   "h": "Permissions: only search what the user may see",
   "p": [
    "Store who can see each document (team, role, customer id) and filter on it in the search query itself. Never retrieve everything and hope the model won't mention the private parts."
   ],
   "code": "docs = [\n    {\"text\": \"Holiday policy: 24 days a year.\", \"allowed\": {\"all-staff\"}},\n    {\"text\": \"Salary bands for 2025: ...\", \"allowed\": {\"hr\", \"leadership\"}},\n    {\"text\": \"Returns policy: 30 days.\", \"allowed\": {\"all-staff\", \"customers\"}},\n]\n\ndef visible(user_groups: set[str]) -> list[str]:\n    return [d[\"text\"] for d in docs if d[\"allowed\"] & user_groups]\n\nprint(\"customer:\", visible({\"customers\"}))\nprint(\"support agent:\", visible({\"all-staff\"}))\nprint(\"HR:\", visible({\"all-staff\", \"hr\"}))",
   "out": {
    "text": "customer: ['Returns policy: 30 days.']\nsupport agent: ['Holiday policy: 24 days a year.', 'Returns policy: 30 days.']\nHR: ['Holiday policy: 24 days a year.', 'Salary bands for 2025: ...', 'Returns policy: 30 days.']"
   }
  },
  {
   "h": "Freshness in answers",
   "p": [
    "Put the document's “last updated” date in the source metadata and let the answer mention it when it matters (“According to the pricing page, updated 1 July…”). Flag documents that haven't been reviewed in a long time."
   ]
  },
  {
   "h": "Monitoring the index",
   "p": [
    "Track: number of documents and chunks, last successful sync, failed files, “I don't know” rate, and low-rated answers. Alert when a sync fails or the chunk count drops suddenly (a broken loader can silently empty your index)."
   ]
  }
 ],
 "mistakes": [
  "Rebuilding the whole index on every change: slow and expensive.",
  "Never deleting removed documents, so old policies keep being quoted.",
  "Applying permissions after retrieval, or in the prompt. Filter in the search query.",
  "No monitoring: the sync breaks and nobody notices for weeks."
 ],
 "practice": [
  {
   "q": "Write <code>is_current(chunk, today)</code> using optional valid_from and valid_to dates.",
   "code": "from datetime import date\n\ndef is_current(chunk: dict, today: date) -> bool:\n    start, end = chunk.get(\"valid_from\"), chunk.get(\"valid_to\")\n    return (start is None or start <= today) and (end is None or today <= end)\n\nprint(is_current({\"valid_from\": date(2025, 7, 1)}, date(2025, 8, 1)))\nprint(is_current({\"valid_to\": date(2025, 6, 30)}, date(2025, 8, 1)))",
   "out": {
    "text": "True\nFalse"
   }
  },
  {
   "q": "A customer chatbot answered with an internal discount rule meant only for staff. What went wrong and how do you fix it?",
   "a": "Internal documents were in the searchable index without permission filters. Store access groups per document and filter retrieval by the user's groups (customers can only see public docs), or use a separate index for public content. Then add a test with internal-only questions."
  }
 ],
 "check": [
  [
   "How do you avoid re-embedding unchanged documents?",
   [
    "Re-embed everything",
    "Compare content hashes",
    "Use a bigger model",
    "Delete the index daily"
   ],
   1,
   "Only changed hashes get reprocessed."
  ],
  [
   "Where should document permissions be enforced?",
   [
    "In the prompt",
    "In the search query/filter",
    "After the answer",
    "Nowhere"
   ],
   1,
   "Never retrieve what the user can't see."
  ],
  [
   "Two versions of a price list exist. How do you make sure the current one is used?",
   [
    "Hope",
    "valid_from/valid_to metadata filters",
    "Longer chunks",
    "Higher k"
   ],
   1,
   "Filter by validity before ranking."
  ]
 ],
 "remember": [
  "Sync by content hash: add new, update changed, delete removed.",
  "Metadata filters (region, product, validity) before ranking.",
  "Permissions in the search filter, never in the prompt.",
  "Show last-updated dates; monitor sync, chunk counts and “I don't know” rate."
 ]
};
L["rag:build-rag"] = {
 "title": "Project: a help-centre assistant with citations",
 "level": "Project",
 "one": "Build a small RAG service: index a folder of help articles, hybrid search, grounded answers with checked citations, “I don't know” handling, and a retrieval eval.",
 "why": "“Chat with our documents” is the most common AI request from companies. A clean, measured version is a strong portfolio piece and a likely interview discussion.",
 "steps": [
  {
   "h": "The plan",
   "p": [
    "<b>Index</b>: markdown files → section chunks with metadata. <b>Search</b>: BM25 + TF-IDF vectors fused with RRF (swap TF-IDF for a real embedding model in your version). <b>Answer</b>: prompt with numbered sources; refuse when nothing relevant. <b>Eval</b>: hit@1 on labelled questions, measured before and after each change."
   ]
  },
  {
   "h": "Index, search and measure: version 1",
   "p": [
    "Chunk by section, search with BM25 + TF-IDF fused by RRF, and measure <b>hit@1</b> (is the right chunk the top result?) on labelled questions. With only 6 chunks, hit@1 is a stricter, more useful number than recall@3."
   ],
   "code": "import re\nfrom rank_bm25 import BM25Okapi\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\ndef section_chunks(name, text):\n    for block in re.split(r\"\\n(?=# )\", text):\n        lines = block.strip().splitlines()\n        heading = lines[0].lstrip(\"# \")\n        yield {\"id\": f\"{name}#{heading}\", \"text\": f\"{heading}: \" + \" \".join(lines[1:])}\n\nCHUNKS = [c for n, t in DOCS.items() for c in section_chunks(n, t)]\n\ndef simple_tokens(s):\n    return [w.strip(\".,?:#\").lower() for w in s.split()]\n\ndef build_search(tok):\n    texts = [c[\"text\"] for c in CHUNKS]\n    bm25 = BM25Okapi([tok(t) for t in texts])\n    tfidf = TfidfVectorizer(tokenizer=tok, token_pattern=None, lowercase=False).fit(texts)\n    vectors = tfidf.transform(texts)\n    def search(q, k=3):\n        keyword = bm25.get_scores(tok(q)).argsort()[::-1]\n        vector = cosine_similarity(tfidf.transform([q]), vectors)[0].argsort()[::-1]\n        fused = {}\n        for ranking in (keyword, vector):\n            for rank, i in enumerate(ranking, 1):\n                fused[i] = fused.get(i, 0) + 1 / (60 + rank)\n        return [CHUNKS[i][\"id\"] for i in sorted(fused, key=fused.get, reverse=True)[:k]]\n    return search\n\nLABELLED = [\n    (\"How much is express shipping?\", \"shipping.md#Shipping times\"),\n    (\"When will I get my refund?\", \"returns.md#Refunds\"),\n    (\"Can I return something after 3 weeks?\", \"returns.md#Returns\"),\n    (\"Is water damage covered by the warranty?\", \"warranty.md#Warranty\"),\n    (\"The parcel came broken, what now?\", \"warranty.md#Damaged on arrival\"),\n    (\"Where is my tracking link?\", \"shipping.md#Tracking\"),\n    (\"How long does standard delivery take?\", \"shipping.md#Shipping times\"),\n    (\"Do I need the original packaging to return it?\", \"returns.md#Returns\"),\n]\n\ndef hit_at_1(search):\n    hits = 0\n    for q, expected in LABELLED:\n        top = search(q)[0]\n        hits += top == expected\n        if top != expected:\n            print(f\"  MISS {q!r} -> {top}\")\n    return hits\n\nsearch = build_search(simple_tokens)\nprint(f\"version 1 hit@1 = {hit_at_1(search)}/{len(LABELLED)}\")",
   "note": "Two misses. “refund” doesn't match “Refunds” (different word forms), and common words like “get” pull in the Tracking section. “broken” never appears in the documents at all.",
   "out": {
    "text": "  MISS 'When will I get my refund?' -> shipping.md#Tracking\n  MISS 'The parcel came broken, what now?' -> shipping.md#Tracking\nversion 1 hit@1 = 6/8"
   }
  },
  {
   "h": "Fix one thing, measure again",
   "p": [
    "Normalise words: drop common stop words and simple endings (refunds → refund, returned → return). Then re-run the same labelled questions."
   ],
   "code": "from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS\n\ndef stem(word):\n    for ending in (\"ing\", \"ed\", \"s\"):\n        if word.endswith(ending) and len(word) > 4:\n            return word[:-len(ending)]\n    return word\n\ndef better_tokens(s):\n    return [stem(w) for w in simple_tokens(s) if w not in ENGLISH_STOP_WORDS]\n\nprint(better_tokens(\"When will I get my refunds?\"))\nprint(f\"version 2 hit@1 = {hit_at_1(build_search(better_tokens))}/{len(LABELLED)}\")",
   "note": "One change, measured: 6/8 → 7/8. The last miss (“broken” vs “damaged”, “parcel” vs “item”) is about meaning, not word forms. A real embedding model fixes that kind of miss, which is exactly why production RAG uses embeddings plus keywords.",
   "out": {
    "text": "['refund']\n  MISS 'The parcel came broken, what now?' -> shipping.md#Tracking\nversion 2 hit@1 = 7/8"
   }
  },
  {
   "h": "The answer step",
   "p": [
    "Build the prompt from the top chunks, refuse when the best similarity is too low, call the model, validate the citations (previous lessons), and return answer + sources. Wrap it in <code>POST /ask</code> with FastAPI."
   ],
   "code": "def answer(question: str) -> dict:\n    hits = hybrid_search(question)\n    if max(score for _, score in hits) < 0.1:\n        return {\"answer\": \"I couldn't find that in our help articles.\", \"sources\": []}\n    prompt = build_prompt(question, [chunk_by_id[cid] for cid, _ in hits])\n    reply = call_model(prompt)                  # structured: answer + source_ids + quote\n    problems = check_citations(reply, hits)\n    if problems:\n        return {\"answer\": \"I'm not sure. A team member will follow up.\", \"sources\": [], \"flag\": problems}\n    return {\"answer\": reply.answer, \"sources\": [hits[i - 1][0] for i in reply.source_ids]}",
   "run": false
  },
  {
   "h": "Make it portfolio-ready",
   "p": [
    "Use a real embedding model and pgvector or Chroma; index 50+ real help articles (your own product or a public docs site you're allowed to use); show recall@k and an answer-quality score in the README; add a small chat UI that shows sources; log questions with “I don't know” answers."
   ]
  }
 ],
 "mistakes": [
  "No labelled questions, so you can't tell if a change helped.",
  "Only testing questions that use the document's exact words. Include paraphrases and typos.",
  "Returning answers without sources, or sources users can't open."
 ],
 "practice": [
  {
   "q": "Add two more labelled questions that use different words from the documents. Predict whether hybrid search will find them.",
   "a": "For example “How fast is the quick delivery option?” (→ Shipping times) and “Do I need the original box to send it back?” (→ Returns). Word-based search may miss “quick” (doc says “express”); a real embedding model usually catches it. That's why you measure."
  },
  {
   "q": "Your recall@3 is 95% but users still rate answers badly. Where do you look next?",
   "a": "The answer step: is the model using the right chunk, citing correctly, refusing too often, or writing unclear answers? Evaluate answer quality separately (correctness, groundedness) on the same questions."
  }
 ],
 "check": [
  [
   "What does recall@3 measure?",
   [
    "Answer style",
    "How often the right chunk is in the top 3 results",
    "Speed",
    "Cost"
   ],
   1,
   "A retrieval metric."
  ],
  [
   "When should the assistant refuse?",
   [
    "Never",
    "When retrieval finds nothing relevant enough",
    "Always",
    "On long questions"
   ],
   1,
   "Low similarity → “I couldn't find that”."
  ],
  [
   "Good labelled questions include…",
   [
    "Only exact document wording",
    "Paraphrases, typos and real user phrasing",
    "Only yes/no questions",
    "None"
   ],
   1,
   "Test how users really ask."
  ]
 ],
 "remember": [
  "Index: section chunks + metadata. Search: BM25 + vectors fused with RRF.",
  "Refuse below a similarity threshold; cite and verify sources.",
  "Measure recall@k on labelled, real-world questions after every change.",
  "Evaluate answer quality separately from retrieval."
 ]
};
})(window.STUDY_LESSONS = window.STUDY_LESSONS || {});
