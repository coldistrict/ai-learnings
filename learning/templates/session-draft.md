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
"L10-L12 replaced"), reason (non-empty), consent (strict enum:
"yes-explicit" | "yes-mechanical-unblock"; free-text detail goes in the
optional consent_note), interview_claim_impact (non-empty). EVERY tutor
edit to a learner-owned file — including the consented ≤3-line mechanical
unblock — needs one (plan §8.5).

Body sections: START/PRIME (due retrievals) · MODEL ↔ PROBE · GATE · LAB
(evidence step, hints used) · DEBRIEF/CLOSE (retention-3, next review).

## Adaptive teaching and handoff (ADR-0013)

New drafts also include **Adaptive teaching** and **Adaptive handoff** body
sections. Follow [the shared policy](../../course/ADAPTIVE-TEACHING.md). These
are tutor-maintained notes; they add no required frontmatter or automatic scores.
Append them to an older open draft when adopting the policy; preserve its prior
observations and never modify closed journals.

Record material evidence (case/response/artifact and assistance), the provisional
assessment and uncertainty, and the resulting teaching decision with its reason.
At pause/close, carry forward demonstrated skills with evidence references,
unresolved gaps/unobserved skills, teaching preferences, next focus and reason,
and delayed checks needed or scheduled. Distinguish a plan from a performed check.
Actual due scheduling uses ledger-change `next_due`; `next_review` prose alone
does not enter the resolver's due queue.
