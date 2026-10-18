// Visible tests — m0-b1 tool-boundary repair. These assert the schema.json
// contract observably; there is no hidden requirement. Run:
//   node --test "diagnostics/work/tool-boundary/*.test.js"
// (after copying the fixture folder to diagnostics/work/tool-boundary/)
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReadServiceLogsArgs as validate } from './validate.js';

const good = { service: 'refund-service', time_range: '2026-06-30/2026-06-30', level: 'error' };

test('accepts a fully valid argument object', () => {
  const r = validate(good);
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, good);
});

test('rejects a missing required field, naming it (level)', () => {
  const { level, ...rest } = good;
  const r = validate(rest);
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'SCHEMA_VALIDATION_FAILED');
  assert.equal(r.error.field, 'level');
});

test('rejects a wrong-case enum value exactly as schema spells it', () => {
  const r = validate({ ...good, service: 'Refund-Service' });
  assert.equal(r.ok, false);
  assert.equal(r.error.field, 'service');
});

test('rejects an unknown extra field (additionalProperties: false), naming it', () => {
  const r = validate({ ...good, tenant: '*' });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'SCHEMA_VALIDATION_FAILED');
  assert.equal(r.error.field, 'tenant');
});

test('rejects a non-integer limit', () => {
  const r = validate({ ...good, limit: 12.5 });
  assert.equal(r.ok, false);
  assert.equal(r.error.field, 'limit');
});

test('rejects limit above maximum', () => {
  const r = validate({ ...good, limit: 5000 });
  assert.equal(r.ok, false);
  assert.equal(r.error.field, 'limit');
});

test('never throws on malformed input (null, array, string)', () => {
  for (const bad of [null, [], 'service=x', 42]) {
    const r = validate(bad);
    assert.equal(r.ok, false);
    assert.equal(r.error.code, 'SCHEMA_VALIDATION_FAILED');
  }
});
