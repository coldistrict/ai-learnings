// V3 — Close transaction happy path (plan §9.2)
import fs from 'node:fs';
import path from 'node:path';
import { makeScratchRoot, run, fillDraft, cleanup, Gate, FIXED_UUID, FIXED_TIME } from './fixture-lib.js';

const g = new Gate('V3');
const env = { LEARN_FIXED_UUID: FIXED_UUID, LEARN_FIXED_TIME: FIXED_TIME };

// --- happy path ---
const root = makeScratchRoot('v3');
run('start', { root, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
fillDraft(root, FIXED_UUID);
const closeStart = Date.now();
const rc = run('close', { root, env });
g.check('learn:close exits 0 with required fields filled', rc.status === 0, `exit=${rc.status}`);
g.check('journal/<u1>.md exists', fs.existsSync(path.join(root, 'learning', 'journal', `${FIXED_UUID}.md`)));
const inprog = fs.readdirSync(path.join(root, 'learning', 'journal', '.in-progress')).filter((f) => f.endsWith('.md'));
g.check('.in-progress contains 0 files', inprog.length === 0, `count=${inprog.length}`);
const state = JSON.parse(fs.readFileSync(path.join(root, 'learning', 'state.json'), 'utf8'));
g.check('state.json pointer equals u1', state.last_closed_session === FIXED_UUID);
g.check('lock file absent', !fs.existsSync(path.join(root, 'learning', 'active-session.json')));
const views = ['COMPETENCY_LEDGER.md', 'LEARNING_STATE.md', 'PROVENANCE.md'];
g.check('views regenerated (mtime > close start)', views.every((v) => {
  const f = path.join(root, 'learning', v);
  return fs.existsSync(f) && fs.statSync(f).mtimeMs >= closeStart - 5;
}));
cleanup(root);

// --- missing-field fixture ---
const root2 = makeScratchRoot('v3b');
run('start', { root: root2, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
fillDraft(root2, FIXED_UUID, (front) => { front.next_review = null; });
const rf = run('close', { root: root2, env });
g.check('close with a missing required field exits nonzero', rf.status !== 0, `exit=${rf.status}`);
g.check('error names the missing field (next_review)', rf.out.includes('next_review'));
g.check('draft remains in .in-progress', fs.existsSync(path.join(root2, 'learning', 'journal', '.in-progress', `${FIXED_UUID}.md`)));
g.check('no file appears in journal/', !fs.existsSync(path.join(root2, 'learning', 'journal', `${FIXED_UUID}.md`)));
cleanup(root2);

g.finish();
