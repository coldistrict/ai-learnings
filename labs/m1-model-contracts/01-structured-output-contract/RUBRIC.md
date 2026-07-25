# Review rubric — m1-01 (tutor-facing)

Review workflow per plan §8.4: read README + learner diff without editing →
run the acceptance tests → report static/runtime/requirements outcomes
separately → name the single highest-leverage conceptual issue, invoke the
model, learner fixes → re-run → one transfer probe → record artifact,
outcome, hint level, provenance.

Score 0–4 per dimension (program scale):

| Dimension | 2 (guided partial) | 3 (independent solid) | 4 (transfer) |
|---|---|---|---|
| Contract correctness | most ACs green with hints | all 7 ACs green at H0–H1 | + articulates what the contract still can't catch |
| Error taxonomy | codes returned but conflated | SCHEMA_VALIDATION_FAILED vs PROVIDER_OUTPUT_INVALID cleanly separated, fields named | + explains how callers would branch on codes |
| Robustness | throws somewhere under odd input | never throws across all fixtures | + reasons about inputs the fixtures don't cover |
| Explain-back | restates with prompting | states shape-vs-truth split unprompted | + maps it to tool-args/MCP boundaries unasked |

Explain-back prompts:
1. "What does AC-1 passing NOT prove about the classifier's accuracy?"
2. "Why is `error.field` worth the implementation cost?"

Transfer probe (same-session, small): "A webhook payload validator needs the
same discipline — name the two codes you'd define and what maps to each."

Caps: any tutor-written code in workspace/ (even consented) caps this lab's
build evidence at `developing`; H5 reveal caps at developing + schedules a
different-context repair.
