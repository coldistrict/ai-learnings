// V2 — Session lock exclusivity (plan §9.2), including SIMULTANEOUS starts:
// lock acquisition must be atomic (exclusive create), not check-then-write
// (Codex review 2026-07-25, finding B1).
import fs from 'node:fs';
import path from 'node:path';
import { makeScratchRoot, run, runAsync, cleanup, Gate, FIXED_UUID, FIXED_TIME } from './fixture-lib.js';
import { readJournal } from '../learn/lib.js';

const g = new Gate('V2');
const root = makeScratchRoot('v2');
const env = { LEARN_FIXED_UUID: FIXED_UUID, LEARN_FIXED_TIME: FIXED_TIME };

const r1 = run('start', { root, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
g.check('learn:start --teacher claude --mode solo exits 0', r1.status === 0, `exit=${r1.status}`);

const lockFile = path.join(root, 'learning', 'active-session.json');
const lock = fs.existsSync(lockFile) ? JSON.parse(fs.readFileSync(lockFile, 'utf8')) : null;
g.check('active-session.json exists and contains UUID u1', lock?.uuid === FIXED_UUID, `uuid=${lock?.uuid}`);

const draftFile = path.join(root, 'learning', 'journal', '.in-progress', `${FIXED_UUID}.md`);
g.check('draft exists for u1', fs.existsSync(draftFile));
if (fs.existsSync(draftFile)) {
  const { front } = readJournal(draftFile);
  g.check('draft has open metadata (teacher, mode, started-at, planned scope)',
    front.teacher === 'claude' && front.mode === 'solo' && !!front.started_at && !!front.planned_scope,
    `teacher=${front.teacher} mode=${front.mode} started_at=${front.started_at}`);
}

const r2 = run('start', { root, args: ['--teacher', 'codex', '--mode', 'solo'] });
g.check('second learn:start exits nonzero while lock is live', r2.status !== 0, `exit=${r2.status}`);
g.check('output names u1', r2.out.includes(FIXED_UUID));
g.check('output offers learn:resume / learn:abort', r2.out.includes('learn:resume') && r2.out.includes('learn:abort'));

const drafts = fs.readdirSync(path.join(root, 'learning', 'journal', '.in-progress')).filter((f) => f.endsWith('.md'));
g.check('no second draft created (draft count exactly 1)', drafts.length === 1, `count=${drafts.length}`);

cleanup(root);

// --- simultaneous starts: exactly one winner (atomic acquisition) ---
{
  const rootC = makeScratchRoot('v2-concurrent');
  const N = 5;
  const results = await Promise.all(Array.from({ length: N }, (_, i) =>
    runAsync('start', { root: rootC, args: ['--teacher', i % 2 ? 'codex' : 'claude', '--mode', 'solo'] })));
  const winners = results.filter((r) => r.status === 0);
  const losers = results.filter((r) => r.status !== 0);
  g.check(`concurrent starts: exactly 1 of ${N} simultaneous processes succeeds`, winners.length === 1, `successes=${winners.length}`);

  const lockFileC = path.join(rootC, 'learning', 'active-session.json');
  g.check('exactly 1 live lock after the race', fs.existsSync(lockFileC));
  const lockC = JSON.parse(fs.readFileSync(lockFileC, 'utf8'));
  const draftsC = fs.readdirSync(path.join(rootC, 'learning', 'journal', '.in-progress')).filter((f) => f.endsWith('.md'));
  g.check('exactly 1 draft after the race', draftsC.length === 1, `count=${draftsC.length}`);
  g.check('the lock UUID matches the single draft', draftsC[0] === `${lockC.uuid}.md`);
  g.check('the winner announced the same UUID the lock holds', winners.length === 1 && winners[0].out.includes(lockC.uuid));
  g.check('every loser reports the live lock (winning UUID or in-flight acquisition), never a second session',
    losers.every((l) => l.out.includes(lockC.uuid) || l.out.includes('not yet readable')));
  g.check('losers that saw the winner offer learn:resume / learn:abort',
    losers.filter((l) => l.out.includes(lockC.uuid))
      .every((l) => l.out.includes('learn:resume') && l.out.includes('learn:abort')));
  cleanup(rootC);
}

g.finish();
