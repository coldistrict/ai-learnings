// learn:resume — re-attach to an interrupted or open session (plan §9.2).
import fs from 'node:fs';
import path from 'node:path';
import {
  repoRoot, P, readJson, writeJson, readJournal, validateCloseFields,
  writeViews,
} from './lib.js';

const root = repoRoot();
const lockFile = P.lockFile(root);

if (!fs.existsSync(lockFile)) {
  console.error('No active session lock. Start one: npm run learn:start');
  process.exit(1);
}
const lock = readJson(lockFile);
const draftFile = path.join(P.inProgressDir(root), `${lock.uuid}.md`);
const journalFile = path.join(P.journalDir(root), `${lock.uuid}.md`);

if (fs.existsSync(draftFile)) {
  const { front } = readJournal(draftFile);
  console.log(`Resumed session ${lock.uuid}`);
  console.log(`  teacher: ${front.teacher}  mode: ${front.mode}  started: ${front.started_at}`);
  console.log(`  draft: learning/journal/.in-progress/${lock.uuid}.md`);
  const problems = validateCloseFields(front, { open: true });
  if (problems.length === 0) {
    console.log('  draft is close-ready — finish with: npm run learn:close');
  } else {
    console.log(`  draft is not close-ready yet (${problems.length} field(s) outstanding):`);
    for (const p of problems.slice(0, 6)) console.log(`    - ${p}`);
  }
  process.exit(0);
}

if (fs.existsSync(journalFile)) {
  // Close crashed after rename: finish regen + pointer + unlock.
  console.log(`Session ${lock.uuid} was already renamed to the journal; completing the interrupted close.`);
  writeViews(root);
  const state = readJson(P.stateFile(root));
  state.last_closed_session = lock.uuid;
  writeJson(P.stateFile(root), state);
  fs.unlinkSync(lockFile);
  console.log('  views regenerated, pointer repaired, stale lock cleared.');
  process.exit(0);
}

console.error(`Lock exists for ${lock.uuid} but neither draft nor journal found. Run: npm run learn:check`);
process.exit(1);
