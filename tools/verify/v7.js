// V7 — Withheld/solutions isolation (plan §5.4, §8.5)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Gate, REPO } from './fixture-lib.js';
import { withheldReferences } from '../learn/lib.js';

const g = new Gate('V7');

// 1. no learner-facing pointer to withheld paths
const hits = withheldReferences(REPO);
g.check('grep -rl ".tutor/withheld" over labs/ scenarios/ prompts/ START_HERE.md .claude/skills/ .agents/skills/ → 0 files',
  hits.length === 0, hits.join(', ') || '0 hits');

// 2. no solution/reference files under labs
const find = spawnSync('find', ['labs', '-iname', '*solution*', '-o', '-iname', '*reference*'],
  { cwd: REPO, encoding: 'utf8' });
const found = find.stdout.trim().split('\n').filter(Boolean);
g.check('find labs -iname *solution* -o -iname *reference* → 0', found.length === 0, found.join(', ') || '0 files');

// 3. micro-probe references ≤ 60 lines (violations = 0)
const refDirs = [];
const withheldRoot = path.join(REPO, '.tutor', 'withheld');
if (fs.existsSync(withheldRoot)) {
  for (const slug of fs.readdirSync(withheldRoot)) {
    const rd = path.join(withheldRoot, slug, 'references');
    if (fs.existsSync(rd)) refDirs.push(rd);
  }
}
let violations = 0;
let refCount = 0;
for (const rd of refDirs) {
  for (const f of fs.readdirSync(rd)) {
    refCount++;
    const lines = fs.readFileSync(path.join(rd, f), 'utf8').split('\n').length;
    if (lines > 60) violations++;
  }
}
g.check('micro-probe references over 60 lines = 0 violations', violations === 0,
  `${refCount} reference file(s) exist`);

// 4. prompts + teach skill bodies contain the withheld rule
const files = [
  'prompts/SOLO-CLAUDE-PROMPT.md',
  'prompts/SOLO-CODEX-PROMPT.md',
  'prompts/PAIRED-SESSION-PROMPT.md',
  '.claude/skills/teach/SKILL.md',
  '.agents/skills/teach/SKILL.md',
];
for (const f of files) {
  const text = fs.readFileSync(path.join(REPO, f), 'utf8');
  const count = (text.match(/withheld/gi) ?? []).length;
  g.check(`${f}: grep -c "withheld" >= 1`, count >= 1, `count=${count}`);
}

g.finish();
