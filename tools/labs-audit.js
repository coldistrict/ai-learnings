// labs:audit — V19 authoring-rule audit for every lab (plan §8.4).
// Checks, per lab directory (labs/<module>/<lab>/):
//   1. README.md contains the three visible-contract headers:
//      "## Scenario", "## Constraints", "## Acceptance criteria" (3/3).
//   2. Zero solution blocks in the README: no heading matching /solution/i
//      and no fenced code block tagged or labeled as a solution. (Fenced
//      blocks are allowed for commands/data/interfaces only — flagged for
//      manual review if they exceed 25 lines.)
//   3. Acceptance criteria carry ids (AC-n); every test title in
//      tests/*.test.js starts with an AC id that exists in the README
//      (unmatched tests = 0). Tests are the lab's only executable checks,
//      so this also makes unreferenced hidden checks = 0.
//   4. Warn (not fail) on AC ids with no covering test (review-scored ACs
//      are allowed but must be deliberate).
// Exit 0 clean · 1 violations.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const labsRoot = path.join(REPO, 'labs');

const labs = [];
for (const module_ of fs.existsSync(labsRoot) ? fs.readdirSync(labsRoot) : []) {
  const mdir = path.join(labsRoot, module_);
  if (!fs.statSync(mdir).isDirectory()) continue;
  for (const lab of fs.readdirSync(mdir)) {
    const ldir = path.join(mdir, lab);
    if (fs.statSync(ldir).isDirectory() && fs.existsSync(path.join(ldir, 'README.md'))) {
      labs.push({ id: `${module_}/${lab}`, dir: ldir });
    }
  }
}

let violations = 0;
const report = [];

for (const lab of labs) {
  const readme = fs.readFileSync(path.join(lab.dir, 'README.md'), 'utf8');
  const problems = [];
  const warnings = [];

  // 1. headers
  const headers = ['## Scenario', '## Constraints', '## Acceptance criteria'];
  const headerCount = headers.filter((h) => readme.includes(h)).length;
  if (headerCount !== 3) problems.push(`headers ${headerCount}/3 (need Scenario/Constraints/Acceptance criteria)`);

  // 2. solution blocks
  if (/^#+ .*solution/im.test(readme)) problems.push('README contains a solution-like heading');
  const fences = [...readme.matchAll(/```(\w*)\n([\s\S]*?)```/g)];
  for (const f of fences) {
    if (/solution/i.test(f[1]) || /(^|\n)\s*\/\/\s*solution/i.test(f[2])) {
      problems.push('README contains a solution-labeled code block');
    } else if (f[2].split('\n').length > 25) {
      warnings.push(`long fenced block (${f[2].split('\n').length} lines) — manual review: interfaces/data only`);
    }
  }

  // 3. AC ids ↔ test titles
  const acIds = new Set([...readme.matchAll(/\bAC-(\d+)\b/g)].map((m) => `AC-${m[1]}`));
  if (acIds.size === 0) problems.push('no AC-n ids found in README');
  const testsDir = path.join(lab.dir, 'tests');
  const testTitles = [];
  if (fs.existsSync(testsDir)) {
    for (const tf of fs.readdirSync(testsDir).filter((f) => f.endsWith('.test.js'))) {
      const src = fs.readFileSync(path.join(testsDir, tf), 'utf8');
      for (const m of src.matchAll(/(?:^|\s)(?:test|it)\s*\(\s*['"`](.+?)['"`]/gs)) {
        testTitles.push({ file: tf, title: m[1] });
      }
    }
  } else {
    problems.push('no tests/ directory');
  }
  const unmatched = testTitles.filter((t) => {
    const m = t.title.match(/^AC-(\d+)\b/);
    return !m || !acIds.has(`AC-${m[1]}`);
  });
  for (const u of unmatched) {
    problems.push(`test not mapped to a README criteria id: [${u.file}] "${u.title}"`);
  }
  const covered = new Set(
    testTitles.map((t) => t.title.match(/^AC-(\d+)\b/)).filter(Boolean).map((m) => `AC-${m[1]}`),
  );
  for (const id of acIds) {
    if (!covered.has(id)) warnings.push(`${id} has no covering test (allowed only for review-scored criteria)`);
  }

  report.push({ lab: lab.id, headers: headerCount, acIds: acIds.size, tests: testTitles.length, unmatched: unmatched.length, problems, warnings });
  violations += problems.length;
}

for (const r of report) {
  const status = r.problems.length ? 'FAIL' : 'ok  ';
  console.log(`${status} ${r.lab} — headers ${r.headers}/3, ACs ${r.acIds}, tests ${r.tests}, unmatched ${r.unmatched}`);
  for (const p of r.problems) console.log(`      problem: ${p}`);
  for (const w of r.warnings) console.log(`      warn: ${w}`);
}
console.log(`labs:audit — ${labs.length} lab(s), ${violations} violation(s).`);
process.exit(violations ? 1 : 0);
