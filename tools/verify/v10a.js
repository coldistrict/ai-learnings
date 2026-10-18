// V10a — SOURCE_LEDGER schema and staleness (plan §14) [offline]
import fs from 'node:fs';
import path from 'node:path';
import { makeScratchRoot, run, cleanup, Gate, REPO } from './fixture-lib.js';
import { parseSourceLedger } from '../learn/lib.js';

const g = new Gate('V10a');

// schema on the REAL ledger
const rows = parseSourceLedger(REPO);
g.check('≥10 data rows', rows.length >= 10, `rows=${rows.length}`);
const incomplete = rows.filter((r) => Object.values(r).some((v) => !v));
g.check('every row has all 6 columns non-empty', incomplete.length === 0,
  incomplete.map((r) => r.claim).join('; ') || 'all complete');

const required = [
  ['MCP dated current revision', (r) => r.claim === 'MCP current spec revision' && /Revision \d{4}-\d{2}-\d{2}/.test(r.truth)],
  ['Anthropic structured outputs', (r) => /anthropic|claude/i.test(r.claim + r.url) && /structured/i.test(r.claim)],
  ['OpenAI structured outputs', (r) => /openai/i.test(r.claim + r.url) && /structured/i.test(r.claim)],
  ['Claude Code skills/plugins', (r) => /claude code/i.test(r.claim) && /(skill|plugin)/i.test(r.claim)],
  ['Codex skills/plugins', (r) => /codex/i.test(r.claim) && /(skill|plugin)/i.test(r.claim)],
  ['hosted-Evals retirement', (r) => /evals? retirement|hosted evals/i.test(r.claim)],
];
for (const [name, pred] of required) {
  g.check(`row present: ${name}`, rows.some(pred));
}

// staleness fixture (scratch copy)
const root = makeScratchRoot('v10a');
const ledgerFile = path.join(root, 'learning', 'SOURCE_LEDGER.md');
const original = fs.readFileSync(ledgerFile, 'utf8');
const fixtureEnv = { LEARN_FIXED_TIME: '2026-02-01T00:00:00Z' };
run('regen', { root, env: fixtureEnv });
// Dates are fixture data: real source refreshes must not break this test.
const fresh = original.replace(/\| \d{4}-\d{2}-\d{2} \|/g, '| 2026-01-31 |');
const aged = fresh.replace(/^(\| MCP current spec revision \|.*)\| 2026-01-31 \|/m,
  '$1| 2025-12-01 |');
g.check('fixture: exactly one row aged >30 days',
  aged !== fresh && aged.split('| 2025-12-01 |').length === 2);
fs.writeFileSync(ledgerFile, aged);
const strict1 = run('check', { root, env: fixtureEnv, args: ['--strict'] });
const staleLines = strict1.out.split('\n').filter((l) => l.includes('stale SOURCE_LEDGER row'));
g.check('learn:check --strict exits nonzero with the aged row', strict1.status !== 0, `exit=${strict1.status}`);
g.check('flags exactly that 1 row as stale', staleLines.length === 1 && staleLines[0].includes('MCP current spec revision'),
  `${staleLines.length} stale line(s)`);
fs.writeFileSync(ledgerFile, fresh);
const strict2 = run('check', { root, env: fixtureEnv, args: ['--strict'] });
g.check('with the date restored learn:check --strict exits 0', strict2.status === 0, `exit=${strict2.status}`);
cleanup(root);

// real repo strict must also be clean today
import { spawnSync } from 'node:child_process';
const real = spawnSync(process.execPath, [path.join(REPO, 'tools', 'learn', 'check.js'), '--strict'], { encoding: 'utf8' });
g.check('real repo: learn:check --strict exits 0 (no stale rows as of today)', real.status === 0, `exit=${real.status}`);

g.finish();
