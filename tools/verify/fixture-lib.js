// Shared helpers for verification-gate harnesses (tools/verify/v*.js).
// Gates that exercise the session transaction run against SCRATCH COPIES of
// the learning root (LEARN_ROOT) so the canonical learning/ history never
// contains synthetic test sessions. verification.md fixes observable
// behavior, exit codes, and counts; the scratch root runs identical code.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readJournal, writeJournal, sha256 } from '../learn/lib.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, '..', '..');

export const FIXED_UUID = '00000000-0000-4000-8000-000000000001';
export const FIXED_TIME = '2026-01-01T00:00:00Z';

// Create a scratch root containing a pristine copy of the learning state
// (seeds only, no journals) plus a minimal learner-owned area.
export function makeScratchRoot(label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `learn-${label}-`));
  fs.mkdirSync(path.join(dir, 'learning', 'journal', '.in-progress'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'learning', 'templates'), { recursive: true });
  for (const f of ['state.json', 'competencies.json', 'ownership.json',
    'curriculum.json', 'remediation.json', 'SOURCE_LEDGER.md']) {
    fs.copyFileSync(path.join(REPO, 'learning', f), path.join(dir, 'learning', f));
  }
  // learner-owned area matching ownership.json learner_paths
  fs.mkdirSync(path.join(dir, 'packages', 'contracts'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'packages', 'contracts', 'placeholder.js'),
    '// learner-owned placeholder\n');
  return dir;
}

export function run(script, { root, env = {}, args = [] } = {}) {
  const res = spawnSync(process.execPath, [path.join(REPO, 'tools', 'learn', `${script}.js`), ...args], {
    encoding: 'utf8',
    env: { ...process.env, LEARN_ROOT: root, ...env },
  });
  return {
    status: res.status,
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
    out: `${res.stdout ?? ''}${res.stderr ?? ''}`,
  };
}

// Async variant for concurrency fixtures: launches without waiting so
// multiple processes genuinely overlap (V2 simultaneous-start check).
export function runAsync(script, { root, env = {}, args = [] } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath,
      [path.join(REPO, 'tools', 'learn', `${script}.js`), ...args],
      { env: { ...process.env, LEARN_ROOT: root, ...env } });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (status) => resolve({ status, out }));
  });
}

// Fill a draft with the minimum valid close fields (verification fixtures).
export function fillDraft(root, uuid, mutate = null) {
  const draft = path.join(root, 'learning', 'journal', '.in-progress', `${uuid}.md`);
  const { front, body } = readJournal(draft);
  front.planned_scope = 'fixture session';
  front.phase_minutes = { start: 5, model: 12, gate: 5, lab: 30, debrief: 8 };
  front.exercises = [{ id: 'fixture-probe', highest_hint: 'H0' }];
  front.live_spend = { estimated_usd: 0, actual_usd: 0 };
  front.ledger_changes = [];
  front.provenance_events = [];
  front.learner_changes = [];
  front.evidence = ['fixture-evidence'];
  front.interview_items = [];
  front.next_review = 'none';
  if (mutate) mutate(front);
  writeJournal(draft, front, body);
}

export function fiveChecksums(root, uuid) {
  const files = [
    path.join(root, 'learning', 'journal', `${uuid}.md`),
    path.join(root, 'learning', 'COMPETENCY_LEDGER.md'),
    path.join(root, 'learning', 'LEARNING_STATE.md'),
    path.join(root, 'learning', 'PROVENANCE.md'),
    path.join(root, 'learning', 'state.json'),
  ];
  return files.map((f) => (fs.existsSync(f) ? sha256(fs.readFileSync(f)) : 'MISSING'));
}

export function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// Tiny assertion + reporting helpers so every gate script reads the same way.
// Tri-state protocol (Codex review 2026-07-25, finding S3): exit 0 = PASS,
// exit 4 = PASS on runnable checks but ≥1 sub-check BLOCKED on a prerequisite
// (never flattened into PASS), exit 1 = FAIL.
export class Gate {
  constructor(name) {
    this.name = name;
    this.checks = [];
    this.blockedChecks = [];
    this.failed = false;
  }

  check(desc, ok, detail = '') {
    this.checks.push({ desc, ok, detail });
    if (!ok) this.failed = true;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${desc}${detail ? ` — ${detail}` : ''}`);
    return ok;
  }

  blocked(desc, prereq) {
    this.blockedChecks.push({ desc, prereq });
    console.log(`  BLOCKED(${prereq}) ${desc}`);
  }

  finish() {
    const passed = this.checks.filter((c) => c.ok).length;
    if (this.failed) {
      console.log(`${this.name}: FAIL (${passed}/${this.checks.length} checks${this.blockedChecks.length ? `, ${this.blockedChecks.length} blocked` : ''})`);
      process.exit(1);
    }
    if (this.blockedChecks.length) {
      console.log(`${this.name}: PASS on runnable checks (${passed}/${this.checks.length}) + ${this.blockedChecks.length} BLOCKED sub-check(s): ${this.blockedChecks.map((b) => b.prereq).join(', ')}`);
      process.exit(4);
    }
    console.log(`${this.name}: PASS (${passed}/${this.checks.length} checks)`);
    process.exit(0);
  }
}
