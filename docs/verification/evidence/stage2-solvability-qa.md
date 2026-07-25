# Stage 2 solvability QA record (plan §8.5 A1) — 2026-07-25

Policy: exercise solvability is proven at authoring time with a TEMPORARY
implementation in a scratch location, validated against the public criteria,
then discarded. This file is the required record that the QA ran.

Procedure (executed 2026-07-25, session scratchpad
`…/scratchpad/solvability-qa/`, outside the repository):

1. Wrote temporary reference implementations `ws01/classify.js`,
   `ws02/adapter.js`, `ws03/policy.js` in the scratchpad.
2. Ran each lab's visible acceptance tests against them via the
   `LAB_WORKSPACE_DIR` override:
   - `LAB_WORKSPACE_DIR=…/ws01 node --test "labs/m1-model-contracts/01-structured-output-contract/tests/*.test.js"` → **7/7 pass**
   - `LAB_WORKSPACE_DIR=…/ws02 node --test "labs/m1-model-contracts/02-retry-repair-path/tests/*.test.js"` → **6/6 pass**
   - `LAB_WORKSPACE_DIR=…/ws03 node --test "labs/m1-model-contracts/03-ratelimit-fallback-costcap/tests/*.test.js"` → **5/5 pass**
3. Deleted the scratch directory (`rm -rf`), verified gone.
4. Verified no solution artifacts persist in the repo:
   `find labs -iname '*solution*' -o -iname '*reference*' | wc -l` → **0**.
5. Verified the committed learner stubs produce the intended failing
   baseline: `npm run test:labs` → **0 pass / 18 fail** (every test fails
   until the learner implements — anti-spoiler + failing-baseline-first).

Recorded per DECISIONS.md ADR-0005.
