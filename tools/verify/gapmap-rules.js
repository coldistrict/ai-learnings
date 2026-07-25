// M0 gap-map routing rules — machinery fixture (Codex review 2026-07-25,
// finding S2). Not a numbered verification gate: it guards the router logic
// V13 will depend on. Proves: unknown dimensions can never generate a
// lesson-skip candidate; explicit "n/a" can exclude a dimension; invalid
// dimension values are rejected.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Gate, REPO } from './fixture-lib.js';

const g = new Gate('GAPMAP-RULES');
const samplePath = path.join(REPO, 'tools', 'diagnostic', 'fixtures', 'sample-scores.json');
const base = JSON.parse(fs.readFileSync(samplePath, 'utf8'));

function runGapmap(mutate) {
  const input = structuredClone(base);
  if (mutate) mutate(input);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gapmap-rules-'));
  const inputFile = path.join(dir, 'scores.json');
  fs.writeFileSync(inputFile, JSON.stringify(input, null, 2));
  const res = spawnSync(process.execPath,
    [path.join(REPO, 'tools', 'diagnostic', 'gapmap.js'), '--input', inputFile, '--out', dir],
    { encoding: 'utf8' });
  const out = `${res.stdout}${res.stderr}`;
  let gapMap = null;
  const jsonFile = path.join(dir, 'gap-map.json');
  if (fs.existsSync(jsonFile)) gapMap = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  fs.rmSync(dir, { recursive: true, force: true });
  return { status: res.status, out, gapMap };
}

// A: baseline sample — interview-communication has {3, null, null}: unknown
// dims MUST block the skip suggestion; production-platform {3,3,3} qualifies.
{
  const { status, gapMap } = runGapmap(null);
  g.check('A: sample input generates (exit 0)', status === 0);
  g.check('A: area with unknown dims (interview-communication {3,null,null}) is NOT a skip candidate',
    !!gapMap && !gapMap.skip_suggestions.includes('interview-communication'),
    gapMap ? gapMap.skip_suggestions.join(', ') || '(none)' : 'no gap map');
  g.check('A: fully-measured area at ≥3 (production-platform {3,3,3}) IS a skip candidate',
    !!gapMap && gapMap.skip_suggestions.includes('production-platform'));
}

// B: explicit "n/a" excludes a dimension — {3, n/a, n/a} qualifies.
{
  const { status, gapMap } = runGapmap((input) => {
    input.area_scores['interview-communication'] = { explain: 3, build_debug: 'n/a', judgment: 'n/a' };
  });
  g.check('B: explicit n/a dims with measured 3 → skip candidate', status === 0
    && !!gapMap && gapMap.skip_suggestions.includes('interview-communication'));
}

// C: one unknown among 3s blocks the suggestion.
{
  const { status, gapMap } = runGapmap((input) => {
    input.area_scores['production-platform'] = { explain: 3, build_debug: 3, judgment: null };
  });
  g.check('C: {3,3,null} → NOT a skip candidate (one unknown blocks)', status === 0
    && !!gapMap && !gapMap.skip_suggestions.includes('production-platform'));
}

// D: invalid dimension value is rejected outright.
{
  const { status, out } = runGapmap((input) => {
    input.area_scores['llm-fundamentals'].explain = 'maybe';
  });
  g.check('D: invalid dim value ("maybe") → generator exits nonzero naming the field',
    status !== 0 && out.includes('llm-fundamentals.explain'));
}

g.finish();
