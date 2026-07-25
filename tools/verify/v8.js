// V8 — Deterministic world generation (plan §5.4)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Gate, REPO } from './fixture-lib.js';
import { parseYaml } from '../learn/lib.js';

const g = new Gate('V8');

function recursiveSha(dir) {
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d).sort()) {
      const p = path.join(d, e);
      if (fs.statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  })(dir);
  const h = crypto.createHash('sha256');
  for (const f of files) {
    h.update(path.relative(dir, f));
    h.update(fs.readFileSync(f));
  }
  return h.digest('hex');
}

const t1 = fs.mkdtempSync(path.join(os.tmpdir(), 'world-a-'));
const t2 = fs.mkdtempSync(path.join(os.tmpdir(), 'world-b-'));
const gen = (out) => spawnSync(process.execPath, [path.join(REPO, 'world', 'generate.js'), '--seed', 'nimbuspay-v1', '--out', out], { encoding: 'utf8' });
const r1 = gen(t1);
const r2 = gen(t2);
g.check('generator runs twice with the same seed (exit 0, 0)', r1.status === 0 && r2.status === 0);
const h1 = recursiveSha(t1);
const h2 = recursiveSha(t2);
g.check('recursive sha256 over both outputs identical', h1 === h2, h1.slice(0, 16));

const docCount = fs.readdirSync(path.join(t1, 'docs')).length;
g.check('generated docs count in [25, 40]', docCount >= 25 && docCount <= 40, `count=${docCount}`);

const spec = parseYaml(fs.readFileSync(path.join(REPO, 'world', 'spec.yaml'), 'utf8'));
const services = spec.services ?? [];
g.check('services in world/spec.yaml in [8, 12]', services.length >= 8 && services.length <= 12, `count=${services.length}`);
const missing = services.filter((s) => !s.owner || !Array.isArray(s.depends_on));
g.check('owner + dependency entries for every service (missing = 0)', missing.length === 0,
  missing.map((s) => s.id).join(', ') || 'all present');

fs.rmSync(t1, { recursive: true, force: true });
fs.rmSync(t2, { recursive: true, force: true });
g.finish();
