# Examiner review-file template (paired mode, plan §9.3)

Path: `learning/reviews/<session-uuid>-<agent>.md`. The examiner writes ONLY
this file: read-only otherwise, no edits to learner code or state.

```markdown
# Examiner review — session <uuid>

examiner: <claude|codex>
primary: <claude|codex>
checkpoint: <pre-lab design review | post-submission>

## Findings (max 3, each with evidence)
1. <finding> — evidence: <path/trace/test>
2. ...
3. ...

## Challenge (exactly 1)
<red-team case | harder transfer | eval hole>
```

The primary disposes of each finding next session (accept → exercise;
reject → one-line reason in the journal). Dispositions must equal findings
count (verification V30).
