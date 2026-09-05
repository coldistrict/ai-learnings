# Offline course consistency checks

From the repository root (Node 22+, no install, dependencies or network):

```bash
npm run course:check
npm run course:test
```

The checker is read-only and returns 0 for structural consistency, 1 for errors,
2 for CLI misuse. It does not run session commands, regenerate views, read learner
journals, inspect withheld answers, or change learning state. An optional
`-- --root <scratch-root>` selects an isolated fixture root. Tests create and
remove their own uniquely named temporary directories, never real learning state.

## Canonical data and compatibility

- [curriculum.json](../../learning/curriculum.json) owns milestone IDs, titles,
  module order, guide paths, focus and per-milestone hour ranges. Keep the existing
  string ranges and gate arrays for learning-OS readers. `core_hours` is a checked
  sum mirror. README, course navigation and scope totals must agree with that sum.
- [competencies.json](../../learning/competencies.json) owns the ten area IDs,
  depth targets and subskill names. No scoring fields are introduced.
- [course-map.json](../../learning/course-map.json), schema 1, owns topic IDs,
  explicit requirement/basis/rationale, competency/subskill coverage, teaching
  section references, destination milestone/gate pairs, chapter migration status,
  module material references, and pilot tiers. Required-later can mean later in
  the same milestone. Each current subskill maps once; several topics may use the
  same exercise. It is a scope map, not a completed chapter sequence.
- `course-map.json.gates` owns local gate-stage qualifiers mirrored by the older
  curriculum strings. Original V22 invariants (M6 >=8, M8 12/12) are also pinned
  in the checker as contractual constraints. V20/V34 must link local amendments.
  The external originals located by [RELOCATION](../../docs/RELOCATION.md) remain
  authoritative; this command does not need access to that external checkout.
- [SOURCE_LEDGER](../../learning/SOURCE_LEDGER.md) owns exact claim names. Guide
  `sources:` blocks and optional topic `sources` arrays must name existing rows.
  Neither revision-date syntax nor this check establishes freshness; use the
  authoring standard's real official-source recheck procedure when triggered.

The pilot's required-later table is a checked projection from topic destinations.
After an authorized map change, replace the text between its two
`pilot-required-later` comments with `requiredLaterTable(map)` exported by
`lib.js`; review the result. There is deliberately no automatic repair on check.

## Maintained link surface

The checker scans Markdown under `course/`, `prompts/`, and M1 lab documentation
(excluding learner workspace, fixtures and tests), plus root README/START_HERE,
SESSION_STATE, RELOCATION, verification RESULTS and this README. Newly added
Markdown under those directories is included automatically. Historical reports,
learner history and unrelated world/scenario pages are not recursively scanned.
Linked targets must exist; Markdown fragments must identify an ATX heading or
explicit HTML id/name. Heading duplicates use GitHub-style suffixes. Supported
links are inline links (including balanced parentheses), reference definitions/
uses and HTML href/src. Fenced examples and inline code are excluded. This is a
bounded Markdown convention, not a general Markdown parser or remote link audit.

## Migration and guarantees

Every chapter has an explicit `pending` reason until real pilot evidence supports
restructuring. Pending chapters must not carry fake tier maps. A later
`restructured` entry requires three tiers, linked evidence and an observed pilot;
file existence cannot establish whether that evidence is real or sufficient.
The prepared pilot carries no execution evidence. See [scope](../../course/SCOPE.md)
and [ADR-0011](../../learning/DECISIONS.md#adr-0011--explicit-scope-and-a-single-teaching-pilot-2026-09-05).

Negative fixtures cover wrong totals, missing guides/sections, unknown and wrongly
staged gates, missing/broken coverage, duplicate IDs, invalid dates/empty focus,
optional topics put into required tiers, broken local links/source names, stale
pilot tables and fake completed migration. They use a small scratch copy of
teaching metadata/docs and empty stand-ins for uninspected linked artifacts;
no learner transaction or network call is involved.

Passing establishes structural consistency and traceability. It does not prove
semantic completeness, educational effectiveness, SDK/host/live behavior, factual
freshness, or learner mastery. Human review against the original requirements and
actual pilot evidence still matters.
