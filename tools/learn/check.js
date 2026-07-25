// learn:check [--strict] — validate learning-OS invariants on demand (plan §9.2):
// lock/journal/pointer consistency, view freshness, withheld-path isolation,
// host-prerequisite gate blocking, durable-promotion evidence, and (strict)
// SOURCE_LEDGER staleness.
// Exit codes: 0 healthy · 2 issues found.
import fs from 'node:fs';
import path from 'node:path';
import {
  repoRoot, P, readJson, generateViews, closedJournals, loadJournals,
  withheldReferences, blockedGates, staleLedgerRows, parseSourceLedger,
  lockAgeMs, ORPHAN_LOCK_MIN_AGE_MS,
} from './lib.js';

const strict = process.argv.includes('--strict');
const root = repoRoot();
const issues = [];
const info = [];

// --- lock / journal / pointer consistency ---
const lockFile = P.lockFile(root);
if (fs.existsSync(lockFile)) {
  const lock = readJson(lockFile);
  const draft = path.join(P.inProgressDir(root), `${lock.uuid}.md`);
  const journal = path.join(P.journalDir(root), `${lock.uuid}.md`);
  if (fs.existsSync(draft)) {
    info.push(`open/interrupted session: ${lock.uuid} (teacher ${lock.teacher}, started ${lock.started_at}) — resume with learn:resume or abort with learn:abort`);
  } else if (fs.existsSync(journal)) {
    issues.push(`stale lock: session ${lock.uuid} is already closed — run learn:regen (clears it) or learn:start (clears then starts)`);
  } else {
    const ageMs = lockAgeMs(root);
    if (ageMs < ORPHAN_LOCK_MIN_AGE_MS) {
      issues.push(`lock without draft or journal: ${lock.uuid} is ${(ageMs / 1000).toFixed(1)}s old — a learn:start may be mid-acquisition; re-run learn:check shortly before treating it as an orphan`);
    } else {
      issues.push(`orphan lock: session ${lock.uuid} has no draft and no journal (age ${Math.round(ageMs / 1000)}s) — clear with: npm run learn:abort -- --reason "<why>"`);
    }
  }
} else {
  const drafts = fs.existsSync(P.inProgressDir(root))
    ? fs.readdirSync(P.inProgressDir(root)).filter((f) => f.endsWith('.md'))
    : [];
  for (const d of drafts) issues.push(`orphan draft without lock: learning/journal/.in-progress/${d}`);
}

// --- pointer freshness ---
const state = readJson(P.stateFile(root));
const closed = closedJournals(root);
const newest = closed.length ? closed[closed.length - 1].front.uuid : null;
if (newest && state.last_closed_session !== newest) {
  issues.push(`pointer behind: closed session ${newest} is newer than state.json pointer (${state.last_closed_session}) — run learn:regen`);
}

// --- view freshness (regenerate in memory, compare bytes) ---
const { ledgerText, stateText, provText } = generateViews(root);
const viewChecks = [
  [P.ledgerView(root), ledgerText, 'COMPETENCY_LEDGER.md'],
  [P.stateView(root), stateText, 'LEARNING_STATE.md'],
  [P.provView(root), provText, 'PROVENANCE.md'],
];
for (const [file, expected, name] of viewChecks) {
  if (!fs.existsSync(file)) issues.push(`missing view: ${name} — run learn:regen`);
  else if (fs.readFileSync(file, 'utf8') !== expected) issues.push(`stale view: ${name} — run learn:regen`);
}

// --- withheld-path isolation (plan §5.4/§8.5) ---
for (const hit of withheldReferences(root)) {
  issues.push(`learner-facing file references a withheld path: ${hit}`);
}

// --- journal parse + durable-promotion audit (plan §8.6, V27) ---
for (const j of loadJournals(root)) {
  if (!j.front) {
    issues.push(`journal does not parse: ${path.relative(root, j.file)} — ${j.error}`);
    continue;
  }
  for (const ch of j.front.ledger_changes ?? []) {
    if (ch.to === 'durable') {
      const dates = ch.evidence_dates ?? [];
      const ctxs = ch.contexts ?? [];
      const daysApart = dates.length >= 2
        ? Math.abs(new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000
        : 0;
      if (dates.length < 2 || daysApart < 3 || new Set(ctxs).size < 2) {
        issues.push(`invalid durable promotion in ${j.front.uuid}: ${ch.competency} lacks delayed different-context evidence`);
      }
    }
  }
}

// --- host prerequisites → blocked gates (V1) ---
const { missing, lines } = blockedGates(root);
for (const l of lines) info.push(l);
if (missing.length === 0 && fs.existsSync(P.prereqReport(root))) {
  info.push('all six inventoried toolchains present — no host-blocked gates');
}

// --- remediation queue ---
if (fs.existsSync(P.remediation(root))) {
  const open = (readJson(P.remediation(root)).items ?? []).filter((i) => i.status === 'open');
  if (open.length) info.push(`open remediation items: ${open.length}`);
}

// --- SOURCE_LEDGER (strict) ---
if (strict) {
  const rows = parseSourceLedger(root);
  for (const [i, r] of rows.entries()) {
    for (const [k, v] of Object.entries(r)) {
      if (!v) issues.push(`SOURCE_LEDGER row ${i + 1} has empty column: ${k}`);
    }
  }
  const stale = staleLedgerRows(root);
  for (const r of stale) {
    issues.push(`stale SOURCE_LEDGER row (as-of ${r.asOf} > 30 days old): ${r.claim}`);
  }
}

for (const l of info) console.log(`info: ${l}`);
if (issues.length) {
  console.error(`learn:check found ${issues.length} issue(s):`);
  for (const i of issues) console.error(`  - ${i}`);
  process.exit(2);
}
console.log('learn:check: all invariants hold.');
