// V1 — Prerequisite inventory, descriptive only (plan §15.1, §9, §4) [host]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Gate, REPO } from './fixture-lib.js';

const g = new Gate('V1');

// Non-interactive zsh run
const run = spawnSync('zsh', ['-c', 'npm run prereq'], { cwd: REPO, encoding: 'utf8' });
g.check('`zsh -c "npm run prereq"` exits 0 (non-interactive shell)', run.status === 0, `exit=${run.status}`);

const reportFile = path.join(REPO, 'learning', 'prereq-report.json');
let report = null;
try {
  report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  g.check('report file parses as JSON', true);
} catch (e) {
  g.check('report file parses as JSON', false, String(e));
}

if (report) {
  const ids = (report.entries ?? []).map((e) => e.id);
  const expected = ['node', 'npm', 'codex CLI', 'claude CLI', 'Go', '.NET'];
  g.check('exactly these six inventory entries', ids.length === 6 && expected.every((x) => ids.includes(x)), ids.join(', '));
  g.check('every entry has present:boolean and version-or-note',
    (report.entries ?? []).every((e) => typeof e.present === 'boolean' && (e.present ? 'version' in e : 'note' in e)));
  g.check('PATH used is recorded', typeof report.path_used === 'string' && report.path_used.length > 0);
  // "0 port-selection fields" = no JSON KEY carries a port choice; the
  // descriptive note may mention that the choice happens at M0.
  const keys = [];
  (function collect(o) {
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      for (const [k, v] of Object.entries(o)) { keys.push(k.toLowerCase()); collect(v); }
    } else if (Array.isArray(o)) o.forEach(collect);
  })(report);
  const portKeys = keys.filter((k) => k.includes('port'));
  g.check('0 port-selection fields in the Stage-0 report (no key carries a port choice)',
    portKeys.length === 0, portKeys.join(', ') || 'no port-like keys');

  // Absent-CLI behavior: assert against the REAL inventory state.
  const absent = (report.entries ?? []).filter((e) => !e.present).map((e) => e.id);
  const check = spawnSync(process.execPath, [path.join(REPO, 'tools', 'learn', 'check.js')], { cwd: REPO, encoding: 'utf8' });
  const out = `${check.stdout}${check.stderr}`;
  for (const id of absent.filter((a) => ['codex CLI', 'claude CLI'].includes(a))) {
    g.check(`learn:check lists gates BLOCKED(prereq:${id})`, out.includes(`BLOCKED(prereq:${id})`));
  }
  const blockedLines = out.split('\n').filter((l) => l.includes('BLOCKED(prereq:'));
  g.check('count of blocked gates reported as PASS = 0',
    blockedLines.every((l) => !l.includes('PASS')), `${blockedLines.length} blocked lines, none say PASS`);
}

g.finish();
