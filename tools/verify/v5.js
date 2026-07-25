// V5 — Crash matrix and abort, deterministic fixtures (plan §9.2)
// Reference: one happy-path close with fixed UUID/clock in a scratch copy;
// 5 reference checksums (closed journal, 3 views, state.json). Each crash
// phase must recover to 5/5 identical checksums; journal count for the UUID
// = 1 in every path; abort changes 0 ledger rows.
import fs from 'node:fs';
import path from 'node:path';
import {
  makeScratchRoot, run, fillDraft, fiveChecksums, cleanup, Gate,
  FIXED_UUID, FIXED_TIME,
} from './fixture-lib.js';
import { readJournal } from '../learn/lib.js';

const g = new Gate('V5');
const env = { LEARN_FIXED_UUID: FIXED_UUID, LEARN_FIXED_TIME: FIXED_TIME };

function journalCount(root) {
  return fs.readdirSync(path.join(root, 'learning', 'journal'))
    .filter((f) => f === `${FIXED_UUID}.md`).length;
}

// --- reference state ---
const ref = makeScratchRoot('v5-ref');
run('start', { root: ref, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
fillDraft(ref, FIXED_UUID);
run('close', { root: ref, env });
const refSums = fiveChecksums(ref, FIXED_UUID);
g.check('reference close produced all 5 tracked files', !refSums.includes('MISSING'));

function crashCase(phase, recover) {
  const root = makeScratchRoot(`v5-${phase}`);
  run('start', { root, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
  fillDraft(root, FIXED_UUID);
  const rc = run('close', { root, env: { ...env, LEARN_CRASH_AFTER: phase } });
  g.check(`crash hook fired after phase '${phase}' (exit 99)`, rc.status === 99, `exit=${rc.status}`);
  recover(root);
  const got = fiveChecksums(root, FIXED_UUID);
  g.check(`[${phase}] 5/5 checksums equal reference after recovery`,
    JSON.stringify(got) === JSON.stringify(refSums),
    got.map((h, i) => (h === refSums[i] ? 'ok' : `mismatch@${i}`)).join(','));
  g.check(`[${phase}] journal file count for the UUID = 1`, journalCount(root) === 1);
  cleanup(root);
}

// 1. crash at validate → draft+lock persist; check reports; resume; close.
crashCase('validate', (root) => {
  g.check('[validate] draft + lock persist',
    fs.existsSync(path.join(root, 'learning', 'journal', '.in-progress', `${FIXED_UUID}.md`))
    && fs.existsSync(path.join(root, 'learning', 'active-session.json')));
  const chk = run('check', { root, env });
  g.check('[validate] learn:check reports the interrupted/open session', chk.out.includes(FIXED_UUID));
  const res = run('resume', { root, env });
  g.check('[validate] learn:resume re-attaches (exit 0, close-ready)', res.status === 0 && res.out.includes('close-ready'));
  run('close', { root, env });
});

// 2. crash after rename → check detects closed-newer-than-pointer; regen repairs.
crashCase('rename', (root) => {
  const chk = run('check', { root, env });
  g.check('[rename] learn:check detects a closed UUID newer than the pointer',
    chk.status !== 0 && chk.out.includes('pointer behind'));
  const rg = run('regen', { root, env });
  g.check('[rename] learn:regen regenerates views + repairs pointer + clears stale lock',
    rg.status === 0 && rg.out.includes('Pointer repaired') && rg.out.includes('Stale lock cleared'));
});

// 3. crash after regen → same recovery path.
crashCase('regen', (root) => {
  const chk = run('check', { root, env });
  g.check('[regen] learn:check detects the stale pointer', chk.status !== 0 && chk.out.includes('pointer behind'));
  const rg = run('regen', { root, env });
  g.check('[regen] learn:regen completes the close', rg.status === 0);
});

// 4. crash after pointer → stale lock with closed journal; learn:start clears
//    it and proceeds (exit 0) while preserving the closed journal.
crashCase('pointer', (root) => {
  g.check('[pointer] stale lock remains with closed journal',
    fs.existsSync(path.join(root, 'learning', 'active-session.json'))
    && fs.existsSync(path.join(root, 'learning', 'journal', `${FIXED_UUID}.md`)));
  const st = run('start', { root, args: ['--teacher', 'codex', '--mode', 'solo'] }); // random new uuid
  g.check('[pointer] learn:start clears the stale lock and proceeds (exit 0)',
    st.status === 0 && /cleared stale lock/i.test(st.out));
  g.check('[pointer] closed journal preserved', journalCount(root) === 1);
  const ab = run('abort', { root, args: ['--reason', 'v5 fixture cleanup'] });
  g.check('[pointer] cleanup abort of the new session exits 0', ab.status === 0);
});

// 5. abort fixture: appends an aborted record; 0 ledger rows change.
{
  const root = makeScratchRoot('v5-abort');
  run('regen', { root, env });
  const ledgerBefore = fs.readFileSync(path.join(root, 'learning', 'COMPETENCY_LEDGER.md'), 'utf8');
  run('start', { root, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
  const ab = run('abort', { root, env, args: ['--reason', 'test'] });
  g.check('learn:abort --reason test exits 0', ab.status === 0);
  const journalFile = path.join(root, 'learning', 'journal', `${FIXED_UUID}.md`);
  g.check('aborted-session record appended to journal/', fs.existsSync(journalFile));
  if (fs.existsSync(journalFile)) {
    const { front } = readJournal(journalFile);
    g.check('aborted record carries status aborted + reason',
      front.status === 'aborted' && front.aborted_reason === 'test');
  }
  const ledgerAfter = fs.readFileSync(path.join(root, 'learning', 'COMPETENCY_LEDGER.md'), 'utf8');
  g.check('COMPETENCY_LEDGER diff after regen = 0 changed mastery rows', ledgerBefore === ledgerAfter);
  cleanup(root);
}

cleanup(ref);
g.finish();
