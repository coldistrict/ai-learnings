// M0 gap-map generator (plan §4, verification V13).
//   node tools/diagnostic/gapmap.js --input <scores.json> [--out <dir>]
// Consumes the tutor-recorded score input (see tools/diagnostic/README.md),
// validates it, validates the selectedPort toolchain branch via the prereq
// checker, and writes gap-map.json + gap-map.md (default: learning/).
// Scores ROUTE; they never grant mastery. Unknown/untested dims are null →
// the ledger keeps those areas `unseen` (non-punitive).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { repoRoot, P, readJson, writeJson, nowIso } from '../learn/lib.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const root = repoRoot();
const inputFile = arg('input');
const outDir = path.resolve(arg('out', P.learning(root)));
if (!inputFile) {
  console.error('usage: node tools/diagnostic/gapmap.js --input <scores.json> [--out <dir>]');
  process.exit(1);
}

const input = readJson(path.resolve(inputFile));
const areas = readJson(P.competencies(root)).areas;
const problems = [];

// --- validate scores: all 10 areas; dims are 0–4, null (unknown/untested),
// or the explicit string "n/a" (dimension not applicable to the area) -------
const DIMS = ['explain', 'build_debug', 'judgment'];
for (const a of areas) {
  const s = input.area_scores?.[a.id];
  if (!s) { problems.push(`missing area_scores.${a.id}`); continue; }
  for (const d of DIMS) {
    const v = s[d];
    if (v !== null && v !== undefined && v !== 'n/a'
        && !(Number.isInteger(v) && v >= 0 && v <= 4)) {
      problems.push(`area_scores.${a.id}.${d} must be an integer 0–4, null (unknown), or "n/a" (explicitly not applicable)`);
    }
  }
}
for (const k of Object.keys(input.area_scores ?? {})) {
  if (!areas.some((a) => a.id === k)) problems.push(`unknown area in scores: ${k}`);
}

// --- validate calibration fields ----------------------------------------------
const PACES = ['6h/wk', '10h/wk', '15h/wk'];
if (!PACES.includes(input.pace_variant)) {
  problems.push(`pace_variant must be one of ${PACES.join(', ')}`);
}
const OVERLAYS = ['core-enablement', 'platform-lean', 'solutions-fde-lean'];
if (!OVERLAYS.includes(input.role_overlay)) {
  problems.push(`role_overlay must be one of ${OVERLAYS.join(', ')}`);
}
if (typeof input.availability?.hours_per_week !== 'number') {
  problems.push('availability.hours_per_week must be a number');
}

// --- validate selectedPort (plan §4 R9): exactly one of {csharp, go} ----------
const port = input.selected_port;
if (!port || !['csharp', 'go'].includes(port.value)) {
  problems.push("selected_port.value must be exactly one of 'csharp' | 'go' (M0 decision; never both, never absent)");
} else {
  for (const k of ['posting_fit', 'background', 'inventory_ref']) {
    if (!port.inputs?.[k]) problems.push(`selected_port.inputs.${k} is required (decision inputs must be recorded)`);
  }
}

