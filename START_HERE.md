# START_HERE — tutor/learner contract

Plan version `ai-enabler-mastery-system-v3`. Changes to THIS file happen
only via a DECISIONS.md ADR. Tutors: your full session contract is
`prompts/SOLO-CLAUDE-PROMPT.md`, `prompts/SOLO-CODEX-PROMPT.md`, or
`prompts/PAIRED-SESSION-PROMPT.md` (the `teach` skill wraps the same body).
This page is the shared summary both humans and tutors rely on.

## Session commands (plain npm scripts; the transaction is plan §9.2)

```bash
npm run learn:next     # resolve what "next" means (resume → remediation → due review → module/gate)
npm run learn:start -- --teacher <claude|codex> --mode <solo|paired>
npm run learn:close    # validates, renames journal immutable, regenerates views, updates pointer, unlocks
npm run learn:abort -- --reason "<why>"   # abort without mastery changes
npm run learn:resume   # re-attach to an interrupted session
npm run learn:regen    # rebuild views + repair pointer/stale lock
npm run learn:check    # invariants; add -- --strict for SOURCE_LEDGER staleness
npm run prereq         # descriptive toolchain inventory (never installs, never picks the port)
```

Natural start: say **"Teach me the next session."**

## Non-negotiables (both tutors, every session)

1. **Bounded state reads** — this file, `learning/LEARNING_STATE.md`, due
   ledger rows, last two closed journals, current milestone row, ledger
   staleness. Never the full history; never ask the learner to restate it.
2. **The learner writes all substantive code** (`packages/`, `apps/`, lab
   `workspace/` dirs, `diagnostics/work/`). Tutor edits there require
   explicit consent (or a named ≤3-line mechanical unblock with a yes) and a
   provenance event — `learn:close` enforces attribution via file manifests.
3. **Hint ladder H0–H5** with the free evidence step first; H5 reveals cap
   mastery at `developing` and schedule a different-context transfer.
4. **Withheld material** (scenario ground truth, red-herring inventories,
   scoring keys — layout in `.tutor/README.md`) is never read before the
   learner's submission review, and never adds hidden requirements. Learner:
   staying out of the withheld area is what keeps your own calibration real.
5. **Cost consent** — replay/mock by default; live runs need `--allow-live`
   AND `--max-cost-usd`, capped by `live_cost_cap_usd` in
   `learning/state.json` (learner-approved at M0/M1). Exceeding a cap fails
   the run, never mastery.
6. **Mastery gates are never waived** — diagnostic skip logic may skip
   lessons only. `durable` requires delayed, different-context evidence
   (enforced at close).
7. **Anti-spoiler authoring** — every exercise shows scenario, constraints,
   and acceptance criteria; tests assert observable contracts only; no
   solution code exists in this repo.

## Where things stand

Stage 0–2 are built (learning OS, NimbusPay world, 3 scenario packs, M0
diagnostic, M1 labs 01–03). Next: **M0 diagnostic Session A**
(`diagnostics/m0-session-a.md`) — two 60-minute sessions that produce the
gap map, pace variant, role overlay, and the `selectedPort` decision. Don't
pre-read diagnostics or SESSION.md files. Gate results and evidence live in
`docs/verification/RESULTS.md`; authoritative plan paths in
`docs/RELOCATION.md`.
