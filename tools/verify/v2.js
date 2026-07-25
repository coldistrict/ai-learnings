// V2 — Session lock exclusivity (plan §9.2), including SIMULTANEOUS starts:
// lock acquisition must be atomic (exclusive create), not check-then-write
// (Codex review 2026-07-25, finding B1).
import fs from 'node:fs';
import path from 'node:path';
import { makeScratchRoot, run, runAsync, cleanup, Gate, FIXED_UUID, FIXED_TIME } from './fixture-lib.js';
import { readJournal, writeJournal } from '../learn/lib.js';

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

// --- stale-lock takeover under contention: serialized removal means racers
// can never delete each other's fresh locks (Codex re-review hardening 1) ---
{
  const rootS = makeScratchRoot('v2-stale-race');
  const staleUuid = '00000000-0000-4000-8000-00000000aaaa';
  writeJournal(path.join(rootS, 'learning', 'journal', `${staleUuid}.md`), {
    uuid: staleUuid, teacher: 'claude', mode: 'solo', variant: 'default',
    status: 'closed', started_at: '2026-01-01T00:00:00Z',
    closed_at: '2026-01-01T01:00:00Z', planned_scope: 'fixture', module: null,
    ledger_changes: [], provenance_events: [],
  }, '\nfixture\n');
  fs.writeFileSync(path.join(rootS, 'learning', 'active-session.json'),
    JSON.stringify({ uuid: staleUuid, teacher: 'claude', mode: 'solo', started_at: '2026-01-01T00:00:00Z' }, null, 2) + '\n');

  const N = 5;
  const results = await Promise.all(Array.from({ length: N }, (_, i) =>
    runAsync('start', { root: rootS, args: ['--teacher', i % 2 ? 'codex' : 'claude', '--mode', 'solo'] })));
  const winners = results.filter((r) => r.status === 0);
  g.check(`stale-lock race: exactly 1 of ${N} racers wins the takeover`, winners.length === 1, `successes=${winners.length}`);
  const lockFileS = path.join(rootS, 'learning', 'active-session.json');
  g.check('stale-lock race: exactly 1 live lock remains', fs.existsSync(lockFileS));
  const lockS = JSON.parse(fs.readFileSync(lockFileS, 'utf8'));
  g.check('stale-lock race: the surviving lock is a FRESH session, not the stale one', lockS.uuid !== staleUuid, lockS.uuid);
  const draftsS = fs.readdirSync(path.join(rootS, 'learning', 'journal', '.in-progress')).filter((f) => f.endsWith('.md'));
  g.check('stale-lock race: exactly 1 draft, matching the surviving lock', draftsS.length === 1 && draftsS[0] === `${lockS.uuid}.md`, draftsS.join(', '));
  g.check('stale-lock race: the closed journal was preserved',
    fs.existsSync(path.join(rootS, 'learning', 'journal', `${staleUuid}.md`)));
  cleanup(rootS);
}

// --- start-vs-abort interleaving (Codex re-review 2): an abort issued while
// a start is BETWEEN lock reservation and draft creation must refuse to
// treat the young lock as an orphan; the start completes consistently. ------
{
  const rootA = makeScratchRoot('v2-start-vs-abort');
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  const lockFileA = path.join(rootA, 'learning', 'active-session.json');

  // Hold the acquisition window open deterministically via the test hook.
  const startPromise = runAsync('start', {
    root: rootA,
    env: { LEARN_HOLD_AFTER_LOCK_MS: '1500' },
    args: ['--teacher', 'claude', '--mode', 'solo'],
  });
  // Wait until the lock exists but the draft does not (the exact window).
  let inWindow = false;
  for (let i = 0; i < 100; i++) {
    if (fs.existsSync(lockFileA)) { inWindow = true; break; }
    await sleep(20);
  }
  const draftsBefore = fs.readdirSync(path.join(rootA, 'learning', 'journal', '.in-progress')).filter((f) => f.endsWith('.md'));
  g.check('interleaving: reached the lock-without-draft window', inWindow && draftsBefore.length === 0,
    `lock=${inWindow} drafts=${draftsBefore.length}`);

  const ab = run('abort', { root: rootA, args: ['--reason', 'racing abort'] });
  g.check('interleaving: abort REFUSES to clear the in-flight lock (exit nonzero)', ab.status !== 0, `exit=${ab.status}`);
  g.check('interleaving: refusal names the mid-acquisition condition', /mid-acquisition/i.test(ab.out));
  g.check('interleaving: the live lock survived the abort attempt', fs.existsSync(lockFileA));

  const st = await startPromise;
  g.check('interleaving: the held start completes successfully', st.status === 0, `exit=${st.status}`);
  const lockA = JSON.parse(fs.readFileSync(lockFileA, 'utf8'));
  const draftsAfter = fs.readdirSync(path.join(rootA, 'learning', 'journal', '.in-progress')).filter((f) => f.endsWith('.md'));
  g.check('interleaving: end state is consistent — 1 lock + 1 matching draft, no orphan draft',
    draftsAfter.length === 1 && draftsAfter[0] === `${lockA.uuid}.md`, draftsAfter.join(', '));
  cleanup(rootA);
}

// --- genuinely abandoned orphan lock: old enough → abort clears it. --------
{
  const rootO = makeScratchRoot('v2-abandoned-orphan');
  const lockFileO = path.join(rootO, 'learning', 'active-session.json');
  const orphanUuid = '00000000-0000-4000-8000-00000000bbbb';
  fs.writeFileSync(lockFileO, JSON.stringify({ uuid: orphanUuid, teacher: 'claude', mode: 'solo', started_at: '2026-01-01T00:00:00Z' }, null, 2) + '\n');
  // Backdate the lock file's mtime past the orphan threshold (real fs time).
  const old = new Date(Date.now() - 120000);
  fs.utimesSync(lockFileO, old, old);
  const ab = run('abort', { root: rootO, args: ['--reason', 'clear abandoned orphan'] });
  g.check('abandoned orphan: abort clears a lock older than the threshold (exit 0)', ab.status === 0, `exit=${ab.status}`);
  g.check('abandoned orphan: clearing message names the orphan', /orphan lock/i.test(ab.out) && ab.out.includes(orphanUuid));
  g.check('abandoned orphan: lock removed', !fs.existsSync(lockFileO));
  cleanup(rootO);
}

g.finish();
