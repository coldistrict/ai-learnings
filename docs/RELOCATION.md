# Repository relocation record (2026-07-25)

## Why this repo's path differs from the approved documents

The approved plan pair for **ai-enabler-mastery-system-v3** names this
target repository:

```
/Users/coldistric/Documents/become-harness-king-ai-enabler-ai-native-etc
```

That location was later repurposed for CV-related work and is NOT the
learning repository. The user explicitly authorized relocating the approved
learning system to:

```
REPO=/Users/coldistric/Documents/ai-learnings   (this repository)
```

**Interpretation rule for all future Claude and Codex sessions:** every
reference to the target repository or `$REPO` in the authoritative documents
below refers to THIS repository. The relocation is operational only — it
does not reopen or amend the curriculum, architecture, verification gates,
capstone, teaching protocol, or ownership rules. Do not modify the
authoritative source files, and do not touch the old CV workspace.

## Authoritative source documents (read-only, outside this repo)

Base: `/Users/coldistric/source/repos/codex-claude-communication/tasks/2026-07-15-ai-enabler-mastery-system/`

- `final-plan.md` — the approved design (v3; APPROVED — codex)
- `verification.md` — the approved verification contract (V1–V36)
- `transcript.md` — full Claude–Codex discussion (provenance/ambiguity only)
- `TASK.md`, `protocol.md`, `state.json` — task definition, protocol, consensus state

`final-plan.md` + `verification.md` are the authoritative approved pair.

**Local content amendment (2026-09-05):** The user subsequently authorized a
course review and improvement. ADR-0009 in `learning/DECISIONS.md` adds teaching
guides and narrowly amends obsolete content/lifecycle assumptions; consult it
alongside the original pair. The original files remain unchanged. This is a
content amendment distinct from the operational relocation above.

## Where verification results live

`verification.md` says results are appended below its final line; because
that file is read-only authoritative source material, dated
PASS/FAIL/BLOCKED results are recorded in **`docs/verification/RESULTS.md`**
in this repository instead (see DECISIONS.md ADR-0001), with evidence under
`docs/verification/evidence/`.
