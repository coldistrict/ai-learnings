# AI Enabler Mastery System — learning repository

Plan version: **ai-enabler-mastery-system-v3** (Claude–Codex consensus,
2026-07). Target: Applied AI Enablement Engineer for engineering and
operations workflows. This repo is the learner's: a mastery-gated 105–145
focused-hour core program culminating in the **AI Incident Enablement
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
one 60-minute session, and closes it transactionally. Current state:
Stages 0–2 are implemented; the next session is the **M0 diagnostic
(Session A)** — routing calibration, not a test you can fail.

## Layout (plan §5.3)

| Path | What | Owner |
|---|---|---|
| `learning/` | learning OS: state, journals, generated views, ledgers | tutor infra |
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
labs. Authoritative plan + verification documents live outside this repo;
see `docs/RELOCATION.md`.

## Limitations (honest, current)

- No sessions have run yet; the competency ledger is all `unseen`.
- codex CLI, claude CLI, Go, and .NET were absent from the non-interactive
  PATH at Stage 0 (`learning/prereq-report.json`) — host-dependent
  verification gates are BLOCKED until installed; nothing is auto-installed.
- The synthetic pilot (M9) measures a portfolio methodology, not company ROI.
