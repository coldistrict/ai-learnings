// npm run prereq — descriptive toolchain inventory (plan §15.1, V1).
// Inventories exactly six entries: node, npm, codex CLI, claude CLI, Go, .NET.
// DESCRIPTIVE ONLY: it never chooses or implies the port language — that is
// an M0 diagnostic output (plan §4, R9). Nothing is installed.
//
// Post-M0 validation mode: `--toolchain <go|csharp>` re-checks only the
// selected port toolchain and exits nonzero if absent (used by the gap-map
// generator; V13). This flag does not write the Stage-0 report.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { repoRoot, P, nowIso, writeJson } from './lib.js';

function probe(cmd, args) {
  try {
    const res = spawnSync(cmd, args, { encoding: 'utf8', timeout: 20000 });
    if (res.error || res.status !== 0) {
      return { present: false, note: res.error ? String(res.error.code ?? res.error.message) : `exit ${res.status}` };
    }
    const out = (res.stdout || res.stderr || '').trim().split('\n')[0];
    return { present: true, version: out };
  } catch (e) {
    return { present: false, note: String(e.message) };
  }
}

const PROBES = {
  node: () => ({ present: true, version: process.version }),
  npm: () => probe('npm', ['--version']),
  'codex CLI': () => probe('codex', ['--version']),
  'claude CLI': () => probe('claude', ['--version']),
  Go: () => probe('go', ['version']),
  '.NET': () => probe('dotnet', ['--version']),
};

const tcIdx = process.argv.indexOf('--toolchain');
if (tcIdx >= 0) {
  const port = process.argv[tcIdx + 1];
  const map = { go: 'Go', csharp: '.NET' };
  if (!map[port]) {
    console.error('usage: npm run prereq -- --toolchain <go|csharp>');
    process.exit(1);
  }
  const r = PROBES[map[port]]();
  if (r.present) {
    console.log(`selected port toolchain '${port}' present: ${r.version}`);
    process.exit(0);
  }
  console.error(`selected port toolchain '${port}' ABSENT (${r.note}). Dependent gate V32 is BLOCKED(prereq:${map[port]}). Never waive, never silently switch (plan §6).`);
  process.exit(3);
}

const root = repoRoot();
const entries = Object.entries(PROBES).map(([id, fn]) => {
  const r = fn();
  return {
    id,
    present: r.present,
    ...(r.present ? { version: r.version } : { note: r.note ?? 'not found on PATH' }),
  };
});

const report = {
  generated_at: nowIso(),
  path_used: process.env.PATH,
  descriptive_only: true,
  note: 'Inventory is descriptive (plan §15.1): the port language is selected at the M0 diagnostic (selectedPort ∈ {csharp, go}), never here. No toolchain is installed by this script.',
  entries,
};

fs.mkdirSync(P.learning(root), { recursive: true });
writeJson(P.prereqReport(root), report);

console.log('Prerequisite inventory (descriptive only — no port selection):');
for (const e of entries) {
  console.log(`  ${e.present ? 'present' : 'ABSENT '}  ${e.id.padEnd(11)} ${e.present ? e.version : `(${e.note})`}`);
}
console.log(`report: learning/prereq-report.json`);
console.log('Missing host CLIs mark dependent gates BLOCKED(prereq:<cli>) — see: npm run learn:check');
