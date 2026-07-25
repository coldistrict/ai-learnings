// V19 — Visible contracts and criteria-mapped tests (plan §8.4)
// Applies to the three authored M1 labs at Stage 2 (re-run per lab later).
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { Gate, REPO } from './fixture-lib.js';

const g = new Gate('V19');
const audit = spawnSync(process.execPath, [path.join(REPO, 'tools', 'labs-audit.js')], { encoding: 'utf8' });
console.log(audit.stdout.trim());

g.check('labs:audit exits 0 (0 violations)', audit.status === 0, `exit=${audit.status}`);
const lines = audit.stdout.split('\n').filter((l) => l.startsWith('ok') || l.startsWith('FAIL'));
g.check('3 labs audited', lines.length === 3, `${lines.length} labs`);
g.check('every lab: 3/3 headers (scenario/constraints/acceptance criteria)',
  lines.every((l) => l.includes('headers 3/3')));
g.check('every lab: unmatched tests = 0', lines.every((l) => l.includes('unmatched 0')));
g.check('0 solution blocks reported', !audit.stdout.includes('solution-labeled') && !audit.stdout.includes('solution-like'));

g.finish();
