// V9 — Scenario packs and the pack-cost hypothesis (plan §5.4)
import fs from 'node:fs';
import path from 'node:path';
import { Gate, REPO } from './fixture-lib.js';

const g = new Gate('V9');
const scenariosDir = path.join(REPO, 'scenarios');
const packs = fs.readdirSync(scenariosDir).filter((d) => fs.statSync(path.join(scenariosDir, d)).isDirectory()).sort();
g.check('ls -d scenarios/*/ | wc -l → 3 at Stage 0 exit', packs.length === 3, packs.join(', '));

for (const pack of packs) {
  const pdir = path.join(scenariosDir, pack);
  const files = fs.readdirSync(pdir);
  const logMetric = files.filter((f) => /^(logs|metrics)\./.test(f));
  g.check(`[${pack}] public bundle: ≥1 log/metric bundle`, logMetric.length >= 1, logMetric.join(', '));
  g.check(`[${pack}] public bundle: ≥1 ticket-thread file`, files.some((f) => f.includes('ticket')));
  g.check(`[${pack}] public bundle: ≥1 doc-link list`, files.some((f) => f.includes('doc-link')));

  const wdir = path.join(REPO, '.tutor', 'withheld', pack);
  g.check(`[${pack}] withheld root-cause statement exists`, fs.existsSync(path.join(wdir, 'root-cause.md')));
  let labels = null;
  try {
    labels = JSON.parse(fs.readFileSync(path.join(wdir, 'labels.json'), 'utf8'));
    g.check(`[${pack}] machine-readable labels file parses`, true);
  } catch (e) {
    g.check(`[${pack}] machine-readable labels file parses`, false, String(e));
  }
  const rh = fs.existsSync(path.join(wdir, 'red-herrings.md'))
    ? fs.readFileSync(path.join(wdir, 'red-herrings.md'), 'utf8') : '';
  const rhEntries = (rh.match(/^\d+\.\s+\*\*/gm) ?? []).length;
  g.check(`[${pack}] red-herring inventory with ≥1 entry`, rhEntries >= 1, `entries=${rhEntries}`);

  // labels reference only public criteria (unmatched label-derived requirements = 0)
  if (labels) {
    const readme = fs.readFileSync(path.join(pdir, 'README.md'), 'utf8');
    const publicAcs = new Set([...readme.matchAll(/\bAC-(\d+)\b/g)].map((m) => `AC-${m[1]}`));
    const labelAcs = Object.keys(labels.ac_map ?? {});
    const unmatched = labelAcs.filter((id) => !publicAcs.has(id));
    g.check(`[${pack}] withheld labels reference only public criteria (unmatched = 0)`,
      labelAcs.length > 0 && unmatched.length === 0, unmatched.join(', ') || `${labelAcs.length} label groups, all public`);
  }
}

// timing records + decision entry
const timing = JSON.parse(fs.readFileSync(path.join(REPO, '.tutor', 'pack-timing.json'), 'utf8'));
g.check('authoring time recorded for all 3 packs', (timing.packs ?? []).length === 3 && timing.packs.every((p) => typeof p.hours === 'number'));
const decisions = fs.readFileSync(path.join(REPO, 'learning', 'DECISIONS.md'), 'utf8');
const adr4 = decisions.split('## ADR-0004')[1]?.split('\n## ')[0] ?? '';
g.check('dated DECISIONS.md entry states measured median vs the 2h hypothesis',
  adr4.includes('2026-07-25') && /median/i.test(adr4) && adr4.includes('2 h'));
const decisionCount = (adr4.match(/\*\*Decision \(exactly one\):\*\*/g) ?? []).length;
g.check('exactly 1 keep/reduce decision', decisionCount === 1 && /KEEP|REDUCE/.test(adr4), `decision statements=${decisionCount}`);

g.finish();
