// Visible acceptance tests — lab m1-03 (tutor-owned; do not edit).
// Titles reference README acceptance-criteria ids (V19). Observable
// contracts only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createFakeProvider } from '../../../../tools/fake-provider/index.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const pricing = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'fixtures', 'pricing.json'), 'utf8'));

const wsDir = process.env.LAB_WORKSPACE_DIR
  ? pathToFileURL(path.resolve(process.env.LAB_WORKSPACE_DIR) + path.sep)
  : new URL('../workspace/', import.meta.url);
const { runWithPolicy } = await import(new URL('policy.js', wsDir));

const REQUEST = { system: 'Return strict JSON.', input: 'classify: settlement stale after scan' };
const OK = { kind: 'ok', json: { category: 'cursor-pagination' }, usage: { input_tokens: 1000, output_tokens: 200 } };

function fakeSleep() {
  const waits = [];
  const sleep = async (ms) => { waits.push(ms); };
  return { sleep, waits };
}

function costOf(calls) {
  return calls.reduce((acc, [tin, tout]) =>
    acc + (tin / 1000) * pricing.input_per_1k_usd + (tout / 1000) * pricing.output_per_1k_usd, 0);
}

test('AC-1: rate-limited then ok → success after sleeping ≥ retry_after_ms', async () => {
  const primary = createFakeProvider({ script: [{ kind: 'rate_limit', retry_after_ms: 200 }, OK] });
  const fallback = createFakeProvider({ script: [] });
  const { sleep, waits } = fakeSleep();
  const r = await runWithPolicy({ primary, fallback }, REQUEST,
    { maxAttempts: 3, maxCostUsd: 1, pricing, sleep });
  assert.equal(r.ok, true);
  assert.equal(r.provider_used, 'primary');
  assert.ok(waits.length >= 1, 'sleep must be called before the retry');
  assert.ok(waits[0] >= 200, `first wait ${waits[0]}ms must be >= retry_after_ms (200)`);
  assert.equal(primary.calls.length, 2);
});

test('AC-2: primary unavailable → fallback completes with provider_used "fallback"', async () => {
  const primary = createFakeProvider({ script: [{ kind: 'unavailable' }] });
  const fallback = createFakeProvider({ script: [OK] });
  const { sleep } = fakeSleep();
  const r = await runWithPolicy({ primary, fallback }, REQUEST,
    { maxAttempts: 3, maxCostUsd: 1, pricing, sleep });
  assert.equal(r.ok, true);
  assert.equal(r.provider_used, 'fallback');
  assert.equal(fallback.calls.length, 1);
});

test('AC-3: report totals equal the exact sum over completed calls at fixture pricing', async () => {
  const primary = createFakeProvider({ script: [OK] });
  const fallback = createFakeProvider({ script: [] });
  const { sleep } = fakeSleep();
  const r = await runWithPolicy({ primary, fallback }, REQUEST,
    { maxAttempts: 3, maxCostUsd: 1, pricing, sleep });
  assert.equal(r.ok, true);
  assert.equal(r.report.calls, 1);
  assert.equal(r.report.tokens_in, 1000);
  assert.equal(r.report.tokens_out, 200);
  const expected = costOf([[1000, 200]]);
  assert.ok(Math.abs(r.report.est_cost_usd - expected) < 1e-9,
    `est_cost_usd ${r.report.est_cost_usd} != expected ${expected}`);
});

test('AC-4: remaining budget 0 → BUDGET_EXCEEDED with zero provider calls (pre-flight)', async () => {
  const primary = createFakeProvider({ script: [OK] });
  const fallback = createFakeProvider({ script: [OK] });
  const { sleep } = fakeSleep();
  const r = await runWithPolicy({ primary, fallback }, REQUEST,
    { maxAttempts: 3, maxCostUsd: 0.0, pricing, sleep });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'BUDGET_EXCEEDED');
  assert.equal(primary.calls.length, 0, 'no provider call may happen once the cap is already spent');
  assert.equal(fallback.calls.length, 0, 'fallback must not be consulted either');
});

test('AC-5: report present and complete on failure outcomes too', async () => {
  const primary = createFakeProvider({ script: [] });
  const fallback = createFakeProvider({ script: [] });
  const { sleep } = fakeSleep();
  const r = await runWithPolicy({ primary, fallback }, REQUEST,
    { maxAttempts: 3, maxCostUsd: 0.0, pricing, sleep });
  assert.equal(r.ok, false);
  assert.equal(r.error.code, 'BUDGET_EXCEEDED');
  for (const k of ['calls', 'tokens_in', 'tokens_out', 'est_cost_usd']) {
    assert.ok(k in r.report, `report.${k} missing on failure outcome`);
  }
  assert.equal(r.report.calls, 0);
  assert.equal(r.report.est_cost_usd, 0);
});
