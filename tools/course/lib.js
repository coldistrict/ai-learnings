// Tutor-owned, offline structural checks. Never import session transaction code.
import fs from 'node:fs';
import path from 'node:path';

const nonempty = s => typeof s === 'string' && s.trim().length > 0;
const unique = xs => new Set(xs).size === xs.length;
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const withoutFences = s => s.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
const slug = s => s.replace(/<[^>]*>/g, '').toLowerCase()
  .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/\s/g, '-');

export function anchors(markdown) {
  const used = new Set();
  const result = new Set();
  const text = withoutFences(markdown);
  for (const m of text.matchAll(/^ {0,3}#{1,6}\s+(.+?)\s*#*$/gm)) {
    const base = slug(m[1]);
    let id = base, n = 0;
    while (used.has(id)) id = `${base}-${++n}`;
    used.add(id); result.add(id);
  }
  for (const m of text.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) result.add(m[1]);
  return result;
}

// Maintained Markdown uses inline links, reference links and explicit HTML hrefs.
// Parse balanced parentheses so paths/anchors containing parentheses work too.
export function links(markdown) {
  const text = withoutFences(markdown).replace(/`+[^`\n]*`+/g, '');
  const found = [];
  const definitions = new Map();
  for (const m of text.matchAll(/^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?/gm)) {
    definitions.set(m[1].toLowerCase(), m[2]); found.push(m[2]);
  }
  for (const m of text.matchAll(/\[[^\]\n]*\]\(/g)) {
    let pos = m.index + m[0].length, end = pos, depth = 1;
    if (text[pos] === '<') {
      end = text.indexOf('>', pos);
      if (end !== -1) found.push(text.slice(pos + 1, end));
      continue;
    }
    for (; end < text.length && depth; end++) {
      if (text[end] === '\\') { end++; continue; }
      if (text[end] === '(') depth++;
      if (text[end] === ')') depth--;
    }
    if (!depth) found.push(text.slice(pos, end - 1).trim().replace(/\s+["'][\s\S]*$/, ''));
  }
  for (const m of text.matchAll(/\[([^\]\n]+)\](?:\[([^\]\n]*)\])?/g)) {
    if (/^[:(]/.test(text.slice(m.index + m[0].length))) continue;
    const key = (m[2] || m[1]).toLowerCase();
    if (definitions.has(key)) found.push(definitions.get(key));
    else if (m[2] !== undefined) found.push(`UNRESOLVED-REFERENCE:${key}`);
  }
  for (const m of text.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) found.push(m[1]);
  return found;
}

export function gateReference(map, milestone, gate) {
  const stages = map.gates[gate]?.stages;
  const qualifier = stages?.[milestone] ?? stages?.['*'];
  return qualifier === undefined ? null : gate + (qualifier ? `(${qualifier})` : '');
}

export function requiredLaterTable(map) {
  const rows = map.pilot.tiers.required_later.map(id => {
    const t = map.topics.find(t => t.id === id);
    return `| ${id} | ${t.destinations.map(d => `${d.milestone} / ${gateReference(map, d.milestone, d.gate)}`).join('; ')} |`;
  });
  return ['| Topic | Required destination |', '|---|---|', ...rows].join('\n');
}

export function maintainedSurface(root) {
  const named = ['README.md', 'START_HERE.md', 'course', 'prompts',
    'labs/m1-model-contracts', 'docs/SESSION_STATE.md', 'docs/RELOCATION.md',
    'docs/verification/RESULTS.md', 'tools/course/README.md'];
  return named.flatMap(p => {
    const full = path.join(root, p);
    if (!fs.existsSync(full)) return [p];
    return (fs.statSync(full).isDirectory() ? walk(full) : [full])
      .filter(f => f.endsWith('.md') && !/\/(workspace|fixtures|tests)\//.test(f))
      .map(f => path.relative(root, f));
  });
}

export function checkCourse(root) {
  const errors = [], stats = { links: 0, sources: 0, topics: 0, chaptersPending: 0 };
  const need = (condition, message) => { if (!condition) errors.push(message); };
  const read = p => fs.readFileSync(path.join(root, p), 'utf8');
  const json = p => JSON.parse(read(p));
  const anchorCache = new Map();
  function localLink(from, ref) {
    need(nonempty(ref), `${from}: empty local reference`);
    if (!nonempty(ref)) return;
    if (/^UNRESOLVED-REFERENCE:/.test(ref)) { errors.push(`${from}: ${ref}`); return; }
    if (/^(https?:|mailto:|app:|codex:|data:|\/\/)/i.test(ref)) return;
    stats.links++;
    let decoded;
    try { decoded = decodeURIComponent(ref); } catch { errors.push(`${from}: invalid URL encoding ${ref}`); return; }
    const [filePart, fragment] = decoded.split('#');
    const file = path.resolve(root, path.dirname(from), filePart.split('?')[0] || path.basename(from));
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) || /(^|\/)\.tutor(\/|$)/.test(relative)) {
      errors.push(`${from}: reference outside maintained repository or to withheld area: ${ref}`); return;
    }
    if (!fs.existsSync(file)) { errors.push(`${from}: missing local target ${ref}`); return; }
    if (fragment && file.endsWith('.md')) {
      if (!anchorCache.has(file)) anchorCache.set(file, anchors(fs.readFileSync(file, 'utf8')));
      need(anchorCache.get(file).has(fragment), `${from}: missing local section ${ref}`);
    }
  }
  function rootRef(ref, context) { localLink('course-map-root.md', ref); need(nonempty(context), 'missing reference context'); }
  try {
    const c = json('learning/curriculum.json');
    need(Array.isArray(c.milestones) && c.milestones.length === 10, 'curriculum: ten milestones required');
    const ms = c.milestones;
    need(unique(ms.map(m => m.id)), 'curriculum: duplicate milestone ID');
    need(unique(ms.map(m => m.study_guide)), 'curriculum: one distinct study_guide per milestone');
    const date = c.content_revision;
    need(/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') &&
      Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date,
    'curriculum: content_revision must be a real YYYY-MM-DD date (not a freshness claim)');
    need(c.course_map === 'learning/course-map.json', 'curriculum: course_map must reference learning/course-map.json');
    const map = json('learning/course-map.json');
    need(map.schema === 1, 'course map: unsupported schema');
    need(map.coverage_status === 'classified-sequencing-pending', 'course map: scope classification is not completed sequencing');
    rootRef(map.decision, 'scope decision');
    const milestoneIDs = new Set(ms.map(m => m.id));
    const moduleIDs = ms.flatMap(m => m.modules);
    need(unique(moduleIDs), 'curriculum: duplicate module ID');
    let low = 0, high = 0;
    for (const m of ms) {
      need(/^M\d+$/.test(m.id), `curriculum: invalid milestone ID ${m.id}`);
      need(nonempty(m.title), `${m.id}: title required`);
      need(Array.isArray(m.modules) && m.modules.every(nonempty), `${m.id}: modules must be an array of IDs (empty is allowed)`);
      need(Array.isArray(m.gates) && m.gates.length && unique(m.gates), `${m.id}: nonempty unique gates required`);
      need(Array.isArray(m.lesson_focus) && m.lesson_focus.length && m.lesson_focus.every(nonempty), `${m.id}: nonempty lesson_focus required`);
      const hours = m.hours?.match(/^(\d+)–(\d+)$/);
      need(hours && +hours[1] > 0 && +hours[2] >= +hours[1], `${m.id}: invalid hour range`);
      if (hours) { low += +hours[1]; high += +hours[2]; }
      need(nonempty(m.study_guide) && /^course\/.+\.md$/.test(m.study_guide), `${m.id}: study_guide required`);
      rootRef(m.study_guide, m.id);
      for (const ref of m.gates) {
        const id = ref.match(/^(V\d+[ab]?)/)?.[1];
        need(gateReference(map, m.id, id) === ref, `${m.id}: unknown or incorrectly staged gate ${ref}`);
      }
    }
    const total = `${low}–${high}`;
    need(c.core_hours === total, `curriculum: core_hours ${c.core_hours} differs from milestone sum ${total}`);
    stats.hours = total;
    for (const p of ['README.md', 'course/README.md', 'course/SCOPE.md']) {
      const text = read(p).replace(/\*\*/g, '');
      const totals = [...text.matchAll(/(\d+[–-]\d+)\s+(?:focused[- ])?hours?\b/g)].map(m => m[1]);
      need(totals.length > 0, `${p}: current total missing`);
      for (const value of totals) need(value === total, `${p}: incorrect total ${value}; expected ${total}`);
    }
    const nav = read('course/README.md');
    const rows = nav.split('\n').filter(s => /^\| M\d+ \|/.test(s));
    need(rows.length === ms.length, 'course navigation: milestone rows missing or duplicated');
    for (const m of ms) {
      const matching = rows.filter(s => s.startsWith(`| ${m.id} |`));
      need(matching.length === 1, `course navigation: ${m.id} must occur once`);
      if (matching[0]) {
        need(matching[0].split('|').at(-2).trim() === m.hours, `course navigation: ${m.id} hour range differs`);
        need(links(matching[0]).some(ref => path.posix.normalize('course/' + ref) === m.study_guide), `course navigation: ${m.id} study_guide differs`);
      }
    }
    for (const [gate, definition] of Object.entries(map.gates)) {
      need(/^V(?:[1-9]|10[ab]|[12]\d|3[0-6])$/.test(gate) && gate !== 'V10', `course map: unknown gate ${gate}`);
      need(nonempty(definition.authority), `${gate}: authority required`);
      need(Object.keys(definition.stages).length > 0, `${gate}: destination stages required`);
      for (const [stage, qualifier] of Object.entries(definition.stages)) {
        need(stage === '*' || milestoneIDs.has(stage), `${gate}: unknown destination milestone ${stage}`);
        need(typeof qualifier === 'string' && /^(?:|>=\d+|\d+\/\d+)$/.test(qualifier), `${gate}: invalid stage qualifier`);
      }
      if (definition.amendment) rootRef(definition.amendment, gate);
    }
    // These numbers are the original gate's invariant, not a new mastery threshold.
    need(map.gates.V22?.stages.M6 === '>=8' && map.gates.V22?.stages.M8 === '12/12', 'V22: preserve original M6 >=8 and M8 12/12 distinction');
    for (const id of ['V20', 'V34']) need(nonempty(map.gates[id]?.amendment), `${id}: local execution amendment required`);
    for (const id of moduleIDs) {
      need(nonempty(map.module_materials[id]), `${id}: missing module material mapping`);
      if (map.module_materials[id]) rootRef(map.module_materials[id], id);
    }
    for (const id of Object.keys(map.module_materials)) need(moduleIDs.includes(id), `unknown module material mapping ${id}`);
    const areas = json('learning/competencies.json').areas;
    need(areas.length === 10 && unique(areas.map(a => a.id)), 'competencies: ten unique area IDs required');
    const coverage = new Map();
    for (const a of areas) {
      need(nonempty(a.depth_target) && a.subskills.length > 0 && unique(a.subskills), `${a.id}: depth and unique subskills required`);
      for (const subskill of a.subskills) coverage.set(`${a.id}/${subskill}`, []);
    }
    const ledger = read('learning/SOURCE_LEDGER.md');
    const sources = ledger.split('\n').filter(s => /^\| [^|-]/.test(s)).map(s => s.split('|')[1].trim()).filter(s => s !== 'claim');
    need(unique(sources), 'SOURCE_LEDGER: duplicate claim name');
    function sourceNames(names, context) {
      need(Array.isArray(names) && names.every(nonempty), `${context}: source names must be nonempty strings`);
      for (const name of names) { stats.sources++; need(sources.includes(name), `${context}: unknown source name ${name}`); }
    }
    const topicIDs = new Set(map.topics.map(t => t.id));
    need(topicIDs.size === map.topics.length, 'course map: duplicate topic ID');
    for (const t of map.topics) {
      need(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.id), `course map: invalid topic ID ${t.id}`);
      need(['required', 'optional'].includes(t.requirement), `${t.id}: invalid requirement`);
      need(['original', 'clarification', 'added-required', 'optional'].includes(t.basis), `${t.id}: invalid scope basis`);
      need((t.basis === 'optional') === (t.requirement === 'optional'), `${t.id}: scope basis/requirement mismatch`);
      need(nonempty(t.scope_note) && nonempty(t.authority), `${t.id}: scope rationale/authority required`);
      need(areas.some(a => a.id === t.competency), `${t.id}: unknown competency mapping ${t.competency}`);
      need(Array.isArray(t.subskills) && unique(t.subskills), `${t.id}: subskills must be unique`);
      for (const s of t.subskills) {
        const key = `${t.competency}/${s}`;
        need(coverage.has(key), `${t.id}: unknown subskill mapping ${key}`);
        coverage.get(key)?.push(t.id);
        // ADR-0011 preserves these controls even when an optional technique uses them.
        if (t.competency === 'security-governance' || /approval|consent|auth|recovery|reservation|cost controls|revocation/i.test(s)) {
          need(t.requirement === 'required', `${t.id}: security/authorization/recovery/spending coverage cannot be optional`);
        }
      }
      rootRef(t.reference, t.id);
      need(t.reference.includes('#'), `${t.id}: teaching section required`);
      need(Array.isArray(t.destinations), `${t.id}: destinations required`);
      need(t.requirement === 'required' ? t.destinations.length > 0 : t.destinations.length === 0,
        `${t.id}: required topics need destinations; optional topics cannot gate mastery`);
      for (const d of t.destinations) {
        need(milestoneIDs.has(d.milestone), `${t.id}: unknown destination milestone ${d.milestone}`);
        need(gateReference(map, d.milestone, d.gate) !== null, `${t.id}: unknown gate/destination mapping ${d.milestone}/${d.gate}`);
      }
      if (t.sources) sourceNames(t.sources, t.id);
    }
    for (const [key, mapped] of coverage) need(mapped.length === 1, `coverage: ${key} must map exactly once (found ${mapped.length})`);
    need(map.chapters.length === ms.length && unique(map.chapters.map(c => c.milestone)), 'chapters: unique migration entry per milestone required');
    const tierKeys = ['understand_now', 'required_later', 'optional_exploration'];
    function tiers(tiers, context) {
      need(tiers && Object.keys(tiers).sort().join() === [...tierKeys].sort().join(), `${context}: exactly three structured tiers required`);
      const assigned = tierKeys.flatMap(k => tiers[k]);
      need(unique(assigned), `${context}: duplicate topic across tiers`);
      for (const key of tierKeys) {
        need(Array.isArray(tiers[key]) && tiers[key].length > 0, `${context}: nonempty ${key} required`);
        for (const id of tiers[key]) {
          const t = map.topics.find(t => t.id === id);
          need(!!t, `${context}: broken tier mapping ${id}`);
          if (t) need(t.requirement === (key === 'optional_exploration' ? 'optional' : 'required'), `${context}: ${id} in incorrect tier ${key}`);
        }
      }
    }
    for (const chapter of map.chapters) {
      need(milestoneIDs.has(chapter.milestone), `chapters: unknown milestone ${chapter.milestone}`);
      need(['pending', 'restructured'].includes(chapter.status), `${chapter.milestone}: invalid migration status`);
      if (chapter.status === 'pending') {
        stats.chaptersPending++;
        need(nonempty(chapter.reason) && !chapter.tiers, `${chapter.milestone}: pending chapter needs reason, not fake tiers`);
      } else {
        tiers(chapter.tiers, chapter.milestone);
        need(map.pilot.status === 'observed', `${chapter.milestone}: restructuring requires actual pilot evidence first`);
        rootRef(chapter.evidence, chapter.milestone);
      }
    }
    const p = map.pilot;
    need(ms.find(m => m.id === p.milestone)?.modules.includes(p.module), 'pilot: unknown module/milestone mapping');
    need(['prepared-not-run', 'observed'].includes(p.status), 'pilot: invalid status');
    if (p.status === 'observed') rootRef(p.evidence, 'pilot evidence');
    else need(!p.evidence, 'pilot: prepared materials cannot claim execution evidence');
    tiers(p.tiers, 'pilot'); rootRef(p.reference, 'pilot');
    const pilotText = read(p.reference);
    const table = pilotText.match(/<!-- pilot-required-later:start -->\n([\s\S]*?)\n<!-- pilot-required-later:end -->/)?.[1];
    need(table === requiredLaterTable(map), 'pilot: required-later destination table differs from canonical map');
    for (const p of maintainedSurface(root)) {
      const markdown = read(p);
      for (const ref of links(markdown)) localLink(p, ref);
      for (const m of withoutFences(markdown).matchAll(/^sources:\s*([^\n]*(?:\n(?!\s*\n)[^\n]+)*)/gm)) {
        sourceNames(m[1].replace(/\s+/g, ' ').replace(/\.\s*$/, '').split(';').map(s => s.trim()), p);
      }
    }
    stats.topics = map.topics.length;
    stats.subskills = coverage.size;
  } catch (error) { errors.push(`course structure unreadable: ${error.message}`); }
  return { errors, stats };
}
