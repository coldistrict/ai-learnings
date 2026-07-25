# packages/ — LEARNER-OWNED capstone code (plan §5.3, §8.5)

Empty by design at Stage 0–2. The learner builds these, milestone by
milestone; tutors never write substantive code here (consented ≤3-line
mechanical unblocks only, always with a provenance event):

- `contracts/` — provider/tool/domain JSON Schemas (M1+)
- `runtime-harness/` — model loop, budgets, retries, trace (M2/M5)
- `policy/` — risk classes, approval, audit, redaction (M5)
- `mcp-server/` — stdio first; Streamable HTTP at M8 (M3/M8)
- `retrieval/` — lexical (SQLite FTS) → hybrid behind an interface (M4)
- `eval-harness/` — "evalkit": datasets, runners, scorers, reports (M2)
