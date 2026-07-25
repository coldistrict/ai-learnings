# Session-draft template (reference)

`learn:start` generates drafts programmatically; this file documents the
shape for humans and tutors. Frontmatter rules: strings double-quoted (JSON
style), fields single-line, prose in the body. Required at close (plan §8.2,
verification V14): uuid, teacher, mode, variant, status, started_at,
closed_at, planned_scope, phase_minutes (5 phases), exercises (id +
highest_hint H0–H5), live_spend (estimated_usd + actual_usd; 0 allowed),
ledger_changes, provenance_events, learner_changes, evidence,
interview_items, next_review.

Ledger-change entry fields: competency, from, to, plus (for durable
promotions) evidence_dates, contexts, classes — `learn:close` refuses a
durable promotion without ≥2 evidence dates ≥3 days apart, ≥2 different
contexts, ≥1 build/debug/review class, and a timed-explain-back class
(plan §8.6).

Provenance-event fields (ALL required, enforced at close): agent (claude|
codex), files (non-empty list), lines (count or range, e.g. 3 or
"L10-L12 replaced"), reason (non-empty), consent (must record an affirmative
— a string containing "yes"), interview_claim_impact (non-empty). EVERY
tutor edit to a learner-owned file — including the consented ≤3-line
mechanical unblock — needs one (plan §8.5).

Body sections: START/PRIME (due retrievals) · MODEL ↔ PROBE · GATE · LAB
(evidence step, hints used) · DEBRIEF/CLOSE (retention-3, next review).
