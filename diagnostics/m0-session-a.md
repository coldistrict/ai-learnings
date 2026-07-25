# M0 diagnostic — Session A (60 minutes)

Tutor-run per plan §4. **No teaching during scoring; "I don't know" is a
valid, non-punitive result** — unknown areas enter the ledger as `unseen`.
Scores route; they never grant mastery, and skip logic never waives a gate.
Run inside a normal session transaction (`learn:start`, module
`m0-diagnostic-session-a`). Learner: do not pre-read this file or the
fixtures before the session; pre-reading only degrades your own calibration.

Scoring: tutor records observations per part; formal 0–4 scoring per area ×
dimension (explain / build-debug / judgment) happens after Session B using
the withheld key, then the gap-map generator (`tools/diagnostic/gapmap.js`).

---

## A1 — Role, pace, availability (10 min)

1. Which postings are you actually targeting first (paste 1–3 links or
   titles)? What in them worries you most?
2. Hours/week you can genuinely commit, and any target interview date?
   (Pace variants: ~6, ~10, or ~15 h/wk; calendars are estimates, never
   promises.)
3. Role overlay preference: core enablement, AI Platform lean, or AI
   Solutions/FDE lean — and why?
4. Language background check-in: current comfort in C#/.NET vs Go (recent
   use, scale, tooling). This feeds the `selectedPort` decision (recorded at
   gap-map time together with target-posting fit and the Stage-0 toolchain
   inventory in `learning/prereq-report.json`); note that neither Go nor
   .NET was present on PATH at Stage 0, so the selected one will need a
   documented install before V32.
5. What would make this program a failure for you even if every gate passes?

## A2 — Explain/predict (15 min; ~2–3 min each)

Answer without references. "Don't know" is fine.

1. **LLM:** A prompt is 6k tokens, the model's context is 200k. Why can the
   same request still return different answers on consecutive runs? Name two
   distinct sources of nondeterminism.
2. **Structured outputs:** What does schema-constrained decoding guarantee,
   and name one thing it does NOT guarantee about the values.
3. **Tools:** A tool result returns `{"status":"error"}` but the model keeps
   going as if it succeeded. Whose bug is that — model, harness, or tool —
   and what's the deterministic fix?
4. **RAG:** Retrieval recall is 95% but answers cite the wrong document 30%
   of the time. Predict two different failure locations that produce exactly
   this signature.
5. **MCP:** What problem does MCP solve that a plain HTTP API doesn't, and
   what does a client learn during initialization?
6. **Evals:** Why must a failing baseline exist before tuning? What does a
   suite that has never failed tell you?

## A3 — Diagnose supplied broken artifacts (20 min)

Fixtures (open them now, not before): work through each, stating expected vs
actual, the FIRST divergence, and the trust boundary it sits on.

1. `diagnostics/fixtures/broken-trace.json` (~8 min) — a recorded tool-loop
   trace. What went wrong, where, and which deterministic check was missing?
   There may be more than one defect.
2. `diagnostics/fixtures/retrieval-case.md` (~6 min) — a query, the
   retrieved chunks, and the produced answer. Diagnose the failure and say
   what you would measure to confirm it.
3. `diagnostics/fixtures/tool-result.json` (~6 min) — a tool exchange.
   What should the harness have done differently, mechanically?

## A4 — Trust boundaries + one judgment call (15 min)

1. (~9 min) Sketch (text is fine) the trust boundaries for: "an assistant
   that reads NimbusPay runbooks and incident tickets, inspects logs, and
   drafts an incident update for human approval." Mark: untrusted inputs,
   where model output must be treated as untrusted, where policy is
   enforced deterministically, and where the write/approval boundary sits.
2. (~6 min) Deterministic-vs-agent call: "Every morning, collect yesterday's
   failed webhook deliveries and email the integrations team a summary."
   LLM/agent, deterministic pipeline, or hybrid — commit and defend in ≤5
   sentences.

---

Close: tutor records observations + timestamps in the session journal; no
scores are shown yet; schedule Session B. Total: 10 + 15 + 20 + 15 = 60.
