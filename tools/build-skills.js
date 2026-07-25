// Build the native teach-skill wrappers from ONE shared semantic body
// (plan §9.4 D7). Host wrappers differ only in frontmatter; the delimited
// shared body is byte-identical (verification V11).
//   npm run skills:build    — (re)generate both SKILL.md files
//   npm run skills:verify   — extract both bodies and diff (0 lines expected)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const BODY_FILE = path.join(HERE, 'teach-skill', 'shared-body.md');
const BEGIN = '<!-- SHARED-BODY-BEGIN (generated from tools/teach-skill/shared-body.md — edit there, then npm run skills:build) -->';
const END = '<!-- SHARED-BODY-END -->';

const TARGETS = [
  {
    file: path.join(REPO, '.claude', 'skills', 'teach', 'SKILL.md'),
    frontmatter: [
      '---',
      'name: teach',
      'description: Run the next AI Enabler Mastery System tutoring session. Use when the learner says "Teach me the next session" or asks to continue the learning program. Claude Code native wrapper; canonical fallback is prompts/SOLO-CLAUDE-PROMPT.md.',
      '---',
    ].join('\n'),
    heading: '# teach — AI Enabler Mastery System session (Claude Code wrapper)',
  },
  {
    file: path.join(REPO, '.agents', 'skills', 'teach', 'SKILL.md'),
    frontmatter: [
      '---',
      'name: teach',
      'description: Run the next AI Enabler Mastery System tutoring session. Use when the learner says "Teach me the next session" or asks to continue the learning program. Codex native wrapper; canonical fallback is prompts/SOLO-CODEX-PROMPT.md.',
      '---',
    ].join('\n'),
    heading: '# teach — AI Enabler Mastery System session (Codex wrapper)',
  },
];

function render(target, body) {
  return `${target.frontmatter}\n\n${target.heading}\n\n${BEGIN}\n${body.trim()}\n${END}\n`;
}

function extractBody(text) {
  const i = text.indexOf(BEGIN);
  const j = text.indexOf(END);
  if (i < 0 || j < 0) return null;
  return text.slice(i + BEGIN.length, j).trim();
}

const body = fs.readFileSync(BODY_FILE, 'utf8');

if (process.argv.includes('--verify')) {
  const bodies = TARGETS.map((t) => {
    if (!fs.existsSync(t.file)) return { file: t.file, body: null };
    return { file: t.file, body: extractBody(fs.readFileSync(t.file, 'utf8')) };
  });
  const missing = bodies.filter((b) => b.body === null);
  if (missing.length) {
    for (const m of missing) console.error(`missing or unmarked skill: ${m.file}`);
    process.exit(1);
  }
  if (bodies[0].body !== bodies[1].body) {
    console.error('shared bodies DIFFER between hosts');
    process.exit(1);
  }
  if (bodies[0].body !== body.trim()) {
    console.error('skill bodies are stale relative to tools/teach-skill/shared-body.md — run npm run skills:build');
    process.exit(1);
  }
  console.log('skills:verify — shared bodies identical across both hosts and current (0 differing lines).');
  process.exit(0);
}

for (const t of TARGETS) {
  fs.mkdirSync(path.dirname(t.file), { recursive: true });
  fs.writeFileSync(t.file, render(t, body));
  console.log(`wrote ${path.relative(REPO, t.file)}`);
}
