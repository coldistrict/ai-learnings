# M0 diagnostic scoring key (TUTOR-ONLY — read only when scoring, after Session B)

Score each of the 10 areas (learning/competencies.json) 0–4 per dimension
(explain / build_debug / judgment) where evidence exists; leave null where
untested or unknown (→ ledger `unseen`, non-punitive). 0 absent/unsafe ·
1 recognition · 2 guided partial · 3 independent solid · 4 strong
transfer/tradeoffs. Diagnostic scores NEVER grant mastery states above
`introduced`, and skip logic (subskills ≥3) never waives a gate.

## Session A

**A2.1 (llm-fundamentals / explain).** Expect ≥2 distinct nondeterminism
sources: sampling temperature/top-p; provider-side batching/hardware
numerics; model/prompt version drift; context truncation differences. Score
3+ for two clean sources + why 200k context is irrelevant here.

**A2.2 (llm-fundamentals / explain).** Guarantees syntactic shape (schema-
valid structure). Does NOT guarantee semantic truth of values (wrong-but-
valid field contents, fabricated ids). 3+ mentions valid-but-wrong.

**A2.3 (tool-workflow-agent / judgment).** Harness bug. Deterministic fix:
typed tool results where error results short-circuit/force explicit handling
(taxonomy + policy), not prompt pleading. 3+ places enforcement in code.

**A2.4 (retrieval-rag / explain).** Two locations with this signature:
(a) answer-synthesis mis-citation despite good retrieval (grounding/citation
enforcement gap); (b) ranking returns near-duplicates where correct doc is
retrieved-but-not-cited / wrong chunk granularity. Also acceptable: recall
measured on lenient labels. 3+ separates retrieval metrics from answer
metrics explicitly.

**A2.5 (mcp / explain).** Standardized capability negotiation + typed
tool/resource/prompt contracts over a session lifecycle vs bespoke per-API
glue; initialization exchanges protocol version + capabilities. 3+ mentions
lifecycle/negotiation, not just "plugins for models".

**A2.6 (evals-observability / explain+judgment).** Failing baseline proves
the instrument can detect the defect class; an always-green suite has
unknown sensitivity ("tests that cannot fail verify nothing"). 3+ ties to
regression gating.

**A3.1 broken-trace (tool-workflow-agent + evals-observability /
build_debug).** Planted defects, in severity order:
1. Span 3: `read_logs` executed with missing required `time_range` —
   schema validation absent at the tool boundary (root enabler).
2. Span 4/5: citation `doc-batch-import-guide` is NOT in
   `retrieved_doc_ids_this_run` — fabricated citation reached a draft
   (citation-validity check missing).
3. Span 5 draft asserts "Fix deploying today" — unverified claim in an
   outward-facing draft (policy/approval content gap acceptable as minor).
4. Span 6 executes AFTER the terminal action and is step 6 vs max_steps 5 —
   budget not enforced.
Score build_debug 3+ for finding ≥2 including the fabricated citation, with
correct boundary attribution; 4 for all + naming the deterministic check per
defect.

**A3.2 retrieval-case (retrieval-rag / build_debug).** Class: lexical/
vocabulary mismatch (paraphrase miss) — query says "modification time ...
page edges", doc says "updated_at ... boundary value"; BM25 has no synonymy.
Worse than refusal: confidently wrong grounding cites an irrelevant doc.
Measure: labeled query set w/ known-relevant docs; recall@k / MRR for
retrieval separated from answer-correctness; fix-verify by re-running same
labeled set after hybrid/semantic addition. 3+ names paraphrase failure +
separated metrics.

**A3.3 tool-result (tool-workflow-agent / build_debug).** Defect class:
fabricated continuation after tool error (hallucinated data). Layer: harness
must make error results terminal-or-handled (typed Result, policy blocks
"success-shaped" continuations; assistant text asserting numbers requires a
successful source span). Trace/eval: record tool status + downstream claim
provenance; regression: fixture asserting the run fails-closed. 3+ gives a
mechanical guarantee, not "prompt it better".

**A4.1 (security-governance / judgment).** Expect: user input untrusted;
retrieved docs/tickets untrusted (injection channel); model output untrusted
until validated; deterministic policy/tool registry enforcement; MCP server
boundary authn/authz; draft-only writes; distinct just-in-time approval
before any external side effect (R3); audit at the boundary. 3+ draws ≥4
boundaries with the approval boundary placed correctly.

**A4.2 (tool-workflow-agent + enablement-org / judgment).** Strong answer:
deterministic pipeline (fixed query + template email); optional LLM ONLY for
a summary paragraph over deterministic data, still no agent; cites cost/
reliability/auditability. Committing to "agent" scores ≤1 judgment.

## Session B

**B1 (tool-workflow-agent + llm-fundamentals / build_debug).** Seeded bugs:
(1) `level` missing from required-fields check; (2) case-insensitive service
enum match; (3) no additionalProperties rejection; (4) limit accepts
non-integers. Score 3+ for all four fixed without weakening tests inside the
box; note evidence-step quality and hint level. H-level used caps the score
per plan §8.3.

**B2.1 mcp-tool-desc (mcp + security-governance / judgment).** Expected
findings, worst first: (1) description contains embedded instructions to
execute follow-ups from tool RESULTS (injection amplifier / instruction-
in-data); (2) `raw_sql` as service account = arbitrary read (least-privilege
violation; also contradicts readOnlyHint trust); (3) `tenant:'*'`
encouraged = cross-tenant exposure by default; (4) `include_pii` default
true; (5) no `required`, no `additionalProperties:false`, unconstrained
strings. Redesign: narrow structured params (tenant required, enum-checked
server-side against caller authz, no raw_sql, PII opt-in with authz,
neutral description free of imperative instructions). 3+ finds 1–3 and
ranks the embedded-instruction or raw_sql first.

**B2.2 doc-with-injection (security-governance / judgment).** Expect:
retrieved text is DATA; the hidden HTML-comment directive is indirect
injection; harness guarantees: retrieved content can never raise its
privilege, tool calls filtered by policy regardless of prompt content,
create_incident_update is draft-only + human approval (R3), injection
attempt logged/flagged; enforcement lives in the deterministic policy/tool
layer, not in the prompt. 3+ names the layer explicitly.

**B3 (evals-observability / build_debug+judgment).** Expect: dataset from
scenario packs' withheld labels (learner will propose "labeled tickets" —
fine), size ~20–50 with dev/held-out split; scorers: exact-match on
{class, causal_service} (deterministic) + rubric/citation-validity;
negative case: a ticket whose evidence contradicts the tempting class (red
herring) must NOT be classified into it — regression trips if it is;
release-blocking number frozen from baseline (e.g. held-out accuracy or
0 citation-validity failures). 3+ includes a real negative case + separated
metrics.

**B4.1 technical (interview-communication / explain).** Layered defense:
schema catches malformed shape; approval catches wrong-but-valid content +
accountability for external effects; neither substitutes for the other.
**B4.2 executive (interview-communication + enablement-org / explain).**
Clear recommendation, one number (e.g. measured unsafe-action rate / draft
accuracy on held-out packs), one risk (injection-driven false update), one
cost (review latency or API spend), no jargon. 3+ lands all three concretely.

## After scoring

Fill the score-input JSON (see `tools/diagnostic/README.md`), run the
gap-map generator, record `selectedPort` (exactly one of {csharp, go}) with
decision inputs (target-posting fit, learner background, inventory ref) and
run the post-choice toolchain validation. Initialize ledger rows
non-punitively; list skipped-but-still-gated topics; set pace variant and
role overlay; state the next session id.
