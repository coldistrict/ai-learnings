// Visible acceptance tests — lab m1-02 (tutor-owned; do not edit).
// Titles reference README acceptance-criteria ids (V19). Observable
// contracts only.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createFakeProvider } from '../../../../tools/fake-provider/index.js';

const wsDir = process.env.LAB_WORKSPACE_DIR
  ? pathToFileURL(path.resolve(process.env.LAB_WORKSPACE_DIR) + path.sep)
  : new URL('../workspace/', import.meta.url);
const { completeJson } = await import(new URL('adapter.js', wsDir));

const REQUEST = { system: 'Return strict JSON per the contract.', input: 'classify: refunds stuck, same offset repeating' };
const GOOD = { category: 'queue-poisoning', causal_service: 'refund-service', confidence: 0.8, needs_human: true };

// Caller-supplied validation, same Result discipline as lab 01.
function validate(parsed) {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: { code: 'SCHEMA_VALIDATION_FAILED', field: '$', message: 'not an object' } };
  }
  if (parsed.category !== 'queue-poisoning') {
    return { ok: false, error: { code: 'SCHEMA_VALIDATION_FAILED', field: 'category', message: 'wrong category for fixture' } };
  }
  return { ok: true, value: parsed };
}

test('AC-1: malformed-then-valid → ok:true with attempts = 2', async () => {
  const p = createFakeProvider({ script: [{ kind: 'malformed' }, { kind: 'ok', json: GOOD }] });
  const r = await completeJson(p, REQUEST, { maxAttempts: 3, timeoutMs: 2000, validate });
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, GOOD);
  assert.equal(r.attempts, 2);
});

test('AC-2: trace records each attempt outcome (invalid_json then ok, ≥1 retry span)', async () => {
  const p = createFakeProvider({ script: [{ kind: 'malformed' }, { kind: 'ok', json: GOOD }] });
  const r = await completeJson(p, REQUEST, { maxAttempts: 3, timeoutMs: 2000, validate });
  assert.equal(Array.isArray(r.trace), true);
  assert.deepEqual(r.trace.map((s) => s.outcome), ['invalid_json', 'ok']);
  assert.deepEqual(r.trace.map((s) => s.attempt), [1, 2]);
});

test('AC-3: always-malformed → RETRIES_EXHAUSTED, attempts = maxAttempts, provider called exactly maxAttempts times', async () => {
  const p = createFakeProvider({ script: [{ kind: 'malformed' }, { kind: 'malformed' }, { kind: 'malformed' }] });
  const r = await completeJson(p, REQUEST, { maxAttempts: 3, timeoutMs: 2000, validate });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'RETRIES_EXHAUSTED');
  assert.equal(r.attempts, 3);
  assert.equal(p.calls.length, 3);
});

test('AC-4: hung provider call → TIMEOUT well before the hang duration', async () => {
  const p = createFakeProvider({ script: [{ kind: 'hang', ms: 5000 }] });
  const t0 = Date.now();
  const r = await completeJson(p, REQUEST, { maxAttempts: 3, timeoutMs: 100, validate });
  const elapsed = Date.now() - t0;
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'TIMEOUT');
  assert.ok(elapsed < 1500, `resolved in ${elapsed}ms — must not wait out the 5000ms hang`);
});

test('AC-5: INVALID_REQUEST is not retried — attempts = 1', async () => {
  const p = createFakeProvider({ script: [{ kind: 'invalid_request' }, { kind: 'ok', json: GOOD }] });
  const r = await completeJson(p, REQUEST, { maxAttempts: 3, timeoutMs: 2000, validate });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'INVALID_REQUEST');
  assert.equal(r.attempts, 1);
  assert.equal(p.calls.length, 1);
});

test('AC-6: schema-failed-then-valid → ok:true, attempts = 2, trace schema_failed→ok', async () => {
  const p = createFakeProvider({
    script: [
      { kind: 'ok', json: { ...GOOD, category: 'other' } },
      { kind: 'ok', json: GOOD },
    ],
  });
  const r = await completeJson(p, REQUEST, { maxAttempts: 3, timeoutMs: 2000, validate });
  assert.equal(r.ok, true);
  assert.equal(r.attempts, 2);
  assert.deepEqual(r.trace.map((s) => s.outcome), ['schema_failed', 'ok']);
});
