# M4 — Retrieval and grounded answers

Prerequisite: M2 evaluation and M3 access-controlled tools. Outcome: a measured
retrieval pipeline whose answers cite authorized, current supporting evidence.

## The practical problem

Noor asks for the procedure relevant to a ticket. The assistant gives a confident
answer and a citation, but the cited procedure is for a different service. More
fluent wording will not repair that evidence gap. You will follow the path from
question to retrieved documents to supported claims, then compare search methods
on the same cases. The useful result is knowing where an answer went wrong and
which change could fix it.

## RAG is a pipeline, not a vector database

**Retrieval-augmented generation (RAG)** selects external evidence and supplies
it to a model for answering. The pipeline is ingestion → indexing → retrieval
→ context assembly → answer → verification. An error at any stage can make the
answer fail even if the other stages work.

During ingestion, assign stable document IDs, versions, source locations,
timestamps, and access metadata. **Chunking** divides documents into retrievable
units. A tiny chunk may omit the condition that makes a procedure safe; a huge
chunk may bury the answer and consume the context budget. Start with document
structure—headings and complete procedures—then measure performance on your
queries. There is no universally best chunk size or overlap percentage.

## Lexical, semantic, hybrid, and reranking

**Lexical search** matches words or tokens, often with a ranking scheme such as
BM25. It is a strong baseline for exact service names, identifiers, and error
codes. **Embeddings** map content to numerical vectors; semantic retrieval ranks
nearby vectors to find related meaning, including some paraphrases. Similarity
is neither factual support nor an access decision.

**Hybrid retrieval** combines lexical and semantic candidate lists. One approach
is reciprocal rank fusion: each list contributes `1 / (c + rank)` to a candidate's
score, with a chosen constant `c`. This avoids directly adding incompatible
lexical and vector score scales. Tune the combination on development queries.

A **reranker** scores a smaller candidate set against the query after initial
retrieval. It cannot recover a document absent from that set. Add reranking only
if ranking errors, rather than ingestion or access errors, justify its latency.
Contextual retrieval adds document context to chunks during indexing; it may help
ambiguous fragments but can also introduce bad context. Treat it as an optional
measured experiment. [Anthropic's contextual retrieval design](https://www.anthropic.com/engineering/contextual-retrieval).

## Worked example: measure the right failure

For a synthetic library question, three chunks are relevant. The top five
retrieved chunks contain two of them:

- **Recall@5 = 2/3:** how much of the known relevant evidence was found?
- **Precision@5 = 2/5:** how much of the retrieved set was relevant?

If relevant evidence first appears at rank 3, reciprocal rank is 1/3. **MRR**
averages that value across queries. **nDCG** can account for graded relevance
and position when “somewhat relevant” differs from “fully answers the question.”
Use a stated convention for queries with no relevant documents; evaluate correct
abstention separately rather than divide recall by zero.

Now the answer claims all branches are open Sunday and cites a valid catalog ID.
The ID exists, but the cited text only covers one branch. **Citation validity**
checks the identifier, version, and authorization. **Citation support** checks
whether the text supports the associated claim. **Answer correctness** checks
the task's substantive answer. Report them separately.

## Permission and freshness are part of retrieval

Restrict access before protected content reaches the model, and recheck access
when fetching a selected object. Candidate generation and reranking must not
receive unauthorized content merely because the final answer will be filtered.
Key caches by tenant and authorization context as well as query/version. A cache
hit is not permission to reveal another user's answer.

When a document is revoked, deleted, or superseded, enforce that state at read
time, invalidate relevant caches, and remove obsolete index entries according
to an explicit lifecycle. Core work must demonstrate stale/revoked evidence is
not served; a fully automated deletion pipeline remains optional infrastructure.
Retain source version and retrieval time so an investigator can reconstruct
what evidence the system saw.

Treat retrieved instructions as untrusted content. A runbook that asks the model
to ignore policy must not gain authority over tool permissions. If evidence is
insufficient or conflicting, explain what is unknown and propose a safe next
check rather than inventing a source.

## Practice and completion evidence

Build the lexical baseline. Label a development set containing exact identifiers,
synonyms/paraphrases, unanswerable questions, outdated content, and denied access.
Record a real lexical failure, then implement embedding and hybrid retrieval and
compare on the same queries. Decide adoption through an ADR; the learning
comparison is required even if the simple baseline wins for deployment.

Publish recall/precision separately from answer and citation scores, include
latency/cost and case counts, and preserve an untouched evaluation split. V21
requires valid citations; this chapter adds the explanation of why valid IDs
alone cannot establish grounded answers.

Explain whether a bad answer came from missing evidence, wrong ranking,
misinterpretation, stale data, or unauthorized access—and show evidence for
that diagnosis before changing the prompt.

sources: Contextual retrieval.
