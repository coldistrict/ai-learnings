// V18 — Provenance enforcement incl. small edits (plan §8.5) [fixture]
// Manifest-based attribution: learn:close refuses unattributed changes to
// learner-owned files of ANY size; consented edits pass only with COMPLETE,
// affirmative provenance metadata (agent, files, lines, reason, consent
// containing an affirmative, interview-claim impact) — hardened per Codex
// review 2026-07-25, finding S1 (negative cases E–I).
import fs from 'node:fs';
import path from 'node:path';
import { makeScratchRoot, run, fillDraft, cleanup, Gate, FIXED_UUID, FIXED_TIME } from './fixture-lib.js';

const g = new Gate('V18');
const env = { LEARN_FIXED_UUID: FIXED_UUID, LEARN_FIXED_TIME: FIXED_TIME };
const LEARNER_FILE = path.join('packages', 'contracts', 'placeholder.js');
const LEARNER_FILE_POSIX = 'packages/contracts/placeholder.js';

function completeEvent(overrides = {}) {
  return {
    agent: 'claude',
    files: [LEARNER_FILE_POSIX],
    lines: '6 appended',
    reason: 'requested refactor demo',
    consent: 'yes-explicit',
    consent_note: 'learner said yes in chat (fixture)',
    interview_claim_impact: 'none — fixture',
    ...overrides,
  };
}

function scenario(label, { lines, event }) {
  const root = makeScratchRoot(`v18-${label}`);
  run('start', { root, env, args: ['--teacher', 'claude', '--mode', 'solo'] });
  fs.appendFileSync(path.join(root, LEARNER_FILE),
    Array.from({ length: lines }, (_, i) => `// tutor-edit line ${i + 1}\n`).join(''));
  fillDraft(root, FIXED_UUID, (front) => {
    if (event) front.provenance_events = [event];
  });
  const r = run('close', { root, env });
  return { root, r };
}

// A: >5-line tutor edit, NO consent/provenance → close exits nonzero naming the file
{
  const { root, r } = scenario('a', { lines: 6, event: null });
  g.check('A: unattributed 6-line edit → close exits nonzero', r.status !== 0, `exit=${r.status}`);
  g.check('A: error names the exact file', r.out.includes(LEARNER_FILE_POSIX));
  cleanup(root);
}

// B: same edit WITH a complete provenance event → close succeeds; PROVENANCE.md has the event
{
  const { root, r } = scenario('b', { lines: 6, event: completeEvent() });
  g.check('B: same edit with complete provenance event → close succeeds', r.status === 0, `exit=${r.status}`);
  const prov = fs.readFileSync(path.join(root, 'learning', 'PROVENANCE.md'), 'utf8');
  const rows = prov.split('\n').filter((l) => l.startsWith('|') && l.includes('placeholder.js'));
  g.check('B: regenerated PROVENANCE.md contains exactly 1 matching event row (with lines + impact)',
    rows.length === 1 && rows[0].includes('claude') && rows[0].includes('yes-explicit')
    && rows[0].includes('6 appended') && rows[0].includes('none — fixture'), `rows=${rows.length}`);
  cleanup(root);
}

// C: 1-line tutor edit, NO provenance → close exits nonzero naming the file
{
  const { root, r } = scenario('c', { lines: 1, event: null });
  g.check('C: unattributed 1-line edit → close exits nonzero (any-size edit fails)', r.status !== 0, `exit=${r.status}`);
  g.check('C: error names the exact file', r.out.includes(LEARNER_FILE_POSIX));
  cleanup(root);
}

// D: consented ≤3-line mechanical unblock WITH complete event → close succeeds; 1 matching row
{
  const { root, r } = scenario('d', {
    lines: 3,
    event: completeEvent({
      lines: '3 appended',
      reason: 'mechanical unblock: missing export keyword',
      consent: 'yes-mechanical-unblock',
    }),
  });
  g.check('D: consented ≤3-line mechanical unblock → close succeeds', r.status === 0, `exit=${r.status}`);
  const prov = fs.readFileSync(path.join(root, 'learning', 'PROVENANCE.md'), 'utf8');
  const rows = prov.split('\n').filter((l) => l.startsWith('|') && l.includes('mechanical unblock'));
  g.check('D: PROVENANCE.md contains exactly 1 matching event (table rows only)', rows.length === 1, `rows=${rows.length}`);
  cleanup(root);
}

// E–I: incomplete/non-affirmative metadata must BLOCK the close (S1 negatives).
const negatives = [
  ['E', 'missing interview_claim_impact', completeEvent({ interview_claim_impact: undefined }), 'interview_claim_impact'],
  ['F', 'empty reason', completeEvent({ reason: '' }), 'reason'],
  ['G', 'non-affirmative consent ("not yes" — substring traps rejected)', completeEvent({ consent: 'not yes' }), 'consent'],
  ['G2', 'off-enum consent ("not asked")', completeEvent({ consent: 'not asked' }), 'consent'],
  ['H', 'invalid agent', completeEvent({ agent: 'gpt' }), 'agent'],
  ['I', 'missing lines reference', completeEvent({ lines: undefined }), 'lines'],
];
for (const [label, desc, event, needle] of negatives) {
  const { root, r } = scenario(label.toLowerCase(), { lines: 6, event });
  g.check(`${label}: event with ${desc} → close exits nonzero`, r.status !== 0, `exit=${r.status}`);
  g.check(`${label}: error names the defective field (${needle})`, r.out.includes(needle));
  cleanup(root);
}

g.finish();
