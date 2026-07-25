# M0 diagnostic — Session B (60 minutes)

Tutor-run per plan §4; same rules as Session A (no teaching during scoring;
unknown is valid). Run inside a session transaction (module
`m0-diagnostic-session-b`). After this session: tutor scores both sessions
against the withheld key, then runs the gap-map generator; the gap map
records `selectedPort` with its decision inputs and validates the selected
toolchain (absent toolchain ⇒ V32 = BLOCKED(prereq:<toolchain>), never
waived, never silently switched).

---

## B1 — Implement/repair a schema-validated tool boundary (25 min)

Copy `diagnostics/fixtures/tool-boundary/` to
`diagnostics/work/tool-boundary/` and repair the validator there (the copy
keeps the fixture pristine; your working copy is learner-owned).

The folder contains a tool-argument schema (`schema.json`), a broken
validator (`validate.js`), and visible tests (`validate.test.js` — run with
`node --test "diagnostics/work/tool-boundary/*.test.js"`). Make the tests pass WITHOUT
weakening them. The tests assert observable contracts only; there is no
hidden requirement. Narrate your evidence step as you go (expected vs
actual, first divergence).

## B2 — Review an MCP tool description + an injection-bearing document (15 min)

1. (~8 min) `diagnostics/fixtures/mcp-tool-desc.json` — you are reviewing
   this tool before it ships on the incident-assistant MCP server. List
   every problem you see (schema, description, least privilege), rank the
   worst one first, and propose the minimal safe redesign.
2. (~7 min) `diagnostics/fixtures/doc-with-injection.md` — this runbook page
   will be ingested into retrieval. What happens when the assistant reads it
   during an investigation, what MUST the harness guarantee about text like
   this, and where is that guarantee enforced (name the layer)?

## B3 — Design a small eval (10 min)

Design (don't implement) an eval for: "the assistant classifies an incident
ticket into {cursor-pagination, idempotency, queue-poisoning, other} and
names the causal service." Specify: dataset source and size, split(s), ≥2
scorers (at least one deterministic), ≥1 NEGATIVE case that must fail if the
system regresses, and what number would block a release.

## B4 — Two 5-minute explanations (10 min)

1. **Technical (5 min):** to a senior engineer — "Why do we validate model
   output against a schema AND still keep a human approval on the incident
   update?" Be precise about what each layer catches.
2. **Executive (5 min):** to a VP — "Should we let the incident assistant
   post updates automatically?" Give a recommendation with one number you'd
   want first, one risk, and one cost, in plain language.

---

Total: 25 + 15 + 10 + 10 = 60. After close: score, generate the gap map
(`node tools/diagnostic/gapmap.js --input <recorded-scores.json>`), record
`selectedPort` + decision inputs + post-choice toolchain validation, set
pace variant and role overlay, initialize ledger rows non-punitively
(`unseen` for untested/unknown), and state the next session id.
