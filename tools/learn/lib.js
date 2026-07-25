// Learning-OS core library (tutor-owned infrastructure; plan §9).
// Plain Node, zero dependencies. All learn:* commands share this module.
//
// Determinism hooks (used by verification fixtures, plan verification.md V5):
//   LEARN_FIXED_UUID  — fixed session UUID
//   LEARN_FIXED_TIME  — fixed ISO timestamp for all clock reads
//   LEARN_CRASH_AFTER — close.js crashes (exit 99) after the named phase:
//                       validate | rename | regen | pointer
//   LEARN_ROOT        — operate on an alternate repo root (scratch fixtures)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export function repoRoot() {
  if (process.env.LEARN_ROOT) return path.resolve(process.env.LEARN_ROOT);
  return path.resolve(HERE, '..', '..');
}

export const P = {
  learning: (r) => path.join(r, 'learning'),
  stateFile: (r) => path.join(r, 'learning', 'state.json'),
  lockFile: (r) => path.join(r, 'learning', 'active-session.json'),
  journalDir: (r) => path.join(r, 'learning', 'journal'),
  inProgressDir: (r) => path.join(r, 'learning', 'journal', '.in-progress'),
  ledgerView: (r) => path.join(r, 'learning', 'COMPETENCY_LEDGER.md'),
  stateView: (r) => path.join(r, 'learning', 'LEARNING_STATE.md'),
  provView: (r) => path.join(r, 'learning', 'PROVENANCE.md'),
  competencies: (r) => path.join(r, 'learning', 'competencies.json'),
  ownership: (r) => path.join(r, 'learning', 'ownership.json'),
  curriculum: (r) => path.join(r, 'learning', 'curriculum.json'),
  remediation: (r) => path.join(r, 'learning', 'remediation.json'),
  sourceLedger: (r) => path.join(r, 'learning', 'SOURCE_LEDGER.md'),
  prereqReport: (r) => path.join(r, 'learning', 'prereq-report.json'),
};

export function nowIso() {
  return process.env.LEARN_FIXED_TIME || new Date().toISOString();
}

export function newUuid() {
  return process.env.LEARN_FIXED_UUID || crypto.randomUUID();
}

export function crashAfter(phase) {
  if (process.env.LEARN_CRASH_AFTER === phase) {
    process.stderr.write(`[crash-hook] simulated crash after phase: ${phase}\n`);
    process.exit(99);
  }
}

export function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Minimal YAML subset for journal frontmatter.
// Closed schema we fully control: maps, nested maps, arrays.
// Emission rules: strings JSON-quoted; scalar arrays as JSON flow arrays;
// arrays of maps as block sequences. Parser accepts exactly that subset plus
// unquoted plain scalars (fallback: raw string).
// ---------------------------------------------------------------------------

function emitScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(String(v));
}

function isScalarArray(a) {
  return a.every((x) => x === null || ['string', 'number', 'boolean'].includes(typeof x));
}

