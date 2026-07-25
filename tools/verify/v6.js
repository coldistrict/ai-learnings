// V6 — View regeneration is byte-stable (plan §9.1). Runs on the REAL repo
// (views are disposable generated files).
import fs from 'node:fs';
import path from 'node:path';
import { Gate, REPO } from './fixture-lib.js';
import { sha256 } from '../learn/lib.js';
import { spawnSync } from 'node:child_process';

const g = new Gate('V6');
const views = ['COMPETENCY_LEDGER.md', 'LEARNING_STATE.md', 'PROVENANCE.md']
  .map((v) => path.join(REPO, 'learning', v));
const regen = () => spawnSync(process.execPath, [path.join(REPO, 'tools', 'learn', 'regen.js')], { encoding: 'utf8' });
const sums = () => views.map((f) => sha256(fs.readFileSync(f)));

regen();
const s1 = sums();
regen();
const s2 = sums();
g.check('regen twice in a row → 3/3 view checksums identical',
  JSON.stringify(s1) === JSON.stringify(s2));

for (const f of views) fs.unlinkSync(f);
regen();
const s3 = sums();
g.check('delete all 3 views → regen reproduces pre-deletion checksums (3/3)',
  JSON.stringify(s1) === JSON.stringify(s3));
g.check('6/6 checksum equalities total',
  JSON.stringify(s1) === JSON.stringify(s2) && JSON.stringify(s1) === JSON.stringify(s3));

g.finish();
