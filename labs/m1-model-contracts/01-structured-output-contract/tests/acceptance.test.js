// Visible acceptance tests — lab m1-01 (tutor-owned; do not edit).
// Every test title references its README acceptance-criteria id (V19).
// Tests assert observable contracts only — never the implementation move.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createFakeProvider } from '../../../../tools/fake-provider/index.js';

const wsDir = process.env.LAB_WORKSPACE_DIR
  ? pathToFileURL(path.resolve(process.env.LAB_WORKSPACE_DIR) + path.sep)
  : new URL('../workspace/', import.meta.url);
const { classifyIncident } = await import(new URL('classify.js', wsDir));

const TICKET = 'Refunds stuck processing since 08:37; queue depth climbing; same offset repeating in worker crash logs.';
const VALID = {
  category: 'queue-poisoning',
  causal_service: 'refund-service',
  confidence: 0.86,
  needs_human: true,
};

function provider(step) {
  return createFakeProvider({ script: [step] });
}

test('AC-1: valid provider payload → ok:true with exactly the four contract fields', async () => {
  const r = await classifyIncident(TICKET, provider({ kind: 'ok', json: VALID }));
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, VALID);
  assert.deepEqual(Object.keys(r.value).sort(),
    ['category', 'causal_service', 'confidence', 'needs_human'].sort());
});

test('AC-2: missing required field → SCHEMA_VALIDATION_FAILED naming the field', async () => {
  const { causal_service, ...partial } = VALID;
  const r = await classifyIncident(TICKET, provider({ kind: 'ok', json: partial }));
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'SCHEMA_VALIDATION_FAILED');
  assert.equal(r.error.field, 'causal_service');
});

test('AC-3: category outside the taxonomy → rejected with field "category"', async () => {
  const r = await classifyIncident(TICKET, provider({ kind: 'ok', json: { ...VALID, category: 'network-blip' } }));
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'SCHEMA_VALIDATION_FAILED');
  assert.equal(r.error.field, 'category');
});

test('AC-4: unknown extra field → rejected (strict), naming the extra field', async () => {
  const r = await classifyIncident(TICKET, provider({ kind: 'ok', json: { ...VALID, severity: 'SEV1' } }));
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'SCHEMA_VALIDATION_FAILED');
  assert.equal(r.error.field, 'severity');
});

test('AC-5: non-JSON provider text → PROVIDER_OUTPUT_INVALID, and no throw', async () => {
  const r = await classifyIncident(TICKET, provider({ kind: 'malformed' }));
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'PROVIDER_OUTPUT_INVALID');
});

test('AC-6: confidence outside [0,1] → rejected with field "confidence"', async () => {
  const r = await classifyIncident(TICKET, provider({ kind: 'ok', json: { ...VALID, confidence: 1.7 } }));
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'SCHEMA_VALIDATION_FAILED');
  assert.equal(r.error.field, 'confidence');
});

test('AC-7: unknown causal_service rejected; null accepted', async () => {
  const bad = await classifyIncident(TICKET, provider({ kind: 'ok', json: { ...VALID, causal_service: 'billing-service' } }));
  assert.equal(bad.ok, false);
  assert.equal(bad.error.code, 'SCHEMA_VALIDATION_FAILED');
  assert.equal(bad.error.field, 'causal_service');

  const ok = await classifyIncident(TICKET, provider({ kind: 'ok', json: { ...VALID, causal_service: null } }));
  assert.equal(ok.ok, true);
  assert.equal(ok.value.causal_service, null);
});
