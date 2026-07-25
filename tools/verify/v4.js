// V4 — Duplicate close is a no-op (plan §9.2)
import fs from 'node:fs';
import path from 'node:path';
import { makeScratchRoot, run, fillDraft, cleanup, Gate, FIXED_UUID, FIXED_TIME } from './fixture-lib.js';
import { sha256 } from '../learn/lib.js';

const g = new Gate('V4');
const env = { LEARN_FIXED_UUID: FIXED_UUID, LEARN_FIXED_TIME: FIXED_TIME };
const root = makeScratchRoot('v4');

run('start', { root, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
fillDraft(root, FIXED_UUID);
run('close', { root, env });

const views = ['COMPETENCY_LEDGER.md', 'LEARNING_STATE.md', 'PROVENANCE.md']
  .map((v) => path.join(root, 'learning', v));
const before = views.map((f) => sha256(fs.readFileSync(f)));

const r = run('close', { root, env });
g.check('re-running learn:close exits 0', r.status === 0, `exit=${r.status}`);
g.check('with an already-closed message', /already closed/i.test(r.out));

const journalCount = fs.readdirSync(path.join(root, 'learning', 'journal'))
  .filter((f) => f === `${FIXED_UUID}.md`).length;
g.check('exactly 1 journal file for the UUID', journalCount === 1, `count=${journalCount}`);

const after = views.map((f) => sha256(fs.readFileSync(f)));
g.check('3/3 view checksums unchanged before/after the repeat',
  before.every((h, i) => h === after[i]));

cleanup(root);
g.finish();
