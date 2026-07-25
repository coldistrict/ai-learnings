// learn:close — phase 2 of the session transaction (plan §9.2).
// Phases: validate → rename → regen → pointer → unlock.
// Crash hooks fire AFTER the named phase completes (LEARN_CRASH_AFTER).
import fs from 'node:fs';
import path from 'node:path';
import {
  repoRoot, P, nowIso, readJson, writeJson, readJournal, writeJournal,
  validateCloseFields, learnerManifest, manifestDiff, unattributedChanges,
  writeViews, crashAfter,
} from './lib.js';

const root = repoRoot();
const lockFile = P.lockFile(root);

if (!fs.existsSync(lockFile)) {
  const state = readJson(P.stateFile(root));
  if (state.last_closed_session &&
      fs.existsSync(path.join(P.journalDir(root), `${state.last_closed_session}.md`))) {
    console.log(`Session ${state.last_closed_session} is already closed; nothing to do.`);
    process.exit(0);
  }
  console.error('No active session and no previously closed session found. Start one: npm run learn:start -- --teacher <claude|codex> --mode <solo|paired>');
  process.exit(1);
}

const lock = readJson(lockFile);
const draftFile = path.join(P.inProgressDir(root), `${lock.uuid}.md`);
const journalFile = path.join(P.journalDir(root), `${lock.uuid}.md`);

if (!fs.existsSync(draftFile)) {
  if (fs.existsSync(journalFile)) {
    // A previous close crashed after rename. Complete the remaining phases.
    console.log(`Completing interrupted close for session ${lock.uuid}.`);
    writeViews(root);
    crashAfter('regen');
    const state = readJson(P.stateFile(root));
    state.last_closed_session = lock.uuid;
    writeJson(P.stateFile(root), state);
    crashAfter('pointer');
    fs.unlinkSync(lockFile);
    console.log(`Close completed for ${lock.uuid}.`);
    process.exit(0);
  }
  console.error(`Lock exists for ${lock.uuid} but no draft or journal found. Run: npm run learn:check`);
  process.exit(1);
}

// ---- phase: validate ------------------------------------------------------
const { front, body } = readJournal(draftFile);
const problems = validateCloseFields(front, { open: true });

// Provenance enforcement (plan §8.5, V18): every changed learner-owned file
// must be attributed to the learner or covered by a provenance event.
const currentManifest = learnerManifest(root);
const changes = manifestDiff(front.start_manifest ?? [], currentManifest);
const unattributed = unattributedChanges(front, changes);
for (const c of unattributed) {
  problems.push(`unattributed change to learner-owned file: ${c.path} (${c.kind}) — attribute it in learner_changes or add a provenance event (agent, files, reason, consent)`);
}

if (problems.length) {
  console.error('learn:close validation failed:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
crashAfter('validate');

// ---- phase: rename (write final frontmatter once, then atomic rename) -----
front.status = 'closed';
front.closed_at = nowIso();
front.end_manifest = currentManifest;
writeJournal(draftFile, front, body);
fs.renameSync(draftFile, journalFile);
crashAfter('rename');

// ---- phase: regen ----------------------------------------------------------
writeViews(root);
crashAfter('regen');

// ---- phase: pointer --------------------------------------------------------
const state = readJson(P.stateFile(root));
state.last_closed_session = front.uuid;
writeJson(P.stateFile(root), state);
crashAfter('pointer');

// ---- unlock ----------------------------------------------------------------
fs.unlinkSync(lockFile);

const total = Object.values(front.phase_minutes).reduce((a, b) => a + b, 0);
if (front.variant === 'default' && (total < 45 || total > 75)) {
  console.log(`note: default-variant session total is ${total} min (expected 45–75); label a variant if intentional.`);
}
console.log(`Session closed: ${front.uuid}`);
console.log(`  journal: learning/journal/${front.uuid}.md (immutable)`);
console.log('  views regenerated; state pointer updated; lock removed.');