if (problems.length) {
  console.error('gap-map input invalid:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

// --- post-choice toolchain validation (never waived, never switched) ----------
const prereqRes = spawnSync(process.execPath,
  [path.join(HERE, '..', 'learn', 'prereq.js'), '--toolchain', port.value],
  { encoding: 'utf8', env: { ...process.env, LEARN_ROOT: root } });
const toolchainPresent = prereqRes.status === 0;
const toolchainName = port.value === 'go' ? 'Go' : '.NET';
const portValidation = {
  validated_at: nowIso(),
  toolchain: toolchainName,
  present: toolchainPresent,
  v32_status: toolchainPresent ? 'unblocked (runs at core-build-complete)' : `BLOCKED(prereq:${toolchainName})`,
  output: (prereqRes.stdout + prereqRes.stderr).trim(),
};

// --- skip suggestions (plan §4; Codex review S2): an area is a lesson-skip
// candidate ONLY when every applicable dimension has measured evidence ≥3.
// Unknown (null) blocks the suggestion — unmeasured is `unseen`, never
// skippable; "n/a" excludes a dimension only when explicitly declared. ------
const skips = [];
for (const a of areas) {
  const s = input.area_scores[a.id];
  const vals = DIMS.map((d) => s[d]);
  const hasUnknown = vals.some((v) => v === null || v === undefined);
  const numeric = vals.filter((v) => Number.isInteger(v));
  if (!hasUnknown && numeric.length >= 1 && numeric.every((v) => v >= 3)) {
    skips.push(a.id);
  }
}

const gapMap = {
  generated_from: path.basename(inputFile),
  plan_version: 'ai-enabler-mastery-system-v3',
  recorded_at: input.recorded_at ?? null,
  learner: input.learner ?? null,
  area_scores: Object.fromEntries(areas.map((a) => [a.id, input.area_scores[a.id]])),
  pace_variant: input.pace_variant,
  role_overlay: input.role_overlay,
  availability: input.availability,
  environment_report: 'learning/prereq-report.json',
  skipped_but_still_gated: input.skipped_but_gated ?? [],
  skip_suggestions: skips,
  skip_suggestions_note: skips.length
    ? `areas with measured >=3 on every applicable dim, no unknowns (lesson-skip candidates; GATES ARE NEVER WAIVED): ${skips.join(', ')}`
    : 'no areas met the skip bar (measured >=3 on every applicable dim, no unknowns)',
  selected_port: {
    value: port.value,
    decision_inputs: port.inputs,
    post_choice_validation: portValidation,
  },
  next_session_id: input.next_session_id ?? 'm1-01-structured-output-contract',
  routing_note: 'Scores route; they never grant mastery. Unknown areas stay `unseen` in the ledger (non-punitive). Diagnostic skip logic may skip lessons, never gates or artifacts.',
};

fs.mkdirSync(outDir, { recursive: true });
writeJson(path.join(outDir, 'gap-map.json'), gapMap);

const md = [
  '# M0 gap map (generated — do not edit; regenerate from the score input)',
  '',
  `- plan: ${gapMap.plan_version} · learner: ${gapMap.learner ?? '—'} · recorded: ${gapMap.recorded_at ?? '—'}`,
  `- pace variant: **${gapMap.pace_variant}** · role overlay: **${gapMap.role_overlay}** · availability: ${gapMap.availability.hours_per_week} h/wk${gapMap.availability.target_interview_date ? ` · target date: ${gapMap.availability.target_interview_date}` : ''}`,
  `- environment report: ${gapMap.environment_report}`,
  `- selectedPort: **${port.value}** (${portValidation.present ? `${toolchainName} present — V32 unblocked` : `${toolchainName} ABSENT — V32 ${portValidation.v32_status}`})`,
  `  - decision inputs — posting fit: ${port.inputs.posting_fit}; background: ${port.inputs.background}; inventory: ${port.inputs.inventory_ref}`,
  `- next session: **${gapMap.next_session_id}**`,
  `- skipped-but-still-gated: ${gapMap.skipped_but_still_gated.length ? gapMap.skipped_but_still_gated.join(', ') : '(none)'}`,
  `- ${gapMap.skip_suggestions_note}`,
  '',
  '| area | explain | build/debug | judgment |',
  '|---|---|---|---|',
  ...areas.map((a) => {
    const s = gapMap.area_scores[a.id];
    const f = (v) => (v === null || v === undefined ? 'unknown' : String(v));
    return `| ${a.id} | ${f(s.explain)} | ${f(s.build_debug)} | ${f(s.judgment)} |`;
  }),
  '',
  'Dimension legend: 0–4 measured · unknown = untested (stays `unseen`, blocks lesson-skip) · n/a = explicitly not applicable.',
  '',
  gapMap.routing_note,
].join('\n') + '\n';
fs.writeFileSync(path.join(outDir, 'gap-map.md'), md);

console.log(`gap map written: ${path.join(outDir, 'gap-map.md')} (+ .json)`);
console.log(`selectedPort: ${port.value} — ${portValidation.present ? 'toolchain present' : portValidation.v32_status}`);
