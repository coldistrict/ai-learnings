# START_HERE — tutor/learner contract

Plan version `ai-enabler-mastery-system-v3`; content amendment 2026-09-05
(ADR-0009). Changes to THIS file happen
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

Use `npm run learn:next` for the current action and
`learning/LEARNING_STATE.md` for progress. An open session takes precedence.
The lock and matching draft are ignored together but remain local recovery data;
see [unfinished sessions and Git](docs/SESSION_STATE.md) (ADR-0012).
Infrastructure includes the learning OS, NimbusPay world, three scenario packs,
M0 diagnostic, and M1 labs 01–03. M0–M9 teaching references are in
`course/`; later executable exercises are authored just in time. Don't pre-read
diagnostics or SESSION.md probes. Gate results and evidence live in
`docs/verification/RESULTS.md`; original plan paths in `docs/RELOCATION.md`.

## Teaching content and current facts (ADR-0009)

After bounded state reads, load the current milestone's `study_guide` from
`learning/curriculum.json`, plus the relevant section of `course/AUTHORING.md`.
This is bounded lesson preparation, not permission to read every chapter or
the full learning history. Explain one concept with a worked analogous example,
check a prediction, and use the existing public exercise contract for grading.
Keep the diagnostic teaching-free until scoring ends.

For M1-01, the guide and session plan link the prepared
[teaching pilot](course/pilots/m1-01-structured-output-contract.md) (ADR-0011).
Use it only after the learner separately asks to begin; resume the correct open
session through the normal workflow. Other chapter restructuring remains pending
pilot evidence. Required/optional coverage is explicit in [scope](course/SCOPE.md);
Lab 03's changed explanation assessment applies prospectively after teaching
(ADR-0010). Before executing V20/V34, read their local
[gate amendments](docs/verification/RESULTS.md#execution-amendments-2026-09-05).

The guide distinguishes implemented labs from future exercise briefs. Author
and verify new lab prerequisites before assigning them. Before M1 live work,
complete the refusal/streaming/provider and hard-budget reservation bridge;
lab 03's spent-so-far check is insufficient for a positive live cap. New tests
must have public criteria before use, never retroactive hidden requirements.

Recheck relevant SOURCE_LEDGER facts by opening the official pages; distinguish
documentation verification from SDK/host testing. At M3 use the recorded current
MCP revision, with legacy lifecycle tests only for a named compatibility path.
The course guide and ADR-0009 amend stale product teaching in the original plan
while retaining its learning objectives, ownership, and mastery thresholds.
