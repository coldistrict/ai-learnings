// Deterministic NimbusPay world generator (plan §5.4, verification V8).
//   node world/generate.js [--seed <s>] [--out <dir>]
// Same seed → byte-identical output. No wall-clock timestamps ever enter the
// output; in-world dates are fixed constants. All data is synthetic.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml } from '../tools/learn/lib.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

// ---- seeded PRNG (fnv1a hash → mulberry32) ---------------------------------
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const spec = parseYaml(fs.readFileSync(path.join(HERE, 'spec.yaml'), 'utf8'));
const seed = arg('seed', spec.default_seed);
const outDir = path.resolve(arg('out', path.join(HERE, 'generated')));
const rng = mulberry32(fnv1a(seed));
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const int = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

// ---- spec validation --------------------------------------------------------
const services = spec.services ?? [];
const ids = new Set(services.map((s) => s.id));
const problems = [];
if (services.length < 8 || services.length > 12) {
  problems.push(`service count ${services.length} outside [8,12]`);
}
for (const s of services) {
  if (!s.owner) problems.push(`service ${s.id}: missing owner`);
  if (!Array.isArray(s.depends_on)) problems.push(`service ${s.id}: missing depends_on entries`);
  for (const d of s.depends_on ?? []) {
    if (!ids.has(d)) problems.push(`service ${s.id}: unknown dependency ${d}`);
  }
}
if (problems.length) {
  console.error('world/spec.yaml invalid:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const team = Object.fromEntries(spec.teams.map((t) => [t.id, t]));

// ---- doc templates ----------------------------------------------------------
const docs = [];
function addDoc(id, title, body) {
  docs.push({ id, title, path: `docs/${id}.md`, body: `# ${title}\n\ndoc-id: ${id}\n\n${body.trim()}\n` });
}

const DASH_PREFIX = pick(['grafana', 'nimbus-dash', 'obsboard']);
const failureVerbs = ['degrades', 'stalls', 'backs up', 'flaps'];
const checkPhr = ['First check', 'Start with', 'Verify first'];

for (const s of services) {
  const oncall = team[s.owner].oncall;
  const dash = `${DASH_PREFIX}/${s.id}`;
  const p99 = int(180, 900);
  const errBudget = pick(['0.1%', '0.5%', '1%']);

  addDoc(`runbook-${s.id}`, `Runbook — ${s.id}`, `
Owner team: ${s.owner} · On-call: ${oncall}
Primary dashboard: ${dash} · p99 latency target: ${p99}ms · error budget: ${errBudget}/28d

## What this service does
${s.summary}

## Dependencies
${s.depends_on.length ? s.depends_on.map((d) => `- ${d}`).join('\n') : '- none (base infrastructure)'}

## Common failure modes
1. A downstream dependency ${pick(failureVerbs)} — check the dependency's own
   runbook before restarting anything here.
2. Backlog growth on inbound work: ${checkPhr[0]} queue depth and consumer lag
   on ${dash}; a rising queue with flat throughput usually means a stuck
   worker, not load.
3. Elevated error rate after a deploy: compare deploy markers on ${dash}
   against the error step-change; roll back per the deployment checklist
   (doc-deployment-and-rollback-checklist) if they align.

## Standard checks
- ${checkPhr[1]} the service health endpoint and the last 3 deploys.
- Correlate alerts with upstream/downstream services in the dependency list
  above; symptom location is often not cause location.
- Capture evidence (log lines, metric snapshots) BEFORE mitigating; attach it
  to the incident ticket.

## Escalation
Page ${oncall}. Sev1 also pages platform-oncall@nimbuspay.test.
`);

  addDoc(`arch-${s.id}`, `Architecture — ${s.id}`, `
Owner team: ${s.owner}

## Role in the platform
${s.summary}

## Interfaces
- Synchronous API consumed by: ${services.filter((o) => o.depends_on.includes(s.id)).map((o) => o.id).join(', ') || 'external clients only'}
- Depends on: ${s.depends_on.join(', ') || 'nothing (sink)'}
- Emits domain events to the event-bus topic \`${s.id.replace(/-/g, '.')}.events\`.

## Data
Stores its own state; other services integrate via API or events, never via
shared tables. Cross-service reads happen through published views.

## Operational notes
Deployed via the standard pipeline (doc-deployment-and-rollback-checklist).
Scaling unit: stateless workers behind the gateway, except stateful stores.
`);
}

// ---- global docs (authored knowledge the scenario packs lean on) ------------
addDoc('pagination-cursor-design', 'Design standard — keyset pagination and cursors', `
Applies to every paginated scan at NimbusPay (reconciliation, exports, audits).

## The standard
Use KEYSET pagination with a COMPOSITE cursor. A cursor over a non-unique
column (e.g. \`updated_at\` alone) is a correctness bug, not a style issue:
rows sharing the boundary value are silently skipped or duplicated between
pages.

Correct cursor: the tuple \`(updated_at, id)\` with a strict tuple comparison
\`(updated_at, id) > (:cursor_updated_at, :cursor_id)\`, ordered by
\`updated_at, id\`. Never \`updated_at > :cursor\` alone.

## Review checklist
- Cursor includes a unique tiebreaker column.
- Comparison is a tuple comparison, not two ANDed inequalities.
- Page size changes must not change the result set, only its chunking.
- A scan re-run over unchanged data returns identical totals (invariant to
  assert in tests).

## Known symptom of violations
Batch totals drift from source-of-truth counts by a handful of rows, worse on
days with bursts of same-timestamp updates (bulk imports, backfills).
`);

addDoc('idempotency-standards', 'Design standard — idempotency for write APIs', `
Every externally-retried write API (webhooks, queue consumers, payment
postings) MUST be idempotent.

## The standard
- Callers send an \`Idempotency-Key\` header (or event id) per logical write.
- The service persists the key with a UNIQUE constraint in the SAME
  transaction as the write; a duplicate key returns the original result with
  \`replayed: true\` and performs NO second side effect.
- Application-level "check then insert" without the unique constraint is a
  race, not idempotency.
- Schema migrations must carry idempotency constraints forward; dropping or
  renaming the keyed column/index silently disables protection while requests
  keep succeeding.

## Verification
A duplicate-delivery test (same key, two concurrent requests) belongs in every
consumer's CI. Alert on \`replayed=true\` rate dropping to zero — it usually
means the constraint stopped being exercised, not that retries stopped.
`);

addDoc('queue-operations-and-dlq', 'Operations standard — queues, retries, and DLQs', `
Applies to all event-bus consumers and worker queues.

## The standard
- Every consumer declares \`max_retries\` (default 5) and a dead-letter queue
  (DLQ). A message exceeding max_retries moves to the DLQ with the failure
  reason attached; processing continues with the next message.
- A consumer WITHOUT a DLQ turns one poison message into head-of-line
  blocking: the queue depth grows while throughput sits at zero and the same
  message id repeats in the crash logs.
- Ordered (single-concurrency) consumers are the highest-risk shape: order
  guarantees mean one bad message stops everything behind it.

## Diagnosis order
1. Is the SAME message id/offset repeating in consumer logs? → poison message.
2. Is throughput zero while queue depth rises? → blocked head, not load.
3. Only then consider scaling, which never fixes a poison message.

## Remediation
Quarantine the poison message (move to DLQ manually if needed), fix the
validation gap that let it in, add a regression case, then replay the DLQ.
`);

addDoc('deployment-and-rollback-checklist', 'Deployment and rollback checklist', `
- Deploys ride the standard pipeline with health gates; deploy markers are
  emitted to dashboards automatically.
- Rollback = redeploy previous artifact version (N−1); never hotfix-forward a
  Sev1 without an incident commander's sign-off.
- After rollback, run the service's post-deploy smoke checks and confirm the
  error step-change reverted before closing the incident.
- A deploy that coincides with an alert is a LEAD, not a verdict: confirm the
  mechanism (diff, config change, migration) before assigning cause.
`);

addDoc('incident-management-process', 'Incident management process', `
Severities: Sev1 (customer-visible money movement broken) · Sev2 (degraded
with workaround) · Sev3 (internal only). Every incident gets: a ticket, a
timeline, evidence links, a cause hypothesis with a falsifying check, and a
postmortem for Sev1/Sev2.

Investigation discipline: symptoms in one service frequently originate in a
dependency (see each runbook's dependency list). State expected vs actual,
find the first divergence in the data flow, and name the trust boundary it
sits on before proposing remediation. Draft incident updates are reviewed by
the on-call before posting — updates that assert an unconfirmed cause are the
most common postmortem regret.
`);

addDoc('glossary', 'Glossary', `
- **Entity**: any persisted domain object (merchant, payment, refund, posting).
- **Posting**: one ledger line; postings come in balanced pairs (double entry).
- **Settlement**: daily batch paying a merchant its captured funds.
- **Reconciliation scan**: paginated comparison of ledger balances vs
  settlement state; marks merchants settled or stale.
- **Stale entity**: an entity whose derived state lags its source of truth
  beyond the freshness SLO.
- **Webhook**: signed HTTP callback to a merchant endpoint, retried on failure.
- **DLQ**: dead-letter queue holding messages that exceeded max_retries.
- **Idempotency key**: caller-supplied unique key making a retried write safe.
`);

addDoc('oncall-guide', 'On-call guide', `
Rotations are weekly per team (see each runbook's owner/on-call line). The
on-call owns triage, not necessarily the fix. Standing rules:

- Reproduce or capture evidence before mitigating when customer impact allows.
- Prefer the runbook's standard checks over improvisation; note gaps you find
  so runbooks improve.
- Escalate on Sev1 immediately; never investigate a money-movement outage solo
  for more than 15 minutes.
- All external communications go through the incident ticket, not DMs.
`);

addDoc('data-freshness-and-retention', 'Data freshness and retention', `
Freshness SLOs: merchant settlement state ≤ 30 min behind ledger truth;
dashboards ≤ 5 min; analytics warehouse ≤ 24 h. Derived states carry an
\`as_of\` field; consumers must surface it rather than implying real-time.
Retention: operational logs 30 days hot / 13 months cold; ledger postings are
append-only and permanent; PII lives only in merchant-service with field-level
encryption. Synthetic-world note: every record in this world is generated
fiction — there is no real user data anywhere in this repository.
`);

// ---- emit -------------------------------------------------------------------
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'docs'), { recursive: true });
for (const d of docs) {
  fs.writeFileSync(path.join(outDir, d.path), d.body);
}
const index = {
  world: spec.name,
  seed,
  services: services.map((s) => ({ id: s.id, owner: s.owner, depends_on: s.depends_on })),
  docs: docs.map((d) => ({ id: d.id, title: d.title, path: d.path })),
};
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`generated ${docs.length} docs for ${spec.name} (seed: ${seed}) → ${outDir}`);
