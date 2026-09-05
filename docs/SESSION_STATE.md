# Unfinished sessions and Git

An unfinished session has two local files: `learning/active-session.json` and its
matching `learning/journal/.in-progress/<uuid>.md`. Both are ignored under
[ADR-0012](../learning/DECISIONS.md#adr-0012--unfinished-sessions-remain-local-recovery-data-2026-09-05).
They remain important recovery data. Do not delete ignored drafts during cleanup.
Closed `learning/journal/<uuid>.md` files remain trackable and immutable.

Use `npm run learn:check` to diagnose orphaned state. `npm run learn:next` returns
resume only when the lock and matching draft both exist; it does not diagnose
every orphan. These commands inspect state. Starting, resuming, closing, aborting
or regenerating state is a separate session action, not a Git maintenance step.

A fresh clone has no open session. Transferring an unfinished session to another
machine needs separate handling of both files, matching UUIDs and learner work,
with no concurrent tutor writing the session. Git alone will not transfer or back
up the open pair. After any separately arranged transfer, inspect both files and
run the read-only checks before continuing through the normal session workflow.
