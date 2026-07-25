# Diagnostic scoring machinery (tutor-owned)

Flow (after BOTH M0 sessions are closed):

1. Score against `.tutor` withheld scoring key (tutor-only; opened only at
   scoring time, after the learner's sessions).
2. Fill a score-input JSON (shape below; sample:
   `fixtures/sample-scores.json` — clearly labeled SAMPLE, never the
   learner's record).
3. `node tools/diagnostic/gapmap.js --input <scores.json>` → writes
   `learning/gap-map.md` + `learning/gap-map.json`, validates the
   `selectedPort` toolchain branch via the prereq checker, and records
   V32 blocking status honestly.

## Score-input shape

```json
{
  "learner": "<name>",
  "recorded_at": "<ISO date>",
  "availability": { "hours_per_week": 8, "target_interview_date": null },
  "pace_variant": "6h/wk | 10h/wk | 15h/wk",
  "role_overlay": "core-enablement | platform-lean | solutions-fde-lean",
  "area_scores": { "<each of the 10 area ids>": { "explain": 0-4|null, "build_debug": 0-4|null, "judgment": 0-4|null } },
  "skipped_but_gated": ["<topic>"],
  "selected_port": {
    "value": "csharp | go",
    "inputs": { "posting_fit": "...", "background": "...", "inventory_ref": "learning/prereq-report.json" }
  },
  "next_session_id": "m1-01-structured-output-contract"
}
```

Rules encoded by the generator: all 10 areas present; dims are integers 0–4,
null (unknown → `unseen`, non-punitive), or the explicit string `"n/a"`
(dimension not applicable); a lesson-skip suggestion requires measured ≥3 on
EVERY applicable dim with zero unknowns (Codex review S2 — unmeasured work is
never skippable); exactly one `selected_port.value` in {csharp, go} with all
three decision inputs; an absent selected toolchain records
`V32 BLOCKED(prereq:<toolchain>)` — never waived, never silently switched;
scores route and never grant mastery.
