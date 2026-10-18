// learn:start --teacher <claude|codex> --mode <solo|paired> [--scope "..."] [--module <id>]
// Phase 1 of the two-phase session transaction (plan §9.2).
//
// Lock acquisition is ATOMIC: the lock file is created with an exclusive
// O_CREAT|O_EXCL write BEFORE the draft exists, so two tutors starting
// simultaneously cannot both win (Codex review 2026-07-25, finding B1).
// A genuinely stale lock (its session already closed/aborted in journal/)
// is cleared and acquisition retried. A lock WITHOUT a journal is never
// auto-cleared — the other tutor may be mid-acquisition; learn:check
// reports true orphans and learn:abort clears them deliberately.
import fs from 'node:fs';
import path from 'node:path';
import {
  repoRoot, P, nowIso, newUuid, readJson,
  writeJournal, learnerManifest, PHASES, removeLockSerialized, pauseMs,
} from './lib.js';

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const root = repoRoot();
const teacher = arg('teacher');
const mode = arg('mode', 'solo');
const scope = arg('scope', 'TBD — set during START/PRIME phase');
const module_ = arg('module', null);

if (!['claude', 'codex'].includes(teacher)) {
  console.error('usage: npm run learn:start -- --teacher <claude|codex> --mode <solo|paired> [--scope "..."]');
  process.exit(1);
}
if (!['solo', 'paired'].includes(mode)) {
  console.error(`invalid --mode: ${mode} (solo|paired)`);
  process.exit(1);
}

const lockFile = P.lockFile(root);
fs.mkdirSync(P.inProgressDir(root), { recursive: true });

const uuid = newUuid();
const startedAt = nowIso();
const lockPayload = JSON.stringify({ uuid, teacher, mode, started_at: startedAt }, null, 2) + '\n';

// ---- atomic acquisition (with bounded stale-lock clears) --------------------
let acquired = false;
for (let attempt = 0; attempt < 3 && !acquired; attempt++) {
  try {
    fs.writeFileSync(lockFile, lockPayload, { flag: 'wx' });
    acquired = true;
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    let lock;
    try {
      lock = readJson(lockFile);
    } catch {
      console.error('A session lock exists but is not yet readable — another tutor is likely acquiring it right now. Try again in a moment, or run: npm run learn:check');
      process.exit(1);
    }
    const journalFile = path.join(P.journalDir(root), `${lock.uuid}.md`);
    const draftFile = path.join(P.inProgressDir(root), `${lock.uuid}.md`);
    if (fs.existsSync(journalFile) && !fs.existsSync(draftFile)) {
      // Stale lock left by a crash after its journal closed (V5 pointer
      // phase). Removal is serialized + UUID-verified so a concurrent
      // starter's fresh lock can never be deleted by mistake.
      const res = removeLockSerialized(root, lock.uuid);
      if (res.removed) {
        console.log(`Cleared stale lock for already-closed session ${lock.uuid}; closed journal preserved.`);
      } else if (res.reason === 'busy') {
        console.error('Another process is clearing the stale lock right now; try again in a moment.');
        process.exit(1);
      }
      // 'absent'/'replaced': someone else already cleared or re-acquired —
      // fall through and race fairly for the slot.
      continue; // retry exclusive acquisition
    }
    console.error(`A live session lock exists for session ${lock.uuid} (teacher ${lock.teacher}, started ${lock.started_at}).`);
    console.error('Options: npm run learn:resume  |  npm run learn:abort -- --reason "<why>"');
    process.exit(1);
  }
}
if (!acquired) {
  console.error('Could not acquire the session lock after repeated stale-lock clears. Run: npm run learn:check');
  process.exit(1);
}

// ---- lock held: create the draft; roll back the reservation on failure ------
// Test-only hook (V2 start-vs-abort interleaving fixture): hold the
// acquisition window — lock reserved, draft not yet written — open for a
// deterministic duration.
if (process.env.LEARN_HOLD_AFTER_LOCK_MS) {
  pauseMs(Number(process.env.LEARN_HOLD_AFTER_LOCK_MS));
}

const draftFile = path.join(P.inProgressDir(root), `${uuid}.md`);
try {
  const front = {
    uuid,
    teacher,
    mode,
    variant: 'default',
    status: 'open',
    started_at: startedAt,
    closed_at: null,
    planned_scope: scope,
    module: module_,
    phase_minutes: Object.fromEntries(PHASES.map((p) => [p, 0])),
    exercises: [],
    live_spend: { estimated_usd: 0, actual_usd: 0 },
    ledger_changes: [],
    provenance_events: [],
    learner_changes: [],
    evidence: [],
    interview_items: [],
    next_review: null,
    start_manifest: learnerManifest(root),
  };

  const body = `
# Session ${uuid}

## START / PRIME (5)
- Due retrievals:

## MODEL ↔ PROBE (10–15)
- Mental model:
- Predictions:

## GATE (5)
- Learner statement:

## LAB (30–35)
- Exercise:
- Evidence step / hints used:

## DEBRIEF / CLOSE (5)
- Retention-3:
- Evidence links:
- Next review:

## Adaptive teaching
<!-- Follow course/ADAPTIVE-TEACHING.md. Record material observations only:
     evidence (case/response/artifact + assistance), provisional assessment
     and uncertainty, then teaching decision/reason. Do not prefill outcomes. -->

## Adaptive handoff
- Demonstrated skills (evidence references):
- Unresolved gaps / unobserved skills:
- Teaching preferences / feedback:
- Next focus and reason (within learn:next priority):
- Delayed check needed / scheduled:

<!-- Frontmatter editing rules: keep strings double-quoted (JSON style),
     keep fields single-line; prose belongs in this body. -->
`;

  writeJournal(draftFile, front, body);
} catch (e) {
  try { fs.unlinkSync(lockFile); } catch { /* rollback best-effort */ }
  try { fs.unlinkSync(draftFile); } catch { /* may not exist */ }
  console.error(`Failed to create the session draft; lock reservation rolled back. ${e.message}`);
  process.exit(1);
}

console.log(`Session started: ${uuid}`);
console.log(`  teacher: ${teacher}  mode: ${mode}`);
console.log(`  draft:   learning/journal/.in-progress/${uuid}.md`);
console.log(`  lock:    learning/active-session.json`);
console.log('Close with: npm run learn:close');
