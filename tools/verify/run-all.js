// Run every Stage 0–2 gate harness, tee output into evidence files, and
// print a summary. V10b (network) is invoked separately because its outcome
// legitimately depends on network availability (BLOCKED semantics).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const evidenceDir = path.join(REPO, 'docs', 'verification', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

// Tri-state protocol (Codex review S3): exit 0 = PASS, exit 4 = PASS on
// runnable checks with ≥1 BLOCKED sub-check (surfaced, never flattened),
// anything else = FAIL.
const gates = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10a', 'v11', 'v12', 'v18', 'v19', 'gapmap-rules'];
const results = [];
for (const gate of gates) {
  const r = spawnSync(process.execPath, [path.join(HERE, `${gate}.js`)], { encoding: 'utf8', cwd: REPO });
  const out = `${r.stdout}${r.stderr}`;
  fs.writeFileSync(path.join(evidenceDir, `${gate.toUpperCase()}.txt`),
    `# ${gate.toUpperCase()} harness output — ${new Date().toISOString()}\n# command: node tools/verify/${gate}.js\n\n${out}`);
  const verdict = r.status === 0 ? 'PASS' : r.status === 4 ? 'PASS+BLOCKED' : 'FAIL';
  results.push({ gate: gate.toUpperCase(), verdict });
  console.log(`${verdict.padEnd(12)}  ${gate.toUpperCase()}`);
}
const failed = results.filter((r) => r.verdict === 'FAIL');
const blocked = results.filter((r) => r.verdict === 'PASS+BLOCKED');
console.log(`\n${results.length - failed.length}/${results.length} harnesses green` +
  (blocked.length ? ` (${blocked.map((b) => b.gate).join(', ')} carry BLOCKED sub-checks — see their evidence files)` : '') +
  (failed.length ? `; FAILED: ${failed.map((f) => f.gate).join(', ')}` : '.'));
process.exit(failed.length ? 1 : 0);