export function emitYaml(obj, indent = 0) {
  const pad = ' '.repeat(indent);
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) {
      lines.push(`${pad}${k}: null`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${pad}${k}: []`);
      } else if (isScalarArray(v)) {
        lines.push(`${pad}${k}: ${JSON.stringify(v)}`);
      } else {
        lines.push(`${pad}${k}:`);
        for (const item of v) {
          const entries = Object.entries(item);
          const [fk, fv] = entries[0];
          const first = Array.isArray(fv) && fv.length && !isScalarArray(fv)
            ? null // never emit nested map-arrays as first key
            : `${pad}  - ${fk}: ${Array.isArray(fv) ? (fv.length === 0 ? '[]' : JSON.stringify(fv)) : emitScalar(fv)}`;
          if (first === null) throw new Error('unsupported frontmatter shape');
          lines.push(first);
          for (const [rk, rv] of entries.slice(1)) {
            if (Array.isArray(rv)) {
              lines.push(`${pad}    ${rk}: ${rv.length === 0 ? '[]' : JSON.stringify(rv)}`);
            } else if (rv !== null && typeof rv === 'object') {
              lines.push(`${pad}    ${rk}:`);
              lines.push(emitYaml(rv, indent + 6));
            } else {
              lines.push(`${pad}    ${rk}: ${emitScalar(rv)}`);
            }
          }
        }
      }
    } else if (typeof v === 'object') {
      lines.push(`${pad}${k}:`);
      lines.push(emitYaml(v, indent + 2));
    } else {
      lines.push(`${pad}${k}: ${emitScalar(v)}`);
    }
  }
  return lines.join('\n');
}

function parseScalar(raw) {
  const s = raw.trim();
  if (s === '' || s === 'null' || s === '~') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s.startsWith('[') || s.startsWith('{') || s.startsWith('"')) {
    try { return JSON.parse(s); } catch { return s; }
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function indentOf(line) {
  let i = 0;
  while (i < line.length && line[i] === ' ') i++;
  return i;
}

export function parseYaml(text) {
  const lines = text.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('#'));
  let pos = 0;

  function parseMap(indent) {
    const out = {};
    while (pos < lines.length) {
      const line = lines[pos];
      const ind = indentOf(line);
      if (ind < indent) break;
      if (ind > indent) throw new Error(`unexpected indent at: ${line}`);
      if (line.trim().startsWith('- ')) break;
      const m = line.slice(indent).match(/^([^:\s][^:]*):(.*)$/);
      if (!m) throw new Error(`unparseable line: ${line}`);
      const key = m[1].trim();
      const rest = m[2];
      pos++;
      if (rest.trim() === '') {
        // nested block: map or sequence
        if (pos < lines.length && indentOf(lines[pos]) > indent) {
          const childIndent = indentOf(lines[pos]);
          if (lines[pos].trim().startsWith('- ')) {
            out[key] = parseSeq(childIndent);
          } else {
            out[key] = parseMap(childIndent);
          }
        } else {
          out[key] = null;
        }
      } else {
        out[key] = parseScalar(rest);
      }
    }
    return out;
  }

  function parseSeq(indent) {
    const out = [];
    while (pos < lines.length) {
      const line = lines[pos];
      const ind = indentOf(line);
      if (ind !== indent || !line.trim().startsWith('- ')) break;
      const rest = line.slice(indent + 2);
      if (/^([^:\s][^:]*):(.*)$/.test(rest)) {
        // sequence item is a map; rewrite first line and parse at indent+2
        lines[pos] = ' '.repeat(indent + 2) + rest;
        out.push(parseMap(indent + 2));
      } else {
        pos++;
        out.push(parseScalar(rest));
      }
    }
    return out;
  }

  return parseMap(indentOf(lines[0] ?? ''));
}

// ---------------------------------------------------------------------------
// Journal frontmatter I/O
// ---------------------------------------------------------------------------

export function readJournal(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`no frontmatter in ${file}`);
  return { front: parseYaml(m[1]), body: m[2] };
}

export function writeJournal(file, front, body) {
  fs.writeFileSync(file, `---\n${emitYaml(front)}\n---\n${body}`);
}

export const REQUIRED_CLOSE_FIELDS = [
  'uuid', 'teacher', 'mode', 'variant', 'status', 'started_at', 'closed_at',
  'planned_scope', 'phase_minutes', 'exercises', 'live_spend',
  'ledger_changes', 'provenance_events', 'learner_changes', 'evidence',
  'interview_items', 'next_review',
];

export const PHASES = ['start', 'model', 'gate', 'lab', 'debrief'];

// Strict consent enum (Codex re-review 2026-07-25: substring matching let
// "not yes" pass). Free-text detail belongs in the optional consent_note.
export const CONSENT_VALUES = ['yes-explicit', 'yes-mechanical-unblock'];

// Validates a draft's frontmatter for closing. Returns a list of problems
// (empty = valid). closed_at is filled by close itself, so it is exempt when
// checking a still-open draft (pass {open:true}).
export function validateCloseFields(front, { open = false } = {}) {
  const problems = [];
  for (const f of REQUIRED_CLOSE_FIELDS) {
    if (open && f === 'closed_at') continue;
    if (open && f === 'status') continue;
    if (!(f in front) || front[f] === undefined ||
        (front[f] === null && !['closed_at'].includes(f))) {
      problems.push(`missing required frontmatter field: ${f}`);
    }
  }
  if (front.teacher && !['claude', 'codex'].includes(front.teacher)) {
    problems.push(`teacher must be claude|codex, got: ${front.teacher}`);
  }
  if (front.mode && !['solo', 'paired'].includes(front.mode)) {
    problems.push(`mode must be solo|paired, got: ${front.mode}`);
  }
  if (front.phase_minutes) {
    for (const ph of PHASES) {
      if (typeof front.phase_minutes[ph] !== 'number') {
        problems.push(`phase_minutes.${ph} must be a number`);
      }
    }
  }
  if (Array.isArray(front.exercises)) {
    for (const ex of front.exercises) {
      if (!ex.id) problems.push('exercise entry missing id');
      if (!/^H[0-5]$/.test(String(ex.highest_hint))) {
        problems.push(`exercise ${ex.id ?? '?'}: highest_hint must be H0..H5`);
      }
    }
  }
  if (front.live_spend) {
    for (const k of ['estimated_usd', 'actual_usd']) {
      if (typeof front.live_spend[k] !== 'number') {
        problems.push(`live_spend.${k} must be a number (0 allowed)`);
      }
    }
  }
  // Provenance events must carry COMPLETE, affirmative metadata (plan §8.5:
  // agent, files/lines, reason, consent, interview-claim impact) — hardened
  // per Codex review 2026-07-25, finding S1.
  if (Array.isArray(front.provenance_events)) {
    front.provenance_events.forEach((ev, i) => {
      const tag = `provenance event #${i + 1}`;
      if (!['claude', 'codex'].includes(ev.agent)) {
        problems.push(`${tag}: agent must be claude|codex (got: ${ev.agent ?? 'missing'})`);
      }
      if (!Array.isArray(ev.files) || ev.files.length === 0
          || !ev.files.every((f) => typeof f === 'string' && f.trim().length)) {
        problems.push(`${tag}: files must be a non-empty array of file paths`);
      }
      const lines = ev.lines;
      if (!((typeof lines === 'number' && lines > 0)
          || (typeof lines === 'string' && lines.trim().length))) {
        problems.push(`${tag}: lines is required (a count or range, e.g. 3 or "L10-L12 replaced")`);
      }
      if (typeof ev.reason !== 'string' || !ev.reason.trim()) {
        problems.push(`${tag}: reason must be a non-empty string`);
      }
      if (!CONSENT_VALUES.includes(ev.consent)) {
        problems.push(`${tag}: consent must be exactly one of ${CONSENT_VALUES.join(' | ')} (got: ${JSON.stringify(ev.consent ?? null)}); free-text detail goes in consent_note`);
      }
      if (typeof ev.interview_claim_impact !== 'string' || !ev.interview_claim_impact.trim()) {
        problems.push(`${tag}: interview_claim_impact must be a non-empty string`);
      }
    });
  }
  // Durable-promotion rule (plan §8.6, verification V27): delayed,
  // different-context evidence is required before durable.
  if (Array.isArray(front.ledger_changes)) {
    for (const ch of front.ledger_changes) {
      if (ch.to === 'durable') {
        const dates = Array.isArray(ch.evidence_dates) ? ch.evidence_dates : [];
        const ctxs = Array.isArray(ch.contexts) ? ch.contexts : [];
        const classes = Array.isArray(ch.classes) ? ch.classes : [];
        const daysApart = dates.length >= 2
          ? Math.abs(new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000
          : 0;
        if (dates.length < 2 || daysApart < 3) {
          problems.push(`durable promotion refused for ${ch.competency}: needs >=2 evidence dates >=3 days apart`);
        }
        if (new Set(ctxs).size < 2) {
          problems.push(`durable promotion refused for ${ch.competency}: needs >=2 different contexts`);
        }
        if (!classes.some((c) => ['build', 'debug', 'review'].includes(c))) {
          problems.push(`durable promotion refused for ${ch.competency}: needs >=1 independent build/debug/review`);
        }
        if (!classes.includes('timed-explain-back')) {
          problems.push(`durable promotion refused for ${ch.competency}: needs a timed explain-back`);
        }
      }
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Learner-file manifest (provenance enforcement, plan §8.5, V18)
// ---------------------------------------------------------------------------

function expandOwnershipPattern(root, pattern) {
  // Supports plain dir prefixes ("packages/") and single-star segments
  // ("labs/*/*/workspace/").
  const segs = pattern.replace(/\/$/, '').split('/');
  let dirs = [root];
  for (const seg of segs) {
    const next = [];
    for (const d of dirs) {
      if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) continue;
      if (seg === '*') {
        for (const e of fs.readdirSync(d)) {
          const p = path.join(d, e);
          if (fs.statSync(p).isDirectory()) next.push(p);
        }
      } else {
        next.push(path.join(d, seg));
      }
    }
    dirs = next;
  }
  return dirs.filter((d) => fs.existsSync(d) && fs.statSync(d).isDirectory());
}

function walkFiles(dir, out) {
  for (const e of fs.readdirSync(dir)) {
    if (e === 'node_modules' || e === '.git') continue;
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
}

export function learnerManifest(root) {
  const ownershipFile = P.ownership(root);
  const ownership = fs.existsSync(ownershipFile)
    ? readJson(ownershipFile)
    : { learner_paths: [] };
  const files = [];
  for (const pattern of ownership.learner_paths ?? []) {
    for (const dir of expandOwnershipPattern(root, pattern)) {
      walkFiles(dir, files);
    }
  }
  const entries = files
    .map((f) => ({
      path: path.relative(root, f),
      sha256: sha256(fs.readFileSync(f)),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return entries;
}

export function manifestDiff(before, after) {
  const b = new Map(before.map((e) => [e.path, e.sha256]));
  const a = new Map(after.map((e) => [e.path, e.sha256]));
  const changed = [];
  for (const [p, h] of a) {
    if (!b.has(p)) changed.push({ path: p, kind: 'added' });
    else if (b.get(p) !== h) changed.push({ path: p, kind: 'modified' });
  }
  for (const [p] of b) {
    if (!a.has(p)) changed.push({ path: p, kind: 'removed' });
  }
  return changed.sort((x, y) => x.path.localeCompare(y.path));
}

export function unattributedChanges(front, changes) {
  const learnerAttr = new Set(front.learner_changes ?? []);
  const tutorFiles = new Set();
  for (const ev of front.provenance_events ?? []) {
    for (const f of ev.files ?? []) tutorFiles.add(f);
  }
  return changes.filter(
    (c) => !learnerAttr.has(c.path) && !tutorFiles.has(c.path),
  );
}

// ---------------------------------------------------------------------------
// Journals & generated views (plan §9.1). Views are deterministic and
// byte-stable: stable ordering, no generation timestamps.
// ---------------------------------------------------------------------------

export function loadJournals(root) {
  const dir = P.journalDir(root);
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
  const all = [];
  for (const f of files) {
    try {
      const { front } = readJournal(f);
      all.push({ file: f, front });
    } catch (e) {
      all.push({ file: f, front: null, error: String(e) });
    }
  }
  all.sort((x, y) => {
    const cx = `${x.front?.closed_at ?? ''}|${x.front?.uuid ?? path.basename(x.file)}`;
    const cy = `${y.front?.closed_at ?? ''}|${y.front?.uuid ?? path.basename(y.file)}`;
    return cx.localeCompare(cy);
  });
  return all;
}

export function closedJournals(root) {
  return loadJournals(root).filter((j) => j.front?.status === 'closed');
}

export function generateViews(root) {
  const competencies = readJson(P.competencies(root)).areas;
  const closed = closedJournals(root);
  const allJournals = loadJournals(root).filter((j) => j.front);

  // --- COMPETENCY_LEDGER.md ---
  const rows = new Map();
  for (const c of competencies) {
    rows.set(c.id, {
      state: 'unseen', explain: '—', build: '—', judgment: '—',
      hint: '—', contribution: '—', misconception: '—', last: '—', due: '—',
    });
  }
  for (const j of closed) {
    for (const ch of j.front.ledger_changes ?? []) {
      const row = rows.get(ch.competency);
      if (!row) continue;
      row.state = ch.to ?? row.state;
      row.last = j.front.uuid;
      if (ch.next_due) row.due = ch.next_due;
      if (ch.explain_evidence) row.explain = ch.explain_evidence;
      if (ch.build_evidence) row.build = ch.build_evidence;
      if (ch.judgment_evidence) row.judgment = ch.judgment_evidence;
      if (ch.highest_hint) row.hint = ch.highest_hint;
      if (ch.agent_contribution) row.contribution = ch.agent_contribution;
      if (ch.misconception) row.misconception = ch.misconception;
    }
  }
  const ledgerLines = [
    '# Competency ledger',
    '',
    'Generated view — do not edit by hand. Canonical truth is the set of',
    'closed journal files in `learning/journal/`. Regenerate: `npm run learn:regen`.',
    'States: unseen → introduced → developing → usable → durable (plan §8.6).',
    '',
    '| competency | state | explain evidence | build/debug evidence | judgment evidence | highest hint | agent contribution | recurring misconception | last evidence | next due |',
    '|---|---|---|---|---|---|---|---|---|---|',
  ];
  for (const c of competencies) {
    const r = rows.get(c.id);
    ledgerLines.push(
      `| ${c.id} | ${r.state} | ${r.explain} | ${r.build} | ${r.judgment} | ${r.hint} | ${r.contribution} | ${r.misconception} | ${r.last} | ${r.due} |`,
    );
  }
  const ledgerText = ledgerLines.join('\n') + '\n';

  // --- LEARNING_STATE.md (≤40 lines) ---
  const state = readJson(P.stateFile(root));
  const lastClosed = closed.length ? closed[closed.length - 1].front : null;
  const dueRows = [...rows.entries()]
    .filter(([, r]) => r.due !== '—')
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .slice(0, 3);
  let remediationOpen = 0;
  if (fs.existsSync(P.remediation(root))) {
    remediationOpen = (readJson(P.remediation(root)).items ?? []).filter(
      (i) => i.status === 'open',
    ).length;
  }
  const curriculum = readJson(P.curriculum(root));
  const ms = curriculum.milestones.find((m) => m.id === state.current_milestone);
  const stateLines = [
    '# Learning state',
    '',
    'Generated view — do not edit by hand. Regenerate: `npm run learn:regen`.',
    `For the live next action run \`npm run learn:next\`.`,
    '',
    `- plan_version: ${state.plan_version}`,
    `- current_milestone: ${state.current_milestone} — ${ms ? ms.title : 'unknown'}`,
    `- selected_port: ${state.selected_port ?? 'not yet chosen (M0 diagnostic output)'}`,
    `- pace_variant: ${state.pace_variant ?? 'not yet calibrated (M0)'}`,
    `- live_cost_cap_usd: ${state.live_cost_cap_usd ?? 'not yet approved (M0/M1)'}`,
    `- sessions_closed: ${closed.length}`,
    `- last_closed_session: ${lastClosed ? `${lastClosed.uuid} (${lastClosed.teacher}, ${lastClosed.closed_at})` : 'none'}`,
    `- open_remediation_items: ${remediationOpen}`,
    `- next_reviews_scheduled: ${dueRows.length ? dueRows.map(([id, r]) => `${id} (${r.due})`).join('; ') : 'none'}`,
    `- milestone_modules: ${ms ? ms.modules.join(', ') : '—'}`,
    `- milestone_gates: ${ms ? ms.gates.join(', ') : '—'}`,
  ];
  const stateText = stateLines.join('\n') + '\n';

  // --- PROVENANCE.md ---
  const provLines = [
    '# Provenance log',
    '',
    'Generated view — do not edit by hand. Every tutor edit to learner-owned',
    'files (including consented ≤3-line mechanical unblocks) appears here with',
    'agent, files, reason, consent, and interview-claim impact (plan §8.5).',
    'Stage 0–2 scaffolding provenance is recorded in learning/DECISIONS.md.',
    '',
    '| session | agent | files | lines | reason | consent | interview-claim impact |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const j of allJournals) {
    for (const ev of j.front.provenance_events ?? []) {
      provLines.push(
        `| ${j.front.uuid} | ${ev.agent} | ${(ev.files ?? []).join(', ')} | ${ev.lines ?? '—'} | ${ev.reason} | ${ev.consent} | ${ev.interview_claim_impact ?? '—'} |`,
      );
    }
  }
  const provText = provLines.join('\n') + '\n';

  return { ledgerText, stateText, provText };
}

export function writeViews(root) {
  const { ledgerText, stateText, provText } = generateViews(root);
  fs.writeFileSync(P.ledgerView(root), ledgerText);
  fs.writeFileSync(P.stateView(root), stateText);
  fs.writeFileSync(P.provView(root), provText);
}

// ---------------------------------------------------------------------------
// Serialized lock removal (Codex re-review 2026-07-25, hardening item 1).
// EVERY removal of learning/active-session.json goes through an exclusive
// cleanup mutex and re-verifies the lock's UUID under that mutex before
// unlinking. Because removal is the only path that frees the slot for a new
// exclusive create, a fresh replacement lock can never appear between the
// re-read and the unlink — so no process can ever delete a lock it did not
// verify. A mutex older than 30s is treated as abandoned (crashed clearer).
// ---------------------------------------------------------------------------

const CLEANUP_MUTEX_MAX_AGE_MS = 30000;

// A lock with no draft and no journal is only a true orphan once it is older
// than the acquisition window: every legitimate learn:start passes through
// exactly that state for milliseconds between reserving the lock and writing
// the draft (Codex re-review 2 2026-07-25). Age is measured from the lock
// FILE's mtime (real filesystem time — deliberately unaffected by
// LEARN_FIXED_TIME; fixtures backdate it with utimes).
export const ORPHAN_LOCK_MIN_AGE_MS = 30000;

export function lockAgeMs(root) {
  return Date.now() - fs.statSync(P.lockFile(root)).mtimeMs;
}

export function pauseMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function removeLockSerialized(root, expectedUuid, { attempts = 100 } = {}) {
  const lockFile = P.lockFile(root);
  const mutex = `${lockFile}.cleanup`;
  for (let i = 0; i < attempts; i++) {
    try {
      if (Date.now() - fs.statSync(mutex).mtimeMs > CLEANUP_MUTEX_MAX_AGE_MS) {
        fs.unlinkSync(mutex);
      }
    } catch { /* mutex absent — fine */ }
    try {
      fs.writeFileSync(mutex, String(process.pid), { flag: 'wx' });
    } catch (e) {
      if (e.code === 'EEXIST') { pauseMs(10); continue; }
      throw e;
    }
    try {
      let current = null;
      try { current = readJson(lockFile); } catch { /* absent or mid-write */ }
      if (!current) return { removed: false, reason: 'absent' };
      if (current.uuid !== expectedUuid) return { removed: false, reason: 'replaced' };
      fs.unlinkSync(lockFile);
      return { removed: true, reason: 'removed' };
    } finally {
      try { fs.unlinkSync(mutex); } catch { /* best-effort */ }
    }
  }
  return { removed: false, reason: 'busy' };
}

// Pointer repair: state.json.last_closed_session ← newest closed journal.
// Also clears a stale lock whose UUID already has a closed/aborted journal.
export function repairPointerAndLock(root) {
  const closed = closedJournals(root);
  const state = readJson(P.stateFile(root));
  const newest = closed.length ? closed[closed.length - 1].front.uuid : null;
  let changed = false;
  if (newest && state.last_closed_session !== newest) {
    state.last_closed_session = newest;
    changed = true;
  }
  if (changed) writeJson(P.stateFile(root), state);

  const lockFile = P.lockFile(root);
  let lockCleared = false;
  if (fs.existsSync(lockFile)) {
    let lock = null;
    try { lock = readJson(lockFile); } catch { /* mid-write; leave it */ }
    if (lock) {
      const journalFile = path.join(P.journalDir(root), `${lock.uuid}.md`);
      const draftFile = path.join(P.inProgressDir(root), `${lock.uuid}.md`);
      if (fs.existsSync(journalFile) && !fs.existsSync(draftFile)) {
        lockCleared = removeLockSerialized(root, lock.uuid).removed;
      }
    }
  }
  return { pointerRepaired: changed, lockCleared };
}

// ---------------------------------------------------------------------------
// learn:next resolution (plan §9.4, V12):
// 1 interrupted/open session → 2 mandatory remediation → 3 due durable/usable
// check → 4 current milestone gate or next dependency-ordered module.
// ---------------------------------------------------------------------------

export function nextAction(root) {
  const lockFile = P.lockFile(root);
  if (fs.existsSync(lockFile)) {
    const lock = readJson(lockFile);
    const draft = path.join(P.inProgressDir(root), `${lock.uuid}.md`);
    if (fs.existsSync(draft)) {
      return {
        class: 'resume',
        text: `Resume open session ${lock.uuid} (teacher ${lock.teacher}); run: npm run learn:resume`,
      };
    }
  }
  if (fs.existsSync(P.remediation(root))) {
    const items = (readJson(P.remediation(root)).items ?? []).filter(
      (i) => i.status === 'open',
    );
    if (items.length) {
      const it = items[0];
      return {
        class: 'remediation',
        text: `Mandatory remediation: ${it.id} — ${it.competency}: ${it.description}`,
      };
    }
  }
  // due reviews from ledger state (closed journals)
  const competencies = readJson(P.competencies(root)).areas.map((a) => a.id);
  const due = [];
  const latest = new Map();
  for (const j of closedJournals(root)) {
    for (const ch of j.front.ledger_changes ?? []) {
      if (competencies.includes(ch.competency)) {
        latest.set(ch.competency, ch.next_due ?? null);
      }
    }
  }
  const today = nowIso().slice(0, 10);
  for (const [comp, d] of latest) {
    if (d && d <= today) due.push({ comp, d });
  }
  due.sort((a, b) => a.d.localeCompare(b.d) || a.comp.localeCompare(b.comp));
  if (due.length) {
    return {
      class: 'due-review',
      text: `Due retrieval/durable check: ${due[0].comp} (due ${due[0].d})`,
    };
  }
  const state = readJson(P.stateFile(root));
  const curriculum = readJson(P.curriculum(root));
  const ms = curriculum.milestones.find((m) => m.id === state.current_milestone);
  if (!ms) return { class: 'milestone', text: 'No milestone found; check learning/state.json' };
  const done = new Set(
    closedJournals(root).map((j) => j.front.module).filter(Boolean),
  );
  const nextModule = ms.modules.find((m) => !done.has(m));
  if (nextModule) {
    return {
      class: 'milestone',
      text: `Next module in ${ms.id} (${ms.title}): ${nextModule}`,
    };
  }
  return {
    class: 'milestone',
    text: `All ${ms.id} modules closed — run the milestone gate(s): ${ms.gates.join(', ')}`,
  };
}

// ---------------------------------------------------------------------------
// SOURCE_LEDGER parsing (plan §14, V10a)
// ---------------------------------------------------------------------------

export function parseSourceLedger(root) {
  const text = fs.readFileSync(P.sourceLedger(root), 'utf8');
  const lines = text.split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    if (cells[0] === 'claim' || /^[-\s:]*$/.test(cells[0])) continue;
    rows.push({
      claim: cells[0], truth: cells[1], url: cells[2],
      asOf: cells[3], verified: cells[4], trigger: cells[5],
    });
  }
  return rows;
}

export function staleLedgerRows(root, maxAgeDays = 30) {
  const rows = parseSourceLedger(root);
  const now = new Date(nowIso());
  return rows.filter((r) => {
    const d = new Date(r.asOf);
    if (Number.isNaN(d.getTime())) return true;
    return (now - d) / 86400000 > maxAgeDays;
  });
}

// ---------------------------------------------------------------------------
// Withheld-path isolation scan (plan §5.4/§8.5, V7 + learn:check invariant)
// ---------------------------------------------------------------------------

export function withheldReferences(root) {
  const targets = [
    'labs', 'scenarios', 'prompts', 'START_HERE.md',
    path.join('.claude', 'skills'), path.join('.agents', 'skills'),
  ];
  const hits = [];
  const needle = '.tutor/withheld';
  for (const t of targets) {
    const p = path.join(root, t);
    if (!fs.existsSync(p)) continue;
    const files = [];
    if (fs.statSync(p).isDirectory()) walkFiles(p, files);
    else files.push(p);
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes(needle)) hits.push(path.relative(root, f));
    }
  }
  return hits.sort();
}

// Host-gate blocking map (V1): which gates depend on which host CLI.
export const HOST_GATE_DEPENDENCIES = {
  'claude CLI': ['V11 (claude host run)', 'V20 (Claude Code usage)', 'V30 (claude handoff)', 'V31 (claude install)'],
  'codex CLI': ['V11 (codex host run)', 'V20 (Codex usage)', 'V30 (codex handoff)', 'V31 (codex install)'],
  'Go': ['V32 (if selectedPort=go)'],
  '.NET': ['V32 (if selectedPort=csharp)'],
};

export function blockedGates(root) {
  const reportFile = P.prereqReport(root);
  if (!fs.existsSync(reportFile)) return { missing: [], lines: ['prereq report not found — run: npm run prereq'] };
  const report = readJson(reportFile);
  const lines = [];
  const missing = [];
  for (const entry of report.entries ?? []) {
    if (!entry.present && HOST_GATE_DEPENDENCIES[entry.id]) {
      missing.push(entry.id);
      for (const g of HOST_GATE_DEPENDENCIES[entry.id]) {
        lines.push(`BLOCKED(prereq:${entry.id}) — ${g}`);
      }
    }
  }
  return { missing, lines };
}
