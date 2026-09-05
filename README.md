# AI Enabler Mastery System — learning repository

Plan version: **ai-enabler-mastery-system-v3** (Claude–Codex consensus,
2026-07), with the **2026-09-05 course refresh** in ADR-0009. Target: Applied
AI Enablement Engineer for engineering and operations workflows. This repo is
the learner's: a mastery-gated **108–147 focused-hour** core program culminating
in the **AI Incident Enablement
Platform** capstone over the synthetic **NimbusPay** world.

**Honesty contract:** this program promises evidence and practice — never
guaranteed mastery or employment. Mastery gates are behavioral and measured;
green checks are necessary, never sufficient. All data here is synthetic.

## Start

```bash
npm run prereq       # descriptive toolchain inventory (installs nothing)
npm run learn:next   # what "next" means right now
```

Then tell your tutor (Claude Code or Codex): **"Teach me the next session."**
The tutor follows `START_HERE.md` + `prompts/` (or the `teach` skill), runs
one 60-minute session, and closes it transactionally. The live next action
comes from `learn:next`; progress is summarized in
[`learning/LEARNING_STATE.md`](learning/LEARNING_STATE.md).

Read the **[course guide](course/README.md)** for the M0–M9 learning path,
plain-language explanations, worked examples, practice, and glossary.
The [content review](docs/course-review-2026-09-05.md) records corrections,
current sources, and verification limits. Later executable labs remain
adapted to the learner and authored just in time.

The [M1-01 teaching pilot](course/pilots/m1-01-structured-output-contract.md) is
prepared; teaching and the remaining chapter rewrite await actual participation.
Run `npm run course:check` for [structural course checks](tools/course/README.md).

## Layout (plan §5.3)

| Path | What | Owner |
|---|---|---|
| `learning/` | learning OS: state, journals, generated views, ledgers | tutor infra |
| `course/` | M0–M9 concept guides, worked examples, glossary, teaching standard | tutor |
| `prompts/`, `.claude/skills/teach/`, `.agents/skills/teach/` | tutor session contracts + native wrappers | tutor |
| `world/` | NimbusPay spec + deterministic doc generator | tutor |
| `scenarios/` | incident scenario packs (public bundles) | tutor |
| `.tutor/` | withheld ground truth + scoring keys (see its README) | tutor |
| `diagnostics/` | M0 diagnostic sessions + fixtures | tutor |
| `labs/` | exercises: visible contracts + tests; `workspace/` dirs are YOURS | mixed |
| `packages/`, `apps/` | the capstone — **you write this code** (plan §8.5) | learner |
| `integrations/` | native Claude Code + Codex plugins (built at M7) | learner |
| `docs/` | ADR home, relocation record, verification results | shared |

## Status & provenance

Everything at Stage 0–2 (this scaffold, world, packs, diagnostics, lab
fixtures/tests) is tutor-authored infrastructure — recorded in
`learning/DECISIONS.md` ADR-0002 and not claimable as learner build
evidence. The learner's own work starts at the M0 diagnostic and the M1
labs. The original plan + verification documents live outside this repo;
see `docs/RELOCATION.md`. Local amendments are append-only in
`learning/DECISIONS.md`; the external originals remain historical records.

## Limitations (honest, current)

- Teaching content is available for all milestones; runnable lab infrastructure
  currently covers M0 diagnostics and M1 labs 01–03. Guides do not imply
  implemented capstone features or passed learner gates.
- Toolchain availability is host-dependent. `learning/prereq-report.json` is
  a dated inventory, not a live machine check; refresh it when a dependent
  milestone starts. Missing prerequisites block their gates.
- Current fake-provider cost tests prove exhausted-budget behavior; a hard
  positive live cap needs the M1 reservation bridge and spending consent.
- The synthetic pilot (M9) measures a portfolio methodology, not company ROI.
