// V11 — Prompts and the teach skill in both hosts (plan §9.4) [host]
// Static checks run here. The [host] live sub-check ("Teach me the next
// session" in each host) cannot run at Stage 0–2: starting it would begin
// the M0 diagnostic (past the approved boundary), and neither host CLI is
// on PATH per the V1 inventory — recorded as BLOCKED, never PASS.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Gate, REPO } from './fixture-lib.js';

const g = new Gate('V11');

const promptChecks = [
  ['session ownership acquisition', /learn:start/],
  ['bounded-state read list', /LEARNING_STATE/],
  ['no-restating-history rule', /never ask the learner to\s+restate/i],
  ['hint-ladder reference', /H0/],
  ['provenance rule', /provenance/i],
  ['learn:close', /learn:close/],
  ['next-action statement', /next due action|learn:next/],
  ['withheld rule', /withheld/i],
  ['cost consent', /--allow-live/],
];
const prompts = ['SOLO-CLAUDE-PROMPT.md', 'SOLO-CODEX-PROMPT.md', 'PAIRED-SESSION-PROMPT.md'];
for (const p of prompts) {
  const text = fs.readFileSync(path.join(REPO, 'prompts', p), 'utf8');
  const missing = promptChecks.filter(([, re]) => !re.test(text)).map(([n]) => n);
  g.check(`${p}: contains all required elements (grep ≥1 each)`, missing.length === 0, missing.join(', ') || `${promptChecks.length}/${promptChecks.length}`);
}
const paired = fs.readFileSync(path.join(REPO, 'prompts', 'PAIRED-SESSION-PROMPT.md'), 'utf8');
const pairedChecks = [
  ['examiner read-only', /read-only/i],
  ['single review file', /ONLY ONE file|single review file/i],
  ['≤3 findings', /3\s*findings/i],
  ['exactly 1 challenge', /exactly 1 challenge/i],
];
for (const [name, re] of pairedChecks) {
  g.check(`PAIRED: ${name}`, re.test(paired));
}

// skills: exist + identical delimited shared body
const claudeSkill = path.join(REPO, '.claude', 'skills', 'teach', 'SKILL.md');
const codexSkill = path.join(REPO, '.agents', 'skills', 'teach', 'SKILL.md');
g.check('.claude/skills/teach/SKILL.md exists', fs.existsSync(claudeSkill));
g.check('.agents/skills/teach/SKILL.md exists', fs.existsSync(codexSkill));
const verify = spawnSync(process.execPath, [path.join(REPO, 'tools', 'build-skills.js'), '--verify'], { encoding: 'utf8' });
g.check('delimited shared body: 0 differing lines between hosts', verify.status === 0, verify.stdout.trim());

// [host] live sub-check: tri-state, never flattened into PASS (Codex review
// S3). A host earns PASS here only via a recorded live-session artifact at
// docs/verification/evidence/v11-host-<host>.md; otherwise the sub-check is
// BLOCKED — on the missing CLI, or (CLI present) on the Stage-3 boundary,
// since running "Teach me the next session" would start the M0 diagnostic.
const report = JSON.parse(fs.readFileSync(path.join(REPO, 'learning', 'prereq-report.json'), 'utf8'));
for (const [id, artifact] of [['claude CLI', 'v11-host-claude.md'], ['codex CLI', 'v11-host-codex.md']]) {
  const entry = report.entries.find((e) => e.id === id);
  const artifactPath = path.join(REPO, 'docs', 'verification', 'evidence', artifact);
  if (fs.existsSync(artifactPath)) {
    g.check(`[host] ${id}: live "Teach me the next session" artifact recorded`, true, artifact);
  } else if (!entry?.present) {
    g.blocked(`[host] ${id}: live "Teach me the next session" run — no artifact (${artifact})`, `prereq:${id}`);
  } else {
    g.blocked(`[host] ${id}: CLI present but live run pending — would start the M0 diagnostic`, 'pending:stage-3-live-run');
  }
}

g.finish();
