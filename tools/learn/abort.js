// learn:abort -- --reason "<why>" — abort an open session (plan §9.2).
// Appends an aborted-session record; never changes mastery rows or the
// state.json pointer.
import fs from 'node:fs';
import path from 'node:path';
import {
  repoRoot, P, nowIso, readJson, readJournal, writeJournal, writeViews,
  removeLockSerialized,
} from './lib.js';

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const root = repoRoot();
const reason = arg('reason');
if (!reason) {
  console.error('usage: npm run learn:abort -- --reason "<why>"');
  process.exit(1);
}

const lockFile = P.lockFile(root);
if (!fs.existsSync(lockFile)) {
  console.error('No active session to abort.');
  process.exit(1);
}
const lock = readJson(lockFile);
const draftFile = path.join(P.inProgressDir(root), `${lock.uuid}.md`);
if (!fs.existsSync(draftFile)) {
  const journalFile = path.join(P.journalDir(root), `${lock.uuid}.md`);
  if (!fs.existsSync(journalFile)) {
    // True orphan lock (crash between lock reservation and draft creation).
    // Nothing was recorded, so there is nothing to journal — release it.
    // Serialized + UUID-verified: if another tutor is mid-acquisition on a
    // NEW lock, we will not touch it.
    const res = removeLockSerialized(root, lock.uuid);
    if (res.removed) {
      console.log(`Cleared orphan lock for session ${lock.uuid} (no draft was ever created; nothing recorded).`);
    } else {
      console.log(`Lock for ${lock.uuid} was already ${res.reason === 'replaced' ? 'replaced by a newer session' : 'cleared'}; nothing to do.`);
    }
    process.exit(0);
  }
  console.error(`Lock exists for ${lock.uuid} but its journal is already closed. Run: npm run learn:regen`);
  process.exit(1);
}

const { front, body } = readJournal(draftFile);
front.status = 'aborted';
front.aborted_reason = reason;
front.closed_at = nowIso();
// Mastery never changes on abort.
front.ledger_changes = [];

const journalFile = path.join(P.journalDir(root), `${lock.uuid}.md`);
writeJournal(draftFile, front, body);
fs.renameSync(draftFile, journalFile);
writeViews(root); // provenance events (if any) still surface; ledger untouched
removeLockSerialized(root, lock.uuid);

console.log(`Session aborted: ${lock.uuid} (reason: ${reason})`);
console.log('  aborted record kept in learning/journal/; 0 mastery rows changed.');
