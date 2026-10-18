import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkCourse, maintainedSurface, links, anchors } from './lib.js';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'course-check-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const files = [...maintainedSurface(repo), 'learning/curriculum.json',
    'learning/competencies.json', 'learning/course-map.json', 'learning/DECISIONS.md',
    'learning/SOURCE_LEDGER.md'];
  for (const p of files) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.copyFileSync(path.join(repo, p), path.join(root, p));
  }
  // Only teaching docs/metadata are copied. Uninspected link endpoints are empty
  // scratch stand-ins; no actual progress, journals, submissions or keys copied.
  const refs = files.filter(p => p.endsWith('.md')).flatMap(p =>
    links(fs.readFileSync(path.join(root, p), 'utf8')).map(ref => ({ from: p, ref })));
  const map = JSON.parse(fs.readFileSync(path.join(root, 'learning/course-map.json')));
  for (const ref of Object.values(map.module_materials)) refs.push({ from: 'root.md', ref });
  for (const { from, ref } of refs) {
    if (/^(?:[a-z]+:|\/\/)/i.test(ref)) continue;
    const target = path.resolve(root, path.dirname(from), ref.split('#')[0] || path.basename(from));
    const rel = path.relative(root, target);
    assert.ok(!rel.startsWith('..') && !rel.startsWith('.tutor/'), `unsafe fixture path ${ref}`);
    if (!fs.existsSync(target)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, '<!-- uninspected fixture link endpoint -->\n');
    }
  }
  return root;
}
function mutate(root, p, fn) {
  const file = path.join(root, p);
  const data = JSON.parse(fs.readFileSync(file)); fn(data);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
function edit(root, p, fn) {
  const file = path.join(root, p); fs.writeFileSync(file, fn(fs.readFileSync(file, 'utf8')));
}
const curr = 'learning/curriculum.json', map = 'learning/course-map.json';
const cases = [
  ['wrong canonical total', r => mutate(r, curr, c => c.core_hours = '100–140'), /core_hours.*milestone sum/],
  ['wrong README total', r => edit(r, 'README.md', s => s.replace('108–147', '100–140')), /README.md: incorrect total/],
  ['wrong navigation hours', r => edit(r, 'course/README.md', s => s.replace('| 8–11 |', '| 8–12 |')), /navigation: M1 hour range differs/],
  ['missing study guide', r => fs.unlinkSync(path.join(r, 'course/01-model-contracts.md')), /missing local target course\/01-model-contracts.md/],
  ['missing local section', r => mutate(r, map, m => m.topics[0].reference += '-missing'), /missing local section/],
  ['unknown gate', r => mutate(r, curr, c => c.milestones[1].gates.push('V99')), /unknown or incorrectly staged gate V99/],
  ['wrong V22 curriculum stage', r => mutate(r, curr, c => c.milestones[6].gates[0] = 'V22(12\/12)'), /M6: unknown or incorrectly staged gate/],
  ['changed original V22 invariant', r => mutate(r, map, m => m.gates.V22.stages.M6 = '>=7'), /preserve original M6 >=8/],
  ['unknown destination milestone', r => mutate(r, map, m => m.topics[0].destinations[0].milestone = 'M99'), /unknown destination milestone M99/],
  ['gate exists but wrong destination', r => mutate(r, map, m => m.topics[0].destinations[0].gate = 'V34'), /unknown gate\/destination mapping M1\/V34/],
  ['broken competency mapping', r => mutate(r, map, m => m.topics[0].competency = 'invented'), /unknown competency mapping invented/],
  ['unmapped subskill', r => mutate(r, map, m => m.topics[0].subskills.pop()), /coverage:.*must map exactly once/],
  ['unknown subskill', r => mutate(r, map, m => m.topics[0].subskills.push('invented')), /unknown subskill mapping/],
  ['duplicate topic ID', r => mutate(r, map, m => m.topics[1].id = m.topics[0].id), /duplicate topic ID/],
  ['duplicate milestone ID', r => mutate(r, curr, c => c.milestones[1].id = 'M0'), /duplicate milestone ID/],
  ['duplicate module ID', r => mutate(r, curr, c => c.milestones[1].modules.push(c.milestones[0].modules[0])), /duplicate module ID/],
  ['invalid revision date', r => mutate(r, curr, c => c.content_revision = '2026-02-30'), /real YYYY-MM-DD date/],
  ['empty lesson focus', r => mutate(r, curr, c => c.milestones[1].lesson_focus = [' ']), /nonempty lesson_focus/],
  ['broken tier topic', r => mutate(r, map, m => m.pilot.tiers.required_later.push('missing-topic')), /broken tier mapping/],
  ['optional topic made a prerequisite', r => mutate(r, map, m => { const id = m.pilot.tiers.optional_exploration.pop(); m.pilot.tiers.required_later.push(id); }), /incorrect tier required_later/],
  ['missing required destination', r => mutate(r, map, m => m.topics[0].destinations = []), /required topics need destinations/],
  ['spending control relabeled optional', r => mutate(r, map, m => { const t = m.topics.find(t => t.id === 'concurrent-budget'); t.requirement = 'optional'; t.basis = 'optional'; t.destinations = []; }), /spending coverage cannot be optional/],
  ['missing module material', r => mutate(r, map, m => delete m.module_materials['m1-01-structured-output-contract']), /missing module material mapping/],
  ['unknown source name', r => edit(r, 'course/01-model-contracts.md', s => s.replace('sources: OpenAI structured outputs', 'sources: Misspelled source')), /unknown source name Misspelled source/],
  ['unknown structured source', r => mutate(r, map, m => m.topics[0].sources = ['Unknown claim']), /unknown source name Unknown claim/],
  ['broken inline local link', r => edit(r, 'course/README.md', s => s + '\n[Missing](missing.md)\n'), /missing local target missing.md/],
  ['broken reference-style link', r => edit(r, 'course/README.md', s => s + '\n[Missing][bad]\n\n[bad]: missing.md\n'), /missing local target missing.md/],
  ['missing fragment link', r => edit(r, 'course/README.md', s => s + '\n[Missing](01-model-contracts.md#missing)\n'), /missing local section/],
  ['fake pending chapter tiers', r => mutate(r, map, m => m.chapters[2].tiers = m.pilot.tiers), /pending chapter needs reason, not fake tiers/],
  ['unobserved pilot used to complete a chapter', r => mutate(r, map, m => { m.chapters[2].status = 'restructured'; m.chapters[2].tiers = m.pilot.tiers; m.chapters[2].evidence = m.pilot.reference; }), /restructuring requires actual pilot evidence first/],
  ['stale pilot destination table', r => edit(r, 'course/pilots/m1-01-structured-output-contract.md', s => s.replace('M1 / V16', 'M8 / V16')), /destination table differs/],
  ['missing execution amendment', r => mutate(r, map, m => delete m.gates.V20.amendment), /V20: local execution amendment required/],
];

test('valid scratch course passes; date age is not educational freshness', t => {
  const root = fixture(t);
  assert.deepEqual(checkCourse(root).errors, []);
  mutate(root, curr, c => c.content_revision = '2020-02-29');
  assert.deepEqual(checkCourse(root).errors, []);
});
for (const [name, damage, expected] of cases) test(`rejects ${name}`, t => {
  const root = fixture(t); damage(root);
  const errors = checkCourse(root).errors;
  assert.ok(errors.some(error => expected.test(error)), errors.join('\n'));
});
test('CLI failure exits nonzero and leaves scratch files unchanged', t => {
  const root = fixture(t);
  mutate(root, curr, c => c.core_hours = '0–0');
  const before = fs.readFileSync(path.join(root, curr));
  const result = spawnSync(process.execPath, [path.join(repo, 'tools/course/check.js'), '--root', root], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /core_hours/);
  assert.deepEqual(fs.readFileSync(path.join(root, curr)), before);
});
test('links and heading anchors handle supported Markdown forms', () => {
  assert.deepEqual(links('[x](a(b).md#part) [y](<space name.md>)\n[r][r]\n[r]: b.md\n`[fake](ignore.md)`'), ['b.md', 'a(b).md#part', 'space name.md', 'b.md']);
  assert.deepEqual([...anchors('# Same\n## Same\n## ADR-0009 — Title\n<a id="extra"></a>')], ['same', 'same-1', 'adr-0009--title', 'extra']);
});
test('pilot JSON data examples are valid illustrations, with no executable classifier', () => {
  const text = fs.readFileSync(path.join(repo, 'course/pilots/m1-01-structured-output-contract.md'), 'utf8');
  const values = [...text.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m => JSON.parse(m[1]));
  assert.equal(values.length, 3);
  assert.equal(values[0].staffNote, 'The returns desk opens at 10:00.');
  assert.equal(values[1].opens_at, '10:00');
  assert.equal(values[2].opens_at, '11:00');
  assert.equal(values[1].desk, values[2].desk);
});
