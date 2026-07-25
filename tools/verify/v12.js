// V12 — learn:next resolution order (plan §9.4)
// Four fixtures; each ALSO contains every lower-priority trigger, so the
// output proves the priority order, not just the class.
import fs from 'node:fs';
import path from 'node:path';
import { makeScratchRoot, run, cleanup, Gate, FIXED_UUID, FIXED_TIME } from './fixture-lib.js';
import { writeJournal } from '../learn/lib.js';

const g = new Gate('V12');
const FIXED_NOW = '2026-01-10T00:00:00Z';

function addRemediation(root) {
  const f = path.join(root, 'learning', 'remediation.json');
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  data.items.push({ id: 'rem-001', competency: 'evals-observability', description: 'rebuild grader-calibration model', created: '2026-01-08', status: 'open' });
  fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
}

function addDueRow(root) {
  // synthesize a closed journal carrying a due ledger row
  const uuid = '00000000-0000-4000-8000-00000000d0e1';
  const front = {
    uuid, teacher: 'claude', mode: 'solo', variant: 'default', status: 'closed',
    started_at: '2026-01-05T00:00:00Z', closed_at: '2026-01-05T01:00:00Z',
    planned_scope: 'fixture', module: null,
    phase_minutes: { start: 5, model: 12, gate: 5, lab: 30, debrief: 8 },
    exercises: [{ id: 'x', highest_hint: 'H0' }],
    live_spend: { estimated_usd: 0, actual_usd: 0 },
    ledger_changes: [{ competency: 'llm-fundamentals', from: 'unseen', to: 'usable', next_due: '2026-01-08' }],
    provenance_events: [], learner_changes: [], evidence: ['fixture'],
    interview_items: [], next_review: '2026-01-08',
  };
  writeJournal(path.join(root, 'learning', 'journal', `${uuid}.md`), front, '\nfixture\n');
}

function next(root) {
  return run('next', { root, env: { LEARN_FIXED_TIME: FIXED_NOW } });
}

// F1: open draft + remediation + due row + milestone → resume wins
{
  const root = makeScratchRoot('v12-f1');
  addRemediation(root); addDueRow(root);
  run('start', { root, env: { LEARN_FIXED_UUID: FIXED_UUID, LEARN_FIXED_TIME: FIXED_TIME }, args: ['--teacher', 'claude', '--mode', 'solo'] });
  const r = next(root);
  g.check('F1 (all triggers present): names resume of the open draft UUID',
    r.out.includes('next-action-class: resume') && r.out.includes(FIXED_UUID), r.out.trim().split('\n')[1]);
  cleanup(root);
}

// F2: remediation + due row + milestone → remediation wins
{
  const root = makeScratchRoot('v12-f2');
  addRemediation(root); addDueRow(root);
  const r = next(root);
  g.check('F2 (no draft): names the mandatory remediation item',
    r.out.includes('next-action-class: remediation') && r.out.includes('rem-001'), r.out.trim().split('\n')[1]);
  cleanup(root);
}

// F3: due row + milestone → due durable check wins
{
  const root = makeScratchRoot('v12-f3');
  addDueRow(root);
  const r = next(root);
  g.check('F3 (no draft, no remediation): names the due competency',
    r.out.includes('next-action-class: due-review') && r.out.includes('llm-fundamentals'), r.out.trim().split('\n')[1]);
  cleanup(root);
}

// F4: clean → current milestone gate / next module
{
  const root = makeScratchRoot('v12-f4');
  const r = next(root);
  g.check('F4 (clean): names the current milestone module/gate',
    r.out.includes('next-action-class: milestone') && r.out.includes('m0-diagnostic-session-a'), r.out.trim().split('\n')[1]);
  cleanup(root);
}

g.check('4/4 fixtures produced the expected next-action class in priority order', !g.failed);
g.finish();
